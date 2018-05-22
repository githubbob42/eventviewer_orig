import $ from 'jquery';
import jsforce from 'jsforce';
import { buildNumber } from '../version.json';
import { USER_FIELDS, ORG_FIELDS } from '../constants/fields';

export const appVersion = buildNumber;

if (buildNumber === 'DEV') console.log('%c>>>> buildNumber ', 'background-color: yellow; color:red;' , buildNumber );

const proxyPort = process.env.PROXY_PORT || 5030;

const proxyUrl = buildNumber === 'DEV' ? `http://localhost:${proxyPort}/proxy/` : null;
if (proxyUrl) console.log('>>>> proxyUrl : ', proxyUrl );

const PRODUCTION = 'https://login.salesforce.com';
const SANDBOX = 'https://test.salesforce.com';
const apiVersion = 'v39.0';

export const namespace = () => {
  return global.salesforce.fxNamespace + '__';
};

export const ENVIRONMENTS = { PRODUCTION, SANDBOX };

export const getConnection = () => {
  if (global.salesforce && global.salesforce.sessionId) {
    return Promise.resolve(
      new jsforce.Connection({ accessToken: global.salesforce.sessionId })
    );
  } else {
    return reconnect();
  }
};

function saveConnection(connection, username) {
  const { loginUrl, accessToken, instanceUrl } = connection;
  localStorage.setItem('loginUrl', loginUrl);
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('instanceUrl', instanceUrl);
  localStorage.setItem('username', username);

  if (buildNumber === 'DEV' && !global.salesforce.instanceUrl) global.salesforce.instanceUrl = instanceUrl;
  return connection;
}

export const connect = ({ loginUrl = PRODUCTION, username, password }) => {
  if (!username || !password) return Promise.resolve();

  const connection = new jsforce.Connection({
    loginUrl,
    proxyUrl
  });

connection.on("refresh", function(accessToken, res) {
  // Refresh event will be fired when renewed access token
  // to store it in your storage for next request
  console.log('%c>>>> refresh1 ', 'background-color: red; color: yellow;'  );
  localStorage.setItem('accessToken', accessToken);
});

  return connection.login(username, password).then(() => {
    if (buildNumber === 'DEV') saveConnection(connection, username);
    return Promise.resolve(connection);
  });
};

export const reconnect = () => {
  const loginUrl = localStorage.getItem('loginUrl');
  const accessToken = localStorage.getItem('accessToken');
  const instanceUrl = localStorage.getItem('instanceUrl');
  const username = localStorage.getItem('username');
  if (!loginUrl || !accessToken || !instanceUrl) return Promise.resolve();

  const connection = new jsforce.Connection({
    loginUrl,
    proxyUrl,
    instanceUrl,
    accessToken
  });

connection.on("refresh", function(accessToken, res) {
  // Refresh event will be fired when renewed access token
  // to store it in your storage for next request
  console.log('%c>>>> refresh2 ', 'background-color: red; color: yellow;'  );
  localStorage.setItem('accessToken', accessToken);
});

  if (buildNumber === 'DEV') saveConnection(connection, username);
  return Promise.resolve(connection);

  // if (buildNumber === 'DEV') {
  //   saveConnection(connection, username);
  //   return Promise.resolve(connection);
  // }
  // else {
  //   // quick identity request to make sure session is still good
  //   return connection.identity()
  //   .then(() => {
  //     return connection;
  //   });
  // }
};

export const disconnect = connection => {
  localStorage.clear();
  return Promise.resolve(connection && connection.logout());
};

export const isAdminUser = user => {
  return user.Profile.PermissionsModifyAllData;
};

export const fetchTrustInfo = connection => {
  let instance;
  const match = /https:\/\/([^.]*)?\.?(cs\d*|na\d*)\.([^/]*)/.exec(global.salesforce.instanceUrl || connection.instanceUrl);
  if (match) instance = match[2];

  return fetch(`https://api.status.salesforce.com/v1/instances/${instance}/status`)
    .then(response => response.json())
    .then(trust => {
      console.log({ trust });
      return trust;
    });
};

export const fetchOrganization = connection => {
  return connection
    .sobject('Organization')
    .select(ORG_FIELDS)
    .where(`Id = '${connection.userInfo.organizationId}'`)
    .then(records => {
      const organization = records[0];
      console.log({ organization });
      return organization;
    });
};

export const fetchUser = (connection, userId) => {
  return connection
    .sobject('User')
    .select(USER_FIELDS)
    .where(`Id = '${userId}'`)
    .execute({ autoFetch: true })
    .then(records => {
      const user = records[0];
      console.log({ user });
      return user;
    });
};


export const fetchNamespace = (connection) => {
  return connection
    .sobject('ApexClass')
    .select('NamespacePrefix')
    .where(`Name = 'GetUtilityUserInfo'`)
    .execute({ autoFetch: true })
    .then(records => {
      const namespace = records[0] && records[0].NamespacePrefix;
      console.log({ namespace });
      return namespace ? namespace + '__' : '';
    });
};


export const fetchDescription = (connection, sobject) => {
  return connection.sobject(sobject).describe().then(result => {
    return result;
  });
};

export const fetchIdentity = (connection) => {

  return fetchIdentity2(connection);

  // // !!! jsforce has a bug with fetchIdentity running locally - call fetchIdentity2 to mock it
  // if (buildNumber === 'DEV') return fetchIdentity2(connection);

  // return connection.identity().then(identity => {
  //   console.log({ identity });
  //   return identity;
  // });
};

export const fetchIdentity2 = (connection) => {
  var username = (global.salesforce && global.salesforce.userName) || localStorage.getItem('username')

  return connection
    .sobject('User')
    .select(USER_FIELDS)
    .where(`Username = '${username}'`)
    .execute({ autoFetch: true })
    .then(records => {
      var user = records[0];
      console.log({ user });

      var url = `/services/data/${apiVersion}/`;
      return request(connection, { url: url })
        .then(function(result) {
          const identityInfo = result.identity.replace(/https:\/\/(login|test).salesforce.com\//, '').split('/');

          if (!connection.userInfo) {
            connection.userInfo = {};
            connection.userInfo.organizationId = identityInfo[1];
            connection.userInfo.id = identityInfo[2];
            connection.userInfo.url = result.identity;
          }

          // mock identity object with minimal properties set
          return {
              organization_id: identityInfo[1],
              user_id: identityInfo[2],
              username: user.Username,
              display_name: user.Name
            };
        });
    });
};


function normalizeAjaxException(jqXHR) {
  var error = {
    status: jqXHR.status,
    statusText: jqXHR.statusText
  };

  try {
    var salesforceRestError = (jqXHR.responseText && JSON.parse(jqXHR.responseText)[0]) || JSON.parse(jqXHR.responseText);
    error.errorCode = salesforceRestError && salesforceRestError.errorCode;
    error.message = salesforceRestError && salesforceRestError.message;
  } catch (err) {
    error.errorCode = jqXHR.responseText;
    error.message = jqXHR.responseText;
  }
  return error;
}

function request(connection, options) {
  var baseOpts = {
    method: 'GET'
  };

  if (buildNumber === 'DEV') {
    baseOpts.beforeSend = function(xhr) {
      xhr.setRequestHeader('Access-Control-Allow-Origin': '*');
      xhr.setRequestHeader('Authorization', `Bearer ${connection.accessToken}`);
      xhr.setRequestHeader('Accept', 'application/json');
    }
    options.url = ~options.url.indexOf('http') ? options.url : connection.instanceUrl + options.url;
  }
  else {
    baseOpts.credentials = 'include';
    baseOpts.beforeSend = function(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${connection.accessToken}`);
      xhr.setRequestHeader('Accept', 'application/json');
    }
    options.url = ~options.url.indexOf('http') ? options.url.replace((connection.instanceUrl || global.salesforce.instanceUrl), '') : options.url;
  }

  return new Promise((resolve, reject) => {
    $.ajax(Object.assign(baseOpts, options))
      .then(resolve)
      .fail(jqXHR => {
        reject(normalizeAjaxException(jqXHR));
      });
  });
}

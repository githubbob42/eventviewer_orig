// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import registerServiceWorker from './registerServiceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));
// registerServiceWorker();

import React from 'react';
import ReactDOM from 'react-dom';

import * as api from './api/api';
import Login from './components/Login';
import App from './App';

import './styles.css';

// The "salesforce" object is defined in the VisualForce Page - mock up the minimum needed to run locally
global.salesforce = global.salesforce || {};
// global.salesforce.instanceUrl = global.salesforce.instanceUrl || '';
global.salesforce.fxNamespace = 'FX5';


function renderApp(connection) {
  ReactDOM.render(
    <App connection={connection} />,
    document.getElementById('root')
  );
}

var postEnv = window.postEnv || 'https://www.fieldfx.com';
if (api.appVersion === 'DEV') {
  postEnv = window.postEnv || 'http://localhost:3000';
}
window.postEnv = postEnv;

api.getConnection().then(connection => {
  if (connection) {
    renderApp(connection);
  } else {
    ReactDOM.render(
      <Login onLogin={renderApp} />,
      document.getElementById('root')
    );
  }
});

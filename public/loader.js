!(function() {
  if (!salesforce) return;

  var RESOURCES_ROOT = salesforce.resource_path;

  function inject(type, body) {
    if (!type || !body) return;
    try {
      var element = document.createElement(type);
      element.appendChild(document.createTextNode(body));
      document.getElementsByTagName('head')[0].appendChild(element);
    } catch (error) {
      console.error(error);
    }
  }

  function json(asset) {
    if (!asset) return;
    return fetch(RESOURCES_ROOT + asset, {
      mode: 'no-cors'
    }).then(function(response) {
      return response.ok && response.json();
    });
  }

  function text(asset) {
    if (!asset) return;
    return fetch(RESOURCES_ROOT + asset, {
      mode: 'no-cors'
    }).then(function(response) {
      return response.ok && response.text();
    });
  }

  json('asset-manifest.json').then(function(manifest) {
    if (!manifest) return;
    return Promise.all([
      text(manifest['main.js']),
      text(manifest['main.css'])
    ]).then(function(assets) {
      inject('script', assets[0]);
      inject('style', assets[1]);
    });
  });
})();

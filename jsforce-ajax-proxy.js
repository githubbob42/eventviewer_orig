// jsforce proxy server for development
const jsforceAjaxProxy = require('jsforce-ajax-proxy');
const express = require('express');
const app = express(),
      port = process.env.PORT || 5000,
      proxyPort = process.env.PROXY_PORT || 5030;

console.log('Starting jsforce proxy server using port: ' + port);


app.set('port', port);

app.all('/proxy/?*', jsforceAjaxProxy({ enableCORS: true }));
// app.all('/services/?*', function(req, res) {
//   console.log("Hi");
// });
app.listen(proxyPort, function(err) {
  console.log(
    `jsforce proxy server is running at: http://localhost:${proxyPort}/proxy/`
  );
});

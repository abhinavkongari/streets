#!/usr/bin/env node
var app = require('../server.js');

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Streets listening on http://localhost:' + port);
});

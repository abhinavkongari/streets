#!/usr/bin/env node
var app = require('../server.js');

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Sheffield Streets listening on http://localhost:' + port);
});

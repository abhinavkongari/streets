var express = require('express');
var path = require('path');
var logger = require('morgan');
var pages = require('./lib/pages');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// The dev server shows drafts (with a DRAFT badge) so editors can preview
// them. Set DRAFTS=0 to see exactly what the live site will show.
var drafts = process.env.DRAFTS !== '0';

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// Content is re-read on every request, so edits show up on refresh.
app.get('*', function(req, res, next) {
  var wanted = decodeURIComponent(req.path).replace(/^\//, '');
  if (wanted === '' || wanted.endsWith('/')) wanted += 'index.html';

  var result;
  try {
    result = pages.build({ drafts: drafts });
  } catch (err) {
    return res.status(500).type('text').send(err.message);
  }

  var page = result.pages.find(function(p) { return p.path === wanted; });
  if (!page) return next();
  res.render(page.view, pages.localsFor(page, pages.baseFor(page.path)));
});

app.use(function(req, res) {
  var site = pages.build({ drafts: drafts }).site;
  res.status(404).render('error', Object.assign({}, pages.helpers, {
    site: site, base: '/', title: 'Page not found', message: 'Page not found'
  }));
});

app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).type('text').send('Something went wrong: ' + err.message);
});

module.exports = app;

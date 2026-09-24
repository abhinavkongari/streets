var express = require('express');
var path = require('path');
var logger = require('morgan');

var routes = require('./routes/index');
var stories = require('./lib/stories');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// `base` prefixes every link and asset path. The static build (build.js)
// sets it relative to each page so the site works from any sub-path.
app.locals.base = '/';
app.locals.formatDate = stories.formatDate;

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404
app.use(function(req, res) {
  res.status(404).render('error', { title: 'Page not found', message: 'Page not found' });
});

// error handler, no stack traces leaked to the user
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).render('error', { title: 'Something went wrong', message: 'Something went wrong' });
});

module.exports = app;

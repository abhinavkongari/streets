var express = require('express');
var router = express.Router();
var stories = require('../lib/stories');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Sheffield Streets', stories: stories.all });
});

/* GET all stories. */
router.get('/stories.html', function(req, res) {
  res.render('stories', { title: 'Stories', stories: stories.all });
});

/* GET a single story. */
router.get('/stories/:slug.html', function(req, res, next) {
  var story = stories.find(req.params.slug);
  if (!story) return next();
  res.render('story', { title: story.title, story: story, more: stories.all.filter(function(s) { return s !== story; }) });
});

module.exports = router;

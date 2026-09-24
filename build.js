// Renders the site to plain HTML in dist/ so it can be hosted on any static
// host (GitHub Pages, Netlify, ...) with no server. Links are made relative
// to each page, so the site works from a sub-path like /sheffieldstreetsJS/.
var fs = require('fs');
var path = require('path');
var pug = require('pug');
var stories = require('./lib/stories');

var out = path.join(__dirname, 'dist');
var views = path.join(__dirname, 'views');

function render(view, file, locals) {
  var depth = file.split('/').length - 1;
  var html = pug.renderFile(path.join(views, view + '.pug'), Object.assign({
    base: depth ? '../'.repeat(depth) : './',
    formatDate: stories.formatDate
  }, locals));
  var dest = path.join(out, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
}

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(__dirname, 'public'), out, { recursive: true });

render('index', 'index.html', { title: 'Sheffield Streets', stories: stories.all });
render('stories', 'stories.html', { title: 'Stories', stories: stories.all });
// 404.html is served at any missing URL, so it needs absolute paths.
render('error', '404.html', { title: 'Page not found', message: 'Page not found', base: process.env.SITE_BASE || '/' });
stories.all.forEach(function(story) {
  render('story', 'stories/' + story.slug + '.html', {
    title: story.title,
    story: story,
    more: stories.all.filter(function(s) { return s !== story; })
  });
});

console.log('Built ' + (stories.all.length + 3) + ' pages into dist/');

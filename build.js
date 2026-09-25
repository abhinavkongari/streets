// Renders the whole site to plain HTML in dist/ so it can be hosted on any
// static host with no server. Drafts are left out unless DRAFTS=1.
var fs = require('fs');
var path = require('path');
var pug = require('pug');
var pages = require('./lib/pages');

var out = path.join(__dirname, 'dist');
var views = path.join(__dirname, 'views');
var result = pages.build({ drafts: process.env.DRAFTS === '1' });

function write(file, view, locals) {
  var dest = path.join(out, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, pug.renderFile(path.join(views, view + '.pug'), locals));
}

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(__dirname, 'public'), out, { recursive: true });

result.pages.forEach(function(page) {
  write(page.path, page.view, pages.localsFor(page, pages.baseFor(page.path)));
});

// 404.html is served at any missing URL, so it needs absolute paths.
write('404.html', 'error', Object.assign({}, pages.helpers, {
  site: result.site, base: process.env.SITE_BASE || '/', title: 'Page not found', message: 'Page not found'
}));

var drafts = result.site.drafts ? ' (including drafts)' : '';
console.log('Built ' + (result.pages.length + 1) + ' pages into dist/' + drafts);

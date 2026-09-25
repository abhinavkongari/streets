// Loads everything in content/ into one object, and checks it as it goes so a
// typo in a story (an unknown category, a missing author) fails the build with
// a clear message instead of producing a broken page.
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var matter = require('gray-matter');
var marked = require('marked').marked;

var root = path.join(__dirname, '..', 'content');

function readYaml(file) {
  return yaml.load(fs.readFileSync(path.join(root, file), 'utf8'));
}

// YAML turns 2017-10-19 into a Date; keep dates as plain "YYYY-MM-DD" strings.
function isoDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value ? String(value) : undefined;
}

function readMarkdownDir(dir) {
  var full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(function(f) { return f.endsWith('.md'); }).sort().map(function(f) {
    var parsed = matter(fs.readFileSync(path.join(full, f), 'utf8'));
    return Object.assign({}, parsed.data, {
      slug: f.replace(/\.md$/, ''),
      file: path.join('content', dir, f),
      html: parsed.content.trim() ? marked.parse(parsed.content) : ''
    });
  });
}

function load(options) {
  var drafts = Boolean(options && options.drafts);
  var errors = [];
  function check(ok, file, message) {
    if (!ok) errors.push(file + ': ' + message);
    return ok;
  }

  var site = readYaml('site.yml');
  var authors = readYaml('authors.yml');
  Object.keys(authors).forEach(function(id) { authors[id].id = id; });
  Object.keys(site.categories).forEach(function(id) { site.categories[id].id = id; });

  var cities = site.cities.map(function(cityId) {
    var city = readYaml(path.join(cityId, 'city.yml'));
    city.id = cityId;
    Object.keys(city.neighbourhoods || {}).forEach(function(id) { city.neighbourhoods[id].id = id; });

    var stories = readMarkdownDir(path.join(cityId, 'stories')).filter(function(s) {
      var f = s.file;
      check(s.title, f, 'needs a title');
      check(s.type === 'place' || s.type === 'story', f, 'type must be "place" or "story"');
      check(site.categories[s.category], f, 'unknown category "' + s.category + '" (see content/site.yml)');
      check(authors[s.author], f, 'unknown author "' + s.author + '" (see content/authors.yml)');
      check(!s.neighbourhood || city.neighbourhoods[s.neighbourhood], f,
        'unknown neighbourhood "' + s.neighbourhood + '" (see content/' + cityId + '/city.yml)');
      check(/^\d{4}-\d{2}-\d{2}$/.test(isoDate(s.date)), f, 'date must look like 2026-09-25');
      if (s.type === 'place') {
        check(Array.isArray(s.location) && s.location.length === 2, f, 'a place needs location: [latitude, longitude]');
      }
      // A story can list several places (a roundup), each shown on its map.
      (s.spots || []).forEach(function(spot, i) {
        check(spot.name, f, 'spot ' + (i + 1) + ' needs a name');
        check(Array.isArray(spot.location) && spot.location.length === 2, f,
          'spot ' + (i + 1) + ' (' + spot.name + ') needs location: [latitude, longitude]');
      });
      (s.sources || []).forEach(function(source, i) {
        check(source.title && source.url, f, 'source ' + (i + 1) + ' needs a title and a url');
      });
      s.date = isoDate(s.date);
      s.checked = isoDate(s.checked);
      s.city = city;
      s.authorInfo = authors[s.author];
      s.categoryInfo = site.categories[s.category];
      s.neighbourhoodInfo = s.neighbourhood && city.neighbourhoods[s.neighbourhood];
      return drafts || !s.draft;
    }).sort(function(a, b) {
      return (b.date || '').localeCompare(a.date || '') || String(a.title).localeCompare(String(b.title));
    });

    var bySlug = {};
    stories.forEach(function(s) { bySlug[s.slug] = s; });

    var walks = readMarkdownDir(path.join(cityId, 'walks')).filter(function(w) {
      var f = w.file;
      check(w.title, f, 'needs a title');
      check(authors[w.author], f, 'unknown author "' + w.author + '"');
      check(Array.isArray(w.stops) && w.stops.length >= 2, f, 'a walk needs at least two stops');
      if (!drafts && w.draft) return false;
      w.date = isoDate(w.date);
      w.city = city;
      w.authorInfo = authors[w.author];
      w.stops = (w.stops || []).map(function(stop, i) {
        var story = bySlug[stop.story];
        check(story, f, 'stop ' + (i + 1) + ' "' + stop.story + '" is not a published story in ' + cityId);
        check(!story || story.location, f, 'stop ' + (i + 1) + ' "' + stop.story + '" has no location');
        return { story: story, note: stop.note };
      });
      return true;
    });

    var collections = readMarkdownDir(path.join(cityId, 'collections')).map(function(c) {
      check(c.title, c.file, 'needs a title');
      // Stories that are still drafts are left out rather than failing the build.
      c.stories = (c.stories || []).map(function(slug) {
        var story = bySlug[slug];
        if (!story) {
          var exists = fs.existsSync(path.join(root, cityId, 'stories', slug + '.md'));
          check(exists, c.file, 'no story called "' + slug + '" in ' + cityId);
        }
        return story;
      }).filter(Boolean);
      c.city = city;
      return c;
    }).filter(function(c) { return c.stories.length; });

    stories.forEach(function(s) {
      s.collections = collections.filter(function(c) { return c.stories.indexOf(s) !== -1; });
    });

    city.stories = stories;
    city.walks = walks;
    city.collections = collections.sort(function(a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
    city.featured = collections.find(function(c) { return c.featured; });
    return city;
  });

  if (errors.length) {
    throw new Error('Content problems:\n  - ' + errors.join('\n  - '));
  }

  site.authors = authors;
  site.cities = cities;
  site.drafts = drafts;
  return site;
}

// "2017-10-19" -> "19 October 2017"
function formatDate(iso) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
}

module.exports = { load: load, formatDate: formatDate };

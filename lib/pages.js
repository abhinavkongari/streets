// Every page on the site, as { path, view, locals }. The dev server and the
// static build both read this list, so they always produce the same site.
var content = require('./content');

function storyPath(story) { return story.city.id + '/stories/' + story.slug + '.html'; }
function walkPath(walk) { return walk.city.id + '/walks/' + walk.slug + '.html'; }
function collectionPath(c) { return c.city.id + '/collections/' + c.slug + '.html'; }
function categoryPath(city, id) { return city.id + '/category/' + id + '.html'; }
function neighbourhoodPath(city, id) { return city.id + '/neighbourhoods/' + id + '.html'; }
function authorPath(id) { return 'authors/' + id + '.html'; }

var paths = {
  story: storyPath,
  walk: walkPath,
  collection: collectionPath,
  category: categoryPath,
  neighbourhood: neighbourhoodPath,
  author: authorPath
};

// Map pins for a list of stories, with links relative to the page they're on.
function pins(stories, base) {
  return stories.filter(function(s) { return s.location; }).map(function(s) {
    return {
      title: s.title,
      href: base + storyPath(s),
      lat: s.location[0],
      lng: s.location[1],
      category: s.category,
      colour: s.categoryInfo.colour,
      summary: s.summary || ''
    };
  });
}

// Pins for the places listed in a roundup story, linking to each one's entry
// in the story's "Places in this story" list.
function spotPins(story) {
  return story.spots.map(function(spot, i) {
    return {
      title: spot.name,
      href: '#spot-' + (i + 1),
      lat: spot.location[0],
      lng: spot.location[1],
      category: story.category,
      colour: story.categoryInfo.colour,
      summary: spot.address || ''
    };
  });
}

function build(options) {
  var site = content.load(options);
  var pages = [];

  function add(path, view, locals) {
    pages.push({ path: path, view: view, locals: Object.assign({ site: site }, locals) });
  }

  add('index.html', 'home', { title: site.name });
  add('write.html', 'write', { title: 'Write for ' + site.name });
  add('submit.html', 'submit', { title: 'Send us a story' });

  Object.keys(site.authors).forEach(function(id) {
    var stories = [];
    site.cities.forEach(function(city) {
      stories = stories.concat(city.stories.filter(function(s) { return s.author === id; }));
    });
    if (stories.length) add(authorPath(id), 'author', { title: site.authors[id].name, author: site.authors[id], stories: stories });
  });

  site.cities.forEach(function(city) {
    var c = { city: city };
    function cityPage(path, view, locals) { add(city.id + '/' + path, view, Object.assign({}, c, locals)); }

    cityPage('index.html', 'city', { title: city.name });
    cityPage('map.html', 'map', { title: 'Map of ' + city.name, pins: pins.bind(null, city.stories) });
    cityPage('stories.html', 'listing', { title: 'All stories', heading: 'All stories', stories: city.stories });
    cityPage('walks.html', 'walks', { title: 'Walks' });
    cityPage('collections.html', 'collections', { title: 'Collections' });

    city.stories.forEach(function(story) {
      var nearby = story.neighbourhood
        ? city.stories.filter(function(s) { return s !== story && s.neighbourhood === story.neighbourhood; })
        : [];
      var more = nearby.length ? nearby : city.stories.filter(function(s) { return s !== story && s.category === story.category; });
      add(storyPath(story), 'story', Object.assign({}, c, {
        title: story.title,
        story: story,
        more: (more.length ? more : city.stories.filter(function(s) { return s !== story; })).slice(0, 3),
        moreHeading: nearby.length ? 'More in ' + story.neighbourhoodInfo.name : 'More stories',
        pins: story.spots ? spotPins.bind(null, story) : pins.bind(null, [story])
      }));
    });

    city.walks.forEach(function(walk) {
      add(walkPath(walk), 'walk', Object.assign({}, c, {
        title: walk.title,
        walk: walk,
        pins: pins.bind(null, walk.stops.map(function(stop) { return stop.story; }))
      }));
    });

    city.collections.forEach(function(collection) {
      add(collectionPath(collection), 'collection', Object.assign({}, c, {
        title: collection.title,
        collection: collection,
        pins: pins.bind(null, collection.stories)
      }));
    });

    Object.keys(site.categories).forEach(function(id) {
      var stories = city.stories.filter(function(s) { return s.category === id; });
      if (stories.length) {
        add(categoryPath(city, id), 'listing', Object.assign({}, c, {
          title: site.categories[id].name, heading: site.categories[id].name, stories: stories, pins: pins.bind(null, stories)
        }));
      }
    });

    Object.keys(city.neighbourhoods).forEach(function(id) {
      var stories = city.stories.filter(function(s) { return s.neighbourhood === id; });
      if (stories.length) {
        add(neighbourhoodPath(city, id), 'listing', Object.assign({}, c, {
          title: city.neighbourhoods[id].name, heading: city.neighbourhoods[id].name, stories: stories, pins: pins.bind(null, stories)
        }));
      }
    });
  });

  return { site: site, pages: pages };
}

// Helpers available in every template.
var helpers = { formatDate: content.formatDate, paths: paths };

// `base` is the relative path from a page back to the site root, e.g. "../../"
// for sheffield/stories/x.html, so the site works from any folder or sub-path.
function baseFor(path) {
  var depth = path.split('/').length - 1;
  return depth ? '../'.repeat(depth) : './';
}

// Locals for rendering one page. `pins` is stored as a function so the links
// inside map data can be made relative to the page being rendered.
function localsFor(page, base) {
  var locals = Object.assign({}, helpers, page.locals, { base: base, path: page.path });
  if (typeof locals.pins === 'function') locals.pins = locals.pins(base);
  return locals;
}

module.exports = { build: build, baseFor: baseFor, localsFor: localsFor, helpers: helpers };

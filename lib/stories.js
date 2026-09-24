var stories = require('../data/stories');

// Newest first.
var all = stories.slice().sort(function(a, b) {
  return b.date.localeCompare(a.date);
});

function find(slug) {
  return all.find(function(story) { return story.slug === slug; });
}

// "2017-10-19" -> "Thursday 19 October 2017"
function formatDate(iso) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
}

module.exports = { all: all, find: find, formatDate: formatDate };

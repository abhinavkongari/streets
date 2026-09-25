# Streets

Local stories and hidden gems, city by city, written by the people who live there. Sheffield is the first city.

Streets began in 2017 as Sheffield Streets, a WordPress site ([JervellThomas/sheffieldstreets](https://github.com/JervellThomas/sheffieldstreets)), was rewritten in Express and Pug on Glitch ([JervellThomas/sheffieldstreetsJS](https://github.com/JervellThomas/sheffieldstreetsJS)), and went offline when Glitch stopped hosting projects in July 2025.

Live site: https://abhinavkongari.github.io/streets/

## Editing

Everything on the site lives in `content/` as Markdown and YAML. See **[EDITING.md](EDITING.md)** for how to add a story, publish a submission, and give someone editor rights.

## Run it

```sh
npm install
npm start            # http://localhost:3000, drafts shown with a DRAFT badge
DRAFTS=0 npm start   # exactly what the live site shows
```

Content is re-read on every request, so edits show up when you refresh.

## Build

```sh
npm run build        # writes the site to dist/ (published content only)
```

Every push to `master` builds the site and publishes it to GitHub Pages (see `.github/workflows/deploy.yml`). If content has a mistake, such as an unknown category or a walk stop that doesn't exist, the build stops and names the file and the problem.

## How it fits together

- `content/`: stories, walks, collections, authors, cities and site settings
- `lib/content.js`: loads and checks the content
- `lib/pages.js`: the list of every page on the site, used by both the dev server and the build
- `views/`: Pug templates (`mixins.pug` has the shared pieces)
- `public/`: CSS, scripts and images, copied as-is
- Maps use [Leaflet](https://leafletjs.com) and [OpenStreetMap](https://www.openstreetmap.org)

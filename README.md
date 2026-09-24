# Sheffield Streets

Stories about the people and places of Sheffield. The site started in 2018 as a WordPress theme ([JervellThomas/sheffieldstreets](https://github.com/JervellThomas/sheffieldstreets)), was rewritten in Express and Pug on Glitch, and went offline when Glitch stopped hosting projects in July 2025. This is the revived version.

## Run it

```sh
npm install
npm start          # http://localhost:3000
```

## Build a static copy

```sh
npm run build      # writes plain HTML to dist/
```

`dist/` works on any static host (GitHub Pages, Netlify, Cloudflare Pages). If the site lives under a sub-path, set `SITE_BASE` so the 404 page finds its styles, for example `SITE_BASE=/sheffieldstreetsJS/ npm run build`.

## Add a story

Stories live in `data/stories.js`. Each story has a `slug` (its URL), `title`, `author`, `date` (`YYYY-MM-DD`), and `body` (an array of HTML paragraphs). To add a photo, put it in `public/images/` and set `image: "images/<file>"`.

Only "Kid Acne's Stabby Women" still has its full text. The other three stories' text and all story photos were lost with the original WordPress database.

# Editing Streets

Everything on the site is a file in `content/`. You can edit on your computer (and preview with `npm start`) or directly on github.com. Pushing to `master` publishes within about a minute.

## Where things live

```
content/
  site.yml                 site name, submission form endpoint, categories, list of cities
  authors.yml              every writer: name and a short bio
  sheffield/
    city.yml               city intro, map position, neighbourhoods
    stories/*.md           places and stories (one file each)
    walks/*.md             walks
    collections/*.md       collections, e.g. "New to Sheffield"
```

A file's name becomes its web address: `stories/winter-garden.md` is published at `sheffield/stories/winter-garden.html`. Use lowercase words joined by hyphens.

## Publishing a submission

Submissions arrive by email from the form on the site (once `submit_endpoint` is set in `content/site.yml`).

1. If the writer is new, add them to `content/authors.yml`.
2. Create `content/<city>/stories/<name-of-place>.md` using the template below, with `draft: true`.
3. Edit the piece, and check the address, the map pin and any facts.
4. Preview it with `npm start`. Drafts show with a yellow DRAFT badge.
5. When it's ready, delete the `draft: true` line, set `checked:` to today's date, and push.

To find a map pin, right-click the spot on [openstreetmap.org](https://www.openstreetmap.org) and choose "Show address". The coordinates appear on the left, latitude first.

## Story template

```markdown
---
title: The name of the place
type: place              # "place" for a spot on the map, "story" for longer pieces
category: cafes          # one of the categories in content/site.yml
neighbourhood: kelham-island   # optional; one of the neighbourhoods in city.yml
author: shahd-abdelmohsen      # a key from content/authors.yml
date: 2026-09-25         # when it was published
summary: One sentence that makes people want to go.
location: [53.3894, -1.4712]   # latitude, longitude (required for places)
address: 23 Alma Street, Sheffield S3 8SA
image: images/sheffield/the-file.jpg     # optional; put the photo in public/images/sheffield/
image_credit: Photo by Jane Smith        # optional; HTML links are allowed
checked: 2026-09-25      # the date an editor last confirmed the details
draft: true              # remove this line to publish
# closed: true           # add this if the place closes; the story stays up with a notice
---
The story itself, in plain paragraphs. Leave a blank line between paragraphs.
**Bold** and [links](https://example.com) work.
```

## Walks

```markdown
---
title: A short, specific title
author: streets-editors
date: 2026-09-25
summary: One sentence.
distance: About 2 km
duration: 1 to 2 hours
stops:
  - story: sheffield-tap      # the file name of a story, without .md
    note: What to do here, or how to get to the next stop.
  - story: park-hill
    note: ...
---
An introduction to the walk.
```

Every stop has to be a published story with a location. If a stop is still a draft, the walk must be a draft too, or the build will stop and say so.

## Collections

```markdown
---
title: Rainy day Sheffield
summary: One sentence.
featured: true      # optional: shows it as the big "Start here" banner on the city page
stories:
  - winter-garden
  - millennium-gallery
---
An introduction.
```

Draft stories are left out of a collection until they're published.

## Giving someone editor rights

For now, editors work in this GitHub repository:

1. On github.com, open the repo, then **Settings → Collaborators → Add people**, and invite their GitHub account. They can then edit files and push.
2. For a review step, turn on branch protection for `master` (**Settings → Branches**) and require a pull request with one approval. Editors then propose changes and you approve them.

A proper editor screen with logins and a review queue is planned for phase 2, when submissions arrive regularly.

## Adding a city

1. Create `content/<city>/city.yml` (copy Sheffield's) and the `stories`, `walks` and `collections` folders.
2. Add a logo to `public/images/` and point `logo` and `logo_white` at it.
3. Add the city to `cities:` in `content/site.yml`.

Launch a city once it has a local editor and around twenty stories.

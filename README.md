# marcuswhited.tech

Personal portfolio and technical documentation site for Marcus Whited, live at [marcuswhited.tech](https://marcuswhited.tech).

The site focuses on software projects in Go, professional experience with Go and Python, and homelab documentation. It is fully static — no backend, no tracking, just fast pages.

## Built With

- [Astro](https://astro.build/) — static site framework
- [TailwindCSS](https://tailwindcss.com/) — styling
- MDX and Markdown content collections
- [D2](https://d2lang.com/) — architecture and data-flow diagrams, rendered to static SVG at build time
- Deployed via GitHub Actions to GitHub Pages

## What's Here

- **Projects** — homelabctl, httpServer, and monkey-interpreter, with implementation notes and links to source and tests
- **Homelab** — concise documentation of the lab's architecture, networking, and security
- **Career** — a combined experience timeline, skills, education, and training page; `/resume/` redirects here

## Running Locally

Install the [D2 CLI](https://d2lang.com/tour/install) on your PATH before generating diagrams.

```bash
curl -fsSL https://d2lang.com/install.sh | sh -s -- --prefix "$HOME/.local"
```

Install the dependencies and start the development server.

```bash
npm ci
npm run dev
```

The dev server runs at `http://localhost:4321/`. Build the production site with `npm run build` and preview it with `npm run preview`.

## Project Content and GitHub Metadata

Project content lives in `src/content/projects/`. The `order` field controls presentation, and `featured: true` includes a project on the homepage. Both the homepage and Projects page render these local entries, so all selected projects remain visible when GitHub is unavailable. There is no automatic repository feed.

Project detail pages optionally fetch GitHub metadata (last push, languages, and latest release) at build time. Failed API requests omit only that metadata; project descriptions, source links, and implementation notes remain available.

## Contact

Links for GitHub, LinkedIn, and email are on the [contact page](https://marcuswhited.tech/contact/).

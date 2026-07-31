# marcuswhited.tech

Personal portfolio and technical documentation site for Marcus Whited, live at [marcuswhited.tech](https://marcuswhited.tech).

The site covers engineering projects, homelab documentation, a technical blog, and career history. It is fully static — no backend, no tracking, just fast pages.

## Built With

- [Astro](https://astro.build/) — static site framework
- [TailwindCSS](https://tailwindcss.com/) — styling
- MDX and Markdown content collections
- [D2](https://d2lang.com/) — architecture and data-flow diagrams, rendered to static SVG at build time
- Deployed via GitHub Actions to GitHub Pages

## What's Here

- **Projects** — public, repository-backed builds plus an opt-in feed of recent GitHub work
- **Homelab** — concise documentation of the lab's architecture, networking, and security
- **Blog** — technical notes on Docker, DNS, routing, hardening, and troubleshooting
- **Career** — timeline, skills, and certifications

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

## GitHub Portfolio Feed

The Projects page adds public repositories from `marcusw0` when they have the GitHub topic `portfolio`. The build excludes forks, archived repositories, and repositories already represented by a case study, then shows up to six by most recent push. If the GitHub API is unavailable, the page falls back to the curated case studies and a profile link.

## Contact

Links for GitHub, LinkedIn, and email are on the [contact page](https://marcuswhited.tech/contact/).

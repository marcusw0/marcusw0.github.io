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

- **Projects** — engineering case studies with architecture notes and lessons learned
- **Homelab** — documentation of the lab's networking, security, services, and monitoring
- **Blog** — technical notes on Docker, DNS, routing, hardening, and troubleshooting
- **Career** — timeline, skills, and certifications

## Running Locally

Diagram generation needs the [D2 CLI](https://d2lang.com/tour/install) on your PATH:

```bash
curl -fsSL https://d2lang.com/install.sh | sh -s -- --prefix "$HOME/.local"
```

Then:

```bash
npm ci
npm run dev
```

The dev server runs at `http://localhost:4321/`. Build the production site with `npm run build` and preview it with `npm run preview`.

## Contact

Links for GitHub, LinkedIn, and email are on the [contact page](https://marcuswhited.tech/contact/).

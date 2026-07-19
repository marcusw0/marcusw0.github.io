# Repository Guidelines

## Current Status & Goals

This Astro 7 portfolio builds successfully as a 21-page static site. It includes verified career and resume content, a downloadable DOCX resume, project case studies, sanitized homelab documentation, D2 diagrams rendered to static SVG at build time, canonical/social metadata, a sitemap, `robots.txt`, and a custom 404 page. `.github/workflows/deploy.yml` validates and publishes the site to GitHub Pages.

Current priorities are:

1. Deepen case studies with real implementation samples, validation evidence, and measurable outcomes.
2. Complete the GitHub Pages deployment, verify `marcuswhited.tech`, configure its DNS records, enable TLS, and confirm the primary domain.
3. Continue homelab hardening documentation: consolidate duplicate DNS manifests, test restores, restrict administrative access, and validate proxy security headers.

Never invent professional claims, certifications, metrics, repository links, or infrastructure state. Use the resume and source repositories as evidence.

## Project Structure

Routes live in `src/pages/`; dynamic `[slug].astro` routes render Astro content collections. Reusable UI belongs in `src/components/`, helpers in `src/lib/`, and global CSS in `src/styles/global.css`. Markdown content is grouped under `src/content/{blog,homelab,projects}` and validated by `src/content.config.ts`. Public assets live in `public/`. Do not edit generated `dist/` files.

The adjacent `/home/marcus/.vscode-server/projects/docker/` workspace is a read-only source for homelab facts. Publish architecture and operational lessons, not private domains, addresses, tokens, credentials, internal paths, or deployable sensitive topology.

## Development Commands

- The D2 CLI must be on your PATH for diagram generation (`curl -fsSL https://d2lang.com/install.sh | sh -s -- --prefix "$HOME/.local"`). Diagrams are authored as `d2` code blocks in content Markdown, rendered to SVG at build time by `astro-d2`, and post-processed by `src/lib/rehype-d2-dark.ts` (theme-toggle dark mode plus aria-labels). `public/d2/` is a generated artifact and is git-ignored.
- `npm ci` installs the locked dependency set used by CI.
- `npm run dev` starts the local server at approximately `http://localhost:4321`.
- `npm run check` runs Astro and TypeScript diagnostics.
- `npm run build` validates content and generates `dist/`.
- `npm run preview` serves the production build for final review.

Run both `npm run check` and `npm run build` before handing off changes. For visual work, manually verify mobile layouts, both themes, links, resume download, and D2 diagram rendering.

## Style & Content Conventions

Use two-space indentation, single quotes in TypeScript/configuration, and semicolons. Name Astro components in PascalCase, routes in lowercase, and content files in kebab-case. Use ISO dates and lowercase tags. Project frontmatter may include `status`, `role`, `outcomes`, `github`, and `featured`; all values must be supportable from repository or resume evidence.

## Commits & Pull Requests

Use concise imperative subjects, such as `Expand homelab service inventory`, and keep commits logically scoped. Pull requests should state purpose, validation performed, linked issues, and screenshots for visual changes. Explicitly call out schema, dependency, CI, domain, or environment changes. Never commit `.env` files or secrets.

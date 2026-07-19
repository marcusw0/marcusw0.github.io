import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

const staticPaths = ['/', '/projects/', '/homelab/', '/blog/', '/career/', '/resume/', '/contact/'];
type SitemapEntry = { path: string; date?: Date };

export const GET: APIRoute = async ({ site }) => {
  const [projects, homelab, blog] = await Promise.all([
    getCollection('projects'),
    getCollection('homelab'),
    getCollection('blog', ({ data }) => !data.draft),
  ]);

  const entries: SitemapEntry[] = [
    ...staticPaths.map((path) => ({ path })),
    ...projects.map(({ id, data }) => ({ path: `/projects/${id}/`, date: data.date })),
    ...homelab.map(({ id, data }) => ({ path: `/homelab/${id}/`, date: data.date })),
    ...blog.map(({ id, data }) => ({ path: `/blog/${id}/`, date: data.date })),
  ];

  const urls = entries
    .map(({ path, date }) => {
      const lastmod = date ? `<lastmod>${date.toISOString().slice(0, 10)}</lastmod>` : '';
      return `<url><loc>${new URL(path, site)}</loc>${lastmod}</url>`;
    })
    .join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

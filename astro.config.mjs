import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import d2 from 'astro-d2';
import tailwindcss from '@tailwindcss/vite';
import { rehypeD2Dark } from './src/lib/rehype-d2-dark';

export default defineConfig({
  site: 'https://marcuswhited.tech',
  output: 'static',
  redirects: {
    '/homelab/services/': '/homelab/architecture/#services',
    '/projects/self-hosted-gitlab/': '/homelab/architecture/#services',
    '/projects/gitlab-deployment-platform/': '/blog/from-compose-folders-to-gitlab/',
    '/projects/infrastructure-automation/': '/blog/from-compose-folders-to-gitlab/',
  },
  integrations: [
    mdx(),
    // Inline SVGs (rather than <img>) so rehypeD2Dark can retarget the
    // baked-in prefers-color-scheme dark styles at the site's .dark toggle.
    d2({ layout: 'elk', inline: true }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeD2Dark],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});

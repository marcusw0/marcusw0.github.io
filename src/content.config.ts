import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const sharedSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  tech: z.array(z.string()).default([]),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: sharedSchema.extend({
    github: z.url().optional(),
    featured: z.boolean().default(false),
    status: z.enum(['active', 'complete', 'ongoing']).optional(),
    role: z.string().optional(),
    outcomes: z.array(z.string()).default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: sharedSchema.extend({
    draft: z.boolean().default(false),
  }),
});

const homelab = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/homelab' }),
  schema: sharedSchema.extend({
    section: z.enum(['architecture', 'networking', 'security', 'services', 'monitoring']),
    order: z.number().default(0),
  }),
});

export const collections = {
  projects,
  blog,
  homelab,
};

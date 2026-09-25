import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().default('Identyfikacja wizualna'),
    author: z.string().default('Krzysztof Krawczyk'),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    cover: z.string(),
    coverAlt: z.string(),
    draft: z.boolean().default(false),
    lang: z.enum(['pl', 'en']).default('pl'),
  }),
});

const portfolioCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/portfolio' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    year: z.string().optional(),
    show_section_numbers: z.boolean().optional(),
    cover: z.string(),
    cover_alt: z.string(),
    og_image: z.string().optional(),
    brief_title: z.string(),
    brief: z.array(z.string()),
    deliverables: z.array(z.string()),
    gallery: z.array(
      z.object({
        src: z.string(),
        alt: z.string(),
        caption: z.string(),
        width: z.number().optional(),
        height: z.number().optional(),
        type: z.string().optional(),
        poster: z.string().optional(),
      })
    ),
    result_title: z.string(),
    result: z.array(z.string()),
    testimonial: z.string().optional(),
    testimonial_author: z.string().optional(),
    external_url: z.string().optional(),
    external_label: z.string().optional(),
    next_url: z.string(),
    next_title: z.string(),
    missing_gallery_slots: z.number().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  portfolio: portfolioCollection,
};

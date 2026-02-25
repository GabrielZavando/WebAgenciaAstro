// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    // Type-check frontmatter using a schema
    schema: z.object({
        title: z.string(),
        description: z.string(),
        // Transform string to Date object
        pubDate: z.coerce.date(),
        author: z.string().default('Gabriel Zavando'),
        image: z.string().optional(),
    }),
});

export const collections = { blog };

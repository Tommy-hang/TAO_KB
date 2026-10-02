import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { noteSchema, collectionSchema, pageSchema } from './lib/schema';
export const collections = {
  notes: defineCollection({
    loader: glob({
      pattern: '**/*.md',
      base: './src/content/notes',
      generateId: ({ entry }) => entry.replace(/\.md$/, ''),
    }),
    schema: noteSchema,
  }),
  collections: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/collections' }),
    schema: collectionSchema,
  }),
  pages: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
    schema: pageSchema,
  }),
};

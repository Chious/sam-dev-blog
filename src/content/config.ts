import { defineCollection, z } from "astro:content";

const notesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    sidebar_position: z.number().optional(),
    description: z.string().optional(),
    date: z.date().optional(),
    readingTime: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  notes: notesCollection,
};

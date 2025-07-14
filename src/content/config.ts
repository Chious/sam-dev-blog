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

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    description: z.string().optional(),
    date: z.date().optional(),
    author: z.string().optional(),
    readingTime: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const travelCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    description: z.string().optional(),
    date: z.date().optional(),
    area: z.enum(["north", "central", "south", "east", "other"]),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    duration: z.string().optional(),
    budget: z.number().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    hasPdf: z.boolean().optional(),
    pdfUrl: z.string().optional(),
  }),
});

export const collections = {
  notes: notesCollection,
  blog: blogCollection,
  travel: travelCollection,
};

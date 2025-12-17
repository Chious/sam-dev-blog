import { defineCollection, z } from "astro:content";
import { notionLoader } from "@chlorinec-pkgs/notion-astro-loader";
import {
  notionPageSchema,
  transformedPropertySchema,
} from "@chlorinec-pkgs/notion-astro-loader/schemas";

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

const aboutCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

const projectsCollection = defineCollection({
  loader: notionLoader({
    experimentalCacheImageInData: true,
    experimentalRootSourceAlias: "src",
    auth: import.meta.env.NOTION_API_KEY,
    database_id: import.meta.env.NOTION_DATABASE_ID,
    imageSavePath: "assets/notion",
    filter: {
      property: "Publish",
      select: {
        equals: "Publish",
      },
    },
    sorts: [
      {
        timestamp: "last_edited_time",
        direction: "descending",
      },
    ],
  }),
  schema: notionPageSchema({
    properties: z.object({
      Name: transformedPropertySchema.title.optional(),
      LivePage: transformedPropertySchema.url.optional(),
      Code: transformedPropertySchema.url.optional(),
      Type: transformedPropertySchema.select.optional(),
      Tags: transformedPropertySchema.multi_select.optional(),
    }),
  }).transform((entry) => {
    let coverImage: string | null = null;
    if (entry.cover) {
      if (entry.cover.type === "external") {
        coverImage = entry.cover.external?.url || null;
      } else if (entry.cover.type === "file") {
        let imagePath = entry.cover.file?.url || null;
        // 保留原始路徑，讓頁面處理圖片導入
        coverImage = imagePath;
      }
    }
    return {
      ...entry,
      title: entry.properties.Name || "",
      livePageUrl: entry.properties.LivePage || null,
      codeUrl: entry.properties.Code || null,
      pageUrl: entry.url || null,
      type: entry.properties.Type || null,
      tags: entry.properties.Tags || [],
      coverImage: coverImage,
    };
  }),
});

export const collections = {
  notes: notesCollection,
  blog: blogCollection,
  travel: travelCollection,
  about: aboutCollection,
  projects: projectsCollection,
};

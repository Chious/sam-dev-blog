// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import rehypeMermaid from "rehype-mermaid";
import sitemap from "@astrojs/sitemap";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import {
  transformerMeta,
  transformerCreateCodeBlockHeader,
  transformerAddTitleToCodeBlocksHeaders,
  transformerCopyButton,
} from "./src/plugins/shiki-transformer";

// https://astro.build/config
export default defineConfig({
  site: "https://sam-dev.space",

  markdown: {
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["mermaid", "math"],
    },
    shikiConfig: {
      theme: "github-dark",
      transformers: [
        transformerMeta(),
        transformerCreateCodeBlockHeader(),
        transformerAddTitleToCodeBlocksHeaders(),
        transformerCopyButton(),
      ],
      wrap: false,
    },
    rehypePlugins: [rehypeMermaid],
  },

  output: "static",

  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {
        limitInputPixels: false,
      },
    },
  },

  build: {
    assets: "assets",
  },

  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve("./src"),
        "@components": path.resolve("./src/components"),
        "@layouts": path.resolve("./src/layouts"),
        "@pages": path.resolve("./src/pages"),
        "@styles": path.resolve("./src/styles"),
        "@data": path.resolve("./src/data"),
      },
    },
  },
  integrations: [sitemap(), preact(), mdx()],
});

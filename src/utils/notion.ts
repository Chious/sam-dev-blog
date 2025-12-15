import { Client } from "@notionhq/client";

const notion = new Client({ auth: import.meta.env.NOTION_API_KEY });
const DATABASE_ID = import.meta.env.NOTION_DATABASE_ID;

export interface Project {
  title: string;
  livePageUrl: string | null;
  codeUrl: string | null;
  pageUrl: string | null;
  type: string | null;
  tags: string[];
  coverImage: string | null;
}

export async function getProjects(): Promise<Project[]> {
  if (!DATABASE_ID) {
    throw new Error("NOTION_DATABASE_ID is not set in environment variables.");
  }

  // @notionhq/client v5+: querying is done via Data Sources (not `databases.query`).
  // First retrieve the database to get its underlying data source id, then query that data source.
  const database = await notion.databases.retrieve({
    database_id: DATABASE_ID,
  });
  const dataSourceId =
    ("data_sources" in database && database.data_sources?.[0]?.id) || null;

  if (!dataSourceId) {
    throw new Error(
      "NOTION_DATABASE_ID does not expose any data_sources. Ensure the integration has access and the database is valid."
    );
  }

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    result_type: "page",
    sorts: [
      {
        timestamp: "last_edited_time",
        direction: "descending",
      },
    ],
  });

  return response.results
    .filter((result: any) => result?.object === "page")
    .filter((page: any) => {
      // Filter by Publish property (assuming it's a checkbox or select)
      const publishProp = page.properties?.Publish;
      if (!publishProp) return false;

      // Handle select/status type (check if value is "Published" or similar)
      if (publishProp.type === "select" || publishProp.type === "status") {
        const value = publishProp.select?.name || publishProp.status?.name;
        return value === "Publish" || value === "Yes" || value === true;
      }

      return false;
    })
    .map((page: any) => {
      // Extract title from Name property
      const nameProp = page.properties?.Name;
      const title =
        nameProp?.type === "title" && nameProp.title?.[0]?.plain_text
          ? nameProp.title[0].plain_text
          : "Untitled";

      // Extract LivePage URL
      const livePageProp = page.properties?.LivePage;
      const livePageUrl =
        livePageProp?.type === "url" ? livePageProp.url : null;

      // Extract Code URL
      const codeProp = page.properties?.Code;
      const codeUrl = codeProp?.type === "url" ? codeProp.url : null;

      // Extract Page Detail URL (Notion page url)
      const pageUrl = typeof page.url === "string" ? page.url : null;

      // Extract Type (e.g., Code | Note)
      const typeProp = page.properties?.Type;
      const type =
        typeProp?.type === "select" || typeProp?.type === "status"
          ? typeProp.select?.name || typeProp.status?.name || null
          : null;

      // Extract Tags (multi-select)
      const tagsProp = page.properties?.Tags;
      const tags =
        tagsProp?.type === "multi_select"
          ? tagsProp.multi_select.map((tag: any) => tag.name || "")
          : [];

      // Extract Cover Image
      let coverImage: string | null = null;
      if (page.cover) {
        if (page.cover.type === "external" && page.cover.external?.url) {
          coverImage = page.cover.external.url;
        } else if (page.cover.type === "file" && page.cover.file?.url) {
          coverImage = page.cover.file.url;
        }
      }

      return {
        title,
        livePageUrl,
        codeUrl,
        pageUrl,
        type,
        tags,
        coverImage,
      };
    });
}

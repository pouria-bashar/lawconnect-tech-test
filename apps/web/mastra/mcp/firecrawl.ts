import { MCPClient } from "@mastra/mcp";

const token = process.env.FIRECRAWL_API_KEY;
if (!token) {
  throw new Error("FIRECRAWL_API_KEY environment variable is required");
}

export const firecrawlMcp = new MCPClient({
  timeout: 120000,
  servers: {
    firecrawl: {
      url: new URL(
        `https://mcp.firecrawl.dev/${process.env.FIRECRAWL_API_KEY}/v2/mcp`,
      ),
    },
  },
});

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { searchTests, listTests } from "@workspace/db/queries/synthetic-test";

const HOST = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const findTestTool = createTool({
  id: "find_test",
  description:
    "Search for saved synthetic tests by name or description. Use this when the user wants to find, view, or navigate to a previously generated test. Returns matching tests with links to view them.",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe(
        "Search term to find tests by name or description. Leave empty to list recent tests.",
      ),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    tests: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable(),
        cron: z.string().nullable(),
        url: z.string(),
        createdAt: z.string(),
      }),
    ),
    error: z.string().optional(),
  }),
  execute: async (input) => {
    try {
      const results = input.query
        ? await searchTests(input.query)
        : await listTests({ limit: 10 });

      return {
        success: true,
        tests: results.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          cron: t.cron,
          url: `${HOST}/synthetic-test/${t.id}`,
          createdAt: t.createdAt.toISOString(),
        })),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to search tests";
      return { success: false, tests: [], error: message };
    }
  },
});

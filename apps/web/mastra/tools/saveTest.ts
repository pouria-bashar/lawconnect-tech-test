import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { saveTest } from "@workspace/db/queries/synthetic-test";

export const saveTestTool = createTool({
  id: "save_test",
  description:
    "Save a synthetic test to the database with a cron schedule. Use this after the user confirms they are happy with the generated test and has specified how frequently they want it to run. Pass the same name and code from render_test, plus the cron expression for the schedule.",
  inputSchema: z.object({
    name: z
      .string()
      .describe("A short descriptive name for the test (e.g. 'Homepage H1 Check')"),
    description: z
      .string()
      .optional()
      .describe("A brief description of what the test verifies"),
    code: z
      .string()
      .describe("The complete Playwright test code as a TypeScript string"),
    cron: z
      .string()
      .describe(
        "Cron expression for how often to run the test (e.g. '*/5 * * * *' for every 5 minutes, '0 * * * *' for hourly, '0 0 * * *' for daily)",
      ),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    id: z.string().optional(),
    url: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async (input) => {
    const host = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    try {
      const test = await saveTest({
        name: input.name,
        description: input.description ?? null,
        code: input.code,
        cron: input.cron,
      });
      return { success: true, id: test.id, url: `${host}/synthetic-tests/${test.id}` };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save test";
      return { success: false, error: message };
    }
  },
});

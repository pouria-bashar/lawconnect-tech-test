import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const renderTestTool = createTool({
  id: "render_test",
  description:
    "Render a Playwright test in a Monaco code editor. Call this tool to display the generated test code. Output ONLY valid TypeScript Playwright test code.",
  inputSchema: z.object({
    name: z
      .string()
      .describe("A short descriptive name for the test (e.g. 'Login Flow Test')"),
    code: z
      .string()
      .describe(
        "The complete Playwright test code as a TypeScript string. Must import from @playwright/test and be self-contained.",
      ),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async () => {
    return { success: true };
  },
});

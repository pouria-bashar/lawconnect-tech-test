import { runClaudeCode } from "@workspace/e2b/run-claude-code";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const buildUiTool = createTool({
  id: "build_ui",
  description:
    "Generate a UI by running Claude Code in a cloud sandbox. Call this tool when the user asks you to generate, build, or create a UI, page, form, dashboard, or any visual interface. Pass clear, detailed instructions describing the UI to build.",
  inputSchema: z.object({
    instructions: z
      .string()
      .describe(
        "Detailed instructions for what UI to build. Be specific about layout, components, content, and any interactive behavior.",
      ),
  }),
  outputSchema: z.object({
    url: z.string().describe("URL to the generated HTML file"),
  }),
  execute: async (input, context) => {
    const processId = context?.toolCallId ?? crypto.randomUUID();

    const result = await runClaudeCode(input.instructions, {
      processId,
      onEvent: (event) => {
        void context?.writer?.custom({
          type: "data-build-progress",
          data: event,
          transient: true,
        });
      },
    });

    if (result.status === "error") {
      throw new Error(`Claude Code failed: ${result.errors}`);
    }

    if (!result.url) {
      throw new Error(
        `Claude Code did not generate an HTML file. Status: ${result.status}. Errors: ${result.errors}`,
      );
    }

    return { url: result.url };
  },
});

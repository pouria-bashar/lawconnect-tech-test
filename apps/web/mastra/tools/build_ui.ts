import { startClaudeCode } from "@workspace/e2b/run-claude-code";
import { createBuildJob } from "@workspace/db/queries/build-jobs";
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
    jobId: z.string().describe("ID of the build job to poll for status"),
    status: z.enum(["running"]).describe("Initial status of the build"),
  }),
  execute: async (input) => {
    const { pid, sandboxId } = await startClaudeCode(input.instructions);

    const job = await createBuildJob({ pid, sandboxId });

    return { jobId: job.id, status: "running" as const };
  },
});

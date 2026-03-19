import { startClaudeCode } from "@workspace/e2b/run-claude-code";
import { createBuildJob } from "@workspace/db/queries/build-jobs";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const buildFullStackAppTool = createTool({
  id: "build_full_stack_app",
  description:
    "Generate a full stack web application by running Claude Code in a cloud sandbox. Call this tool when the user asks you to generate, build, or create a full stack app, web application, or any multi-page application with backend logic. Pass clear, detailed instructions describing the app to build.",
  inputSchema: z.object({
    instructions: z
      .string()
      .describe(
        "Detailed instructions for what full stack app to build. Be specific about features, pages, data models, user flows, and any interactive behavior.",
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

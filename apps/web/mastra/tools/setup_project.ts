import { getSandbox } from "@workspace/e2b/sandbox";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const setupProjectTool = createTool({
  id: "setup_project",
  description:
    "Initialise and warm up the cloud sandbox environment before building. Always call this first when the user wants to build an app.",
  inputSchema: z.object({
    projectName: z
      .string()
      .describe("A short name for the project being built"),
    projectId: z
      .string()
      .describe("The project ID provided in your instructions — pass it exactly as given"),
  }),
  outputSchema: z.object({
    status: z.enum(["ready"]).describe("Sandbox is ready for building"),
  }),
  execute: async (input) => {
    await getSandbox(input.projectId);
    return { status: "ready" as const };
  },
});

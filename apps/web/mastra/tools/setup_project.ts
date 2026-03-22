import { getSandbox } from "@workspace/e2b/sandbox";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "project";
}

export const setupProjectTool = createTool({
  id: "setup_project",
  description:
    "Initialise and warm up the cloud sandbox environment before building. Runs the project boilerplate scaffold.",
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
    projectDir: z.string().describe("Absolute path to the scaffolded project in the sandbox"),
  }),
  execute: async (input) => {
    const slug = toSlug(input.projectName);
    const projectDir = `/home/user/${slug}`;
    const sbx = await getSandbox(input.projectId);

    await sbx.commands.run(
      `npx github:aibuilder-ai/siu-boilerplate ${slug} -t nextjs-hono-worker --yes --no-git --no-install`,
      { cwd: "/home/user", timeoutMs: 5 * 60 * 1000 },
    );

    return { status: "ready" as const, projectDir };
  },
});

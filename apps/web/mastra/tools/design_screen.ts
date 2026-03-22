import { stitch } from "@google/stitch-sdk";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { saveStitchProject } from "@workspace/db/queries/fullstack-apps";
import { designAgent } from "@/mastra/agents/design-agent";

export const designScreenTool = createTool({
  id: "design_screen",
  description:
    "Generate a UI design mockup for the app using AI. Always call this first, before setup_project.",
  inputSchema: z.object({
    prompt: z
      .string()
      .describe(
        "Detailed description of the UI to design — include app purpose, key screens, layout, and visual style",
      ),
    projectTitle: z
      .string()
      .describe("Short title for the design project"),
  }),
  outputSchema: z.object({
    stitchProjectId: z.string(),
  }),
  execute: async (input, context) => {
    const projectId = context.requestContext?.get("threadId") as string | undefined;
    const project = await stitch.createProject(input.projectTitle);

    if (projectId) {
      await saveStitchProject({ projectId, stitchProjectId: project.id, title: input.projectTitle });
    }


    // Generate a structured design system prompt via the design agent
    const designResult = await designAgent.generate(
      [{ role: "user", content: `App description: ${input.prompt}` }],
      { requestContext: context.requestContext },
    );

    // Combine the original description with the generated design system
    const stitchPrompt = `${input.prompt}\n\n${designResult.text}`;

    // Fire and forget — pass the combined prompt to Stitch
    project.generate(stitchPrompt, "DESKTOP").catch((err) => {
      console.error("design_screen: generate failed", err);
    });

    return { stitchProjectId: project.id };
  },
});

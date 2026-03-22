import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const showDesignReviewTool = createTool({
  id: "show_design_review",
  description:
    "Show the design review panel in chat so the user can preview the generated design and choose to approve it, request edits, or generate variants. Call this immediately after acknowledging a build request.",
  inputSchema: z.object({}),
  outputSchema: z.object({ projectId: z.string() }),
  execute: async (_input, context) => {
    const projectId = context.requestContext?.get("threadId") as string;
    return { projectId };
  },
});

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const tiptapNodeSchema: z.ZodType = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(z.lazy(() => tiptapNodeSchema)).optional(),
    marks: z
      .array(
        z.object({
          type: z.string(),
          attrs: z.record(z.string(), z.unknown()).optional(),
        }),
      )
      .optional(),
    text: z.string().optional(),
  }),
);

export const renderBlogTool = createTool({
  id: "render_blog",
  description:
    "Render a blog post using Tiptap JSON format. Call this tool to display the generated blog content in a rich text editor. The content must follow Tiptap's JSONContent schema.",
  inputSchema: z.object({
    title: z.string().describe("The blog post title"),
    content: z
      .object({
        type: z.literal("doc"),
        content: z.array(tiptapNodeSchema),
      })
      .describe("Tiptap JSONContent document"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async () => {
    return { success: true };
  },
});

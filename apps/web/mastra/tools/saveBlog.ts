import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { saveBlog } from "@workspace/db/queries/blog";

export const saveBlogTool = createTool({
  id: "save_blog",
  description:
    "Save a blog post to the database. Use this after the user confirms they want to save the blog. Pass the same title, tags, and content that were used in render_blog.",
  inputSchema: z.object({
    title: z.string().describe("The blog post title"),
    tags: z
      .array(z.string())
      .describe("Tags for the blog post"),
    content: z
      .record(z.string(), z.unknown())
      .describe("The Tiptap JSONContent document"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    id: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const post = await saveBlog({
        title: context.title,
        tags: context.tags,
        content: context.content,
      });
      return { success: true, id: post.id };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save blog";
      return { success: false, error: message };
    }
  },
});

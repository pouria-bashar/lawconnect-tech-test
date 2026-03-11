import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const uiElementSchema: z.ZodType = z.lazy(() =>
  z.object({
    type: z.string(),
    props: z.record(z.string(), z.unknown()),
    children: z.array(z.string()).optional(),
  }),
);

export const renderPdfTool = createTool({
  id: "render_pdf",
  description:
    "Render a PDF document spec. Call this tool when the user asks you to generate, build, or create a PDF document such as an invoice, report, resume, letter, or any printable document.",
  inputSchema: z.object({
    root: z.string().describe("The key of the root element (usually 'doc')"),
    elements: z
      .record(z.string(), uiElementSchema)
      .describe("Flat map of PDF elements keyed by unique IDs"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async () => {
    return { success: true };
  },
});

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const uiElementSchema: z.ZodType = z.lazy(() =>
  z.object({
    type: z.string(),
    props: z.record(z.string(), z.unknown()),
    children: z.array(z.string()).optional(),
    visible: z.unknown().optional(),
    on: z.record(z.string(), z.unknown()).optional(),
    repeat: z
      .object({
        statePath: z.string(),
        key: z.string().optional(),
      })
      .optional(),
  }),
);

export const generateUiTool = createTool({
  id: "generate_ui",
  description:
    "Generate a UI component spec. Call this tool when the user asks you to generate, build, or create a UI, page, form, dashboard, or any visual interface.",
  inputSchema: z.object({
    root: z.string().describe("The key of the root element"),
    elements: z
      .record(z.string(), uiElementSchema)
      .describe("Flat map of UI elements keyed by unique IDs"),
    state: z
      .record(z.string(), z.unknown())
      .optional()
      .describe("Initial state for the UI"),
    themeId: z
      .string()
      .optional()
      .describe(
        "Theme preset ID from the select_theme tool. When provided, the rendered UI will be wrapped in the theme's CSS variables so Tailwind classes like bg-primary, text-accent-foreground etc. use the theme's colors.",
      ),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    formData: z.record(z.string(), z.unknown()).optional(),
  }),
});

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const askQuestionTool = createTool({
  id: "ask_question",
  description:
    "Ask the user a structured question with predefined options. Use this for intake questions where the user picks from a set of choices. The tool renders interactive radio buttons (single select) or checkboxes (multi select). Always use this tool instead of listing options as text.",
  inputSchema: z.object({
    question: z.string().describe("The question text to display"),
    type: z
      .enum(["radio", "checkbox"])
      .describe("radio = single choice, checkbox = multiple choices"),
    options: z
      .array(
        z.object({
          label: z.string().describe("Display label"),
          value: z.string().describe("Value to return when selected"),
        }),
      )
      .describe("The options to present to the user"),
    allowOther: z
      .boolean()
      .optional()
      .describe("Whether to show a free-text 'Other' option"),
  }),
  outputSchema: z.object({
    answers: z
      .array(z.string())
      .describe("Selected option values"),
    otherText: z
      .string()
      .optional()
      .describe("Free text if 'Other' was selected"),
  }),
});

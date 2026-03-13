import { runClaudeCode } from "@workspace/e2b/run-claude-code";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

function extractJsonFromOutput(stdout: string): Record<string, unknown> | null {
  const lines = stdout.split("\n").filter(Boolean);

  // Look for the result line (last line from stream-json format)
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(lines[i]!);
      if (parsed.type === "result" && parsed.result) {
        const json = tryParseJson(parsed.result);
        if (json) return json;
      }
    } catch {
      // not valid JSON line, skip
    }
  }

  // Fall back to assistant message content
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === "assistant" && parsed.message?.content) {
        for (const block of parsed.message.content) {
          if (block.type === "text") {
            const json = tryParseJson(block.text);
            if (json) return json;
          }
        }
      }
    } catch {
      // skip
    }
  }

  return null;
}

function tryParseJson(text: string): Record<string, unknown> | null {
  // Try extracting from code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1]!.trim());
      if (parsed && typeof parsed === "object" && "root" in parsed) return parsed;
    } catch {
      // fall through
    }
  }

  // Try parsing the whole text
  try {
    const parsed = JSON.parse(text.trim());
    if (parsed && typeof parsed === "object" && "root" in parsed) return parsed;
  } catch {
    // fall through
  }

  // Try to find a JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && typeof parsed === "object" && "root" in parsed) return parsed;
    } catch {
      // fall through
    }
  }

  return null;
}

export const buildUiTool = createTool({
  id: "build_ui",
  description:
    "Generate a UI component spec by running Claude Code in a cloud sandbox. Call this tool when the user asks you to generate, build, or create a UI, page, form, dashboard, or any visual interface. Pass clear, detailed instructions describing the UI to build.",
  inputSchema: z.object({
    instructions: z
      .string()
      .describe(
        "Detailed instructions for what UI to build. Be specific about layout, components, content, and any interactive behavior.",
      ),
    themeId: z
      .string()
      .optional()
      .describe("Theme preset ID to apply to the generated UI."),
  }),
  outputSchema: z.object({
    root: z.string(),
    elements: z.record(z.string(), z.unknown()),
    state: z.record(z.string(), z.unknown()).optional(),
    themeId: z.string().optional(),
  }),
  execute: async (input) => {
    const result = await runClaudeCode(input.instructions);

    if (result.status === "error") {
      throw new Error(`Claude Code failed: ${result.errors}`);
    }

    const spec = extractJsonFromOutput(result.logs);
    if (!spec) {
      throw new Error(
        `Could not parse UI spec from Claude Code output. Status: ${result.status}. Errors: ${result.errors}`,
      );
    }

    // Attach themeId if provided
    if (input.themeId) {
      spec.themeId = input.themeId;
    }

    return spec as {
      root: string;
      elements: Record<string, unknown>;
      state?: Record<string, unknown>;
      themeId?: string;
    };
  },
});

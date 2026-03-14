import { getSandbox } from "@workspace/e2b/sandbox";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const findFileTool = createTool({
  id: "find_file",
  description:
    "Find and download files from the cloud sandbox. Use this when the user asks to download, retrieve, or get a file that was generated in the sandbox (e.g. 'give me the output.png', 'download the readme').",
  inputSchema: z.object({
    filename: z
      .string()
      .describe(
        "The filename or glob pattern to search for (e.g. 'output.png', 'README.md', '*.pdf'). Searches recursively under /home/user.",
      ),
  }),
  outputSchema: z.object({
    files: z.array(
      z.object({
        path: z.string().describe("Full path of the file in the sandbox"),
        url: z.string().describe("Download URL for the file"),
      }),
    ),
    error: z.string().optional(),
  }),
  execute: async (input) => {
    try {
      const sbx = await getSandbox();

      const result = await sbx.commands.run(
        `find /home/user -name '${input.filename.replace(/'/g, "'\\''")}' -type f 2>/dev/null | head -20`,
        { timeoutMs: 10000 },
      );

      const paths = result.stdout
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (paths.length === 0) {
        return {
          files: [],
          error: `No files matching "${input.filename}" found in the sandbox.`,
        };
      }

      const files = await Promise.all(
        paths.map(async (path) => ({
          path,
          url: await sbx.downloadUrl(path),
        })),
      );

      return { files };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to search sandbox";
      return { files: [], error: message };
    }
  },
});

import { getSandbox } from "@workspace/e2b/sandbox";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const runCommandTool = createTool({
  id: "run_command",
  description:
    "Run a shell command in the cloud sandbox. Use this when the user asks to execute a command, install a package, check a file, run a script, or perform any shell operation in the sandbox environment.",
  inputSchema: z.object({
    command: z
      .string()
      .describe("The shell command to execute (e.g. 'ls -la', 'npm install', 'cat file.txt')"),
    timeoutMs: z
      .number()
      .optional()
      .default(30000)
      .describe("Timeout in milliseconds (default: 30000)"),
  }),
  outputSchema: z.object({
    stdout: z.string(),
    stderr: z.string(),
    exitCode: z.number(),
    error: z.string().optional(),
  }),
  execute: async (input) => {
    try {
      const sbx = await getSandbox();

      const result = await sbx.commands.run(input.command, {
        timeoutMs: input.timeoutMs ?? 30000,
      });

      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to run command in sandbox";
      return { stdout: "", stderr: "", exitCode: 1, error: message };
    }
  },
});

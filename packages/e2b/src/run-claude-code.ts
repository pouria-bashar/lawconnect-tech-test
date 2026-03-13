import { getSandbox } from "@workspace/e2b/sandbox"

export interface RunResult {
  status: "pass" | "fail" | "error"
  logs: string
  errors: string
  durationMs: number
  url?: string
}

// /Users/pouria/Documents/sustainbit/PropSight-master/apps/backoffice/src/mastra/lib/run-coding-agent.ts

export async function runClaudeCode(instruction: string): Promise<RunResult> {
  const start = Date.now()
  try {
    const sbx = await getSandbox()

    const escaped = `${instruction}`.replace(/'/g, "'\\''")
    const command = `claude -p '${escaped}' --dangerously-skip-permissions --model claude-opus-4-6 --output-format stream-json --verbose --continue`
    // Run the test
    const result = await sbx.commands.run(command, {
      timeoutMs: 120_000,
      onStdout: (data) => {
        console.log(data)
      },
      onStderr(data) {
        console.log(data)
      },
    })

    const durationMs = Date.now() - start

    // Get download URL for the generated HTML file
    let url: string | undefined
    if (result.exitCode === 0) {
      try {
        url = await sbx.downloadUrl("/home/user/output.html")
      } catch {
        // File might not exist if Claude Code didn't generate it
      }
    }

    return {
      status: result.exitCode === 0 ? "pass" : "fail",
      logs: result.stdout,
      errors: result.stderr,
      durationMs,
      url,
    }
  } catch (error: unknown) {
    console.log(JSON.stringify(error), "????")

    const durationMs = Date.now() - start
    const err = error as { stdout?: string; stderr?: string; message?: string }

    return {
      status: "error",
      logs: err.stdout || "",
      errors: err.stderr || err.message || "Unknown error",
      durationMs,
    }
  }
}

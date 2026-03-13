import { getSandbox } from "@workspace/e2b/sandbox"

export interface RunResult {
  status: "pass" | "fail" | "error"
  logs: string
  errors: string
  durationMs: number
}

// /Users/pouria/Documents/sustainbit/PropSight-master/apps/backoffice/src/mastra/lib/run-coding-agent.ts

export async function runClaudeCode(instruction: string): Promise<RunResult> {
  
  const start = Date.now()
  try {
    const sbx = await getSandbox()

    const escaped = `${instruction}`.replace(/'/g, "'\\''")
    const command = `claude -p '${escaped}' --dangerously-skip-permissions --output-format stream-json --verbose --continue`
    // Run the test
    const result = await sbx.commands.run(command, { timeoutMs: 120_000, onStderr(data) {
        console.log(data);
    }, })

    console.log(result, '>>>>>>');
    
    const durationMs = Date.now() - start

    return {
      status: result.exitCode === 0 ? "pass" : "fail",
      logs: result.stdout,
      errors: result.stderr,
      durationMs,
    }
  } catch (error: unknown) {
    console.log(JSON.stringify(error),'????');
    
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

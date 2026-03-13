import { getSandbox } from "@workspace/e2b/sandbox"
import { processRegistry } from "@workspace/e2b/process-registry"

export interface RunResult {
  status: "pass" | "fail" | "error"
  logs: string
  errors: string
  durationMs: number
  url?: string
}

export interface ClaudeStreamEvent {
  type: "tool_use" | "tool_result" | "text" | "status"
  toolName?: string
  toolInput?: Record<string, unknown>
  text?: string
  status?: string
}

function parseStreamEvent(line: string): ClaudeStreamEvent | null {
  try {
    const parsed = JSON.parse(line)

    if (parsed.type === "assistant" && parsed.message?.content) {
      for (const block of parsed.message.content) {
        if (block.type === "tool_use") {
          return {
            type: "tool_use",
            toolName: block.name,
            toolInput: block.input,
          }
        }
        if (block.type === "text" && block.text) {
          return { type: "text", text: block.text }
        }
      }
    }

    if (parsed.type === "user" && parsed.message?.content) {
      for (const block of parsed.message.content) {
        if (block.type === "tool_result") {
          const content = typeof block.content === "string"
            ? block.content
            : JSON.stringify(block.content)
          return {
            type: "tool_result",
            text: content.slice(0, 200),
          }
        }
      }
    }

    if (parsed.type === "result") {
      return { type: "status", status: "completed" }
    }

    return null
  } catch {
    return null
  }
}

export interface RunOptions {
  processId?: string
  onEvent?: (event: ClaudeStreamEvent) => void
}

export async function runClaudeCode(instruction: string, options?: RunOptions): Promise<RunResult> {
  const start = Date.now()
  try {
    const sbx = await getSandbox()

    const escaped = `${instruction}`.replace(/'/g, "'\\''")
    const command = `claude -p '${escaped}' --dangerously-skip-permissions --model claude-opus-4-6 --output-format stream-json --verbose --continue`

    const handle = await sbx.commands.run(command, {
      background: true,
      timeoutMs: 0,
      onStdout: (data) => {
        console.log(data)
        if (options?.onEvent) {
          const event = parseStreamEvent(data)
          if (event) options.onEvent(event)
        }
      },
      onStderr(data) {
        console.log(data)
      },
    })

    // Register kill function so the process can be cancelled
    if (options?.processId) {
      processRegistry.register(options.processId, () => handle.kill())
    }

    const result = await handle.wait()

    // Clean up registry
    if (options?.processId) {
      processRegistry.remove(options.processId)
    }

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

    // Clean up registry on error
    if (options?.processId) {
      processRegistry.remove(options.processId)
    }

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

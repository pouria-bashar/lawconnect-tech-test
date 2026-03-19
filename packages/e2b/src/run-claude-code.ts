import { Sandbox } from "e2b"
import { getSandbox } from "@workspace/e2b/sandbox"

export type OutputType = "html" | "png" | "pdf"
export type BuildJobStatus = "running" | "completed" | "failed" | "cancelled"

const OUTPUT_FILES: { path: string; type: OutputType }[] = [
  { path: "/home/user/output.html", type: "html" },
  { path: "/home/user/output.png", type: "png" },
  { path: "/home/user/output.pdf", type: "pdf" },
]

const BUILD_LOG_PATH = "/home/user/build-log.jsonl"

export interface RunResult {
  status: "pass" | "fail" | "error"
  logs: string
  errors: string
  durationMs: number
  url?: string
  outputType?: OutputType
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

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000

async function ensureSandboxTimeout(sbx: Awaited<ReturnType<typeof getSandbox>>) {
  const info = await sbx.getInfo()
  const remainingMs = new Date(info.endAt).getTime() - Date.now()
  if (remainingMs < FIFTEEN_MINUTES_MS) {
    await sbx.setTimeout(FIFTEEN_MINUTES_MS)
  }
}

async function connectSandbox(sandboxId: string): Promise<Sandbox> {
  const apiKey = process.env.E2B_API_KEY
  if (!apiKey) throw new Error("E2B_API_KEY environment variable is required")
  return Sandbox.connect(sandboxId, { apiKey })
}

async function findOutputFile(sbx: Sandbox): Promise<{ url: string; outputType: OutputType } | null> {
  for (const file of OUTPUT_FILES) {
    try {
      const url = await sbx.downloadUrl(file.path)
      return { url, outputType: file.type }
    } catch {
      // File doesn't exist, try next
    }
  }
  return null
}

// --- Fire-and-forget API ---

export interface StartResult {
  pid: number
  sandboxId: string
}

/**
 * Starts Claude Code in the sandbox and returns immediately without waiting.
 * The process continues running in the background.
 * Stdout is tee'd to a log file so it can be read by `checkBuildStatus`.
 */
export async function startClaudeCode(instruction: string): Promise<StartResult> {
  const sbx = await getSandbox()
  await ensureSandboxTimeout(sbx)

  const escaped = `${instruction}`.replace(/'/g, "'\\''")
  const command = `claude -p '${escaped}' --dangerously-skip-permissions --model claude-opus-4-6 --output-format stream-json --verbose --continue 2>&1 | tee ${BUILD_LOG_PATH}`

  const handle = await sbx.commands.run(command, {
    background: true,
    timeoutMs: 0,
  })

  const info = await sbx.getInfo()

  return {
    pid: handle.pid,
    sandboxId: info.sandboxId,
  }
}

export interface BuildStatusResult {
  status: BuildJobStatus
  events: ClaudeStreamEvent[]
  newOffset: number
  result?: RunResult
}

/**
 * Checks the status of a background build by connecting to the sandbox,
 * reading new log lines, and checking if the process is still alive.
 */
export async function checkBuildStatus(
  sandboxId: string,
  pid: number,
  logOffset: number = 0,
): Promise<BuildStatusResult> {
  const sbx = await connectSandbox(sandboxId)

  // Read log + check processes in parallel
  const [fullLog, processes] = await Promise.all([
    sbx.files.read(BUILD_LOG_PATH).catch(() => ""),
    sbx.commands.list(),
  ])

  // Parse new log lines into events
  let newOffset = logOffset
  const events: ClaudeStreamEvent[] = []
  if (fullLog.length > logOffset) {
    newOffset = fullLog.length
    for (const line of fullLog.slice(logOffset).split("\n")) {
      if (!line.trim()) continue
      const event = parseStreamEvent(line)
      if (event) events.push(event)
    }
  }

  const isRunning = processes.some((p) => p.pid === pid)

  if (isRunning) {
    return { status: "running", events, newOffset }
  }

  // Process finished — collect output files
  const output = await findOutputFile(sbx)

  const result: RunResult = {
    status: output ? "pass" : "fail",
    logs: fullLog,
    errors: "",
    durationMs: 0,
    url: output?.url,
    outputType: output?.outputType,
  }

  return {
    status: output ? "completed" : "failed",
    events,
    newOffset,
    result,
  }
}

/**
 * Kills a running build process by PID.
 */
export async function killBuildProcess(sandboxId: string, pid: number): Promise<boolean> {
  try {
    const sbx = await connectSandbox(sandboxId)
    const handle = await sbx.commands.connect(pid)
    return await handle.kill()
  } catch {
    return false
  }
}

export interface FileTreeNode {
  id: string
  name: string
  children?: FileTreeNode[]
}

async function buildTree(sbx: Sandbox, path: string, depth: number): Promise<FileTreeNode[]> {
  if (depth === 0) return []
  try {
    const entries = await sbx.files.list(path)
    const nodes = await Promise.all(
      entries.map(async (entry) => {
        if (entry.type === "dir") {
          const children = await buildTree(sbx, entry.path, depth - 1)
          return { id: entry.path, name: entry.name, children }
        }
        return { id: entry.path, name: entry.name }
      })
    )
    return nodes.sort((a, b) => {
      const aIsDir = Array.isArray(a.children)
      const bIsDir = Array.isArray(b.children)
      if (aIsDir !== bIsDir) return aIsDir ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  } catch {
    return []
  }
}

/**
 * Returns the file tree for a sandbox starting at the given root path.
 */
export async function getSandboxFileTree(
  sbx: Sandbox,
  root = "/home/user",
): Promise<FileTreeNode[]> {
  return buildTree(sbx, root, 5)
}

/**
 * Reads the content of a file in the sandbox.
 */
export async function readSandboxFile(sbx: Sandbox, path: string): Promise<string> {
  const content = await sbx.files.read(path)
  return typeof content === "string" ? content : new TextDecoder().decode(content as Uint8Array)
}

export async function writeSandboxFile(sbx: Sandbox, path: string, content: string): Promise<void> {
  await sbx.files.write(path, content)
}

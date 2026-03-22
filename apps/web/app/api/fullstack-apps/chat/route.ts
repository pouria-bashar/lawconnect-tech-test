import { createAgentChatHandler } from "@/lib/create-agent-chat-handler";
import { getWorkflowSnapshot } from "@workspace/db/queries/mastra-workflows";
import { mastra } from "@/mastra";

export const maxDuration = 120;

const agentHandler = createAgentChatHandler("fullStackAgent");

export const GET = agentHandler.GET;

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const { threadId, messages } = body;

  if (threadId && Array.isArray(messages) && messages.length === 1) {
    const firstMsg = messages[0] as { role: string; parts?: { type: string; text: string }[]; content?: string };

    if (firstMsg?.role === "user") {
      // AI SDK v6 uses `parts`; fall back to `content` for older formats
      const prompt = Array.isArray(firstMsg.parts)
        ? firstMsg.parts.filter((p) => p.type === "text").map((p) => p.text).join(" ").trim()
        : typeof firstMsg.content === "string" ? firstMsg.content.trim() : "";

      if (prompt) {
        triggerWorkflowIfNew({ projectId: threadId, prompt }).catch((err: Error) =>
          console.error("[workflow] triggerWorkflowIfNew failed:", err),
        );
      }
    }
  }

  const newReq = new Request(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify(body),
  });

  return agentHandler.POST(newReq);
}

async function triggerWorkflowIfNew({ projectId, prompt }: { projectId: string; prompt: string }) {
  const existing = await getWorkflowSnapshot(projectId, "fullStackWorkflow");
  if (existing) return;

  const workflow = mastra.getWorkflow("fullStackWorkflow");
  const run = await workflow.createRun({ runId: projectId });
  await run.startAsync({
    inputData: { projectId, prompt, projectTitle: prompt.slice(0, 40).trim() },
  });
}

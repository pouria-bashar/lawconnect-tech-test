import { mastra } from "@/mastra";
import { NextResponse } from "next/server";
import type { Memory } from "@mastra/memory";
import type { AgentName } from "@/lib/create-agent-chat-handler";

async function getMemory(agentId: string) {
  return (await mastra.getAgent(agentId as AgentName).getMemory()) as
    | Memory
    | undefined;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");
  if (!agentId) {
    return NextResponse.json({ error: "agentId required" }, { status: 400 });
  }

  const memory = await getMemory(agentId);
  if (!memory) {
    return NextResponse.json({ threads: [] });
  }

  const result = await memory.listThreads({
    filter: { resourceId: agentId },
  });
  const sorted = [...result.threads].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return NextResponse.json({ threads: sorted });
}

export async function POST(req: Request) {
  const { agentId, threadId } = await req.json();
  if (!agentId) {
    return NextResponse.json({ error: "agentId required" }, { status: 400 });
  }

  const memory = await getMemory(agentId);
  if (!memory) {
    return NextResponse.json({ error: "no memory" }, { status: 500 });
  }

  const thread = await memory.saveThread({
    thread: {
      id: threadId,
      title: "New Chat",
      resourceId: agentId,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(thread);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");
  const agentId = searchParams.get("agentId");

  if (!threadId || !agentId) {
    return NextResponse.json(
      { error: "threadId and agentId required" },
      { status: 400 }
    );
  }

  const memory = await getMemory(agentId);
  if (!memory) {
    return NextResponse.json({ error: "no memory" }, { status: 500 });
  }

  await memory.deleteThread(threadId);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const { threadId, agentId, title, status } = await req.json();

  if (!threadId || !agentId) {
    return NextResponse.json(
      { error: "threadId and agentId required" },
      { status: 400 }
    );
  }

  const memory = await getMemory(agentId);
  if (!memory) {
    return NextResponse.json({ error: "no memory" }, { status: 500 });
  }

  const thread = await memory.updateThread({
    id: threadId,
    title: title ?? "New Chat",
    metadata: status !== undefined ? { status } : {},
  });

  return NextResponse.json(thread);
}

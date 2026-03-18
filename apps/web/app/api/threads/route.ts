import { mastra } from "@/mastra";
import { NextResponse } from "next/server";
import type { Memory } from "@mastra/memory";
import type { AgentName } from "@/lib/create-agent-chat-handler";
import { getUserId } from "@/lib/get-user-id";

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

  const page = Math.max(0, Number(searchParams.get("page") ?? 0));
  const perPage = Math.max(1, Math.min(100, Number(searchParams.get("perPage") ?? 10)));

  const userId = await getUserId();
  const resourceId = `${userId}:${agentId}`;

  const memory = await getMemory(agentId);
  if (!memory) {
    return NextResponse.json({ threads: [], hasMore: false });
  }

  const result = await memory.listThreads({
    filter: { resourceId },
    orderBy: { field: "updatedAt", direction: "DESC" },
    page,
    perPage,
  });

  return NextResponse.json({
    threads: result.threads,
    hasMore: result.threads.length === perPage,
  });
}

export async function POST(req: Request) {
  const { agentId, threadId } = await req.json();
  if (!agentId) {
    return NextResponse.json({ error: "agentId required" }, { status: 400 });
  }

  const userId = await getUserId();
  const resourceId = `${userId}:${agentId}`;

  const memory = await getMemory(agentId);
  if (!memory) {
    return NextResponse.json({ error: "no memory" }, { status: 500 });
  }

  const thread = await memory.saveThread({
    thread: {
      id: threadId,
      title: "New Chat",
      resourceId,
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

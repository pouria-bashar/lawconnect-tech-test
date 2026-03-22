import { NextResponse } from "next/server";
import { getSandbox } from "@workspace/e2b/sandbox";
import { readSandboxFile, writeSandboxFile } from "@workspace/e2b/run-claude-code";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  const projectId = searchParams.get("projectId") ?? undefined;

  if (!path) {
    return NextResponse.json({ error: "path query param required" }, { status: 400 });
  }

  try {
    const sbx = await getSandbox(projectId);
    const content = await readSandboxFile(sbx, path);
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Failed to read sandbox file:", error);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  const projectId = searchParams.get("projectId") ?? undefined;

  if (!path) {
    return NextResponse.json({ error: "path query param required" }, { status: 400 });
  }

  const { content } = await req.json();

  try {
    const sbx = await getSandbox(projectId);
    await writeSandboxFile(sbx, path, content);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to write sandbox file:", error);
    return NextResponse.json({ error: "Failed to write file" }, { status: 500 });
  }
}

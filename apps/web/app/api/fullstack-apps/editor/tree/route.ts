import { NextResponse } from "next/server";
import { getSandbox } from "@workspace/e2b/sandbox";
import { getSandboxFileTree } from "@workspace/e2b/run-claude-code";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const projectDir = searchParams.get("projectDir") ?? "/home/user";

  try {
    const sbx = await getSandbox(projectId);
    const tree = await getSandboxFileTree(sbx, projectDir);
    return NextResponse.json({ tree });
  } catch (error) {
    console.error("Failed to list sandbox files:", error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}

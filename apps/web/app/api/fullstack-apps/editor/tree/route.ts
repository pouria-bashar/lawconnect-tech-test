import { NextResponse } from "next/server";
import { getSandbox } from "@workspace/e2b/sandbox";
import { getSandboxFileTree } from "@workspace/e2b/run-claude-code";

export async function GET() {
  try {
    const sbx = await getSandbox();
    const tree = await getSandboxFileTree(sbx);
    return NextResponse.json({ tree });
  } catch (error) {
    console.error("Failed to list sandbox files:", error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}

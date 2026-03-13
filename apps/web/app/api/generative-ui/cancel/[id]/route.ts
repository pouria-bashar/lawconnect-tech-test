import { processRegistry } from "@workspace/e2b/process-registry";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const killed = await processRegistry.kill(id);
  return NextResponse.json({ killed });
}

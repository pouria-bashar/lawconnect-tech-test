import { runCode } from "@workspace/e2b/run-code";
import { NextResponse } from "next/server";

export const maxDuration = 120;

export async function POST(req: Request) {
  const { code } = await req.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json(
      { error: "code is required and must be a string" },
      { status: 400 },
    );
  }

  try {
    const result = await runCode(code);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to run test";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

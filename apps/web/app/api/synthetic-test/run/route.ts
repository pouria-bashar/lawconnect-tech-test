import { runCode } from "@/lib/e2b/run-code";
import { getTestById } from "@workspace/db/queries/synthetic-test";
import { saveTestReport } from "@workspace/db/queries/synthetic-test";
import { NextResponse } from "next/server";

export const maxDuration = 120;

export async function POST(req: Request) {
  const { testId } = await req.json();

  if (!testId || typeof testId !== "string") {
    return NextResponse.json(
      { error: "testId is required and must be a string" },
      { status: 400 },
    );
  }

  const test = await getTestById(testId);
  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  try {
    const result = await runCode(test.code);

    const report = await saveTestReport({
      testId: test.id,
      status: result.status,
      logs: result.logs,
      errors: result.errors,
      durationMs: result.durationMs,
      triggerType: "manual",
    });

    return NextResponse.json({ ...result, reportId: report.id });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to run test";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

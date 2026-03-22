import { NextResponse } from "next/server";
import { mastra } from "@/mastra";
import { designStep } from "@/mastra/workflows/full-stack-workflow";

export const maxDuration = 30;

export async function POST(req: Request): Promise<Response> {
  const { projectId, action, feedback, screenId, variantPrompt } =
    await req.json();

  if (!projectId || !action) {
    return new Response("projectId and action are required", { status: 400 });
  }

  const workflow = mastra.getWorkflow("fullStackWorkflow");
  const run = await workflow.createRun({ runId: projectId });

  run
    .resume({
      step: designStep,
      resumeData: { action, feedback, screenId, variantPrompt },
    })
    .catch((err: Error) =>
      console.error("fullStackWorkflow: resume failed", err),
    );

  return NextResponse.json({ ok: true });
}

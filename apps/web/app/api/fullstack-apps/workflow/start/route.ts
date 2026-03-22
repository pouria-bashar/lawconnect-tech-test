import { NextResponse } from "next/server";
import { mastra } from "@/mastra";

export const maxDuration = 30;

export async function POST(req: Request): Promise<Response> {
  const { projectId, prompt, projectTitle } = await req.json();

  if (!projectId || !prompt) {
    return new Response("projectId and prompt are required", { status: 400 });
  }

  const workflow = mastra.getWorkflow("fullStackWorkflow");
  const run = await workflow.createRun({ runId: projectId });

  run
    .startAsync({
      inputData: {
        projectId,
        prompt,
        projectTitle: projectTitle || prompt.slice(0, 40).trim(),
      },
    })
    .catch((err: Error) =>
      console.error("fullStackWorkflow: startAsync failed", err),
    );

  return NextResponse.json({ runId: projectId });
}

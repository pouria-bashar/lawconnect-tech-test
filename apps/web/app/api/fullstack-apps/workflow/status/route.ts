import { NextResponse } from "next/server";
import { getWorkflowSnapshot, type WorkflowSnapshot } from "@workspace/db/queries/mastra-workflows";

type WorkflowPhase =
  | "setup"
  | "design"
  | "design_suspended"
  | "planning"
  | "implementation"
  | "completed"
  | null;

function derivePhase(snapshot: WorkflowSnapshot): WorkflowPhase {
  const ctx = snapshot.context ?? {};
  const setup = ctx["setup"];
  const design = ctx["design"];
  const planning = ctx["planning"];
  const impl = ctx["implementation"];

  if (impl?.status === "success") return "completed";
  if (planning?.status === "success" || impl?.status === "running") return "implementation";
  if (design?.status === "success" || planning?.status === "running") return "planning";
  if (design?.status === "suspended") return "design_suspended";
  if (setup?.status === "success" || design?.status === "running") return "design";
  return "setup";
}

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return new Response("projectId is required", { status: 400 });
  }

  const snapshot = await getWorkflowSnapshot(projectId, "fullStackWorkflow");

  if (!snapshot) {
    return NextResponse.json({ phase: null, plan: null, jobId: null });
  }

  const phase = derivePhase(snapshot);
  const ctx = snapshot.context ?? {};
  const plan = (ctx["planning"]?.output?.["plan"] as string) ?? null;
  const jobId = (ctx["implementation"]?.output?.["jobId"] as string) ?? null;
  const projectDir = (ctx["setup"]?.output?.["projectDir"] as string) ?? null;

  return NextResponse.json({ phase, plan, jobId, projectDir });
}

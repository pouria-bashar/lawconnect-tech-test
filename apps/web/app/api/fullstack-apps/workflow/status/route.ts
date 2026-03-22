import { NextResponse } from "next/server";
import { getWorkflowSnapshot, type WorkflowSnapshot } from "@workspace/db/queries/mastra-workflows";

type WorkflowPhase =
  | "design"
  | "design_suspended"
  | "planning"
  | "implementation"
  | "completed"
  | null;

function derivePhase(snapshot: WorkflowSnapshot): WorkflowPhase {
  const steps = snapshot.steps ?? {};
  const design = steps["design"];
  const planning = steps["planning"];
  const impl = steps["implementation"];

  if (impl?.status === "success") return "completed";
  if (planning?.status === "success" || impl?.status === "running") return "implementation";
  if (design?.status === "success" || planning?.status === "running") return "planning";
  if (design?.status === "suspended") return "design_suspended";
  return "design";
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
  const plan = (snapshot.steps?.["planning"]?.output?.["plan"] as string) ?? null;
  const jobId = (snapshot.steps?.["implementation"]?.output?.["jobId"] as string) ?? null;

  return NextResponse.json({ phase, plan, jobId });
}

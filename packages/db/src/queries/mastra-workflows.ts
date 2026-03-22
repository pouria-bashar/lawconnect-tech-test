import { sql } from "drizzle-orm";
import { db } from "@workspace/db";

type SnapshotStepResult = {
  status: "success" | "failed" | "suspended" | "running" | "waiting" | "skipped";
  output?: Record<string, unknown>;
};

export type WorkflowSnapshot = {
  status: string;
  steps?: Record<string, SnapshotStepResult>;
};

export async function getWorkflowSnapshot(
  projectId: string,
  workflowName: string,
): Promise<WorkflowSnapshot | null> {
  const rows = await db.execute(
    sql`SELECT snapshot FROM mastra.mastra_workflow_snapshot WHERE run_id = ${projectId} AND workflow_name = ${workflowName} LIMIT 1`,
  );

  if (!rows.length) return null;
  return (rows[0] as { snapshot: WorkflowSnapshot }).snapshot;
}

export async function hasWorkflowSnapshot(
  projectId: string,
  workflowName: string,
): Promise<boolean> {
  const rows = await db.execute(
    sql`SELECT 1 FROM mastra.mastra_workflow_snapshot WHERE run_id = ${projectId} AND workflow_name = ${workflowName} LIMIT 1`,
  );
  return rows.length > 0;
}

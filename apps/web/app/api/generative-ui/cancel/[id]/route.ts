import { NextResponse } from "next/server";
import { getBuildJob, updateBuildJob } from "@workspace/db/queries/build-jobs";
import { killBuildProcess } from "@workspace/e2b/run-claude-code";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const job = await getBuildJob(id);

  if (!job) {
    return NextResponse.json({ killed: false, error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "running") {
    return NextResponse.json({ killed: false, error: "Job is not running" });
  }

  // Kill via E2B API
  const killed = await killBuildProcess(job.sandboxId, job.pid);

  if (killed) {
    await updateBuildJob(id, { status: "cancelled" });
  }

  return NextResponse.json({ killed });
}

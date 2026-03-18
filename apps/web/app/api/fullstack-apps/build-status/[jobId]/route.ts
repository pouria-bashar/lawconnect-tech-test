import { NextResponse } from "next/server";
import { getBuildJob, updateBuildJob } from "@workspace/db/queries/build-jobs";
import { checkBuildStatus } from "@workspace/e2b/run-claude-code";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const job = await getBuildJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // If already terminal, return cached result
  if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
    return NextResponse.json({
      status: job.status,
      result: job.result,
      events: [],
      newOffset: offset,
    });
  }

  // Check live status from sandbox
  try {
    const buildStatus = await checkBuildStatus(job.sandboxId, job.pid, offset);

    // If process finished, update DB
    if (buildStatus.status !== "running") {
      await updateBuildJob(jobId, {
        status: buildStatus.status,
        result: buildStatus.result,
      });
    }

    return NextResponse.json(buildStatus);
  } catch (error) {
    console.error("Failed to check build status:", error);
    return NextResponse.json(
      { error: "Failed to check build status" },
      { status: 500 },
    );
  }
}

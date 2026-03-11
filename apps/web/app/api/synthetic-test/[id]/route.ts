import {
  getTestById,
  updateTest,
  deleteTest,
  scheduleCronJob,
  unscheduleCronJob,
} from "@workspace/db/queries/synthetic-test";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const test = await getTestById(id);
  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }
  return NextResponse.json(test);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const test = await getTestById(id);
  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  const updated = await updateTest(id, {
    ...(body.name !== undefined && { name: body.name }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.code !== undefined && { code: body.code }),
    ...(body.cron !== undefined && { cron: body.cron }),
    ...(body.paused !== undefined && { paused: body.paused }),
  });

  // Handle cron scheduling changes
  const cronChanged = body.cron !== undefined && body.cron !== test.cron;
  const pausedChanged = body.paused !== undefined && body.paused !== test.paused;

  if (cronChanged || pausedChanged) {
    const effectivePaused = (body.paused ?? test.paused) === "true";
    const effectiveCron = body.cron ?? test.cron;

    if (effectivePaused || !effectiveCron) {
      await unscheduleCronJob(id);
    } else {
      await scheduleCronJob(id, effectiveCron);
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const test = await getTestById(id);
  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  await unscheduleCronJob(id);
  await deleteTest(id);

  return NextResponse.json({ success: true });
}

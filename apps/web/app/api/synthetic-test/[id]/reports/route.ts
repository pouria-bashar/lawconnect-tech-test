import { listTestReports } from "@workspace/db/queries/synthetic-test";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? "20");
  const offset = Number(searchParams.get("offset") ?? "0");

  const reports = await listTestReports(id, { limit, offset });
  return NextResponse.json(reports);
}

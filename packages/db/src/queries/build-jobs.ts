import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  buildJobs,
  type InsertBuildJob,
  type SelectBuildJob,
} from "@workspace/db/schema/build-jobs";

export type { SelectBuildJob };

export async function createBuildJob(
  data: Omit<InsertBuildJob, "id" | "createdAt" | "updatedAt">,
): Promise<SelectBuildJob> {
  const [job] = await db.insert(buildJobs).values(data).returning();
  return job!;
}

export async function getBuildJob(
  id: string,
): Promise<SelectBuildJob | undefined> {
  const [job] = await db
    .select()
    .from(buildJobs)
    .where(eq(buildJobs.id, id))
    .limit(1);
  return job;
}

export async function updateBuildJob(
  id: string,
  data: Partial<Pick<InsertBuildJob, "status" | "result">>,
): Promise<void> {
  await db
    .update(buildJobs)
    .set(data)
    .where(eq(buildJobs.id, id));
}

import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  stitchProjects,
  type InsertStitchProject,
  type SelectStitchProject,
} from "@workspace/db/schema/fullstack-apps";

export type { SelectStitchProject };

export async function saveStitchProject(
  data: Pick<InsertStitchProject, "projectId" | "stitchProjectId" | "title">,
): Promise<SelectStitchProject> {
  const [record] = await db
    .insert(stitchProjects)
    .values(data)
    .onConflictDoUpdate({
      target: stitchProjects.projectId,
      set: {
        stitchProjectId: data.stitchProjectId,
        title: data.title,
        updatedAt: new Date(),
      },
    })
    .returning();
  return record!;
}

export async function getStitchProjectByProjectId(
  projectId: string,
): Promise<SelectStitchProject | undefined> {
  const [record] = await db
    .select()
    .from(stitchProjects)
    .where(eq(stitchProjects.projectId, projectId))
    .limit(1);
  return record;
}


import { desc, arrayContains } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  leads,
  lawyers,
  type InsertLead,
  type SelectLead,
  type SelectLawyer,
} from "@workspace/db/schema/lead-capture";

export async function saveLead(
  data: Omit<InsertLead, "id" | "createdAt" | "updatedAt">,
): Promise<SelectLead> {
  const [lead] = await db.insert(leads).values(data).returning();
  return lead!;
}

export async function findLawyersByIssueType(
  issueType: string,
): Promise<SelectLawyer[]> {
  let results = await db
    .select()
    .from(lawyers)
    .where(arrayContains(lawyers.issueTypes, [issueType]))
    .orderBy(desc(lawyers.rating))
    .limit(3);

  if (results.length === 0) {
    results = await db
      .select()
      .from(lawyers)
      .where(arrayContains(lawyers.issueTypes, ["general"]))
      .orderBy(desc(lawyers.rating))
      .limit(3);
  }

  return results;
}

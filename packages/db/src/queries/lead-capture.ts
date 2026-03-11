import { eq, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  leads,
  type InsertLead,
  type SelectLead,
} from "@workspace/db/schema/lead-capture";

export async function saveLead(
  data: Omit<InsertLead, "id" | "createdAt" | "updatedAt">,
): Promise<SelectLead> {
  const [lead] = await db.insert(leads).values(data).returning();
  return lead!;
}

export async function getLeadById(
  id: string,
): Promise<SelectLead | undefined> {
  const [lead] = await db.select().from(leads).where(eq(leads.id, id));
  return lead;
}

export async function listLeads(
  options: { limit?: number; offset?: number } = {},
): Promise<SelectLead[]> {
  const { limit = 20, offset = 0 } = options;
  return db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateLead(
  id: string,
  data: Partial<Omit<InsertLead, "id" | "createdAt" | "updatedAt">>,
): Promise<SelectLead | undefined> {
  const [lead] = await db
    .update(leads)
    .set(data)
    .where(eq(leads.id, id))
    .returning();
  return lead!;
}

export async function deleteLead(id: string): Promise<void> {
  await db.delete(leads).where(eq(leads.id, id));
}

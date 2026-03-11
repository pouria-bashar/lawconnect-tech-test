import { eq, desc } from "drizzle-orm";
import { db } from "../index.js";
import {
  tests,
  testReports,
  type InsertTest,
  type SelectTest,
  type InsertTestReport,
  type SelectTestReport,
} from "../schema/synthetic-test.js";

// --- Tests ---

export async function saveTest(
  data: Omit<InsertTest, "id" | "createdAt" | "updatedAt">,
): Promise<SelectTest> {
  const [test] = await db.insert(tests).values(data).returning();
  return test!;
}

export async function getTestById(
  id: string,
): Promise<SelectTest | undefined> {
  const [test] = await db.select().from(tests).where(eq(tests.id, id));
  return test;
}

export async function listTests(
  options: { limit?: number; offset?: number } = {},
): Promise<SelectTest[]> {
  const { limit = 20, offset = 0 } = options;
  return db
    .select()
    .from(tests)
    .orderBy(desc(tests.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateTest(
  id: string,
  data: Partial<Omit<InsertTest, "id" | "createdAt" | "updatedAt">>,
): Promise<SelectTest | undefined> {
  const [test] = await db
    .update(tests)
    .set(data)
    .where(eq(tests.id, id))
    .returning();
  return test!;
}

export async function deleteTest(id: string): Promise<void> {
  await db.delete(tests).where(eq(tests.id, id));
}

// --- Test Reports ---

export async function saveTestReport(
  data: Omit<InsertTestReport, "id" | "createdAt">,
): Promise<SelectTestReport> {
  const [report] = await db.insert(testReports).values(data).returning();
  return report!;
}

export async function listTestReports(
  testId: string,
  options: { limit?: number; offset?: number } = {},
): Promise<SelectTestReport[]> {
  const { limit = 20, offset = 0 } = options;
  return db
    .select()
    .from(testReports)
    .where(eq(testReports.testId, testId))
    .orderBy(desc(testReports.createdAt))
    .limit(limit)
    .offset(offset);
}

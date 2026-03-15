import {
  pgSchema,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const buildJobsSchema = pgSchema("build_jobs");

export const buildJobs = buildJobsSchema.table("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  pid: integer("pid").notNull(),
  sandboxId: text("sandbox_id").notNull(),
  status: text("status").notNull().default("running"), // running | completed | failed | cancelled
  result: jsonb("result"), // RunResult when completed
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type InsertBuildJob = typeof buildJobs.$inferInsert;
export type SelectBuildJob = typeof buildJobs.$inferSelect;

import {
  pgSchema,
  text,
  timestamp,
  uuid,
  real,
} from "drizzle-orm/pg-core";

export const syntheticTestSchema = pgSchema("synthetic_test");

export const tests = syntheticTestSchema.table("tests", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code").notNull(),
  cron: text("cron"),
  paused: text("paused").notNull().default("false"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const testReports = syntheticTestSchema.table("test_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  testId: uuid("test_id")
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  logs: text("logs"),
  errors: text("errors"),
  durationMs: real("duration_ms"),
  triggerType: text("trigger_type").notNull().default("manual"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type InsertTest = typeof tests.$inferInsert;
export type SelectTest = typeof tests.$inferSelect;
export type InsertTestReport = typeof testReports.$inferInsert;
export type SelectTestReport = typeof testReports.$inferSelect;

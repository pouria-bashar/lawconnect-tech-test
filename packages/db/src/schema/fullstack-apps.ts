import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const fullstackAppsSchema = pgSchema("fullstack_apps");

export const stitchProjects = fullstackAppsSchema.table("stitch_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: text("project_id").notNull().unique(),
  stitchProjectId: text("stitch_project_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type InsertStitchProject = typeof stitchProjects.$inferInsert;
export type SelectStitchProject = typeof stitchProjects.$inferSelect;


import { pgSchema, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export const blogSchema = pgSchema("blog");

export const posts = blogSchema.table("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: jsonb("content").notNull(),
  authorId: uuid("author_id"),
  tags: text("tags").array().notNull().default([]),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type InsertPost = typeof posts.$inferInsert;
export type SelectPost = typeof posts.$inferSelect;

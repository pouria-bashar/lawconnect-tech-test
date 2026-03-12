import { pgSchema, text, timestamp, uuid, jsonb, real } from "drizzle-orm/pg-core";

export const leadCaptureSchema = pgSchema("lead_capture");

export const leads = leadCaptureSchema.table("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  legalArea: text("legal_area"),
  description: text("description"),
  intakeData: jsonb("intake_data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type InsertLead = typeof leads.$inferInsert;
export type SelectLead = typeof leads.$inferSelect;

export const lawyers = leadCaptureSchema.table("lawyers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  issueTypes: text("issue_types").array().notNull(),
  rating: real("rating").notNull().default(0),
  location: text("location").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  bio: text("bio").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type InsertLawyer = typeof lawyers.$inferInsert;
export type SelectLawyer = typeof lawyers.$inferSelect;

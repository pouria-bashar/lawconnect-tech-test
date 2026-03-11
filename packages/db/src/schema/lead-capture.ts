import { pgSchema, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

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

import {
  pgTable,
  uuid,
  text,
  varchar,
  real,
  timestamp,
} from "drizzle-orm/pg-core";

export const lawyers = pgTable("lawyers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  specialty: varchar("specialty", { length: 255 }).notNull(),
  rating: real("rating").default(0),
  location: varchar("location", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Lawyer = typeof lawyers.$inferSelect;
export type NewLawyer = typeof lawyers.$inferInsert;

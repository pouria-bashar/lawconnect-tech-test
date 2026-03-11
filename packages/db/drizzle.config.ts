import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/*",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Each feature uses its own Postgres schema (not the public schema).
  // Drizzle will automatically pick up the schema names from pgSchema() calls.
});

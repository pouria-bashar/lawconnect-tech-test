import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as leadCaptureSchema from "./schema/lead-capture.js";
import * as blogSchema from "./schema/blog.js";
import * as syntheticTestSchema from "./schema/synthetic-test.js";

const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle({
  client,
  schema: {
    ...leadCaptureSchema,
    ...blogSchema,
    ...syntheticTestSchema,
  },
});

// Re-export schemas for direct use
export { leadCaptureSchema, blogSchema, syntheticTestSchema };

// Re-export the drizzle instance type
export type Database = typeof db;

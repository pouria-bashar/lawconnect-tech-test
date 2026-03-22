import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as leadCaptureSchema from "./schema/lead-capture";
import * as blogSchema from "./schema/blog";
import * as syntheticTestSchema from "./schema/synthetic-test";
import * as buildJobsSchema from "./schema/build-jobs";
import * as fullstackAppsSchema from "./schema/fullstack-apps";

// Disable prefetch as it is not supported for Supabase "Transaction" pool mode
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle({
  client,
  schema: {
    ...leadCaptureSchema,
    ...blogSchema,
    ...syntheticTestSchema,
    ...buildJobsSchema,
    ...fullstackAppsSchema,
  },
});

// Re-export schemas for direct use
export { leadCaptureSchema, blogSchema, syntheticTestSchema, buildJobsSchema, fullstackAppsSchema };

// Re-export the drizzle instance type
export type Database = typeof db;

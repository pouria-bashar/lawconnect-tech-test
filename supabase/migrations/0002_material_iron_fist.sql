CREATE SCHEMA "build_jobs";
--> statement-breakpoint
CREATE TABLE "build_jobs"."jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pid" integer NOT NULL,
	"sandbox_id" text NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"result" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

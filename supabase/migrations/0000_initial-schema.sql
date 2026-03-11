CREATE SCHEMA "blog";
--> statement-breakpoint
CREATE SCHEMA "lead_capture";
--> statement-breakpoint
CREATE SCHEMA "synthetic_test";
--> statement-breakpoint
CREATE TABLE "blog"."posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"author_id" uuid,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_capture"."leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"legal_area" text,
	"description" text,
	"intake_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "synthetic_test"."test_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"status" text NOT NULL,
	"logs" text,
	"errors" text,
	"duration_ms" real,
	"trigger_type" text DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "synthetic_test"."tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"code" text NOT NULL,
	"cron" text,
	"paused" text DEFAULT 'false' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "synthetic_test"."test_reports" ADD CONSTRAINT "test_reports_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "synthetic_test"."tests"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- Grant permissions on custom schemas for Supabase roles
GRANT USAGE ON SCHEMA blog TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA blog TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA blog TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA blog TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA blog GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA blog GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA blog GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
--> statement-breakpoint
GRANT USAGE ON SCHEMA lead_capture TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA lead_capture TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA lead_capture TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA lead_capture TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA lead_capture GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA lead_capture GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA lead_capture GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
--> statement-breakpoint
GRANT USAGE ON SCHEMA synthetic_test TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA synthetic_test TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA synthetic_test TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA synthetic_test TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA synthetic_test GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA synthetic_test GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA synthetic_test GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
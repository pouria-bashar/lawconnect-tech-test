CREATE TABLE "lead_capture"."lawyers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"specialty" text NOT NULL,
	"issue_types" text[] NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"location" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"bio" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

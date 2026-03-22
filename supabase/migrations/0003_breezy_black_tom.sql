CREATE SCHEMA "fullstack_apps";
--> statement-breakpoint
CREATE TABLE "fullstack_apps"."stitch_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"stitch_project_id" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stitch_projects_project_id_unique" UNIQUE("project_id")
);

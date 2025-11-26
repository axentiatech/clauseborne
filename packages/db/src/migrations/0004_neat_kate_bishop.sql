CREATE TABLE "fdcpa_violations" (
	"id" text PRIMARY KEY NOT NULL,
	"document_name" text DEFAULT 'Untitled',
	"user_id" text NOT NULL,
	"document_url" text NOT NULL,
	"document_content" text,
	"violations" jsonb,
	"letter_content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fdcpa_violations" ADD CONSTRAINT "fdcpa_violations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
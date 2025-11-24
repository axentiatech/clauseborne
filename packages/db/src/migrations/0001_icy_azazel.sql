CREATE TABLE "answer_lawsuit" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"document_url" text NOT NULL,
	"document_content" text,
	"allegations" jsonb,
	"questionnaire" jsonb,
	"draft_content" text
);
--> statement-breakpoint
ALTER TABLE "answer_lawsuit" ADD CONSTRAINT "answer_lawsuit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "answer_lawsuit" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "answer_lawsuit" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;
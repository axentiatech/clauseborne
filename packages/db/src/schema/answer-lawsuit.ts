import { jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const answerLawsuit = pgTable("answer_lawsuit", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  document_url: text("document_url").notNull(),
  document_content: text("document_content"),
  allegations: jsonb("allegations"),
  questionnaire: jsonb("questionnaire"),
  draft_content: text("draft_content"),
});

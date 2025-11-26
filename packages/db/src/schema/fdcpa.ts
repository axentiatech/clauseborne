import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const fdcpaViolations = pgTable("fdcpa_violations", {
  id: text("id").primaryKey(),
  document_name: text("document_name").default("Untitled"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  document_url: text("document_url").notNull(),
  document_content: text("document_content"),
  violations: jsonb("violations").$type<Violation[]>(),
  letter: text("letter_content"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type Violation = {
  fdcpaSection: string;
  quote: string;
  explanation: string;
  confidence: "High" | "Medium" | "Low";
};

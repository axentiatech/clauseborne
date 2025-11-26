import { createTRPCRouter, protectedProcedure } from "..";
import { upload } from "../lib/file";
import { ocr } from "../lib/ocr";
import { createSchema } from "../schema/project";
import {
  extractViolationsPrompt,
  generateDraftPrompt,
  generateLetterPrompt,
} from "../lib/prompts";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { db } from "@iam-pro-say/db";
import { fdcpaViolations } from "@iam-pro-say/db/schema/fdcpa";
import { eq, desc } from "drizzle-orm";
import { generateDraftSchema } from "../schema/answer-lawsuit";
import { extractViolationsSchema, generateLetterSchema } from "../schema/fdcpa";

export const fdcpaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ input, ctx }) => {
      const { url } = await upload(input.base64, input.name);

      const ocrResult = await ocr(url);

      const context = ocrResult.pages.map((page) => page.markdown).join("\n");

      const id = crypto.randomUUID();

      await db.insert(fdcpaViolations).values({
        id,
        document_name: input.name,
        userId: ctx.session.user.id,
        document_url: url,
        document_content: context,
      });

      return {
        id,
        ocrResult,
        context,
        url,
      };
    }),

  extractViolations: protectedProcedure
    .input(extractViolationsSchema)
    .mutation(async ({ input }) => {
      const { context, id } = input;

      const prompt = extractViolationsPrompt({ context });
      const result = await generateObject({
        model: openai("gpt-4.1"),
        prompt: prompt,
        schema: z.object({
          violations: z.array(
            z.object({
              fdcpaSection: z
                .string()
                .describe("FDCPA Section violated (e.g., §1692e(4), §1692d)"),
              quote: z.string().describe("Exact quote from letter as evidence"),
              explanation: z
                .string()
                .describe("Brief explanation of the violation"),
              confidence: z
                .enum(["High", "Medium", "Low"])
                .describe("Confidence level"),
            })
          ),
        }),
      });

      await db
        .update(fdcpaViolations)
        .set({
          violations: result.object.violations,
        })
        .where(eq(fdcpaViolations.id, id));

      return result.object;
    }),

  generateLetter: protectedProcedure
    .input(generateLetterSchema)
    .mutation(async ({ input }) => {
      const { violations, context, id } = input;

      const prompt = generateLetterPrompt({ violations, context });

      const result = await generateText({
        model: openai("gpt-4.1"),
        prompt: prompt,
      });

      await db
        .update(fdcpaViolations)
        .set({
          letter: result.text,
        })
        .where(eq(fdcpaViolations.id, id));

      return result.text;
    }),

  generateDraft: protectedProcedure
    .input(generateDraftSchema)
    .mutation(async ({ input }) => {
      const { id, allegations, questionnaire } = input;

      const [pdf_content] = await db
        .select({ document_content: fdcpaViolations.document_content })
        .from(fdcpaViolations)
        .where(eq(fdcpaViolations.id, id));

      const prompt = generateDraftPrompt({
        allegations,
        questionnaire,
        pdf_content: pdf_content?.document_content ?? "",
      });
      const result = await generateText({
        model: openai("gpt-4.1"),
        prompt: prompt,
      });

      await db
        .update(fdcpaViolations)
        .set({
          letter: result.text,
        })
        .where(eq(fdcpaViolations.id, id));

      return result.text;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { id } = input;

      const [row] = await db
        .select({
          document_url: fdcpaViolations.document_url,
          document_content: fdcpaViolations.document_content,
          allegations: fdcpaViolations.violations,
        })
        .from(fdcpaViolations)
        .where(eq(fdcpaViolations.id, id));

      return row ?? null;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const lawsuits = await db
      .select()
      .from(fdcpaViolations)
      .where(eq(fdcpaViolations.userId, ctx.session.user.id))
      .orderBy(desc(fdcpaViolations.created_at));

    return lawsuits;
  }),
});

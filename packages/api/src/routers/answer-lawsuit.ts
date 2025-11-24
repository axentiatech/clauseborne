import { createTRPCRouter, protectedProcedure } from "..";
import { upload } from "../lib/file";
import { ocr } from "../lib/ocr";
import { createSchema } from "../schema/project";
import { extractAllegationsSchema } from "../schema/answer-lawsuit";
import { extractAllegationsPrompt, generateDraftPrompt } from "../lib/prompts";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { db } from "@iam-pro-say/db";
import { answerLawsuit } from "@iam-pro-say/db/schema/answer-lawsuit";
import { eq } from "drizzle-orm";
import { generateDraftSchema } from "../schema/answer-lawsuit";

export const answerLawsuitRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ input, ctx }) => {
      const { url } = await upload(input.base64, input.name);

      const ocrResult = await ocr(url);

      const context = ocrResult.pages.map((page) => page.markdown).join("\n");

      const id = crypto.randomUUID();
      await db.insert(answerLawsuit).values({
        id,
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

  extractAllegations: protectedProcedure
    .input(extractAllegationsSchema)
    .mutation(async ({ input }) => {
      const { context, id } = input;

      const prompt = extractAllegationsPrompt({ context });
      const result = await generateObject({
        model: openai("gpt-4.1"),
        prompt: prompt,
        schema: z.object({
          allegations: z.array(
            z.object({
              id: z.number().describe("The id of the allegation"),
              text: z
                .string()
                .describe("The text of the allegation from the context"),
            })
          ),
        }),
      });

      await db
        .update(answerLawsuit)
        .set({
          allegations: result.object.allegations,
        })
        .where(eq(answerLawsuit.id, id));

      return result.object.allegations;
    }),

  generateDraft: protectedProcedure
    .input(generateDraftSchema)
    .mutation(async ({ input }) => {
      const { id, allegations, questionnaire } = input;

      const [pdf_content] = await db
        .select({ document_content: answerLawsuit.document_content })
        .from(answerLawsuit)
        .where(eq(answerLawsuit.id, id));

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
        .update(answerLawsuit)
        .set({
          draft_content: result.text,
        })
        .where(eq(answerLawsuit.id, id));

      return result.text;
    }),
});

import { createTRPCRouter, protectedProcedure } from "..";
import { upload } from "../lib/file";
import { ocr } from "../lib/ocr";
import {
  analyzeInputSchema,
  analyzeSchema,
  coverLetterSchema,
  createSchema,
} from "../schema/project";
import { generateObject, generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
// import { openai } from "@ai-sdk/openai";
import { coverLetterPrompt, getFdcpaPrompt } from "../lib/prompts";

export const projectRouter = createTRPCRouter({
  list: protectedProcedure.query(() => {
    return [{ id: 1, name: "Foo" }];
  }),
  create: protectedProcedure.input(createSchema).mutation(async ({ input }) => {
    const { url } = await upload(input.base64, input.name);

    const ocrResult = await ocr(url);

    const context = ocrResult.pages.map((page) => page.markdown).join("\n");

    return {
      ocrResult,
      context,
    };
  }),

  analyse: protectedProcedure
    .input(analyzeInputSchema)
    .mutation(async ({ input }) => {
      const { object } = await generateObject({
        // model: openai("gpt-4.1"),
        model: anthropic("claude-haiku-4-5"),
        output: "array",
        schema: analyzeSchema,
        temperature: 0,
        prompt: getFdcpaPrompt({ context: input.context }),
      });

      return object;
    }),

  generateCoverLetter: protectedProcedure
    .input(coverLetterSchema)
    .mutation(async ({ input }) => {
      const { analyzeInputSchema, analyzeSchema } = input;

      const prompt = coverLetterPrompt(
        analyzeSchema,
        analyzeInputSchema.context
      );

      const { text } = await generateText({
        model: anthropic("claude-haiku-4-5"),
        prompt: prompt,
      });

      return text;
    }),

  getById: protectedProcedure.query(() => {
    return {
      id: 1,
      name: "Baz",
    };
  }),
});

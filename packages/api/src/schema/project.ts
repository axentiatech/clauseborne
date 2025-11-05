import z from "zod";

export const createSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
  lastModified: z.number(),
  base64: z.string(),
});

export const analyzeInputSchema = z.object({
  context: z.string().describe("The context of the document"),
});

// for ai
export const analyzeSchema = z.object({
  violationType: z.string().describe("Type of violation"),
  violatedSection: z
    .string()
    .describe("Specific FDCPA section violated (e.g., §1692d, §1692e, §1692f)"),
  violatedQuote: z
    .string()
    .describe("Exact quote from the text that violates the FDCPA"),
  confidenceScore: z.number().describe("Confidence score between 0 and 100"),
  explaination: z.string().describe("Detailed explanation of the violation"),
});

export const coverLetterSchema = z.object({
  analyzeInputSchema,
  analyzeSchema: z.array(analyzeSchema),
});

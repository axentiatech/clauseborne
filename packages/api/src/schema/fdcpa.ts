import z from "zod";

export const generateLetterSchema = z.object({
  id: z.string(),
  violations: z.array(
    z.object({
      fdcpaSection: z
        .string()
        .describe("FDCPA Section violated (e.g., §1692e(4), §1692d)"),
      quote: z.string().describe("Exact quote from letter as evidence"),
      explanation: z.string().describe("Brief explanation of the violation"),
      confidence: z
        .enum(["High", "Medium", "Low"])
        .describe("Confidence level"),
    })
  ),
  context: z.string().describe("The context of the document"),
});

export const extractViolationsSchema = z.object({
  id: z.string().describe("The id of the document"),
  context: z.string().describe("The context of the document"),
});

export const saveLetterSchema = z.object({
  id: z.string().describe("The id of the document"),
  letter: z.string().describe("The updated letter content"),
});

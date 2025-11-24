import { z } from "zod";

export const extractAllegationsSchema = z.object({
  id: z.string().describe("The id of the answer lawsuit"),
  context: z.string().describe("The context of the document"),
});

export const generateDraftSchema = z.object({
  id: z.string().describe("The id of the answer lawsuit"),
  allegations: z
    .array(
      z.object({
        id: z.number().describe("The id of the allegation"),
        text: z.string().describe("The text of the allegation"),
      })
    )
    .describe("The allegations of the answer lawsuit"),
  questionnaire: z
    .object({
      state: z.string().describe("The state of the answer lawsuit"),
      county: z.string().describe("The county of the answer lawsuit"),
      caseNumber: z.string().describe("The case number"),
      courtName: z.string().describe("The name of the court"),
      debtAmount: z.string().describe("The debt amount claimed"),
      oweDebt: z
        .enum(["yes", "no", "partially", "unsure", ""])
        .describe("Whether the user owes the debt"),
      lastPaymentDate: z.string().describe("The last payment date"),
      properlyServed: z
        .enum(["yes", "no", "unsure", ""])
        .describe("Whether the user was properly served"),
      fdcpaViolations: z
        .object({
          illegalThreats: z.boolean(),
          falseStatements: z.boolean(),
          harassment: z.boolean(),
          earlyCalls: z.boolean(),
          employerContact: z.boolean(),
          ceaseDesistIgnored: z.boolean(),
          thirdPartyDisclosure: z.boolean(),
          miniMirandaMissing: z.boolean(),
        })
        .describe("FDCPA violations checklist"),
    })
    .describe("The questionnaire of the answer lawsuit"),
});

export type Questionnaire = z.infer<
  typeof generateDraftSchema
>["questionnaire"];

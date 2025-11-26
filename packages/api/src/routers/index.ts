import { createTRPCRouter } from "..";
import { answerLawsuitRouter } from "./answer-lawsuit";
import { fdcpaRouter } from "./fdcpa";
import { projectRouter } from "./project";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  answerLawsuit: answerLawsuitRouter,
  fdcpa: fdcpaRouter,
});
export type AppRouter = typeof appRouter;

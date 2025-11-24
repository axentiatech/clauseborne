import { createTRPCRouter } from "..";
import { answerLawsuitRouter } from "./answer-lawsuit";
import { projectRouter } from "./project";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  answerLawsuit: answerLawsuitRouter,
});
export type AppRouter = typeof appRouter;

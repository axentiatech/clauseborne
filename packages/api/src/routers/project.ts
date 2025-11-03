import { createTRPCRouter, protectedProcedure } from "..";
import { upload } from "../lib/file";
import { ocr } from "../lib/ocr";
import { createSchema } from "../schema/project";

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
  getById: protectedProcedure.query(() => {
    return {
      id: 1,
      name: "Baz",
    };
  }),
});

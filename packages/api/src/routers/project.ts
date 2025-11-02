import { createTRPCRouter, protectedProcedure } from "..";

export const projectRouter = createTRPCRouter({
  list: protectedProcedure.query(() => {
    return [{ id: 1, name: "Foo" }];
  }),
  create: protectedProcedure.mutation(async () => {
    return {
      created: "",
    };
  }),
  getById: protectedProcedure.query(() => {
    return {
      id: 1,
      name: "Baz",
    };
  }),
});

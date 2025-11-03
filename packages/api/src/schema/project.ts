import z from "zod";

export const createSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
  lastModified: z.number(),
  base64: z.string(),
});

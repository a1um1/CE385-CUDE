import { z } from "zod";

export const basicPaginationSchema = z.object({
  cursor: z.string().optional(),
  direction: z.enum(["forward", "backward"]).default("forward"),
  perPage: z.number().catch(20).default(20),
});

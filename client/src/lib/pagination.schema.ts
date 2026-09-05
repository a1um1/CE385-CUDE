import { z } from "zod";

export const basicPaginationSchema = z.object({
  cursor: z.string().optional(),
  direction: z.enum(["forward", "backward"]).optional().default("forward"),
  perPage: z.number().optional().catch(20).default(20),
});

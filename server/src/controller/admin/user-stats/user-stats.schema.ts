import { z } from "#/lib/extendZod";
import type zod from "zod";

export const userSubmissionCalendarSchema = z.object({
  date: z.string().openapi({
    example: "2026-10-23",
    description: "วันที่ส่งงาน",
  }),
  count: z.number().int().openapi({
    example: 5,
    description: "จำนวนงานที่ส่งในวันนั้น",
  }),
});

export type UserSubmissionCalendar = zod.infer<typeof userSubmissionCalendarSchema>;

export const userSubmissionCalendarListSchema = z.array(userSubmissionCalendarSchema);

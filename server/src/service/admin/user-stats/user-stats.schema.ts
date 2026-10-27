import { z } from "#/lib/extendZod";
import type zod from "zod";

export const userSubmissionCalendarSchema = z.object({
  date: z.string().openapi({
    example: "2026-10-23",
    description: "วันที่ส่งงาน",
  }),
  active: z.number().min(0).max(1).openapi({
    example: 0.5,
    description: "จำนวน submission ของวันนี้หารด้วยจำนวนสูงสุดในช่วงวันที่เลือก ปัดเป็นทศนิยม 2 ตำแหน่ง",
  }),
});

export type UserSubmissionCalendar = zod.infer<typeof userSubmissionCalendarSchema>;

export const userSubmissionCalendarListSchema = z.array(userSubmissionCalendarSchema);

import { z } from "#/lib/extendZod";
import type zod from "zod";

export const userSubmissionCalendarSchema = z.record(z.string(), z.number().min(0).max(1)).openapi({
  example: { "2026-10-23": 0.5 },
  description:
    "วันที่ส่งงานและสัดส่วนจำนวน submission ของวันนั้นเทียบกับค่าสูงสุดในช่วงวันที่เลือก " +
    "วันที่ไม่มี submission จะไม่ถูกรวมในผลลัพธ์",
});

export type UserSubmissionCalendar = zod.infer<typeof userSubmissionCalendarSchema>;

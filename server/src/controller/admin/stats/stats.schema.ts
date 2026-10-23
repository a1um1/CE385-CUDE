import { z } from "#/lib/extendZod";
import type zod from "zod";

const countPercent = z.object({
  count: z.number().int().openapi({ example: 12 }),
  percent: z.number().openapi({ example: 40, description: "0-100 ปัดทศนิยม 1 ตำแหน่ง" }),
});

export const adminCourseStatsSchema = z
  .object({
    courseID: z.string().openapi({ example: "course_id" }),
    courseName: z.string().openapi({ example: "Course Name" }),
    totalAttempts: z.number().int().openapi({ example: 30, description: "จำนวนครั้งที่เรียน" }),
    passed: countPercent,
    failed: countPercent,
    inProgress: countPercent,
    gaveUp: countPercent,

    scoreDistribution: z.array(
      z.object({
        min: z.number().openapi({ example: 0 }),
        max: z.number().openapi({ example: 10 }),
        count: z.number().int().openapi({ example: 3 }),
      }),
    ),
  })
  .openapi("AdminCourseStates");

export type AdminCourseStats = zod.infer<typeof adminCourseStatsSchema>;

export const adminCourseStatsListSchema = z.array(adminCourseStatsSchema);

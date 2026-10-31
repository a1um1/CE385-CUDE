import { z } from "#/lib/extendZod";
import type zod from "zod";

const countPercent = z.object({
  count: z.number().int().openapi({ example: 12 }),
  percent: z.number().openapi({ example: 40, description: "0-100 ปัดทศนิยม 1 ตำแหน่ง" }),
});

const statsSummaryShape = {
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
};

export const adminCourseStatsSchema = z
  .object({
    courseID: z.string().openapi({ example: "course_id" }),
    courseName: z.string().openapi({ example: "Course Name" }),
    ...statsSummaryShape,
  })
  .openapi("AdminCourseStats");

export type AdminCourseStats = zod.infer<typeof adminCourseStatsSchema>;

export const adminCourseStatsListSchema = z.array(adminCourseStatsSchema);

export const adminUnitStatsSchema = z
  .object({
    unitID: z.string().openapi({ example: "unit_id" }),
    unitName: z.string().openapi({ example: "Unit Name" }),
    courseID: z.string().openapi({ example: "course_id" }),
    ...statsSummaryShape,
  })
  .openapi("AdminUnitStats");

export type AdminUnitStats = zod.infer<typeof adminUnitStatsSchema>;

export const adminUnitStatsListSchema = z.array(adminUnitStatsSchema);

export const adminLessonStatsSchema = z
  .object({
    lessonID: z.string().openapi({ example: "lesson_id" }),
    lessonName: z.string().openapi({ example: "Lesson Name" }),
    unitID: z.string().openapi({ example: "unit_id" }),
    ...statsSummaryShape,
  })
  .openapi("AdminLessonStats");

export type AdminLessonStats = zod.infer<typeof adminLessonStatsSchema>;

export const adminLessonStatsListSchema = z.array(adminLessonStatsSchema);

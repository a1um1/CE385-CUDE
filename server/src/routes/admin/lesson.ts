// routes/lesson.ts
import LessonController from "#/controller/lesson";
import UnitController from "#/controller/unit";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

export const LessonSchema = z
  .object({
    id: z.string().openapi({ example: "lesson_id" }),
    name: z.string().openapi({ example: "lesson_name" }),
    unitID: z.uuid().openapi({ example: "unit_id" }),
    passTheshold: z.number().openapi({ example: 0.8 }),
    XPgiven: z.number().int().openapi({ example: 10 }),
    gemsGiven: z.number().int().openapi({ example: 5 }),
  })
  .openapi("Lesson");

export const LessonListResponseSchema = z.array(LessonSchema).openapi("LessonListResponse");

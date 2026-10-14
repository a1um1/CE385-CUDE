import { LessonSchema } from "#/controller/lesson/lesson.schema";
import { z } from "#/lib/extendZod";
import type zod from "zod";

export type adminLessonCreatePayload = Pick<LessonSchema, "name" | "unitID"> & {
  passThreshold: number;
  XPgiven: number;
  gemsGiven: number;
};

export const AdminLessonCreateSchema = z
  .object({
    name: z.string().openapi({ example: "Lesson Name" }),
    unitID: z.uuidv7().openapi({ example: "unit_id" }),
    passThreshold: z.number().min(0).max(1).openapi({ example: 0.75 }),
    XPgiven: z.number().int().nonnegative().openapi({ example: 100 }),
    gemsGiven: z.number().int().nonnegative().openapi({ example: 10 }),
  })
  .openapi("AdminLessonCreate") satisfies zod.ZodType<adminLessonCreatePayload>;

export type AdminLessonCreateSchema = zod.infer<typeof AdminLessonCreateSchema>;

export type adminLessonUpdatePayload = adminLessonCreatePayload;

export const AdminLessonUpdateSchema = z
  .object({
    name: z.string().openapi({ example: "Updated Lesson Name" }),
    unitID: z.uuidv7().openapi({ example: "unit_id" }),
    passThreshold: z.number().min(0).max(1).openapi({ example: 0.75 }),
    XPgiven: z.number().int().nonnegative().openapi({ example: 100 }),
    gemsGiven: z.number().int().nonnegative().openapi({ example: 10 }),
  })
  .openapi("AdminLessonUpdate") satisfies zod.ZodType<adminLessonUpdatePayload>;

export type AdminLessonUpdateSchema = zod.infer<typeof AdminLessonUpdateSchema>;

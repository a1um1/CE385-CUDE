import LessonController from "#/controller/lesson";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

export const LessonSchema = z
  .object({
    id: z.string().openapi({ example: "lesson_id" }),
    name: z.string().openapi({ example: "lesson_name" }),
    unitID: z.uuid().openapi({ example: "unit_id" }),
    passThreshold: z.number().openapi({ example: 0.8 }),
    XPgiven: z.number().int().openapi({ example: 10 }),
    gemsGiven: z.number().int().openapi({ example: 5 }),
  })
  .openapi("Lesson");

const lessonRouterInstance = new CustomRouter({
  prefix: "/lesson",
  tags: ["Lesson"],
}).get(
  "/:lessonId",
  {
    summary: "Get lessons by ID",
    params: z.object({
      lessonId: z.uuid().openapi({ example: "lesson_id" }),
    }),
    response: LessonSchema,
  },
  async ({ params }) => {
    const result = await LessonController.getById(params.lessonId);
    // แปลง Decimal -> number (passThreshold) และกรอง field ที่ไม่
    // ต้องการ (createdAt, updatedAt) ออกไป ให้ตรงกับ LessonSchema เป๊ะ
    const { id, name, unitID, passThreshold, XPgiven, gemsGiven } = result.JSON;
    return { id, name, unitID, passThreshold: Number(passThreshold), XPgiven, gemsGiven };
  },
);

export const lessonRouter = lessonRouterInstance.route;

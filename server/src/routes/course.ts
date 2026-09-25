import CourseController from "#/controller/course";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const publicCourseSchema = z
  .object({
    id: z.string().openapi({ example: "course_id" }),
    name: z.string().openapi({ example: "Course_Name" }),
    color: z.string().openapi({ example: "#FFFFF" }),
    icon: z.string().openapi({ example: "icon_name" }),
  })
  .openapi("publicCourseSchema");

const publicCourseResponseSchema = z
  .object({
    data: z.array(publicCourseSchema),
  })
  .openapi("publicCourseResponseSchema");

// Client-facing Unit shape - ย้ายมาจาก routes/unit.ts
// prefix "/course" เดียวกัน จัดรวมไว้ไฟล์เดียวให้ดูแลง่ายขึ้น
const publicUnitSchema = z
  .object({
    id: z.string().openapi({ example: "unit_id" }),
    name: z.string().openapi({ example: "unit_name" }),
    courseID: z.string().openapi({ example: "course_id" }),
  })
  .openapi("publicUnitSchema");

const publicUnitListSchema = z.array(publicUnitSchema);

const courseRouter = new CustomRouter({
  prefix: "/course",
  tags: ["Course"],
  authentication: true,
})
  .get(
    "/",
    {
      summary: "List all available courses",
      response: publicCourseResponseSchema,
    },
    async () => {
      const result = await CourseController.getAll();
      return {
        data: result.data.map(({ id, name, color, icon }) => ({ id, name, color, icon })),
      };
    },
  )
  //เรียกดูข้อมูล Course ทีละตัวด้วย courseId
  .get(
    "/:courseId",
    {
      summary: "Get course by ID",
      params: z.object({
        courseId: z.string().openapi({ example: "course_id" }),
      }),
      response: publicCourseSchema,
    },
    async ({ params }) => {
      // ใช้ CourseController.getById() เช็คว่า Course มีจริงก่อน (throw 404
      // อัตโนมัติถ้าไม่เจอ) แล้วเรียก instance method getAllUnit() ที่มีอยู่
      // แล้วในไฟล์ controller/course/course.ts ต่อได้เลย
      const course = await CourseController.getById(params.courseId);
      const { id, name, color, icon } = course.JSON;
      return { id, name, color, icon };
    },
  )
  //ย้ายมาจาก routes/unit.ts: ดู Unit ของแต่ละ Course
  .get(
    "/:courseId/unit",
    {
      summary: "List unit of a course",
      params: z.object({
        courseId: z.string().openapi({ example: "course_id" }),
      }),
      response: publicUnitListSchema,
    },
    async ({ params }) => {
      // ใช้ CourseController.getById() เช็คว่า Course มีจริงก่อน (throw 404
      // อัตโนมัติถ้าไม่เจอ) แล้วเรียก instance method getAllUnit() ต่อได้เลย
      const course = await CourseController.getById(params.courseId);
      const units = await course.getAllUnit();
      return units.map((unit) => unit.JSON);
    },
  );

export const courseRoute = courseRouter.route;

import type {
  AdminLessonCreateSchema,
  AdminLessonUpdateSchema,
  AdminLessonSchema,
  AdminLessonListResponseSchema,
  AdminLessonQuery,
} from "#/controller/admin/lesson/lesson.schema";
import { lessonQueryPayload } from "#/controller/admin/lesson/lesson.schema";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { db } from "#/lib/prisma";

export default class AdminLessonsController {
  private data: AdminLessonSchema;

  get JSON() {
    return this.data;
  }

  constructor(data: AdminLessonSchema) {
    this.data = data;
  }

  static async getById(id: string): Promise<AdminLessonsController> {
    const lesson = await db.lesson.findUnique({
      where: { id },
    });
    if (!lesson) throw new Error("Lesson not found");
    return new AdminLessonsController(lesson);
  }

  static async getPaginateLists(query: AdminLessonQuery): Promise<AdminLessonListResponseSchema> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);
    const orderBy = buildCursorOrderBy(query.sortBy, query.sortOrder, isBackward);

    // เพิ่มเงื่อนไขเฉพาะเมื่อมี unitID เพื่อให้รองรับทั้งการดูทุก Lesson และการกรองตาม Unit
    const where = query.unitID ? { unitID: query.unitID } : {};

    const lessons = await db.lesson.findMany({
      where,
      // ดึงเกินมา 1 รายการเพื่อใช้ตรวจว่ามีหน้าถัดไปหรือไม่ โดยไม่ต้อง query เพิ่ม
      take: query.perPage + 1,
      // เมื่อมี cursor ต้องข้ามรายการที่ cursor ชี้อยู่ เพราะรายการนั้นเป็นขอบเขตของหน้าปัจจุบัน
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy,
      select: lessonQueryPayload,
    });

    const hasExtraLesson = lessons.length > query.perPage;
    let nextCursor: string | undefined = undefined;
    let prevCursor: string | undefined = undefined;

    if (isBackward) {
      // ลำดับ query ถูกกลับด้านเพื่อหา Lesson ก่อนหน้า จึงต้องตัดตัวเกินและกลับลำดับก่อนส่งผลลัพธ์
      if (hasExtraLesson) prevCursor = lessons.pop()?.id;
      lessons.reverse();
      nextCursor = query.cursor;
    } else {
      if (hasExtraLesson) nextCursor = lessons.pop()?.id;
      if (query.cursor) prevCursor = query.cursor;
    }

    return {
      data: lessons,
      nextCursor,
      prevCursor,
    };
  }

  static async create(data: AdminLessonCreateSchema): Promise<AdminLessonsController> {
    const lesson = await db.lesson.create({
      data,
    });
    return new AdminLessonsController(lesson);
  }

  static async update(id: string, data: AdminLessonUpdateSchema): Promise<AdminLessonsController> {
    const lesson = await db.lesson.update({
      where: { id },
      data,
    });
    return new AdminLessonsController(lesson);
  }
}
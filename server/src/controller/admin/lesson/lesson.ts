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

    // เช็คว่ามีการส่ง unitID มาหรือไม่ ถ้ามีให้ดึงเฉพาะ Lesson ของ Unit นั้น
    const whereCondition = query.unitID ? { unitID: query.unitID } : {};

    const data = await db.lesson.findMany({
      where: whereCondition,
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy,
      select: lessonQueryPayload,
    });

    let nextCursor: string | undefined = undefined;
    let prevCursor: string | undefined = undefined;

    if (isBackward) {
      if (data.length > query.perPage) prevCursor = data.pop()?.id;
      data.reverse();
      nextCursor = query.cursor;
    } else {
      if (data.length > query.perPage) nextCursor = data.pop()?.id;
      if (query.cursor) prevCursor = query.cursor;
    }

    return {
      data,
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
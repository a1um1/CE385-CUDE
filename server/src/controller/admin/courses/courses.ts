import type {
  AdminCourseCreateSchema,
  AdminCourseSchema,
  AdminCourseListResponseSchema,
} from "#/controller/admin/courses/courses.schema";
import { courseQueryPayload } from "#/controller/admin/courses/courses.schema";
import { type BaseCursorPaginationQuery } from "#/lib/pagination.schema";
import { db } from "#/lib/prisma";

export default class AdminCoursesController {
  private data: AdminCourseSchema;

  get JSON() {
    return this.data;
  }

  constructor(data: AdminCourseSchema) {
    this.data = data;
  }

  static async getById(id: string): Promise<AdminCoursesController> {
    const course = await db.course.findUnique({
      where: { id },
    });
    if (!course) throw new Error("Course not found");
    return new AdminCoursesController(course);
  }

  static async getPaginateLists(
    query: BaseCursorPaginationQuery,
  ): Promise<AdminCourseListResponseSchema> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);

    const data = await db.course.findMany({
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy: { id: isBackward ? "asc" : "desc" },
      select: courseQueryPayload,
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

  static async create(
    data: AdminCourseCreateSchema & { createdByID: string },
  ): Promise<AdminCoursesController> {
    const course = await db.course.create({
      data,
    });
    return new AdminCoursesController(course);
  }
}

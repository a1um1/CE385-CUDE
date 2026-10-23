import type {
  AdminCourseCreateSchema,
  AdminCourseUpdateSchema,
  AdminCourseSchema,
  AdminCourseListResponseSchema,
  AdminCourseQuery,
} from "#/service/admin/courses/courses.schema";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import UserError from "#/lib/router/http/userError";
import { courseRepository } from "#/repository/course.repository";

export default class AdminCoursesService {
  private data: AdminCourseSchema;

  get JSON() {
    return this.data;
  }

  constructor(data: AdminCourseSchema) {
    this.data = data;
  }

  static async getById(id: string): Promise<AdminCoursesService> {
    const course = await courseRepository.findById(id);
    if (!course) throw new UserError(404, "Course not found");
    return new AdminCoursesService(course);
  }

  static async getPaginateLists(query: AdminCourseQuery): Promise<AdminCourseListResponseSchema> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);
    const orderBy = buildCursorOrderBy(query.sortBy, query.sortOrder, isBackward);

    const data = await courseRepository.findPage({
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy,
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
  ): Promise<AdminCoursesService> {
    // shortcut: position required by DB (no default); append after max
    const { _max } = await courseRepository.maxPosition();
    const course = await courseRepository.create({
      ...data,
      position: (_max.position ?? -1) + 1,
    });
    return new AdminCoursesService(course);
  }

  static async update(id: string, data: AdminCourseUpdateSchema): Promise<AdminCoursesService> {
    const course = await courseRepository.update(id, data);
    return new AdminCoursesService(course);
  }
}

import type {
  AdminCourseCreateSchema,
  AdminCourseUpdateSchema,
  AdminCourseSchema,
  AdminCourseListResponseSchema,
  AdminCourseQuery,
} from "#/service/admin/courses/courses.schema";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { cursorArgs, isBackward, paginate } from "#/lib/pagination";
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
    const orderBy = buildCursorOrderBy(query.sortBy, query.sortOrder, isBackward(query));
    const search = query.search?.trim();
    const where = search ? { name: { contains: search, mode: "insensitive" as const } } : undefined;
    const data = await courseRepository.findPage({ ...cursorArgs(query), orderBy, where });

    return paginate(data, query);
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

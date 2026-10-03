import type {
  AdminCourseCreateSchema,
  AdminCourseUpdateSchema,
  AdminCourseSchema,
  AdminCourseListResponseSchema,
  AdminCourseQuery,
  AdminCourseReorderSchema,
} from "#/controller/admin/courses/courses.schema";
import { courseQueryPayload } from "#/controller/admin/courses/courses.schema";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

const COURSE_ORDER_LOCK = "course:reorder";

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
    if (!course) throw new UserError(404, "Course not found");
    return new AdminCoursesController(course);
  }

  static async getPaginateLists(query: AdminCourseQuery): Promise<AdminCourseListResponseSchema> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);
    const orderBy = buildCursorOrderBy(query.sortBy, query.sortOrder, isBackward);

    const data = await db.course.findMany({
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy,
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
    // Append after the highest position actually present rather than after the
    // row count, so a new row can never land inside an existing row's slot.
    const { _max } = await db.course.aggregate({ _max: { position: true } });

    const course = await db.course.create({
      data: { ...data, position: (_max.position ?? -1) + 1 },
    });
    return new AdminCoursesController(course);
  }

  static async update(id: string, data: AdminCourseUpdateSchema): Promise<AdminCoursesController> {
    const course = await db.course.update({
      where: { id },
      data,
    });
    return new AdminCoursesController(course);
  }

  static async reorder({
    id,
    position,
  }: AdminCourseReorderSchema): Promise<AdminCoursesController> {
    const course = await db.$transaction(async (tx) => {
      // Cast to text: the function returns void, which Prisma cannot deserialise.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(1, hashtext(${COURSE_ORDER_LOCK}))::text`;

      const moved = await tx.course.findUnique({
        where: { id },
        select: { position: true },
      });
      if (!moved) throw new UserError(404, "Course not found");

      const from = moved.position;

      if (from !== position) {
        const occupant = await tx.course.findFirst({
          where: { position },
          select: { id: true },
        });
        if (!occupant) throw new UserError(400, "Position out of range");

        // Slide everything between the old and new slot along by one, including
        // the row that currently holds the new slot. Run this before the move:
        // reversing the two would put the moving row inside the range and shift
        // it a second time.
        const movingDown = position > from;
        const firstShifted = movingDown ? from + 1 : position;
        const lastShifted = movingDown ? position : from - 1;
        await tx.course.updateMany({
          where: { position: { gte: firstShifted, lte: lastShifted } },
          data: { position: { increment: movingDown ? -1 : 1 } },
        });
      }

      return tx.course.update({
        where: { id },
        data: { position },
        select: courseQueryPayload,
      });
    });

    return new AdminCoursesController(course);
  }
}

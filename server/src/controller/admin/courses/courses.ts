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
import { BY_POSITION } from "#/lib/orderBy";
import UserError from "#/lib/router/http/userError";

/**
 * Advisory-lock key for catalog reordering. Every reorder transaction takes this
 * lock, which serialises them against each other for the duration of the
 * transaction. Released automatically on commit or rollback.
 */
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

  /**
   * Moves a course to an absolute position in the catalog.
   *
   * Reordering is a read-then-write sequence, so concurrent callers could
   * otherwise both read the same sibling order and interleave their writes.
   * The advisory lock serialises the whole read-shift-write block.
   *
   * Positions are dense and equal to row indices, so a move only has to shift
   * the rows between the source and the target by one and then drop the course
   * into the vacated slot.
   */
  static async reorder({
    id,
    position,
  }: AdminCourseReorderSchema): Promise<AdminCoursesController> {
    await db.$transaction(async (tx) => {
      // Cast to text because the function returns void, which Prisma's raw
      // query cannot deserialise.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(1, hashtext(${COURSE_ORDER_LOCK}))::text`;

      // Read inside the lock, so the sibling order this decision is based on
      // cannot change before the writes land.
      const siblings = await tx.course.findMany({
        orderBy: BY_POSITION,
        select: { id: true, position: true },
      });

      const from = siblings.findIndex((sibling) => sibling.id === id);
      if (from === -1) throw new UserError(404, "Course not found");
      if (position >= siblings.length) throw new UserError(400, "Position out of range");
      if (from === position) return;

      const isDownwards = position > from;

      // Shift the rows between source and target by one, *including* the row
      // currently occupying the target: excluding it would leave the target
      // slot taken and collide with the row being moved in below.
      //
      // This statement must run first. Reversing the order would put the moving
      // row inside the range on the second pass and shift it too.
      const range = isDownwards ? { gt: from, lte: position } : { gte: position, lt: from };
      await tx.course.updateMany({
        where: { position: range },
        data: { position: { increment: isDownwards ? -1 : 1 } },
      });

      await tx.course.update({ where: { id }, data: { position } });
    });

    const course = await db.course.findUniqueOrThrow({
      where: { id },
      select: courseQueryPayload,
    });
    return new AdminCoursesController(course);
  }
}

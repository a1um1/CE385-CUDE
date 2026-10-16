import type {
  AdminExerciseListResponseSchema,
  AdminExerciseQuery,
} from "#/controller/admin/exercise/exercise.schema";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { db } from "#/lib/prisma";

export default class AdminExercisesController {
  static async getPaginateLists(
    query: AdminExerciseQuery,
  ): Promise<AdminExerciseListResponseSchema> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);
    const orderBy = buildCursorOrderBy(query.sortBy, query.sortOrder, isBackward);

    const data = await db.exercise.findMany({
      where: query.lessonID ? { lessonID: query.lessonID } : undefined,
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy,
    });

    let nextCursor: string | undefined = undefined;
    let prevCursor: string | undefined = undefined;

    const hasExtra = data.length > query.perPage;
    if (hasExtra) data.pop();
    if (isBackward) {
      data.reverse();
      if (hasExtra) prevCursor = data[0]?.id;
      nextCursor = query.cursor;
    } else {
      if (hasExtra) nextCursor = data[data.length - 1]?.id;
      if (query.cursor) prevCursor = query.cursor;
    }

    return { data, nextCursor, prevCursor };
  }
}

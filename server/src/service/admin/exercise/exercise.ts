import type {
  AdminExerciseListResponseSchema,
  AdminExerciseQuery,
  CreateAdminExercise,
  UpdateAdminExercise,
} from "#/service/admin/exercise/exercise.schema";
import type { Exercise } from "#/generated/prisma/client";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class AdminExercisesService {
  private data: Exercise;

  constructor(data: Exercise) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string): Promise<AdminExercisesService> {
    const exercise = await db.exercise.findUnique({ where: { id } });
    if (!exercise) throw new UserError(404, "Exercise not found");
    return new AdminExercisesService(exercise);
  }

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

  static async create(body: CreateAdminExercise): Promise<AdminExercisesService> {
    const lesson = await db.lesson.findUnique({ where: { id: body.lessonID } });
    if (!lesson) throw new UserError(404, "Lesson not found");

    const exercise = await db.exercise.create({
      data: { name: body.name, lessonID: body.lessonID, content: body.content },
    });
    return new AdminExercisesService(exercise);
  }

  async update(body: UpdateAdminExercise): Promise<void> {
    this.data = await db.exercise.update({
      where: { id: this.data.id },
      data: { name: body.name, content: body.content },
    });
  }
}

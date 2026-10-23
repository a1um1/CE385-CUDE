import type {
  AdminExerciseListResponseSchema,
  AdminExerciseQuery,
  CreateAdminExercise,
  UpdateAdminExercise,
} from "#/service/admin/exercise/exercise.schema";
import type { Exercise } from "#/generated/prisma/client";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { cursorArgs, isBackward, paginate } from "#/lib/pagination";
import UserError from "#/lib/router/http/userError";
import { exerciseRepository } from "#/repository/exercise.repository";
import { lessonRepository } from "#/repository/lesson.repository";

export default class AdminExercisesService {
  private data: Exercise;

  constructor(data: Exercise) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string): Promise<AdminExercisesService> {
    const exercise = await exerciseRepository.findRawById(id);
    if (!exercise) throw new UserError(404, "Exercise not found");
    return new AdminExercisesService(exercise);
  }

  static async getPaginateLists(
    query: AdminExerciseQuery,
  ): Promise<AdminExerciseListResponseSchema> {
    const orderBy = buildCursorOrderBy(query.sortBy, query.sortOrder, isBackward(query));
    const data = await exerciseRepository.findPage({
      where: query.lessonID ? { lessonID: query.lessonID } : undefined,
      ...cursorArgs(query),
      orderBy,
    });

    return paginate(data, query);
  }

  static async create(body: CreateAdminExercise): Promise<AdminExercisesService> {
    const lesson = await lessonRepository.findRawById(body.lessonID);
    if (!lesson) throw new UserError(404, "Lesson not found");

    const exercise = await exerciseRepository.create({
      name: body.name,
      lessonID: body.lessonID,
      content: body.content,
    });
    return new AdminExercisesService(exercise);
  }

  async update(body: UpdateAdminExercise): Promise<void> {
    this.data = await exerciseRepository.update(this.data.id, {
      name: body.name,
      content: body.content,
    });
  }
}

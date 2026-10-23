import ExerciseService from "#/service/exercise";
import type {
  LessonData,
  LessonCreate,
  LessonUpdate,
  PaginatedLesson,
} from "#/service/admin/lesson/lesson.schema";
import UnitService from "#/service/unit";
import UserError from "#/lib/router/http/userError";
import { lessonRepository } from "#/repository/lesson.repository";

export default class LessonService {
  private data: LessonData;

  constructor(data: LessonData) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string, include?: string | string[]): Promise<LessonService> {
    const lesson = await lessonRepository.findById(id, include);
    if (!lesson) throw new UserError(404, "Lesson not found");
    return new LessonService(lesson);
  }

  static async getByUnitIdRaw(unitID: string, include?: string | string[]): Promise<LessonData[]> {
    return await lessonRepository.findManyByUnitID(unitID, { include });
  }

  static async getByUnitId(unitID: string, include?: string | string[]): Promise<LessonService[]> {
    const lessons = await LessonService.getByUnitIdRaw(unitID, include);
    return lessons.map((lesson) => new LessonService(lesson));
  }

  /** One page of a unit's lessons, ordered by ID to keep pages stable. */
  static async getByUnitIdPaginated(
    unitID: string,
    options: { page: number; limit: number; include?: string | string[] },
  ): Promise<PaginatedLesson> {
    const { page, limit, include } = options;
    await UnitService.getById(unitID); // 404 when the unit does not exist

    const [rows, total] = await Promise.all([
      lessonRepository.findManyByUnitID(unitID, {
        include,
        orderBy: { id: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      lessonRepository.countByUnitID(unitID),
    ]);

    return {
      items: rows as LessonData[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async create(input: LessonCreate): Promise<LessonService> {
    await UnitService.getById(input.unitID); // 404 when the unit does not exist
    const lesson = await lessonRepository.create({
      name: input.name,
      unitID: input.unitID,
      passThreshold: input.passThreshold,
      XPgiven: input.XPgiven,
      gemsGiven: input.gemsGiven,
    });
    return new LessonService(lesson);
  }

  static async update(id: string, input: LessonUpdate): Promise<LessonService> {
    await LessonService.getById(id); // 404 when the lesson does not exist
    if (input.unitID) await UnitService.getById(input.unitID);
    const lesson = await lessonRepository.update(id, {
      name: input.name,
      unitID: input.unitID,
    });
    return new LessonService(lesson);
  }

  async getAllExercise() {
    return await ExerciseService.getByLessonId(this.data.id);
  }
}

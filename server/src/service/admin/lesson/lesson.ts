import ExerciseService from "#/service/exercise";
import type {
  LessonData,
  LessonCreate,
  LessonUpdate,
  PaginatedLesson,
} from "#/service/admin/lesson/lesson.schema";
import { lessonIncludes } from "#/service/admin/lesson/lesson.schema";
import UnitService from "#/service/unit";
import type { Prisma } from "#/generated/prisma/client";
import { resolveInclude } from "#/lib/include";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class LessonService {
  private data: LessonData;

  constructor(data: LessonData) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string, include?: string | string[]): Promise<LessonService> {
    const lesson = await db.lesson.findUnique({
      where: { id },
      include: resolveInclude<Prisma.LessonInclude>(include, lessonIncludes),
    });
    if (!lesson) throw new UserError(404, "Lesson not found");
    return new LessonService(lesson as LessonData);
  }

  static async getByUnitIdRaw(unitID: string, include?: string | string[]): Promise<LessonData[]> {
    const lessons = await db.lesson.findMany({
      where: { unitID },
      include: resolveInclude<Prisma.LessonInclude>(include, lessonIncludes),
    });
    return lessons as LessonData[];
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

    const where = { unitID };
    const [rows, total] = await Promise.all([
      db.lesson.findMany({
        where,
        include: resolveInclude<Prisma.LessonInclude>(include, lessonIncludes),
        orderBy: { id: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.lesson.count({ where }),
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
    const lesson = await db.lesson.create({
      data: {
        name: input.name,
        unitID: input.unitID,
        passThreshold: input.passThreshold,
        XPgiven: input.XPgiven,
        gemsGiven: input.gemsGiven,
      },
    });
    return new LessonService(lesson as LessonData);
  }

  static async update(id: string, input: LessonUpdate): Promise<LessonService> {
    await LessonService.getById(id); // 404 when the lesson does not exist
    if (input.unitID) await UnitService.getById(input.unitID);
    const lesson = await db.lesson.update({
      where: { id },
      data: { name: input.name, unitID: input.unitID },
    });
    return new LessonService(lesson as LessonData);
  }

  async getAllExercise() {
    return await ExerciseService.getByLessonId(this.data.id);
  }
}

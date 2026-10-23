import type {
  LessonData,
  LessonCreate,
  LessonUpdate,
  PaginatedLesson,
  LessonSchema,
} from "#/service/admin/lesson/lesson.schema";
import UnitService from "#/service/unit";
import UserError from "#/lib/router/http/userError";
import { lessonRepository } from "#/repository/lesson.repository";
import { client } from "#/repository/client";
import { resolveInclude } from "#/lib/include";
import { lessonIncludes } from "#/service/admin/lesson/lesson.schema";
import type { Prisma } from "#/generated/prisma/client";

export default class LessonService {
  private data: LessonData;

  constructor(data: LessonData) {
    this.data = data;
  }

  get JSON(): LessonSchema {
    return {
      ...this.data,
      passThreshold: Number(this.data.passThreshold),
    };
  }

  static async getById(id: string, include?: string | string[]): Promise<LessonService> {
    const lesson = await lessonRepository.findById(id, include);
    if (!lesson) throw new UserError(404, "Lesson not found");
    return new LessonService(lesson);
  }

  static async getByUnitIdPaginated(
    unitID: string | undefined,
    options: { page: number; limit: number; include?: string | string[] },
  ): Promise<PaginatedLesson> {
    const { page, limit, include } = options;
    if (unitID) {
      await UnitService.getById(unitID);
    }

    const where = unitID ? { unitID } : undefined;
    const [rows, total] = await Promise.all([
      client().lesson.findMany({
        where,
        include: resolveInclude<Prisma.LessonInclude>(include, lessonIncludes),
        orderBy: [{ position: "asc" }, { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      client().lesson.count({ where }),
    ]);

    return {
      items: (rows as LessonData[]).map((r) => new LessonService(r).JSON),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async create(input: LessonCreate): Promise<LessonService> {
    await UnitService.getById(input.unitID);
    const lesson = await lessonRepository.create({
      name: input.name,
      unitID: input.unitID,
      passThreshold: input.passThreshold,
      XPgiven: input.XPgiven,
      gemsGiven: input.gemsGiven,
      startAt: input.startAt,
      endAt: input.endAt,
    });
    return new LessonService(lesson);
  }

  static async update(id: string, input: LessonUpdate): Promise<LessonService> {
    await LessonService.getById(id);
    const lesson = await lessonRepository.update(id, {
      name: input.name,
      passThreshold: input.passThreshold,
      XPgiven: input.XPgiven,
      gemsGiven: input.gemsGiven,
      startAt: input.startAt,
      endAt: input.endAt,
    });
    return new LessonService(lesson);
  }
}

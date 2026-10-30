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
import { client, transaction } from "#/repository/client";
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
      prerequisiteLessonIDs: this.data.prerequisites?.map((p) => p.prerequisiteLessonID) ?? [],
    };
  }

  static async getById(id: string, include?: string | string[]): Promise<LessonService> {
    const lesson = await lessonRepository.findById(id, include);
    if (!lesson) throw new UserError(404, "Lesson not found");
    const prerequisites = await client().lessonPrerequisite.findMany({
      where: { lessonID: id },
      select: { prerequisiteLessonID: true },
    });
    return new LessonService({ ...lesson, prerequisites });
  }

  static async getByUnitIdPaginated(
    unitID: string | undefined,
    options: { page: number; limit: number; include?: string | string[]; search?: string },
  ): Promise<PaginatedLesson> {
    const { page, limit, include, search } = options;
    if (unitID) {
      await UnitService.getById(unitID);
    }

    const searchQuery = search?.trim();
    const where: Prisma.LessonWhereInput = {
      ...(unitID ? { unitID } : {}),
      ...(searchQuery ? { name: { contains: searchQuery, mode: "insensitive" as const } } : {}),
    };
    const whereFinal = Object.keys(where).length ? where : undefined;
    const [rows, total] = await Promise.all([
      client().lesson.findMany({
        where: whereFinal,
        include: {
          ...resolveInclude<Prisma.LessonInclude>(include, lessonIncludes),
          prerequisites: { select: { prerequisiteLessonID: true } },
        },
        orderBy: [{ position: "asc" }, { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      client().lesson.count({ where: whereFinal }),
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
    const { _max } = await client().lesson.aggregate({
      _max: { position: true },
      where: { unitID: input.unitID },
    });

    const lesson = await transaction(async (tx) => {
      const created = await lessonRepository.create(
        {
          name: input.name,
          unitID: input.unitID,
          passThreshold: input.passThreshold,
          XPgiven: input.XPgiven,
          gemsGiven: input.gemsGiven,
          startAt: input.startAt,
          endAt: input.endAt,
          position: (_max.position ?? -1) + 1,
        },
        tx,
      );

      if (input.prerequisiteLessonIDs && input.prerequisiteLessonIDs.length > 0) {
        await lessonRepository.setPrerequisites(created.id, input.prerequisiteLessonIDs, tx);
      }

      return created;
    });

    return new LessonService({
      ...lesson,
      prerequisites: (input.prerequisiteLessonIDs ?? []).map((id) => ({
        prerequisiteLessonID: id,
      })),
    });
  }

  static async update(id: string, input: LessonUpdate): Promise<LessonService> {
    await LessonService.getById(id);

    if (input.prerequisiteLessonIDs?.includes(id)) {
      throw new UserError(400, "A lesson cannot have itself as a prerequisite");
    }

    const lesson = await transaction(async (tx) => {
      const updated = await lessonRepository.update(
        id,
        {
          name: input.name,
          passThreshold: input.passThreshold,
          XPgiven: input.XPgiven,
          gemsGiven: input.gemsGiven,
          startAt: input.startAt,
          endAt: input.endAt,
        },
        tx,
      );

      if (input.prerequisiteLessonIDs !== undefined) {
        await lessonRepository.setPrerequisites(id, input.prerequisiteLessonIDs, tx);
      }

      return updated;
    });

    const prerequisites =
      input.prerequisiteLessonIDs !== undefined
        ? input.prerequisiteLessonIDs.map((pid) => ({ prerequisiteLessonID: pid }))
        : await client().lessonPrerequisite.findMany({
            where: { lessonID: id },
            select: { prerequisiteLessonID: true },
          });

    return new LessonService({ ...lesson, prerequisites });
  }
}

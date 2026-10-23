import LessonService from "#/service/lesson";
import type { UnitData } from "#/service/unit/unit.schema";
import { unitIncludes } from "#/service/unit/unit.schema";
import type { Prisma } from "#/generated/prisma/client";
import { resolveInclude } from "#/lib/include";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class UnitService {
  private data: UnitData;

  constructor(data: UnitData) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string, include?: string | string[]): Promise<UnitService> {
    const unit = await db.unit.findUnique({
      where: { id },
      include: resolveInclude<Prisma.UnitInclude>(include, unitIncludes),
    });
    if (!unit) throw new UserError(404, "Unit not found");
    return new UnitService(unit as UnitData);
  }

  static async getAllByCourseIdRaw(
    courseID: string,
    include?: string | string[],
  ): Promise<UnitData[]> {
    const units = await db.unit.findMany({
      where: { courseID },
      include: resolveInclude<Prisma.UnitInclude>(include, unitIncludes),
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });
    return units as UnitData[];
  }

  static async getAllByCourseId(
    courseID: string,
    include?: string | string[],
  ): Promise<UnitService[]> {
    const units = await UnitService.getAllByCourseIdRaw(courseID, include);
    return units.map((unit) => new UnitService(unit));
  }

  async getAllLesson(include?: string | string[]): Promise<LessonService[]> {
    if (this.data.lessons && include === undefined) {
      return this.data.lessons.map((lesson) => new LessonService(lesson));
    }
    return LessonService.getByUnitId(this.data.id, include);
  }
}

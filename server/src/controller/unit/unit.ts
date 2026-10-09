import CourseController from "#/controller/course";
import LessonController from "#/controller/lesson";
import type { UnitData } from "#/controller/unit/unit.schema";
import { unitIncludes } from "#/controller/unit/unit.schema";
import type { Prisma } from "#/generated/prisma/client";
import { resolveInclude } from "#/lib/include";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class UnitController {
  private data: UnitData;

  constructor(data: UnitData) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string, include?: string | string[]): Promise<UnitController> {
    const unit = await db.unit.findUnique({
      where: { id },
      include: resolveInclude<Prisma.UnitInclude>(include, unitIncludes),
    });
    if (!unit) throw new UserError(404, "Unit not found");
    return new UnitController(unit as UnitData);
  }

  static async getAllByCourseIdRaw(
    courseID: string,
    include?: string | string[],
  ): Promise<UnitData[]> {
    const units = await db.unit.findMany({
      where: { courseID },
      include: resolveInclude<Prisma.UnitInclude>(include, unitIncludes),
    });
    return units as UnitData[];
  }

  static async getAllByCourseId(
    courseID: string,
    include?: string | string[],
  ): Promise<UnitController[]> {
    const units = await UnitController.getAllByCourseIdRaw(courseID, include);
    return units.map((unit) => new UnitController(unit));
  }

  async getAllLesson(include?: string | string[]): Promise<LessonController[]> {
    if (this.data.lessons && include === undefined) {
      return this.data.lessons.map((lesson) => new LessonController(lesson));
    }
    return LessonController.getByUnitId(this.data.id, include);
  }

  async getCourse(): Promise<CourseController> {
    if (this.data.course) return new CourseController(this.data.course);
    return CourseController.getById(this.data.courseID);
  }
}

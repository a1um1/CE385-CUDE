import type { CourseData } from "#/controller/course/course.schema";
import { courseIncludes } from "#/controller/course/course.schema";
import UnitController from "#/controller/unit";
import type { Prisma } from "#/generated/prisma/client";
import { resolveInclude } from "#/lib/include";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class CourseController {
  private data: CourseData;

  constructor(data: CourseData) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string, include?: string | string[]): Promise<CourseController> {
    const course = await db.course.findUnique({
      where: { id },
      include: resolveInclude<Prisma.CourseInclude>(include, courseIncludes),
    });
    if (!course) throw new UserError(404, "Course not found");
    return new CourseController(course as CourseData);
  }

  static async getAllRaw(include?: string | string[]): Promise<CourseData[]> {
    const courses = await db.course.findMany({
      include: resolveInclude<Prisma.CourseInclude>(include, courseIncludes),
    });
    return courses as CourseData[];
  }

  static async getAll(include?: string | string[]): Promise<CourseController[]> {
    const courses = await CourseController.getAllRaw(include);
    return courses.map((course) => new CourseController(course));
  }

  async getAllUnit(include?: string | string[]): Promise<UnitController[]> {
    if (this.data.units && include === undefined) {
      return this.data.units.map((unit) => new UnitController(unit));
    }
    return UnitController.getAllByCourseId(this.data.id, include);
  }
}

import type { CourseData } from "#/service/course/course.schema";
import { courseIncludes } from "#/service/course/course.schema";
import UnitService from "#/service/unit";
import type { Prisma } from "#/generated/prisma/client";
import { resolveInclude } from "#/lib/include";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class CourseService {
  private data: CourseData;

  constructor(data: CourseData) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string, include?: string | string[]): Promise<CourseService> {
    const course = await db.course.findUnique({
      where: { id },
      include: resolveInclude<Prisma.CourseInclude>(include, courseIncludes),
    });
    if (!course) throw new UserError(404, "Course not found");
    return new CourseService(course as CourseData);
  }

  static async getAllRaw(include?: string | string[]): Promise<CourseData[]> {
    const courses = await db.course.findMany({
      include: resolveInclude<Prisma.CourseInclude>(include, courseIncludes),
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });
    return courses as CourseData[];
  }

  static async getAll(include?: string | string[]): Promise<CourseService[]> {
    const courses = await CourseService.getAllRaw(include);
    return courses.map((course) => new CourseService(course));
  }

  async getAllUnit(include?: string | string[]): Promise<UnitService[]> {
    if (this.data.units && include === undefined) {
      return this.data.units.map((unit) => new UnitService(unit));
    }
    return UnitService.getAllByCourseId(this.data.id, include);
  }
}

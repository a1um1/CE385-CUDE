import type { CourseData } from "#/service/course/course.schema";
import UnitService from "#/service/unit";
import UserError from "#/lib/router/http/userError";
import { courseRepository } from "#/repository/course.repository";

export default class CourseService {
  private data: CourseData;

  constructor(data: CourseData) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string, include?: string | string[]): Promise<CourseService> {
    const course = await courseRepository.findById(id, include);
    if (!course) throw new UserError(404, "Course not found");
    return new CourseService(course);
  }

  static async getAllRaw(include?: string | string[]): Promise<CourseData[]> {
    return await courseRepository.findAll(include);
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

import UnitController from "#/controller/unit";
import type { Course } from "#/generated/prisma/client";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class CourseController {
  private data: Course;

  constructor(data: Course) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getCourseById(id: string): Promise<CourseController> {
    const course = await db.course.findUnique({
      where: { id },
    });
    if (!course) throw new UserError(404, "Course not found");
    return new CourseController(course);
  }

  async getAllUnit() {
    return await UnitController.getAllUnitById(this.data.id);
  }
}

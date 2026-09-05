import CourseController from "#/controller/course/course";
import lesson from "#/controller/lesson/lesson";
import type { Unit } from "#/generated/prisma/client";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class UnitController {
  private data: Unit;

  constructor(data: Unit) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string): Promise<UnitController | null> {
    const unit = await db.unit.findUnique({
      where: { id },
    });
    if (!unit) throw new UserError(404, "Unit not found");
    return new UnitController(unit);
  }

  static async getAllById(id: string): Promise<UnitController[]> {
    const units = await db.unit.findMany({
      where: { courseID: id },
    });
    return units.map((unit) => new UnitController(unit));
  }

  async getAllLesson() {
    return await lesson.getByUnitId(this.data.id);
  }

  async getCourse() {
    return await CourseController.getById(this.data.courseID);
  }
}

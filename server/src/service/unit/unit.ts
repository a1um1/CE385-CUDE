import LessonService from "#/service/lesson";
import type { UnitData } from "#/service/unit/unit.schema";
import UserError from "#/lib/router/http/userError";
import { unitRepository } from "#/repository/unit.repository";

export default class UnitService {
  private data: UnitData;

  constructor(data: UnitData) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string, include?: string | string[]): Promise<UnitService> {
    const unit = await unitRepository.findById(id, include);
    if (!unit) throw new UserError(404, "Unit not found");
    return new UnitService(unit);
  }

  static async getAllByCourseIdRaw(
    courseID: string,
    include?: string | string[],
  ): Promise<UnitData[]> {
    return await unitRepository.findAllByCourseID(courseID, include);
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

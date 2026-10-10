import ExerciseController from "#/controller/exercise";
import type { LessonData } from "#/controller/lesson/lesson.schema";
import { lessonIncludes } from "#/controller/lesson/lesson.schema";
import UnitController from "#/controller/unit";
import type { Prisma } from "#/generated/prisma/client";
import { resolveInclude } from "#/lib/include";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class LessonController {
  private data: LessonData;

  constructor(data: LessonData) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string, include?: string | string[]): Promise<LessonController> {
    const lesson = await db.lesson.findUnique({
      where: { id },
      include: resolveInclude<Prisma.LessonInclude>(include, lessonIncludes),
    });
    if (!lesson) throw new UserError(404, "Lesson not found");
    return new LessonController(lesson as LessonData);
  }

  static async getByUnitIdRaw(unitID: string, include?: string | string[]): Promise<LessonData[]> {
    const lessons = await db.lesson.findMany({
      where: { unitID },
      include: resolveInclude<Prisma.LessonInclude>(include, lessonIncludes),
    });
    return lessons as LessonData[];
  }

  static async getByUnitId(
    unitID: string,
    include?: string | string[],
  ): Promise<LessonController[]> {
    const lessons = await LessonController.getByUnitIdRaw(unitID, include);
    return lessons.map((lesson) => new LessonController(lesson));
  }

  async getAllExercise() {
    return await ExerciseController.getByLessonId(this.data.id);
  }

  async getUnit(): Promise<UnitController> {
    if (this.data.unit) return new UnitController(this.data.unit);
    return UnitController.getById(this.data.unitID);
  }

  async getCourse() {
    const unit = await this.getUnit();
    return unit.getCourse();
  }
}

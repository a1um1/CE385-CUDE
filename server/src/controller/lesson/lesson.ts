import ExerciseController from "#/controller/exercise/base/exercise";
import UnitController from "#/controller/unit/unit";
import type { Lesson } from "#/generated/prisma/client";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class LessonController {
  private data: Lesson;

  constructor(data: Lesson) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string): Promise<LessonController> {
    const lesson = await db.lesson.findUnique({
      where: { id },
    });
    if (!lesson) throw new UserError(404, "Lesson not found");
    return new LessonController(lesson);
  }

  static async getByUnitId(unitID: string): Promise<LessonController[]> {
    const lessons = await db.lesson.findMany({
      where: { unitID },
    });
    return lessons.map((lesson) => new LessonController(lesson));
  }

  async getAllExercise() {
    return await ExerciseController.getByLessonId(this.data.id);
  }

  async getUnit() {
    return await UnitController.getById(this.data.unitID);
  }
}

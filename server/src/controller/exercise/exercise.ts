import LessonController from "#/controller/lesson/lesson";
import type { Exercise } from "#/generated/prisma/client";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class ExerciseController {
  private data: Exercise;

  constructor(data: Exercise) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getExerciseById(id: string): Promise<Exercise | null> {
    const exercise = await db.exercise.findUnique({
      where: { id },
    });
    if (!exercise) throw new UserError(404, "Exercise not found");
    return exercise;
  }

  static async getExerciseByLessonId(lessonID: string): Promise<ExerciseController[]> {
    const exercises = await db.exercise.findMany({
      where: { lessonID },
    });
    return exercises.map((exercise) => new ExerciseController(exercise));
  }

  async getLesson() {
    return await LessonController.getLessonById(this.data.lessonID);
  }
}

import {
  ExerciseSelection,
  type ExercisePayload,
} from "#/controller/exercise/base/exercise.schema";
import { CodeExerciseController } from "#/controller/exercise/codeExercise/codeExercise";
import LessonController from "#/controller/lesson/lesson";
import type { Exercise } from "#/generated/prisma/client";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class ExerciseController {
  protected data: Exercise;

  constructor(data: Exercise) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static getMatchedController(data: ExercisePayload) {
    if (data.type === "CODE") {
      if (!data.codeExercises) throw new UserError(404, "CodeExercise not found");
      return new CodeExerciseController(data, data.codeExercises);
    }

    return new ExerciseController(data);
  }

  static async getById(id: string): Promise<ExerciseController | null> {
    const exercise = await db.exercise.findUnique({
      select: ExerciseSelection,
      where: {
        id,
      },
    });

    if (!exercise) throw new UserError(404, "Exercise not found");
    return this.getMatchedController(exercise);
  }

  static async getByLessonId(lessonID: string): Promise<ExerciseController[]> {
    const exercises = await db.exercise.findMany({
      select: ExerciseSelection,
      where: { lessonID },
    });

    return exercises.map((exercise) => this.getMatchedController(exercise));
  }

  async getLesson() {
    return await LessonController.getById(this.data.lessonID);
  }
}

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

  static async getExerciseById(id: string): Promise<ExerciseController | null> {
    const exercise = await db.exercise.findUnique({
      where: { id },
      include: {
        codeExercises: true,
      },
    });

    if (!exercise) throw new UserError(404, "Exercise not found");
    if (exercise.type === "CODE") {
      if (!exercise.codeExercises) throw new UserError(404, "CodeExercise not found");
      return new CodeExerciseController(exercise, exercise.codeExercises);
    }
    return new ExerciseController(exercise);
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

import { ExerciseSelection, type ExercisePayload } from "./base/exercise.schema";
import BaseExerciseController from "./base/exercise";
import { CodeExerciseController } from "./codeExercise/codeExercise";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class ExerciseController extends BaseExerciseController {
  static getMatchedController(data: ExercisePayload): BaseExerciseController {
    if (data.type === "CODE") {
      if (!data.codeExercises) throw new UserError(404, "CodeExercise not found");
      return new CodeExerciseController(data, data.codeExercises);
    }

    return new BaseExerciseController(data);
  }

  static async getById(id: string): Promise<BaseExerciseController | null> {
    const exercise = await db.exercise.findUnique({
      select: ExerciseSelection,
      where: {
        id,
      },
    });

    if (!exercise) throw new UserError(404, "Exercise not found");
    return this.getMatchedController(exercise);
  }

  static async getByLessonId(lessonID: string): Promise<BaseExerciseController[]> {
    const exercises = await db.exercise.findMany({
      select: ExerciseSelection,
      where: { lessonID },
    });

    return exercises.map((exercise) => this.getMatchedController(exercise));
  }
}

export { BaseExerciseController };
export * from "./base/exercise.schema";
export * from "./codeExercise/codeExercise";
export * from "./codeExercise/codeTestCase";

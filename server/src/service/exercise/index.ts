import type { ExercisePayload } from "./base/exercise.schema";
import BaseExerciseService from "./base/exercise";
import { CodeExerciseService } from "./codeExercise/codeExercise";
import UserError from "#/lib/router/http/userError";
import { exerciseRepository } from "#/repository/exercise.repository";

export default class ExerciseService extends BaseExerciseService {
  static getMatchedService(data: ExercisePayload): BaseExerciseService {
    if (data.type === "CODE") {
      if (!data.codeExercises) throw new UserError(404, "CodeExercise not found");
      return new CodeExerciseService(data, data.codeExercises);
    }

    return new BaseExerciseService(data);
  }

  static async getById(id: string): Promise<BaseExerciseService> {
    const exercise = await exerciseRepository.findById(id);

    if (!exercise) throw new UserError(404, "Exercise not found");
    return this.getMatchedService(exercise);
  }

  static async getByLessonId(lessonID: string): Promise<BaseExerciseService[]> {
    const exercises = await exerciseRepository.findAllByLessonID(lessonID);

    return exercises.map((exercise) => this.getMatchedService(exercise));
  }
}

export { BaseExerciseService };
export * from "./base/exercise.schema";
export * from "./codeExercise/codeExercise";
export * from "./codeExercise/codeTestCase";

import ExerciseController from "#/controller/exercise/base/exercise";
import type { CodeExercise, Exercise } from "#/generated/prisma/client";

export class CodeExerciseController extends ExerciseController {
  private codeExercise: CodeExercise;

  constructor(data: Exercise, codeExercise: CodeExercise) {
    super(data);
    this.codeExercise = codeExercise;
  }

  get JSON() {
    return { ...this.data, codeExercise: this.codeExercise };
  }
}

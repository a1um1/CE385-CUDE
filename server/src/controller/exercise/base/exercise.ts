import LessonController from "#/controller/lesson";
import type { Exercise } from "#/generated/prisma/client";

export default class BaseExerciseController {
  protected data: Exercise;

  constructor(data: Exercise) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  async getLesson() {
    return await LessonController.getById(this.data.lessonID);
  }
}

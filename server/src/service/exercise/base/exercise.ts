import LessonService from "#/service/lesson";
import type { Exercise } from "#/generated/prisma/client";

export default class BaseExerciseService {
  protected data: Exercise;

  constructor(data: Exercise) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  async getLesson() {
    return await LessonService.getById(this.data.lessonID);
  }
}

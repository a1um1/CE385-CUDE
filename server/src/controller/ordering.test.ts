import CourseController from "#/controller/course";
import ExerciseController from "#/controller/exercise";
import LessonController from "#/controller/lesson";
import UnitController from "#/controller/unit";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

// Shared display order for every school-facing list (see the composite indexes).
const byPosition = [{ position: "asc" }, { id: "asc" }];

const expectOrdered = (model: "course" | "unit" | "lesson" | "exercise") =>
  expect(mockDB[model].findMany).toHaveBeenCalledWith(
    expect.objectContaining({ orderBy: byPosition }),
  );

describe("display ordering", () => {
  it("orders courses by position", async () => {
    mockDB.course.findMany.mockResolvedValueOnce([]);
    await CourseController.getAllRaw();
    expectOrdered("course");
  });

  it("orders units of a course by position", async () => {
    mockDB.unit.findMany.mockResolvedValueOnce([]);
    await UnitController.getAllByCourseIdRaw("course");
    expectOrdered("unit");
  });

  it("orders lessons of a unit by position", async () => {
    mockDB.lesson.findMany.mockResolvedValueOnce([]);
    await LessonController.getByUnitIdRaw("unit");
    expectOrdered("lesson");
  });

  it("orders exercises of a lesson by position then id", async () => {
    mockDB.exercise.findMany.mockResolvedValueOnce([]);
    await ExerciseController.getByLessonId("lesson");
    expectOrdered("exercise");
  });
});

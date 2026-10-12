import AdminCoursesController from "#/controller/admin/courses";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

const COURSE = "01a1256e-6271-7727-92f8-3b00eebdff73";

describe("Admin course getById", () => {
  it("reports a missing course as 404 rather than 500", async () => {
    mockDB.course.findUnique.mockResolvedValueOnce(null);

    await expect(AdminCoursesController.getById(COURSE)).rejects.toMatchObject({
      status: 404,
      message: "Course not found",
    });
  });

  it("returns the course when it exists", async () => {
    mockDB.course.findUnique.mockResolvedValueOnce({
      id: COURSE,
      name: "Course",
      position: 0,
      createdByID: "01a1256e-348e-7659-aea9-91a74eeeb7ee",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const course = await AdminCoursesController.getById(COURSE);

    expect(course.JSON.id).toBe(COURSE);
  });
});

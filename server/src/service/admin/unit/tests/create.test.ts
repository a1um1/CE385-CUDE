import AdminUnitsService from "#/service/admin/unit";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

const COURSE = "01a1256e-6271-7727-92f8-3b00eebdff73";

const fakeUnit = (position: number) => ({
  id: "01a1256e-6278-772c-82e0-5f65c02ca559",
  name: "Unit",
  courseID: COURSE,
  position,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("Admin unit create", () => {
  it("appends the new unit after the highest position in the course", async () => {
    mockDB.course.findUnique.mockResolvedValueOnce({ id: COURSE } as never);
    mockDB.unit.aggregate.mockResolvedValueOnce({ _max: { position: 4 } } as never);
    mockDB.unit.create.mockResolvedValueOnce(fakeUnit(5) as never);

    const unit = await AdminUnitsService.create({ name: "Unit", courseID: COURSE });

    expect(mockDB.unit.aggregate).toHaveBeenCalledWith({
      _max: { position: true },
      where: { courseID: COURSE },
    });
    expect(mockDB.unit.create).toHaveBeenCalledWith({
      data: { name: "Unit", courseID: COURSE, position: 5 },
    });
    expect(unit.JSON.position).toBe(5);
  });

  it("starts at 0 in a course that has no units yet", async () => {
    mockDB.course.findUnique.mockResolvedValueOnce({ id: COURSE } as never);
    mockDB.unit.aggregate.mockResolvedValueOnce({ _max: { position: null } } as never);
    mockDB.unit.create.mockResolvedValueOnce(fakeUnit(0) as never);

    await AdminUnitsService.create({ name: "Unit", courseID: COURSE });

    expect(mockDB.unit.create).toHaveBeenCalledWith({
      data: { name: "Unit", courseID: COURSE, position: 0 },
    });
  });
});

import AdminCoursesController from "#/controller/admin/courses";
import { mockDB } from "#/test/setup";
import { beforeEach, describe, expect, it } from "vitest";

const ID_A = "0191c53e-53c4-7936-a1ec-18b0f4d38c64";
const ID_B = "0191c53e-53c4-7936-a1ec-18b0f4d38c65";

function mockTransactionToInvokeCallback(): void {
  mockDB.$transaction.mockImplementation(((callback: unknown) => {
    if (typeof callback === "function") {
      return callback(mockDB);
    }
    return undefined;
  }) as never);
}

/**
 * The controller reads the moving row's own position, then checks that the target
 * slot is occupied. Selects are narrower than the mocked `Course` payload.
 */
const mockMovingFrom = (position: number) => {
  mockDB.course.findUnique.mockResolvedValue({ position } as never);
  mockDB.course.findFirst.mockResolvedValue({ id: ID_B } as never);
};

const movedCourse = {
  id: ID_A,
  name: "Course",
  color: "#FFFFFF",
  icon: "icon",
  position: 0,
  createdByID: ID_B,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Reorder in Admin Course Controller", () => {
  beforeEach(() => {
    mockTransactionToInvokeCallback();
    mockDB.$queryRaw.mockResolvedValue([{ pg_advisory_xact_lock: null }]);
    mockDB.course.update.mockResolvedValue(movedCourse);
  });

  it("should take the advisory lock before reading the source position", async () => {
    mockMovingFrom(1);

    await AdminCoursesController.reorder({ id: ID_B, position: 0 });

    // The `::text` cast matters: the function returns void, which Prisma cannot
    // deserialise, so dropping it fails at runtime and not in these tests.
    const sql = String(mockDB.$queryRaw.mock.calls[0]?.[0]);
    expect(sql).toContain("pg_advisory_xact_lock(1, hashtext(");
    expect(sql).toContain("::text");

    const [lockCall] = mockDB.$queryRaw.mock.invocationCallOrder;
    const [readCall] = mockDB.course.findUnique.mock.invocationCallOrder;
    expect(lockCall).toBeDefined();
    expect(readCall).toBeDefined();
    expect(lockCall!).toBeLessThan(readCall!);
  });

  it("should shift the rows above the target up, then take the slot", async () => {
    mockMovingFrom(1);

    await AdminCoursesController.reorder({ id: ID_B, position: 0 });

    expect(mockDB.course.updateMany).toHaveBeenCalledWith({
      where: { position: { gte: 0, lte: 0 } },
      data: { position: { increment: 1 } },
    });
    expect(mockDB.course.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: ID_B }, data: { position: 0 } }) as never,
    );
  });

  it("should shift the rows below the target down, then take the slot", async () => {
    mockMovingFrom(0);

    await AdminCoursesController.reorder({ id: ID_A, position: 1 });

    expect(mockDB.course.updateMany).toHaveBeenCalledWith({
      where: { position: { gte: 1, lte: 1 } },
      data: { position: { increment: -1 } },
    });
  });

  it("should span the whole gap on a multi-step move", async () => {
    mockMovingFrom(0);

    await AdminCoursesController.reorder({ id: ID_A, position: 3 });

    expect(mockDB.course.updateMany).toHaveBeenCalledWith({
      where: { position: { gte: 1, lte: 3 } },
      data: { position: { increment: -1 } },
    });
  });

  it("should shift before moving, never after", async () => {
    mockMovingFrom(1);

    await AdminCoursesController.reorder({ id: ID_B, position: 0 });

    const [shiftCall] = mockDB.course.updateMany.mock.invocationCallOrder;
    const [moveCall] = mockDB.course.update.mock.invocationCallOrder;
    expect(shiftCall).toBeDefined();
    expect(moveCall).toBeDefined();
    expect(shiftCall!).toBeLessThan(moveCall!);
  });

  it("should not shift when the course is already at the requested position", async () => {
    mockMovingFrom(1);

    await AdminCoursesController.reorder({ id: ID_B, position: 1 });

    expect(mockDB.course.findFirst).not.toHaveBeenCalled();
    expect(mockDB.course.updateMany).not.toHaveBeenCalled();
  });

  it("should reject an unoccupied target slot", async () => {
    mockMovingFrom(0);
    mockDB.course.findFirst.mockResolvedValue(null as never);

    await expect(AdminCoursesController.reorder({ id: ID_A, position: 5 })).rejects.toThrow(
      "Position out of range",
    );

    expect(mockDB.course.updateMany).not.toHaveBeenCalled();
    expect(mockDB.course.update).not.toHaveBeenCalled();
  });

  it("should reject an unknown course id", async () => {
    mockDB.course.findUnique.mockResolvedValue(null as never);

    await expect(AdminCoursesController.reorder({ id: ID_B, position: 0 })).rejects.toThrow(
      "Course not found",
    );

    expect(mockDB.course.update).not.toHaveBeenCalled();
  });

  it("should return the moved course from the update", async () => {
    mockMovingFrom(1);

    const controller = await AdminCoursesController.reorder({ id: ID_B, position: 0 });

    expect(controller.JSON.id).toBe(ID_A);
  });
});

describe("Create in Admin Course Controller", () => {
  beforeEach(() => {
    mockDB.course.create.mockResolvedValue(movedCourse);
  });

  it("should append after the highest existing position", async () => {
    mockDB.course.aggregate.mockResolvedValue({ _max: { position: 7 } } as never);

    await AdminCoursesController.create({
      name: "Course",
      color: "#FFFFFF",
      icon: "icon",
      createdByID: ID_A,
    });

    expect(mockDB.course.aggregate).toHaveBeenCalledWith({ _max: { position: true } });
    expect(mockDB.course.create).toHaveBeenCalledWith({
      data: {
        name: "Course",
        color: "#FFFFFF",
        icon: "icon",
        createdByID: ID_A,
        position: 8,
      },
    });
  });

  it("should start at zero when no courses exist", async () => {
    mockDB.course.aggregate.mockResolvedValue({ _max: { position: null } } as never);

    await AdminCoursesController.create({
      name: "Course",
      color: "#FFFFFF",
      icon: "icon",
      createdByID: ID_A,
    });

    expect(mockDB.course.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ position: 0 }) }) as never,
    );
  });
});

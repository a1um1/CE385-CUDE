import AdminCoursesController from "#/controller/admin/courses";
import { mockDB } from "#/test/setup";
import { beforeEach, describe, expect, it } from "vitest";

const ID_A = "0191c53e-53c4-7936-a1ec-18b0f4d38c64";
const ID_B = "0191c53e-53c4-7936-a1ec-18b0f4d38c65";
const ID_C = "0191c53e-53c4-7936-a1ec-18b0f4d38c66";

function mockTransactionToInvokeCallback(): void {
  mockDB.$transaction.mockImplementation(((callback: unknown) => {
    if (typeof callback === "function") {
      return callback(mockDB);
    }
    return undefined;
  }) as never);
}

// `findMany` is mocked against the full `Course` payload, while these queries
// narrow the selection to the two ordering columns.
const sibling = (id: string, position: number) => ({ id, position }) as never;

/** Positions are dense, so a sibling's id encodes its index. */
const IDS = [ID_A, ID_B, ID_C];
const at = (index: number) => sibling(IDS[index]!, index);

/** `aggregate` is mocked against the full result shape; the controller only requests `_max`. */
const maxPosition = (position: number | null) => ({ _max: { position } }) as never;

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
    mockDB.course.findUniqueOrThrow.mockResolvedValue(movedCourse);
  });

  it("should take the advisory lock before reading siblings", async () => {
    mockDB.course.findMany.mockResolvedValue([at(0), at(1), at(2)]);

    await AdminCoursesController.reorder({ id: ID_B, position: 0 });

    expect(mockDB.$queryRaw).toHaveBeenCalledTimes(1);
    // The `::text` cast matters: the function returns void, which Prisma cannot
    // deserialise, so dropping it fails at runtime and not in these tests.
    expect(String(mockDB.$queryRaw.mock.calls[0]?.[0])).toContain(
      "pg_advisory_xact_lock(1, hashtext(",
    );
    expect(String(mockDB.$queryRaw.mock.calls[0]?.[0])).toContain("::text");

    const [lockCall] = mockDB.$queryRaw.mock.invocationCallOrder;
    const [readCall] = mockDB.course.findMany.mock.invocationCallOrder;
    expect(lockCall).toBeDefined();
    expect(readCall).toBeDefined();
    expect(lockCall!).toBeLessThan(readCall!);
  });

  it("should read siblings inside the lock in display order", async () => {
    mockDB.course.findMany.mockResolvedValue([at(0), at(1), at(2)]);

    await AdminCoursesController.reorder({ id: ID_B, position: 0 });

    expect(mockDB.course.findMany).toHaveBeenCalledWith({
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: { id: true, position: true },
    });
  });

  it("should shift the target row up and drop the course into the slot", async () => {
    mockDB.course.findMany.mockResolvedValue([at(0), at(1), at(2)]);

    await AdminCoursesController.reorder({ id: ID_B, position: 0 });

    expect(mockDB.course.updateMany).toHaveBeenCalledWith({
      where: { position: { gte: 0, lt: 1 } },
      data: { position: { increment: 1 } },
    });
    expect(mockDB.course.update).toHaveBeenCalledWith({
      where: { id: ID_B },
      data: { position: 0 },
    });
  });

  it("should shift the target row down when moving the course down", async () => {
    mockDB.course.findMany.mockResolvedValue([at(0), at(1), at(2)]);

    await AdminCoursesController.reorder({ id: ID_A, position: 1 });

    expect(mockDB.course.updateMany).toHaveBeenCalledWith({
      where: { position: { gt: 0, lte: 1 } },
      data: { position: { increment: -1 } },
    });
    expect(mockDB.course.update).toHaveBeenCalledWith({
      where: { id: ID_A },
      data: { position: 1 },
    });
  });

  it("should span the whole gap on a multi-step move", async () => {
    mockDB.course.findMany.mockResolvedValue([at(0), at(1), at(2)]);

    await AdminCoursesController.reorder({ id: ID_A, position: 2 });

    expect(mockDB.course.updateMany).toHaveBeenCalledWith({
      where: { position: { gt: 0, lte: 2 } },
      data: { position: { increment: -1 } },
    });
  });

  it("should shift before moving, never after", async () => {
    mockDB.course.findMany.mockResolvedValue([at(0), at(1), at(2)]);

    await AdminCoursesController.reorder({ id: ID_B, position: 0 });

    const [shiftCall] = mockDB.course.updateMany.mock.invocationCallOrder;
    const [moveCall] = mockDB.course.update.mock.invocationCallOrder;
    expect(shiftCall).toBeDefined();
    expect(moveCall).toBeDefined();
    expect(shiftCall!).toBeLessThan(moveCall!);
  });

  it("should not write when the course is already at the requested position", async () => {
    mockDB.course.findMany.mockResolvedValue([at(0), at(1), at(2)]);

    await AdminCoursesController.reorder({ id: ID_B, position: 1 });

    expect(mockDB.course.updateMany).not.toHaveBeenCalled();
    expect(mockDB.course.update).not.toHaveBeenCalled();
  });

  it("should reject a target beyond the end of the list", async () => {
    mockDB.course.findMany.mockResolvedValue([at(0), at(1), at(2)]);

    await expect(AdminCoursesController.reorder({ id: ID_A, position: 3 })).rejects.toThrow(
      "Position out of range",
    );

    expect(mockDB.course.updateMany).not.toHaveBeenCalled();
    expect(mockDB.course.update).not.toHaveBeenCalled();
  });

  it("should reject an unknown course id", async () => {
    mockDB.course.findMany.mockResolvedValue([at(0), at(1)]);

    await expect(AdminCoursesController.reorder({ id: ID_C, position: 0 })).rejects.toThrow(
      "Course not found",
    );

    expect(mockDB.course.update).not.toHaveBeenCalled();
  });

  it("should return the moved course", async () => {
    mockDB.course.findMany.mockResolvedValue([at(0), at(1)]);

    const controller = await AdminCoursesController.reorder({ id: ID_B, position: 0 });

    expect(mockDB.course.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: ID_B },
      select: expect.any(Object) as never,
    });
    expect(controller.JSON.id).toBe(ID_A);
  });
});

describe("Create in Admin Course Controller", () => {
  beforeEach(() => {
    mockDB.course.create.mockResolvedValue(movedCourse);
  });

  it("should append after the highest existing position", async () => {
    mockDB.course.aggregate.mockResolvedValue(maxPosition(7));

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
    mockDB.course.aggregate.mockResolvedValue(maxPosition(null));

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

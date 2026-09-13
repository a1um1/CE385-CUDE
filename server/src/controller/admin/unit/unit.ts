import type {
  AdminUnitCreateSchema,
  AdminUnitUpdateSchema,
  AdminUnitSchema,
  AdminUnitListResponseSchema,
  AdminUnitQuery,
} from "#/controller/admin/unit/unit.schema";
import { unitQueryPayload } from "#/controller/admin/unit/unit.schema";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { db } from "#/lib/prisma";

export default class AdminUnitsController {
  private data: AdminUnitSchema;

  get JSON() {
    return this.data;
  }

  constructor(data: AdminUnitSchema) {
    this.data = data;
  }

  static async getById(id: string): Promise<AdminUnitsController> {
    const unit = await db.unit.findUnique({
      where: { id },
    });
    if (!unit) throw new Error("Unit not found");
    return new AdminUnitsController(unit);
  }

  static async getPaginateLists(query: AdminUnitQuery): Promise<AdminUnitListResponseSchema> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);
    const orderBy = buildCursorOrderBy(query.sortBy, query.sortOrder, isBackward);

    // เช็คว่ามีการส่ง courseId มาหรือไม่ ถ้ามีให้ดึงเฉพาะ Unit ของ Course นั้น (ตาม Requirement)
    const whereCondition = query.courseID ? { courseID: query.courseID } : {};

    const data = await db.unit.findMany({
      where: whereCondition,
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy,
      select: unitQueryPayload,
    });

    let nextCursor: string | undefined = undefined;
    let prevCursor: string | undefined = undefined;

    if (isBackward) {
      if (data.length > query.perPage) prevCursor = data.pop()?.id;
      data.reverse();
      nextCursor = query.cursor;
    } else {
      if (data.length > query.perPage) nextCursor = data.pop()?.id;
      if (query.cursor) prevCursor = query.cursor;
    }

    return {
      data,
      nextCursor,
      prevCursor,
    };
  }

  static async create(data: AdminUnitCreateSchema): Promise<AdminUnitsController> {
    const unit = await db.unit.create({
      data,
    });
    return new AdminUnitsController(unit);
  }

  static async update(id: string, data: AdminUnitUpdateSchema): Promise<AdminUnitsController> {
    const unit = await db.unit.update({
      where: { id },
      data,
    });
    return new AdminUnitsController(unit);
  }
}

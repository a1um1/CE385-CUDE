import type {
  AdminUnitSchema,
  AdminUnitListResponseSchema,
  AdminUnitQuery,
} from "#/controller/admin/unit/unit.schema";
import { unitQueryPayload } from "#/controller/admin/unit/unit.schema";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class AdminUnitsController {
  private data: AdminUnitSchema;

  get JSON() {
    return this.data;
  }

  constructor(data: AdminUnitSchema) {
    this.data = data;
  }

  //เรียกดูข้อมูล Unit ทีละตัวด้วย id
  static async getById(id: string): Promise<AdminUnitsController> {
    const unit = await db.unit.findUnique({
      where: { id },
    });
    if (!unit) throw new UserError(404, "Unit not found");
    return new AdminUnitsController(unit);
  }

  static async getPaginateLists(query: AdminUnitQuery): Promise<AdminUnitListResponseSchema> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);
    const orderBy = buildCursorOrderBy(query.sortBy, query.sortOrder, isBackward);

    const data = await db.unit.findMany({
      where: query.courseID ? { courseID: query.courseID } : undefined,
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy,
      select: unitQueryPayload,
    });

    let nextCursor: string | undefined = undefined;
    let prevCursor: string | undefined = undefined;

    if (isBackward) {
      const hasExtra = data.length > query.perPage;
      if (hasExtra) data.pop();
      data.reverse();
      if (hasExtra) prevCursor = data[0]?.id;
      nextCursor = query.cursor;
    } else {
      const hasExtra = data.length > query.perPage;
      if (hasExtra) data.pop();
      if (hasExtra) nextCursor = data[data.length - 1]?.id;
      if (query.cursor) prevCursor = query.cursor;
    }

    return {
      data,
      nextCursor,
      prevCursor,
    };
  }
}

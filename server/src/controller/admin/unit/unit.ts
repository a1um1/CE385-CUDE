import type {
  AdminUnitListResponseSchema,
  AdminUnitQuery,
} from "#/controller/admin/unit/unit.schema";
import { unitQueryPayload } from "#/controller/admin/unit/unit.schema";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { db } from "#/lib/prisma";

// oxlint-disable typescript/no-extraneous-class
export default class AdminUnitsController {
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
      if (hasExtra) data.pop(); //ตัดตัวเกินทิ้ง ไม่เอา id มาใช้
      data.reverse();
      if (hasExtra) prevCursor = data[0]?.id; // เอา id ของตัวแรกที่ "โชว์จริง" แทน
      nextCursor = query.cursor;
    } else {
      const hasEtra = data.length > query.perPage;
      if (hasEtra) data.pop(); //ตัดตัวเกินทิ้ง ไม่เอา id มาใช้
      if (hasEtra) nextCursor = data[data.length - 1]?.id; // เอา id ของตัวสุดท้ายที่ "โชว์จริง" แทน
      if (query.cursor) prevCursor = query.cursor;
    }

    return {
      data,
      nextCursor,
      prevCursor,
    };
  }
}

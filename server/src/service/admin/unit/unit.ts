import type {
  AdminUnitSchema,
  AdminUnitListResponseSchema,
  AdminUnitQuery,
  AdminUnitCreateSchema,
  AdminUnitUpdateSchema,
} from "#/service/admin/unit/unit.schema";
import { unitQueryPayload } from "#/service/admin/unit/unit.schema";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class AdminUnitsService {
  private data: AdminUnitSchema;

  get JSON() {
    return this.data;
  }

  constructor(data: AdminUnitSchema) {
    this.data = data;
  }

  //เรียกดูข้อมูล Unit ทีละตัวด้วย id
  static async getById(id: string): Promise<AdminUnitsService> {
    const unit = await db.unit.findUnique({
      where: { id },
    });
    if (!unit) throw new UserError(404, "Unit not found");
    return new AdminUnitsService(unit);
  }

  static async create(data: AdminUnitCreateSchema): Promise<AdminUnitsService> {
    // เช็คว่า Course ที่จะผูก Unit นี้เข้าไปมีจริงก่อน - ถ้าไม่เช็คแล้วส่ง
    // courseID ปลอมเข้ามา Prisma จะ throw raw foreign-key error ที่อ่านยาก
    // แทนที่จะได้ 404 ที่สื่อความหมายชัดเจนแบบนี้
    const course = await db.course.findUnique({ where: { id: data.courseID } });
    if (!course) throw new UserError(404, "Course not found");

    const { _max } = await db.unit.aggregate({
      _max: { position: true },
      where: { courseID: data.courseID },
    });
    const unit = await db.unit.create({
      data: { ...data, position: (_max.position ?? -1) + 1 },
    });
    return new AdminUnitsService(unit);
  }

  static async update(id: string, data: AdminUnitUpdateSchema): Promise<AdminUnitsService> {
    await AdminUnitsService.getById(id);

    const course = await db.course.findUnique({ where: { id: data.courseID } });
    if (!course) throw new UserError(404, "Course not found");

    const unit = await db.unit.update({
      where: { id },
      data,
    });

    return new AdminUnitsService(unit);
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

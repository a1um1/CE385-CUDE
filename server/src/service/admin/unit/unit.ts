import type {
  AdminUnitSchema,
  AdminUnitListResponseSchema,
  AdminUnitQuery,
  AdminUnitCreateSchema,
  AdminUnitUpdateSchema,
} from "#/service/admin/unit/unit.schema";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { cursorArgs, isBackward, paginate } from "#/lib/pagination";
import UserError from "#/lib/router/http/userError";
import { unitRepository } from "#/repository/unit.repository";
import { courseRepository } from "#/repository/course.repository";

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
    const unit = await unitRepository.findById(id);
    if (!unit) throw new UserError(404, "Unit not found");
    return new AdminUnitsService(unit);
  }

  static async create(data: AdminUnitCreateSchema): Promise<AdminUnitsService> {
    // เช็คว่า Course ที่จะผูก Unit นี้เข้าไปมีจริงก่อน - ถ้าไม่เช็คแล้วส่ง
    // courseID ปลอมเข้ามา Prisma จะ throw raw foreign-key error ที่อ่านยาก
    // แทนที่จะได้ 404 ที่สื่อความหมายชัดเจนแบบนี้
    const course = await courseRepository.findById(data.courseID);
    if (!course) throw new UserError(404, "Course not found");

    const { _max } = await unitRepository.maxPosition(data.courseID);
    const unit = await unitRepository.create({
      ...data,
      position: (_max.position ?? -1) + 1,
    });
    return new AdminUnitsService(unit);
  }

  static async update(id: string, data: AdminUnitUpdateSchema): Promise<AdminUnitsService> {
    await AdminUnitsService.getById(id);

    const unit = await unitRepository.update(id, data);

    return new AdminUnitsService(unit);
  }

  static async getPaginateLists(query: AdminUnitQuery): Promise<AdminUnitListResponseSchema> {
    const orderBy = buildCursorOrderBy(query.sortBy, query.sortOrder, isBackward(query));
    const data = await unitRepository.findPage({
      where: query.courseID ? { courseID: query.courseID } : undefined,
      ...cursorArgs(query),
      orderBy,
    });

    return paginate(data, query);
  }
}

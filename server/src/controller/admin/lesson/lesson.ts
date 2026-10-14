import type {
  AdminLessonCreateSchema,
  AdminLessonUpdateSchema,
} from "#/controller/admin/lesson/lesson.schema";
import type { LessonSchema } from "#/controller/lesson/lesson.schema";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class AdminLessonsController {
  private data: LessonSchema;

  get JSON() {
    return this.data;
  }

  constructor(data: LessonSchema) {
    this.data = data;
  }

  static async getById(id: string): Promise<AdminLessonsController> {
    const lesson = await db.lesson.findUnique({
      where: { id },
      include: { unit: { include: { course: true } } },
    });
    if (!lesson) throw new UserError(404, "Lesson not found");
    return new AdminLessonsController(lesson as LessonSchema);
  }

  static async create(data: AdminLessonCreateSchema): Promise<AdminLessonsController> {
    const unit = await db.unit.findUnique({ where: { id: data.unitID } });
    if (!unit) throw new UserError(404, "Unit not found");

    const lesson = await db.lesson.create({ data });
    return new AdminLessonsController(lesson as LessonSchema);
  }

  static async update(id: string, data: AdminLessonUpdateSchema): Promise<AdminLessonsController> {
    const existing = await db.lesson.findUnique({ where: { id } });
    if (!existing) throw new UserError(404, "Lesson not found");

    if (data.unitID && data.unitID !== existing.unitID) {
      const unit = await db.unit.findUnique({ where: { id: data.unitID } });
      if (!unit) throw new UserError(404, "Unit not found");
    }

    const updated = await db.lesson.update({
      where: { id },
      data,
    });
    return new AdminLessonsController(updated as LessonSchema);
  }
}

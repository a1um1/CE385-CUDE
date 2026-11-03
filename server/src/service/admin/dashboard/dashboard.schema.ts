import { z } from "#/lib/extendZod";
import type zod from "zod";

export const AdminDashboardSchema = z
  .object({
    generatedAt: z.date().openapi({ example: "2026-11-03T09:00:00.000Z" }),
    since: z.date().openapi({
      example: "2026-10-27T09:00:00.000Z",
      description: "จุดเริ่มต้นของช่วง 7 วันล่าสุด",
    }),
    kpis: z.object({
      totalUsers: z.number().int().openapi({ example: 128, description: "ผู้ใช้ทั้งหมด" }),
      newUsers: z.number().int().openapi({ example: 9, description: "ผู้ใช้ใหม่ในช่วง 7 วัน" }),
      activeLearners: z
        .number()
        .int()
        .openapi({ example: 34, description: "ผู้ใช้ที่ไม่ซ้ำกันและเริ่มเรียนในช่วง 7 วัน" }),
      attempts: z.number().int().openapi({ example: 76, description: "จำนวนครั้งที่เริ่มเรียน" }),
      passRate: z.number().openapi({
        example: 62.5,
        description: "อัตราการผ่านของ session ที่จบแล้วในช่วง 7 วัน (0-100)",
      }),
      xpGranted: z.number().int().openapi({ example: 1840, description: "XP ที่แจกในช่วง 7 วัน" }),
      gemsGranted: z.number().int().openapi({ example: 320, description: "Gems ที่แจกในช่วง 7 วัน" }),
    }),
    activity: z
      .array(
        z.object({
          date: z.string().openapi({ example: "2026-11-01", description: "รูปแบบ YYYY-MM-DD" }),
          sessions: z.number().int().openapi({ example: 12 }),
          submissions: z.number().int().openapi({ example: 31 }),
        }),
      )
      .openapi({ description: "จำนวนรายวันย้อนหลัง 30 วัน เรียงจากเก่าไปใหม่" }),
  })
  .openapi("AdminDashboard");

export type AdminDashboard = zod.infer<typeof AdminDashboardSchema>;

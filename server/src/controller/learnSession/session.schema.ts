import type { z as zod } from "zod";
import { z } from "#/lib/extendZod";
import type { Sessions } from "#/generated/prisma/client";

export const SessionStatusEnum = z
  .enum(["PENDING", "SUBMITTED", "GRADED", "CANCELLED"])
  .openapi({ example: "PENDING" }) satisfies zod.ZodType<Sessions["status"]>;

export const SessionObjectSchema = z.object({
  id: z.string().openapi({ example: "session_id" }),
  LessonID: z.string().openapi({ example: "lesson_id" }),
  userID: z.string().openapi({ example: "user_id" }),
  status: SessionStatusEnum,
  createdAt: z.date().openapi({ example: "2023-01-01T00:00:00.000Z" }),
  updatedAt: z.date().openapi({ example: "2023-01-01T00:00:00.000Z" }),
}) satisfies zod.ZodType<Sessions>;

export type SessionObject = zod.infer<typeof SessionObjectSchema>;

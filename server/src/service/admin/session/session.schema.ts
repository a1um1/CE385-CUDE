import { z } from "#/lib/extendZod";
import type { z as zod } from "zod";
import type { Prisma } from "#/generated/prisma/client";
import { SubmissionContentSchema } from "#/service/learnSession/session.schema";
import {
  BaseCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination.schema";

const SessionStatus = z.enum(["PENDING", "SUBMITTED", "GRADED", "CANCELLED"]);

export const AdminSessionListPayload = {
  id: true,
  userID: true,
  LessonID: true,
  status: true,
  rewarded: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { name: true, email: true } },
  lesson: {
    select: {
      id: true,
      name: true,
      unit: {
        select: {
          id: true,
          name: true,
          course: { select: { id: true, name: true, color: true, icon: true } },
        },
      },
    },
  },
  submissions: { select: { isGraded: true, ok: true } },
} satisfies Prisma.SessionsSelect;

export const AdminSessionDetailPayload = {
  ...AdminSessionListPayload,
  submissions: {
    select: {
      id: true,
      exerciseID: true,
      content: true,
      isGraded: true,
      ok: true,
      createdAt: true,
      updatedAt: true,
      exercise: {
        select: {
          id: true,
          name: true,
          content: true,
          codeExercises: { select: { language: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.SessionsSelect;

export const AdminSessionSubmissionSchema = z
  .object({
    id: z.uuidv7(),
    exerciseID: z.uuidv7(),
    content: SubmissionContentSchema,
    isGraded: z.boolean(),
    ok: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    exercise: z.object({
      id: z.uuidv7(),
      name: z.string(),
      content: z.string(),
      codeExercise: z.object({ language: z.string().nullable() }).nullable().optional(),
    }),
  })
  .openapi("AdminSessionSubmission");

export type AdminSessionSubmission = zod.infer<typeof AdminSessionSubmissionSchema>;

export const AdminSessionListItemSchema = z
  .object({
    id: z.uuidv7(),
    userID: z.uuidv7(),
    LessonID: z.uuidv7(),
    status: SessionStatus,
    rewarded: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    user: z.object({
      name: z.string(),
      email: z.string(),
    }),
    lesson: z.object({
      id: z.uuidv7(),
      name: z.string(),
      unit: z.object({
        id: z.uuidv7(),
        name: z.string(),
        course: z.object({
          id: z.uuidv7(),
          name: z.string(),
          color: z.string(),
          icon: z.string(),
        }),
      }),
    }),
    submissions: z.array(
      z.object({
        isGraded: z.boolean(),
        ok: z.boolean(),
      }),
    ),
  })
  .openapi("AdminSessionObject");

export type AdminSessionListItem = zod.infer<typeof AdminSessionListItemSchema>;

export const AdminSessionDetailSchema = AdminSessionListItemSchema.extend({
  submissions: z.array(AdminSessionSubmissionSchema),
}).openapi("AdminSessionDetail");

export type AdminSessionDetail = zod.infer<typeof AdminSessionDetailSchema>;

export const AdminSessionQuerySchema = BaseCursorPaginationQuerySchema.extend({
  userSearch: z.string().trim().max(100).optional(),
  courseID: z.uuid().optional(),
  unitID: z.uuid().optional(),
  lessonID: z.uuid().optional(),
  result: z.enum(["PASSED", "FAILED", "GRADING", "ONGOING", "GIVEUP"]).optional(),
}).openapi("AdminSessionQuery");

export type AdminSessionQuery = zod.infer<typeof AdminSessionQuerySchema>;

export const AdminSessionListResponseSchema = createCursorPaginationResponseSchema(
  AdminSessionListItemSchema,
  "AdminSessionListResponse",
);

export type AdminSessionListResponse = zod.infer<typeof AdminSessionListResponseSchema>;

import type { Course, Lesson, Sessions, Submission, Unit } from "#/generated/prisma/client";
import { createIncludeQuerySchema } from "#/lib/include";
import { z } from "#/lib/extendZod";
import type { z as zod } from "zod";

export const SessionStatusEnum = z
  .enum(["PENDING", "SUBMITTED", "GRADED", "CANCELLED"])
  .openapi({ example: "PENDING" }) satisfies zod.ZodType<Sessions["status"]>;

export const SessionLessonSchema = z.object({
  id: z.uuidv7().openapi({ example: "lesson_id" }),
  name: z.string().openapi({ example: "lesson_name" }),
  unitID: z.uuidv7().openapi({ example: "unit_id" }),
  unit: z
    .object({
      id: z.uuidv7().openapi({ example: "unit_id" }),
      name: z.string().openapi({ example: "unit_name" }),
      courseID: z.uuidv7().openapi({ example: "course_id" }),
      course: z
        .object({
          id: z.uuidv7().openapi({ example: "course_id" }),
          name: z.string().openapi({ example: "Course_Name" }),
          color: z.string().openapi({ example: "#FFFFF" }),
          icon: z.string().openapi({ example: "icon_name" }),
        })
        .optional(),
    })
    .optional(),
});

/** Shape of `Submission.content`; the only answer a student can save today is code. */
export const SubmissionContentSchema = z.object({
  code: z.string().openapi({ example: 'print("hello")' }),
});

export const SubmissionSchema = z
  .object({
    id: z.uuidv7().openapi({ example: "submission_id" }),
    exerciseID: z.uuidv7().openapi({ example: "exercise_id" }),
    content: SubmissionContentSchema,
    isGraded: z.boolean().openapi({ example: true }),
    ok: z.boolean().openapi({ example: false }),
  })
  .openapi("Submission");

export type SubmissionResponse = zod.infer<typeof SubmissionSchema>;

/** Grading state of one submission, without the student's answer. */
export const SubmissionResultSchema = z
  .object({
    id: z.uuidv7().openapi({ example: "submission_id" }),
    exerciseID: z.uuidv7().openapi({ example: "exercise_id" }),
    isGraded: z.boolean().openapi({ example: true }),
    ok: z.boolean().openapi({ example: false }),
  })
  .openapi("SubmissionResult");

export const SessionObjectSchema = z.object({
  id: z.string().openapi({ example: "session_id" }),
  LessonID: z.string().openapi({ example: "lesson_id" }),
  userID: z.string().openapi({ example: "user_id" }),
  status: SessionStatusEnum,
  createdAt: z.date().openapi({ example: "2023-01-01T00:00:00.000Z" }),
  updatedAt: z.date().openapi({ example: "2023-01-01T00:00:00.000Z" }),
  lesson: SessionLessonSchema.optional(),
  submissions: z.array(SubmissionResultSchema).optional(),
});

export type SessionObject = zod.infer<typeof SessionObjectSchema>;

/**
 * Grading result of one exercise after submitting a session. Hidden test cases stay hidden,
 * so only the counts are exposed.
 */
export const SubmittedExerciseSchema = z.object({
  exerciseID: z.uuidv7().openapi({ example: "exercise_id" }),
  total: z.number().openapi({ example: 3 }),
  passed: z.number().openapi({ example: 2 }),
  ok: z.boolean().openapi({ example: false }),
});

export const SubmitSessionResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Submitted 5 exercise(s), 4 passed." }),
    exercises: z.array(SubmittedExerciseSchema),
  })
  .openapi("SubmitSessionResponse");

export type SubmitSessionResponse = zod.infer<typeof SubmitSessionResponseSchema>;

/** Session row as stored, plus relations added by `?include=`. */
export type SessionData = Sessions & {
  lesson?: Lesson & { unit?: Unit & { course?: Course } };
  submissions?: Submission[];
};

/** Allow-list of `?include=` paths for a session. */
export const sessionIncludes = [
  "lesson",
  "lesson.unit",
  "lesson.unit.course",
  "submissions",
] as const;

export const SessionIncludeQuerySchema = createIncludeQuerySchema(
  sessionIncludes,
  "SessionIncludeQuery",
);

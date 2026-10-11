import SessionController from "#/controller/learnSession/session";
import {
  SubmissionContentSchema,
  type SubmissionResponse,
} from "#/controller/learnSession/session.schema";
import type { Prisma, Submission } from "#/generated/prisma/client";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

/** `content` is free-form Json in the database; only `{ code }` is ever written today. */
const toResponse = (row: Submission): SubmissionResponse => ({
  id: row.id,
  exerciseID: row.exerciseID,
  content: SubmissionContentSchema.parse(row.content),
});

/** The student's saved answer for one exercise, or `null` when they never saved one. */
export async function getExerciseSubmission(props: {
  SessionID: string;
  userID: string;
  exerciseID: string;
}) {
  const session = await SessionController.getById({
    SessionID: props.SessionID,
    userId: props.userID,
  });
  await assertExerciseInSession(session, props.exerciseID);

  const submission = await db.submission.findUnique({
    where: {
      SessionID_exerciseID: {
        SessionID: props.SessionID,
        exerciseID: props.exerciseID,
      },
    },
  });
  return submission && toResponse(submission);
}

export async function saveExerciseSubmission(props: {
  SessionID: string;
  userID: string;
  exerciseID: string;
  content: Prisma.InputJsonValue;
}) {
  const session = await SessionController.getById({
    SessionID: props.SessionID,
    userId: props.userID,
  });
  if (session.JSON.status !== "PENDING") {
    throw new UserError(400, "Session is not in progress.");
  }
  await assertExerciseInSession(session, props.exerciseID);

  const submission = await db.submission.upsert({
    where: {
      SessionID_exerciseID: {
        SessionID: props.SessionID,
        exerciseID: props.exerciseID,
      },
    },
    create: {
      userID: props.userID,
      SessionID: props.SessionID,
      exerciseID: props.exerciseID,
      content: props.content,
    },
    update: {
      content: props.content,
    },
  });
  return toResponse(submission);
}

async function assertExerciseInSession(session: SessionController, exerciseID: string) {
  const exercise = await db.exercise.findUnique({
    select: { lessonID: true },
    where: { id: exerciseID },
  });
  if (!exercise || exercise.lessonID !== session.JSON.LessonID) {
    throw new UserError(404, "Exercise not found in this session.");
  }
}

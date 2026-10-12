import ExerciseController, { CodeExerciseController } from "#/controller/exercise";
import SessionController from "#/controller/learnSession/session";
import {
  SubmissionContentSchema,
  type SubmissionResponse,
  type SubmitSessionResponse,
} from "#/controller/learnSession/session.schema";
import type { Prisma, Submission } from "#/generated/prisma/client";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export default class SubmissionController {
  private data: Submission;

  constructor(data: Submission) {
    this.data = data;
  }

  get JSON(): SubmissionResponse {
    return {
      id: this.data.id,
      exerciseID: this.data.exerciseID,
      content: SubmissionContentSchema.parse(this.data.content),
      isGraded: this.data.isGraded,
      ok: this.data.ok,
    };
  }

  static async getByExercise(props: {
    SessionID: string;
    userID: string;
    exerciseID: string;
  }): Promise<SubmissionController | null> {
    const session = await SessionController.getById({
      SessionID: props.SessionID,
      userId: props.userID,
    });
    await this.assertExerciseInSession(session, props.exerciseID);

    const submission = await db.submission.findUnique({
      where: {
        SessionID_exerciseID: {
          SessionID: props.SessionID,
          exerciseID: props.exerciseID,
        },
      },
    });
    return submission && new SubmissionController(submission);
  }

  static async save(props: {
    SessionID: string;
    userID: string;
    exerciseID: string;
    content: Prisma.InputJsonValue;
  }): Promise<SubmissionController> {
    const session = await SessionController.getById({
      SessionID: props.SessionID,
      userId: props.userID,
    });
    if (session.JSON.status !== "PENDING") {
      throw new UserError(400, "Session are not available for submission.");
    }

    await this.assertExerciseInSession(session, props.exerciseID);

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
    return new SubmissionController(submission);
  }

  static async submitSession(props: {
    SessionID: string;
    userID: string;
  }): Promise<SubmitSessionResponse> {
    const session = await SessionController.getById({
      SessionID: props.SessionID,
      userId: props.userID,
    });
    if (session.JSON.status !== "PENDING") {
      throw new UserError(400, "Session are not available for submission.");
    }

    const submissions = await db.submission.findMany({
      where: { SessionID: props.SessionID },
    });

    const graded = await Promise.all(
      submissions.map(async (submission) => {
        const exercise = await ExerciseController.getById(submission.exerciseID);
        if (!(exercise instanceof CodeExerciseController)) return null;

        const grade = await exercise.grade(SubmissionContentSchema.parse(submission.content).code);
        if (!grade) return null;

        const ok = grade.total > 0 && grade.failed === 0;
        await db.submission.update({
          where: { id: submission.id },
          data: { isGraded: true, ok },
        });

        return {
          exerciseID: submission.exerciseID,
          total: grade.total,
          passed: grade.passed,
          ok,
        };
      }),
    );

    await db.sessions.update({
      where: { id: props.SessionID, userID: props.userID, status: "PENDING" },
      data: { status: "SUBMITTED" },
    });

    const exercises = graded.filter((entry) => entry !== null);
    const passed = exercises.filter((entry) => entry.ok).length;
    return {
      exercises,
      message: `Submitted ${exercises.length} exercise(s), ${passed} passed.`,
    };
  }

  private static async assertExerciseInSession(session: SessionController, exerciseID: string) {
    const exercise = await ExerciseController.getById(exerciseID);
    if (exercise.JSON.lessonID !== session.JSON.LessonID) {
      throw new UserError(404, "Exercise not found in this session.");
    }
  }
}

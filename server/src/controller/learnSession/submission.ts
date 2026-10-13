import ExerciseController, { CodeExerciseController } from "#/controller/exercise";
import SessionController from "#/controller/learnSession/session";
import {
  SubmissionContentSchema,
  type LessonReward,
  type SubmissionResponse,
  type SubmitSessionResponse,
} from "#/controller/learnSession/session.schema";
import UserStatController from "#/controller/userStat";
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

    return await db.$transaction(
      async (tx) => {
        const claimed = await tx.sessions.updateMany({
          where: { id: props.SessionID, userID: props.userID, status: "PENDING" },
          data: { status: "SUBMITTED" },
        });
        if (claimed.count === 0) {
          throw new UserError(400, "Session are not available for submission.");
        }

        const submissions = await tx.submission.findMany({
          where: { SessionID: props.SessionID },
        });

        const graded = await Promise.all(
          submissions.map(async (submission) => {
            const exercise = await ExerciseController.getById(submission.exerciseID);
            if (!(exercise instanceof CodeExerciseController)) return null;

            const grade = await exercise.grade(
              SubmissionContentSchema.parse(submission.content).code,
            );
            if (!grade) return null;

            const ok = grade.total > 0 && grade.failed === 0;
            await tx.submission.update({
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

        const exercises = graded.filter((entry) => entry !== null);
        const passed = exercises.filter((entry) => entry.ok).length;
        const reward = await this.grantLessonReward(tx, {
          SessionID: props.SessionID,
          userID: props.userID,
          LessonID: session.JSON.LessonID,
          passed,
          total: exercises.length,
        });
        return {
          exercises,
          message: `Submitted ${exercises.length} exercise(s), ${passed} passed.`,
          reward,
        };
      },
      { timeout: 120_000, maxWait: 10_000 },
    );
  }

  private static async grantLessonReward(
    tx: Prisma.TransactionClient,
    props: { SessionID: string; userID: string; LessonID: string; passed: number; total: number },
  ): Promise<LessonReward | undefined> {
    const lesson = await tx.lesson.findUnique({ where: { id: props.LessonID } });
    if (!lesson) return undefined;
    const passedLesson =
      props.total === 0 || props.passed / props.total >= Number(lesson.passThreshold);
    if (!passedLesson) return undefined;

    const rewarded = await tx.sessions.findFirst({
      where: { userID: props.userID, LessonID: lesson.id, rewarded: true },
      select: { id: true },
    });
    if (rewarded) return undefined;

    await tx.sessions.update({ where: { id: props.SessionID }, data: { rewarded: true } });

    await UserStatController.grantReward(tx, {
      userID: props.userID,
      xp: lesson.XPgiven,
      gems: lesson.gemsGiven,
      reason: `Lesson reward: ${lesson.name}`,
    });

    return { lessonID: lesson.id, xp: lesson.XPgiven, gems: lesson.gemsGiven };
  }

  private static async assertExerciseInSession(session: SessionController, exerciseID: string) {
    const exercise = await ExerciseController.getById(exerciseID);
    if (exercise.JSON.lessonID !== session.JSON.LessonID) {
      throw new UserError(404, "Exercise not found in this session.");
    }
  }
}

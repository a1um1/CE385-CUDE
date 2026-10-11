import ExerciseController, { CodeExerciseController } from "#/controller/exercise";
import { zGoJudgeLanguage } from "#/controller/go-judge/go-judge.schema";
import CodeGrader from "#/controller/grader/codeGrader";
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

  /** `content` is free-form Json in the database; only `{ code }` is ever written today. */
  get JSON(): SubmissionResponse {
    return {
      id: this.data.id,
      exerciseID: this.data.exerciseID,
      content: SubmissionContentSchema.parse(this.data.content),
      isGraded: this.data.isGraded,
      ok: this.data.ok,
    };
  }

  /** The student's saved answer for one exercise, or `null` when they never saved one. */
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
      throw new UserError(400, "Session is not in progress.");
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

  /**
   * Grades every saved answer of the session against all of its test cases (hidden ones included)
   * and closes the session as `SUBMITTED`.
   */
  static async submitSession(props: {
    SessionID: string;
    userID: string;
  }): Promise<SubmitSessionResponse> {
    const session = await SessionController.getById({
      SessionID: props.SessionID,
      userId: props.userID,
    });
    if (session.JSON.status !== "PENDING") {
      throw new UserError(400, "Session is not in progress.");
    }

    const submissions = await db.submission.findMany({
      where: { SessionID: props.SessionID },
    });

    const grader = new CodeGrader();
    const graded = await Promise.all(
      submissions.map(async (submission) => {
        const exercise = await ExerciseController.getById(submission.exerciseID);
        if (!(exercise instanceof CodeExerciseController)) return null;
        const language = zGoJudgeLanguage.safeParse(exercise.language);
        if (!language.success) return null;

        const testCases = await exercise.getAllTestCase();
        const results = await grader.grade({
          code: exercise.getRunnableCode(SubmissionContentSchema.parse(submission.content).code),
          language: language.data,
          testCases: testCases.map((testCase) => testCase.JSON),
        });
        const passed = results.filter((result) => result.ok).length;
        const ok = results.length > 0 && passed === results.length;

        await db.submission.update({
          where: { id: submission.id },
          data: { isGraded: true, ok },
        });

        return { exerciseID: submission.exerciseID, total: results.length, passed, ok };
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
    const exercise = await db.exercise.findUnique({
      select: { lessonID: true },
      where: { id: exerciseID },
    });
    if (!exercise || exercise.lessonID !== session.JSON.LessonID) {
      throw new UserError(404, "Exercise not found in this session.");
    }
  }
}

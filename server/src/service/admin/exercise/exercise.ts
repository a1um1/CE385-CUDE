import type {
  AdminExerciseListResponseSchema,
  AdminExerciseQuery,
  AdminExerciseSchema,
  CreateAdminExercise,
  UpdateAdminExercise,
} from "#/service/admin/exercise/exercise.schema";
import type { CodeExercise, Exercise, TestCase } from "#/generated/prisma/client";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { cursorArgs, isBackward, paginate } from "#/lib/pagination";
import UserError from "#/lib/router/http/userError";
import { exerciseRepository } from "#/repository/exercise.repository";
import { lessonRepository } from "#/repository/lesson.repository";
import { transaction } from "#/repository/client";

type AdminExerciseWithCode = Exercise & {
  codeExercises?: (CodeExercise & { testCases?: TestCase[] }) | null;
};

export default class AdminExercisesService {
  private data: AdminExerciseWithCode;

  constructor(data: AdminExerciseWithCode) {
    this.data = data;
  }

  get JSON(): AdminExerciseSchema {
    const res: AdminExerciseSchema = {
      id: this.data.id,
      name: this.data.name,
      lessonID: this.data.lessonID,
      type: this.data.type as "NONE" | "CODE",
      content: this.data.content,
      position: this.data.position,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
    };

    if (this.data.type === "CODE" && this.data.codeExercises) {
      const code = this.data.codeExercises;
      res.codeExercise = {
        language: code.language as "python" | "c",
        starterCode: code.starterCode,
        testerCode: code.testerCode,
        timeLimitMs: code.timeLimitMs,
        memoryLimitMb: code.memoryLimitMb,
        testCases: (code.testCases ?? []).map((tc) => ({
          id: tc.id,
          input: tc.input,
          output: tc.output,
          isPublic: tc.isPublic,
        })),
      };
    }

    return res;
  }

  static async getById(id: string): Promise<AdminExercisesService> {
    const exercise = await exerciseRepository.findAdminById(id);
    if (!exercise) throw new UserError(404, "Exercise not found");
    return new AdminExercisesService(exercise);
  }

  static async getPaginateLists(
    query: AdminExerciseQuery,
  ): Promise<AdminExerciseListResponseSchema> {
    const orderBy = buildCursorOrderBy(query.sortBy, query.sortOrder, isBackward(query));
    const data = await exerciseRepository.findPage({
      where: query.lessonID ? { lessonID: query.lessonID } : undefined,
      ...cursorArgs(query),
      orderBy,
    });

    const paginated = paginate(data, query);
    return {
      ...paginated,
      data: paginated.data.map((item) => new AdminExercisesService(item).JSON),
    };
  }

  static async create(body: CreateAdminExercise): Promise<AdminExercisesService> {
    const lesson = await lessonRepository.findRawById(body.lessonID);
    if (!lesson) throw new UserError(404, "Lesson not found");

    const { _max } = await exerciseRepository.maxPosition(body.lessonID);

    const exercise = await transaction(async (tx) => {
      const created = await tx.exercise.create({
        data: {
          name: body.name,
          lessonID: body.lessonID,
          content: body.content,
          type: body.type,
          position: (_max.position ?? -1) + 1,
        },
      });

      let codeExercises = null;
      if (body.type === "CODE" && body.codeExercise) {
        const conf = body.codeExercise;
        codeExercises = await tx.codeExercise.create({
          data: {
            exerciseID: created.id,
            language: conf.language,
            starterCode: conf.starterCode ?? null,
            testerCode: conf.testerCode ?? null,
            timeLimitMs: conf.timeLimitMs,
            memoryLimitMb: conf.memoryLimitMb,
            testCases: {
              create: (conf.testCases ?? []).map((tc) => ({
                input: tc.input,
                output: tc.output,
                isPublic: tc.isPublic,
              })),
            },
          },
          include: { testCases: true },
        });
      }

      return { ...created, codeExercises };
    });

    return new AdminExercisesService(exercise);
  }

  async update(body: UpdateAdminExercise): Promise<void> {
    const { id } = this.data;
    const type = body.type ?? (this.data.type as "NONE" | "CODE");

    const updated = await transaction(async (tx) => {
      const exercise = await tx.exercise.update({
        where: { id },
        data: {
          name: body.name,
          content: body.content,
          type: body.type,
        },
      });

      let codeExercises = null;
      if (type === "CODE") {
        const conf = body.codeExercise;
        if (conf) {
          const existingCode = await tx.codeExercise.findUnique({
            where: { exerciseID: id },
          });

          if (existingCode) {
            codeExercises = await tx.codeExercise.update({
              where: { id: existingCode.id },
              data: {
                language: conf.language,
                starterCode: conf.starterCode ?? null,
                testerCode: conf.testerCode ?? null,
                timeLimitMs: conf.timeLimitMs,
                memoryLimitMb: conf.memoryLimitMb,
              },
            });

            if (conf.testCases !== undefined) {
              await tx.testCase.deleteMany({
                where: { codeExerciseID: existingCode.id },
              });
              if (conf.testCases.length > 0) {
                await tx.testCase.createMany({
                  data: conf.testCases.map((tc) => ({
                    codeExerciseID: existingCode.id,
                    input: tc.input,
                    output: tc.output,
                    isPublic: tc.isPublic,
                  })),
                });
              }
            }
          } else {
            codeExercises = await tx.codeExercise.create({
              data: {
                exerciseID: id,
                language: conf.language,
                starterCode: conf.starterCode ?? null,
                testerCode: conf.testerCode ?? null,
                timeLimitMs: conf.timeLimitMs,
                memoryLimitMb: conf.memoryLimitMb,
                testCases: {
                  create: (conf.testCases ?? []).map((tc) => ({
                    input: tc.input,
                    output: tc.output,
                    isPublic: tc.isPublic,
                  })),
                },
              },
            });
          }

          const allCases = await tx.testCase.findMany({
            where: { codeExerciseID: codeExercises.id },
            orderBy: { createdAt: "asc" },
          });
          codeExercises = { ...codeExercises, testCases: allCases };
        } else {
          codeExercises = await tx.codeExercise.findUnique({
            where: { exerciseID: id },
            include: { testCases: { orderBy: { createdAt: "asc" } } },
          });
        }
      }

      return { ...exercise, codeExercises };
    });

    this.data = updated;
  }
}

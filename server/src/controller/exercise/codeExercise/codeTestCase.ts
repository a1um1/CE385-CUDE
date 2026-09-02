import type { TestCase } from "#/generated/prisma/client";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

export class CodeTestCase {
  private data: TestCase;

  constructor(data: TestCase) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getByID(testCaseID: string) {
    const data = await db.testCase.findUnique({
      where: {
        id: testCaseID,
      },
    });
    if (!data) throw new UserError(404, "Test Case Not Found");
    return data;
  }

  static async getAllByExerciseID(codeExerciseID: string) {
    const allTestCases = await db.testCase.findMany({
      where: {
        codeExerciseID,
      },
    });
    return allTestCases.map((data) => new CodeTestCase(data));
  }
}

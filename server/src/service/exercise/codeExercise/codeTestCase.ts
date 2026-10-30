import type { TestCase } from "#/generated/prisma/client";
import UserError from "#/lib/router/http/userError";
import { testCaseRepository } from "#/repository/testCase.repository";

export class CodeTestCase {
  private data: TestCase;

  constructor(data: TestCase) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getByID(testCaseID: string) {
    const data = await testCaseRepository.findById(testCaseID);
    if (!data) throw new UserError(404, "Test Case Not Found");
    return data;
  }

  static async getAllByExerciseID(codeExerciseID: string, publicOnly = false) {
    const allTestCases = await testCaseRepository.findAllByExerciseID(codeExerciseID, publicOnly);
    return allTestCases.map((data) => new CodeTestCase(data));
  }
}

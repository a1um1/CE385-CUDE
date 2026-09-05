import type GoJudge from "#/controller/go-judge";

export interface testCase {
  input: string;
  output: string;
}

export interface runTestCaseProps {
  code: string;
  language: keyof typeof GoJudge.LANGAUGES;
  testCase: testCase;
}

export interface gradeConfig {
  code: string;
  language: keyof typeof GoJudge.LANGAUGES;
  testCases: testCase[];
}

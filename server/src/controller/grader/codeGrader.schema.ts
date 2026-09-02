import { z } from "#/lib/extendZod";
import type zod from "zod";

export interface testResult {
  ok: boolean;
  input: string;
  output: string;
  expectedOutput: string;
  error?: string;
  time: number;
  memory: number;
}

export const codeGraderResult = z
  .object({
    ok: z.boolean(),
    input: z.string(),
    output: z.string(),
    expectedOutput: z.string(),
    error: z.string().optional(),
    time: z.number(),
    memory: z.number(),
  })
  .openapi("codeGraderResult") satisfies zod.ZodType<testResult>;

export interface codeGradingSummary {
  total: number;
  passed: number;
  failed: number;
  percentage: number;
  averageTime: number;
  averageMemory: number;
  testResults: testResult[];
}

export const codeGradingSummary = z
  .object({
    total: z.number(),
    passed: z.number(),
    failed: z.number(),
    percentage: z.number(),
    averageTime: z.number(),
    averageMemory: z.number(),
    testResults: z.array(codeGraderResult),
  })
  .openapi("codeGradingSummary") satisfies zod.ZodType<codeGradingSummary>;

import { z } from "#/lib/extendZod";
import type zod from "zod";

export interface testResult {
  ok: boolean;
  input: string;
  output: string;
  expectedOutput: string;
  error?: string;
}

export const codeGraderResult = z
  .object({
    ok: z.boolean(),
    input: z.string(),
    output: z.string(),
    expectedOutput: z.string(),
    error: z.string().optional(),
  })
  .openapi("codeGraderResult") satisfies zod.ZodType<testResult>;

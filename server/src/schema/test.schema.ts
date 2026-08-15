import { z } from "#/lib/extendZod";

export const TestSchema = z
    .object({
      randomNumber: z.number().openapi({ example: "123456" }),
    })
    .openapi("Test"),
  TestSendSchema = TestSchema;

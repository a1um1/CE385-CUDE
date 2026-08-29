import type { Log as LogSchema } from "#/generated/prisma/client";
export const mockSuccessLog = {
  id: "test-id",
  content: "Test log",
  status: "SUCCESS",
  createdAt: new Date(),
} satisfies LogSchema;

export const mockErrorLog = {
  id: "test-id",
  content: "Test log",
  status: "ERROR",
  createdAt: new Date(),
} satisfies LogSchema;

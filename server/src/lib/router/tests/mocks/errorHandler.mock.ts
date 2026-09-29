import CustomRouter from "#/lib/router/customRouter";
import UserError from "#/lib/router/http/userError";
import { z } from "#/lib/extendZod";
import { createTestApp } from "#/lib/router/tests/mocks/testApp.mock";

const prismaError = (code: string) =>
  Object.assign(new Error("Prisma operation failed"), {
    name: "PrismaClientKnownRequestError",
    code,
  });

const errorHandlerRouting = new CustomRouter()
  .get("/user-error", {}, async () => {
    throw new UserError(409, "Conflict");
  })
  .get("/prisma-unique", {}, async () => {
    throw prismaError("P2002");
  })
  .get("/prisma-not-found", {}, async () => {
    throw prismaError("P2025");
  })
  .get("/prisma-unknown", {}, async () => {
    throw prismaError("P2099");
  })
  .get("/validation", { query: z.object({ id: z.uuid() }) }, async () => ({
    message: "ok",
  }))
  .post("/json-body", {}, async () => ({ message: "ok" }))
  .post(
    "/nested-body",
    {
      body: z.object({
        profile: z.object({ age: z.coerce.number() }),
        tags: z.array(z.object({ name: z.string() })),
      }),
    },
    async () => ({ message: "ok" }),
  )
  .post(
    "/root-level",
    {
      body: z
        .object({ password: z.string(), confirm: z.string() })
        .refine((value) => value.password === value.confirm, {
          message: "Passwords do not match",
        }),
    },
    async () => ({ message: "ok" }),
  );

const ErrorHandlerApp = createTestApp(errorHandlerRouting.route);

export { ErrorHandlerApp };

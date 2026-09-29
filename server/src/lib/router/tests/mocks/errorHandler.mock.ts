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
  .post("/json-body", {}, async () => ({ message: "ok" }));

const ErrorHandlerApp = createTestApp(errorHandlerRouting.route);

export { ErrorHandlerApp };

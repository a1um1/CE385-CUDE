import { z } from "#/lib/extendZod";
import type { ErrorRequestHandler, RequestHandler } from "express-serve-static-core";
import UserError from "#/lib/router/http/userError";

type HttpError = Error & {
  status?: unknown;
  statusCode?: unknown;
  code?: unknown;
};

const PRISMA_ERRORS: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: "Resource already exists" },
  P2025: { status: 404, message: "Resource not found" },
};

const resolvePrismaError = (err: unknown) => {
  if (typeof err !== "object" || err === null) return undefined;
  const { name, code } = err as HttpError;
  if (name !== "PrismaClientKnownRequestError") return undefined;
  return typeof code === "string" ? PRISMA_ERRORS[code] : undefined;
};

const resolveClientErrorStatus = (err: unknown) => {
  if (typeof err !== "object" || err === null) return undefined;
  const { status, statusCode } = err as HttpError;
  return [status, statusCode].find(
    (candidate): candidate is number =>
      typeof candidate === "number" && candidate >= 400 && candidate <= 499,
  );
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      message: "Invalid request parameters",
      details: z.treeifyError(err),
    });
  }

  if (err instanceof UserError) {
    return res.status(err.status).json({ message: err.message });
  }

  const prismaError = resolvePrismaError(err);
  if (prismaError) {
    return res.status(prismaError.status).json({ message: prismaError.message });
  }

  const clientErrorStatus = resolveClientErrorStatus(err);
  if (clientErrorStatus) {
    return res.status(clientErrorStatus).json({
      message: (err instanceof Error && err.message) || "Bad Request",
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Internal Server Error" });
};

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
};

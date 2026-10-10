import type { RequestHandler } from "express";

const c = (code: number, s: string) => `\u001b[${code}m${s}\u001b[0m`;

const statusColor = (status: number): string => {
  const s = String(status);
  if (status >= 500) return c(31, s); // red
  if (status >= 400) return c(33, s); // yellow
  if (status >= 300) return c(36, s); // cyan
  return c(32, s); // green
};

const METHOD_COLORS: Record<string, number> = {
  GET: 32, // green
  POST: 33, // yellow
  PUT: 36, // cyan
  PATCH: 36, // cyan
  DELETE: 31, // red
};

/** pad plain text first, then color — padEnd must not count escape codes */
const methodColor = (method: string): string => {
  const padded = method.padEnd(6, " ");
  const color = METHOD_COLORS[method];
  return color ? c(color, padded) : padded;
};

/** 12.34ms | 12.34s — fixed 2 decimals, left-aligned in 8 cols so URL start aligns */
export const formatTime = (elapsed: number): string => {
  const ms = Number(elapsed.toFixed(2)); // round first: 999.999 must not yield "1000.00ms"
  return (ms < 1000 ? `${ms.toFixed(2)}ms` : `${(ms / 1000).toFixed(2)}s`).padEnd(8, " ");
};

export const httpLogger: RequestHandler = (req, res, next) => {
  const startTime = performance.now();

  res.on("finish", () => {
    const elapsed = performance.now() - startTime;
    // every field start-aligned: each column begins at the same position
    console.log(
      `[${statusColor(res.statusCode)}][${methodColor(req.method)}][${formatTime(elapsed)}] ${req.originalUrl}`,
    );
  });

  next();
};

import type { RequestHandler } from "express";

export const httpLogger: RequestHandler = (req, res, next) => {
  const startTime = performance.now();

  res.on("finish", () => {
    const elapsedTime = performance.now() - startTime;
    const logMessage = `[${res.statusCode}][${req.method.padEnd(5, " ")}] ${req.originalUrl} - ${elapsedTime.toFixed(2)} ms`;
    console.log(logMessage);
  });

  next();
};

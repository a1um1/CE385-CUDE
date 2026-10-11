import express from "express";
import type { Router } from "express";
import { errorHandler, notFoundHandler } from "#/lib/router/http/errorHandler";

export const createTestApp = (...routers: Router[]) => {
  const app = express().use(express.json());

  for (const router of routers) {
    app.use(router);
  }

  return app.use(notFoundHandler).use(errorHandler);
};

import express from "express";
import { generateOpenApiDocument } from "#/openapi";
import { userRouter } from "#/routes/user";
import { testRouter } from "#/routes/test";
import { apiReference } from "@scalar/express-api-reference";

import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(testRouter);
app.use(userRouter);

// Docs endpoint — regenerated from the registry above
app
  .get("/openapi.json", (_req, res) => {
    res.json(generateOpenApiDocument());
  })
  .use(
    "/docs",
    apiReference({
      spec: { url: "/openapi.json" },
    }),
  );

export default app;

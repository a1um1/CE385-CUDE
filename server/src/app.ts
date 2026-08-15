import express from "express";
import { userRouter } from "#/routes/user";
import { generateOpenApiDocument } from "#/openapi";

const app = express();
app.use(express.json());
app.use(userRouter);

// Docs endpoint — regenerated from the registry above
app.get("/docs", (_req, res) => {
  res.json(generateOpenApiDocument());
});

export default app;

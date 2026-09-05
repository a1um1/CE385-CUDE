import express from "express";
import { generateOpenApiDocument } from "#/openapi";
import { userRouter } from "#/routes/user";
import { testRouter } from "#/routes/test";
import { apiReference } from "@scalar/express-api-reference";
import { adminRoute } from "#/routes/admin/index";
import cors from "cors";
import { authRoute } from "#/routes/auth";
import { CodingRoute } from "#/routes/coding";

const app = express()
  .use(express.json())
  .use(
    cors({
      origin: "http://localhost:5173",
    }),
  )
  .use(authRoute)
  .use(userRouter)
  .use(CodingRoute)
  .use(testRouter)
  .use(adminRoute);

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

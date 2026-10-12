import express from "express";
import { generateOpenApiDocument } from "#/openapi";
import { userRouter } from "#/routes/user";
import { storageRouter } from "#/routes/storage";
import { testRouter } from "#/routes/test";
import { apiReference } from "@scalar/express-api-reference";
import { adminRoute } from "#/routes/admin/index";
import cors from "cors";
import { authRoute } from "#/routes/auth";
import { CodingRoute } from "#/routes/coding";
import { courseRoute } from "./routes/course";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { httpLogger } from "#/lib/router/logger";
import { errorHandler, notFoundHandler } from "#/lib/router/http/errorHandler";
import { unitRoute } from "./routes/unit";
import { exerciseRoute } from "./routes/exercise";

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 500,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
import { lessonRouter } from "./routes/lesson";
import { learnSessionRoute } from "#/routes/session";

const app = express()
  .use(limiter)
  .use(express.json())
  .use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  )
  .use(cookieParser())
  .use(httpLogger)
  .use(authRoute)
  .use(userRouter)
  .use(storageRouter)
  .use(CodingRoute)
  .use(testRouter)
  .use(courseRoute)
  .use(lessonRouter)
  .use(unitRoute)
  .use(exerciseRoute)
  .use(adminRoute)
  .use(learnSessionRoute);

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
  )
  .use(notFoundHandler)
  .use(errorHandler);

export default app;

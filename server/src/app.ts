import express from "express";
import { generateOpenApiDocument } from "#/openapi";
import { userRouter } from "#/routes/user";
import { testRouter } from "#/routes/test";
import { apiReference } from "@scalar/express-api-reference";
import { adminRoute } from "#/routes/admin/index";
import cors from "cors";
import { authRoute } from "#/routes/auth";
import { CodingRoute } from "#/routes/coding";
import { courseRoute } from "./routes/course";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

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
  .use(authRoute)
  .use(userRouter)
  .use(CodingRoute)
  .use(testRouter)
  .use(courseRoute)
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

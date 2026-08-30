import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import express from "express";

const paramsRouting = new CustomRouter()
  .get("/no-params", {}, async ({ params }) => ({
    message: "no params route",
    params,
  }))
  .get(
    "/params-validation/:id",
    {
      params: z.object({
        id: z.uuid(),
      }),
    },
    async ({ params }) => ({
      message: "params route",
      params,
    }),
  )
  .get(
    "/multiple-params-validation/:id/:name",
    {
      params: z.object({
        id: z.uuid(),
        name: z.string(),
      }),
    },
    async ({ params }) => ({
      message: "params route with name",
      params,
    }),
  );

const ParamsRoutingApp = express();
ParamsRoutingApp.use(paramsRouting.route);

export { ParamsRoutingApp };

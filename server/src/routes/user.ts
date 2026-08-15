import { Router } from "express";
import { defineRoute } from "#/lib/openApi";
import { z } from "#/lib/extendZod";

export const userRouter = Router(),
  UserSchema = z
    .object({
      id: z.string().openapi({ example: "usr_123" }),
      name: z.string().openapi({ example: "Jane Doe" }),
      email: z.email().openapi({ example: "jane@example.com" }),
    })
    .openapi("User"),
  CreateUserSchema = UserSchema.omit({ id: true }),
  UserParamsSchema = z.object({
    id: z.string().openapi({ example: "usr_123" }),
  });

defineRoute(
  userRouter,
  {
    method: "get",
    path: "/users/{id}",
    tags: ["Users"],
    summary: "Get a user by ID",
    params: UserParamsSchema,
    response: UserSchema,
  },
  async ({ params }) => ({ id: params.id, name: "Jane Doe", email: "jane@example.com" }),
);

defineRoute(
  userRouter,
  {
    method: "get",
    path: "/test",
    tags: ["Test"],
    summary: "Test route",
    params: z.object({}),
    response: z.object({}),
  },
  async () => ({}),
);

import { UserCreationSchema, UserSafeSchema, UserValidationSchema } from "#/controller/user";
import AuthenticationController, { authenticationSchema } from "#/controller/authentication";
import CustomRouter from "#/lib/customRouter";

const authController = new AuthenticationController();

const userRoute = new CustomRouter();

userRoute.post(
  "/user/signup",
  {
    tags: ["User"],
    summary: "User signup route",
    body: UserCreationSchema,
    response: authenticationSchema,
  },
  async ({ body }) => {
    const user = await authController.signUp(body);
    return user.token;
  },
);

userRoute.post(
  "/user/signin",
  {
    tags: ["User"],
    summary: "User signin route",
    body: UserValidationSchema,
    response: authenticationSchema,
  },
  async ({ body }) => {
    const user = await authController.signIn(body);
    return user.token;
  },
);

userRoute.get(
  "/user/validate",
  {
    tags: ["User"],
    summary: "User token validation route",
    response: UserSafeSchema,
  },
  async ({ headers }) => {
    const token = headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Token not provided");
    const user = await authController.validateToken(token);
    return user.json;
  },
);

export const userRouter = userRoute.route;

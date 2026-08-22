import UserController, {
  type userCreationSchema,
  type userValidationSchema,
} from "#/controller/user";
import { Log } from "#/lib/decorators";
import { z } from "#/lib/extendZod";
import jwt from "jsonwebtoken";
import type zod from "zod";

interface AuthenticationBody {
  userId: string;
  name: string;
  email: string;
}

export const authenticationSchema = z
  .object({
    token: z.string().openapi({
      example:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6ImVtYWlsQGdtYWlsLmNvbSIsImlhdCI6MTY4NzQyNjQwMCwiZXhwIjoxNjg3NDI2NDAwfQ.abc123",
    }),
  })
  .openapi("AuthenticationData");

export type authenticationSchema = zod.infer<typeof authenticationSchema>;

export default class AuthenticationController {
  private secret?: string = process.env.JWT_SECRET;

  generateToken(user: AuthenticationBody): authenticationSchema {
    if (!this.secret) throw new Error("JWT secret is not defined");
    const token = jwt.sign(user, this.secret, { expiresIn: "6h", algorithm: "HS256" });
    return {
      token,
    };
  }

  async validateToken(_token: string): Promise<UserController> {
    if (!this.secret) throw new Error("JWT secret is not defined");
    const decoded = jwt.verify(_token, this.secret) as AuthenticationBody;
    return UserController.getUserById(decoded.userId);
  }

  @Log
  async signIn(credentials: userValidationSchema): Promise<{
    token: ReturnType<AuthenticationController["generateToken"]>;
    user: UserController;
  }> {
    const user = await UserController.validateUserCredentials(credentials);
    const token = this.generateToken({
      userId: user.json.id,
      name: user.json.name,
      email: user.json.email,
    });
    return { token, user };
  }

  @Log
  async signUp(userData: userCreationSchema): Promise<{
    token: ReturnType<AuthenticationController["generateToken"]>;
    user: UserController;
  }> {
    const user = await UserController.createUser(userData);
    const token = this.generateToken({
      userId: user.json.id,
      name: user.json.name,
      email: user.json.email,
    });

    return { token, user };
  }
}

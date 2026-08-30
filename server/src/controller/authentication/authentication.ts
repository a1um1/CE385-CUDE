import type {
  AuthenticationBody,
  authenticationSchema,
} from "#/controller/authentication/authentication.schema";
import UserController from "#/controller/user/user";
import type { userCreationSchema, userValidationSchema } from "#/controller/user/user.schema";
import { Log } from "#/lib/logger/decorators";
import userError from "#/lib/router/http/userError";
import UserError from "#/lib/router/http/userError";
import jwt from "jsonwebtoken";

export default class AuthenticationController {
  private secret?: string = process.env.JWT_SECRET;

  generateToken(user: AuthenticationBody): authenticationSchema {
    if (!this.secret) throw new Error("JWT secret is not defined");
    const token = jwt.sign(user, this.secret, { expiresIn: "6h", algorithm: "HS256" });
    return {
      token,
    };
  }

  async validateToken(token: string): Promise<UserController> {
    if (!this.secret) throw new Error("JWT secret is not defined");
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ["HS256"],
      }) as AuthenticationBody;
      return await UserController.getUserById(decoded.userId);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) throw new UserError(401, "Token expired");
      if (error instanceof jwt.NotBeforeError) throw new UserError(401, "Token not active yet");
      if (error instanceof jwt.JsonWebTokenError) throw new UserError(401, "Invalid token");
      if (error instanceof userError) {
        if (error.status === 404) throw new UserError(401, "Token validation failed");
        throw error;
      }
      throw new UserError(500, "Token validation failed");
    }
  }

  @Log()
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

  @Log()
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

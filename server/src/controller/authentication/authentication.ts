import type {
  AuthenticationBody,
  authenticationSchema,
} from "#/controller/authentication/authentication.schema";
import UserController from "#/controller/user/user";
import type { userCreationSchema, userValidationSchema } from "#/controller/user/user.schema";
import { Log } from "#/lib/decorators";
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

import type {
  AuthenticationBody,
  authenticationSchema,
} from "#/controller/authentication/authentication.schema";
import UserController from "#/controller/user";
import type { userCreationSchema, userValidationSchema } from "#/controller/user/user.schema";
import { Log } from "#/lib/logger/decorators";
import { db } from "#/lib/prisma";
import userError from "#/lib/router/http/userError";
import UserError from "#/lib/router/http/userError";
import jwt from "jsonwebtoken";

export default class AuthenticationController {
  private secret?: string = process.env.JWT_SECRET;
  private static REFRESH_TOKEN_EXPIRATION = 60 * 60 * 24 * 7 * 1000; // 7 days in ms
  private static TOKEN_EXPIRATION = 60 * 15 * 1000; // 15 minutes in ms

  async createRefreshToken(userId: string): Promise<string> {
    if (!this.secret) throw new Error("JWT secret is not defined");
    const refreshToken = jwt.sign({ userId }, this.secret, {
      expiresIn: AuthenticationController.REFRESH_TOKEN_EXPIRATION, // in seconds
      algorithm: "HS256",
    });

    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userID: userId,
        expiresAt: new Date(Date.now() + AuthenticationController.REFRESH_TOKEN_EXPIRATION),
      },
    });

    return refreshToken;
  }

  async refreshToken(refreshToken: string) {
    if (!this.secret) throw new Error("JWT secret is not defined");
    const refreshTokenData = await db.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
      include: {
        user: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
      },
    });
    if (!refreshTokenData) throw new UserError(401, "Invalid refresh token");
    if (refreshTokenData.expiresAt < new Date()) {
      await db.refreshToken.delete({
        where: {
          id: refreshTokenData.id,
        },
      });
      throw new UserError(401, "Refresh token expired");
    }

    const token = await this.generateToken({
      userId: refreshTokenData.user.id,
      name: refreshTokenData.user.name,
      email: refreshTokenData.user.email,
    });
    await db.refreshToken.update({
      where: {
        id: refreshTokenData.id,
      },
      data: {
        expiresAt: new Date(Date.now() + AuthenticationController.REFRESH_TOKEN_EXPIRATION),
      },
    });
    return token;
  }

  generateToken(user: AuthenticationBody): authenticationSchema {
    if (!this.secret) throw new Error("JWT secret is not defined");
    const token = jwt.sign(user, this.secret, {
      expiresIn: AuthenticationController.TOKEN_EXPIRATION,
      algorithm: "HS256",
    });
    return token;
  }

  async validateToken(token: string): Promise<UserController> {
    if (!this.secret) throw new Error("JWT secret is not defined");
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ["HS256"],
      }) as AuthenticationBody;
      return await UserController.getById(decoded.userId);
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
    refreshToken: string;
  }> {
    const user = await UserController.validateCredentials(credentials);
    const refreshToken = await this.createRefreshToken(user.JSON.id);

    const token = this.generateToken({
      userId: user.JSON.id,
      name: user.JSON.name,
      email: user.JSON.email,
    });
    return { token, user, refreshToken };
  }

  @Log()
  async signUp(userData: userCreationSchema): Promise<{
    token: ReturnType<AuthenticationController["generateToken"]>;
    user: UserController;
    refreshToken: string;
  }> {
    const user = await UserController.create(userData);
    const refreshToken = await this.createRefreshToken(user.JSON.id);
    const token = this.generateToken({
      userId: user.JSON.id,
      name: user.JSON.name,
      email: user.JSON.email,
    });

    return { token, user, refreshToken };
  }
}

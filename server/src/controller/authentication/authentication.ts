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
import crypto from "crypto";

export interface TokenContext {
  userAgent?: string;
  ipAddress?: string;
}

export default class AuthenticationController {
  private secret?: string = process.env.JWT_SECRET;
  private static REFRESH_TOKEN_EXPIRATION: jwt.SignOptions["expiresIn"] = "7d"; // 7 days in ms
  public static REFRESH_TOKEN_EXPIRATION_MS: number = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  private static TOKEN_EXPIRATION: jwt.SignOptions["expiresIn"] = "15m"; // 15 minutes in ms

  async createRefreshToken(userId: string, context?: TokenContext): Promise<string> {
    if (!this.secret) throw new Error("JWT secret is not defined");
    const refreshToken = jwt.sign(
      { userId, salt: crypto.randomBytes(32).toString("hex") },
      this.secret,
      {
        expiresIn: AuthenticationController.REFRESH_TOKEN_EXPIRATION, // in seconds
        algorithm: "HS256",
      },
    );

    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userID: userId,
        userAgent: context?.userAgent,
        ipAddress: context?.ipAddress,
        expiresAt: new Date(Date.now() + AuthenticationController.REFRESH_TOKEN_EXPIRATION_MS),
      },
    });

    return refreshToken;
  }

  async revokeRefreshToken(refreshToken: string) {
    if (!this.secret) throw new Error("JWT secret is not defined");
    await db.refreshToken.deleteMany({
      where: {
        token: refreshToken,
      },
    });
  }

  async validateRefreshToken(refreshToken: string): Promise<AuthenticationBody> {
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

    if (!refreshTokenData) throw new UserError(403, "Invalid refresh token");
    if (refreshTokenData.expiresAt < new Date()) {
      await db.refreshToken.deleteMany({
        where: {
          userID: refreshTokenData.user.id,
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      throw new UserError(403, "Refresh token expired");
    }

    return {
      userId: refreshTokenData.user.id,
      name: refreshTokenData.user.name,
      email: refreshTokenData.user.email,
    };
  }

  async refreshToken(
    refreshToken: string,
    context?: TokenContext,
  ): Promise<{
    accessToken: authenticationSchema;
    refreshToken: string;
  }> {
    const refreshTokenData = await this.validateRefreshToken(refreshToken);
    await this.revokeRefreshToken(refreshToken);
    const newRefreshToken = await this.createRefreshToken(refreshTokenData.userId, context);
    const accessToken = await this.generateToken(refreshTokenData);

    return { accessToken, refreshToken: newRefreshToken };
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
      if (error instanceof jwt.NotBeforeError) throw new UserError(403, "Token not active yet");
      if (error instanceof jwt.JsonWebTokenError) throw new UserError(403, "Invalid token");
      if (error instanceof userError) {
        if (error.status === 404) throw new UserError(403, "Token validation failed");
        throw error;
      }
      throw new UserError(500, "Token validation failed");
    }
  }

  @Log()
  async signIn(
    credentials: userValidationSchema,
    context?: TokenContext,
  ): Promise<{
    token: ReturnType<AuthenticationController["generateToken"]>;
    user: UserController;
    refreshToken: string;
  }> {
    const user = await UserController.validateCredentials(credentials);
    const refreshToken = await this.createRefreshToken(user.JSON.id, context);

    const token = this.generateToken({
      userId: user.JSON.id,
      name: user.JSON.name,
      email: user.JSON.email,
    });
    return { token, user, refreshToken };
  }

  @Log()
  async signUp(
    userData: userCreationSchema,
    context?: TokenContext,
  ): Promise<{
    token: ReturnType<AuthenticationController["generateToken"]>;
    user: UserController;
    refreshToken: string;
  }> {
    const user = await UserController.create(userData);
    const refreshToken = await this.createRefreshToken(user.JSON.id, context);
    const token = this.generateToken({
      userId: user.JSON.id,
      name: user.JSON.name,
      email: user.JSON.email,
    });

    return { token, user, refreshToken };
  }
}

// types/express/index.d.ts
import "express";
import type UserController from "#/controller/user";

declare global {
  namespace Express {
    interface Locals {
      user?: UserController;
      params?: Record<string, any>;
      query?: Record<string, any>;
      body?: Record<string, any>;
    }
  }
}

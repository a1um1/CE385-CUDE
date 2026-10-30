// types/express/index.d.ts
import "express";
import type UserService from "#/service/user";

declare global {
  namespace Express {
    interface Locals {
      user?: UserService;
      params?: Record<string, any>;
      query?: Record<string, any>;
      body?: Record<string, any>;
    }
  }
}

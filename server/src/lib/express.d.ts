// types/express/index.d.ts
import "express";

declare global {
  namespace Express {
    interface Request {
      ctx?: {
        user?: UserController;
        params?: Record<string, any>;
        query?: Record<string, any>;
        body?: Record<string, any>;
      };
    }
  }
}

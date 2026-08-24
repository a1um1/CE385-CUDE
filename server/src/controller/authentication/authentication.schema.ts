import { z } from "#/lib/extendZod";
import type Zod from "zod";

export interface AuthenticationBody {
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

export type authenticationSchema = Zod.infer<typeof authenticationSchema>;

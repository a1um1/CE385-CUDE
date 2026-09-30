import { z } from "#/lib/extendZod";
import type Zod from "zod";

export interface AuthenticationBody {
  userId: string;
  name: string;
  email: string;
}

export const authenticationSchema = z.string().openapi("AuthenticationData");

export type authenticationSchema = Zod.infer<typeof authenticationSchema>;

export const authenticationResponseSchema = z
  .object({
    message: z.string().openapi("SuccessMessage"),
  })
  .openapi("AuthenticationResponseData");

export type authenticationResponseSchema = Zod.infer<typeof authenticationResponseSchema>;

import { z } from "#/lib/extendZod";
import type zod from "zod";

export const StoragePurposeSchema = z.enum(["avatar", "thumbnail"]).openapi("StoragePurpose");

export type StoragePurposeSchema = zod.infer<typeof StoragePurposeSchema>;

export const PresignUploadRequestSchema = z
  .object({
    purpose: StoragePurposeSchema,
    contentType: z.string().openapi({ example: "image/png" }),
    size: z
      .number()
      .int()
      .positive()
      .openapi({ example: 512_000, description: "Exact file size in bytes, signed into the PUT" }),
  })
  .openapi("PresignUploadRequest");

export type PresignUploadRequestSchema = zod.infer<typeof PresignUploadRequestSchema>;

export const PresignUploadResponseSchema = z
  .object({
    key: z.string().openapi({ example: "avatars/user_id/0f1e2d3c-....png" }),
    uploadUrl: z
      .string()
      .openapi({ example: "http://localhost:3900/cude/avatars/....png?X-Amz-Algorithm=..." }),
    accessUrl: z.string().openapi({ example: "http://cude.localhost:3902/avatars/....png" }),
    expiresIn: z.number().int().openapi({ example: 300 }),
  })
  .openapi("PresignUploadResponse");

export type PresignUploadResponseSchema = zod.infer<typeof PresignUploadResponseSchema>;

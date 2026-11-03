import { z } from "#/lib/extendZod";
import type zod from "zod";

const YouTubeUrlSchema = z.url().refine((value) => {
  const url = new URL(value);
  return (
    url.protocol === "https:" &&
    [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be",
      "www.youtube-nocookie.com",
    ].includes(url.hostname.toLowerCase())
  );
}, "A valid HTTPS YouTube URL is required");

const VideoTagNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .transform((tag) => tag.toLowerCase());

export const VideoTagSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
  })
  .openapi("VideoTag");

export type VideoTagSchema = zod.infer<typeof VideoTagSchema>;

const VideoTagsSchema = z
  .array(VideoTagNameSchema)
  .max(20)
  .default([])
  .refine((tags) => new Set(tags).size === tags.length, "Tags must be unique");

export const VideoSchema = z
  .object({
    id: z.uuidv7(),
    title: z.string(),
    youtubeUrl: z.url(),
    author: z.string().nullable(),
    tags: z.array(VideoTagSchema),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi("Video");

export type VideoSchema = zod.infer<typeof VideoSchema>;

const VideoInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  youtubeUrl: YouTubeUrlSchema,
  author: z.string().trim().max(200).nullable().optional().default(null),
  tags: VideoTagsSchema,
});

export const VideoCreateSchema = VideoInputSchema.openapi("VideoCreate");
export const VideoUpdateSchema = VideoInputSchema.openapi("VideoUpdate");

export type VideoInput = zod.infer<typeof VideoCreateSchema>;

export const VideoQuerySchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    tag: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .transform((value) => value.toLowerCase())
      .optional(),
  })
  .openapi("VideoQuery");

export type VideoQuery = zod.infer<typeof VideoQuerySchema>;
export { default } from "./video";

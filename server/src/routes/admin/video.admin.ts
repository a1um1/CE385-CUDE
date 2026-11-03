import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import { GenericResponseSchema } from "#/lib/router/http/genericResponse";
import VideoService from "#/service/video";
import {
  VideoCreateSchema,
  VideoListResponseSchema,
  VideoQuerySchema,
  VideoSchema,
  VideoTagSchema,
  VideoUpdateSchema,
} from "#/service/video/video.schema";

const adminVideoRouter = new CustomRouter({
  prefix: "/admin/video",
  tags: ["Admin Video Management"],
  authentication: ["ADMIN"],
})
  .get(
    "/",
    {
      summary: "Search and list video resources",
      description:
        "Cursor-paginated list of videos, optionally searching by title or tag. `search` matches title text or an exact tag; `tag` filters by an exact tag. Sort by `title`, `author`, `createdAt`, `updatedAt` or `id`. Requires an ADMIN token.",
      query: VideoQuerySchema,
      response: VideoListResponseSchema,
    },
    ({ query }) => VideoService.getAll(query),
  )
  .get(
    "/tags",
    {
      summary: "List video tags",
      description: "List every video tag, sorted by name. Requires an ADMIN token.",
      response: z.array(VideoTagSchema),
    },
    () => VideoService.getAllTags(),
  )
  .get(
    "/:videoId",
    {
      summary: "Get a video resource",
      description: "Get a video resource by ID. Requires an ADMIN token.",
      params: z.object({ videoId: z.uuidv7() }),
      response: VideoSchema,
    },
    ({ params }) => VideoService.getById(params.videoId),
  )
  .post(
    "/",
    {
      summary: "Create a video resource",
      description: "Create a video resource with a YouTube URL and tags. Requires an ADMIN token.",
      body: VideoCreateSchema,
      response: VideoSchema,
    },
    ({ body }) => VideoService.create(body),
  )
  .put(
    "/:videoId",
    {
      summary: "Update a video resource",
      description: "Replace a video's details and tags. Requires an ADMIN token.",
      params: z.object({ videoId: z.uuidv7() }),
      body: VideoUpdateSchema,
      response: VideoSchema,
    },
    ({ params, body }) => VideoService.update(params.videoId, body),
  )
  .delete(
    "/:videoId",
    {
      summary: "Delete a video resource",
      description: "Delete a video resource by ID. Requires an ADMIN token.",
      params: z.object({ videoId: z.uuidv7() }),
      response: GenericResponseSchema,
    },
    async ({ params }) => {
      await VideoService.delete(params.videoId);
      return { message: "Video deleted successfully" };
    },
  );

export const adminVideoRoute = adminVideoRouter.route;

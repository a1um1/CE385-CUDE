import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import VideoService from "#/service/video";
import {
  VideoAuthorSchema,
  VideoListResponseSchema,
  VideoQuerySchema,
  VideoTagWithCountSchema,
} from "#/service/video/video.schema";

const videoRouter = new CustomRouter({
  prefix: "/video",
  tags: ["Video"],
  authentication: true,
})
  .get(
    "/",
    {
      summary: "List videos",
      description:
        "Cursor-paginated list of videos. `search` matches the title, `tag` filters by an exact tag name and `author` filters by an exact author. Requires an authenticated user.",
      query: VideoQuerySchema,
      response: VideoListResponseSchema,
    },
    ({ query }) => VideoService.getAll(query),
  )
  .get(
    "/tags",
    {
      summary: "List video tags",
      description:
        "List every video tag with the number of videos using it. Requires an authenticated user.",
      response: z.array(VideoTagWithCountSchema),
    },
    () => VideoService.getAllTags(),
  )
  .get(
    "/authors",
    {
      summary: "List video authors",
      description:
        "List every video author with the number of videos they published. Requires an authenticated user.",
      response: z.array(VideoAuthorSchema),
    },
    () => VideoService.getAllAuthors(),
  );

export const videoRoute = videoRouter.route;

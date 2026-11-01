import EventService from "#/service/event";
import { EventSchema } from "#/service/event/event.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const eventRouter = new CustomRouter({
  prefix: "/event",
  tags: ["Event"],
  authentication: true,
})
  .get(
    "/",
    {
      summary: "List scheduled events",
      description:
        "Return all scheduled events ordered by start time. Requires an authenticated user.",
      response: z.array(EventSchema),
    },
    () => EventService.getAll(),
  )
  .get(
    "/:eventId",
    {
      summary: "Get an event",
      description: "Return one scheduled event. Requires an authenticated user.",
      params: z.object({ eventId: z.uuidv7() }),
      response: EventSchema,
    },
    ({ params }) => EventService.getById(params.eventId),
  );

export const eventRoute = eventRouter.route;

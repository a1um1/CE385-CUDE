import EventService from "#/service/event";
import { EventSchema } from "#/service/event/event.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const eventRouter = new CustomRouter({
  prefix: "/v1/event",
  tags: ["Event"],
  authentication: true,
})
  .get(
    "/",
    {
      summary: "List upcoming events",
      description:
        "List all upcoming events, sorted by start time. Requires an authenticated user.",
      response: EventSchema.array(),
    },
    () => EventService.getUpcomingEvents(),
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

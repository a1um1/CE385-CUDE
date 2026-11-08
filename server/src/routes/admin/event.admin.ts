import EventService from "#/service/event";
import {
  AdminEventListResponseSchema,
  AdminEventQuerySchema,
  EventCreateSchema,
  EventSchema,
  EventUpdateSchema,
} from "#/service/event/event.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import { GenericResponseSchema } from "#/lib/router/http/genericResponse";

const adminEventRouter = new CustomRouter({
  prefix: "/v1/admin/event",
  tags: ["Admin Event Management"],
  authentication: ["ADMIN"],
})
  .get(
    "/",
    {
      summary: "Get a paginated list of scheduled events",
      description: "Get a paginated list of scheduled events. Requires an ADMIN token.",
      query: AdminEventQuerySchema,
      response: AdminEventListResponseSchema,
    },
    ({ query }) => EventService.getPaginateLists(query),
  )
  .post(
    "/",
    {
      summary: "Create a scheduled event",
      description: "Create an event such as an exam or a guest talk. Requires an ADMIN token.",
      body: EventCreateSchema,
      response: EventSchema,
    },
    ({ body }) => EventService.create(body),
  )
  .put(
    "/:eventId",
    {
      summary: "Update a scheduled event",
      description: "Update an event's details. Requires an ADMIN token.",
      params: z.object({ eventId: z.uuidv7() }),
      body: EventUpdateSchema,
      response: EventSchema,
    },
    ({ params, body }) => EventService.update(params.eventId, body),
  )
  .delete(
    "/:eventId",
    {
      summary: "Delete a scheduled event",
      description: "Delete a scheduled event. Requires an ADMIN token.",
      params: z.object({ eventId: z.uuidv7() }),
      response: GenericResponseSchema,
    },
    async ({ params }) => {
      await EventService.delete(params.eventId);
      return { message: "Event deleted successfully" };
    },
  );

export const adminEventRoute = adminEventRouter.route;

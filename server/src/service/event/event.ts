import { cursorArgs, isBackward, paginate } from "#/lib/pagination";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import UserError from "#/lib/router/http/userError";
import { eventRepository } from "#/repository/event.repository";
import type {
  AdminEventListResponse,
  AdminEventQuery,
  EventCreate,
  EventData,
  EventUpdate,
} from "#/service/event/event.schema";

const EventService = {
  async getPaginateLists(query: AdminEventQuery): Promise<AdminEventListResponse> {
    const orderBy = buildCursorOrderBy(
      query.sortBy ?? "startAt",
      query.sortOrder,
      isBackward(query),
    );
    const data = await eventRepository.findPage({
      ...cursorArgs(query),
      orderBy,
    });

    return paginate(data, query);
  },

  async getUpcomingEvents(): Promise<EventData[]> {
    return eventRepository.findPage({
      where: eventRepository.upcomingWhere(),
      take: 100,
      skip: 0,
      orderBy: [{ startAt: "asc" }, { id: "asc" }],
    });
  },

  async getById(id: string): Promise<EventData> {
    const event = await eventRepository.findById(id);
    if (!event) throw new UserError(404, "Event not found");
    return event;
  },

  create(data: EventCreate): Promise<EventData> {
    return eventRepository.create(data);
  },

  async update(id: string, data: EventUpdate): Promise<EventData> {
    await this.getById(id);
    return eventRepository.update(id, data);
  },

  async delete(id: string): Promise<void> {
    const result = await eventRepository.delete(id);
    if (result.count === 0) throw new UserError(404, "Event not found");
  },
};

export default EventService;

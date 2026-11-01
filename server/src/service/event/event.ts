import UserError from "#/lib/router/http/userError";
import { eventRepository } from "#/repository/event.repository";
import type { EventCreate, EventData, EventUpdate } from "#/service/event/event.schema";

const EventService = {
  getAll(): Promise<EventData[]> {
    return eventRepository.findAll();
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

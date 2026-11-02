import { describe, expect, it, vi } from "vitest";
import EventService from "#/service/event";
import { EventCreateSchema } from "#/service/event/event.schema";
import { mockDB } from "#/test/setup";

const EVENT_ID = "01a168fe-3f19-74cf-87be-aa358b64ea10";

const eventInput = {
  name: "Guest speaker",
  type: "TALK" as const,
  description: "An introduction to Python",
  startAt: new Date("2026-11-15T10:00:00Z"),
  endAt: new Date("2026-11-15T11:00:00Z"),
  speaker: "Ada Lovelace",
  location: "Room 1",
  url: null,
};

describe("EventService", () => {
  it("pages through all events for admins", async () => {
    mockDB.event.findMany.mockResolvedValueOnce([]);

    await EventService.getPaginateLists({
      perPage: 20,
      direction: "forward",
      sortOrder: "asc",
    });

    expect(mockDB.event.findMany).toHaveBeenCalledWith({
      take: 21,
      skip: 0,
      cursor: undefined,
      orderBy: [{ startAt: "asc" }, { id: "asc" }],
      where: undefined,
    });
  });

  it("lists upcoming events, compared by day", async () => {
    mockDB.event.findMany.mockResolvedValueOnce([]);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 15, 15, 0, 0));

    try {
      await EventService.getUpcomingEvents();
    } finally {
      vi.useRealTimers();
    }

    expect(mockDB.event.findMany).toHaveBeenCalledWith({
      take: 100,
      skip: 0,
      orderBy: [{ startAt: "asc" }, { id: "asc" }],
      where: { startAt: { gte: new Date(2026, 10, 15) } },
    });
  });

  it("parses ISO schedule strings and rejects an invalid time range", () => {
    const parsed = EventCreateSchema.parse({
      ...eventInput,
      startAt: "2026-11-15T10:00:00Z",
      endAt: "2026-11-15T11:00:00Z",
    });
    expect(parsed.startAt).toEqual(eventInput.startAt);

    expect(
      EventCreateSchema.safeParse({
        ...eventInput,
        startAt: "2026-11-15T11:00:00Z",
        endAt: "2026-11-15T10:00:00Z",
      }).success,
    ).toBe(false);

    expect(
      EventCreateSchema.safeParse({
        ...eventInput,
        startAt: null,
        endAt: "2026-11-15T11:00:00Z",
      }).success,
    ).toBe(false);
  });

  it("reports a missing event as 404", async () => {
    mockDB.event.findUnique.mockResolvedValueOnce(null);

    await expect(EventService.getById(EVENT_ID)).rejects.toMatchObject({
      status: 404,
      message: "Event not found",
    });
  });

  it("creates an event", async () => {
    mockDB.event.create.mockResolvedValueOnce({
      id: EVENT_ID,
      ...eventInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    await EventService.create(eventInput);

    expect(mockDB.event.create).toHaveBeenCalledWith({ data: eventInput });
  });

  it("updates an existing event", async () => {
    mockDB.event.findUnique.mockResolvedValueOnce({ id: EVENT_ID } as never);
    mockDB.event.update.mockResolvedValueOnce({
      id: EVENT_ID,
      ...eventInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    await EventService.update(EVENT_ID, eventInput);

    expect(mockDB.event.update).toHaveBeenCalledWith({
      where: { id: EVENT_ID },
      data: eventInput,
    });
  });

  it("returns 404 when deleting a missing event", async () => {
    mockDB.event.deleteMany.mockResolvedValueOnce({ count: 0 });

    await expect(EventService.delete(EVENT_ID)).rejects.toMatchObject({
      status: 404,
      message: "Event not found",
    });
  });
});

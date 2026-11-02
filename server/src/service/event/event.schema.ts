import type { Event } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import {
  createCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination.schema";
import type zod from "zod";

export const EventTypeSchema = z.enum(["EXAM", "TALK", "OTHER"]).openapi({
  example: "TALK",
});

export const EventSchema = z
  .object({
    id: z.uuidv7().openapi({ example: "event_id" }),
    name: z.string().openapi({ example: "Guest speaker: Introduction to Python" }),
    type: EventTypeSchema,
    description: z.string().nullable(),
    startAt: z.date().openapi({ example: "2026-11-15T10:00:00Z" }),
    endAt: z.date().openapi({ example: "2026-11-15T11:00:00Z" }),
    speaker: z.string().nullable(),
    location: z.string().nullable(),
    url: z.url().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi("Event");

export type EventSchema = zod.infer<typeof EventSchema>;
export type EventData = Event;

const eventFields = {
  name: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .openapi({ example: "Guest speaker: Introduction to Python" }),
  type: EventTypeSchema,
  description: z.string().nullable().optional(),
  startAt: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value))
    .openapi({ example: "2026-11-15T10:00:00Z" }),
  endAt: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value))
    .openapi({ example: "2026-11-15T11:00:00Z" }),
  speaker: z.string().trim().max(200).nullable().optional(),
  location: z.string().trim().max(300).nullable().optional(),
  url: z.url().nullable().optional(),
};

const EventInputSchema = z.object(eventFields).refine((event) => event.endAt > event.startAt, {
  message: "Event end time must be after its start time",
  path: ["endAt"],
});

export const EventCreateSchema = EventInputSchema.openapi("EventCreate");
export const EventUpdateSchema = EventInputSchema.openapi("EventUpdate");

export type EventCreate = zod.infer<typeof EventCreateSchema>;
export type EventUpdate = EventCreate;

export const AdminEventQuerySchema = createCursorPaginationQuerySchema(
  ["name", "startAt", "createdAt", "updatedAt", "id"],
  "AdminEventQuery",
).extend({ sortOrder: z.enum(["asc", "desc"]).default("asc") });

export type AdminEventQuery = zod.infer<typeof AdminEventQuerySchema>;

export const AdminEventListResponseSchema = createCursorPaginationResponseSchema(
  EventSchema,
  "AdminEventListResponse",
);

export type AdminEventListResponse = zod.infer<typeof AdminEventListResponseSchema>;

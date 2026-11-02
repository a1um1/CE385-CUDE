import type { Meta, StoryObj } from "@storybook/react";
import EventCard from "./eventCard";

const meta = {
  title: "Components/EventCard",
  component: EventCard,
  tags: ["autodocs"],
  argTypes: {
    onClick: { action: "clicked" },
  },
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseEvent = {
  id: "event",
  description: null,
  speaker: null,
  url: null,
  createdAt: "2026-10-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
};

export const Default: Story = {
  args: {
    event: {
      ...baseEvent,
      name: "CE Annual Code Battle 2026",
      type: "TALK",
      startAt: "2026-10-31T09:00:00Z",
      endAt: "2026-10-31T17:00:00Z",
      location: "At Engineering Hall 4",
    },
  },
};

export const CustomColors: Story = {
  args: {
    event: {
      ...baseEvent,
      name: "Campus ICPC Selection",
      type: "EXAM",
      startAt: "2026-11-15T09:00:00Z",
      endAt: "2026-11-15T12:00:00Z",
      location: "At Lab 301, Dept of CE",
    },
  },
};

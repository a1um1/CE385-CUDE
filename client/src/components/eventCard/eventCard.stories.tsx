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

export const Default: Story = {
  args: {
    event: {
      day: "31",
      month: "OCT",
      title: "CE Annual Code Battle 2026",
      location: "At Engineering Hall 4",
      dateColor: "#ffaeae",
    },
  },
};

export const CustomColors: Story = {
  args: {
    event: {
      day: "15",
      month: "NOV",
      title: "Campus ICPC Selection",
      location: "At Lab 301, Dept of CE",
      dateColor: "#fed166",
    },
  },
};

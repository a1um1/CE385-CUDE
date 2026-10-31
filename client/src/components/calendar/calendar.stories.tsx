import Calendar from "./calendar";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  argTypes: {
    month: { control: "number", min: 1, max: 12 },
    year: { control: "number" },
  },
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    activityData: Array.from(
      { length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() },
      (_, i) => i + 1,
    ).reduce(
      (acc, day) => {
        acc[`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${day}`] = Number(
          Math.random().toFixed(2),
        );
        return acc;
      },
      {} as Record<string, number>,
    ),
  },
};

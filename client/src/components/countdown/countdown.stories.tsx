import Countdown from "./countdown";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Countdown",
  component: Countdown,
  tags: ["autodocs"],
  argTypes: {
    targetDate: {
      control: { type: "date" },
    },
  },
} satisfies Meta<typeof Countdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    targetDate: new Date(Date.now() + 10 * 60 * 24).toISOString(), // 1 day from now
  },
};

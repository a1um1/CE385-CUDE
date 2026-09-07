import type { Meta, StoryObj } from "@storybook/react";
import { QuestBar } from "./quest-bar";

const meta: Meta<typeof QuestBar> = {
  title: "Components/QuestBar",
  component: QuestBar,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "light-gray",
      values: [
        { name: "light-gray", value: "#FFC4C8" },
        { name: "white", value: "#FFFFFF" },
      ],
    },
  },
  tags: ["autodocs"],
  argTypes: {
    current: {
      control: { type: "number", min: 0, max: 9999, step: 1 },
      description: "ค่าปัจจุบัน ต้องไม่เกิน max",
    },
  },
};

export default meta;
type Story = StoryObj<typeof QuestBar>;

export const Default: Story = {
  args: {
    current: 15,
    max: 30,
  },
};

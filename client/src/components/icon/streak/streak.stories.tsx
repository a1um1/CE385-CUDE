import Streak from "./streak";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Icon/Streak",
  component: Streak,
  tags: ["autodocs"],
  argTypes: {
    size: {
      type: "number",
    },
  },
} satisfies Meta<typeof Streak>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: 24,
  },
};

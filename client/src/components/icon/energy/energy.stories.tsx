import Energy from "./enegry";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Icon/Energy",
  component: Energy,
  tags: ["autodocs"],
  argTypes: {
    size: {
      type: "number",
    },
  },
} satisfies Meta<typeof Energy>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: 24,
  },
};

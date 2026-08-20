import Gem from "./gem";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Icon/Gem",
  component: Gem,
  tags: ["autodocs"],
  argTypes: {
    size: {
      type: "number",
    },
  },
} satisfies Meta<typeof Gem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: 24,
  },
};

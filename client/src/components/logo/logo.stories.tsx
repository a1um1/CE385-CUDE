import Logo from "./logo";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Logo",
  component: Logo,
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["normal", "admin"],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    type: "normal",
  },
};

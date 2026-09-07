import Avatar from "./avatar";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    name: {
      type: "string",
    },
    avatarUrl: {
      type: "string",
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    name: "John Doe",
    avatarUrl: "https://picsum.photos/200/300",
    size: "",
  },
};

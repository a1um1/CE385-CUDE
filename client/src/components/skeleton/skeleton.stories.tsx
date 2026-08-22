import Skeleton from "./skeleton";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    width: { control: "text" },
    height: { control: "text" },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    width: "100px",
    height: "20px",
  },
};

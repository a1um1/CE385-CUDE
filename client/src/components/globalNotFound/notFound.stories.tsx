import NotFound from "./notFound";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Not Found",
  component: NotFound,
  tags: ["autodocs"],
} satisfies Meta<typeof NotFound>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

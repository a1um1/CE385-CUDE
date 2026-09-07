import Alert from "#/components/alert";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
    },
    children: {
      control: "text",
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  args: {
    children: "Hello world",
    variant: "success",
  },
};

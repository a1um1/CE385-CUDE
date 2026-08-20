import Input from "./input";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md"],
    },
    radius: {
      control: { type: "select" },
      options: ["default", "none"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    noBorder: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: "md",
    disabled: false,
    radius: "default",
    noBorder: false,
    readOnly: false,
    placeholder: "Placeholder...",
  },
};

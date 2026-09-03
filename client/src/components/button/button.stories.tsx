import Button, { ButtonInnerAlignments, ButtonRadius, ButtonSizes, ButtonVariants } from "./button";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: Object.keys(ButtonVariants) as (keyof typeof ButtonVariants)[],
    },
    size: { control: "select", options: Object.keys(ButtonSizes) as (keyof typeof ButtonSizes)[] },
    radius: {
      control: "select",
      options: Object.keys(ButtonRadius) as (keyof typeof ButtonRadius)[],
    },
    disabled: { control: "boolean" },
    block: { control: "boolean" },
    align: {
      control: "select",
      options: Object.keys(ButtonInnerAlignments) as (keyof typeof ButtonInnerAlignments)[],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: "Button",

    variant: "primary",
    size: "lg",
    disabled: false,
    radius: "pilled",
    block: true,
  },
};

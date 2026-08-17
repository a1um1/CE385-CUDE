import { ButtonRadius, ButtonSizes, ButtonVariants } from "#/components/button/button";
import ButtonLink from "./buttonLink";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Button Link",
  component: ButtonLink,
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
    to: { control: "text" },
    target: { control: "text" },
  },
} satisfies Meta<typeof ButtonLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: "Button Link",
    variant: "primary",
    size: "md",
    disabled: false,
    radius: "none",
    block: true,
    to: "http://google.com",
    target: "_blank",
  },
};

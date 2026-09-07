import type { Meta, StoryObj } from "@storybook/react";
import { Selector } from "./selector";

const meta = {
  title: "Components/Selector",
  component: Selector,
  tags: ["autodocs"],
  argTypes: {
    isActive: { control: "boolean" },
    iconUrl: { control: "text" },
  },
} satisfies Meta<typeof Selector>;

export default meta;

type Story = StoryObj<typeof meta>;

const defaultArgs = {
  label: "Python",
  iconUrl: "https://www.jetbrains.com/guide/assets/thumbnail-ab255c68.png",
  isActive: false,
};

export const Playground: Story = {
  args: defaultArgs,
};

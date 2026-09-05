import type { Meta, StoryObj } from "@storybook/react";
import { Selector } from "./selector"


const meta = {
  title: "Components/Selector",
  component: Selector,
  tags: ["autodocs"],
  argTypes: {
    bgColor: { control: "color" },
    selectedBgColor: { control: "color" },
    outlineColor: { control: "color" },
    textColor: { control: "color" },
    selected: { control: "boolean" },
    iconUrl: { control: "text"}, 
    size: { control: "text"}
  },
}  satisfies Meta <typeof Selector>;

export default meta;

type Story = StoryObj<typeof meta>;

const defaultArgs = {
  label: "Python",
  iconUrl: "https://www.jetbrains.com/guide/assets/thumbnail-ab255c68.png",
  selected: false,
  bgColor: "#f0f0f0",
  selectedBgColor: "#306998",
  outlineColor: "#4B8BBE",
  textColor: "#000",
  size: "250px",
};

export const Playground: Story = {
    args:defaultArgs
};

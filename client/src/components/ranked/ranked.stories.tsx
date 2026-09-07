import { Ranked } from "./ranked";
import type { Meta } from "@storybook/react";

const meta = {
  title: "Components/Ranked",
  component: Ranked,
  tags: ["autodocs"],
  argTypes: {
    shape: { control: "radio", options: ["hexagon", "square"] },
    rank: { conTrol: "text" },
    size: { control: "text" },
    bgColor: { control: "color" },
    borderColor: { control: "color" },
    textColor: { control: "color" },
  },
} satisfies Meta<typeof Ranked>;

export default meta;

export const Playground = {};

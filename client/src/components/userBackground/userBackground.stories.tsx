import UserBackground from "./userBackground";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/User Background",
  component: UserBackground,
  tags: ["autodocs"],
  argTypes: {
    name: {
      type: "string",
    },
    backgroundUrl: {
      type: "string",
    },
  },
} satisfies Meta<typeof UserBackground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    name: "John Doe",
    backgroundUrl:
      "https://github.com/vyrx-dev/Wallpapers/blob/master/gruvbox/ign-waifu.png?raw=true",
  },
};

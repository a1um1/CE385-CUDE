import type { Meta, StoryObj } from "@storybook/react";
import Divider from "./divider";

const meta = {
  title: "Components/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {},
};

export const Vertical: Story = {
  args: { orientation: "vertical", className: "self-stretch" },
  decorators: [
    (Story) => (
      <div style={{ height: 120, display: "flex" }}>
        <Story />
      </div>
    ),
  ],
};

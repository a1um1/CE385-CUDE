import type { Meta, StoryObj } from "@storybook/react";
import { CourseCard } from "./courseCard";

const meta = {
  title: "Components/CourseCard",
  component: CourseCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    onClick: { action: "clicked" },
    icon: {
      control: "radio",
      options: ["python", "c"],
    },
  },
} satisfies Meta<typeof CourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Python: Story = {
  args: {
    name: "Python Programming",
    color: "#F7C948",
    icon: "python",
  },
};

export const C: Story = {
  args: {
    name: "C Programming",
    color: "#00599C",
    icon: "c",
  },
};

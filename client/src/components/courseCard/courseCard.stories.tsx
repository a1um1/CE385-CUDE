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
    badge: {
      control: "text",
    },
    shortDescription: {
      control: "text",
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
    shortDescription: "Learn Python programming from scratch.",
    badge: "Beginner Friendly",
  },
};

export const C: Story = {
  args: {
    name: "C Programming",
    color: "#00599C",
    icon: "c",
    shortDescription: "Master the C programming language.",
    badge: "Intermediate Level",
  },
};

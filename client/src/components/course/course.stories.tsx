import type { Meta, StoryObj } from "@storybook/react";
import { Course } from "./course";

const meta: Meta<typeof Course> = {
  title: "Components/Course",
  component: Course,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "radio",
      options: ["available", "ongoing", "passed", "failed", "unavailable"],
    },
    label: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Course>;

export const Default: Story = {
  args: {
    status: "ongoing",
    label: "Subject",
  },
};

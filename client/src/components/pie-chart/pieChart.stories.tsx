import type { Meta, StoryObj } from "@storybook/react";
import { PieChart } from "./pieChart";

const meta: Meta<typeof PieChart> = {
  title: "Components/PieChart",
  component: PieChart,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#1E1E24" }],
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PieChart>;

export const LessonStatus: Story = {
  args: {
    data: [
      { name: "Passed", value: 42, fill: "var(--color-success)" },
      { name: "Failed", value: 15, fill: "var(--color-danger)" },
      { name: "Pending", value: 9, fill: "var(--color-warning)" },
    ],
  },
  argTypes: {
    data: {
      control: "object",
      description: "Mock lesson status counts (passed / failed / pending)",
    },
  },
};

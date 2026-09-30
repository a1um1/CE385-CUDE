import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./progress-bar";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light-gray",
      values: [
        { name: "light-gray", value: "#F4F4F5" },
        { name: "white", value: "#FFFFFF" },
      ],
    },
  },
  tags: ["autodocs"], // ใช้สำหรับการสร้างเอกสารอัตโนมัติใน Storybook

  decorators: [
    (Story) => (
      // กำหนดความกว้างของ container ให้เป็น 500px เพื่อให้เห็นความคืบหน้าได้ชัดเจน
      <div style={{ width: "500px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Playground: Story = {
  args: {
    progress: 0,
  },
  argTypes: {
    progress: {
      control: { type: "range", min: 0, max: 100, step: 1 }, // type range คือการปรับค่าความคืบหน้าแบบเลื่อน (slider) โดยมีค่าต่ำสุดคือ 0 และค่าสูงสุดคือ 100
      description: "ปรับค่าความคืบหน้าของหลอด (0-100)",
    },
    color: {
      control: "text",
      description: "สีของแถบเต็ม รับค่าเป็น CSS color ใดๆ (ค่าเริ่มต้นคือ --color-success)",
    },
    height: {
      control: "text",
      description: "ความสูงของหลอด เช่น 6px หรือ 2rem (ค่าเริ่มต้นคือ 48px)",
    },
  },
};

export const CustomColor: Story = {
  args: {
    progress: 65,
    color: "var(--color-primary)",
  },
};

export const Thin: Story = {
  args: {
    progress: 40,
    height: "6px",
    color: "var(--color-warning)",
  },
};

export const Accessible: Story = {
  args: {
    progress: 75,
    height: "6px",
    role: "progressbar",
    "aria-label": "Quest completion",
    "aria-valuenow": 75,
    "aria-valuemin": 0,
    "aria-valuemax": 100,
  },
};

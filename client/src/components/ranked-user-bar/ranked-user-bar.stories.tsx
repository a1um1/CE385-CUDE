import type { Meta, StoryObj } from "@storybook/react";
import { RankedUserBar } from "./ranked-user-bar";

const meta: Meta<typeof RankedUserBar> = {
  title: "Components/RankedUserBar",
  component: RankedUserBar,
  parameters: {
    layout: "centered",
    backgrounds: {
      values: [{ name: "dark", value: "#1E293B" }],
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "600px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RankedUserBar>;

export const Playground: Story = {
  args: {
    rank: 9999,
    avatarUrl: "https://picsum.photos/200/300",
    username: "Guest",
    streakDay: 0,
    xp: 10_000,
  },
  argTypes: {
    rank: {
      control: "number",
      description: "หมายเลขอันดับ (ด้านซ้ายสุด)",
    },
    avatarUrl: {
      control: "text",
      description: "ลิงก์รูปภาพโปรไฟล์ (URL)",
    },
    username: {
      control: "text",
      description: "ชื่อของผู้ใช้",
    },
    streakDay: {
      control: "number",
      description: "จำนวนวัน streak ต่อเนื่อง",
    },
    xp: {
      control: "number",
      description: "จำนวนคะแนน XP (ด้านขวาสุด)",
    },
  },
};

export const RankOne: Story = {
  args: {
    rank: 1,
    avatarUrl: "https://picsum.photos/200/300",
    username: "Bas",
    streakDay: 400,
    xp: 35_000,
  },
};

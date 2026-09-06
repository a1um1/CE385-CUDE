import type { Meta, StoryObj } from '@storybook/react';
import { RankedUserBar } from './ranked-user-bar';

const meta: Meta<typeof RankedUserBar> = {
  title: 'Components/RankedUserBar',
  component: RankedUserBar,
  parameters: {
    layout: 'centered', // จัดให้อยู่กึ่งกลางจอ
    backgrounds: {
      values: [
        { name: 'dark', value: '#1E293B' },
      ],
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      // สร้างกล่องความกว้าง 600px เพื่อจำลองการนำไปใช้งานจริง
      <div style={{ width: '600px' }}>
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
    avatarUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRijZL0R9g6v9QcVEjnT23gXppIhohhS2lZhlImaM4l7cW4K1jg7euM4NE6&s=10",
    username: 'Guest',
    streakText: '+ 0 year',
    xp: 0,
  },
  argTypes: {
    rank: {
      control: 'number',
      description: 'หมายเลขอันดับ (ด้านซ้ายสุด)',
    },
    avatarUrl: {
      control: 'text',
      description: 'ลิงก์รูปภาพโปรไฟล์ (URL)',
    },
    username: {
      control: 'text',
      description: 'ชื่อของผู้ใช้',
    },
    streakText: {
      control: 'text',
      description: 'ข้อความแสดงสถานะ (เช่น +3 year)',
    },
    xp: {
      control: 'number',
      description: 'จำนวนคะแนน XP (ด้านขวาสุด)',
    },
  },
};

// 👑 ตัวอย่างอันดับ 1
export const RankOne: Story = {
  args: {
    rank: 1,
    avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXcYXrY8DzfqpgpwuNjtfiDetIakS4__Xaeequj5mkWA&s=10',
    username: 'Bas',
    streakText: '+3 year',
    xp: 3000,
  },
};
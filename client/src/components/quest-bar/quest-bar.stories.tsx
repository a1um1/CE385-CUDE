import type { Meta, StoryObj } from '@storybook/react';
import { QuestBar } from './quest-bar';

const meta: Meta<typeof QuestBar> = {
  title: 'Components/QuestBar',
  component: QuestBar,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light-gray',
      values: [
        { name: 'light-gray', value: '#FFC4C8' },
        { name: 'white', value: '#FFFFFF' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    current: {
      control: { type: 'number', min: 0, max: 30, step: 1 },
      description: 'ค่าปัจจุบัน ต้องไม่เกิน max',
    },
    color: {
      control: 'color',
      description: 'สีของ progress ที่ทำสำเร็จ',
    },
    width: {
      control: { type: 'number', min: 0, max: 1200, default: 800, step: 1 },
      description: 'ความกว้างหน่วย px',
    },
    height: {
      control: { type: 'number', min: 0, max: 300, default: 128, step: 1 },
      description: 'ความสูงหน่วย px',
    },
  },
};

export default meta;
type Story = StoryObj<typeof QuestBar>;

// แบบ default (0/30)
export const Default: Story = {
  args: {
    current: 15,
    max: 30,
    color: '#4ade80',
    width: 800,
    height: 128,
  },
};

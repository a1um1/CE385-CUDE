import type { Meta, StoryObj } from "@storybook/react";
import { PasswordStrength } from "./passwordStrength";

const meta = {
  title: "Components/PasswordStrength",
  component: PasswordStrength,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "320px" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    value: { control: "text", description: "Current password value to evaluate" },
    showLabel: { control: "boolean" },
  },
} satisfies Meta<typeof PasswordStrength>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    value: "Abcdef1",
  },
};

export const Empty: Story = {
  args: {
    value: "",
  },
};

export const Weak: Story = {
  args: {
    value: "abc",
  },
};

export const Fair: Story = {
  args: {
    value: "Abcdef1",
  },
};

export const Strong: Story = {
  args: {
    value: "ValidPass123!",
  },
};

export const WithoutLabel: Story = {
  args: {
    value: "ValidPass123!",
    showLabel: false,
  },
};

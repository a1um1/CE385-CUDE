import type { Meta, StoryObj } from "@storybook/react";
import { PasswordRequirements } from "./passwordRequirements";

const meta = {
  title: "Components/PasswordRequirements",
  component: PasswordRequirements,
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
    title: { control: "text" },
  },
} satisfies Meta<typeof PasswordRequirements>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    value: "abc",
    title: "Password must meet all of the following:",
  },
};

export const Empty: Story = {
  args: {
    value: "",
  },
};

export const PartiallySatisfied: Story = {
  args: {
    value: "Abcdef1",
  },
};

export const FullySatisfied: Story = {
  args: {
    value: "ValidPass123!",
  },
};

export const TooLong: Story = {
  args: {
    value: "ThisPasswordIsWayTooLong123!",
  },
};

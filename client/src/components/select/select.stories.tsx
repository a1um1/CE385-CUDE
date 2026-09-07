import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Select from "./select";

const meta = {
  title: "Components/Select",
  component: Select.Root,
  tags: ["autodocs"],
} satisfies Meta<typeof Select.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: ({ size = "md", radius = "none", disabled = false }) => {
    const [value, setValue] = React.useState("c");

    const languages: Record<string, string> = {
      c: "C (GCC 13.2.0)",
      cpp: "C++ (GCC 13.2.0)",
      python: "Python (3.12.0)",
      javascript: "JavaScript (Node 20.9.0)",
      rust: "Rust (1.75.0)",
    };

    return (
      <div
        style={{
          minHeight: "280px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: "20px",
        }}
      >
        <Select.Root
          value={value}
          onValueChange={setValue}
          size={size}
          radius={radius}
          disabled={disabled}
        >
          <Select.Trigger style={{ minWidth: "220px" }}>
            <Select.Value placeholder="Select language">{languages[value]}</Select.Value>
          </Select.Trigger>
          <Select.Content align="start" sideOffset={6}>
            <Select.Item value="c">C (GCC 13.2.0)</Select.Item>
            <Select.Item value="cpp">C++ (GCC 13.2.0)</Select.Item>
            <Select.Item value="python">Python (3.12.0)</Select.Item>
            <Select.Item value="javascript">JavaScript (Node 20.9.0)</Select.Item>
            <Select.Item value="rust">Rust (1.75.0)</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    );
  },
};

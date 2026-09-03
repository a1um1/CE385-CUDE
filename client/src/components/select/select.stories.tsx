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
  render: () => {
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
        <Select.Root value={value} onValueChange={setValue}>
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

export const Sizes: Story = {
  render: () => {
    const [valXs, setValXs] = React.useState("xs");
    const [valSm, setValSm] = React.useState("sm");
    const [valMd, setValMd] = React.useState("md");

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "flex-start",
          padding: "20px",
        }}
      >
        <div>
          <p style={{ marginBottom: "6px", fontSize: "12px", color: "var(--color-muted, #888)" }}>
            Size XS
          </p>
          <Select.Root value={valXs} onValueChange={setValXs} size="xs">
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="xs">Extra Small Option</Select.Item>
              <Select.Item value="sm">Small Option</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <p style={{ marginBottom: "6px", fontSize: "12px", color: "var(--color-muted, #888)" }}>
            Size SM
          </p>
          <Select.Root value={valSm} onValueChange={setValSm} size="sm">
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="xs">Extra Small Option</Select.Item>
              <Select.Item value="sm">Small Option</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <p style={{ marginBottom: "6px", fontSize: "12px", color: "var(--color-muted, #888)" }}>
            Size MD
          </p>
          <Select.Root value={valMd} onValueChange={setValMd} size="md">
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="xs">Extra Small Option</Select.Item>
              <Select.Item value="sm">Small Option</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    );
  },
};

export const WithGroups: Story = {
  render: () => {
    const [value, setValue] = React.useState("react");

    return (
      <div
        style={{
          minHeight: "320px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: "20px",
        }}
      >
        <Select.Root value={value} onValueChange={setValue}>
          <Select.Trigger style={{ minWidth: "200px" }}>
            <Select.Value placeholder="Select framework" />
          </Select.Trigger>
          <Select.Content align="start">
            <Select.Group>
              <Select.GroupLabel>Frontend</Select.GroupLabel>
              <Select.Item value="react">React</Select.Item>
              <Select.Item value="vue">Vue</Select.Item>
              <Select.Item value="svelte">Svelte</Select.Item>
            </Select.Group>

            <Select.Separator />

            <Select.Group>
              <Select.GroupLabel>Backend</Select.GroupLabel>
              <Select.Item value="express">Express</Select.Item>
              <Select.Item value="nest">NestJS</Select.Item>
              <Select.Item value="fastapi">FastAPI</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "24px",
        padding: "20px",
      }}
    >
      <div>
        <p style={{ marginBottom: "6px", fontSize: "12px", color: "var(--color-muted, #888)" }}>
          Entire Select Disabled
        </p>
        <Select.Root disabled value="disabled-val">
          <Select.Trigger>
            <Select.Value>Disabled Select</Select.Value>
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="disabled-val">Disabled Select</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>

      <div>
        <p style={{ marginBottom: "6px", fontSize: "12px", color: "var(--color-muted, #888)" }}>
          Individual Item Disabled
        </p>
        <Select.Root defaultValue="opt1">
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="opt1">Enabled Option 1</Select.Item>
            <Select.Item value="opt2" disabled>
              Disabled Option 2
            </Select.Item>
            <Select.Item value="opt3">Enabled Option 3</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  ),
};

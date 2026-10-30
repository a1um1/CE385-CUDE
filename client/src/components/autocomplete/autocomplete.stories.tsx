import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Autocomplete, { type AutocompleteOption } from "./autocomplete";

const users: AutocompleteOption[] = [
  { value: "john@example.com", label: "John Doe", description: "john@example.com" },
  { value: "jane@example.com", label: "Jane Doe", description: "jane@example.com" },
  { value: "alice@example.com", label: "Alice Smith", description: "alice@example.com" },
  { value: "bob@example.com", label: "Bob Johnson", description: "bob@example.com" },
];

const meta = {
  title: "Components/Autocomplete",
  component: Autocomplete,
  tags: ["autodocs"],
  args: {
    items: users,
    placeholder: "Search name or email",
    emptyText: "No matching user",
    value: "",
    onValueChange: () => {},
  },
} satisfies Meta<typeof Autocomplete>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("");
    const [selected, setSelected] = React.useState<string | null>(null);

    return (
      <div style={{ minHeight: "260px", paddingTop: "20px", maxWidth: "320px" }}>
        <Autocomplete
          {...args}
          value={value}
          onValueChange={setValue}
          onSelect={(item) => setSelected(item.label)}
        />
        <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
          Input: {value || "—"} · Selected: {selected ?? "—"}
        </p>
      </div>
    );
  },
};

export const Small: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("");
    return (
      <div style={{ minHeight: "260px", paddingTop: "20px", maxWidth: "320px" }}>
        <Autocomplete {...args} size="sm" value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const NoResults: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("zzz");
    return (
      <div style={{ minHeight: "260px", paddingTop: "20px", maxWidth: "320px" }}>
        <Autocomplete {...args} value={value} onValueChange={setValue} />
      </div>
    );
  },
};

import * as React from "react";
import MarkdownEditor from "#/components/markdownEditor";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/MarkdownEditor",
  component: MarkdownEditor,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
    defaultViewMode: {
      control: "select",
      options: ["split", "write", "preview"],
    },
  },
} satisfies Meta<typeof MarkdownEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

const SAMPLE_MARKDOWN = `# Exercise Description

Write a function that calculates the sum of two integers.

## Input Format
- First line contains an integer $A$.
- Second line contains an integer $B$.

## Output Format
- Print the sum of $A$ and $B$.

### Example
\`\`\`
Input:
5
7

Output:
12
\`\`\`

> [!NOTE]
> All integers are within standard 32-bit limits.
`;

function MarkdownEditorWrapper(args: React.ComponentProps<typeof MarkdownEditor>) {
  const [content, setContent] = React.useState(args.value || SAMPLE_MARKDOWN);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
      <MarkdownEditor {...args} value={content} onChange={setContent} />
    </div>
  );
}

export const Playground: Story = {
  render: (args) => <MarkdownEditorWrapper {...args} />,
  args: {
    value: SAMPLE_MARKDOWN,
    onChange: () => {},
    defaultViewMode: "split",
    disabled: false,
  },
};

export const WriteOnly: Story = {
  render: (args) => <MarkdownEditorWrapper {...args} />,
  args: {
    value: SAMPLE_MARKDOWN,
    onChange: () => {},
    defaultViewMode: "write",
    disabled: false,
  },
};

export const PreviewOnly: Story = {
  render: (args) => <MarkdownEditorWrapper {...args} />,
  args: {
    value: SAMPLE_MARKDOWN,
    onChange: () => {},
    defaultViewMode: "preview",
    disabled: false,
  },
};

import Markdown from "#/components/markdown";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Markdown",
  component: Markdown,
  tags: ["autodocs"],
  argTypes: {
    content: {
      control: "text",
    },
  },
} satisfies Meta<typeof Markdown>;

export default meta;

type Story = StoryObj<typeof meta>;

const SAMPLE = `# Markdown Demo

Regular paragraph with **bold**, *italic*, ~~strikethrough~~, [a link](https://example.com), and \`inline code\`.

## Lists

1. First item
2. Second item
   - nested bullet
   - another bullet

## Table

| Name  | Difficulty | Solved |
| ----- | ---------- | ------ |
| A     | Easy       | yes    |
| B     | Hard       | no     |

## Code block

\`\`\`typescript
function greet(name: string): string {
  // say hello
  return \`Hello, \${name}!\`;
}
\`\`\`

\`\`\`python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
\`\`\`

## Image

![sample image](https://picsum.photos/640/240)

## Notes

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

> A plain blockquote, not an alert.
`;

export const Playground: Story = {
  args: {
    content: SAMPLE,
  },
};

import * as React from "react";
import MarkdownEditor from "#/components/markdownEditor";
import { APIclient } from "#/data/base/baseAPI";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/react";

// Storybook-only mock: short-circuit POST /storage/presign and mock fetch
let mocksInstalled = false;

function installMocks() {
  if (mocksInstalled) return;
  mocksInstalled = true;

  APIclient.use({
    onRequest: async ({ request }) => {
      if (!request.url.endsWith("/storage/presign")) return;
      const key = `exercises/mock/${Date.now()}.png`;
      return Response.json({
        key,
        uploadUrl: `https://mock-upload.local/${key}`,
        accessUrl: `https://picsum.photos/seed/${Date.now()}/600/400`,
        expiresIn: 300,
      });
    },
  });

  const realFetch = globalThis.fetch;
  globalThis.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("https://mock-upload.local/")) {
      return Promise.resolve(new Response(null, { status: 200 }));
    }
    return realFetch.call(globalThis, input, init);
  };
}

installMocks();

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
});

const meta = {
  title: "Components/MarkdownEditor",
  component: MarkdownEditor,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  argTypes: {
    disabled: {
      control: "boolean",
    },
    defaultShowEditor: {
      control: "boolean",
    },
    defaultShowPreview: {
      control: "boolean",
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

## Math Formula
Let the formula be:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

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

> [!TIP]
> Use fast I/O if the inputs are large.

> [!WARNING]
> Overflow might occur if $A + B > 2^{31} - 1$.
`;

function MarkdownEditorWrapper(args: React.ComponentProps<typeof MarkdownEditor>) {
  const [content, setContent] = React.useState(args.value || SAMPLE_MARKDOWN);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
      <MarkdownEditor {...args} value={content} onChange={setContent} />
    </div>
  );
}

export const Playground: Story = {
  render: (args) => <MarkdownEditorWrapper {...args} />,
  args: {
    value: SAMPLE_MARKDOWN,
    onChange: () => {},
    defaultShowEditor: true,
    defaultShowPreview: true,
    disabled: false,
  },
};

export const EditorOnly: Story = {
  render: (args) => <MarkdownEditorWrapper {...args} />,
  args: {
    value: SAMPLE_MARKDOWN,
    onChange: () => {},
    defaultShowEditor: true,
    defaultShowPreview: false,
    disabled: false,
  },
};

export const PreviewOnly: Story = {
  render: (args) => <MarkdownEditorWrapper {...args} />,
  args: {
    value: SAMPLE_MARKDOWN,
    onChange: () => {},
    defaultShowEditor: false,
    defaultShowPreview: true,
    disabled: false,
  },
};

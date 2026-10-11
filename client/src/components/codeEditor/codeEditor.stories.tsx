import CodeEditor from "./codeEditor";
import type { Decorator, Meta, StoryObj } from "@storybook/react";
import type { paths } from "#/data/base/openapi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const meta = {
  title: "Components/CodeEditor",
  component: CodeEditor,
  tags: ["autodocs"],
  argTypes: {
    language: {
      control: { type: "select" },
      options: ["cpp", "python"],
    },
    value: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "500px", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CodeEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, refetchOnMount: true } },
});

const withLanguageCache: Decorator = (Story) => {
  queryClient.setQueryData(["editor-code"], {
    languages: {
      python: {
        name: "Python",
        version: "3",
      },
      c: {
        name: "C",
        version: "11",
      },
    },
  } satisfies paths["/coding/language"]["get"]["responses"]["200"]["content"]["application/json"]);
  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};

export const Playground: Story = {
  parameters: {
    layout: "padded",
  },
  args: {
    language: "c",
    value:
      '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n',
    onChange: () => {},
  },
  decorators: [withLanguageCache],
};

export const PublicTestCaseResults: Story = {
  parameters: {
    layout: "padded",
  },
  args: {
    language: "python",
    value: 'print("Hello", input())',
    onChange: () => {},
    runCode: () => {},
    testResults: [
      {
        ok: true,
        input: "1-2-3",
        output: "Hello 1-2-3\n",
        expectedOutput: "Hello 1-2-3",
        time: 15_430_000,
        memory: 3_460_000,
      },
      {
        ok: false,
        input: "me",
        output: "",
        expectedOutput: "Hello me",
        error: 'File "/w/temp.py", line 1\nSyntaxError: invalid syntax',
        time: 9_120_000,
        memory: 2_800_000,
      },
    ],
  },
  decorators: [withLanguageCache],
};

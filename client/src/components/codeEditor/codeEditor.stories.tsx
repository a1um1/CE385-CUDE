import CodeEditor from "./codeEditor";
import type { Meta, StoryObj } from "@storybook/react";
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
  decorators: [
    (Story) => {
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
    },
  ],
};

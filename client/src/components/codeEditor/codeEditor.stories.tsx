import { useState } from "react";
import CodeEditor from "./codeEditor";
import type { Meta, StoryObj } from "@storybook/react";

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

function ControlledCodeEditor(args: Omit<React.ComponentProps<typeof CodeEditor>, "onChange">) {
  const [value, setValue] = useState(args.value);
  return <CodeEditor {...args} value={value} onChange={setValue} />;
}

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
  render: (args) => <ControlledCodeEditor {...args} />,
};

export const Python: Story = {
  parameters: {
    layout: "padded",
  },
  args: {
    language: "python",
    value: 'def main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()\n',
    onChange: () => {},
  },
  render: (args) => <ControlledCodeEditor {...args} />,
};

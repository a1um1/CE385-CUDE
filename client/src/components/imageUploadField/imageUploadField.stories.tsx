import Button from "#/components/button";
import ImageUploadField from "./imageUploadField";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ComponentProps } from "react";
import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react";

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false } },
});

const meta = {
  title: "Components/ImageUploadField",
  component: ImageUploadField,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  argTypes: {
    purpose: { control: "select", options: ["avatar", "thumbnail", "background"] },
    aspect: { control: "number" },
    maxDim: { control: "number" },
    targetBytes: { control: "number" },
    value: { control: "text" },
    disabled: { control: "boolean" },
    onUploaded: { control: false },
  },
} satisfies Meta<typeof ImageUploadField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Avatar: Story = {
  args: {
    purpose: "avatar",
    aspect: 1,
    maxDim: 512,
    targetBytes: 150 * 1024,
    value: "",
    onUploaded: fn(),
  },
};

export const Background: Story = {
  args: {
    purpose: "background",
    aspect: 32 / 9,
    maxDim: 1600,
    targetBytes: 400 * 1024,
    value: "",
    onUploaded: fn(),
  },
};

export const WithValue: Story = {
  args: {
    ...Avatar.args,
    value: "https://picsum.photos/200/300",
    onUploaded: fn(),
  },
};

export const Disabled: Story = {
  args: {
    ...Avatar.args,
    disabled: true,
    onUploaded: fn(),
  },
};

const ManualPlayground = (args: ComponentProps<typeof ImageUploadField>) => {
  const [value, setValue] = useState(args.value ?? "");
  return (
    <div className="flex flex-col gap-3">
      <ImageUploadField {...args} value={value} onUploaded={setValue} />
      <p className="text-sm opacity-70">Current value: {value || "(empty)"}</p>
      <div>
        <Button variant="ghost" size="sm" onClick={() => setValue("")}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export const Playground: Story = {
  args: {
    ...Avatar.args,
    onUploaded: fn(),
  },
  render: (args) => <ManualPlayground {...args} />,
};

import Button from "#/components/button";
import ImageUploadField from "./imageUploadField";
import { APIclient } from "#/data/base/baseAPI";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ComponentProps } from "react";
import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react";

const PREVIEW_SIZES: Record<string, [number, number]> = {
  avatar: [512, 512],
  thumbnail: [320, 180],
  background: [960, 270],
};

// Storybook-only mock: short-circuit POST /storage/presign (openapi-fetch
// middleware) and swallow the browser PUT (patched fetch) so stories run
// without a server — no CORS, no Garage. Never imported by the app itself.
let mocksInstalled = false;

function installMocks() {
  if (mocksInstalled) return;
  mocksInstalled = true;

  APIclient.use({
    onRequest: async ({ request }) => {
      if (!request.url.endsWith("/storage/presign")) return;
      const body = (await request.json()) as { purpose: string };
      const [w, h] = PREVIEW_SIZES[body.purpose] ?? [512, 512];
      const key = `${body.purpose}/mock/${Date.now()}.webp`;
      return Response.json({
        key,
        uploadUrl: `https://mock-upload.local/${key}`,
        accessUrl: `https://picsum.photos/seed/${Date.now()}/${w}/${h}`,
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
      {value && (
        <img src={value} alt="Uploaded preview" className="max-h-40 rounded border border-solid" />
      )}
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

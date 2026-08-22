import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./navbar";
import type { Meta, StoryObj } from "@storybook/react";
import type { paths } from "#/data/base/openapi";

const meta = {
  title: "Components/Navbar",
  component: Navbar,
  tags: ["autodocs"],
} satisfies Meta<typeof Navbar>;

export default meta;

type Story = StoryObj<typeof meta>;

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, refetchOnMount: true } },
});

export const Playground: Story = {
  args: {},
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => {
      queryClient.setQueryData(["user"], {
        id: "xxx",
        name: "tlakchai",
        email: "th.lakchai@gmail.com",
        epithet: null,
        role: "USER",
        profileImage: "https://github.com/a1um1.png",
        backgroundImage:
          "https://github.com/vyrx-dev/Wallpapers/blob/master/gruvbox/ign-waifu.png?raw=true",
        isActive: true,
        deactivateReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } satisfies paths["/user"]["get"]["responses"]["200"]["content"]["application/json"]);
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

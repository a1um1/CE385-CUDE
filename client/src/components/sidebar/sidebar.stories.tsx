import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "./sidebar";
import type { Meta, StoryObj } from "@storybook/react";
import type { paths } from "#/data/base/openapi";

const meta = {
  title: "Components/Admin Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
} satisfies Meta<typeof Sidebar>;

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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deactivateReason: null,
      } satisfies paths["/user"]["get"]["responses"]["200"]["content"]["application/json"]);
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

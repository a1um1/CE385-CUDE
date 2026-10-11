import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserTrigger from "./userTrigger";
import type { Meta, StoryObj } from "@storybook/react";
import type { paths } from "#/data/base/openapi";

const meta = {
  title: "Components/User Trigger",
  component: UserTrigger,
  tags: ["autodocs"],
} satisfies Meta<typeof UserTrigger>;

export default meta;

type Story = StoryObj<typeof meta>;

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, refetchOnMount: true } },
});

export const Playground: Story = {
  args: {},
  decorators: [
    (Story) => {
      queryClient.setQueryData(["session"], {
        id: "xxx",
        name: "tlakchai",
        username: "tlakchai",
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

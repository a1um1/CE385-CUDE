import Button from "#/components/button";
import Divider from "#/components/divider";
import type { Meta, StoryObj } from "@storybook/react";
import { BookOpenIcon, DoorOpenIcon, XIcon } from "lucide-react";
import {
  CollapsibleSidebar,
  CollapsibleSidebarFooter,
  CollapsibleSidebarLabel,
  CollapsibleSidebarToggle,
} from "./collapsibleSidebar";

function SidebarContent() {
  return (
    <>
      <Button variant="secondary" block align="start" title="Back to home">
        <DoorOpenIcon />
        <CollapsibleSidebarLabel>Back to home</CollapsibleSidebarLabel>
      </Button>
      <Divider />
      {["EX00 Welcome", "EX01 Code Editor", "EX02 Hello 1-2-3", "EX03 Tips for Beginners"].map(
        (label) => (
          <Button key={label} variant="ghost" block align="start" title={label}>
            <BookOpenIcon />
            <CollapsibleSidebarLabel>{label}</CollapsibleSidebarLabel>
          </Button>
        ),
      )}
      <CollapsibleSidebarFooter>
        <CollapsibleSidebarToggle label="Collapse" />
        <Button variant="danger" block align="start" title="Abort session">
          <XIcon />
          <CollapsibleSidebarLabel>Abort session</CollapsibleSidebarLabel>
        </Button>
      </CollapsibleSidebarFooter>
    </>
  );
}

const meta = {
  title: "Components/Collapsible Sidebar",
  component: CollapsibleSidebar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: 480, display: "flex" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    defaultCollapsed: { control: "boolean" },
    collapsed: { control: "boolean" },
  },
} satisfies Meta<typeof CollapsibleSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { defaultCollapsed: false, children: <SidebarContent /> },
};

export const Collapsed: Story = {
  args: { defaultCollapsed: true, children: <SidebarContent /> },
};

import Button from "#/components/button";
import Divider from "#/components/divider";
import type { Meta, StoryObj } from "@storybook/react";
import { BookOpenIcon, DoorOpenIcon, XIcon } from "lucide-react";
import {
  CollapsibleSidebar,
  CollapsibleSidebarFooter,
  CollapsibleSidebarLabel,
  CollapsibleSidebarProvider,
  CollapsibleSidebarToggle,
} from "./collapsibleSidebar";

const frame = (Story: () => React.ReactNode) => (
  <div style={{ height: 480, display: "flex" }}>
    <Story />
  </div>
);

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
  component: CollapsibleSidebarProvider,
  tags: ["autodocs"],
  argTypes: {
    defaultCollapsed: { control: "boolean" },
    collapsed: { control: "boolean" },
  },
} satisfies Meta<typeof CollapsibleSidebarProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    defaultCollapsed: false,
    children: (
      <CollapsibleSidebar>
        <SidebarContent />
      </CollapsibleSidebar>
    ),
  },
  decorators: [frame],
};

export const Collapsed: Story = {
  ...Playground,
  args: { ...Playground.args, defaultCollapsed: true },
};

/** The toggle can live outside the rail — e.g. in a content header. */
export const HeaderToggle: Story = {
  args: {
    children: (
      <>
        <CollapsibleSidebar>
          <SidebarContent />
        </CollapsibleSidebar>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderBottom: "1px solid var(--color-border)",
              padding: "0.5rem 1rem",
            }}
          >
            <CollapsibleSidebarToggle iconOnly label="Collapse" />
            <span>Python | Python Fundamentals | Lesson 00</span>
          </header>
          <div style={{ padding: "1rem" }}>Content</div>
        </div>
      </>
    ),
  },
  decorators: [frame],
};

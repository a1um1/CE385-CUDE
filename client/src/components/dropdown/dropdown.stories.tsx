import type { Meta, StoryObj } from "@storybook/react";
import Dropdown from "./dropdown";
import Button from "#/components/button";
import { User, Settings, LogOut, Shield, Heart } from "lucide-react";

const meta = {
  title: "Components/Dropdown",
  component: Dropdown.Root,
  tags: ["autodocs"],
} satisfies Meta<typeof Dropdown.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <div
      style={{
        minHeight: "250px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "20px",
      }}
    >
      <Dropdown.Root>
        <Dropdown.Trigger render={<Button variant="primary">Click Me</Button>} />
        <Dropdown.Content align="center" side="bottom" sideOffset={8}>
          <Dropdown.Item onClick={() => alert("Profile clicked")}>
            <User size={16} />
            Profile
          </Dropdown.Item>
          <Dropdown.Item onClick={() => alert("Settings clicked")}>
            <Settings size={16} />
            Settings
          </Dropdown.Item>
          <Dropdown.Item onClick={() => alert("Preferences clicked")}>
            <Heart size={16} />
            Favorites
          </Dropdown.Item>

          <Dropdown.Separator />

          <Dropdown.Item onClick={() => alert("Admin clicked")}>
            <Shield size={16} />
            Admin Panel
          </Dropdown.Item>

          <Dropdown.Separator />

          <Dropdown.Item onClick={() => alert("Logout clicked")}>
            <LogOut size={16} />
            Sign Out
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  ),
};

export const AlignEnd: Story = {
  render: () => (
    <div
      style={{
        minHeight: "250px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "20px",
      }}
    >
      <Dropdown.Root>
        <Dropdown.Trigger render={<Button variant="secondary">Align End</Button>} />
        <Dropdown.Content align="end">
          <Dropdown.Item>My Profile</Dropdown.Item>
          <Dropdown.Item>Account Info</Dropdown.Item>
          <Dropdown.Separator />
          <Dropdown.Item>Help & Support</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  ),
};

import { useState } from "react";
import Dialog from "./dialog";
import Button from "#/components/button";
import { FrownIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    quote: { control: "text" },
    icon: { control: false },
    tone: { control: "inline-radio", options: ["default", "danger"] },
    open: { control: false },
    onOpenChange: { control: false },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

function DialogPlayground(args: React.ComponentProps<typeof Dialog>) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>This is the dialog body. You can put any content here.</p>
      </Dialog>
    </div>
  );
}

export const Playground: Story = {
  args: {
    title: "Dialog Title",
    description: "This is an optional description for the dialog.",
    open: false,
    onOpenChange: () => {},
  },
  render: (args) => <DialogPlayground {...args} />,
};

export const NoDescription: Story = {
  args: {
    title: "No Description Dialog",
    open: false,
    onOpenChange: () => {},
  },
  render: (args) => <DialogPlayground {...args} />,
};

export const WithIconAndQuote: Story = {
  args: {
    title: "ยอมแพ้บทเรียนนี้?",
    description: "เซสชันนี้จะถูกยกเลิก คะแนนที่ทำไว้จะไม่ถูกนับ และคุณจะเริ่มบทเรียนนี้ใหม่ได้",
    icon: <FrownIcon size="2rem" />,
    quote: "“ยอมแพ้ไม่ใช่ความล้มเหลว แต่คือการให้โอกาสตัวเองเริ่มต้นใหม่”",
    tone: "danger",
    open: false,
    onOpenChange: () => {},
  },
  render: (args) => <DialogPlayground {...args} />,
};

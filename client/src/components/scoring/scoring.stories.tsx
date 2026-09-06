import { Scoring } from "./scoring";
import type { Meta } from "@storybook/react";

const meta = {
  title: "Components/Scoring",
  component: Scoring,
  tags: ["autodocs"],
  argTypes: {
    status: {control: "radio", options: ["success", "fail", "inProgress"]},
  }
} satisfies Meta<typeof Scoring>;

export default meta;

export const Playground = {
    args: {
        status: "success"
    }
};

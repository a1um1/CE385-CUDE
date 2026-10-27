import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType, SVGProps } from "react";
import { Code } from "lucide-react";
import CIcon from "./CIcon";
import PythonIcon from "./PythonIcon";
import CPlusPlusIcon from "./CPlusPlusIcon";
import JavaIcon from "./JavaIcon";
import JavaScriptIcon from "./JavaScriptIcon";
import TypeScriptIcon from "./TypeScriptIcon";
import GoIcon from "./GoIcon";
import RustIcon from "./RustIcon";
import KotlinIcon from "./KotlinIcon";
import SwiftIcon from "./SwiftIcon";
import CSharpIcon from "./CSharpIcon";
import PHPIcon from "./PHPIcon";
import FlutterIcon from "./FlutterIcon";
import AndroidIcon from "./AndroidIcon";
import AppleIcon from "./AppleIcon";
import HackTheBoxIcon from "./HackTheBoxIcon";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const icons: { name: string; Icon: Icon }[] = [
  { name: "Python", Icon: PythonIcon },
  { name: "C", Icon: CIcon },
  { name: "C++", Icon: CPlusPlusIcon },
  { name: "Java", Icon: JavaIcon },
  { name: "JavaScript", Icon: JavaScriptIcon },
  { name: "TypeScript", Icon: TypeScriptIcon },
  { name: "Go", Icon: GoIcon },
  { name: "Rust", Icon: RustIcon },
  { name: "Kotlin", Icon: KotlinIcon },
  { name: "Swift", Icon: SwiftIcon },
  { name: "C#", Icon: CSharpIcon },
  { name: "PHP", Icon: PHPIcon },
  { name: "Flutter", Icon: FlutterIcon },
  { name: "Android", Icon: AndroidIcon },
  { name: "iOS / Apple", Icon: AppleIcon },
  { name: "Cyber Security", Icon: HackTheBoxIcon },
  { name: "Fallback", Icon: Code },
];

function Gallery({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", color: "#e5e7eb" }}>
      {icons.map(({ name, Icon }) => (
        <div
          key={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            width: 96,
          }}
        >
          <Icon width={size} height={size} />
          <span style={{ fontSize: 12, textAlign: "center" }}>{name}</span>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: "Components/CodeEditor/LanguageIcons",
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "toolbar",
      values: [
        { name: "toolbar", value: "#1e2430" },
        { name: "white", value: "#ffffff" },
      ],
    },
  },
  args: { size: 32 },
  argTypes: { size: { control: { type: "range", min: 16, max: 64, step: 4 } } },
  render: ({ size }) => <Gallery size={size} />,
} satisfies Meta<{ size: number }>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = { args: { size: 16 } };

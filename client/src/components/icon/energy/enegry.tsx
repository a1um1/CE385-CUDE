import type { IconProps } from "#/components/icon/streak/streak";
import { Zap } from "lucide-react";

export default function Energy({ size }: IconProps) {
  return <Zap fill="var(--color-energy)" stroke="var(--color-energy-outline)" size={size} />;
}

import { Flame } from "lucide-react";

export interface IconProps {
  size?: number;
}

export default function Streak({ size }: IconProps) {
  return <Flame fill="var(--color-streak)" stroke="var(--color-streak-outline)" size={size} />;
}

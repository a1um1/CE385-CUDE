import { Flame } from "lucide-react";

export interface IconProps {
  size?: number;
}

export default function Streak({ size }: IconProps) {
  return <Flame fill="var(--color-primary)" stroke="var(--color-primary-outline)" size={size} />;
}

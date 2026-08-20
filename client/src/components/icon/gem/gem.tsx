import { Gem as BaseGem } from "lucide-react";

export interface IconProps {
  size?: number;
}

export default function Gem({ size }: IconProps) {
  return <BaseGem fill="var(--color-gem)" stroke="var(--color-gem-outline)" size={size} />;
}

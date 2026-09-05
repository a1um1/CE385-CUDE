import React from "react";
import styles from "./select.module.css";
import type { Menu } from "@base-ui/react/menu";

export const SelectSizes = {
  xs: styles["size-xs"],
  sm: styles["size-sm"],
  md: styles["size-md"],
} as const;

export const SelectRadius = {
  none: styles["radius-none"],
  square: styles["radius-square"],
  pilled: styles["radius-pilled"],
} as const;

export type SelectSize = keyof typeof SelectSizes;
export type SelectRadiusType = keyof typeof SelectRadius;

export interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  size?: SelectSize;
  radius?: SelectRadiusType;
}

export const SelectContext = React.createContext<SelectContextValue | null>(null);

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

export interface SelectContentProps extends Omit<React.ComponentProps<typeof Menu.Popup>, "dir"> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  positionerClassName?: string;
}

export interface SelectRootProps extends Omit<
  React.ComponentProps<typeof Menu.Root>,
  "onOpenChange"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: SelectSize;
  radius?: SelectRadiusType;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export interface SelectTriggerProps extends React.ComponentProps<typeof Menu.Trigger> {
  size?: SelectSize;
  radius?: SelectRadiusType;
  showChevron?: boolean;
}

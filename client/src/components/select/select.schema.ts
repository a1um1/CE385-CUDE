import React from "react";
import styles from "./select.module.css";
import type { Select as SelectPrimitive } from "@base-ui/react/select";

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
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  disabled?: boolean;
  size?: SelectSize;
  radius?: SelectRadiusType;
}

export const SelectContext = React.createContext<SelectContextValue | null>(null);

export type SelectValueProps = React.ComponentProps<typeof SelectPrimitive.Value>;

export interface SelectContentProps extends Omit<
  React.ComponentProps<typeof SelectPrimitive.Popup>,
  "dir"
> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  positionerClassName?: string;
}

export interface SelectRootProps extends Omit<
  React.ComponentProps<typeof SelectPrimitive.Root<string>>,
  "onOpenChange" | "onValueChange" | "value" | "defaultValue" | "items" | "children"
> {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  size?: SelectSize;
  radius?: SelectRadiusType;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  items?: { value: string; label: string }[];
}

export interface SelectTriggerProps extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
  size?: SelectSize;
  radius?: SelectRadiusType;
  showChevron?: boolean;
}

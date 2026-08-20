import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import styles from "./dropdown.module.css";

export type DropdownRootProps = React.ComponentProps<typeof Menu.Root>;
export function DropdownRoot(props: DropdownRootProps) {
  return <Menu.Root {...props} />;
}

export type DropdownTriggerProps = React.ComponentProps<typeof Menu.Trigger>;
export function DropdownTrigger({ className, ...props }: DropdownTriggerProps) {
  return <Menu.Trigger className={clsx(styles.trigger, className)} {...props} />;
}

export interface DropdownContentProps extends Omit<React.ComponentProps<typeof Menu.Popup>, "dir"> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  positionerClassName?: string;
}

export function DropdownContent({
  children,
  align = "start",
  side = "bottom",
  sideOffset = 8,
  alignOffset = 0,
  className,
  positionerClassName,
  ...props
}: DropdownContentProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={positionerClassName}
      >
        <Menu.Popup className={clsx(styles.popup, className)} {...props}>
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export type DropdownItemProps = React.ComponentProps<typeof Menu.Item>;
export function DropdownItem({ className, ...props }: DropdownItemProps) {
  return <Menu.Item className={clsx(styles.item, className)} {...props} />;
}

export type DropdownSeparatorProps = React.ComponentProps<typeof Menu.Separator>;
export function DropdownSeparator({ className, ...props }: DropdownSeparatorProps) {
  return <Menu.Separator className={clsx(styles.separator, className)} {...props} />;
}

export const Dropdown = {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Item: DropdownItem,
  Separator: DropdownSeparator,
};

export default Dropdown;

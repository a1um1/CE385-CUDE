import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { Check, ChevronDown } from "lucide-react";
import styles from "./select.module.css";

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

interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  size?: SelectSize;
  radius?: SelectRadiusType;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select compound components must be used within a Select.Root");
  }
  return context;
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

export function SelectRoot({
  value: controlledValue,
  defaultValue,
  onValueChange,
  size = "md",
  radius,
  disabled = false,
  open,
  onOpenChange,
  children,
  ...props
}: SelectRootProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange],
  );

  const contextValue = React.useMemo<SelectContextValue>(
    () => ({
      value: currentValue,
      onValueChange: handleValueChange,
      disabled,
      size,
      radius,
    }),
    [currentValue, handleValueChange, disabled, size, radius],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <Menu.Root open={open} onOpenChange={onOpenChange} disabled={disabled} {...props}>
        {children}
      </Menu.Root>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps extends React.ComponentProps<typeof Menu.Trigger> {
  size?: SelectSize;
  radius?: SelectRadiusType;
  showChevron?: boolean;
}

export function SelectTrigger({
  className,
  size: sizeProp,
  radius: radiusProp,
  showChevron = true,
  children,
  ...props
}: SelectTriggerProps) {
  const context = useSelectContext();
  const size = sizeProp ?? context.size ?? "md";
  const radius = radiusProp ?? context.radius;

  return (
    <Menu.Trigger
      className={clsx(styles.trigger, SelectSizes[size], radius && SelectRadius[radius], className)}
      disabled={context.disabled || props.disabled}
      {...props}
    >
      {children}
      {showChevron && <ChevronDown className={styles.chevron} size={16} />}
    </Menu.Trigger>
  );
}

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

export function SelectValue({ placeholder, className, children, ...props }: SelectValueProps) {
  const { value } = useSelectContext();

  const content = children ?? value ?? placeholder;
  const isPlaceholder = !children && !value && Boolean(placeholder);

  return (
    <span className={clsx(styles.value, isPlaceholder && styles.placeholder, className)} {...props}>
      {content}
    </span>
  );
}

export interface SelectContentProps extends Omit<React.ComponentProps<typeof Menu.Popup>, "dir"> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  positionerClassName?: string;
}

export function SelectContent({
  children,
  align = "start",
  side = "bottom",
  sideOffset = 4,
  alignOffset = 0,
  className,
  positionerClassName,
  ...props
}: SelectContentProps) {
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

export interface SelectItemProps extends Omit<React.ComponentProps<typeof Menu.Item>, "value"> {
  value: string;
  children: React.ReactNode;
  showIndicator?: boolean;
}

export function SelectItem({
  value,
  children,
  className,
  showIndicator = true,
  onClick,
  ...props
}: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useSelectContext();
  const isSelected = selectedValue === value;

  return (
    <Menu.Item
      className={clsx(styles.item, className)}
      data-selected={isSelected ? "" : undefined}
      onClick={(e) => {
        onValueChange?.(value);
        onClick?.(e);
      }}
      {...props}
    >
      <span className={styles.itemText}>{children}</span>
      {showIndicator && isSelected && <Check className={styles.itemCheck} size={16} />}
    </Menu.Item>
  );
}

export type SelectSeparatorProps = React.ComponentProps<typeof Menu.Separator>;
export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return <Menu.Separator className={clsx(styles.separator, className)} {...props} />;
}

export type SelectGroupProps = React.ComponentProps<typeof Menu.Group>;
export function SelectGroup({ className, ...props }: SelectGroupProps) {
  return <Menu.Group className={className} {...props} />;
}

export type SelectGroupLabelProps = React.ComponentProps<typeof Menu.GroupLabel>;
export function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  return <Menu.GroupLabel className={clsx(styles.groupLabel, className)} {...props} />;
}

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
  Separator: SelectSeparator,
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
};

export default Select;

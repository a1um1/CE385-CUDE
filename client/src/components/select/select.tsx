import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { clsx } from "clsx";
import { Check, ChevronDown } from "lucide-react";
import styles from "./select.module.css";
import type {
  SelectContextValue,
  SelectValueProps,
  SelectContentProps,
  SelectRootProps,
  SelectTriggerProps,
} from "#/components/select/select.schema";
import { SelectContext, SelectSizes, SelectRadius } from "#/components/select/select.schema";

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select compound components must be used within a Select.Root");
  }
  return context;
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
    (newValue: string | null) => {
      if (!isControlled) setUncontrolledValue(newValue);
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
      <SelectPrimitive.Root
        value={currentValue ?? null}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={onOpenChange}
        disabled={disabled}
        {...props}
      >
        {children}
      </SelectPrimitive.Root>
    </SelectContext.Provider>
  );
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
    <SelectPrimitive.Trigger
      className={clsx(styles.trigger, SelectSizes[size], radius && SelectRadius[radius], className)}
      disabled={context.disabled || props.disabled}
      {...props}
    >
      {children}
      {showChevron && <ChevronDown className={styles.chevron} size={16} />}
    </SelectPrimitive.Trigger>
  );
}

export function SelectValue({ className, ...props }: SelectValueProps) {
  return <SelectPrimitive.Value className={clsx(styles.value, className)} {...props} />;
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
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={positionerClassName}
      >
        <SelectPrimitive.Popup className={clsx(styles.popup, className)} {...props}>
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export interface SelectItemProps extends Omit<
  React.ComponentProps<typeof SelectPrimitive.Item>,
  "value"
> {
  value: string;
  children: React.ReactNode;
  showIndicator?: boolean;
}

export function SelectItem({
  value,
  children,
  className,
  showIndicator = true,
  ...props
}: SelectItemProps) {
  return (
    <SelectPrimitive.Item value={value} className={clsx(styles.item, className)} {...props}>
      <SelectPrimitive.ItemText className={styles.itemText}>{children}</SelectPrimitive.ItemText>
      {showIndicator && (
        <SelectPrimitive.ItemIndicator className={styles.itemCheck}>
          <Check size={16} />
        </SelectPrimitive.ItemIndicator>
      )}
    </SelectPrimitive.Item>
  );
}

export type SelectItemTextProps = React.ComponentProps<typeof SelectPrimitive.ItemText>;
export function SelectItemText({ className, ...props }: SelectItemTextProps) {
  return <SelectPrimitive.ItemText className={clsx(styles.itemText, className)} {...props} />;
}

export type SelectSeparatorProps = React.ComponentProps<typeof SelectPrimitive.Separator>;
export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return <SelectPrimitive.Separator className={clsx(styles.separator, className)} {...props} />;
}

export type SelectGroupProps = React.ComponentProps<typeof SelectPrimitive.Group>;
export function SelectGroup({ className, ...props }: SelectGroupProps) {
  return <SelectPrimitive.Group className={className} {...props} />;
}

export type SelectGroupLabelProps = React.ComponentProps<typeof SelectPrimitive.GroupLabel>;
export function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  return <SelectPrimitive.GroupLabel className={clsx(styles.groupLabel, className)} {...props} />;
}

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
  ItemText: SelectItemText,
  Separator: SelectSeparator,
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
};

export default Select;

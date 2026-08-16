import type { ComponentPropsWithoutRef } from "react";
import inputStyles from "./input.module.css";
import { clsx } from "clsx";

export const InputSizes = {
  xs: inputStyles["size-xs"],
  sm: inputStyles["size-sm"],
  md: inputStyles["size-md"],
} as const;

export const InputRadius = {
  default: undefined,
  none: inputStyles["radius-none"],
};

export interface InputProps extends Omit<ComponentPropsWithoutRef<"input">, "size"> {
  size?: keyof typeof InputSizes;
  radius?: keyof typeof InputRadius;
  noBorder?: boolean;
}

export default function Input({ className, size, radius, noBorder, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        inputStyles.input,
        size && InputSizes[size],
        radius && InputRadius[radius],
        noBorder && inputStyles["no-border"],
        className,
      )}
      {...props}
    />
  );
}

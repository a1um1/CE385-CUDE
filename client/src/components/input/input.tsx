import { forwardRef } from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import type { InputProps as BaseInputProps } from "@base-ui/react/input";
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

export interface InputProps extends Omit<BaseInputProps, "size"> {
  size?: keyof typeof InputSizes;
  radius?: keyof typeof InputRadius;
  noBorder?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, radius, noBorder, ...props }, ref) => (
    <BaseInput
      {...props}
      ref={ref}
      className={clsx(
        inputStyles.input,
        size && InputSizes[size],
        radius && InputRadius[radius],
        noBorder && inputStyles["no-border"],
        className,
      )}
    />
  ),
);

Input.displayName = "Input";

export default Input;

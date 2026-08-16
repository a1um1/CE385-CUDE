import type { ComponentPropsWithoutRef } from "react";
import ButtonStyles from "./button.module.css";
import { clsx } from "clsx";

export const ButtonVariants = {
  primary: ButtonStyles["primary"],
  secondary: ButtonStyles["secondary"],
  ghost: ButtonStyles["ghost"],
} as const;

export const ButtonSizes = {
  xs: ButtonStyles["size-xs"],
  sm: ButtonStyles["size-sm"],
  md: ButtonStyles["size-md"],
  lg: ButtonStyles["size-lg"],
} as const;

export const ButtonRadius = {
  none: undefined,
  pilled: ButtonStyles.pilled,
  square: ButtonStyles.square,
} as const;

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: keyof typeof ButtonVariants;
  size?: keyof typeof ButtonSizes;
  radius?: keyof typeof ButtonRadius;
  block?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  radius = "none",
  block = false,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        ButtonStyles.button,
        ButtonVariants[variant] || ButtonStyles.primary,
        ButtonSizes[size] || ButtonStyles["size-md"],
        ButtonRadius[radius] || undefined,
        block && ButtonStyles.block,
        props.className,
      )}
    >
      {props.children}
    </button>
  );
}

import { forwardRef } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import type { ButtonProps as BaseButtonProps } from "@base-ui/react/button";
import ButtonStyles from "./button.module.css";
import { clsx } from "clsx";

export const ButtonVariants = {
  primary: ButtonStyles["primary"],
  secondary: ButtonStyles["secondary"],
  ghost: ButtonStyles["ghost"],
  danger: ButtonStyles["danger"],
  success: ButtonStyles["success"],
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

export const ButtonInnerAlignments = {
  start: ButtonStyles["inner-start"],
  center: ButtonStyles["inner-center"],
  end: ButtonStyles["inner-end"],
  between: ButtonStyles["inner-between"],
} as const;

export interface ButtonProps extends BaseButtonProps {
  variant?: keyof typeof ButtonVariants;
  size?: keyof typeof ButtonSizes;
  radius?: keyof typeof ButtonRadius;
  align?: keyof typeof ButtonInnerAlignments;
  block?: boolean;
  icon?: boolean;
}

const Button = forwardRef<HTMLElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      radius = "none",
      block = false,
      icon = false,
      align = "center",
      className,
      ...props
    },
    ref,
  ) => (
    <BaseButton
      {...props}
      ref={ref}
      className={clsx(
        ButtonStyles.button,
        ButtonVariants[variant] || ButtonStyles.primary,
        ButtonSizes[size] || ButtonStyles["size-md"],
        ButtonRadius[radius] || undefined,
        ButtonInnerAlignments[align] || undefined,
        block && ButtonStyles.block,
        icon && ButtonStyles.icon,
        className,
      )}
    />
  ),
);

Button.displayName = "Button";

export default Button;

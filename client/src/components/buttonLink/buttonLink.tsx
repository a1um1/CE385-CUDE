import { forwardRef } from "react";
import ButtonStyles from "../button/button.module.css";
import { clsx } from "clsx";
import { createLink } from "@tanstack/react-router";
import { ButtonRadius, ButtonSizes, ButtonVariants } from "#/components/button/button";

interface BasicLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: keyof typeof ButtonVariants;
  size?: keyof typeof ButtonSizes;
  radius?: keyof typeof ButtonRadius;
  block?: boolean;
}

const BasicLinkComponent = forwardRef<HTMLAnchorElement, BasicLinkProps>(
  ({ variant = "primary", size = "md", radius = "none", block, ...props }, ref) => (
    <a
      {...props}
      ref={ref}
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
    </a>
  ),
);

const ButtonLink = createLink(BasicLinkComponent);

export default ButtonLink;

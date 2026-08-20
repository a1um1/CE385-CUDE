import { forwardRef } from "react";
import { createLink } from "@tanstack/react-router";
import Button from "#/components/button/button";
import type { ButtonRadius, ButtonSizes, ButtonVariants } from "#/components/button/button";

interface BasicLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: keyof typeof ButtonVariants;
  size?: keyof typeof ButtonSizes;
  radius?: keyof typeof ButtonRadius;
  block?: boolean;
}

const BasicLinkComponent = forwardRef<HTMLAnchorElement, BasicLinkProps>(
  ({ variant = "primary", size = "md", radius = "none", block, ...props }, ref) => (
    <Button
      {...(props as any)}
      ref={ref}
      variant={variant}
      size={size}
      radius={radius}
      block={block}
      render={<a />}
      nativeButton={false}
    />
  ),
);

const ButtonLink = createLink(BasicLinkComponent);

export default ButtonLink;

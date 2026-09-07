import { forwardRef } from "react";
import { createLink } from "@tanstack/react-router";
import Button from "#/components/button";
import type {
  ButtonInnerAlignments,
  ButtonRadius,
  ButtonSizes,
  ButtonVariants,
} from "#/components/button/button";

interface BasicLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: keyof typeof ButtonVariants;
  size?: keyof typeof ButtonSizes;
  radius?: keyof typeof ButtonRadius;
  align?: keyof typeof ButtonInnerAlignments;
  block?: boolean;
}

const BasicLinkComponent = forwardRef<HTMLAnchorElement, BasicLinkProps>(
  (
    { variant = "primary", size = "md", radius = "none", align = "center", block, ...props },
    ref,
  ) => (
    <Button
      {...(props as any)}
      ref={ref}
      variant={variant}
      size={size}
      radius={radius}
      align={align}
      block={block}
      render={<a />}
      nativeButton={false}
    />
  ),
);

const ButtonLink = createLink(BasicLinkComponent);

export default ButtonLink;

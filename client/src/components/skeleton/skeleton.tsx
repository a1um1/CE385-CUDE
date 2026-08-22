import * as React from "react";
import clsx from "clsx";
import styles from "./skeleton.module.css";

export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  width?: string;
  height?: string;
}

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ className, width, height, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(styles.skeleton, className)}
      data-width={width}
      data-height={height}
      {...props}
    />
  ),
);

Skeleton.displayName = "Skeleton";

export default Skeleton;

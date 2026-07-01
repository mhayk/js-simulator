import type { HTMLAttributes } from "react";
import "./Stack.css";

export type StackDirection = "vertical" | "horizontal";
export type StackGap = "xs" | "sm" | "md" | "lg" | "xl";
export type StackAlign = "start" | "center" | "end" | "stretch";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Layout axis. */
  direction?: StackDirection;
  /** Spacing between children, from the spacing scale. */
  gap?: StackGap;
  /** Cross-axis alignment. */
  align?: StackAlign;
  /** Allow children to wrap onto multiple lines. */
  wrap?: boolean;
}

/** Flexbox layout primitive spacing children by the token scale. */
export function Stack({
  direction = "vertical",
  gap = "md",
  align = "stretch",
  wrap = false,
  className,
  children,
  ...rest
}: StackProps) {
  const classes = [
    "ds-stack",
    `ds-stack--${direction}`,
    `ds-stack--gap-${gap}`,
    `ds-stack--align-${align}`,
    wrap && "ds-stack--wrap",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

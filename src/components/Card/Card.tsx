import type { HTMLAttributes, ReactNode } from "react";
import "./Card.css";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Optional card title, rendered in a bordered header. */
  title?: ReactNode;
  /** Optional subtitle shown under the title. */
  subtitle?: ReactNode;
  /** Adds hover elevation to signal the whole card is clickable. */
  interactive?: boolean;
}

/** Surface container with an optional header. */
export function Card({
  title,
  subtitle,
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  const classes = ["ds-card", interactive && "ds-card--interactive", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {(title || subtitle) && (
        <div className="ds-card__header">
          {title && <h3 className="ds-card__title">{title}</h3>}
          {subtitle && <p className="ds-card__subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="ds-card__body">{children}</div>
    </div>
  );
}

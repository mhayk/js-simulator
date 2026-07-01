import type { HTMLAttributes, ReactNode } from "react";
import type { RuntimeCategory } from "../../tokens/runtime";
import { RUNTIME_CATEGORIES } from "../../tokens/runtime";
import "./StatusBadge.css";

export type ExecutionState =
  | "idle"
  | "active"
  | "waiting"
  | "blocked"
  | "completed"
  | "error";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Execution state — sets colour + a pulsing dot for live states. */
  state?: ExecutionState;
  /** Render as a runtime-category chip instead (uses the category colour). */
  category?: RuntimeCategory;
  /** Show a leading dot (state) or the category glyph. Default true. */
  showMarker?: boolean;
  children?: ReactNode;
}

const STATE_LABEL: Record<ExecutionState, string> = {
  idle: "Idle",
  active: "Active",
  waiting: "Waiting",
  blocked: "Blocked",
  completed: "Done",
  error: "Error",
};

/** Compact status pill. Colour is paired with a dot/glyph and a text label. */
export function StatusBadge({
  state = "idle",
  category,
  showMarker = true,
  className,
  children,
  ...rest
}: StatusBadgeProps) {
  if (category) {
    const meta = RUNTIME_CATEGORIES[category];
    return (
      <span
        data-rt={category}
        className={["ds-badge", "ds-badge--category", className]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {showMarker && <span className="ds-badge__glyph">{meta.glyph}</span>}
        {children ?? meta.label}
      </span>
    );
  }

  return (
    <span
      className={["ds-badge", `ds-badge--${state}`, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {showMarker && <span className="ds-badge__dot" aria-hidden />}
      {children ?? STATE_LABEL[state]}
    </span>
  );
}

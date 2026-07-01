import type { HTMLAttributes, ReactNode } from "react";
import type { RuntimeCategory } from "../../tokens/runtime";
import { RUNTIME_CATEGORIES } from "../../tokens/runtime";
import type { ExecutionState } from "../StatusBadge/StatusBadge";
import "./RuntimeNode.css";

export interface RuntimeNodeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Runtime category — sets colour, glyph, and default title/provider. */
  category: RuntimeCategory;
  /** Override the title (defaults to the category label). */
  title?: ReactNode;
  /** Override the provider label (defaults to the category provider). */
  provider?: ReactNode;
  /** Numeric badge (e.g. queue length, active ops). */
  count?: number;
  /** Execution state of the node. */
  state?: ExecutionState;
  /** Hide the provider line. */
  hideProvider?: boolean;
  /** Adds hover affordance (for click-to-inspect). */
  interactive?: boolean;
  /** Text shown when the body has no children. */
  emptyLabel?: string;
  children?: ReactNode;
}

/** A container for one part of the runtime — Call Stack, a Queue, the OS, … */
export function RuntimeNode({
  category,
  title,
  provider,
  count,
  state = "idle",
  hideProvider = false,
  interactive = false,
  emptyLabel = "empty",
  className,
  children,
  ...rest
}: RuntimeNodeProps) {
  const meta = RUNTIME_CATEGORIES[category];
  const hasChildren = Boolean(children) &&
    !(Array.isArray(children) && children.length === 0);

  return (
    <section
      data-rt={category}
      data-state={state}
      className={["ds-node", interactive && "ds-node--interactive", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <header className="ds-node__header">
        <span className="ds-node__glyph" aria-hidden>
          {meta.glyph}
        </span>
        <span className="ds-node__titles">
          <span className="ds-node__title">{title ?? meta.label}</span>
          {!hideProvider && (
            <span className="ds-node__provider">
              provided by {provider ?? meta.provider}
            </span>
          )}
        </span>
        {typeof count === "number" && (
          <span className="ds-node__count" aria-label={`${count} items`}>
            {count}
          </span>
        )}
      </header>
      <div className="ds-node__body">
        {hasChildren ? (
          children
        ) : (
          <div className="ds-node__empty">{emptyLabel}</div>
        )}
      </div>
    </section>
  );
}

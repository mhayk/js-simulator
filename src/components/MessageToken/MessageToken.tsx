import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import type { RuntimeCategory } from "../../tokens/runtime";
import { RUNTIME_CATEGORIES } from "../../tokens/runtime";
import type { ExecutionState } from "../StatusBadge/StatusBadge";
import "./MessageToken.css";

export type TokenKind =
  | "call"
  | "callback"
  | "microtask"
  | "timer"
  | "io"
  | "network"
  | "websocket"
  | "chunk"
  | "event"
  | "worker";

/** Maps a token kind to the runtime colour category it belongs to. */
const KIND_CATEGORY: Record<TokenKind, RuntimeCategory> = {
  call: "callstack",
  callback: "taskqueue",
  microtask: "microtask",
  timer: "webapi",
  io: "nodeapi",
  network: "network",
  websocket: "websocket",
  chunk: "streams",
  event: "emitter",
  worker: "worker",
};

export interface MessageTokenProps extends HTMLAttributes<HTMLDivElement> {
  /** The code/operation this token represents, e.g. `setTimeout cb`. */
  label: string;
  /** Kind of unit — sets colour category and default glyph. */
  kind?: TokenKind;
  /** Override the colour category directly. */
  category?: RuntimeCategory;
  /** Execution state. */
  state?: ExecutionState;
  /** Compact size for dense queues. */
  size?: "sm" | "md";
  /** Short secondary text (e.g. delay, size, id). */
  meta?: string;
  /** Priority tag shown as a pill (e.g. `nextTick`). */
  priority?: string;
  /** Show the category glyph. Default true. */
  showGlyph?: boolean;
}

/** A single execution unit — a function call, callback, promise, timer, … */
export const MessageToken = forwardRef<HTMLDivElement, MessageTokenProps>(
  function MessageToken(
    {
      label,
      kind = "call",
      category,
      state = "idle",
      size = "md",
      meta,
      priority,
      showGlyph = true,
      className,
      ...rest
    },
    ref,
  ) {
    const cat = category ?? KIND_CATEGORY[kind];
    const glyph = RUNTIME_CATEGORIES[cat].glyph;

    return (
      <div
        ref={ref}
        data-rt={cat}
        className={[
          "ds-token",
          `ds-token--${size}`,
          `ds-token--${state}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {showGlyph && (
          <span className="ds-token__glyph" aria-hidden>
            {glyph}
          </span>
        )}
        <span className="ds-token__label">{label}</span>
        {meta && <span className="ds-token__meta">{meta}</span>}
        {priority && <span className="ds-token__prio">{priority}</span>}
      </div>
    );
  },
);

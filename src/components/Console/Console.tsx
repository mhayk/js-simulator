import { useEffect, useRef } from "react";
import type { HTMLAttributes } from "react";
import "./Console.css";

export type ConsoleLevel = "log" | "info" | "warn" | "error";

export interface ConsoleEntry {
  id: string | number;
  level?: ConsoleLevel;
  text: string;
}

export interface ConsoleProps extends HTMLAttributes<HTMLDivElement> {
  entries: ConsoleEntry[];
  /** Header label. */
  title?: string;
  /** Auto-scroll to the newest entry. Default true. */
  follow?: boolean;
  /** Show a line-number gutter. Default true. */
  showGutter?: boolean;
  emptyLabel?: string;
}

/** Console output panel — the program's `console.*` results, in order. */
export function Console({
  entries,
  title = "Console",
  follow = true,
  showGutter = true,
  emptyLabel = "No output yet — run the simulation.",
  className,
  ...rest
}: ConsoleProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (follow && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [entries.length, follow]);

  return (
    <div className={["ds-console", className].filter(Boolean).join(" ")} {...rest}>
      <div className="ds-console__header">
        <span>{title}</span>
        <span className="ds-console__header-count">{entries.length}</span>
      </div>
      <div className="ds-console__body" ref={bodyRef}>
        {entries.length === 0 ? (
          <div className="ds-console__empty">{emptyLabel}</div>
        ) : (
          entries.map((entry, i) => {
            const level = entry.level ?? "log";
            const isLast = i === entries.length - 1;
            return (
              <div
                key={entry.id}
                className={[
                  "ds-console__line",
                  `ds-console__line--${level}`,
                  isLast && "ds-console__line--fresh",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {showGutter && (
                  <span className="ds-console__gutter">{i + 1}</span>
                )}
                <span className="ds-console__level">{level}</span>
                <span className="ds-console__text">{entry.text}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

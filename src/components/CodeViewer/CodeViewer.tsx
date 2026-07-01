import type { HTMLAttributes } from "react";
import { highlightLine } from "./highlight";
import "./CodeViewer.css";

export interface CodeViewerProps extends HTMLAttributes<HTMLDivElement> {
  /** Source code as a single string. */
  code: string;
  /** 1-based line number currently executing (highlighted). */
  currentLine?: number;
  /** 1-based line numbers with a breakpoint dot. */
  breakpoints?: number[];
  /** Filename shown in the title bar. */
  filename?: string;
  /** Show the traffic-light window chrome. Default true. */
  chrome?: boolean;
  /** Click a gutter line (e.g. to toggle a breakpoint). */
  onLineClick?: (line: number) => void;
}

/** Read-only syntax-highlighted code with a current-line highlight. */
export function CodeViewer({
  code,
  currentLine,
  breakpoints = [],
  filename = "playground.js",
  chrome = true,
  onLineClick,
  className,
  ...rest
}: CodeViewerProps) {
  const lines = code.replace(/\n$/, "").split("\n");
  const bp = new Set(breakpoints);

  return (
    <div className={["ds-code", className].filter(Boolean).join(" ")} {...rest}>
      {chrome && (
        <div className="ds-code__header">
          <span className="ds-code__dot ds-code__dot--r" />
          <span className="ds-code__dot ds-code__dot--y" />
          <span className="ds-code__dot ds-code__dot--g" />
          <span className="ds-code__filename">{filename}</span>
        </div>
      )}
      <div className="ds-code__body">
        {lines.map((line, idx) => {
          const n = idx + 1;
          return (
            <div
              key={n}
              className={[
                "ds-code__line",
                n === currentLine && "ds-code__line--current",
                bp.has(n) && "ds-code__line--breakpoint",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className="ds-code__gutter"
                onClick={onLineClick ? () => onLineClick(n) : undefined}
                style={{ cursor: onLineClick ? "pointer" : undefined }}
              >
                {n}
              </span>
              <span className="ds-code__text">
                {line.length ? highlightLine(line) : "​"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

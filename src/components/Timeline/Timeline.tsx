import type { RuntimeCategory } from "../../tokens/runtime";
import "./Timeline.css";

export interface TimelineStepMeta {
  /** Optional colour category for this step (tints completed ticks). */
  category?: RuntimeCategory;
  /** Optional short label (e.g. an Event Loop phase name). */
  phase?: string;
}

export interface TimelineProps {
  /** Total number of steps. */
  total: number;
  /** Current step index (0-based). */
  current: number;
  /** Jump to a step. */
  onSeek?: (step: number) => void;
  /** Per-step metadata for tinting and the phase label. */
  steps?: TimelineStepMeta[];
  /** Render discrete ticks (default) or a continuous scrubber. */
  variant?: "ticks" | "scrubber";
}

/** Execution timeline — shows progress and lets the user scrub to any step. */
export function Timeline({
  total,
  current,
  onSeek,
  steps,
  variant = "ticks",
}: TimelineProps) {
  const phase = steps?.[current]?.phase;

  return (
    <div className="ds-timeline">
      <div className="ds-timeline__meta">
        <span className="ds-timeline__step">
          Step {total === 0 ? 0 : current + 1}
          <span style={{ color: "var(--color-text-subtle)" }}> / {total}</span>
        </span>
        {phase && <span className="ds-timeline__phase">{phase}</span>}
      </div>

      {variant === "ticks" ? (
        <div
          className="ds-timeline__track"
          role="slider"
          aria-label="Execution timeline"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={current + 1}
        >
          {Array.from({ length: total }, (_, i) => {
            const cls =
              i === current
                ? "ds-timeline__tick--current"
                : i < current
                  ? "ds-timeline__tick--done"
                  : "";
            return (
              <button
                key={i}
                type="button"
                data-rt={i < current ? steps?.[i]?.category : undefined}
                className={["ds-timeline__tick", cls].filter(Boolean).join(" ")}
                aria-label={`Go to step ${i + 1}`}
                onClick={() => onSeek?.(i)}
              />
            );
          })}
        </div>
      ) : (
        <input
          className="ds-timeline__scrubber"
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          value={current}
          aria-label="Execution timeline"
          onChange={(e) => onSeek?.(Number(e.target.value))}
        />
      )}
    </div>
  );
}

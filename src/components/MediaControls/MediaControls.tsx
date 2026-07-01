import "./MediaControls.css";

export interface MediaControlsProps {
  playing: boolean;
  onPlayPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  /** Current playback speed multiplier. */
  speed: number;
  onSpeedChange: (speed: number) => void;
  /** Speeds offered. Default 0.5×–4×. */
  speeds?: number[];
  canStepBack?: boolean;
  canStepForward?: boolean;
}

/** Media-player transport for stepping through a simulation. */
export function MediaControls({
  playing,
  onPlayPause,
  onStepBack,
  onStepForward,
  onReset,
  speed,
  onSpeedChange,
  speeds = [0.5, 1, 2, 4],
  canStepBack = true,
  canStepForward = true,
}: MediaControlsProps) {
  return (
    <div className="ds-media" role="group" aria-label="Simulation controls">
      <button
        type="button"
        className="ds-media__btn"
        onClick={onReset}
        title="Restart"
        aria-label="Restart"
      >
        ⏮
      </button>
      <button
        type="button"
        className="ds-media__btn"
        onClick={onStepBack}
        disabled={!canStepBack}
        title="Previous step"
        aria-label="Previous step"
      >
        ⏪
      </button>
      <button
        type="button"
        className="ds-media__btn ds-media__btn--primary"
        onClick={onPlayPause}
        title={playing ? "Pause" : "Play"}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <button
        type="button"
        className="ds-media__btn"
        onClick={onStepForward}
        disabled={!canStepForward}
        title="Next step"
        aria-label="Next step"
      >
        ⏩
      </button>

      <span className="ds-media__sep" aria-hidden />

      <div className="ds-media__speed" role="group" aria-label="Playback speed">
        {speeds.map((s) => (
          <button
            key={s}
            type="button"
            className={[
              "ds-media__speed-btn",
              s === speed && "ds-media__speed-btn--active",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={s === speed}
            onClick={() => onSpeedChange(s)}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}

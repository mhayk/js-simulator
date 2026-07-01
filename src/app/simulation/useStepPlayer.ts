import { useCallback, useEffect, useRef, useState } from "react";

const BASE_STEP_MS = 1500;

/**
 * Drives step-by-step playback over a fixed-length sequence.
 * `resetKey` forces a reset to step 0 when it changes (e.g. switching to a
 * different scenario that happens to have the same number of steps).
 */
export function useStepPlayer(total: number, resetKey?: string) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const atEnd = index >= total - 1;

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = undefined;
  };

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const prev = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const seek = useCallback(
    (step: number) => {
      setPlaying(false);
      setIndex(Math.max(0, Math.min(step, total - 1)));
    },
    [total],
  );

  const reset = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);

  const play = useCallback(() => {
    if (atEnd) setIndex(0);
    setPlaying(true);
  }, [atEnd]);

  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);

  // Auto-advance while playing.
  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setIndex((i) => i + 1), BASE_STEP_MS / speed);
    return clear;
  }, [playing, index, speed, atEnd]);

  // Reset to start when the sequence changes (scenario switch) — keyed on
  // both length and an explicit resetKey (scenarios of equal length differ).
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [total, resetKey]);

  return {
    index,
    playing,
    speed,
    atEnd,
    atStart: index === 0,
    setSpeed,
    next,
    prev,
    seek,
    reset,
    play,
    pause,
    toggle,
  };
}

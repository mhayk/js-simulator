import type { ReactNode } from "react";
import { Timeline } from "js-simulator";

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24, width: 420 }}>
    {children}
  </div>
);

const noop = () => {};

export const Ticks = () => (
  <Frame>
    <Timeline total={17} current={9} onSeek={noop} />
  </Frame>
);

export const WithPhase = () => (
  <Frame>
    <Timeline
      total={13}
      current={10}
      onSeek={noop}
      steps={Array.from({ length: 13 }, (_, i) => ({
        category: i < 10 ? ("eventloop" as const) : undefined,
        phase: i === 10 ? "Timers phase" : undefined,
      }))}
    />
  </Frame>
);

export const Scrubber = () => (
  <Frame>
    <Timeline total={40} current={16} onSeek={noop} variant="scrubber" />
  </Frame>
);

import type { ReactNode } from "react";
import { MediaControls } from "js-simulator";

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24, width: 380 }}>
    {children}
  </div>
);

const noop = () => {};

export const Paused = () => (
  <Frame>
    <MediaControls
      playing={false}
      onPlayPause={noop}
      onStepBack={noop}
      onStepForward={noop}
      onReset={noop}
      speed={1}
      onSpeedChange={noop}
    />
  </Frame>
);

export const Playing = () => (
  <Frame>
    <MediaControls
      playing
      onPlayPause={noop}
      onStepBack={noop}
      onStepForward={noop}
      onReset={noop}
      speed={2}
      onSpeedChange={noop}
    />
  </Frame>
);

export const AtStart = () => (
  <Frame>
    <MediaControls
      playing={false}
      onPlayPause={noop}
      onStepBack={noop}
      onStepForward={noop}
      onReset={noop}
      speed={0.5}
      onSpeedChange={noop}
      canStepBack={false}
    />
  </Frame>
);

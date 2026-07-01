import type { ReactNode } from "react";
import { Console } from "js-simulator";

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24, width: 420 }}>
    {children}
  </div>
);

export const Output = () => (
  <Frame>
    <Console
      style={{ height: 180 }}
      entries={[
        { id: 1, text: "A" },
        { id: 2, text: "D" },
        { id: 3, level: "info", text: "microtask queue drained" },
        { id: 4, text: "C" },
        { id: 5, text: "B" },
      ]}
    />
  </Frame>
);

export const Levels = () => (
  <Frame>
    <Console
      style={{ height: 180 }}
      entries={[
        { id: 1, level: "log", text: "server listening on :3000" },
        { id: 2, level: "info", text: "client connected (id=ab12)" },
        { id: 3, level: "warn", text: "MaxListenersExceededWarning: 11 listeners" },
        { id: 4, level: "error", text: "Uncaught TypeError: cb is not a function" },
      ]}
    />
  </Frame>
);

export const Empty = () => (
  <Frame>
    <Console style={{ height: 140 }} entries={[]} />
  </Frame>
);

import type { ReactNode } from "react";
import { Select, Stack } from "js-simulator";

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24, width: 280 }}>
    {children}
  </div>
);

const noop = () => {};

export const WithLabel = () => (
  <Frame>
    <Select
      label="Runtime"
      defaultValue="node"
      onChange={noop}
      options={[
        { label: "Browser", value: "browser" },
        { label: "Node.js", value: "node" },
      ]}
    />
  </Frame>
);

export const Scenario = () => (
  <Frame>
    <Select
      label="Example"
      defaultValue="promise"
      onChange={noop}
      options={[
        { label: "setTimeout(0)", value: "timeout" },
        { label: "Promise + setTimeout", value: "promise" },
        { label: "async / await", value: "async" },
        { label: "process.nextTick", value: "nexttick" },
      ]}
    />
  </Frame>
);

export const Standalone = () => (
  <Frame>
    <Stack gap="md">
      <Select
        defaultValue="4"
        onChange={noop}
        options={[
          { label: "Thread pool: 2", value: "2" },
          { label: "Thread pool: 4", value: "4" },
          { label: "Thread pool: 8", value: "8" },
        ]}
      />
    </Stack>
  </Frame>
);

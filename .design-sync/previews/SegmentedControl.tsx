import { useState } from "react";
import type { ReactNode } from "react";
import { SegmentedControl, Stack } from "js-simulator";

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24 }}>
    {children}
  </div>
);

export const Runtime = () => {
  const [value, setValue] = useState("browser");
  return (
    <Frame>
      <SegmentedControl
        aria-label="Runtime"
        value={value}
        onChange={setValue}
        options={[
          { label: "Browser", value: "browser", rt: "webapi" },
          { label: "Node.js", value: "node", rt: "nodeapi" },
        ]}
      />
    </Frame>
  );
};

export const DetailLevel = () => {
  const [value, setValue] = useState("standard");
  return (
    <Frame>
      <SegmentedControl
        aria-label="Detail level"
        value={value}
        onChange={setValue}
        options={[
          { label: "Beginner", value: "beginner" },
          { label: "Standard", value: "standard" },
          { label: "Advanced", value: "advanced" },
          { label: "Internals", value: "internals" },
        ]}
      />
    </Frame>
  );
};

export const Theme = () => {
  const [value, setValue] = useState("dark");
  return (
    <Frame>
      <Stack direction="horizontal" gap="md" align="center">
        <SegmentedControl
          aria-label="Theme"
          value={value}
          onChange={setValue}
          options={[
            { label: "Dark", value: "dark" },
            { label: "Light", value: "light" },
          ]}
        />
      </Stack>
    </Frame>
  );
};

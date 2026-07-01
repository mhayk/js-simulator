import type { ReactNode } from "react";
import { Stack } from "js-simulator";

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24 }}>
    {children}
  </div>
);

// A visible tile so the layout axis and gaps are legible in the preview.
const Tile = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      background: "var(--color-brand-100)",
      color: "var(--color-brand-700)",
      border: "1px solid var(--color-brand-300)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-md) var(--space-lg)",
      fontWeight: 600,
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

export const Vertical = () => (
  <Frame>
    <Stack direction="vertical" gap="md" style={{ width: 200 }}>
      <Tile>First</Tile>
      <Tile>Second</Tile>
      <Tile>Third</Tile>
    </Stack>
  </Frame>
);

export const Horizontal = () => (
  <Frame>
    <Stack direction="horizontal" gap="md" align="center">
      <Tile>One</Tile>
      <Tile>Two</Tile>
      <Tile>Three</Tile>
    </Stack>
  </Frame>
);

export const GapScale = () => (
  <Frame>
    <Stack gap="lg">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((g) => (
        <Stack key={g} direction="horizontal" gap={g} align="center">
          <Tile>{g}</Tile>
          <Tile>A</Tile>
          <Tile>B</Tile>
        </Stack>
      ))}
    </Stack>
  </Frame>
);

export const Wrap = () => (
  <Frame>
    <Stack direction="horizontal" gap="sm" wrap style={{ width: 260 }}>
      {Array.from({ length: 8 }, (_, i) => (
        <Tile key={i}>{i + 1}</Tile>
      ))}
    </Stack>
  </Frame>
);

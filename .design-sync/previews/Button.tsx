import type { ReactNode } from "react";
import { Button, Stack } from "js-simulator";

// Base styling context: gives descendants the DS font, color, and box-sizing.
const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24 }}>
    {children}
  </div>
);

export const Variants = () => (
  <Frame>
    <Stack direction="horizontal" gap="sm" wrap align="center">
      <Button variant="primary">Run simulation</Button>
      <Button variant="secondary">Reset</Button>
      <Button variant="ghost">Options</Button>
      <Button variant="danger">Delete</Button>
    </Stack>
  </Frame>
);

export const Sizes = () => (
  <Frame>
    <Stack direction="horizontal" gap="sm" align="center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </Stack>
  </Frame>
);

export const States = () => (
  <Frame>
    <Stack direction="horizontal" gap="sm" align="center">
      <Button variant="primary">Enabled</Button>
      <Button variant="primary" disabled>
        Disabled
      </Button>
      <Button variant="secondary" disabled>
        Disabled
      </Button>
    </Stack>
  </Frame>
);

export const WithIcon = () => (
  <Frame>
    <Stack direction="horizontal" gap="sm" align="center">
      <Button variant="primary" leftIcon={<span aria-hidden>▶</span>}>
        Play
      </Button>
      <Button variant="secondary" leftIcon={<span aria-hidden>⏸</span>}>
        Pause
      </Button>
    </Stack>
  </Frame>
);

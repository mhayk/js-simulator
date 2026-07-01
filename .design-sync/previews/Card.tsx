import type { ReactNode } from "react";
import { Button, Card, Input, Stack } from "js-simulator";

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24, width: 360 }}>
    {children}
  </div>
);

export const WithHeader = () => (
  <Frame>
    <Card title="Pendulum" subtitle="Single degree of freedom">
      A card groups related content on a surface, with an optional bordered
      header for a title and subtitle.
    </Card>
  </Frame>
);

export const Plain = () => (
  <Frame>
    <Card>Body-only card — no header, just padded content on a surface.</Card>
  </Frame>
);

export const Interactive = () => (
  <Frame>
    <Card title="Open preset" subtitle="Click to load" interactive>
      Interactive cards elevate on hover to signal the whole surface is
      clickable.
    </Card>
  </Frame>
);

export const Composed = () => (
  <Frame>
    <Card title="New simulation">
      <Stack gap="lg">
        <Input label="Name" placeholder="My simulation" />
        <Stack direction="horizontal" gap="sm" align="center">
          <Button variant="primary">Create</Button>
          <Button variant="ghost">Cancel</Button>
        </Stack>
      </Stack>
    </Card>
  </Frame>
);

import type { ReactNode } from "react";
import { Input, Stack } from "js-simulator";

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24, width: 320 }}>
    {children}
  </div>
);

export const Default = () => (
  <Frame>
    <Input label="Simulation name" placeholder="Two-body orbit" />
  </Frame>
);

export const WithHint = () => (
  <Frame>
    <Input
      label="Timestep (ms)"
      placeholder="16"
      defaultValue="16"
      hint="Lower values increase accuracy but cost more CPU."
    />
  </Frame>
);

export const WithError = () => (
  <Frame>
    <Input
      label="Iterations"
      defaultValue="-5"
      error="Iterations must be a positive number."
    />
  </Frame>
);

export const States = () => (
  <Frame>
    <Stack gap="lg">
      <Input label="Editable" placeholder="Type here…" />
      <Input label="Disabled" defaultValue="Locked value" disabled />
    </Stack>
  </Frame>
);

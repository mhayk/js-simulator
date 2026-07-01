import type { ReactNode } from "react";
import { StatusBadge, Stack } from "js-simulator";

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24 }}>
    {children}
  </div>
);

export const ExecutionStates = () => (
  <Frame>
    <Stack direction="horizontal" gap="sm" wrap align="center">
      <StatusBadge state="idle" />
      <StatusBadge state="active" />
      <StatusBadge state="waiting" />
      <StatusBadge state="blocked" />
      <StatusBadge state="completed" />
      <StatusBadge state="error" />
    </Stack>
  </Frame>
);

export const RuntimeCategories = () => (
  <Frame>
    <Stack direction="horizontal" gap="sm" wrap align="center">
      <StatusBadge category="callstack" />
      <StatusBadge category="microtask" />
      <StatusBadge category="eventloop" />
      <StatusBadge category="libuv" />
      <StatusBadge category="websocket" />
      <StatusBadge category="threadpool" />
    </Stack>
  </Frame>
);

export const CustomLabel = () => (
  <Frame>
    <Stack direction="horizontal" gap="sm" align="center">
      <StatusBadge state="active">Running</StatusBadge>
      <StatusBadge state="waiting">Queued · 3</StatusBadge>
      <StatusBadge category="network">TCP socket</StatusBadge>
    </Stack>
  </Frame>
);

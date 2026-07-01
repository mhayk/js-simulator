import type { ReactNode } from "react";
import { MessageToken, RuntimeNode, Stack } from "js-simulator";

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24, width: 320 }}>
    {children}
  </div>
);

export const CallStack = () => (
  <Frame>
    <RuntimeNode category="callstack" count={2} state="active">
      <Stack gap="xs">
        <MessageToken label="fetchUser()" kind="call" state="active" size="sm" />
        <MessageToken label="(script)" kind="call" state="waiting" size="sm" />
      </Stack>
    </RuntimeNode>
  </Frame>
);

export const MicrotaskQueue = () => (
  <Frame>
    <RuntimeNode category="microtask" count={2}>
      <Stack gap="xs">
        <MessageToken label="() => log('C')" kind="microtask" size="sm" />
        <MessageToken label="() => resolve()" kind="microtask" size="sm" />
      </Stack>
    </RuntimeNode>
  </Frame>
);

export const EmptyNode = () => (
  <Frame>
    <RuntimeNode category="taskqueue" count={0} emptyLabel="no tasks queued" />
  </Frame>
);

export const OperatingSystem = () => (
  <Frame>
    <RuntimeNode category="os" state="waiting">
      <MessageToken label="epoll_wait" kind="network" state="waiting" size="sm" />
    </RuntimeNode>
  </Frame>
);

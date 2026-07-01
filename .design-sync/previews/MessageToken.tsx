import type { ReactNode } from "react";
import { MessageToken, Stack } from "js-simulator";

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24, width: 300 }}>
    {children}
  </div>
);

export const Kinds = () => (
  <Frame>
    <Stack gap="sm">
      <MessageToken label="fetchUser()" kind="call" />
      <MessageToken label="() => log('C')" kind="microtask" />
      <MessageToken label="setTimeout cb" kind="timer" meta="0 ms" />
      <MessageToken label="fs.readFile cb" kind="io" />
      <MessageToken label="message frame" kind="websocket" />
    </Stack>
  </Frame>
);

export const States = () => (
  <Frame>
    <Stack gap="sm">
      <MessageToken label="running()" kind="call" state="active" />
      <MessageToken label="pending cb" kind="callback" state="waiting" />
      <MessageToken label="blocked op" kind="io" state="blocked" />
      <MessageToken label="done()" kind="call" state="completed" />
    </Stack>
  </Frame>
);

export const WithPriority = () => (
  <Frame>
    <Stack gap="sm">
      <MessageToken
        label="() => 'nextTick'"
        kind="microtask"
        priority="nextTick"
      />
      <MessageToken label="chunk #42" kind="chunk" meta="16 KB" />
    </Stack>
  </Frame>
);

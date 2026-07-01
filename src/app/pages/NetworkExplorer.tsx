import { useMemo, useState } from "react";
import { LayoutGroup } from "framer-motion";
import { CodeViewer, Console, RuntimeNode, SegmentedControl, StatusBadge } from "js-simulator";
import type { ConsoleEntry } from "js-simulator";
import { LaneSim } from "../simulation/laneSim";
import { useStepPlayer } from "../simulation/useStepPlayer";
import { useSettings } from "../theme";
import { LaneTokens, Narration, SimHeader, SimLayout, StepControls } from "../components/sim";
import "../components/sim.css";

const CODE = `const net = require('node:net');

const server = net.createServer((socket) => {
  socket.on('data', (chunk) => {
    console.log('received', chunk.length, 'bytes');
  });
});

server.listen(3000);`;

type OS = "linux" | "macos" | "windows";

const NOTIFIER: Record<OS, string> = {
  linux: "epoll",
  macos: "kqueue",
  windows: "IOCP",
};

function buildNetwork(os: OS) {
  const notifier = NOTIFIER[os];
  const s = new LaneSim(["app", "libuv", "notifier", "kernel", "wire"]);

  s.at(4).put("app", { id: "op", label: "socket.on('data')", kind: "network", state: "waiting" });
  s.snap("The server waits for data on a client socket. This is I/O — but not the kind that uses the thread pool.", {
    note: "fs and crypto use the 4-thread pool. Sockets do NOT — the OS itself watches them.",
  });

  s.move("app", "libuv", "op", { label: "watch fd 14", meta: "register" });
  s.snap("libuv registers interest in the socket's file descriptor and returns immediately.");

  s.move("libuv", "notifier", "op", { label: `${notifier} watch fd 14`, meta: "armed" });
  s.snap(`libuv arms the OS event notifier (${notifier}) for that descriptor. The main thread is now free.`, {
    note: "The Event Loop sits idle in the Poll phase — zero CPU spent waiting. One thread watches thousands of sockets.",
  });

  s.put("wire", { id: "pkt", label: "TCP segment", kind: "network", state: "active", meta: "1440 B" });
  s.snap("Later, the remote peer sends data. It arrives at the network interface.");

  s.move("wire", "kernel", "pkt", { meta: "recv buffer" });
  s.snap("The kernel copies the bytes into the socket's receive buffer — the descriptor becomes readable.");

  s.setState("notifier", "op", "active").log_(`${notifier}: fd 14 readable`, "info");
  s.snap(`${notifier} detects the readable socket and wakes libuv. No busy-wait, no polling loop.`);

  s.move("notifier", "libuv", "op", { label: "poll: fd 14 ready", state: "active" });
  s.remove("kernel", "pkt");
  s.snap("On its next turn, libuv's Poll phase sees the ready descriptor and marks the callback eligible.");

  s.move("libuv", "app", "op", { label: "onData(chunk)", kind: "callback", state: "active" });
  s.log_("received 1440 bytes");
  s.snap("The callback runs on the main thread; your code processes the chunk.");

  s.setState("app", "op", "completed");
  s.snap("Done. The socket keeps being watched — the whole cycle repeats for the next packet.", {
    note: "This OS-notifier model is why a single Node process serves thousands of concurrent connections without a thread each.",
  });

  return { os, notifier, steps: s.steps };
}

const SCENARIOS: Record<OS, ReturnType<typeof buildNetwork>> = {
  linux: buildNetwork("linux"),
  macos: buildNetwork("macos"),
  windows: buildNetwork("windows"),
};

const LAYERS: { key: string; category: "nodeapi" | "libuv" | "os" | "network"; title: string; provider: string }[] = [
  { key: "app", category: "nodeapi", title: "Node.js app", provider: "Node.js" },
  { key: "libuv", category: "libuv", title: "libuv", provider: "libuv" },
  { key: "notifier", category: "os", title: "OS event notifier", provider: "OS" },
  { key: "kernel", category: "os", title: "Kernel socket buffer", provider: "OS" },
  { key: "wire", category: "network", title: "Network interface", provider: "OS" },
];

export function NetworkExplorer() {
  const { detail } = useSettings();
  const showDetail = detail !== "beginner";
  const [os, setOs] = useState<OS>("linux");
  const scenario = SCENARIOS[os];
  const player = useStepPlayer(scenario.steps.length, os);
  const step = scenario.steps[player.index];

  const logEntries: ConsoleEntry[] = useMemo(
    () => step.log.map((l) => ({ id: l.id, text: l.text, level: l.level })),
    [step.log],
  );

  return (
    <SimLayout
      left={
        <>
          <SimHeader
            title="Network I/O"
            category="network"
            right={
              <SegmentedControl
                aria-label="Operating system"
                value={os}
                onChange={setOs}
                options={[
                  { label: "Linux", value: "linux", rt: "network" },
                  { label: "macOS", value: "macos", rt: "network" },
                  { label: "Windows", value: "windows", rt: "network" },
                ]}
              />
            }
          />
          <p className="sim__lead">
            Why socket I/O is watched by the OS ({scenario.notifier}) and never touches the
            thread pool.
          </p>
          <CodeViewer code={CODE} currentLine={step.line ?? undefined} filename="server.js" />
          <StepControls player={player} total={scenario.steps.length} />
          <Narration
            index={player.index}
            explanation={step.explanation}
            note={step.note}
            showNote={showDetail}
            accent="network"
          />
          <Console title="Console" entries={logEntries} style={{ height: 130 }} />
        </>
      }
    >
      <div style={{ display: "flex", gap: "var(--space-md)", alignItems: "flex-start" }}>
        <LayoutGroup>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            {LAYERS.map((layer) => (
              <RuntimeNode
                key={layer.key}
                category={layer.category}
                title={layer.title}
                provider={layer.provider}
                state={step.lanes[layer.key].length ? "active" : "idle"}
                emptyLabel="—"
              >
                <LaneTokens tokens={step.lanes[layer.key]} />
              </RuntimeNode>
            ))}
          </div>
        </LayoutGroup>

        <div className="sim__panel" style={{ width: 220, flex: "none" }}>
          <div className="sim__section-label">Thread pool</div>
          <StatusBadge state="idle">not used</StatusBadge>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-sm)", lineHeight: 1.6 }}>
            Network readiness comes from <strong>{scenario.notifier}</strong> — the OS
            notifies libuv directly. The 4 pool threads stay free for fs, crypto and DNS.
          </p>
        </div>
      </div>
    </SimLayout>
  );
}

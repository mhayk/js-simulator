import { WsSim } from "./wsModel";
import type { WsScenario } from "./wsModel";

function buildLifecycle(): WsScenario {
  const clientCode = `const socket = new WebSocket('wss://api.example.com');

socket.addEventListener('open', () => {
  socket.send('Hello server');
});

socket.addEventListener('message', (event) => {
  console.log(event.data);
});

socket.addEventListener('close', () => {
  console.log('Connection closed');
});`;

  const s = new WsSim();

  s.at(1).state("connecting");
  s.logAt("net", "opening TCP connection to api.example.com:443");
  s.snap(
    "`new WebSocket(url)` starts an ordinary HTTP(S) connection. The socket state is CONNECTING (0).",
    { note: "A WebSocket always begins life as an HTTP request — there is no separate 'ws' network protocol at this point." },
  );

  s.at(3).listen("open");
  s.snap("An `open` listener is registered — it fires once the handshake succeeds.");

  s.at(7).listen("message");
  s.snap("A `message` listener is registered for incoming frames.");

  s.at(11).listen("close");
  s.snap("A `close` listener is registered. All handlers are set up before anything arrives.", {
    note: "Register listeners synchronously, before the connection opens — a frame that arrives before its listener exists is lost.",
  });

  s.send("hs", "up", "handshake");
  s.snap(
    "The browser sends an HTTP GET with `Upgrade: websocket` and a random `Sec-WebSocket-Key`.",
    { note: "This is the WebSocket handshake — still plain HTTP, carried by the browser's networking layer and the OS socket." },
  );

  s.deliver("hs").clients(1);
  s.logAt("server", "handshake received — verifying Sec-WebSocket-Key");
  s.send("up101", "down", "upgrade");
  s.snap("The server accepts and replies `101 Switching Protocols`, computing the accept key.");

  s.deliver("up101").state("open");
  s.logAt("client", "readyState → OPEN (1)");
  s.snap(
    "The client receives 101. The protocol switches from HTTP to WebSocket: one persistent, full-duplex TCP connection.",
    { note: "From here both sides can send at any time — no request/response pairing, no new connections." },
  );

  s.pushClientCall({ id: "openCb", label: "open handler", kind: "event", state: "active" });
  s.at(4);
  s.snap("The `open` event fires. Its callback runs on the client's Call Stack.");

  s.send("m1", "up", "text", "\"Hello server\"");
  s.popClientCall("openCb").at(null);
  s.snap("Inside the handler, `socket.send('Hello server')` writes a text frame onto the wire.");

  s.deliver("m1");
  s.logAt("server", "recv text: \"Hello server\"");
  s.snap("The server receives the text frame and processes it.");

  s.send("m2", "down", "text", "\"Welcome!\"");
  s.snap("The server sends a reply frame back down the same connection.");

  s.deliver("m2");
  s.pushClientCall({ id: "msgCb", label: "message handler", kind: "event", state: "active" });
  s.at(8).logAt("client", "Welcome!");
  s.snap(
    "The frame arrives, the `message` event fires, and its callback logs `event.data`.",
    { note: "Incoming frames become `message` events, queued like any other task and run when the Call Stack is free." },
  );

  s.popClientCall("msgCb").at(null);
  s.send("ping", "down", "ping");
  s.snap("Periodically the server sends a `ping` control frame — the heartbeat that keeps the link alive.", {
    note: "The browser auto-replies with `pong`; no application code runs. Missing pongs let either side detect a dead connection.",
  });

  s.deliver("ping").send("pong", "up", "pong");
  s.snap("The browser automatically answers with a `pong`. The connection is confirmed healthy.");

  s.deliver("pong").state("closing").send("cl", "up", "close");
  s.snap("`socket.close()` starts a graceful close: state → CLOSING (2) and a close frame is sent.");

  s.deliver("cl").send("cla", "down", "close");
  s.snap("The server acknowledges with its own close frame.");

  s.deliver("cla").state("closed").clients(0);
  s.pushClientCall({ id: "closeCb", label: "close handler", kind: "event", state: "active" });
  s.at(12).logAt("client", "Connection closed");
  s.snap("The TCP connection closes, state → CLOSED (3), and the `close` event fires.");

  s.popClientCall("closeCb").at(null);
  s.snap("Done. One connection carried the handshake, a full-duplex message exchange, a heartbeat, and a clean close.", {
    note: "Contrast with HTTP: no polling, no reconnect per message — a single socket stayed open the whole time.",
  });

  return {
    id: "ws-lifecycle",
    name: "Connection lifecycle",
    summary: "Handshake → open → send/receive → ping/pong → clean close.",
    clientCode,
    steps: s.steps,
  };
}

export const WS_SCENARIOS: WsScenario[] = [buildLifecycle()];

import { BSim } from "./broadcastModel";
import type { BScenario } from "./broadcastModel";

const ALL = ["A", "B", "C", "D", "E"];
const flat = (ids: string[]) => ids.map((id) => ({ id, name: `Client ${id}` }));

/* -------------------- Broadcast to everyone -------------------- */
function buildBroadcast(): BScenario {
  const s = new BSim("broadcast", flat(ALL));
  s.snap("Five clients are connected. The server holds one socket per client.", {
    note: "`io.emit(...)` sends to every connected client, including the original sender.",
  });

  s.set("A", "sending").frame("m", "up", "\"Hello everyone\"");
  s.logAt("in", "A → server: \"Hello everyone\"");
  s.snap("Client A emits a message to the server.");

  s.clearFrames().server("io.emit → all 5 clients");
  s.snap("The server receives it and calls `io.emit` — fan out to every socket.");

  s.setMany(ALL, "receiving");
  ALL.forEach((id) => s.frame(`d${id}`, "down", "msg", id));
  s.snap("A copy of the frame is written to all five sockets — including A, the sender.");

  s.clearFrames().setMany(ALL, "received").server("done", false);
  s.logAt("out", "server → A,B,C,D,E (5 deliveries)");
  s.snap("All five clients receive the message. One emit produced five deliveries.", {
    note: "The sender also gets its own message back — that is the difference from `socket.broadcast`.",
  });

  return {
    id: "broadcast",
    name: "Broadcast to all",
    mode: "broadcast",
    summary: "io.emit() — every connected client receives, sender included.",
    steps: s.steps,
  };
}

/* ---------------- Broadcast except the sender ---------------- */
function buildExceptSender(): BScenario {
  const s = new BSim("except-sender", flat(ALL));
  s.snap("Same five clients. This time A will notify everyone else — not itself.", {
    note: "`socket.broadcast.emit(...)` sends to all clients EXCEPT the socket it is called on.",
  });

  s.set("A", "sending").frame("m", "up", "\"A is typing…\"");
  s.logAt("in", "A → server: typing indicator");
  s.snap("Client A emits a typing indicator.");

  s.clearFrames().server("socket.broadcast.emit → all except A");
  s.set("A", "excluded");
  s.snap("The server relays with `socket.broadcast.emit` — everyone except the sender.");

  s.setMany(["B", "C", "D", "E"], "receiving");
  ["B", "C", "D", "E"].forEach((id) => s.frame(`d${id}`, "down", "typing", id));
  s.snap("Frames go to B, C, D and E. A is skipped — it already knows it is typing.");

  s.clearFrames().setMany(["B", "C", "D", "E"], "received").server("done", false);
  s.logAt("out", "server → B,C,D,E (4 deliveries, A excluded)");
  s.snap("Four clients receive it; A is excluded. This is the pattern for typing and presence.", {
    note: "Typing indicators, 'user joined', and cursor positions all use broadcast-except-sender.",
  });

  return {
    id: "except-sender",
    name: "Except the sender",
    mode: "except-sender",
    summary: "socket.broadcast.emit() — all clients except the one who sent it.",
    steps: s.steps,
  };
}

/* -------------------------- Rooms -------------------------- */
function buildRooms(): BScenario {
  const clients = [
    { id: "A", name: "Client A", room: "game-1" },
    { id: "B", name: "Client B", room: "game-1" },
    { id: "C", name: "Client C", room: "game-2" },
    { id: "D", name: "Client D", room: "game-2" },
    { id: "E", name: "Client E", room: "lobby" },
  ];
  const s = new BSim("rooms", clients);
  s.snap("Clients are grouped into rooms: A,B in game-1 · C,D in game-2 · E in lobby.", {
    note: "A room is just a named set of sockets the server tracks. Clients never see rooms directly.",
  });

  s.set("A", "sending").frame("m", "up", "\"move: e2-e4\"");
  s.logAt("in", "A (game-1) → server: move");
  s.snap("Client A sends a game move. It belongs to room game-1.");

  s.clearFrames().server("socket.to('game-1').emit");
  s.setMany(["C", "D", "E"], "excluded");
  s.snap("The server targets only room game-1 with `socket.to('game-1').emit` — others are not addressed.");

  s.set("B", "receiving").frame("dB", "down", "move", "B");
  s.snap("Only Client B (the other game-1 member) receives the move. A sent it, so it is not echoed back.");

  s.clearFrames().set("B", "received").server("done", false);
  s.logAt("out", "server → B only (room game-1, sender excluded)");
  s.snap("C, D and E never saw the message — room isolation kept it inside game-1.", {
    note: "With multiple server instances, rooms live in local memory — a Redis adapter + pub/sub is needed so a broadcast reaches members connected to OTHER instances.",
  });

  return {
    id: "rooms",
    name: "Rooms",
    mode: "rooms",
    summary: "socket.to('room').emit() — only members of that room receive it.",
    steps: s.steps,
  };
}

export const BROADCAST_SCENARIOS: BScenario[] = [
  buildBroadcast(),
  buildExceptSender(),
  buildRooms(),
];

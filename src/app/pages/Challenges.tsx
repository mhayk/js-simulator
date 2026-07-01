import { useMemo, useState } from "react";
import { Button, CodeViewer, SegmentedControl, StatusBadge } from "js-simulator";
import "./practice.css";

type Level = "Beginner" | "Intermediate" | "Advanced" | "Expert";

interface Challenge {
  id: string;
  level: Level;
  prompt: string;
  code: string;
  options: string[];
  answer: number;
  explanation: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: "sync-timeout",
    level: "Beginner",
    prompt: "In what order are the numbers logged?",
    code: `console.log(1);
setTimeout(() => console.log(2), 0);
console.log(3);`,
    options: ["1, 2, 3", "1, 3, 2", "2, 1, 3", "3, 1, 2"],
    answer: 1,
    explanation:
      "Synchronous code runs first (1, then 3). setTimeout's callback is a macrotask, so 2 is deferred until the call stack is empty — even with a 0ms delay.",
  },
  {
    id: "micro-vs-macro",
    level: "Intermediate",
    prompt: "Predict the output order.",
    code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`,
    options: ["A, B, C, D", "A, D, C, B", "A, D, B, C", "A, C, D, B"],
    answer: 1,
    explanation:
      "A and D are synchronous. Then the microtask queue drains BEFORE any macrotask, so the promise callback C runs before the timer B. Result: A, D, C, B.",
  },
  {
    id: "nested-micro",
    level: "Intermediate",
    prompt: "What does this log?",
    code: `Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2));
Promise.resolve()
  .then(() => console.log(3))
  .then(() => console.log(4));`,
    options: ["1, 2, 3, 4", "1, 3, 2, 4", "1, 3, 4, 2", "3, 1, 4, 2"],
    answer: 1,
    explanation:
      "Each .then schedules a new microtask when its predecessor settles. The two chains interleave tick by tick: 1 and 3 are queued first (→ 1, 3), and each queues the next link (→ 2, 4). Result: 1, 3, 2, 4.",
  },
  {
    id: "node-nexttick",
    level: "Advanced",
    prompt: "In Node.js, what is the output order?",
    code: `setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));`,
    options: [
      "timeout, immediate, promise, nextTick",
      "nextTick, promise, timeout, immediate",
      "nextTick, promise, immediate, timeout",
      "promise, nextTick, timeout, immediate",
    ],
    answer: 1,
    explanation:
      "process.nextTick runs first, then the Promise microtask — both before the loop continues. Then come the phases: timers (setTimeout) generally before check (setImmediate) when called from the main module. Result: nextTick, promise, timeout, immediate.",
  },
  {
    id: "async-await",
    level: "Advanced",
    prompt: "What order do these log?",
    code: `async function run() {
  console.log(1);
  await null;
  console.log(2);
}
console.log(0);
run();
console.log(3);`,
    options: ["0, 1, 2, 3", "0, 1, 3, 2", "0, 3, 1, 2", "1, 0, 3, 2"],
    answer: 1,
    explanation:
      "run() executes synchronously up to the await: logs 1. `await` suspends and schedules the rest as a microtask, so control returns and 3 logs. Then the microtask resumes: 2. Result: 0, 1, 3, 2.",
  },
  {
    id: "starvation",
    level: "Expert",
    prompt: "Does the setTimeout callback ever run?",
    code: `setTimeout(() => console.log("timer"), 0);
function loop() {
  Promise.resolve().then(loop);
}
loop();`,
    options: [
      "Yes, right after the current task",
      "Yes, but only after 0ms",
      "No — the microtask queue never empties",
      "It throws a stack overflow",
    ],
    answer: 2,
    explanation:
      "Each microtask schedules another microtask, so the queue never drains. The event loop only advances to the next macrotask (the timer) once microtasks are exhausted — which never happens. The timer is starved forever. No stack overflow: each `loop` returns before the next is queued.",
  },
];

const LEVELS: Level[] = ["Beginner", "Intermediate", "Advanced", "Expert"];

export function Challenges() {
  const [level, setLevel] = useState<Level>("Beginner");
  const pool = useMemo(() => CHALLENGES.filter((c) => c.level === level), [level]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const challenge = pool[idx];
  const answered = picked !== null;
  const isCorrect = picked === challenge.answer;

  function choose(i: number) {
    if (answered) return;
    setPicked(i);
    setScore((s) => ({
      correct: s.correct + (i === challenge.answer ? 1 : 0),
      total: s.total + 1,
    }));
  }

  function next() {
    setPicked(null);
    setIdx((i) => (i + 1) % pool.length);
  }

  function switchLevel(l: Level) {
    setLevel(l);
    setIdx(0);
    setPicked(null);
  }

  return (
    <div className="practice ds-root" data-rt="microtask">
      <div className="practice__head">
        <div>
          <div className="practice__eyebrow">Practice</div>
          <h1 className="practice__title">Challenges</h1>
          <p className="practice__lead">
            Predict the execution order before you run it in your head. Pick the output you
            expect — then see exactly why the runtime disagrees (or not).
          </p>
        </div>
        <div className="practice__score" aria-live="polite">
          <span className="practice__score-num">{score.correct}</span>
          <span className="practice__score-den">/ {score.total}</span>
          <span className="practice__score-label">correct</span>
        </div>
      </div>

      <SegmentedControl<Level>
        aria-label="Difficulty"
        value={level}
        onChange={switchLevel}
        options={LEVELS.map((l) => ({ label: l, value: l }))}
      />

      <div className="quiz">
        <div className="quiz__left">
          <div className="quiz__meta">
            <StatusBadge state="idle" showMarker={false}>
              {challenge.level}
            </StatusBadge>
            <span className="quiz__count">
              {idx + 1} of {pool.length}
            </span>
          </div>
          <CodeViewer code={challenge.code} filename="challenge.js" />
        </div>

        <div className="quiz__right">
          <h2 className="quiz__prompt">{challenge.prompt}</h2>
          <div className="quiz__options">
            {challenge.options.map((opt, i) => {
              const state = !answered
                ? ""
                : i === challenge.answer
                  ? " quiz__option--correct"
                  : i === picked
                    ? " quiz__option--wrong"
                    : " quiz__option--muted";
              return (
                <button
                  key={i}
                  type="button"
                  className={`quiz__option${state}`}
                  onClick={() => choose(i)}
                  disabled={answered}
                >
                  <span className="quiz__option-key">{String.fromCharCode(65 + i)}</span>
                  <code>{opt}</code>
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className={`quiz__explain ${isCorrect ? "quiz__explain--ok" : "quiz__explain--no"}`}
            >
              <strong>{isCorrect ? "Correct." : "Not quite."}</strong>{" "}
              {challenge.explanation}
              <div className="quiz__next">
                <Button variant="primary" onClick={next}>
                  Next challenge →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

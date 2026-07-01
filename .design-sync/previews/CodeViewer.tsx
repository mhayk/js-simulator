import type { ReactNode } from "react";
import { CodeViewer } from "js-simulator";

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="ds-root" style={{ padding: 24, width: 460 }}>
    {children}
  </div>
);

const SAMPLE = `console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve().then(() => console.log('C'));

console.log('D');`;

export const Highlighted = () => (
  <Frame>
    <CodeViewer code={SAMPLE} currentLine={5} filename="event-loop.js" />
  </Frame>
);

export const WithBreakpoint = () => (
  <Frame>
    <CodeViewer
      code={SAMPLE}
      currentLine={1}
      breakpoints={[3]}
      filename="debug.js"
    />
  </Frame>
);

export const NoChrome = () => (
  <Frame>
    <CodeViewer
      code={`function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`}
      currentLine={3}
      chrome={false}
    />
  </Frame>
);

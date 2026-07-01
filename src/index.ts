// Public entry point for the JavaScript Runtime Simulator design system.
// Global styles + tokens are bundled into the library's CSS output.
import "./styles/global.css";

// --- Runtime vocabulary (types + metadata) ---
export type { RuntimeCategory, Provider, RuntimeCategoryMeta } from "./tokens/runtime";
export { RUNTIME_CATEGORIES, RUNTIME_CATEGORY_KEYS } from "./tokens/runtime";

// --- Primitives ---
export { Button } from "./components/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/Button";

export { Input } from "./components/Input";
export type { InputProps } from "./components/Input";

export { Card } from "./components/Card";
export type { CardProps } from "./components/Card";

export { Stack } from "./components/Stack";
export type {
  StackProps,
  StackDirection,
  StackGap,
  StackAlign,
} from "./components/Stack";

export { Select, SegmentedControl } from "./components/Select";
export type {
  SelectProps,
  SelectOption,
  SegmentedControlProps,
  SegmentedOption,
} from "./components/Select";

// --- Simulator vocabulary ---
export { StatusBadge } from "./components/StatusBadge";
export type { StatusBadgeProps, ExecutionState } from "./components/StatusBadge";

export { MessageToken } from "./components/MessageToken";
export type { MessageTokenProps, TokenKind } from "./components/MessageToken";

export { RuntimeNode } from "./components/RuntimeNode";
export type { RuntimeNodeProps } from "./components/RuntimeNode";

export { Console } from "./components/Console";
export type { ConsoleProps, ConsoleEntry, ConsoleLevel } from "./components/Console";

export { Timeline } from "./components/Timeline";
export type { TimelineProps, TimelineStepMeta } from "./components/Timeline";

export { MediaControls } from "./components/MediaControls";
export type { MediaControlsProps } from "./components/MediaControls";

export { CodeViewer } from "./components/CodeViewer";
export type { CodeViewerProps } from "./components/CodeViewer";

import { SegmentedControl } from "js-simulator";
import { useSettings, DETAIL_LEVELS } from "../theme";
import type { DetailLevel } from "../theme";

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { theme, toggleTheme, detail, setDetail } = useSettings();

  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar__icon-btn topbar__menu-btn"
        onClick={onMenu}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      <div className="topbar__brand">
        <span className="topbar__logo" aria-hidden>
          JS
        </span>
        <span>
          Runtime Simulator
          <span className="topbar__brand-sub"> · see how JS actually runs</span>
        </span>
      </div>

      <div className="topbar__spacer" />

      <div className="topbar__group">
        <SegmentedControl<DetailLevel>
          aria-label="Detail level"
          value={detail}
          onChange={setDetail}
          options={DETAIL_LEVELS.map((d) => ({ label: d.label, value: d.value }))}
        />
        <button
          type="button"
          className="topbar__icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title="Toggle theme"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}

import { SegmentedControl } from "js-simulator";
import { useSettings, DETAIL_LEVELS } from "../theme";
import type { DetailLevel, Motion, Theme } from "../theme";
import "./pages.css";

export function Settings() {
  const { theme, setTheme, motion, setMotion, detail, setDetail } = useSettings();

  return (
    <div className="page ds-root" style={{ maxWidth: 760 }}>
      <div className="page__head">
        <div className="page__eyebrow">Preferences</div>
        <h1 className="page__title">Settings</h1>
        <p className="page__lead">
          Accessibility and display options. Reduced motion pauses all token
          animations — the step-by-step content stays fully available.
        </p>
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-row__label">Theme</div>
          <div className="settings-row__desc">Dark is the default.</div>
        </div>
        <SegmentedControl<Theme>
          aria-label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { label: "Dark", value: "dark" },
            { label: "Light", value: "light" },
          ]}
        />
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-row__label">Motion</div>
          <div className="settings-row__desc">
            Reduced motion disables animated token movement.
          </div>
        </div>
        <SegmentedControl<Motion>
          aria-label="Motion"
          value={motion}
          onChange={setMotion}
          options={[
            { label: "Normal", value: "normal" },
            { label: "Reduced", value: "reduced" },
          ]}
        />
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-row__label">Default detail level</div>
          <div className="settings-row__desc">
            Progressive disclosure — how much internal detail to reveal.
          </div>
        </div>
        <SegmentedControl<DetailLevel>
          aria-label="Detail level"
          value={detail}
          onChange={setDetail}
          options={DETAIL_LEVELS.map((d) => ({ label: d.label, value: d.value }))}
        />
      </div>
    </div>
  );
}

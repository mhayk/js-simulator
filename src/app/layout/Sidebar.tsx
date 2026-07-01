import { NavLink } from "react-router-dom";
import { NAV_ITEMS, NAV_SECTIONS } from "../nav";

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  return (
    <nav
      className={["sidebar", open && "sidebar--open"].filter(Boolean).join(" ")}
      aria-label="Primary"
    >
      {NAV_SECTIONS.map((section) => (
        <div key={section}>
          <div className="sidebar__section-label">{section}</div>
          {NAV_ITEMS.filter((i) => i.section === section).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onNavigate}
              data-rt={item.rt}
              className={({ isActive }) =>
                ["sidebar__link", isActive && "sidebar__link--active"]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              <span className="sidebar__glyph" aria-hidden>
                {item.glyph}
              </span>
              <span>{item.label}</span>
              {item.soon && <span className="sidebar__soon">soon</span>}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

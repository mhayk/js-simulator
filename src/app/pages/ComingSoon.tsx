import { Link, useLocation } from "react-router-dom";
import { Button } from "js-simulator";
import { NAV_ITEMS } from "../nav";
import "./pages.css";

export function ComingSoon() {
  const { pathname } = useLocation();
  const item = NAV_ITEMS.find((i) => i.to === pathname);

  return (
    <div className="page coming ds-root" data-rt={item?.rt}>
      <span className="coming__glyph" aria-hidden>
        {item?.glyph ?? "◵"}
      </span>
      <h1 className="coming__title">{item?.label ?? "This module"} is on the way</h1>
      <p className="coming__text">
        This screen is part of the roadmap. The design system and simulation
        engine are already in place — this module reuses the same runtime nodes,
        message tokens, and step engine as the Event Loop Explorer.
      </p>
      <Link to="/event-loop">
        <Button variant="primary">Open the Event Loop Explorer</Button>
      </Link>
    </div>
  );
}

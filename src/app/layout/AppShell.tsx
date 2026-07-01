import { useState } from "react";
import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import "./AppShell.css";

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="app-shell ds-root">
      <TopBar onMenu={() => setNavOpen((o) => !o)} />
      <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

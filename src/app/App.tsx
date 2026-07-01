import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SettingsProvider } from "./theme";
import { AppShell } from "./layout/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { EventLoopExplorer } from "./pages/EventLoopExplorer";
import { WebSocketExplorer } from "./pages/WebSocketExplorer";
import { Settings } from "./pages/Settings";
import { ComingSoon } from "./pages/ComingSoon";
import { NAV_ITEMS } from "./nav";

const SOON_ROUTES = NAV_ITEMS.filter((i) => i.soon);

export function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="event-loop" element={<EventLoopExplorer />} />
            <Route path="websocket" element={<WebSocketExplorer />} />
            <Route path="settings" element={<Settings />} />
            {SOON_ROUTES.map((item) => (
              <Route
                key={item.to}
                path={item.to.replace(/^\//, "")}
                element={<ComingSoon />}
              />
            ))}
            <Route path="*" element={<ComingSoon />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

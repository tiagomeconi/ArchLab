import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter/opsz.css";
import "@fontsource-variable/jetbrains-mono";
import "@xyflow/react/dist/style.css";
import "./styles.css";
import { usePath } from "./nav";

const Landing = lazy(() => import("./landing/Landing").then((m) => ({ default: m.Landing })));
const Start = lazy(() => import("./landing/Start").then((m) => ({ default: m.Start })));
const Lab = lazy(() => import("./App").then((m) => ({ default: m.App })));

function Root() {
  const path = usePath();
  const inApp = path === "/app" || path.startsWith("/app/");
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>{inApp ? <Lab /> : path.startsWith("/start") ? <Start path={path} /> : <Landing />}</Suspense>;
}
createRoot(document.getElementById("root")!).render(<Root />);

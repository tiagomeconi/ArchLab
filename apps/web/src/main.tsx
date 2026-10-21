import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter/opsz.css";
import "@fontsource-variable/jetbrains-mono";
import "@xyflow/react/dist/style.css";
import "./styles.css";
import { usePath } from "./nav";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import { needsProfile } from "./account";
import { firstSync, initCloudSync } from "./cloudSync";
import { initLang } from "./i18n";

initCloudSync();

const Landing = lazy(() => import("./landing/Landing").then((m) => ({ default: m.Landing })));
const Start = lazy(() => import("./landing/Start").then((m) => ({ default: m.Start })));
const Login = lazy(() => import("./landing/Login").then((m) => ({ default: m.Login })));
const Profile = lazy(() => import("./landing/Profile").then((m) => ({ default: m.Profile })));
const AppLayout = lazy(() => import("./landing/AppLayout").then((m) => ({ default: m.AppLayout })));
const Home = lazy(() => import("./landing/Home").then((m) => ({ default: m.Home })));
const Designs = lazy(() => import("./landing/Designs").then((m) => ({ default: m.Designs })));
const PublicProfile = lazy(() => import("./landing/PublicProfile").then((m) => ({ default: m.PublicProfile })));
const Lab = lazy(() => import("./landing/EditorGate").then((m) => ({ default: m.EditorGate })));
const Settings = lazy(() => import("./landing/Settings").then((m) => ({ default: m.Settings })));
const Ranking = lazy(() => import("./landing/Ranking").then((m) => ({ default: m.Ranking })));
const Confirmed = lazy(() => import("./landing/Confirmed").then((m) => ({ default: m.Confirmed })));
const CompleteProfile = lazy(() => import("./landing/CompleteProfile").then((m) => ({ default: m.CompleteProfile })));
const Plans = lazy(() => import("./landing/Plans").then((m) => ({ default: m.Plans })));
const Legal = lazy(() => import("./landing/Legal").then((m) => ({ default: m.Legal })));

const blank = <div style={{ minHeight: "100vh", background: "var(--bg)" }} />;

/** Área logada (/start e /app): sem conta, mostra o login no lugar da página pedida (a URL e o #d=… ficam intactos). Sem Supabase configurado, não exige login. */
function Protected({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [synced, setSynced] = useState(false);
  useEffect(() => { if (auth.status === "in" && !synced) firstSync(auth).then(() => setSynced(true)); }, [auth, synced]);
  if (auth.status === "disabled") return <>{children}</>;
  if (auth.status === "out" || auth.status === "recovery") return <Login embedded />;
  if (auth.status === "loading") return blank;
  if (needsProfile(auth.user?.user_metadata)) return <Suspense fallback={blank}><CompleteProfile /></Suspense>;
  if (!synced) return blank;
  return <>{children}</>;
}

/** Visitante vê a landing e o login; quem já entrou vai direto para dentro do sistema. */
function Visitor({ children }: { children: ReactNode }) {
  const auth = useAuth();
  useEffect(() => { if (auth.status === "in") history.replaceState({}, "", "/start"), window.dispatchEvent(new PopStateEvent("popstate")); }, [auth.status]);
  if (auth.status === "loading" || auth.status === "in") return blank;
  return <>{children}</>;
}

/** Conteúdo da área logada: o menu lateral fica parado e só esta parte carrega e entra com animação. */
function Inside({ path }: { path: string }) {
  const content = path === "/perfil" ? <Profile /> : path === "/desenhos" ? <Designs /> : path === "/ranking" ? <Ranking /> : path === "/configuracoes" ? <Settings /> : path === "/planos" ? <Plans /> : path === "/start" || path === "/start/" ? <Home /> : <Start path={path} />;
  return (
    <Protected>
      <Suspense fallback={blank}>
        <AppLayout path={path}><Suspense fallback={<div style={{ minHeight: "60vh" }} />}>{content}</Suspense></AppLayout>
      </Suspense>
    </Protected>
  );
}

function Root() {
  const path = usePath();
  const inApp = path === "/app" || path.startsWith("/app/");
  const inside = path.startsWith("/start") || path === "/perfil" || path === "/desenhos" || path === "/ranking" || path === "/configuracoes" || path === "/planos";
  const pub = path.startsWith("/u/");
  const legal = path === "/termos" || path === "/privacidade";
  const auth = path === "/login" || path === "/cadastro";
  const confirmed = path === "/confirmado" || path === "/confirmado/";
  // cada área (landing, login, sistema, laboratório) entra com um fade suave; dentro do sistema quem anima é o AppLayout
  const area = inApp ? "lab" : inside ? "inside" : confirmed ? "confirmed" : pub ? "public" : legal ? "legal" : auth ? "auth" : "landing";
  const page = inApp ? <Protected><Lab /></Protected>
    : inside ? <Inside path={path} />
    : confirmed ? <Confirmed />
    : legal ? <Legal kind={path === "/termos" ? "termos" : "privacidade"} />
    : pub ? <PublicProfile handle={decodeURIComponent(path.slice(3).replace(/\/+$/, "")).replace(/^@/, "")} />
    : auth ? <Visitor><Login key={path} initial={path === "/cadastro" ? "signup" : "signin"} /></Visitor>
    : <Visitor><Landing /></Visitor>;
  return <div key={area} className="route-fade"><Suspense fallback={blank}>{page}</Suspense></div>;
}
// idiomas além do português e do inglês vêm de um arquivo à parte: espera o dicionário antes da primeira tela, para não piscar em outro idioma
initLang().finally(() => createRoot(document.getElementById("root")!).render(<Root />));

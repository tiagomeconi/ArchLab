import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { CHAOS } from "../chaos";
import { LOGOS } from "../logos.generated";
import { AVATARS } from "./avatars.generated";
import { PROVIDERS } from "../providers";
import { DEFAULT_PROFILE_BY_TYPE } from "@archlab/domain";
import { Icon, Logo, SearchField } from "../ui";
import { useTheme } from "../theme";
import { ThemeToggle } from "../ThemeToggle";
import { link } from "../nav";
import { ProviderLogo } from "../ProviderLogo";
import { Playground } from "./Playground";
import { Cycle } from "./Cycle";
import { MobileLab } from "./MobileLab";
import { KeyboardDemo } from "./KeyboardDemo";
import { AnimatedBeam } from "./ui/animated-beam";
import { BlurFade } from "./ui/blur-fade";
import { Safari } from "./ui/safari";
import { DecryptReveal } from "./ui/DecryptReveal";
import { HyperText } from "./ui/hyper-text";
import { Marquee } from "./ui/marquee";
import { FlickeringGrid } from "./ui/flickering-grid";
import { OrbitingCircles } from "./ui/orbiting-circles";
import { NumberTicker } from "./ui/number-ticker";
import { Ripple } from "./ui/ripple";
import { ShineBorder } from "./ui/shine-border";
import { cn } from "./lib/utils";
import "./landing.css";
import { t, useLang } from "../i18n";
import { LangToggle } from "../LangToggle";

/** Screenshot do produto no tema atual (alterna junto com o alternador de tema). */
function Shot({ name, alt, className, loading }: { name: string; alt: string; className?: string; loading?: "lazy" }) {
  const theme = useTheme();
  return <img src={`/shots/${name}-${theme}.jpg`} alt={alt} loading={loading} className={className} />;
}

/** Gravação real do laboratório: do canvas vazio ao sistema montado, simulado e quebrado. Só toca quando visível e respeita "reduzir movimento". */
function HeroDemo() {
  const theme = useTheme();
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const visible = useInView(ref, { margin: "0px 0px -20% 0px" });
  // o <video> é o mesmo elemento nos dois temas (com `key` ele era recriado e o observador de visibilidade ficava preso ao elemento antigo, então o novo nunca tocava)
  const loadedTheme = useRef(theme);
  useEffect(() => {
    const v = ref.current; if (!v || reduced) return;
    if (loadedTheme.current !== theme) { loadedTheme.current = theme; v.load(); } // troca de tema: carrega as fontes do vídeo do tema novo
    if (visible) v.play().catch(() => {}); else v.pause();
  }, [visible, reduced, theme]);
  if (reduced) return <Shot name="hero" alt={t("O laboratório do ArchLab com um sistema de links curtos sob falha")} className="block size-full object-cover object-top" />;
  return (
    <video ref={ref} className="block size-full object-cover object-top" muted loop playsInline preload="metadata" poster={`/shots/hero-${theme}.jpg`}
      aria-label={t("Demonstração: o sistema de links curtos sendo montado no laboratório, simulado e submetido a uma falha de cache")}>
      <source src={`/shots/demo-${theme}.mp4`} type="video/mp4" />
      <source src={`/shots/demo-${theme}.webm`} type="video/webm" />
    </video>
  );
}

/* ───────────────────────── blocos pequenos ───────────────────────── */

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div className="text-[17px] font-semibold tracking-[-0.014em] text-accent">{children}</div>
);

/** Fundo de seção em largura total, esmaecido nas bordas (cima/baixo) para não "sangrar" nas seções vizinhas. */
export const Bg = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div aria-hidden className={cn("lp-fade-both pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden", className)}>{children}</div>
);

const Section = ({ id, className, bg, children }: { id?: string; className?: string; bg?: ReactNode; children: ReactNode }) => (
  <section id={id} className={cn("relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-32", className)}>{bg}{children}</section>
);

const H2 = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h2 className={cn("text-balance text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.024em]", className)}>{children}</h2>
);
const Serif = ({ children }: { children: ReactNode }) => <span className="text-accent">{children}</span>;

const ctaProps = link("/start");

function PrimaryButton({ children, big = false }: { children: ReactNode; big?: boolean }) {
  return (
    <a {...ctaProps} className={cn("group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-accent font-semibold text-on-accent shadow-[0_10px_40px_-10px_var(--accent)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-10px_var(--accent)] active:translate-y-0",
      big ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm")}>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">{children}</span>
      <Icon name="arrow_forward" size={big ? 20 : 18} />
    </a>
  );
}

/* ───────────────────────── cabeçalho ───────────────────────── */

function Header() {
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const links: [string, string][] = [["Ciclo", "#ciclo"], ["Produto", "#produto"], ["Quebre você mesmo", "#lab"], ["Roadmap", "#roadmap"], ["FAQ", "#faq"]];
  // seção ativa: a última cujo topo já passou de ~35% da altura da tela; um clique fixa o destino até a rolagem terminar
  const [active, setActive] = useState<string | null>(null);
  const lock = useRef<{ id: string; until: number } | null>(null);
  useEffect(() => {
    const ids = links.map(([, h]) => h.slice(1));
    const compute = () => {
      if (lock.current && performance.now() < lock.current.until) return;
      lock.current = null;
      const line = window.innerHeight * 0.35;
      let cur: string | null = null;
      for (const id of ids) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= line) cur = id; }
      const last = document.getElementById(ids[ids.length - 1]!);
      if (last && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = ids[ids.length - 1]!;
      setActive(cur);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    const end = () => { lock.current = null; compute(); };
    window.addEventListener("scrollend", end);
    return () => { window.removeEventListener("scroll", compute); window.removeEventListener("resize", compute); window.removeEventListener("scrollend", end); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="relative mx-auto flex max-w-5xl items-center justify-between rounded-2xl border border-line bg-surface/70 py-2.5 pl-4 pr-2.5 shadow-[0_8px_32px_-12px_rgba(0,0,0,.35)] backdrop-blur-xl">
        <a href="/" className="flex items-center gap-2.5 font-semibold tracking-tight" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <Logo size={34} />{t("ArchLab")}</a>
        <nav className="hidden items-center gap-1 md:flex" aria-label={t("Seções")}>
          {links.map(([label, h]) => {
            const on = active === h.slice(1);
            return (
              <a key={h} href={h} aria-current={on ? "location" : undefined}
                onClick={() => { setActive(h.slice(1)); lock.current = { id: h.slice(1), until: performance.now() + 1600 }; }}
                className={cn("relative rounded-full px-3.5 py-1.5 text-sm transition-colors duration-300", on ? "text-text" : "text-text-2 hover:text-text")}>
                {on && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-track" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                {on && <motion.span layoutId="nav-dot" className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                {t(label)}
              </a>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle className="!size-9" />
          <a {...ctaProps} className="inline-flex items-center gap-1.5 rounded-xl bg-text px-4 py-2 text-sm font-semibold text-bg transition-all hover:-translate-y-px hover:opacity-90">{t("Acessar")}{" "}<Icon name="arrow_outward" size={16} />
          </a>
        </div>
        <motion.span style={{ scaleX: bar }} className="pointer-events-none absolute inset-x-4 -bottom-px h-px origin-left bg-accent" />
      </div>
    </header>
  );
}

/* ───────────────────────── hero ───────────────────────── */

function Hero() {
  return (
    <div className="relative overflow-hidden pt-32 sm:pt-36">
      <div className="lp-grid lp-fade-y pointer-events-none absolute inset-0 -z-0 opacity-90" />
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] -z-0 h-[42rem] w-[70rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-12rem] top-40 -z-0 h-[26rem] w-[26rem] rounded-full bg-c-network/10 blur-[110px]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <BlurFade delay={0.05}>
          <Eyebrow>{t("Laboratório de System Design · em construção")}</Eyebrow>
        </BlurFade>
        <BlurFade delay={0.12} offset={14}>
          <h1 className="mt-6 text-[clamp(2.4rem,6.2vw,5.2rem)] font-semibold leading-[1.04] tracking-[-0.03em]">{t("Desenhe o sistema.")}<br />{t("Depois veja ele")}{" "}
            <HyperText as="span" preserveCase charClassName="" className="inline-block !overflow-visible !py-0 !text-[1em] !font-semibold tracking-[-0.03em] text-accent" duration={1100} delay={650}
              characterSet={"abcdefghijklmnopqrstuvwxyz".split("")} animateOnHover>
              {t("quebrar.")}
            </HyperText>
          </h1>
        </BlurFade>

        <div className="mt-10 grid items-start gap-12 lg:grid-cols-[25rem_1fr] lg:gap-10">
          <div>
            <BlurFade delay={0.22} offset={12}>
              <p className="text-pretty text-lg leading-relaxed text-text-2 sm:text-xl">{t("Monte a arquitetura, defina o caminho das requisições e injete falhas de verdade. O ArchLab mostra, com números, onde seu desenho aguenta — e onde cai.")}</p>
            </BlurFade>
            <BlurFade delay={0.3} offset={10}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <PrimaryButton big>{t("Acessar o laboratório")}</PrimaryButton>
                <a href="#lab" className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-4 text-base font-medium transition-colors hover:bg-track">
                  <Icon name="play_circle" size={20} />{" "}{t("Ver quebrando ao vivo")}</a>
              </div>
              <div className="mt-10">
                <p className="text-sm font-medium text-text-2">{t("Estude com as tecnologias que você usa")}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
                  {["postgresql", "redis", "kafka", "nginx", "mongodb", "rabbitmq", "cloudflare"].map((id, i) => (
                    <motion.span key={id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.9, y: 0 }} transition={{ delay: 0.6 + i * 0.07 }}
                      className="transition-transform duration-300 hover:-translate-y-1 hover:opacity-100"><ProviderLogo id={id} name={id} size={30} /></motion.span>
                  ))}
                  <span className="text-sm font-medium text-text-2">+{Object.keys(LOGOS).length - 7}</span>
                </div>
              </div>
            </BlurFade>
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative lg:-mr-[13vw] lg:-mt-6">
            <div className="pointer-events-none absolute -inset-x-6 -bottom-10 -top-6 -z-10 rounded-[2.5rem] bg-accent/10 blur-3xl" />
            <div className="relative drop-shadow-[0_40px_90px_rgba(0,0,0,.45)] lg:origin-top-left">
              <Safari url="archlab.app" className="block w-full">
                <HeroDemo />
              </Safari>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── logos ───────────────────────── */

const PROVIDER_LIST = (() => {
  const seen = new Map<string, string>();
  for (const list of Object.values(PROVIDERS)) for (const p of list) if (LOGOS[p.id] && !seen.has(p.id)) seen.set(p.id, p.name);
  return [...seen.entries()].map(([id, name]) => ({ id, name }));
})();

function LogoWall() {
  const half = Math.ceil(PROVIDER_LIST.length / 2);
  const rows = [PROVIDER_LIST.slice(0, half), PROVIDER_LIST.slice(half)];
  return (
    <div className="relative border-y border-line bg-surface/30 py-14">
      <BlurFade inView>
        <p className="mx-auto mb-10 max-w-2xl px-5 text-center text-balance text-lg text-text-2 sm:text-xl">{t("Escolha o provedor de cada peça —")}{" "}<span className="text-text">{t("PostgreSQL, Redis, Kafka, NGINX")}</span>{" "}{t("— e estude com as tecnologias que você usa no trabalho.")}</p>
      </BlurFade>
      <div className="lp-fade-x flex flex-col gap-6">
        {rows.map((r, i) => (
          <Marquee key={i} reverse={i === 1} pauseOnHover className="[--duration:260s] [--gap:3.5rem]" repeat={3}>
            {r.map((p) => (
              <div key={p.id} className="flex items-center gap-3 text-text-2 transition-colors hover:text-text">
                <ProviderLogo id={p.id} name={p.name} size={34} />
                <span className="whitespace-nowrap text-[15px] font-medium">{p.name}</span>
              </div>
            ))}
          </Marquee>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── bento (padrão Magic UI Bento Grid) ───────────────────────── */

function Card({ className, children, hover = true }: { className?: string; children: ReactNode; hover?: boolean }) {
  return (
    <div className={cn("group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface/60 p-6 backdrop-blur transition-all duration-500 sm:p-7",
      hover && "hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,.6)]", className)}>{children}</div>
  );
}

/** Card do bento: visual animado ao fundo; ao passar o mouse o texto sobe e revela o convite para abrir o laboratório. */
function BentoCard({ name, description, icon, cta, className, fade = "h-3/5", children }: { name: string; description: string; icon: string; cta: string; className?: string; fade?: string; children: ReactNode }) {
  return (
    <div className={cn("group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-line bg-surface/70 backdrop-blur transition-all duration-500 hover:border-line-strong",
      "shadow-[0_1px_0_0_rgba(255,255,255,.04)_inset,0_24px_60px_-38px_rgba(0,0,0,.55)]", className)}>
      <div className="absolute inset-0">{children}</div>
      <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface via-surface/90 to-transparent", fade)} />
      <div className="pointer-events-none relative z-10 flex flex-col gap-1.5 p-6 transition-all duration-300 group-hover:-translate-y-9">
        <span className="mb-2 grid size-11 origin-left place-items-center rounded-xl bg-accent/12 text-accent transition-all duration-300 ease-in-out group-hover:scale-75"><Icon name={icon} size={22} /></span>
        <h3 className="text-xl font-semibold tracking-tight">{t(name)}</h3>
        <p className="max-w-md text-[15px] leading-relaxed text-text-2">{t(description)}</p>
      </div>
      <div className="absolute bottom-0 z-20 flex w-full translate-y-10 items-center p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <a {...ctaProps} className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-accent">{t(cta)} <Icon name="arrow_forward" size={16} /></a>
      </div>
      <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-accent/[.04]" />
    </div>
  );
}

const BAR_SETS = [
  [34, 40, 38, 44, 41, 46, 90, 96, 100, 98, 40, 38, 36, 42],
  [30, 36, 44, 40, 48, 44, 52, 94, 99, 100, 96, 44, 40, 38],
  [38, 34, 42, 46, 40, 94, 98, 100, 92, 50, 42, 36, 40, 34],
];

function SimBackground() {
  const [set, setSet] = useState(0);
  useEffect(() => { const t = setInterval(() => setSet((s) => (s + 1) % BAR_SETS.length), 2600); return () => clearInterval(t); }, []);
  return (
    <div className="absolute inset-x-6 top-7 h-40">
      <div className="flex h-full items-end gap-1.5" aria-hidden>
        {BAR_SETS[set]!.map((h, i) => (
          <motion.i key={i} animate={{ height: `${h}%` }} transition={{ duration: 1.2, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
            className={cn("flex-1 rounded-sm transition-colors duration-700", h > 80 ? "bg-danger/70" : "bg-accent/55")} />
        ))}
      </div>
      <div className="mt-3 flex justify-between font-mono text-xs text-text-2"><span>{t("0 s")}</span><span className="text-text"><NumberTicker value={300} className="text-text" />{" "}{t("s simulados")}</span></div>
    </div>
  );
}

function Bento() {
  return (
    <Section id="produto" className="pt-12 sm:pt-16">
      <BlurFade inView><Eyebrow>{t("O produto")}</Eyebrow></BlurFade>
      <BlurFade inView delay={0.05}><H2 className="mt-5 max-w-3xl">{t("Tudo que um laboratório de arquitetura")}{" "}<Serif>{t("precisa ter")}</Serif>.</H2></BlurFade>
      <div className="mt-14 grid auto-rows-[26rem] grid-cols-3 gap-4">
        <BlurFade inView className="col-span-3 lg:col-span-1 lg:row-span-2">
          <BentoCard className="h-full" fade="h-[30%]" icon="schema" name="Seu desenho, no bolso" cta="Abrir o editor"
            description="Acompanhe a carga, a saturação e as falhas do seu sistema de qualquer tela — o mesmo motor, agora no celular.">
            <div className="absolute inset-x-0 top-7 flex justify-center transition-transform duration-700 group-hover:-translate-y-2">
              <MobileLab className="w-[17.5rem] animate-float" />
            </div>
          </BentoCard>
        </BlurFade>

        <BlurFade inView delay={0.06} className="col-span-3 lg:col-span-1">
          <BentoCard className="h-full" icon="autorenew" name="Simulação reproduzível" cta="Rodar uma simulação"
            description="Mesma entrada, mesma saída. Sem sorteio escondido: o resultado é um modelo, não uma sensação.">
            <SimBackground />
          </BentoCard>
        </BlurFade>

        <BlurFade inView delay={0.1} className="col-span-3 lg:col-span-1">
          <BentoCard className="h-full" icon="local_fire_department" name="Modo caos" cta="Injetar uma falha"
            description="Zona de disponibilidade, disco, partição de rede, TLS, tráfego ×100. Combine falhas e veja a propagação.">
            <div className="lp-fade-x absolute inset-x-0 top-6 flex flex-col gap-3">
              <Marquee className="[--duration:120s] [--gap:.6rem]" repeat={3}>{CHAOS.slice(0, 10).map((c) => <Pill key={c.id} icon={c.icon}>{t(c.title)}</Pill>)}</Marquee>
              <Marquee reverse className="[--duration:140s] [--gap:.6rem]" repeat={3}>{CHAOS.slice(10, 20).map((c) => <Pill key={c.id} icon={c.icon}>{t(c.title)}</Pill>)}</Marquee>
              <Marquee className="[--duration:130s] [--gap:.6rem]" repeat={3}>{CHAOS.slice(20).map((c) => <Pill key={c.id} icon={c.icon}>{t(c.title)}</Pill>)}</Marquee>
            </div>
          </BentoCard>
        </BlurFade>

        <BlurFade inView delay={0.06} className="col-span-3 lg:col-span-2">
          <BentoCard className="h-full" icon="assignment" name="Enunciado de entrevista, com status ao vivo" cta="Ler o desafio"
            description="Requisitos funcionais e não funcionais, escala, restrições e trade-offs. Cada requisito mostra atendido, parcial, não atendido ou desconhecido.">
            <div className="absolute inset-x-6 top-6 sm:inset-x-10">
              <DecryptReveal radius={150} cell={10} colored={0.55} className="rounded-2xl">
                <div className="rounded-2xl border border-line-strong bg-bg p-5">
                  <div className="flex items-center justify-between font-mono text-[11px] text-text-2"><span>{t("desafio · iniciante · 40 min")}</span><span className="text-accent">{t("links curtos")}</span></div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {[["FR-URL-2", "Redirecionar um alias", "ok", "Atendido"], ["NFR-URL-1", "p95 do redirect ≤ 200 ms", "bad", "Não atendido"], ["NFR-URL-3", "Tolerar perda de 1 backend", "ok", "Atendido"]].map(([id, txt, tone, st]) => (
                      <li key={id} className="flex items-center justify-between gap-3 rounded-xl bg-track px-3 py-2">
                        <span><b className="font-mono text-xs">{id}</b> <span className="text-text-2">{t(txt!)}</span></span>
                        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", tone === "ok" && "bg-ok/15 text-ok", tone === "bad" && "bg-danger/15 text-danger")}>{t(st!)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </DecryptReveal>
            </div>
          </BentoCard>
        </BlurFade>

        <BlurFade inView delay={0.06} className="col-span-3 lg:col-span-2">
          <BentoCard className="h-full" fade="h-[34%]" icon="keyboard" name="Feito para quem usa o teclado" cta="Ver os atalhos"
            description="Desfazer, copiar, colar, duplicar, mover com setas, simular com Ctrl+Enter. Tudo com atalhos de verdade.">
            <div className="absolute inset-x-6 top-6 sm:inset-x-10"><KeyboardDemo /></div>
          </BentoCard>
        </BlurFade>

        <BlurFade inView delay={0.1} className="col-span-3 lg:col-span-1">
          <BentoCard className="h-full" fade="h-[34%]" icon="deployed_code" name="80 tecnologias, logo oficial" cta="Escolher provedores"
            description="Cada componente aceita o provedor real: bancos, filas, caches, CDNs, autenticação.">
            <div className="absolute inset-x-0 top-3 flex h-[16rem] items-center justify-center">
              <div className="relative flex size-full items-center justify-center">
                <span className="relative z-10"><Logo size={64} /></span>
                <OrbitingCircles iconSize={36} radius={60} duration={24} path>
                  {["postgresql", "redis", "kafka", "nginx"].map((id) => <ProviderLogo key={id} id={id} name={id} size={34} />)}
                </OrbitingCircles>
                <OrbitingCircles iconSize={38} radius={104} duration={34} reverse path>
                  {["mongodb", "rabbitmq", "cloudflare", "elasticsearch", "s3", "nodejs", "supabase", "firebase"].map((id) => <ProviderLogo key={id} id={id} name={id} size={36} />)}
                </OrbitingCircles>
              </div>
            </div>
          </BentoCard>
        </BlurFade>
      </div>
    </Section>
  );
}
const Pill = ({ icon, children }: { icon: string; children: ReactNode }) => (
  <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-danger/25 bg-danger/8 px-3.5 py-1.5 text-[13px] font-medium text-danger"><Icon name={icon} size={15} />{children}</span>
);

/* ───────────────────────── laboratório ao vivo ───────────────────────── */

function LivePlayground() {
  const theme = useTheme();
  const [broken, setBroken] = useState(false);
  return (
    <Section id="lab" bg={<Bg><FlickeringGrid className="size-full" squareSize={3} gridGap={9} flickerChance={0.12} maxOpacity={0.14} color={broken ? (theme === "dark" ? "rgb(252,165,165)" : "rgb(185,28,28)") : theme === "dark" ? "rgb(56,189,248)" : "rgb(3,105,161)"} /></Bg>}>
      <BlurFade inView><Eyebrow>{t("Teste agora")}</Eyebrow></BlurFade>
      <BlurFade inView delay={0.05}><H2 className="mt-5 max-w-3xl">{t("Quebre um sistema")}{" "}<Serif>{t("sem sair desta página")}</Serif>.</H2></BlurFade>
      <BlurFade inView delay={0.1}><p className="mt-5 max-w-2xl text-xl leading-snug text-text-2">{t("Este é o mesmo motor de simulação do laboratório, rodando no seu navegador sobre o exemplo clássico de links curtos. Suba o tráfego, derrube o cache e acompanhe o que acontece com banco, erro e latência.")}</p></BlurFade>
      <BlurFade inView delay={0.15} className="mt-12"><Playground onBroken={setBroken} /></BlurFade>
    </Section>
  );
}

/* ───────────────────────── números ───────────────────────── */

const CATS = ["var(--c-origin)", "var(--c-iot)", "var(--c-network)", "var(--c-compute)", "var(--c-data)", "var(--c-messaging)", "var(--c-support)"];

function DotsVisual() {
  return (
    <div className="grid grid-cols-10 gap-1.5" aria-hidden>
      {Array.from({ length: 30 }, (_, i) => (
        <motion.i key={i} className="block size-2 rounded-full bg-accent" initial={{ opacity: 0.18, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.045, duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
      ))}
    </div>
  );
}
function LogosVisual() {
  return (
    <div className="flex items-center" aria-hidden>
      {["postgresql", "redis", "kafka", "nginx", "mongodb"].map((id, i) => (
        <motion.span key={id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }}
          className="-ml-3 grid size-9 place-items-center rounded-full border border-line bg-surface shadow-sm transition-transform duration-300 first:ml-0 group-hover:-translate-y-1">
          <ProviderLogo id={id} name={id} size={20} />
        </motion.span>
      ))}
      <span className="-ml-3 grid h-9 place-items-center rounded-full border border-line bg-surface px-2.5 text-xs font-semibold text-text-2 transition-transform duration-300 group-hover:-translate-y-1">+{Math.max(0, Object.keys(LOGOS).filter((k) => !k.startsWith("co-")).length - 5)}</span>
    </div>
  );
}
function CategoriesVisual() {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      {CATS.map((c, i) => (
        <motion.i key={c} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 420, damping: 18 }}
          className="block size-6 rounded-full shadow-sm transition-transform duration-300 hover:scale-125 group-hover:-translate-y-1" style={{ background: c, transitionDelay: `${i * 30}ms` }} />
      ))}
    </div>
  );
}
function RingVisual() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden className="-rotate-90">
      <circle cx="24" cy="24" r="20" fill="none" stroke="var(--track)" strokeWidth="4" />
      <motion.circle cx="24" cy="24" r="20" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }} />
    </svg>
  );
}

function Numbers() {
  const items = [
    { v: CHAOS.length, unit: "", l: "falhas injetáveis", d: "infraestrutura, rede, dados e tráfego", to: "#lab", visual: <DotsVisual /> },
    { v: Object.keys(LOGOS).length, unit: "", l: "tecnologias com logo", d: "para escolher em cada componente", to: "#produto", visual: <LogosVisual /> },
    { v: Object.keys(DEFAULT_PROFILE_BY_TYPE).length, unit: "", l: "tipos de componente", d: "de IoT e contêineres a filas, dados e CDN", to: "#ciclo", visual: <CategoriesVisual /> },
    { v: 300, unit: "s", l: "por simulação", d: "tráfego, mix e falhas ao vivo", to: "#lab", visual: <RingVisual /> },
  ];
  return (
    <div className="relative border-y border-line bg-surface/30">
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-2 px-3 py-12 sm:px-6 lg:grid-cols-4">
        {items.map((n, i) => (
          <BlurFade key={n.l} inView delay={i * 0.07}>
            <a href={n.to} title={t("Ver na página")} className="group relative flex h-full flex-col gap-6 rounded-3xl border border-transparent p-5 transition-all duration-500 hover:border-line hover:bg-surface/70 sm:p-6">
              <span className="absolute right-4 top-4 text-text-2 opacity-0 transition-all duration-300 group-hover:text-accent group-hover:opacity-100"><Icon name="arrow_outward" size={18} /></span>
              <div className="flex h-12 items-center">{n.visual}</div>
              <div>
                <div className="flex items-baseline text-6xl font-semibold leading-none tracking-[-0.04em] tabular-nums sm:text-7xl">
                  <NumberTicker value={n.v} className="tracking-[-0.04em] text-text" />
                  {n.unit && <span className="ml-1.5 text-3xl font-medium tracking-tight text-text-2">{n.unit}</span>}
                </div>
                <div className="mt-4 text-lg font-semibold tracking-tight">{t(n.l)}</div>
                <div className="mt-0.5 text-[15px] leading-snug text-text-2">{t(n.d)}</div>
              </div>
            </a>
          </BlurFade>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── para quem ───────────────────────── */

/** Depoimentos REAIS entram aqui quando existirem (com autorização da pessoa). Enquanto estiver vazio, a página mostra só cenários de uso ilustrativos. */
interface Testimonial { name: string; role: string; quote: string; photo?: string; link?: string }
const TESTIMONIALS: Testimonial[] = [];

interface Scenario { name: string; role: string; ctx: string; goal: string; used: string[]; hue: string }
/** Personas ilustrativas: pessoas e contextos fictícios (segmentos genéricos, nunca empresas reais). */
const SCENARIOS: Scenario[] = [
  { name: "Ana", role: "Backend júnior", ctx: "Fintech", goal: "Descobrir por que o cache cair derruba o banco, vendo a taxa de erro subir.", used: ["Modo caos", "Simulação"], hue: "var(--c-compute)" },
  { name: "Bruno", role: "Pleno, em preparação", ctx: "Entrevistas", goal: "Treinar o desafio de links curtos respeitando orçamento, capacidade e latência.", used: ["Enunciado", "Fluxos"], hue: "var(--c-network)" },
  { name: "Carla", role: "Tech lead", ctx: "E-commerce", goal: "Mostrar à equipe, com números, o que acontece quando o backend fica sem réplicas.", used: ["Réplicas", "Simulação"], hue: "var(--c-data)" },
  { name: "Marina", role: "Estudante de computação", ctx: "Faculdade", goal: "Entender p95 e saturação vendo os valores mudarem a cada ajuste de tráfego.", used: ["Tráfego", "Latência"], hue: "var(--c-origin)" },
  { name: "Rafael", role: "SRE", ctx: "Logística", goal: "Ensaiar partição de rede e certificado TLS inválido sem encostar em produção.", used: ["Modo caos", "Rede"], hue: "var(--c-messaging)" },
  { name: "Júlia", role: "Engenheira de produto", ctx: "Saúde digital", goal: "Escolher entre SQL e chave-valor vendo cada opção saturar sob o mesmo tráfego.", used: ["Provedores", "Fluxos"], hue: "var(--c-support)" },
  { name: "Tiago", role: "Arquiteto", ctx: "Banco digital", goal: "Preparar uma revisão de arquitetura com evidências, não com palpites.", used: ["Requisitos", "Simulação"], hue: "var(--c-compute)" },
  { name: "Diego", role: "Instrutor · em breve", ctx: "Bootcamp", goal: "Montar um cenário de falha para a turma e acompanhar a evolução de cada aluno.", used: ["Roadmap"], hue: "var(--c-network)" },
];

function Avatar({ name, hue, photo }: { name: string; hue: string; photo?: string }) {
  if (photo) return <img src={photo} alt={name} className="size-12 rounded-full object-cover" />;
  const svg = AVATARS[name];
  if (svg) return <span aria-hidden className="block size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-surface [&>svg]:size-full" style={{ ["--tw-ring-color" as string]: `color-mix(in srgb, ${hue} 70%, transparent)` }} dangerouslySetInnerHTML={{ __html: svg }} />;
  return (
    <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full text-[15px] font-semibold text-white" style={{ background: `linear-gradient(140deg, ${hue}, color-mix(in srgb, ${hue} 55%, #000))` }}>{name[0]}</span>
  );
}

function ScenarioCard({ s }: { s: Scenario }) {
  return (
    <figure className="flex w-[20rem] shrink-0 flex-col gap-4 rounded-3xl border border-line bg-surface/70 p-5 backdrop-blur transition-colors duration-300 hover:border-line-strong">
      <div className="flex items-center gap-3.5">
        <Avatar name={s.name} hue={s.hue} />
        <figcaption className="min-w-0 flex-1 leading-tight"><b className="block text-[16px]">{s.name}</b><span className="block text-[13px] text-text-2">{t(s.role)}</span></figcaption>
        <span className="inline-flex shrink-0 items-center gap-1 self-start rounded-full bg-track px-2.5 py-0.5 text-[11.5px] font-medium text-text-2"><Icon name="apartment" size={13} />{t(s.ctx)}</span>
      </div>
      <p className="flex-1 text-[15px] leading-relaxed">{t(s.goal)}</p>
      <div className="flex flex-wrap gap-1.5">{s.used.map((u) => <span key={u} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-text-2">{t(u)}</span>)}</div>
    </figure>
  );
}
function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex w-[19.5rem] shrink-0 flex-col gap-4 rounded-3xl border border-line bg-surface/70 p-5 backdrop-blur">
      <blockquote className="flex-1 text-[15px] leading-relaxed">“{t.quote}”</blockquote>
      <figcaption className="flex items-center gap-3"><Avatar name={t.name} hue="var(--accent)" photo={t.photo} /><span className="leading-tight"><b className="block text-[15px]">{t.name}</b><span className="text-[13px] text-text-2">{t.role}</span></span></figcaption>
    </figure>
  );
}

function Personas() {
  const real = TESTIMONIALS.length > 0;
  const cards = real ? TESTIMONIALS.map((t) => <TestimonialCard key={t.name} t={t} />) : SCENARIOS.map((s) => <ScenarioCard key={s.name} s={s} />);
  const half = Math.ceil(cards.length / 2);
  return (
    <Section>
      <BlurFade inView><Eyebrow>{real ? t("Quem já usou") : t("Para quem")}</Eyebrow></BlurFade>
      <BlurFade inView delay={0.05}><H2 className="mt-5 max-w-3xl">{t("Do primeiro cache à")}{" "}<Serif>{t("revisão de arquitetura")}</Serif>.</H2></BlurFade>
      <BlurFade inView delay={0.1}>
        <p className="mt-5 max-w-2xl text-xl leading-snug text-text-2">
          {real ? t("O que as pessoas disseram depois de testar.") : t("Situações em que o laboratório ajuda, vividas por quem estuda, ensina e projeta sistemas.")}
        </p>
      </BlurFade>
      <div className="lp-fade-x mt-14 -mx-5 flex flex-col gap-4 sm:-mx-8">
        <Marquee pauseOnHover className="[--duration:90s] [--gap:1rem]" repeat={3}>{cards.slice(0, half)}</Marquee>
        <Marquee reverse pauseOnHover className="[--duration:110s] [--gap:1rem]" repeat={3}>{cards.slice(half)}</Marquee>
      </div>
    </Section>
  );
}

/* ───────────────────────── roadmap ───────────────────────── */

interface RoadItem { t: string; to?: string }
const ROADMAP: { tag: string; tone: "ok" | "accent" | "muted"; phase: string; items: RoadItem[] }[] = [
  { tag: "Disponível agora", tone: "ok", phase: "Fase atual", items: [
    { t: "Editor visual com 21 tipos de componente", to: "#produto" }, { t: "Provedores reais com logo", to: "#produto" },
    { t: "Fluxos de requisição e cache-aside", to: "#ciclo" }, { t: "Simulação de 300 s, tráfego e mix leitura/escrita", to: "#lab" },
    { t: "Modo caos com 30 falhas", to: "#lab" }, { t: "Enunciado do desafio de links curtos", to: "#ciclo" },
    { t: "Desfazer/refazer e atalhos de teclado", to: "#produto" },
  ] },
  { tag: "A seguir", tone: "accent", phase: "Próxima fase", items: [
    { t: "Contas e salvamento dos projetos" }, { t: "Mais desafios: chat, feed, vídeo e pagamentos" }, { t: "Comparar duas versões do mesmo desenho" },
    { t: "Avaliação com regras e achados rastreáveis" }, { t: "Exportar o estudo para o portfólio" },
  ] },
  { tag: "Depois", tone: "muted", phase: "Mais adiante", items: [
    { t: "Tutor opcional que explica o que o motor calculou" }, { t: "Desafios privados e turmas para instrutores" }, { t: "Latência com distribuições e filas mais realistas" },
  ] },
];
const ROAD_DONE = ROADMAP[0]!.items.length;
const ROAD_TOTAL = ROADMAP.reduce((a, c) => a + c.items.length, 0);

function Roadmap() {
  const pct = Math.round((ROAD_DONE / ROAD_TOTAL) * 100);
  return (
    <Section id="roadmap">
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          <BlurFade inView><Eyebrow>{t("Transparência")}</Eyebrow></BlurFade>
          <BlurFade inView delay={0.05}><H2 className="mt-5 max-w-3xl">{t("Onde estamos,")}{" "}<Serif>{t("sem maquiagem")}</Serif>.</H2></BlurFade>
          <BlurFade inView delay={0.1}><p className="mt-5 max-w-2xl text-xl leading-snug text-text-2">{t("O ArchLab está no começo. Hoje há um desafio jogável e um motor de simulação pedagógico — com perfis fictícios de capacidade, não benchmarks. O resto vem em fases.")}</p></BlurFade>
        </div>
        <BlurFade inView delay={0.15}>
          <div className="rounded-3xl border border-line bg-surface/70 p-5 backdrop-blur" role="group" aria-label={t("{a} de {b} entregas planejadas concluídas", { a: ROAD_DONE, b: ROAD_TOTAL })}>
            <div className="flex items-baseline justify-between"><span className="text-sm font-semibold text-text-2">{t("Entregas planejadas")}</span><span className="text-sm text-text-2">{pct}%</span></div>
            <div className="mt-1 text-4xl font-semibold tracking-tight tabular-nums"><NumberTicker value={ROAD_DONE} className="text-text" /> <span className="text-xl font-medium text-text-2">{t("de {n}", { n: ROAD_TOTAL })}</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-track">
              <motion.i className="block h-full origin-left rounded-full bg-accent" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-text-2">{t("Contagem das entregas listadas abaixo. Não é uma promessa de data.")}</p>
          </div>
        </BlurFade>
      </div>

      <div className="relative mt-20">
        {/* trilha: concluído (sólido) → planejado (tracejado) */}
        <div className="pointer-events-none absolute inset-x-0 -top-9 hidden h-9 lg:block" aria-hidden>
          <div className="absolute left-[16.66%] right-[16.66%] top-[26px] h-px">
            <motion.i className="absolute inset-y-0 left-0 w-1/2 origin-left bg-accent" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
            <i className="absolute inset-y-0 right-0 w-1/2 border-t border-dashed border-line-strong" />
          </div>
          {["var(--accent)", "var(--accent)", "var(--border-strong)"].map((c, n) => (
            <span key={n} className="absolute top-[20px] grid size-3 -translate-x-1/2 place-items-center" style={{ left: `${16.66 + n * 33.34}%` }}>
              <i className="block size-3 rounded-full ring-4 ring-bg" style={{ background: n === 0 ? c : "var(--bg)", border: `2px solid ${c}` }} />
            </span>
          ))}
          <span className="absolute left-[16.66%] top-0 -translate-x-1/2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-on-accent">
            <span className="size-1.5 rounded-full bg-on-accent animate-pulse-soft" />{t("você está aqui")}</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {ROADMAP.map((c, i) => (
            <BlurFade key={c.tag} inView delay={i * 0.08}>
              <Card className="h-full" hover={false}>
                <div className="flex items-center justify-between">
                  <span className={cn("inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", c.tone === "ok" && "bg-ok/12 text-ok", c.tone === "accent" && "bg-accent/12 text-accent", c.tone === "muted" && "bg-track text-text-2")}>
                    <span className="size-1.5 rounded-full bg-current" />{t(c.tag)}
                  </span>
                  <span className="text-xs text-text-2">{c.items.length} {c.items.length === 1 ? t("item") : t("itens")}</span>
                </div>
                <ul className="mt-5 space-y-1">
                  {c.items.map((it, n) => {
                    const icon = c.tone === "ok" ? "check_circle" : c.tone === "accent" ? "arrow_circle_right" : "schedule";
                    const inner = (
                      <>
                        <span className={cn("mt-0.5 shrink-0", c.tone === "ok" ? "text-ok" : c.tone === "accent" ? "text-accent" : "text-text-2")}><Icon name={icon} size={18} /></span>
                        <span className={cn("flex-1 text-[15px] leading-snug", c.tone === "muted" && "text-text-2")}>{t(it.t)}</span>
                        {it.to && <span className="mt-0.5 shrink-0 text-text-2 opacity-0 transition-all duration-300 group-hover/item:translate-x-0.5 group-hover/item:text-accent group-hover/item:opacity-100"><Icon name="arrow_outward" size={16} /></span>}
                      </>
                    );
                    return (
                      <motion.li key={it.t} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + n * 0.05, duration: 0.45 }}>
                        {it.to
                          ? <a href={it.to} title={t("Ver na página")} className="group/item -mx-2 flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-track">{inner}</a>
                          : <div className="-mx-2 flex items-start gap-3 px-2 py-2">{inner}</div>}
                      </motion.li>
                    );
                  })}
                </ul>
              </Card>
            </BlurFade>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ───────────────────────── faq ───────────────────────── */

interface FaqItem { q: string; a: string; icon: string; chips?: string[]; cta?: { label: string; href: string } }
const FAQ: FaqItem[] = [
  { q: "Os números são reais?", icon: "fact_check", chips: ["modelo pedagógico", "perfis fictícios", "não é benchmark"],
    a: "Não. O motor é um modelo de ensino com perfis de capacidade fictícios e créditos inventados. Ele ensina a raciocinar sobre gargalos; não prevê produção nem substitui um teste de carga." },
  { q: "Como os números são calculados?", icon: "calculate", cta: { label: "Ver o motor funcionando", href: "#lab" },
    a: "A carga é somada por componente e dividida pela capacidade (réplicas × capacidade do perfil). O que passa de 100% é rejeitado, e o resto segue pelo caminho da requisição. A latência p95 é um proxy: base do componente + penalidade de saturação + atrasos das falhas." },
  { q: "Meus dados saem do navegador?", icon: "shield_lock",
    a: "Não. Tudo roda no seu navegador e nada é enviado a servidores. Guardamos localmente o tema, quais painéis você recolheu e o seu último desenho de cada caso. Você também pode exportar e importar o desenho como arquivo." },
  { q: "Preciso de conta?", icon: "person",
    a: "Hoje não: o laboratório abre direto. Como o salvamento ainda não existe, contas e persistência são as próximas entregas." },
  { q: "É gratuito?", icon: "sell",
    a: "O ciclo completo — aprender, projetar, simular e quebrar — foi pensado para continuar gratuito. Recursos avançados e de equipe virão depois, sem esconder o essencial." },
  { q: "Funciona no celular?", icon: "smartphone",
    a: "A página sim. O editor, com arrastar e soltar, foi desenhado para telas grandes. Uma visão para acompanhar o fluxo no celular é um próximo passo." },
  { q: "Quais navegadores funcionam?", icon: "language",
    a: "Chrome, Edge, Firefox e Safari recentes. Alguns efeitos extras (como a revelação circular do tema) aparecem só onde o navegador oferece o recurso, sem prejudicar o resto." },
  { q: "Posso usar para treinar entrevistas?", icon: "work", cta: { label: "Conhecer o ciclo", href: "#ciclo" },
    a: "Foi pensado para isso: o desafio traz enunciado de entrevista, requisitos funcionais e não funcionais, escala, restrições e trade-offs, e você vê com números se o desenho atende." },
  { q: "E para ensinar uma turma?", icon: "cast_for_education",
    a: "Hoje dá para usar o desafio e compartilhar a tela. Desafios privados, turmas e acompanhamento por aluno estão no roadmap, mas ainda não existem." },
  { q: "Posso exportar meu desenho?", icon: "ios_share",
    a: "Ainda não. A exportação do estudo (JSON, imagem e resumo para o portfólio) está planejada para a fase de contas e salvamento." },
  { q: "Por que o resultado é determinístico?", icon: "autorenew",
    a: "Para você poder comparar versões. Mesma arquitetura, mesma carga e mesmas falhas dão exatamente o mesmo resultado; mudar o desenho é o que muda a conta." },
  { q: "Isso usa IA?", icon: "psychology",
    a: "O núcleo não depende de IA: regras e simulação são código determinístico. Um tutor opcional, que apenas explica o que o motor calculou, está planejado para depois." },
  { q: "As marcas dos logos são parceiras?", icon: "verified",
    a: "Não. Os logos são das respectivas empresas e aparecem de forma ilustrativa, para você associar cada peça à tecnologia real." },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const [query, setQuery] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const shown = FAQ.map((f, idx) => ({ f, idx })).filter(({ f }) => !query.trim() || norm(`${t(f.q)} ${t(f.a)} ${(f.chips ?? []).map((c) => t(c)).join(" ")}`).includes(norm(query.trim())));
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
    const btns = Array.from(list.current?.querySelectorAll<HTMLButtonElement>("[data-faq-q]") ?? []);
    const cur = btns.indexOf(document.activeElement as HTMLButtonElement);
    if (cur < 0) return;
    e.preventDefault();
    const next = e.key === "Home" ? 0 : e.key === "End" ? btns.length - 1 : e.key === "ArrowDown" ? (cur + 1) % btns.length : (cur - 1 + btns.length) % btns.length;
    btns[next]?.focus();
  };

  return (
    <Section id="faq">
      <div className="grid gap-12 lg:grid-cols-[22rem_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <BlurFade inView><Eyebrow>{t("Perguntas frequentes")}</Eyebrow></BlurFade>
          <BlurFade inView delay={0.05}><H2 className="mt-5">{t("O que costumam")}{" "}<Serif>perguntar</Serif>.</H2></BlurFade>
          <BlurFade inView delay={0.1}>
            <SearchField className="mt-8" value={query} onChange={setQuery} placeholder={t("Buscar uma pergunta")} label={t("Buscar uma pergunta")} />
            <p className="mt-2 text-xs text-text-2" aria-live="polite">{t("{a} de {b} perguntas", { a: shown.length, b: FAQ.length })}</p>
          </BlurFade>
          <BlurFade inView delay={0.15}>
            <div className="mt-8 rounded-3xl border border-line bg-surface/70 p-6 backdrop-blur">
              <div className="mb-3"><Logo size={44} /></div>
              <h3 className="text-lg font-semibold tracking-tight">{t("Ainda com dúvida?")}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-text-2">{t("O jeito mais rápido de entender é abrir o laboratório e quebrar o primeiro sistema.")}</p>
              <a {...ctaProps} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">{t("Abrir o laboratório")}{" "}<Icon name="arrow_forward" size={16} /></a>
            </div>
          </BlurFade>
        </div>

        <div ref={list} onKeyDown={onKey} className="flex flex-col gap-1.5">
          {shown.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-text-2">{t("Nenhuma pergunta encontrada para “{q}”.", { q: query })}{" "}<button onClick={() => setQuery("")} className="font-semibold text-accent">{t("Limpar busca")}</button>
            </div>
          )}
          {shown.map(({ f, idx }, n) => {
            const isOpen = open === idx;
            return (
              <BlurFade key={f.q} inView delay={Math.min(n, 5) * 0.04}>
                <div className={cn("rounded-2xl border transition-all duration-500", isOpen ? "border-line-strong bg-surface/80 shadow-[0_18px_50px_-34px_rgba(0,0,0,.6)]" : "border-transparent hover:bg-track")}>
                  <button data-faq-q aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : idx)} className="flex w-full items-center gap-4 px-4 py-4 text-left">
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl transition-colors duration-500", isOpen ? "bg-accent text-on-accent" : "bg-track text-text-2")}><Icon name={f.icon} size={18} /></span>
                    <span className={cn("flex-1 text-[17px] font-medium tracking-tight transition-colors", isOpen && "text-text")}>{t(f.q)}</span>
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border border-line-strong transition-all duration-300", isOpen && "rotate-45 border-accent text-accent")}><Icon name="add" size={18} /></span>
                  </button>
                  <motion.div initial={false} animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                    <div className="pb-5 pl-[4.25rem] pr-6">
                      <p className="max-w-2xl text-[15px] leading-relaxed text-text-2">{t(f.a)}</p>
                      {f.chips && <div className="mt-3 flex flex-wrap gap-2">{f.chips.map((c) => <span key={c} className="rounded-full border border-line px-3 py-1 text-xs font-medium">{t(c)}</span>)}</div>}
                      {f.cta && <a href={f.cta.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">{t(f.cta.label)} <Icon name="arrow_forward" size={16} /></a>}
                    </div>
                  </motion.div>
                </div>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ───────────────────────── cta final + rodapé ───────────────────────── */

function FinalCta() {
  return (
    <Section className="pb-20 pt-10 sm:pb-28">
      <BlurFade inView>
        <div className="relative overflow-hidden rounded-[2rem] border border-line-strong bg-surface px-6 py-20 text-center sm:px-12 sm:py-28">
          <ShineBorder shineColor={["#38bdf8", "#a78bfa", "#34d399"]} borderWidth={1.5} duration={16} />
          <Ripple mainCircleSize={260} mainCircleOpacity={0.14} numCircles={7} />
          <div className="relative z-10">
            <h2 className="mx-auto max-w-3xl text-balance text-[clamp(2rem,5vw,3.8rem)] font-semibold leading-[1.04] tracking-[-0.03em]">{t("Pronto para quebrar o seu")}{" "}<Serif>{t("primeiro sistema")}</Serif>?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-text-2">{t("Abra o laboratório, projete os links curtos e descubra em quanto tempo o banco cai.")}</p>
            <div className="mt-9 flex justify-center"><PrimaryButton big>{t("Acessar o laboratório")}</PrimaryButton></div>
          </div>
        </div>
      </BlurFade>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-text-2 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-2.5 text-text"><Logo size={28} /><b>{t("ArchLab")}</b><span className="text-text-2">{t("· laboratório de System Design")}</span></div>
        <p className="max-w-md text-xs leading-relaxed">{t("Projeto em desenvolvimento. Capacidades e custos são fictícios e didáticos. Logotipos pertencem aos respectivos titulares e são usados de forma ilustrativa.")}</p>
        <a {...ctaProps} className="font-medium text-text hover:text-accent">{t("Acessar o laboratório →")}</a>
      </div>
    </footer>
  );
}

/* ───────────────────────── página ───────────────────────── */

export function Landing() {
  useLang();
  return (
    <div className="lp relative min-h-screen">
      <Header />
      <main>
        <Hero />
        <LogoWall />
        <Cycle />
        <Bento />
        <LivePlayground />
        <Numbers />
        <Personas />
        <Roadmap />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

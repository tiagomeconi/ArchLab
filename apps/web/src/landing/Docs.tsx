import { Fragment, useEffect, useState, type ReactNode } from "react";
import "./landing.css";
import { DOCS, DOC_LEVELS, DOC_SECTIONS, bi, docById, docUrl, type Bi, type DocArticle, type DocBlock, type FigKind } from "../docs";
import { link } from "../nav";
import { Icon } from "../ui";
import { t, useLang } from "../i18n";

const heading = "text-balance text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.024em]";

/** **negrito** e `código` dentro de um parágrafo. */
function inline(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**")) return <strong key={i} className="font-semibold text-text">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`")) return <code key={i} className="rounded-md bg-track px-1.5 py-0.5 font-mono text-[0.88em]">{part.slice(1, -1)}</code>;
    if (part.startsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");


const KIND_VAR: Record<FigKind, string> = { client: "--c-origin", edge: "--c-network", service: "--c-compute", data: "--c-data", cache: "--c-support", queue: "--c-messaging", ext: "--text-2" };
const FW = 128, FH = 50, GX = 54, GY = 22, PAD = 12;

/** Diagrama em SVG: colunas de caixas com setas curvas entre elas; as cores seguem as categorias do laboratório. */
function Figure({ b, lang }: { b: Extract<DocBlock, { k: "fig" }>; lang: string }) {
  const txt = (x: Bi | string) => (typeof x === "string" ? x : bi(x, lang));
  const maxRows = Math.max(...b.cols.map((c) => c.length));
  const colH = maxRows * FH + (maxRows - 1) * GY;
  const colOf = new Map<string, number>(); b.cols.forEach((c, ci) => c.forEach((n) => colOf.set(n.id, ci)));
  // cada vão entre colunas cresce para caber o maior rótulo das setas que o atravessam entre colunas vizinhas
  const gaps = b.cols.slice(1).map((_, i) => b.edges.reduce((w, e) => {
    const a = colOf.get(e.from), z = colOf.get(e.to);
    return e.label && a != null && z != null && Math.min(a, z) === i && Math.abs(a - z) === 1 ? Math.max(w, txt(e.label).length * 6.4 + 26) : w;
  }, GX));
  const colX = b.cols.map((_, ci) => PAD + ci * FW + gaps.slice(0, ci).reduce((s, g) => s + g, 0));
  const W = colX[colX.length - 1]! + FW + PAD, H = colH + PAD * 2;
  const pos = new Map<string, { x: number; y: number; col: number }>();
  b.cols.forEach((c, ci) => { const top = PAD + (colH - (c.length * FH + (c.length - 1) * GY)) / 2; c.forEach((n, ri) => pos.set(n.id, { x: colX[ci]!, y: top + ri * (FH + GY), col: ci })); });
  const labels: ({ key: number; label: string; mx: number; my: number } | null)[] = [];
  const id = `ar-${Math.abs([...b.cap[0]].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7))}`;
  const lines = (s: string) => { const w = s.split(/\s+/), out: string[] = []; let cur = ""; for (const x of w) { if ((cur + " " + x).trim().length > 17 && cur) { out.push(cur); cur = x; } else cur = (cur + " " + x).trim(); } if (cur) out.push(cur); return out.slice(0, 3); };
  return (
    <figure tabIndex={0} aria-label={bi(b.cap, lang)} className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface p-3">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={bi(b.cap, lang)} style={{ minWidth: Math.min(W, 600), width: "100%", maxWidth: W, display: "block", margin: "0 auto" }}>
        <defs>
          <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--text-2)" /></marker>
        </defs>
        {b.edges.map((e, i) => {
          const a = pos.get(e.from), z = pos.get(e.to); if (!a || !z) return null;
          let x1: number, y1: number, x2: number, y2: number, d: string, mx: number, my: number;
          if (a.col === z.col) { const down = z.y > a.y; x1 = a.x + FW / 2; x2 = z.x + FW / 2; y1 = a.y + (down ? FH : 0); y2 = z.y + (down ? 0 : FH); d = `M${x1} ${y1} L${x2} ${y2}`; mx = x1; my = (y1 + y2) / 2; }
          else { const right = z.col > a.col; x1 = a.x + (right ? FW : 0); x2 = z.x + (right ? 0 : FW); y1 = a.y + FH / 2; y2 = z.y + FH / 2; const c = Math.max(24, Math.abs(x2 - x1) / 2); d = `M${x1} ${y1} C${x1 + (right ? c : -c)} ${y1} ${x2 + (right ? -c : c)} ${y2} ${x2} ${y2}`; mx = (x1 + x2) / 2; my = (y1 + y2) / 2; }
          const label = e.label ? txt(e.label) : "";
          labels.push(label ? { key: i, label, mx, my } : null);
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="var(--text-2)" strokeWidth="1.5" strokeDasharray={e.dashed ? "5 4" : undefined} markerEnd={`url(#${id})`} markerStart={e.both ? `url(#${id})` : undefined} />
            </g>
          );
        })}
        {b.cols.flat().map((n) => {
          const p = pos.get(n.id)!, col = `var(${KIND_VAR[n.kind ?? "service"]})`, ls = lines(txt(n.label));
          return (
            <g key={n.id}>
              <rect x={p.x} y={p.y} width={FW} height={FH} rx={10} fill={`color-mix(in srgb, ${col} 14%, var(--surface-solid))`} stroke={col} strokeWidth="1.5" strokeDasharray={n.dashed ? "5 4" : undefined} />
              {ls.map((l, i) => <text key={i} x={p.x + FW / 2} y={p.y + FH / 2 + (i - (ls.length - 1) / 2) * 13 + 4} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--text)">{l}</text>)}
            </g>
          );
        })}
        {labels.map((l) => l && <g key={`l${l.key}`}><rect x={l.mx - l.label.length * 3.2 - 4} y={l.my - 9} width={l.label.length * 6.4 + 8} height={17} rx={5} fill="var(--surface-solid)" stroke="var(--border)" /><text x={l.mx} y={l.my + 3.5} textAnchor="middle" fontSize="10.5" fill="var(--text-2)">{l.label}</text></g>)}
      </svg>
      <figcaption className="mt-2 px-1 text-center text-sm text-text-2">{bi(b.cap, lang)}</figcaption>
    </figure>
  );
}

function Block({ b, lang }: { b: DocBlock; lang: string }) {
  switch (b.k) {
    case "h": { const x = bi(b.x, lang); return <h2 id={slug(x)} className="mt-10 scroll-mt-6 text-xl font-semibold tracking-tight">{x}</h2>; }
    case "p": return <p className="mt-4 leading-relaxed text-text-2">{inline(bi(b.x, lang))}</p>;
    case "ul": return <ul className="mt-4 grid list-disc gap-2 pl-6 leading-relaxed text-text-2 marker:text-accent">{b.x.map((x, i) => <li key={i}>{inline(bi(x, lang))}</li>)}</ul>;
    case "tip": return (
      <aside className="mt-6 flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 leading-relaxed">
        <Icon name="lightbulb" size={20} /><p>{inline(bi(b.x, lang))}</p>
      </aside>
    );
    case "table": return (
      <div tabIndex={0} className="mt-5 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm leading-snug">
          <thead><tr className="bg-track">{b.head.map((c, i) => <th key={i} scope="col" className="px-4 py-2.5 font-semibold">{inline(bi(c, lang))}</th>)}</tr></thead>
          <tbody>{b.rows.map((r, i) => <tr key={i} className="border-t border-line align-top">{r.map((c, j) => j === 0 ? <th key={j} scope="row" className="px-4 py-2.5 font-semibold">{inline(bi(c, lang))}</th> : <td key={j} className="px-4 py-2.5 text-text-2">{inline(bi(c, lang))}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
    case "fig": return <Figure b={b} lang={lang} />;
    case "code": return <pre tabIndex={0} className="mt-4 overflow-x-auto rounded-2xl border border-line bg-track p-4 font-mono text-sm leading-relaxed"><code>{b.x}</code></pre>;
  }
}

const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function Index({ lang }: { lang: string }) {
  const [q, setQ] = useState("");
  const f = norm(q.trim());
  const match = (d: DocArticle) => !f || norm(`${d.title[0]} ${d.title[1]} ${d.summary[0]} ${d.summary[1]}`).includes(f);
  const secs = DOC_SECTIONS.map((sec) => ({ sec, items: DOCS.filter((d) => d.section === sec.id && match(d)) })).filter((x) => x.items.length > 0);
  return (
    <>
      <h1 className={heading}>{t("Aulas")}</h1>
      <p className="mt-2 max-w-2xl text-lg leading-snug text-text-2">{t("Documentação de system design, do básico ao avançado. Leia na ordem ou pule direto para o que precisa; depois, ponha em prática nos casos e no modo livre.")}</p>
      <p className="mt-2 text-sm text-text-2">{t("{n} artigos em {m} seções", { n: DOCS.length, m: DOC_SECTIONS.length })}</p>
      <label className="mt-5 flex max-w-md items-center gap-2.5 rounded-full border border-line-strong bg-surface px-4 py-2.5 text-text-2 transition-colors focus-within:border-accent focus-within:text-text focus-within:ring-2 focus-within:ring-accent/30">
        <Icon name="search" size={20} />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Buscar nas aulas")} aria-label={t("Buscar nas aulas")} style={{ all: "unset", boxSizing: "border-box", flex: 1, minWidth: 0, font: "inherit", color: "var(--text)" }} className="placeholder:text-text-2" />
      </label>
      {secs.length === 0 && <p className="mt-8 text-text-2">{t("Nenhum artigo encontrado.")}</p>}
      {secs.map(({ sec, items }) => (
        <section key={sec.id} className="mt-10" aria-label={bi(sec.title, lang)}>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight"><Icon name={sec.icon} size={22} />{bi(sec.title, lang)}</h2>
          <p className="mt-1 text-sm text-text-2">{bi(sec.summary, lang)}</p>
          <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((d) => (
              <li key={d.id}>
                <a {...link(docUrl(d))} className="group flex h-full items-start gap-4 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-accent">
                  <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-2xl bg-track text-accent transition-colors group-hover:bg-accent group-hover:text-on-accent"><Icon name={d.icon} size={24} /></span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{bi(d.title, lang)}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-text-2">{bi(d.summary, lang)}</span>
                    <span className="mt-1.5 block text-xs text-text-2">{bi(DOC_LEVELS[d.level]!.title, lang)} · {t("{n} min de leitura", { n: d.minutes })}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function Article({ d, lang }: { d: DocArticle; lang: string }) {
  const i = DOCS.indexOf(d), prev = DOCS[i - 1], next = DOCS[i + 1];
  const sec = DOC_SECTIONS.find((x) => x.id === d.section)!, mates = DOCS.filter((x) => x.section === d.section);
  const toc = d.body.filter((b): b is Extract<DocBlock, { k: "h" }> => b.k === "h").map((b) => bi(b.x, lang));
  useEffect(() => { document.title = `${bi(d.title, lang)} · ArchLab`; }, [d, lang]);
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
      <article className="min-w-0 max-w-3xl">
        <a {...link("/start/aulas")} className="inline-flex items-center gap-1 text-sm font-medium text-text-2 hover:text-text"><Icon name="arrow_back" size={16} />{t("Voltar às aulas")}</a>
        <p className="mt-5 text-sm font-semibold text-accent">{bi(sec.title, lang)} · {bi(DOC_LEVELS[d.level]!.title, lang)} · {t("{n} min de leitura", { n: d.minutes })}</p>
        <h1 className={`${heading} mt-1`}>{bi(d.title, lang)}</h1>
        <p className="mt-2 text-lg leading-snug text-text-2">{bi(d.summary, lang)}</p>
        {d.body.map((b, k) => <Block key={k} b={b} lang={lang} />)}

        <section aria-label={t("Pratique")} className="mt-12 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-5">
          <div className="min-w-[14rem] flex-1">
            <p className="font-semibold">{t("Hora de praticar")}</p>
            <p className="text-sm text-text-2">{t("Monte uma arquitetura com o que você leu e veja a simulação responder.")}</p>
          </div>
          <a {...link("/start/livre")} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90">{t("Modo livre")}<Icon name="arrow_forward" size={16} /></a>
          <a {...link("/start/estudo")} className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm font-medium transition-colors hover:bg-track">{t("Casos")}</a>
        </section>

        <nav aria-label={t("Outros artigos")} className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {prev ? <a {...link(docUrl(prev))} className="rounded-2xl border border-line p-4 transition-colors hover:border-accent"><span className="text-xs text-text-2">{t("Anterior")}</span><span className="block font-semibold">{bi(prev.title, lang)}</span></a> : <span />}
          {next ? <a {...link(docUrl(next))} className="rounded-2xl border border-line p-4 text-right transition-colors hover:border-accent sm:col-start-2"><span className="text-xs text-text-2">{t("Próximo")}</span><span className="block font-semibold">{bi(next.title, lang)}</span></a> : null}
        </nav>
      </article>
      <aside className="hidden lg:block">
        <div className="sticky top-6 grid max-h-[calc(100vh-3rem)] gap-6 overflow-y-auto pr-1">
          {toc.length > 0 && (
            <nav aria-label={t("Neste artigo")}>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-2">{t("Neste artigo")}</p>
              <ul className="mt-3 grid gap-2 border-l border-line pl-4 text-sm">
                {toc.map((x) => <li key={x}><a href={`#${slug(x)}`} className="text-text-2 transition-colors hover:text-text">{x}</a></li>)}
              </ul>
            </nav>
          )}
          <nav aria-label={t("Nesta seção")}>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-2">{t("Nesta seção")}</p>
            <ul className="mt-3 grid gap-2 border-l border-line pl-4 text-sm">
              {mates.map((m) => <li key={m.id}><a {...link(docUrl(m))} aria-current={m.id === d.id ? "page" : undefined} className={m.id === d.id ? "font-semibold text-text" : "text-text-2 transition-colors hover:text-text"}>{bi(m.title, lang)}</a></li>)}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  );
}

/** Aulas em formato de documentação: lista por nível em /start/aulas e o artigo em /start/aulas/<id>. */
export function Docs({ path }: { path: string }) {
  const lang = useLang();
  const d = docById(path.replace(/\/+$/, "").split("/")[3]);
  return d ? <Article d={d} lang={lang} /> : <Index lang={lang} />;
}

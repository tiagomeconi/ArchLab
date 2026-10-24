import { useState } from "react";
import "./landing.css";
import type { AssessmentAttempt } from "../assessments";
import type { StudyCase } from "../cases";
import { leagueOf } from "../leagues";
import { LeagueBadge } from "../LeagueBadge";
import { RatingChip } from "../Rating";
import { renderSocialCard } from "../socialCard";
import { deliveredReportInput } from "../deliveredReport";
import { link } from "../nav";
import { t } from "../i18n";
import { Icon } from "../ui";

const MIN_SCORE = 70;
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function AssessmentResult({ attempt, c, busy: editBusy = false, onView, onEdit }: { attempt: AssessmentAttempt; c?: StudyCase; busy?: boolean; onView: () => void; onEdit: () => void }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [image, setImage] = useState<"report" | "card">("report");
  const score = attempt.score ?? 0;
  const lg = attempt.passed ? leagueOf(score) : null;
  const checks = attempt.report?.checks ?? [];
  const failed = checks.filter((ch) => ch.status !== "meets");
  const company = c?.company?.name ?? c?.title ?? "";
  const url = location.origin;
  const approved = t("Acabei de ser aprovado(a) na avaliação de System Design da {empresa} no ArchLab: nota {nota}/100, liga {liga}. 🏆\n\nDesenhei a arquitetura do zero, sem dicas, e o servidor simulou a carga de pico do caso para avaliar o sistema.\n\nQuer testar o seu? {url}\n\n#SystemDesign #ArquiteturaDeSoftware #Engenharia #ArchLab", { empresa: company, nota: score, liga: lg ? t(lg.name) : "", url });
  const practice = t("Treinando System Design no ArchLab: desenhei a arquitetura do caso {empresa} e o servidor avaliou o sistema na carga de pico. Nota {nota}/100 e ainda dá para melhorar. 💪\n\nQuer testar o seu? {url}\n\n#SystemDesign #ArquiteturaDeSoftware #Engenharia #ArchLab", { empresa: company, nota: score, url });
  const [draft, setDraft] = useState<string | null>(null);
  const message = draft ?? (attempt.passed ? approved : practice);

  const card = () => renderSocialCard({
    kind: "case", title: c?.title ?? attempt.case_id, subtitle: t("Avaliação sem dicas"), logoId: c?.company?.logo, iconName: c?.icon,
    overall: score, competitive: attempt.passed, points: attempt.points,
    attrs: attempt.report?.rating.attrs.map((a) => ({ label: a.label, score: a.score })),
  });
  const report = async () => { const input = deliveredReportInput(attempt, c); if (!input) throw new Error("report"); return (await import("../report")).renderReport(input); };
  const picture = () => image === "report" ? report() : card();
  const download = (blob: Blob) => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `archlab-${image === "report" ? "relatorio" : "avaliacao"}-${slug(c?.title ?? attempt.case_id) || "nota"}.png`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const copy = async () => { try { await navigator.clipboard.writeText(message); return true; } catch { return false; } };
  const run = async (fn: () => Promise<void>) => { if (busy) return; setBusy(true); setNote(""); try { await fn(); } catch { setNote(t("Não foi possível gerar a imagem")); } finally { setBusy(false); } };
  const shareLinkedIn = () => run(async () => {
    const blob = await picture();
    const file = new File([blob], "archlab-avaliacao.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], text: message }); return; } catch (e) { if ((e as Error).name === "AbortError") return; } }
    download(blob);
    const copied = await copy();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    setNote(copied ? t("Cartão baixado e texto copiado. No LinkedIn, cole o texto (Ctrl+V) e anexe a imagem.") : t("Cartão baixado. Use o botão \"Copiar texto\" e cole no LinkedIn junto com a imagem."));
  });
  const btn = "inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-track disabled:opacity-50";

  return <>
    <section className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface" style={lg ? { borderColor: `${lg.c1}66`, background: `radial-gradient(120% 140% at 0% 0%, ${lg.c1}22, transparent 55%), var(--surface)` } : undefined}>
      <div className="flex flex-wrap items-center gap-6 p-6 sm:p-8">
        {lg ? <LeagueBadge league={lg} size={104} /> : <span className="grid size-24 place-items-center rounded-full border border-line text-text-2"><Icon name="flag" size={40} /></span>}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-wider" style={lg ? { color: lg.c1 } : undefined}>{attempt.passed ? `${t("Aprovado")} · ${t(lg!.name)}` : t("Não aprovado desta vez")}</p>
          <p className="mt-1 flex items-baseline gap-2"><b className="text-6xl font-semibold tabular-nums leading-none">{score}</b><span className="text-xl text-text-2">/ 100</span></p>
          <p className="mt-3 text-text-2">{attempt.passed
            ? t("Avaliação aprovada · {n} pontos para esta empresa na temporada.", { n: attempt.points })
            : score >= MIN_SCORE
              ? t("Sua nota passou de {min}, mas {n} verificação(ões) obrigatória(s) não foram atendidas. Corrija e tente novamente.", { min: MIN_SCORE, n: failed.length })
              : t("A nota mínima para pontuar é {min}. Veja o diagnóstico abaixo e tente novamente.", { min: MIN_SCORE })}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-px border-t border-line bg-line text-sm sm:grid-cols-4">
        {[[t("Temporada"), attempt.season], [t("País"), attempt.country], [t("Empresa"), company || "—"], [t("Pontos"), String(attempt.points)]].map(([k, v]) => <div key={k} className="bg-surface px-5 py-3"><dt className="text-xs text-text-2">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>)}
      </dl>
    </section>
    <p className="mt-3 text-sm text-text-2">{attempt.revision ? t("Esta é a correção {n} da sua entrega. Os pontos usam sempre a versão mais recente: corrigir pode aumentar ou diminuir a nota.", { n: attempt.revision }) : t("Os pontos usam sempre a versão mais recente da sua entrega: corrigir pode aumentar ou diminuir a nota. Você pode corrigir quantas vezes quiser.")}</p>
    <div className="mt-5 flex flex-wrap gap-3">
      <button type="button" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90" onClick={onView}><Icon name="visibility" size={18} />{t("Ver solução entregue")}</button>
      <button type="button" className={btn} disabled={editBusy} onClick={onEdit}><Icon name="edit" size={18} />{t("Editar entrega")}</button>
      <a {...link("/perfil")} className={btn}><Icon name="person" size={18} />{t("Ver perfil")}</a>
    </div>

    <section className="mt-6 rounded-3xl border border-line bg-surface p-6 sm:p-8" aria-labelledby="share-h">
      <h2 id="share-h" className="text-xl font-semibold">{attempt.passed ? t("Compartilhe sua conquista") : t("Compartilhe seu desenho")}</h2>
      <p className="mt-1 text-sm text-text-2">{t("Escolha a imagem e edite a mensagem pronta antes de publicar.")}</p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("Imagem")}>{([["report", t("Relatório do desenho")], ["card", t("Cartão da nota")]] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={image === id} onClick={() => setImage(id)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${image === id ? "border-accent/40 bg-accent-soft text-accent" : "border-line text-text-2 hover:bg-track hover:text-text"}`}>{label}</button>)}</div>
      <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-text-2" htmlFor="share-msg">{t("Mensagem")}</label>
      <textarea id="share-msg" value={message} onChange={(e) => setDraft(e.target.value)} rows={9} className="mt-1 w-full resize-y rounded-2xl border border-line bg-track px-4 py-3 text-sm leading-relaxed text-text outline-none focus:border-accent" style={{ font: "inherit", fontSize: 14 }} />
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void shareLinkedIn()} className="inline-flex items-center gap-2 rounded-full bg-[#0a66c2] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"><Icon name="share" size={18} />{busy ? t("Gerando imagem…") : t("Compartilhar no LinkedIn")}</button>
        <button type="button" disabled={busy} onClick={() => void run(async () => download(await picture()))} className={btn}><Icon name="download" size={18} />{t("Baixar imagem")}</button>
        <button type="button" onClick={() => void copy().then((ok) => setNote(ok ? t("Texto copiado") : t("Não foi possível copiar")))} className={btn}><Icon name="content_copy" size={18} />{t("Copiar texto")}</button>
      </div>
      <p role="status" className="mt-3 min-h-5 text-sm text-text-2">{note}</p>
    </section>

    {attempt.report && <section className="mt-6 rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">{t("Diagnóstico da entrega")}</h2><RatingChip rating={attempt.report.rating} title={c?.title ?? ""} competitive={attempt.passed} assessment /></div>
      <p className="mt-2 text-sm text-text-2">{checks.length - failed.length} / {checks.length} {t("verificações atendidas")}</p>
      <ul className="mt-4 grid gap-3">{[...failed, ...checks.filter((ch) => ch.status === "meets")].map((ch) => { const ok = ch.status === "meets"; return <li key={ch.id} className={`flex gap-3 rounded-xl border p-3 ${ok ? "border-line" : "border-danger/40 bg-danger/5"}`}>
        <span className={ok ? "text-accent" : "text-danger"}><Icon name={ok ? "check_circle" : "cancel"} size={22} /></span>
        <div><b className="text-sm">{t(ch.label)}</b><p className="mt-1 text-sm text-text-2">{t(ch.detail)}</p></div></li>; })}</ul>
    </section>}

  </>;
}

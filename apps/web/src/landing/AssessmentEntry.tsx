import { lazy, Suspense, useEffect, useState } from "react";
import { authEnabled } from "../auth";
import { caseById } from "../cases";
import { getAssessmentAttempt, startAssessment, submitAssessment, abandonAssessment, type AssessmentAttempt } from "../assessments";
import { fetchProfile } from "../cloud";
import { go, link } from "../nav";
import { t } from "../i18n";
import { levelLocked } from "../plan";
import { CountrySelect } from "./CountrySelect";
import { useAssessmentProfile } from "./useAssessmentProfile";
import { ProfileDialog } from "./ProfileDialog";
import { RatingChip } from "../Rating";
import { leagueOf } from "../leagues";
import { LeagueBadge } from "../LeagueBadge";
const Lab = lazy(() => import("../App").then((m) => ({ default: m.App })));
const SolutionDialog = lazy(() => import("./SolutionDialog").then((m) => ({ default: m.SolutionDialog })));

export function AssessmentEntry({ caseId, attemptId }: { caseId?: string; attemptId?: string }) {
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(!!attemptId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<unknown | null>(null);
  const [view, setView] = useState(false);
  const { profile } = useAssessmentProfile();
  const c = caseById(caseId ?? attempt?.case_id ?? "");
  useEffect(() => { let alive = true; fetchProfile().then((p) => { if (alive && p?.country) setCountry(p.country); }); if (attemptId) getAssessmentAttempt(attemptId).then((a) => { if (alive) { setAttempt(a); setLoading(false); if (!a) setError(t("Avaliação não encontrada.")); } }).catch((e) => { if (alive) { setError(e.message); setLoading(false); } }); return () => { alive = false; }; }, [attemptId]);
  const begin = async () => {
    if (!c?.company || busy || !country) return;
    if (levelLocked(c.level)) { go("/planos"); return; }
    setBusy(true); setError("");
    try { const a = await startAssessment(c.id, country); go(`/avaliacao/tentativa/${a.id}`); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const deliver = async () => {
    if (!attempt || !confirm || busy) return; setBusy(true); setError("");
    try { setAttempt(await submitAssessment(attempt.id, confirm)); setConfirm(null); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  if (!authEnabled) return <main className="p-8 text-text-2">{t("Avaliações competitivas precisam de uma conta e do servidor configurado.")}</main>;
  if (loading) return <main className="p-8 text-text-2" role="status">{t("Carregando avaliação…")}</main>;
  if (attempt?.status === "active") return <>
    <Suspense fallback={<p className="p-8">{t("Carregando avaliação…")}</p>}><Lab key={attempt.id} assessment={attempt} onAssessmentSubmit={(snap) => { setError(""); setConfirm(snap); }} /></Suspense>
    {error && !confirm && <p role="alert" className="assessment-error">{error}</p>}
    {confirm && <ProfileDialog title={t("Entregar avaliação")} onClose={() => { setConfirm(null); }}><p className="text-text-2">{t("A entrega será registrada como uma versão definitiva. O servidor avaliará seu desenho na carga de pico do caso, sem considerar ajustes de tráfego dos testes.")}</p>{error && <p role="alert" className="mt-4 text-danger">{error}</p>}<button type="button" disabled={busy} onClick={() => void deliver()} className="mt-5 rounded-full bg-accent px-5 py-3 font-semibold text-on-accent disabled:opacity-50">{busy ? t("Avaliando…") : t("Confirmar entrega")}</button></ProfileDialog>}
  </>;
  const cls = "rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-track disabled:opacity-50";
  const active = profile?.active.find((a) => a.caseId === c?.id);
  return <main className="mx-auto max-w-3xl px-5 py-10 text-text">
    <a {...link("/start/estudo")} className="text-sm text-accent">← {t("Voltar aos casos")}</a>
    <h1 className="mt-5 text-3xl font-semibold">{attempt?.status === "submitted" ? t("Resultado da avaliação") : t("Avaliação sem dicas")}{c ? ` · ${c.title}` : ""}</h1>
    {error && <p role="alert" className="mt-5 rounded-xl border border-danger/40 p-4 text-danger">{error}</p>}
    {attempt?.status === "submitted" ? <>
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6"><div className="flex items-center gap-4">{attempt.passed && <LeagueBadge league={leagueOf(attempt.score!)} size={62} />}<div><b className="text-3xl tabular-nums">{attempt.score} / 100</b><p className="mt-1 text-text-2">{attempt.passed ? t("Avaliação aprovada · {n} pontos para esta empresa na temporada.", { n: attempt.points }) : t("Esta entrega não pontuou. Consulte o diagnóstico e tente novamente.")}</p></div></div><p className="mt-4 text-xs text-text-2">{attempt.season} · {attempt.country} · {attempt.rules_version} · {attempt.case_version}</p><p className="mt-3 text-sm text-text-2">{t("Os pontos gerais e da temporada usam somente seu melhor resultado por empresa, sem somar tentativas repetidas.")}</p></section>
      {attempt.report && <section className="mt-5 rounded-2xl border border-line bg-surface p-6"><h2 className="mb-4 text-xl font-semibold">{t("Diagnóstico da entrega")}</h2><RatingChip rating={attempt.report.rating} title={c?.title ?? ""} competitive={attempt.passed} assessment /><ul className="mt-5 grid gap-3">{attempt.report.checks.map((ch) => <li key={ch.id} className="rounded-xl border border-line p-3"><b className="text-sm">{ch.status === "meets" ? "✓ " : "✕ "}{t(ch.label)}</b><p className="mt-1 text-sm text-text-2">{t(ch.detail)}</p></li>)}</ul></section>}
      <div className="mt-6 flex flex-wrap gap-3"><button className={cls} onClick={() => setView(true)}>{t("Ver solução entregue")}</button><a {...link(`/avaliacao/${attempt.case_id}`)} className={cls}>{t("Nova avaliação")}</a><a {...link("/perfil")} className={cls}>{t("Ver perfil")}</a></div>
      {view && attempt.snap && <Suspense fallback={null}><SolutionDialog solution={{ caseId: attempt.case_id, title: c?.title ?? attempt.case_id, snap: attempt.snap, publishedAt: attempt.submitted_at ?? "" }} onClose={() => setView(false)} /></Suspense>}
    </> : c?.company && attempt?.status !== "abandoned" ? <>
      <p className="mt-4 text-text-2">{t("Resolva o caso em um quadro em branco, sem dicas, revisão automática ou referência. Simule e acompanhe métricas; a nota aparece somente após entregar.")}</p>
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6"><h2 className="font-semibold">{t("Regras da avaliação")}</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-2"><li>{t("Nota mínima 70 e todas as verificações automáticas atendidas para pontuar.")}</li><li>{t("Pontos iguais à nota, sem multiplicador de dificuldade. Apenas o melhor resultado por empresa conta.")}</li><li>{t("Trimestres civis no horário de São Paulo. A data da entrega define a temporada.")}</li><li>{t("O país é fixado na temporada após a primeira avaliação aprovada. O ranking inclui perfis públicos; publicar o desenho é uma escolha separada.")}</li><li>{t("Importação, colagem de outros desenhos, padrões prontos e assistência ficam indisponíveis. Organizar posições, desfazer e salvar a tentativa são permitidos.")}</li></ul><div className="mt-5"><CountrySelect value={country} onChange={setCountry} /></div></section>
      {active && <p className="mt-4 text-sm text-text-2">{t("Você tem uma tentativa em andamento. Continuar preserva o rascunho daquela avaliação.")}</p>}
      <div className="mt-5 flex flex-wrap gap-3"><button className={cls} disabled={!country || busy} onClick={() => void begin()}>{busy ? t("Aguarde…") : active ? t("Continuar avaliação") : t("Iniciar avaliação")}</button>{active && <button className={cls} disabled={busy} onClick={async () => { setBusy(true); try { await abandonAssessment(active.id); go(`/avaliacao/${c.id}?nova=${Date.now()}`); location.reload(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }}>{t("Descartar tentativa e começar do zero")}</button>}</div>
    </> : !error && <p className="mt-6 text-text-2">{t("Somente casos de empresas podem ser avaliados.")}</p>}
  </main>;
}

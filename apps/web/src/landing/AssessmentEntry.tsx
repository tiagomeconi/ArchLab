import { lazy, Suspense, useEffect, useState } from "react";
import "./landing.css";
import { authEnabled } from "../auth";
import { caseById } from "../cases";
import { getAssessmentAttempt, startAssessment, startAssessmentCorrection, cancelAssessmentCorrection, submitAssessment, abandonAssessment, type AssessmentAttempt } from "../assessments";
import { fetchProfile } from "../cloud";
import { go, link } from "../nav";
import { t } from "../i18n";
import { levelLocked } from "../plan";
import { CountrySelect } from "./CountrySelect";
import { useAssessmentProfile } from "./useAssessmentProfile";
import { ProfileDialog } from "./ProfileDialog";
import { AssessmentResult } from "./AssessmentResult";
import { useDeliveries } from "./AssessmentDeliveries";
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
  const deliveries = useDeliveries();
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
  /** Correção = a entrega já registrada reaberta para edição; o rascunho nasce da versão entregue. */
  const editing = attempt?.status === "active" || (attempt?.status === "submitted" && !!attempt.draft);
  const correcting = attempt?.status === "submitted" && editing;
  const startEdit = async () => {
    if (!attempt || busy) return; setBusy(true); setError("");
    try { setAttempt(await startAssessmentCorrection(attempt.id)); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const cancelEdit = async () => {
    if (!attempt || busy) return; setBusy(true); setError("");
    try { await cancelAssessmentCorrection(attempt.id); try { localStorage.removeItem(`archlab:assessment-draft:${attempt.id}`); } catch { /* ignora */ } setAttempt(await getAssessmentAttempt(attempt.id)); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  if (!authEnabled) return <main className="p-8 text-text-2">{t("Avaliações competitivas precisam de uma conta e do servidor configurado.")}</main>;
  if (loading) return <main className="p-8 text-text-2" role="status">{t("Carregando avaliação…")}</main>;
  if (attempt && editing) return <>
    <Suspense fallback={<p className="p-8">{t("Carregando avaliação…")}</p>}><Lab key={attempt.id} assessment={attempt} onAssessmentSubmit={(snap) => { setError(""); setConfirm(snap); }} onAssessmentCancel={correcting ? () => void cancelEdit() : undefined} /></Suspense>
    {error && !confirm && <p role="alert" className="assessment-error">{error}</p>}
    {confirm && <ProfileDialog title={correcting ? t("Entregar correção") : t("Entregar avaliação")} onClose={() => { setConfirm(null); }}><p className="text-text-2">{correcting ? t("A correção substitui a sua entrega atual. A nota pode subir ou cair, e a versão mais recente é a que vale. Você pode corrigir quantas vezes quiser.") : t("A entrega será registrada como uma versão definitiva. O servidor avaliará seu desenho na carga de pico do caso, sem considerar ajustes de tráfego dos testes.")} </p>{error && <p role="alert" className="mt-4 text-danger">{error}</p>}<button type="button" disabled={busy} onClick={() => void deliver()} className="mt-5 rounded-full bg-accent px-5 py-3 font-semibold text-on-accent disabled:opacity-50">{busy ? t("Avaliando…") : correcting ? t("Confirmar correção") : t("Confirmar entrega")}</button></ProfileDialog>}
  </>;
  const cls = "rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-track disabled:opacity-50";
  const existing = c ? deliveries.rows?.find((r) => r.caseId === c.id) : undefined;
  const active = profile?.active.find((a) => a.caseId === c?.id);
  return <main className="lp mx-auto max-w-3xl px-5 py-10 text-text">
    <a {...link("/start/estudo")} className="text-sm text-accent">← {t("Voltar aos casos")}</a>
    <h1 className="mt-5 text-3xl font-semibold">{attempt?.status === "submitted" ? t("Resultado da avaliação") : t("Avaliação sem dicas")}{c ? ` · ${c.title}` : ""}</h1>
    {error && <p role="alert" className="mt-5 rounded-xl border border-danger/40 p-4 text-danger">{error}</p>}
    {attempt?.status === "submitted" ? <>
      <AssessmentResult attempt={attempt} c={c} busy={busy} onView={() => setView(true)} onEdit={() => void startEdit()} />
      {view && attempt.snap && <Suspense fallback={null}><SolutionDialog solution={{ caseId: attempt.case_id, title: c?.title ?? attempt.case_id, snap: attempt.snap, publishedAt: attempt.submitted_at ?? "" }} onClose={() => setView(false)} /></Suspense>}
    </> : c?.company && attempt?.status !== "abandoned" ? <>
      <p className="mt-4 text-text-2">{t("Resolva o caso em um quadro em branco, sem dicas, revisão automática ou referência. Simule e acompanhe métricas; a nota aparece somente após entregar.")}</p>
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6"><h2 className="font-semibold">{t("Regras da avaliação")}</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-2"><li>{t("Nota mínima 70 e todas as verificações automáticas atendidas para pontuar.")}</li><li>{t("Pontos iguais à nota, sem multiplicador de dificuldade. Apenas a versão mais recente da entrega de cada empresa conta.")}</li><li>{t("Você faz a prova uma única vez por empresa. Depois, só corrige a mesma entrega, quantas vezes quiser; a nota pode subir ou cair.")}</li><li>{t("Trimestres civis no horário de São Paulo. A data da entrega define a temporada.")}</li><li>{t("O país é fixado na temporada após a primeira avaliação aprovada. O ranking inclui perfis públicos; publicar o desenho é uma escolha separada.")}</li><li>{t("Importação, colagem de outros desenhos, padrões prontos e assistência ficam indisponíveis. Organizar posições, desfazer e salvar a tentativa são permitidos.")}</li></ul>{!existing && <div className="mt-5"><CountrySelect value={country} onChange={setCountry} /></div>}</section>
      {existing ? <>
        <p className="mt-4 text-sm text-text-2">{t("Você já fez esta avaliação. Agora só dá para corrigir a sua entrega.")}</p>
        <div className="mt-5 flex flex-wrap gap-3"><a {...link(`/avaliacao/tentativa/${existing.id}`)} className={`${cls} !border-accent !bg-accent !text-on-accent`}>{t("Ver resultado e corrigir entrega")}</a></div>
      </> : <>
        {active && <p className="mt-4 text-sm text-text-2">{t("Você tem uma tentativa em andamento. Continuar preserva o rascunho daquela avaliação.")}</p>}
        <div className="mt-5 flex flex-wrap gap-3"><button className={cls} disabled={!country || busy || (deliveries.on && deliveries.rows === null)} onClick={() => void begin()}>{busy ? t("Aguarde…") : active ? t("Continuar avaliação") : t("Iniciar avaliação")}</button>{active && <button className={cls} disabled={busy} onClick={async () => { setBusy(true); try { await abandonAssessment(active.id); go(`/avaliacao/${c.id}?nova=${Date.now()}`); location.reload(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }}>{t("Descartar tentativa e começar do zero")}</button>}</div>
      </>}
    </> : !error && <p className="mt-6 text-text-2">{t("Somente casos de empresas podem ser avaliados.")}</p>}
  </main>;
}

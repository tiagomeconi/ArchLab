import { lazy, Suspense, useState } from "react";
import { caseById } from "../cases";
import { publishAssessment, type AssessmentProfile, type AssessmentRecord } from "../assessments";
import { leagueOf } from "../leagues";
import { LeagueBadge } from "../LeagueBadge";
import { t } from "../i18n";
import { link } from "../nav";
import { Icon } from "../ui";
import { DesignThumb } from "./DesignThumb";
import { countryName } from "./CountrySelect";
const SolutionDialog = lazy(() => import("./SolutionDialog").then((m) => ({ default: m.SolutionDialog })));
const btn = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-semibold hover:border-accent/40 hover:bg-accent-soft disabled:opacity-50";
export function AssessmentCards({ records, owner, reload }: { records: AssessmentRecord[]; owner: boolean; reload: () => void }) {
  const [view, setView] = useState<AssessmentRecord | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  return <>{error && <p role="alert" className="mb-4 text-sm text-danger">{error}</p>}<ul className="grid gap-4 sm:grid-cols-2">{records.map((r) => <li key={r.id}><article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-bg/30">
    {r.snap && <button type="button" aria-label={t("Ver solução de {caso}", { caso: caseById(r.caseId)?.title ?? r.caseId })} onClick={() => setView(r)} className="border-b border-line bg-bg/40 px-3"><DesignThumb snap={r.snap} w={480} h={150} /></button>}
    <div className="flex items-center gap-3 p-4"><LeagueBadge league={leagueOf(r.score)} size={36} label={false} /><div className="min-w-0 flex-1"><h3 className="font-semibold">{caseById(r.caseId)?.title ?? r.caseId}</h3><p className="text-xs text-text-2">{t(leagueOf(r.score).name)} · {r.season.replace("-Q", " · T")}</p></div><b className="tabular-nums">{r.score}</b></div>
    <p className="px-4 text-xs text-text-2">{t("Avaliação sem dicas")} · {r.points} {t("pontos")}</p>
    <div className="mt-auto grid gap-2 p-4">{r.snap ? <button className={`${btn} text-accent`} onClick={() => setView(r)}>{t("Ver solução entregue")}</button> : <p className="py-2 text-xs text-text-2">{t("O autor não publicou este desenho.")}</p>}
      {owner && <><a {...link(`/avaliacao/tentativa/${r.id}`)} className={btn}>{t("Ver diagnóstico")}</a><button className={btn} disabled={busy === r.id} onClick={async () => { setBusy(r.id); setError(""); try { if (!(await publishAssessment(r.id, !r.published))) throw new Error(); reload(); } catch { setError(t("Não foi possível atualizar a publicação da avaliação.")); } finally { setBusy(null); } }}><Icon name={r.published ? "public_off" : "public"} size={16} />{r.published ? t("Retirar do perfil público") : t("Publicar solução avaliada")}</button></>}
    </div>
  </article></li>)}</ul>
  {view?.snap && <Suspense fallback={null}><SolutionDialog solution={{ caseId: view.caseId, title: caseById(view.caseId)?.title ?? view.caseId, snap: view.snap, publishedAt: view.submittedAt }} onClose={() => setView(null)} /></Suspense>}
  </>;
}
export function AssessmentHistory({ profile, owner, reload }: { profile: AssessmentProfile | null; owner: boolean; reload: () => void }) {
  const [season, setSeason] = useState<string | null>(null);
  const seasons = profile?.seasons ?? [];
  return <><p className="mb-5 text-sm text-text-2">{t("Cada trimestre preserva pontos, posições mundial e nacional e as versões avaliadas. Pontos gerais somam os melhores resultados históricos por empresa.")}</p>
    {seasons.length ? <div className="grid gap-3">{seasons.map((s) => <button key={s.season} type="button" onClick={() => setSeason(s.season)} aria-pressed={season === s.season} className={`rounded-xl border p-4 text-left ${season === s.season ? "border-accent bg-accent-soft" : "border-line"}`}><div className="flex flex-wrap justify-between gap-2"><b>{s.season.replace("-Q", " · T")}</b><span className="text-xs text-text-2">{s.closed ? t("Encerrada") : t("Em andamento")}</span></div><p className="mt-2 text-sm">{s.points} {t("pontos")} · {t("{n} empresas", { n: s.companies })}</p><p className="mt-2 text-xs text-text-2">{t("Mundial")}: {s.worldRank ? `#${s.worldRank}` : "—"} · {countryName(s.country)}: {s.countryRank ? `#${s.countryRank}` : "—"}</p><span className="mt-3 inline-flex text-xs font-semibold text-accent">{t("Ver avaliações da temporada")}</span></button>)}</div> : <p className="text-sm text-text-2">{t("Nenhuma temporada de avaliação registrada ainda.")}</p>}
    {season && <section className="mt-6"><h3 className="mb-4 font-semibold">{t("Avaliações")} · {season.replace("-Q", " · T")}</h3><AssessmentCards records={profile!.deliveries.filter((r) => r.season === season)} owner={owner} reload={reload} /></section>}
  </>;
}

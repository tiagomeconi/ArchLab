import { useEffect, useState } from "react";
import { authEnabled, getClient, useAuth } from "../auth";
import { caseById } from "../cases";
import { link } from "../nav";
import { BrandMark, Icon } from "../ui";
import { localeOf, t, useLang } from "../i18n";
import { countryName } from "./CountrySelect";

export interface Delivery { id: string; caseId: string; score: number; points: number; passed: boolean; season: string; country: string; submittedAt: string }

/** Todas as entregas de avaliação da pessoa (aprovadas ou não). Leitura direta da própria tabela, protegida por RLS; sem desenho nem relatório. */
async function listDeliveries(): Promise<Delivery[]> {
  const { data, error } = await (await getClient()).from("assessment_attempts")
    .select("id,case_id,score,points,passed,season,country,submitted_at").eq("status", "submitted").order("submitted_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ id: r.id, caseId: r.case_id, score: r.score ?? 0, points: r.points ?? 0, passed: !!r.passed, season: r.season ?? "", country: r.country ?? "", submittedAt: r.submitted_at ?? "" }));
}

/** Carrega as entregas só para quem está logado; `rows` é null enquanto carrega. */
export function useDeliveries() {
  const auth = useAuth();
  const [rows, setRows] = useState<Delivery[] | null>(null);
  const [failed, setFailed] = useState(false);
  const on = authEnabled && auth.status === "in";
  useEffect(() => {
    if (!on) return;
    let alive = true;
    listDeliveries().then((r) => { if (alive) setRows(r); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [on, auth.user?.id]);
  return { on, rows, failed };
}

export function AssessmentDeliveries({ rows, failed }: { rows: Delivery[] | null; failed: boolean }) {
  const lang = useLang();
  const fmt = new Intl.DateTimeFormat(localeOf(lang), { day: "2-digit", month: "short", year: "numeric" });
  return (
    <section aria-label={t("Avaliações entregues")}>
      <p className="mt-2 max-w-2xl text-text-2">{t("Todas as suas entregas sem dicas, aprovadas ou não. Abra uma para ver o diagnóstico e o desenho entregue.")}</p>
      {failed ? <p role="alert" className="mt-5 text-danger">{t("Não foi possível carregar as entregas.")}</p> : rows === null ? <div className="mt-6 grid gap-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-3xl border border-line bg-surface" />)}</div> : !rows.length ? (
        <div className="mt-8 grid place-items-center rounded-3xl border border-dashed border-line px-6 py-14 text-center">
          <span aria-hidden className="grid size-14 place-items-center rounded-2xl bg-track text-text-2"><Icon name="verified" size={30} /></span>
          <h3 className="mt-4 text-xl font-semibold">{t("Nenhuma avaliação entregue ainda")}</h3>
          <p className="mt-1 max-w-md text-text-2">{t("Escolha um caso de empresa e entregue uma avaliação sem dicas. Ela aparece aqui, aprovada ou não.")}</p>
          <a {...link("/start/estudo")} className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent">{t("Escolher um caso")}<Icon name="arrow_forward" size={18} /></a>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3">
          {rows.map((d) => {
            const c = caseById(d.caseId);
            const when = d.submittedAt ? fmt.format(new Date(d.submittedAt)) : "";
            return (
              <li key={d.id}>
                <a {...link(`/avaliacao/tentativa/${d.id}`)} className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-3xl border border-line bg-surface px-5 py-4 transition-colors hover:border-accent">
                  <span className="flex min-w-0 flex-1 basis-48 items-center gap-3">
                    {c?.company ? <BrandMark id={c.company.logo} name={c.company.name} color={c.company.brand} height={26} /> : <span aria-hidden className="grid size-[26px] place-items-center rounded-lg bg-track"><Icon name="verified" size={16} /></span>}
                    <span className="min-w-0"><b className="block truncate font-semibold">{c ? t(c.title) : d.caseId}</b><small className="text-text-2">{[when, d.season, d.country && countryName(d.country, localeOf(lang))].filter(Boolean).join(" · ")}</small></span>
                  </span>
                  <span className="text-2xl font-semibold tabular-nums">{d.score}<small className="ml-1 text-sm font-normal text-text-2">/ 100</small></span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${d.passed ? "border-[var(--ok)] bg-[var(--ok-bg)] text-[var(--ok)]" : "border-line text-text-2"}`}>
                    <Icon name={d.passed ? "check_circle" : "flag"} size={16} />{d.passed ? t("Aprovada · {n} pontos", { n: d.points }) : t("Não aprovada")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">{t("Ver diagnóstico")}<Icon name="arrow_forward" size={16} /></span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

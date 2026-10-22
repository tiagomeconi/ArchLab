import { useEffect, useState } from "react";
import { avatarUrl, useAuth } from "../auth";
import { getAssessmentBoard, getAssessmentSeasons, seasonOf, type AssessmentLeader } from "../assessments";
import { useAssessmentProfile } from "./useAssessmentProfile";
import { Avatar } from "../AccountMenu";
import { link } from "../nav";
import { t } from "../i18n";
import { CountrySelect, countryName } from "./CountrySelect";
import { cn } from "./lib/utils";

export function Ranking() {
  const auth = useAuth();
  const { profile } = useAssessmentProfile();
  const [knownSeasons, setKnownSeasons] = useState<string[]>([]);
  useEffect(() => { let alive = true; getAssessmentSeasons().then((s) => { if (alive) setKnownSeasons(s); }).catch(() => {}); return () => { alive = false; }; }, []);
  const [season, setSeason] = useState(seasonOf());
  const [country, setCountry] = useState("");
  const [rows, setRows] = useState<AssessmentLeader[] | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => { let alive = true; setRows(null); setError(false); getAssessmentBoard(season,country).then((r) => { if (alive) setRows(r); }).catch(() => { if (alive) setError(true); }); return () => { alive = false; }; }, [season,country,revision]);
  const seasons = [...new Set([seasonOf(), ...knownSeasons, ...(profile?.seasons.map((s) => s.season) ?? [])])].sort().reverse();
  const mine = profile?.seasons.find((s) => s.season === season);
  const myPosition = mine ? (country ? mine.country === country ? mine.countryRank : null : mine.worldRank) : null;
  return <>
    <h1 className="text-3xl font-semibold">{t("Ranking de avaliações")}</h1><p className="mt-3 max-w-2xl text-text-2">{t("Pontos das melhores avaliações sem dicas de cada empresa no trimestre. Empates usam a quantidade de empresas; persistindo a igualdade, a posição é compartilhada.")}</p>
    <section aria-label={t("Filtros do ranking")} className="mt-6 grid gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">{t("Temporada")}<select aria-label={t("Temporada")} value={season} onChange={(e) => setSeason(e.target.value)} className="min-h-11 rounded-xl border border-line bg-surface px-3">{seasons.map((s) => <option key={s} value={s}>{s.replace("-Q", " · T")}</option>)}</select></label><CountrySelect all value={country} onChange={setCountry} /></section>
    <section aria-label={t("Sua posição")} className="mt-5 rounded-2xl border border-line bg-surface p-5"><h2 className="text-lg font-semibold">{country ? countryName(country) : t("Mundial")}{myPosition ? ` · #${myPosition}` : ""}</h2><p className="mt-2 text-sm text-text-2">{mine ? `${mine.points} ${t("pontos")} · ${t("{n} empresas", { n: mine.companies })}${mine.closed ? ` · ${t("Temporada encerrada")}` : ""}` : t("Entregue uma avaliação aprovada de empresa para pontuar nesta temporada.")}</p><p className="mt-2 text-xs text-text-2">{t("O ranking inclui perfis públicos. Seu resultado e seu desenho têm controles de visibilidade separados.")}</p><a {...link("/configuracoes#publico")} className="mt-3 inline-block text-sm font-semibold text-accent">{t("Configurar perfil público e país")}</a></section>
    {error ? <p role="alert" className="mt-6 text-text-2">{t("Não foi possível carregar o ranking.")} <button type="button" onClick={() => setRevision((v) => v+1)} className="text-accent">{t("Tentar novamente")}</button></p> : rows === null ? <p role="status" className="mt-6 text-text-2">{t("Carregando classificação…")}</p> : !rows.length ? <p className="mt-6 rounded-2xl border border-dashed border-line p-8 text-text-2">{t("Ainda não há avaliações públicas nesta classificação.")}</p> : <ol aria-label={t("Classificação")} className="mt-6 grid gap-3">{rows.map((r) => <li key={r.uid} aria-current={r.uid===auth.user?.id ? "true" : undefined} className={cn("flex items-center gap-3 rounded-2xl border p-4",r.uid===auth.user?.id ? "border-accent/50 bg-accent-soft" : "border-line bg-surface")}><b className="min-w-10 tabular-nums">#{country ? r.countryRank : r.worldRank}</b><Avatar name={r.name} src={avatarUrl(r.uid,r.avatarV)} size={38} /><div className="min-w-0 flex-1"><a {...link(`/u/${r.handle}`)} className="block truncate font-semibold hover:underline">{r.name || `@${r.handle}`}</a><p className="text-xs text-text-2">{countryName(r.country)} · {t("{n} empresas",{n:r.companies})}</p></div><span className="text-right"><b className="tabular-nums">{r.points}</b><small className="block text-xs text-text-2">{t("pontos")}</small></span></li>)}</ol>}
  </>;
}

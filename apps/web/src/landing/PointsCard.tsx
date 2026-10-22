import { Icon } from "../ui";
import { t } from "../i18n";
import type { AssessmentProfile } from "../assessments";
export function PointsCard({ profile, loading = false, error = false }: { profile: AssessmentProfile | null; loading?: boolean; error?: boolean }) {
  return <div><div className="flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"><Icon name="emoji_events" size={26} /></span><div><p className="text-sm text-text-2">{t("Pontos de avaliação")}</p><p className="text-3xl font-semibold tabular-nums">{loading || error ? "—" : (profile?.points ?? 0).toLocaleString()}</p></div></div><p className="mt-3 text-xs leading-relaxed text-text-2">{error ? t("Não foi possível carregar as avaliações.") : loading ? t("Carregando avaliações…") : t("{n} empresas avaliadas sem dicas. A prática não altera seus pontos.", { n: profile?.companies ?? 0 })}</p></div>;
}

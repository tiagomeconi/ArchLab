import type { AssessmentAttempt } from "./assessments";
import type { StudyCase } from "./cases";
import { CATEGORY_OF, ITEM_BY_TYPE } from "./catalog";
import { ICONS } from "./CanvasElements";
import { cleanGroups } from "./GroupNode";
import { sideOf } from "./ports";
import { providerOf } from "./providers";
import { t } from "./i18n";
import type { ReportInput } from "./report";

/** Relatório em imagem do desenho ENTREGUE (o do servidor não guarda carga por componente, então os nós aparecem sem barra de uso). */
export function deliveredReportInput(a: AssessmentAttempt, c?: StudyCase): ReportInput | null {
  if (!a.snap || !a.report) return null;
  const { snap, report } = a;
  const nodes = snap.n.map((n) => {
    const type = n.d.type ?? "backend"; const prov = providerOf(type, n.d.providerId);
    return { id: n.id, x: n.x, y: n.y, w: n.w ?? 240, h: 96, name: n.d.name || t(ITEM_BY_TYPE.get(type)?.label ?? type), type, icon: ICONS[type] ?? "dns", cat: CATEGORY_OF.get(type) ?? "compute",
      replicas: n.d.replicas ?? 1, providerId: n.d.providerId, providerName: prov?.name, health: "idle", status: t("Entregue"), hasLoad: false };
  });
  return {
    title: c?.title ?? a.case_id, summary: c?.summary, level: c?.level, mode: "study", logoId: c?.company?.logo, iconName: c?.icon,
    rating: report.rating, noLeague: a.passed ? undefined : t("Não aprovada"), met: report.checks.filter((x) => x.status === "meets").length, total: report.checks.length, nodes,
    groups: cleanGroups(snap.r).map((g) => ({ name: g.name, color: g.color, x: g.x, y: g.y, w: g.w, h: g.h })),
    edges: snap.e.map((e) => ({ source: e.source, target: e.target, protocol: String(e.configuration?.protocol ?? "https"), mode: String(e.configuration?.mode ?? "sync"),
      flow: 0, hot: false, unused: false, sp: sideOf(e.sourcePort, "source"), tp: sideOf(e.targetPort, "target"), both: !!e.configuration?.bidirectional })),
  };
}

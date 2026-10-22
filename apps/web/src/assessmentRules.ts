/** Published competition rules. Preserve released versions. */
export const ASSESSMENT_RULES = "assessment-v1";
export const ASSESSMENT_MIN_SCORE = 70;
export const ASSESSMENT_MAX_NODES = 80;
export function seasonOf(at: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "America/Sao_Paulo", year: "numeric", month: "numeric" }).formatToParts(at);
  return `${parts.find((p) => p.type === "year")!.value}-Q${Math.ceil(Number(parts.find((p) => p.type === "month")!.value) / 3)}`;
}

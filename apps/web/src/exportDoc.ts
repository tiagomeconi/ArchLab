import { t } from "./i18n";
import type { Finding } from "./lint";
import type { CostEstimate } from "./cost";

/** Exporta o desenho como diagrama Mermaid e como documento de design em Markdown (para README, wiki ou revisão de arquitetura). */
export interface DocNode { id: string; name: string; type: string; replicas: number; provider?: string; note?: string }
export interface DocEdge { source: string; target: string; protocol: string; mode: string; bidirectional?: boolean }
export interface DocGroup { name: string; nodeIds: string[] }

const mid = (id: string) => `n_${id.replace(/[^a-zA-Z0-9]/g, "_")}`;
const lbl = (s: string) => s.replace(/"/g, "'").replace(/[\r\n]+/g, " ").replace(/[<>]/g, "");

export function toMermaid(nodes: DocNode[], edges: DocEdge[], groups: DocGroup[] = []): string {
  const out = ["flowchart LR"];
  const placed = new Set<string>();
  groups.forEach((g, i) => {
    const members = g.nodeIds.filter((id) => nodes.some((n) => n.id === id) && !placed.has(id));
    if (!members.length) return;
    out.push(`  subgraph g${i}["${lbl(g.name)}"]`);
    for (const id of members) { const n = nodes.find((x) => x.id === id)!; out.push(`    ${mid(id)}["${lbl(n.name)}${n.replicas > 1 ? ` ×${n.replicas}` : ""}"]`); placed.add(id); }
    out.push("  end");
  });
  for (const n of nodes) if (!placed.has(n.id)) out.push(`  ${mid(n.id)}["${lbl(n.name)}${n.replicas > 1 ? ` ×${n.replicas}` : ""}"]`);
  for (const e of edges) {
    const label = `${lbl(e.protocol)}${e.mode === "async" ? " async" : ""}`;
    const arrow = e.bidirectional ? (e.mode === "async" ? "<-.->" : "<-->") : e.mode === "async" ? "-.->" : "-->";
    out.push(`  ${mid(e.source)} ${arrow}|"${label}"| ${mid(e.target)}`);
  }
  return out.join("\n");
}

export interface DocInput {
  title: string; summary?: string; nodes: DocNode[]; edges: DocEdge[]; groups: DocGroup[]; findings: Finding[]; cost: CostEstimate; notes?: string;
  requirements?: { functional: string[]; nonFunctional: string[] };
}
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");

export function toDesignDoc(d: DocInput): string {
  const nameOf = (id: string) => d.nodes.find((n) => n.id === id)?.name ?? id;
  const L: string[] = [`# ${d.title}`, ""];
  if (d.summary) L.push(d.summary, "");
  if (d.requirements && (d.requirements.functional.length || d.requirements.nonFunctional.length)) {
    L.push(`## ${t("Requisitos")}`, "");
    if (d.requirements.functional.length) L.push(`**${t("Funcionais")}**`, "", ...d.requirements.functional.map((x) => `- ${x}`), "");
    if (d.requirements.nonFunctional.length) L.push(`**${t("Não funcionais")}**`, "", ...d.requirements.nonFunctional.map((x) => `- ${x}`), "");
  }
  L.push(`## ${t("Diagrama")}`, "", "```mermaid", toMermaid(d.nodes, d.edges, d.groups), "```", "");
  L.push(`## ${t("Componentes")}`, "", `| ${t("Componente")} | ${t("Tipo")} | ${t("Réplicas")} | ${t("Provedor")} |`, "| --- | --- | ---: | --- |",
    ...d.nodes.map((n) => `| ${cell(n.name)} | ${n.type} | ${n.replicas} | ${cell(n.provider ?? "—")} |`), "");
  if (d.groups.length) L.push(`## ${t("Grupos")}`, "", ...d.groups.map((g) => `- **${g.name}**: ${g.nodeIds.map(nameOf).join(", ") || "—"}`), "");
  L.push(`## ${t("Comunicação")}`, "", `| ${t("De")} | ${t("Para")} | ${t("Protocolo")} | ${t("Modo")} |`, "| --- | --- | --- | --- |",
    ...d.edges.map((e) => `| ${cell(nameOf(e.source))} | ${cell(nameOf(e.target))} | ${e.protocol}${e.bidirectional ? " ↔" : ""} | ${e.mode} |`), "");
  const withNotes = d.nodes.filter((n) => n.note?.trim());
  if (withNotes.length) L.push(`## ${t("Decisões e observações")}`, "", ...withNotes.flatMap((n) => [`### ${n.name}`, "", n.note!.trim(), ""]));
  if (d.notes?.trim()) L.push(`## ${t("Anotações gerais")}`, "", d.notes.trim(), "");
  L.push(`## ${t("Riscos identificados")}`, "");
  L.push(...(d.findings.length ? d.findings.map((f) => `- **${f.title}**. ${f.why} ${t("Correção sugerida:")} ${f.fix}`) : [t("A revisão automática não encontrou falhas clássicas.")]), "");
  if (d.cost.total > 0) L.push(`## ${t("Custo estimado")}`, "", `${d.cost.total} ${t("créditos/mês")} (${t("créditos fictícios de ensino")}).`, "", ...d.cost.lines.slice(0, 5).map((l) => `- ${l.name}${l.replicas > 1 ? ` ×${l.replicas}` : ""}: ${l.credits}`), "");
  L.push("---", `_${t("Gerado pelo ArchLab")}_`, "");
  return L.join("\n");
}

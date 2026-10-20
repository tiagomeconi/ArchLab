import { NodeResizer, type Node, type NodeProps } from "@xyflow/react";
import { Icon } from "./ui";
import { t } from "./i18n";

/** Grupo: moldura nomeada ao redor de blocos (cluster, VPC, região…). É só organização visual; não entra na simulação. */
export const GROUP_COLORS = ["sky", "green", "amber", "rose", "violet", "slate"] as const;
const COLOR_LABEL: Record<string, string> = { sky: "Azul", green: "Verde", amber: "Âmbar", rose: "Rosa", violet: "Violeta", slate: "Cinza" };
export interface GroupDoc { id: string; name: string; color: string; x: number; y: number; w: number; h: number }
export interface GroupData extends Record<string, unknown> {
  name: string; color: string;
  onRename: (id: string, name: string) => void; onColor: (id: string, color: string) => void; onDelete: (id: string) => void;
}
export const GROUP_MIN = { w: 200, h: 140 };

/** Valida grupos vindos de desenho salvo, link compartilhado ou arquivo: nada de fora entra sem checagem. */
export function cleanGroups(raw: unknown): GroupDoc[] {
  if (!Array.isArray(raw)) return [];
  const out: GroupDoc[] = []; const seen = new Set<string>();
  for (const g of raw.slice(0, 40)) {
    if (!g || typeof g !== "object") continue;
    const { id, name, color, x, y, w, h } = g as Record<string, unknown>;
    if (typeof id !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,60}$/.test(id) || seen.has(id)) continue;
    if (![x, y, w, h].every((v) => typeof v === "number" && Number.isFinite(v))) continue;
    seen.add(id);
    out.push({
      id, name: typeof name === "string" && name.trim() ? name.trim().slice(0, 60) : "Grupo",
      color: (GROUP_COLORS as readonly string[]).includes(String(color)) ? String(color) : "sky",
      x: x as number, y: y as number, w: Math.max(GROUP_MIN.w, Math.min(4000, w as number)), h: Math.max(GROUP_MIN.h, Math.min(4000, h as number)),
    });
  }
  return out;
}

export function GroupNode({ id, data, selected }: NodeProps<Node<GroupData>>) {
  return (
    <div className={`grp c-${data.color}${selected ? " sel" : ""}`}>
      <NodeResizer isVisible={selected} minWidth={GROUP_MIN.w} minHeight={GROUP_MIN.h} lineClassName="grp-line" handleClassName="grp-grip" />
      <div className="group-head">
        <Icon name="workspaces" size={15} />
        <input key={data.name} className="group-name nodrag" defaultValue={data.name} maxLength={60} aria-label={t("Nome do grupo")} spellCheck={false}
          onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== data.name) data.onRename(id, v); else e.target.value = data.name; }}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); e.stopPropagation(); }} />
        {selected && (
          <span className="group-tools nodrag">
            {GROUP_COLORS.map((c) => (
              <button key={c} type="button" className={`sw c-${c}${c === data.color ? " on" : ""}`} aria-label={t(COLOR_LABEL[c]!)} aria-pressed={c === data.color} title={t(COLOR_LABEL[c]!)} onClick={() => data.onColor(id, c)} />
            ))}
            <button type="button" className="del" aria-label={t("Remover grupo (os blocos ficam)")} title={t("Remover grupo (os blocos ficam)")} onClick={() => data.onDelete(id)}><Icon name="close" size={14} /></button>
          </span>
        )}
      </div>
    </div>
  );
}

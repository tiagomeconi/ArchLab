import { PALETTE } from "./catalog";
import type { Session } from "./session";

/** Dica progressiva para uma verificação que falhou: 1º a família do componente, 2º os componentes da paleta que resolvem. */
export interface Hint { groups: string[]; items: { type: string; label: string }[] }

const GROUP_OF = new Map(PALETTE.flatMap((g) => g.items.map((i) => [i.type, g.title] as const)));
const LABEL_OF = new Map(PALETTE.flatMap((g) => g.items.map((i) => [i.type, i.label] as const)));

const fromTypes = (types: string[]): Hint | null => {
  const known = [...new Set(types)].filter((ty) => LABEL_OF.has(ty));
  if (!known.length) return null;
  return { groups: [...new Set(known.map((ty) => GROUP_OF.get(ty)!))], items: known.map((type) => ({ type, label: LABEL_OF.get(type)! })) };
};

/** `checkId` é o id de uma verificação (`need:<rótulo>` ou `path:<rótulo>`); devolve `null` quando não há dica útil. */
export function hintFor(session: Session, checkId: string): Hint | null {
  if (checkId.startsWith("need:")) {
    const need = session.checks?.needs.find((n) => `need:${n.label}` === checkId);
    return need ? fromTypes(need.any) : null;
  }
  if (checkId.startsWith("path:")) {
    const rule = session.checks?.paths?.find((p) => `path:${p.label}` === checkId);
    return rule ? fromTypes(rule.seq.flat()) : null;
  }
  if (checkId === "hit") return fromTypes(["redis"]);
  return null;
}

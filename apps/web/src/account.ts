/** Regras de cadastro (senha, nome, nascimento). Funções puras, testadas no vitest. */
export const PASSWORD_RULES: { id: string; label: string; ok: (p: string) => boolean }[] = [
  { id: "len", label: "Pelo menos 8 caracteres", ok: (p) => p.length >= 8 },
  { id: "upper", label: "Uma letra maiúscula", ok: (p) => /\p{Lu}/u.test(p) },
  { id: "lower", label: "Uma letra minúscula", ok: (p) => /\p{Ll}/u.test(p) },
  { id: "digit", label: "Um número", ok: (p) => /\d/.test(p) },
  { id: "symbol", label: "Um símbolo especial (ex.: ! @ # $ %)", ok: (p) => /[^\p{L}\p{N}\s]/u.test(p) },
];
export const PASSWORD_MAX = 72;
export const passwordOk = (p: string) => p.length <= PASSWORD_MAX && PASSWORD_RULES.every((r) => r.ok(p));

export const MIN_AGE = 13;
export const fullNameOk = (n: string) => { const s = n.trim(); return s.length <= 120 && s.split(/\s+/).filter((w) => w.length >= 2).length >= 2; };

/** `YYYY-MM-DD` → texto do erro (chave de tradução) ou `null` se a data for válida e a idade for permitida. */
export function birthError(s: string, today = new Date()): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "Informe sua data de nascimento";
  const [y, m, d] = s.split("-").map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d || y < 1900) return "Data de nascimento inválida";
  const ty = today.getFullYear(), tm = today.getMonth() + 1, td = today.getDate();
  if (y > ty || (y === ty && (m > tm || (m === tm && d > td)))) return "Data de nascimento inválida";
  const age = ty - y - (tm < m || (tm === m && td < d) ? 1 : 0);
  return age < MIN_AGE ? "É preciso ter pelo menos 13 anos para criar uma conta" : null;
}

export const initials = (name: string, email = "") => {
  const w = name.trim().split(/\s+/).filter(Boolean);
  const s = w.length >= 2 ? w[0]![0]! + w[w.length - 1]![0]! : (w[0] ?? email).slice(0, 2);
  return s.toUpperCase();
};

/** @usuário do perfil público: 3 a 20 letras minúsculas, números ou _ (a mesma regra do banco). */
export const RESERVED_HANDLES = ["admin", "api", "app", "login", "cadastro", "start", "perfil", "desenhos", "u", "www", "archlab", "suporte", "support", "root", "null", "undefined"];
export const sanitizeHandle = (v: string) => v.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
export function handleError(h: string): string | null {
  if (!/^[a-z0-9_]{3,20}$/.test(h)) return "Use de 3 a 20 letras minúsculas, números ou _";
  if (RESERVED_HANDLES.includes(h)) return "Esse nome é reservado. Escolha outro.";
  return null;
}

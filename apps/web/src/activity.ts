/** Dias em que a pessoa praticou (um por data local) e a sequência de dias seguidos. Funções puras + armazenamento local. */
const KEY = "archlab:activity";
const pad = (n: number) => String(n).padStart(2, "0");
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k: string) => { const [y, m, d] = k.split("-").map(Number) as [number, number, number]; return new Date(y, m - 1, d); };
const shift = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const VALID = /^\d{4}-\d{2}-\d{2}$/;

export function loadDays(): string[] {
  try { const r = JSON.parse(localStorage.getItem(KEY) ?? "[]"); return Array.isArray(r) ? r.filter((x) => typeof x === "string" && VALID.test(x)) : []; } catch { return []; }
}
export function saveDays(days: Iterable<string>) {
  try { localStorage.setItem(KEY, JSON.stringify([...new Set(days)].filter((x) => VALID.test(x)).sort().slice(-400))); } catch { /* armazenamento bloqueado */ }
}
let hook: ((day: string) => void) | null = null;
/** A nuvem é avisada quando um dia novo é registrado. */
export const onDayRecorded = (f: (day: string) => void) => { hook = f; };
/** Marca hoje como dia praticado. Devolve `true` só na primeira vez do dia. */
export function recordToday(now = new Date()): boolean {
  const k = dayKey(now); const s = new Set(loadDays());
  if (s.has(k)) return false;
  s.add(k); saveDays(s); hook?.(k); return true;
}

/** Sequência atual (conta se hoje ou ontem foi praticado, para não zerar antes de o dia acabar) e a melhor de todas. */
export function streakOf(days: Iterable<string>, today = new Date()) {
  const set = new Set([...days].filter((d) => VALID.test(d)));
  const practicedToday = set.has(dayKey(today));
  let current = 0;
  for (let d = practicedToday ? today : shift(today, -1); set.has(dayKey(d)); d = shift(d, -1)) current++;
  let best = 0, run = 0, prev: Date | null = null;
  for (const k of [...set].sort()) {
    const d = parseKey(k);
    run = prev && dayKey(shift(prev, 1)) === k ? run + 1 : 1;
    best = Math.max(best, run); prev = d;
  }
  return { current, best, practicedToday, total: set.size };
}

/** Os últimos 7 dias (do mais antigo ao de hoje), para a fileirinha de bolinhas. */
export function weekStrip(days: Iterable<string>, today = new Date()) {
  const set = new Set(days);
  return Array.from({ length: 7 }, (_, i) => { const d = shift(today, i - 6); return { key: dayKey(d), weekday: d.getDay(), on: set.has(dayKey(d)), today: i === 6 }; });
}

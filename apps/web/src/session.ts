/** Sessão de trabalho escolhida na tela inicial: modo estudo (caso de entrevista) ou modo livre (com requisitos opcionais). */
export interface Requirements {
  functional: string[];
  nonFunctional: string[];
  /** Estimativas de escala, em texto livre (ex.: "50 milhões de usuários ativos"). */
  scale: { users: string; rps: string; readWrite: string; storage: string };
  /** Metas de qualidade, em texto livre (ex.: "p95 < 200 ms"). */
  targets: { latency: string; availability: string; consistency: string };
  constraints: string;
}
/** Carga do caso: pico de requisições por segundo e % de leituras que o laboratório usa como ponto de partida. */
export interface Load { peakRps: number; readPct: number }
export const DEFAULT_LOAD: Load = { peakRps: 5000, readPct: 99 };
/** Verificação automática de arquitetura: o desenho precisa ter ao menos um componente de um dos tipos listados. */
export interface Need { label: string; any: string[]; why: string }
/** Regra de caminho: algum fluxo precisa passar, nesta ordem, por componentes dos tipos indicados (cada posição aceita alternativas). */
export interface PathRule { label: string; seq: string[][]; why: string; /** classe da operação no último passo */ op?: "read" | "write" }
/** `chaos`: ids do modo caos que mais interessam ao caso (sugeridos no diálogo). */
export interface Checks { p95Ms?: number; needs: Need[]; chaos?: string[]; paths?: PathRule[]; /** exige taxa de acerto mínima no cache (0–1) */ minHitRate?: number }
export interface Session { mode: "study" | "free"; title: string; caseId?: string; summary?: string; requirements: Requirements; load?: Load; checks?: Checks }

export const emptyRequirements = (): Requirements => ({
  functional: [], nonFunctional: [],
  scale: { users: "", rps: "", readWrite: "", storage: "" },
  targets: { latency: "", availability: "", consistency: "" },
  constraints: "",
});

const KEY = "archlab:session";
export function saveSession(s: Session) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* armazenamento bloqueado */ } }
export function loadSession(): Session | null { try { const r = localStorage.getItem(KEY); return r ? (JSON.parse(r) as Session) : null; } catch { return null; } }
export function clearSession() { try { localStorage.removeItem(KEY); } catch { /* ignora */ } }

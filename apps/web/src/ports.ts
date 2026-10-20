/** Lados do bloco onde uma conexão pode encostar. O desenho guarda o lado em `sourcePort`/`targetPort` de cada conexão. */
export type Side = "top" | "right" | "bottom" | "left";
export const SIDES: Side[] = ["top", "right", "bottom", "left"];
const isSide = (v: unknown): v is Side => typeof v === "string" && (SIDES as string[]).includes(v);
/** Lado de uma ponta da conexão. Desenhos antigos guardam "out"/"in": saída pela direita, entrada pela esquerda. */
export const sideOf = (port: unknown, end: "source" | "target"): Side => (isSide(port) ? port : end === "source" ? "right" : "left");
/** Lado vindo do React Flow (id do handle) ou o padrão da ponta. */
export const portFromHandle = (handle: string | null | undefined, end: "source" | "target"): Side => sideOf(handle, end);

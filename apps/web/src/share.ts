/** Compartilhar um desenho por link: o desenho vai comprimido no fragmento da URL (`#d=…`), sem servidor. */
export interface SharePayload { v: 1; title: string; caseId?: string; snap: unknown }

const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Response(new Blob([data as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

export const canShare = () => typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";

export async function encodeShare(p: SharePayload): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify(p));
  return b64(await pipe(raw, new CompressionStream("deflate-raw")));
}

/** Lê `#d=…` e valida o formato; qualquer coisa fora do esperado vira `null` (nunca lança). */
export async function decodeShare(hash: string): Promise<SharePayload | null> {
  try {
    const m = /[#&]d=([A-Za-z0-9_-]+)/.exec(hash); if (!m) return null;
    const json = new TextDecoder().decode(await pipe(unb64(m[1]!), new DecompressionStream("deflate-raw")));
    const p = JSON.parse(json);
    const s = p?.snap;
    if (p?.v !== 1 || typeof p.title !== "string" || !s || !Array.isArray(s.n) || !Array.isArray(s.e) || !Array.isArray(s.f) || !Array.isArray(s.w) || typeof s.m !== "object") return null;
    return { v: 1, title: p.title.slice(0, 80), caseId: typeof p.caseId === "string" ? p.caseId : undefined, snap: s };
  } catch { return null; }
}

export async function shareUrl(p: SharePayload): Promise<string> {
  return `${location.origin}/app?blank=1&shared=1#d=${await encodeShare(p)}`;
}

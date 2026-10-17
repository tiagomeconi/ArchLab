import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(new URL(`../../../${p}`, import.meta.url), "utf8");
const csp = (JSON.parse(read("vercel.json")).headers[0].headers as { key: string; value: string }[]).find((h) => h.key === "Content-Security-Policy")!.value;

describe("cabeçalhos de segurança", () => {
  it("o hash do script inline do tema bate com o index.html (senão a CSP bloqueia o tema)", () => {
    const m = /<script>([\s\S]*?)<\/script>/.exec(read("apps/web/index.html"));
    expect(m).not.toBeNull();
    expect(csp).toContain(`'sha256-${createHash("sha256").update(m![1]!).digest("base64")}'`);
  });
  it("CSP restritiva: sem unsafe-eval, sem script inline livre, sem objetos nem frames", () => {
    expect(csp).not.toContain("unsafe-eval");
    expect(/script-src[^;]*unsafe-inline/.test(csp)).toBe(false);
    expect(csp).toContain("object-src 'none'"); expect(csp).toContain("frame-ancestors 'none'"); expect(csp).toContain("connect-src 'self'");
  });
  it("Netlify repete a mesma CSP da Vercel", () => { expect(read("netlify.toml")).toContain(csp); });
});

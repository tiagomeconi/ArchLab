import { beforeEach, describe, expect, it } from "vitest";
import { deleteVersion, loadVersions, saveVersion } from "../../../apps/web/src/versions";

const mem = new Map<string, string>();
beforeEach(() => {
  mem.clear();
  (globalThis as any).localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
});

describe("versões do desenho", () => {
  it("salva a mais nova primeiro, com nome padrão quando vazio", () => {
    saveVersion("d1", "antes do cache", "{a}", 1000); const l = saveVersion("d1", "  ", "{b}", 2000)!;
    expect(l.map((v) => v.name)).toEqual(["Versão", "antes do cache"]);
    expect(loadVersions("d1")).toHaveLength(2); expect(loadVersions("outro")).toEqual([]);
  });
  it("guarda no máximo 20 e recusa desenhos gigantes", () => {
    for (let i = 0; i < 25; i++) saveVersion("d1", `v${i}`, "{}", i);
    expect(loadVersions("d1")).toHaveLength(20); expect(loadVersions("d1")[0]!.name).toBe("v24");
    expect(saveVersion("d1", "grande", "x".repeat(1_600_000))).toBeNull();
  });
  it("apaga uma versão e ignora lixo no armazenamento", () => {
    const l = saveVersion("d1", "a", "{}", 1)!; expect(deleteVersion("d1", l[0]!.id)).toEqual([]);
    mem.set("archlab:versions:d2", JSON.stringify([{ id: 1 }, null, "x", { id: "ok", name: "n", at: 1, snap: "{}" }]));
    expect(loadVersions("d2").map((v) => v.id)).toEqual(["ok"]);
    mem.set("archlab:versions:d3", "não é json"); expect(loadVersions("d3")).toEqual([]);
  });
});

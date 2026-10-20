import { describe, expect, it } from "vitest";
import { portFromHandle, sideOf, SIDES } from "../../../apps/web/src/ports";

describe("lados das conexões", () => {
  it("desenhos antigos (out/in) viram saída pela direita e entrada pela esquerda", () => {
    expect(sideOf("out", "source")).toBe("right");
    expect(sideOf("in", "target")).toBe("left");
    expect(sideOf(undefined, "source")).toBe("right");
  });
  it("aceita os quatro lados e ignora valores inválidos", () => {
    for (const s of SIDES) { expect(sideOf(s, "source")).toBe(s); expect(portFromHandle(s, "target")).toBe(s); }
    expect(sideOf("diagonal", "target")).toBe("left");
    expect(portFromHandle(null, "source")).toBe("right");
  });
  it("os lados cabem no padrão de porta do schema", () => {
    for (const s of SIDES) expect(/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$/.test(s)).toBe(true);
  });
});

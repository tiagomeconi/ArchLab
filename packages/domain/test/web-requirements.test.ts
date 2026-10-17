import { describe, expect, it } from "vitest";
import { evaluate } from "../../../apps/web/src/requirements";

const session: any = { checks: { p95Ms: 100, needs: [] } };
const design = (extra: any) => ({ nodes: [], flows: [], loads: new Map(), p95Ms: 20, ...extra });
const p95 = (extra: any) => evaluate(session, design(extra)).find((c) => c.id === "p95")!;

describe("AC-19: latência baixa de quem sobrevive não aprova com muita falha", () => {
  it("90% de erro e p95 baixo reprova", () => expect(p95({ readSuccess: 0.1 }).status).toBe("fails"));
  it("sucesso alto e p95 dentro da meta aprova", () => expect(p95({ readSuccess: 1 }).status).toBe("meets"));
  it("p95 acima da meta reprova mesmo sem erro", () => expect(p95({ p95Ms: 300, readSuccess: 1 }).status).toBe("fails"));
  it("sem dado de sucesso, mantém o comportamento anterior", () => expect(p95({}).status).toBe("meets"));
});

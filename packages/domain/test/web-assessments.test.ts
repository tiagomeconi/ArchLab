import { describe, expect, it } from "vitest";
import { evaluateAssessment, COMPANY_CONFIGS } from "../../../apps/web/src/assessmentEvaluator";
import { buildReference } from "../../../apps/web/src/reference";
import { seasonOf } from "../../../apps/web/src/assessmentRules";
describe("avaliações competitivas", () => {
  it.each(Object.keys(COMPANY_CONFIGS))("%s: avalia no pico oficial e preserva versões", (id) => {
    const c = COMPANY_CONFIGS[id]!;
    const snap = buildReference(c.session.checks!, c.session.load!);
    const result = evaluateAssessment(id,snap);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.passed, result.checks.filter((ch) => ch.status !== "meets").map((ch) => ch.id).join(",")).toBe(true);
    expect(result.points).toBe(result.score);
    expect(result.caseVersion).toBe(c.version);
    expect(result.snap.n.map((n) => n.id)).toEqual(snap.n.map((n) => n.id));
  });
  it("rejeita casos clássicos e ignora nota, fluxo e carga declarados pelo navegador", () => {
    expect(() => evaluateAssessment("url-shortener",{})).toThrow();
    const c = COMPANY_CONFIGS.netflix!;
    const s = buildReference(c.session.checks!,c.session.load!);
    expect(evaluateAssessment("netflix",{ ...s,score:100,points:999999,f:[],w:[],m:{},load:{peakRps:1} }).score).toBe(evaluateAssessment("netflix",s).score);
  });
  it("não concede pontos a uma arquitetura sem redundância", () => {
    const c = COMPANY_CONFIGS.netflix!;const s = buildReference(c.session.checks!,c.session.load!);
    s.n.forEach((n) => n.d.replicas=1);
    const result=evaluateAssessment("netflix",s);expect(result.passed).toBe(false);expect(result.points).toBe(0);
  });
  it("rejeita números não finitos, IDs repetidos e protocolos falsos", () => {
    const c=COMPANY_CONFIGS.netflix!;const s=buildReference(c.session.checks!,c.session.load!);
    const invalid=structuredClone(s);invalid.n[0]!.d.replicas=Infinity;
    expect(() => evaluateAssessment("netflix",invalid)).toThrow();
    expect(() => evaluateAssessment("netflix",{...s,n:[...s.n,s.n[0]]})).toThrow();
    const other=structuredClone(s);other.e[0].configuration.protocol="magic";
    expect(() => evaluateAssessment("netflix",other)).toThrow();
  });
  it("usa o trimestre de São Paulo na virada do UTC", () => {
    expect(seasonOf(new Date("2027-04-01T02:59:59Z"))).toBe("2027-Q1");
    expect(seasonOf(new Date("2027-04-01T03:00:00Z"))).toBe("2027-Q2");
  });
  it("limita o trabalho de derivação em grafos com muitos caminhos", () => {
    const node=(id:string,type="backend")=>({id,x:0,y:0,d:{type,replicas:2}});
    const n=[node("root","client")];const e:any[]=[];let previous=["root"];
    for(let layer=0;layer<14;layer++) {
      const next=[`a${layer}`,`b${layer}`];n.push(...next.map(id=>node(id)));
      for(const source of previous) for(const target of next) e.push({id:`${source}-${target}`,source,target,configuration:{protocol:"https",mode:"sync"}});
      previous=next;
    }
    expect(()=>evaluateAssessment("netflix",{n,e})).toThrow("limite de caminhos");
  });
});

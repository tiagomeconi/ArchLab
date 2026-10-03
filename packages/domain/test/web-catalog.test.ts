import { describe, expect, it } from "vitest";
import { connectionOptions, DEFAULT_PROFILE_BY_TYPE, PROFILES } from "../src";
import { PALETTE } from "../../../apps/web/src/catalog";
import { PROVIDERS, FALLBACK_ICON } from "../../../apps/web/src/providers";
import { PROTO } from "../../../apps/web/src/protocols";
import { LOGOS } from "../../../apps/web/src/logos.generated";
import { EN } from "../../../apps/web/src/i18n/en";

const items = PALETTE.flatMap((g) => g.items);
const types = items.map((i) => i.type);
const ALL_OPTIONS = types.flatMap((s) => types.flatMap((d) => connectionOptions(s, d).map((o) => ({ s, d, o }))));

describe("catálogo de componentes", () => {
  it("todo componente da paleta tem perfil de capacidade (exceto o banco abstrato) e perfil existente", () => {
    for (const i of items) {
      const id = DEFAULT_PROFILE_BY_TYPE[i.type];
      if (i.type === "database") { expect(id).toBeNull(); continue; }
      expect(id, i.type).toBeTruthy();
      expect(PROFILES[id!], `${i.type} → ${id}`).toBeDefined();
    }
  });
  it("todo tipo com perfil padrão aparece na paleta", () => {
    for (const t of Object.keys(DEFAULT_PROFILE_BY_TYPE)) expect(types, t).toContain(t);
  });
  it("não há tipos duplicados na paleta", () => { expect(new Set(types).size).toBe(types.length); });
  it("origens de carga usam perfil source e os demais não", () => {
    for (const i of items) expect(!!PROFILES[DEFAULT_PROFILE_BY_TYPE[i.type] ?? ""]?.source, i.type).toBe(PALETTE[0]!.items.includes(i));
  });
  it("cada componente tem pelo menos um provedor, e todo provedor tem logo ou cor de marca", () => {
    for (const i of items) {
      if (i.type === "database") continue;
      expect(PROVIDERS[i.type]?.length ?? 0, `${i.type} sem provedores`).toBeGreaterThan(0);
    }
    for (const [type, list] of Object.entries(PROVIDERS)) {
      expect(types, `provedores de tipo desconhecido ${type}`).toContain(type);
      for (const p of list) expect(LOGOS[p.id] || FALLBACK_ICON[p.id], `${type}/${p.id} sem logo nem ícone (apareceria só a inicial)`).toBeTruthy();
    }
  });
  it("consumidores de fila têm classe de consumo", () => {
    for (const q of ["kafka", "queue", "mqtt-broker", "event-bus"]) {
      for (const c of ["worker", "container", "kubernetes", "serverless", "stream-processor", "iot-platform"]) {
        const p = PROFILES[DEFAULT_PROFILE_BY_TYPE[c]!]!;
        expect(p.consumerClass ?? "compute", `${q}→${c}`).toBeTruthy();
        expect(p.capacity[p.consumerClass ?? "compute"], `${c} sem capacidade para consumir`).toBeGreaterThan(0);
      }
    }
  });
});

describe("protocolos e conexões", () => {
  it("todo protocolo oferecido tem estilo (cor, ícone, dica)", () => {
    for (const { s, d, o } of ALL_OPTIONS) expect(PROTO[o.protocol], `${s}→${d} ${o.protocol}`).toBeDefined();
  });
  it("IoT: o dispositivo fala MQTT, CoAP, BLE, LoRaWAN, Modbus e OPC UA com o gateway", () => {
    const ps = connectionOptions("iot-device", "iot-gateway").map((o) => o.protocol);
    for (const p of ["mqtt", "coap", "ble", "lorawan", "modbus", "opcua"]) expect(ps).toContain(p);
    expect(connectionOptions("iot-device", "mqtt-broker").map((o) => o.protocol)).toEqual(["mqtt"]);
    expect(connectionOptions("mqtt-broker", "stream-processor").map((o) => o.protocol)).toEqual(["mqtt"]);
  });
  it("serviços falam gRPC e GraphQL; clientes web falam GraphQL com o backend", () => {
    expect(connectionOptions("backend", "microservice").map((o) => o.protocol)).toContain("grpc");
    expect(connectionOptions("web-app", "backend").map((o) => o.protocol)).toEqual(expect.arrayContaining(["https", "graphql"]));
  });
  it("nada entra em origens de carga", () => {
    for (const d of ["client", "iot-device", "external-system"]) expect(connectionOptions("backend", d)).toEqual([]);
  });
  it("bancos e cache também são origem de conexão: replicação, carga de cache e CDC (tudo se liga a tudo, menos às origens de carga)", () => {
    const stores = ["sql-database", "nosql-database", "timeseries-db", "graph-db", "vector-db", "data-warehouse", "redis", "database"];
    for (const s of stores) for (const d of types.filter((x) => !["client", "web-app", "mobile-app", "iot-device", "external-system"].includes(x))) {
      expect(connectionOptions(s, d).length, `${s}→${d}`).toBeGreaterThan(0);
    }
    expect(connectionOptions("nosql-database", "redis").map((o) => o.protocol)).toEqual(["redis", "redis"]);
    expect(connectionOptions("sql-database", "kafka")[0]!.protocol).toBe("kafka");
    expect(connectionOptions("redis", "nosql-database").length).toBeGreaterThan(0);
  });
  it("os componentes mais comuns são conectáveis entre si de ponta a ponta", () => {
    const need: [string, string][] = [["web-app", "waf"], ["waf", "api-gateway"], ["api-gateway", "kubernetes"], ["kubernetes", "container"],
      ["container", "sql-database"], ["container", "vector-db"], ["serverless", "event-bus"], ["event-bus", "worker"], ["container", "payment-gateway"],
      ["container", "observability"], ["container", "secrets-manager"], ["iot-gateway", "mqtt-broker"], ["mqtt-broker", "iot-platform"], ["iot-platform", "timeseries-db"],
      ["kafka", "stream-processor"], ["stream-processor", "data-warehouse"], ["scheduler", "batch-processor"], ["iot-device", "iot-platform"]];
    for (const [s, d] of need) expect(connectionOptions(s, d).length, `${s}→${d}`).toBeGreaterThan(0);
  });
});

describe("textos do catálogo em inglês", () => {
  it("rótulos, descrições, grupos, notas de provedor e dicas de protocolo têm tradução", () => {
    const missing = new Set<string>();
    const need = (s: string | undefined) => { if (s && EN[s] === undefined) missing.add(s); };
    for (const g of PALETTE) { need(g.title); for (const i of g.items) { need(i.label); need(i.desc); } }
    for (const list of Object.values(PROVIDERS)) for (const p of list) need(p.note);
    for (const p of Object.values(PROTO)) { need(p.hint); }
    for (const { o } of ALL_OPTIONS) { need(o.label); need(o.hint); }
    expect([...missing].sort()).toEqual([]);
  });
});

import { buildAutoFlows } from "../../../apps/web/src/flowOps";
import { docOf } from "../../../apps/web/src/reference";
import { solveDemand, validateArchitecture } from "../src";

describe("cenários ponta a ponta com os componentes novos", () => {
  const run = (spec: [string, string][], links: [string, string][], root: string, rps = 2000) => {
    const nodes = spec.map(([id, type]) => ({ id, type, name: id }));
    const edges = links.map(([source, target]) => ({ id: `${source}-${target}`, source, target }));
    const built = buildAutoFlows(root, nodes, edges, 0.9);
    const snap = {
      n: nodes.map((n) => ({ id: n.id, x: 0, y: 0, w: 196, d: { name: n.name, type: n.type, replicas: 3, hitRate: n.type === "redis" ? 0.9 : undefined } })),
      e: edges.map((e) => {
        const o = connectionOptions(nodes.find((n) => n.id === e.source)!.type, nodes.find((n) => n.id === e.target)!.type)[0]!;
        return { ...e, sourcePort: "out", targetPort: "in", configuration: { mode: o.mode, protocol: o.protocol, required: true, timeoutMs: o.timeoutMs, networkLatencyMs: o.networkLatencyMs, maxAttempts: 1, backoffMs: 0, retryable: false, tls: o.tls } };
      }),
      f: built.map((b) => b.flow), w: built.map((b) => b.workload), m: {},
    };
    const doc = docOf(snap as any);
    expect(validateArchitecture(doc)).toEqual([]);
    return { built, r: solveDemand(doc as any, { rps }) };
  };

  it("IoT: sensor → gateway → broker MQTT → processador de streams (consumo calculado pelo motor)", () => {
    const { r } = run([["dev", "iot-device"], ["gw", "iot-gateway"], ["mq", "mqtt-broker"], ["sp", "stream-processor"], ["ts", "timeseries-db"]],
      [["dev", "gw"], ["gw", "mq"], ["mq", "sp"], ["sp", "ts"]], "dev");
    for (const id of ["gw", "mq", "sp"]) expect(r.loads.get(id)?.offered, id).toBeGreaterThan(0);
    expect(r.loads.get("mq")?.queue?.consumers).toBe(1);
  });
  it("IoT direto à plataforma, que grava série temporal", () => {
    const { built, r } = run([["dev", "iot-device"], ["plat", "iot-platform"], ["ts", "timeseries-db"]], [["dev", "plat"], ["plat", "ts"]], "dev");
    expect(built.length).toBeGreaterThan(0);
    expect(r.loads.get("ts")?.offered).toBeGreaterThan(0);
  });
  it("plataforma web: WAF → gateway → Kubernetes → contêiner → banco vetorial e SQL", () => {
    const { r } = run([["web", "web-app"], ["waf", "waf"], ["gw", "api-gateway"], ["k8s", "kubernetes"], ["c", "container"], ["v", "vector-db"], ["db", "sql-database"]],
      [["web", "waf"], ["waf", "gw"], ["gw", "k8s"], ["k8s", "c"], ["c", "v"], ["c", "db"]], "web");
    for (const id of ["waf", "gw", "k8s", "c", "v", "db"]) expect(r.loads.get(id)?.offered, id).toBeGreaterThan(0);
  });
  it("observabilidade e segredos ficam fora dos fluxos de requisição", () => {
    const { built, r } = run([["web", "web-app"], ["app", "backend"], ["obs", "observability"], ["sec", "secrets-manager"], ["db", "sql-database"]],
      [["web", "app"], ["app", "obs"], ["app", "sec"], ["app", "db"]], "web");
    expect(built.flatMap((b) => b.flow.steps.map((s) => s.nodeId))).not.toContain("obs");
    expect(r.loads.get("obs")).toBeUndefined();
    expect(r.loads.get("db")?.offered).toBeGreaterThan(0);
  });
  it("função serverless atrás do barramento de eventos recebe a carga publicada", () => {
    const { r } = run([["web", "web-app"], ["app", "backend"], ["bus", "event-bus"], ["fn", "serverless"]], [["web", "app"], ["app", "bus"], ["bus", "fn"]], "web");
    expect(r.loads.get("fn")?.offered).toBeGreaterThan(0);
  });
});

import { COMPANY_CASES } from "../../../apps/web/src/cases";
describe("logos das empresas", () => {
  it("toda empresa tem logo próprio (nada de ícone genérico) e ele existe no pacote de logos", () => {
    expect(COMPANY_CASES.length).toBeGreaterThanOrEqual(27);
    for (const c of COMPANY_CASES) {
      expect(c.company!.logo.startsWith("co-"), `${c.title} usa ícone genérico`).toBe(true);
      const l = LOGOS[c.company!.logo];
      expect(l, `${c.title}: logo ${c.company!.logo} ausente`).toBeDefined();
      expect(l!.body.length, c.title).toBeGreaterThan(50);
    }
    expect(new Set(COMPANY_CASES.map((c) => c.company!.logo)).size).toBe(COMPANY_CASES.length);
  });
});

describe("logos que acompanham o tema", () => {
  it("o do Instagram usa currentColor (claro no escuro, escuro no claro), como o do X", () => {
    expect(LOGOS["co-instagram"]!.body).toContain("currentColor");
    expect(LOGOS["co-x"]!.body).toContain("currentColor");
  });
});

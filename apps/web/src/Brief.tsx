import { useState, type ReactNode } from "react";
import { PROFILES, type NodeLoad } from "@archlab/domain";
import { Icon, fmt } from "./ui";
import { t } from "./i18n";

type Status = import("./requirements").Status;
const STATUS: Record<Status, { label: string; icon: string }> = {
  meets: { label: "Atendido", icon: "check_circle" }, partial: { label: "Parcial", icon: "contrast" },
  fails: { label: "Não atendido", icon: "cancel" }, unknown: { label: "Desconhecido", icon: "help" }, manual: { label: "Autodeclarado", icon: "edit_note" },
};
export const Chip = ({ s }: { s: Status }) => <span className={`rs ${s}`}><Icon name={STATUS[s].icon} size={13} /> {t(STATUS[s].label)}</span>;

function Section({ title, icon, children, open = false }: { title: string; icon: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="bsec" open={open}>
      <summary><Icon name={icon} size={17} /> <span>{title}</span><Icon name="expand_more" size={18} /></summary>
      <div className="bbody">{children}</div>
    </details>
  );
}

export interface BriefModel {
  nodes: any[]; flows: any[]; loads: Map<string, NodeLoad>; rps: number; down: Set<string>; p95Ms?: number | null;
}

/** Desafio CH-01 (spec §5.3) escrito como enunciado de entrevista. Valores são de ensino, não de produção. */
export function Brief({ nodes, flows, loads, rps, p95Ms = null }: BriefModel) {
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setManual((m) => ({ ...m, [id]: !m[id] }));

  // ── indicadores ao vivo, calculados a partir do modelo desenhado ──
  const inFlow = new Set<string>(flows.flatMap((f: any) => f.steps.map((s: any) => s.nodeId)));
  const loaded = [...loads.entries()].filter(([, l]) => !l.source && l.utilization !== null);
  const worst = loaded.reduce<[string, number] | null>((w, [id, l]) => (!w || (l.utilization ?? 0) > w[1] ? [id, l.utilization ?? 0] : w), null);
  const capacity: Status = !loaded.length ? "unknown" : worst![1] > 1 ? "fails" : worst![1] > 0.8 ? "partial" : "meets";
  const backends = nodes.filter((n) => (n.type === "backend" || n.type === "microservice") && inFlow.has(n.id));
  const redundancy: Status = !backends.length ? "unknown" : backends.every((n) => n.properties.replicas >= 2) ? "meets" : "fails";
  const readPath: Status = flows.some((f: any) => f.steps.some((s: any) => {
    const n = nodes.find((x) => x.id === s.nodeId);
    return n && ["sql-database", "nosql-database", "database"].includes(n.type) && s.operationClass === "read";
  })) ? "meets" : "fails";
  let cost = 0; let unknownCost = 0;
  for (const n of nodes) {
    const p = PROFILES[n.properties.profileId];
    if (!p || p.source) continue;
    if (p.credits === undefined) unknownCost++; else cost += p.credits * n.properties.replicas;
  }
  const budget: Status = unknownCost > 0 ? (cost > 1200 ? "fails" : "unknown") : cost > 1200 ? "fails" : "meets";
  const writePath: Status = flows.some((f: any) => f.steps.some((s: any) => s.operationClass === "write")) ? "meets" : "fails";

  const peakNote = rps === 5000 ? t("carga de pico do desafio") : t("carga atual: {rps} req/s (pico do desafio: 5.000)", { rps: fmt(rps) });

  return (
    <div className="brief-body">
      <header className="brief-head">
        <span className="tag">{t("Iniciante · 40 min")}</span>
        <h2>{t("Projete um encurtador de links")}</h2>
        <p className="lead">{t("Você é o(a) engenheiro(a) responsável por um serviço de")}{" "}<b>{t("links curtos")}</b>{" "}{t("usado em campanhas de marketing. Os picos de acesso são imprevisíveis e os links precisam continuar funcionando por um ano. Desenhe a arquitetura, justifique cada decisão e mostre, com os números do laboratório, que ela aguenta o pico dentro do orçamento.")}</p>
      </header>

      <Section title={t("Perguntas para esclarecer com o entrevistador")} icon="forum" open>
        <ul className="blist">
          <li>{t("Qual a proporção entre leituras (redirecionar) e escritas (criar)?")}{" "}<em>→ 99% / 1%.</em></li>
          <li>{t("O alias pode ser escolhido pelo usuário ou é gerado? Pode sobrescrever um existente?")}{" "}<em>{t("→ Não pode sobrescrever.")}</em></li>
          <li>{t("Quanto tempo o link vive?")}{" "}<em>{t("→ 365 dias, depois expira.")}</em></li>
          <li>{t("O que acontece com um link inexistente ou expirado?")}{" "}<em>{t("→ Resposta de “não encontrado”.")}</em></li>
          <li>{t("Posso servir dado levemente desatualizado no cache?")}{" "}<em>{t("→ Até 60 s.")}</em></li>
          <li>{t("Preciso de analytics de cliques, multi-região ou domínios personalizados?")}{" "}<em>{t("→ Fora do escopo.")}</em></li>
        </ul>
      </Section>

      <Section title={t("Requisitos funcionais")} icon="task_alt" open>
        <ul className="reqs">
          <li><div><b>{t("FR-URL-1")}</b>{" "}{t("Criar alias único e durável")}{" "}<span className="must">must</span>
            <small>{t("Descreva como evita colisão com atomicidade (ex.: restrição de unicidade ou escrita condicional).")}</small></div>
            <label className="check"><input type="checkbox" checked={!!manual["fr1"]} onChange={() => toggle("fr1")} /> {manual["fr1"] ? <Chip s="manual" /> : <Chip s="unknown" />}</label></li>
          <li><div><b>{t("FR-URL-2")}</b>{" "}{t("Redirecionar um alias")}{" "}<span className="must">must</span>
            <small>{t("Caminho de leitura chegando ao armazenamento durável.")}</small></div><Chip s={readPath} /></li>
          <li><div><b>{t("FR-URL-3")}</b>{" "}{t("Criar link")}{" "}<span className="should">should</span>
            <small>{t("Existe um fluxo de escrita (aba Fluxos) até o armazenamento?")}</small></div><Chip s={writePath} /></li>
          <li><div><b>{t("FR-URL-4")}</b>{" "}{t("Expirar links após 365 dias")}{" "}<span className="must">must</span>
            <small>{t("TTL no banco/cache ou rotina de limpeza.")}</small></div>
            <label className="check"><input type="checkbox" checked={!!manual["fr4"]} onChange={() => toggle("fr4")} /> {manual["fr4"] ? <Chip s="manual" /> : <Chip s="unknown" />}</label></li>
          <li><div><b>{t("FR-URL-5")}</b>{" "}{t("Tratar link inexistente")}{" "}<span className="should">should</span>
            <small>{t("Resposta clara e cache negativo para não sobrecarregar o banco.")}</small></div>
            <label className="check"><input type="checkbox" checked={!!manual["fr5"]} onChange={() => toggle("fr5")} /> {manual["fr5"] ? <Chip s="manual" /> : <Chip s="unknown" />}</label></li>
          <li><div><b>{t("FR-URL-6")}</b>{" "}{t("Limite antiabuso na criação")}{" "}<span className="should">should</span>
            <small>{t("Rate limit por cliente/IP no caminho de escrita.")}</small></div>
            <label className="check"><input type="checkbox" checked={!!manual["fr6"]} onChange={() => toggle("fr6")} /> {manual["fr6"] ? <Chip s="manual" /> : <Chip s="unknown" />}</label></li>
        </ul>
        <p className="note">{t("“Autodeclarado” significa que só você marcou: o laboratório não consegue provar esses itens num modelo abstrato.")}</p>
      </Section>

      <Section title={t("Requisitos não funcionais")} icon="speed" open>
        <ul className="reqs">
          <li><div><b>{t("NFR-URL-1")}</b>{" "}{t("Latência do redirect (p95 proxy) ≤ 200 ms")}{" "}<span className="must">must</span>
            <small>{p95Ms === null ? t("Sem fluxo de leitura com carga.") : <>{t("p95 proxy atual:")}{" "}<b className="num">{Math.round(p95Ms)} ms</b>{" "}{t("(soma dos nós e da rede no pior ramo relevante).")}</>}</small></div>
            <Chip s={p95Ms === null ? "unknown" : p95Ms <= 200 ? "meets" : "fails"} /></li>
          <li><div><b>{t("NFR-URL-2")}</b>{" "}{t("Capacidade no pico, sem componente saturado")}{" "}<span className="must">must</span>
            <small>{worst ? `${t("Mais carregado: {nome} a {pct}%.", { nome: nodes.find((n) => n.id === worst[0])?.name ?? "", pct: Math.round(worst[1] * 100) })} · ` : ""}{peakNote}.</small></div><Chip s={capacity} /></li>
          <li><div><b>{t("NFR-URL-3")}</b>{" "}{t("Tolerar a perda de uma instância do backend")}{" "}<span className="must">must</span>
            <small>{t("Backend com 2 ou mais réplicas no fluxo.")}</small></div><Chip s={redundancy} /></li>
          <li><div><b>{t("NFR-URL-4")}</b>{" "}{t("Orçamento ≤ 1.200 créditos/mês")}{" "}<span className="must">must</span>
            <small>{t("Estimado:")}{" "}<b className="num">{fmt(cost)}</b>{" "}{t("créditos")}{unknownCost > 0 ? ` ${t("(+ {n} componente(s) sem preço no catálogo)", { n: unknownCost })}` : ""}.</small></div><Chip s={budget} /></li>
          <li><div><b>{t("NFR-URL-5")}</b>{" "}{t("Taxa de erro ≤ 0,1%")}{" "}<span className="must">must</span>
            <small>{t("Rejeição por capacidade e timeouts por prazo estouram a meta; falhas injetadas entram na conta.")}</small></div><Chip s={capacity === "fails" || (p95Ms !== null && p95Ms > 500) ? "fails" : "unknown"} /></li>
          <li><div><b>{t("NFR-URL-6")}</b>{" "}{t("Durabilidade após confirmar a criação")}{" "}<span className="must">must</span>
            <small>{t("Justifique o ack só depois da escrita durável.")}</small></div>
            <label className="check"><input type="checkbox" checked={!!manual["n6"]} onChange={() => toggle("n6")} /> {manual["n6"] ? <Chip s="manual" /> : <Chip s="unknown" />}</label></li>
        </ul>
      </Section>

      <Section title={t("Escala e estimativas")} icon="monitoring">
        <table className="btable">
          <tbody>
            <tr><th>{t("Usuários ativos/dia")}</th><td className="num">1.000.000</td></tr>
            <tr><th>{t("Conexões simultâneas")}</th><td className="num">10.000</td></tr>
            <tr><th>{t("Tráfego médio / pico")}</th><td className="num">{t("1.000 / 5.000 req/s")}</td></tr>
            <tr><th>{t("Leitura / criação")}</th><td className="num">99% / 1%</td></tr>
            <tr><th>{t("Criações no pico")}</th><td className="num">{t("≈ 50/s (4.950 leituras/s)")}</td></tr>
            <tr><th>{t("Tamanho do registro")}</th><td className="num">{t("500 B")}</td></tr>
            <tr><th>{t("Retenção")}</th><td className="num">{t("365 dias")}</td></tr>
          </tbody>
        </table>
        <h4>{t("Conta de padaria (confira no seu raciocínio)")}</h4>
        <ul className="blist">
          <li>{t("Criações médias: 1.000 × 1% =")}{" "}<b className="num">10/s</b>{" "}{t("→ 864 mil/dia →")}{" "}<b className="num">{t("≈ 315,36 milhões/ano")}</b>.</li>
          <li>{t("Armazenamento lógico: 315,36 M × 500 B =")}{" "}<b className="num">{t("≈ 157,68 GB")}</b>{" "}{t("(decimal), antes de índices e replicação.")}</li>
          <li>{t("Banda no pico: 5.000 × 500 B =")}{" "}<b className="num">{t("2,5 MB/s ≈ 20 Mbps")}</b>{" "}{t("de payload.")}</li>
          <li>{t("Hot keys: 20% das leituras caem em chaves populares, o que favorece cache.")}</li>
          <li>{t("Usuários não viram req/s automaticamente: a carga acima é a premissa do desafio.")}</li>
        </ul>
      </Section>

      <Section title={t("Restrições e premissas")} icon="rule">
        <ul className="blist">
          <li>{t("Orçamento:")}{" "}<b className="num">{t("1.200 créditos/mês")}</b>{" "}{t("(valores fictícios do laboratório).")}</li>
          <li>{t("Uma única região.")}</li>
          <li>{t("Cache pode servir dado até")}{" "}<b>{t("60 s")}</b>{" "}{t("desatualizado.")}</li>
          <li>{t("Criar alias nunca sobrescreve um existente.")}</li>
          <li>{t("Links expiram em 365 dias.")}</li>
          <li>{t("Todo tráfego público usa TLS; autenticação onde fizer sentido.")}</li>
        </ul>
      </Section>

      <Section title={t("Pontos tecnológicos para discutir")} icon="build">
        <ul className="blist">
          <li><b>{t("Geração do alias:")}</b>{" "}{t("aleatório (base62, risco de colisão) vs. sequencial/contador (previsível, requer coordenação).")}</li>
          <li><b>{t("Armazenamento:")}</b>{" "}{t("SQL com índice único e transação")}{" "}<em>{t("ou")}</em>{" "}{t("KV particionado com escrita condicional.")}</li>
          <li><b>{t("Cache:")}</b>{" "}{t("cache-aside com TTL; o que fazer em")}{" "}<em>{t("cache miss")}</em>{" "}{t("em massa (stampede) e quando o cache cai (bypass ou fail-closed).")}</li>
          <li><b>{t("Entrada:")}</b>{" "}{t("load balancer à frente de backends sem estado; quantas réplicas e por quê.")}</li>
          <li><b>{t("Leituras:")}</b>{" "}{t("réplicas de leitura vs. banco maior; impacto da defasagem.")}</li>
          <li><b>{t("Observabilidade:")}</b>{" "}{t("quais métricas e alertas provam que o sistema está saudável.")}</li>
          <li><b>{t("Segurança:")}</b>{" "}{t("TLS, limite por cliente, validação de URL de destino (evitar abuso e phishing).")}</li>
          <li>{t("Escolha provedores reais na paleta (PostgreSQL, Redis, NGINX…) e explique por quê.")}</li>
        </ul>
      </Section>

      <Section title={t("Trade-offs que o entrevistador vai explorar")} icon="balance">
        <ul className="blist">
          <li>{t("Réplicas de leitura × banco primário maior.")}</li>
          <li>{t("Complexidade do cache × capacidade do banco.")}</li>
          <li>{t("Alias aleatório × sequencial.")}</li>
          <li>{t("Consistência forte na criação × latência.")}</li>
        </ul>
      </Section>

      <Section title={t("Cenários de falha para testar")} icon="bug_report">
        <ul className="blist">
          <li><b>{t("Tráfego 10× por 60 s:")}</b>{" "}{t("suba a carga no slider e veja quem satura primeiro.")}</li>
          <li><b>{t("Redis indisponível:")}</b>{" "}{t("use “Simular indisponibilidade” no cache e observe o banco.")}</li>
          <li><b>{t("Banco lento (+150 ms)")}</b>{" "}{t("e")}{" "}<b>{t("perda de uma instância")}</b>{" "}{t("do backend.")}</li>
          <li>{t("Falhas clássicas a evitar: stampede, colisão sem tratamento, banco único, expiração inconsistente.")}</li>
        </ul>
      </Section>

      <Section title={t("O que entregar neste laboratório")} icon="checklist">
        <ol className="blist">
          <li>{t("Diagrama com componentes, provedores e conexões justificados.")}</li>
          <li>{t("Fluxos de")}{" "}<b>{t("leitura")}</b>{" "}{t("(redirect) e de")}{" "}<b>{t("escrita")}</b>{" "}{t("(criar), com cache e ramo de miss.")}</li>
          <li>{t("Prova de capacidade no pico (nenhum componente acima de 100%, de preferência abaixo de 80%).")}</li>
          <li>{t("Custo dentro do orçamento e tolerância à perda de uma instância.")}</li>
          <li>{t("Resultado de pelo menos um teste de falha e o que você mudou depois.")}</li>
        </ol>
      </Section>

      <p className="note">{t("Valores didáticos e fictícios (desafio CH-01); não são benchmarks nem preços reais.")}</p>
    </div>
  );
}

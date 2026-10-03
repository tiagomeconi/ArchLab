# Arquitetura

## Visão geral

Monorepo pnpm com dois pacotes e uma suíte de ponta a ponta:

- `packages/domain` — **núcleo puro** (sem I/O, sem `Date.now`, sem aleatoriedade): JSON Schema do desenho, validação, regras de conexão, perfis de capacidade e o cálculo de demanda/utilização/latência. Mesma entrada, mesmo resultado.
- `apps/web` — app React 19 + Vite + Tailwind 4 (só na landing) + @xyflow/react para o canvas.
- `e2e` — Playwright (Python) + axe, dirigindo o app num Chromium real.

Decisão registrada em [ADR 0001](adr/0001-monorepo-e-nucleo-puro.md).

## Núcleo (`packages/domain`)

| Arquivo | Papel |
| --- | --- |
| `architecture.schema.json` | contrato do desenho: tipos de nó, protocolos, fluxos, passos. **Os enums de tipo e protocolo precisam conhecer todo componente/protocolo novo** |
| `validate.ts` | schema (Ajv) + integridade semântica (ids duplicados, arestas soltas, ciclos) |
| `connections.ts` | quais conexões são válidas entre dois tipos, com protocolo, modo (sync/async), timeout, latência de rede e TLS |
| `demand.ts` | `PROFILES` (capacidade por classe de operação) e `solveDemand`: propaga a carga pelos fluxos, itera admissão↔utilização, calcula p95 por distribuição, consumo implícito de filas (aresta fila → consumidor) e efeitos de falha |

Conceitos: **fluxo** = árvore de passos (nó, classe de operação, visitas, ramo condicional de cache hit/miss); **perfil** = capacidade fictícia por instância e classe (`read`, `write`, `compute`, `message`, `job`); **efeito** = falha injetada (indisponível, fator de capacidade, erro, latência, queda de aresta).

## App web (`apps/web/src`)

- `App.tsx` — o laboratório: canvas, paleta, propriedades, simulação, caos, histórico, persistência, exportação.
- `catalog.ts`, `providers.ts`, `protocols.ts`, `logos.generated.ts` — paleta, provedores, identidade visual dos protocolos, logos (gerados por `scripts/gen-logos.mjs`).
- `cases.ts` — casos de estudo (`COMPANY_CASES`, `CASES`), cargas (`LOADS`), verificações (`CHECKS`), falhas sugeridas (`CHAOS_HINTS`).
- `reference.ts` — monta uma arquitetura de referência dimensionada para cada caso a partir das verificações (≤ 70% de utilização, até 100 réplicas).
- `flowOps.ts` — `buildAutoFlows`: deriva os fluxos das conexões (leitura com cache-aside, escrita, eventos, busca, mídia, notificações, tempo real); filas encerram o fluxo (o motor calcula o consumo).
- `requirements.ts` — avalia os requisitos do caso contra o desenho (componentes, caminhos, taxa de acerto, p95).
- `rating.ts` / `Rating.tsx` — nota OVR.
- `report.ts` — relatório PNG desenhado em canvas 2D (sem dependências).
- `session.ts`, `progress.ts`, `share.ts` — sessão do caso, progresso por caso e link de compartilhamento (deflate + base64url no `#d=`).
- `i18n/` — PT é a chave; EN em `en.*.ts`.
- `landing/` — landing, escolha de modo (`Start.tsx`), componentes de interface.

### Persistência (localStorage)

| Chave | Conteúdo |
| --- | --- |
| `archlab:design:<caso\|free\|reference\|shared>` | desenho (inclui observações e anotações) |
| `archlab:session` | caso/requisitos escolhidos na tela inicial (só vale com `?s=1`) |
| `archlab:progress` | requisitos atendidos, etapas e nota por caso |
| `archlab:theme`, `archlab:lang`, `archlab:pref:*` | preferências |

Nada sai do navegador: não há backend.

## Nota geral (OVR)

Calculada em `rating.ts` com os mesmos números que o simulador já mostra (carga atual, sem falhas injetadas). Sem dados suficientes (menos de 2 atributos mensuráveis) o app mostra "sem nota" em vez de inventar um número.

| Atributo | Peso | Como é medido |
| --- | --- | --- |
| Capacidade | 25% | componente mais carregado e taxa de erro |
| Resiliência | 20% | perde-se uma instância de cada componente do fluxo, uma de cada vez, e mede-se a queda; mais a redundância (≥ 2 réplicas) |
| Arquitetura | 20% | requisitos do caso atendidos (componentes e caminhos); no modo livre, boas práticas |
| Latência | 15% | p95 contra a meta do caso (ou faixas gerais) |
| Comunicação | 10% | cadeias síncronas longas, fan-out alto, entrada sem TLS |
| Eficiência | 10% | réplicas ociosas |

Faixas: ≥ 90 Elite, ≥ 75 Ouro, ≥ 60 Prata, abaixo Bronze. Pesos e cortes são decisões de ensino e estão em `WEIGHTS`/`rating.ts`.

## Relatório em imagem

`renderReport` (`report.ts`) recebe os dados já calculados (nota, requisitos, nós com utilização e status, conexões com protocolo e vazão) e desenha num canvas: coluna lateral com caso e nota, e o mapa com as mesmas posições do canvas. Logos são rasterizados de SVG preservando a proporção; rótulos de protocolo evitam cair sobre os cards quando há espaço.

## Testes

- **Unitários** (`packages/domain/test`, vitest): fixture, casos (cada referência atende os próprios requisitos), fluxos automáticos, nota, catálogo (todo tipo tem perfil, provedor, ícone, tradução e regras de conexão), tradução.
- **Ponta a ponta** (`e2e`): navegação, laboratório, relatório, observações, idioma (procura português restante em EN), acessibilidade (axe) e responsivo. Cada teste falha em erro de JavaScript.

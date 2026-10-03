# ArchLab

Laboratório visual de **System Design**: desenhe a arquitetura, defina o caminho das requisições, simule carga, injete falhas e receba uma nota (OVR) sobre o que você projetou. Feito para estudar, treinar entrevistas e discutir arquitetura com times.

> Aprender → Projetar → Simular → Quebrar → Analisar → Melhorar.

## O que tem

- **Modo estudo e treino de entrevista:** 30 casos de empresas (Netflix, Spotify, Uber, Nubank, Pix, Itaú, Shopee, Free Fire…) e 17 sistemas clássicos (encurtador de links, rate limiter, chat…). Cada caso traz requisitos funcionais e não funcionais, escala, metas, perguntas típicas de entrevista, carga de pico, falhas sugeridas, guia por etapas e uma **solução de referência**.
- **Modo livre:** canvas em branco para qualquer sistema, com seus próprios requisitos.
- **Catálogo amplo de componentes (≈50)**, com provedores e logos reais: clientes, IoT (dispositivo, gateway, broker MQTT, plataforma), borda, rede (CDN, WAF, load balancer, API gateway, service mesh), computação (Docker, Kubernetes, serverless, VM, cron, workflows, stream/batch, ML), dados (SQL, NoSQL, cache, objeto, busca, série temporal, grafo, vetorial, warehouse), mensageria (Kafka, filas, MQTT, barramento de eventos) e apoio (auth, notificações, segredos, observabilidade, pagamentos, APIs de terceiros).
- **Protocolos como cidadãos de primeira classe:** HTTPS, gRPC, GraphQL, MQTT, CoAP, AMQP, Kafka, WebSocket, SQL, Redis, LoRaWAN, BLE, Modbus, OPC UA e outros, cada um com cor e semântica (síncrono/assíncrono). Banco e cache também são origem de conexão (replicação, CDC, carga de cache).
- **Simulação:** carga, utilização, gargalos, latência p95, backlog de filas, **modo caos** (falhas de infraestrutura, rede, dependências e tráfego) e tráfego animado nas conexões.
- **Fluxos automáticos:** os fluxos de requisição são derivados das conexões desenhadas, sem edição manual de passos.
- **Nota geral (OVR, estilo FIFA):** seis atributos (Capacidade, Resiliência, Latência, Arquitetura, Comunicação, Eficiência) com explicação e dica de cada um. Veja [a metodologia](docs/ARQUITETURA.md#nota-geral-ovr).
- **Observações da entrevista:** campo de notas em cada componente e bloco de anotações gerais do desenho.
- **Relatório em imagem (PNG):** card horizontal com logo do caso, nota, requisitos e o mapa com provedores, protocolos e utilização, pronto para compartilhar.
- **Compartilhar por link, exportar/importar (.json), salvar no navegador, desfazer/refazer**, atalhos de teclado.
- **PT/EN**, tema claro/escuro, acessibilidade (axe sem violações) e layout responsivo.

> Os números do simulador usam **perfis fictícios de ensino**. Não são benchmarks de produção.

## Começando

Requisitos: Node 20+ e [pnpm](https://pnpm.io). Python 3.10+ só para os testes de ponta a ponta.

```bash
pnpm install
pnpm --filter @archlab/web dev      # http://localhost:5173
```

Sem pnpm global: `cd apps/web && ./node_modules/.bin/vite`.

| Comando | O que faz |
| --- | --- |
| `pnpm --filter @archlab/web dev` | servidor de desenvolvimento |
| `pnpm --filter @archlab/web build` | build estático em `apps/web/dist` |
| `pnpm typecheck` | TypeScript em todos os pacotes |
| `pnpm test` | testes unitários (vitest) |
| `pnpm e2e` | testes de ponta a ponta (Playwright + pytest) — veja [e2e/README.md](e2e/README.md) |
| `pnpm --filter @archlab/web gen:logos` | regenera os logos (`logos.generated.ts`) |
| `pnpm --filter @archlab/web gen:icons` | regenera a fonte de ícones reduzida |

## Estrutura

```
apps/web/            app React + Vite (landing, escolha de modo, laboratório)
packages/domain/     núcleo puro e determinístico: schema, validação, demanda/utilização, conexões, perfis
fixtures/            desenho de referência (encurtador de links)
e2e/                 testes de ponta a ponta
docs/                arquitetura, como estender, publicação, créditos e ADRs
```

## Documentação

- [Arquitetura](docs/ARQUITETURA.md) — como o app e o motor funcionam, nota OVR, relatório
- [Como estender](docs/EXTENDENDO.md) — novo componente, protocolo, caso de estudo ou idioma
- [Publicar](docs/PUBLICAR.md) — GitHub e hospedagem
- [Créditos e marcas](docs/CREDITOS.md)

## Aviso sobre marcas

Nomes e logos de empresas e tecnologias pertencem aos seus respectivos donos e são usados aqui apenas para fins educacionais e de identificação. As arquiteturas dos casos são **inspiradas em material público** e simplificadas para ensino; não representam os sistemas reais.

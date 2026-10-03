<div align="center">

<img src="apps/web/public/logo.png" width="96" alt="ArchLab" />

# ArchLab

**Draw the architecture. Simulate the load. Break the system. Get scored.**

A visual System Design lab to study, practice interviews and discuss architecture with your team.

[![Live demo](https://img.shields.io/badge/demo-archlab--six.vercel.app-38bdf8?style=for-the-badge&logo=vercel&logoColor=white)](https://archlab-six.vercel.app)

![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
![Tests](https://img.shields.io/badge/tests-320%2B-34d399)
![Accessibility](https://img.shields.io/badge/axe-0%20violations-34d399)
![Languages](https://img.shields.io/badge/PT%20%7C%20EN-a78bfa)

[**Try it now →**](https://archlab-six.vercel.app) · [Português](README.md) · [Architecture](docs/ARQUITETURA.md) · [Extending](docs/EXTENDENDO.md) *(docs in Portuguese)*

<br />

<img src="docs/img/demo.gif" alt="Building a system, simulating and breaking it in ArchLab" width="880" />

</div>

---

## Why it exists

System Design material teaches patterns but rarely lets you **experiment**: what happens when the cache dies, when traffic doubles, when an instance disappears? Pretty diagrams hide bottlenecks.

ArchLab is the opposite: you draw, and the system **answers with numbers**. Per-component utilization, p95 latency, queue backlog, injected failures, and a score that explains *where* you lost points and *what* to do about it.

> No backend, no account, no data collection. Everything runs in the browser and is saved there.

## Two ways to use it

<table>
<tr>
<td width="50%" valign="top">

### Study / interview mode

Pick a case and solve it like an interview: functional and non-functional requirements, scale, targets and typical questions. The lab **checks your design against the requirements** in real time. Compare with a **reference solution** whenever you want.

**30 companies** — Netflix, Spotify, Uber, WhatsApp, Nubank, Pix, Itaú, Shopee, Free Fire, Mercado Livre, Stripe, Discord… — and **17 classics** (URL shortener, rate limiter, chat, feed, payments…).

</td>
<td width="50%" valign="top">

### Free mode

A blank canvas for any system, with **your own** requirements. Great for sketching the architecture you are defending at work and seeing whether it holds.

Request flows are **derived from the connections** you draw: connect it and it shows up. No step-by-step editing.

</td>
</tr>
</table>

<p align="center"><img src="docs/img/02-modos.jpg" alt="Mode chooser" width="880" /></p>
<p align="center"><img src="docs/img/03-casos.jpg" alt="Company cases" width="880" /></p>

## Simulate, break, analyze

<p align="center"><img src="docs/img/04-laboratorio.jpg" alt="Lab with the Netflix architecture simulated" width="880" /></p>

- **Load and utilization** on every component, **p95 latency**, rejection by capacity and **queue backlog**.
- **Animated traffic** on connections, colored by protocol; hover the legend and only that protocol stays in focus.
- **Chaos mode:** take down a zone, cut the network between two services, degrade the database, spike traffic 10× or 100×. Each case suggests the failures that matter most for it.
- **Replicas** right on the card, with the effect showing instantly.

<p align="center"><img src="docs/img/06-modo-caos.jpg" alt="Chaos mode" width="880" /></p>

## The overall score (OVR)

Inspired by a game card's attributes: **six attributes** with weight, explanation and a tip on how to improve. No mystery grade.

| Attribute | Weight | Measures |
| --- | :-: | --- |
| Capacity | 25% | the most loaded component and the error rate |
| Resilience | 20% | loses one instance of each flow component, one at a time, and measures the damage |
| Architecture | 20% | case requirements met (components and paths), or good practices in free mode |
| Latency | 15% | p95 against the case target |
| Communication | 10% | long synchronous chains, high fan-out, entry without TLS |
| Efficiency | 10% | idle replicas |

Tiers: **Bronze → Silver → Gold → Elite**. With too little data the app says "no score" instead of making up a number. Your best score per case is saved and shown on the case cards.

<p align="center"><img src="docs/img/05-nota-ovr.jpg" alt="Overall score with six attributes" width="880" /></p>

## A catalog that covers the market (and IoT)

**About 50 components** with real providers and logos, to design real systems:

| | |
| --- | --- |
| **Load sources** | client, web and mobile app, IoT device, external system |
| **IoT and edge** | IoT gateway, MQTT broker, IoT platform, edge compute |
| **Network and entry** | DNS, CDN, load balancer, API gateway, WAF, service mesh, rate limiter, WebSocket |
| **Compute** | backend, microservice, worker, Docker, Kubernetes, serverless, VM, cron, workflows, stream and batch, ML |
| **Data** | SQL, NoSQL, cache, object storage, search, time series, graph, vector, data warehouse |
| **Messaging** | Kafka, queues, MQTT, event bus |
| **Support** | auth, notifications, secrets, service discovery, observability, payments, third-party APIs |

And **20 protocols** as first-class citizens: HTTPS, gRPC, GraphQL, MQTT, CoAP, AMQP, Kafka, WebSocket, SQL, Redis, LoRaWAN, BLE, Modbus, OPC UA… each with its own color, sync/async semantics and latency. Databases and caches can also be connection sources (replication, CDC, cache warm-up).

<p align="center">
<img src="docs/img/08-iot.jpg" alt="IoT pipeline: device, gateway, MQTT broker and stream processor" width="880" />
</p>
<p align="center"><sub>IoT pipeline: LoRaWAN from sensor to gateway, MQTT to the broker and processor. LoRaWAN's high latency shows up in the p95.</sub></p>

## Take the result with you (interview, LinkedIn)

One click on **Export → Image report** produces a PNG with the case logo, your score, the requirements and the **full map** of what you drew: components, providers, protocols, utilization and throughput per connection.

<p align="center"><img src="docs/img/10-relatorio.jpg" alt="Image report" width="880" /></p>

During the conversation, note on each component what the candidate explained, and use the canvas pencil for what the interviewer asked to adjust. Notes are saved with the drawing.

You can also **share by link**, **export/import `.json`**, **undo/redo** and use keyboard shortcuts.

## Built with care

- **Pure, deterministic core** (`packages/domain`): same input, same result. No I/O, no randomness.
- **Every case is tested:** the reference solution must meet its own requirements, and every text must be translated.
- **320+ tests**: unit (vitest) and end-to-end in a real Chromium (Playwright), with **axe** checking accessibility in both themes. Every test fails if the page throws a JavaScript error.
- Full **PT/EN**, **light and dark themes**, responsive, honors "reduce motion".

<p align="center"><img src="docs/img/09-tema-claro.jpg" alt="Light theme" width="880" /></p>

## Running locally

Requirements: Node 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm --filter @archlab/web dev      # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `pnpm --filter @archlab/web build` | static build in `apps/web/dist` |
| `pnpm typecheck` | TypeScript across all packages |
| `pnpm test` | unit tests |
| `pnpm e2e` | end-to-end tests ([how to run](e2e/README.md)) |

## Structure

```
apps/web/            React + Vite app (landing, mode chooser, lab)
packages/domain/     core: schema, validation, connections, profiles, demand and utilization
e2e/                 end-to-end tests (Playwright + axe)
docs/                architecture, extending, publishing, credits and ADRs (Portuguese)
```

Want to add a component, a protocol or a company case? See [Extending](docs/EXTENDENDO.md). Want to publish your own copy? See [Publishing](docs/PUBLICAR.md).

## Disclaimer

Simulator numbers use **fictional teaching profiles**: they are not production benchmarks. Case architectures are **inspired by public material** and simplified; they do not represent the companies' real systems. Names and logos belong to their owners and are used for identification and educational purposes only ([credits](docs/CREDITOS.md)).

<div align="center"><sub>Made by <a href="https://github.com/tiagomeconi">@tiagomeconi</a></sub></div>

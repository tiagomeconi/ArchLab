# ADR 0001 — Monorepo pnpm e núcleo TypeScript puro

Status: aceito (fase 0). Contexto: spec §15–16, §27.
- Monorepo pnpm; contratos (schema, validação, cálculo) vivem em `packages/domain` e são a única fonte para web, API e worker.
- `architecture.schema.json` e `fixtures/url-shortener-baseline.json` foram extraídos dos Apêndices A e B da spec; não duplicar em outros pacotes.
- Núcleo sem I/O, sem `Date.now` e sem aleatoriedade, para reprodutibilidade (spec §1).
- Fase 0 implementa só demanda/utilização (§10.3); latência, erros, retries, filas e eventos entram nas próximas histórias.

# Como estender

## Novo tipo de componente

Todos os passos são necessários; `packages/domain/test/web-catalog.test.ts` cobre a maioria.

1. `apps/web/src/catalog.ts` — item da paleta (rótulo, ícone Material, descrição) no grupo/categoria certo.
2. `packages/domain/src/demand.ts` — entrada em `DEFAULT_PROFILE_BY_TYPE` e um perfil em `PROFILES` (capacidade por classe de operação). Tipos que consomem de filas precisam de `consumerClass`; tipos tipo fila entram em `QUEUE_TYPES`.
3. `packages/domain/src/connections.ts` — regras de conexão (quem fala com quem, protocolo, sync/async).
4. **`packages/domain/src/architecture.schema.json`** — adicione o tipo ao enum de nós (senão o desenho fica inválido em tempo de execução).
5. `apps/web/src/providers.ts` + `apps/web/scripts/gen-logos.mjs` — provedores e logos; rode `pnpm --filter @archlab/web gen:logos`.
6. `apps/web/src/App.tsx` — ícone em `ICONS`.
7. Origens de carga: `SOURCE_TYPES` (`flowOps.ts`), `SOURCE` (`rating.ts`) e `requirements.ts`. Telemetria/segredos/descoberta: `SIDE_TYPES` (ficam fora dos fluxos).
8. `apps/web/src/i18n/en.components.ts` — traduções.
9. `pnpm --filter @archlab/web gen:icons` — inclui os ícones novos na fonte reduzida.

## Novo protocolo

`Protocol` e `connectionOptions` em `connections.ts`, enum de protocolos no schema, estilo (cor, ícone, dica) em `protocols.ts`, traduções, `gen:icons`.

## Novo caso de estudo

Em `cases.ts`: `co(...)` em `COMPANY_CASES` (ou item em `CASES`), `LOADS`, `CHECKS` (`needs` só com tipos que `reference.ts` sabe montar) e `CHAOS_HINTS`; logo em `gen-logos.mjs` (`co-<id>`); traduções em `i18n/en.*.ts`. Os testes verificam que a referência atende os próprios requisitos, que os textos têm tradução e que o logo existe.

## Logos

`gen-logos.mjs` lê pacotes Iconify (`logos`, `devicon`, `simple-icons`) e SVGs avulsos em `scripts/logos-extra/` (fonte `["file", "<arquivo>.svg"]`). Marcas escuras usam `currentColor` para acompanhar o tema; as que somem no escuro entram em `INVERT_ON_DARK` (`ProviderLogo.tsx`).

## Idioma

O texto em português é a chave: `t("texto")`. Variáveis com `{nome}`. Nunca nomeie uma variável local `t`. Chaves duplicadas num mesmo objeto quebram o `tsc`.

import { h, p, ul, tip, code, table, fig, node, edge, type DocArticle } from "./kit";

/** Seção "operacao". */
export const ARTICLES: DocArticle[] = [
  { id: "testes-unitarios-e-de-integracao", section: "operacao", level: 1, icon: "code", minutes: 13,
    title: ["Testes unitários e de integração", "Unit and integration tests"],
    summary: ["A pirâmide e o troféu de testes, mocks x stubs x fakes, TDD, Testcontainers, contract testing com Pact, testes intermitentes e cobertura.", "The test pyramid and trophy, mocks vs stubs vs fakes, TDD, Testcontainers, contract testing with Pact, flaky tests and coverage."],
    body: [
      p(["Testes automatizados são a rede de segurança que permite mudar um sistema sem medo. Sem eles, cada alteração vira uma aposta: o time passa a evitar refatorações, o código velho apodrece e os defeitos só aparecem em produção, onde custam mais caro. A pergunta de design não é *se* testar, e sim **o que testar em cada nível**, porque cada nível tem um preço diferente em tempo de execução, estabilidade e esforço de manutenção. Um conjunto de testes bem desenhado dá feedback em segundos, falha por um motivo claro e continua válido quando a implementação muda.", "Automated tests are the safety net that lets you change a system without fear. Without them every change becomes a bet: the team avoids refactoring, old code rots and defects show up only in production, where they cost more. The design question is not *whether* to test but **what to test at each level**, because each level has a different price in run time, stability and upkeep. A well-designed suite gives feedback in seconds, fails for one clear reason and stays valid when the implementation changes."]),
      p(["Em sistemas distribuídos o desafio cresce: há banco, fila, cache e outros serviços no caminho, cada um capaz de falhar de um jeito próprio. Este artigo percorre os tipos de teste, as técnicas para isolar dependências, como testar integrações de verdade sem montar um ambiente inteiro e como evitar os problemas que corroem a confiança numa suíte de testes.", "In distributed systems the challenge grows: there is a database, a queue, a cache and other services on the path, each able to fail in its own way. This article walks through the kinds of test, the techniques for isolating dependencies, how to test real integrations without building a whole environment and how to avoid the problems that erode trust in a suite."]),

      h(["A pirâmide de testes e suas variações", "The test pyramid and its variations"]),
      p(["A **pirâmide de testes** (Mike Cohn) propõe muitos testes unitários na base, uma quantidade média de testes de integração no meio e poucos testes de ponta a ponta no topo. A lógica é econômica: quanto mais alto o nível, mais lento, mais frágil e mais caro de diagnosticar o teste. Um teste unitário roda em milissegundos e, ao falhar, aponta uma função. Um teste E2E leva segundos, atravessa dez componentes e, ao falhar, pode ser rede, dado, navegador ou bug.", "The **test pyramid** (Mike Cohn) proposes many unit tests at the base, a medium amount of integration tests in the middle and few end-to-end tests at the top. The logic is economic: the higher the level, the slower, more brittle and costlier to diagnose the test. A unit test runs in milliseconds and, when it fails, points at a function. An E2E test takes seconds, crosses ten components and, when it fails, it could be the network, the data, the browser or a bug."]),
      code("        /\\          few, slow, costly\n       /E2E\\         full flow, real browser\n      /------\\\n     / integr.\\      some, medium: DB, queue, HTTP\n    /----------\\\n   /   unit      \\   many, ms each: pure logic\n  /--------------\\"),
      p(["Há variações. O **troféu de testes** (popularizado por Kent C. Dodds no front-end) inverte a ênfase: poucos testes estáticos e unitários, **muitos testes de integração** e poucos E2E, com o argumento de que testes que exercitam vários módulos juntos se parecem mais com o uso real e resistem melhor a refatorações. O **favo de mel** (honeycomb), usado por times de microsserviços, enfatiza testes de integração por serviço e dá pouca atenção a unitários de lógica trivial. Nenhuma forma é a certa: a escolha depende de onde estão os riscos. Um serviço que é quase só orquestração de chamadas (CRUD sobre banco) ganha mais com testes de integração; uma biblioteca de cálculo financeiro ganha mais com milhares de unitários.", "There are variations. The **testing trophy** (popularized by Kent C. Dodds in front-end work) shifts the emphasis: few static and unit tests, **many integration tests** and few E2E, arguing that tests exercising several modules together look more like real use and survive refactoring better. The **honeycomb**, used by microservice teams, stresses per-service integration tests and gives little attention to unit tests of trivial logic. No shape is the right one: the choice depends on where the risks are. A service that is mostly call orchestration (CRUD over a database) gains more from integration tests; a financial calculation library gains more from thousands of unit tests."]),
      table([["Nível", "Level"], ["O que valida", "What it validates"], ["Velocidade", "Speed"], ["Estabilidade", "Stability"], ["Quando falha, indica", "When it fails, it points to"]],
        [["Unitário", "Unit"], ["Lógica de uma função ou classe, sem I/O", "Logic of one function or class, no I/O"], ["Milissegundos", "Milliseconds"], ["Muito alta", "Very high"], ["Um trecho de código", "A piece of code"]],
        [["Integração", "Integration"], ["Peças reais juntas: serviço + banco, serviço + fila", "Real pieces together: service + database, service + queue"], ["Centenas de ms a poucos s", "Hundreds of ms to a few s"], ["Alta, se o ambiente for descartável", "High, if the environment is disposable"], ["Uma fronteira (SQL, serialização, configuração)", "A boundary (SQL, serialization, configuration)"]],
        [["Contrato", "Contract"], ["Acordo de API entre consumidor e provedor", "API agreement between consumer and provider"], ["Rápido", "Fast"], ["Alta", "High"], ["Mudança incompatível entre serviços", "Incompatible change between services"]],
        [["End-to-end", "End-to-end"], ["Fluxo completo do usuário em ambiente integrado", "Full user flow in an integrated environment"], ["Segundos a minutos", "Seconds to minutes"], ["Baixa a média", "Low to medium"], ["Qualquer coisa no caminho", "Anything on the path"]],
      ),

      h(["Testes unitários na prática", "Unit tests in practice"]),
      p(["Um bom teste unitário é **rápido, determinístico e independente**: não usa rede, disco nem relógio real e não depende da ordem em que os outros rodam. Segue o padrão **Arrange, Act, Assert** (preparar, executar, verificar) e testa **comportamento observável**, não detalhes internos. Se renomear um método privado quebra o teste, ele está testando a implementação.", "A good unit test is **fast, deterministic and independent**: it uses no network, disk or real clock and does not depend on the order other tests run in. It follows the **Arrange, Act, Assert** pattern and tests **observable behavior**, not internals. If renaming a private method breaks the test, it is testing the implementation."]),
      code(`// pricing.ts
export interface Item { sku: string; cents: number; qty: number }

export function orderTotal(items: Item[], couponPct = 0): number {
  if (couponPct < 0 || couponPct > 100) throw new RangeError("invalid coupon");
  const subtotal = items.reduce((s, i) => s + i.cents * i.qty, 0);
  return Math.round(subtotal * (1 - couponPct / 100));
}

// pricing.test.ts (Vitest; with Jest the API is the same)
import { describe, it, expect } from "vitest";
import { orderTotal } from "./pricing";

describe("orderTotal", () => {
  it("sums price times quantity", () => {
    const items = [{ sku: "A", cents: 1000, qty: 2 }, { sku: "B", cents: 550, qty: 1 }];
    expect(orderTotal(items)).toBe(2550);
  });

  it("applies the coupon percentage", () => {
    expect(orderTotal([{ sku: "A", cents: 1000, qty: 1 }], 10)).toBe(900);
  });

  it("returns zero for an empty cart", () => {
    expect(orderTotal([])).toBe(0);
  });

  it.each([-1, 101])("rejects coupon %i", (pct) => {
    expect(() => orderTotal([], pct)).toThrow(RangeError);
  });
});`),
      p(["Note que os casos cobrem o caminho feliz, o limite (carrinho vazio) e a entrada inválida. Dinheiro aparece em centavos inteiros, por causa dos erros de arredondamento de ponto flutuante. Nomes de teste devem ler como especificação: *soma preço vezes quantidade*, não *test1*.", "Note that the cases cover the happy path, the boundary (empty cart) and invalid input. Money appears as integer cents because of floating-point rounding errors. Test names should read like a specification: *sums price times quantity*, not *test1*."]),

      h(["Mocks, stubs, fakes e spies", "Mocks, stubs, fakes and spies"]),
      p(["Para isolar uma unidade você troca suas dependências por substitutos, chamados genericamente de *test doubles*. Os termos têm significados distintos, e conhecê-los evita testes confusos.", "To isolate a unit you swap its dependencies for stand-ins, generically called *test doubles*. The terms have distinct meanings, and knowing them avoids confusing tests."]),
      table([["Tipo", "Type"], ["O que faz", "What it does"], ["Verifica chamadas?", "Verifies calls?"], ["Exemplo", "Example"]],
        [["Dummy", "Dummy"], ["Preenche um parâmetro obrigatório que nunca é usado", "Fills a required parameter that is never used"], ["Não", "No"], ["Um logger vazio", "An empty logger"]],
        [["Stub", "Stub"], ["Devolve respostas fixas", "Returns canned answers"], ["Não", "No"], ["Um cliente de câmbio que sempre devolve 5,00", "An FX client that always returns 5.00"]],
        [["Spy", "Spy"], ["Registra como foi chamado, para conferir depois", "Records how it was called, to check afterwards"], ["Sim, depois", "Yes, afterwards"], ["Um e-mail sender que guarda as mensagens", "An email sender that stores messages"]],
        [["Mock", "Mock"], ["Tem expectativas pré-programadas e falha se não forem cumpridas", "Has pre-programmed expectations and fails if unmet"], ["Sim, por construção", "Yes, by design"], ["`expect(pay).toHaveBeenCalledWith(...)`", "`expect(pay).toHaveBeenCalledWith(...)`"]],
        [["Fake", "Fake"], ["Implementação simples e funcional, imprópria para produção", "Simple working implementation, unfit for production"], ["Não", "No"], ["Repositório em memória", "In-memory repository"]],
      ),
      p(["A regra prática é **preferir fakes e stubs**, que testam o resultado, a mocks, que testam a conversa. Um teste cheio de `toHaveBeenCalledWith` acopla-se à implementação: qualquer refatoração que mantenha o comportamento, mas mude a sequência de chamadas, o quebra. Use mocks quando a interação *é* o comportamento (garantir que a cobrança foi enviada exatamente uma vez).", "The rule of thumb is to **prefer fakes and stubs**, which test the outcome, over mocks, which test the conversation. A test full of `toHaveBeenCalledWith` is coupled to the implementation: any refactor that keeps behavior but changes the call sequence breaks it. Use mocks when the interaction *is* the behavior (making sure the charge was sent exactly once)."]),
      code(`// A port the domain depends on
interface UserRepo {
  save(u: User): Promise<void>;
  byEmail(email: string): Promise<User | null>;
}

// Fake: a tiny, working implementation
class InMemoryUserRepo implements UserRepo {
  private rows = new Map<string, User>();
  async save(u: User) { this.rows.set(u.email, u); }
  async byEmail(email: string) { return this.rows.get(email) ?? null; }
}

it("does not register the same email twice", async () => {
  const repo = new InMemoryUserRepo();
  const svc = new SignupService(repo, fakeClock(new Date("2026-01-01")));
  await svc.register("ana@example.com");
  await expect(svc.register("ana@example.com")).rejects.toThrow("email taken");
});`),

      h(["TDD: escrever o teste primeiro", "TDD: writing the test first"]),
      p(["No **desenvolvimento orientado a testes** o ciclo é *red, green, refactor*: escreva um teste que falha (vermelho), faça o mínimo de código para passar (verde) e então melhore o desenho com a segurança do teste (refatorar). Os benefícios são concretos: o código nasce testável (injeção de dependência surge naturalmente), as interfaces são pensadas do ponto de vista de quem usa e a suíte cresce junto com o produto. Os limites também: TDD rende menos em exploração de UI e em protótipos descartáveis, e testar antes de entender o problema gera testes que precisam ser reescritos. Usar TDD para regras de negócio e algoritmos, e não para tudo, costuma ser o equilíbrio.", "In **test-driven development** the cycle is *red, green, refactor*: write a failing test (red), write the minimum code to pass (green) and then improve the design with the test as a safety net (refactor). The benefits are concrete: the code is born testable (dependency injection arises naturally), interfaces are designed from the caller's viewpoint and the suite grows with the product. So are the limits: TDD pays less in UI exploration and throwaway prototypes, and testing before understanding the problem produces tests that must be rewritten. Using TDD for business rules and algorithms, not for everything, is usually the balance."]),

      h(["Testes de integração com Testcontainers", "Integration tests with Testcontainers"]),
      p(["Um teste de integração verifica que as peças reais funcionam juntas: que o SQL é válido, que a migração cria o esquema esperado, que a mensagem serializada é entendida pelo consumidor. O erro clássico é substituir o banco por um mock ou por um banco diferente (SQLite no lugar de PostgreSQL), o que esconde diferenças de dialeto, tipos e comportamento de transação. A solução moderna é o **Testcontainers**: uma biblioteca que sobe contêineres Docker descartáveis (PostgreSQL, Redis, Kafka, LocalStack) durante o teste e os destrói no fim. O banco é o mesmo da produção, o ambiente é limpo a cada execução e nenhum desenvolvedor precisa instalar nada além do Docker.", "An integration test verifies that real pieces work together: that the SQL is valid, that the migration creates the expected schema, that the serialized message is understood by the consumer. The classic mistake is replacing the database with a mock or a different database (SQLite instead of PostgreSQL), which hides differences in dialect, types and transaction behavior. The modern answer is **Testcontainers**: a library that starts disposable Docker containers (PostgreSQL, Redis, Kafka, LocalStack) during the test and destroys them at the end. The database is the production one, the environment is clean on every run and no developer needs to install anything beyond Docker."]),
      code(`import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";
import { beforeAll, afterAll, it, expect } from "vitest";
import { OrderRepository } from "./order-repository";

let pg: StartedPostgreSqlContainer;
let client: Client;

beforeAll(async () => {
  pg = await new PostgreSqlContainer("postgres:16-alpine").start();
  client = new Client({ connectionString: pg.getConnectionUri() });
  await client.connect();
  await client.query("CREATE TABLE orders (id serial PRIMARY KEY, email text NOT NULL, cents int NOT NULL)");
}, 60_000);

afterAll(async () => {
  await client.end();
  await pg.stop();
});

it("persists and reads back an order", async () => {
  const repo = new OrderRepository(client);
  const id = await repo.create({ email: "ana@example.com", cents: 2550 });
  expect(await repo.byId(id)).toMatchObject({ email: "ana@example.com", cents: 2550 });
});`),
      p(["Para manter a suíte rápida, suba o contêiner **uma vez por arquivo ou por execução** (não por teste) e isole os testes limpando as tabelas entre eles ou usando uma transação revertida ao final. Aplique as mesmas migrações da produção, não um esquema reescrito à mão, para que o teste também valide o caminho de migração.", "To keep the suite fast, start the container **once per file or per run** (not per test) and isolate tests by truncating tables between them or by using a transaction rolled back at the end. Apply the same migrations as production, not a hand-rewritten schema, so the test also validates the migration path."]),
      ul(
        ["Teste a fronteira com o mundo externo usando servidores falsos para APIs de terceiros (WireMock, MSW, nock), nunca a API real, que é lenta, limitada e instável.", "Test the boundary with the outside world using fake servers for third-party APIs (WireMock, MSW, nock), never the real API, which is slow, rate limited and unstable."],
        ["Para filas e streams, verifique o efeito: publique uma mensagem, espere o consumidor processar e confira o banco. Use espera com limite de tempo e condição, não `sleep` fixo.", "For queues and streams, check the effect: publish a message, wait for the consumer to process it and check the database. Use a bounded wait on a condition, not a fixed `sleep`."],
        ["Teste idempotência: entregar a mesma mensagem duas vezes não pode duplicar o pedido.", "Test idempotency: delivering the same message twice must not duplicate the order."],
      ),

      h(["Contract testing em microsserviços", "Contract testing in microservices"]),
      p(["Com microsserviços, subir todos os serviços para testar é lento e frágil, e testes unitários com mocks podem mentir: o mock do consumidor diz que o provedor devolve `price`, mas o provedor renomeou o campo para `amount` na semana passada. O **contract testing** resolve isso com um acordo executável. Com o **Pact**, o fluxo é este: o time do consumidor escreve testes que descrevem o que espera da API (requisição e resposta mínima); o Pact gera um arquivo de contrato (pact); o contrato é publicado em um *broker*; o provedor baixa o contrato e o reproduz contra sua implementação real na própria pipeline. Se o provedor remover ou renomear algo em uso, o build dele falha antes do deploy, e o `can-i-deploy` do broker impede a promoção de versões incompatíveis.", "With microservices, bringing every service up to test is slow and brittle, and unit tests with mocks can lie: the consumer's mock says the provider returns `price`, but the provider renamed the field to `amount` last week. **Contract testing** solves this with an executable agreement. With **Pact** the flow is: the consumer team writes tests describing what it expects from the API (request and minimal response); Pact generates a contract file (the pact); the contract is published to a *broker*; the provider downloads it and replays it against its real implementation in its own pipeline. If the provider removes or renames something in use, its build fails before deploy, and the broker's `can-i-deploy` blocks promotion of incompatible versions."]),
      fig(["Fluxo de contract testing com Pact", "Contract testing flow with Pact"],
        [[node("cons", ["Teste do consumidor", "Consumer test"], "client")], [node("pact", ["Arquivo de contrato (pact)", "Contract file (pact)"], "data")], [node("brk", ["Pact Broker", "Pact Broker"], "service")], [node("prov", ["Verificação no provedor", "Provider verification"], "service")], [node("gate", ["can-i-deploy", "can-i-deploy"], "edge")]],
        [edge("cons", "pact", ["gera", "generates"]), edge("pact", "brk", ["publica", "publishes"]), edge("brk", "prov", ["baixa", "pulls"]), edge("prov", "gate", ["resultado", "result"])]),
      p(["O contrato **não** substitui testes de comportamento do provedor: ele só afirma a *forma* da conversa (campos, tipos, status). Mantenha-o enxuto: descreva apenas o que o consumidor realmente usa, para que o provedor continue livre para evoluir o resto. Para APIs públicas e muitos consumidores desconhecidos, a alternativa é validar a implementação contra uma especificação OpenAPI.", "The contract does **not** replace the provider's behavior tests: it only asserts the *shape* of the conversation (fields, types, status). Keep it lean: describe only what the consumer actually uses, so the provider stays free to evolve the rest. For public APIs with many unknown consumers, the alternative is validating the implementation against an OpenAPI specification."]),

      h(["Testando o que dá errado", "Testing what goes wrong"]),
      p(["Sistemas distribuídos quebram nos caminhos de falha, e é neles que os testes costumam ser mais fracos. Cubra de propósito: timeout da dependência, resposta 500 e 429, conexão cortada no meio, mensagem duplicada, mensagem fora de ordem, relógio adiantado e retry em operação não idempotente. Para determinismo, **injete o tempo e o aleatório** (um relógio falso, um gerador com semente), em vez de chamar `Date.now()` e `Math.random()` dentro da lógica. **Testes de propriedade** (fast-check, Hypothesis) complementam exemplos fixos: em vez de três entradas escolhidas à mão, você declara uma propriedade (inverter a lista duas vezes devolve a original) e a ferramenta gera centenas de entradas, reduzindo o caso que falhou ao menor exemplo. Em partes críticas, a injeção de falhas (chaos engineering) leva a ideia ao ambiente real.", "Distributed systems break on failure paths, and that is where tests are usually weakest. Cover on purpose: dependency timeout, 500 and 429 responses, connection cut midway, duplicate message, out-of-order message, clock skew and retry on a non-idempotent operation. For determinism, **inject time and randomness** (a fake clock, a seeded generator) instead of calling `Date.now()` and `Math.random()` inside the logic. **Property-based tests** (fast-check, Hypothesis) complement fixed examples: instead of three hand-picked inputs, you declare a property (reversing a list twice returns the original) and the tool generates hundreds of inputs, shrinking the failing case to the smallest example. In critical parts, fault injection (chaos engineering) carries the idea into the real environment."]),

      h(["Testes intermitentes (flaky)", "Flaky tests"]),
      p(["Um teste **flaky** passa e falha sem que o código tenha mudado. É um dos piores problemas de uma suíte, porque ensina o time a clicar em *rodar de novo* e a ignorar o vermelho; quando um defeito real aparece, ninguém acredita nele. As causas se repetem:", "A **flaky** test passes and fails without the code changing. It is one of the worst problems in a suite because it teaches the team to click *re-run* and ignore red; when a real defect appears, nobody believes it. The causes repeat:"]),
      ul(
        ["**Tempo**: `sleep` fixo, dependência de horário, fusos e virada de dia. Use relógio injetável e espera por condição.", "**Time**: fixed `sleep`, dependence on time of day, time zones and day rollover. Use an injectable clock and wait on a condition."],
        ["**Estado compartilhado**: um teste deixa dados que afetam o seguinte, ou a ordem de execução importa. Isole dados por teste e rode em ordem aleatória para expor o problema.", "**Shared state**: one test leaves data that affects the next, or execution order matters. Isolate data per test and run in random order to expose it."],
        ["**Concorrência**: condições de corrida no código ou no próprio teste. Prefira sincronização explícita a esperas.", "**Concurrency**: race conditions in the code or in the test itself. Prefer explicit synchronization to waits."],
        ["**Ambiente externo**: rede, serviços de terceiros, portas ocupadas. Substitua por servidores locais e portas aleatórias.", "**External environment**: network, third-party services, busy ports. Replace with local servers and random ports."],
        ["**Recursos**: CI lento sob carga estoura timeouts apertados demais.", "**Resources**: a slow CI under load overruns timeouts that are too tight."],
      ),
      p(["Trate o problema como defeito de verdade: coloque o teste em quarentena (sai do caminho crítico, mas continua visível), abra um ticket com dono e prazo e conserte ou apague em dias. Mecanismos de *retry* automático escondem o sintoma; use-os, se muito, para E2E, e meça a taxa de intermitência por teste.", "Treat it as a real defect: quarantine the test (off the critical path but still visible), open a ticket with an owner and a deadline and fix or delete it within days. Automatic *retry* mechanisms hide the symptom; use them, if at all, for E2E, and measure the flake rate per test."]),

      h(["Cobertura de testes", "Test coverage"]),
      p(["A **cobertura** mede qual fração do código foi executada pelos testes: de linhas, de ramos (cada `if` nos dois sentidos) ou de condições. É um bom detector de *lacunas*: código com 0% de cobertura certamente não está verificado. Mas é um péssimo detector de *qualidade*: um teste sem nenhuma asserção executa o código e dá 100%. Metas rígidas (exigir 90% em todo pull request) incentivam testes vazios para satisfazer o número. Uma alternativa mais honesta é o **teste de mutação** (Stryker, PIT), que altera o código (troca `>` por `>=`, remove uma linha) e verifica se algum teste falha; mutantes que sobrevivem apontam testes que não verificam nada.", "**Coverage** measures what fraction of the code the tests executed: lines, branches (every `if` both ways) or conditions. It is a good detector of *gaps*: code with 0% coverage is certainly unverified. But it is a poor detector of *quality*: a test with no assertions runs the code and yields 100%. Hard targets (demanding 90% on every pull request) encourage empty tests to satisfy the number. A more honest alternative is **mutation testing** (Stryker, PIT), which alters the code (swaps `>` for `>=`, deletes a line) and checks whether any test fails; surviving mutants point at tests that verify nothing."]),
      ul(
        ["Use a cobertura para achar o que falta testar e acompanhe a *tendência*, não um número absoluto.", "Use coverage to find what is untested and follow the *trend*, not an absolute number."],
        ["Cobertura alta em regras de negócio e baixa em código de cola (configuração, getters) é razoável.", "High coverage on business rules and low on glue code (configuration, getters) is reasonable."],
      ),

      h(["Vantagens, custos e erros comuns", "Benefits, costs and common mistakes"]),
      ul(
        ["**Vantagens**: refatoração segura, defeitos achados cedo, documentação executável do comportamento, deploys frequentes e confiança para mudar.", "**Benefits**: safe refactoring, defects found early, executable documentation of behavior, frequent deploys and confidence to change."],
        ["**Custos**: tempo de escrita e de manutenção, suíte lenta se mal desenhada, falsa sensação de segurança com testes que não verificam nada.", "**Costs**: writing and maintenance time, a slow suite if badly designed, false security from tests that verify nothing."],
        ["**Erro: mockar tudo.** O teste passa, o sistema quebra, porque a integração real nunca foi exercitada.", "**Mistake: mocking everything.** The test passes, the system breaks, because the real integration was never exercised."],
        ["**Erro: testar a implementação.** Testes que espelham o código quebram a cada refatoração e deixam de proteger.", "**Mistake: testing the implementation.** Tests that mirror the code break on every refactor and stop protecting."],
        ["**Erro: pirâmide invertida.** Dezenas de E2E lentos e nenhum unitário geram suítes de uma hora e diagnóstico difícil.", "**Mistake: inverted pyramid.** Dozens of slow E2E and no unit tests produce hour-long suites and hard diagnosis."],
        ["**Erro: testes que dependem uns dos outros** ou de dados que 'já estão no banco'.", "**Mistake: tests that depend on each other** or on data that is 'already in the database'."],
      ),
      p(["Em casos reais, empresas com deploy contínuo (Spotify e a ThoughtWorks, por exemplo, publicaram bastante sobre isso) combinam muitos testes rápidos locais, contract tests entre times e poucos testes em produção com monitoramento. A mensagem comum é que a confiança vem de camadas complementares, não de um único tipo de teste.", "In real cases, companies with continuous deployment (Spotify and ThoughtWorks, for instance, have published widely on it) combine many fast local tests, contract tests between teams and a few tests in production with monitoring. The common message is that confidence comes from complementary layers, not from a single kind of test."]),

      h(["Resumo", "Summary"]),
      ul(
        ["Distribua os testes por custo: muitos unitários rápidos, integração nas fronteiras, poucos E2E.", "Spread tests by cost: many fast unit tests, integration at the boundaries, few E2E."],
        ["Prefira fakes e stubs a mocks; teste comportamento, não implementação.", "Prefer fakes and stubs to mocks; test behavior, not implementation."],
        ["Use Testcontainers para testar contra o banco e a fila reais, de forma descartável.", "Use Testcontainers to test against the real database and queue, disposably."],
        ["Contract tests (Pact) evitam quebras de API entre times sem subir tudo.", "Contract tests (Pact) prevent API breakage between teams without bringing everything up."],
        ["Cubra falhas, injete tempo e aleatório e elimine testes flaky rapidamente.", "Cover failures, inject time and randomness and eliminate flaky tests quickly."],
        ["Cobertura mostra lacunas, não qualidade; teste de mutação mede o valor real.", "Coverage shows gaps, not quality; mutation testing measures real value."],
      ),

      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Quantos testes de cada tipo devo ter?** Não há proporção fixa. Comece pelos riscos: muita lógica, muitos unitários; muita integração, mais testes de integração; e poucos E2E para os fluxos que não podem falhar.", "**How many tests of each type should I have?** There is no fixed ratio. Start from the risks: much logic, many unit tests; much integration, more integration tests; and few E2E for the flows that must not fail."],
        ["**Posso usar SQLite em vez de PostgreSQL nos testes?** Evite: dialeto, tipos, índices e isolamento de transação diferem. Com Testcontainers, usar o banco real custa pouco.", "**Can I use SQLite instead of PostgreSQL in tests?** Avoid it: dialect, types, indexes and transaction isolation differ. With Testcontainers, using the real database costs little."],
        ["**TDD é obrigatório?** Não. É uma técnica útil para lógica de negócio. O que importa é que o código tenha testes bons, não a ordem em que foram escritos.", "**Is TDD mandatory?** No. It is a useful technique for business logic. What matters is that the code has good tests, not the order they were written in."],
        ["**Cobertura de 100% garante ausência de bugs?** Não: garante que cada linha rodou, não que o resultado foi verificado.", "**Does 100% coverage guarantee no bugs?** No: it guarantees each line ran, not that the result was checked."],
      ),
      tip(["Um teste intermitente é pior que nenhum: ensina o time a ignorar o vermelho. Conserte ou apague em até alguns dias.", "A flaky test is worse than none: it teaches the team to ignore red. Fix it or delete it within days."]),
    ] },

  { id: "testes-de-carga-e-estresse", section: "operacao", level: 1, icon: "speed", minutes: 13,
    title: ["Testes de carga e estresse", "Load and stress testing"],
    summary: ["Carga, estresse, soak e spike: diferenças, k6, Locust e JMeter, percentis, ponto de joelho, critérios de aprovação e capacity planning.", "Load, stress, soak and spike: differences, k6, Locust and JMeter, percentiles, the knee point, pass criteria and capacity planning."],
    body: [
      p(["Funcionar com 10 usuários não diz nada sobre 10 mil. Um sistema que responde bem em desenvolvimento pode engasgar quando o pool de conexões se esgota, quando uma consulta sem índice encontra uma tabela de 50 milhões de linhas ou quando o garbage collector começa a pausar sob pressão de memória. Esses problemas só aparecem com volume, e descobri-los durante uma campanha de marketing é o pior momento possível. Os **testes de carga** existem para responder, antes de o usuário perguntar: quantas requisições por segundo aguentamos, onde está o gargalo e o que acontece quando passamos do limite.", "Working with 10 users says nothing about 10 thousand. A system that behaves well in development can choke when the connection pool runs out, when a query without an index meets a 50-million-row table or when the garbage collector starts pausing under memory pressure. These problems only show up with volume, and finding them during a marketing campaign is the worst possible moment. **Load tests** exist to answer, before users ask: how many requests per second can we take, where is the bottleneck and what happens past the limit."]),
      p(["Testar performance é uma atividade de engenharia, não de ferramenta: exige hipóteses, um ambiente comparável à produção, dados realistas e a disciplina de mudar uma variável por vez. Este artigo cobre os tipos de teste, as ferramentas, as métricas que importam, como ler a curva de saturação e como transformar os resultados em critérios automáticos de aprovação e em planejamento de capacidade.", "Performance testing is an engineering activity, not a tool activity: it requires hypotheses, a production-like environment, realistic data and the discipline of changing one variable at a time. This article covers the kinds of test, the tools, the metrics that matter, how to read the saturation curve and how to turn results into automatic pass criteria and capacity planning."]),

      h(["Os tipos de teste de performance", "Types of performance test"]),
      p(["Os nomes variam entre autores, mas a distinção a seguir é a mais usada. O que muda entre eles é o **perfil de carga no tempo** e a **pergunta** que cada um responde.", "Names vary between authors, but the following distinction is the most widely used. What differs between them is the **load profile over time** and the **question** each answers."]),
      table([["Tipo", "Type"], ["Perfil de carga", "Load profile"], ["Duração típica", "Typical duration"], ["Pergunta que responde", "Question it answers"], ["Problemas que revela", "Problems it reveals"]],
        [["Smoke", "Smoke"], ["Mínima, 1 a 5 usuários", "Minimal, 1 to 5 users"], ["Segundos a minutos", "Seconds to minutes"], ["O script e o ambiente funcionam?", "Do the script and environment work?"], ["Erros de script, ambiente quebrado", "Script errors, broken environment"]],
        [["Load", "Load"], ["Carga esperada e pico previsto, estável", "Expected load and forecast peak, steady"], ["15 a 60 min", "15 to 60 min"], ["Cumprimos as metas de latência com a carga normal?", "Do we meet latency targets under normal load?"], ["Consultas lentas, pools pequenos", "Slow queries, small pools"]],
        [["Stress", "Stress"], ["Cresce além do limite até quebrar", "Grows past the limit until it breaks"], ["30 a 60 min", "30 to 60 min"], ["Onde quebra e *como* quebra?", "Where and *how* does it break?"], ["Colapso em cascata, falta de backpressure", "Cascading collapse, missing backpressure"]],
        [["Soak (endurance)", "Soak (endurance)"], ["Moderada e constante por muito tempo", "Moderate and constant for a long time"], ["4 a 72 h", "4 to 72 h"], ["Aguenta dias de operação?", "Does it hold up over days of operation?"], ["Vazamento de memória e conexões, disco enchendo, logs", "Memory and connection leaks, filling disks, logs"]],
        [["Spike", "Spike"], ["Salto brusco (10x em segundos) e queda", "Sudden jump (10x in seconds) and drop"], ["10 a 30 min", "10 to 30 min"], ["Absorve picos súbitos e se recupera?", "Does it absorb sudden peaks and recover?"], ["Autoscaling lento, cache frio, filas estourando", "Slow autoscaling, cold cache, overflowing queues"]],
        [["Breakpoint", "Breakpoint"], ["Rampa lenta e contínua até falhar", "Slow continuous ramp until failure"], ["Até o limite", "Until the limit"], ["Qual a capacidade máxima?", "What is the maximum capacity?"], ["O gargalo e o ponto de saturação", "The bottleneck and saturation point"]],
      ),
      p(["Na prática, comece sempre por um *smoke* para validar o script, depois um *load* na carga esperada (que é a linha de base) e só então os testes que forçam o sistema. Se o teste de carga normal já falha, estressar não acrescenta nada.", "In practice, always start with a *smoke* test to validate the script, then a *load* test at the expected load (the baseline) and only then the tests that push the system. If the normal load test already fails, stressing adds nothing."]),

      h(["Modelo aberto, modelo fechado e coordinated omission", "Open model, closed model and coordinated omission"]),
      p(["Há duas formas de gerar carga. No **modelo fechado**, um número fixo de usuários virtuais faz uma requisição, espera a resposta, pensa um pouco e repete. A taxa de chegada depende da velocidade do servidor: se ele fica lento, os usuários virtuais passam mais tempo esperando e enviam menos requisições. No **modelo aberto**, requisições chegam numa taxa fixa por segundo, independentemente de as anteriores terem terminado, como acontece na internet real, onde novos usuários não esperam que os antigos sejam atendidos.", "There are two ways to generate load. In the **closed model**, a fixed number of virtual users make a request, wait for the response, think for a while and repeat. The arrival rate depends on server speed: if it slows down, virtual users spend more time waiting and send fewer requests. In the **open model**, requests arrive at a fixed rate per second regardless of whether earlier ones finished, as on the real internet, where new users do not wait for old ones to be served."]),
      p(["O problema do modelo fechado é a **coordinated omission** (omissão coordenada): quando o servidor trava por 5 segundos, o gerador de carga também trava e deixa de registrar as requisições que *teriam* sido feitas e esperado nesse intervalo. Os percentis saem artificialmente bons, e o teste esconde justamente o problema. Prefira geradores em modelo aberto (no k6, o executor `constant-arrival-rate`; no Gatling, injeção por taxa) ou ferramentas que corrigem a omissão, como o wrk2.", "The problem with the closed model is **coordinated omission**: when the server stalls for 5 seconds, the load generator also stalls and fails to record the requests that *would* have been made and waited in that interval. Percentiles come out artificially good, and the test hides exactly the problem. Prefer open-model generators (in k6, the `constant-arrival-rate` executor; in Gatling, rate-based injection) or tools that correct for the omission, such as wrk2."]),

      h(["Ferramentas: k6, Locust e JMeter", "Tools: k6, Locust and JMeter"]),
      table([["Ferramenta", "Tool"], ["Linguagem do script", "Script language"], ["Pontos fortes", "Strengths"], ["Pontos fracos", "Weaknesses"]],
        [["k6", "k6"], ["JavaScript (motor em Go)", "JavaScript (Go engine)"], ["Leve, ótimo para CI, limites (thresholds) embutidos, executores de modelo aberto", "Light, great for CI, built-in thresholds, open-model executors"], ["Sem navegador real por padrão, ecossistema menor que o do JMeter", "No real browser by default, smaller ecosystem than JMeter"]],
        [["Locust", "Locust"], ["Python", "Python"], ["Cenários em código comum, distribuído, painel web", "Scenarios in plain code, distributed, web dashboard"], ["Geração de carga por processo é mais pesada; modelo fechado por padrão", "Per-process load generation is heavier; closed model by default"]],
        [["JMeter", "JMeter"], ["Interface gráfica e XML", "GUI and XML"], ["Muitos protocolos (HTTP, JDBC, JMS), plugins, relatórios", "Many protocols (HTTP, JDBC, JMS), plugins, reports"], ["Pesado, planos XML difíceis de revisar e versionar", "Heavy, XML plans hard to review and version"]],
        [["Gatling", "Gatling"], ["Scala, Java ou Kotlin", "Scala, Java or Kotlin"], ["Eficiente, relatórios HTML bons, modelo aberto", "Efficient, good HTML reports, open model"], ["Curva de aprendizado da linguagem", "Language learning curve"]],
      ),
      p(["O script k6 abaixo define dois cenários: uma rampa de carga em modelo aberto e limites de aprovação. Se algum limite for violado, o k6 termina com código de saída diferente de zero e a pipeline falha.", "The k6 script below defines a load ramp in the open model and pass thresholds. If any threshold is violated, k6 exits with a non-zero code and the pipeline fails."]),
      code(`// checkout-load.js  (run with: k6 run checkout-load.js)
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    steady: {
      executor: "ramping-arrival-rate",   // open model: fixed arrival rate
      startRate: 50,
      timeUnit: "1s",
      preAllocatedVUs: 200,
      maxVUs: 1000,
      stages: [
        { target: 200, duration: "2m" },  // ramp up to 200 req/s
        { target: 200, duration: "10m" }, // hold
        { target: 0,   duration: "1m" },  // ramp down
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],                  // errors under 1%
    http_req_duration: ["p(95)<300", "p(99)<800"],   // latency in ms
    "http_req_duration{endpoint:search}": ["p(95)<200"],
  },
};

export default function () {
  const res = http.get(__ENV.BASE_URL + "/api/search?q=shoes", {
    tags: { endpoint: "search" },
  });
  check(res, {
    "status is 200": (r) => r.status === 200,
    "has results": (r) => r.json("items").length > 0,
  });
  sleep(Math.random() * 2);   // think time
}`),
      p(["O equivalente em Locust, mais próximo de código Python comum, descreve o comportamento de um usuário e os pesos de cada tarefa:", "The Locust equivalent, closer to plain Python code, describes a user's behavior and the weight of each task:"]),
      code(`# locustfile.py  (run with: locust -f locustfile.py --host https://staging.example.com)
from locust import HttpUser, task, between

class Shopper(HttpUser):
    wait_time = between(1, 3)          # think time in seconds

    @task(8)                           # 8 of every 10 actions
    def search(self):
        self.client.get("/api/search?q=shoes", name="/api/search")

    @task(2)
    def add_to_cart(self):
        with self.client.post("/api/cart", json={"sku": "A-100", "qty": 1},
                              catch_response=True) as resp:
            if resp.status_code != 201:
                resp.failure("unexpected status " + str(resp.status_code))`),
      p(["No JMeter, o plano é montado na interface (grupo de threads, amostradores HTTP, asserções e *listeners*) e executado em modo não gráfico (`jmeter -n -t plan.jmx -l results.jtl`) na pipeline. A interface serve para desenhar o teste, não para rodá-lo: a GUI consome recursos que distorcem o resultado.", "In JMeter the plan is built in the UI (thread group, HTTP samplers, assertions and *listeners*) and run in non-GUI mode (`jmeter -n -t plan.jmx -l results.jtl`) in the pipeline. The UI is for designing the test, not running it: the GUI consumes resources that distort the result."]),

      h(["Métricas que importam", "Metrics that matter"]),
      ul(
        ["**Latência por percentil**: p50 é o usuário típico; **p95** e **p99** descrevem a cauda. Médias enganam: 99 respostas de 50 ms e uma de 5 s dão média de 99 ms, que não representa ninguém. Com 1.000 req/s, o p99 afeta 10 usuários por segundo; e se uma página faz 20 chamadas, a chance de o usuário sentir pelo menos uma lenta é grande (efeito da *latência de cauda em escala*).", "**Latency by percentile**: p50 is the typical user; **p95** and **p99** describe the tail. Averages mislead: 99 responses of 50 ms and one of 5 s average 99 ms, which represents nobody. At 1,000 req/s, p99 affects 10 users every second; and if a page makes 20 calls, the chance that the user feels at least one slow call is high (the *tail latency at scale* effect)."],
        ["**Throughput (vazão)**: requisições (ou transações) por segundo que o sistema completa com sucesso. Meça o que foi *servido*, não o que foi *enviado*.", "**Throughput**: requests (or transactions) per second the system completes successfully. Measure what was *served*, not what was *sent*."],
        ["**Taxa de erro**: separe 4xx (erro do cliente, geralmente do script) de 5xx e timeouts. Um sistema que 'está rápido' devolvendo 500 não está bem.", "**Error rate**: separate 4xx (client error, usually the script) from 5xx and timeouts. A system that is 'fast' because it returns 500 is not fine."],
        ["**Saturação dos recursos**: CPU, memória, conexões do pool, threads, descritores de arquivo, IOPS de disco, banda de rede, profundidade de filas. O método USE (utilização, saturação, erros) por recurso ajuda a achar o gargalo.", "**Resource saturation**: CPU, memory, pool connections, threads, file descriptors, disk IOPS, network bandwidth, queue depth. The USE method (utilization, saturation, errors) per resource helps find the bottleneck."],
        ["**Lei de Little**: o número médio de requisições em andamento é igual à taxa de chegada vezes o tempo médio de resposta (L = λ × W). Com 500 req/s e 200 ms de resposta, há em média 100 requisições simultâneas, o que dimensiona threads e conexões.", "**Little's law**: the average number of in-flight requests equals the arrival rate times the average response time (L = λ × W). With 500 req/s and 200 ms response time, there are on average 100 simultaneous requests, which sizes threads and connections."],
      ),

      h(["A curva de carga e o ponto de joelho", "The load curve and the knee point"]),
      p(["Ao subir a carga gradualmente e plotar vazão e latência, o comportamento típico tem três regiões. Na primeira, a vazão cresce de forma linear com a carga e a latência fica quase plana. Chega-se então ao **joelho** (*knee*): algum recurso começa a saturar, a latência passa a subir e a vazão cresce cada vez menos. Depois do joelho, filas se formam, a latência dispara, timeouts e retentativas geram ainda mais carga e a vazão *cai*: é o colapso.", "When you raise load gradually and plot throughput and latency, typical behavior has three regions. In the first, throughput grows linearly with load and latency stays nearly flat. Then comes the **knee**: some resource starts to saturate, latency begins to climb and throughput grows less and less. Past the knee, queues form, latency shoots up, timeouts and retries add even more load and throughput *falls*: collapse."]),
      fig(["As três regiões da curva de carga", "The three regions of the load curve"],
        [[node("lin", ["Região linear", "Linear region"], "service")], [node("knee", ["Joelho: um recurso satura", "Knee: a resource saturates"], "cache")], [node("sat", ["Saturação: filas e latência sobem", "Saturation: queues and latency climb"], "queue")], [node("col", ["Colapso: vazão cai, erros e retries", "Collapse: throughput drops, errors and retries"], "ext")]],
        [edge("lin", "knee", ["+ carga", "+ load"]), edge("knee", "sat", ["+ carga", "+ load"]), edge("sat", "col", ["+ carga", "+ load"])]),
      code(`throughput                              latency (p95)
   ^                  ____                  ^                      /
   |           ____---     ---__            |                     /
   |      __---                  --__       |                   _/
   |   _--          ^ knee           \\      |             __---
   |_--                                \\    |_____------
   +--------------------------> load       +--------------------------> load
        linear      saturation  collapse`),
      p(["A **capacidade utilizável** do sistema é a carga um pouco *antes* do joelho, nunca o máximo observado. Operar sempre no limite deixa zero margem para picos, falhas de instância e deploys. Um sistema saudável sob sobrecarga deve **degradar com elegância**: rejeitar o excesso rápido com 429 ou 503 (*load shedding*), em vez de aceitar tudo e falhar lentamente; usar *backpressure* e limites de fila; e desligar funcionalidades não essenciais (*circuit breakers*, modos degradados).", "The system's **usable capacity** is the load slightly *before* the knee, never the observed maximum. Always operating at the limit leaves zero margin for spikes, instance failures and deploys. A healthy system under overload should **degrade gracefully**: reject the excess fast with 429 or 503 (*load shedding*) instead of accepting everything and failing slowly; use *backpressure* and queue limits; and turn off non-essential features (*circuit breakers*, degraded modes)."]),

      h(["Preparando um teste confiável", "Preparing a reliable test"]),
      ul(
        ["**Ambiente parecido com produção**: mesmo tipo de instância, mesma configuração de banco e rede, mesma topologia. Um teste em máquinas menores pode ser extrapolado, mas com cuidado, porque o gargalo muda de lugar.", "**Production-like environment**: same instance type, same database and network configuration, same topology. A test on smaller machines can be extrapolated, but carefully, because the bottleneck moves."],
        ["**Dados em volume realista**: uma tabela com 1.000 linhas faz qualquer consulta parecer rápida. Gere dados com a distribuição real (chaves muito acessadas, usuários com milhares de itens).", "**Data at realistic volume**: a 1,000-row table makes any query look fast. Generate data with the real distribution (hot keys, users with thousands of items)."],
        ["**Mix de tráfego representativo**: use a proporção real de leituras e escritas e de endpoints, inspirada em logs de produção ou em um replay de tráfego.", "**Representative traffic mix**: use the real ratio of reads to writes and of endpoints, drawn from production logs or a traffic replay."],
        ["**Gerador não pode ser o gargalo**: monitore CPU e rede das máquinas de teste e distribua a geração se precisar.", "**The generator must not be the bottleneck**: watch CPU and network of the test machines and distribute generation if needed."],
        ["**Aquecimento**: JIT, caches e pools precisam esquentar; descarte os primeiros minutos ou meça-os separadamente (inclusive o caso de cache frio).", "**Warm-up**: JIT, caches and pools need to warm up; discard the first minutes or measure them separately (including the cold-cache case)."],
        ["**Repetibilidade**: rode ao menos três vezes e compare a variação. Um resultado único é anedota.", "**Repeatability**: run at least three times and compare variation. A single result is an anecdote."],
        ["**Dependências de terceiros**: use servidores simulados para gateways de pagamento e e-mail, ou você testará o limite do parceiro e poderá ser bloqueado.", "**Third-party dependencies**: use simulated servers for payment gateways and email, or you will test the partner's limit and may be blocked."],
      ),

      h(["Critérios de aprovação e integração com a pipeline", "Pass criteria and pipeline integration"]),
      p(["Um teste sem critério é só um gráfico. Defina antes de rodar os **objetivos de nível de serviço** (SLOs) que o teste valida, por exemplo: com 200 req/s, p95 abaixo de 300 ms, p99 abaixo de 800 ms, erros abaixo de 1% e CPU média abaixo de 70%. Em uma pipeline, um teste de carga curto (cinco minutos, carga moderada) roda a cada merge ou a cada noite contra um ambiente de staging, e os limites do k6 falham o build ao detectar regressão. Testes longos (soak, stress) rodam em horário agendado. Guarde os resultados históricos para comparar: o valor está na *tendência*, em notar que o p95 subiu 15% em três semanas.", "A test without criteria is just a chart. Before running, define the **service level objectives** (SLOs) the test validates, for example: at 200 req/s, p95 under 300 ms, p99 under 800 ms, errors under 1% and average CPU under 70%. In a pipeline, a short load test (five minutes, moderate load) runs on every merge or every night against a staging environment, and k6 thresholds fail the build on regression. Long tests (soak, stress) run on a schedule. Keep historical results to compare: the value is in the *trend*, in noticing that p95 rose 15% in three weeks."]),
      code(`# Excerpt of a CI job (GitHub Actions)
  perf-smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/setup-k6-action@v1
      - run: k6 run --out json=result.json tests/checkout-load.js
        env:
          BASE_URL: https://staging.example.com
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: k6-result, path: result.json }`),

      h(["Capacity planning e como interpretar os resultados", "Capacity planning and reading the results"]),
      p(["Para planejar capacidade, encontre a **vazão máxima sustentável por instância** dentro das metas de latência, por exemplo 800 req/s a 70% de CPU. Divida o pico previsto por esse número e some folga: para um pico de 6.000 req/s, 6.000 ÷ 800 = 7,5, ou seja, 8 nós; some um nó (N+1) para tolerar a perda de uma instância e mais uma margem de crescimento de 20 a 30%, e chegamos a cerca de 10 nós. Cuidado com recursos que não escalam junto: o banco costuma ser o limite verdadeiro, e dobrar os servidores de aplicação apenas move a fila para ele.", "For capacity planning, find the **maximum sustainable throughput per instance** within latency targets, for example 800 req/s at 70% CPU. Divide the forecast peak by that number and add headroom: for a 6,000 req/s peak, 6,000 ÷ 800 = 7.5, so 8 nodes; add one node (N+1) to tolerate losing an instance and a 20 to 30% growth margin, and we reach about 10 nodes. Beware of resources that do not scale along: the database is often the true limit, and doubling application servers only moves the queue to it."]),
      p(["Ao analisar um resultado ruim, relacione a curva de latência com os recursos: se a latência subiu quando a CPU chegou a 100%, o gargalo é computação; se subiu com CPU baixa, procure espera (pool de conexões esgotado, locks no banco, chamadas a um serviço lento, número de threads). Use traces para ver em que trecho da requisição o tempo se acumula e conserte primeiro o maior gargalo, rodando o teste de novo a cada correção.", "When analyzing a bad result, correlate the latency curve with resources: if latency rose when CPU hit 100%, the bottleneck is compute; if it rose with low CPU, look for waiting (exhausted connection pool, database locks, calls to a slow service, thread count). Use traces to see where in the request time accumulates and fix the biggest bottleneck first, rerunning the test after each fix."]),

      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Testar apenas a média e ignorar p95 e p99.", "Testing only the average and ignoring p95 and p99."],
        ["Reusar o mesmo usuário e o mesmo dado em todas as requisições: o cache esconde o custo real.", "Reusing the same user and the same data on every request: the cache hides the real cost."],
        ["Testar uma só rota quando o tráfego real mistura dezenas.", "Testing a single route when real traffic mixes dozens."],
        ["Não testar a recuperação: depois do pico, o sistema volta ao normal sozinho?", "Not testing recovery: after the peak, does the system return to normal on its own?"],
        ["Rodar o teste a partir da mesma rede e região do servidor, escondendo a latência real do usuário.", "Running the test from the same network and region as the server, hiding real user latency."],
        ["Testar em produção sem aviso e sem plano de abortar.", "Testing in production without notice and without an abort plan."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Carga valida metas; estresse revela como o sistema quebra; soak revela vazamentos; spike testa elasticidade.", "Load validates targets; stress reveals how the system breaks; soak reveals leaks; spike tests elasticity."],
        ["Prefira modelo aberto de geração de carga para evitar a coordinated omission.", "Prefer the open model of load generation to avoid coordinated omission."],
        ["Olhe percentis (p95, p99), vazão, erros e saturação de recursos, nunca só a média.", "Look at percentiles (p95, p99), throughput, errors and resource saturation, never just the average."],
        ["A capacidade utilizável fica antes do joelho da curva; projete para degradar com elegância.", "Usable capacity sits before the knee of the curve; design to degrade gracefully."],
        ["Automatize limites de aprovação na pipeline e acompanhe a tendência histórica.", "Automate pass thresholds in the pipeline and follow the historical trend."],
      ),

      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Posso testar em produção?** Pode, com cuidado: tráfego sintético marcado, limites de taxa, janelas de baixo uso e botão de abortar. Muitas equipes preferem um staging idêntico à produção para os testes pesados.", "**Can I test in production?** You can, carefully: marked synthetic traffic, rate limits, low-usage windows and an abort button. Many teams prefer a production-identical staging for heavy tests."],
        ["**Quantos usuários virtuais devo usar?** Parta da vazão-alvo, não do número de usuários: com a lei de Little, usuários = taxa × (tempo de resposta + tempo de pensar).", "**How many virtual users should I use?** Start from the target throughput, not from user count: by Little's law, users = rate × (response time + think time)."],
        ["**Qual a diferença entre teste de carga e de estresse?** O de carga confirma que a carga esperada cabe nas metas; o de estresse vai além do limite para ver como o sistema falha e se recupera.", "**What is the difference between load and stress testing?** Load confirms that the expected load meets targets; stress goes past the limit to see how the system fails and recovers."],
        ["**Por que meu resultado varia tanto entre execuções?** Ambiente compartilhado, caches frios ou quentes, ruído de vizinhos na nuvem e geradores no limite. Repita e compare distribuições.", "**Why does my result vary so much between runs?** Shared environment, cold or warm caches, noisy cloud neighbors and generators at the limit. Repeat and compare distributions."],
      ),
      tip(["Rode o teste de carga na pipeline com limites (por exemplo, p95 abaixo de 300 ms). Regressões de performance aparecem no pull request, não na sexta à noite.", "Run the load test in the pipeline with thresholds (for example p95 under 300 ms). Performance regressions then show up in the pull request, not on Friday night."]),
    ] },

  { id: "ci-cd", section: "operacao", level: 1, icon: "bolt", minutes: 14,
    title: ["CI/CD e estratégias de deploy", "CI/CD and deployment strategies"],
    summary: ["Pipeline em estágios, GitHub Actions, rolling, blue-green, canary e shadow, feature flags, rollback, migrações expand/contract, Terraform e GitOps.", "Staged pipelines, GitHub Actions, rolling, blue-green, canary and shadow, feature flags, rollback, expand/contract migrations, Terraform and GitOps."],
    body: [
      p(["Antes da automação, publicar uma versão era um evento: semanas de mudanças acumuladas, uma madrugada de domingo, um roteiro manual de 40 passos e um grupo de pessoas torcendo para nada dar errado. Quanto maior o lote de mudanças, maior o risco, e quanto maior o risco, mais raro o deploy, o que aumenta o lote: um ciclo vicioso. **CI/CD** inverte a lógica: fazer deploys pequenos, frequentes e entediantes, de modo que cada um carregue pouco risco e seja fácil de desfazer.", "Before automation, shipping a release was an event: weeks of accumulated changes, a Sunday night, a 40-step manual script and a group of people hoping nothing went wrong. The bigger the batch of changes, the bigger the risk, and the bigger the risk, the rarer the deploy, which enlarges the batch: a vicious circle. **CI/CD** inverts the logic: make small, frequent, boring deploys so that each carries little risk and is easy to undo."]),
      p(["**Integração contínua (CI)** significa juntar o código de todos na branch principal várias vezes ao dia, com build e testes automáticos a cada mudança, de modo que conflitos e defeitos apareçam em minutos. **Entrega contínua (continuous delivery)** estende a ideia: todo commit aprovado fica pronto para ir a produção, e o deploy é uma decisão de negócio, um botão. **Implantação contínua (continuous deployment)** vai além: se todos os testes passam, o deploy para produção acontece sozinho. Este artigo cobre a pipeline, as estratégias de publicação gradual, o controle de mudanças com feature flags, o desafio do banco de dados e a infraestrutura como código.", "**Continuous integration (CI)** means merging everyone's code into the main branch many times a day, with automatic build and tests on every change, so conflicts and defects show up in minutes. **Continuous delivery** extends the idea: every approved commit is ready for production and the deploy is a business decision, a button. **Continuous deployment** goes further: if all tests pass, the production deploy happens on its own. This article covers the pipeline, gradual release strategies, change control with feature flags, the database challenge and infrastructure as code."]),

      h(["Etapas de uma pipeline", "Pipeline stages"]),
      p(["Uma pipeline é uma sequência de estágios automáticos, cada um com um portão (*gate*) de qualidade: se falhar, as etapas seguintes não rodam. A ordem segue o princípio de **falhar rápido**: as verificações baratas e rápidas vêm primeiro, e as caras e lentas só rodam depois que as outras passaram.", "A pipeline is a sequence of automatic stages, each with a quality gate: if it fails, later stages do not run. The order follows the **fail fast** principle: cheap, quick checks come first, and costly, slow ones run only after the others pass."]),
      fig(["Estágios típicos de uma pipeline", "Typical pipeline stages"],
        [[node("src", ["Commit / pull request", "Commit / pull request"], "client")], [node("bld", ["Build + testes unitários + lint", "Build + unit tests + lint"], "service")], [node("sec", ["SAST, dependências, imagem", "SAST, dependencies, image"], "edge")], [node("stg", ["Staging + integração/E2E", "Staging + integration/E2E"], "service")], [node("prd", ["Produção gradual + verificação", "Gradual production + verification"], "data")]],
        [edge("src", "bld", ["dispara", "triggers"]), edge("bld", "sec", ["artefato", "artifact"]), edge("sec", "stg", ["aprovado", "approved"]), edge("stg", "prd", ["promove", "promotes"])]),
      ul(
        ["**Build e testes unitários**: compilação, análise estática (lint), testes rápidos. Devem terminar em poucos minutos.", "**Build and unit tests**: compilation, static analysis (lint), fast tests. They should finish in a few minutes."],
        ["**Segurança**: análise estática (SAST), varredura de dependências vulneráveis (SCA), detecção de segredos no código e varredura da imagem de contêiner. Mover essas verificações para a esquerda, para o início, é o que se chama *shift left*.", "**Security**: static analysis (SAST), scanning of vulnerable dependencies (SCA), secret detection in code and container image scanning. Moving these checks left, to the start, is called *shift left*."],
        ["**Artefato imutável**: gere *uma única vez* a imagem versionada (pelo hash do commit) e promova *o mesmo artefato* entre os ambientes. Recompilar para produção quebra a garantia de que o testado é o que sobe. Configuração específica de cada ambiente vem de fora, por variáveis e segredos.", "**Immutable artifact**: build the versioned image *once* (tagged by commit hash) and promote *the same artifact* across environments. Rebuilding for production breaks the guarantee that what was tested is what ships. Environment-specific configuration comes from outside, via variables and secrets."],
        ["**Staging e testes de integração/E2E**: o artefato roda em um ambiente parecido com produção, com testes de integração, de contrato e alguns fluxos ponta a ponta.", "**Staging and integration/E2E tests**: the artifact runs in a production-like environment with integration tests, contract tests and a few end-to-end flows."],
        ["**Deploy gradual e verificação**: a publicação em produção usa uma das estratégias abaixo e confere métricas (erros, latência) antes de concluir.", "**Gradual deploy and verification**: the production release uses one of the strategies below and checks metrics (errors, latency) before completing."],
      ),
      p(["Mantenha a pipeline rápida: idealmente abaixo de 10 minutos até o resultado dos testes principais. Pipelines lentas fazem o time acumular mudanças e furar a disciplina de integrar com frequência. Técnicas úteis: paralelizar jobs, usar cache de dependências e de camadas Docker, rodar apenas os testes afetados pela mudança e deixar as suítes longas (soak, carga) para execução noturna.", "Keep the pipeline fast: ideally under 10 minutes to the main test results. Slow pipelines make the team batch changes and break the discipline of integrating often. Useful techniques: parallelize jobs, cache dependencies and Docker layers, run only the tests affected by the change and leave long suites (soak, load) for nightly runs."]),

      h(["Exemplo de pipeline no GitHub Actions", "A GitHub Actions pipeline example"]),
      p(["O arquivo abaixo, guardado em `.github/workflows/ci.yml`, roda testes a cada pull request e, na branch principal, constrói a imagem, a publica no registro e faz o deploy. Note as permissões mínimas, o cache de dependências e o uso de segredos pelo contexto `secrets`.", "The file below, stored at `.github/workflows/ci.yml`, runs tests on every pull request and, on the main branch, builds the image, pushes it to the registry and deploys. Note the minimal permissions, dependency caching and use of secrets through the `secrets` context."]),
      code(`name: ci
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage

  image:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: image
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: ./scripts/deploy.sh staging \${{ github.sha }}
      - run: ./scripts/smoke-test.sh https://staging.example.com

  deploy-prod:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production        # can require manual approval
    steps:
      - run: ./scripts/deploy.sh production \${{ github.sha }}`),
      p(["Em *environments* do GitHub é possível exigir aprovação humana antes do job de produção, o que transforma a implantação contínua em entrega contínua. Outras plataformas (GitLab CI, Jenkins, CircleCI, Argo Workflows) oferecem os mesmos conceitos: jobs, dependências entre eles, cache, artefatos e ambientes.", "In GitHub *environments* you can require human approval before the production job, which turns continuous deployment into continuous delivery. Other platforms (GitLab CI, Jenkins, CircleCI, Argo Workflows) offer the same concepts: jobs, dependencies between them, caching, artifacts and environments."]),

      h(["Estratégias de deploy", "Deployment strategies"]),
      p(["Como trocar a versão antiga pela nova sem derrubar o serviço? As estratégias diferem no risco, no custo de infraestrutura e na velocidade de reversão.", "How do you swap the old version for the new one without taking the service down? Strategies differ in risk, infrastructure cost and rollback speed."]),
      ul(
        ["**Recreate**: desliga a versão antiga e liga a nova. Simples, mas há indisponibilidade; serve para ambientes internos ou janelas de manutenção.", "**Recreate**: shuts down the old version and starts the new one. Simple, but there is downtime; fine for internal environments or maintenance windows."],
        ["**Rolling update**: substitui as instâncias aos poucos (por exemplo 25% por vez), com verificação de saúde entre as ondas. É o padrão do Kubernetes (`Deployment` com `maxSurge` e `maxUnavailable`). Sem custo extra relevante, mas durante a troca duas versões convivem e precisam ser compatíveis (API e banco). O rollback é outro rolling.", "**Rolling update**: replaces instances gradually (say 25% at a time), with health checks between waves. It is the Kubernetes default (`Deployment` with `maxSurge` and `maxUnavailable`). No significant extra cost, but two versions coexist during the swap and must be compatible (API and database). Rollback is another rolling."],
        ["**Blue-green**: dois ambientes idênticos; o azul serve o tráfego e o verde recebe a nova versão. Depois de validá-lo, você muda o roteamento de uma vez. Rollback instantâneo (volta o tráfego), ao custo de dobrar a infraestrutura durante a troca.", "**Blue-green**: two identical environments; blue serves traffic and green receives the new version. After validating it, you switch routing at once. Instant rollback (switch back), at the cost of doubling infrastructure during the swap."],
        ["**Canary**: envia uma fração pequena do tráfego (1%, 5%, 25%) para a versão nova e a compara com a antiga em erros e latência. Se as métricas pioram, aborta; se ficam saudáveis, avança. Limita o estrago a uma parcela dos usuários.", "**Canary**: sends a small fraction of traffic (1%, 5%, 25%) to the new version and compares it with the old one on errors and latency. If metrics worsen, it aborts; if healthy, it advances. Limits the damage to a share of users."],
        ["**Shadow (espelhamento)**: copia o tráfego real para a versão nova, descartando as respostas dela. Os usuários não são afetados e você observa o comportamento sob carga de verdade. Cuidado com efeitos colaterais: a cópia não pode enviar e-mails nem cobrar duas vezes.", "**Shadow (mirroring)**: copies real traffic to the new version, discarding its responses. Users are not affected and you observe behavior under real load. Beware of side effects: the copy must not send emails or charge twice."],
        ["**A/B test**: não é estratégia de deploy, e sim de experimento: parcelas de usuários veem versões diferentes para medir um resultado de negócio.", "**A/B test**: not a deploy strategy but an experiment: shares of users see different versions to measure a business outcome."],
      ),
      fig(["Blue-green: troca de tráfego no balanceador", "Blue-green: traffic switch at the load balancer"],
        [[node("usr", ["Usuários", "Users"], "client")], [node("lb", ["Balanceador / roteador", "Load balancer / router"], "edge")], [node("blue", ["Azul: v1 (ativo)", "Blue: v1 (live)"], "service"), node("green", ["Verde: v2 (validando)", "Green: v2 (validating)"], "service")], [node("db", ["Banco compartilhado", "Shared database"], "data")]],
        [edge("usr", "lb"), edge("lb", "blue", "100%"), edge("lb", "green", ["0% → 100%", "0% → 100%"], { dashed: true }), edge("blue", "db"), edge("green", "db")]),
      fig(["Canary: promoção gradual guiada por métricas", "Canary: gradual promotion driven by metrics"],
        [[node("u2", ["Usuários", "Users"], "client")], [node("gw", ["Roteador com pesos", "Weighted router"], "edge")], [node("stable", ["Estável (95%)", "Stable (95%)"], "service"), node("canary", ["Canary (5%)", "Canary (5%)"], "service")], [node("mon", ["Métricas: erros e latência", "Metrics: errors and latency"], "data")]],
        [edge("u2", "gw"), edge("gw", "stable", "95%"), edge("gw", "canary", "5%"), edge("stable", "mon"), edge("canary", "mon", ["compara", "compares"])]),
      table([["Estratégia", "Strategy"], ["Indisponibilidade", "Downtime"], ["Custo extra", "Extra cost"], ["Velocidade do rollback", "Rollback speed"], ["Risco para os usuários", "Risk to users"], ["Exige", "Requires"]],
        [["Recreate", "Recreate"], ["Sim", "Yes"], ["Nenhum", "None"], ["Lento (novo deploy)", "Slow (new deploy)"], ["Alto", "High"], ["Nada especial", "Nothing special"]],
        [["Rolling", "Rolling"], ["Não", "No"], ["Baixo", "Low"], ["Médio (outro rolling)", "Medium (another rolling)"], ["Médio", "Medium"], ["Compatibilidade entre versões", "Compatibility between versions"]],
        [["Blue-green", "Blue-green"], ["Não", "No"], ["Alto (duplica)", "High (doubles)"], ["Instantâneo", "Instant"], ["Médio: todos de uma vez", "Medium: everyone at once"], ["Roteamento trocável, banco compatível", "Switchable routing, compatible database"]],
        [["Canary", "Canary"], ["Não", "No"], ["Baixo a médio", "Low to medium"], ["Rápido (tira o peso)", "Fast (remove the weight)"], ["Baixo: só uma fração", "Low: only a fraction"], ["Métricas confiáveis e roteamento por peso", "Reliable metrics and weighted routing"]],
        [["Shadow", "Shadow"], ["Não", "No"], ["Médio (tráfego duplicado)", "Medium (duplicated traffic)"], ["Não se aplica", "Not applicable"], ["Nenhum, se sem efeitos colaterais", "None, if no side effects"], ["Espelhamento e cuidado com escritas", "Mirroring and care with writes"]],
      ),
      p(["Ferramentas como o **Argo Rollouts** e o **Flagger** automatizam o canary no Kubernetes: aumentam o peso em etapas, consultam o Prometheus entre elas e fazem o rollback automático se o limite de erro for excedido. Isso fecha o ciclo entre observabilidade e entrega.", "Tools such as **Argo Rollouts** and **Flagger** automate canary on Kubernetes: they raise the weight in steps, query Prometheus between them and roll back automatically if the error threshold is exceeded. This closes the loop between observability and delivery."]),

      h(["Feature flags: separando deploy de release", "Feature flags: separating deploy from release"]),
      p(["Uma **feature flag** é uma condição no código que liga ou desliga uma funcionalidade em tempo de execução, sem novo deploy. Ela separa duas coisas que antes andavam juntas: **deploy** (o código chegou a produção) e **release** (os usuários passaram a ver a funcionalidade). Com isso você integra código incompleto na branch principal desligado (*trunk-based development*), liga para os funcionários, depois para 1% dos usuários, depois para todos, e desliga em segundos se algo der errado, o que torna o rollback um clique e não uma operação.", "A **feature flag** is a condition in the code that turns a feature on or off at run time, with no new deploy. It separates two things that used to go together: **deploy** (the code reached production) and **release** (users started seeing the feature). With it you merge unfinished code into the main branch turned off (*trunk-based development*), enable it for employees, then 1% of users, then everyone, and switch it off in seconds if something goes wrong, making rollback a click rather than an operation."]),
      code(`// Percentage rollout with a stable hash: the same user always gets the same answer
import { createHash } from "node:crypto";

function bucket(userId: string, flag: string): number {
  const h = createHash("sha256").update(flag + ":" + userId).digest();
  return h.readUInt32BE(0) % 100;               // 0..99
}

export function isEnabled(flag: string, userId: string, rolloutPct: number): boolean {
  return bucket(userId, flag) < rolloutPct;
}

if (isEnabled("new-checkout", user.id, config.newCheckoutPct)) {
  return newCheckout(cart);
}
return legacyCheckout(cart);`),
      ul(
        ["**Tipos**: flags de *release* (curta duração), de *experimento* (A/B), de *operação* (kill switch para desligar uma dependência) e de *permissão* (planos pagos).", "**Kinds**: *release* flags (short-lived), *experiment* flags (A/B), *ops* flags (kill switch to turn off a dependency) and *permission* flags (paid plans)."],
        ["**Custo**: cada flag dobra os caminhos de código que precisam de teste, e flags esquecidas viram dívida e fonte de incidentes. Dê dono e data de remoção a cada flag de release e apague-a quando a funcionalidade estiver em 100%.", "**Cost**: each flag doubles the code paths that need testing, and forgotten flags become debt and a source of incidents. Give each release flag an owner and a removal date and delete it once the feature is at 100%."],
        ["Produtos como LaunchDarkly, Unleash e Flagsmith gerenciam flags com segmentação e auditoria; um arquivo de configuração simples já resolve casos pequenos.", "Products such as LaunchDarkly, Unleash and Flagsmith manage flags with targeting and auditing; a simple configuration file already handles small cases."],
      ),

      h(["Rollback e o elo difícil: o banco de dados", "Rollback and the hard link: the database"]),
      p(["Reverter código é fácil: volta-se à imagem anterior. Reverter **dados** não é. Se a versão 2 renomeou uma coluna e escreveu linhas no formato novo, voltar à versão 1 a faz falhar. Por isso, em vez de pensar em desfazer migrações, desenhe mudanças de esquema **compatíveis para trás** e use o padrão **expand/contract** (também chamado de *parallel change*), dividido em fases que viram deploys independentes:", "Reverting code is easy: go back to the previous image. Reverting **data** is not. If version 2 renamed a column and wrote rows in the new format, going back to version 1 makes it fail. So instead of thinking about undoing migrations, design **backward-compatible** schema changes and use the **expand/contract** pattern (also called *parallel change*), split into phases that become independent deploys:"]),
      ul(
        ["**Expand**: adicione a coluna nova (anulável ou com valor padrão), sem remover nada. A versão antiga continua funcionando.", "**Expand**: add the new column (nullable or with a default), removing nothing. The old version keeps working."],
        ["**Migrate**: o código passa a escrever nas duas colunas (escrita dupla) e um job preenche as linhas antigas em lotes.", "**Migrate**: code starts writing to both columns (dual write) and a job backfills old rows in batches."],
        ["**Switch**: o código passa a ler da coluna nova. Se algo falhar, volta-se a ler da antiga.", "**Switch**: code starts reading from the new column. If something fails, go back to reading from the old one."],
        ["**Contract**: depois de um período de segurança, e só então, remova a coluna antiga e o código da escrita dupla.", "**Contract**: after a safety period, and only then, remove the old column and the dual-write code."],
      ),
      code(`-- Phase 1 (expand): compatible with the running version
ALTER TABLE customers ADD COLUMN full_name text;

-- Phase 2 (migrate): backfill in small batches to avoid long locks
UPDATE customers SET full_name = first_name || ' ' || last_name
WHERE id BETWEEN 1 AND 10000 AND full_name IS NULL;

-- Phase 4 (contract): only after no running version reads the old columns
ALTER TABLE customers DROP COLUMN first_name, DROP COLUMN last_name;`),
      p(["Cuidados adicionais: crie índices de forma concorrente (`CREATE INDEX CONCURRENTLY` no PostgreSQL) para não bloquear escritas, evite migrações que reescrevem a tabela inteira em horário de pico, e use ferramentas de migração versionadas (Flyway, Liquibase, Prisma Migrate, Alembic) executadas pela própria pipeline.", "Further care: create indexes concurrently (`CREATE INDEX CONCURRENTLY` in PostgreSQL) so as not to block writes, avoid migrations that rewrite the whole table at peak hours, and use versioned migration tools (Flyway, Liquibase, Prisma Migrate, Alembic) run by the pipeline itself."]),

      h(["Infraestrutura como código e GitOps", "Infrastructure as code and GitOps"]),
      p(["**Infraestrutura como código (IaC)** descreve servidores, redes, bancos e permissões em arquivos versionados, revisados em pull request e aplicados pela pipeline. Ambientes deixam de ser artesanais e podem ser recriados do zero, o que também é a base da recuperação de desastres. O **Terraform** (e o fork OpenTofu) é declarativo: você descreve o estado desejado e a ferramenta calcula o plano de mudanças comparando com o estado real, guardado em um arquivo de estado remoto e com trava.", "**Infrastructure as code (IaC)** describes servers, networks, databases and permissions in versioned files, reviewed in pull requests and applied by the pipeline. Environments stop being handcrafted and can be rebuilt from scratch, which is also the basis of disaster recovery. **Terraform** (and the OpenTofu fork) is declarative: you describe the desired state and the tool computes a change plan by comparing it with the real state, kept in a remote, locked state file."]),
      code(`resource "aws_db_instance" "main" {
  identifier            = "orders-prod"
  engine                = "postgres"
  engine_version        = "16.3"
  instance_class        = "db.r6g.large"
  allocated_storage     = 100
  multi_az              = true
  storage_encrypted     = true
  backup_retention_period = 14
  deletion_protection   = true
  username              = "app"
  manage_master_user_password = true   # secret kept in Secrets Manager
}

# terraform plan  -> shows what will change
# terraform apply -> applies after review`),
      p(["O **GitOps** leva a ideia adiante: o repositório Git é a *única fonte de verdade* do que deve estar rodando. Um agente dentro do cluster (Argo CD, Flux) compara continuamente o estado real com o repositório e o corrige quando há divergência (*drift*). Para fazer deploy, você altera um arquivo e abre um pull request; o histórico do Git vira o histórico de auditoria, e o rollback é um `git revert`. A vantagem de segurança é que a pipeline de CI não precisa de credenciais de produção: quem puxa a mudança é o agente que já está lá dentro.", "**GitOps** carries the idea further: the Git repository is the *single source of truth* for what should be running. An agent inside the cluster (Argo CD, Flux) continuously compares the real state with the repository and fixes it when it diverges (*drift*). To deploy, you change a file and open a pull request; Git history becomes the audit trail, and rollback is a `git revert`. The security advantage is that the CI pipeline needs no production credentials: the one pulling the change is the agent already inside."]),

      h(["Medindo a saúde do processo: métricas DORA", "Measuring process health: DORA metrics"]),
      p(["O programa de pesquisa DORA identificou quatro métricas que se correlacionam com bom desempenho de entrega: **frequência de deploy**, **lead time** das mudanças (do commit à produção), **taxa de falha** das mudanças e **tempo para restaurar** o serviço após um incidente. A descoberta mais importante é que velocidade e estabilidade *não* são opostos: times de alto desempenho fazem deploys mais frequentes *e* têm menos falhas, justamente porque as mudanças são pequenas e a recuperação é automatizada.", "The DORA research program identified four metrics that correlate with good delivery performance: **deploy frequency**, change **lead time** (from commit to production), change **failure rate** and **time to restore** service after an incident. The most important finding is that speed and stability are *not* opposites: high-performing teams deploy more often *and* fail less, precisely because changes are small and recovery is automated."]),

      h(["Vantagens, desvantagens e erros comuns", "Benefits, drawbacks and common mistakes"]),
      ul(
        ["**Vantagens**: feedback rápido, menos risco por mudança, correção rápida de incidentes, ambientes reproduzíveis e menos trabalho manual repetitivo.", "**Benefits**: fast feedback, less risk per change, fast incident fixes, reproducible environments and less repetitive manual work."],
        ["**Custos**: investimento inicial em testes e automação, manutenção da própria pipeline e disciplina cultural (integrar com frequência, manter a branch principal sempre verde).", "**Costs**: up-front investment in tests and automation, upkeep of the pipeline itself and cultural discipline (integrating often, keeping the main branch always green)."],
        ["**Erro: pipeline lenta e instável**, que o time passa a contornar.", "**Mistake: a slow, unstable pipeline** that the team starts to bypass."],
        ["**Erro: recompilar por ambiente**, quebrando a imutabilidade do artefato.", "**Mistake: rebuilding per environment**, breaking artifact immutability."],
        ["**Erro: segredos no repositório ou nos logs** da pipeline; use cofres e mascare saídas.", "**Mistake: secrets in the repository or pipeline logs**; use vaults and mask outputs."],
        ["**Erro: deploy sem observabilidade**: sem métricas, um canary não tem o que comparar.", "**Mistake: deploying without observability**: without metrics, a canary has nothing to compare."],
        ["**Erro: migração de banco acoplada ao deploy** e não compatível com a versão anterior.", "**Mistake: database migration coupled to the deploy** and not compatible with the previous version."],
      ),
      p(["Casos reais: empresas como Amazon e Netflix publicaram que fazem milhares de deploys por dia, apoiadas em automação, testes e publicação gradual; a Netflix criou o Spinnaker, ferramenta de entrega contínua multinuvem hoje de código aberto. O ponto não é copiar a ferramenta, e sim a prática: mudanças pequenas, reversíveis e observáveis.", "Real cases: companies such as Amazon and Netflix have published that they deploy thousands of times a day, backed by automation, tests and gradual release; Netflix created Spinnaker, a multi-cloud continuous delivery tool now open source. The point is not copying the tool but the practice: small, reversible, observable changes."]),

      h(["Resumo", "Summary"]),
      ul(
        ["CI integra e testa cada mudança; CD mantém tudo pronto (ou já publicado) em produção.", "CI integrates and tests every change; CD keeps everything ready (or already released) in production."],
        ["Uma pipeline falha rápido, gera o artefato uma só vez e o promove entre ambientes.", "A pipeline fails fast, builds the artifact once and promotes it between environments."],
        ["Rolling é simples, blue-green reverte instantaneamente, canary limita o impacto, shadow valida sem expor.", "Rolling is simple, blue-green reverts instantly, canary limits impact, shadow validates without exposing."],
        ["Feature flags separam deploy de release; remova-as quando terminarem.", "Feature flags separate deploy from release; remove them when done."],
        ["Migrações em expand/contract mantêm o rollback possível.", "Expand/contract migrations keep rollback possible."],
        ["IaC e GitOps tornam a infraestrutura versionada, revisável e reproduzível.", "IaC and GitOps make infrastructure versioned, reviewable and reproducible."],
      ),

      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Qual a diferença entre entrega contínua e implantação contínua?** Na entrega, todo commit aprovado *pode* ir a produção com um clique; na implantação, vai sozinho.", "**What is the difference between continuous delivery and continuous deployment?** In delivery, every approved commit *can* go to production with a click; in deployment, it goes on its own."],
        ["**Canary ou blue-green?** Blue-green dá reversão instantânea e é simples de entender, mas dobra o custo e expõe todos de uma vez; canary expõe poucos primeiro e exige boas métricas. Muitos times combinam os dois.", "**Canary or blue-green?** Blue-green gives instant rollback and is simple to grasp but doubles the cost and exposes everyone at once; canary exposes few first and needs good metrics. Many teams combine both."],
        ["**Como reverter se a migração já rodou?** Por isso se usa expand/contract: a versão antiga continua compatível com o esquema expandido, então reverter o código basta.", "**How do I roll back if the migration already ran?** That is why expand/contract is used: the old version stays compatible with the expanded schema, so rolling back the code is enough."],
        ["**Feature flags substituem branches?** Substituem branches de longa duração: o código incompleto fica na principal, desligado.", "**Do feature flags replace branches?** They replace long-lived branches: incomplete code sits on main, switched off."],
      ),
      tip(["Duas métricas DORA resumem a saúde do processo: frequência de deploy e tempo para restaurar o serviço. Times bons fazem os dois bem, não um à custa do outro.", "Two DORA metrics sum up process health: deploy frequency and time to restore service. Good teams do both well, not one at the expense of the other."]),
    ] },

  { id: "observabilidade", section: "operacao", level: 1, icon: "monitoring", minutes: 14,
    title: ["Observabilidade: logs, métricas e traces", "Observability: logs, metrics and traces"],
    summary: ["Logs estruturados, métricas Prometheus, traces, golden signals, RED e USE, SLO e error budget, alertas bons e ruins, dashboards e PromQL.", "Structured logs, Prometheus metrics, traces, golden signals, RED and USE, SLOs and error budgets, good and bad alerts, dashboards and PromQL."],
    body: [
      p(["Às três da manhã, o pager toca: *o checkout está lento*. Sem instrumentação, a investigação vira adivinhação: conectar por SSH em servidores, procurar texto em arquivos de log, reiniciar serviços na esperança de que o problema passe. Em um sistema distribuído, com dezenas de serviços e centenas de instâncias efêmeras, isso simplesmente não funciona. É preciso que o próprio sistema conte o que está acontecendo.", "At three in the morning the pager rings: *checkout is slow*. Without instrumentation, the investigation becomes guesswork: SSH into servers, grep text in log files, restart services hoping the problem goes away. In a distributed system, with dozens of services and hundreds of ephemeral instances, that simply does not work. The system itself must tell what is happening."]),
      p(["**Monitorar** é verificar sinais que você já sabia que importavam (a CPU, o espaço em disco, o status HTTP). **Observabilidade** é a capacidade de fazer perguntas *novas* sobre um sistema em produção, inclusive sobre falhas que ninguém previu, sem precisar alterar o código ou implantar nada. Um sistema é observável quando os dados que ele emite bastam para explicar seu estado interno. Isso se apoia em três tipos de sinal complementares: logs, métricas e traces.", "**Monitoring** is checking signals you already knew mattered (CPU, disk space, HTTP status). **Observability** is the ability to ask *new* questions of a running system, including about failures nobody predicted, without changing code or deploying anything. A system is observable when the data it emits suffices to explain its internal state. It rests on three complementary kinds of signal: logs, metrics and traces."]),

      h(["Os três pilares", "The three pillars"]),
      table([["Sinal", "Signal"], ["O que é", "What it is"], ["Pergunta que responde", "Question it answers"], ["Custo e volume", "Cost and volume"], ["Ferramentas comuns", "Common tools"]],
        [["Logs", "Logs"], ["Registros de eventos discretos, com contexto", "Records of discrete events, with context"], ["O que exatamente aconteceu nesta requisição?", "What exactly happened in this request?"], ["Alto: cresce com o tráfego", "High: grows with traffic"], ["Loki, Elasticsearch/OpenSearch, CloudWatch Logs", "Loki, Elasticsearch/OpenSearch, CloudWatch Logs"]],
        [["Métricas", "Metrics"], ["Números agregados ao longo do tempo", "Numbers aggregated over time"], ["Está bem? Está piorando? Desde quando?", "Is it healthy? Getting worse? Since when?"], ["Baixo e previsível: depende dos rótulos, não do tráfego", "Low and predictable: depends on labels, not traffic"], ["Prometheus, Datadog, CloudWatch Metrics", "Prometheus, Datadog, CloudWatch Metrics"]],
        [["Traces", "Traces"], ["O caminho de uma requisição por vários serviços, com o tempo de cada trecho", "The path of one request across services, with the time of each hop"], ["Onde está a lentidão ou a falha numa cadeia de chamadas?", "Where is the slowness or failure in a call chain?"], ["Médio a alto; costuma-se amostrar", "Medium to high; sampling is common"], ["OpenTelemetry, Jaeger, Tempo, Zipkin", "OpenTelemetry, Jaeger, Tempo, Zipkin"]],
      ),
      p(["O fluxo ideal de investigação usa os três em sequência: uma **métrica** avisa que a taxa de erro subiu; o **trace** de uma requisição com erro mostra que a lentidão está na chamada ao serviço de estoque; o **log** daquele serviço, achado pelo `trace_id`, mostra a exceção exata. Cada sinal estreita a busca, e o `trace_id` é o fio que os costura.", "The ideal investigation flow uses the three in sequence: a **metric** warns that the error rate rose; the **trace** of a failing request shows that the slowness is in the call to the inventory service; that service's **log**, found by `trace_id`, shows the exact exception. Each signal narrows the search, and `trace_id` is the thread that stitches them together."]),
      fig(["Pipeline de telemetria", "Telemetry pipeline"],
        [[node("app", ["Aplicação + SDK OpenTelemetry", "Application + OpenTelemetry SDK"], "service")], [node("col", ["OpenTelemetry Collector", "OpenTelemetry Collector"], "edge")], [node("prom", ["Métricas: Prometheus", "Metrics: Prometheus"], "data"), node("loki", ["Logs: Loki", "Logs: Loki"], "data"), node("tempo", ["Traces: Tempo / Jaeger", "Traces: Tempo / Jaeger"], "data")], [node("gra", ["Grafana (painéis)", "Grafana (dashboards)"], "client"), node("alert", ["Alertmanager", "Alertmanager"], "queue")]],
        [edge("app", "col", "OTLP"), edge("col", "prom"), edge("col", "loki"), edge("col", "tempo"), edge("prom", "gra"), edge("loki", "gra"), edge("tempo", "gra"), edge("prom", "alert", ["regras", "rules"])]),

      h(["Logs estruturados", "Structured logs"]),
      p(["Um log em texto livre (`User 42 failed to pay`) é legível para humanos e inútil para máquinas: para saber quantos pagamentos falharam por usuário você precisa de expressões regulares frágeis. Um log **estruturado** emite cada evento como um objeto (normalmente JSON) com campos consistentes, o que permite filtrar, agregar e correlacionar.", "A free-text log (`User 42 failed to pay`) is readable by humans and useless to machines: to count failed payments per user you need brittle regular expressions. A **structured** log emits each event as an object (usually JSON) with consistent fields, which allows filtering, aggregating and correlating."]),
      code(`{
  "ts": "2026-03-14T02:41:07.381Z",
  "level": "error",
  "service": "payments",
  "version": "2026.03.2",
  "msg": "payment declined",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "request_id": "req_8f2c",
  "user_id": "u_42",
  "order_id": "o_9913",
  "provider": "acme-pay",
  "error_code": "insufficient_funds",
  "duration_ms": 842
}`),
      ul(
        ["Use **níveis** com critério: `error` para falhas que exigem ação, `warn` para situações anômalas recuperáveis, `info` para eventos de negócio relevantes, `debug` desligado em produção por padrão.", "Use **levels** with judgment: `error` for failures that need action, `warn` for recoverable anomalies, `info` for relevant business events, `debug` off in production by default."],
        ["**Nunca registre** senhas, tokens, números de cartão ou dados pessoais sensíveis. Mascare na origem; logs são copiados para muitos lugares.", "**Never log** passwords, tokens, card numbers or sensitive personal data. Mask at the source; logs get copied to many places."],
        ["Escreva em `stdout` e deixe a plataforma coletar (a abordagem dos *twelve-factor apps*); não grave arquivos locais em contêineres efêmeros.", "Write to `stdout` and let the platform collect (the *twelve-factor app* approach); do not write local files in ephemeral containers."],
        ["Logs são caros em volume: defina retenção (por exemplo 14 dias quentes, mais tempo em armazenamento barato), amostre eventos repetitivos e não registre cada leitura de cache.", "Logs are costly at volume: set retention (say 14 hot days, longer in cheap storage), sample repetitive events and do not log every cache read."],
      ),

      h(["Métricas e Prometheus", "Metrics and Prometheus"]),
      p(["Uma métrica é uma série temporal numérica identificada por um nome e por **rótulos** (*labels*). O **Prometheus** coleta (*scrape*) periodicamente o endpoint `/metrics` de cada instância, guarda as séries e oferece a linguagem de consulta PromQL. Há quatro tipos básicos:", "A metric is a numeric time series identified by a name and **labels**. **Prometheus** periodically scrapes each instance's `/metrics` endpoint, stores the series and offers the PromQL query language. There are four basic types:"]),
      ul(
        ["**Counter**: valor que só cresce (requisições totais, erros). Você nunca olha o valor bruto, e sim a taxa de crescimento (`rate`).", "**Counter**: a value that only grows (total requests, errors). You never look at the raw value, only at the growth rate (`rate`)."],
        ["**Gauge**: valor que sobe e desce (memória em uso, conexões ativas, profundidade da fila).", "**Gauge**: a value that goes up and down (memory in use, active connections, queue depth)."],
        ["**Histogram**: distribui observações em faixas (*buckets*), o que permite calcular percentis de latência em consulta e agregar entre instâncias.", "**Histogram**: distributes observations into buckets, allowing latency percentiles to be computed at query time and aggregated across instances."],
        ["**Summary**: calcula percentis no cliente; não pode ser agregado entre instâncias, por isso o histograma é geralmente preferido.", "**Summary**: computes percentiles on the client; it cannot be aggregated across instances, so the histogram is generally preferred."],
      ),
      code(`import { Counter, Histogram, register } from "prom-client";
import express from "express";

const httpRequests = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});
const httpDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP latency",
  labelNames: ["method", "route"],
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

const app = express();
app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on("finish", () => {
    const route = req.route?.path ?? "unmatched";   // never the raw URL
    httpRequests.inc({ method: req.method, route, status: String(res.statusCode) });
    end({ method: req.method, route });
  });
  next();
});
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});`),
      p(["A armadilha mais cara é a **cardinalidade**: cada combinação distinta de valores de rótulos cria uma série nova na memória. Um rótulo com `user_id`, `order_id` ou a URL crua (com IDs) pode gerar milhões de séries e derrubar o Prometheus. Rótulos devem ter conjuntos pequenos e limitados (método, rota *parametrizada*, status). Dados de alta cardinalidade pertencem a logs e traces.", "The costliest trap is **cardinality**: each distinct combination of label values creates a new series in memory. A label with `user_id`, `order_id` or the raw URL (with IDs) can generate millions of series and take Prometheus down. Labels must have small, bounded sets (method, *parameterized* route, status). High-cardinality data belongs in logs and traces."]),

      h(["Traces distribuídos", "Distributed tracing"]),
      p(["Um **trace** representa uma requisição inteira; é composto de **spans**, cada um um trecho de trabalho (uma chamada HTTP, uma consulta SQL) com início, duração, atributos e relação de pai e filho. Para que os spans de serviços diferentes se juntem, o contexto (`trace_id` e `span_id`) viaja nos cabeçalhos da requisição, no padrão **W3C Trace Context** (`traceparent`). O **OpenTelemetry** é o padrão aberto que unifica SDKs, formato (OTLP) e coletor para os três sinais, e muitos frameworks já têm instrumentação automática.", "A **trace** represents a whole request; it is made of **spans**, each a piece of work (an HTTP call, a SQL query) with start, duration, attributes and a parent-child relationship. For spans from different services to join, the context (`trace_id` and `span_id`) travels in the request headers, following the **W3C Trace Context** standard (`traceparent`). **OpenTelemetry** is the open standard unifying SDKs, format (OTLP) and collector for all three signals, and many frameworks already have automatic instrumentation."]),
      code(`GET /checkout                                    total 612 ms
|-- auth.verify_token                  12 ms
|-- cart.load (cache hit)               4 ms
|-- inventory.reserve  (service B)    430 ms   <-- bottleneck
|     |-- SELECT stock ... FOR UPDATE 415 ms   <-- lock wait
|-- payment.charge     (service C)    140 ms
\`-- order.save                         21 ms`),
      p(["Guardar 100% dos traces é caro, então se usa **amostragem**. A amostragem *por cabeça* decide no início da requisição (por exemplo, 5%); a amostragem *por cauda* decide depois de ver o trace completo e mantém todos os que tiveram erro ou foram lentos, o que é mais útil e mais trabalhoso de operar.", "Keeping 100% of traces is expensive, so **sampling** is used. *Head* sampling decides at the start of the request (say, 5%); *tail* sampling decides after seeing the full trace and keeps all that had errors or were slow, which is more useful and harder to operate."]),

      h(["O que medir: golden signals, RED e USE", "What to measure: golden signals, RED and USE"]),
      p(["Medir tudo não é medir bem. O livro de SRE do Google propõe os **quatro golden signals**, que cobrem qualquer serviço voltado ao usuário:", "Measuring everything is not measuring well. Google's SRE book proposes the **four golden signals**, which cover any user-facing service:"]),
      ul(
        ["**Latência**: o tempo para atender, separando requisições com sucesso das com erro (um erro rápido não pode melhorar a média).", "**Latency**: time to serve, separating successful requests from failed ones (a fast error must not improve the average)."],
        ["**Tráfego**: a demanda sobre o sistema, como requisições por segundo.", "**Traffic**: the demand on the system, such as requests per second."],
        ["**Erros**: a taxa de requisições que falham, de forma explícita (500) ou implícita (200 com conteúdo errado, resposta acima do SLO).", "**Errors**: the rate of requests that fail, explicitly (500) or implicitly (200 with wrong content, response above the SLO)."],
        ["**Saturação**: quão cheio está o recurso mais restrito (CPU, memória, fila, pool de conexões), de preferência prevendo quando vai esgotar.", "**Saturation**: how full the most constrained resource is (CPU, memory, queue, connection pool), preferably predicting when it will run out."],
      ),
      table([["Método", "Method"], ["Aplica-se a", "Applies to"], ["Medidas", "Measures"], ["Exemplo", "Example"]],
        [["RED", "RED"], ["Serviços (orientados a requisições)", "Services (request-oriented)"], ["Rate (taxa), Errors (erros), Duration (duração)", "Rate, Errors, Duration"], ["API de pedidos: req/s, % de 5xx, p95", "Orders API: req/s, % of 5xx, p95"]],
        [["USE", "USE"], ["Recursos (CPU, disco, rede, filas)", "Resources (CPU, disk, network, queues)"], ["Utilization (utilização), Saturation (saturação), Errors (erros)", "Utilization, Saturation, Errors"], ["Disco: % ocupado, fila de I/O, erros de leitura", "Disk: % busy, I/O queue, read errors"]],
        [["Golden signals", "Golden signals"], ["Qualquer serviço", "Any service"], ["Latência, tráfego, erros, saturação", "Latency, traffic, errors, saturation"], ["Visão geral de um painel de serviço", "Overview of a service dashboard"]],
      ),
      p(["Na prática, use RED para os serviços e USE para a infraestrutura embaixo deles: o RED diz *que* o usuário sofre, o USE ajuda a achar *qual recurso* causa isso.", "In practice, use RED for services and USE for the infrastructure beneath them: RED tells you *that* the user suffers, USE helps find *which resource* causes it."]),

      h(["Consultas PromQL úteis", "Useful PromQL queries"]),
      code(`# Requests per second, by route, over the last 5 minutes
sum by (route) (rate(http_requests_total[5m]))

# Error ratio (5xx / total) for the whole service
sum(rate(http_requests_total{status=~"5.."}[5m]))
  /
sum(rate(http_requests_total[5m]))

# p95 latency per route, aggregated across all instances
histogram_quantile(0.95,
  sum by (le, route) (rate(http_request_duration_seconds_bucket[5m])))

# Saturation: connection pool usage above 80%
db_pool_active_connections / db_pool_max_connections > 0.8

# Prediction: will the disk fill within 4 hours?
predict_linear(node_filesystem_avail_bytes[1h], 4 * 3600) < 0`),

      h(["SLI, SLO, SLA e error budget", "SLI, SLO, SLA and error budget"]),
      ul(
        ["**SLI** (*indicator*): a medida, normalmente uma razão entre eventos bons e totais. Exemplo: % de requisições com status < 500 e latência abaixo de 300 ms.", "**SLI** (*indicator*): the measurement, normally a ratio of good events to total events. Example: % of requests with status < 500 and latency under 300 ms."],
        ["**SLO** (*objective*): a meta interna para o SLI em uma janela. Exemplo: 99,9% em 30 dias.", "**SLO** (*objective*): the internal target for the SLI over a window. Example: 99.9% over 30 days."],
        ["**SLA** (*agreement*): o contrato com o cliente, com consequências financeiras. É quase sempre mais frouxo que o SLO, para que o time perceba o problema antes de violar o contrato.", "**SLA** (*agreement*): the contract with the customer, with financial consequences. It is almost always looser than the SLO so the team notices the problem before breaching the contract."],
      ),
      p(["O **error budget** é a diferença entre 100% e o SLO: o quanto de falha você pode ter sem violar a meta. Com 99,9% em 30 dias, o orçamento é 0,1% de 43.200 minutos, cerca de 43 minutos. Isso muda a conversa entre produto e engenharia: enquanto há orçamento, o time lança rápido e assume riscos; quando se esgota, as funcionalidades novas congelam e o foco vai para confiabilidade. Confiabilidade deixa de ser opinião e vira um número negociado.", "The **error budget** is the difference between 100% and the SLO: how much failure you can have without breaching the target. With 99.9% over 30 days, the budget is 0.1% of 43,200 minutes, about 43 minutes. This changes the conversation between product and engineering: while there is budget, the team ships fast and takes risks; when it runs out, new features freeze and focus shifts to reliability. Reliability stops being opinion and becomes a negotiated number."]),
      table([["SLO (30 dias)", "SLO (30 days)"], ["Indisponibilidade permitida", "Allowed downtime"]],
        [["99%", "99%"], ["cerca de 7 h 12 min", "about 7 h 12 min"]],
        [["99,9%", "99.9%"], ["cerca de 43 min", "about 43 min"]],
        [["99,95%", "99.95%"], ["cerca de 21 min", "about 21 min"]],
        [["99,99%", "99.99%"], ["cerca de 4 min 19 s", "about 4 min 19 s"]],
      ),

      h(["Alertas bons e ruins", "Good and bad alerts"]),
      p(["Alerta ruim é pior que ausência de alerta: gera *fadiga de alerta*, e a equipe passa a ignorar o pager. A regra de ouro é alertar sobre **sintomas que o usuário sente** (taxa de erro, latência, falha em um fluxo crítico), não sobre causas (CPU a 80%), porque uma causa pode existir sem sintoma algum e um sintoma pode ter dezenas de causas. Cada alerta que acorda alguém precisa ser **urgente, acionável e inédito**; o resto vira ticket ou painel.", "A bad alert is worse than no alert: it creates *alert fatigue*, and the team starts ignoring the pager. The golden rule is to alert on **symptoms users feel** (error rate, latency, failure in a critical flow), not on causes (CPU at 80%), because a cause can exist with no symptom and a symptom can have dozens of causes. Every alert that wakes someone must be **urgent, actionable and new**; the rest becomes a ticket or a dashboard."]),
      table([["Alerta ruim", "Bad alert"], ["Problema", "Problem"], ["Alerta bom", "Good alert"]],
        [["CPU acima de 80% por 1 minuto", "CPU above 80% for 1 minute"], ["Pode ser normal e ninguém sente", "May be normal and nobody feels it"], ["Taxa de erro do checkout acima de 2% por 5 minutos", "Checkout error rate above 2% for 5 minutes"]],
        [["Um pod reiniciou", "A pod restarted"], ["Evento rotineiro; o orquestrador cuida", "Routine event; the orchestrator handles it"], ["Pods reiniciando em loop e capacidade abaixo do mínimo", "Pods crash-looping and capacity below the minimum"]],
        [["Alerta sem instrução", "Alert with no instructions"], ["Quem recebe não sabe o que fazer", "The recipient does not know what to do"], ["Alerta com link para um runbook e o painel relacionado", "Alert linking to a runbook and the related dashboard"]],
        [["Disco a 90%", "Disk at 90%"], ["Pode demorar semanas ou minutos para encher", "May take weeks or minutes to fill"], ["Disco vai encher em menos de 4 horas (predict_linear)", "Disk will fill within 4 hours (predict_linear)"]],
      ),
      p(["Alertas sobre SLO usam **burn rate**: a velocidade com que o orçamento está sendo consumido. Burn rate 1 gasta o orçamento exatamente ao fim da janela; burn rate 14,4 o gasta em cerca de 2 dias (cerca de 2% do orçamento mensal em 1 hora). A prática do Google SRE Workbook combina janelas longa e curta: dispara apenas se o consumo estiver alto *e* continuar alto, o que evita alertas por picos isolados e também evita demora em incidentes graves.", "SLO alerts use **burn rate**: the speed at which the budget is being consumed. A burn rate of 1 spends the budget exactly at the end of the window; a burn rate of 14.4 spends it in about 2 days (about 2% of the monthly budget in 1 hour). The Google SRE Workbook practice combines long and short windows: it fires only if consumption is high *and* still high, which avoids alerts on isolated spikes and also avoids delay in severe incidents."]),
      code(`groups:
- name: checkout-slo
  rules:
  - alert: CheckoutErrorBudgetFastBurn
    expr: |
      (
        sum(rate(http_requests_total{route="/checkout",status=~"5.."}[1h]))
          / sum(rate(http_requests_total{route="/checkout"}[1h]))
      ) > (14.4 * 0.001)
      and
      (
        sum(rate(http_requests_total{route="/checkout",status=~"5.."}[5m]))
          / sum(rate(http_requests_total{route="/checkout"}[5m]))
      ) > (14.4 * 0.001)
    for: 2m
    labels: { severity: page }
    annotations:
      summary: "Checkout is burning its 99.9% error budget 14x too fast"
      runbook: "https://runbooks.example.com/checkout-errors"`),

      h(["Dashboards que ajudam", "Dashboards that help"]),
      ul(
        ["**Hierarquia**: um painel de visão geral por serviço com os golden signals no topo, e painéis de detalhe (banco, fila, cache) para onde se desce na investigação.", "**Hierarchy**: an overview dashboard per service with the golden signals on top, and detail dashboards (database, queue, cache) to drill into during an investigation."],
        ["Mostre **percentis** (p50, p95, p99) em vez de médias, e a linha do SLO no gráfico para dar contexto.", "Show **percentiles** (p50, p95, p99) rather than averages, and the SLO line on the chart for context."],
        ["Marque **eventos** no gráfico (deploys, mudanças de configuração, flags): a maioria dos incidentes começa com uma mudança.", "Mark **events** on the chart (deploys, config changes, flags): most incidents begin with a change."],
        ["Painéis são para quem está de plantão e para revisões; se ninguém olha um painel, apague-o.", "Dashboards serve whoever is on call and for reviews; if nobody looks at a dashboard, delete it."],
      ),

      h(["Erros comuns e quando investir", "Common mistakes and when to invest"]),
      ul(
        ["Logs não estruturados e sem `trace_id`, que impedem correlacionar eventos entre serviços.", "Unstructured logs with no `trace_id`, preventing correlation of events across services."],
        ["Rótulos de alta cardinalidade nas métricas, que derrubam o sistema de monitoramento.", "High-cardinality labels in metrics, which take the monitoring system down."],
        ["Alertar em causas e em limites arbitrários, em vez de em SLOs.", "Alerting on causes and arbitrary thresholds instead of SLOs."],
        ["Monitorar apenas de dentro: some também **sondas sintéticas** externas, que simulam o usuário e detectam o que as métricas internas não veem (DNS, certificado, CDN).", "Monitoring only from the inside: add external **synthetic probes** that simulate the user and detect what internal metrics miss (DNS, certificate, CDN)."],
        ["A observabilidade também tem custo: logs e traces podem ser uma das maiores contas da nuvem. Defina retenção, amostragem e orçamento desde cedo.", "Observability also has a cost: logs and traces can be one of the biggest cloud bills. Define retention, sampling and budget early."],
      ),
      p(["Em um sistema pequeno, um monólito com métricas básicas, logs estruturados e alertas de taxa de erro e latência já resolve; traces distribuídos só compensam quando há várias chamadas entre serviços. Plataformas como Datadog, New Relic, Honeycomb e o conjunto Grafana (Loki, Tempo, Mimir) entregam o pacote completo como serviço ou de código aberto.", "In a small system, a monolith with basic metrics, structured logs and alerts on error rate and latency already does the job; distributed traces pay off only when there are many calls between services. Platforms such as Datadog, New Relic, Honeycomb and the Grafana stack (Loki, Tempo, Mimir) deliver the full package as a service or open source."]),

      h(["Resumo", "Summary"]),
      ul(
        ["Observabilidade é poder fazer perguntas novas ao sistema em produção; ela se apoia em logs, métricas e traces.", "Observability is being able to ask new questions of the running system; it rests on logs, metrics and traces."],
        ["Logs estruturados com `trace_id`; métricas com rótulos de baixa cardinalidade; traces com contexto propagado.", "Structured logs with `trace_id`; metrics with low-cardinality labels; traces with propagated context."],
        ["Golden signals e os métodos RED e USE dizem o que medir.", "Golden signals and the RED and USE methods say what to measure."],
        ["SLOs e error budget transformam confiabilidade em decisão objetiva.", "SLOs and error budgets turn reliability into an objective decision."],
        ["Alerte em sintomas, com burn rate e runbook; apague alertas que ninguém usa.", "Alert on symptoms, with burn rate and runbook; delete alerts nobody uses."],
      ),

      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Qual a diferença entre monitoramento e observabilidade?** Monitoramento verifica o que você já previu; observabilidade permite investigar o que você não previu, com dados ricos e correlacionáveis.", "**What is the difference between monitoring and observability?** Monitoring checks what you already predicted; observability lets you investigate what you did not, with rich, correlatable data."],
        ["**Por que usar histograma em vez de média?** Porque a média esconde a cauda, e histogramas permitem calcular p95 e p99 e agregar entre instâncias.", "**Why use a histogram instead of an average?** Because the average hides the tail, and histograms allow computing p95 and p99 and aggregating across instances."],
        ["**Quanto de trace devo amostrar?** Depende do volume e do orçamento; comece com 1% a 10% por cabeça e, se possível, mantenha por cauda todos os traces com erro ou lentos.", "**How much tracing should I sample?** It depends on volume and budget; start with 1% to 10% head sampling and, if possible, keep by tail all traces with errors or slowness."],
        ["**Um SLO de 100% faz sentido?** Não: é inatingível e impede qualquer mudança. Escolha o nível que o usuário realmente percebe.", "**Does a 100% SLO make sense?** No: it is unattainable and blocks any change. Pick the level the user actually perceives."],
      ),
      tip(["Propague um `trace_id` em todos os logs e cabeçalhos HTTP. Com ele você sai de um alerta de métrica, passa pelo trace e chega ao log exato do erro em minutos.", "Propagate a `trace_id` through every log line and HTTP header. With it you go from a metric alert, through the trace, to the exact error log in minutes."]),
    ] },

  { id: "seguranca-em-system-design", section: "operacao", level: 1, icon: "security", minutes: 14,
    title: ["Segurança em system design", "Security in system design"],
    summary: ["CIA, defesa em profundidade, menor privilégio, OWASP Top 10, injeção SQL, XSS, CSRF, SSRF, segredos, criptografia, hashing de senha, DDoS, WAF, auditoria e STRIDE.", "CIA, defense in depth, least privilege, OWASP Top 10, SQL injection, XSS, CSRF, SSRF, secrets, encryption, password hashing, DDoS, WAF, auditing and STRIDE."],
    body: [
      p(["Segurança não é um recurso que se acrescenta no fim do projeto: é uma propriedade do desenho, como a latência ou a disponibilidade. Quando é deixada para depois, as correções exigem refazer a arquitetura (separar redes, introduzir autenticação entre serviços, cifrar dados já espalhados), e o custo é muitas vezes maior que o de pensar nela desde o começo. O ponto de partida é uma mudança de postura: assuma que alguma camada **vai** falhar, que algum segredo **vai** vazar e que alguma dependência **vai** ter uma vulnerabilidade, e projete para que uma falha isolada não entregue tudo.", "Security is not a feature added at the end of the project: it is a property of the design, like latency or availability. When left for later, fixes require redoing the architecture (splitting networks, introducing authentication between services, encrypting data already scattered around), and the cost is often greater than thinking about it from the start. The starting point is a change of stance: assume some layer **will** fail, some secret **will** leak and some dependency **will** have a vulnerability, and design so a single failure does not hand over everything."]),
      p(["Este artigo percorre os objetivos da segurança, os princípios de projeto, as vulnerabilidades web mais frequentes com exemplos de código, a proteção de segredos e dados, a defesa contra ataques de volume e o processo de modelagem de ameaças que organiza tudo isso.", "This article walks through the goals of security, design principles, the most frequent web vulnerabilities with code examples, the protection of secrets and data, defense against volumetric attacks and the threat modeling process that organizes it all."]),

      h(["Os objetivos: a tríade CIA", "The goals: the CIA triad"]),
      ul(
        ["**Confidencialidade**: só quem tem permissão acessa a informação. Falha típica: vazamento de dados de clientes.", "**Confidentiality**: only those permitted can access the information. Typical failure: customer data leak."],
        ["**Integridade**: a informação não é alterada sem autorização e as alterações são detectáveis. Falha típica: um atacante altera o preço de um pedido ou um registro de auditoria.", "**Integrity**: information is not altered without authorization and alterations are detectable. Typical failure: an attacker changes an order's price or an audit record."],
        ["**Disponibilidade**: o sistema responde quando necessário. Falha típica: ataque de negação de serviço ou ransomware que cifra os dados.", "**Availability**: the system responds when needed. Typical failure: a denial-of-service attack or ransomware that encrypts the data."],
      ),
      p(["As três competem entre si e com o custo: máxima confidencialidade (tudo cifrado e isolado) dificulta a disponibilidade e a operação. Todo controle de segurança é uma troca, e a análise de risco, a combinação de **probabilidade** e **impacto**, é o que decide onde gastar esforço.", "The three compete with each other and with cost: maximum confidentiality (everything encrypted and isolated) hampers availability and operation. Every security control is a trade-off, and risk analysis, the combination of **likelihood** and **impact**, decides where to spend effort."]),

      h(["Princípios de projeto", "Design principles"]),
      ul(
        ["**Defesa em profundidade**: várias camadas independentes (borda, rede, aplicação, dados, pessoas). O atacante precisa vencer todas, e a falha de uma não é fatal.", "**Defense in depth**: several independent layers (edge, network, application, data, people). The attacker must beat them all, and the failure of one is not fatal."],
        ["**Menor privilégio**: cada pessoa, serviço e token recebe apenas a permissão de que precisa, pelo tempo de que precisa. O serviço de relatórios lê uma réplica; ele não escreve no banco principal, e sua credencial não consegue apagar tabelas.", "**Least privilege**: every person, service and token gets only the permission it needs, for as long as it needs it. The reports service reads a replica; it does not write to the primary database, and its credential cannot drop tables."],
        ["**Superfície de ataque mínima e seguro por padrão**: portas fechadas, banco em sub-rede privada, só o balanceador exposto à internet, funcionalidades de depuração desligadas e senhas padrão trocadas.", "**Minimal attack surface and secure by default**: closed ports, database in a private subnet, only the load balancer exposed to the internet, debug features off and default passwords changed."],
        ["**Zero trust**: não confie em um pedido apenas por vir da rede interna; autentique e autorize cada chamada, inclusive entre serviços.", "**Zero trust**: do not trust a request merely because it comes from the internal network; authenticate and authorize each call, including between services."],
        ["**Falhar de forma segura**: diante de erro, negue o acesso (*fail closed*), em vez de liberar.", "**Fail securely**: on error, deny access (*fail closed*) rather than allow."],
        ["**Nunca confie no cliente**: toda validação e regra de negócio se repete no servidor; o que vem do navegador, do app ou de um cabeçalho pode ser forjado.", "**Never trust the client**: every validation and business rule is repeated on the server; whatever comes from the browser, the app or a header can be forged."],
      ),
      fig(["Defesa em profundidade: camadas entre a internet e os dados", "Defense in depth: layers between the internet and the data"],
        [[node("net", "Internet", "client")], [node("edge", ["CDN, WAF e proteção DDoS", "CDN, WAF and DDoS protection"], "edge")], [node("gw", ["Gateway: autenticação e rate limit", "Gateway: authentication and rate limit"], "edge")], [node("app", ["Serviços (rede privada, mTLS)", "Services (private network, mTLS)"], "service")], [node("db", ["Dados cifrados, acesso mínimo", "Encrypted data, minimal access"], "data")]],
        [edge("net", "edge"), edge("edge", "gw"), edge("gw", "app"), edge("app", "db")]),

      h(["OWASP Top 10", "OWASP Top 10"]),
      p(["A **OWASP** (*Open Worldwide Application Security Project*) publica periodicamente a lista das categorias mais críticas de risco em aplicações web, o **OWASP Top 10**. A tabela abaixo resume as categorias da edição de 2021, que é a mais citada (a lista é atualizada de tempos em tempos, então confira a versão vigente).", "**OWASP** (Open Worldwide Application Security Project) periodically publishes the list of the most critical risk categories in web applications, the **OWASP Top 10**. The table below summarizes the categories of the 2021 edition, the most cited (the list is updated from time to time, so check the current version)."]),
      table([["Categoria", "Category"], ["O que é", "What it is"], ["Defesa principal", "Main defense"]],
        [["A01 Controle de acesso quebrado", "A01 Broken access control"], ["Usuário acessa dados ou ações que não deveria (ex.: trocar o ID na URL)", "User reaches data or actions they should not (e.g., changing the ID in the URL)"], ["Verificar a autorização de cada objeto no servidor; negar por padrão", "Check authorization on every object on the server; deny by default"]],
        [["A02 Falhas criptográficas", "A02 Cryptographic failures"], ["Dados sensíveis sem cifra, algoritmos fracos, chaves mal geridas", "Sensitive data unencrypted, weak algorithms, poorly managed keys"], ["TLS, cifra em repouso, algoritmos modernos, KMS", "TLS, encryption at rest, modern algorithms, KMS"]],
        [["A03 Injeção", "A03 Injection"], ["Entrada do usuário interpretada como código (SQL, comandos, LDAP)", "User input interpreted as code (SQL, commands, LDAP)"], ["Consultas parametrizadas, validação, ORM bem usado", "Parameterized queries, validation, a properly used ORM"]],
        [["A04 Design inseguro", "A04 Insecure design"], ["Falha de conceito, não de código (sem limite de tentativas, regras de negócio abusáveis)", "Concept flaw, not code (no attempt limits, abusable business rules)"], ["Modelagem de ameaças, casos de abuso, padrões seguros", "Threat modeling, abuse cases, secure patterns"]],
        [["A05 Configuração insegura", "A05 Security misconfiguration"], ["Padrões inseguros, buckets públicos, mensagens de erro detalhadas", "Insecure defaults, public buckets, verbose error messages"], ["Configuração como código, revisões, hardening automatizado", "Configuration as code, reviews, automated hardening"]],
        [["A06 Componentes vulneráveis e desatualizados", "A06 Vulnerable and outdated components"], ["Bibliotecas e imagens com CVEs conhecidas", "Libraries and images with known CVEs"], ["Varredura de dependências, atualização contínua, SBOM", "Dependency scanning, continuous updates, SBOM"]],
        [["A07 Falhas de identificação e autenticação", "A07 Identification and authentication failures"], ["Senhas fracas, sem MFA, sessões mal geridas, credential stuffing", "Weak passwords, no MFA, poorly managed sessions, credential stuffing"], ["MFA, hashing forte, limite de tentativas, sessões seguras", "MFA, strong hashing, attempt limits, secure sessions"]],
        [["A08 Falhas de integridade de software e dados", "A08 Software and data integrity failures"], ["Pipeline ou atualização comprometida, deserialização insegura", "Compromised pipeline or update, insecure deserialization"], ["Assinar artefatos, proteger a pipeline, não desserializar dados não confiáveis", "Sign artifacts, protect the pipeline, do not deserialize untrusted data"]],
        [["A09 Falhas de log e monitoramento", "A09 Security logging and monitoring failures"], ["Ataques sem registro nem alerta, sem como investigar", "Attacks with no record or alert, no way to investigate"], ["Logs de segurança centralizados, alertas, retenção", "Centralized security logs, alerts, retention"]],
        [["A10 SSRF", "A10 SSRF"], ["O servidor é induzido a fazer requisições a destinos internos", "The server is tricked into requesting internal destinations"], ["Lista de destinos permitidos, bloqueio de redes internas e metadados", "Allowlist of destinations, blocking internal networks and metadata"]],
      ),

      h(["Injeção de SQL: o exemplo clássico", "SQL injection: the classic example"]),
      p(["A injeção acontece quando dados do usuário são concatenados em um comando e passam a ser interpretados como parte dele. No exemplo vulnerável abaixo, a entrada `' OR '1'='1` transforma a condição em verdadeira para todas as linhas e devolve todos os usuários; um atacante mais ambicioso usa `'; DROP TABLE users; --` ou extrai outras tabelas com `UNION SELECT`.", "Injection happens when user data is concatenated into a command and starts being interpreted as part of it. In the vulnerable example below, the input `' OR '1'='1` makes the condition true for every row and returns all users; a more ambitious attacker uses `'; DROP TABLE users; --` or extracts other tables with `UNION SELECT`."]),
      code(`// VULNERABLE: string concatenation
const email = req.query.email as string;
const rows = await db.query("SELECT id, name FROM users WHERE email = '" + email + "'");
// email = "x' OR '1'='1"  ->  SELECT ... WHERE email = 'x' OR '1'='1'   (all users)

// SAFE: parameterized query; the value is never parsed as SQL
const rows = await db.query(
  "SELECT id, name FROM users WHERE email = $1",
  [email],
);`),
      p(["A correção é usar **consultas parametrizadas** (*prepared statements*): o comando e os valores viajam separados, e o banco nunca interpreta o valor como SQL. ORMs fazem isso por padrão, mas oferecem funções de SQL cru que reintroduzem o risco se receberem concatenação. Nomes de tabelas e colunas não podem ser parâmetros; para eles use uma **lista de permissão** (`allowlist`) de valores aceitos. Complemente com uma conta de banco de menor privilégio (a aplicação não precisa de `DROP`), validação de tipo e tamanho da entrada, e evite devolver mensagens de erro do banco ao cliente.", "The fix is to use **parameterized queries** (*prepared statements*): the command and the values travel separately, and the database never interprets the value as SQL. ORMs do this by default, but offer raw SQL functions that reintroduce the risk if handed concatenation. Table and column names cannot be parameters; for them use an **allowlist** of accepted values. Complement with a least-privilege database account (the application does not need `DROP`), type and length validation of input, and avoid returning database error messages to the client."]),

      h(["XSS, CSRF e SSRF", "XSS, CSRF and SSRF"]),
      p(["**XSS** (*cross-site scripting*) ocorre quando uma página exibe conteúdo não confiável (um comentário, um nome) sem codificá-lo, e o navegador executa um `<script>` injetado no contexto do seu site, podendo roubar sessão ou agir em nome do usuário. As defesas: **codificar a saída** conforme o contexto (HTML, atributo, URL, JavaScript), usar frameworks que escapam por padrão (React, Angular) e evitar APIs como `innerHTML` e `dangerouslySetInnerHTML` com dados externos; sanitizar HTML que precisa ser rico (DOMPurify); e adicionar uma **Content Security Policy** que restringe de onde scripts podem carregar, como segunda camada. Cookies de sessão `HttpOnly` impedem que um XSS os leia.", "**XSS** (*cross-site scripting*) occurs when a page displays untrusted content (a comment, a name) without encoding it, and the browser runs an injected `<script>` in the context of your site, possibly stealing the session or acting on the user's behalf. Defenses: **encode output** according to context (HTML, attribute, URL, JavaScript), use frameworks that escape by default (React, Angular) and avoid APIs such as `innerHTML` and `dangerouslySetInnerHTML` with external data; sanitize HTML that must be rich (DOMPurify); and add a **Content Security Policy** restricting where scripts may load from, as a second layer. `HttpOnly` session cookies stop an XSS from reading them."]),
      p(["**CSRF** (*cross-site request forgery*) explora o fato de o navegador enviar cookies automaticamente: um site malicioso faz o navegador logado do usuário disparar `POST /transferir` para o seu banco, e a requisição chega com a sessão válida. As defesas: cookies com `SameSite=Lax` ou `Strict`, que impedem o envio em requisições entre sites; **tokens anti-CSRF** (um valor aleatório que a página legítima inclui e o atacante não consegue adivinhar); conferência dos cabeçalhos `Origin` e `Referer`; e nunca alterar estado em requisições `GET`. APIs que usam token no cabeçalho `Authorization`, e não cookie, não sofrem de CSRF clássico.", "**CSRF** (*cross-site request forgery*) exploits the fact that the browser sends cookies automatically: a malicious site makes the user's logged-in browser fire `POST /transfer` to your bank, and the request arrives with a valid session. Defenses: cookies with `SameSite=Lax` or `Strict`, which block sending on cross-site requests; **anti-CSRF tokens** (a random value the legitimate page includes and the attacker cannot guess); checking the `Origin` and `Referer` headers; and never changing state on `GET` requests. APIs that use a token in the `Authorization` header, rather than a cookie, do not suffer from classic CSRF."]),
      code(`Set-Cookie: sid=9f8e...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains`),
      p(["**SSRF** (*server-side request forgery*) acontece quando o servidor faz uma requisição a uma URL fornecida pelo usuário (um webhook, um importador de imagem por link, um gerador de preview). O atacante aponta para `http://169.254.169.254/` (o serviço de metadados de instâncias na nuvem) ou para serviços internos, e o servidor devolve credenciais ou dados que nunca deveriam sair da rede. O incidente do Capital One em 2019 é um caso conhecido envolvendo SSRF e metadados de nuvem. Defesas: **lista de permissão** de domínios de destino; resolver o DNS e **bloquear faixas privadas e de loopback** (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16), validando de novo após redirecionamentos; usar a versão 2 do serviço de metadados da AWS (IMDSv2); e rodar o código de requisições externas em um ambiente sem acesso à rede interna.", "**SSRF** (*server-side request forgery*) happens when the server makes a request to a user-supplied URL (a webhook, an image importer by link, a preview generator). The attacker points to `http://169.254.169.254/` (the cloud instance metadata service) or to internal services, and the server returns credentials or data that should never leave the network. The 2019 Capital One incident is a well-known case involving SSRF and cloud metadata. Defenses: an **allowlist** of destination domains; resolve DNS and **block private and loopback ranges** (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16), validating again after redirects; use version 2 of the AWS metadata service (IMDSv2); and run outbound-request code in an environment with no access to the internal network."]),

      h(["Segredos e gestão de chaves", "Secrets and key management"]),
      p(["**Segredos** (senhas de banco, chaves de API, certificados, tokens) não vão no repositório, na imagem, em variáveis de log nem em chats. Repositórios vazam, e o histórico do Git guarda para sempre o que foi commitado, mesmo depois de apagado. Use um **cofre** (HashiCorp Vault, AWS Secrets Manager, Google Secret Manager, Azure Key Vault) que entrega o segredo à aplicação em tempo de execução, com **controle de acesso por identidade** do serviço, **rotação automática** e **auditoria** de quem leu o quê. Melhor ainda são as credenciais **dinâmicas e de curta duração**: o cofre cria uma conta de banco para aquela instância que expira em uma hora, e um vazamento perde valor rápido. Adicione a **detecção de segredos** na pipeline (gitleaks, trufflehog) e, se um segredo vazou uma única vez, considere-o comprometido e troque-o.", "**Secrets** (database passwords, API keys, certificates, tokens) do not go in the repository, in the image, in log variables or in chats. Repositories leak, and Git history keeps forever what was committed, even after deletion. Use a **vault** (HashiCorp Vault, AWS Secrets Manager, Google Secret Manager, Azure Key Vault) that delivers the secret to the application at run time, with **identity-based access control** for the service, **automatic rotation** and **auditing** of who read what. Better still are **dynamic, short-lived** credentials: the vault creates a database account for that instance that expires in an hour, and a leak loses value quickly. Add **secret detection** to the pipeline (gitleaks, trufflehog) and, if a secret leaked even once, treat it as compromised and rotate it."]),

      h(["Criptografia em trânsito e em repouso", "Encryption in transit and at rest"]),
      ul(
        ["**Em trânsito**: TLS em todo tráfego, inclusive entre serviços internos (mTLS) e até o banco. Ver o artigo sobre TLS.", "**In transit**: TLS on all traffic, including between internal services (mTLS) and up to the database. See the TLS article."],
        ["**Em repouso**: discos, bancos, objetos e backups cifrados (AES-256), com chaves em um **KMS** separado dos dados. A cifra transparente protege contra o roubo do disco ou do backup, mas não contra uma aplicação comprometida, que lê os dados já decifrados. Para dados muito sensíveis (cartão, documento), considere **cifra no nível do campo** e *tokenização*.", "**At rest**: disks, databases, objects and backups encrypted (AES-256), with keys in a **KMS** separate from the data. Transparent encryption protects against theft of the disk or backup, but not against a compromised application, which reads the data already decrypted. For very sensitive data (card, ID), consider **field-level encryption** and *tokenization*."],
        ["**Envelope encryption**: cada dado é cifrado com uma chave de dados, e essa chave é cifrada por uma chave mestra no KMS. Rotacionar a chave mestra não exige recifrar todos os dados.", "**Envelope encryption**: each piece of data is encrypted with a data key, and that key is encrypted by a master key in the KMS. Rotating the master key does not require re-encrypting all the data."],
        ["Use bibliotecas e algoritmos consagrados (AES-GCM, ChaCha20-Poly1305, Ed25519); **nunca invente a própria criptografia**.", "Use established libraries and algorithms (AES-GCM, ChaCha20-Poly1305, Ed25519); **never invent your own cryptography**."],
      ),

      h(["Senhas: hashing correto", "Passwords: proper hashing"]),
      p(["Senhas nunca se guardam em texto nem com hash rápido (MD5, SHA-256 puro): placas de vídeo calculam bilhões de hashes por segundo, e uma base vazada é quebrada em horas. Use funções de **derivação de chave lentas, com sal e uso intenso de memória**: **argon2id** (a recomendação atual do OWASP), **scrypt** ou **bcrypt**, ajustadas para levar algumas centenas de milissegundos por verificação no seu hardware. O sal único por senha impede o uso de tabelas pré-calculadas (*rainbow tables*). Detalhes de uso aparecem no artigo sobre autenticação.", "Passwords are never stored in plain text or with a fast hash (MD5, bare SHA-256): graphics cards compute billions of hashes per second, and a leaked database is cracked in hours. Use **slow, salted, memory-hard key derivation** functions: **argon2id** (the current OWASP recommendation), **scrypt** or **bcrypt**, tuned to take a few hundred milliseconds per check on your hardware. A unique salt per password defeats precomputed tables (*rainbow tables*). Usage details appear in the authentication article."]),

      h(["DDoS, WAF e limitação de taxa", "DDoS, WAF and rate limiting"]),
      ul(
        ["**DDoS** (*distributed denial of service*): inundação de tráfego (volumétrico), de conexões (protocolo, como SYN flood) ou de requisições legítimas e caras (camada 7). Absorva na borda com **CDN e proteção dedicada** (Cloudflare, AWS Shield, Google Cloud Armor), que tem capacidade de rede muito acima da sua; mantenha a origem escondida e aceitando só a CDN.", "**DDoS** (*distributed denial of service*): flooding with traffic (volumetric), connections (protocol, like SYN flood) or legitimate, expensive requests (layer 7). Absorb at the edge with a **CDN and dedicated protection** (Cloudflare, AWS Shield, Google Cloud Armor), which has network capacity far above yours; keep the origin hidden and accepting only the CDN."],
        ["**Rate limiting**: limite requisições por IP, por usuário e por chave de API (token bucket, janela deslizante), com respostas 429 e cabeçalho `Retry-After`. Proteja de forma mais dura endpoints caros ou sensíveis: login, busca, envio de e-mail.", "**Rate limiting**: limit requests per IP, per user and per API key (token bucket, sliding window), with 429 responses and the `Retry-After` header. Protect costly or sensitive endpoints more strictly: login, search, email sending."],
        ["**WAF** (*web application firewall*): filtra requisições que casam com padrões de ataque conhecidos (SQL injection, XSS, bots) antes de chegarem à aplicação. É uma camada extra e permite *patch virtual* enquanto o código é corrigido, mas não substitui código seguro, e regras agressivas geram falsos positivos.", "**WAF** (web application firewall): filters requests matching known attack patterns (SQL injection, XSS, bots) before they reach the application. It is an extra layer and allows *virtual patching* while the code is fixed, but it does not replace secure code, and aggressive rules produce false positives."],
        ["**Autoscaling com teto**: escalar sem limite durante um ataque transforma a negação de serviço em uma conta enorme (*denial of wallet*). Defina máximos e alertas de custo.", "**Autoscaling with a cap**: scaling without limit during an attack turns denial of service into a huge bill (*denial of wallet*). Set maximums and cost alerts."],
      ),

      h(["Auditoria e logs de segurança", "Auditing and security logs"]),
      p(["Não é possível investigar o que não foi registrado. Registre eventos de segurança (logins e falhas, mudanças de permissão e de configuração, acessos a dados sensíveis, ações administrativas) com **quem, o quê, quando e de onde**, em um armazenamento **imutável** e separado dos sistemas auditados (um invasor com acesso à máquina não deve conseguir apagar o rastro). Alerte sobre anomalias: muitos logins falhos, acesso de um país incomum, volume anormal de leitura de dados. Regulamentações como a LGPD, o GDPR e o PCI DSS exigem rastreabilidade e prazos de notificação de incidentes, o que torna o log também uma obrigação legal.", "You cannot investigate what was never recorded. Record security events (logins and failures, permission and configuration changes, access to sensitive data, administrative actions) with **who, what, when and from where**, in **immutable** storage separate from the audited systems (an intruder with access to the machine must not be able to erase the trail). Alert on anomalies: many failed logins, access from an unusual country, abnormal volume of data reads. Regulations such as LGPD, GDPR and PCI DSS require traceability and incident notification deadlines, which makes logging a legal obligation too."]),

      h(["Modelagem de ameaças com STRIDE", "Threat modeling with STRIDE"]),
      p(["A **modelagem de ameaças** é o exercício estruturado de perguntar, sobre o desenho: o que estamos construindo, o que pode dar errado, o que faremos a respeito e se fizemos um bom trabalho. Comece desenhando o diagrama de fluxo de dados, com as **fronteiras de confiança** (internet, rede interna, banco) marcadas, e examine cada elemento e cada fluxo que cruza uma fronteira com as seis categorias do **STRIDE** (Microsoft):", "**Threat modeling** is the structured exercise of asking, about the design: what are we building, what can go wrong, what will we do about it and did we do a good job. Start by drawing the data flow diagram, with **trust boundaries** (internet, internal network, database) marked, and examine each element and each flow crossing a boundary with the six categories of **STRIDE** (Microsoft):"]),
      table([["Ameaça", "Threat"], ["Propriedade violada", "Property violated"], ["Exemplo", "Example"], ["Mitigação típica", "Typical mitigation"]],
        [["Spoofing (falsificação de identidade)", "Spoofing"], ["Autenticidade", "Authenticity"], ["Atacante usa um token roubado", "Attacker uses a stolen token"], ["MFA, tokens de curta duração, mTLS", "MFA, short-lived tokens, mTLS"]],
        [["Tampering (adulteração)", "Tampering"], ["Integridade", "Integrity"], ["Alterar o preço no corpo da requisição", "Changing the price in the request body"], ["Validar no servidor, assinaturas, TLS", "Server-side validation, signatures, TLS"]],
        [["Repudiation (repúdio)", "Repudiation"], ["Não repúdio", "Non-repudiation"], ["Admin nega ter apagado um registro", "Admin denies having deleted a record"], ["Logs de auditoria imutáveis", "Immutable audit logs"]],
        [["Information disclosure (vazamento)", "Information disclosure"], ["Confidencialidade", "Confidentiality"], ["Backup sem cifra em bucket público", "Unencrypted backup in a public bucket"], ["Cifra, controle de acesso, minimizar dados", "Encryption, access control, data minimization"]],
        [["Denial of service (negação de serviço)", "Denial of service"], ["Disponibilidade", "Availability"], ["Inundação de requisições caras", "Flood of expensive requests"], ["Rate limit, CDN, filas, autoscaling com teto", "Rate limit, CDN, queues, capped autoscaling"]],
        [["Elevation of privilege (elevação de privilégio)", "Elevation of privilege"], ["Autorização", "Authorization"], ["Usuário comum acessa rota de admin", "Regular user reaches an admin route"], ["Menor privilégio, checagem de autorização por objeto", "Least privilege, per-object authorization checks"]],
      ),
      p(["Priorize as ameaças por risco (probabilidade vezes impacto), registre as mitigações como tarefas e revise o modelo quando a arquitetura mudar. Um modelo simples, feito em uma hora por quem desenhou o sistema, vale mais que um relatório perfeito que nunca é feito.", "Prioritize threats by risk (likelihood times impact), record mitigations as tasks and review the model when the architecture changes. A simple model, made in an hour by whoever designed the system, is worth more than a perfect report that is never done."]),

      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Tratar a rede interna como confiável: um único serviço comprometido dá acesso a todos os outros.", "Treating the internal network as trusted: a single compromised service gives access to all the others."],
        ["Validar apenas no front-end.", "Validating only on the front-end."],
        ["Esquecer a autorização *por objeto*: o usuário está autenticado, mas acessa o pedido de outro (IDOR).", "Forgetting *per-object* authorization: the user is authenticated but opens someone else's order (IDOR)."],
        ["Dependências desatualizadas e imagens de contêiner com pacotes vulneráveis.", "Outdated dependencies and container images with vulnerable packages."],
        ["Mensagens de erro detalhadas (stack traces) para o cliente.", "Detailed error messages (stack traces) sent to the client."],
        ["Buckets de armazenamento e consoles administrativos expostos na internet.", "Storage buckets and admin consoles exposed to the internet."],
        ["Acreditar que um WAF substitui código seguro.", "Believing a WAF replaces secure code."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Projete para confidencialidade, integridade e disponibilidade, pesando risco e custo.", "Design for confidentiality, integrity and availability, weighing risk and cost."],
        ["Defesa em profundidade, menor privilégio, zero trust e falha segura são os princípios de base.", "Defense in depth, least privilege, zero trust and failing securely are the base principles."],
        ["Consultas parametrizadas, codificação de saída, cookies SameSite e listas de permissão para destinos neutralizam injeção, XSS, CSRF e SSRF.", "Parameterized queries, output encoding, SameSite cookies and destination allowlists neutralize injection, XSS, CSRF and SSRF."],
        ["Segredos em cofre com rotação; cifra em trânsito e em repouso; senhas com argon2id ou bcrypt.", "Secrets in a vault with rotation; encryption in transit and at rest; passwords with argon2id or bcrypt."],
        ["CDN, WAF e rate limit absorvem abusos; auditoria imutável permite investigar.", "CDN, WAF and rate limit absorb abuse; immutable auditing makes investigation possible."],
        ["STRIDE organiza a busca por ameaças em cada fronteira de confiança.", "STRIDE organizes the hunt for threats at each trust boundary."],
      ),

      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Por onde começar com pouco tempo?** Por autenticação com MFA, autorização por objeto, consultas parametrizadas, TLS em tudo, segredos em cofre, atualização de dependências e backups testados.", "**Where to start with little time?** With authentication with MFA, per-object authorization, parameterized queries, TLS everywhere, secrets in a vault, dependency updates and tested backups."],
        ["**Cifrar o disco basta para proteger os dados?** Protege contra roubo do disco, mas não contra um atacante com acesso à aplicação, que lê os dados decifrados.", "**Is encrypting the disk enough to protect data?** It protects against theft of the disk but not against an attacker with access to the application, who reads the decrypted data."],
        ["**Preciso de WAF se meu código é seguro?** Ele é uma camada adicional útil e permite bloquear ataques conhecidos enquanto uma correção é preparada, mas não é obrigatório nem suficiente.", "**Do I need a WAF if my code is secure?** It is a useful additional layer and lets you block known attacks while a fix is prepared, but it is neither mandatory nor sufficient."],
        ["**Ofuscar ou esconder o sistema é segurança?** Esconder ajuda a reduzir ruído, mas *segurança por obscuridade* nunca deve ser a única defesa.", "**Is obscuring or hiding the system security?** Hiding helps reduce noise, but *security through obscurity* must never be the only defense."],
      ),
      tip(["Registre eventos de segurança (logins, mudanças de permissão, acessos a dados sensíveis) em um log imutável e alerte sobre anomalias. Não dá para investigar o que não foi registrado.", "Record security events (logins, permission changes, access to sensitive data) in an immutable log and alert on anomalies. You cannot investigate what was never recorded."]),
    ] },

  { id: "autenticacao-e-autorizacao", section: "operacao", level: 1, icon: "lock", minutes: 14,
    title: ["Autenticação e autorização", "Authentication and authorization"],
    summary: ["Sessão x JWT, OAuth2 com Authorization Code e PKCE, OIDC, SSO e SAML, RBAC x ABAC x ReBAC, MFA e WebAuthn, refresh tokens, argon2 e exemplo de middleware.", "Session vs JWT, OAuth2 with Authorization Code and PKCE, OIDC, SSO and SAML, RBAC vs ABAC vs ReBAC, MFA and WebAuthn, refresh tokens, argon2 and a middleware example."],
    body: [
      p(["**Autenticação** (*authn*) responde *quem é você?*; **autorização** (*authz*) responde *o que você pode fazer?*. Misturar as duas está por trás de muitos incidentes: estar logado não significa poder ver o dado de qualquer pessoa. Um sistema pode ter um login impecável e, ainda assim, vazar tudo porque o endpoint `/pedidos/123` não confere se o pedido pertence a quem pergunta. As duas perguntas são feitas em momentos e lugares diferentes do sistema e merecem projetos separados.", "**Authentication** (*authn*) answers *who are you?*; **authorization** (*authz*) answers *what may you do?*. Mixing them up is behind many incidents: being logged in does not mean you can see anyone's data. A system can have a flawless login and still leak everything because the `/orders/123` endpoint does not check that the order belongs to whoever asks. The two questions are asked at different times and places in the system and deserve separate designs."]),
      p(["Este artigo percorre como o servidor *lembra* de quem você é (sessões e tokens), como aplicações delegam a identidade a terceiros (OAuth2, OpenID Connect, SSO), os modelos para decidir permissões, os segundos fatores e a guarda de senhas, e fecha com um exemplo de middleware em TypeScript.", "This article walks through how the server *remembers* who you are (sessions and tokens), how applications delegate identity to third parties (OAuth2, OpenID Connect, SSO), the models for deciding permissions, second factors and password storage, and closes with a TypeScript middleware example."]),

      h(["Como o sistema lembra quem você é: sessão x JWT", "How the system remembers who you are: session vs JWT"]),
      p(["O HTTP não guarda estado: cada requisição chega sem memória das anteriores. Depois do login, o cliente precisa apresentar uma prova de identidade em toda requisição. Há duas famílias de solução.", "HTTP is stateless: every request arrives with no memory of previous ones. After login, the client must present proof of identity on every request. There are two families of solution."]),
      ul(
        ["**Sessão no servidor** (*stateful*): depois do login, o servidor cria um registro (usuário, papéis, expiração), guarda-o em um repositório compartilhado (Redis, banco) e entrega ao cliente um **identificador opaco e aleatório** em um cookie `HttpOnly; Secure; SameSite`. A cada requisição, busca-se o registro pelo ID. Revogar é trivial (apague o registro, e o usuário é deslogado na hora), e o cliente nunca vê os dados. O custo é uma consulta ao repositório por requisição e a necessidade de um armazenamento compartilhado entre as instâncias.", "**Server-side session** (*stateful*): after login, the server creates a record (user, roles, expiry), stores it in a shared store (Redis, database) and gives the client a random **opaque identifier** in an `HttpOnly; Secure; SameSite` cookie. On each request it looks the record up by ID. Revoking is trivial (delete the record and the user is logged out at once), and the client never sees the data. The cost is a store lookup per request and the need for storage shared across instances."],
        ["**JWT** (*JSON Web Token*, *stateless*): um token **assinado** que carrega as informações (`sub`, papéis, `exp`). Qualquer serviço valida a assinatura com a chave pública, sem consultar ninguém, o que combina com microsserviços e APIs entre domínios. O custo é a **revogação**: um JWT vale até expirar, mesmo que o usuário tenha sido bloqueado. Por isso use vida curta (5 a 15 minutos) e combine com um refresh token. O payload do JWT é codificado, **não cifrado**: qualquer um pode lê-lo, então não ponha dados sensíveis.", "**JWT** (*JSON Web Token*, *stateless*): a **signed** token carrying the information (`sub`, roles, `exp`). Any service validates the signature with the public key, without calling anyone, which suits microservices and cross-domain APIs. The cost is **revocation**: a JWT is valid until it expires, even if the user was blocked. So keep its life short (5 to 15 minutes) and combine with a refresh token. A JWT payload is encoded, **not encrypted**: anyone can read it, so do not put sensitive data in it."],
      ),
      table([["Critério", "Criterion"], ["Sessão com ID opaco", "Session with opaque ID"], ["JWT", "JWT"]],
        [["Estado", "State"], ["No servidor (Redis/banco)", "On the server (Redis/database)"], ["No token; servidor sem estado", "In the token; stateless server"]],
        [["Revogação", "Revocation"], ["Imediata", "Immediate"], ["Difícil; depende de expiração curta ou lista de bloqueio", "Hard; relies on short expiry or a denylist"]],
        [["Escalabilidade", "Scalability"], ["Exige repositório compartilhado", "Requires a shared store"], ["Excelente: validação local", "Excellent: local validation"]],
        [["Tamanho por requisição", "Size per request"], ["Pequeno (ID)", "Small (ID)"], ["Maior (claims e assinatura)", "Larger (claims and signature)"]],
        [["Bom para", "Good for"], ["Aplicações web tradicionais, painéis", "Traditional web apps, back-offices"], ["APIs, microsserviços, apps móveis, terceiros", "APIs, microservices, mobile apps, third parties"]],
        [["Risco típico", "Typical risk"], ["CSRF (se cookie sem SameSite)", "CSRF (if cookie lacks SameSite)"], ["Roubo de token; algoritmo e chave mal configurados", "Token theft; misconfigured algorithm and key"]],
      ),
      p(["Não existe vencedor universal. Para um site tradicional com um único back-end, a sessão com cookie é mais simples e segura. Para uma frota de microsserviços, é comum usar um token de acesso curto (JWT ou token opaco validado por introspecção) emitido por um provedor de identidade central. Ao validar um JWT, **confira sempre** a assinatura, o algoritmo esperado (rejeite `alg: none`), o emissor (`iss`), o público (`aud`) e a expiração (`exp`).", "There is no universal winner. For a traditional site with a single back-end, a cookie session is simpler and safer. For a fleet of microservices, it is common to use a short access token (JWT or an opaque token validated by introspection) issued by a central identity provider. When validating a JWT, **always check** the signature, the expected algorithm (reject `alg: none`), the issuer (`iss`), the audience (`aud`) and expiry (`exp`)."]),

      h(["Access token, refresh token e rotação", "Access token, refresh token and rotation"]),
      p(["O par comum é um **access token** de vida curta (minutos), enviado em cada chamada de API, e um **refresh token** de vida longa (dias ou semanas), usado só para obter novos access tokens no endpoint do provedor. Se o access token vaza, o prejuízo expira rápido. Como o refresh token é poderoso, trate-o com mais cuidado: guarde-o em cookie `HttpOnly` ou no armazenamento seguro do dispositivo (Keychain, Keystore), nunca em `localStorage` acessível a scripts.", "The common pair is a short-lived **access token** (minutes), sent on every API call, and a long-lived **refresh token** (days or weeks), used only to obtain new access tokens at the provider's endpoint. If the access token leaks, the damage expires quickly. Since the refresh token is powerful, treat it with more care: keep it in an `HttpOnly` cookie or the device's secure storage (Keychain, Keystore), never in `localStorage` reachable by scripts."]),
      p(["A **rotação de refresh tokens** emite um token novo a cada uso e invalida o anterior. Se um token já usado reaparecer, é sinal de roubo (o ladrão e o dono tentaram usar a mesma cópia), e o provedor revoga toda a *família* de tokens, forçando novo login. Combine com expiração absoluta da sessão (por exemplo 30 dias) e com a possibilidade de o usuário encerrar sessões em outros dispositivos.", "**Refresh token rotation** issues a new token on every use and invalidates the previous one. If an already-used token reappears, it signals theft (the thief and the owner tried to use the same copy), and the provider revokes the whole token *family*, forcing a new login. Combine it with absolute session expiry (say 30 days) and with letting the user end sessions on other devices."]),

      h(["OAuth2: delegação de acesso", "OAuth2: delegated access"]),
      p(["O **OAuth 2.0** é um protocolo de *autorização delegada*: permite que um aplicativo acesse recursos do usuário em outro serviço (suas fotos, sua agenda) sem nunca receber a senha dele. Quatro papéis: o **dono do recurso** (usuário), o **cliente** (o app), o **servidor de autorização** (que autentica o usuário e emite tokens) e o **servidor de recursos** (a API). O app recebe um token com **escopos** limitados (`calendar.read`), e o usuário consente explicitamente.", "**OAuth 2.0** is a *delegated authorization* protocol: it lets an application access the user's resources on another service (their photos, their calendar) without ever receiving their password. Four roles: the **resource owner** (user), the **client** (the app), the **authorization server** (which authenticates the user and issues tokens) and the **resource server** (the API). The app receives a token with limited **scopes** (`calendar.read`), and the user consents explicitly."]),
      table([["Fluxo (grant)", "Flow (grant)"], ["Uso", "Use"], ["Observação", "Note"]],
        [["Authorization Code + PKCE", "Authorization Code + PKCE"], ["Apps web, SPAs, móveis e nativos, com usuário", "Web apps, SPAs, mobile and native, with a user"], ["Recomendado para todos os clientes com usuário", "Recommended for all clients with a user"]],
        [["Client Credentials", "Client Credentials"], ["Serviço para serviço, sem usuário", "Service to service, no user"], ["O cliente se autentica com segredo ou certificado", "The client authenticates with a secret or certificate"]],
        [["Device Code", "Device Code"], ["TVs e dispositivos sem teclado", "TVs and keyboardless devices"], ["O usuário confirma em outro aparelho", "The user confirms on another device"]],
        [["Implicit (legado)", "Implicit (legacy)"], ["Antigo, para SPAs", "Old, for SPAs"], ["Obsoleto: o token passava pela URL", "Deprecated: the token went through the URL"]],
        [["Password (legado)", "Password (legacy)"], ["O app recebe a senha do usuário", "The app receives the user's password"], ["Obsoleto e contrário ao propósito do protocolo", "Deprecated and contrary to the protocol's purpose"]],
      ),
      h(["Authorization Code com PKCE passo a passo", "Authorization Code with PKCE step by step"]),
      p(["No fluxo **Authorization Code**, o app não recebe o token direto pelo navegador: ele recebe um **código** de uso único e o troca pelo token em uma chamada direta ao servidor. O **PKCE** (*Proof Key for Code Exchange*, pronuncia-se *pixy*) acrescenta uma proteção para clientes que não conseguem guardar um segredo (SPAs e apps móveis): o app gera um valor aleatório secreto (`code_verifier`), envia só o seu hash (`code_challenge`) na primeira etapa e apresenta o original na troca. Quem interceptar o código no meio do caminho não tem o verificador e não consegue usá-lo.", "In the **Authorization Code** flow the app does not receive the token directly through the browser: it receives a one-time **code** and exchanges it for the token in a direct call to the server. **PKCE** (*Proof Key for Code Exchange*, pronounced *pixy*) adds protection for clients that cannot keep a secret (SPAs and mobile apps): the app generates a secret random value (`code_verifier`), sends only its hash (`code_challenge`) in the first step and presents the original at the exchange. Whoever intercepts the code along the way lacks the verifier and cannot use it."]),
      fig(["Authorization Code com PKCE", "Authorization Code with PKCE"],
        [[node("user", ["Usuário no navegador", "User in the browser"], "client")], [node("app", ["Aplicação (cliente)", "Application (client)"], "service")], [node("as", ["Servidor de autorização", "Authorization server"], "edge")], [node("api", ["API (servidor de recursos)", "API (resource server)"], "data")]],
        [edge("user", "app", ["1 clica em entrar", "1 clicks sign in"]), edge("app", "as", ["2 challenge; 4-5 code e verifier", "2 challenge; 4-5 code and verifier"], { both: true }), edge("user", "as", ["3 login e consentimento", "3 login and consent"], { dashed: true }), edge("app", "api", ["6 access token", "6 access token"])]),
      code(`// 1) The client creates the PKCE pair
import { randomBytes, createHash } from "node:crypto";

const verifier = randomBytes(32).toString("base64url");
const challenge = createHash("sha256").update(verifier).digest("base64url");
const state = randomBytes(16).toString("base64url");   // protects against CSRF

const authUrl = new URL("https://auth.example.com/authorize");
authUrl.search = new URLSearchParams({
  response_type: "code",
  client_id: "my-spa",
  redirect_uri: "https://app.example.com/callback",
  scope: "openid profile email",
  code_challenge: challenge,
  code_challenge_method: "S256",
  state,
}).toString();
// redirect the browser to authUrl, keeping verifier and state

// 2) On /callback: check state, then exchange the code
const res = await fetch("https://auth.example.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,                                   // from the query string
    redirect_uri: "https://app.example.com/callback",
    client_id: "my-spa",
    code_verifier: verifier,
  }),
});
const { access_token, id_token, refresh_token } = await res.json();`),
      ul(
        ["Valide o `state` na volta e use *redirect URIs* cadastradas e exatas: um redirecionamento aberto permite roubar o código.", "Validate `state` on return and use registered, exact *redirect URIs*: an open redirect allows stealing the code."],
        ["Peça apenas os **escopos** de que precisa (menor privilégio também vale aqui).", "Request only the **scopes** you need (least privilege applies here too)."],
      ),

      h(["OpenID Connect, SSO e SAML", "OpenID Connect, SSO and SAML"]),
      p(["O OAuth2 sozinho diz o que o app pode fazer, não quem é o usuário. O **OpenID Connect (OIDC)** é uma camada de identidade em cima dele: ao pedir o escopo `openid`, o app recebe também um **ID token**, um JWT assinado com as informações de quem se autenticou (`sub`, `email`, `name`, quando e como), e pode consultar o endpoint `userinfo`. É o que está por trás do botão *Entrar com Google*. O OIDC também padroniza um documento de descoberta (`/.well-known/openid-configuration`) com os endpoints e chaves públicas.", "OAuth2 alone says what the app may do, not who the user is. **OpenID Connect (OIDC)** is an identity layer on top of it: by requesting the `openid` scope, the app also receives an **ID token**, a signed JWT with information about who authenticated (`sub`, `email`, `name`, when and how), and can query the `userinfo` endpoint. It is what sits behind the *Sign in with Google* button. OIDC also standardizes a discovery document (`/.well-known/openid-configuration`) with endpoints and public keys."]),
      p(["**SSO** (*single sign-on*) é a experiência: você se autentica uma vez em um **provedor de identidade (IdP)** (Keycloak, Okta, Auth0, Microsoft Entra ID, Google Workspace) e acessa vários sistemas sem digitar a senha de novo. O **SAML 2.0** é o protocolo mais antigo, baseado em XML, ainda dominante em aplicações corporativas legadas: o IdP emite uma *asserção* assinada que o aplicativo (*service provider*) confia. O OIDC é mais simples, usa JSON e é preferido em aplicações novas e móveis. Em empresas, o SSO traz um ganho enorme de segurança: um só lugar para aplicar MFA, políticas de senha e desligar o acesso de quem sai da empresa.", "**SSO** (*single sign-on*) is the experience: you authenticate once with an **identity provider (IdP)** (Keycloak, Okta, Auth0, Microsoft Entra ID, Google Workspace) and reach many systems without typing the password again. **SAML 2.0** is the older, XML-based protocol, still dominant in legacy enterprise applications: the IdP issues a signed *assertion* that the application (*service provider*) trusts. OIDC is simpler, uses JSON and is preferred in new and mobile applications. In companies, SSO brings a big security gain: one place to enforce MFA, password policies and cut access for people leaving the company."]),
      table([["Aspecto", "Aspect"], ["OAuth 2.0", "OAuth 2.0"], ["OpenID Connect", "OpenID Connect"], ["SAML 2.0", "SAML 2.0"]],
        [["Objetivo", "Purpose"], ["Autorização delegada", "Delegated authorization"], ["Autenticação (identidade)", "Authentication (identity)"], ["Autenticação e SSO corporativo", "Authentication and enterprise SSO"]],
        [["Formato", "Format"], ["Tokens (opacos ou JWT)", "Tokens (opaque or JWT)"], ["ID token em JWT", "ID token as JWT"], ["Asserções XML", "XML assertions"]],
        [["Uso típico", "Typical use"], ["Acesso a APIs de terceiros", "Access to third-party APIs"], ["Login social, SSO moderno, móvel", "Social login, modern SSO, mobile"], ["Intranets e SaaS corporativos", "Intranets and enterprise SaaS"]],
      ),

      h(["Modelos de autorização: RBAC, ABAC e ReBAC", "Authorization models: RBAC, ABAC and ReBAC"]),
      ul(
        ["**RBAC** (*role-based*): permissões ligadas a **papéis** (admin, editor, leitor), e usuários recebem papéis. Simples de entender, auditar e explicar, mas cresce mal: surgem regras como *editor, mas só do próprio departamento* e o número de papéis explode (*role explosion*).", "**RBAC** (*role-based*): permissions tied to **roles** (admin, editor, viewer), and users are assigned roles. Simple to understand, audit and explain, but scales badly: rules like *editor, but only of their own department* appear and the number of roles explodes (*role explosion*)."],
        ["**ABAC** (*attribute-based*): decide por **atributos** do usuário (departamento, nível), do recurso (dono, sensibilidade) e do contexto (horário, país, dispositivo). Muito flexível e expressivo, porém mais difícil de testar e de explicar por que algo foi negado. Motores de política como **OPA** (linguagem Rego) e **Cedar** centralizam e versionam as regras.", "**ABAC** (*attribute-based*): decides by **attributes** of the user (department, level), the resource (owner, sensitivity) and the context (time, country, device). Very flexible and expressive, but harder to test and to explain why something was denied. Policy engines such as **OPA** (Rego language) and **Cedar** centralize and version the rules."],
        ["**ReBAC** (*relationship-based*): decide pelas **relações** entre entidades em um grafo (*Ana é editora da pasta X, que contém o documento Y, portanto Ana pode editar Y*). É o modelo de compartilhamento do Google Drive, descrito no artigo do Google sobre o sistema Zanzibar; ferramentas como SpiceDB, OpenFGA e Permify o implementam. Ideal para hierarquias e compartilhamento, como pastas, organizações e times.", "**ReBAC** (*relationship-based*): decides by the **relationships** between entities in a graph (*Ana is editor of folder X, which contains document Y, so Ana can edit Y*). It is the sharing model of Google Drive, described in Google's paper on the Zanzibar system; tools such as SpiceDB, OpenFGA and Permify implement it. Ideal for hierarchies and sharing, such as folders, organizations and teams."],
      ),
      table([["Modelo", "Model"], ["Decide por", "Decides by"], ["Pontos fortes", "Strengths"], ["Limitações", "Limitations"]],
        [["RBAC", "RBAC"], ["Papel do usuário", "User's role"], ["Simples, auditável", "Simple, auditable"], ["Explosão de papéis; pouco contexto", "Role explosion; little context"]],
        [["ABAC", "ABAC"], ["Atributos e contexto", "Attributes and context"], ["Granularidade fina, regras dinâmicas", "Fine granularity, dynamic rules"], ["Complexo de testar e depurar", "Complex to test and debug"]],
        [["ReBAC", "ReBAC"], ["Relações em um grafo", "Relationships in a graph"], ["Compartilhamento e hierarquia naturais", "Natural sharing and hierarchy"], ["Exige um armazém de relações e consistência", "Needs a relationship store and consistency"]],
      ),
      p(["Duas regras valem para qualquer modelo. Primeira: **a decisão de autorização acontece no servidor, em cada requisição, por objeto**, e o padrão é negar. Segunda: não espalhe `if (user.role === ...)` pelo código; centralize a política em um ponto (um módulo, um serviço ou um motor de políticas) para poder auditá-la e alterá-la.", "Two rules hold for any model. First: **the authorization decision happens on the server, on every request, per object**, and the default is deny. Second: do not scatter `if (user.role === ...)` through the code; centralize the policy in one place (a module, a service or a policy engine) so it can be audited and changed."]),
      code(`// Express middleware: authentication (JWT) then authorization (role + ownership)
import { Request, Response, NextFunction } from "express";
import { jwtVerify, createRemoteJWKSet } from "jose";

const jwks = createRemoteJWKSet(new URL("https://auth.example.com/.well-known/jwks.json"));

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: "https://auth.example.com/",
      audience: "orders-api",
      algorithms: ["RS256"],            // never accept "none" or a downgrade
    });
    req.user = { id: String(payload.sub), roles: (payload.roles as string[]) ?? [] };
    next();
  } catch {
    res.status(401).json({ error: "invalid token" });
  }
}

export const requireRole = (role: string) =>
  (req: Request, res: Response, next: NextFunction) =>
    req.user?.roles.includes(role) ? next() : res.status(403).json({ error: "forbidden" });

// Role is not enough: also check the OBJECT
app.get("/orders/:id", authenticate, async (req, res) => {
  const order = await orders.byId(req.params.id);
  if (!order) return res.status(404).end();
  const isOwner = order.userId === req.user.id;
  const isSupport = req.user.roles.includes("support");
  if (!isOwner && !isSupport) return res.status(404).end();   // do not reveal it exists
  res.json(order);
});`),
      p(["Note a distinção dos códigos: **401** significa *não autenticado* (token ausente ou inválido) e **403** significa *autenticado, mas sem permissão*. Para recursos de outro usuário, devolver 404 evita revelar que o objeto existe.", "Note the distinction in codes: **401** means *not authenticated* (missing or invalid token) and **403** means *authenticated but not permitted*. For another user's resources, returning 404 avoids revealing that the object exists."]),

      h(["MFA, passkeys e WebAuthn", "MFA, passkeys and WebAuthn"]),
      p(["**MFA** (autenticação multifator) combina fatores de categorias diferentes: algo que você **sabe** (senha), algo que você **tem** (celular, chave de segurança) e algo que você **é** (biometria). Mesmo que a senha vaze, o atacante não passa sem o segundo fator. Os métodos têm forças bem diferentes:", "**MFA** (multi-factor authentication) combines factors of different categories: something you **know** (password), something you **have** (phone, security key) and something you **are** (biometrics). Even if the password leaks, the attacker does not get through without the second factor. Methods differ greatly in strength:"]),
      ul(
        ["**SMS**: melhor que nada, mas vulnerável a troca de chip (*SIM swap*) e a interceptação. Evite para contas de alto valor.", "**SMS**: better than nothing, but vulnerable to SIM swapping and interception. Avoid for high-value accounts."],
        ["**TOTP** (Google Authenticator, Authy): código de 6 dígitos gerado a partir de um segredo compartilhado e da hora, trocando a cada 30 segundos. Bom, mas **phishable**: um site falso pode pedir o código e repassá-lo em tempo real.", "**TOTP** (Google Authenticator, Authy): a 6-digit code generated from a shared secret and the time, changing every 30 seconds. Good, but **phishable**: a fake site can ask for the code and relay it in real time."],
        ["**Notificação push com número**: mais prático, sujeito a *fadiga de MFA* (o atacante dispara aprovações até o usuário aceitar); a correspondência de número mitiga.", "**Push notification with number matching**: more convenient, subject to *MFA fatigue* (the attacker fires approvals until the user accepts); number matching mitigates it."],
        ["**WebAuthn e passkeys (FIDO2)**: o dispositivo guarda um par de chaves por site; o servidor guarda só a chave pública. No login, o dispositivo assina um desafio, depois de um desbloqueio local (biometria ou PIN). A chave é vinculada ao domínio, então **resiste a phishing**: em um site falso, simplesmente não há credencial para o domínio errado. Nada secreto é compartilhado, e um vazamento no servidor não expõe senhas. Passkeys sincronizam entre dispositivos (iCloud, Google, gerenciadores de senha), e chaves de hardware (YubiKey) são a opção mais robusta.", "**WebAuthn and passkeys (FIDO2)**: the device keeps a key pair per site; the server keeps only the public key. At login the device signs a challenge after a local unlock (biometrics or PIN). The key is bound to the domain, so it **resists phishing**: on a fake site there is simply no credential for the wrong domain. Nothing secret is shared, and a server leak exposes no passwords. Passkeys sync across devices (iCloud, Google, password managers), and hardware keys (YubiKey) are the most robust option."],
      ),
      p(["Use autenticação **adaptativa**: exija o segundo fator quando o risco sobe (dispositivo novo, país incomum, ação sensível como alterar e-mail ou transferir dinheiro, o chamado *step-up*) e ofereça códigos de recuperação seguros para quem perder o aparelho.", "Use **adaptive** authentication: require the second factor when risk rises (new device, unusual country, sensitive action such as changing email or transferring money, called *step-up*) and offer secure recovery codes for those who lose their device."]),

      h(["Guardando senhas corretamente", "Storing passwords correctly"]),
      p(["Senhas jamais ficam em texto puro nem sob hash rápido. A função de hash deve ser **lenta de propósito, ter sal único por senha e consumir memória**, para tornar caro cada palpite do atacante que roubou a base. As opções reconhecidas são **argon2id** (vencedor da competição de hashing de senhas, recomendado pelo OWASP), **scrypt** e **bcrypt** (antigo, ainda aceitável, com limite de 72 bytes na entrada). Ajuste o custo para algo como 100 a 500 ms por verificação no seu servidor e reavalie com o tempo, aumentando-o conforme o hardware evolui. Uma **pimenta** (*pepper*) opcional, um segredo guardado fora do banco, adiciona uma defesa se só o banco vazar.", "Passwords never sit in plain text or under a fast hash. The hash function must be **deliberately slow, have a unique salt per password and consume memory**, to make each guess costly for an attacker who stole the database. The recognized options are **argon2id** (winner of the password hashing competition, recommended by OWASP), **scrypt** and **bcrypt** (older, still acceptable, with a 72-byte input limit). Tune the cost to something like 100 to 500 ms per check on your server and reassess over time, raising it as hardware evolves. An optional **pepper**, a secret kept outside the database, adds a defense if only the database leaks."]),
      code(`import argon2 from "argon2";

// Register: the library generates a random salt and embeds parameters in the string
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19456,   // KiB (about 19 MiB)
  timeCost: 2,
  parallelism: 1,
});
// $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>   <- store this string

// Login: constant-time verification
const ok = await argon2.verify(storedHash, candidatePassword);

// Upgrade parameters transparently on successful login
if (ok && argon2.needsRehash(storedHash, { memoryCost: 19456, timeCost: 3 })) {
  await users.updateHash(userId, await argon2.hash(candidatePassword, { type: argon2.argon2id }));
}`),
      ul(
        ["Limite tentativas de login por conta e por IP (com atraso progressivo, não bloqueio permanente que vira ataque de negação) e proteja contra **credential stuffing**, a reutilização de senhas vazadas em outros sites.", "Limit login attempts per account and per IP (with progressive delay, not permanent lockout that becomes a denial attack) and defend against **credential stuffing**, the reuse of passwords leaked from other sites."],
        ["Siga as orientações do NIST: prefira senhas longas a regras de composição, não force trocas periódicas sem motivo e consulte bases de senhas vazadas (Have I Been Pwned, por k-anonimato) ao cadastrar.", "Follow NIST guidance: prefer long passwords over composition rules, do not force periodic changes without reason and check leaked-password databases (Have I Been Pwned, via k-anonymity) at signup."],
        ["Mensagens de erro de login devem ser iguais para *usuário inexistente* e *senha errada*, e a recuperação de senha deve usar tokens de uso único com expiração curta.", "Login error messages must be identical for *unknown user* and *wrong password*, and password recovery must use single-use tokens with short expiry."],
      ),

      h(["Vantagens, desvantagens e quando terceirizar", "Trade-offs and when to outsource"]),
      p(["Construir login, recuperação de senha, MFA, federação e detecção de abuso por conta própria é um projeto de segurança, não uma tela de formulário, e erros sutis custam caro. Para a maioria dos produtos, terceirizar a identidade (Auth0, Amazon Cognito, Clerk, Firebase Authentication, Microsoft Entra, ou o Keycloak hospedado por você) é mais seguro e barato. As desvantagens são o acoplamento a um fornecedor, o preço por usuário ativo e a dependência de disponibilidade externa; o Keycloak, por ser de código aberto, troca essa dependência por responsabilidade operacional. Escreva o seu apenas se identidade for o seu produto ou se houver exigência regulatória que o obrigue.", "Building login, password recovery, MFA, federation and abuse detection yourself is a security project, not a form screen, and subtle errors are costly. For most products, outsourcing identity (Auth0, Amazon Cognito, Clerk, Firebase Authentication, Microsoft Entra, or self-hosted Keycloak) is safer and cheaper. The downsides are vendor coupling, per-active-user pricing and dependence on external availability; Keycloak, being open source, trades that dependence for operational responsibility. Write your own only if identity is your product or a regulatory requirement forces it."]),

      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Guardar tokens de acesso em `localStorage`, expostos a qualquer XSS.", "Keeping access tokens in `localStorage`, exposed to any XSS."],
        ["JWT de longa duração sem forma de revogação, ou aceitar qualquer algoritmo na validação.", "Long-lived JWTs with no way to revoke, or accepting any algorithm on validation."],
        ["Verificar o papel mas não o dono do objeto (IDOR).", "Checking the role but not the object's owner (IDOR)."],
        ["Colocar dados sensíveis no payload do JWT, que é legível por qualquer um.", "Putting sensitive data in the JWT payload, which anyone can read."],
        ["Usar OAuth2 como se fosse autenticação, sem OIDC e sem validar o ID token.", "Using OAuth2 as if it were authentication, without OIDC and without validating the ID token."],
        ["Redirect URIs com curinga e fluxo implícito em apps novos.", "Wildcard redirect URIs and the implicit flow in new apps."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Autenticação diz quem é; autorização diz o que pode, e se checa em cada requisição, por objeto.", "Authentication says who; authorization says what, and is checked on every request, per object."],
        ["Sessão com ID opaco é fácil de revogar; JWT valida sem estado, mas exige vida curta e refresh tokens com rotação.", "Opaque-ID sessions are easy to revoke; JWTs validate statelessly but need short life and rotating refresh tokens."],
        ["Authorization Code com PKCE é o fluxo OAuth2 recomendado; OIDC acrescenta identidade; SSO centraliza o login.", "Authorization Code with PKCE is the recommended OAuth2 flow; OIDC adds identity; SSO centralizes login."],
        ["RBAC é simples, ABAC é flexível, ReBAC modela compartilhamento e hierarquia.", "RBAC is simple, ABAC is flexible, ReBAC models sharing and hierarchy."],
        ["Prefira passkeys e WebAuthn a SMS; guarde senhas com argon2id ou bcrypt.", "Prefer passkeys and WebAuthn over SMS; store passwords with argon2id or bcrypt."],
      ),

      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Onde guardar o JWT no navegador?** O mais seguro é um cookie `HttpOnly; Secure; SameSite` definido pelo servidor, que scripts não conseguem ler. `localStorage` fica exposto a XSS.", "**Where to store the JWT in the browser?** The safest is an `HttpOnly; Secure; SameSite` cookie set by the server, which scripts cannot read. `localStorage` is exposed to XSS."],
        ["**OAuth2 serve para login?** Por si só, não: ele autoriza acesso. Para login use OpenID Connect, que acrescenta o ID token.", "**Is OAuth2 meant for login?** By itself, no: it authorizes access. For login use OpenID Connect, which adds the ID token."],
        ["**Como revogar um JWT?** Use vida curta, revogue o refresh token e, se necessário, mantenha uma lista de bloqueio dos identificadores (`jti`) até a expiração.", "**How do I revoke a JWT?** Use short life, revoke the refresh token and, if needed, keep a denylist of identifiers (`jti`) until expiry."],
        ["**argon2 ou bcrypt?** Prefira argon2id em projetos novos; bcrypt continua aceitável e é muito suportado.", "**argon2 or bcrypt?** Prefer argon2id in new projects; bcrypt remains acceptable and widely supported."],
      ),
      tip(["Terceirizar a identidade (Auth0, Cognito, Keycloak) costuma ser mais seguro e barato do que escrever login, recuperação de senha e MFA por conta própria.", "Outsourcing identity (Auth0, Cognito, Keycloak) is usually safer and cheaper than writing login, password recovery and MFA yourself."]),
    ] },

  { id: "tls-e-ssl", section: "operacao", level: 1, icon: "https", minutes: 12,
    title: ["TLS, SSL e HTTPS", "TLS, SSL and HTTPS"],
    summary: ["Handshake TLS 1.3, certificados X.509, cadeia de CAs, Let's Encrypt e ACME, HSTS, mTLS, cipher suites e perfect forward secrecy.", "TLS 1.3 handshake, X.509 certificates, CA chains, Let's Encrypt and ACME, HSTS, mTLS, cipher suites and perfect forward secrecy."],
    body: [
      p(["Quando você digita uma senha em um site, os dados atravessam dezenas de roteadores, redes Wi-Fi e provedores que não controla. Sem proteção, qualquer um no caminho pode **ler** a senha, **alterá-la** ou fazer-se passar pelo servidor. O **TLS** (*Transport Layer Security*) é o protocolo que resolve isso: cria um canal protegido entre dois pontos sobre uma conexão TCP comum. **SSL** (*Secure Sockets Layer*) é o nome do antecessor, hoje inseguro e aposentado (SSL 2.0 e 3.0, e também TLS 1.0 e 1.1), embora o termo sobreviva no uso comum, como em *certificado SSL*. **HTTPS** é simplesmente o HTTP dentro de uma conexão TLS.", "When you type a password into a site, the data crosses dozens of routers, Wi-Fi networks and providers you do not control. Unprotected, anyone on the path can **read** the password, **alter** it or impersonate the server. **TLS** (*Transport Layer Security*) is the protocol that solves this: it creates a protected channel between two endpoints over an ordinary TCP connection. **SSL** (*Secure Sockets Layer*) is the name of its predecessor, now insecure and retired (SSL 2.0 and 3.0, and also TLS 1.0 and 1.1), although the term lives on in everyday use, as in *SSL certificate*. **HTTPS** is simply HTTP inside a TLS connection."]),
      p(["O TLS entrega três garantias, e cada uma depende de uma peça diferente: **confidencialidade** (ninguém lê o conteúdo, graças à cifra simétrica), **integridade** (ninguém altera sem ser detectado, graças aos códigos de autenticação dos modos AEAD) e **autenticidade** (você fala com o servidor certo, graças aos certificados). Vamos ver como cada uma é obtida, do handshake à renovação automática de certificados.", "TLS delivers three guarantees, and each depends on a different piece: **confidentiality** (nobody reads the content, thanks to symmetric encryption), **integrity** (nobody alters it undetected, thanks to the authentication codes of AEAD modes) and **authenticity** (you are talking to the right server, thanks to certificates). Let us see how each is obtained, from the handshake to automatic certificate renewal."]),

      h(["Criptografia simétrica, assimétrica e o papel de cada uma", "Symmetric and asymmetric cryptography and the role of each"]),
      p(["A criptografia **simétrica** (AES, ChaCha20) usa a mesma chave para cifrar e decifrar. É muito rápida, mas tem um problema de partida: como duas partes que nunca se encontraram combinam uma chave sem que um espião a descubra? A criptografia **assimétrica** (RSA, curvas elípticas) usa um par de chaves, pública e privada: o que uma cifra, só a outra abre, e uma assina e a outra verifica. É lenta, mas resolve a distribuição da chave e a identidade. O TLS usa as duas: a assimétrica (mais precisamente, uma troca de chaves **Diffie-Hellman** e assinaturas) só para *negociar e autenticar*, e a simétrica, rápida, para *cifrar os dados* da sessão.", "**Symmetric** cryptography (AES, ChaCha20) uses the same key to encrypt and decrypt. It is very fast but has a starting problem: how do two parties who never met agree on a key without a spy finding it? **Asymmetric** cryptography (RSA, elliptic curves) uses a key pair, public and private: what one encrypts only the other opens, and one signs while the other verifies. It is slow but solves key distribution and identity. TLS uses both: the asymmetric kind (more precisely, a **Diffie-Hellman** key exchange and signatures) only to *negotiate and authenticate*, and the fast symmetric kind to *encrypt the session data*."]),

      h(["O handshake TLS 1.3 passo a passo", "The TLS 1.3 handshake step by step"]),
      fig(["Handshake do TLS 1.3 (1-RTT)", "TLS 1.3 handshake (1-RTT)"],
        [[node("c1", ["Cliente", "Client"], "client")], [node("ch", ["ClientHello: versões, cifras, key_share", "ClientHello: versions, ciphers, key_share"], "edge")], [node("sh", ["ServerHello: key_share, certificado, assinatura, Finished", "ServerHello: key_share, certificate, signature, Finished"], "service")], [node("fin", ["Cliente valida e envia Finished", "Client validates and sends Finished"], "edge")], [node("data", ["Dados cifrados (AEAD)", "Encrypted data (AEAD)"], "data")]],
        [edge("c1", "ch", "1"), edge("ch", "sh", "2"), edge("sh", "fin", "3"), edge("fin", "data", "4")]),
      ul(
        ["**1. ClientHello**: o cliente envia as versões de TLS que suporta, a lista de *cipher suites*, um número aleatório, o nome do servidor desejado (extensão **SNI**, que permite vários domínios no mesmo IP) e, já nessa primeira mensagem, sua **parte pública da troca de chaves** (`key_share`) para uma curva como X25519.", "**1. ClientHello**: the client sends the TLS versions it supports, the list of *cipher suites*, a random number, the desired server name (**SNI** extension, which allows several domains on one IP) and, already in this first message, its **public part of the key exchange** (`key_share`) for a curve such as X25519."],
        ["**2. ServerHello**: o servidor escolhe a versão e a cifra, devolve sua parte pública da troca de chaves e, com isso, os dois lados já calculam o **mesmo segredo compartilhado** sem que ele jamais trafegue. Daí em diante o servidor envia tudo *cifrado*: seu **certificado**, uma **assinatura** sobre a transcrição do handshake com sua chave privada (prova de que possui a chave do certificado) e a mensagem **Finished**.", "**2. ServerHello**: the server picks the version and cipher, returns its public part of the key exchange and, with that, both sides already compute the **same shared secret** without it ever traveling. From then on the server sends everything *encrypted*: its **certificate**, a **signature** over the handshake transcript with its private key (proof that it holds the certificate's key) and the **Finished** message."],
        ["**3. Validação**: o cliente verifica a cadeia de certificados, o nome, a validade e a assinatura. Se algo falha, a conexão é abortada e o navegador mostra o aviso.", "**3. Validation**: the client verifies the certificate chain, the name, validity and the signature. If anything fails, the connection is aborted and the browser shows the warning."],
        ["**4. Finished e dados**: o cliente envia seu Finished, e a aplicação já pode trafegar dados cifrados e autenticados com chaves simétricas derivadas do segredo (AES-GCM ou ChaCha20-Poly1305).", "**4. Finished and data**: the client sends its Finished, and the application can already exchange encrypted, authenticated data with symmetric keys derived from the secret (AES-GCM or ChaCha20-Poly1305)."],
      ),
      code(`client                                   server
  | ClientHello (ciphers, key_share) ---->|
  |<---- ServerHello (key_share)           |   keys derived here
  |<---- {Certificate, Signature, Finished}|   {} = already encrypted
  | {Finished} ---------------------------->|
  |<============ application data =========>|

TLS 1.2 needed 2 round trips; TLS 1.3 needs 1 (1-RTT).
With a resumed session (PSK), the client may send data in the first flight (0-RTT).`),
      p(["O TLS 1.3 (RFC 8446, de 2018) simplificou muito o protocolo em relação ao 1.2: **removeu** algoritmos fracos (RC4, CBC, SHA-1, RSA como troca de chaves, compressão), reduziu o handshake a **uma ida e volta** e cifra quase todo o handshake, inclusive o certificado, o que melhora a privacidade. O modo **0-RTT** (dados na primeira mensagem, ao retomar uma sessão) reduz ainda mais a latência, mas os dados enviados podem ser **reenviados por um atacante** (*replay*), então só deve ser usado em requisições idempotentes, como GET.", "TLS 1.3 (RFC 8446, from 2018) simplified the protocol a lot over 1.2: it **removed** weak algorithms (RC4, CBC, SHA-1, RSA as key exchange, compression), cut the handshake to **one round trip** and encrypts almost the entire handshake, including the certificate, which improves privacy. The **0-RTT** mode (data in the first message when resuming a session) lowers latency further, but the data sent can be **replayed by an attacker**, so it should be used only on idempotent requests such as GET."]),

      h(["Cipher suites e perfect forward secrecy", "Cipher suites and perfect forward secrecy"]),
      p(["Uma **cipher suite** nomeia o conjunto de algoritmos usados. No TLS 1.2 ela é longa, como `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`: troca de chaves (ECDHE), autenticação (RSA), cifra com modo (AES-256-GCM) e função de hash (SHA-384). No TLS 1.3 ficaram só cinco suites, já que a troca de chaves e a autenticação são negociadas à parte: `TLS_AES_128_GCM_SHA256`, `TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256` e duas variantes CCM raramente usadas. Todas são **AEAD** (*authenticated encryption with associated data*), que cifram e autenticam de uma vez.", "A **cipher suite** names the set of algorithms in use. In TLS 1.2 it is long, like `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`: key exchange (ECDHE), authentication (RSA), cipher with mode (AES-256-GCM) and hash function (SHA-384). In TLS 1.3 only five suites remain, since key exchange and authentication are negotiated separately: `TLS_AES_128_GCM_SHA256`, `TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256` and two rarely used CCM variants. All are **AEAD** (authenticated encryption with associated data), encrypting and authenticating in one step."]),
      p(["O **perfect forward secrecy (PFS)** é a propriedade de que o vazamento futuro da chave privada do servidor *não* permite decifrar tráfego gravado no passado. Ela vem do uso de chaves **efêmeras** (ECDHE): a cada conexão, os dois lados geram um par temporário, derivam o segredo e o descartam. A chave privada do certificado só serve para *assinar* o handshake e provar identidade, não para proteger o segredo. Sem PFS (troca de chaves por RSA, como no TLS 1.2 antigo), um adversário que grava o tráfego hoje e obtém a chave do servidor daqui a cinco anos decifra tudo. No TLS 1.3, PFS é obrigatório.", "**Perfect forward secrecy (PFS)** is the property that a future leak of the server's private key does *not* allow decrypting traffic recorded in the past. It comes from using **ephemeral** keys (ECDHE): on each connection both sides generate a temporary pair, derive the secret and discard it. The certificate's private key only *signs* the handshake and proves identity; it does not protect the secret. Without PFS (RSA key exchange, as in old TLS 1.2), an adversary who records traffic today and obtains the server's key five years from now decrypts everything. In TLS 1.3, PFS is mandatory."]),

      h(["Certificados X.509 e a cadeia de confiança", "X.509 certificates and the chain of trust"]),
      p(["Cifrar não basta: é preciso saber *com quem* você fala. Sem isso, um atacante no meio (*man-in-the-middle*) poderia negociar uma chave com você, outra com o servidor e repassar tudo, lendo no caminho. Um **certificado digital** (padrão **X.509**) liga uma **identidade** (o nome de domínio) a uma **chave pública**, e é **assinado** por uma **autoridade certificadora (CA)** em que o navegador confia. Os campos principais:", "Encrypting is not enough: you must know *whom* you are talking to. Without that, a man-in-the-middle attacker could negotiate one key with you, another with the server and relay everything, reading along. A **digital certificate** (**X.509** standard) binds an **identity** (the domain name) to a **public key**, and is **signed** by a **certificate authority (CA)** that the browser trusts. The main fields:"]),
      ul(
        ["**Subject** e **Subject Alternative Name (SAN)**: os domínios cobertos (`example.com`, `*.example.com`). Os navegadores verificam o SAN, não mais o campo CN.", "**Subject** and **Subject Alternative Name (SAN)**: the covered domains (`example.com`, `*.example.com`). Browsers check the SAN, no longer the CN field."],
        ["**Chave pública** do titular e o algoritmo (RSA 2048 ou curvas elípticas como P-256).", "The holder's **public key** and algorithm (RSA 2048 or elliptic curves such as P-256)."],
        ["**Validade** (`Not Before`, `Not After`), hoje limitada pelos navegadores a no máximo 398 dias, com tendência de encurtar.", "**Validity** (`Not Before`, `Not After`), now capped by browsers at 398 days at most, with a trend toward shorter."],
        ["**Emissor** e **assinatura** da CA, além de extensões como o uso permitido da chave e pontos de revogação (CRL, OCSP).", "**Issuer** and the CA's **signature**, plus extensions such as permitted key usage and revocation points (CRL, OCSP)."],
      ),
      fig(["Cadeia de confiança de um certificado", "A certificate's chain of trust"],
        [[node("root", ["CA raiz (no repositório de confiança)", "Root CA (in the trust store)"], "data")], [node("inter", ["CA intermediária", "Intermediate CA"], "service")], [node("leaf", ["Certificado do site (folha)", "Site certificate (leaf)"], "edge")], [node("brw", ["Navegador valida", "Browser validates"], "client")]],
        [edge("root", "inter", ["assina", "signs"]), edge("inter", "leaf", ["assina", "signs"]), edge("leaf", "brw", ["apresentado no handshake", "presented in the handshake"])]),
      p(["O navegador (ou o sistema operacional) traz um **repositório de confiança** com centenas de certificados de **CAs raiz**. O servidor envia o certificado folha e os intermediários; o cliente verifica, de baixo para cima, que cada assinatura confere até chegar a uma raiz conhecida. As raízes ficam offline e guardadas com extremo cuidado; quem emite no dia a dia são as intermediárias, o que limita o dano se uma delas for comprometida. Erro frequente: o servidor **não enviar a cadeia completa** (falta a intermediária), e então alguns clientes falham e outros, que a têm em cache, funcionam, o que dificulta o diagnóstico.", "The browser (or operating system) ships a **trust store** with hundreds of **root CA** certificates. The server sends the leaf certificate and the intermediates; the client verifies, bottom to top, that each signature checks out until it reaches a known root. Roots stay offline and are guarded with extreme care; day-to-day issuing is done by intermediates, which limits the damage if one is compromised. A frequent mistake: the server **not sending the full chain** (missing the intermediate), so some clients fail and others that have it cached work, which makes diagnosis harder."]),
      p(["A **revogação** de certificados comprometidos é historicamente frágil. As listas **CRL** são grandes; o **OCSP** consulta a CA a cada conexão (lento e com implicações de privacidade), e por isso se usa o **OCSP stapling**, em que o servidor anexa uma resposta recente e assinada. Com a validade cada vez mais curta, a revogação perde importância: um certificado que vale 90 dias (ou menos) expira antes de causar grande dano. O ecossistema também usa o **Certificate Transparency**, logs públicos e auditáveis de todos os certificados emitidos, para que qualquer emissão indevida para o seu domínio possa ser detectada.", "**Revocation** of compromised certificates has historically been fragile. **CRL** lists are large; **OCSP** queries the CA on every connection (slow and with privacy implications), which is why **OCSP stapling** is used, where the server attaches a recent, signed response. With ever shorter validity, revocation matters less: a certificate valid for 90 days (or less) expires before it does great harm. The ecosystem also uses **Certificate Transparency**, public auditable logs of all issued certificates, so any improper issuance for your domain can be detected."]),

      h(["Let's Encrypt e o protocolo ACME", "Let's Encrypt and the ACME protocol"]),
      p(["Até meados da década de 2010, certificados custavam dinheiro e exigiam processos manuais, o que mantinha grande parte da web em HTTP. O **Let's Encrypt**, uma CA gratuita e automatizada, mudou isso com o protocolo **ACME** (RFC 8555). Um cliente (Certbot, acme.sh, Caddy, cert-manager no Kubernetes) prova que controla o domínio por um **desafio** e recebe o certificado sem intervenção humana. Os certificados valem **90 dias** de propósito, para forçar a automação da renovação.", "Until the mid-2010s, certificates cost money and required manual processes, which kept much of the web on HTTP. **Let's Encrypt**, a free and automated CA, changed that with the **ACME** protocol (RFC 8555). A client (Certbot, acme.sh, Caddy, cert-manager on Kubernetes) proves it controls the domain through a **challenge** and receives the certificate with no human intervention. Certificates last **90 days** on purpose, to force renewal automation."]),
      ul(
        ["**HTTP-01**: o cliente publica um arquivo em `http://dominio/.well-known/acme-challenge/<token>`. Simples, mas não emite curingas.", "**HTTP-01**: the client publishes a file at `http://domain/.well-known/acme-challenge/<token>`. Simple, but cannot issue wildcards."],
        ["**DNS-01**: o cliente cria um registro TXT `_acme-challenge.dominio`. Exige acesso à API do DNS, mas é a única forma de emitir **certificados curinga** (`*.dominio`) e funciona para servidores sem acesso público.", "**DNS-01**: the client creates a TXT record `_acme-challenge.domain`. Requires DNS API access, but is the only way to issue **wildcard certificates** (`*.domain`) and works for servers without public access."],
        ["**TLS-ALPN-01**: o desafio ocorre na própria porta 443, útil quando não há porta 80 nem acesso ao DNS.", "**TLS-ALPN-01**: the challenge happens on port 443 itself, useful when there is no port 80 or DNS access."],
      ),
      code(`# Issue and install with Certbot (nginx plugin), then test automatic renewal
sudo certbot --nginx -d example.com -d www.example.com
sudo certbot renew --dry-run

# Inspect the certificate a server actually presents
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \\
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName

# Days left until expiry (useful for a monitoring check)
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \\
  | openssl x509 -noout -enddate`),

      h(["Configurando TLS de forma segura", "Configuring TLS securely"]),
      code(`server {
    listen 443 ssl;
    http2 on;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;  # leaf + intermediates
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;                 # no TLS 1.0 / 1.1
    ssl_prefer_server_ciphers off;                 # let modern clients pick
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;                       # keeps forward secrecy simple

    ssl_stapling on;
    ssl_stapling_verify on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}

server {                                           # redirect all plain HTTP
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}`),
      p(["Ferramentas como o gerador de configuração da Mozilla e o teste do SSL Labs ajudam a manter o perfil atualizado e a verificar o resultado. Em geral, a recomendação moderna é aceitar TLS 1.3 e, por compatibilidade, TLS 1.2 com suites ECDHE e AEAD.", "Tools such as Mozilla's configuration generator and the SSL Labs test help keep the profile current and verify the result. In general, the modern recommendation is to accept TLS 1.3 and, for compatibility, TLS 1.2 with ECDHE and AEAD suites."]),

      h(["HSTS: nunca mais HTTP", "HSTS: never plain HTTP again"]),
      p(["Mesmo com HTTPS ativo, o primeiro acesso de um usuário que digita `exemplo.com` costuma começar em HTTP, e um atacante na rede pode interceptá-lo e impedir o redirecionamento (*SSL stripping*). O cabeçalho **HSTS** (`Strict-Transport-Security: max-age=31536000; includeSubDomains`) instrui o navegador a usar **somente HTTPS** nesse domínio pelo prazo informado, convertendo qualquer `http://` em `https://` antes de sair do computador e recusando certificados inválidos sem opção de continuar. O atributo `preload` permite incluir o domínio em uma lista embutida nos navegadores, protegendo até o primeiro acesso, mas é difícil de desfazer: ative-o só quando todos os subdomínios suportarem HTTPS. Comece com um `max-age` curto e aumente.", "Even with HTTPS on, a user's first visit typing `example.com` usually starts on HTTP, and an attacker on the network can intercept it and block the redirect (*SSL stripping*). The **HSTS** header (`Strict-Transport-Security: max-age=31536000; includeSubDomains`) tells the browser to use **HTTPS only** for that domain for the stated period, converting any `http://` to `https://` before it leaves the computer and refusing invalid certificates with no option to proceed. The `preload` attribute lets the domain be included in a list built into browsers, protecting even the first visit, but it is hard to undo: enable it only when all subdomains support HTTPS. Start with a short `max-age` and raise it."]),

      h(["mTLS e TLS entre serviços", "mTLS and TLS between services"]),
      p(["No TLS comum, só o servidor se identifica. No **TLS mútuo (mTLS)**, o servidor também exige um **certificado do cliente** e o valida, provando a identidade dos dois lados. É a base do modelo **zero trust** em microsserviços: cada serviço tem uma identidade criptográfica, e o serviço de pagamentos pode aceitar chamadas apenas do serviço de pedidos, independentemente do IP. Também é usado em APIs B2B e em dispositivos IoT. O desafio operacional é emitir, distribuir e renovar milhares de certificados de vida curta, e é aí que entram os **service meshes** (Istio, Linkerd), que automatizam o mTLS por *sidecars* ou pelo plano de dados, e infraestruturas como SPIFFE/SPIRE, que emitem identidades de carga de trabalho.", "In ordinary TLS only the server identifies itself. In **mutual TLS (mTLS)**, the server also demands a **client certificate** and validates it, proving the identity of both sides. It is the basis of the **zero trust** model in microservices: each service has a cryptographic identity, and the payments service can accept calls only from the orders service, regardless of IP. It is also used in B2B APIs and IoT devices. The operational challenge is issuing, distributing and renewing thousands of short-lived certificates, which is where **service meshes** (Istio, Linkerd) come in, automating mTLS via *sidecars* or the data plane, along with infrastructures such as SPIFFE/SPIRE that issue workload identities."]),
      code(`# nginx: require a client certificate signed by our internal CA
server {
    listen 8443 ssl;
    ssl_certificate         /etc/pki/payments.crt;
    ssl_certificate_key     /etc/pki/payments.key;
    ssl_client_certificate  /etc/pki/internal-ca.crt;   # who may sign clients
    ssl_verify_client       on;

    location / {
        # the verified identity is available to the app
        proxy_set_header X-Client-DN $ssl_client_s_dn;
        proxy_pass http://127.0.0.1:9000;
    }
}`),

      h(["Terminação de TLS e onde cifrar", "TLS termination and where to encrypt"]),
      ul(
        ["**Terminação no balanceador ou CDN**: alivia as aplicações da criptografia, centraliza os certificados e permite inspecionar o tráfego (WAF, roteamento por caminho). O trecho interno fica em claro a não ser que você **recifre** até o servidor (*TLS re-encryption*).", "**Termination at the load balancer or CDN**: relieves applications of encryption, centralizes certificates and allows inspecting traffic (WAF, path routing). The internal leg stays in clear unless you **re-encrypt** to the server (*TLS re-encryption*)."],
        ["**TLS passthrough**: o balanceador repassa os bytes cifrados (roteando por SNI) e a aplicação termina o TLS. Garante cifra fim a fim, mas impede o balanceador de ver o conteúdo.", "**TLS passthrough**: the balancer forwards the encrypted bytes (routing by SNI) and the application terminates TLS. Guarantees end-to-end encryption but prevents the balancer from seeing the content."],
        ["**Aceleração**: o custo de CPU do TLS moderno é baixo (instruções AES-NI, curvas rápidas), e a retomada de sessão evita handshakes completos. Em HTTP/3 (QUIC) o TLS 1.3 é parte integrante do protocolo.", "**Performance**: the CPU cost of modern TLS is low (AES-NI instructions, fast curves), and session resumption avoids full handshakes. In HTTP/3 (QUIC), TLS 1.3 is an integral part of the protocol."],
      ),

      h(["Erros comuns e como diagnosticar", "Common mistakes and how to diagnose"]),
      ul(
        ["**Certificado vencido**: a causa mais comum de incidente com TLS. Automatize a renovação e alerte quando faltar menos de 14 dias para vencer.", "**Expired certificate**: the most common TLS incident. Automate renewal and alert when under 14 days remain."],
        ["**Cadeia incompleta** (sem a intermediária) ou nome fora do SAN.", "**Incomplete chain** (missing intermediate) or name outside the SAN."],
        ["**Conteúdo misto**: página HTTPS carregando scripts ou imagens por HTTP, bloqueados pelo navegador.", "**Mixed content**: HTTPS page loading scripts or images over HTTP, blocked by the browser."],
        ["**Relógio errado** em servidor ou dispositivo, que torna certificados válidos aparentemente vencidos.", "**Wrong clock** on a server or device, making valid certificates appear expired."],
        ["Desligar a verificação de certificado em código de cliente (`verify=False`, `rejectUnauthorized: false`) para fazer um erro 'sumir', o que elimina a autenticação.", "Disabling certificate verification in client code (`verify=False`, `rejectUnauthorized: false`) to make an error 'go away', which removes authentication."],
        ["Chave privada guardada no repositório ou copiada entre ambientes.", "Private key kept in the repository or copied across environments."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["TLS dá confidencialidade, integridade e autenticidade; HTTPS é HTTP sobre TLS; SSL é o nome antigo.", "TLS gives confidentiality, integrity and authenticity; HTTPS is HTTP over TLS; SSL is the old name."],
        ["O handshake usa criptografia assimétrica para negociar e a simétrica para os dados; no TLS 1.3, leva 1 ida e volta.", "The handshake uses asymmetric cryptography to negotiate and symmetric for data; in TLS 1.3 it takes 1 round trip."],
        ["Chaves efêmeras (ECDHE) dão perfect forward secrecy.", "Ephemeral keys (ECDHE) give perfect forward secrecy."],
        ["Certificados X.509 assinados por uma cadeia de CAs ligam o domínio à chave pública; Let's Encrypt e ACME automatizam a emissão.", "X.509 certificates signed by a chain of CAs bind the domain to the public key; Let's Encrypt and ACME automate issuance."],
        ["HSTS impede downgrade para HTTP; mTLS autentica os dois lados entre serviços.", "HSTS prevents downgrade to HTTP; mTLS authenticates both sides between services."],
      ),

      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**HTTPS deixa o site mais lento?** O custo do handshake é de uma ida e volta e o de CPU é pequeno; com HTTP/2, HTTP/3 e retomada de sessão, o HTTPS costuma ser tão rápido ou mais rápido que HTTP.", "**Does HTTPS slow the site down?** The handshake costs one round trip and the CPU cost is small; with HTTP/2, HTTP/3 and session resumption, HTTPS is usually as fast as or faster than HTTP."],
        ["**O cadeado significa que o site é confiável?** Só que a conexão é cifrada e que o domínio é aquele; um site de golpe também pode ter certificado válido.", "**Does the padlock mean the site is trustworthy?** Only that the connection is encrypted and the domain is the one shown; a scam site can also have a valid certificate."],
        ["**Posso usar certificado autoassinado?** Em testes e redes internas com sua própria CA instalada nos clientes, sim; na internet pública, os navegadores o rejeitam.", "**Can I use a self-signed certificate?** In tests and internal networks with your own CA installed on clients, yes; on the public internet, browsers reject it."],
        ["**Preciso de TLS dentro da rede interna?** Sim, em um modelo zero trust: redes internas são alvo de movimento lateral. mTLS via service mesh torna isso automático.", "**Do I need TLS inside the internal network?** Yes, in a zero trust model: internal networks are targets for lateral movement. mTLS through a service mesh makes it automatic."],
      ),
      tip(["A causa mais comum de incidente com TLS é certificado vencido. Automatize a renovação e crie um alerta para certificados com menos de 14 dias de validade.", "The most common TLS incident is an expired certificate. Automate renewal and alert on certificates with under 14 days of validity left."]),
    ] },

  { id: "backup-e-recuperacao-de-desastres", section: "operacao", level: 2, icon: "storage", minutes: 13,
    title: ["Backup e recuperação de desastres", "Backup and disaster recovery"],
    summary: ["RPO e RTO, 3-2-1, completo, incremental e diferencial, PITR, snapshots, quatro estratégias de DR com custo x RTO, testes de restauração e proteção contra ransomware.", "RPO and RTO, 3-2-1, full, incremental and differential, PITR, snapshots, four DR strategies with cost vs RTO, restore testing and ransomware protection."],
    body: [
      p(["Há um mal-entendido comum: *já temos réplicas, então estamos protegidos*. Replicação protege contra a **falha de uma máquina**, mas **não** contra um `DELETE` sem `WHERE`, um bug que corrompe registros, uma migração errada ou um ransomware: o erro é copiado para as réplicas em segundos. **Backup** guarda cópias históricas e isoladas que permitem voltar no tempo; **recuperação de desastres** (*disaster recovery*, DR) é o conjunto de planos e infraestrutura para recolocar o sistema no ar depois de perder um datacenter, uma região ou o controle da própria conta.", "There is a common misunderstanding: *we have replicas, so we are protected*. Replication protects against **machine failure**, but **not** against a `DELETE` without `WHERE`, a bug that corrupts records, a wrong migration or ransomware: the mistake is copied to the replicas in seconds. **Backup** keeps historical, isolated copies that let you go back in time; **disaster recovery** (DR) is the set of plans and infrastructure for putting the system back online after losing a datacenter, a region or control of your own account."]),
      p(["Os desastres reais incluem falhas de hardware e de energia, erro humano (a causa mais frequente), defeitos de software, ataques cibernéticos, incêndios e inundações em datacenters, falha de um provedor de nuvem e até o encerramento de uma conta. Este artigo mostra como definir metas, escolher tipos de backup, desenhar uma estratégia de DR proporcional ao negócio e, principalmente, como *provar* que a recuperação funciona.", "Real disasters include hardware and power failures, human error (the most frequent cause), software defects, cyberattacks, fires and floods at datacenters, a cloud provider outage and even account termination. This article shows how to set targets, choose backup types, design a DR strategy proportional to the business and, above all, how to *prove* that recovery works."]),

      h(["RPO e RTO: as duas metas", "RPO and RTO: the two targets"]),
      ul(
        ["**RPO** (*Recovery Point Objective*): quantos dados você aceita perder, medido em **tempo**. Um RPO de 5 minutos significa que, depois do desastre, o sistema volta com dados de no máximo 5 minutos atrás, exigindo backups ou logs com no máximo essa defasagem.", "**RPO** (Recovery Point Objective): how much data you accept losing, measured in **time**. An RPO of 5 minutes means that after the disaster the system returns with data at most 5 minutes old, requiring backups or logs with at most that lag."],
        ["**RTO** (*Recovery Time Objective*): quanto tempo o serviço pode ficar fora. Um RTO de 1 hora significa voltar a operar em até 1 hora após o desastre, incluindo detectar, decidir, restaurar e validar.", "**RTO** (Recovery Time Objective): how long the service may be down. An RTO of 1 hour means being back within 1 hour of the disaster, including detecting, deciding, restoring and validating."],
        ["**MTD** ou **MAO** (*maximum tolerable downtime*): o limite absoluto, a partir do qual o prejuízo ao negócio é inaceitável. O RTO precisa ser menor que ele.", "**MTD** or **MAO** (maximum tolerable downtime): the absolute limit beyond which the business damage is unacceptable. The RTO must be smaller than it."],
      ),
      p(["Quanto menores os dois, mais cara a solução, e o custo cresce de forma não linear: passar de RPO de 24 horas para 1 hora é barato (backups mais frequentes); chegar a RPO próximo de zero exige replicação síncrona entre locais. Um painel interno tolera RPO de 24 h e RTO de um dia; um sistema de pagamentos exige RPO próximo de zero e RTO de minutos. **Quem define as metas é o negócio**, com base no custo do tempo parado e da perda de dados, e a engenharia desenha o que cabe nelas. Faça essa conversa por **serviço**, não pela empresa inteira: cada sistema tem seu nível (camadas ou *tiers*).", "The smaller both are, the pricier the solution, and cost grows non-linearly: going from a 24-hour RPO to 1 hour is cheap (more frequent backups); reaching a near-zero RPO needs synchronous replication between sites. An internal dashboard tolerates a 24 h RPO and a one-day RTO; a payment system needs a near-zero RPO and an RTO of minutes. **The business sets the targets**, based on the cost of downtime and data loss, and engineering designs what fits. Have this conversation per **service**, not for the whole company: each system has its own level (*tiers*)."]),

      h(["Tipos de backup", "Types of backup"]),
      table([["Tipo", "Type"], ["O que copia", "What it copies"], ["Tamanho e tempo", "Size and time"], ["Restauração", "Restore"]],
        [["Completo (full)", "Full"], ["Tudo", "Everything"], ["Grande e lento", "Large and slow"], ["Simples: um único conjunto", "Simple: a single set"]],
        [["Incremental", "Incremental"], ["Só o que mudou desde o último backup, de qualquer tipo", "Only what changed since the last backup of any kind"], ["Pequeno e rápido", "Small and fast"], ["Lenta: precisa do completo e de toda a cadeia de incrementais", "Slow: needs the full and the entire chain of incrementals"]],
        [["Diferencial", "Differential"], ["O que mudou desde o último completo", "What changed since the last full"], ["Cresce a cada dia até o próximo completo", "Grows each day until the next full"], ["Média: completo mais o último diferencial", "Medium: full plus the last differential"]],
        [["Incremental perpétuo (synthetic full)", "Incremental forever (synthetic full)"], ["Um completo inicial e incrementais, com completos sintéticos montados no destino", "One initial full and incrementals, with synthetic fulls assembled at the destination"], ["Muito eficiente", "Very efficient"], ["Rápida, se o sistema de backup gerencia a cadeia", "Fast, if the backup system manages the chain"]],
      ),
      p(["Existem ainda dois eixos que importam. Quanto à **consistência**: copiar os arquivos de um banco em execução produz uma cópia quebrada, a menos que seja feita com o mecanismo do próprio banco (`pg_basebackup`, `mysqldump --single-transaction`, `xtrabackup`) ou por um **snapshot** coerente. Quanto à **forma**: o backup *lógico* (um dump em SQL) é portável entre versões, mas lento para restaurar bancos grandes; o *físico* (cópia dos arquivos) é rápido de restaurar, mas preso à versão e ao formato do motor.", "Two other axes matter. On **consistency**: copying the files of a running database yields a broken copy unless it is done with the database's own mechanism (`pg_basebackup`, `mysqldump --single-transaction`, `xtrabackup`) or a coherent **snapshot**. On **form**: a *logical* backup (an SQL dump) is portable across versions but slow to restore for big databases; a *physical* one (file copy) is fast to restore but tied to the engine's version and format."]),

      h(["A regra 3-2-1 (e suas evoluções)", "The 3-2-1 rule (and its evolutions)"]),
      p(["A **regra 3-2-1** resume boas práticas de redundância: **3** cópias dos dados (a de produção e duas de backup), em **2** tipos de mídia ou sistemas de armazenamento diferentes, com **1** cópia **fora do local** (outra região, outra conta, outra nuvem). Cada número protege de um modo de falha: várias cópias resistem à perda de uma; mídias diferentes evitam o mesmo defeito em todas; a cópia remota sobrevive a um desastre no site. A versão moderna **3-2-1-1-0** acrescenta **1** cópia **imutável ou offline** (que ransomware e um invasor com credenciais não conseguem alterar) e **0** erros na verificação de restauração.", "The **3-2-1 rule** sums up good redundancy practice: **3** copies of the data (production and two backups), on **2** different media or storage systems, with **1** copy **off-site** (another region, another account, another cloud). Each number protects against a failure mode: several copies survive the loss of one; different media avoid the same defect in all; the remote copy survives a disaster at the site. The modern **3-2-1-1-0** version adds **1** **immutable or offline** copy (which ransomware and an intruder with credentials cannot alter) and **0** errors in restore verification."]),
      fig(["Regra 3-2-1: cópias, mídias e local remoto", "The 3-2-1 rule: copies, media and off-site"],
        [[node("prod", ["Dados de produção (cópia 1)", "Production data (copy 1)"], "data")], [node("local", ["Backup local rápido (cópia 2, outra mídia)", "Fast local backup (copy 2, other media)"], "service")], [node("remote", ["Backup em outra região e conta (cópia 3)", "Backup in another region and account (copy 3)"], "edge")], [node("vault", ["Cópia imutável / offline", "Immutable / offline copy"], "cache")]],
        [edge("prod", "local", ["backup", "backup"]), edge("local", "remote", ["replica", "replicates"]), edge("remote", "vault", ["Object Lock", "Object Lock"])]),

      h(["PITR: voltar a qualquer instante", "PITR: going back to any instant"]),
      p(["Um backup noturno dá RPO de até 24 horas: se o erro acontece às 17h, você perde o dia. O **PITR** (*point-in-time recovery*) combina um **backup base** com o **log de transações contínuo** (WAL no PostgreSQL, binlog no MySQL, oplog no MongoDB), arquivado em um armazenamento durável. Para restaurar, parte-se do backup base mais recente anterior ao alvo e **reaplicam-se os logs** até o instante desejado, por exemplo dois minutos antes do `DROP TABLE` acidental. O RPO cai para segundos ou minutos (o intervalo de arquivamento do log). Serviços gerenciados (Amazon RDS, Cloud SQL, Azure Database) oferecem isso como recurso, com janela de retenção típica de 7 a 35 dias.", "A nightly backup gives an RPO of up to 24 hours: if the error happens at 5 p.m., you lose the day. **PITR** (*point-in-time recovery*) combines a **base backup** with the **continuous transaction log** (WAL in PostgreSQL, binlog in MySQL, oplog in MongoDB), archived to durable storage. To restore, you start from the latest base backup before the target and **replay the logs** up to the desired instant, say two minutes before the accidental `DROP TABLE`. RPO falls to seconds or minutes (the log archiving interval). Managed services (Amazon RDS, Cloud SQL, Azure Database) offer this as a feature, with a typical retention window of 7 to 35 days."]),
      code(`# postgresql.conf on the primary: continuous WAL archiving
wal_level = replica
archive_mode = on
archive_command = 'wal-g wal-push %p'      # or pgBackRest / cp to durable storage
archive_timeout = 60                       # force a segment at least every minute

# Nightly base backup
wal-g backup-push /var/lib/postgresql/16/main

# Restore to a chosen instant (PostgreSQL 12+)
wal-g backup-fetch /var/lib/postgresql/16/main LATEST
cat >> /var/lib/postgresql/16/main/postgresql.auto.conf <<'CONF'
restore_command = 'wal-g wal-fetch %f %p'
recovery_target_time = '2026-03-14 14:57:30+00'
recovery_target_action = 'promote'
CONF
touch /var/lib/postgresql/16/main/recovery.signal
pg_ctl -D /var/lib/postgresql/16/main start`),

      h(["Snapshots, replicação e arquivamento", "Snapshots, replication and archiving"]),
      ul(
        ["**Snapshots** de volume ou de sistema de arquivos (EBS, ZFS, LVM) são instantâneos e baratos por serem incrementais em nível de bloco, ideais para voltar rapidamente. Para serem consistentes com um banco, é preciso que o banco esteja quiesced ou que o snapshot seja coordenado com ele. Snapshots no mesmo volume ou na mesma conta **não são backup** completo: somem se o volume ou a conta forem perdidos.", "**Snapshots** of a volume or file system (EBS, ZFS, LVM) are instant and cheap because they are incremental at block level, ideal for quick rollbacks. To be consistent with a database, the database must be quiesced or the snapshot coordinated with it. Snapshots on the same volume or account are **not a complete backup**: they vanish if the volume or account is lost."],
        ["**Replicação** (assíncrona ou síncrona) dá alta disponibilidade e RPO baixo contra falhas de máquina, mas replica também os erros. **Réplicas atrasadas** (*delayed replicas*, por exemplo 1 hora de atraso) dão uma janela para reagir a um erro humano.", "**Replication** (asynchronous or synchronous) gives high availability and a low RPO against machine failures but also replicates mistakes. **Delayed replicas** (say 1 hour behind) give a window to react to human error."],
        ["**Arquivamento** de longo prazo (S3 Glacier, fitas) atende exigências legais e fiscais, com custo baixo e recuperação lenta e paga por leitura. Backup e arquivo são coisas diferentes: o primeiro serve para recuperar rapidamente, o segundo para reter por anos.", "Long-term **archiving** (S3 Glacier, tape) meets legal and tax requirements, with low cost and slow, pay-per-read retrieval. Backup and archive are different things: the first is for fast recovery, the second for retention over years."],
        ["**Retenção**: defina uma política, por exemplo diários por 14 dias, semanais por 8 semanas e mensais por 12 meses, e equilibre custo, requisitos legais e o direito ao esquecimento (LGPD, GDPR): dados apagados na produção ainda existem nos backups até expirarem.", "**Retention**: define a policy, for example dailies for 14 days, weeklies for 8 weeks and monthlies for 12 months, balancing cost, legal requirements and the right to erasure (LGPD, GDPR): data deleted in production still exists in backups until they expire."],
      ),

      h(["Estratégias de DR", "DR strategies"]),
      p(["A recuperação de desastres normalmente assume que uma **região inteira** ou o site principal ficou indisponível. A AWS descreve quatro estratégias, em ordem crescente de custo e decrescente de RTO e RPO, que servem de vocabulário geral:", "Disaster recovery normally assumes that an **entire region** or the main site became unavailable. AWS describes four strategies, in increasing order of cost and decreasing RTO and RPO, which serve as a general vocabulary:"]),
      table([["Estratégia", "Strategy"], ["Como funciona", "How it works"], ["RTO típico", "Typical RTO"], ["RPO típico", "Typical RPO"], ["Custo", "Cost"]],
        [["Backup e restauração", "Backup and restore"], ["Backups em outra região; no desastre, recria infraestrutura (IaC) e restaura os dados", "Backups in another region; on disaster, rebuild infrastructure (IaC) and restore data"], ["Horas a dias", "Hours to days"], ["Horas (o último backup)", "Hours (the last backup)"], ["$", "$"]],
        [["Pilot light", "Pilot light"], ["O núcleo mínimo (banco replicado) roda sempre na outra região; a aplicação fica desligada e sobe no desastre", "The minimal core (replicated database) always runs in the other region; the application is off and starts on disaster"], ["Dezenas de minutos", "Tens of minutes"], ["Segundos a minutos (replicação)", "Seconds to minutes (replication)"], ["$$", "$$"]],
        [["Warm standby", "Warm standby"], ["Versão reduzida e funcional da aplicação sempre ligada; escala no desastre", "A reduced, working version of the application always on; scales on disaster"], ["Minutos", "Minutes"], ["Segundos a minutos", "Seconds to minutes"], ["$$$", "$$$"]],
        [["Multi-site ativo-ativo", "Multi-site active-active"], ["Duas ou mais regiões servem tráfego ao mesmo tempo", "Two or more regions serve traffic at the same time"], ["Próximo de zero", "Near zero"], ["Próximo de zero (replicação síncrona ou resolução de conflitos)", "Near zero (synchronous replication or conflict resolution)"], ["$$$$", "$$$$"]],
      ),
      fig(["Pilot light: região secundária com o mínimo ligado", "Pilot light: secondary region with the minimum running"],
        [[node("users", ["Usuários", "Users"], "client")], [node("dns", ["DNS com health check e failover", "DNS with health check and failover"], "edge")], [node("p1", ["Região primária: app completa", "Primary region: full app"], "service"), node("s1", ["Região secundária: app desligada (IaC pronto)", "Secondary region: app off (IaC ready)"], "queue")], [node("pdb", ["Banco primário", "Primary database"], "data"), node("sdb", ["Réplica do banco (ligada)", "Database replica (running)"], "data")]],
        [edge("users", "dns"), edge("dns", "p1", ["normal", "normal"]), edge("dns", "s1", ["failover", "failover"], { dashed: true }), edge("p1", "pdb"), edge("s1", "sdb", undefined, { dashed: true }), edge("pdb", "sdb", ["replicação", "replication"], { dashed: true })]),
      p(["Detalhes que decidem a prática: o **failover** é automático ou exige decisão humana (automático arrisca *split-brain* e falsos disparos; manual aumenta o RTO)? O **DNS** com TTL curto e verificação de saúde (Route 53, Cloud DNS) direciona o tráfego? A **configuração, os segredos e as imagens** existem também na região de destino? As **dependências externas** (provedor de identidade, de pagamento) funcionam de lá? E o retorno (*failback*) à região original, com os dados que mudaram no meio-tempo, está planejado? Cada resposta vira um item do **runbook** de DR.", "Details that decide in practice: is **failover** automatic or does it need a human decision (automatic risks *split-brain* and false triggers; manual raises RTO)? Does **DNS** with short TTL and health checks (Route 53, Cloud DNS) steer traffic? Do the **configuration, secrets and images** also exist in the target region? Do **external dependencies** (identity provider, payment provider) work from there? And is the return (*failback*) to the original region, with the data that changed in the meantime, planned? Each answer becomes an item in the DR **runbook**."]),

      h(["Ransomware e imutabilidade", "Ransomware and immutability"]),
      p(["O ransomware moderno não só cifra os dados de produção: procura e destrói os backups antes de pedir o resgate, usando credenciais roubadas. Defesas específicas:", "Modern ransomware does not just encrypt production data: it seeks out and destroys backups before demanding ransom, using stolen credentials. Specific defenses:"]),
      ul(
        ["**Imutabilidade**: armazenamento WORM (*write once, read many*), como S3 **Object Lock** em modo *compliance* ou *governance*, Azure Immutable Blob e *vault lock*, em que nem o administrador consegue apagar antes do prazo de retenção.", "**Immutability**: WORM (*write once, read many*) storage, such as S3 **Object Lock** in *compliance* or *governance* mode, Azure Immutable Blob and vault lock, where not even the administrator can delete before the retention period."],
        ["**Isolamento de credenciais e contas**: guarde os backups em uma conta ou assinatura separada, com acesso controlado e MFA, de modo que o comprometimento da produção não alcance os backups. Permissões de apenas escrita para quem gera o backup.", "**Credential and account isolation**: keep backups in a separate account or subscription with controlled access and MFA, so that compromising production does not reach the backups. Write-only permissions for whoever produces the backup."],
        ["**Cópia offline** (*air gap*): fita ou mídia desconectada, a última linha de defesa.", "**Offline copy** (*air gap*): tape or disconnected media, the last line of defense."],
        ["**Detecção**: alertas sobre quedas bruscas no tamanho do backup, aumento de entropia dos dados (sinal de cifra em massa) e exclusões em massa.", "**Detection**: alerts on sharp drops in backup size, rising data entropy (a sign of mass encryption) and mass deletions."],
        ["**Versionamento e lixeira** nos buckets, com exclusão em duas etapas.", "**Versioning and a recycle bin** on buckets, with two-step deletion."],
      ),
      code(`# S3 bucket with versioning and a default Object Lock retention of 30 days
aws s3api create-bucket --bucket acme-backups-immutable --object-lock-enabled-for-bucket \\
  --region us-east-1
aws s3api put-object-lock-configuration --bucket acme-backups-immutable \\
  --object-lock-configuration '{"ObjectLockEnabled":"Enabled","Rule":{"DefaultRetention":{"Mode":"COMPLIANCE","Days":30}}}'

# Lifecycle: move older backups to a cheaper tier
aws s3api put-bucket-lifecycle-configuration --bucket acme-backups-immutable \\
  --lifecycle-configuration file://lifecycle.json`),

      h(["Testando a restauração: o backup que nunca foi restaurado", "Testing restores: the backup that was never restored"]),
      p(["Um backup que nunca foi restaurado é uma esperança, não um backup. As histórias de equipes que descobrem, no pior dia, que os backups estavam vazios, corrompidos, cifrados com uma chave perdida ou incompletos são muitas. A verificação precisa ser rotina e automatizada:", "A backup that has never been restored is a hope, not a backup. There are many stories of teams who discover, on the worst day, that backups were empty, corrupted, encrypted with a lost key or incomplete. Verification must be routine and automated:"]),
      ul(
        ["**Restauração automática periódica**: um job semanal restaura o último backup em um ambiente isolado, roda verificações de integridade (contagem de linhas, `pg_checksums`, consultas de sanidade) e mede o **tempo real** de restauração, o RTO verdadeiro.", "**Periodic automatic restore**: a weekly job restores the latest backup into an isolated environment, runs integrity checks (row counts, `pg_checksums`, sanity queries) and measures the **real time** of restoration, the true RTO."],
        ["**Monitoramento do backup**: alerte se um backup não rodou, ficou menor que o esperado ou terminou com erro, e acompanhe a idade do último backup bem-sucedido.", "**Backup monitoring**: alert if a backup did not run, came out smaller than expected or finished with an error, and track the age of the last successful backup."],
        ["**Guarde as chaves** de cifra dos backups em separado e teste a recuperação delas.", "**Keep the encryption keys** of backups separately and test recovering them."],
        ["**Game days**: ensaie o plano completo de DR com o time (derrubar a região primária em um ambiente controlado ou de teste e executar o runbook), cronometrando cada passo. Documentos de DR envelhecem rápido; só o ensaio revela o que mudou.", "**Game days**: rehearse the full DR plan with the team (take down the primary region in a controlled or test environment and run the runbook), timing each step. DR documents age fast; only rehearsal reveals what changed."],
        ["**Quem sabe fazer?** O plano precisa estar escrito de modo que alguém que não o criou consiga executá-lo, e disponível mesmo se o sistema de documentação estiver fora do ar.", "**Who knows how?** The plan must be written so that someone who did not create it can run it, and available even if the documentation system is down."],
      ),

      h(["Vantagens, custos e erros comuns", "Benefits, costs and common mistakes"]),
      ul(
        ["**Custo**: armazenamento, tráfego entre regiões e a infraestrutura de standby. Tiers por criticidade evitam gastar com o que pode esperar.", "**Cost**: storage, cross-region traffic and standby infrastructure. Tiers by criticality avoid spending on what can wait."],
        ["**Erro: backup na mesma conta e região** da produção: um acidente ou invasão leva tudo junto.", "**Mistake: backup in the same account and region** as production: one accident or intrusion takes everything together."],
        ["**Erro: não cobrir o que não é banco de dados**: configurações, segredos, DNS, certificados, contas de IAM e dados de SaaS.", "**Mistake: not covering what is not a database**: configurations, secrets, DNS, certificates, IAM accounts and SaaS data."],
        ["**Erro: metas inventadas** sem validação do negócio, ou um RTO de 15 minutos com um processo manual que leva 4 horas.", "**Mistake: made-up targets** without business validation, or a 15-minute RTO with a manual process that takes 4 hours."],
        ["**Erro: confundir alta disponibilidade com DR.** Várias zonas de disponibilidade em uma região não protegem contra a perda da região, de um erro lógico ou de um ataque.", "**Mistake: confusing high availability with DR.** Multiple availability zones in one region do not protect against losing the region, a logical error or an attack."],
        ["**Erro: esquecer o failback** e os dados novos criados na região secundária.", "**Mistake: forgetting failback** and the new data created in the secondary region."],
      ),
      p(["Casos reais costumam ser lembrados como lições: o incidente de 2017 do GitLab, em que um operador removeu dados do banco errado e vários dos mecanismos de backup se mostraram inoperantes, e o episódio da OVHcloud em 2021, em que o incêndio de um datacenter destruiu clientes que mantinham os backups no mesmo local. A moral é a mesma: cópias isoladas e restauração testada.", "Real cases are often remembered as lessons: the 2017 GitLab incident, in which an operator removed data on the wrong database and several of the backup mechanisms proved inoperative, and the 2021 OVHcloud episode, in which a datacenter fire hurt customers who kept backups in the same place. The moral is the same: isolated copies and tested restores."]),

      h(["Resumo", "Summary"]),
      ul(
        ["Replicação não é backup: erros e ataques se replicam. Backup e DR cobrem erro humano, corrupção, ransomware e perda de região.", "Replication is not backup: mistakes and attacks replicate. Backup and DR cover human error, corruption, ransomware and region loss."],
        ["RPO é a perda de dados tolerada; RTO é o tempo de indisponibilidade tolerado; o negócio define ambos, por serviço.", "RPO is tolerated data loss; RTO is tolerated downtime; the business defines both, per service."],
        ["Siga 3-2-1 (idealmente 3-2-1-1-0), com cópia imutável e em outra conta e região.", "Follow 3-2-1 (ideally 3-2-1-1-0), with an immutable copy in another account and region."],
        ["PITR combina backup base com o log de transações para voltar a qualquer instante.", "PITR combines a base backup with the transaction log to return to any instant."],
        ["Quatro estratégias de DR (backup/restore, pilot light, warm standby, multi-site) trocam custo por RTO.", "Four DR strategies (backup/restore, pilot light, warm standby, multi-site) trade cost for RTO."],
        ["Teste a restauração e ensaie o plano: só assim o RTO é um número real.", "Test restores and rehearse the plan: only then is the RTO a real number."],
      ),

      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Réplica de banco substitui backup?** Não. Ela protege de falha de máquina, mas replica também o `DROP TABLE` e a corrupção.", "**Does a database replica replace backup?** No. It protects against machine failure but also replicates the `DROP TABLE` and the corruption."],
        ["**Com que frequência devo fazer backup?** Pelo menos tão frequente quanto o RPO exige; com PITR, o log contínuo cobre o intervalo entre backups base.", "**How often should I back up?** At least as often as the RPO requires; with PITR, the continuous log covers the gap between base backups."],
        ["**Quanto tempo reter os backups?** O suficiente para detectar problemas silenciosos (corrupção descoberta semanas depois) e cumprir exigências legais; uma política em camadas (diário, semanal, mensal) equilibra custo e cobertura.", "**How long to keep backups?** Long enough to detect silent problems (corruption found weeks later) and meet legal requirements; a tiered policy (daily, weekly, monthly) balances cost and coverage."],
        ["**Multi-AZ já é DR?** É alta disponibilidade dentro de uma região. DR cobre a perda da região ou da conta.", "**Is multi-AZ already DR?** It is high availability within a region. DR covers losing the region or the account."],
      ),
      tip(["Um backup que nunca foi restaurado é uma esperança, não um backup. Agende testes periódicos de restauração, meça o RTO real e ensaie o plano com o time (game day).", "A backup that has never been restored is a hope, not a backup. Schedule periodic restore tests, measure the real RTO and rehearse the plan with the team (game day)."]),
    ] },

  { id: "otimizacao-de-performance", section: "operacao", level: 1, icon: "memory", minutes: 14,
    title: ["Otimização de performance", "Performance optimization"],
    summary: ["Medir primeiro, profiling, lei de Amdahl, CPU x I/O, batching, compressão, pools, paginação, índices, cache, lazy loading, serialização e tabela de ganhos típicos.", "Measure first, profiling, Amdahl's law, CPU vs I/O, batching, compression, pools, pagination, indexes, caching, lazy loading, serialization and a table of typical gains."],
    body: [
      p(["Otimizar é a atividade mais sujeita a desperdício na engenharia: horas gastas deixando mais rápido um trecho que responde por 2% do tempo, em troca de código mais difícil de ler. Donald Knuth resumiu o problema na frase *a otimização prematura é a raiz de todo o mal*, que costuma ser citada pela metade. O contexto completo diz que devemos ignorar pequenas eficiências na maior parte do tempo, mas **não deixar passar as oportunidades nos 3% críticos**. A habilidade está em descobrir quais são esses 3%, e isso só se faz medindo.", "Optimizing is the engineering activity most prone to waste: hours spent speeding up a piece that accounts for 2% of the time, in exchange for harder-to-read code. Donald Knuth summed up the problem in the line *premature optimization is the root of all evil*, which is often quoted halfway. The full context says we should forget small efficiencies most of the time but **not pass up opportunities in the critical 3%**. The skill lies in finding those 3%, and that is done only by measuring."]),
      p(["Este artigo apresenta o método (meta, medição, gargalo, correção, nova medição), as ferramentas para achar o gargalo, as leis que limitam o ganho e as técnicas clássicas para sistemas de back-end, com exemplos de código, uma tabela de ganhos típicos e os erros que mais aparecem.", "This article presents the method (goal, measurement, bottleneck, fix, re-measurement), the tools to find the bottleneck, the laws that limit the gain and the classic techniques for back-end systems, with code examples, a table of typical gains and the mistakes that appear most."]),

      h(["O ciclo: meta, medir, achar, corrigir, medir", "The loop: goal, measure, find, fix, measure"]),
      ul(
        ["**Defina a meta** em termos que o usuário sente e em percentis: *p95 do checkout abaixo de 200 ms com 500 req/s*. Sem meta, não há como saber quando parar.", "**Set the goal** in terms users feel and in percentiles: *checkout p95 under 200 ms at 500 req/s*. Without a goal there is no way to know when to stop."],
        ["**Meça a linha de base** em condições realistas (dados em volume, tráfego representativo). Registre os números.", "**Measure the baseline** under realistic conditions (data at volume, representative traffic). Record the numbers."],
        ["**Ache o maior gargalo** com profiling, traces e métricas. Altere uma coisa por vez.", "**Find the biggest bottleneck** with profiling, traces and metrics. Change one thing at a time."],
        ["**Corrija e meça de novo.** Se o ganho não apareceu, a hipótese estava errada: reverta.", "**Fix and measure again.** If the gain did not show up, the hypothesis was wrong: revert."],
        ["**Repita** até a meta ser atingida. Depois, pare, e proteja o resultado com um teste de regressão de performance.", "**Repeat** until the goal is met. Then stop, and protect the result with a performance regression test."],
      ),

      h(["Achando o gargalo: profiling e tracing", "Finding the bottleneck: profiling and tracing"]),
      p(["Intuição sobre onde o tempo se perde costuma estar errada. Três ferramentas respondem *onde*:", "Intuition about where time is lost is often wrong. Three tools answer *where*:"]),
      ul(
        ["**Profiling de CPU e memória**: um *profiler* amostra a pilha de chamadas dezenas de vezes por segundo e mostra quais funções consomem mais tempo. Os **flame graphs** (Brendan Gregg) desenham isso: a largura de cada barra é o tempo, e a pilha cresce para cima, de modo que o gargalo salta aos olhos. Ferramentas: `pprof` (Go), `async-profiler` e Java Flight Recorder (JVM), `py-spy` (Python), `perf` (Linux), `--cpu-prof` do Node e as ferramentas de desempenho do navegador. Perfis contínuos em produção (Pyroscope, Parca) têm custo baixo.", "**CPU and memory profiling**: a *profiler* samples the call stack dozens of times a second and shows which functions consume the most time. **Flame graphs** (Brendan Gregg) draw this: the width of each bar is time and the stack grows upward, so the bottleneck jumps out. Tools: `pprof` (Go), `async-profiler` and Java Flight Recorder (JVM), `py-spy` (Python), `perf` (Linux), Node's `--cpu-prof` and browser performance tools. Continuous profiling in production (Pyroscope, Parca) has low cost."],
        ["**Tracing distribuído**: mostra qual chamada de serviço, consulta ou espera domina a latência de uma requisição que atravessa vários componentes (ver o artigo de observabilidade).", "**Distributed tracing**: shows which service call, query or wait dominates the latency of a request crossing several components (see the observability article)."],
        ["**Logs lentos e planos de execução** no banco: `pg_stat_statements` (PostgreSQL) ou o *slow query log* (MySQL) listam as consultas mais custosas em total; `EXPLAIN ANALYZE` mostra o plano real de uma delas.", "**Slow logs and execution plans** in the database: `pg_stat_statements` (PostgreSQL) or the *slow query log* (MySQL) list the most costly queries in total; `EXPLAIN ANALYZE` shows the real plan of one of them."],
      ),
      p(["Classifique o tipo de trabalho. Se a CPU está saturada e o tempo está em funções de cálculo, serialização ou criptografia, o trabalho é **CPU-bound**: melhore o algoritmo, reduza o trabalho repetido ou escale horizontalmente. Se a CPU está baixa e a requisição passa o tempo esperando o banco, a rede ou o disco, o trabalho é **I/O-bound**: reduza as idas e voltas, paralelize chamadas independentes, use cache e processamento assíncrono. A maioria dos sistemas web gasta mais tempo esperando I/O que calculando, e por isso adicionar CPU a um serviço I/O-bound não ajuda em nada.", "Classify the type of work. If CPU is saturated and the time is in computation, serialization or encryption functions, the work is **CPU-bound**: improve the algorithm, reduce repeated work or scale out. If CPU is low and the request spends its time waiting on the database, network or disk, the work is **I/O-bound**: cut round trips, parallelize independent calls, use caching and asynchronous processing. Most web systems spend more time waiting on I/O than computing, which is why adding CPU to an I/O-bound service helps nothing."]),
      table([["Sintoma", "Symptom"], ["Provável causa", "Likely cause"], ["Primeira ação", "First action"]],
        [["CPU alta, latência sobe com a carga", "High CPU, latency rises with load"], ["CPU-bound: algoritmo, serialização, regex, criptografia", "CPU-bound: algorithm, serialization, regex, cryptography"], ["Flame graph; reduzir trabalho repetido; escalar", "Flame graph; reduce repeated work; scale out"]],
        [["CPU baixa, latência alta", "Low CPU, high latency"], ["I/O-bound: banco, rede, locks, pools", "I/O-bound: database, network, locks, pools"], ["Trace da requisição; consultas lentas; tamanho do pool", "Request trace; slow queries; pool size"]],
        [["Latência cresce com o tempo de execução", "Latency grows with uptime"], ["Vazamento de memória, GC pesado, cache sem limite", "Memory leak, heavy GC, unbounded cache"], ["Profile de heap; métricas de GC", "Heap profile; GC metrics"]],
        [["p50 bom, p99 ruim", "Good p50, bad p99"], ["Pausas de GC, locks, consultas raras, retries", "GC pauses, locks, rare queries, retries"], ["Traces dos casos lentos; correlacionar com GC", "Traces of slow cases; correlate with GC"]],
      ),

      h(["As leis que limitam o ganho", "The laws that limit the gain"]),
      p(["A **lei de Amdahl** diz que o ganho total de acelerar uma parte do trabalho é limitado pela fração do tempo que essa parte ocupa. Se uma parte responde por uma fração *p* do tempo e é acelerada *s* vezes, o ganho total é `1 / ((1 - p) + p / s)`. Acelerar infinitamente uma parte que ocupa 10% do tempo rende, no máximo, 1 / 0,9, ou cerca de 11% de ganho. Já acelerar duas vezes uma parte que ocupa 80% do tempo dá 1 / (0,2 + 0,4), quase 1,67 vez mais rápido. A lição: ataque sempre o que domina a latência, e depois do primeiro gargalo resolvido, o próximo passa a ser o dominante, e o ganho marginal cai.", "**Amdahl's law** says the total gain from speeding up one part of the work is limited by the fraction of time that part occupies. If a part accounts for a fraction *p* of time and is sped up *s* times, the total speedup is `1 / ((1 - p) + p / s)`. Infinitely speeding up a part that occupies 10% of the time yields at most 1 / 0.9, or about 11% gain. Speeding up twice a part that occupies 80% of the time gives 1 / (0.2 + 0.4), almost 1.67 times faster. The lesson: always attack what dominates latency, and once the first bottleneck is solved, the next becomes dominant and the marginal gain falls."]),
      p(["A **lei de Little** (L = λ × W) relaciona o número de requisições em andamento, a taxa de chegada e o tempo de resposta, e explica por que sistemas saturam de repente: perto da utilização total, filas crescem de forma não linear, e um aumento de 10% de carga pode dobrar a latência. Por isso se mira em utilização de 60% a 70% nos recursos compartilhados, e não 95%. A **latência de cauda** também se amplifica: se uma página faz 20 chamadas paralelas e cada uma tem 1% de chance de ser lenta, a chance de a página sofrer pelo menos uma chamada lenta é de cerca de 18%.", "**Little's law** (L = λ × W) relates the number of in-flight requests, arrival rate and response time, and explains why systems saturate suddenly: near full utilization, queues grow non-linearly, and a 10% rise in load can double latency. That is why you aim for 60% to 70% utilization on shared resources, not 95%. **Tail latency** also amplifies: if a page makes 20 parallel calls and each has a 1% chance of being slow, the chance that the page suffers at least one slow call is about 18%."]),

      h(["Reduzir idas e voltas: batching e o problema N+1", "Cutting round trips: batching and the N+1 problem"]),
      p(["Cada chamada a um banco ou serviço custa uma ida e volta de rede (de 0,2 a poucos milissegundos dentro de um datacenter, e muito mais entre regiões), além do custo de processamento. Fazer 500 chamadas curtas em sequência é muito mais lento que uma única chamada que trate 500 itens. O caso mais comum é o **N+1**: uma consulta busca N itens e, em seguida, o código faz uma consulta *por item* para um dado relacionado, o que costuma surgir por trás do carregamento preguiçoso de ORMs.", "Every call to a database or service costs a network round trip (0.2 to a few milliseconds inside a datacenter, and far more across regions), besides the processing cost. Making 500 short calls in sequence is much slower than a single call handling 500 items. The most common case is **N+1**: one query fetches N items and then the code runs one query *per item* for related data, which often hides behind the lazy loading of ORMs."]),
      code(`// N+1: 1 query for the orders + 1 query per order = 101 round trips for 100 orders
const orders = await db.query("SELECT id, customer_id FROM orders LIMIT 100");
for (const o of orders.rows) {
  o.customer = (await db.query("SELECT name FROM customers WHERE id = $1", [o.customer_id])).rows[0];
}

// Fix 1: a JOIN, a single round trip
const rows = await db.query(
  "SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id LIMIT 100");

// Fix 2: batch with IN / ANY when a JOIN is not possible (2 round trips)
const ids = orders.rows.map(o => o.customer_id);
const customers = await db.query("SELECT id, name FROM customers WHERE id = ANY($1)", [ids]);

// Batch write: one statement with many rows instead of 500 INSERTs
await db.query(
  "INSERT INTO events (user_id, type) SELECT * FROM unnest($1::int[], $2::text[])",
  [userIds, types]);`),
      p(["O mesmo princípio vale para APIs: ofereça endpoints em lote (`POST /items:batchGet`), use GraphQL com *DataLoader* para agrupar buscas e permita que o cliente peça vários recursos de uma vez. E para escritas, agrupe também em transações maiores e em operações de *bulk* (`COPY` no PostgreSQL), medindo o tamanho ideal do lote, porque lotes grandes demais seguram locks e memória.", "The same principle holds for APIs: offer batch endpoints (`POST /items:batchGet`), use GraphQL with *DataLoader* to group lookups and let the client ask for several resources at once. And for writes, group into bigger transactions and *bulk* operations (`COPY` in PostgreSQL), measuring the ideal batch size, because overly large batches hold locks and memory."]),

      h(["Índices e consultas", "Indexes and queries"]),
      p(["Uma consulta que varre a tabela inteira (*sequential scan*) pode cair de segundos para milissegundos com o índice certo (uma busca em árvore B, logarítmica). O ganho pode ser de ordens de grandeza, e é por isso a otimização de maior retorno em muitos sistemas. Confira com `EXPLAIN (ANALYZE, BUFFERS)`: procure por varreduras sequenciais em tabelas grandes, estimativas de linhas muito diferentes das reais (estatísticas desatualizadas, rode `ANALYZE`) e ordenações em disco.", "A query that scans the whole table (*sequential scan*) can drop from seconds to milliseconds with the right index (a logarithmic B-tree lookup). The gain can be orders of magnitude, which is why it is the highest-return optimization in many systems. Check with `EXPLAIN (ANALYZE, BUFFERS)`: look for sequential scans on large tables, row estimates far from the real ones (stale statistics, run `ANALYZE`) and on-disk sorts."]),
      code(`-- Slow: scans millions of rows, then sorts
SELECT id, total FROM orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 20;

-- A composite index that serves both the filter and the ordering
CREATE INDEX CONCURRENTLY idx_orders_customer_created
  ON orders (customer_id, created_at DESC);

EXPLAIN (ANALYZE, BUFFERS)
SELECT id, total FROM orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 20;
-- Expect: Index Scan using idx_orders_customer_created ... rows=20, no Sort node

-- Covering index: includes the selected column so the table is not touched
CREATE INDEX CONCURRENTLY idx_orders_customer_covering
  ON orders (customer_id, created_at DESC) INCLUDE (total);`),
      ul(
        ["Indexe colunas de **filtro, junção e ordenação**, na ordem certa (igualdade primeiro, depois intervalos). Um índice composto `(a, b)` serve consultas por `a` e por `a, b`, mas não só por `b`.", "Index **filter, join and sort** columns, in the right order (equality first, then ranges). A composite index `(a, b)` serves queries on `a` and on `a, b`, but not on `b` alone."],
        ["Índices custam: ocupam espaço e **tornam cada escrita mais lenta**. Remova os que não são usados (`pg_stat_user_indexes`).", "Indexes cost: they take space and **slow down every write**. Remove unused ones (`pg_stat_user_indexes`)."],
        ["Evite funções sobre a coluna indexada no filtro (`WHERE lower(email) = ...` não usa o índice em `email`; crie um índice de expressão), `LIKE '%texto'` com curinga no início e conversões implícitas de tipo.", "Avoid functions over the indexed column in the filter (`WHERE lower(email) = ...` does not use the index on `email`; create an expression index), `LIKE '%text'` with a leading wildcard and implicit type conversions."],
        ["Selecione só as colunas necessárias (evite `SELECT *`) e desnormalize ou use visões materializadas para agregações pesadas e frequentes.", "Select only needed columns (avoid `SELECT *`) and denormalize or use materialized views for heavy, frequent aggregations."],
      ),

      h(["Pools de conexão e concorrência", "Connection pools and concurrency"]),
      p(["Abrir uma conexão com o banco custa um handshake TCP, a negociação TLS, a autenticação e um processo ou thread no servidor (no PostgreSQL, cada conexão é um processo com vários megabytes de memória). Reaproveite conexões com um **pool** (HikariCP na JVM, `pg-pool` no Node, SQLAlchemy em Python, ou o **PgBouncer** como proxy externo). O erro clássico é dimensionar o pool pelo que a aplicação *poderia* usar: com 50 instâncias de 20 conexões, o banco recebe 1.000 conexões e entra em contenção. Dimensione pelo que o **banco** suporta: um ponto de partida para o total é algo próximo de `núcleos × 2 + discos` conexões ativas, que a lei de Little ajuda a refinar. Mais conexões que isso raramente aumentam a vazão; apenas formam fila dentro do banco.", "Opening a database connection costs a TCP handshake, TLS negotiation, authentication and a process or thread on the server (in PostgreSQL each connection is a process with several megabytes of memory). Reuse connections with a **pool** (HikariCP on the JVM, `pg-pool` on Node, SQLAlchemy in Python, or **PgBouncer** as an external proxy). The classic mistake is sizing the pool by what the application *could* use: with 50 instances of 20 connections, the database receives 1,000 connections and enters contention. Size by what the **database** supports: a starting point for the total is something near `cores × 2 + disks` active connections, which Little's law helps refine. More connections than that rarely raise throughput; they only form a queue inside the database."]),
      code(`import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  max: 10,                       // per instance: (DB budget) / (number of instances)
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000, // fail fast instead of queueing forever
  statement_timeout: 5_000,       // a runaway query cannot hold a connection
});

// Independent I/O in parallel, not in sequence
const [user, orders, prefs] = await Promise.all([
  users.byId(id), orders.recentFor(id), prefs.for(id),
]);`),
      p(["Para I/O, prefira modelos que não bloqueiam uma thread por espera (assíncrono com `async/await`, corrotinas, threads virtuais) ou paralelize chamadas independentes, como no exemplo. Defina **timeouts** em toda chamada externa, e limite a concorrência com *bulkheads* para que uma dependência lenta não consuma todas as threads.", "For I/O, prefer models that do not block a thread per wait (asynchronous with `async/await`, coroutines, virtual threads) or parallelize independent calls, as in the example. Set **timeouts** on every external call, and limit concurrency with *bulkheads* so a slow dependency does not consume all threads."]),

      h(["Paginação: nunca devolva listas ilimitadas", "Pagination: never return unbounded lists"]),
      p(["Uma listagem sem limite cresce junto com os dados e acaba derrubando o servidor, a rede ou o navegador. Pagine sempre. A paginação por **OFFSET** é simples, mas, a cada página, o banco precisa percorrer e descartar todas as linhas anteriores: a página 10.000 é muito mais lenta que a primeira, e, se há inserções durante a navegação, itens aparecem repetidos ou somem. A paginação por **cursor** (*keyset*) usa a chave do último item visto e aproveita o índice, com custo constante por página.", "A list with no limit grows with the data and ends up taking down the server, network or browser. Always paginate. **OFFSET** pagination is simple, but on each page the database must walk and discard all previous rows: page 10,000 is much slower than the first, and if there are inserts during navigation, items appear twice or vanish. **Cursor** (*keyset*) pagination uses the key of the last item seen and exploits the index, at constant cost per page."]),
      code(`-- OFFSET: reads and throws away 100,000 rows to return 50
SELECT id, title FROM posts ORDER BY id DESC LIMIT 50 OFFSET 100000;

-- Keyset: jumps straight to the position through the index
SELECT id, title FROM posts WHERE id < $1   -- $1 = last id of the previous page
ORDER BY id DESC LIMIT 50;

-- With a non-unique sort key, include a tiebreaker
SELECT id, created_at FROM posts
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC LIMIT 50;`),

      h(["Cache, compressão e transporte", "Caching, compression and transport"]),
      p(["O **cache** troca espaço e frescor por velocidade: guarda o resultado de algo caro para reutilizá-lo. Pode existir em várias camadas, do mais próximo do usuário ao mais distante: cache do **navegador** (cabeçalhos `Cache-Control`, `ETag`), **CDN**, cache de **aplicação** (Redis, Memcached), cache **local em memória** do processo e o cache do **próprio banco**. Cada camada economiza o trabalho de todas as seguintes. O cuidado está na **invalidação** (quando o dado muda), no risco de *cache stampede* (muitas requisições recalculando o mesmo item expirado ao mesmo tempo) e na **consistência**; o artigo de cache do ArchLab aprofunda esses pontos.", "**Caching** trades space and freshness for speed: it stores the result of something expensive to reuse it. It can exist at several layers, from closest to the user to farthest: **browser** cache (`Cache-Control`, `ETag` headers), **CDN**, **application** cache (Redis, Memcached), process **in-memory local** cache and the **database's own** cache. Each layer saves the work of all that follow. The care lies in **invalidation** (when data changes), in the risk of *cache stampede* (many requests recomputing the same expired item at once) and in **consistency**; the ArchLab cache article goes deeper on these points."]),
      p(["A **compressão** (gzip, ou brotli, que comprime melhor, e zstd) reduz respostas de texto (HTML, JSON, JavaScript, CSS) em 70% ou mais, economizando banda e tempo de transferência, principalmente em redes móveis. Custa CPU, então comprima o que é compressível (não imagens JPEG nem vídeos, já comprimidos) e use níveis moderados para respostas dinâmicas e níveis altos para ativos estáticos pré-comprimidos. Reduza também o *quê* se envia: campos desnecessários, imagens em formatos modernos (WebP, AVIF) e tamanhos adequados à tela.", "**Compression** (gzip, or brotli, which compresses better, and zstd) shrinks text responses (HTML, JSON, JavaScript, CSS) by 70% or more, saving bandwidth and transfer time, especially on mobile networks. It costs CPU, so compress what is compressible (not JPEG images or video, already compressed) and use moderate levels for dynamic responses and high levels for pre-compressed static assets. Also reduce *what* you send: unnecessary fields, modern image formats (WebP, AVIF) and sizes appropriate to the screen."]),
      code(`# nginx: compression and cache headers for static assets
gzip on;
gzip_comp_level 5;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript image/svg+xml;

location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";   # fingerprinted file names
}

# Keep connections alive and speak HTTP/2 or HTTP/3 to cut handshakes
keepalive_timeout 65;`),
      ul(
        ["Prefira **HTTP/2 ou HTTP/3** (multiplexação, cabeçalhos comprimidos), **keep-alive** e **conexões persistentes** a handshakes repetidos.", "Prefer **HTTP/2 or HTTP/3** (multiplexing, compressed headers), **keep-alive** and **persistent connections** to repeated handshakes."],
        ["Aproxime o conteúdo do usuário com uma **CDN**, que reduz a latência de rede (a velocidade da luz impõe cerca de 70 ms de ida e volta entre Brasil e Europa, sem otimização possível).", "Bring content closer to the user with a **CDN**, which cuts network latency (the speed of light imposes about 70 ms round trip between Brazil and Europe, with no optimization possible)."],
      ),

      h(["Serialização, lazy loading e trabalho assíncrono", "Serialization, lazy loading and asynchronous work"]),
      ul(
        ["**Serialização**: em serviços de alto volume, converter objetos para JSON e de volta pode dominar a CPU. Formatos binários com esquema (Protocol Buffers, Avro, MessagePack) são menores e mais rápidos; gRPC os usa sobre HTTP/2. Meça antes: para APIs públicas e volume moderado, JSON bem projetado costuma bastar, e a clareza vale mais. Evite serializar campos que o cliente não usa.", "**Serialization**: in high-volume services, converting objects to JSON and back can dominate CPU. Binary schema-based formats (Protocol Buffers, Avro, MessagePack) are smaller and faster; gRPC uses them over HTTP/2. Measure first: for public APIs and moderate volume, well-designed JSON is usually enough, and clarity is worth more. Avoid serializing fields the client does not use."],
        ["**Lazy loading**: carregue sob demanda o que o usuário não vê de imediato (imagens abaixo da dobra, módulos de JavaScript de rotas pouco visitadas, relacionamentos de um objeto). No front-end, *code splitting* reduz o carregamento inicial. No back-end, tenha cuidado: o carregamento preguiçoso do ORM é a origem do N+1.", "**Lazy loading**: load on demand what the user does not see immediately (below-the-fold images, JavaScript modules of rarely visited routes, an object's relationships). On the front-end, *code splitting* reduces initial load. On the back-end, be careful: the ORM's lazy loading is the source of N+1."],
        ["**Trabalho assíncrono**: tire do caminho da requisição o que pode esperar (e-mails, relatórios, miniaturas, sincronização com sistemas externos) e responda logo, enviando o trabalho a uma **fila** processada por workers. O usuário percebe um sistema mais rápido, e as quedas de dependências lentas não afetam a resposta. Exige idempotência e tratamento de falhas.", "**Asynchronous work**: take what can wait off the request path (emails, reports, thumbnails, syncing with external systems) and respond right away, sending the work to a **queue** processed by workers. The user perceives a faster system, and slow dependency outages do not affect the response. It requires idempotency and failure handling."],
        ["**Pré-computação**: cálculos pesados e previsíveis (rankings, agregações, recomendações) podem ser feitos antes, em lote, e servidos prontos.", "**Precomputation**: heavy, predictable calculations (rankings, aggregations, recommendations) can be done ahead, in batch, and served ready-made."],
      ),
      fig(["Onde cada técnica age no caminho de uma requisição", "Where each technique acts on a request's path"],
        [[node("cl", ["Cliente: lazy loading, cache do navegador", "Client: lazy loading, browser cache"], "client")], [node("cdn", ["CDN: cache e compressão", "CDN: cache and compression"], "edge")], [node("api", ["API: batching, pool, timeouts, async", "API: batching, pool, timeouts, async"], "service")], [node("ca", ["Cache Redis: evita o banco", "Redis cache: avoids the database"], "cache"), node("q", ["Fila: trabalho adiado", "Queue: deferred work"], "queue")], [node("db", ["Banco: índices, paginação", "Database: indexes, pagination"], "data")]],
        [edge("cl", "cdn"), edge("cdn", "api"), edge("api", "ca", ["1º", "1st"]), edge("api", "q", ["adia", "defers"], { dashed: true }), edge("ca", "db", ["se errar", "on miss"], { dashed: true })]),

      h(["Tabela de técnicas e ganhos típicos", "Table of techniques and typical gains"]),
      p(["Os ganhos abaixo são **ordens de grandeza típicas** que variam muito com o caso; servem para priorizar, nunca como promessa. Meça no seu sistema.", "The gains below are **typical orders of magnitude** that vary widely by case; they serve to prioritize, never as a promise. Measure on your system."]),
      table([["Técnica", "Technique"], ["Atua sobre", "Acts on"], ["Ganho típico", "Typical gain"], ["Custo e riscos", "Cost and risks"]],
        [["Índice adequado", "Right index"], ["Consultas sem índice", "Unindexed queries"], ["10x a 1000x na consulta", "10x to 1000x on the query"], ["Escritas mais lentas, espaço", "Slower writes, space"]],
        [["Eliminar N+1 (JOIN ou lote)", "Remove N+1 (JOIN or batch)"], ["Idas e voltas ao banco", "Database round trips"], ["10x a 100x na operação", "10x to 100x on the operation"], ["Consultas maiores, memória", "Bigger queries, memory"]],
        [["Cache de leitura", "Read cache"], ["Leituras repetidas e caras", "Repeated, costly reads"], ["5x a 100x nas leituras com acerto", "5x to 100x on hits"], ["Invalidação, consistência, memória", "Invalidation, consistency, memory"]],
        [["CDN para estáticos", "CDN for static assets"], ["Latência de rede e carga na origem", "Network latency and origin load"], ["Latência de 100-300 ms para 10-30 ms", "Latency from 100-300 ms to 10-30 ms"], ["Custo, purga de cache", "Cost, cache purging"]],
        [["Compressão gzip/brotli", "gzip/brotli compression"], ["Tamanho de texto", "Text size"], ["60% a 90% menos bytes", "60% to 90% fewer bytes"], ["CPU, nada para dados já comprimidos", "CPU, nothing for already compressed data"]],
        [["Pool de conexões", "Connection pool"], ["Custo de abrir conexões", "Cost of opening connections"], ["Alguns a dezenas de ms por requisição", "A few to tens of ms per request"], ["Dimensionamento errado causa filas", "Wrong sizing causes queues"]],
        [["Paginação por cursor", "Cursor pagination"], ["Listas grandes", "Large lists"], ["De segundos para ms nas páginas profundas", "From seconds to ms on deep pages"], ["Sem salto direto para a página N", "No direct jump to page N"]],
        [["Trabalho assíncrono com fila", "Async work with a queue"], ["Latência percebida", "Perceived latency"], ["Resposta em ms em vez de segundos", "Response in ms instead of seconds"], ["Complexidade, consistência eventual", "Complexity, eventual consistency"]],
        [["Paralelizar chamadas independentes", "Parallelize independent calls"], ["Soma sequencial de esperas", "Sequential sum of waits"], ["Latência cai para a maior chamada", "Latency drops to the slowest call"], ["Mais carga simultânea nas dependências", "More simultaneous load on dependencies"]],
        [["Serialização binária (protobuf)", "Binary serialization (protobuf)"], ["CPU e bytes de serialização", "Serialization CPU and bytes"], ["2x a 10x menor e mais rápido", "2x to 10x smaller and faster"], ["Menos legível, evolução de esquema", "Less readable, schema evolution"]],
        [["Escalar horizontalmente", "Scale out"], ["Limite de capacidade (CPU)", "Capacity limit (CPU)"], ["Quase linear até o próximo gargalo", "Near-linear until the next bottleneck"], ["Custo; o banco costuma ser o limite", "Cost; the database is usually the limit"]],
      ),

      h(["Vantagens, desvantagens e quando evitar", "Benefits, drawbacks and when to avoid"]),
      p(["Performance é uma característica de produto: estudos de grandes empresas (Amazon, Google) mostram que centenas de milissegundos a mais reduzem conversão e engajamento, e latência menor também significa menos servidores para a mesma carga, ou seja, menos custo. Mas toda otimização tem preço em complexidade: cache traz invalidação, assincronismo traz consistência eventual, desnormalização traz dados duplicados, e código otimizado à mão é mais difícil de manter. **Evite otimizar** o que não está no caminho crítico, o que não tem medição e o que está abaixo da meta. Prefira primeiro as soluções simples e de maior retorno (índices, N+1, cache, paginação), antes de reescritas de linguagem ou de arquiteturas inteiras.", "Performance is a product feature: studies from large companies (Amazon, Google) show hundreds of extra milliseconds reduce conversion and engagement, and lower latency also means fewer servers for the same load, that is, lower cost. But every optimization has a price in complexity: caching brings invalidation, asynchrony brings eventual consistency, denormalization brings duplicated data, and hand-optimized code is harder to maintain. **Avoid optimizing** what is not on the critical path, what has no measurement and what is already under the goal. Prefer the simple, high-return solutions first (indexes, N+1, caching, pagination) before language rewrites or entire architectures."]),

      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Otimizar sem medir, ou medir só a média e ignorar o p99.", "Optimizing without measuring, or measuring only the average and ignoring p99."],
        ["Testar com poucos dados e sem concorrência: o problema só aparece em produção.", "Testing with little data and no concurrency: the problem appears only in production."],
        ["Adicionar cache antes de entender por que a consulta é lenta (um índice resolveria).", "Adding a cache before understanding why the query is slow (an index would fix it)."],
        ["Aumentar o pool de conexões ou as threads para 'resolver' a lentidão, piorando a contenção no banco.", "Raising the connection pool or threads to 'solve' slowness, worsening contention on the database."],
        ["Micro-otimizações de código enquanto a requisição espera 400 ms por um serviço remoto.", "Code micro-optimizations while the request waits 400 ms on a remote service."],
        ["Não proteger o ganho com um teste de regressão: a lentidão volta em silêncio.", "Not protecting the gain with a regression test: slowness returns silently."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Meça primeiro: meta em percentis, linha de base, profiling e traces; mude uma coisa por vez.", "Measure first: goal in percentiles, baseline, profiling and traces; change one thing at a time."],
        ["Descubra se o trabalho é CPU-bound ou I/O-bound; a maior parte dos sistemas web é I/O-bound.", "Find out whether the work is CPU-bound or I/O-bound; most web systems are I/O-bound."],
        ["Amdahl: ataque o que domina o tempo; Little: evite operar perto da saturação.", "Amdahl: attack what dominates time; Little: avoid operating near saturation."],
        ["Índices, fim do N+1, batching, paginação por cursor e pools bem dimensionados dão os maiores retornos.", "Indexes, ending N+1, batching, cursor pagination and well-sized pools give the biggest returns."],
        ["Cache, CDN, compressão e trabalho assíncrono economizam trabalho, ao custo de invalidação e consistência.", "Caching, CDN, compression and asynchronous work save effort, at the cost of invalidation and consistency."],
      ),

      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Por onde começar a otimizar?** Pelas consultas mais lentas e mais frequentes do banco e pelo trace de uma requisição lenta: costumam revelar o N+1 ou o índice que falta.", "**Where to start optimizing?** With the slowest and most frequent database queries and the trace of a slow request: they usually reveal the N+1 or the missing index."],
        ["**Cache resolve tudo?** Não. Ele mascara uma consulta lenta, não a conserta, e traz invalidação e consistência. Corrija a causa e use cache para o que continua caro.", "**Does caching solve everything?** No. It masks a slow query rather than fixing it, and brings invalidation and consistency. Fix the cause and use cache for what remains costly."],
        ["**Vale reescrever em outra linguagem?** Quase nunca é o primeiro passo. Em sistemas I/O-bound, a linguagem raramente é o gargalo; meça antes.", "**Is rewriting in another language worth it?** Almost never the first step. In I/O-bound systems, the language is rarely the bottleneck; measure first."],
        ["**Como evitar regressões?** Testes de carga com limites na pipeline, painéis de latência por versão e orçamentos de performance (por exemplo, tamanho máximo do bundle).", "**How to avoid regressions?** Load tests with thresholds in the pipeline, latency dashboards per version and performance budgets (for example, maximum bundle size)."],
      ),
      tip(["Guarde os números de antes e depois no pull request. Uma otimização sem medição é um palpite, e daqui a seis meses ninguém saberá se ainda vale a complexidade.", "Put the before and after numbers in the pull request. An optimization without measurement is a guess, and six months from now nobody will know whether it is still worth the complexity."]),
    ] },

  { id: "custo-vs-performance", section: "operacao", level: 2, icon: "savings", minutes: 14,
    title: ["Custo versus performance", "Cost vs performance"],
    summary: ["Modelo de cobrança da nuvem, on-demand, reservado e spot, custo por requisição, dimensionamento, egress, armazenamento em camadas, FinOps e uma estimativa mensal completa.", "Cloud billing model, on-demand, reserved and spot, cost per request, rightsizing, egress, tiered storage, FinOps and a complete monthly estimate."],
    body: [
      p(["Todo design de sistema é um compromisso entre três forças: **velocidade** (latência e vazão), **resiliência** (disponibilidade e durabilidade) e **dinheiro**. Reduzir a latência pela metade, dobrar a disponibilidade de 99,9% para 99,99% ou ter uma segunda região ativa raramente custa o dobro: costuma custar muito mais, porque cada ganho adicional exige redundância adicional. Um engenheiro experiente não pergunta apenas *como deixar mais rápido ou mais confiável*, e sim **quanto vale esse ganho para o negócio** antes de comprá-lo. Cinco milissegundos a menos num endpoint que ninguém percebe não justificam uma conta maior; um minuto a menos de indisponibilidade num sistema de pagamentos talvez justifique.", "Every system design is a compromise between three forces: **speed** (latency and throughput), **resilience** (availability and durability) and **money**. Halving latency, raising availability from 99.9% to 99.99% or having a second active region seldom costs double: it usually costs much more, because each extra gain demands extra redundancy. An experienced engineer does not just ask *how to make it faster or more reliable* but **what that gain is worth to the business** before buying it. Five milliseconds less on an endpoint nobody notices do not justify a bigger bill; one minute less downtime in a payment system perhaps does."]),
      p(["Na nuvem, o custo deixou de ser uma decisão de compra feita uma vez e virou uma **decisão de engenharia tomada continuamente**: cada recurso provisionado, cada gigabyte que sai pela rede e cada consulta ineficiente aparece na fatura do mês. Este artigo explica como a nuvem cobra, quais alavancas reduzem a conta sem prejudicar o usuário, como medir o custo por unidade de negócio e, ao final, faz uma estimativa completa de um sistema real, com números.", "In the cloud, cost stopped being a purchase decision made once and became an **engineering decision taken continuously**: every provisioned resource, every gigabyte leaving the network and every inefficient query shows up on the month's bill. This article explains how the cloud charges, which levers cut the bill without hurting users, how to measure cost per business unit and, at the end, makes a complete estimate of a real system, with numbers."]),

      h(["Como a nuvem cobra: os componentes da fatura", "How the cloud bills: the components of the bill"]),
      p(["Quase toda fatura se divide em cinco grandes grupos. Entender cada um evita surpresas, porque os preços unitários parecem pequenos e o volume os multiplica.", "Nearly every bill splits into five large groups. Understanding each avoids surprises, because unit prices look small and volume multiplies them."]),
      ul(
        ["**Computação**: máquinas virtuais, contêineres e funções, cobradas por hora ou por segundo de uso (ou por requisição e tempo de execução, em *serverless*). Costuma ser a maior linha de sistemas de aplicação.", "**Compute**: virtual machines, containers and functions, billed per hour or second of use (or per request and execution time, in *serverless*). Usually the biggest line in application systems."],
        ["**Bancos de dados gerenciados**: cobrados pela instância (tamanho, Multi-AZ, réplicas), pelo armazenamento e pelas operações de I/O provisionadas. Em muitos sistemas é o item mais caro, e dimensioná-lo mal é o erro mais custoso.", "**Managed databases**: billed per instance (size, Multi-AZ, replicas), storage and provisioned I/O operations. In many systems it is the priciest item, and sizing it badly is the costliest mistake."],
        ["**Armazenamento**: preço por GB-mês, mais as requisições e, dependendo da classe, taxas de recuperação. Existem camadas de armazenamento de preços muito diferentes, tratadas adiante.", "**Storage**: price per GB-month, plus requests and, depending on the class, retrieval fees. There are storage tiers with very different prices, covered below."],
        ["**Transferência de dados (egress)**: a entrada de dados costuma ser gratuita, mas a **saída para a internet** e o tráfego **entre regiões ou zonas de disponibilidade** são cobrados por GB. É a linha que mais surpreende.", "**Data transfer (egress)**: inbound data is usually free, but **outbound to the internet** and traffic **between regions or availability zones** are billed per GB. This is the line that surprises most."],
        ["**Serviços auxiliares**: balanceadores, NAT gateways (cobram por hora *e* por GB processado), observabilidade (logs e métricas por GB ingerido), filas, DNS, WAF, chaves e segredos.", "**Supporting services**: load balancers, NAT gateways (billed per hour *and* per GB processed), observability (logs and metrics per GB ingested), queues, DNS, WAF, keys and secrets."],
      ),

      h(["Modelos de compra: on-demand, reservado e spot", "Purchase models: on-demand, reserved and spot"]),
      p(["O mesmo hardware pode custar valores muito diferentes dependendo do **compromisso** que você assume. O preço é uma troca entre flexibilidade e desconto.", "The same hardware can cost very different amounts depending on the **commitment** you make. Price is a trade between flexibility and discount."]),
      table([["Modelo", "Model"], ["Como funciona", "How it works"], ["Desconto típico", "Typical discount"], ["Melhor para", "Best for"], ["Risco", "Risk"]],
        [["On-demand", "On-demand"], ["Paga por hora ou segundo, sem compromisso", "Pay per hour or second, no commitment"], ["Nenhum (preço cheio)", "None (full price)"], ["Cargas novas, imprevisíveis, picos", "New, unpredictable loads, peaks"], ["O mais caro se fica ligado o mês todo", "The priciest if left on all month"]],
        [["Reservado / Savings Plans / CUD", "Reserved / Savings Plans / CUD"], ["Compromisso de 1 ou 3 anos de uso ou de gasto por hora", "1 or 3 year commitment on usage or hourly spend"], ["Em geral de 30% a 70%", "Typically 30% to 70%"], ["Carga de base estável e previsível, bancos", "Stable, predictable baseline, databases"], ["Pagar por capacidade que deixou de usar", "Paying for capacity you stopped using"]],
        [["Spot / preemptível", "Spot / preemptible"], ["Capacidade ociosa que a nuvem pode retomar com aviso curto", "Spare capacity the cloud can reclaim with short notice"], ["Até cerca de 90%", "Up to about 90%"], ["Lotes, workers, CI, processamento de dados tolerantes a interrupção", "Batch, workers, CI, interruption-tolerant data processing"], ["Interrupção a qualquer momento; não serve ao banco principal", "Interruption at any time; unfit for the primary database"]],
        [["Serverless (por uso)", "Serverless (pay per use)"], ["Paga por requisição e tempo de execução; escala a zero", "Pay per request and execution time; scales to zero"], ["Varia: ótimo em carga baixa ou irregular", "Varies: great at low or irregular load"], ["Tráfego esparso, eventos, protótipos", "Sparse traffic, events, prototypes"], ["Mais caro que máquinas em carga alta e constante", "Pricier than machines at high, steady load"]],
      ),
      p(["A estratégia mais comum é **em camadas**: reserve (ou use *savings plans*) para a **carga de base**, o mínimo que roda 24 horas por dia, cubra os picos com *on-demand* e rode tudo que tolera interrupção em *spot*. Cobrir 100% da base com reservas é perigoso: se a arquitetura mudar, você paga por capacidade ociosa; um bom ponto de partida é reservar por volta de 60% a 70% da base mínima observada.", "The most common strategy is **layered**: reserve (or use *savings plans*) for the **baseline**, the minimum that runs 24 hours a day, cover peaks with *on-demand* and run everything that tolerates interruption on *spot*. Covering 100% of the baseline with reservations is risky: if the architecture changes, you pay for idle capacity; a good starting point is to reserve around 60% to 70% of the observed minimum baseline."]),
      fig(["Estratégia em camadas para a carga ao longo do dia", "Layered strategy for load across the day"],
        [[node("base", ["Carga de base: reservada (24x7)", "Baseline: reserved (24x7)"], "data")], [node("peak", ["Picos: on-demand com autoscaling", "Peaks: on-demand with autoscaling"], "service")], [node("batch", ["Lotes e workers: spot", "Batch and workers: spot"], "queue")], [node("lb", ["Balanceador e fila de trabalho", "Load balancer and work queue"], "edge")]],
        [edge("lb", "base", ["sempre", "always"]), edge("lb", "peak", ["sob demanda", "on demand"], { dashed: true }), edge("lb", "batch", ["assíncrono", "async"], { dashed: true })]),

      h(["Dimensionamento (rightsizing) e elasticidade", "Rightsizing and elasticity"]),
      p(["O desperdício mais comum na nuvem é o **superdimensionamento**: instâncias com 10% de CPU média porque alguém escolheu um tamanho grande 'por segurança' e nunca revisou. O *rightsizing* ajusta o tamanho ao uso real, olhando as métricas de CPU, memória e rede ao longo de semanas (incluindo o pico), e escolhe a família certa de instância: otimizada para memória para bancos e caches, para CPU em cálculo intenso, de uso geral no resto. Arquiteturas ARM (Graviton na AWS, Axion no Google Cloud, Cobalt na Azure) costumam entregar melhor relação preço-desempenho para cargas compatíveis, com economia que pode chegar a cerca de 20%.", "The most common cloud waste is **oversizing**: instances at 10% average CPU because someone chose a big size 'for safety' and never reviewed it. *Rightsizing* fits size to real use, looking at CPU, memory and network metrics over weeks (including the peak), and picks the right instance family: memory-optimized for databases and caches, CPU-optimized for heavy computation, general purpose for the rest. ARM architectures (Graviton on AWS, Axion on Google Cloud, Cobalt on Azure) often deliver better price-performance for compatible workloads, with savings that can reach about 20%."]),
      p(["A **elasticidade** completa o quadro: em vez de pagar o pico 24 horas por dia, o *autoscaling* acompanha a curva de demanda, ligando instâncias quando a carga sobe e desligando quando cai. Em um sistema cujo pico dura 3 horas por dia e é 4 vezes a média, provisionar estaticamente para o pico custa cerca de 2,5 vezes mais que seguir a demanda. Mas elasticidade não é gratuita: a escala leva minutos, então o gatilho deve ser conservador (por exemplo, 60% de CPU), há um custo de arrancada (cache frio, JIT) e um teto de instâncias precisa existir para que um ataque ou um bug não gere uma fatura gigante. Dimensione sempre com folga para falhas (N+1) e picos, porque economizar demais custa caro em incidentes.", "**Elasticity** completes the picture: instead of paying for the peak 24 hours a day, *autoscaling* follows the demand curve, starting instances when load rises and stopping them when it falls. In a system whose peak lasts 3 hours a day at 4 times the average, statically provisioning for the peak costs about 2.5 times more than following demand. But elasticity is not free: scaling takes minutes, so the trigger must be conservative (say, 60% CPU), there is a startup cost (cold cache, JIT) and an instance ceiling must exist so an attack or a bug does not generate a giant bill. Always size with headroom for failures (N+1) and spikes, because saving too much is costly in incidents."]),

      h(["Custo por requisição e métricas de unidade", "Cost per request and unit metrics"]),
      p(["O valor absoluto da fatura diz pouco: gastar mais pode ser ótimo se o negócio cresceu mais. A métrica útil é o **custo por unidade de valor**: por requisição, por usuário ativo mensal, por pedido, por GB processado, por transação. Ela permite comparar versões do sistema e detectar regressões: se o custo por pedido sobe sem que o negócio mude, algo piorou. O cálculo é simples:", "The absolute bill value says little: spending more can be great if the business grew more. The useful metric is **cost per unit of value**: per request, per monthly active user, per order, per GB processed, per transaction. It lets you compare system versions and detect regressions: if cost per order rises while the business has not changed, something got worse. The calculation is simple:"]),
      code(`cost per request = monthly cost / monthly requests

Example: US$ 3,000 per month serving 100 million requests
  3,000 / 100,000,000 = US$ 0.00003 per request = US$ 0.03 per 1,000 requests

Break-even between an always-on instance and serverless (illustrative prices):
  instance:   US$ 124 / month  (4 vCPU, 16 GB)
  function:   about US$ 1.9 per million requests (200 ms at 512 MB)
  break-even: 124 / 1.9 = ~65 million requests/month = ~25 req/s on average
  below that, serverless tends to win; above it, the instance wins.`),
      p(["Como o preço da nuvem muda, trate os números acima como ordem de grandeza: o que importa é o método. Faça o mesmo cálculo para o seu caso com os preços atuais do provedor, incluindo os custos escondidos (egress, observabilidade, NAT) e o custo de operar a solução (tempo de engenharia também é dinheiro).", "Since cloud prices change, treat the numbers above as order of magnitude: what matters is the method. Do the same calculation for your case with the provider's current prices, including hidden costs (egress, observability, NAT) and the cost of operating the solution (engineering time is money too)."]),

      h(["Transferência de dados: a conta que surpreende", "Data transfer: the bill that surprises"]),
      p(["O *egress* costuma ser a linha mais subestimada. Um serviço que devolve 20 KB por requisição a 500 requisições por segundo envia cerca de 10 MB/s, ou aproximadamente 860 GB por dia, perto de 26 TB por mês: a um preço ilustrativo de US$ 0,09 por GB, isso é mais de US$ 2.300 só de saída para a internet. Os caminhos de custo mais comuns:", "*Egress* is usually the most underestimated line. A service returning 20 KB per request at 500 requests per second sends about 10 MB/s, or roughly 860 GB a day, near 26 TB a month: at an illustrative US$ 0.09 per GB, that is over US$ 2,300 for outbound internet alone. The most common cost paths:"]),
      ul(
        ["**Saída para a internet**: reduza servindo estáticos e respostas cacheáveis por **CDN**, cuja tarifa por GB é menor, e comprimindo as respostas (gzip, brotli). Menos bytes custam menos *e* chegam mais rápido: aqui custo e performance andam juntos.", "**Outbound to the internet**: reduce by serving static and cacheable responses through a **CDN**, whose per-GB rate is lower, and by compressing responses (gzip, brotli). Fewer bytes cost less *and* arrive faster: here cost and performance move together."],
        ["**Tráfego entre zonas de disponibilidade**: tipicamente cobrado nos dois sentidos (da ordem de US$ 0,01 por GB em cada direção). Arquiteturas Multi-AZ com muita conversa entre serviços, ou um balanceador que distribui entre zonas, geram custo contínuo. Mantenha serviços muito conversadores na mesma zona quando a disponibilidade permitir.", "**Traffic between availability zones**: typically billed in both directions (on the order of US$ 0.01 per GB each way). Multi-AZ architectures with chatty services, or a load balancer spreading across zones, generate continuous cost. Keep very chatty services in the same zone when availability allows."],
        ["**Tráfego entre regiões**: mais caro ainda; replicação multirregião e backups remotos exigem um orçamento próprio.", "**Traffic between regions**: pricier still; multi-region replication and remote backups need their own budget."],
        ["**NAT gateways**: cobram por GB processado; baixar imagens e pacotes ou acessar serviços da própria nuvem pela internet pode custar caro. Use *endpoints* privados (VPC endpoints) para os serviços de armazenamento e de filas.", "**NAT gateways**: bill per GB processed; downloading images and packages or reaching the cloud's own services over the internet can be costly. Use private endpoints (VPC endpoints) for storage and queue services."],
        ["**Pontos de saída de dados**: migrar para outro provedor também custa egress, o que é parte do risco de dependência de um fornecedor.", "**Data exit points**: migrating to another provider also costs egress, which is part of the risk of vendor lock-in."],
      ),

      h(["Armazenamento em camadas e ciclo de vida", "Tiered storage and lifecycle"]),
      p(["Nem todo dado merece o armazenamento mais caro. A maior parte dos dados é **quente** logo depois de criada e **esfria** com o tempo: logs de ontem são consultados, os de seis meses atrás quase nunca. As nuvens oferecem camadas de preços muito diferentes (ordem de grandeza, no armazenamento de objetos): a camada padrão custa por volta de US$ 0,023 por GB-mês; a de acesso infrequente, cerca da metade; as de arquivamento (Glacier, Archive), uma fração pequena, com recuperação de minutos a horas e taxa por leitura; e a mais fria, ainda menos. A troca é sempre **preço de armazenar** contra **preço e demora de recuperar**.", "Not all data deserves the priciest storage. Most data is **hot** right after creation and **cools** over time: yesterday's logs are queried, those from six months ago almost never. Clouds offer tiers with very different prices (order of magnitude, in object storage): the standard tier costs around US$ 0.023 per GB-month; infrequent access, about half; archive tiers (Glacier, Archive) a small fraction, with retrieval from minutes to hours and a per-read fee; and the coldest, even less. The trade is always **price to store** against **price and delay to retrieve**."]),
      code(`{
  "Rules": [
    {
      "ID": "logs-lifecycle",
      "Filter": { "Prefix": "logs/" },
      "Status": "Enabled",
      "Transitions": [
        { "Days": 30,  "StorageClass": "STANDARD_IA" },
        { "Days": 90,  "StorageClass": "GLACIER" }
      ],
      "Expiration": { "Days": 365 }
    }
  ]
}`),
      p(["Além das camadas, **apague** o que não precisa mais: volumes e *snapshots* órfãos, imagens antigas de contêiner, versões de objetos acumuladas, ambientes de teste esquecidos e bancos sem uso. Em bancos, o armazenamento em SSD é caro: arquive dados antigos em tabelas particionadas ou em armazenamento de objetos (formatos colunares como Parquet) e mantenha só a janela recente no banco transacional. A **política de retenção** (de logs, métricas, backups) é uma das alavancas de maior retorno, e decisões legais e de privacidade (LGPD) a limitam por cima e por baixo.", "Besides tiers, **delete** what is no longer needed: orphaned volumes and *snapshots*, old container images, accumulated object versions, forgotten test environments and unused databases. In databases, SSD storage is expensive: archive old data in partitioned tables or in object storage (columnar formats such as Parquet) and keep only the recent window in the transactional database. The **retention policy** (of logs, metrics, backups) is one of the highest-return levers, and legal and privacy decisions (LGPD) bound it from above and below."]),

      h(["Quando gastar mais vale a pena: custo x performance x resiliência", "When spending more is worth it: cost vs performance vs resilience"]),
      p(["Alguns gastos *reduzem* a conta e a latência ao mesmo tempo: **cache** (menos consultas ao banco, que é caro), **CDN** (menos tráfego de saída e menos latência), **índices** e correção de consultas ruins (menos CPU e menos réplicas), **compressão** e **trabalho assíncrono**. Esses são ganhos 'de graça' que devem ser feitos primeiro. Outros gastos **compram** confiabilidade ou velocidade a um preço real: réplicas de leitura, Multi-AZ, multirregião, instâncias maiores, IOPS provisionados, capacidade reservada de reserva (*headroom*). A decisão deve ligar o custo a um **objetivo de nível de serviço**: se o SLO de 99,9% é cumprido com Multi-AZ numa região, a segunda região ativa (que pode dobrar a conta) só se justifica se o custo de uma indisponibilidade regional superar esse gasto.", "Some spending *reduces* the bill and latency at once: **caching** (fewer queries to the expensive database), **CDN** (less outbound traffic and less latency), **indexes** and fixing bad queries (less CPU and fewer replicas), **compression** and **asynchronous work**. These are 'free' gains to do first. Other spending **buys** reliability or speed at a real price: read replicas, Multi-AZ, multi-region, bigger instances, provisioned IOPS, spare reserved capacity (*headroom*). The decision should tie cost to a **service level objective**: if the 99.9% SLO is met with Multi-AZ in one region, a second active region (which can double the bill) is justified only if the cost of a regional outage exceeds that spending."]),
      table([["Decisão", "Decision"], ["Efeito no custo", "Effect on cost"], ["Efeito em performance / confiabilidade", "Effect on performance / reliability"]],
        [["Adicionar cache Redis", "Add a Redis cache"], ["Custo pequeno do cache, economia no banco", "Small cache cost, savings on the database"], ["Latência cai; carga no banco cai", "Latency falls; database load falls"]],
        [["Usar CDN", "Use a CDN"], ["Reduz o egress da origem; paga a CDN", "Cuts origin egress; pay the CDN"], ["Latência menor, origem protegida", "Lower latency, origin protected"]],
        [["Réplicas de leitura", "Read replicas"], ["Soma o custo de cada instância", "Adds the cost of each instance"], ["Mais vazão de leitura; falha do primário continua exigindo failover", "More read throughput; primary failure still needs failover"]],
        [["Multi-AZ", "Multi-AZ"], ["Aproximadamente dobra a instância do banco", "Roughly doubles the database instance"], ["Alta disponibilidade dentro da região", "High availability within the region"]],
        [["Segunda região ativa", "Second active region"], ["Pode dobrar a conta inteira e adicionar tráfego entre regiões", "Can double the whole bill and add cross-region traffic"], ["Resiste à perda de uma região; operação mais complexa", "Survives losing a region; more complex operation"]],
        [["Subir para instância maior", "Move to a bigger instance"], ["Custo cresce quase linear", "Cost grows near-linearly"], ["Ganho só se o gargalo era aquele recurso (Amdahl)", "Gain only if that resource was the bottleneck (Amdahl)"]],
      ),

      h(["Estimando o custo de um design: exemplo completo", "Estimating the cost of a design: a full example"]),
      p(["Imagine uma API de pedidos com **500 req/s em média** e picos de **2.000 req/s**, respostas de 20 KB, banco PostgreSQL gerenciado e cache Redis. Os preços abaixo são **hipotéticos e arredondados**, escolhidos para ilustrar o método (consulte o calculador de preços do seu provedor para valores reais). O mês tem 730 horas e cerca de 2,59 milhões de segundos.", "Imagine an orders API with **500 req/s on average** and peaks of **2,000 req/s**, 20 KB responses, a managed PostgreSQL database and a Redis cache. The prices below are **hypothetical and rounded**, chosen to illustrate the method (use your provider's pricing calculator for real values). The month has 730 hours and about 2.59 million seconds."]),
      code(`Assumptions (illustrative prices)
- app instance 4 vCPU / 16 GB:  US$ 0.17 / h on-demand  -> 0.17 x 730 = US$ 124 / month
- reserved discount:            40%                     -> US$ 74 / month each
- database instance:            US$ 0.58 / h            -> US$ 423 / month each
- cache node:                   US$ 0.20 / h            -> US$ 146 / month each
- egress to internet: US$ 0.09/GB (origin), US$ 0.04/GB (CDN)
- log ingestion: US$ 0.50/GB;  object storage: US$ 0.023/GB-month

Volume
- requests/month: 500 req/s x 2,592,000 s = 1.296 billion
- egress: 500 x 20 KB = 10 MB/s -> ~864 GB/day -> ~25,900 GB/month`),
      table([["Linha", "Line"], ["Cálculo", "Calculation"], ["US$ / mês", "US$ / month"]],
        [["Computação, base reservada", "Compute, reserved baseline"], ["8 instâncias x US$ 74", "8 instances x US$ 74"], ["≈ 596", "≈ 596"]],
        [["Computação, picos em on-demand", "Compute, on-demand peaks"], ["3 instâncias em média x US$ 124", "3 instances on average x US$ 124"], ["≈ 372", "≈ 372"]],
        [["Banco: primário Multi-AZ", "Database: Multi-AZ primary"], ["2 x US$ 423", "2 x US$ 423"], ["≈ 847", "≈ 847"]],
        [["Banco: 2 réplicas de leitura", "Database: 2 read replicas"], ["2 x US$ 423", "2 x US$ 423"], ["≈ 847", "≈ 847"]],
        [["Banco: armazenamento", "Database: storage"], ["500 GB x US$ 0,115", "500 GB x US$ 0.115"], ["≈ 58", "≈ 58"]],
        [["Cache Redis", "Redis cache"], ["2 nós x US$ 146", "2 nodes x US$ 146"], ["≈ 292", "≈ 292"]],
        [["Saída de dados (70% via CDN)", "Egress (70% through CDN)"], ["18.100 GB x 0,04 + 7.800 GB x 0,09", "18,100 GB x 0.04 + 7,800 GB x 0.09"], ["≈ 1.426", "≈ 1,426"]],
        [["Balanceador", "Load balancer"], ["Taxa fixa + capacidade", "Fixed fee + capacity"], ["≈ 80", "≈ 80"]],
        [["Logs e observabilidade", "Logs and observability"], ["≈ 900 GB x US$ 0,50, com amostragem", "≈ 900 GB x US$ 0.50, with sampling"], ["≈ 450", "≈ 450"]],
        [["Armazenamento de objetos e backups", "Object storage and backups"], ["≈ 5 TB x US$ 0,023", "≈ 5 TB x US$ 0.023"], ["≈ 115", "≈ 115"]],
        [["Total aproximado", "Approximate total"], ["Soma das linhas", "Sum of lines"], ["≈ 5.100", "≈ 5,100"]],
      ),
      p(["O **custo por requisição** é US$ 5.100 ÷ 1,296 bilhão ≈ US$ 0,0000039, ou cerca de **US$ 3,9 por milhão de requisições**. Compare com a receita por requisição ou por usuário para saber se o modelo de negócio se sustenta. Agora as alavancas, em ordem de retorno: o banco e a saída de dados somam mais de 60% da conta, então é lá que o esforço rende. Aumentar a taxa de acerto da CDN de 70% para 85% reduz a saída em cerca de US$ 300 por mês; um cache melhor que elimine uma das réplicas de leitura poupa quase US$ 420; trocar instâncias de aplicação para ARM economiza algo como 20% da computação (cerca de US$ 190); e mover os workers de lote para *spot* (não incluídos aqui) corta até 70% a 90% deles. Em contrapartida, **dobrar** para uma segunda região ativa levaria a conta a algo próximo de US$ 9.000 a US$ 10.000: um acréscimo de cerca de US$ 4.500 a 5.000 por mês que só vale se o custo de uma queda regional superar isso.", "The **cost per request** is US$ 5,100 ÷ 1.296 billion ≈ US$ 0.0000039, or about **US$ 3.9 per million requests**. Compare with revenue per request or per user to know whether the business model holds. Now the levers, in order of return: the database and egress add up to over 60% of the bill, so that is where effort pays. Raising the CDN hit rate from 70% to 85% cuts egress by about US$ 300 a month; a better cache that eliminates one read replica saves nearly US$ 420; moving application instances to ARM saves something like 20% of compute (about US$ 190); and moving batch workers to *spot* (not included here) cuts up to 70% to 90% of them. In contrast, **doubling** to a second active region would take the bill to something near US$ 9,000 to US$ 10,000: an increase of about US$ 4,500 to 5,000 a month that is only worth it if the cost of a regional outage exceeds that."]),

      h(["FinOps: tratar custo como métrica de engenharia", "FinOps: treating cost as an engineering metric"]),
      p(["**FinOps** é a prática de levar responsabilidade financeira à engenharia, no ciclo contínuo de **informar** (visibilidade), **otimizar** e **operar**. A conta de uma nuvem sem dono é um problema coletivo: quando ninguém é responsável, ninguém economiza. Práticas que funcionam:", "**FinOps** is the practice of bringing financial accountability to engineering, in the continuous cycle of **inform** (visibility), **optimize** and **operate**. An ownerless cloud bill is a collective problem: when nobody is responsible, nobody saves. Practices that work:"]),
      ul(
        ["**Etiquetas (tags)** obrigatórias em todo recurso (time, produto, ambiente, dono), aplicadas por política, para alocar cada dólar a quem o gera. Sem tags, a conta é uma caixa-preta.", "**Mandatory tags** on every resource (team, product, environment, owner), enforced by policy, to allocate each dollar to whoever generates it. Without tags, the bill is a black box."],
        ["**Visibilidade**: painéis de custo por serviço e por unidade de negócio, ao lado das métricas técnicas, acessíveis aos times.", "**Visibility**: cost dashboards per service and per business unit, next to technical metrics, accessible to teams."],
        ["**Orçamentos e alertas** (AWS Budgets, alertas de anomalia de custo) para detectar o salto de uma conta antes do fechamento do mês, como um *loop* de retentativas que gera tráfego sem fim.", "**Budgets and alerts** (AWS Budgets, cost anomaly alerts) to detect a bill jump before month close, such as a retry *loop* generating endless traffic."],
        ["**Revisão periódica** (mensal) de recursos ociosos, de compromissos de reserva e de dimensionamento, com tarefas atribuídas.", "**Periodic review** (monthly) of idle resources, reservation commitments and sizing, with tasks assigned."],
        ["**Custo na revisão de design**: inclua uma estimativa de custo mensal em toda proposta de arquitetura, como no exemplo acima, e compare alternativas. Ferramentas como o Infracost mostram a estimativa de custo de uma mudança de Terraform direto no pull request.", "**Cost in design review**: include a monthly cost estimate in every architecture proposal, as in the example above, and compare alternatives. Tools such as Infracost show the cost estimate of a Terraform change right in the pull request."],
        ["**Ambientes efêmeros**: desligue ambientes de desenvolvimento e teste à noite e nos fins de semana, e crie ambientes de revisão por pull request que se destroem sozinhos.", "**Ephemeral environments**: shut down development and test environments at night and on weekends, and create per-pull-request review environments that destroy themselves."],
      ),

      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Otimizar custo cortando redundância sem olhar o SLO, e pagar a economia em incidentes.", "Optimizing cost by cutting redundancy without looking at the SLO, and paying the savings back in incidents."],
        ["Escolher o pico como tamanho fixo, em vez de usar elasticidade e carga de base reservada.", "Choosing the peak as the fixed size instead of using elasticity and a reserved baseline."],
        ["Esquecer o *egress*, o NAT e a observabilidade na estimativa, que podem ultrapassar a computação.", "Forgetting egress, NAT and observability in the estimate, which can exceed compute."],
        ["Reservar capacidade em excesso e depois migrar de arquitetura, pagando por máquinas paradas.", "Over-reserving capacity and then changing architecture, paying for idle machines."],
        ["Deixar logs em modo *debug* e sem retenção em produção.", "Leaving logs in *debug* mode with no retention in production."],
        ["Esquecer recursos órfãos: volumes, IPs elásticos, balanceadores e snapshots sem uso.", "Forgetting orphaned resources: volumes, elastic IPs, load balancers and unused snapshots."],
        ["Gastar semanas de engenharia para economizar poucos dólares: o custo de oportunidade também entra na conta.", "Spending weeks of engineering to save a few dollars: opportunity cost also counts."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Velocidade, resiliência e dinheiro competem; cada ganho extra costuma custar desproporcionalmente mais.", "Speed, resilience and money compete; each extra gain usually costs disproportionately more."],
        ["A fatura se divide em computação, banco, armazenamento, transferência de dados e serviços auxiliares; o egress é o que mais surpreende.", "The bill splits into compute, database, storage, data transfer and supporting services; egress surprises most."],
        ["Reserve a base, cubra picos com on-demand e rode o que tolera interrupção em spot.", "Reserve the baseline, cover peaks with on-demand and run what tolerates interruption on spot."],
        ["Dimensione ao uso real, use autoscaling com teto e meça o custo por requisição ou por pedido.", "Size to real use, use capped autoscaling and measure cost per request or per order."],
        ["Cache, CDN, índices e compressão reduzem custo e latência ao mesmo tempo.", "Caching, CDN, indexes and compression cut cost and latency at the same time."],
        ["Faça FinOps: tags, painéis, alertas, revisões e estimativa de custo em todo design.", "Do FinOps: tags, dashboards, alerts, reviews and a cost estimate in every design."],
      ),

      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Serverless é mais barato?** Em cargas baixas ou irregulares, muito; em carga alta e constante, costuma ser mais caro que máquinas ou contêineres bem utilizados. Calcule o ponto de equilíbrio.", "**Is serverless cheaper?** For low or irregular loads, much; for high, steady load it is usually pricier than well-utilized machines or containers. Calculate the break-even."],
        ["**Vale a pena reservar capacidade?** Para a carga de base estável, sim, e o desconto é grande; evite reservar o que pode mudar nos próximos 1 a 3 anos.", "**Is reserving capacity worth it?** For the stable baseline, yes, and the discount is large; avoid reserving what may change in the next 1 to 3 years."],
        ["**Como reduzir a conta sem piorar a experiência?** Comece pelo que melhora os dois: cache, CDN, índices, compressão, remoção de desperdício e rightsizing.", "**How to cut the bill without hurting the experience?** Start with what improves both: caching, CDN, indexes, compression, waste removal and rightsizing."],
        ["**Por que a conta de rede é tão alta?** Porque saída para a internet, tráfego entre zonas e regiões e NAT cobram por GB, e sistemas conversadores multiplicam o volume.", "**Why is the network bill so high?** Because outbound internet, cross-zone and cross-region traffic and NAT charge per GB, and chatty systems multiply the volume."],
      ),
      tip(["**FinOps** é tratar custo como métrica de engenharia: etiquete (tag) todo recurso por time e produto, mostre o gasto em painéis, defina alertas de orçamento e revise a conta todo mês. O que ninguém vê, ninguém economiza.", "**FinOps** treats cost as an engineering metric: tag every resource by team and product, show spend on dashboards, set budget alerts and review the bill every month. What nobody sees, nobody saves."]),
    ] },
];

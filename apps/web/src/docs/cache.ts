import { h, p, ul, tip, code, table, fig, node, edge, type DocArticle } from "./kit";

/** Seção "cache". */
export const ARTICLES: DocArticle[] = [
  { id: "cache", section: "cache", level: 1, icon: "bolt", minutes: 16,
    title: ["Cache: responder sem refazer o trabalho", "Caching: answering without redoing the work"],
    summary: ["Níveis de cache, estratégias de leitura e escrita, invalidação e os problemas clássicos (stampede, penetração, avalanche).", "Cache levels, read and write strategies, invalidation and the classic problems (stampede, penetration, avalanche)."],
    body: [
      p(["Todo sistema repete trabalho. A mesma página de produto é aberta mil vezes por minuto, o mesmo perfil é consultado a cada tela, a mesma consulta agregada é recalculada para cada visitante. Se cada repetição percorre o caminho completo (aplicação, rede, banco, disco), o sistema gasta recursos caros para chegar ao mesmo resultado. Um **cache** é uma memória intermediária, menor e mais rápida que a fonte original, que guarda o resultado de um trabalho já feito para que o próximo pedido idêntico seja atendido sem refazê-lo.", "Every system repeats work. The same product page is opened a thousand times a minute, the same profile is read on every screen, the same aggregate query is recomputed for each visitor. If every repetition walks the full path (application, network, database, disk), the system spends expensive resources to reach the same result. A **cache** is an intermediate memory, smaller and faster than the original source, that keeps the result of work already done so the next identical request is served without redoing it."]),
      p(["O ganho é duplo. Primeiro, **latência**: ler da memória local leva dezenas de nanossegundos a poucos microssegundos, um cache em rede como o Redis responde em geral em menos de 1 ms, enquanto uma consulta a um banco relacional costuma levar de 1 a 50 ms e uma chamada a outro serviço, mais ainda. Segundo, **capacidade**: cada acerto é uma consulta que o banco não precisou executar. Em sistemas com leitura muito maior que escrita, um cache com 95% de acertos reduz o tráfego do banco a 5% do original, o que equivale a multiplicar por vinte a capacidade de leitura sem comprar hardware.", "The gain is twofold. First, **latency**: reading from local memory takes tens of nanoseconds to a few microseconds, a networked cache such as Redis usually answers in under 1 ms, while a relational query typically takes 1 to 50 ms and a call to another service even more. Second, **capacity**: every hit is a query the database did not have to run. In read-heavy systems a cache with a 95% hit rate cuts database traffic to 5% of the original, which is like multiplying read capacity by twenty without buying hardware."]),
      h(["Conceitos-chave", "Key concepts"]),
      ul(
        ["**Acerto (hit)** e **falha (miss)**: o dado estava ou não no cache. A **taxa de acerto** (*hit ratio*) é acertos divididos por consultas totais e é a métrica central de qualquer cache.", "**Hit** and **miss**: the data was or was not in the cache. The **hit ratio** is hits divided by total lookups and is the central metric of any cache."],
        ["**Chave e valor**: o cache é, em essência, um mapa. A chave precisa identificar de forma única o resultado (por exemplo `user:42:profile:v3`) e o valor é o dado já pronto, geralmente serializado.", "**Key and value**: a cache is essentially a map. The key must uniquely identify the result (for example `user:42:profile:v3`) and the value is the ready-made data, usually serialized."],
        ["**Fonte da verdade (*source of truth*)**: o armazenamento durável e correto, normalmente o banco. O cache é sempre uma cópia, e cópias podem ficar velhas.", "**Source of truth**: the durable, correct store, usually the database. The cache is always a copy, and copies can go stale."],
        ["**TTL (*time to live*)**: tempo de vida de uma entrada. Passado esse prazo, ela é considerada expirada.", "**TTL (time to live)**: the lifetime of an entry. After that period it is considered expired."],
        ["**Remoção (*eviction*)**: o cache tem espaço finito; quando enche, uma política decide quem sai (veja o artigo sobre políticas de remoção).", "**Eviction**: a cache has finite space; when it fills up, a policy decides what leaves (see the article on eviction policies)."],
        ["**Localidade**: o cache funciona porque o acesso não é uniforme. Poucos itens recebem a maior parte dos pedidos (localidade de popularidade) e o que foi lido agora tende a ser lido de novo em breve (localidade temporal).", "**Locality**: caching works because access is not uniform. A few items receive most requests (popularity locality) and what was read now tends to be read again soon (temporal locality)."],
      ),
      h(["Cache em todos os níveis", "Caching at every level"]),
      p(["O caminho de uma requisição atravessa muitas camadas, e quase todas têm algum cache. Quanto mais perto do usuário o acerto acontece, menos trabalho o resto do sistema faz e menor é a latência. Em contrapartida, quanto mais perto do usuário, mais difícil é invalidar e menos compartilhado é o conteúdo.", "A request crosses many layers and almost all of them have some cache. The closer to the user the hit happens, the less work the rest of the system does and the lower the latency. In return, the closer to the user, the harder it is to invalidate and the less shared the content is."]),
      fig(["Níveis de cache no caminho de uma leitura", "Cache levels along the path of a read"],
        [[node("br", ["Navegador", "Browser"], "client")], [node("cdn", "CDN", "edge")], [node("app", ["Aplicação (cache local)", "Application (local cache)"], "service")], [node("rc", ["Cache distribuído", "Distributed cache"], "cache")], [node("db", ["Banco (buffer pool)", "Database (buffer pool)"], "data")]],
        [edge("br", "cdn", ["miss", "miss"]), edge("cdn", "app", ["miss", "miss"]), edge("app", "rc", ["miss", "miss"]), edge("rc", "db", ["miss", "miss"], { dashed: true })]),
      table([["Nível", "Level"], ["O que guarda", "What it keeps"], ["Latência típica", "Typical latency"], ["Invalidação", "Invalidation"]],
        [["CPU (L1, L2, L3)", "CPU (L1, L2, L3)"], ["Linhas de memória recentes", "Recently used memory lines"], ["1 a 40 ns", "1 to 40 ns"], ["Automática, por hardware", "Automatic, by hardware"]],
        [["Navegador", "Browser"], ["Arquivos estáticos, respostas HTTP", "Static files, HTTP responses"], ["0 ms (disco ou memória local)", "0 ms (local disk or memory)"], ["Cabeçalhos HTTP e nomes versionados", "HTTP headers and versioned names"]],
        [["CDN", "CDN"], ["Conteúdo estático e respostas cacheáveis", "Static content and cacheable responses"], ["5 a 50 ms", "5 to 50 ms"], ["Purge, TTL, versionamento", "Purge, TTL, versioning"]],
        [["Aplicação (em processo)", "Application (in process)"], ["Objetos e resultados em memória do processo", "Objects and results in process memory"], ["Menos de 1 µs", "Under 1 µs"], ["TTL, remoção, eventos", "TTL, eviction, events"]],
        [["Distribuído (Redis, Memcached)", "Distributed (Redis, Memcached)"], ["Dados compartilhados entre instâncias", "Data shared between instances"], ["0,2 a 2 ms", "0.2 to 2 ms"], ["TTL, remoção ativa pela aplicação", "TTL, active removal by the application"]],
        [["Banco (buffer pool, cache de consultas)", "Database (buffer pool, query cache)"], ["Páginas de dados e índices quentes", "Hot data pages and indexes"], ["0,1 a 5 ms", "0.1 to 5 ms"], ["Gerenciada pelo próprio banco", "Managed by the database itself"]],
      ),
      h(["Estratégias de leitura e escrita", "Read and write strategies"]),
      p(["A pergunta central é: quem fala com o cache e quem fala com o banco? As seis estratégias abaixo respondem de formas diferentes, e cada uma troca simplicidade, consistência e desempenho de escrita de um jeito próprio.", "The central question is: who talks to the cache and who talks to the database? The six strategies below answer differently, and each trades simplicity, consistency and write performance in its own way."]),
      h(["Cache-aside (carga sob demanda)", "Cache-aside (lazy loading)"]),
      p(["É o padrão mais usado. A **aplicação** controla tudo: antes de consultar o banco, olha o cache; se errar, lê do banco, grava no cache e devolve. Nas escritas, atualiza o banco e **apaga** a entrada do cache (em vez de reescrevê-la), deixando a próxima leitura repovoar. Apagar é mais seguro que atualizar porque evita que duas escritas concorrentes deixem no cache o valor mais antigo.", "This is the most widely used pattern. The **application** controls everything: before querying the database it looks at the cache; on a miss it reads from the database, stores the result in the cache and returns it. On writes it updates the database and **deletes** the cache entry (rather than rewriting it), letting the next read repopulate it. Deleting is safer than updating because it prevents two concurrent writes from leaving the older value in the cache."]),
      fig(["Cache-aside: a aplicação orquestra", "Cache-aside: the application orchestrates"],
        [[node("c", "Client", "client")], [node("a", ["Aplicação", "Application"], "service")], [node("ca", "Cache", "cache")], [node("d", ["Banco", "Database"], "data")]],
        [edge("c", "a", "1"), edge("a", "ca", ["2 busca", "2 lookup"]), edge("a", "d", ["3 se errar", "3 on miss"], { dashed: true }), edge("a", "ca", ["4 grava", "4 store"], { dashed: true })]),
      h(["Read-through", "Read-through"]),
      p(["Aqui o cache é uma camada que sabe carregar do banco. A aplicação só fala com o cache; quando há falha, o próprio cache (ou uma biblioteca) busca na fonte, guarda e responde. O código da aplicação fica mais simples e a regra de carga fica em um lugar só. O custo é depender de um cache que suporte esse comportamento e, na primeira leitura, a latência ser a do banco mais a do cache.", "Here the cache is a layer that knows how to load from the database. The application only talks to the cache; on a miss the cache itself (or a library) fetches from the source, stores and answers. Application code gets simpler and the load rule lives in one place. The cost is depending on a cache that supports this behavior and, on the first read, latency being the database's plus the cache's."]),
      h(["Write-through", "Write-through"]),
      p(["Toda escrita passa pelo cache, que a repassa **de forma síncrona** ao banco antes de confirmar. Cache e banco ficam coerentes, e leituras logo após a escrita acertam. A desvantagem é que cada escrita paga a latência das duas camadas e o cache guarda dados que talvez nunca sejam lidos. Costuma ser combinado com read-through.", "Every write goes through the cache, which forwards it **synchronously** to the database before acknowledging. Cache and database stay coherent, and reads right after the write hit. The drawback is that every write pays the latency of both layers and the cache stores data that may never be read. It is usually combined with read-through."]),
      h(["Write-back (write-behind)", "Write-back (write-behind)"]),
      p(["A escrita é gravada só no cache, que confirma imediatamente e **grava no banco depois**, em lote e de forma assíncrona. A latência de escrita é mínima e o banco recebe menos operações, pois várias atualizações da mesma chave se fundem em uma. O risco é perda de dados: se o cache cair antes de descarregar, as escritas pendentes somem. Por isso exige persistência no cache, replicação ou tolerância à perda (contadores de visualização, por exemplo).", "The write is stored only in the cache, which acknowledges immediately and **writes to the database later**, in batches and asynchronously. Write latency is minimal and the database receives fewer operations, since several updates to the same key merge into one. The risk is data loss: if the cache dies before flushing, pending writes vanish. That is why it requires cache persistence, replication or loss tolerance (view counters, for example)."]),
      h(["Write-around", "Write-around"]),
      p(["A escrita vai direto ao banco, ignorando o cache; só as leituras populam o cache. Evita poluí-lo com dados escritos e nunca relidos (logs, uploads, importações), mas a primeira leitura depois de uma escrita sempre erra, e uma entrada antiga precisa ser invalidada para não servir dado velho.", "The write goes straight to the database, bypassing the cache; only reads populate the cache. It avoids polluting the cache with data written and never reread (logs, uploads, imports), but the first read after a write always misses, and an old entry must be invalidated so it does not serve stale data."]),
      h(["Refresh-ahead", "Refresh-ahead"]),
      p(["O cache renova a entrada **antes** de ela expirar, normalmente quando ela é acessada perto do fim do TTL, usando uma tarefa em segundo plano. O usuário quase nunca vê uma falha em itens populares, o que também suaviza o *stampede*. O preço é desperdiçar recargas de itens que não seriam mais pedidos, e a necessidade de prever bem o que vale renovar.", "The cache renews the entry **before** it expires, usually when it is accessed near the end of the TTL, using a background task. Users almost never see a miss on popular items, which also smooths out the stampede. The price is wasted reloads of items that would not be requested again, and the need to predict well what is worth renewing."]),
      table([["Estratégia", "Strategy"], ["Quem fala com o banco", "Who talks to the database"], ["Consistência", "Consistency"], ["Latência de escrita", "Write latency"], ["Risco principal", "Main risk"]],
        [["Cache-aside", "Cache-aside"], ["Aplicação", "Application"], ["Eventual (janela entre escrita e remoção)", "Eventual (window between write and removal)"], ["Banco apenas", "Database only"], ["Leitura velha em corrida", "Stale read in a race"]],
        [["Read-through", "Read-through"], ["Cache", "Cache"], ["Eventual", "Eventual"], ["Banco apenas", "Database only"], ["Dependência do cache", "Cache dependency"]],
        [["Write-through", "Write-through"], ["Cache, de forma síncrona", "Cache, synchronously"], ["Forte entre cache e banco", "Strong between cache and database"], ["Cache + banco", "Cache + database"], ["Escrita mais lenta", "Slower writes"]],
        [["Write-back", "Write-back"], ["Cache, depois, em lote", "Cache, later, in batches"], ["Fraca até o descarregamento", "Weak until flushed"], ["Só cache (mínima)", "Cache only (minimal)"], ["Perda de dados", "Data loss"]],
        [["Write-around", "Write-around"], ["Aplicação, direto", "Application, directly"], ["Eventual", "Eventual"], ["Banco apenas", "Database only"], ["Primeira leitura sempre erra", "First read always misses"]],
        [["Refresh-ahead", "Refresh-ahead"], ["Tarefa do cache, antes de expirar", "Cache task, before expiry"], ["Eventual, janela pequena", "Eventual, small window"], ["Não afeta", "Not affected"], ["Recargas desperdiçadas", "Wasted reloads"]],
      ),
      h(["Exemplo: cache-aside em TypeScript", "Example: cache-aside in TypeScript"]),
      code(`type User = { id: string; name: string; plan: string };

const TTL_SECONDS = 300;

async function getUser(id: string): Promise<User | null> {
  const key = "user:" + id;

  // 1. look in the cache first
  const cached = await cache.get(key);
  if (cached !== null) return JSON.parse(cached) as User;

  // 2. miss: read from the source of truth
  const user = await db.users.findById(id);
  if (!user) {
    // negative caching: remember that it does not exist (short TTL)
    await cache.set(key, "null", { ttl: 30 });
    return null;
  }

  // 3. populate the cache with a TTL
  await cache.set(key, JSON.stringify(user), { ttl: TTL_SECONDS });
  return user;
}

async function updateUser(id: string, patch: Partial<User>) {
  await db.users.update(id, patch);   // write to the database first
  await cache.del("user:" + id);       // then invalidate (do not rewrite)
}`),
      h(["Invalidação: o problema difícil", "Invalidation: the hard problem"]),
      p(["Uma frase atribuída a Phil Karlton diz que as duas coisas difíceis em ciência da computação são invalidar cache e dar nomes às coisas. A dificuldade é real: cada cópia que existe fora da fonte da verdade é uma chance de servir dado velho. Há três técnicas principais, normalmente combinadas.", "A phrase attributed to Phil Karlton says the two hard things in computer science are cache invalidation and naming things. The difficulty is real: every copy that exists outside the source of truth is a chance to serve stale data. There are three main techniques, usually combined."]),
      ul(
        ["**Expiração por TTL**: a mais simples. Toda entrada expira sozinha, limitando o quanto o dado pode ficar velho. O TTL é um contrato de frescor: 30 segundos para um contador, 5 minutos para um perfil, 1 dia para um catálogo. É preciso aceitar a defasagem dentro da janela.", "**TTL expiry**: the simplest. Every entry expires by itself, bounding how stale the data can get. The TTL is a freshness contract: 30 seconds for a counter, 5 minutes for a profile, 1 day for a catalog. You must accept staleness within the window."],
        ["**Invalidação ativa**: ao alterar o dado, a aplicação (ou um evento, como o *change data capture* do banco) apaga ou atualiza as chaves afetadas. Dá frescor quase imediato, mas exige saber todas as chaves derivadas de um dado, e uma falha entre a escrita no banco e a remoção deixa lixo até o TTL.", "**Active invalidation**: when data changes, the application (or an event, such as the database's *change data capture*) deletes or updates the affected keys. It gives near-immediate freshness, but you must know all the keys derived from a piece of data, and a failure between the database write and the removal leaves garbage until the TTL."],
        ["**Versionamento de chaves**: em vez de apagar, muda-se a chave. Se o perfil ganha a versão 4, passa a ser lido de `user:42:v4` e as chaves antigas simplesmente deixam de ser pedidas e expiram. Uma chave de namespace (`catalog:ver` guardando um número) invalida de uma vez milhares de entradas com um único incremento.", "**Key versioning**: instead of deleting, the key changes. If the profile gets version 4, it is read from `user:42:v4` and old keys are simply no longer requested and expire. A namespace key (`catalog:ver` holding a number) invalidates thousands of entries at once with a single increment."],
      ),
      p(["Na prática, combine uma invalidação ativa para frescor com um TTL como rede de segurança: se a invalidação falhar, o erro tem prazo para acabar.", "In practice, combine active invalidation for freshness with a TTL as a safety net: if invalidation fails, the error has a deadline to end."]),
      h(["Problemas clássicos", "Classic problems"]),
      h(["Cache stampede (thundering herd)", "Cache stampede (thundering herd)"]),
      p(["Uma chave muito popular expira. No mesmo instante, milhares de requisições erram, e todas vão ao banco calcular o mesmo valor. O banco sofre um pico, fica lento, as requisições demoram mais e se acumulam, e o dano pode virar uma queda em cascata. As defesas se combinam:", "A very popular key expires. At the same instant thousands of requests miss, and all go to the database to compute the same value. The database takes a spike, slows down, requests take longer and pile up, and the damage can turn into a cascading failure. The defenses combine:"]),
      ul(
        ["**Lock por chave (*single flight*)**: só a primeira requisição recarrega; as outras esperam o resultado dela ou recebem o valor velho. Em um cache distribuído usa-se um lock curto (`SET chave valor NX PX 5000`), ou, dentro de um processo, uma tabela de promessas em andamento.", "**Per-key lock (single flight)**: only the first request reloads; the others wait for its result or receive the old value. In a distributed cache a short lock is used (`SET key value NX PX 5000`), or, inside one process, a table of in-flight promises."],
        ["**TTL com *jitter***: somar um valor aleatório ao TTL (por exemplo, 300 s mais 0 a 60 s) impede que muitas chaves carregadas juntas expirem juntas.", "**TTL with jitter**: adding a random amount to the TTL (for example, 300 s plus 0 to 60 s) prevents many keys loaded together from expiring together."],
        ["**Stale-while-revalidate**: guardar o valor com um prazo de frescor e outro, maior, de tolerância. Passado o frescor, serve-se o valor velho enquanto uma única tarefa renova em segundo plano. O usuário nunca espera, ao custo de dados levemente velhos.", "**Stale-while-revalidate**: store the value with a freshness deadline and a longer tolerance one. After freshness ends, the stale value is served while a single task renews it in the background. The user never waits, at the cost of slightly stale data."],
        ["**Renovação antecipada**: uma tarefa periódica recarrega as chaves mais quentes antes de expirarem (refresh-ahead).", "**Early renewal**: a periodic task reloads the hottest keys before they expire (refresh-ahead)."],
      ),
      code(`// single flight inside one process: concurrent misses share one load
const inflight = new Map<string, Promise<string>>();

async function getOnce(key: string, load: () => Promise<string>): Promise<string> {
  const hit = await cache.get(key);
  if (hit !== null) return hit;

  let pending = inflight.get(key);
  if (!pending) {
    pending = load()
      .then(async (value) => {
        const jitter = Math.floor(Math.random() * 60);
        await cache.set(key, value, { ttl: 300 + jitter });
        return value;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }
  return pending;
}`),
      h(["Cache penetration", "Cache penetration"]),
      p(["Pedidos por chaves que **não existem** nunca ficam no cache, porque não há valor a guardar, e cada um chega ao banco. É um erro de programa ou um ataque deliberado com identificadores aleatórios. Soluções: guardar resultados negativos por pouco tempo (o `null` do exemplo), validar o formato dos identificadores antes de consultar e usar um **filtro de Bloom** com o conjunto de chaves válidas para recusar de imediato o que certamente não existe.", "Requests for keys that **do not exist** never stay in the cache, because there is no value to store, and each one reaches the database. It is a program bug or a deliberate attack with random identifiers. Solutions: store negative results for a short time (the `null` in the example), validate the identifier format before querying and use a **Bloom filter** holding the set of valid keys to reject at once what certainly does not exist."]),
      h(["Cache avalanche", "Cache avalanche"]),
      p(["Muitas chaves expiram ao mesmo tempo, ou o próprio cache cai, e toda a carga despenca sobre o banco. Difere do stampede por envolver muitas chaves em vez de uma. Defesas: jitter nos TTLs, replicação e alta disponibilidade do cache, limitação de taxa e *circuit breaker* na frente do banco, e degradação controlada (servir parcialmente em vez de falhar por inteiro).", "Many keys expire at the same time, or the cache itself dies, and the whole load falls on the database. It differs from the stampede in involving many keys instead of one. Defenses: jitter on TTLs, cache replication and high availability, rate limiting and a circuit breaker in front of the database, and graceful degradation (serving partially instead of failing entirely)."]),
      h(["Vantagens e desvantagens", "Pros and cons"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Drawbacks"]],
        [["Latência muito menor nas leituras", "Much lower read latency"], ["Dados podem ficar velhos", "Data can go stale"]],
        [["Banco e serviços protegidos de picos", "Database and services shielded from spikes"], ["Invalidar é difícil e fonte de bugs", "Invalidating is hard and a source of bugs"]],
        [["Custo por requisição bem menor", "Much lower cost per request"], ["Mais uma peça para operar e monitorar", "One more component to operate and monitor"]],
        [["Escala leitura sem mexer no banco", "Scales reads without touching the database"], ["Falha fria (cache vazio) pode derrubar o banco", "A cold start (empty cache) can take the database down"]],
      ),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      p(["Use cache quando a leitura é muito mais frequente que a escrita, o cálculo é caro, o resultado é compartilhado entre muitos usuários e uma pequena defasagem é aceitável: catálogos, perfis públicos, contagens, páginas renderizadas, resultados de consultas pesadas, tokens e configurações. Evite quando o dado muda a cada leitura, quando exige consistência estrita (saldo bancário no momento de debitar, estoque na hora de confirmar o último item) ou quando o padrão de acesso é uniforme, sem itens quentes, pois a taxa de acerto será baixa e o cache só adiciona custo e complexidade. Meça antes: um cache sem métricas é uma suposição.", "Use caching when reads are far more frequent than writes, the computation is expensive, the result is shared among many users and slight staleness is acceptable: catalogs, public profiles, counts, rendered pages, heavy query results, tokens and settings. Avoid it when data changes on every read, when strict consistency is required (a bank balance at debit time, stock when confirming the last item) or when the access pattern is uniform, with no hot items, since the hit ratio will be low and the cache only adds cost and complexity. Measure first: a cache without metrics is a guess."]),
      h(["Casos reais", "Real-world cases"]),
      ul(
        ["**Redes sociais** guardam linhas do tempo e contadores em caches distribuídos para não recalcular a cada abertura do aplicativo.", "**Social networks** keep timelines and counters in distributed caches so they do not recompute on every app open."],
        ["**Comércio eletrônico** cacheia páginas de produto e preços na CDN e no cache da aplicação, mas confirma estoque e preço final direto na fonte ao fechar o pedido.", "**E-commerce** caches product pages and prices in the CDN and the application cache, but confirms stock and final price directly at the source when closing the order."],
        ["**Bancos de dados** mantêm um *buffer pool* com as páginas mais usadas; é o cache mais antigo e transparente que existe.", "**Databases** keep a *buffer pool* with the most used pages; it is the oldest and most transparent cache there is."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Cachear sem TTL e sem invalidação, e descobrir meses depois dados velhos em produção.", "Caching with no TTL and no invalidation, and discovering stale data in production months later."],
        ["Montar a chave sem incluir tudo o que altera a resposta (idioma, moeda, usuário, permissões), vazando dados de um usuário para outro.", "Building the key without everything that changes the response (language, currency, user, permissions), leaking one user's data to another."],
        ["Tratar o cache como armazenamento durável: ele pode perder tudo a qualquer momento e a aplicação deve funcionar (mais devagar) sem ele.", "Treating the cache as durable storage: it can lose everything at any moment and the application must still work (more slowly) without it."],
        ["Ignorar a falha do cache: sem *timeout* curto e *fallback*, um cache lento derruba a aplicação inteira.", "Ignoring cache failure: without a short timeout and a fallback, a slow cache takes the whole application down."],
        ["Guardar objetos enormes ou muitas variações da mesma consulta, esgotando a memória e derrubando a taxa de acerto.", "Storing huge objects or many variations of the same query, exhausting memory and dropping the hit ratio."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Cache troca frescor e simplicidade por latência e capacidade; funciona graças à localidade de acesso.", "Caching trades freshness and simplicity for latency and capacity; it works thanks to access locality."],
        ["Existem caches em todos os níveis, da CPU ao navegador; escolha o mais próximo do usuário que a consistência permitir.", "Caches exist at every level, from the CPU to the browser; choose the closest to the user that consistency allows."],
        ["Cache-aside é o padrão geral; write-through dá consistência, write-back dá velocidade com risco, write-around poupa o cache, refresh-ahead evita falhas em itens quentes.", "Cache-aside is the general pattern; write-through gives consistency, write-back gives speed with risk, write-around spares the cache, refresh-ahead avoids misses on hot items."],
        ["Invalide com TTL, eventos e versionamento de chaves, e use sempre um TTL como rede de segurança.", "Invalidate with TTLs, events and key versioning, and always use a TTL as a safety net."],
        ["Defenda-se de stampede (lock, jitter, stale-while-revalidate), penetração (cache negativo, Bloom) e avalanche (jitter, alta disponibilidade, limitação de taxa).", "Defend against stampede (lock, jitter, stale-while-revalidate), penetration (negative caching, Bloom) and avalanche (jitter, high availability, rate limiting)."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Apagar ou atualizar a chave ao escrever?** Em geral apagar: é mais simples e evita que escritas concorrentes deixem o valor mais antigo no cache.", "**Delete or update the key on write?** Usually delete: it is simpler and prevents concurrent writes from leaving the oldest value in the cache."],
        ["**Que taxa de acerto é boa?** Depende do caso, mas leituras de catálogo costumam passar de 90%. Mais importante que o número absoluto é acompanhar sua queda.", "**What hit ratio is good?** It depends, but catalog reads often exceed 90%. More important than the absolute number is watching it drop."],
        ["**Qual a diferença entre cache e réplica de leitura?** A réplica é um banco completo, durável e consultável com SQL, mas com atraso de replicação; o cache guarda apenas resultados escolhidos, em memória, e pode ser perdido.", "**What is the difference between a cache and a read replica?** A replica is a full, durable database queryable with SQL, with replication lag; a cache keeps only chosen results, in memory, and can be lost."],
        ["**Posso cachear dados de usuário?** Pode, desde que a chave inclua o usuário ou que a resposta seja realmente igual para todos; caso contrário, há vazamento de dados.", "**Can I cache user data?** Yes, as long as the key includes the user or the response is truly identical for everyone; otherwise data leaks."],
      ),
      tip(["Antes de adicionar um cache, pergunte se a consulta lenta não pode ser corrigida com um índice ou uma consulta melhor. O cache esconde o problema; o índice o resolve.", "Before adding a cache, ask whether the slow query cannot be fixed with an index or a better query. The cache hides the problem; the index solves it."]),
    ] },
  { id: "cache-distribuido", section: "cache", level: 2, icon: "hub", minutes: 14,
    title: ["Cache distribuído", "Distributed cache"],
    summary: ["Redis e Memcached em cluster: hash consistente, replicação, chaves quentes, near cache e consistência com o banco.", "Redis and Memcached in a cluster: consistent hashing, replication, hot keys, near cache and consistency with the database."],
    body: [
      p(["Um cache dentro do processo da aplicação é o mais rápido possível, mas tem limites claros. Cada instância tem o seu, então com vinte servidores o mesmo dado é carregado vinte vezes; uma atualização feita em uma instância não chega às outras; e a memória disponível é a de uma única máquina. Um **cache distribuído** resolve isso movendo os dados para um conjunto de nós dedicados, acessados pela rede por todas as instâncias da aplicação. Todos enxergam as mesmas entradas, o conjunto cresce somando nós e a memória total é a soma da de cada um.", "A cache inside the application process is as fast as it gets, but has clear limits. Each instance has its own, so with twenty servers the same data is loaded twenty times; an update made on one instance does not reach the others; and available memory is that of a single machine. A **distributed cache** solves this by moving data to a set of dedicated nodes, reached over the network by every application instance. Everyone sees the same entries, the set grows by adding nodes and total memory is the sum of each one's."]),
      p(["O preço é a rede: uma leitura passa de nanossegundos para algo entre 0,2 e 2 ms, há serialização do valor, e o cache vira uma dependência que pode falhar ou ficar lento. Os dois produtos mais usados são o **Memcached**, simples e focado em pares chave-valor em memória, e o **Redis**, que oferece também estruturas de dados (listas, conjuntos, conjuntos ordenados, *hashes*, *streams*), persistência opcional, replicação, scripts e um modo cluster.", "The price is the network: a read goes from nanoseconds to somewhere between 0.2 and 2 ms, the value must be serialized, and the cache becomes a dependency that can fail or slow down. The two most used products are **Memcached**, simple and focused on in-memory key-value pairs, and **Redis**, which also offers data structures (lists, sets, sorted sets, hashes, streams), optional persistence, replication, scripting and a cluster mode."]),
      h(["Como distribuir as chaves", "How to distribute keys"]),
      p(["Com vários nós, é preciso decidir qual guarda cada chave, e todos os clientes precisam chegar à mesma resposta sem consultar ninguém. A ideia ingênua é `nó = hash(chave) mod N`. Funciona até N mudar: ao adicionar ou remover um nó, quase todas as chaves mudam de lugar, o cache fica efetivamente vazio e o banco recebe toda a carga de uma vez.", "With several nodes, you must decide which one holds each key, and all clients must reach the same answer without asking anyone. The naive idea is `node = hash(key) mod N`. It works until N changes: when a node is added or removed, almost all keys move, the cache is effectively empty and the database receives the whole load at once."]),
      h(["Hash consistente", "Consistent hashing"]),
      p(["O **hash consistente** arruma tanto chaves quanto nós em um anel de valores (por exemplo de 0 a 2^32 - 1). Cada nó ocupa uma ou várias posições (os *nós virtuais*), e cada chave pertence ao primeiro nó encontrado ao andar no sentido horário a partir da posição de seu hash. Quando um nó entra ou sai, apenas as chaves do trecho vizinho mudam de dono: em média 1/N delas, em vez de quase todas. Os nós virtuais, de dezenas a centenas por servidor, espalham a carga de forma mais uniforme e permitem dar mais peso a máquinas maiores. É o método usado por clientes do Memcached (como o ketama) e por sistemas como Cassandra e DynamoDB.", "**Consistent hashing** places both keys and nodes on a ring of values (for example 0 to 2^32 - 1). Each node takes one or several positions (the *virtual nodes*), and each key belongs to the first node found walking clockwise from the position of its hash. When a node joins or leaves, only the keys of the neighboring stretch change owner: on average 1/N of them, instead of almost all. Virtual nodes, dozens to hundreds per server, spread load more evenly and let larger machines carry more weight. It is the method used by Memcached clients (such as ketama) and by systems like Cassandra and DynamoDB."]),
      fig(["Roteamento de chaves em um cluster de cache", "Key routing in a cache cluster"],
        [[node("a1", ["App 1", "App 1"], "service"), node("a2", ["App 2", "App 2"], "service"), node("a3", ["App 3", "App 3"], "service")], [node("r", ["Cliente com hash consistente", "Client with consistent hash"], "edge")], [node("n1", ["Nó A", "Node A"], "cache"), node("n2", ["Nó B", "Node B"], "cache"), node("n3", ["Nó C", "Node C"], "cache")], [node("db", ["Banco", "Database"], "data")]],
        [edge("a1", "r"), edge("a2", "r"), edge("a3", "r"), edge("r", "n1", "k1"), edge("r", "n2", "k2"), edge("r", "n3", "k3"), edge("n2", "db", ["miss", "miss"], { dashed: true })]),
      h(["Redis Cluster e *hash slots*", "Redis Cluster and hash slots"]),
      p(["O Redis Cluster não usa um anel: divide o espaço de chaves em **16384 slots** (`slot = CRC16(chave) mod 16384`), e cada nó mestre cuida de uma faixa deles. Mover dados é mover slots de um nó a outro, de forma controlada e online. O cliente conhece o mapa de slots e fala direto com o nó certo; se errar, o servidor responde com `MOVED` e o cliente atualiza seu mapa. Como operações com várias chaves só funcionam dentro de um mesmo nó, usam-se *hash tags*: no nome `{user:42}:cart`, só o trecho entre chaves entra no cálculo, então `{user:42}:cart` e `{user:42}:profile` caem no mesmo slot.", "Redis Cluster does not use a ring: it splits the key space into **16384 slots** (`slot = CRC16(key) mod 16384`), and each master node owns a range of them. Moving data means moving slots from one node to another, in a controlled and online way. The client knows the slot map and talks directly to the right node; if it is wrong, the server replies `MOVED` and the client updates its map. Since multi-key operations only work within one node, *hash tags* are used: in the name `{user:42}:cart` only the part between braces enters the calculation, so `{user:42}:cart` and `{user:42}:profile` land in the same slot."]),
      h(["Replicação e alta disponibilidade", "Replication and high availability"]),
      p(["Um nó que cai leva consigo as chaves que guardava, e os pedidos por elas viram falhas e vão ao banco. Para amenizar, cada mestre tem uma ou mais **réplicas**, que recebem as escritas de forma assíncrona. Se o mestre cai, as réplicas elegem um substituto (no Redis Cluster pelo próprio protocolo; em instalações sem cluster, pelo Redis Sentinel). Como a replicação é assíncrona, uma escrita já confirmada pode se perder na troca, o que para um cache costuma ser aceitável. Réplicas também podem atender leituras, aliviando o mestre, ao custo de ler dados ligeiramente atrasados. O Memcached, por desenho, não replica: a resiliência vem de tolerar a perda do nó e repopular o cache.", "A node that dies takes the keys it held with it, and requests for them become misses and go to the database. To soften this, each master has one or more **replicas**, which receive writes asynchronously. If the master dies, the replicas elect a substitute (in Redis Cluster through the protocol itself; in non-cluster setups, through Redis Sentinel). Because replication is asynchronous, an already acknowledged write can be lost in the failover, which for a cache is usually acceptable. Replicas can also serve reads, relieving the master, at the cost of reading slightly lagging data. Memcached, by design, does not replicate: resilience comes from tolerating the loss of a node and repopulating the cache."]),
      table([["Aspecto", "Aspect"], ["Redis", "Redis"], ["Memcached", "Memcached"]],
        [["Modelo de dados", "Data model"], ["Estruturas ricas (listas, conjuntos, ordenados, hashes, streams)", "Rich structures (lists, sets, sorted sets, hashes, streams)"], ["Apenas chave e valor binário", "Only key and binary value"]],
        [["Persistência", "Persistence"], ["Opcional (RDB, AOF)", "Optional (RDB, AOF)"], ["Nenhuma", "None"]],
        [["Replicação e failover", "Replication and failover"], ["Sim (réplicas, Sentinel, Cluster)", "Yes (replicas, Sentinel, Cluster)"], ["Não; resiliência no cliente", "No; resilience in the client"]],
        [["Distribuição", "Distribution"], ["Slots no Redis Cluster", "Slots in Redis Cluster"], ["Hash consistente feito pelo cliente", "Consistent hashing done by the client"]],
        [["Execução", "Execution"], ["Comandos em uma thread principal (I/O pode ser paralelo)", "Commands on a main thread (I/O can be parallel)"], ["Multithread", "Multithreaded"]],
        [["Uso típico", "Typical use"], ["Cache, filas leves, rankings, locks, sessões", "Cache, light queues, rankings, locks, sessions"], ["Cache simples de alto volume", "High-volume simple cache"]],
      ),
      h(["Problemas próprios de caches distribuídos", "Problems specific to distributed caches"]),
      h(["Chaves quentes (hot keys)", "Hot keys"]),
      p(["O hash distribui as **chaves** de forma uniforme, mas não a **carga**. Se uma única chave recebe 200 mil leituras por segundo (o produto em promoção, o perfil de uma celebridade), o nó que a guarda satura enquanto os outros ficam ociosos, e adicionar nós não ajuda. As soluções: um **near cache** (cache local de poucos segundos dentro de cada instância da aplicação), **réplicas de leitura**, ou **dividir a chave** em cópias (`produto:9:c0` a `produto:9:c7`), lendo uma ao acaso, o que espalha a carga em vários nós. Detectar a chave quente exige métricas por chave, como o comando `redis-cli --hotkeys` com a política LFU ativa.", "Hashing spreads the **keys** evenly, but not the **load**. If a single key receives 200 thousand reads per second (the product on sale, a celebrity's profile), the node holding it saturates while the others sit idle, and adding nodes does not help. The solutions: a **near cache** (a local cache of a few seconds inside each application instance), **read replicas**, or **splitting the key** into copies (`product:9:c0` to `product:9:c7`), reading one at random, which spreads the load across nodes. Detecting the hot key requires per-key metrics, such as the `redis-cli --hotkeys` command with the LFU policy enabled."]),
      h(["Near cache (cache de dois níveis)", "Near cache (two-level cache)"]),
      p(["Combina um cache local pequeno (L1, em processo) com o distribuído (L2). A leitura tenta o L1 em nanossegundos, depois o L2 em milissegundos, depois o banco. O ganho é grande para dados lidos com muita frequência; o problema é que cada instância tem sua cópia local, que pode ficar velha. Usa-se um TTL curto no L1 (1 a 10 segundos) e, quando a defasagem é inaceitável, mensagens de invalidação por *pub/sub*: quem altera o dado publica, e todas as instâncias descartam a cópia local. O Redis oferece ainda o *client-side caching*, em que o servidor avisa o cliente quando uma chave que ele guardou foi alterada.", "It combines a small local cache (L1, in process) with the distributed one (L2). A read tries L1 in nanoseconds, then L2 in milliseconds, then the database. The gain is large for very frequently read data; the problem is that each instance has its own local copy, which can go stale. A short TTL is used on L1 (1 to 10 seconds) and, when staleness is unacceptable, invalidation messages over *pub/sub*: whoever changes the data publishes, and all instances drop their local copy. Redis also offers *client-side caching*, in which the server notifies the client when a key it has stored was changed."]),
      h(["Consistência entre cache e banco", "Consistency between cache and database"]),
      p(["Cache e banco são dois sistemas, e não existe transação que os cubra. Isso abre janelas de inconsistência. O caso clássico: a leitura A erra o cache e lê o valor antigo do banco; a escrita B atualiza o banco e apaga a chave; só então A grava no cache o valor antigo, que fica lá até o TTL. É raro, mas acontece em alto volume. Há quatro formas de reduzir o risco: usar TTL como limite de dano; gravar no banco primeiro e só depois invalidar; reapagar a chave após um pequeno atraso (*delayed double delete*); e propagar mudanças por *change data capture*, de modo que uma única fonte, o log do banco, alimente a invalidação em ordem. Para dados que não toleram nenhuma defasagem, leia da fonte da verdade e não use cache.", "Cache and database are two systems, and no transaction spans both. This opens windows of inconsistency. The classic case: read A misses the cache and reads the old value from the database; write B updates the database and deletes the key; only then does A store the old value in the cache, where it stays until the TTL. It is rare, but happens at high volume. There are four ways to lower the risk: use a TTL as a damage bound; write to the database first and only then invalidate; delete the key again after a small delay (*delayed double delete*); and propagate changes through *change data capture*, so a single source, the database log, feeds invalidation in order. For data that tolerates no staleness, read from the source of truth and do not cache."]),
      h(["Exemplo com ioredis", "Example with ioredis"]),
      code(`import Redis from "ioredis";

const redis = new Redis({
  host: "cache.internal",
  port: 6379,
  connectTimeout: 200,      // fail fast: a slow cache must not stall requests
  maxRetriesPerRequest: 1,
});

type Product = { id: string; name: string; priceCents: number };

export async function getProduct(id: string): Promise<Product | null> {
  const key = "product:" + id;
  try {
    const raw = await redis.get(key);
    if (raw !== null) return JSON.parse(raw) as Product;
  } catch {
    // cache down: fall through to the database instead of failing
  }

  const product = await db.products.findById(id);
  if (product) {
    const ttl = 600 + Math.floor(Math.random() * 120); // TTL with jitter
    redis.set(key, JSON.stringify(product), "EX", ttl).catch(() => {});
  }
  return product;
}

// distributed lock to avoid a stampede on a hot key
export async function getWithLock(key: string, load: () => Promise<string>) {
  const hit = await redis.get(key);
  if (hit !== null) return hit;

  const lockKey = "lock:" + key;
  const token = crypto.randomUUID();
  const got = await redis.set(lockKey, token, "PX", 5000, "NX");
  if (got === "OK") {
    try {
      const value = await load();
      await redis.set(key, value, "EX", 300);
      return value;
    } finally {
      // release only if the lock is still ours
      await redis.eval(
        "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end",
        1, lockKey, token);
    }
  }
  await new Promise((r) => setTimeout(r, 50)); // someone else is loading
  return getWithLock(key, load);
}`),
      h(["Vantagens e desvantagens", "Pros and cons"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Drawbacks"]],
        [["Visão única dos dados para todas as instâncias", "A single view of data for all instances"], ["Latência de rede em toda leitura", "Network latency on every read"]],
        [["Capacidade de memória cresce com os nós", "Memory capacity grows with nodes"], ["Mais um sistema para operar, proteger e dimensionar", "One more system to operate, secure and size"]],
        [["Sobrevive ao reinício das aplicações", "Survives application restarts"], ["Falha ou lentidão do cache afeta todos", "Cache failure or slowness affects everyone"]],
        [["Estruturas de dados úteis (Redis)", "Useful data structures (Redis)"], ["Chaves quentes concentram carga em um nó", "Hot keys concentrate load on one node"]],
      ),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      p(["Use quando várias instâncias da aplicação precisam compartilhar o mesmo conjunto de dados quentes, quando o volume ultrapassa a memória de uma máquina ou quando o estado (sessões, limites de taxa, contadores) precisa ser comum. Evite se uma aplicação com poucas instâncias e dados pequenos se resolve com um cache local, ou se a equipe não tem como operar um cluster com monitoramento e alta disponibilidade. Em ambientes de nuvem, serviços gerenciados (como ElastiCache, Memorystore ou Azure Cache) tiram parte do trabalho operacional.", "Use it when several application instances must share the same hot data, when volume exceeds one machine's memory or when state (sessions, rate limits, counters) must be common. Avoid it if an application with few instances and small data is well served by a local cache, or if the team cannot operate a cluster with monitoring and high availability. In cloud environments, managed services (such as ElastiCache, Memorystore or Azure Cache) take away part of the operational work."]),
      h(["Casos reais", "Real-world cases"]),
      ul(
        ["**Sessões de usuário** em Redis permitem que qualquer servidor atenda qualquer requisição, tornando a aplicação *stateless*.", "**User sessions** in Redis let any server handle any request, making the application stateless."],
        ["**Limitação de taxa** com contadores atômicos (`INCR` com expiração) compartilhados por todas as instâncias de uma API.", "**Rate limiting** with atomic counters (`INCR` with expiry) shared by all instances of an API."],
        ["**Rankings** com conjuntos ordenados do Redis (`ZADD`, `ZREVRANGE`) em jogos e plataformas de conteúdo.", "**Leaderboards** with Redis sorted sets (`ZADD`, `ZREVRANGE`) in games and content platforms."],
        ["**Memcached** em grandes redes sociais, historicamente, como camada de cache de leitura na frente de bancos sharded.", "**Memcached** at large social networks, historically, as a read-cache layer in front of sharded databases."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Usar `mod N` simples para escolher o nó e esvaziar o cache a cada mudança no cluster.", "Using plain `mod N` to pick the node and emptying the cache on every cluster change."],
        ["Não definir *timeouts* nem *fallback*: o cache lento vira o gargalo de todo o sistema.", "Not setting timeouts or a fallback: the slow cache becomes the bottleneck of the whole system."],
        ["Usar o comando `KEYS *` em produção: ele varre todo o espaço de chaves e bloqueia o servidor; use `SCAN`.", "Using the `KEYS *` command in production: it scans the whole key space and blocks the server; use `SCAN`."],
        ["Deixar o cache sem senha ou exposto na rede pública.", "Leaving the cache without a password or exposed on the public network."],
        ["Armazenar valores de vários megabytes por chave, que travam a rede e a thread de comandos.", "Storing multi-megabyte values per key, which clog the network and the command thread."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Cache distribuído compartilha dados entre instâncias, ao custo de latência de rede e de operar outro sistema.", "A distributed cache shares data among instances, at the cost of network latency and operating another system."],
        ["Hash consistente (ou slots, no Redis Cluster) distribui as chaves movendo só uma fração delas quando o cluster muda.", "Consistent hashing (or slots, in Redis Cluster) distributes keys moving only a fraction of them when the cluster changes."],
        ["Réplicas e failover reduzem o impacto de uma queda; o Memcached prefere tolerar a perda.", "Replicas and failover reduce the impact of an outage; Memcached prefers to tolerate the loss."],
        ["Chaves quentes pedem near cache, réplicas de leitura ou divisão da chave.", "Hot keys call for a near cache, read replicas or key splitting."],
        ["Cache e banco nunca são atômicos: use TTL, invalide depois de gravar e considere CDC.", "Cache and database are never atomic: use a TTL, invalidate after writing and consider CDC."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Redis ou Memcached?** Para cache simples e muito volume, ambos servem. Se precisar de estruturas de dados, persistência ou replicação, Redis.", "**Redis or Memcached?** For simple high-volume caching both work. If you need data structures, persistence or replication, Redis."],
        ["**O que acontece com o cache quando adiciono um nó?** Com hash consistente ou slots, só uma fração das chaves muda de nó; as demais continuam acertando.", "**What happens to the cache when I add a node?** With consistent hashing or slots, only a fraction of keys move; the rest keep hitting."],
        ["**Um cache distribuído precisa ser persistente?** Não para ser cache. Persistir ajuda a esquentar mais rápido após reinício, mas o banco continua sendo a fonte da verdade.", "**Does a distributed cache need to be persistent?** Not to be a cache. Persisting helps warm up faster after a restart, but the database remains the source of truth."],
        ["**Como evitar que o cache seja ponto único de falha?** Réplicas com failover automático, *timeouts* curtos e fallback ao banco com limitação de taxa.", "**How do I keep the cache from being a single point of failure?** Replicas with automatic failover, short timeouts and a fallback to the database with rate limiting."],
      ),
      tip(["Trate o cache distribuído como um acelerador, nunca como requisito de correção: se desligá-lo faz a aplicação errar em vez de apenas ficar lenta, há dados importantes guardados no lugar errado.", "Treat the distributed cache as an accelerator, never as a correctness requirement: if turning it off makes the application wrong instead of merely slow, important data is stored in the wrong place."]),
    ] },
  { id: "politicas-de-remocao", section: "cache", level: 1, icon: "delete_sweep", minutes: 14,
    title: ["Políticas de remoção de cache", "Cache eviction policies"],
    summary: ["LRU, LFU, FIFO, MRU, aleatória, TTL, ARC e TinyLFU: como o cache decide quem sai quando enche.", "LRU, LFU, FIFO, MRU, random, TTL, ARC and TinyLFU: how a cache decides what leaves when it fills up."],
    body: [
      p(["A memória de um cache é finita e os dados que poderiam ser guardados, quase sempre, não cabem todos. Quando uma nova entrada chega e o espaço acabou, é preciso escolher uma **vítima** para sair. Essa escolha é a **política de remoção** (*eviction policy*), e ela determina a taxa de acerto: uma boa política mantém na memória o que será pedido de novo; uma ruim joga fora justamente o que é mais útil. Como ninguém conhece o futuro, todas as políticas são **heurísticas** que estimam a utilidade futura de cada item com base no passado.", "A cache's memory is finite and the data that could be stored often does not all fit. When a new entry arrives and the space is gone, a **victim** must be chosen to leave. That choice is the **eviction policy**, and it determines the hit ratio: a good policy keeps in memory what will be requested again; a bad one throws away exactly what is most useful. Since nobody knows the future, every policy is a **heuristic** that estimates each item's future usefulness from the past."]),
      p(["O benchmark teórico é o algoritmo ótimo de Bélády, que remove o item cujo próximo uso estiver mais distante no futuro. Ele é impossível de implementar de verdade, mas serve de teto para comparar as demais. Conceitualmente, duas informações guiam as heurísticas: a **recência** (quando o item foi usado por último) e a **frequência** (quantas vezes foi usado). Cada política pesa essas duas informações de um jeito.", "The theoretical benchmark is Bélády's optimal algorithm, which removes the item whose next use is farthest in the future. It cannot truly be implemented, but serves as a ceiling to compare the others. Conceptually, two pieces of information guide the heuristics: **recency** (when the item was last used) and **frequency** (how many times it was used). Each policy weighs the two in its own way."]),
      h(["Conceitos-chave", "Key concepts"]),
      ul(
        ["**Capacidade**: o limite que dispara a remoção, em número de itens ou em bytes. Limitar por bytes é mais fiel ao custo real, pois itens têm tamanhos diferentes.", "**Capacity**: the limit that triggers eviction, in item count or bytes. Limiting by bytes is closer to real cost, since items have different sizes."],
        ["**Vítima**: o item escolhido para sair.", "**Victim**: the item chosen to leave."],
        ["**Poluição do cache**: itens usados uma só vez, como uma varredura longa (*scan*), que expulsam dados valiosos sem trazer benefício.", "**Cache pollution**: items used only once, such as a long scan, that push out valuable data without bringing any benefit."],
        ["**Complexidade**: o custo de atualizar a ordem a cada acesso. Políticas boas precisam de operações O(1), pois rodam em todo acerto.", "**Complexity**: the cost of updating the order on every access. Good policies need O(1) operations, since they run on every hit."],
      ),
      h(["As políticas, uma a uma", "The policies, one by one"]),
      h(["LRU (Least Recently Used)", "LRU (Least Recently Used)"]),
      p(["Remove o item **usado há mais tempo**. A premissa é a localidade temporal: o que foi acessado recentemente tem mais chance de ser acessado de novo. É a política mais popular, boa na maioria das cargas, e simples de explicar. Sua fraqueza é a varredura: ler uma vez uma sequência longa de itens empurra para fora todo o conjunto quente.", "Removes the item **used longest ago**. The premise is temporal locality: what was accessed recently is more likely to be accessed again. It is the most popular policy, good for most workloads, and simple to explain. Its weakness is the scan: reading a long sequence of items once pushes the whole hot set out."]),
      fig(["LRU: o acesso move o item para a frente", "LRU: an access moves the item to the front"],
        [[node("h", ["Mapa chave para nó", "Hash map key to node"], "cache")], [node("m", ["Mais recente (cabeça)", "Most recent (head)"], "service")], [node("mid", ["Itens intermediários", "Middle items"], "service")], [node("l", ["Menos recente (cauda)", "Least recent (tail)"], "data")], [node("ev", ["Remoção quando enche", "Eviction when full"], "ext")]],
        [edge("h", "m", ["get / put", "get / put"]), edge("m", "mid", undefined, { both: true }), edge("mid", "l", undefined, { both: true }), edge("l", "ev", ["sai", "leaves"], { dashed: true })]),
      p(["A implementação clássica em O(1) combina um **mapa** (para achar um nó pela chave) e uma **lista duplamente encadeada** (para manter a ordem de uso). Em cada acesso, o nó vai para a cabeça; quando a capacidade estoura, remove-se a cauda. Abaixo, uma versão completa em TypeScript.", "The classic O(1) implementation combines a **map** (to find a node by key) and a **doubly linked list** (to keep the usage order). On each access the node moves to the head; when capacity overflows, the tail is removed. Below is a complete TypeScript version."]),
      code(`class Node<K, V> {
  prev: Node<K, V> | null = null;
  next: Node<K, V> | null = null;
  constructor(public key: K, public value: V) {}
}

export class LRUCache<K, V> {
  private map = new Map<K, Node<K, V>>();
  // sentinels avoid null checks at the ends of the list
  private head = new Node<K, V>(null as K, null as V); // most recent after head
  private tail = new Node<K, V>(null as K, null as V); // least recent before tail

  constructor(private capacity: number) {
    if (capacity < 1) throw new Error("capacity must be >= 1");
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.unlink(node);
    this.pushFront(node); // mark as most recently used
    return node.value;
  }

  put(key: K, value: V): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.unlink(existing);
      this.pushFront(existing);
      return;
    }
    if (this.map.size >= this.capacity) {
      const victim = this.tail.prev!; // least recently used
      this.unlink(victim);
      this.map.delete(victim.key);
    }
    const node = new Node(key, value);
    this.map.set(key, node);
    this.pushFront(node);
  }

  private unlink(n: Node<K, V>): void {
    n.prev!.next = n.next;
    n.next!.prev = n.prev;
  }

  private pushFront(n: Node<K, V>): void {
    n.next = this.head.next;
    n.prev = this.head;
    this.head.next!.prev = n;
    this.head.next = n;
  }
}

// shorter variant: a JS Map keeps insertion order, so re-inserting
// on access makes the first key always the least recently used
class SimpleLRU<K, V> {
  private map = new Map<K, V>();
  constructor(private capacity: number) {}
  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
  put(key: K, value: V): void {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      this.map.delete(this.map.keys().next().value as K);
    }
  }
}`),
      h(["LFU (Least Frequently Used)", "LFU (Least Frequently Used)"]),
      p(["Remove o item com **menos acessos** acumulados. É excelente quando a popularidade é estável, pois protege os itens realmente populares de picos de itens ocasionais, e resiste bem a varreduras. As fraquezas: itens que foram muito populares no passado e já não são ficam presos por contagem alta (por isso as versões práticas aplicam envelhecimento, dividindo os contadores com o tempo), e um item novo começa com contagem 1 e corre o risco de ser expulso antes de provar seu valor. A implementação O(1) usa um mapa de chaves e listas por frequência.", "Removes the item with the **fewest accumulated accesses**. It is excellent when popularity is stable, since it protects truly popular items from bursts of occasional ones, and withstands scans well. The weaknesses: items that were once very popular and no longer are stay stuck by a high count (so practical versions apply aging, decaying counters over time), and a new item starts with count 1 and risks being evicted before proving its worth. The O(1) implementation uses a key map and lists per frequency."]),
      h(["FIFO, MRU e aleatória", "FIFO, MRU and random"]),
      p(["**FIFO** remove o item mais antigo **em tempo de entrada**, ignorando se foi usado desde então. É trivial (uma fila) e tem custo mínimo, mas pode expulsar itens muito úteis só por terem chegado cedo. **MRU** remove o **mais recentemente usado**, o oposto do LRU; parece estranho, mas serve para varreduras cíclicas sobre conjuntos maiores que o cache, em que o item acabado de ler é justamente o último a ser relido. **Aleatória** sorteia a vítima: não mantém nenhuma estrutura de ordem, tem custo quase zero e, surpreendentemente, desempenha razoavelmente em muitas cargas, o que a torna base de algoritmos aproximados.", "**FIFO** removes the item oldest **by insertion time**, ignoring whether it was used since. It is trivial (a queue) and has minimal cost, but can evict very useful items just for arriving early. **MRU** removes the **most recently used**, the opposite of LRU; it seems odd, but suits cyclic scans over sets larger than the cache, where the item just read is exactly the last to be read again. **Random** draws the victim: it keeps no ordering structure, costs almost nothing and, surprisingly, performs reasonably on many workloads, which makes it the basis of approximate algorithms."]),
      h(["TTL como política de remoção", "TTL as an eviction policy"]),
      p(["Remover por **expiração** não é, a rigor, uma escolha de vítima por falta de espaço, mas por prazo: a entrada sai quando seu tempo de vida acaba, mesmo havendo memória. Serve para limitar a defasagem dos dados e costuma ser combinada com uma das políticas acima, que age quando a memória aperta antes dos prazos. No Redis, as chaves com TTL expiram de forma preguiçosa (ao serem acessadas) e por amostragem periódica em segundo plano, então o espaço de uma chave vencida pode demorar a ser liberado.", "Removing by **expiry** is not strictly a choice of victim due to lack of space, but due to a deadline: the entry leaves when its lifetime ends, even with free memory. It serves to bound data staleness and is usually combined with one of the policies above, which acts when memory gets tight before the deadlines. In Redis, keys with a TTL expire lazily (when accessed) and by periodic background sampling, so the space of an expired key can take a while to be released."]),
      h(["ARC e TinyLFU", "ARC and TinyLFU"]),
      p(["Políticas modernas combinam recência e frequência. A **ARC** (*Adaptive Replacement Cache*) mantém duas listas, uma para itens vistos uma só vez (recência) e outra para itens vistos mais de uma vez (frequência), além de listas-fantasma com as chaves recém-removidas de cada uma. Quando um acerto cai em uma lista-fantasma, a ARC aprende qual lado estava subdimensionado e ajusta o tamanho das listas, adaptando-se sozinha à carga. A **TinyLFU** coloca na frente do cache um filtro de frequência compacto (um *count-min sketch* com contadores que envelhecem) e só admite um novo item se sua frequência estimada superar a da vítima que ele substituiria. A biblioteca **Caffeine** (Java) combina essa admissão com uma janela LRU pequena em uma política chamada W-TinyLFU, que atinge taxas de acerto próximas das melhores conhecidas com custo de memória baixo.", "Modern policies combine recency and frequency. **ARC** (*Adaptive Replacement Cache*) keeps two lists, one for items seen once (recency) and another for items seen more than once (frequency), plus ghost lists holding the keys recently removed from each. When a hit lands on a ghost list, ARC learns which side was undersized and adjusts the list sizes, adapting to the workload by itself. **TinyLFU** puts in front of the cache a compact frequency filter (a *count-min sketch* with aging counters) and only admits a new item if its estimated frequency beats that of the victim it would replace. The **Caffeine** library (Java) combines this admission with a small LRU window in a policy called W-TinyLFU, which reaches hit ratios close to the best known at a low memory cost."]),
      table([["Política", "Policy"], ["Remove", "Removes"], ["Ponto forte", "Strength"], ["Ponto fraco", "Weakness"], ["Custo", "Cost"]],
        [["LRU", "LRU"], ["Usado há mais tempo", "Used longest ago"], ["Simples, bom geral", "Simple, good overall"], ["Vulnerável a varreduras", "Vulnerable to scans"], ["O(1), lista + mapa", "O(1), list + map"]],
        [["LFU", "LFU"], ["Menos acessos", "Fewest accesses"], ["Protege itens populares", "Protects popular items"], ["Itens antigos ficam presos; novos sofrem", "Old items stay stuck; new ones suffer"], ["O(1) com listas por frequência", "O(1) with per-frequency lists"]],
        [["FIFO", "FIFO"], ["Entrou há mais tempo", "Inserted longest ago"], ["Muito simples e barata", "Very simple and cheap"], ["Ignora o uso", "Ignores usage"], ["O(1), fila", "O(1), queue"]],
        [["MRU", "MRU"], ["Usado mais recentemente", "Most recently used"], ["Bom em varreduras cíclicas", "Good for cyclic scans"], ["Ruim na maioria das cargas", "Bad for most workloads"], ["O(1)", "O(1)"]],
        [["Aleatória", "Random"], ["Item sorteado", "A random item"], ["Sem estrutura de ordem", "No ordering structure"], ["Imprevisível", "Unpredictable"], ["O(1)", "O(1)"]],
        [["TTL", "TTL"], ["Entrada vencida", "Expired entry"], ["Limita a defasagem", "Bounds staleness"], ["Não resolve falta de espaço sozinha", "Does not solve lack of space alone"], ["Baixo", "Low"]],
        [["ARC", "ARC"], ["Adapta recência e frequência", "Adapts recency and frequency"], ["Resiste a varreduras, auto-ajuste", "Scan-resistant, self-tuning"], ["Mais complexa, tem patentes históricas", "More complex, historical patents"], ["O(1), 4 listas", "O(1), 4 lists"]],
        [["TinyLFU / W-TinyLFU", "TinyLFU / W-TinyLFU"], ["Filtra por frequência estimada", "Filters by estimated frequency"], ["Alta taxa de acerto, pouca memória", "High hit ratio, little memory"], ["Mais difícil de implementar", "Harder to implement"], ["O(1), sketch", "O(1), sketch"]],
      ),
      h(["Remoção no Redis: maxmemory-policy", "Eviction in Redis: maxmemory-policy"]),
      p(["O Redis só remove chaves por pressão de memória se `maxmemory` estiver configurado; sem isso, ele cresce até esgotar a máquina. A política é escolhida em `maxmemory-policy`. Importante: o LRU e o LFU do Redis são **aproximados**. Em vez de manter uma lista global, ele amostra algumas chaves (`maxmemory-samples`, padrão 5) e remove a pior entre elas, economizando memória e CPU com resultado muito próximo do exato.", "Redis only evicts keys under memory pressure if `maxmemory` is configured; without it, it grows until the machine is exhausted. The policy is chosen in `maxmemory-policy`. Important: Redis's LRU and LFU are **approximated**. Instead of keeping a global list it samples a few keys (`maxmemory-samples`, default 5) and removes the worst among them, saving memory and CPU with a result very close to the exact one."]),
      code(`# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
maxmemory-samples 10        # more samples = closer to true LRU, more CPU

# main policies
# noeviction       reject writes when full (default)
# allkeys-lru      any key, least recently used     <- usual cache choice
# allkeys-lfu      any key, least frequently used
# allkeys-random   any key, random
# volatile-lru     only keys that have a TTL, LRU
# volatile-lfu     only keys that have a TTL, LFU
# volatile-ttl     keys with TTL, shortest remaining TTL first
# volatile-random  keys with TTL, random`),
      p(["Como regra, para um cache puro use `allkeys-lru` ou `allkeys-lfu`. As variantes `volatile-*` só removem chaves com TTL, útil quando o mesmo Redis guarda também dados sem expiração que não podem ser descartados; mas, se não houver chaves elegíveis, ele responde com erro de memória como na `noeviction`. A `allkeys-lfu` é melhor em cargas com itens muito populares estáveis.", "As a rule, for a pure cache use `allkeys-lru` or `allkeys-lfu`. The `volatile-*` variants only remove keys with a TTL, useful when the same Redis also holds non-expiring data that cannot be discarded; but if there are no eligible keys it answers with an out-of-memory error as `noeviction` does. `allkeys-lfu` is better for workloads with stable, very popular items."]),
      h(["Como escolher", "How to choose"]),
      ul(
        ["Carga geral, com forte localidade temporal: **LRU**.", "General workload with strong temporal locality: **LRU**."],
        ["Popularidade estável, com poucos itens dominando e varreduras ocasionais: **LFU** ou **TinyLFU**.", "Stable popularity, a few items dominating and occasional scans: **LFU** or **TinyLFU**."],
        ["Carga que muda de padrão com frequência e você não quer ajustar à mão: **ARC** ou **W-TinyLFU**.", "A workload that often changes pattern and you do not want to tune by hand: **ARC** or **W-TinyLFU**."],
        ["Dados com validade natural: acrescente **TTL** à política escolhida.", "Data with natural validity: add a **TTL** to the chosen policy."],
        ["Quando o custo importa mais que a precisão (cache de hardware, tabelas pequenas): **aleatória** ou **FIFO**.", "When cost matters more than precision (hardware caches, small tables): **random** or **FIFO**."],
      ),
      p(["Meça com tráfego real ou com um *replay* do log de acessos. A diferença entre políticas depende muito da forma da carga, e a ordem de qualidade mostrada na literatura nem sempre se mantém no seu sistema.", "Measure with real traffic or a replay of the access log. The difference between policies depends heavily on the shape of the workload, and the quality ranking shown in the literature does not always hold in your system."]),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Esquecer o `maxmemory` no Redis e deixar o processo crescer até ser morto pelo sistema operacional.", "Forgetting `maxmemory` in Redis and letting the process grow until the operating system kills it."],
        ["Limitar o cache por número de itens quando os valores têm tamanhos muito diferentes: poucos itens grandes consomem toda a memória.", "Limiting the cache by item count when values vary widely in size: a few large items consume all the memory."],
        ["Não considerar a varredura: um job que lê toda a tabela pode esvaziar um cache LRU; evite passar esses acessos pelo cache.", "Ignoring the scan: a job that reads the whole table can empty an LRU cache; avoid routing those accesses through the cache."],
        ["Usar uma política `volatile-*` sem colocar TTL nas chaves, o que equivale a não ter remoção.", "Using a `volatile-*` policy without putting TTLs on the keys, which amounts to having no eviction."],
        ["Confundir remoção por pressão de memória com expiração por TTL: são mecanismos diferentes e as duas métricas precisam ser acompanhadas.", "Confusing eviction under memory pressure with TTL expiry: they are different mechanisms and both metrics must be tracked."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["A política de remoção escolhe quem sai quando o cache enche e afeta diretamente a taxa de acerto.", "The eviction policy chooses who leaves when the cache fills up and directly affects the hit ratio."],
        ["LRU privilegia recência e é o padrão; LFU privilegia frequência; FIFO, MRU e aleatória são simples e de uso específico.", "LRU favors recency and is the default; LFU favors frequency; FIFO, MRU and random are simple and for specific use."],
        ["ARC e TinyLFU combinam recência e frequência e resistem a varreduras.", "ARC and TinyLFU combine recency and frequency and resist scans."],
        ["O LRU de O(1) usa mapa e lista duplamente encadeada.", "O(1) LRU uses a map and a doubly linked list."],
        ["No Redis, `maxmemory` mais `maxmemory-policy` (tipicamente `allkeys-lru` ou `allkeys-lfu`) definem o comportamento.", "In Redis, `maxmemory` plus `maxmemory-policy` (typically `allkeys-lru` or `allkeys-lfu`) define the behavior."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Por que o LRU usa lista duplamente encadeada?** Para remover um nó do meio e movê-lo para a frente em O(1), o que exige acesso ao nó anterior e ao seguinte.", "**Why does LRU use a doubly linked list?** To remove a node from the middle and move it to the front in O(1), which requires access to the previous and next nodes."],
        ["**LRU ou LFU?** LRU se o interesse muda com o tempo; LFU se alguns itens são populares de forma duradoura. Na dúvida, comece com LRU e meça.", "**LRU or LFU?** LRU if interest shifts over time; LFU if some items are durably popular. When unsure, start with LRU and measure."],
        ["**O Redis implementa LRU exato?** Não, usa amostragem; aumentar `maxmemory-samples` aproxima do exato.", "**Does Redis implement exact LRU?** No, it uses sampling; raising `maxmemory-samples` gets closer to exact."],
        ["**Remoção e invalidação são a mesma coisa?** Não. Invalidar é remover porque o dado ficou velho; remover é abrir espaço, mesmo com o dado ainda válido.", "**Are eviction and invalidation the same thing?** No. Invalidating removes because the data went stale; evicting makes room, even with the data still valid."],
      ),
      tip(["Se a taxa de acerto é baixa mesmo com boa política, o problema raramente é o algoritmo: o cache pode estar pequeno demais para o conjunto de trabalho, ou o acesso não ter localidade.", "If the hit ratio is low even with a good policy, the problem is rarely the algorithm: the cache may be too small for the working set, or the access pattern may lack locality."]),
    ] },
  { id: "cache-frio-e-quente", section: "cache", level: 2, icon: "device_thermostat", minutes: 13,
    title: ["Cache frio e cache quente", "Cold and warm cache"],
    summary: ["O que acontece com um cache vazio, como aquecê-lo e como medir hit ratio, eviction e latência.", "What happens with an empty cache, how to warm it and how to measure hit ratio, eviction and latency."],
    body: [
      p(["Um cache só ajuda quando tem o que responder. Logo após ser criado, reiniciado ou limpo, ele está **vazio**: todo pedido erra e vai à fonte original. Esse estado é o **cache frio** (*cold cache*). Conforme os pedidos chegam, as entradas se acumulam, as falhas diminuem e a taxa de acerto sobe, até se estabilizar. Quando o conjunto de itens mais pedidos já está na memória, diz-se que o cache está **quente** (*hot* ou *warm*). O intervalo entre os dois estados é o **tempo de aquecimento**.", "A cache only helps when it has something to answer with. Right after being created, restarted or cleared, it is **empty**: every request misses and goes to the original source. This state is the **cold cache**. As requests arrive, entries accumulate, misses drop and the hit ratio rises until it levels off. When the set of most requested items is already in memory, the cache is said to be **hot** or **warm**. The interval between the two states is the **warm-up time**."]),
      p(["O problema é que a fonte original foi dimensionada contando com o cache. Se 95% das leituras eram absorvidas por ele, o banco aguenta apenas os 5% restantes. Em um cache frio, ele recebe 100% de uma vez e pode saturar, o que aumenta a latência, causa *timeouts*, gera novas tentativas dos clientes, aumenta ainda mais a carga e impede que o cache encha porque as próprias requisições que o encheriam estão falhando. É um ciclo vicioso conhecido como falha em cascata.", "The problem is that the original source was sized counting on the cache. If 95% of reads were absorbed by it, the database only handles the remaining 5%. With a cold cache it receives 100% at once and can saturate, which increases latency, causes timeouts, triggers client retries, raises the load even more and prevents the cache from filling because the very requests that would fill it are failing. It is a vicious circle known as cascading failure."]),
      h(["Quando o cache fica frio", "When the cache goes cold"]),
      ul(
        ["**Deploy ou reinício** de instâncias com cache em processo: cada nova instância nasce vazia, e um *rolling restart* esvazia todas em sequência.", "**Deploy or restart** of instances with an in-process cache: each new instance is born empty, and a rolling restart empties them all in sequence."],
        ["**Failover** do cache distribuído: a réplica promovida pode não ter tudo, e uma réplica criada do zero começa vazia.", "**Failover** of a distributed cache: the promoted replica may not have everything, and a replica created from scratch starts empty."],
        ["**Mudança no cluster**: adicionar ou remover nós com hash ingênuo esvazia boa parte das chaves; com hash consistente, apenas uma fração.", "**Cluster change**: adding or removing nodes with naive hashing empties much of the keys; with consistent hashing, only a fraction."],
        ["**Mudança de formato de chave ou de versão**: invalida tudo de uma vez, por intenção ou por descuido.", "**Key format or version change**: invalidates everything at once, deliberately or by accident."],
        ["**Novo ambiente ou região**: a segunda região, o ambiente de testes de carga, a CDN recém-ativada.", "**New environment or region**: the second region, the load-test environment, the newly enabled CDN."],
        ["**Expiração em massa**: muitas chaves com o mesmo TTL vencendo juntas esvaziam o cache de forma parcial.", "**Mass expiry**: many keys with the same TTL expiring together empty the cache partially."],
        ["**Horários de baixa**: à noite o cache perde as entradas por TTL ou remoção, e o primeiro pico da manhã o encontra frio.", "**Off-peak hours**: at night the cache loses entries to TTL or eviction, and the first morning spike finds it cold."],
      ),
      fig(["Aquecimento: carga no banco ao longo do tempo", "Warm-up: database load over time"],
        [[node("u", ["Usuários", "Users"], "client")], [node("lb", ["Aplicação", "Application"], "service")], [node("c", ["Cache (vazio no início)", "Cache (empty at first)"], "cache")], [node("w", ["Aquecedor (warm-up)", "Warm-up job"], "queue"), node("db", ["Banco", "Database"], "data")]],
        [edge("u", "lb"), edge("lb", "c", ["1 busca", "1 lookup"]), edge("lb", "db", ["2 miss (cache frio)", "2 miss (cold cache)"], { dashed: true }), edge("w", "c", ["pré-carga", "preload"]), edge("w", "db", ["lê dados quentes", "reads hot data"], { dashed: true })]),
      h(["Técnicas de aquecimento", "Warm-up techniques"]),
      h(["Pré-carregamento (preload)", "Preloading"]),
      p(["Antes de a instância receber tráfego, um processo carrega no cache as chaves mais prováveis. A lista pode vir de uma consulta fixa (os mil produtos mais vendidos, a configuração inteira, a tabela de países), de estatísticas guardadas (as chaves mais lidas na véspera) ou de uma exportação do cache antigo. Em *deploys*, a sequência típica é: subir a nova versão, aquecer, passar no *health check* e só então entrar no balanceador.", "Before the instance receives traffic, a process loads the most likely keys into the cache. The list can come from a fixed query (the thousand best sellers, the whole configuration, the countries table), from stored statistics (the keys most read the day before) or from an export of the old cache. In deploys, the typical sequence is: start the new version, warm up, pass the health check and only then join the load balancer."]),
      code(`// warm-up before joining the load balancer
async function warmUp(): Promise<void> {
  // 1. keys that were hottest yesterday, recorded by a metrics job
  const hotIds: string[] = await metrics.topProducts({ days: 1, limit: 5000 });

  // 2. load in small batches to avoid hammering the database
  const BATCH = 100;
  for (let i = 0; i < hotIds.length; i += BATCH) {
    const rows = await db.products.findMany(hotIds.slice(i, i + BATCH));
    await Promise.all(
      rows.map((r) => cache.set("product:" + r.id, JSON.stringify(r), { ttl: 600 + Math.random() * 120 })),
    );
    await sleep(50); // throttle: warming must not hurt production
  }
}

// readiness: only report ready when warm (or after a timeout)
app.get("/ready", (_req, res) => res.status(warmed ? 200 : 503).end());`),
      h(["Aquecimento por tráfego espelhado e por cópia", "Warming by shadow traffic and by copy"]),
      p(["Duas alternativas dispensam listas manuais. No **tráfego espelhado** (*shadow traffic*), uma fração do tráfego real é duplicada para a instância nova, cuja resposta é descartada; ela serve só para populá-la. Na **cópia do cache**, o novo nó recebe os dados de um nó existente (o Redis faz isso ao sincronizar uma réplica a partir do mestre, com RDB e fluxo de comandos) ou de um arquivo de *snapshot*. A persistência do Redis (RDB ou AOF) também acelera o retorno após um reinício, pois ele recarrega os dados do disco em vez de começar vazio.", "Two alternatives dispense with manual lists. With **shadow traffic**, a fraction of real traffic is duplicated to the new instance, whose response is discarded; it serves only to populate it. With **cache copy**, the new node receives data from an existing node (Redis does this when syncing a replica from the master, with RDB and the command stream) or from a snapshot file. Redis persistence (RDB or AOF) also speeds recovery after a restart, as it reloads data from disk instead of starting empty."]),
      h(["Aquecimento gradual do tráfego", "Gradual traffic ramp-up"]),
      p(["Em vez de aquecer antes, aumenta-se o tráfego da instância nova aos poucos: 1%, 5%, 25%, 100%. Cada passo dá tempo para o cache encher com o pouco que chega, e o banco nunca vê um salto. Balanceadores e malhas de serviço oferecem esse recurso como *slow start* ou *warm-up duration*. Combina bem com *canary deploys*. Um cuidado complementar é limitar a concorrência das cargas no banco (*bulkheads*, filas, limitação de taxa) para que, mesmo no pior caso, ele não caia.", "Instead of warming first, the new instance's traffic is raised gradually: 1%, 5%, 25%, 100%. Each step gives the cache time to fill with the little that arrives, and the database never sees a jump. Load balancers and service meshes offer this as *slow start* or *warm-up duration*. It pairs well with canary deploys. A complementary precaution is to limit load concurrency on the database (bulkheads, queues, rate limiting) so that even in the worst case it does not fall."]),
      table([["Técnica", "Technique"], ["Como funciona", "How it works"], ["Ponto forte", "Strength"], ["Limitação", "Limitation"]],
        [["Pré-carga de lista", "List preload"], ["Carrega chaves conhecidas antes do tráfego", "Loads known keys before traffic"], ["Previsível e controlável", "Predictable and controllable"], ["A lista pode ficar desatualizada", "The list can go stale"]],
        [["Tráfego espelhado", "Shadow traffic"], ["Duplica pedidos reais à instância nova", "Duplicates real requests to the new instance"], ["Reflete o uso real", "Reflects real usage"], ["Dobra parte da carga; cuidado com escritas", "Doubles part of the load; care with writes"]],
        [["Cópia ou snapshot", "Copy or snapshot"], ["Replica dados de outro nó ou do disco", "Replicates data from another node or from disk"], ["Rápido e completo", "Fast and complete"], ["Dados podem estar levemente velhos", "Data may be slightly stale"]],
        [["Rampa gradual", "Gradual ramp-up"], ["Aumenta a fração de tráfego", "Raises the traffic fraction"], ["Simples, sem código extra", "Simple, no extra code"], ["Demora para atingir 100%", "Takes time to reach 100%"]],
        [["Stale-while-revalidate", "Stale-while-revalidate"], ["Serve velho e renova ao fundo", "Serves stale and renews in the background"], ["Esconde falhas do usuário", "Hides misses from the user"], ["Não ajuda se o cache está vazio", "Does not help if the cache is empty"]],
      ),
      h(["Lidando com cache vazio: defesa em profundidade", "Dealing with an empty cache: defense in depth"]),
      p(["Mesmo com aquecimento, algum dia o cache estará vazio. Por isso o sistema deve sobreviver a isso. As proteções se somam: **single flight** ou lock por chave, para que mil pedidos pela mesma chave gerem uma só consulta ao banco; **TTLs com jitter**, para evitar expiração em massa; **limitação de concorrência** nas consultas ao banco; **circuit breaker** e *backpressure*, que recusam carga em vez de deixar o banco desabar; e **degradação controlada**, como servir dados parciais ou páginas simplificadas durante a recuperação. Em um failover planejado, prefira a promoção de uma réplica já sincronizada e evite reiniciar todos os nós de cache ao mesmo tempo.", "Even with warm-up, some day the cache will be empty. So the system must survive it. The protections add up: **single flight** or a per-key lock, so a thousand requests for the same key produce one database query; **TTLs with jitter**, to avoid mass expiry; **concurrency limits** on database queries; **circuit breakers** and backpressure, which refuse load instead of letting the database collapse; and **graceful degradation**, such as serving partial data or simplified pages during recovery. In a planned failover, prefer promoting an already synchronized replica and avoid restarting all cache nodes at the same time."]),
      h(["Métricas que importam", "Metrics that matter"]),
      ul(
        ["**Hit ratio (taxa de acerto)**: acertos / (acertos + falhas). No Redis, `keyspace_hits` e `keyspace_misses` em `INFO stats`. Acompanhe a curva ao longo do tempo: uma queda súbita é o sintoma de cache frio, de mudança de chaves ou de carga nova.", "**Hit ratio**: hits / (hits + misses). In Redis, `keyspace_hits` and `keyspace_misses` in `INFO stats`. Watch the curve over time: a sudden drop is the symptom of a cold cache, a key change or a new load."],
        ["**Evictions**: o número de chaves removidas por falta de memória (`evicted_keys`). Valores altos e constantes indicam cache pequeno para o conjunto de trabalho; um pico súbito sugere uma varredura ou chaves grandes.", "**Evictions**: the number of keys removed for lack of memory (`evicted_keys`). High and constant values indicate a cache too small for the working set; a sudden spike suggests a scan or large keys."],
        ["**Latência**: p50, p95 e p99 das leituras do cache e, separadamente, das leituras que vão ao banco. A média esconde as caudas.", "**Latency**: p50, p95 and p99 of cache reads and, separately, of reads that go to the database. The average hides the tails."],
        ["**Uso de memória e fragmentação** (`used_memory`, `mem_fragmentation_ratio`), **número de chaves** e **conexões**.", "**Memory usage and fragmentation** (`used_memory`, `mem_fragmentation_ratio`), **key count** and **connections**."],
        ["**Carga no banco** (consultas por segundo, conexões ativas): é o que o cache existe para proteger.", "**Database load** (queries per second, active connections): it is what the cache exists to protect."],
        ["**Expirações** (`expired_keys`) e tempo de vida médio das entradas, para calibrar TTLs.", "**Expirations** (`expired_keys`) and average entry lifetime, to calibrate TTLs."],
      ),
      code(`# quick Redis check
redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses|evicted_keys|expired_keys"

# hit ratio = hits / (hits + misses)
# example: hits=950000 misses=50000  ->  0.95 (95%)

# alert ideas
#  hit ratio < 85% for 10 min      -> cache cold or keys changed
#  evicted_keys rate rising        -> cache too small for the working set
#  p99 read latency > 5 ms         -> network, big keys or slow commands`),
      h(["Como pensar no tamanho do cache", "How to think about cache size"]),
      p(["O conjunto de trabalho (*working set*) é o volume de dados que a carga realmente reutiliza em uma janela de tempo. Se o cache o comporta, a taxa de acerto é alta e estável; se não, as remoções são constantes e a taxa cai. A relação não é linear: aumentar a memória de 1 GB para 2 GB pode trazer muito, e de 20 GB para 21 GB, quase nada, pois os itens adicionais são os de cauda longa, raramente pedidos. Uma forma prática é simular com o log de acessos: calcule a taxa de acerto para vários tamanhos e escolha o ponto em que a curva achata.", "The working set is the volume of data the workload actually reuses within a time window. If the cache holds it, the hit ratio is high and stable; if not, evictions are constant and the ratio falls. The relation is not linear: raising memory from 1 GB to 2 GB can bring a lot, and from 20 GB to 21 GB almost nothing, since the extra items are the long tail, rarely requested. A practical way is to simulate with the access log: compute the hit ratio for several sizes and pick the point where the curve flattens."]),
      h(["Vantagens e desvantagens do aquecimento", "Pros and cons of warming"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Drawbacks"]],
        [["Evita picos de latência e de carga no banco após deploys", "Avoids latency and database load spikes after deploys"], ["Adiciona código, jobs e listas para manter", "Adds code, jobs and lists to maintain"]],
        [["Lançamentos mais seguros e previsíveis", "Safer and more predictable launches"], ["Pode carregar dados que ninguém pedirá", "May load data nobody will request"]],
        [["Experiência estável logo no início", "Stable experience right from the start"], ["Aquecer demais compete com o tráfego real", "Warming too hard competes with real traffic"]],
      ),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      p(["O aquecimento vale a pena quando o banco depende do cache para sobreviver, quando o sistema tem picos programados (um evento, uma campanha, a abertura do pregão) e quando reinícios são frequentes. Em sistemas pequenos, com banco folgado, deixar o cache aquecer sozinho pelo tráfego é mais simples e suficiente. Evite aquecer enormes volumes por precaução: o custo em leituras no banco e em memória pode superar o benefício, sobretudo se a cauda longa não é reutilizada.", "Warming pays off when the database depends on the cache to survive, when the system has scheduled spikes (an event, a campaign, a market opening) and when restarts are frequent. In small systems with a roomy database, letting the cache warm by itself from traffic is simpler and enough. Avoid warming huge volumes as a precaution: the cost in database reads and memory can exceed the benefit, especially if the long tail is not reused."]),
      h(["Casos reais", "Real-world cases"]),
      ul(
        ["**Promoções e eventos**: varejistas aquecem páginas e preços dos itens em destaque antes do início de uma liquidação.", "**Sales and events**: retailers warm pages and prices of featured items before a sale starts."],
        ["**Bancos de dados**: alguns oferecem recursos para recarregar o *buffer pool* após reinício (o MySQL InnoDB pode salvar e restaurar a lista de páginas quentes), evitando consultas lentas pós-restart.", "**Databases**: some offer features to reload the buffer pool after a restart (MySQL InnoDB can save and restore the list of hot pages), avoiding slow post-restart queries."],
        ["**CDN**: provedores permitem pré-carregar (*prefetch*) URLs na borda antes de um lançamento, como uma nova temporada de série ou um jogo.", "**CDN**: providers let you prefetch URLs at the edge before a launch, such as a new season of a series or a game."],
        ["**Funções serverless**: o equivalente é a *partida a frio* (*cold start*), que se mitiga com instâncias provisionadas e reuso de conexões e de dados em memória.", "**Serverless functions**: the equivalent is the *cold start*, mitigated with provisioned instances and reuse of connections and in-memory data."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Reiniciar todos os nós de cache de uma vez em uma manutenção.", "Restarting all cache nodes at once during maintenance."],
        ["Aquecer sem limitar a taxa e derrubar o banco com o próprio *warm-up*.", "Warming without a rate limit and taking the database down with the warm-up itself."],
        ["Colocar a instância no balanceador antes do fim do aquecimento.", "Putting the instance in the load balancer before warm-up ends."],
        ["Medir só a média de latência e não ver o p99 alto das falhas.", "Measuring only average latency and missing the high p99 of misses."],
        ["Não testar o cenário de cache vazio em testes de carga: ele só é descoberto na pior hora.", "Not testing the empty-cache scenario in load tests: it is only discovered at the worst time."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Cache frio erra tudo e empurra a carga para a fonte; cache quente absorve a maior parte das leituras.", "A cold cache misses everything and pushes the load to the source; a hot cache absorbs most reads."],
        ["Deploys, failovers, mudanças de cluster e expirações em massa produzem cache frio.", "Deploys, failovers, cluster changes and mass expiry produce a cold cache."],
        ["Aqueça com pré-carga, tráfego espelhado, cópia de snapshot ou rampa gradual de tráfego.", "Warm with preloading, shadow traffic, snapshot copy or gradual traffic ramp-up."],
        ["Proteja o banco com single flight, jitter, limites de concorrência e circuit breaker.", "Protect the database with single flight, jitter, concurrency limits and circuit breakers."],
        ["Acompanhe hit ratio, evictions, latência por percentil e carga no banco.", "Track hit ratio, evictions, latency by percentile and database load."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Quanto tempo leva para o cache esquentar?** Depende do tráfego e do conjunto de trabalho: de segundos em sistemas muito acessados a horas em sistemas de cauda longa.", "**How long does it take for a cache to warm up?** It depends on traffic and working set: from seconds in busy systems to hours in long-tail systems."],
        ["**Persistir o Redis em disco ajuda?** Ajuda a voltar mais rápido após reinício, pois recarrega os dados, mas não substitui o banco como fonte da verdade.", "**Does persisting Redis to disk help?** It helps return faster after a restart, since it reloads the data, but it does not replace the database as the source of truth."],
        ["**Cache quente é sempre melhor?** Em desempenho, sim, mas só deve guardar o que é reutilizado; encher o cache de itens raros expulsa os valiosos.", "**Is a hot cache always better?** In performance, yes, but it should only hold what is reused; filling the cache with rare items pushes out valuable ones."],
        ["**Como testar o cenário de cache frio?** Esvazie o cache em um ambiente de teste sob carga realista e observe a latência e a carga do banco.", "**How do I test the cold-cache scenario?** Empty the cache in a test environment under realistic load and watch latency and database load."],
      ),
      tip(["Faça o exercício ao menos uma vez: desligue o cache em um ambiente de teste com carga real. O que acontecer é o seu plano de recuperação de verdade, e é melhor descobri-lo antes de um incidente.", "Do the exercise at least once: turn off the cache in a test environment under real load. What happens is your actual recovery plan, and it is better to find out before an incident."]),
    ] },
  { id: "armazenamento-e-cdn", section: "cache", level: 1, icon: "cloud_upload", minutes: 14,
    title: ["Armazenamento de objetos e CDN", "Object storage and CDN"],
    summary: ["Onde guardar arquivos grandes e como entregá-los: object storage, CDN pull e push, origin shield e cabeçalhos de cache.", "Where to keep large files and how to deliver them: object storage, pull and push CDN, origin shield and cache headers."],
    body: [
      p(["Imagens, vídeos, documentos, arquivos de código JavaScript, backups e logs compartilham uma característica: são **blobs**, sequências de bytes que raramente mudam depois de criadas e que não precisam de consulta relacional. Guardá-los no banco de dados é caro e lento, e servi-los pelos servidores de aplicação ocupa conexões e banda que deveriam atender a lógica do negócio. A solução consolidada tem duas peças que se complementam: o **armazenamento de objetos**, que guarda os arquivos de forma barata e durável, e a **CDN** (*Content Delivery Network*), que os entrega perto do usuário.", "Images, videos, documents, JavaScript files, backups and logs share a trait: they are **blobs**, byte sequences that rarely change after creation and need no relational queries. Keeping them in the database is expensive and slow, and serving them through application servers occupies connections and bandwidth that should serve business logic. The established solution has two complementary pieces: **object storage**, which keeps files cheaply and durably, and the **CDN** (*Content Delivery Network*), which delivers them near the user."]),
      h(["Armazenamento de objetos", "Object storage"]),
      p(["Um *object storage* organiza dados como **objetos** dentro de **buckets**. Cada objeto tem uma chave única (como `fotos/2026/praia.jpg`), o conteúdo, metadados (tipo de conteúdo, datas, rótulos próprios) e é acessado por uma API HTTP simples: `PUT` para gravar, `GET` para ler, `DELETE` para remover, `LIST` para enumerar por prefixo. Não existe hierarquia real de pastas, apenas chaves cujo prefixo se parece com um caminho. Exemplos são o Amazon S3, o Google Cloud Storage, o Azure Blob Storage e, em instalação própria, o MinIO e o Ceph.", "An *object storage* organizes data as **objects** inside **buckets**. Each object has a unique key (like `photos/2026/beach.jpg`), the content, metadata (content type, dates, custom labels) and is accessed through a simple HTTP API: `PUT` to write, `GET` to read, `DELETE` to remove, `LIST` to enumerate by prefix. There is no real folder hierarchy, only keys whose prefix looks like a path. Examples are Amazon S3, Google Cloud Storage, Azure Blob Storage and, self-hosted, MinIO and Ceph."]),
      ul(
        ["**Durabilidade altíssima**: os dados são replicados em vários dispositivos e zonas; o S3 Standard declara 99,999999999% (onze noves) de durabilidade anual de objetos.", "**Very high durability**: data is replicated across several devices and zones; S3 Standard states 99.999999999% (eleven nines) annual object durability."],
        ["**Escala praticamente ilimitada** e custo por gigabyte muito menor que o de discos de bancos de dados.", "**Practically unlimited scale** and a cost per gigabyte far lower than database disks."],
        ["**Classes de armazenamento**: camadas quentes, frias e de arquivamento, com preços decrescentes e acesso mais lento e caro, e regras de ciclo de vida que movem ou apagam objetos por idade.", "**Storage classes**: hot, cold and archive tiers with decreasing prices and slower, costlier access, and lifecycle rules that move or delete objects by age."],
        ["**Objetos imutáveis na prática**: não se edita um trecho do arquivo; grava-se uma nova versão inteira. Muitos serviços oferecem *versioning* para guardar versões anteriores.", "**Practically immutable objects**: you do not edit part of a file; you write a whole new version. Many services offer versioning to keep previous versions."],
        ["**Upload direto**: o cliente envia o arquivo ao bucket por uma **URL pré-assinada**, sem passar pelo servidor de aplicação, e arquivos grandes usam envio em partes (*multipart*).", "**Direct upload**: the client sends the file to the bucket via a **presigned URL**, without passing through the application server, and large files use multipart upload."],
      ),
      code(`// presigned upload URL with the AWS SDK v3 (TypeScript)
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "sa-east-1" });

export async function createUploadUrl(userId: string, fileName: string) {
  const key = "uploads/" + userId + "/" + crypto.randomUUID() + "-" + fileName;
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: "my-assets", Key: key, ContentType: "image/jpeg" }),
    { expiresIn: 300 }, // valid for 5 minutes
  );
  return { url, key }; // the browser PUTs the file straight to the bucket
}`),
      h(["Por que uma CDN", "Why a CDN"]),
      p(["Mesmo com o arquivo bem guardado, entregá-lo tem custo: um usuário em Recife puxando uma imagem de um bucket em Virgínia enfrenta uns 120 a 180 ms de ida e volta antes do primeiro byte, e cada nova conexão TCP e TLS repete esse custo. A luz em fibra tem limite de velocidade; só se reduz a latência aproximando o conteúdo do usuário. Uma **CDN** é uma rede de servidores de cache espalhados por muitas cidades, chamados **pontos de presença** (*PoPs*) ou *edge locations*. O usuário é direcionado ao PoP mais próximo (por DNS ou por *anycast*), que responde do cache local; se não tiver, busca na origem, guarda e entrega.", "Even with the file well stored, delivering it has a cost: a user in Recife pulling an image from a bucket in Virginia faces about 120 to 180 ms round trip before the first byte, and each new TCP and TLS connection repeats that cost. Light in fiber has a speed limit; latency only falls by bringing content closer to the user. A **CDN** is a network of cache servers spread over many cities, called **points of presence** (*PoPs*) or edge locations. The user is directed to the nearest PoP (by DNS or *anycast*), which answers from its local cache; if it has nothing, it fetches from the origin, stores and delivers."]),
      p(["Os benefícios vão além da latência: a origem recebe uma fração do tráfego, o que reduz custo e permite sobreviver a picos; a banda de saída da origem cai; as conexões entre usuário e PoP são curtas e reaproveitadas; e a CDN absorve parte dos ataques de negação de serviço. Muitas CDNs oferecem ainda TLS, compressão (gzip, Brotli), conversão de formatos de imagem, WAF e funções na borda.", "The benefits go beyond latency: the origin receives a fraction of the traffic, which cuts cost and lets it survive spikes; the origin's egress bandwidth drops; connections between user and PoP are short and reused; and the CDN absorbs part of denial-of-service attacks. Many CDNs also offer TLS, compression (gzip, Brotli), image format conversion, WAF and edge functions."]),
      fig(["Caminho de um arquivo com CDN e origin shield", "Path of a file with CDN and origin shield"],
        [[node("u", ["Usuário", "User"], "client")], [node("pop", ["PoP próximo (cache L1)", "Nearby PoP (L1 cache)"], "edge")], [node("sh", ["Origin shield (cache L2)", "Origin shield (L2 cache)"], "cache")], [node("o", ["Origem: bucket ou API", "Origin: bucket or API"], "data")]],
        [edge("u", "pop", ["1 GET", "1 GET"]), edge("pop", "sh", ["2 miss", "2 miss"], { dashed: true }), edge("sh", "o", ["3 miss", "3 miss"], { dashed: true })]),
      h(["Pull e push", "Pull and push"]),
      p(["No modo **pull** (*origin pull*), o conteúdo continua só na origem. Quando o PoP recebe o primeiro pedido de um arquivo, busca na origem, guarda no cache conforme os cabeçalhos e atende os seguintes localmente. É o modo padrão, sem trabalho de publicação: basta apontar a CDN para a origem. O primeiro usuário de cada PoP paga a falha, e a origem precisa estar acessível sempre. No modo **push**, o dono do conteúdo **envia** os arquivos às CDNs ou aos PoPs antecipadamente, gerenciando o que fica lá e por quanto tempo. É útil para arquivos grandes e previsíveis (um instalador, a nova temporada de uma série), em que se quer que o primeiro usuário já encontre tudo pronto, e quando a origem tem pouca banda. O custo é a lógica de publicação, a ocupação de espaço com itens que ninguém lerá e o risco de esquecer de remover conteúdo velho.", "In **pull** mode (*origin pull*), content stays only at the origin. When the PoP receives the first request for a file, it fetches from the origin, stores it per the headers and serves the following ones locally. It is the default mode, with no publishing work: just point the CDN at the origin. The first user at each PoP pays the miss, and the origin must always be reachable. In **push** mode, the content owner **uploads** the files to the CDNs or PoPs in advance, managing what stays there and for how long. It is useful for large, predictable files (an installer, a new season of a series), where you want the first user to find everything ready, and when the origin has little bandwidth. The cost is the publishing logic, space occupied by items nobody will read and the risk of forgetting to remove old content."]),
      table([["Aspecto", "Aspect"], ["Pull", "Pull"], ["Push", "Push"]],
        [["Quem coloca o conteúdo na borda", "Who puts content on the edge"], ["A CDN, sob demanda", "The CDN, on demand"], ["O dono, por antecipação", "The owner, in advance"]],
        [["Primeira requisição", "First request"], ["Mais lenta (falha)", "Slower (miss)"], ["Já encontra o arquivo", "Already finds the file"]],
        [["Esforço operacional", "Operational effort"], ["Baixo", "Low"], ["Maior: publicar e limpar", "Higher: publish and clean up"]],
        [["Espaço usado na borda", "Edge space used"], ["Só o que foi pedido", "Only what was requested"], ["Tudo o que foi enviado", "Everything that was sent"]],
        [["Melhor para", "Best for"], ["Sites, APIs, imagens, a maioria dos casos", "Sites, APIs, images, most cases"], ["Arquivos grandes e lançamentos previstos", "Large files and planned launches"]],
      ),
      h(["Origin shield e a hierarquia de cache", "Origin shield and the cache hierarchy"]),
      p(["Uma CDN tem centenas de PoPs, e cada um com cache independente. Sem proteção, um arquivo novo e popular gera uma falha em cada PoP, e a origem recebe centenas de pedidos idênticos. O **origin shield** (ou *tiered cache*) adiciona uma camada intermediária: os PoPs, ao errar, consultam um ou poucos PoPs designados como escudo, e só estes falam com a origem. A origem passa a ver cada objeto uma vez, não uma por PoP. O custo é uma latência um pouco maior nas falhas e, em alguns provedores, tarifa extra. O recurso é essencial quando a origem é fraca ou cobrada por banda de saída. Outra proteção complementar é o **request collapsing** (ou *coalescing*): quando vários pedidos pelo mesmo objeto chegam ao PoP durante uma falha, só um segue para a origem e os demais esperam o resultado.", "A CDN has hundreds of PoPs, each with its own independent cache. Without protection, a new and popular file creates a miss at every PoP, and the origin receives hundreds of identical requests. The **origin shield** (or *tiered cache*) adds an intermediate layer: PoPs, on a miss, query one or a few PoPs designated as the shield, and only those talk to the origin. The origin now sees each object once, not once per PoP. The cost is slightly higher latency on misses and, with some providers, an extra fee. The feature is essential when the origin is weak or billed for egress bandwidth. Another complementary protection is **request collapsing** (or coalescing): when several requests for the same object reach the PoP during a miss, only one goes on to the origin and the others wait for the result."]),
      h(["Cabeçalhos HTTP que controlam o cache", "HTTP headers that control caching"]),
      p(["Quem decide quanto tempo e onde uma resposta pode ser guardada é a origem, por meio de cabeçalhos HTTP. O mesmo conjunto de cabeçalhos orienta o cache do navegador, o de proxies e o da CDN.", "Whoever decides how long and where a response can be stored is the origin, through HTTP headers. The same set of headers guides the browser cache, proxies and the CDN."]),
      code(`HTTP/1.1 200 OK
Content-Type: image/webp
Cache-Control: public, max-age=31536000, immutable
ETag: "9f2c6a41"
Last-Modified: Tue, 03 Mar 2026 10:12:00 GMT
Vary: Accept-Encoding
Content-Length: 48211`),
      ul(
        ["**`Cache-Control`** é o principal. `max-age=N` define por quantos segundos a resposta é fresca; `s-maxage=N` vale só para caches compartilhados (CDN), sobrepondo o `max-age` neles; `public` permite que qualquer cache guarde; `private` restringe ao navegador do usuário (respostas personalizadas); `no-store` proíbe guardar (dados sensíveis); `no-cache` permite guardar, mas exige **revalidar** antes de usar; `immutable` informa que o conteúdo nunca mudará durante a validade; `stale-while-revalidate=N` permite servir a cópia vencida enquanto se renova em segundo plano; `stale-if-error=N` permite servi-la se a origem falhar.", "**`Cache-Control`** is the main one. `max-age=N` sets for how many seconds the response is fresh; `s-maxage=N` applies only to shared caches (CDN), overriding `max-age` there; `public` lets any cache store it; `private` restricts it to the user's browser (personalized responses); `no-store` forbids storing (sensitive data); `no-cache` allows storing but requires **revalidating** before use; `immutable` states the content will never change during its validity; `stale-while-revalidate=N` allows serving the expired copy while renewing in the background; `stale-if-error=N` allows serving it if the origin fails."],
        ["**`ETag`** é um identificador da versão do conteúdo (geralmente um hash). Depois de a cópia vencer, o cliente pergunta com `If-None-Match: \"9f2c6a41\"`; se nada mudou, a origem responde `304 Not Modified`, sem corpo, e o cache renova a validade sem baixar o arquivo de novo.", "**`ETag`** is an identifier of the content version (usually a hash). After the copy expires, the client asks with `If-None-Match: \"9f2c6a41\"`; if nothing changed, the origin answers `304 Not Modified`, with no body, and the cache renews validity without downloading the file again."],
        ["**`Last-Modified`** faz o mesmo por data: o cliente envia `If-Modified-Since` e recebe `304` se não houve alteração. É menos preciso que o ETag (resolução de segundos), mas serve como alternativa.", "**`Last-Modified`** does the same by date: the client sends `If-Modified-Since` and receives `304` if nothing changed. It is less precise than ETag (one-second resolution) but works as an alternative."],
        ["**`Vary`** diz de quais cabeçalhos do pedido a resposta depende. Com `Vary: Accept-Encoding`, o cache guarda uma cópia para gzip e outra para Brotli. Cuidado: `Vary: Cookie` ou `Vary: User-Agent` multiplicam as variantes e destroem a taxa de acerto.", "**`Vary`** says which request headers the response depends on. With `Vary: Accept-Encoding`, the cache stores one copy for gzip and another for Brotli. Beware: `Vary: Cookie` or `Vary: User-Agent` multiplies variants and destroys the hit ratio."],
        ["**`Age`** informa há quantos segundos a resposta está no cache, e muitas CDNs acrescentam cabeçalhos próprios (como `X-Cache: HIT` ou `CF-Cache-Status`) úteis para depuração.", "**`Age`** tells for how many seconds the response has been in the cache, and many CDNs add their own headers (such as `X-Cache: HIT` or `CF-Cache-Status`) useful for debugging."],
      ),
      code(`# revalidation round trip
GET /logo.png HTTP/1.1
If-None-Match: "9f2c6a41"

HTTP/1.1 304 Not Modified
ETag: "9f2c6a41"
Cache-Control: public, max-age=3600

# typical policies by asset type
index.html        Cache-Control: no-cache                       # always revalidate
app.3f9a1c.js     Cache-Control: public, max-age=31536000, immutable
GET /api/me       Cache-Control: private, no-store
GET /api/catalog  Cache-Control: public, s-maxage=60, stale-while-revalidate=300`),
      h(["Invalidação e versionamento por hash", "Invalidation and hash versioning"]),
      p(["Remover algo dos PoPs (*purge*) é lento e imperfeito: precisa alcançar centenas de servidores, leva de segundos a minutos, e navegadores já com a cópia local não ouvem o *purge* e só voltam à origem quando a validade acabar. A estratégia mais robusta é **não invalidar**: incluir na URL um identificador do conteúdo, normalmente o hash do arquivo (`app.3f9a1c.js`, `logo.9d41.png`), gerado pelo *build*. Se o arquivo muda, a URL muda, e a antiga continua válida para quem ainda a usa. Esses arquivos recebem `max-age` de um ano e `immutable`. Só o HTML, que referencia as URLs, usa validade curta ou `no-cache`, e assim um novo *deploy* propaga as novas versões em segundos. Para o que não dá para versionar, existe o purge por URL, por prefixo ou por **tag** (*surrogate keys*), em que todos os objetos de um produto são marcados e apagados de uma vez.", "Removing something from the PoPs (*purge*) is slow and imperfect: it must reach hundreds of servers, takes seconds to minutes, and browsers that already have the local copy do not hear the purge and only return to the origin when validity ends. The most robust strategy is **not to invalidate**: include in the URL an identifier of the content, usually the file hash (`app.3f9a1c.js`, `logo.9d41.png`), generated by the build. If the file changes, the URL changes, and the old one remains valid for whoever still uses it. These files get a one-year `max-age` and `immutable`. Only the HTML, which references the URLs, uses short validity or `no-cache`, so a new deploy propagates new versions in seconds. For what cannot be versioned there is purge by URL, by prefix or by **tag** (*surrogate keys*), where all objects of a product are tagged and cleared at once."]),
      h(["Vantagens e desvantagens", "Pros and cons"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Drawbacks"]],
        [["Latência baixa para usuários distantes", "Low latency for distant users"], ["Custo de saída de dados por gigabyte, que pode ser relevante", "Per-gigabyte egress cost, which can be significant"]],
        [["Origem protegida de picos e de custo de banda", "Origin protected from spikes and bandwidth cost"], ["Dado velho na borda até o prazo vencer", "Stale data at the edge until the deadline passes"]],
        [["Armazenamento barato, durável e quase infinito", "Cheap, durable and nearly infinite storage"], ["Configuração errada de cabeçalhos vaza conteúdo privado", "Wrong header configuration leaks private content"]],
        [["Mais disponibilidade e resistência a ataques", "More availability and attack resistance"], ["Mais um fornecedor e depuração mais difícil", "One more vendor and harder debugging"]],
      ),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      p(["Use object storage para qualquer arquivo de usuário, mídia, ativo estático, backup e exportação. Use CDN sempre que houver conteúdo cacheável servido a usuários espalhados, especialmente imagens, vídeos, scripts, folhas de estilo, fontes e respostas de API públicas e pouco voláteis. Evite colocar na CDN respostas personalizadas sem `private` ou `Vary` corretos, e não guarde no bucket dados que precisem de consulta, transação ou atualização parcial: para isso, use um banco. Se todos os usuários estão em uma só cidade, perto da origem, o ganho de latência da CDN é pequeno, embora o de capacidade continue.", "Use object storage for any user file, media, static asset, backup and export. Use a CDN whenever there is cacheable content served to scattered users, especially images, videos, scripts, stylesheets, fonts and public, slow-changing API responses. Avoid putting personalized responses in the CDN without correct `private` or `Vary`, and do not keep in the bucket data that needs querying, transactions or partial updates: use a database for that. If all users are in one city, near the origin, the CDN's latency gain is small, although the capacity gain remains."]),
      h(["Casos reais", "Real-world cases"]),
      ul(
        ["**Aplicações web modernas** publicam os arquivos do *build* em um bucket, com nomes com hash, atrás de uma CDN, e só o `index.html` tem validade curta.", "**Modern web apps** publish build files to a bucket, with hashed names, behind a CDN, and only `index.html` has short validity."],
        ["**Redes sociais e marketplaces** guardam fotos originais em object storage e geram versões redimensionadas servidas pela CDN.", "**Social networks and marketplaces** keep original photos in object storage and generate resized versions served by the CDN."],
        ["**Provedores de CDN** conhecidos incluem Cloudflare, Akamai, Amazon CloudFront, Fastly e Google Cloud CDN, cada um com recursos próprios de regras, purge e funções.", "**Well-known CDN providers** include Cloudflare, Akamai, Amazon CloudFront, Fastly and Google Cloud CDN, each with its own rules, purge and function features."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Dar `max-age` longo a um arquivo sem hash no nome e depois não conseguir corrigi-lo para quem já o guardou.", "Giving a long `max-age` to a file without a hash in its name and then being unable to fix it for those who already stored it."],
        ["Cachear na CDN uma resposta com `Set-Cookie` ou dados do usuário, entregando-os a outras pessoas.", "Caching in the CDN a response with `Set-Cookie` or user data, delivering it to other people."],
        ["Deixar o bucket público para facilitar o acesso, em vez de servi-lo só pela CDN ou por URLs assinadas.", "Leaving the bucket public for convenience, instead of serving it only through the CDN or signed URLs."],
        ["Incluir parâmetros de consulta aleatórios ou ordens diferentes na URL, gerando chaves de cache distintas para o mesmo conteúdo.", "Including random query parameters or different orderings in the URL, creating distinct cache keys for the same content."],
        ["Ignorar os custos de saída e de requisições, só percebidos na primeira fatura grande.", "Ignoring egress and request costs, noticed only on the first large bill."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Object storage guarda arquivos de forma durável e barata; a CDN os entrega perto do usuário.", "Object storage keeps files durably and cheaply; the CDN delivers them near the user."],
        ["Pull busca sob demanda; push envia antes. Pull é o padrão.", "Pull fetches on demand; push uploads ahead of time. Pull is the default."],
        ["Origin shield e request collapsing impedem que a origem receba um pedido por PoP.", "Origin shield and request collapsing keep the origin from receiving one request per PoP."],
        ["`Cache-Control`, `ETag`, `Last-Modified` e `Vary` controlam o que é guardado, por quanto tempo e como revalidar.", "`Cache-Control`, `ETag`, `Last-Modified` and `Vary` control what is stored, for how long and how to revalidate."],
        ["Prefira nomes com hash e validade longa a invalidar; mantenha o HTML com validade curta.", "Prefer hashed names and long validity over invalidating; keep HTML with short validity."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Posso usar o bucket diretamente, sem CDN?** Pode, mas cada leitura vem da região do bucket e paga a banda de saída. Para público disperso e arquivos populares, a CDN compensa.", "**Can I use the bucket directly, without a CDN?** You can, but each read comes from the bucket's region and pays egress bandwidth. For a dispersed audience and popular files, the CDN pays off."],
        ["**`no-cache` impede o cache?** Não. Ele permite guardar, mas obriga a revalidar antes de usar; quem proíbe guardar é `no-store`.", "**Does `no-cache` prevent caching?** No. It allows storing but forces revalidation before use; what forbids storing is `no-store`."],
        ["**Qual TTL usar?** Um ano com `immutable` para arquivos com hash; de segundos a minutos para HTML e APIs públicas; `private` ou `no-store` para dados do usuário.", "**Which TTL should I use?** One year with `immutable` for hashed files; seconds to minutes for HTML and public APIs; `private` or `no-store` for user data."],
        ["**Por que o arquivo antigo ainda aparece depois do purge?** O navegador pode ter cópia local ainda fresca; só o versionamento da URL contorna isso.", "**Why does the old file still appear after a purge?** The browser may have a local copy still fresh; only URL versioning gets around that."],
      ),
      tip(["Regra para lembrar: arquivo com hash no nome, validade de um ano; arquivo sem hash, validade curta e revalidação. Quase todo problema de conteúdo velho vem de misturar as duas coisas.", "A rule to remember: file with a hash in the name, one-year validity; file without a hash, short validity and revalidation. Almost every stale content problem comes from mixing the two."]),
    ] },
  { id: "edge-caching-e-cdn", section: "cache", level: 1, icon: "public", minutes: 14,
    title: ["Edge caching, CDN e computação na borda", "Edge caching, CDN and edge computing"],
    summary: ["URLs assinadas, CDN x edge server, funções na borda, vídeo sob demanda e streaming adaptativo, e como o custo se forma.", "Signed URLs, CDN vs edge server, edge functions, video on demand and adaptive streaming, and how cost builds up."],
    body: [
      p(["A **borda** (*edge*) é a parte da rede mais próxima do usuário: os pontos de presença de uma CDN, as torres de operadoras, provedores de internet locais e até o próprio dispositivo. Levar trabalho para a borda reduz a distância que cada pedido percorre, e a distância é o único componente da latência que nenhuma otimização de software consegue eliminar. Este artigo parte do que o artigo sobre armazenamento e CDN apresentou (pull, push, cabeçalhos, versionamento) e aprofunda o uso da borda para conteúdo protegido, lógica programável e mídia.", "The **edge** is the part of the network closest to the user: a CDN's points of presence, carrier towers, local internet providers and even the device itself. Moving work to the edge shortens the distance each request travels, and distance is the only component of latency that no software optimization can eliminate. This article builds on what the article on storage and CDN introduced (pull, push, headers, versioning) and deepens the use of the edge for protected content, programmable logic and media."]),
      h(["Como uma requisição é atendida na borda", "How a request is served at the edge"]),
      p(["Quando o navegador resolve `cdn.exemplo.com`, o DNS (ou um endereço *anycast*, anunciado por muitos PoPs ao mesmo tempo e roteado pela rede ao mais próximo) o leva a um PoP. O servidor de borda calcula a **chave de cache** (em geral, esquema, nome do host, caminho e os parâmetros de consulta e cabeçalhos configurados) e procura na memória e no disco local. Em caso de acerto, devolve a resposta na hora. Em caso de falha, consulta o escudo de origem, depois a origem, guarda a resposta segundo os cabeçalhos e a entrega. Normalizar a chave de cache é uma das melhores otimizações: ignorar parâmetros de rastreamento (`utm_source`), ordenar parâmetros e não incluir cookies que não mudam a resposta elevam a taxa de acerto de forma notável.", "When the browser resolves `cdn.example.com`, DNS (or an *anycast* address, announced by many PoPs at once and routed by the network to the nearest) leads it to a PoP. The edge server computes the **cache key** (generally scheme, host name, path and the configured query parameters and headers) and looks in local memory and disk. On a hit, it returns the response immediately. On a miss, it queries the origin shield, then the origin, stores the response according to the headers and delivers it. Normalizing the cache key is one of the best optimizations: ignoring tracking parameters (`utm_source`), sorting parameters and not including cookies that do not change the response raises the hit ratio notably."]),
      fig(["Requisição na borda: acerto e falha", "Request at the edge: hit and miss"],
        [[node("u", ["Usuário", "User"], "client")], [node("dns", ["DNS / anycast", "DNS / anycast"], "edge")], [node("pop", ["Servidor de borda (PoP)", "Edge server (PoP)"], "edge")], [node("fn", ["Função na borda", "Edge function"], "service"), node("sh", ["Escudo de origem", "Origin shield"], "cache")], [node("o", ["Origem", "Origin"], "data")]],
        [edge("u", "dns", "1"), edge("dns", "pop", ["2 PoP mais próximo", "2 nearest PoP"]), edge("pop", "fn", ["3 regras", "3 rules"]), edge("pop", "sh", ["4 miss", "4 miss"], { dashed: true }), edge("sh", "o", ["5 miss", "5 miss"], { dashed: true })]),
      h(["CDN e servidor de borda: qual a diferença", "CDN and edge server: what is the difference"]),
      p(["No uso diário, os termos se misturam, mas há distinção útil. Uma **CDN** é o serviço completo e coordenado: milhares de servidores, roteamento, políticas de cache, purge, painel, segurança e cobrança. Um **servidor de borda** é uma máquina individual nessa rede (ou em outra), que guarda cópias e executa lógica perto do usuário. Pode ser parte de uma CDN comercial, de uma rede própria (as grandes empresas de vídeo instalam servidores dentro dos provedores de internet, como o Open Connect da Netflix) ou de uma operadora (*multi-access edge computing*, junto às torres de celular). A CDN tradicional era sobretudo um cache; hoje, a mesma borda também executa código.", "In daily use the terms blur, but there is a useful distinction. A **CDN** is the complete, coordinated service: thousands of servers, routing, cache policies, purge, dashboard, security and billing. An **edge server** is an individual machine in that network (or another), which stores copies and runs logic near the user. It can be part of a commercial CDN, of a private network (large video companies install servers inside internet providers, like Netflix's Open Connect) or of a carrier (*multi-access edge computing*, next to cell towers). The traditional CDN was mostly a cache; today the same edge also runs code."]),
      table([["Aspecto", "Aspect"], ["CDN", "CDN"], ["Servidor de borda", "Edge server"]],
        [["O que é", "What it is"], ["Serviço e rede global gerenciados", "Managed global service and network"], ["Máquina que serve e processa perto do usuário", "Machine that serves and processes near the user"]],
        [["Foco clássico", "Classic focus"], ["Cache e entrega de conteúdo", "Caching and content delivery"], ["Cache e execução local de lógica", "Caching and local execution of logic"]],
        [["Quem opera", "Who operates"], ["Fornecedor de CDN", "CDN provider"], ["Fornecedor, provedor de internet ou o próprio dono", "Provider, internet provider or the owner"]],
        [["Exemplo", "Example"], ["Cloudflare, CloudFront, Fastly, Akamai", "Cloudflare, CloudFront, Fastly, Akamai"], ["Caixa de cache dentro de um provedor; nó em torre de celular", "Cache box inside an ISP; node at a cell tower"]],
      ),
      h(["Proteger conteúdo: URLs assinadas e cookies assinados", "Protecting content: signed URLs and signed cookies"]),
      p(["Cache e controle de acesso parecem se opor: o cache existe para servir o mesmo arquivo a todos, e o controle quer servir só a quem pode. A solução é a **URL assinada**. A aplicação, que sabe quem pode acessar o quê, gera uma URL contendo o caminho, um **prazo de expiração** e uma **assinatura** (HMAC com um segredo que a CDN também conhece, ou assinatura com chave privada). A CDN valida a assinatura e o prazo sem consultar a aplicação, e se estiverem corretos entrega o arquivo, do cache. Para proteger muitos arquivos de uma vez, como todos os segmentos de um vídeo, usa-se um **cookie assinado**, que vale para um prefixo. A chave de cache deve ignorar os parâmetros da assinatura; do contrário, cada URL assinada teria sua cópia e o cache seria inútil.", "Caching and access control seem opposed: the cache exists to serve the same file to everyone, and access control wants to serve only those allowed. The solution is the **signed URL**. The application, which knows who may access what, generates a URL containing the path, an **expiry time** and a **signature** (an HMAC with a secret the CDN also knows, or a signature with a private key). The CDN validates signature and expiry without asking the application, and if correct delivers the file, from cache. To protect many files at once, such as all the segments of a video, a **signed cookie** is used, valid for a prefix. The cache key must ignore the signature parameters; otherwise each signed URL would have its own copy and the cache would be useless."]),
      code(`import { createHmac } from "node:crypto";

const SECRET = process.env.CDN_SIGNING_SECRET!;

// URL valid for ttlSeconds, bound to the path
export function signUrl(path: string, ttlSeconds = 300): string {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = path + "|" + expires;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return "https://cdn.example.com" + path + "?expires=" + expires + "&sig=" + sig;
}

// verification (runs at the edge or in the origin)
export function verify(path: string, expires: number, sig: string): boolean {
  if (expires < Math.floor(Date.now() / 1000)) return false;       // expired
  const expected = createHmac("sha256", SECRET).update(path + "|" + expires).digest("hex");
  return expected === sig; // in production use timingSafeEqual
}`),
      p(["Pontos de atenção: use prazos curtos, vincule a assinatura ao caminho (e, se necessário, ao endereço IP ou ao usuário), nunca coloque o segredo no cliente e mantenha o relógio dos servidores sincronizado. Em provedores gerenciados, como o CloudFront, o S3 e o Cloud Storage, existem formatos nativos de URL assinada que dispensam implementar o algoritmo.", "Points of attention: use short expiries, bind the signature to the path (and, if needed, to the IP address or user), never put the secret on the client and keep server clocks in sync. In managed providers, such as CloudFront, S3 and Cloud Storage, there are native signed-URL formats that spare you from implementing the algorithm."]),
      h(["Computação na borda (edge compute)", "Edge computing"]),
      p(["Além de guardar bytes, a borda pode executar código leve em resposta a cada pedido. Os serviços mais conhecidos são o Cloudflare Workers, o Lambda@Edge e as CloudFront Functions, o Fastly Compute e funções de borda de plataformas de hospedagem. Em geral usam ambientes isolados e rápidos de iniciar (isolates ou WebAssembly), com limites estritos de tempo de CPU, de memória e de tamanho de código. Os usos típicos:", "Beyond storing bytes, the edge can run lightweight code in response to each request. The best-known services are Cloudflare Workers, Lambda@Edge and CloudFront Functions, Fastly Compute and edge functions of hosting platforms. They generally use isolated, fast-starting environments (isolates or WebAssembly), with strict limits on CPU time, memory and code size. Typical uses:"]),
      ul(
        ["**Reescrita e redirecionamento**: roteamento por país, idioma ou dispositivo, redirecionamentos e normalização de URLs.", "**Rewriting and redirecting**: routing by country, language or device, redirects and URL normalization."],
        ["**Autenticação e autorização leves**: validar um JWT ou uma assinatura antes de gastar um pedido à origem.", "**Lightweight authentication and authorization**: validating a JWT or a signature before spending a request on the origin."],
        ["**Testes A/B e *feature flags***: escolher a variante no PoP e variar a chave de cache por ela.", "**A/B tests and feature flags**: choosing the variant at the PoP and varying the cache key by it."],
        ["**Personalização sobre página em cache**: montar uma página com partes comuns em cache e pequenos trechos do usuário.", "**Personalization over a cached page**: assembling a page with common cached parts and small user-specific pieces."],
        ["**Transformação de imagens**: redimensionar, converter para WebP ou AVIF conforme o cabeçalho `Accept` e guardar o resultado.", "**Image transformation**: resizing, converting to WebP or AVIF according to the `Accept` header and storing the result."],
        ["**Proteção**: limitação de taxa, bloqueio de bots e filtragem antes de chegar à origem.", "**Protection**: rate limiting, bot blocking and filtering before reaching the origin."],
      ),
      code(`// edge function (Workers-style): cache an API response close to the user
export default {
  async fetch(request: Request, env: unknown, ctx: { waitUntil(p: Promise<unknown>): void }) {
    const url = new URL(request.url);

    // redirect by country (header added by the platform)
    const country = request.headers.get("cf-ipcountry");
    if (url.pathname === "/" && country === "BR") {
      return Response.redirect(url.origin + "/pt-br/", 302);
    }

    const cache = caches.default;
    const cached = await cache.match(request);
    if (cached) return cached;                      // served at the edge

    const originResponse = await fetch(request);    // go to the origin
    const response = new Response(originResponse.body, originResponse);
    response.headers.set("Cache-Control", "public, max-age=60");
    ctx.waitUntil(cache.put(request, response.clone())); // store without delaying
    return response;
  },
};`),
      p(["O trade-off central é a **consistência dos dados**. O código na borda roda perto do usuário, mas os dados, em geral, ficam em uma região. Cada ida ao banco central anula o ganho. Por isso a lógica de borda lida bem com decisões que dependem só do pedido e de dados pequenos e pouco mutáveis, e mal com transações. Há bancos e armazenamentos de chave-valor replicados globalmente, mas com consistência eventual.", "The central trade-off is **data consistency**. Code at the edge runs near the user, but data is usually in one region. Each trip to the central database cancels the gain. So edge logic handles well decisions that depend only on the request and on small, rarely changing data, and handles transactions poorly. There are globally replicated databases and key-value stores, but with eventual consistency."]),
      h(["Vídeo sob demanda e streaming adaptativo", "Video on demand and adaptive streaming"]),
      p(["Vídeo é a maior parte do tráfego da internet e o caso em que a CDN é indispensável. Para **vídeo sob demanda** (VOD), o arquivo é processado em uma etapa de *transcodificação* que gera várias versões (resoluções e taxas de bits, por exemplo 240p a 2160p) e as divide em pequenos **segmentos** de 2 a 10 segundos. Um arquivo de texto, o *manifesto* (`.m3u8` no HLS, `.mpd` no MPEG-DASH), lista as versões e os endereços dos segmentos. O player baixa o manifesto e depois os segmentos, um a um, por HTTP comum.", "Video is most of internet traffic and the case where a CDN is indispensable. For **video on demand** (VOD), the file goes through a *transcoding* step that produces several versions (resolutions and bitrates, for example 240p to 2160p) and splits them into small **segments** of 2 to 10 seconds. A text file, the *manifest* (`.m3u8` in HLS, `.mpd` in MPEG-DASH), lists the versions and segment addresses. The player downloads the manifest and then the segments, one by one, over plain HTTP."]),
      p(["O **streaming adaptativo** (*adaptive bitrate*, ABR) é o que mantém o vídeo fluindo: o player mede a vazão da rede e o tamanho do *buffer* e, a cada segmento, escolhe a versão que cabe naquele momento. Se a banda cai, passa para uma qualidade menor sem parar; se melhora, sobe. Como segmentos são arquivos pequenos e imutáveis, são perfeitos para a CDN: cada um é um objeto com URL própria, cacheado com validade longa. Os manifestos de VOD também podem ser cacheados por muito tempo, mas os de **transmissão ao vivo** mudam a cada poucos segundos e precisam de validade curta (1 a 2 segundos), com a CDN colapsando milhares de pedidos simultâneos em um só à origem. Conteúdo pago adiciona DRM (Widevine, FairPlay, PlayReady) e URLs ou cookies assinados.", "**Adaptive streaming** (*adaptive bitrate*, ABR) is what keeps video flowing: the player measures network throughput and buffer size and, for each segment, picks the version that fits at that moment. If bandwidth drops, it moves to a lower quality without stopping; if it improves, it climbs. Since segments are small, immutable files, they are perfect for the CDN: each is an object with its own URL, cached with long validity. VOD manifests can also be cached for long, but **live stream** manifests change every few seconds and need short validity (1 to 2 seconds), with the CDN collapsing thousands of simultaneous requests into one to the origin. Paid content adds DRM (Widevine, FairPlay, PlayReady) and signed URLs or cookies."]),
      fig(["Pipeline de vídeo sob demanda", "Video-on-demand pipeline"],
        [[node("up", ["Upload do vídeo original", "Original video upload"], "client")], [node("tc", ["Transcodificação (várias qualidades)", "Transcoding (many qualities)"], "service")], [node("st", ["Object storage (segmentos + manifesto)", "Object storage (segments + manifest)"], "data")], [node("cdn", ["CDN (segmentos em cache)", "CDN (cached segments)"], "edge")], [node("pl", ["Player ABR", "ABR player"], "client")]],
        [edge("up", "tc"), edge("tc", "st", ["HLS / DASH", "HLS / DASH"]), edge("st", "cdn", ["pull", "pull"]), edge("cdn", "pl", ["segmento escolhido", "chosen segment"])]),
      code(`#EXTM3U
# HLS master playlist: the player picks a rendition by bandwidth
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/index.m3u8`),
      h(["Custo", "Cost"]),
      p(["O preço de uma CDN costuma ter três componentes: **transferência de dados** de saída por gigabyte (a maior parte da conta, com descontos por volume e preços diferentes por região), **requisições** (cobradas por dezenas de milhares ou por milhão, o que pesa em muitos arquivos pequenos) e **recursos adicionais** (funções na borda por invocação e tempo de CPU, purges, WAF, logs em tempo real, certificados). Há ainda os custos da origem: banda de saída do bucket quando a CDN busca (por vezes isenta entre serviços do mesmo provedor), armazenamento e requisições `GET` ao bucket. Cada ponto percentual de taxa de acerto é dinheiro: se a origem custa mais por gigabyte que a CDN, aumentar o acerto de 90% para 97% reduz a conta de origem em mais de dois terços.", "A CDN's price usually has three components: outbound **data transfer** per gigabyte (most of the bill, with volume discounts and different prices per region), **requests** (billed per ten thousand or per million, which weighs on many small files) and **extra features** (edge functions per invocation and CPU time, purges, WAF, real-time logs, certificates). There are also origin costs: bucket egress bandwidth when the CDN fetches (sometimes waived between services of the same provider), storage and `GET` requests to the bucket. Each percentage point of hit ratio is money: if the origin costs more per gigabyte than the CDN, raising the hit ratio from 90% to 97% cuts the origin bill by more than two thirds."]),
      ul(
        ["**Aumente a taxa de acerto**: normalize a chave de cache, use validade longa com hash no nome, ative origin shield e colapso de requisições.", "**Raise the hit ratio**: normalize the cache key, use long validity with hashed names, enable origin shield and request collapsing."],
        ["**Reduza os bytes**: comprima (Brotli, gzip), use formatos modernos de imagem e vídeo, entregue a resolução certa para cada tela.", "**Reduce the bytes**: compress (Brotli, gzip), use modern image and video formats, deliver the right resolution for each screen."],
        ["**Revise as classes de preço**: restrinja regiões atendidas quando fizer sentido, e negocie contratos com compromisso de volume.", "**Review price classes**: restrict served regions when it makes sense, and negotiate volume-commitment contracts."],
        ["**Cuidado com o tráfego não desejado**: *hotlinking*, bots e varreduras geram saída paga; use URLs assinadas, WAF e limitação de taxa.", "**Watch unwanted traffic**: hotlinking, bots and scanners generate billable egress; use signed URLs, WAF and rate limiting."],
      ),
      h(["Vantagens e desvantagens", "Pros and cons"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Drawbacks"]],
        [["Latência baixa e previsível no mundo todo", "Low, predictable latency worldwide"], ["Custos variáveis que crescem com o sucesso", "Variable costs that grow with success"]],
        [["Origem leve e protegida", "Light, protected origin"], ["Consistência eventual e dados velhos na borda", "Eventual consistency and stale data at the edge"]],
        [["Lógica na borda sem operar servidores", "Edge logic without operating servers"], ["Funções limitadas e difíceis de depurar", "Limited functions that are hard to debug"]],
        [["Suporte a vídeo adaptativo em larga escala", "Adaptive video support at large scale"], ["Dependência de um fornecedor", "Vendor dependence"]],
      ),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      p(["Use a borda para conteúdo estático, mídia, páginas públicas e APIs de leitura cacheáveis, e para decisões baratas que dependem só do pedido (redirecionamento, autenticação por token, A/B). Evite empurrar para a borda lógica que exige leituras e escritas consistentes em um banco central, pois a distância volta a doer; evite cachear respostas por usuário sem separação clara; e dispense a CDN quando o público é local e o tráfego baixo, se a complexidade extra não compensar.", "Use the edge for static content, media, public pages and cacheable read APIs, and for cheap decisions that depend only on the request (redirects, token authentication, A/B). Avoid pushing to the edge logic that needs consistent reads and writes against a central database, since the distance hurts again; avoid caching per-user responses without clear separation; and skip the CDN when the audience is local and traffic is low, if the extra complexity does not pay off."]),
      h(["Casos reais", "Real-world cases"]),
      ul(
        ["**Serviços de vídeo** distribuem segmentos HLS ou DASH por CDNs e, no caso da Netflix, por servidores próprios dentro de provedores de internet, enchidos à noite (push) com o catálogo mais provável.", "**Video services** distribute HLS or DASH segments through CDNs and, in Netflix's case, through its own servers inside internet providers, filled at night (push) with the most likely catalog."],
        ["**Lojas virtuais** servem páginas de categoria e produto da borda, com funções que ajustam preço e idioma por região.", "**Online stores** serve category and product pages from the edge, with functions that adjust price and language by region."],
        ["**Lançamentos de jogos e atualizações de sistema** usam push para pré-posicionar arquivos de gigabytes na borda antes da liberação.", "**Game launches and system updates** use push to pre-position gigabyte-sized files at the edge before release."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Incluir a assinatura da URL na chave de cache e perder todo o benefício.", "Including the URL signature in the cache key and losing all the benefit."],
        ["Não cachear manifestos e segmentos por não saber que são arquivos comuns, enviando todo o vídeo pela origem.", "Not caching manifests and segments because they are thought of as special, sending all video through the origin."],
        ["Usar função de borda para tudo, inclusive lógica pesada e com muitas idas ao banco central.", "Using an edge function for everything, including heavy logic with many trips to the central database."],
        ["Esquecer de cachear respostas de erro por pouco tempo, deixando a origem sob tempestade de pedidos quando está doente.", "Forgetting to cache error responses briefly, leaving the origin under a storm of requests when it is sick."],
        ["Não monitorar a taxa de acerto da CDN por tipo de conteúdo.", "Not monitoring the CDN's hit ratio by content type."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["A borda aproxima conteúdo e lógica do usuário; a CDN é o serviço, o servidor de borda é a máquina.", "The edge brings content and logic closer to the user; the CDN is the service, the edge server is the machine."],
        ["URLs e cookies assinados permitem proteger conteúdo sem perder o cache, desde que a assinatura fique fora da chave de cache.", "Signed URLs and cookies protect content without losing the cache, provided the signature stays out of the cache key."],
        ["Funções na borda servem para decisões leves sobre o pedido; dados consistentes continuam na origem.", "Edge functions serve lightweight decisions about the request; consistent data stays at the origin."],
        ["Vídeo é dividido em segmentos e servido por streaming adaptativo (HLS, DASH), ideal para o cache da CDN.", "Video is split into segments and served by adaptive streaming (HLS, DASH), ideal for CDN caching."],
        ["O custo é dominado pela saída de dados e pelas requisições; a taxa de acerto é a principal alavanca.", "Cost is dominated by egress and requests; the hit ratio is the main lever."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**A CDN serve conteúdo dinâmico?** Sim, com TTLs curtos, `stale-while-revalidate`, aceleração de rota até a origem e funções na borda; os ganhos de latência vêm também de conexões reaproveitadas.", "**Does the CDN serve dynamic content?** Yes, with short TTLs, stale-while-revalidate, route acceleration to the origin and edge functions; latency gains also come from reused connections."],
        ["**URL assinada é segura o bastante?** Para controle de acesso temporário, sim; quem recebe a URL pode compartilhá-la até o prazo vencer, então use prazos curtos e vínculos adicionais.", "**Is a signed URL secure enough?** For temporary access control, yes; whoever receives the URL can share it until it expires, so use short expiries and extra bindings."],
        ["**HLS ou DASH?** HLS tem suporte nativo nos dispositivos da Apple e é amplamente aceito; DASH é um padrão aberto. Muitos serviços publicam ambos usando o mesmo conjunto de segmentos.", "**HLS or DASH?** HLS has native support on Apple devices and is widely accepted; DASH is an open standard. Many services publish both using the same set of segments."],
        ["**Como saber se a CDN está ajudando?** Compare a taxa de acerto, o tempo até o primeiro byte por região e a carga e o custo da origem antes e depois.", "**How do I know if the CDN is helping?** Compare the hit ratio, time to first byte per region and origin load and cost before and after."],
      ),
      tip(["Se um arquivo é igual para todos, pertence à CDN. Se depende do usuário, só entra na borda quando você consegue separar com clareza a parte comum da parte pessoal.", "If a file is the same for everyone, it belongs on the CDN. If it depends on the user, it only goes to the edge when you can clearly separate the common part from the personal part."]),
    ] },
];

import { h, p, ul, tip, code, table, fig, node, edge, type DocArticle } from "./kit";

/** Seção "bancos". */
export const ARTICLES: DocArticle[] = [
  { id: "bancos-de-dados", section: "bancos", level: 0, icon: "database", minutes: 12,
    title: ["Bancos de dados: SQL e NoSQL", "Databases: SQL and NoSQL"],
    summary: ["Os tipos de banco (relacional, chave-valor, documento, colunar, grafo, séries temporais, busca e vetorial), ACID x BASE e como decidir.", "The kinds of database (relational, key-value, document, columnar, graph, time series, search and vector), ACID vs BASE and how to decide."],
    body: [
      p(["O servidor de aplicação esquece tudo quando termina o pedido: variáveis, objetos e conexões desaparecem, e qualquer instância pode ser reiniciada ou substituída a qualquer momento. O que precisa durar (usuários, pedidos, mensagens, saldos) vai para um **banco de dados**, um sistema especializado em guardar informação de forma durável, consultá-la rápido e permitir que muitos clientes a usem ao mesmo tempo sem se atropelarem. Escolher o banco é uma das decisões mais caras de reverter: o modelo de dados contamina o código, os relatórios e a operação.", "The application server forgets everything when the request ends: variables, objects and connections disappear, and any instance can be restarted or replaced at any moment. What must last (users, orders, messages, balances) goes into a **database**, a system specialized in storing information durably, querying it quickly and letting many clients use it at once without trampling each other. Choosing the database is one of the most expensive decisions to reverse: the data model leaks into the code, the reports and the operations."]),
      p(["Um banco de dados não é só «um lugar para salvar coisas». Ele entrega, em graus diferentes, quatro serviços: **durabilidade** (o dado sobrevive a quedas de energia, normalmente por meio de um log de escrita antecipada, o *write-ahead log*), **consulta** (achar dados sem ler tudo), **concorrência** (vários clientes lendo e gravando sem corromper o estado) e **integridade** (regras que o dado precisa obedecer). Cada família de bancos faz escolhas diferentes entre esses serviços e é daí que vêm as diferenças de desempenho e de garantias.", "A database is not just «a place to save things». It delivers, to varying degrees, four services: **durability** (data survives power loss, usually through a write-ahead log), **querying** (finding data without reading everything), **concurrency** (several clients reading and writing without corrupting state) and **integrity** (rules the data must obey). Each family of databases makes different trade-offs among these services, and that is where differences in performance and guarantees come from."]),

      h(["Bancos relacionais (SQL)", "Relational databases (SQL)"]),
      p(["O modelo relacional, proposto por Edgar Codd em 1970, organiza os dados em **tabelas** (relações) de **linhas** (registros) e **colunas** (atributos tipados). Linhas de tabelas diferentes se ligam por **chaves**: o `pedido` guarda o `cliente_id` do cliente que o fez. A linguagem de consulta é o **SQL**, declarativa: você descreve *o que* quer, e o otimizador decide *como* obter (qual índice usar, em que ordem juntar as tabelas).", "The relational model, proposed by Edgar Codd in 1970, organizes data into **tables** (relations) of **rows** (records) and **columns** (typed attributes). Rows of different tables are linked by **keys**: the `order` stores the `customer_id` of the customer who placed it. The query language is **SQL**, declarative: you describe *what* you want and the optimizer decides *how* to get it (which index to use, in which order to join tables)."]),
      code(`-- Quem comprou mais em 2025? (join + agregação, o ponto forte do SQL)
SELECT c.name, SUM(o.total_cents) / 100.0 AS spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= '2025-01-01' AND o.status = 'paid'
GROUP BY c.id, c.name
ORDER BY spent DESC
LIMIT 10;`),
      p(["Os pontos fortes são **transações ACID**, **integridade referencial** (o banco recusa um pedido de cliente inexistente), **esquema explícito** (o dado inválido é barrado na entrada) e a liberdade de **consultar de formas que ninguém previu** no início: um relatório novo é só uma consulta nova. Exemplos: PostgreSQL, MySQL/MariaDB, SQL Server, Oracle, SQLite. Os pontos fracos aparecem na escala extrema de gravação: escalar um banco relacional horizontalmente exige replicação e sharding manual, e junções entre máquinas são caras.", "The strengths are **ACID transactions**, **referential integrity** (the database rejects an order for a nonexistent customer), an **explicit schema** (invalid data is blocked at the door) and the freedom to **query in ways nobody predicted** at the start: a new report is just a new query. Examples: PostgreSQL, MySQL/MariaDB, SQL Server, Oracle, SQLite. The weaknesses show up at extreme write scale: scaling a relational database horizontally requires replication and manual sharding, and joins across machines are expensive."]),

      h(["ACID: as garantias de uma transação", "ACID: the guarantees of a transaction"]),
      p(["Uma **transação** agrupa várias operações numa unidade lógica. O exemplo clássico é a transferência bancária: debitar uma conta e creditar outra precisam acontecer juntas.", "A **transaction** groups several operations into a logical unit. The classic example is a bank transfer: debiting one account and crediting another must happen together."]),
      code(`BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;   -- ou ROLLBACK; se algo falhar no meio`),
      ul(
        ["**Atomicidade (A)**: tudo ou nada. Se a queda acontece entre o débito e o crédito, o banco desfaz o débito ao reiniciar.", "**Atomicity (A)**: all or nothing. If a crash happens between the debit and the credit, the database undoes the debit on restart."],
        ["**Consistência (C)**: a transação leva o banco de um estado válido a outro, respeitando restrições (`NOT NULL`, `UNIQUE`, chaves estrangeiras, `CHECK`). Atenção: este «C» não é o «C» do teorema CAP.", "**Consistency (C)**: the transaction takes the database from one valid state to another, respecting constraints (`NOT NULL`, `UNIQUE`, foreign keys, `CHECK`). Note: this «C» is not the «C» of the CAP theorem."],
        ["**Isolamento (I)**: transações concorrentes não enxergam estados intermediários umas das outras, com graus configuráveis (ver o artigo de índices e níveis de isolamento).", "**Isolation (I)**: concurrent transactions do not see each other's intermediate states, in configurable degrees (see the article on indexes and isolation levels)."],
        ["**Durabilidade (D)**: depois do `COMMIT`, o dado sobrevive a falhas, porque o log foi forçado ao disco antes de confirmar.", "**Durability (D)**: after `COMMIT`, the data survives failures, because the log was forced to disk before acknowledging."],
      ),

      h(["Famílias NoSQL", "NoSQL families"]),
      p(["«NoSQL» (*not only SQL*) não é uma tecnologia, e sim um guarda-chuva de modelos que surgiram quando alguns problemas (volume, latência, flexibilidade de formato, distribuição geográfica) passaram a pedir compromissos diferentes dos do SQL. Cada família otimiza um padrão de acesso.", "«NoSQL» (*not only SQL*) is not one technology but an umbrella of models that appeared when some problems (volume, latency, schema flexibility, geographic distribution) started to demand different trade-offs than SQL. Each family optimizes an access pattern."]),
      fig(["Famílias de bancos e o padrão de acesso de cada uma", "Database families and the access pattern of each"],
        [[node("app", ["Aplicação", "Application"], "service")],
         [node("rel", ["Relacional", "Relational"], "data"), node("kv", ["Chave-valor", "Key-value"], "cache"), node("doc", ["Documento", "Document"], "data")],
         [node("col", ["Colunar / wide-column", "Columnar / wide-column"], "data"), node("graph", ["Grafo", "Graph"], "data"), node("ts", ["Séries temporais", "Time series"], "data"), node("srch", ["Busca e vetorial", "Search and vector"], "ext")]],
        [edge("app", "rel", "SQL"), edge("app", "kv", ["GET / SET", "GET / SET"]), edge("app", "doc", "JSON"), edge("rel", "col", "", { dashed: true }), edge("doc", "graph", "", { dashed: true }), edge("kv", "ts", "", { dashed: true }), edge("doc", "srch", ["indexa", "indexes"], { dashed: true })]),
      table([["Tipo", "Type"], ["Modelo e exemplos", "Model and examples"], ["Bom para", "Good for"], ["Cuidado com", "Watch out for"]],
        [["Relacional", "Relational"], ["Tabelas e junções: PostgreSQL, MySQL", "Tables and joins: PostgreSQL, MySQL"], ["Dados estruturados, transações, relatórios", "Structured data, transactions, reports"], ["Escala de escrita além de uma máquina", "Write scale beyond one machine"]],
        [["Chave-valor", "Key-value"], ["Mapa chave para valor opaco: Redis, DynamoDB, Memcached", "Key to opaque value map: Redis, DynamoDB, Memcached"], ["Sessões, cache, contadores, carrinhos", "Sessions, caches, counters, carts"], ["Sem consulta por valor; sem junções", "No query by value; no joins"]],
        [["Documento", "Document"], ["JSON/BSON aninhado: MongoDB, Couchbase, Firestore", "Nested JSON/BSON: MongoDB, Couchbase, Firestore"], ["Catálogos, perfis, conteúdo com campos variáveis", "Catalogs, profiles, content with variable fields"], ["Duplicação de dados e relações fracas", "Data duplication and weak relationships"]],
        [["Colunar / wide-column", "Columnar / wide-column"], ["Wide-column: Cassandra, HBase. Analítico colunar: ClickHouse, BigQuery, Redshift", "Wide-column: Cassandra, HBase. Analytical columnar: ClickHouse, BigQuery, Redshift"], ["Gravação massiva distribuída; análise de poucas colunas em bilhões de linhas", "Massive distributed writes; analysis of a few columns across billions of rows"], ["Consultas precisam ser planejadas na modelagem", "Queries must be planned at modeling time"]],
        [["Grafo", "Graph"], ["Nós e arestas: Neo4j, Amazon Neptune", "Nodes and edges: Neo4j, Amazon Neptune"], ["Recomendação, detecção de fraude, redes sociais", "Recommendation, fraud detection, social networks"], ["Particionar um grafo é difícil", "Partitioning a graph is hard"]],
        [["Séries temporais", "Time series"], ["Pontos com timestamp: InfluxDB, TimescaleDB, Prometheus", "Timestamped points: InfluxDB, TimescaleDB, Prometheus"], ["Métricas, IoT, telemetria", "Metrics, IoT, telemetry"], ["Cardinalidade alta de rótulos", "High label cardinality"]],
        [["Busca e vetorial", "Search and vector"], ["Índice invertido: Elasticsearch, OpenSearch. Vetores: pgvector, Pinecone, Milvus", "Inverted index: Elasticsearch, OpenSearch. Vectors: pgvector, Pinecone, Milvus"], ["Texto livre, relevância, similaridade semântica", "Free text, relevance, semantic similarity"], ["Não é fonte da verdade; consistência eventual", "Not a source of truth; eventual consistency"]]),

      h(["Chave-valor e documento na prática", "Key-value and document in practice"]),
      p(["Um **chave-valor** expõe quase só `GET`, `SET` e `DELETE`. Como o acesso é sempre pela chave, o banco consegue distribuir as chaves por muitas máquinas e responder em milissegundos. Um **banco de documentos** guarda objetos JSON inteiros: o pedido e seus itens ficam num único documento, e ler o pedido é uma única busca, sem junção.", "A **key-value** store exposes almost only `GET`, `SET` and `DELETE`. Since access is always by key, the database can spread keys across many machines and answer in milliseconds. A **document database** stores whole JSON objects: the order and its items live in a single document, and reading the order is one lookup, with no join."]),
      code(`// documento de pedido (MongoDB, por exemplo): itens embutidos
{
  "_id": "ord_9f21",
  "customer": { "id": "c_7", "name": "Ana" },
  "items": [
    { "sku": "KB-01", "qty": 1, "price_cents": 24900 },
    { "sku": "MS-07", "qty": 2, "price_cents": 7900 }
  ],
  "status": "paid",
  "created_at": "2025-03-04T12:30:00Z"
}`),
      p(["O preço dessa conveniência é a **duplicação**: o nome do cliente copiado no pedido não acompanha uma mudança de cadastro. Isso pode até ser desejável (o pedido registra o que valia na época), mas obriga a pensar em quem atualiza o quê.", "The price of this convenience is **duplication**: the customer name copied into the order does not follow a profile change. That may even be desirable (the order records what was true at the time), but it forces you to think about who updates what."]),

      h(["Colunar, grafo, séries temporais, busca e vetorial", "Columnar, graph, time series, search and vector"]),
      ul(
        ["**Wide-column (Cassandra)**: tabelas com chave de partição e de ordenação, otimizadas para gravar muito e ler por chave. Escala linearmente adicionando nós, sem líder único.", "**Wide-column (Cassandra)**: tables with partition and clustering keys, optimized for heavy writes and reads by key. It scales linearly by adding nodes, with no single leader."],
        ["**Colunar analítico (ClickHouse, BigQuery)**: guarda cada coluna separada, de modo que `AVG(price)` lê só a coluna de preço, e comprime bem. Ótimo para OLAP (análise), ruim para OLTP (muitas transações pequenas).", "**Analytical columnar (ClickHouse, BigQuery)**: stores each column separately, so `AVG(price)` reads only the price column, and compresses well. Great for OLAP (analysis), poor for OLTP (many small transactions)."],
        ["**Grafo (Neo4j)**: percorrer relações («amigos de amigos até 3 níveis») sem junções recursivas caras, porque cada nó aponta direto para os vizinhos.", "**Graph (Neo4j)**: traversing relationships («friends of friends up to 3 levels») without expensive recursive joins, since each node points directly to its neighbors."],
        ["**Séries temporais**: dados sempre anexados em ordem de tempo, com compactação, retenção automática e agregações por janela (`avg` por 5 minutos).", "**Time series**: data always appended in time order, with compression, automatic retention and window aggregations (`avg` per 5 minutes)."],
        ["**Busca (Elasticsearch)**: *índice invertido* que mapeia palavra para documentos, com relevância, stemming e tolerância a erros de digitação. **Vetorial**: guarda embeddings e acha os vizinhos mais próximos (busca semântica, RAG).", "**Search (Elasticsearch)**: an *inverted index* mapping word to documents, with relevance, stemming and typo tolerance. **Vector**: stores embeddings and finds nearest neighbors (semantic search, RAG)."],
      ),

      h(["BASE e consistência eventual", "BASE and eventual consistency"]),
      p(["Muitos sistemas NoSQL distribuídos adotam o modelo **BASE**: *Basically Available* (continua respondendo mesmo com falhas parciais), *Soft state* (o estado pode mudar sem novas gravações, enquanto réplicas convergem) e *Eventual consistency* (se não houver novas escritas, todas as réplicas acabam iguais). Em troca, ganha-se disponibilidade e escala; paga-se com a possibilidade de ler um valor desatualizado por alguns instantes.", "Many distributed NoSQL systems adopt the **BASE** model: *Basically Available* (keeps answering despite partial failures), *Soft state* (state may change without new writes while replicas converge) and *Eventual consistency* (if there are no new writes, all replicas end up equal). In return you gain availability and scale; you pay with the possibility of reading a stale value for a few moments."]),
      table([["Aspecto", "Aspect"], ["ACID (típico em SQL)", "ACID (typical in SQL)"], ["BASE (típico em NoSQL distribuído)", "BASE (typical in distributed NoSQL)"]],
        [["Prioridade", "Priority"], ["Correção e consistência", "Correctness and consistency"], ["Disponibilidade e escala", "Availability and scale"]],
        [["Leitura após escrita", "Read after write"], ["Vê o valor novo", "Sees the new value"], ["Pode ver o valor antigo por um tempo", "May see the old value for a while"]],
        [["Transações", "Transactions"], ["Multi-linha, multi-tabela", "Multi-row, multi-table"], ["Normalmente por item ou documento", "Usually per item or document"]],
        [["Esquema", "Schema"], ["Rígido, definido antes", "Rigid, defined up front"], ["Flexível, validado pela aplicação", "Flexible, validated by the application"]],
        [["Escala", "Scaling"], ["Vertical primeiro; sharding é trabalhoso", "Vertical first; sharding is laborious"], ["Horizontal por projeto", "Horizontal by design"]]),
      p(["Essa fronteira é cada vez mais borrada: PostgreSQL tem coluna `jsonb`, MongoDB oferece transações multi-documento e bancos «NewSQL» (CockroachDB, Spanner, YugabyteDB) combinam SQL, ACID e distribuição horizontal.", "The boundary is increasingly blurred: PostgreSQL has a `jsonb` column, MongoDB offers multi-document transactions and «NewSQL» databases (CockroachDB, Spanner, YugabyteDB) combine SQL, ACID and horizontal distribution."]),

      h(["Como decidir: critérios", "How to decide: criteria"]),
      table([["Pergunta", "Question"], ["Se a resposta for sim", "If the answer is yes"]],
        [["Os dados têm relações claras e preciso de transações entre várias entidades?", "Is the data clearly related and do I need transactions across several entities?"], ["Relacional (PostgreSQL, MySQL)", "Relational (PostgreSQL, MySQL)"]],
        [["O acesso é quase sempre por uma chave e a latência precisa ser de milissegundos?", "Is access almost always by a key and must latency be in milliseconds?"], ["Chave-valor (Redis, DynamoDB)", "Key-value (Redis, DynamoDB)"]],
        [["Cada registro tem forma diferente e é lido como um todo?", "Does each record have a different shape and is it read as a whole?"], ["Documento (MongoDB)", "Document (MongoDB)"]],
        [["Volume de escrita enorme, distribuído em várias regiões, sempre no ar?", "Enormous write volume, spread across regions, always on?"], ["Wide-column (Cassandra, DynamoDB)", "Wide-column (Cassandra, DynamoDB)"]],
        [["O valor está nas relações e em percursos de vários saltos?", "Is the value in the relationships and multi-hop traversals?"], ["Grafo (Neo4j)", "Graph (Neo4j)"]],
        [["Preciso de busca por texto, relevância ou similaridade?", "Do I need text search, relevance or similarity?"], ["Elasticsearch ou índice vetorial, ao lado do banco principal", "Elasticsearch or a vector index, next to the main database"]],
        [["Análises pesadas sobre bilhões de linhas?", "Heavy analytics over billions of rows?"], ["Colunar analítico (ClickHouse, BigQuery)", "Analytical columnar (ClickHouse, BigQuery)"]]),
      p(["Na prática, sistemas maduros usam **persistência poliglota**: o PostgreSQL como fonte da verdade, o Redis como cache, o Elasticsearch para busca e um data warehouse para relatórios. Cada um recebe uma cópia dos dados de que precisa, geralmente alimentada por eventos ou por *change data capture*. O custo é operacional: mais peças para monitorar, fazer backup e manter sincronizadas.", "In practice, mature systems use **polyglot persistence**: PostgreSQL as the source of truth, Redis as cache, Elasticsearch for search and a data warehouse for reports. Each gets a copy of the data it needs, usually fed by events or *change data capture*. The cost is operational: more pieces to monitor, back up and keep in sync."]),

      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Escolher NoSQL «para escalar» sem ter medido: um PostgreSQL bem indexado numa máquina razoável aguenta dezenas de milhares de leituras por segundo e muito mais dados do que a maioria dos produtos jamais terá.", "Choosing NoSQL «to scale» without measuring: a well-indexed PostgreSQL on a reasonable machine handles tens of thousands of reads per second and far more data than most products will ever have."],
        ["Usar um banco de documentos para dados fortemente relacionais e acabar reimplementando junções e integridade na aplicação.", "Using a document database for strongly related data and ending up reimplementing joins and integrity in the application."],
        ["Tratar o Elasticsearch ou o Redis como fonte da verdade, sem uma cópia durável em outro lugar.", "Treating Elasticsearch or Redis as the source of truth with no durable copy elsewhere."],
        ["Ignorar o padrão de acesso: em bancos NoSQL o modelo nasce das consultas, e mudá-las depois pode exigir remodelar tudo.", "Ignoring the access pattern: in NoSQL databases the model is born from the queries, and changing them later may require remodeling everything."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["O banco dá durabilidade, consulta, concorrência e integridade; cada família prioriza algumas.", "The database provides durability, querying, concurrency and integrity; each family prioritizes some."],
        ["SQL: tabelas, junções, ACID e consultas ad hoc. É o padrão quando os dados são relacionados e corretos importam.", "SQL: tables, joins, ACID and ad hoc queries. It is the default when data is related and correctness matters."],
        ["NoSQL: chave-valor, documento, colunar, grafo, séries temporais e busca/vetorial, cada um para um padrão de acesso.", "NoSQL: key-value, document, columnar, graph, time series and search/vector, each for an access pattern."],
        ["ACID prioriza correção; BASE prioriza disponibilidade e escala, aceitando consistência eventual.", "ACID prioritizes correctness; BASE prioritizes availability and scale, accepting eventual consistency."],
        ["Comece relacional e adicione outros bancos apenas por requisitos concretos.", "Start relational and add other databases only for concrete requirements."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**NoSQL é mais rápido que SQL?** Depende do padrão de acesso. Para busca por chave, um chave-valor é muito rápido; para consultas ad hoc com junções, um banco relacional costuma ganhar.", "**Is NoSQL faster than SQL?** It depends on the access pattern. For key lookups a key-value store is very fast; for ad hoc queries with joins a relational database usually wins."],
        ["**Posso usar JSON no PostgreSQL?** Sim, com `jsonb` e índices GIN. É uma ótima saída quando só uma parte do modelo é flexível.", "**Can I use JSON in PostgreSQL?** Yes, with `jsonb` and GIN indexes. It is a great option when only part of the model is flexible."],
        ["**ACID e CAP falam da mesma consistência?** Não. No ACID é integridade de regras; no CAP é todas as réplicas verem o mesmo valor.", "**Do ACID and CAP mean the same consistency?** No. In ACID it is rule integrity; in CAP it is all replicas seeing the same value."],
        ["**Preciso de um banco vetorial separado?** Nem sempre: com `pgvector` o PostgreSQL já resolve volumes moderados; bancos dedicados valem quando a escala de vetores é grande.", "**Do I need a separate vector database?** Not always: with `pgvector` PostgreSQL already handles moderate volumes; dedicated databases pay off when the vector scale is large."],
      ),
      tip(["Regra prática: comece com um banco relacional. Só mude de modelo quando você conseguir dizer qual requisito concreto (volume, formato, latência) o SQL não atende.", "Rule of thumb: start with a relational database. Switch models only when you can name the concrete requirement (volume, shape, latency) that SQL cannot meet."]),
    ] },

  { id: "projetando-o-banco-de-dados", section: "bancos", level: 1, icon: "schema", minutes: 12,
    title: ["Projetando o banco de dados", "Designing the database"],
    summary: ["Do requisito às tabelas: entidades, relações, chaves, cardinalidades e um exemplo completo de e-commerce com DDL.", "From requirement to tables: entities, relationships, keys, cardinalities and a complete e-commerce example with DDL."],
    body: [
      p(["Um banco mal modelado cobra juros por anos: consultas lentas que nenhum índice conserta, dados contraditórios, migrações dolorosas e código cheio de remendos. A modelagem é o momento mais barato para acertar, porque ainda não existe dado para migrar. O objetivo é traduzir o **domínio do negócio** (clientes, produtos, pedidos) numa estrutura de tabelas, colunas, chaves e restrições que represente a realidade sem ambiguidade e responda bem às perguntas que a aplicação fará.", "A badly modeled database charges interest for years: slow queries no index can fix, contradictory data, painful migrations and code full of patches. Modeling is the cheapest moment to get it right, because there is no data to migrate yet. The goal is to translate the **business domain** (customers, products, orders) into a structure of tables, columns, keys and constraints that represents reality unambiguously and answers well the questions the application will ask."]),

      h(["O processo de modelagem em três níveis", "The modeling process in three levels"]),
      ul(
        ["**Modelo conceitual**: conversa com o negócio. Quais são as entidades e como se relacionam? Sem tipos nem tecnologia: «um cliente faz pedidos; um pedido tem itens; um item refere-se a um produto».", "**Conceptual model**: a conversation with the business. What are the entities and how do they relate? No types and no technology: «a customer places orders; an order has items; an item refers to a product»."],
        ["**Modelo lógico**: tabelas, colunas, chaves primárias e estrangeiras, normalização. Ainda independe de um produto específico.", "**Logical model**: tables, columns, primary and foreign keys, normalization. Still independent of a specific product."],
        ["**Modelo físico**: tipos de dados do produto escolhido, índices, particionamento, tablespaces. É aqui que entram `bigint`, `numeric(12,2)`, `timestamptz` e as decisões de desempenho.", "**Physical model**: data types of the chosen product, indexes, partitioning, tablespaces. This is where `bigint`, `numeric(12,2)`, `timestamptz` and performance decisions come in."],
      ),
      p(["Um roteiro prático: (1) liste os **substantivos** do requisito: eles são candidatos a entidades; (2) liste os **verbos**: eles viram relações; (3) para cada entidade, escreva os atributos e o identificador; (4) defina a **cardinalidade** de cada relação; (5) escreva as **consultas mais importantes** e confirme que o modelo as responde sem contorcionismo; (6) só então escreva o DDL.", "A practical script: (1) list the **nouns** in the requirement: they are candidate entities; (2) list the **verbs**: they become relationships; (3) for each entity, write the attributes and the identifier; (4) define the **cardinality** of each relationship; (5) write the **most important queries** and confirm the model answers them without contortions; (6) only then write the DDL."]),

      h(["Entidades, atributos e relacionamentos (ER)", "Entities, attributes and relationships (ER)"]),
      p(["O **diagrama entidade-relacionamento (ER)** é a ferramenta clássica. Uma **entidade** é algo sobre o qual guardamos dados e que se distingue das demais (`Customer`). Um **atributo** descreve a entidade (`name`, `email`). Um **relacionamento** liga entidades (`Customer` faz `Order`). Uma entidade vira uma tabela, um atributo vira uma coluna e um relacionamento vira uma chave estrangeira (ou uma tabela de junção).", "The **entity-relationship (ER) diagram** is the classic tool. An **entity** is something we store data about and that is distinguishable from others (`Customer`). An **attribute** describes the entity (`name`, `email`). A **relationship** links entities (`Customer` places `Order`). An entity becomes a table, an attribute becomes a column and a relationship becomes a foreign key (or a junction table)."]),
      fig(["ER simplificado de um e-commerce", "Simplified ER of an e-commerce"],
        [[node("cust", ["customers", "customers"], "data"), node("addr", ["addresses", "addresses"], "data")],
         [node("ord", ["orders", "orders"], "data")],
         [node("item", ["order_items", "order_items"], "data")],
         [node("prod", ["products", "products"], "data"), node("cat", ["categories", "categories"], "data")]],
        [edge("cust", "ord", "1 : N"), edge("cust", "addr", "1 : N"), edge("ord", "item", "1 : N"), edge("item", "prod", "N : 1"), edge("prod", "cat", "N : 1")]),

      h(["Cardinalidades", "Cardinalities"]),
      table([["Cardinalidade", "Cardinality"], ["Exemplo", "Example"], ["Como modelar", "How to model"]],
        [["1 para 1", "One to one"], ["Usuário e perfil detalhado", "User and detailed profile"], ["FK com `UNIQUE` em uma das tabelas (ou a mesma PK)", "FK with `UNIQUE` on one table (or the same PK)"]],
        [["1 para N", "One to many"], ["Cliente e seus pedidos", "Customer and their orders"], ["FK no lado «N» apontando para o «1»", "FK on the «N» side pointing to the «1»"]],
        [["N para N", "Many to many"], ["Produtos e categorias; alunos e cursos", "Products and categories; students and courses"], ["Tabela de junção com duas FKs e PK composta", "Junction table with two FKs and a composite PK"]]),
      p(["A relação N para N nunca cabe numa coluna só: tentar guardar uma lista de ids numa coluna quebra a integridade e impede o uso de índices. Crie a **tabela associativa**, que ainda pode carregar atributos da própria relação (a `quantity` e o `unit_price` de um item de pedido pertencem à ligação entre pedido e produto).", "A many-to-many relationship never fits in a single column: trying to store a list of ids in a column breaks integrity and prevents the use of indexes. Create the **associative table**, which can also carry attributes of the relationship itself (the `quantity` and `unit_price` of an order item belong to the link between order and product)."]),

      h(["Chaves: primária, estrangeira, natural e substituta", "Keys: primary, foreign, natural and surrogate"]),
      ul(
        ["**Chave primária (PK)**: identifica unicamente cada linha, nunca é nula e não deve mudar. O banco cria um índice único para ela.", "**Primary key (PK)**: uniquely identifies each row, is never null and should not change. The database creates a unique index for it."],
        ["**Chave estrangeira (FK)**: coluna que referencia a PK de outra tabela. O banco garante que o valor exista lá e define o que fazer na exclusão (`RESTRICT`, `CASCADE`, `SET NULL`).", "**Foreign key (FK)**: a column that references another table's PK. The database guarantees the value exists there and defines what to do on deletion (`RESTRICT`, `CASCADE`, `SET NULL`)."],
        ["**Chave natural**: um dado do mundo real que já é único (CPF, ISBN, e-mail). Parece conveniente, mas muda (o usuário troca de e-mail) e pode ter exceções.", "**Natural key**: a real-world datum that is already unique (tax id, ISBN, email). It seems convenient, but it changes (the user changes email) and may have exceptions."],
        ["**Chave substituta (surrogate)**: um id artificial (`bigint` auto-incremento ou UUID). Estável e sem significado. Use-a como PK e proteja a chave natural com uma restrição `UNIQUE`.", "**Surrogate key**: an artificial id (auto-increment `bigint` or UUID). Stable and meaningless. Use it as the PK and protect the natural key with a `UNIQUE` constraint."],
      ),
      p(["Entre inteiros sequenciais e UUIDs há um compromisso. Inteiros são compactos e inserem sempre no fim do índice, o que é rápido, mas revelam volume e são difíceis de gerar em vários nós. UUIDs aleatórios (v4) podem ser gerados em qualquer lugar, mas espalham as inserções pelo índice e o tornam maior. UUIDs ordenáveis por tempo (como o v7) e *ULIDs* combinam geração distribuída com inserção quase sequencial.", "Between sequential integers and UUIDs there is a trade-off. Integers are compact and always insert at the end of the index, which is fast, but they reveal volume and are hard to generate across several nodes. Random UUIDs (v4) can be generated anywhere, but scatter inserts across the index and make it bigger. Time-ordered UUIDs (such as v7) and *ULIDs* combine distributed generation with nearly sequential insertion."]),

      h(["Exemplo completo: e-commerce em SQL (PostgreSQL)", "Full example: e-commerce in SQL (PostgreSQL)"]),
      code(`CREATE TABLE customers (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email       text NOT NULL UNIQUE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE addresses (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id  bigint NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  street       text NOT NULL,
  city         text NOT NULL,
  postal_code  text NOT NULL,
  is_default   boolean NOT NULL DEFAULT false
);

CREATE TABLE categories (
  id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  text NOT NULL UNIQUE
);

CREATE TABLE products (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku          text NOT NULL UNIQUE,
  name         text NOT NULL,
  price_cents  integer NOT NULL CHECK (price_cents >= 0),
  stock        integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id  bigint REFERENCES categories(id)
);

CREATE TABLE orders (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id  bigint NOT NULL REFERENCES customers(id),
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','paid','shipped','cancelled')),
  total_cents  integer NOT NULL CHECK (total_cents >= 0),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- N:N entre pedidos e produtos, com atributos da própria ligação
CREATE TABLE order_items (
  order_id          bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        bigint NOT NULL REFERENCES products(id),
  quantity          integer NOT NULL CHECK (quantity > 0),
  unit_price_cents  integer NOT NULL CHECK (unit_price_cents >= 0),
  PRIMARY KEY (order_id, product_id)
);

-- índices de apoio às consultas reais (FKs não ganham índice automático no PostgreSQL)
CREATE INDEX idx_orders_customer_created ON orders (customer_id, created_at DESC);
CREATE INDEX idx_order_items_product ON order_items (product_id);`),
      p(["Repare em algumas decisões. O preço em **centavos inteiros** evita erros de arredondamento de ponto flutuante (para dinheiro, prefira inteiros ou `numeric`, nunca `float`). O `unit_price_cents` é copiado para o item: o preço do produto muda com o tempo, mas o pedido precisa registrar o valor da época. O `CHECK` no status impede valores inválidos. A PK composta de `order_items` impede o mesmo produto duas vezes no mesmo pedido, e o `ON DELETE CASCADE` apaga os itens junto com o pedido. O `timestamptz` guarda o instante com fuso, evitando ambiguidade.", "Note a few decisions. Price in **integer cents** avoids floating-point rounding errors (for money, prefer integers or `numeric`, never `float`). The `unit_price_cents` is copied into the item: the product price changes over time, but the order must record the value of the time. The `CHECK` on status blocks invalid values. The composite PK of `order_items` prevents the same product twice in the same order, and `ON DELETE CASCADE` deletes the items along with the order. `timestamptz` stores the instant with time zone, avoiding ambiguity."]),
      p(["Uma consulta típica que o modelo precisa responder bem: o histórico do cliente com os itens.", "A typical query the model must answer well: the customer's history with items."]),
      code(`SELECT o.id, o.created_at, p.name, oi.quantity, oi.unit_price_cents
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
WHERE o.customer_id = 42
ORDER BY o.created_at DESC
LIMIT 20;`),

      h(["Restrições: deixe o banco proteger os dados", "Constraints: let the database protect the data"]),
      p(["Validar só na aplicação é frágil: há vários serviços, scripts de manutenção e migrações que escrevem direto no banco. Restrições declaradas no esquema valem para todos. As principais são `NOT NULL`, `UNIQUE`, `CHECK`, `FOREIGN KEY` e `PRIMARY KEY`. No PostgreSQL existem ainda restrições de exclusão (`EXCLUDE`), úteis para impedir, por exemplo, duas reservas com intervalos de tempo sobrepostos para a mesma sala.", "Validating only in the application is fragile: there are several services, maintenance scripts and migrations writing straight to the database. Constraints declared in the schema apply to all of them. The main ones are `NOT NULL`, `UNIQUE`, `CHECK`, `FOREIGN KEY` and `PRIMARY KEY`. PostgreSQL also has exclusion constraints (`EXCLUDE`), useful for preventing, say, two reservations with overlapping time ranges for the same room."]),
      p(["Chaves estrangeiras têm custo em gravações em escala extrema e dificultam o sharding, por isso alguns times grandes as omitem e verificam na aplicação. Para a imensa maioria dos sistemas, o custo é pequeno e o benefício de nunca ter um pedido órfão é enorme.", "Foreign keys have a cost on writes at extreme scale and complicate sharding, so some large teams omit them and check in the application. For the vast majority of systems the cost is small and the benefit of never having an orphan order is enormous."]),

      h(["Modelando a partir das consultas e da evolução", "Modeling from queries and evolution"]),
      ul(
        ["**Exclusão lógica (soft delete)**: uma coluna `deleted_at` em vez de apagar de fato preserva histórico e permite desfazer, mas todas as consultas precisam filtrá-la e `UNIQUE` passa a pedir um índice parcial (`WHERE deleted_at IS NULL`).", "**Soft delete**: a `deleted_at` column instead of actually deleting preserves history and allows undo, but every query must filter it and `UNIQUE` then calls for a partial index (`WHERE deleted_at IS NULL`)."],
        ["**Auditoria e histórico**: tabelas de eventos só de inserção (`order_status_history`) respondem «quando o pedido foi enviado?» sem sobrescrever o passado.", "**Audit and history**: insert-only event tables (`order_status_history`) answer «when was the order shipped?» without overwriting the past."],
        ["**Migrações**: alterar um esquema vivo exige cuidado. Adicionar coluna anulável é barato; mudar o tipo de uma coluna grande pode reescrever a tabela e travá-la. Faça em passos: adicione, preencha em lotes, troque o uso, remova.", "**Migrations**: changing a live schema takes care. Adding a nullable column is cheap; changing the type of a big column may rewrite the table and lock it. Do it in steps: add, backfill in batches, switch usage, remove."],
        ["**Multi-tenant**: em SaaS, inclua `tenant_id` nas tabelas e nos índices (como primeira coluna) e considere *row-level security* para isolar os clientes.", "**Multi-tenant**: in SaaS, include `tenant_id` in tables and indexes (as the first column) and consider *row-level security* to isolate customers."],
      ),

      h(["Erros comuns de modelagem", "Common modeling mistakes"]),
      ul(
        ["Listas separadas por vírgula numa coluna (`tags = 'a,b,c'`) em vez de uma tabela associativa.", "Comma-separated lists in a column (`tags = 'a,b,c'`) instead of an associative table."],
        ["Usar `varchar` ou texto para tudo, perdendo validação, ordenação correta e índices eficientes (datas como texto, por exemplo).", "Using `varchar` or text for everything, losing validation, correct ordering and efficient indexes (dates as text, for example)."],
        ["Tabela «deus» com 80 colunas, a maioria nula, misturando conceitos distintos.", "A «god table» with 80 columns, most of them null, mixing distinct concepts."],
        ["Dinheiro em `float`; datas sem fuso horário; booleanos como `'S'/'N'` livres.", "Money in `float`; dates without time zone; booleans as free-form `'Y'/'N'`."],
        ["Esquema genérico demais (EAV: `entity, attribute, value`), que parece flexível mas torna consultas e integridade um pesadelo.", "A schema that is too generic (EAV: `entity, attribute, value`), which seems flexible but makes queries and integrity a nightmare."],
        ["Esquecer índices nas chaves estrangeiras, causando varreduras completas em junções e exclusões em cascata.", "Forgetting indexes on foreign keys, causing full scans in joins and cascading deletes."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Parta do domínio: substantivos viram entidades, verbos viram relações; confirme com as consultas reais.", "Start from the domain: nouns become entities, verbs become relationships; confirm with the real queries."],
        ["1:1, 1:N e N:N definem onde ficam as chaves estrangeiras; N:N pede tabela associativa.", "1:1, 1:N and N:N define where foreign keys go; N:N calls for an associative table."],
        ["Use chave substituta como PK e proteja a chave natural com `UNIQUE`.", "Use a surrogate key as PK and protect the natural key with `UNIQUE`."],
        ["Declare restrições no banco: elas valem para todos os escritores.", "Declare constraints in the database: they apply to every writer."],
        ["Copie no item os valores que não podem mudar retroativamente (como o preço).", "Copy into the item the values that cannot change retroactively (such as price)."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**UUID ou inteiro como PK?** Inteiro (`bigint`) é mais compacto e rápido num banco único; UUID v7 é boa escolha quando ids precisam nascer em vários lugares.", "**UUID or integer as PK?** Integer (`bigint`) is more compact and faster in a single database; UUID v7 is a good choice when ids must be born in several places."],
        ["**Posso ter chave primária composta?** Sim, é natural em tabelas de junção. Em tabelas de entidade, uma chave substituta simples costuma ser mais prática.", "**Can I have a composite primary key?** Yes, it is natural in junction tables. In entity tables a simple surrogate key is usually more practical."],
        ["**Devo usar `ON DELETE CASCADE`?** Para dependências verdadeiras (itens de um pedido), sim; para entidades independentes, prefira `RESTRICT` para evitar apagar dados em cadeia por acidente.", "**Should I use `ON DELETE CASCADE`?** For true dependencies (items of an order), yes; for independent entities prefer `RESTRICT` to avoid accidentally deleting data in a chain."],
        ["**Como guardar fusos horários?** Guarde o instante em UTC (`timestamptz`) e o fuso do usuário à parte, convertendo só na exibição.", "**How to store time zones?** Store the instant in UTC (`timestamptz`) and the user's zone separately, converting only for display."],
      ),
      tip(["Escreva primeiro as cinco consultas mais frequentes e as três mais caras. Se o modelo as responde com junções simples e índices óbvios, está no caminho certo.", "Write the five most frequent and the three most expensive queries first. If the model answers them with simple joins and obvious indexes, you are on the right track."]),
    ] },

  { id: "normalizacao-e-desnormalizacao", section: "bancos", level: 1, icon: "table_chart", minutes: 11,
    title: ["Normalização e desnormalização", "Normalization and denormalization"],
    summary: ["1FN, 2FN, 3FN e BCNF com exemplos antes e depois, e quando vale desnormalizar de propósito.", "1NF, 2NF, 3NF and BCNF with before and after examples, and when it pays to denormalize on purpose."],
    body: [
      p(["**Normalização** é o processo de organizar as tabelas para que cada fato seja guardado **uma única vez**, no lugar certo. Ela existe para evitar três problemas, chamados *anomalias*: de **inserção** (não consigo cadastrar um produto porque ainda não há pedido), de **atualização** (mudei o endereço do cliente em 3 de suas 40 linhas e agora há dados contraditórios) e de **exclusão** (ao apagar o último pedido de um cliente, perco também os dados do cliente). Quanto mais um fato se repete, mais lugares precisam ser mantidos em sincronia, e cedo ou tarde um deles fica para trás.", "**Normalization** is the process of organizing tables so that each fact is stored **exactly once**, in the right place. It exists to avoid three problems called *anomalies*: **insertion** (I cannot register a product because there is no order yet), **update** (I changed the customer's address in 3 of their 40 rows and now there is contradictory data) and **deletion** (deleting a customer's last order also loses the customer's data). The more a fact repeats, the more places must be kept in sync, and sooner or later one is left behind."]),
      p(["As **formas normais** (1FN, 2FN, 3FN, BCNF e outras) são degraus: cada uma exige a anterior e elimina um tipo de redundância. Na prática profissional, mirar a **3FN** (ou a BCNF) é o ponto de partida padrão, e a desnormalização vem depois, medida e justificada.", "The **normal forms** (1NF, 2NF, 3NF, BCNF and others) are steps: each requires the previous one and eliminates a kind of redundancy. In professional practice, aiming for **3NF** (or BCNF) is the default starting point, and denormalization comes later, measured and justified."]),

      h(["Ponto de partida: uma tabela problemática", "Starting point: a problematic table"]),
      p(["Imagine uma planilha importada para o banco, com tudo numa tabela só:", "Imagine a spreadsheet imported into the database, with everything in a single table:"]),
      code(`orders_flat
order_id | customer_name | customer_city | products              | category        | order_date
---------+---------------+---------------+-----------------------+-----------------+-----------
1001     | Ana           | Recife        | Keyboard, Mouse       | Peripherals     | 2025-03-01
1002     | Ana           | Recife        | Monitor               | Displays        | 2025-03-09
1003     | Bruno         | Natal         | Mouse, Cable, Hub     | Peripherals     | 2025-03-10`),
      p(["Os problemas saltam aos olhos: a coluna `products` guarda uma lista, o nome e a cidade da Ana se repetem, e a categoria depende do produto, não do pedido.", "The problems jump out: the `products` column stores a list, Ana's name and city repeat, and the category depends on the product, not on the order."]),

      h(["1FN: valores atômicos", "1NF: atomic values"]),
      p(["Uma tabela está na **primeira forma normal** quando cada célula guarda um único valor (atômico), não há grupos repetidos de colunas (`product1`, `product2`, `product3`) e há uma chave que identifica cada linha. A lista `Keyboard, Mouse` viola a 1FN: não dá para filtrar, indexar nem juntar por produto de forma confiável.", "A table is in **first normal form** when each cell stores a single (atomic) value, there are no repeating groups of columns (`product1`, `product2`, `product3`) and a key identifies each row. The list `Keyboard, Mouse` violates 1NF: you cannot filter, index or join by product reliably."]),
      code(`-- Depois da 1FN: uma linha por (pedido, produto)
order_id | product  | category    | customer_name | customer_city | order_date
---------+----------+-------------+---------------+---------------+-----------
1001     | Keyboard | Peripherals | Ana           | Recife        | 2025-03-01
1001     | Mouse    | Peripherals | Ana           | Recife        | 2025-03-01
1002     | Monitor  | Displays    | Ana           | Recife        | 2025-03-09
1003     | Mouse    | Peripherals | Bruno         | Natal         | 2025-03-10
...                              chave: (order_id, product)`),

      h(["2FN: sem dependência parcial", "2NF: no partial dependency"]),
      p(["A **segunda forma normal** exige a 1FN e que todo atributo não-chave dependa da **chave inteira**, não de só parte dela. Só importa quando a chave é composta. Aqui a chave é `(order_id, product)`, mas `customer_name`, `customer_city` e `order_date` dependem só de `order_id`, e `category` depende só de `product`. Isso é dependência parcial: o nome da Ana repete em cada produto do pedido.", "**Second normal form** requires 1NF and that every non-key attribute depend on the **whole key**, not on just part of it. It only matters when the key is composite. Here the key is `(order_id, product)`, but `customer_name`, `customer_city` and `order_date` depend only on `order_id`, and `category` depends only on `product`. That is a partial dependency: Ana's name repeats for each product in the order."]),
      code(`-- Depois da 2FN: cada fato na tabela da sua chave
orders(order_id PK, customer_name, customer_city, order_date)
products(product PK, category)
order_items(order_id FK, product FK, PRIMARY KEY (order_id, product))`),

      h(["3FN: sem dependência transitiva", "3NF: no transitive dependency"]),
      p(["A **terceira forma normal** exige a 2FN e que nenhum atributo não-chave dependa de outro atributo não-chave. Na tabela `orders`, `customer_city` depende de `customer_name`, que por sua vez depende do pedido: dependência transitiva. Se a Ana mudar de cidade, é preciso atualizar todos os pedidos dela. A solução é extrair o cliente. Uma frase famosa resume as três primeiras formas: todo atributo depende «da chave, da chave inteira e de nada além da chave».", "**Third normal form** requires 2NF and that no non-key attribute depend on another non-key attribute. In the `orders` table, `customer_city` depends on `customer_name`, which in turn depends on the order: a transitive dependency. If Ana moves city, every one of her orders must be updated. The fix is to extract the customer. A famous phrase sums up the first three forms: every attribute depends on «the key, the whole key and nothing but the key»."]),
      code(`-- Depois da 3FN
customers(customer_id PK, name, city)
orders(order_id PK, customer_id FK, order_date)
products(product_id PK, name, category_id FK)
categories(category_id PK, name)
order_items(order_id FK, product_id FK, quantity, PRIMARY KEY (order_id, product_id))`),
      fig(["Da planilha única ao modelo normalizado", "From the single sheet to the normalized model"],
        [[node("flat", ["orders_flat", "orders_flat"], "ext")],
         [node("n1", ["1FN: linhas atômicas", "1NF: atomic rows"], "service")],
         [node("n2", ["2FN: sem parcial", "2NF: no partial"], "service")],
         [node("n3", ["3FN: sem transitiva", "3NF: no transitive"], "service")],
         [node("model", ["customers orders products order_items", "customers orders products order_items"], "data")]],
        [edge("flat", "n1"), edge("n1", "n2"), edge("n2", "n3"), edge("n3", "model")]),

      h(["BCNF: toda dependência vem de uma chave candidata", "BCNF: every dependency comes from a candidate key"]),
      p(["A **forma normal de Boyce-Codd (BCNF)** é uma versão um pouco mais estrita da 3FN: para toda dependência funcional `X → Y`, `X` precisa ser uma chave candidata. A diferença só aparece com várias chaves candidatas que se sobrepõem. Exemplo: numa escola, cada professor leciona uma única disciplina, e um aluno cursa uma disciplina com um só professor.", "**Boyce-Codd normal form (BCNF)** is a slightly stricter version of 3NF: for every functional dependency `X → Y`, `X` must be a candidate key. The difference only shows up with several overlapping candidate keys. Example: in a school, each teacher teaches a single subject, and a student takes a subject with only one teacher."]),
      code(`enrollment(student, subject, teacher)   -- key: (student, subject)
-- regra: teacher -> subject   (teacher não é chave candidata: viola a BCNF)
-- Anomalia: trocar a disciplina do professor exige atualizar várias linhas.

-- Decomposição em BCNF
teacher_subject(teacher PK, subject)
student_teacher(student, teacher, PRIMARY KEY (student, teacher))`),
      p(["Em 4FN e 5FN tratam-se dependências multivaloradas e de junção; raramente são necessárias fora de livros-texto. Em geral, 3FN/BCNF já fecha o assunto.", "4NF and 5NF deal with multivalued and join dependencies; they are rarely needed outside textbooks. In general, 3NF/BCNF closes the subject."]),
      table([["Forma", "Form"], ["Regra", "Rule"], ["Elimina", "Eliminates"]],
        [["1FN", "1NF"], ["Valores atômicos, sem grupos repetidos", "Atomic values, no repeating groups"], ["Listas em células", "Lists in cells"]],
        [["2FN", "2NF"], ["Nada depende de parte da chave", "Nothing depends on part of the key"], ["Dependência parcial", "Partial dependency"]],
        [["3FN", "3NF"], ["Nada depende de atributo não-chave", "Nothing depends on a non-key attribute"], ["Dependência transitiva", "Transitive dependency"]],
        [["BCNF", "BCNF"], ["Todo determinante é chave candidata", "Every determinant is a candidate key"], ["Anomalias com chaves sobrepostas", "Anomalies with overlapping keys"]]),

      h(["O que a normalização compra e quanto custa", "What normalization buys and what it costs"]),
      ul(
        ["**Ganha**: sem contradição (uma fonte para cada fato), menos espaço, atualizações simples e baratas (mudar a cidade é uma linha) e regras de integridade claras.", "**Gains**: no contradiction (one source for each fact), less space, simple and cheap updates (changing the city is one row) and clear integrity rules."],
        ["**Custa**: leituras que precisam de **junções** (`JOIN`) para remontar a informação. Com índices corretos, junções são rápidas; mas em escala muito alta, ou entre máquinas diferentes, tornam-se o gargalo.", "**Costs**: reads that need **joins** (`JOIN`) to reassemble the information. With correct indexes joins are fast; but at very high scale, or across different machines, they become the bottleneck."],
      ),

      h(["Desnormalização: quebrando a regra de propósito", "Denormalization: breaking the rule on purpose"]),
      p(["**Desnormalizar** é introduzir redundância controlada para acelerar leituras ou simplificar o acesso. Nunca é o ponto de partida: é uma otimização aplicada depois de medir um problema real, e o preço é aceitar que agora **o código (ou o banco) é responsável por manter as cópias sincronizadas**. As técnicas mais comuns:", "**Denormalizing** is introducing controlled redundancy to speed up reads or simplify access. It is never the starting point: it is an optimization applied after measuring a real problem, and the price is accepting that **the code (or the database) is now responsible for keeping the copies in sync**. The most common techniques:"]),
      ul(
        ["**Coluna calculada guardada**: `orders.total_cents` em vez de somar os itens a cada leitura.", "**Stored computed column**: `orders.total_cents` instead of summing the items on every read."],
        ["**Contador**: `posts.comment_count` em vez de `COUNT(*)` sobre milhões de comentários.", "**Counter**: `posts.comment_count` instead of `COUNT(*)` over millions of comments."],
        ["**Cópia de campos**: guardar `customer_name` no pedido para evitar a junção na listagem (ou para registrar o nome da época).", "**Field copy**: storing `customer_name` in the order to avoid the join in the listing (or to record the name of the time)."],
        ["**Tabela de resumo / visão materializada**: vendas por dia pré-agregadas.", "**Summary table / materialized view**: pre-aggregated sales per day."],
        ["**Documento embutido**: em bancos de documentos, aninhar os itens no pedido.", "**Embedded document**: in document databases, nesting the items in the order."],
      ),
      p(["Exemplo antes e depois. Antes, a listagem de pedidos precisa de uma junção e de uma agregação:", "A before and after example. Before, the order listing needs a join and an aggregation:"]),
      code(`-- Normalizado: soma os itens a cada leitura
SELECT o.id, c.name, SUM(oi.quantity * oi.unit_price_cents) AS total
FROM orders o
JOIN customers c   ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.created_at >= now() - interval '7 days'
GROUP BY o.id, c.name;`),
      p(["Depois, com o total e o nome copiados para o pedido, a mesma listagem lê uma única tabela:", "After, with the total and name copied into the order, the same listing reads a single table:"]),
      code(`ALTER TABLE orders ADD COLUMN customer_name text, ADD COLUMN total_cents integer;

-- A listagem agora é uma varredura de índice, sem junção
SELECT id, customer_name, total_cents
FROM orders
WHERE created_at >= now() - interval '7 days';

-- Mantendo o total correto numa transação (ou via trigger)
BEGIN;
INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
VALUES (1001, 7, 2, 7900);
UPDATE orders SET total_cents = total_cents + 2 * 7900 WHERE id = 1001;
COMMIT;`),
      p(["Uma alternativa que mantém o modelo normalizado e ainda acelera leituras é a **visão materializada**: o banco guarda o resultado da consulta e você a atualiza sob demanda.", "An alternative that keeps the model normalized and still speeds reads is the **materialized view**: the database stores the query result and you refresh it on demand."]),
      code(`CREATE MATERIALIZED VIEW daily_sales AS
SELECT date_trunc('day', created_at) AS day, SUM(total_cents) AS revenue, COUNT(*) AS orders
FROM orders
WHERE status = 'paid'
GROUP BY 1;

CREATE UNIQUE INDEX ON daily_sales (day);
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales;   -- sem bloquear leituras`),

      h(["Quando normalizar e quando desnormalizar", "When to normalize and when to denormalize"]),
      table([["Situação", "Situation"], ["Recomendação", "Recommendation"]],
        [["Sistema transacional (OLTP) com muitas escritas e regras de integridade", "Transactional system (OLTP) with many writes and integrity rules"], ["Normalize até a 3FN", "Normalize up to 3NF"]],
        [["Leitura muito mais frequente que escrita, e a junção é o gargalo medido", "Reads far more frequent than writes, and the join is the measured bottleneck"], ["Desnormalize o ponto crítico; mantenha o resto normalizado", "Denormalize the critical spot; keep the rest normalized"]],
        [["Relatórios e análise (OLAP, data warehouse)", "Reports and analytics (OLAP, data warehouse)"], ["Esquema estrela, deliberadamente desnormalizado", "Star schema, deliberately denormalized"]],
        [["Banco de documentos ou wide-column", "Document or wide-column database"], ["Modele pelas consultas; duplicar é normal", "Model by the queries; duplicating is normal"]],
        [["Dados históricos que não podem mudar (preço do pedido)", "Historical data that must not change (order price)"], ["Copiar o valor é correto, não é redundância ruim", "Copying the value is correct, not bad redundancy"]]),
      p(["No **esquema estrela** de um data warehouse, uma tabela de fatos (`sales`, enorme e estreita) aponta para tabelas de dimensões (`date`, `product`, `store`) deliberadamente largas e desnormalizadas, porque a análise lê muito e quase nunca atualiza.", "In the **star schema** of a data warehouse, a fact table (`sales`, huge and narrow) points to dimension tables (`date`, `product`, `store`) that are deliberately wide and denormalized, because analytics reads a lot and almost never updates."]),

      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Desnormalizar por palpite, sem medir, e herdar a complexidade de sincronização sem ganho real.", "Denormalizing by guesswork, without measuring, and inheriting the sync complexity with no real gain."],
        ["Copiar um dado e esquecer de atualizá-lo em um dos caminhos de escrita (um job, uma importação, um script manual).", "Copying a datum and forgetting to update it in one of the write paths (a job, an import, a manual script)."],
        ["Normalizar ao extremo: dezenas de tabelas minúsculas para dados que sempre são lidos juntos, como o CEP completo de um endereço.", "Normalizing to the extreme: dozens of tiny tables for data that is always read together, such as the full postal code of an address."],
        ["Confundir desnormalizar com «usar JSON em tudo» e perder integridade sem ganhar velocidade.", "Confusing denormalizing with «using JSON for everything» and losing integrity without gaining speed."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Normalizar é guardar cada fato uma vez para evitar anomalias de inserção, atualização e exclusão.", "Normalizing is storing each fact once to avoid insertion, update and deletion anomalies."],
        ["1FN: atômico. 2FN: a chave inteira. 3FN: nada além da chave. BCNF: todo determinante é chave candidata.", "1NF: atomic. 2NF: the whole key. 3NF: nothing but the key. BCNF: every determinant is a candidate key."],
        ["O custo da normalização são as junções; o da desnormalização é manter as cópias coerentes.", "The cost of normalization is joins; that of denormalization is keeping copies coherent."],
        ["Comece normalizado, meça e desnormalize só os pontos quentes, preferindo visões materializadas e colunas calculadas bem controladas.", "Start normalized, measure and denormalize only hot spots, preferring materialized views and well-controlled computed columns."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Preciso chegar à 5FN?** Quase nunca. 3FN ou BCNF cobre a esmagadora maioria dos sistemas reais.", "**Do I need to reach 5NF?** Almost never. 3NF or BCNF covers the vast majority of real systems."],
        ["**Copiar o preço no item do pedido fere a 3FN?** Formalmente é uma cópia, mas semanticamente é outro fato: o preço pago, que não muda quando o catálogo muda.", "**Does copying the price into the order item violate 3NF?** Formally it is a copy, but semantically it is a different fact: the price paid, which does not change when the catalog changes."],
        ["**Contador desnormalizado ou COUNT(*)?** Com poucos milhares de linhas e índice, `COUNT(*)` basta. Para milhões, o contador evita varreduras, mas exige atualização atômica.", "**Denormalized counter or COUNT(*)?** With a few thousand rows and an index, `COUNT(*)` is enough. For millions, the counter avoids scans but demands atomic updates."],
        ["**Em NoSQL ignoro a normalização?** Não ignore: entenda as dependências e então decida conscientemente o que duplicar.", "**In NoSQL do I ignore normalization?** Do not ignore it: understand the dependencies and then consciously decide what to duplicate."],
      ),
      tip(["Normalize para proteger a verdade, desnormalize para servir a leitura. Quando duplicar, defina qual cópia é a fonte da verdade e como as outras são reconstruídas se ficarem erradas.", "Normalize to protect the truth, denormalize to serve reads. When you duplicate, define which copy is the source of truth and how the others are rebuilt if they go wrong."]),
    ] },

  { id: "indices-e-otimizacao-de-consultas", section: "bancos", level: 1, icon: "manage_search", minutes: 14,
    title: ["Índices e otimização de consultas", "Indexes and query optimization"],
    summary: ["B-tree, hash e GIN, índices compostos e covering, EXPLAIN comentado, N+1, paginação por cursor, locks e níveis de isolamento.", "B-tree, hash and GIN, composite and covering indexes, annotated EXPLAIN, N+1, cursor pagination, locks and isolation levels."],
    body: [
      p(["Uma tabela com 50 milhões de pedidos e a consulta «pedidos do cliente 42» sem índice obriga o banco a ler **todas** as linhas e conferir uma a uma (*sequential scan*). Com um índice na coluna `customer_id`, ele vai direto às linhas certas, em poucos milissegundos. É a diferença entre uma tela que carrega instantaneamente e uma que derruba o banco. Quase todo problema de lentidão em bancos relacionais se resolve com três ferramentas: índices bem escolhidos, leitura de planos de execução (`EXPLAIN`) e consultas que não fazem trabalho desnecessário.", "A table with 50 million orders and the query «orders of customer 42» with no index forces the database to read **every** row and check them one by one (*sequential scan*). With an index on the `customer_id` column, it goes straight to the right rows in a few milliseconds. That is the difference between a screen that loads instantly and one that takes the database down. Almost every slowness problem in relational databases is solved with three tools: well-chosen indexes, reading execution plans (`EXPLAIN`) and queries that do no unnecessary work."]),

      h(["O que é um índice e como a B-tree funciona", "What an index is and how the B-tree works"]),
      p(["Um **índice** é uma estrutura auxiliar, mantida pelo banco, que guarda os valores de uma ou mais colunas **ordenados**, cada um com um ponteiro para a linha na tabela. Funciona como o índice remissivo de um livro. O formato padrão em praticamente todos os bancos relacionais é a **B-tree** (na verdade, a variante B+tree): uma árvore balanceada, larga e rasa, em que cada nó é uma página de disco (8 KB no PostgreSQL) com centenas de chaves.", "An **index** is an auxiliary structure, maintained by the database, that stores the values of one or more columns **sorted**, each with a pointer to the row in the table. It works like the index at the back of a book. The default format in virtually all relational databases is the **B-tree** (actually the B+tree variant): a balanced, wide and shallow tree in which each node is a disk page (8 KB in PostgreSQL) holding hundreds of keys."]),
      fig(["Busca numa B-tree: poucas páginas lidas", "Lookup in a B-tree: few pages read"],
        [[node("q", ["customer_id = 42", "customer_id = 42"], "client")],
         [node("root", ["Raiz: 1-1000 | 1001-2000", "Root: 1-1000 | 1001-2000"], "edge")],
         [node("br", ["Ramo: 1-100 | 101-200", "Branch: 1-100 | 101-200"], "edge")],
         [node("leaf", ["Folha: 40 41 42 43 ...", "Leaf: 40 41 42 43 ..."], "cache")],
         [node("heap", ["Tabela (linhas)", "Table (rows)"], "data")]],
        [edge("q", "root", "1"), edge("root", "br", "2"), edge("br", "leaf", "3"), edge("leaf", "heap", ["ponteiro", "pointer"])]),
      p(["Como cada nó tem centenas de filhos, uma árvore de 3 ou 4 níveis cobre bilhões de linhas: achar uma chave custa de 3 a 4 leituras de página em vez de milhões. As folhas são ligadas em sequência, o que torna **consultas por faixa** (`BETWEEN`, `>`, `ORDER BY`) eficientes: acha-se o começo e caminha-se pelas folhas. O custo é que cada `INSERT`, `UPDATE` e `DELETE` precisa atualizar também os índices (e às vezes dividir páginas), o que deixa as escritas mais lentas e ocupa espaço em disco.", "Since each node has hundreds of children, a tree of 3 or 4 levels covers billions of rows: finding a key costs 3 to 4 page reads instead of millions. Leaves are linked in sequence, which makes **range queries** (`BETWEEN`, `>`, `ORDER BY`) efficient: you find the start and walk the leaves. The cost is that every `INSERT`, `UPDATE` and `DELETE` must also update the indexes (and sometimes split pages), which makes writes slower and takes disk space."]),

      h(["Tipos de índice", "Index types"]),
      table([["Tipo", "Type"], ["Boa para", "Good for"], ["Limitação", "Limitation"]],
        [["B-tree", "B-tree"], ["Igualdade, faixas, ordenação, prefixo (`LIKE 'abc%'`). É o padrão.", "Equality, ranges, ordering, prefix (`LIKE 'abc%'`). It is the default."], ["Não ajuda em `LIKE '%abc'` nem em busca de texto", "Does not help with `LIKE '%abc'` or text search"]],
        [["Hash", "Hash"], ["Somente igualdade exata (`=`), um pouco mais compacto", "Exact equality only (`=`), slightly more compact"], ["Sem faixas nem ordenação", "No ranges or ordering"]],
        [["GIN", "GIN"], ["Colunas com vários valores: `jsonb`, arrays, busca de texto completo (`tsvector`)", "Multi-valued columns: `jsonb`, arrays, full-text search (`tsvector`)"], ["Escrita mais pesada; ideal para dados que mudam pouco", "Heavier writes; ideal for data that changes little"]],
        [["GiST / SP-GiST", "GiST / SP-GiST"], ["Geometria, intervalos, vizinho mais próximo (PostGIS)", "Geometry, ranges, nearest neighbor (PostGIS)"], ["Mais especializados", "More specialized"]],
        [["BRIN", "BRIN"], ["Tabelas enormes cujos valores crescem com a posição física (logs por data)", "Huge tables whose values grow with physical position (logs by date)"], ["Pouco útil se os dados não são correlacionados com a ordem", "Not useful if the data is uncorrelated with order"]]),
      code(`-- B-tree (padrão)
CREATE INDEX idx_orders_customer ON orders (customer_id);

-- Hash: só para igualdade
CREATE INDEX idx_sessions_token ON sessions USING hash (token);

-- GIN: buscar dentro de jsonb
CREATE INDEX idx_products_attrs ON products USING gin (attrs jsonb_path_ops);
SELECT * FROM products WHERE attrs @> '{"color":"red"}';

-- GIN: busca de texto completo
CREATE INDEX idx_posts_fts ON posts USING gin (to_tsvector('english', body));
SELECT id FROM posts WHERE to_tsvector('english', body) @@ to_tsquery('database & index');

-- Índice parcial: só as linhas que interessam (menor e mais rápido)
CREATE INDEX idx_orders_pending ON orders (created_at) WHERE status = 'pending';

-- Índice único: também impõe a regra de integridade
CREATE UNIQUE INDEX idx_customers_email ON customers (lower(email));`),

      h(["Índices compostos e a ordem das colunas", "Composite indexes and column order"]),
      p(["Um índice composto ordena por várias colunas, **primeiro pela primeira, depois pela segunda dentro de cada valor da primeira**, como uma lista telefônica ordenada por sobrenome e depois por nome. Daí vem a regra do **prefixo mais à esquerda**: o índice `(customer_id, created_at)` serve para filtrar por `customer_id`, e por `customer_id` e `created_at` juntos, mas **não** ajuda numa consulta que filtra só por `created_at`, assim como a lista telefônica não ajuda a achar quem se chama «Maria» sem saber o sobrenome.", "A composite index sorts by several columns, **first by the first, then by the second within each value of the first**, like a phone book sorted by last name and then first name. Hence the **leftmost prefix** rule: the index `(customer_id, created_at)` serves filtering by `customer_id`, and by `customer_id` and `created_at` together, but **does not** help a query that filters only by `created_at`, just as a phone book does not help find someone called «Maria» without the last name."]),
      code(`CREATE INDEX idx_orders_cust_date ON orders (customer_id, created_at DESC);

-- Usa o índice por completo (igualdade na 1a coluna, faixa/ordem na 2a)
SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 20;

-- Usa o índice só pela 1a coluna
SELECT * FROM orders WHERE customer_id = 42;

-- NÃO usa bem o índice (falta a coluna inicial)
SELECT * FROM orders WHERE created_at > now() - interval '1 day';`),
      p(["A regra de ouro para ordenar as colunas: **igualdade primeiro, faixa por último**. Colunas comparadas com `=` vêm antes; a coluna com `>`, `<`, `BETWEEN` ou usada em `ORDER BY` vem depois. Entre duas colunas de igualdade, a mais seletiva (que descarta mais linhas) costuma ir antes, mas a necessidade de reaproveitar o índice em várias consultas pesa mais do que isso.", "The golden rule for ordering columns: **equality first, range last**. Columns compared with `=` come first; the column with `>`, `<`, `BETWEEN` or used in `ORDER BY` comes after. Between two equality columns, the more selective one (that discards more rows) usually goes first, but the need to reuse the index across several queries weighs more than that."]),

      h(["Índice covering e index-only scan", "Covering index and index-only scan"]),
      p(["Normalmente o banco usa o índice para achar a linha e depois vai à tabela buscar as demais colunas (um salto extra por linha). Se **todas as colunas que a consulta precisa estão no próprio índice**, ele responde sozinho: é uma *index-only scan*. No PostgreSQL, `INCLUDE` adiciona colunas à folha do índice sem fazer parte da chave de ordenação.", "Normally the database uses the index to find the row and then goes to the table to fetch the other columns (an extra hop per row). If **all the columns the query needs are in the index itself**, it answers alone: an *index-only scan*. In PostgreSQL, `INCLUDE` adds columns to the index leaf without making them part of the sort key."]),
      code(`CREATE INDEX idx_orders_cust_cover
  ON orders (customer_id, created_at DESC) INCLUDE (status, total_cents);

-- Atendida só pelo índice, sem tocar na tabela
SELECT created_at, status, total_cents
FROM orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 20;`),

      h(["Lendo o EXPLAIN", "Reading EXPLAIN"]),
      p(["`EXPLAIN` mostra o plano que o otimizador escolheu; `EXPLAIN (ANALYZE, BUFFERS)` **executa** a consulta e mostra os tempos e contagens reais. É a principal ferramenta de diagnóstico: otimize com base no plano, nunca por intuição.", "`EXPLAIN` shows the plan the optimizer chose; `EXPLAIN (ANALYZE, BUFFERS)` **runs** the query and shows real timings and counts. It is the main diagnostic tool: optimize based on the plan, never on intuition."]),
      code(`EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 20;

-- ANTES (sem índice):
Limit  (cost=1045300.12..1045300.17 rows=20) (actual time=1480.2..1480.3 rows=20 loops=1)
  ->  Sort  (cost=1045300.12..1045312.40 rows=4912)      -- ordena tudo que achou
        Sort Key: created_at DESC
        ->  Seq Scan on orders                            -- le a tabela INTEIRA
              (cost=0.00..1044900.00 rows=4912) (actual time=0.1..1470.5 rows=4871 loops=1)
              Filter: (customer_id = 42)
              Rows Removed by Filter: 49995129            -- 50 milhoes descartadas
Execution Time: 1480.6 ms

-- DEPOIS (CREATE INDEX idx_orders_cust_date ON orders (customer_id, created_at DESC)):
Limit  (cost=0.56..38.12 rows=20) (actual time=0.04..0.09 rows=20 loops=1)
  ->  Index Scan using idx_orders_cust_date on orders       -- ja vem ordenado
        Index Cond: (customer_id = 42)                      -- usa o indice
Execution Time: 0.11 ms`),
      ul(
        ["**Seq Scan**: leitura da tabela inteira. Normal para tabelas pequenas ou quando a consulta devolve grande parte das linhas; suspeito quando filtra poucas.", "**Seq Scan**: reads the whole table. Normal for small tables or when the query returns a large share of rows; suspicious when it filters few."],
        ["**Index Scan / Index Only Scan / Bitmap Heap Scan**: usam índice; o bitmap é comum quando muitas linhas casam.", "**Index Scan / Index Only Scan / Bitmap Heap Scan**: use an index; bitmap is common when many rows match."],
        ["**cost** é uma estimativa em unidades abstratas; **actual time** e **rows** são medidas. Se `rows` estimado e real divergem muito, as estatísticas estão velhas: rode `ANALYZE`.", "**cost** is an estimate in abstract units; **actual time** and **rows** are measurements. If estimated and actual `rows` differ a lot, statistics are stale: run `ANALYZE`."],
        ["**Nested Loop / Hash Join / Merge Join**: estratégias de junção; hash costuma ganhar em grandes volumes sem índice.", "**Nested Loop / Hash Join / Merge Join**: join strategies; hash usually wins on large volumes without an index."],
        ["**Sort** com `external merge` indica ordenação em disco: falta índice ou `work_mem`.", "**Sort** with `external merge` indicates on-disk sorting: missing index or `work_mem`."],
      ),

      h(["Por que o índice às vezes não é usado", "Why the index is sometimes not used"]),
      ul(
        ["**Função na coluna**: `WHERE lower(email) = 'a@b.com'` ignora o índice em `email`. Crie o índice na expressão (`lower(email)`).", "**Function on the column**: `WHERE lower(email) = 'a@b.com'` ignores the index on `email`. Create the index on the expression (`lower(email)`)."],
        ["**Conversão de tipo**: comparar coluna texto com número, ou `bigint` com `numeric`, pode forçar conversão linha a linha.", "**Type conversion**: comparing a text column with a number, or `bigint` with `numeric`, may force row-by-row conversion."],
        ["**Curinga à esquerda**: `LIKE '%abc'` não usa B-tree; use trigramas (`pg_trgm` com GIN) ou busca de texto completo.", "**Leading wildcard**: `LIKE '%abc'` does not use a B-tree; use trigrams (`pg_trgm` with GIN) or full-text search."],
        ["**Baixa seletividade**: se o filtro devolve 40% da tabela, a leitura sequencial é mais barata e o otimizador faz bem em ignorar o índice. Índice em coluna booleana raramente compensa (use índice parcial).", "**Low selectivity**: if the filter returns 40% of the table, a sequential read is cheaper and the optimizer rightly ignores the index. An index on a boolean column rarely pays off (use a partial index)."],
        ["**Estatísticas desatualizadas** ou tabela minúscula.", "**Stale statistics** or a tiny table."],
      ),

      h(["O problema N+1", "The N+1 problem"]),
      p(["Acontece quando o código faz **uma consulta para a lista** e depois **uma consulta por item** para buscar dados relacionados. Para 100 pedidos são 101 idas ao banco, cada uma com sua latência de rede; é um dos problemas de desempenho mais comuns em aplicações com ORM, porque o código parece inocente.", "It happens when the code runs **one query for the list** and then **one query per item** to fetch related data. For 100 orders that is 101 trips to the database, each with its network latency; it is one of the most common performance problems in ORM-based applications, because the code looks innocent."]),
      code(`// N+1: 1 consulta + 1 por pedido
const orders = await db.query("SELECT * FROM orders WHERE customer_id = $1", [42]);
for (const o of orders) {
  o.items = await db.query("SELECT * FROM order_items WHERE order_id = $1", [o.id]); // N vezes
}

// Correto 1: uma consulta com JOIN
const rows = await db.query(
  "SELECT o.id, oi.product_id, oi.quantity FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.customer_id = $1", [42]);

// Correto 2: duas consultas no total, com IN / ANY
const ids = orders.map((o) => o.id);
const items = await db.query("SELECT * FROM order_items WHERE order_id = ANY($1)", [ids]);`),
      p(["Em ORMs, procure o recurso de *eager loading* (`include`, `select_related`, `prefetch_related`, `JOIN FETCH`). Para detectar, habilite o log de consultas em desenvolvimento ou use `pg_stat_statements` em produção e procure a mesma consulta executada milhares de vezes.", "In ORMs, look for the *eager loading* feature (`include`, `select_related`, `prefetch_related`, `JOIN FETCH`). To detect it, enable query logging in development or use `pg_stat_statements` in production and look for the same query run thousands of times."]),

      h(["Paginação: OFFSET x cursor (keyset)", "Pagination: OFFSET vs cursor (keyset)"]),
      p(["`LIMIT 20 OFFSET 100000` parece simples, mas o banco precisa **gerar e descartar** as 100.000 linhas anteriores: o custo cresce linearmente com a página, e as linhas ainda podem se repetir ou sumir se houver inserções durante a navegação. A **paginação por cursor** (ou *keyset*) usa a última linha vista como ponto de partida e aproveita o índice, com custo constante em qualquer profundidade.", "`LIMIT 20 OFFSET 100000` looks simple, but the database must **generate and discard** the previous 100,000 rows: the cost grows linearly with the page, and rows may still repeat or vanish if there are inserts during navigation. **Cursor** (or *keyset*) **pagination** uses the last row seen as the starting point and leverages the index, with constant cost at any depth."]),
      code(`-- OFFSET: cada página mais profunda fica mais lenta
SELECT id, created_at FROM orders ORDER BY created_at DESC, id DESC LIMIT 20 OFFSET 100000;

-- Cursor: a página seguinte parte do último (created_at, id) recebido
SELECT id, created_at
FROM orders
WHERE (created_at, id) < ('2025-03-04 12:30:00+00', 9812345)
ORDER BY created_at DESC, id DESC
LIMIT 20;
-- índice de apoio: CREATE INDEX ON orders (created_at DESC, id DESC);`),
      p(["O `id` entra como desempate para que a ordem seja total e estável. A API devolve um *cursor* opaco (o par codificado em base64) e o cliente o envia de volta para pedir a próxima página. A limitação é não permitir «pular para a página 37», o que na prática raramente importa em feeds e listas infinitas.", "The `id` joins as a tiebreaker so that the order is total and stable. The API returns an opaque *cursor* (the pair encoded in base64) and the client sends it back to request the next page. The limitation is not being able to «jump to page 37», which in practice rarely matters in feeds and infinite lists."]),

      h(["Locks e níveis de isolamento", "Locks and isolation levels"]),
      p(["Quando duas transações mexem nas mesmas linhas, o banco precisa coordená-las. O **MVCC** (*multi-version concurrency control*), usado por PostgreSQL, MySQL/InnoDB e Oracle, mantém várias versões de cada linha, de modo que **leitores não bloqueiam escritores e vice-versa**. Já as escritas concorrentes na mesma linha usam **locks**: a segunda transação espera a primeira terminar. Esperas circulares (A espera B, B espera A) são **deadlocks**; o banco detecta e aborta uma das transações, e a aplicação deve estar pronta para repetir.", "When two transactions touch the same rows, the database must coordinate them. **MVCC** (*multi-version concurrency control*), used by PostgreSQL, MySQL/InnoDB and Oracle, keeps several versions of each row, so **readers do not block writers and vice versa**. Concurrent writes to the same row use **locks**: the second transaction waits for the first to finish. Circular waits (A waits for B, B waits for A) are **deadlocks**; the database detects them and aborts one of the transactions, and the application must be ready to retry."]),
      table([["Nível", "Level"], ["Anomalias possíveis (padrão SQL)", "Possible anomalies (SQL standard)"], ["Observação", "Note"]],
        [["Read Uncommitted", "Read Uncommitted"], ["Leitura suja, não repetível, fantasma", "Dirty read, non-repeatable, phantom"], ["No PostgreSQL se comporta como Read Committed", "In PostgreSQL behaves like Read Committed"]],
        [["Read Committed", "Read Committed"], ["Não repetível, fantasma", "Non-repeatable, phantom"], ["Padrão do PostgreSQL: cada comando vê o que já foi confirmado", "PostgreSQL default: each statement sees what is already committed"]],
        [["Repeatable Read", "Repeatable Read"], ["Fantasma (no PostgreSQL, não ocorre)", "Phantom (does not occur in PostgreSQL)"], ["Padrão do MySQL/InnoDB; a transação vê um retrato fixo", "MySQL/InnoDB default; the transaction sees a fixed snapshot"]],
        [["Serializable", "Serializable"], ["Nenhuma: equivale a execução em série", "None: equivalent to serial execution"], ["Pode abortar com erro de serialização: é preciso repetir", "May abort with a serialization error: retry is needed"]]),
      ul(
        ["**Leitura suja**: ler dado que outra transação ainda não confirmou e pode desfazer.", "**Dirty read**: reading data another transaction has not committed and may roll back."],
        ["**Leitura não repetível**: ler a mesma linha duas vezes e ver valores diferentes.", "**Non-repeatable read**: reading the same row twice and seeing different values."],
        ["**Fantasma**: repetir uma consulta por faixa e ver linhas novas aparecerem.", "**Phantom**: repeating a range query and seeing new rows appear."],
      ),
      p(["Um caso clássico é o *lost update*: duas transações leem o saldo 100, ambas somam 10 e gravam 110, quando o correto seria 120. Soluções: o **lock pessimista** com `SELECT ... FOR UPDATE`, o **lock otimista** com uma coluna de versão, ou simplesmente um `UPDATE` atômico.", "A classic case is the *lost update*: two transactions read balance 100, both add 10 and write 110, when the correct value would be 120. Solutions: **pessimistic locking** with `SELECT ... FOR UPDATE`, **optimistic locking** with a version column, or simply an atomic `UPDATE`."]),
      code(`-- 1) UPDATE atômico (o melhor quando basta)
UPDATE accounts SET balance = balance + 10 WHERE id = 1;

-- 2) Lock pessimista: bloqueia a linha até o COMMIT
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
UPDATE accounts SET balance = 110 WHERE id = 1;
COMMIT;

-- 3) Lock otimista: só grava se a versão não mudou
UPDATE products SET stock = stock - 1, version = version + 1
WHERE id = 7 AND version = 12;     -- 0 linhas afetadas = conflito: reler e tentar de novo

-- Fila de trabalho sem disputa: pula linhas já travadas
SELECT id FROM jobs WHERE status = 'new' ORDER BY id LIMIT 10 FOR UPDATE SKIP LOCKED;`),

      h(["Outras práticas de otimização", "Other optimization practices"]),
      ul(
        ["Evite `SELECT *`: traga só as colunas necessárias (menos dados na rede e possibilidade de index-only scan).", "Avoid `SELECT *`: fetch only the needed columns (less data on the wire and the possibility of an index-only scan)."],
        ["Use **pool de conexões** (PgBouncer, pool do driver): abrir conexão por requisição é caro e o PostgreSQL tem um processo por conexão.", "Use a **connection pool** (PgBouncer, driver pool): opening a connection per request is expensive and PostgreSQL has one process per connection."],
        ["Agrupe gravações: inserir 1.000 linhas num único `INSERT` ou `COPY` é muito mais rápido do que 1.000 comandos.", "Batch writes: inserting 1,000 rows in a single `INSERT` or `COPY` is much faster than 1,000 statements."],
        ["Rode `ANALYZE` (o autovacuum normalmente já faz) e monitore *bloat* e consultas lentas com `pg_stat_statements`.", "Run `ANALYZE` (autovacuum usually does) and monitor bloat and slow queries with `pg_stat_statements`."],
        ["Remova índices que ninguém usa (`pg_stat_user_indexes`): cada um custa em toda escrita.", "Drop indexes nobody uses (`pg_stat_user_indexes`): each costs on every write."],
        ["Crie índices em produção com `CREATE INDEX CONCURRENTLY` para não bloquear escritas.", "Create indexes in production with `CREATE INDEX CONCURRENTLY` so as not to block writes."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Índices B-tree transformam varreduras em buscas de poucas páginas, mas custam espaço e velocidade de escrita.", "B-tree indexes turn scans into few-page lookups but cost space and write speed."],
        ["Compostos obedecem ao prefixo à esquerda: igualdade primeiro, faixa por último; covering evita ir à tabela.", "Composite indexes obey the left prefix: equality first, range last; covering avoids going to the table."],
        ["Use `EXPLAIN (ANALYZE, BUFFERS)` e compare estimado com real.", "Use `EXPLAIN (ANALYZE, BUFFERS)` and compare estimated with actual."],
        ["Combata N+1 com JOIN ou carregamento em lote; pagine por cursor, não por OFFSET.", "Fight N+1 with JOIN or batch loading; paginate by cursor, not OFFSET."],
        ["Entenda MVCC, locks, deadlocks e os níveis de isolamento antes de confiar em transações concorrentes.", "Understand MVCC, locks, deadlocks and isolation levels before trusting concurrent transactions."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Quantos índices posso ter?** Não há limite fixo, mas cada um custa nas escritas. Crie para as consultas reais e remova os não usados.", "**How many indexes can I have?** There is no fixed limit, but each costs on writes. Create them for real queries and drop unused ones."],
        ["**A PK já tem índice?** Sim, e `UNIQUE` também. Já a FK, no PostgreSQL, não ganha índice automático.", "**Does the PK already have an index?** Yes, and so does `UNIQUE`. The FK, in PostgreSQL, does not get one automatically."],
        ["**Índice em coluna com muitos nulos ou poucos valores distintos ajuda?** Raramente; prefira índice parcial.", "**Does an index on a column with many nulls or few distinct values help?** Rarely; prefer a partial index."],
        ["**Serializable é sempre melhor?** Mais seguro, porém com abortos e menos throughput. Use onde a invariante é crítica e trate a repetição.", "**Is Serializable always better?** Safer, but with aborts and less throughput. Use it where the invariant is critical and handle retries."],
      ),
      tip(["Antes de criar um índice, escreva a consulta que ele vai atender e confirme no `EXPLAIN` que o plano mudou. Índice que não aparece em nenhum plano é só custo.", "Before creating an index, write the query it will serve and confirm in `EXPLAIN` that the plan changed. An index that appears in no plan is just cost."]),
    ] },

  { id: "block-object-e-file-storage", section: "bancos", level: 1, icon: "storage", minutes: 11,
    title: ["Armazenamento: bloco, objeto e arquivo", "Storage: block, object and file"],
    summary: ["Block, object e file storage com tabela comparativa (EBS, S3, EFS, SAN, NAS), durabilidade, classes de armazenamento e URL pré-assinada.", "Block, object and file storage with a comparison table (EBS, S3, EFS, SAN, NAS), durability, storage classes and presigned URLs."],
    body: [
      p(["Nem todo dado pertence a um banco de dados. Fotos de perfil, vídeos, backups, logs, PDFs e artefatos de build são **blobs**: arquivos grandes, quase sempre lidos ou gravados por inteiro, sem necessidade de consulta por campos. Colocá-los numa tabela infla o banco, torna os backups lentos e gasta a memória do cache com bytes que o banco nem consegue interpretar. O armazenamento em nuvem e em datacenters se divide em três modelos, que diferem em **como o dado é endereçado** e **quem organiza a estrutura**: bloco, arquivo e objeto.", "Not all data belongs in a database. Profile photos, videos, backups, logs, PDFs and build artifacts are **blobs**: large files, almost always read or written whole, with no need for querying by field. Putting them in a table bloats the database, slows backups and wastes cache memory on bytes the database cannot even interpret. Cloud and datacenter storage splits into three models that differ in **how data is addressed** and **who organizes the structure**: block, file and object."]),

      h(["Armazenamento em bloco (block storage)", "Block storage"]),
      p(["O armazenamento em **bloco** expõe ao servidor um dispositivo bruto, como um disco: uma sequência de blocos de tamanho fixo (por exemplo, 4 KB) endereçados por posição. O servidor instala um sistema de arquivos (ext4, XFS, NTFS) ou entrega o dispositivo direto a um banco de dados, que gerencia os blocos por conta própria. Oferece a **menor latência** e permite leituras e escritas pequenas e aleatórias (alterar 4 KB no meio de um arquivo de 1 TB), com IOPS e vazão provisionáveis.", "**Block** storage exposes to the server a raw device, like a disk: a sequence of fixed-size blocks (for example, 4 KB) addressed by position. The server installs a file system (ext4, XFS, NTFS) or hands the device straight to a database, which manages the blocks itself. It offers the **lowest latency** and allows small random reads and writes (changing 4 KB in the middle of a 1 TB file), with provisionable IOPS and throughput."]),
      ul(
        ["**Exemplos em nuvem**: Amazon EBS, Google Persistent Disk e Hyperdisk, Azure Managed Disks. **On-premises**: **SAN** (*Storage Area Network*), uma rede dedicada (Fibre Channel ou iSCSI) que entrega volumes a vários servidores.", "**Cloud examples**: Amazon EBS, Google Persistent Disk and Hyperdisk, Azure Managed Disks. **On-premises**: **SAN** (*Storage Area Network*), a dedicated network (Fibre Channel or iSCSI) that delivers volumes to several servers."],
        ["**Uso típico**: discos de máquinas virtuais, bancos de dados (PostgreSQL, MySQL), sistemas que exigem baixa latência e acesso aleatório.", "**Typical use**: virtual machine disks, databases (PostgreSQL, MySQL), systems requiring low latency and random access."],
        ["**Limitação**: normalmente um volume é anexado a uma instância por vez e fica numa zona de disponibilidade; para sobreviver à perda da zona é preciso replicar ou usar *snapshots*.", "**Limitation**: usually a volume is attached to one instance at a time and lives in one availability zone; to survive losing the zone you must replicate or use *snapshots*."],
      ),

      h(["Armazenamento de arquivos (file storage)", "File storage"]),
      p(["O armazenamento de **arquivos** oferece uma hierarquia de diretórios e arquivos acessada por um protocolo de rede, **NFS** (Unix/Linux) ou **SMB/CIFS** (Windows), e permite que **vários servidores montem o mesmo sistema ao mesmo tempo**. Ele cuida de permissões, travas de arquivo e semântica POSIX (renomear, anexar, bloquear trechos). A latência é maior do que a do bloco, mas o compartilhamento é a grande vantagem.", "**File** storage offers a hierarchy of directories and files accessed over a network protocol, **NFS** (Unix/Linux) or **SMB/CIFS** (Windows), and lets **several servers mount the same file system at once**. It handles permissions, file locks and POSIX semantics (rename, append, range lock). Latency is higher than block, but sharing is the big advantage."]),
      ul(
        ["**Exemplos**: Amazon EFS e FSx, Google Filestore, Azure Files; **NAS** (*Network Attached Storage*) em ambiente local.", "**Examples**: Amazon EFS and FSx, Google Filestore, Azure Files; **NAS** (*Network Attached Storage*) on-premises."],
        ["**Uso típico**: diretórios home, conteúdo compartilhado entre servidores web (uploads de um CMS), pipelines de mídia, migração de aplicações legadas que esperam um sistema de arquivos.", "**Typical use**: home directories, content shared among web servers (CMS uploads), media pipelines, migration of legacy applications that expect a file system."],
        ["**Limitação**: escala menos que objeto, é mais cara por GB e a latência dos metadados pesa em milhões de arquivos pequenos.", "**Limitation**: scales less than object, costs more per GB and metadata latency hurts with millions of small files."],
      ),

      h(["Armazenamento de objetos (object storage)", "Object storage"]),
      p(["No **object storage**, não há diretórios reais nem blocos visíveis. Cada **objeto** (os bytes, os metadados e uma chave única) vive em um **bucket** e é acessado por **HTTP** (`PUT`, `GET`, `DELETE`). A «pasta» `fotos/2025/a.jpg` é só um prefixo na chave. Objetos são, em geral, **imutáveis**: para alterar, regrava-se o objeto inteiro (ou cria-se uma nova versão). Em troca, a capacidade é praticamente ilimitada, o custo por GB é o menor dos três e a durabilidade é altíssima.", "In **object storage** there are no real directories or visible blocks. Each **object** (the bytes, metadata and a unique key) lives in a **bucket** and is accessed over **HTTP** (`PUT`, `GET`, `DELETE`). The «folder» `photos/2025/a.jpg` is just a key prefix. Objects are generally **immutable**: to change one, you rewrite the whole object (or create a new version). In exchange, capacity is practically unlimited, cost per GB is the lowest of the three and durability is very high."]),
      ul(
        ["**Exemplos**: Amazon S3, Google Cloud Storage, Azure Blob Storage, e opções autohospedadas compatíveis com a API do S3, como MinIO e Ceph.", "**Examples**: Amazon S3, Google Cloud Storage, Azure Blob Storage, and self-hosted S3-API-compatible options such as MinIO and Ceph."],
        ["**Uso típico**: mídia de usuários, backups e arquivamento, *data lakes*, sites estáticos, artefatos de build, logs.", "**Typical use**: user media, backups and archives, data lakes, static sites, build artifacts, logs."],
        ["**Limitação**: latência de dezenas de milissegundos por requisição, sem edição parcial, e a consistência e a listagem têm nuances (hoje o S3 oferece consistência forte de leitura após escrita).", "**Limitation**: tens of milliseconds of latency per request, no partial editing, and consistency and listing have nuances (today S3 offers strong read-after-write consistency)."],
      ),
      fig(["Quem acessa cada tipo de armazenamento", "Who accesses each storage type"],
        [[node("vm", ["Servidor / VM", "Server / VM"], "service"), node("web", ["Servidores web (vários)", "Web servers (several)"], "service"), node("cl", ["App ou navegador", "App or browser"], "client")],
         [node("blk", ["Bloco: EBS, SAN", "Block: EBS, SAN"], "data"), node("fil", ["Arquivo: EFS, NAS", "File: EFS, NAS"], "data"), node("obj", ["Objeto: S3", "Object: S3"], "data")]],
        [edge("vm", "blk", ["disco bruto", "raw disk"]), edge("web", "fil", "NFS / SMB"), edge("cl", "obj", "HTTP")]),

      h(["Comparação direta", "Direct comparison"]),
      table([["Critério", "Criterion"], ["Bloco", "Block"], ["Arquivo", "File"], ["Objeto", "Object"]],
        [["Unidade", "Unit"], ["Bloco de tamanho fixo", "Fixed-size block"], ["Arquivo em diretório", "File in a directory"], ["Objeto com chave e metadados", "Object with key and metadata"]],
        [["Acesso", "Access"], ["Dispositivo (iSCSI, NVMe)", "Device (iSCSI, NVMe)"], ["NFS, SMB", "NFS, SMB"], ["API HTTP (REST)", "HTTP API (REST)"]],
        [["Latência", "Latency"], ["Menor (sub-milissegundo a poucos ms)", "Lowest (sub-millisecond to a few ms)"], ["Média (ms)", "Medium (ms)"], ["Maior (dezenas de ms)", "Highest (tens of ms)"]],
        [["Edição parcial", "Partial edit"], ["Sim, por bloco", "Yes, per block"], ["Sim, por trecho", "Yes, per range"], ["Não: reescreve o objeto", "No: rewrites the object"]],
        [["Compartilhamento", "Sharing"], ["Em geral 1 servidor por vez", "Usually 1 server at a time"], ["Muitos servidores ao mesmo tempo", "Many servers at once"], ["Qualquer cliente HTTP, em escala global", "Any HTTP client, at global scale"]],
        [["Escala", "Scale"], ["Terabytes por volume", "Terabytes per volume"], ["Terabytes a petabytes", "Terabytes to petabytes"], ["Praticamente ilimitada", "Practically unlimited"]],
        [["Custo por GB", "Cost per GB"], ["Alto", "High"], ["Médio a alto", "Medium to high"], ["Baixo", "Low"]],
        [["Exemplos", "Examples"], ["EBS, Persistent Disk, SAN", "EBS, Persistent Disk, SAN"], ["EFS, Filestore, Azure Files, NAS", "EFS, Filestore, Azure Files, NAS"], ["S3, GCS, Azure Blob, MinIO", "S3, GCS, Azure Blob, MinIO"]],
        [["Melhor para", "Best for"], ["Bancos e VMs", "Databases and VMs"], ["Diretórios compartilhados e legado", "Shared directories and legacy"], ["Mídia, backups, data lakes", "Media, backups, data lakes"]]),

      h(["Durabilidade e disponibilidade", "Durability and availability"]),
      p(["**Durabilidade** é a probabilidade de **não perder** um dado ao longo do tempo; **disponibilidade** é a fração do tempo em que o serviço responde. São coisas diferentes: um serviço pode ficar fora do ar por uma hora sem perder nenhum byte. Os serviços de objetos publicam durabilidade na casa de **onze noves** (99,999999999%) para as classes padrão do S3, o que, em termos estatísticos, significa perder em média um objeto a cada 10 milhões de anos se você guardar 10 milhões de objetos. Isso é obtido replicando (ou usando *erasure coding*) os dados em **várias zonas de disponibilidade** e verificando continuamente a integridade com somas de verificação. Já a disponibilidade fica em torno de 99,9% a 99,99%, conforme a classe.", "**Durability** is the probability of **not losing** data over time; **availability** is the fraction of time the service responds. They are different things: a service may be down for an hour without losing a single byte. Object services publish durability at **eleven nines** (99.999999999%) for the standard S3 classes, which, statistically, means losing on average one object every 10 million years if you store 10 million objects. This is achieved by replicating (or using *erasure coding*) data across **several availability zones** and continuously checking integrity with checksums. Availability sits around 99.9% to 99.99%, depending on the class."]),
      p(["Durabilidade não substitui **backup**. Se um desenvolvedor apagar o bucket ou um bug sobrescrever os objetos, a replicação fiel propaga o erro. Proteja com **versionamento** (o objeto antigo continua recuperável), *object lock* (imutabilidade por um período), replicação entre regiões e MFA para exclusão.", "Durability does not replace **backup**. If a developer deletes the bucket or a bug overwrites the objects, faithful replication propagates the error. Protect with **versioning** (the old object remains recoverable), *object lock* (immutability for a period), cross-region replication and MFA delete."]),

      h(["Classes de armazenamento e ciclo de vida", "Storage classes and lifecycle"]),
      p(["Dado quente (acessado todo dia) e dado frio (acessado uma vez por ano) não deveriam custar o mesmo. Os provedores oferecem **classes**: quanto mais barato o GB armazenado, mais caro é recuperar e, nas mais frias, mais lenta a recuperação. As **regras de ciclo de vida** movem objetos entre classes ou os excluem automaticamente.", "Hot data (accessed daily) and cold data (accessed once a year) should not cost the same. Providers offer **classes**: the cheaper the stored GB, the more expensive the retrieval and, in the coldest ones, the slower it is. **Lifecycle rules** move objects between classes or delete them automatically."]),
      table([["Camada (exemplos no S3)", "Tier (S3 examples)"], ["Acesso", "Access"], ["Uso típico", "Typical use"]],
        [["Standard", "Standard"], ["Frequente, milissegundos", "Frequent, milliseconds"], ["Mídia ativa, conteúdo de site", "Active media, site content"]],
        [["Intelligent-Tiering", "Intelligent-Tiering"], ["Padrão imprevisível; move sozinho", "Unpredictable pattern; moves itself"], ["Dados com acesso incerto", "Data with uncertain access"]],
        [["Standard-IA / One Zone-IA", "Standard-IA / One Zone-IA"], ["Raro, com taxa de recuperação", "Rare, with a retrieval fee"], ["Backups recentes, dados secundários", "Recent backups, secondary data"]],
        [["Glacier (Instant / Flexible / Deep Archive)", "Glacier (Instant / Flexible / Deep Archive)"], ["Muito raro; de ms a horas de espera", "Very rare; from ms to hours of wait"], ["Arquivos de conformidade, retenção de anos", "Compliance archives, multi-year retention"]]),
      code(`{
  "Rules": [{
    "ID": "tier-and-expire-logs",
    "Status": "Enabled",
    "Filter": { "Prefix": "logs/" },
    "Transitions": [
      { "Days": 30,  "StorageClass": "STANDARD_IA" },
      { "Days": 180, "StorageClass": "GLACIER" }
    ],
    "Expiration": { "Days": 1825 }
  }]
}`),

      h(["Upload e download com URL pré-assinada", "Upload and download with presigned URLs"]),
      p(["Um erro comum é receber o arquivo no backend e reenviá-lo ao bucket: o servidor vira gargalo de banda e memória. O padrão correto é o **upload direto**: a aplicação gera uma **URL pré-assinada** (*presigned URL*), um link temporário com assinatura criptográfica que autoriza **uma operação específica** (por exemplo, um `PUT` naquele objeto) por poucos minutos, sem expor as credenciais. O cliente envia o arquivo direto ao storage, e o backend só guarda a chave do objeto no banco.", "A common mistake is receiving the file in the backend and re-sending it to the bucket: the server becomes a bandwidth and memory bottleneck. The correct pattern is **direct upload**: the application generates a **presigned URL**, a temporary link with a cryptographic signature that authorizes **one specific operation** (for example, a `PUT` on that object) for a few minutes, without exposing credentials. The client sends the file straight to storage, and the backend only stores the object key in the database."]),
      fig(["Upload direto com URL pré-assinada", "Direct upload with a presigned URL"],
        [[node("cl", ["Cliente", "Client"], "client")],
         [node("api", ["API", "API"], "service")],
         [node("s3", ["Bucket de objetos", "Object bucket"], "data")],
         [node("db", ["Banco (só a chave)", "Database (key only)"], "data"), node("cdn", "CDN", "edge")]],
        [edge("cl", "api", ["1. pede URL", "1. asks for URL"]), edge("api", "s3", ["2. assina", "2. signs"], { dashed: true }), edge("cl", "s3", ["3. PUT direto", "3. direct PUT"]), edge("api", "db", ["4. grava a chave", "4. stores the key"]), edge("s3", "cdn", ["leitura", "read"], { dashed: true })]),
      code(`// Node.js com AWS SDK v3: gerar URL de upload válida por 5 minutos
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

const s3 = new S3Client({ region: "sa-east-1" });

export async function createUploadUrl(userId: string, contentType: string) {
  const key = "avatars/" + userId + "/" + randomUUID() + ".jpg";
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: "my-app-media", Key: key, ContentType: contentType }),
    { expiresIn: 300 },
  );
  return { url, key }; // o cliente faz PUT no url; o backend guarda "key" no banco
}`),
      p(["Para arquivos grandes (acima de algumas dezenas de MB), use **multipart upload**: o arquivo é dividido em partes enviadas em paralelo e reenviáveis individualmente; no S3 cada parte (exceto a última) deve ter ao menos 5 MB. Para leitura, a mesma ideia vale com `GET` pré-assinado para conteúdo privado, ou uma CDN na frente do bucket para conteúdo público.", "For large files (above a few tens of MB), use **multipart upload**: the file is split into parts sent in parallel and individually retryable; in S3 each part (except the last) must be at least 5 MB. For reads, the same idea applies with a presigned `GET` for private content, or a CDN in front of the bucket for public content."]),

      h(["Como escolher", "How to choose"]),
      ul(
        ["O dado é de um banco de dados ou de uma VM e precisa de IOPS e latência baixas? **Bloco**.", "Is the data from a database or a VM and does it need low latency and IOPS? **Block**."],
        ["Vários servidores precisam ver o mesmo diretório, com semântica de arquivo? **Arquivo**.", "Do several servers need to see the same directory with file semantics? **File**."],
        ["São arquivos inteiros, grandes ou numerosos, servidos pela web, com custo baixo e crescimento ilimitado? **Objeto**.", "Are they whole files, large or numerous, served over the web, with low cost and unlimited growth? **Object**."],
        ["Na dúvida em aplicações novas na nuvem: banco em disco de bloco, mídia em objeto e evite o file storage compartilhado a menos que haja uma razão clara.", "When in doubt in new cloud applications: database on block disk, media in object storage and avoid shared file storage unless there is a clear reason."],
      ),

      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Guardar imagens e vídeos em colunas `bytea`/`BLOB` do banco, inflando backups e réplicas.", "Storing images and videos in `bytea`/`BLOB` database columns, bloating backups and replicas."],
        ["Servir arquivos do disco local da instância: ao escalar horizontalmente, cada cópia do servidor tem um conjunto diferente de arquivos.", "Serving files from the instance's local disk: when scaling horizontally, each copy of the server has a different set of files."],
        ["Deixar o bucket público por engano. Bloqueie o acesso público por padrão e use URLs pré-assinadas ou CDN com origem privada.", "Leaving the bucket public by mistake. Block public access by default and use presigned URLs or a CDN with a private origin."],
        ["Usar nomes originais enviados pelo usuário como chave, gerando colisões e vazamento de informação; prefira UUIDs.", "Using user-supplied original names as keys, causing collisions and information leaks; prefer UUIDs."],
        ["Ignorar o custo de saída de dados (*egress*) e das requisições, que muitas vezes supera o custo de armazenar.", "Ignoring the cost of data egress and requests, which often exceeds the cost of storing."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Bloco é o disco bruto de baixa latência; arquivo é o diretório de rede compartilhado; objeto é o armazenamento HTTP barato e quase infinito.", "Block is the low-latency raw disk; file is the shared network directory; object is cheap, almost infinite HTTP storage."],
        ["Durabilidade (não perder) e disponibilidade (estar no ar) são medidas distintas; versionamento e backup protegem contra erro humano.", "Durability (not losing) and availability (being up) are distinct measures; versioning and backup protect against human error."],
        ["Classes e ciclo de vida reduzem o custo de dados frios.", "Classes and lifecycle reduce the cost of cold data."],
        ["URL pré-assinada tira o backend do caminho dos bytes.", "Presigned URLs take the backend out of the path of the bytes."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**S3 é um sistema de arquivos?** Não. É um armazenamento de chave e objeto; as «pastas» são prefixos e não há renomeação atômica.", "**Is S3 a file system?** No. It is key-and-object storage; «folders» are prefixes and there is no atomic rename."],
        ["**Posso rodar um banco em object storage?** Não como disco principal. Bancos precisam de bloco; já backups, *snapshots* e arquivos de dados analíticos (Parquet) vivem bem em objeto.", "**Can I run a database on object storage?** Not as the primary disk. Databases need block; backups, snapshots and analytical data files (Parquet) live well in object storage."],
        ["**Quando usar EFS em vez de S3?** Quando o software exige um sistema de arquivos montado e compartilhado, com escrita parcial e travas.", "**When to use EFS instead of S3?** When the software requires a mounted, shared file system with partial writes and locks."],
        ["**Quanto tempo deve durar uma URL pré-assinada?** O mínimo necessário: minutos para upload, e um tempo curto para downloads privados.", "**How long should a presigned URL last?** The minimum necessary: minutes for uploads, and a short time for private downloads."],
      ),
      tip(["Mantenha no banco apenas a **chave** do objeto e os metadados que você consulta (dono, tipo, tamanho, data). Os bytes ficam no object storage e chegam ao usuário por CDN.", "Keep only the object **key** and the metadata you query (owner, type, size, date) in the database. The bytes stay in object storage and reach the user through a CDN."]),
    ] },

  { id: "redis-na-pratica", section: "bancos", level: 1, icon: "memory", minutes: 15,
    title: ["Redis na prática", "Redis in practice"],
    summary: ["Todas as estruturas e comandos, TTL, persistência RDB/AOF, replicação, Sentinel, Cluster e os padrões: cache-aside, lock, rate limiting, ranking, pub/sub e streams.", "All the structures and commands, TTL, RDB/AOF persistence, replication, Sentinel, Cluster and the patterns: cache-aside, lock, rate limiting, leaderboard, pub/sub and streams."],
    body: [
      p(["O **Redis** (*Remote Dictionary Server*) é um servidor de estruturas de dados em memória. Diferente de um banco que guarda tudo em disco e usa a RAM como cache, no Redis o conjunto de trabalho **vive na memória**, e por isso uma operação típica leva dezenas de microssegundos no servidor e uma instância passa de 100 mil operações por segundo. Ele não é só um mapa chave-valor: os valores podem ser **strings, hashes, listas, conjuntos, conjuntos ordenados, bitmaps, HyperLogLogs, geoespaciais e streams**, cada um com comandos próprios e atômicos. Isso transforma o Redis numa caixa de ferramentas para problemas como cache, sessões, filas leves, ranking, contagem, limitação de taxa e mensageria.", "**Redis** (*Remote Dictionary Server*) is an in-memory data structure server. Unlike a database that keeps everything on disk and uses RAM as a cache, in Redis the working set **lives in memory**, so a typical operation takes tens of microseconds on the server and one instance goes beyond 100,000 operations per second. It is not just a key-value map: values can be **strings, hashes, lists, sets, sorted sets, bitmaps, HyperLogLogs, geospatial and streams**, each with its own atomic commands. That turns Redis into a toolbox for problems such as caching, sessions, light queues, leaderboards, counting, rate limiting and messaging."]),
      p(["O modelo de execução é uma peça-chave: os comandos são executados por **uma única thread** (as versões recentes usam threads auxiliares apenas para E/S de rede). Como só um comando roda por vez, cada comando é **atômico**, sem locks, e `INCR` nunca perde uma contagem mesmo com mil clientes simultâneos. O reverso: um comando lento (como `KEYS *` em milhões de chaves) bloqueia todos os outros.", "The execution model is a key piece: commands are executed by **a single thread** (recent versions use helper threads only for network I/O). Since only one command runs at a time, each command is **atomic**, lock-free, and `INCR` never loses a count even with a thousand simultaneous clients. The flip side: one slow command (such as `KEYS *` over millions of keys) blocks everyone else."]),

      h(["Estruturas de dados e comandos essenciais", "Data structures and essential commands"]),
      table([["Estrutura", "Structure"], ["Comandos principais", "Main commands"], ["Uso típico", "Typical use"]],
        [["String", "String"], ["`SET` `GET` `INCR` `DECR` `APPEND` `MSET` `SETEX`", "`SET` `GET` `INCR` `DECR` `APPEND` `MSET` `SETEX`"], ["Cache de valores, contadores, flags", "Value cache, counters, flags"]],
        [["Hash", "Hash"], ["`HSET` `HGET` `HGETALL` `HINCRBY` `HDEL`", "`HSET` `HGET` `HGETALL` `HINCRBY` `HDEL`"], ["Objetos com campos (perfil, sessão)", "Objects with fields (profile, session)"]],
        [["List", "List"], ["`LPUSH` `RPUSH` `LPOP` `BRPOP` `LRANGE` `LTRIM`", "`LPUSH` `RPUSH` `LPOP` `BRPOP` `LRANGE` `LTRIM`"], ["Filas simples, últimas N atividades", "Simple queues, last N activities"]],
        [["Set", "Set"], ["`SADD` `SREM` `SISMEMBER` `SMEMBERS` `SINTER` `SUNION`", "`SADD` `SREM` `SISMEMBER` `SMEMBERS` `SINTER` `SUNION`"], ["Tags, seguidores, deduplicação, interseções", "Tags, followers, deduplication, intersections"]],
        [["Sorted set (ZSET)", "Sorted set (ZSET)"], ["`ZADD` `ZINCRBY` `ZRANGE` `ZREVRANGE` `ZRANK` `ZRANGEBYSCORE`", "`ZADD` `ZINCRBY` `ZRANGE` `ZREVRANGE` `ZRANK` `ZRANGEBYSCORE`"], ["Ranking, janelas de tempo, agendamento", "Leaderboards, time windows, scheduling"]],
        [["Bitmap / Bitfield", "Bitmap / Bitfield"], ["`SETBIT` `GETBIT` `BITCOUNT` `BITOP`", "`SETBIT` `GETBIT` `BITCOUNT` `BITOP`"], ["Presença diária de milhões de usuários em poucos MB", "Daily presence of millions of users in a few MB"]],
        [["HyperLogLog", "HyperLogLog"], ["`PFADD` `PFCOUNT` `PFMERGE`", "`PFADD` `PFCOUNT` `PFMERGE`"], ["Contagem aproximada de únicos (erro ~0,81%) em 12 KB", "Approximate unique count (~0.81% error) in 12 KB"]],
        [["Geo", "Geo"], ["`GEOADD` `GEOSEARCH` `GEODIST`", "`GEOADD` `GEOSEARCH` `GEODIST`"], ["Motoristas próximos, lojas por raio", "Nearby drivers, stores by radius"]],
        [["Stream", "Stream"], ["`XADD` `XREAD` `XGROUP` `XREADGROUP` `XACK`", "`XADD` `XREAD` `XGROUP` `XREADGROUP` `XACK`"], ["Log de eventos com grupos de consumidores", "Event log with consumer groups"]]),
      code(`# Strings e contadores
SET user:42:name "Ana"
GET user:42:name
INCR page:home:views            # atômico: 1, 2, 3...
INCRBY cart:42:total 2490

# Hash: um objeto com campos
HSET user:42 name "Ana" plan "pro" logins 0
HINCRBY user:42 logins 1
HGETALL user:42

# List: últimas atividades (mantém só as 100 mais novas)
LPUSH feed:42 "post:900"
LTRIM feed:42 0 99
LRANGE feed:42 0 9

# Set: seguidores e interseção (amigos em comum)
SADD followers:ana 10 11 12
SADD followers:bia 11 12 13
SINTER followers:ana followers:bia      # 11 12

# Sorted set: pontuação com ordenação automática
ZADD board 1500 "ana" 1720 "bia" 1310 "caio"
ZINCRBY board 50 "ana"
ZREVRANGE board 0 2 WITHSCORES          # top 3
ZREVRANK board "caio"                   # posição de caio (0 = primeiro)

# Bitmap e HyperLogLog
SETBIT active:2025-03-04 42 1           # usuário 42 ativo no dia
BITCOUNT active:2025-03-04              # quantos ativos
PFADD visitors:2025-03-04 "ip1" "ip2"
PFCOUNT visitors:2025-03-04             # únicos aproximados

# Geo
GEOADD drivers -34.88 -8.05 "d1" -34.90 -8.06 "d2"
GEOSEARCH drivers FROMLONLAT -34.89 -8.05 BYRADIUS 5 km ASC`),

      h(["TTL, expiração e políticas de remoção", "TTL, expiry and eviction policies"]),
      p(["Toda chave pode ter um **tempo de vida (TTL)**: ao expirar, ela some. É a base do uso como cache e de sessões. O Redis remove chaves expiradas de duas formas combinadas: **sob demanda** (quando alguém tenta ler) e por **amostragem periódica** em segundo plano.", "Any key can have a **time to live (TTL)**: when it expires, it disappears. This is the basis of cache use and sessions. Redis removes expired keys in two combined ways: **lazily** (when someone tries to read) and by **periodic sampling** in the background."]),
      code(`SET session:abc "user:42" EX 1800      # expira em 30 minutos
EXPIRE cache:product:7 60              # define TTL depois
TTL cache:product:7                    # segundos restantes (-1 sem TTL, -2 inexistente)
PERSIST session:abc                    # remove o TTL
SET k v NX EX 10                       # só cria se NÃO existir, com TTL`),
      p(["Quando a memória enche (`maxmemory`), a política `maxmemory-policy` decide o que fazer. Para cache, use `allkeys-lru` ou `allkeys-lfu` (descartam as menos usadas, dentre todas as chaves) ou `volatile-lru` (só entre chaves com TTL). `noeviction` (padrão em muitas instalações) faz as gravações falharem com erro, o que é correto quando o Redis guarda dados que não podem sumir. Dica prática: aplique **jitter** (variação aleatória) nos TTLs para que milhares de chaves não expirem no mesmo segundo e causem uma avalanche no banco.", "When memory fills up (`maxmemory`), the `maxmemory-policy` decides what to do. For cache use `allkeys-lru` or `allkeys-lfu` (evict the least used among all keys) or `volatile-lru` (only among keys with a TTL). `noeviction` (the default in many setups) makes writes fail with an error, which is correct when Redis holds data that must not vanish. Practical tip: apply **jitter** (random variation) to TTLs so thousands of keys do not expire in the same second and cause an avalanche on the database."]),

      h(["Persistência: RDB e AOF", "Persistence: RDB and AOF"]),
      p(["Apesar de viver em memória, o Redis pode gravar em disco para sobreviver a reinícios. Há dois mecanismos, combináveis:", "Although it lives in memory, Redis can write to disk to survive restarts. There are two mechanisms, combinable:"]),
      table([["Aspecto", "Aspect"], ["RDB (snapshot)", "RDB (snapshot)"], ["AOF (append-only file)", "AOF (append-only file)"]],
        [["O que grava", "What it writes"], ["Retrato binário compacto do conjunto de dados, em intervalos (`save 900 1`)", "Compact binary snapshot of the dataset at intervals (`save 900 1`)"], ["Log de cada comando de escrita, em sequência", "Log of every write command, sequentially"]],
        [["Perda possível numa queda", "Possible loss on a crash"], ["Tudo desde o último snapshot (minutos)", "Everything since the last snapshot (minutes)"], ["Até 1 segundo com `appendfsync everysec` (ou nada com `always`)", "Up to 1 second with `appendfsync everysec` (or none with `always`)"]],
        [["Reinício", "Restart"], ["Rápido (carrega o arquivo)", "Fast (loads the file)"], ["Mais lento (reexecuta o log; há reescrita periódica)", "Slower (replays the log; periodic rewrite)"]],
        [["Tamanho e custo", "Size and cost"], ["Pequeno; o fork pode gerar pico de memória", "Small; the fork may cause a memory spike"], ["Maior; `fsync` mais frequente custa desempenho", "Larger; more frequent `fsync` costs performance"]]),
      p(["Combinação usual em produção: **AOF com `everysec`** (perde no máximo ~1 s) mais **RDB** periódico para backups e reinícios rápidos. Para um cache puro, que pode ser reconstruído do banco, é comum desligar a persistência. Lembre-se: mesmo com AOF, o Redis **não é um banco de dados com as garantias duráveis de um PostgreSQL**; se o dado é a única cópia de algo importante, avalie com cuidado.", "Usual production combination: **AOF with `everysec`** (loses at most ~1 s) plus periodic **RDB** for backups and fast restarts. For a pure cache that can be rebuilt from the database, it is common to turn persistence off. Remember: even with AOF, Redis is **not a database with the durable guarantees of PostgreSQL**; if the data is the only copy of something important, evaluate carefully."]),
      code(`# redis.conf (trecho)
save 900 1          # snapshot se 1 mudança em 15 min
save 300 100        # ... ou 100 mudanças em 5 min
appendonly yes
appendfsync everysec
maxmemory 2gb
maxmemory-policy allkeys-lru`),

      h(["Replicação, Sentinel e Cluster", "Replication, Sentinel and Cluster"]),
      p(["A **replicação** do Redis é líder-seguidor e assíncrona: um *primary* aceita escritas e envia o fluxo de comandos a uma ou mais *réplicas* (`REPLICAOF host port`). Réplicas servem leituras (com possível defasagem) e são a cópia usada em uma falha. Como a replicação é assíncrona, uma queda do primary pode perder as últimas escritas ainda não propagadas.", "Redis **replication** is leader-follower and asynchronous: a *primary* accepts writes and sends the command stream to one or more *replicas* (`REPLICAOF host port`). Replicas serve reads (with possible lag) and are the copy used on failure. Since replication is asynchronous, a primary crash may lose the latest writes not yet propagated."]),
      p(["O **Redis Sentinel** é um conjunto de processos (use no mínimo 3, para ter quórum) que monitora o primary e as réplicas; se o primary cai, os Sentinels votam, **promovem uma réplica** e avisam os clientes do novo endereço. Dá alta disponibilidade, mas todos os dados ainda cabem em um único primary: não escala a memória nem as escritas.", "**Redis Sentinel** is a set of processes (use at least 3, to have a quorum) that monitors the primary and replicas; if the primary goes down, the Sentinels vote, **promote a replica** and tell clients the new address. It gives high availability, but all data still fits in a single primary: it does not scale memory or writes."]),
      p(["O **Redis Cluster** divide o espaço de chaves em **16.384 slots de hash**. A chave é mapeada por `slot = CRC16(chave) mod 16384`, e cada nó primário é dono de uma faixa de slots, com réplicas próprias para failover. O cliente consulta qualquer nó; se a chave não é dele, o nó responde `MOVED` indicando o dono correto, e clientes inteligentes guardam o mapa de slots. Operações com várias chaves só funcionam se todas caírem no mesmo slot, e isso se controla com **hash tags**: em `{user:42}:cart` e `{user:42}:profile`, só o trecho entre chaves é usado no cálculo.", "**Redis Cluster** splits the key space into **16,384 hash slots**. The key is mapped by `slot = CRC16(key) mod 16384`, and each primary node owns a range of slots, with its own replicas for failover. The client asks any node; if the key is not theirs, the node answers `MOVED` pointing to the correct owner, and smart clients cache the slot map. Multi-key operations only work if all keys fall in the same slot, which is controlled with **hash tags**: in `{user:42}:cart` and `{user:42}:profile`, only the part between braces is used in the calculation."]),
      fig(["Redis Cluster: slots distribuídos entre primários com réplicas", "Redis Cluster: slots spread across primaries with replicas"],
        [[node("cli", ["Cliente (mapa de slots)", "Client (slot map)"], "client")],
         [node("a", ["Primário A: slots 0-5460", "Primary A: slots 0-5460"], "cache"), node("b", ["Primário B: slots 5461-10922", "Primary B: slots 5461-10922"], "cache"), node("c", ["Primário C: slots 10923-16383", "Primary C: slots 10923-16383"], "cache")],
         [node("ra", ["Réplica de A", "Replica of A"], "cache"), node("rb", ["Réplica de B", "Replica of B"], "cache"), node("rc", ["Réplica de C", "Replica of C"], "cache")]],
        [edge("cli", "a", "CRC16 mod 16384"), edge("cli", "b"), edge("cli", "c"), edge("a", "ra", ["replica", "replicates"], { dashed: true }), edge("b", "rb", "", { dashed: true }), edge("c", "rc", "", { dashed: true })]),
      table([["Modo", "Mode"], ["Resolve", "Solves"], ["Não resolve", "Does not solve"]],
        [["Réplica simples", "Plain replica"], ["Cópia e leituras extras", "Copy and extra reads"], ["Failover automático", "Automatic failover"]],
        [["Sentinel", "Sentinel"], ["Failover automático e descoberta do primary", "Automatic failover and primary discovery"], ["Escalar memória e escrita", "Scaling memory and writes"]],
        [["Cluster", "Cluster"], ["Escala horizontal e failover", "Horizontal scale and failover"], ["Operações multi-chave entre slots, transações amplas", "Multi-key operations across slots, wide transactions"]]),

      h(["Padrão 1: cache-aside", "Pattern 1: cache-aside"]),
      p(["A aplicação consulta o cache primeiro; se não achar (*miss*), lê do banco, grava no cache com TTL e devolve. Na escrita, atualiza o banco e **invalida** a chave do cache.", "The application checks the cache first; on a miss, it reads from the database, writes into the cache with a TTL and returns. On write, it updates the database and **invalidates** the cache key."]),
      code(`async function getProduct(id: string) {
  const key = "product:" + id;
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);                    // cache hit

  const row = await db.query("SELECT * FROM products WHERE id = $1", [id]);
  const ttl = 300 + Math.floor(Math.random() * 60);   // jitter
  await redis.set(key, JSON.stringify(row), "EX", ttl);
  return row;
}

async function updateProduct(id: string, data: object) {
  await db.query("UPDATE products SET ... WHERE id = $1", [id]);
  await redis.del("product:" + id);                   // invalida
}`),

      h(["Padrão 2: lock distribuído com SET NX PX", "Pattern 2: distributed lock with SET NX PX"]),
      p(["Para garantir que só uma instância execute uma tarefa por vez (um job agendado, um recurso exclusivo), grave uma chave **somente se não existir** (`NX`) e com **expiração** em milissegundos (`PX`), de modo que um processo que morreu não segure o lock para sempre. O valor deve ser um token único, e a liberação só pode apagar o lock se o token ainda for o seu, o que exige um script Lua para ser atômico.", "To guarantee that only one instance runs a task at a time (a scheduled job, an exclusive resource), write a key **only if it does not exist** (`NX`) and with an **expiry** in milliseconds (`PX`), so that a process that died does not hold the lock forever. The value must be a unique token, and release may only delete the lock if the token is still yours, which requires a Lua script to be atomic."]),
      code(`# adquirir: OK se conseguiu, nil se outro já tem
SET lock:report:daily "token-9f3a" NX PX 30000

# liberar com segurança (Lua: compara o token e apaga, atomicamente)
EVAL "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end" 1 lock:report:daily token-9f3a`),
      p(["Cuidado: se a tarefa demorar mais que o TTL, o lock expira e outro processo entra. Renove o lock durante o trabalho ou, para tarefas em que a correção é crítica, combine com *fencing tokens* e não confie só no lock. Num cluster com failover assíncrono, o lock pode ser perdido; o algoritmo Redlock tenta mitigar isso, mas é motivo de debate entre especialistas. Para exclusão mútua realmente crítica, prefira um sistema de consenso (etcd, ZooKeeper) ou uma restrição no próprio banco.", "Careful: if the task takes longer than the TTL, the lock expires and another process gets in. Renew the lock during the work or, for tasks where correctness is critical, combine with *fencing tokens* and do not rely on the lock alone. In a cluster with asynchronous failover, the lock may be lost; the Redlock algorithm tries to mitigate that, but it is a matter of debate among experts. For truly critical mutual exclusion, prefer a consensus system (etcd, ZooKeeper) or a constraint in the database itself."]),

      h(["Padrão 3: rate limiting", "Pattern 3: rate limiting"]),
      p(["A versão mais simples é a **janela fixa**: um contador por usuário e por janela de tempo. `INCR` é atômico e o TTL limpa o contador sozinho.", "The simplest version is the **fixed window**: a counter per user and per time window. `INCR` is atomic and the TTL cleans up the counter by itself."]),
      code(`# limite de 100 requisições por minuto por usuário
async function allow(userId: string): Promise<boolean> {
  const window = Math.floor(Date.now() / 60000);
  const key = "rl:" + userId + ":" + window;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 60);
  return n <= 100;
}

# janela deslizante com ZSET (mais precisa): guarda um membro por requisição
ZADD rl:user:42 <now_ms> <unique_id>
ZREMRANGEBYSCORE rl:user:42 0 <now_ms - 60000>
ZCARD rl:user:42        # se > 100, bloqueia`),
      p(["A janela fixa permite um *burst* de até o dobro do limite na virada da janela; a deslizante e o *token bucket* suavizam isso. Em produção, agrupe os passos num script Lua para que fiquem atômicos.", "The fixed window allows a burst of up to double the limit at the window boundary; the sliding window and *token bucket* smooth that out. In production, group the steps in a Lua script so they stay atomic."]),

      h(["Padrão 4: leaderboard com ZSET", "Pattern 4: leaderboard with ZSET"]),
      p(["O conjunto ordenado mantém os membros ordenados por pontuação o tempo todo. Atualizar um placar é `O(log N)`, e consultar o top 10 ou a posição de um jogador também, mesmo com milhões de jogadores, algo que em SQL exigiria ordenar a tabela a cada consulta.", "The sorted set keeps members sorted by score all the time. Updating a score is `O(log N)`, and querying the top 10 or a player's position is too, even with millions of players, something that in SQL would require sorting the table on every query."]),
      code(`ZINCRBY leaderboard:2025-03 120 "player:42"
ZREVRANGE leaderboard:2025-03 0 9 WITHSCORES      # top 10
ZREVRANK leaderboard:2025-03 "player:42"          # posição (0 = líder)
ZSCORE leaderboard:2025-03 "player:42"
ZREVRANGE leaderboard:2025-03 40 60               # vizinhos do jogador na posição 50`),

      h(["Padrão 5: pub/sub e streams", "Pattern 5: pub/sub and streams"]),
      p(["O **Pub/Sub** entrega mensagens a quem está inscrito *naquele instante*, sem guardar nada: se o consumidor estiver desconectado, perde a mensagem. Serve para notificações efêmeras (um chat ao vivo, invalidar caches locais). Quando é preciso **não perder mensagens**, use **Streams**: um log de entradas persistentes, com **grupos de consumidores**, confirmação (`XACK`) e reprocessamento de mensagens pendentes.", "**Pub/Sub** delivers messages to whoever is subscribed *at that instant*, storing nothing: if the consumer is disconnected, it loses the message. It suits ephemeral notifications (a live chat, invalidating local caches). When you **must not lose messages**, use **Streams**: a log of persistent entries with **consumer groups**, acknowledgment (`XACK`) and reprocessing of pending messages."]),
      code(`# Pub/Sub
SUBSCRIBE chat:room1
PUBLISH chat:room1 "hello"

# Streams com grupo de consumidores (fila durável)
XADD orders * order_id 1001 total 4990              # "*" gera o id (tempo-seq)
XGROUP CREATE orders workers $ MKSTREAM
XREADGROUP GROUP workers w1 COUNT 10 BLOCK 5000 STREAMS orders >
XACK orders workers 1709550000000-0                  # confirma o processamento
XPENDING orders workers                              # mensagens entregues e não confirmadas`),
      fig(["Stream com grupo de consumidores", "Stream with a consumer group"],
        [[node("prod", ["Produtor", "Producer"], "service")],
         [node("st", ["Stream orders", "Stream orders"], "queue")],
         [node("w1", ["Worker 1", "Worker 1"], "service"), node("w2", ["Worker 2", "Worker 2"], "service")],
         [node("db", ["Banco", "Database"], "data")]],
        [edge("prod", "st", "XADD"), edge("st", "w1", "XREADGROUP"), edge("st", "w2", "XREADGROUP"), edge("w1", "db"), edge("w2", "db")]),

      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      ul(
        ["**Use** para cache, sessões, contadores, rate limiting, rankings, locks leves, filas simples e eventos em tempo real.", "**Use** for caching, sessions, counters, rate limiting, leaderboards, light locks, simple queues and real-time events."],
        ["**Evite** como banco principal de dados que não podem ser perdidos, para conjuntos de dados muito maiores que a RAM disponível (custo alto) e para consultas relacionais complexas.", "**Avoid** as the main database for data that cannot be lost, for datasets far larger than available RAM (high cost) and for complex relational queries."],
        ["**Cuidado** com chaves gigantes (um hash com milhões de campos), comandos `O(N)` em produção (`KEYS`, `SMEMBERS` em conjuntos enormes: use `SCAN`/`SSCAN`) e *hot keys* que concentram o tráfego numa única chave ou slot.", "**Beware** of giant keys (a hash with millions of fields), `O(N)` commands in production (`KEYS`, `SMEMBERS` on huge sets: use `SCAN`/`SSCAN`) and *hot keys* that concentrate traffic on a single key or slot."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Redis é um servidor de estruturas em memória, de thread única nos comandos, com operações atômicas.", "Redis is an in-memory structure server, single-threaded for commands, with atomic operations."],
        ["Escolha a estrutura certa: hash para objetos, ZSET para ranking, set para unicidade, stream para filas duráveis.", "Pick the right structure: hash for objects, ZSET for ranking, set for uniqueness, stream for durable queues."],
        ["TTL e política de remoção sustentam o uso como cache; RDB e AOF dão persistência parcial.", "TTL and the eviction policy underpin cache use; RDB and AOF give partial persistence."],
        ["Replicação dá cópias, Sentinel dá failover, Cluster (16.384 slots) dá escala horizontal.", "Replication gives copies, Sentinel gives failover, Cluster (16,384 slots) gives horizontal scale."],
        ["Padrões: cache-aside, `SET NX PX` para lock, `INCR` para rate limiting, ZSET para placares, Pub/Sub e Streams para mensagens.", "Patterns: cache-aside, `SET NX PX` for locks, `INCR` for rate limiting, ZSET for leaderboards, Pub/Sub and Streams for messages."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Redis é thread única, então é lento?** Não: sem locks e com tudo em memória, uma thread atinge centenas de milhares de operações por segundo. O risco é um comando lento bloquear os demais.", "**Redis is single-threaded, so is it slow?** No: with no locks and everything in memory, one thread reaches hundreds of thousands of operations per second. The risk is one slow command blocking the others."],
        ["**Redis ou Memcached?** Memcached só guarda strings e é multi-thread; Redis oferece estruturas, persistência e replicação. Para cache simples, ambos servem.", "**Redis or Memcached?** Memcached stores only strings and is multi-threaded; Redis offers structures, persistence and replication. For simple caching both serve."],
        ["**Posso perder dados com AOF?** Com `everysec`, até cerca de 1 segundo; com `always`, quase nada, ao custo de desempenho.", "**Can I lose data with AOF?** With `everysec`, up to about 1 second; with `always`, almost nothing, at a performance cost."],
        ["**Por que 16.384 slots?** É uma escolha de projeto que equilibra o tamanho das mensagens de coordenação entre nós e a granularidade da distribuição.", "**Why 16,384 slots?** It is a design choice that balances the size of coordination messages between nodes and the granularity of distribution."],
      ),
      tip(["Dê sempre um TTL às chaves de cache e nomeie as chaves com prefixos (`user:42:profile`). Isso evita memória crescendo sem controle e facilita depurar e invalidar.", "Always give cache keys a TTL and name keys with prefixes (`user:42:profile`). That avoids uncontrolled memory growth and makes debugging and invalidation easier."]),
    ] },

  { id: "tipos-de-replicacao", section: "bancos", level: 2, icon: "sync_alt", minutes: 14,
    title: ["Tipos de replicação", "Types of replication"],
    summary: ["Síncrona, assíncrona e semi-síncrona; líder-seguidor, multi-líder com resolução de conflitos, sem líder com quórum, lag e failover.", "Synchronous, asynchronous and semi-synchronous; leader-follower, multi-leader with conflict resolution, leaderless with quorum, lag and failover."],
    body: [
      p(["**Replicar** é manter cópias dos mesmos dados em várias máquinas. Há três motivos, e eles puxam o projeto em direções diferentes: **disponibilidade** (se uma máquina cai, outra continua servindo), **escala de leitura** (espalhar as leituras por várias cópias) e **latência geográfica** (ter uma cópia perto de cada grupo de usuários). Se os dados nunca mudassem, replicar seria trivial: copie e pronto. A dificuldade inteira do assunto está em **propagar as mudanças** de forma correta enquanto as máquinas e a rede falham, e em decidir o que acontece quando as cópias discordam.", "To **replicate** is to keep copies of the same data on several machines. There are three reasons, and they pull the design in different directions: **availability** (if one machine fails, another keeps serving), **read scaling** (spreading reads across several copies) and **geographic latency** (having a copy near each group of users). If data never changed, replication would be trivial: copy and done. The whole difficulty of the subject lies in **propagating changes** correctly while machines and the network fail, and in deciding what happens when copies disagree."]),
      p(["Replicação não é o mesmo que **particionamento** (sharding): replicar copia o **mesmo** dado em vários lugares; particionar **divide** o dado, de modo que cada máquina guarda um pedaço. Sistemas grandes usam os dois ao mesmo tempo, e este artigo trata do primeiro.", "Replication is not the same as **partitioning** (sharding): replicating copies the **same** data in several places; partitioning **splits** the data so each machine holds a piece. Large systems use both at once, and this article covers the first."]),

      h(["Replicação síncrona, assíncrona e semi-síncrona", "Synchronous, asynchronous and semi-synchronous replication"]),
      p(["A primeira decisão é **quando** o líder confirma uma escrita ao cliente.", "The first decision is **when** the leader acknowledges a write to the client."]),
      ul(
        ["**Síncrona**: o líder só responde «ok» depois que as réplicas confirmaram ter gravado. Garante que nenhuma escrita confirmada se perde na queda do líder (RPO próximo de zero), mas cada escrita paga a latência da réplica mais lenta, e se uma réplica cai, as escritas travam.", "**Synchronous**: the leader only answers «ok» after the replicas confirmed having written. It guarantees no acknowledged write is lost when the leader fails (RPO near zero), but every write pays the latency of the slowest replica, and if a replica goes down, writes stall."],
        ["**Assíncrona**: o líder confirma ao cliente logo após gravar localmente e envia a mudança às réplicas em segundo plano. É rápida e tolera réplicas lentas ou fora do ar, mas se o líder cair antes de propagar, **escritas confirmadas são perdidas**, e as leituras em réplicas podem estar atrasadas.", "**Asynchronous**: the leader acknowledges the client right after writing locally and ships the change to replicas in the background. It is fast and tolerates slow or offline replicas, but if the leader fails before propagating, **acknowledged writes are lost**, and reads on replicas may be stale."],
        ["**Semi-síncrona**: meio-termo comum. O líder espera a confirmação de **pelo menos uma** réplica (ou de um quórum) e as demais seguem assíncronas. Assim há sempre uma cópia atualizada para assumir, sem pagar a latência de todas. É o que o MySQL chama de semi-sync e o PostgreSQL permite com `synchronous_standby_names` em modo `ANY 1 (...)`.", "**Semi-synchronous**: a common middle ground. The leader waits for acknowledgment from **at least one** replica (or a quorum) and the others stay asynchronous. That way there is always an up-to-date copy to take over, without paying the latency of all. This is what MySQL calls semi-sync and what PostgreSQL allows with `synchronous_standby_names` in `ANY 1 (...)` mode."],
      ),
      table([["Modo", "Mode"], ["Latência de escrita", "Write latency"], ["Perda na queda do líder", "Loss on leader failure"], ["Se uma réplica cai", "If a replica fails"]],
        [["Síncrona", "Synchronous"], ["Alta (a mais lenta das réplicas)", "High (the slowest replica)"], ["Nenhuma", "None"], ["Escritas podem bloquear", "Writes may block"]],
        [["Semi-síncrona", "Semi-synchronous"], ["Média (a mais rápida das confirmadoras)", "Medium (the fastest acknowledger)"], ["Nenhuma, se a confirmadora é a promovida", "None, if the acknowledger is the one promoted"], ["Continua com outra réplica", "Continues with another replica"]],
        [["Assíncrona", "Asynchronous"], ["Baixa", "Low"], ["Possível (últimas escritas)", "Possible (latest writes)"], ["Sem efeito nas escritas", "No effect on writes"]]),
      fig(["Escrita com confirmação síncrona e assíncrona", "Write with synchronous and asynchronous acknowledgment"],
        [[node("cl", "Client", "client")],
         [node("ld", "Leader", "service")],
         [node("r1", ["Réplica 1 (sync)", "Replica 1 (sync)"], "data"), node("r2", ["Réplica 2 (async)", "Replica 2 (async)"], "data")]],
        [edge("cl", "ld", "write"), edge("ld", "r1", ["espera ack", "waits for ack"]), edge("ld", "r2", ["sem esperar", "no waiting"], { dashed: true })]),
      p(["Em termos de objetivos de recuperação: o **RPO** (*recovery point objective*) é quantos dados você aceita perder; o **RTO** (*recovery time objective*) é quanto tempo aceita ficar fora. A replicação síncrona busca RPO zero; a assíncrona aceita RPO de segundos em troca de velocidade.", "In terms of recovery objectives: **RPO** (*recovery point objective*) is how much data you accept losing; **RTO** (*recovery time objective*) is how long you accept being down. Synchronous replication seeks zero RPO; asynchronous accepts an RPO of seconds in exchange for speed."]),

      h(["Líder-seguidor (primário-réplica)", "Leader-follower (primary-replica)"]),
      p(["É o modelo mais comum (PostgreSQL, MySQL, MongoDB, SQL Server, Redis). **Um nó, o líder, recebe todas as escritas**; as mudanças são enviadas aos seguidores como um fluxo ordenado: o *WAL* (write-ahead log) no PostgreSQL, o *binlog* no MySQL, o *oplog* no MongoDB. Os seguidores aplicam o fluxo na mesma ordem e **servem leituras**. Como existe uma única ordem de escritas, não há conflitos: é o modelo mais simples de raciocinar.", "It is the most common model (PostgreSQL, MySQL, MongoDB, SQL Server, Redis). **One node, the leader, receives all writes**; changes are shipped to followers as an ordered stream: the *WAL* (write-ahead log) in PostgreSQL, the *binlog* in MySQL, the *oplog* in MongoDB. Followers apply the stream in the same order and **serve reads**. Since there is a single write order, there are no conflicts: it is the simplest model to reason about."]),
      fig(["Líder-seguidor: escritas no líder, leituras espalhadas", "Leader-follower: writes to the leader, reads spread out"],
        [[node("app", ["Aplicação", "Application"], "service")],
         [node("ld", ["Líder (escrita)", "Leader (writes)"], "data")],
         [node("f1", ["Seguidor 1", "Follower 1"], "data"), node("f2", ["Seguidor 2", "Follower 2"], "data"), node("f3", ["Seguidor 3 (outra região)", "Follower 3 (other region)"], "data")]],
        [edge("app", "ld", "INSERT / UPDATE"), edge("ld", "f1", "WAL"), edge("ld", "f2", "WAL"), edge("ld", "f3", "WAL", { dashed: true }), edge("app", "f1", "SELECT", { dashed: true })]),
      code(`-- PostgreSQL: líder (postgresql.conf)
wal_level = replica
max_wal_senders = 10
synchronous_standby_names = 'ANY 1 (replica_a, replica_b)'   -- semi-síncrona

-- No seguidor: aponta para o líder e fica em modo standby
primary_conninfo = 'host=10.0.0.5 user=replicator application_name=replica_a'

-- No líder: ver quem está replicando e o atraso
SELECT application_name, state, sync_state, replay_lag FROM pg_stat_replication;`),
      p(["O limite do modelo é que **a capacidade de escrita é a de um único nó**: réplicas ajudam nas leituras e na disponibilidade, mas não multiplicam as escritas (para isso é preciso sharding). Uma estratégia comum é a separação **leitura/escrita**: a aplicação envia `SELECT` aos seguidores e o resto ao líder, tomando cuidado com o atraso.", "The limit of the model is that **write capacity is that of a single node**: replicas help with reads and availability but do not multiply writes (that takes sharding). A common strategy is **read/write splitting**: the application sends `SELECT` to followers and the rest to the leader, taking care with lag."]),

      h(["Lag de replicação e suas anomalias", "Replication lag and its anomalies"]),
      p(["Na replicação assíncrona, as réplicas ficam um pouco atrás do líder: é o **lag** (milissegundos em condições normais, segundos ou minutos sob carga, transações longas ou rede degradada). Isso provoca anomalias que o usuário percebe:", "In asynchronous replication, replicas sit a little behind the leader: that is the **lag** (milliseconds under normal conditions, seconds or minutes under load, long transactions or a degraded network). It causes anomalies the user notices:"]),
      ul(
        ["**Ler o que acabou de escrever**: o usuário posta um comentário, a página recarrega lendo de uma réplica atrasada e o comentário «sumiu». Solução: **leitura-após-escrita** (*read-your-writes*): após escrever, leia do líder por alguns segundos, ou acompanhe a posição do log (LSN) e só leia de réplicas que já a alcançaram.", "**Reading your own write**: the user posts a comment, the page reloads reading from a lagging replica and the comment «vanished». Solution: **read-your-writes**: after writing, read from the leader for a few seconds, or track the log position (LSN) and only read from replicas that have caught up."],
        ["**Voltar no tempo (leituras monotônicas)**: duas leituras seguidas vão para réplicas diferentes e a segunda mostra um estado mais antigo que a primeira. Solução: fixar cada usuário (ou sessão) em uma réplica.", "**Going back in time (monotonic reads)**: two consecutive reads hit different replicas and the second shows an older state than the first. Solution: pin each user (or session) to one replica."],
        ["**Causalidade quebrada**: ver a resposta antes da pergunta, porque as duas foram para partições diferentes e chegaram fora de ordem. Solução: garantir consistência causal (escrever dados relacionados na mesma partição, ou usar relógios lógicos).", "**Broken causality**: seeing the answer before the question, because they went to different partitions and arrived out of order. Solution: ensure causal consistency (write related data to the same partition, or use logical clocks)."],
      ),

      h(["Failover: o que acontece quando o líder cai", "Failover: what happens when the leader fails"]),
      p(["O **failover** é a promoção de um seguidor a novo líder. Mesmo sendo conceitualmente simples, está cheio de armadilhas:", "**Failover** is the promotion of a follower to be the new leader. Although conceptually simple, it is full of pitfalls:"]),
      ul(
        ["**Detecção**: normalmente por *heartbeat* com timeout. Se o timeout é curto, uma pausa de GC ou um pico de rede dispara um failover desnecessário; se é longo, o sistema demora a reagir.", "**Detection**: usually by heartbeat with a timeout. If the timeout is short, a GC pause or a network spike triggers an unnecessary failover; if it is long, the system is slow to react."],
        ["**Eleição**: escolher o seguidor mais atualizado, de preferência por consenso entre vários nós (Raft, Patroni com etcd, Sentinel, o próprio MongoDB replica set), para evitar decisões divergentes.", "**Election**: picking the most up-to-date follower, preferably by consensus among several nodes (Raft, Patroni with etcd, Sentinel, a MongoDB replica set itself), to avoid divergent decisions."],
        ["**Reconfiguração**: clientes e outros seguidores passam a apontar para o novo líder; o antigo, ao voltar, precisa **se rebaixar** a seguidor.", "**Reconfiguration**: clients and other followers start pointing to the new leader; the old one, on return, must **demote itself** to follower."],
        ["**Split-brain**: dois nós acham que são líder e aceitam escritas, gerando dados divergentes. A defesa é o **quórum** (só quem alcança a maioria pode ser líder), números de época (*term/epoch*) e *fencing* (isolar o líder antigo, por exemplo desligando-o ou revogando seu acesso ao disco).", "**Split-brain**: two nodes think they are the leader and accept writes, producing divergent data. The defense is **quorum** (only one who reaches the majority can be leader), epoch numbers (*term/epoch*) and *fencing* (isolating the old leader, for example by shutting it down or revoking its disk access)."],
        ["**Perda na assíncrona**: as escritas do antigo líder ainda não propagadas ficam órfãs; descartá-las é perigoso (um id já entregue a um cliente pode ser reutilizado).", "**Loss in asynchronous mode**: writes of the old leader not yet propagated become orphans; discarding them is dangerous (an id already given to a client may be reused)."],
      ),

      h(["Replicação multi-líder", "Multi-leader replication"]),
      p(["Aqui **vários nós aceitam escritas** e as repassam entre si. O caso de uso mais comum é a operação em **múltiplos datacenters**: um líder por região, de modo que o usuário escreve no líder local (baixa latência) e a mudança é replicada de forma assíncrona às outras regiões; se uma região fica isolada, ela continua operando. Outros usos: aplicativos **offline-first** (cada dispositivo é um líder local que sincroniza depois) e **edição colaborativa**.", "Here **several nodes accept writes** and relay them to each other. The most common use case is operation across **multiple datacenters**: one leader per region, so the user writes to the local leader (low latency) and the change is replicated asynchronously to the other regions; if a region is isolated, it keeps operating. Other uses: **offline-first** apps (each device is a local leader that syncs later) and **collaborative editing**."]),
      fig(["Multi-líder: um líder por região, replicação entre eles", "Multi-leader: one leader per region, replication between them"],
        [[node("ua", ["Usuários América", "Users Americas"], "client"), node("ue", ["Usuários Europa", "Users Europe"], "client")],
         [node("la", ["Líder Américas", "Leader Americas"], "data"), node("le", ["Líder Europa", "Leader Europe"], "data")]],
        [edge("ua", "la", ["escreve", "writes"]), edge("ue", "le", ["escreve", "writes"]), edge("la", "le", ["assíncrona", "async"], { both: true })]),
      p(["O preço é o **conflito de escrita**: dois líderes alteram o mesmo registro ao mesmo tempo e só descobrem depois. Estratégias de resolução:", "The price is the **write conflict**: two leaders change the same record at the same time and only find out later. Resolution strategies:"]),
      table([["Estratégia", "Strategy"], ["Como funciona", "How it works"], ["Problema", "Problem"]],
        [["Evitar conflitos", "Avoid conflicts"], ["Roteia todas as escritas de um registro ao mesmo líder (o dono do usuário)", "Routes all writes of a record to the same leader (the user's home)"], ["Falha se o líder-dono cai ou o usuário viaja", "Fails if the home leader goes down or the user travels"]],
        [["Last write wins (LWW)", "Last write wins (LWW)"], ["Vence a escrita com o maior timestamp", "The write with the highest timestamp wins"], ["Descarta escritas silenciosamente; relógios desalinhados quebram a ordem", "Silently drops writes; skewed clocks break the order"]],
        [["Vetores de versão", "Version vectors"], ["Detecta o que é concorrente de verdade e guarda as duas versões como «irmãs»", "Detects what is truly concurrent and keeps both versions as «siblings»"], ["A aplicação ou o usuário precisa mesclar", "The application or user must merge"]],
        [["CRDTs", "CRDTs"], ["Estruturas de dados cujo merge é matematicamente garantido (contadores, conjuntos, texto)", "Data structures whose merge is mathematically guaranteed (counters, sets, text)"], ["Só para tipos de dados modelados assim", "Only for data types modeled that way"]],
        [["Resolução customizada", "Custom resolution"], ["Regra de negócio, por exemplo juntar os itens de dois carrinhos", "Business rule, for example merging the items of two carts"], ["Mais código para manter e testar", "More code to maintain and test"]]),
      p(["Multi-líder interage mal com chaves auto-incrementadas, gatilhos e restrições de unicidade, porque cada líder as avalia localmente. Por isso muitos times a evitam quando podem e preferem líder único por região de escrita.", "Multi-leader interacts badly with auto-increment keys, triggers and uniqueness constraints, because each leader evaluates them locally. That is why many teams avoid it when they can and prefer a single leader per write region."]),

      h(["Replicação sem líder e quórum", "Leaderless replication and quorum"]),
      p(["Inspirada no Dynamo da Amazon, a replicação **sem líder** (Cassandra, Riak, DynamoDB internamente) não designa um líder: o cliente (ou um nó coordenador) envia a escrita a **N réplicas** da chave e a considera bem-sucedida quando **W** delas confirmam; numa leitura, consulta **R** réplicas e escolhe a versão mais recente. A regra do **quórum** é:", "Inspired by Amazon's Dynamo, **leaderless** replication (Cassandra, Riak, DynamoDB internally) designates no leader: the client (or a coordinator node) sends the write to the key's **N replicas** and considers it successful when **W** of them acknowledge; on a read, it queries **R** replicas and picks the most recent version. The **quorum** rule is:"]),
      code(`N = número de réplicas por chave   (ex.: 3)
W = confirmações exigidas na escrita
R = respostas exigidas na leitura

Se  W + R > N   então toda leitura intersecta ao menos uma réplica
                que viu a última escrita (consistência forte "na prática").

N=3, W=2, R=2  ->  2 + 2 > 3  : tolera 1 réplica fora do ar, lê o dado novo
N=3, W=1, R=1  ->  rápido, mas pode ler dado antigo (consistência eventual)
N=3, W=3, R=1  ->  leituras baratas, escritas param se qualquer réplica cair`),
      fig(["Quórum N=3, W=2, R=2", "Quorum N=3, W=2, R=2"],
        [[node("co", ["Coordenador", "Coordinator"], "service")],
         [node("n1", ["Réplica 1 (nova)", "Replica 1 (new)"], "data"), node("n2", ["Réplica 2 (nova)", "Replica 2 (new)"], "data"), node("n3", ["Réplica 3 (atrasada)", "Replica 3 (stale)"], "data")]],
        [edge("co", "n1", "W"), edge("co", "n2", "W"), edge("co", "n3", ["perdeu", "missed"], { dashed: true })]),
      p(["Como as réplicas podem ficar divergentes (uma estava fora do ar durante a escrita), o sistema precisa **reparar**: no **read repair**, ao ler de R réplicas e achar uma desatualizada, o coordenador a corrige na hora; no **anti-entropy**, um processo de fundo compara as réplicas (com árvores de Merkle) e sincroniza as diferenças; o **hinted handoff** guarda temporariamente a escrita destinada a um nó indisponível e a entrega quando ele volta. Em uma partição de rede, um **sloppy quorum** aceita escritas em nós «substitutos» para manter a disponibilidade, abrindo mão da garantia de intersecção.", "Because replicas can diverge (one was down during the write), the system must **repair**: in **read repair**, when reading from R replicas and finding a stale one, the coordinator fixes it on the spot; in **anti-entropy**, a background process compares replicas (with Merkle trees) and syncs differences; **hinted handoff** temporarily stores the write destined for an unavailable node and delivers it when it returns. In a network partition, a **sloppy quorum** accepts writes on «stand-in» nodes to maintain availability, giving up the intersection guarantee."]),
      p(["Mesmo com `W + R > N`, existem casos de borda (relógios, escritas concorrentes, falhas parciais) em que se pode ler um valor antigo. Por isso, não trate o quórum como linearizabilidade; para isso são necessários protocolos de consenso.", "Even with `W + R > N`, there are edge cases (clocks, concurrent writes, partial failures) where an old value may be read. So do not treat quorum as linearizability; that requires consensus protocols."]),
      code(`-- Cassandra (CQL): escolha do nível de consistência por consulta
CONSISTENCY QUORUM;     -- W ou R = maioria das réplicas
SELECT * FROM users WHERE id = 42;

CONSISTENCY ONE;        -- mais rápido, pode ser antigo
CONSISTENCY ALL;        -- mais forte, para se qualquer réplica cair`),

      h(["Comparando as três arquiteturas", "Comparing the three architectures"]),
      table([["Aspecto", "Aspect"], ["Líder-seguidor", "Leader-follower"], ["Multi-líder", "Multi-leader"], ["Sem líder", "Leaderless"]],
        [["Quem aceita escrita", "Who accepts writes"], ["Um nó", "One node"], ["Um por região/dispositivo", "One per region/device"], ["Qualquer réplica (via coordenador)", "Any replica (via coordinator)"]],
        [["Conflitos", "Conflicts"], ["Não há", "None"], ["Frequentes; exigem resolução", "Frequent; need resolution"], ["Possíveis; resolvidos por versão/LWW/CRDT", "Possible; resolved by version/LWW/CRDT"]],
        [["Disponibilidade de escrita", "Write availability"], ["Perde durante o failover", "Lost during failover"], ["Alta (por região)", "High (per region)"], ["Muito alta (tolera N-W falhas)", "Very high (tolerates N-W failures)"]],
        [["Consistência", "Consistency"], ["Forte no líder; eventual nas réplicas assíncronas", "Strong on the leader; eventual on async replicas"], ["Eventual entre regiões", "Eventual across regions"], ["Ajustável por R e W", "Tunable via R and W"]],
        [["Complexidade", "Complexity"], ["Baixa", "Low"], ["Alta", "High"], ["Média a alta", "Medium to high"]],
        [["Exemplos", "Examples"], ["PostgreSQL, MySQL, MongoDB, Redis", "PostgreSQL, MySQL, MongoDB, Redis"], ["MySQL em anel, Postgres BDR, CouchDB", "MySQL ring, Postgres BDR, CouchDB"], ["Cassandra, Riak, DynamoDB", "Cassandra, Riak, DynamoDB"]]),

      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Tratar réplica como backup: um `DROP TABLE` acidental é replicado em milissegundos. Mantenha backups e recuperação pontual (PITR) à parte.", "Treating a replica as a backup: an accidental `DROP TABLE` is replicated in milliseconds. Keep backups and point-in-time recovery (PITR) separate."],
        ["Ler de réplicas sem tratar o lag, produzindo telas inconsistentes.", "Reading from replicas without handling lag, producing inconsistent screens."],
        ["Failover automático sem quórum nem *fencing*, abrindo caminho para split-brain.", "Automatic failover without quorum or fencing, opening the way to split-brain."],
        ["Não monitorar o lag nem testar o failover até o dia da falha real.", "Not monitoring lag or testing failover until the day of the real failure."],
        ["Usar multi-líder sem uma política de conflitos definida.", "Using multi-leader without a defined conflict policy."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Replicar traz disponibilidade, escala de leitura e proximidade geográfica; o desafio é propagar mudanças e lidar com divergência.", "Replicating brings availability, read scaling and geographic proximity; the challenge is propagating changes and handling divergence."],
        ["Síncrona não perde dados mas é lenta; assíncrona é rápida mas pode perder; semi-síncrona equilibra.", "Synchronous does not lose data but is slow; asynchronous is fast but may lose; semi-synchronous balances."],
        ["Líder-seguidor é o mais simples; multi-líder exige resolução de conflitos; sem líder usa quórum `W + R > N`.", "Leader-follower is the simplest; multi-leader requires conflict resolution; leaderless uses quorum `W + R > N`."],
        ["O lag gera anomalias (ler a própria escrita, voltar no tempo); o failover exige detecção, eleição e proteção contra split-brain.", "Lag causes anomalies (reading your own write, going back in time); failover requires detection, election and protection against split-brain."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Réplica de leitura garante o dado mais recente?** Não, se a replicação é assíncrona. Ela pode estar atrasada.", "**Does a read replica guarantee the latest data?** No, if replication is asynchronous. It may be behind."],
        ["**Quantas réplicas devo ter?** Três nós (um líder e dois seguidores, em zonas diferentes) é o mínimo comum para sobreviver à perda de um e manter maioria.", "**How many replicas should I have?** Three nodes (one leader and two followers, in different zones) is the common minimum to survive losing one and keep a majority."],
        ["**Last write wins é seguro?** Só quando perder uma escrita concorrente é aceitável (por exemplo, o último estado de presença). Para dinheiro, não.", "**Is last write wins safe?** Only when losing a concurrent write is acceptable (for example the last presence state). For money, no."],
        ["**Qual a diferença entre replicação e consenso?** Replicação copia; consenso (Raft, Paxos) faz os nós **concordarem** sobre uma ordem única, usado para eleger líderes e replicar logs com garantias fortes.", "**What is the difference between replication and consensus?** Replication copies; consensus (Raft, Paxos) makes nodes **agree** on a single order, used to elect leaders and replicate logs with strong guarantees."],
      ),
      tip(["Defina antes quanto dado você aceita perder (RPO) e quanto tempo pode ficar fora (RTO). A escolha entre síncrona, assíncrona e semi-síncrona sai dessas duas metas, não de preferência técnica.", "Define first how much data you accept losing (RPO) and how long you can be down (RTO). The choice among synchronous, asynchronous and semi-synchronous comes from those two goals, not from technical preference."]),
    ] },

  { id: "replicacao-e-sharding", section: "bancos", level: 2, icon: "account_tree", minutes: 14,
    title: ["Replicação e sharding", "Replication and sharding"],
    summary: ["Como um banco cresce além de uma máquina: sharding por faixa, hash, diretório e geografia, hash consistente, chave de partição, resharding, hot shards e consultas cross-shard.", "How a database grows beyond one machine: range, hash, directory and geographic sharding, consistent hashing, partition key, resharding, hot shards and cross-shard queries."],
    body: [
      p(["Um banco em uma única máquina tem três tetos: **armazenamento** (o disco acaba), **memória** (o conjunto de trabalho deixa de caber no cache e o desempenho despenca) e **capacidade de escrita** (um único líder só aguenta certo volume). A primeira resposta é **escalar verticalmente**: máquina maior, mais RAM, discos mais rápidos. É simples e deve ser esgotada primeiro, mas é cara e tem limite físico. A segunda é **escalar horizontalmente**, usando duas técnicas que resolvem problemas diferentes e quase sempre andam juntas: **replicação** e **sharding**.", "A database on a single machine has three ceilings: **storage** (the disk runs out), **memory** (the working set stops fitting in cache and performance plummets) and **write capacity** (a single leader only handles so much). The first answer is **vertical scaling**: a bigger machine, more RAM, faster disks. It is simple and should be exhausted first, but it is expensive and has a physical limit. The second is **horizontal scaling**, using two techniques that solve different problems and almost always go together: **replication** and **sharding**."]),
      table([["Técnica", "Technique"], ["O que faz", "What it does"], ["Resolve", "Solves"], ["Não resolve", "Does not solve"]],
        [["Replicação", "Replication"], ["Copia o mesmo dado em várias máquinas", "Copies the same data on several machines"], ["Disponibilidade, escala de leitura, latência geográfica", "Availability, read scaling, geographic latency"], ["Volume de dados e escrita além de um nó", "Data volume and writes beyond one node"]],
        [["Sharding", "Sharding"], ["Divide o dado: cada máquina guarda um pedaço (um *shard*)", "Splits the data: each machine holds a piece (a *shard*)"], ["Volume de dados e capacidade de escrita", "Data volume and write capacity"], ["Disponibilidade, a menos que cada shard também seja replicado", "Availability, unless each shard is also replicated"]]),
      p(["O arranjo típico em produção: os dados são divididos em **N shards**, e **cada shard é um pequeno grupo replicado** (um líder e dois seguidores). A queda de uma máquina é absorvida pela replicação; o crescimento é absorvido pelo sharding.", "The typical production arrangement: data is split into **N shards**, and **each shard is a small replicated group** (one leader and two followers). A machine failure is absorbed by replication; growth is absorbed by sharding."]),
      fig(["Sharding com cada shard replicado", "Sharding with each shard replicated"],
        [[node("app", ["Aplicação", "Application"], "service")],
         [node("rt", ["Roteador / lógica de shard", "Router / shard logic"], "edge")],
         [node("s1", ["Shard 1 (líder)", "Shard 1 (leader)"], "data"), node("s2", ["Shard 2 (líder)", "Shard 2 (leader)"], "data"), node("s3", ["Shard 3 (líder)", "Shard 3 (leader)"], "data")],
         [node("r1", ["Réplicas do 1", "Replicas of 1"], "data"), node("r2", ["Réplicas do 2", "Replicas of 2"], "data"), node("r3", ["Réplicas do 3", "Replicas of 3"], "data")]],
        [edge("app", "rt", "user_id"), edge("rt", "s1"), edge("rt", "s2"), edge("rt", "s3"), edge("s1", "r1", "", { dashed: true }), edge("s2", "r2", "", { dashed: true }), edge("s3", "r3", "", { dashed: true })]),

      h(["Antes de fazer sharding", "Before sharding"]),
      p(["Sharding é a decisão arquitetural mais cara em dados: complica consultas, transações, migrações e a operação. Antes dele, esgote as alternativas mais baratas, nesta ordem aproximada: **índices e consultas corretas**, **cache** para as leituras repetidas, **réplicas de leitura**, **escalar verticalmente**, **arquivar ou particionar** dados antigos dentro do mesmo servidor, **separar por função** (um banco para pedidos e outro para catálogo). Muitos produtos nunca precisam de sharding, e os que precisam geralmente já sabem, pelos números: dezenas de milhares de escritas por segundo sustentadas, ou terabytes de dados quentes.", "Sharding is the most expensive architectural decision in data: it complicates queries, transactions, migrations and operations. Before it, exhaust the cheaper alternatives, in this rough order: **indexes and correct queries**, **caching** for repeated reads, **read replicas**, **vertical scaling**, **archiving or partitioning** old data inside the same server, **splitting by function** (one database for orders and another for catalog). Many products never need sharding, and those that do usually already know, from the numbers: tens of thousands of sustained writes per second, or terabytes of hot data."]),

      h(["Estratégias de sharding", "Sharding strategies"]),
      p(["Toda estratégia responde à pergunta: **dado o valor da chave de partição, em qual shard fica o registro?**", "Every strategy answers the question: **given the value of the partition key, which shard holds the record?**"]),
      h(["Por faixa (range)", "Range-based"]),
      p(["Cada shard cuida de um intervalo contínuo de chaves: A-F, G-M, N-Z, ou ids de 1 a 10 milhões, de 10 a 20 milhões. É simples e permite **consultas por faixa eficientes** (todos os pedidos de março estão no mesmo lugar), mas tende a criar **hot spots**: se a chave é um timestamp ou um id crescente, todas as escritas novas caem no último shard. Usado pelo HBase, pelo Bigtable e, opcionalmente, pelo MongoDB e pelo CockroachDB.", "Each shard handles a contiguous interval of keys: A-F, G-M, N-Z, or ids from 1 to 10 million, from 10 to 20 million. It is simple and allows **efficient range queries** (all March orders are in the same place), but tends to create **hot spots**: if the key is a timestamp or an increasing id, all new writes land on the last shard. Used by HBase, Bigtable and, optionally, MongoDB and CockroachDB."]),
      h(["Por hash", "Hash-based"]),
      p(["Aplica-se uma função de hash à chave e usa-se o resultado para escolher o shard: `shard = hash(user_id) mod N`. A distribuição é **uniforme**, o que evita hot spots de crescimento, mas as consultas por faixa deixam de ser eficientes (chaves vizinhas ficam espalhadas) e o `mod N` simples tem um problema grave: ao mudar N, quase **todas as chaves mudam de shard**.", "A hash function is applied to the key and the result picks the shard: `shard = hash(user_id) mod N`. Distribution is **uniform**, which avoids growth hot spots, but range queries stop being efficient (neighboring keys are scattered) and plain `mod N` has a serious problem: when N changes, almost **all keys move shards**."]),
      code(`// Roteamento por hash simples (cuidado com o resharding)
function shardFor(userId: string, shards: number): number {
  // FNV-1a de 32 bits: rapido e bem distribuido para chaves curtas
  let h = 0x811c9dc5;
  for (let i = 0; i < userId.length; i++) {
    h ^= userId.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h % shards;
}

// Com 4 shards, a chave "u42" cai em um; com 5, na maioria dos casos cai em outro:
// ~80% das chaves mudam de lugar quando N passa de 4 para 5.`),
      h(["Hash consistente", "Consistent hashing"]),
      p(["O **hash consistente** resolve o problema do `mod N`. Imagine um **anel** de posições (por exemplo, de 0 a 2^32-1). Cada nó é colocado em uma ou várias posições do anel (os **nós virtuais**, ou *vnodes*), e cada chave vai para o **primeiro nó encontrado andando no sentido horário a partir da posição do seu hash**. Quando um nó entra, ele só assume as chaves de um trecho do anel, tomadas do vizinho; quando sai, suas chaves vão para o próximo. Na média, apenas **`1/N` das chaves** se movem em vez de quase todas. Os vnodes (dezenas ou centenas por máquina) suavizam o desequilíbrio e permitem dar mais carga a máquinas maiores. É a base do Dynamo, do Cassandra, do Riak e de muitos balanceadores e caches (Memcached com clientes ketama).", "**Consistent hashing** solves the `mod N` problem. Imagine a **ring** of positions (for example 0 to 2^32-1). Each node is placed at one or several positions on the ring (the **virtual nodes**, or *vnodes*), and each key goes to the **first node found walking clockwise from the position of its hash**. When a node joins, it only takes the keys of one stretch of the ring, taken from its neighbor; when it leaves, its keys go to the next one. On average only **`1/N` of the keys** move instead of almost all. Vnodes (tens or hundreds per machine) smooth the imbalance and allow giving more load to bigger machines. It is the basis of Dynamo, Cassandra, Riak and many balancers and caches (Memcached with ketama clients)."]),
      fig(["Anel de hash consistente: a chave vai ao próximo nó no sentido horário", "Consistent hash ring: the key goes to the next node clockwise"],
        [[node("k", ["Chave: hash = 1.200", "Key: hash = 1,200"], "client")],
         [node("na", ["Nó A (pos. 500)", "Node A (pos. 500)"], "data"), node("nb", ["Nó B (pos. 1.500)", "Node B (pos. 1,500)"], "data"), node("nc", ["Nó C (pos. 3.000)", "Node C (pos. 3,000)"], "data")],
         [node("nd", ["Novo nó D (pos. 1.000): assume 500-1.000 de A", "New node D (pos. 1,000): takes 500-1,000 from A"], "cache")]],
        [edge("k", "nb", ["próximo no anel", "next on the ring"]), edge("na", "nb", "", { dashed: true }), edge("nb", "nc", "", { dashed: true }), edge("nd", "nb", ["vizinho", "neighbor"], { dashed: true })]),
      code(`// Esqueleto de anel de hash consistente com nós virtuais
class Ring {
  private points: { pos: number; node: string }[] = [];
  constructor(nodes: string[], vnodes = 100) {
    for (const n of nodes)
      for (let v = 0; v < vnodes; v++) this.points.push({ pos: hash(n + "#" + v), node: n });
    this.points.sort((a, b) => a.pos - b.pos);
  }
  lookup(key: string): string {
    const h = hash(key);
    // busca binária pelo primeiro ponto >= h; se passar do fim, volta ao começo do anel
    let lo = 0, hi = this.points.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (this.points[mid].pos < h) lo = mid + 1; else hi = mid; }
    return this.points[lo % this.points.length].node;
  }
}`),
      h(["Por diretório (lookup)", "Directory-based (lookup)"]),
      p(["Uma **tabela de mapeamento** (o diretório) diz em qual shard cada chave, ou grupo de chaves, está: `tenant 17 -> shard 3`. É a estratégia mais **flexível**: dá para mover um cliente específico para outro shard, isolar um cliente grande e balancear manualmente. O custo é que o diretório vira um **componente crítico** (precisa ser altamente disponível, replicado e cacheado) e adiciona uma consulta ao caminho. Muito usada em SaaS multi-tenant e é o princípio por trás de sistemas como o Vitess (com sua tabela de roteamento) e dos *chunks* do MongoDB.", "A **mapping table** (the directory) says which shard holds each key, or group of keys: `tenant 17 -> shard 3`. It is the most **flexible** strategy: you can move a specific customer to another shard, isolate a large customer and balance manually. The cost is that the directory becomes a **critical component** (it must be highly available, replicated and cached) and adds a lookup to the path. Widely used in multi-tenant SaaS and the principle behind systems such as Vitess (with its routing table) and MongoDB's *chunks*."]),
      h(["Geográfico", "Geographic"]),
      p(["Os dados de usuários de uma região ficam em shards daquela região (Brasil, Europa, Ásia). Reduz a latência, atende leis de **residência de dados** (como o GDPR e a LGPD, que podem exigir que certos dados fiquem em um território) e isola falhas regionais. Desafios: usuários que viajam, consultas globais e regiões com tamanhos desiguais. É comum combinar: primeiro geográfico, depois hash dentro de cada região.", "Data of users in a region stays in shards of that region (Brazil, Europe, Asia). It reduces latency, meets **data residency** laws (such as GDPR and LGPD, which may require certain data to stay in a territory) and isolates regional failures. Challenges: traveling users, global queries and regions of unequal size. It is common to combine: geographic first, then hash within each region."]),
      table([["Estratégia", "Strategy"], ["Vantagem", "Advantage"], ["Desvantagem", "Disadvantage"], ["Use quando", "Use when"]],
        [["Faixa", "Range"], ["Consultas por faixa eficientes; simples", "Efficient range queries; simple"], ["Hot spots com chaves crescentes", "Hot spots with increasing keys"], ["Dados ordenados e leituras por intervalo", "Ordered data and range reads"]],
        [["Hash (mod N)", "Hash (mod N)"], ["Distribuição uniforme; sem mapa", "Uniform distribution; no map"], ["Resharding movimenta quase tudo; sem faixas", "Resharding moves almost everything; no ranges"], ["Número de shards fixo e acesso por chave", "Fixed number of shards and access by key"]],
        [["Hash consistente", "Consistent hashing"], ["Mudar o cluster move só ~1/N das chaves", "Changing the cluster moves only ~1/N of keys"], ["Mais complexo; faixas ainda ineficientes", "More complex; ranges still inefficient"], ["Cluster elástico, caches, Cassandra/Dynamo", "Elastic cluster, caches, Cassandra/Dynamo"]],
        [["Diretório", "Directory"], ["Máxima flexibilidade e controle", "Maximum flexibility and control"], ["Ponto único de falha em potencial; lookup extra", "Potential single point of failure; extra lookup"], ["Multi-tenant, clientes de tamanhos muito diferentes", "Multi-tenant, customers of very different sizes"]],
        [["Geográfico", "Geographic"], ["Latência baixa; atende leis de dados", "Low latency; meets data laws"], ["Consultas globais e usuários móveis", "Global queries and mobile users"], ["Produto multi-região com restrições legais", "Multi-region product with legal constraints"]]),

      h(["Escolhendo a chave de partição (shard key)", "Choosing the partition key (shard key)"]),
      p(["É a decisão mais importante e a mais difícil de desfazer. Uma boa chave tem quatro propriedades: **alta cardinalidade** (muitos valores distintos, para poder dividir bem), **distribuição uniforme** de volume e de acesso, **presença nas consultas mais frequentes** (para que cada consulta vá a um shard só) e **estabilidade** (o valor não muda, senão o registro teria de migrar).", "It is the most important decision and the hardest to undo. A good key has four properties: **high cardinality** (many distinct values, so it can be split well), **uniform distribution** of volume and access, **presence in the most frequent queries** (so each query goes to a single shard) and **stability** (the value does not change, otherwise the record would have to migrate)."]),
      ul(
        ["**`user_id`** costuma ser excelente em redes sociais e apps de consumo: os dados de um usuário ficam juntos, e a maioria das consultas é «do usuário X».", "**`user_id`** is usually excellent in social networks and consumer apps: a user's data stays together, and most queries are «of user X»."],
        ["**`tenant_id`** em SaaS: isola clientes, mas um cliente gigante vira um shard sobrecarregado (resolva com diretório e shards dedicados).", "**`tenant_id`** in SaaS: isolates customers, but a giant customer becomes an overloaded shard (solve with a directory and dedicated shards)."],
        ["**Evite** chaves de baixa cardinalidade (`country`, `status`), crescentes (`created_at`, id sequencial em faixa) e as que concentram o acesso (`celebrity_id`).", "**Avoid** low-cardinality keys (`country`, `status`), increasing ones (`created_at`, sequential id in a range) and those that concentrate access (`celebrity_id`)."],
        ["Chaves **compostas** ajudam: `(tenant_id, hash(order_id))` mantém o tenant localizado e espalha os pedidos.", "**Composite** keys help: `(tenant_id, hash(order_id))` keeps the tenant localized and spreads the orders."],
      ),

      h(["Hot shards e como combatê-los", "Hot shards and how to fight them"]),
      p(["Mesmo com uma boa chave, a carga raramente é perfeitamente uniforme. Um **hot shard** (ou *hot key*) recebe muito mais tráfego que os demais: uma celebridade com 100 milhões de seguidores, um produto em promoção, um tenant gigante. Ele vira o gargalo de todo o sistema, e adicionar shards não ajuda, porque a chave quente continua num só lugar. Medidas:", "Even with a good key, load is rarely perfectly uniform. A **hot shard** (or *hot key*) receives much more traffic than the others: a celebrity with 100 million followers, a product on sale, a giant tenant. It becomes the bottleneck of the whole system, and adding shards does not help, because the hot key remains in one place. Measures:"]),
      ul(
        ["**Cache** na frente das chaves quentes (leituras) e **réplicas** extras para elas.", "**Cache** in front of hot keys (reads) and extra **replicas** for them."],
        ["**Salting / sub-chaves**: dividir a chave quente em várias (`counter:post42:0` a `counter:post42:9`), escrever em uma aleatória e somar na leitura.", "**Salting / sub-keys**: splitting the hot key into several (`counter:post42:0` to `counter:post42:9`), writing to a random one and summing on read."],
        ["**Isolar** o cliente ou a entidade quente em um shard dedicado (por isso o diretório é valioso).", "**Isolate** the hot customer or entity on a dedicated shard (which is why the directory is valuable)."],
        ["**Agrupar escritas** (batching) e usar filas para suavizar picos.", "**Batch writes** and use queues to smooth spikes."],
      ),

      h(["Resharding: mudar o número de shards", "Resharding: changing the number of shards"]),
      p(["Mais cedo ou mais tarde o cluster precisa crescer, e é aí que a escolha da estratégia cobra a conta. Com `hash mod N`, mudar N reorganiza quase tudo. Existem caminhos mais suaves:", "Sooner or later the cluster has to grow, and that is when the choice of strategy collects its bill. With `hash mod N`, changing N reshuffles almost everything. There are smoother paths:"]),
      ul(
        ["**Muitos shards lógicos desde o início**: crie, por exemplo, 1.024 shards lógicos distribuídos em poucas máquinas físicas; para crescer, **mova shards inteiros** entre máquinas, sem recalcular nenhuma chave. É o que Redis Cluster (16.384 slots), Vitess e outros fazem.", "**Many logical shards from the start**: create, for example, 1,024 logical shards spread over a few physical machines; to grow, **move whole shards** between machines without recomputing any key. This is what Redis Cluster (16,384 slots), Vitess and others do."],
        ["**Hash consistente**: o novo nó assume só um trecho do anel.", "**Consistent hashing**: the new node takes only a stretch of the ring."],
        ["**Divisão de faixas** (range split): um shard grande é dividido ao meio quando passa de um limite, automaticamente em sistemas como o Bigtable e o CockroachDB.", "**Range splitting**: a large shard is split in half when it passes a threshold, automatically in systems like Bigtable and CockroachDB."],
      ),
      p(["A migração online segue um roteiro: (1) copiar os dados do shard de origem para o destino em segundo plano; (2) enquanto isso, **capturar as novas escritas** (via log de replicação) e aplicá-las no destino; (3) quando a diferença é pequena, pausar brevemente as escritas, finalizar e **trocar o roteamento**; (4) validar e só então apagar da origem. Faça sempre com um plano de reversão e verificação de integridade (contagens e somas de verificação).", "Online migration follows a script: (1) copy the data from the source shard to the destination in the background; (2) meanwhile **capture new writes** (via the replication log) and apply them at the destination; (3) when the difference is small, briefly pause writes, finish and **switch the routing**; (4) validate and only then delete from the source. Always do it with a rollback plan and integrity checks (counts and checksums)."]),

      h(["Consultas e transações entre shards (cross-shard)", "Cross-shard queries and transactions"]),
      p(["O maior preço do sharding é perder a facilidade de tratar o banco como uma coisa só:", "The biggest price of sharding is losing the ease of treating the database as one thing:"]),
      ul(
        ["**Consultas sem a chave de partição** precisam de *scatter-gather*: enviar a consulta a todos os shards e juntar as respostas. A latência é a do mais lento, e o custo cresce com o número de shards. Projete para que as consultas quentes incluam a chave.", "**Queries without the partition key** need *scatter-gather*: sending the query to all shards and merging the answers. Latency is that of the slowest, and cost grows with the number of shards. Design so hot queries include the key."],
        ["**Junções entre shards** são caras ou impossíveis: mantenha juntos os dados que se juntam (mesmo `user_id` para o usuário, seus pedidos e seus itens), replique tabelas pequenas de referência em todos os shards e **desnormalize** quando necessário.", "**Joins across shards** are expensive or impossible: keep together the data that is joined (same `user_id` for the user, their orders and their items), replicate small reference tables to all shards and **denormalize** when necessary."],
        ["**Transações distribuídas** (2PC, *two-phase commit*) funcionam, mas são lentas e frágeis. Alternativas: manter a transação dentro de um shard, usar o padrão **saga** (sequência de passos locais com compensações) ou aceitar consistência eventual com eventos.", "**Distributed transactions** (2PC, *two-phase commit*) work but are slow and fragile. Alternatives: keep the transaction within one shard, use the **saga** pattern (a sequence of local steps with compensations) or accept eventual consistency with events."],
        ["**Ids únicos globais**: auto-incremento por shard colide. Use UUIDs, ULIDs ou um gerador como o *Snowflake* (timestamp + id de máquina + sequência, em 64 bits).", "**Globally unique ids**: per-shard auto-increment collides. Use UUIDs, ULIDs or a generator like *Snowflake* (timestamp + machine id + sequence, in 64 bits)."],
        ["**Agregações e relatórios** são melhor feitos em um data warehouse alimentado pelos shards, não por consultas diretas.", "**Aggregations and reports** are better done in a data warehouse fed by the shards, not by direct queries."],
      ),
      code(`// Roteador na aplicação: a chave decide o shard, a consulta vai a um só
const pools = [pool0, pool1, pool2, pool3];                 // um pool por shard
const poolFor = (userId: number) => pools[userId % pools.length];

async function getOrders(userId: number) {
  return poolFor(userId).query("SELECT * FROM orders WHERE user_id = $1", [userId]);
}

// Sem a chave: scatter-gather em todos os shards
async function countPaidOrders() {
  const parts = await Promise.all(
    pools.map((p) => p.query("SELECT count(*) FROM orders WHERE status = 'paid'")));
  return parts.reduce((s, r) => s + Number(r.rows[0].count), 0);
}`),

      h(["Ferramentas que já fazem isso", "Tools that already do it"]),
      ul(
        ["**MongoDB**: sharding nativo por faixa ou hash, com *balancer* que move chunks.", "**MongoDB**: native sharding by range or hash, with a *balancer* that moves chunks."],
        ["**Vitess** (MySQL) e **Citus** (PostgreSQL): camadas de sharding transparente sobre bancos relacionais.", "**Vitess** (MySQL) and **Citus** (PostgreSQL): transparent sharding layers on top of relational databases."],
        ["**Cassandra / DynamoDB**: particionam por hash da chave de partição desde o início, e você modela as tabelas em torno disso.", "**Cassandra / DynamoDB**: partition by hash of the partition key from the start, and you model tables around that."],
        ["**CockroachDB, Spanner, YugabyteDB, TiDB**: SQL distribuído que faz divisão e balanceamento automáticos, com transações distribuídas.", "**CockroachDB, Spanner, YugabyteDB, TiDB**: distributed SQL that splits and balances automatically, with distributed transactions."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Replicação copia (disponibilidade e leituras); sharding divide (volume e escritas). Em produção usam-se juntos.", "Replication copies (availability and reads); sharding splits (volume and writes). In production they are used together."],
        ["Esgote índices, cache, réplicas e escala vertical antes do sharding.", "Exhaust indexes, cache, replicas and vertical scaling before sharding."],
        ["Estratégias: faixa, hash, hash consistente, diretório e geográfica; cada uma com seu custo.", "Strategies: range, hash, consistent hashing, directory and geographic; each with its cost."],
        ["A chave de partição deve ter alta cardinalidade, distribuição uniforme, presença nas consultas e estabilidade.", "The partition key should have high cardinality, uniform distribution, presence in queries and stability."],
        ["Planeje o resharding (shards lógicos, hash consistente), trate hot shards e minimize consultas cross-shard.", "Plan for resharding (logical shards, consistent hashing), handle hot shards and minimize cross-shard queries."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Sharding e particionamento são a mesma coisa?** Quase: particionar é dividir os dados; sharding é particionar **entre máquinas**. Particionar dentro de um servidor é tema do próximo artigo.", "**Are sharding and partitioning the same thing?** Almost: partitioning is splitting data; sharding is partitioning **across machines**. Partitioning inside one server is the topic of the next article."],
        ["**Posso mudar a shard key depois?** É possível em alguns sistemas (o MongoDB permite refazer o sharding de uma coleção), mas é uma migração pesada. Trate como decisão quase definitiva.", "**Can I change the shard key later?** It is possible in some systems (MongoDB allows resharding a collection), but it is a heavy migration. Treat it as a nearly final decision."],
        ["**Quantos shards criar no início?** Mais shards lógicos do que máquinas físicas (por exemplo, 64 a 1.024), para poder crescer movendo shards inteiros.", "**How many shards to create at the start?** More logical shards than physical machines (for example 64 to 1,024), so you can grow by moving whole shards."],
        ["**Hash consistente elimina hot spots?** Não: espalha as chaves, mas uma única chave muito acessada continua quente.", "**Does consistent hashing eliminate hot spots?** No: it spreads keys, but a single heavily accessed key stays hot."],
      ),
      tip(["Se você consegue dizer, para cada consulta importante, qual é a chave que a leva a um único shard, o sharding vai funcionar. Se não consegue, o problema é de modelagem, e adicionar máquinas só vai espalhá-lo.", "If you can say, for each important query, which key takes it to a single shard, sharding will work. If you cannot, the problem is one of modeling, and adding machines will only spread it around."]),
    ] },

  { id: "particionamento-de-dados", section: "bancos", level: 2, icon: "call_split", minutes: 13,
    title: ["Particionamento de dados", "Data partitioning"],
    summary: ["Particionamento horizontal, vertical e funcional, com partições nativas do PostgreSQL (DDL), poda, manutenção e quando usar.", "Horizontal, vertical and functional partitioning, with native PostgreSQL partitions (DDL), pruning, maintenance and when to use it."],
    body: [
      p(["**Particionar** é dividir um conjunto grande de dados em pedaços menores e mais fáceis de gerenciar. O termo cobre ideias em escalas diferentes: dividir **uma tabela** em partes dentro do mesmo servidor, dividir **colunas** entre tabelas, dividir **funcionalidades** entre bancos distintos ou espalhar os pedaços por **várias máquinas** (o *sharding*, tratado no artigo anterior). O motivo é sempre o mesmo: uma tabela de 2 TB com 5 bilhões de linhas é lenta de consultar, lenta de indexar, lenta de fazer manutenção (`VACUUM`, backup, reconstrução de índices) e dolorosa de apagar dados antigos. Pedaços menores permitem ler apenas o que importa, manter um de cada vez e descartar dados velhos em um instante.", "To **partition** is to split a large dataset into smaller, easier-to-manage pieces. The term covers ideas at different scales: splitting **one table** into parts inside the same server, splitting **columns** across tables, splitting **features** across distinct databases or spreading the pieces over **several machines** (*sharding*, covered in the previous article). The reason is always the same: a 2 TB table with 5 billion rows is slow to query, slow to index, slow to maintain (`VACUUM`, backup, index rebuilds) and painful to delete old data from. Smaller pieces allow reading only what matters, maintaining one at a time and dropping old data instantly."]),

      h(["Os três eixos de particionamento", "The three axes of partitioning"]),
      table([["Tipo", "Type"], ["O que divide", "What it splits"], ["Exemplo", "Example"], ["Principal ganho", "Main gain"]],
        [["Horizontal", "Horizontal"], ["As **linhas**: cada partição tem as mesmas colunas e um subconjunto das linhas", "The **rows**: each partition has the same columns and a subset of rows"], ["Pedidos por mês; usuários por região", "Orders by month; users by region"], ["Consultas leem poucas partições; descarte de dados antigos", "Queries read few partitions; dropping old data"]],
        [["Vertical", "Vertical"], ["As **colunas**: cada tabela tem poucas colunas das mesmas linhas", "The **columns**: each table has a few columns of the same rows"], ["Separar o perfil leve da biografia e da foto em BLOB", "Separating the light profile from the biography and BLOB photo"], ["Linhas menores, mais linhas por página, melhor uso do cache", "Smaller rows, more rows per page, better cache use"]],
        [["Funcional", "Functional"], ["As **funcionalidades** do sistema, em bancos diferentes", "The system's **features**, in different databases"], ["Banco de pedidos, de catálogo, de pagamentos e de busca", "Orders, catalog, payments and search databases"], ["Escala e falha independentes; times autônomos", "Independent scaling and failure; autonomous teams"]]),
      fig(["Os três tipos de particionamento", "The three partitioning types"],
        [[node("t", ["Tabela users (grande)", "Table users (large)"], "ext")],
         [node("h", ["Horizontal: por linhas", "Horizontal: by rows"], "service"), node("v", ["Vertical: por colunas", "Vertical: by columns"], "service"), node("f", ["Funcional: por domínio", "Functional: by domain"], "service")],
         [node("h1", ["users_2025_01 users_2025_02 ...", "users_2025_01 users_2025_02 ..."], "data"), node("v1", ["users_core + users_profile_blob", "users_core + users_profile_blob"], "data"), node("f1", ["DB pedidos, DB catálogo, DB usuários", "Orders DB, catalog DB, users DB"], "data")]],
        [edge("t", "h"), edge("t", "v"), edge("t", "f"), edge("h", "h1"), edge("v", "v1"), edge("f", "f1")]),

      h(["Particionamento horizontal e suas estratégias", "Horizontal partitioning and its strategies"]),
      p(["É o mais usado. Uma regra aplicada a uma **chave de partição** decide em qual partição cada linha vai. As formas clássicas são:", "It is the most used. A rule applied to a **partition key** decides which partition each row goes to. The classic forms are:"]),
      ul(
        ["**Por faixa (RANGE)**: intervalos contínuos, o ideal para **datas**. `created_at` de janeiro numa partição, de fevereiro em outra.", "**By range (RANGE)**: contiguous intervals, ideal for **dates**. `created_at` of January in one partition, February in another."],
        ["**Por lista (LIST)**: valores enumerados, como `country IN ('BR','AR')` ou `region = 'EU'`.", "**By list (LIST)**: enumerated values, such as `country IN ('BR','AR')` or `region = 'EU'`."],
        ["**Por hash (HASH)**: `hash(id) mod N`, para distribuir uniformemente quando não há um critério natural (evita hot spots de inserção).", "**By hash (HASH)**: `hash(id) mod N`, to distribute uniformly when there is no natural criterion (avoids insertion hot spots)."],
        ["**Composta (subparticionamento)**: por exemplo, faixa por mês e, dentro dela, hash por cliente.", "**Composite (subpartitioning)**: for example, range by month and, within it, hash by customer."],
      ),

      h(["Partições no PostgreSQL (DDL)", "Partitions in PostgreSQL (DDL)"]),
      p(["Desde o PostgreSQL 10, o **particionamento declarativo** é nativo. A tabela pai não guarda linhas: é só a definição lógica; as linhas vivem nas **partições**, que são tabelas comuns. Um ponto importante: a chave de partição precisa fazer parte de qualquer chave primária ou índice único da tabela.", "Since PostgreSQL 10, **declarative partitioning** is native. The parent table stores no rows: it is just the logical definition; the rows live in the **partitions**, which are ordinary tables. An important point: the partition key must be part of any primary key or unique index of the table."]),
      code(`-- Tabela pai particionada por faixa de data
CREATE TABLE events (
  id          bigint GENERATED ALWAYS AS IDENTITY,
  user_id     bigint      NOT NULL,
  kind        text        NOT NULL,
  payload     jsonb,
  created_at  timestamptz NOT NULL,
  PRIMARY KEY (id, created_at)          -- a chave de partição entra na PK
) PARTITION BY RANGE (created_at);

-- Uma partição por mês (limite inferior inclusivo, superior exclusivo)
CREATE TABLE events_2025_01 PARTITION OF events
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE events_2025_02 PARTITION OF events
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Partição "default" para o que não casar (evita erro de inserção)
CREATE TABLE events_default PARTITION OF events DEFAULT;

-- Índice criado na tabela pai é criado em cada partição
CREATE INDEX ON events (user_id, created_at);

-- A aplicação continua usando só o nome "events"
INSERT INTO events (user_id, kind, created_at) VALUES (42, 'login', '2025-02-10 08:00+00');`),
      p(["Os outros métodos usam a mesma sintaxe:", "The other methods use the same syntax:"]),
      code(`-- LIST: por região
CREATE TABLE customers (
  id bigint NOT NULL, region text NOT NULL, name text,
  PRIMARY KEY (id, region)
) PARTITION BY LIST (region);
CREATE TABLE customers_br PARTITION OF customers FOR VALUES IN ('BR');
CREATE TABLE customers_eu PARTITION OF customers FOR VALUES IN ('DE','FR','ES');

-- HASH: 4 partições com distribuição uniforme
CREATE TABLE sessions (
  id uuid NOT NULL PRIMARY KEY, user_id bigint, data jsonb
) PARTITION BY HASH (id);
CREATE TABLE sessions_p0 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE sessions_p1 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE sessions_p2 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE sessions_p3 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 3);`),

      h(["Poda de partições (partition pruning)", "Partition pruning"]),
      p(["O grande benefício em leitura é a **poda**: se a consulta filtra pela chave de partição, o planejador **ignora as partições que não podem conter resultados**, lendo só as relevantes. Verifique com `EXPLAIN`: o plano deve listar apenas as partições esperadas.", "The big read benefit is **pruning**: if the query filters by the partition key, the planner **skips the partitions that cannot contain results**, reading only the relevant ones. Check with `EXPLAIN`: the plan should list only the expected partitions."]),
      code(`EXPLAIN SELECT count(*) FROM events
WHERE created_at >= '2025-02-01' AND created_at < '2025-03-01';

-- Resultado resumido: só uma partição é lida
Aggregate
  ->  Seq Scan on events_2025_02 events            -- as outras 11 foram podadas
        Filter: (created_at >= '2025-02-01' AND created_at < '2025-03-01')

-- Sem filtro pela chave de partição, TODAS as partições são lidas (e cada uma tem seu índice)
EXPLAIN SELECT * FROM events WHERE user_id = 42;`),
      p(["Detalhes que fazem a poda falhar: aplicar função à coluna de partição (`WHERE date_trunc('month', created_at) = ...`), comparar com tipos diferentes ou parâmetros sem estatística adequada. Escreva o filtro como intervalo direto sobre a coluna. A poda também funciona em tempo de execução com parâmetros, em prepared statements.", "Details that make pruning fail: applying a function to the partition column (`WHERE date_trunc('month', created_at) = ...`), comparing with different types or parameters without proper statistics. Write the filter as a direct range over the column. Pruning also works at run time with parameters, in prepared statements."]),

      h(["Manutenção: o grande ganho operacional", "Maintenance: the big operational gain"]),
      p(["Apagar dados antigos de uma tabela monolítica com `DELETE` gera milhões de linhas mortas, grava muito log, trava e exige `VACUUM`. Com partições, remove-se um mês inteiro **instantaneamente** e sem sobrecarga, com `DROP` ou `DETACH`:", "Deleting old data from a monolithic table with `DELETE` generates millions of dead rows, writes a lot of log, locks and requires `VACUUM`. With partitions, a whole month is removed **instantly** and with no overhead, with `DROP` or `DETACH`:"]),
      code(`-- Retenção de 12 meses: descarta a partição mais antiga em milissegundos
ALTER TABLE events DETACH PARTITION events_2024_01;     -- desanexa (pode arquivar antes)
DROP TABLE events_2024_01;

-- Criar a próxima partição com antecedência (rotina mensal, por exemplo com pg_cron)
CREATE TABLE events_2025_03 PARTITION OF events
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Carregar dados em massa numa tabela avulsa e anexar já pronta
CREATE TABLE events_2025_04 (LIKE events INCLUDING ALL);
-- ... COPY, índices e validações ...
ALTER TABLE events ATTACH PARTITION events_2025_04
  FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');`),
      ul(
        ["**Manutenção por partição**: `VACUUM`, `REINDEX` e backup podem ser feitos uma partição por vez.", "**Per-partition maintenance**: `VACUUM`, `REINDEX` and backup can be done one partition at a time."],
        ["**Armazenamento em camadas**: partições antigas podem ir para discos mais baratos (*tablespaces*) ou ser arquivadas em storage de objetos.", "**Tiered storage**: old partitions can go to cheaper disks (*tablespaces*) or be archived in object storage."],
        ["**Automação**: extensões como `pg_partman` criam e removem partições segundo uma política, evitando o clássico incidente de «não existe partição para esta data».", "**Automation**: extensions such as `pg_partman` create and drop partitions per a policy, avoiding the classic incident «no partition exists for this date»."],
      ),

      h(["Particionamento vertical", "Vertical partitioning"]),
      p(["Aqui as **colunas** são separadas em duas ou mais tabelas ligadas pela mesma chave. O motivo costuma ser a diferença de **temperatura e tamanho**: colunas pequenas e acessadas o tempo todo (nome, e-mail, status) misturadas com colunas grandes e raras (biografia longa, preferências em JSON, imagem) obrigam o banco a carregar bytes inúteis a cada leitura. Separá-las deixa as linhas «quentes» pequenas, cabendo mais delas em cada página e em cache.", "Here the **columns** are separated into two or more tables linked by the same key. The reason is usually the difference in **temperature and size**: small columns accessed all the time (name, email, status) mixed with large, rare columns (long biography, JSON preferences, image) force the database to load useless bytes on every read. Separating them keeps the «hot» rows small, fitting more of them in each page and in cache."]),
      code(`-- Antes: uma tabela larga
-- users(id, email, name, status, bio text, preferences jsonb, avatar bytea)

-- Depois: núcleo quente + extensão fria, 1 para 1
CREATE TABLE users_core (
  id     bigint PRIMARY KEY,
  email  text NOT NULL UNIQUE,
  name   text NOT NULL,
  status text NOT NULL
);
CREATE TABLE users_profile (
  user_id     bigint PRIMARY KEY REFERENCES users_core(id) ON DELETE CASCADE,
  bio         text,
  preferences jsonb
);
-- O núcleo é consultado a cada requisição; o perfil só na tela de perfil
SELECT c.name, p.bio FROM users_core c LEFT JOIN users_profile p ON p.user_id = c.id WHERE c.id = 7;`),
      p(["O PostgreSQL já faz algo parecido automaticamente com o **TOAST**, que move valores grandes (acima de cerca de 2 KB) para uma área separada, de modo que a linha principal continue pequena. Ainda assim, a separação explícita é útil quando as colunas têm **padrões de acesso, permissões ou ciclos de vida** diferentes (dados sensíveis separados, como documentos pessoais, com acesso restrito). Em bancos colunares (Parquet, ClickHouse), o armazenamento por coluna é a própria base do formato.", "PostgreSQL already does something similar automatically with **TOAST**, which moves large values (above about 2 KB) to a separate area so the main row stays small. Even so, explicit separation is useful when columns have different **access patterns, permissions or lifecycles** (sensitive data kept apart, such as personal documents, with restricted access). In columnar stores (Parquet, ClickHouse), per-column storage is the very basis of the format."]),

      h(["Particionamento funcional", "Functional partitioning"]),
      p(["Divide o sistema por **domínio de negócio**, dando a cada área seu próprio banco: usuários, catálogo, pedidos, pagamentos, busca. É a base de **microsserviços** com *database per service*. Cada banco escolhe a tecnologia certa (pagamentos em PostgreSQL, catálogo em MongoDB, busca em Elasticsearch), escala e falha independentemente, e as equipes evoluem seus esquemas sem coordenação central.", "It splits the system by **business domain**, giving each area its own database: users, catalog, orders, payments, search. It is the foundation of **microservices** with *database per service*. Each database picks the right technology (payments in PostgreSQL, catalog in MongoDB, search in Elasticsearch), scales and fails independently, and teams evolve their schemas without central coordination."]),
      fig(["Particionamento funcional: um banco por domínio", "Functional partitioning: one database per domain"],
        [[node("gw", "API Gateway", "edge")],
         [node("su", ["Serviço de usuários", "Users service"], "service"), node("so", ["Serviço de pedidos", "Orders service"], "service"), node("sc", ["Serviço de catálogo", "Catalog service"], "service")],
         [node("du", ["PostgreSQL usuários", "Users PostgreSQL"], "data"), node("do", ["PostgreSQL pedidos", "Orders PostgreSQL"], "data"), node("dc", ["Documentos: catálogo", "Documents: catalog"], "data")]],
        [edge("gw", "su"), edge("gw", "so"), edge("gw", "sc"), edge("su", "du"), edge("so", "do"), edge("sc", "dc"), edge("so", "sc", ["consulta preço", "price lookup"], { dashed: true })]),
      p(["O custo é abrir mão das **junções e transações entre domínios**: a consulta que juntava `orders` e `products` num só `JOIN` agora precisa de uma chamada de API ou de uma cópia local dos dados necessários (atualizada por eventos). Transações entre serviços passam a ser *sagas*. Por isso o particionamento funcional deve seguir as fronteiras reais do negócio, e não ser feito cedo demais.", "The cost is giving up **joins and transactions across domains**: the query that joined `orders` and `products` in a single `JOIN` now needs an API call or a local copy of the needed data (kept up to date by events). Transactions across services become *sagas*. That is why functional partitioning should follow real business boundaries, and not be done too early."]),

      h(["Particionamento x sharding", "Partitioning vs sharding"]),
      table([["Aspecto", "Aspect"], ["Particionamento (no nó)", "Partitioning (in one node)"], ["Sharding (entre nós)", "Sharding (across nodes)"]],
        [["Onde ficam os pedaços", "Where the pieces live"], ["No mesmo servidor (e mesma instância do banco)", "On the same server (and the same database instance)"], ["Em máquinas diferentes", "On different machines"]],
        [["Problema que resolve", "Problem it solves"], ["Consultas, manutenção e retenção de tabelas grandes", "Queries, maintenance and retention of large tables"], ["Limite de armazenamento, memória e escrita de uma máquina", "Storage, memory and write limits of one machine"]],
        [["Complexidade para a aplicação", "Complexity for the application"], ["Quase nula: o banco roteia", "Almost none: the database routes"], ["Alta: roteamento, cross-shard, transações", "High: routing, cross-shard, transactions"]],
        [["Transações e junções", "Transactions and joins"], ["Normais (mesmo nó)", "Normal (same node)"], ["Limitadas entre shards", "Limited across shards"]]),
      p(["Uma sequência de evolução razoável: tabelas bem indexadas, depois **particionamento** das tabelas que crescem sem parar (logs, eventos, pedidos), **réplicas de leitura**, **separação funcional** quando domínios se tornam independentes e, por último, **sharding** se uma única máquina deixou de ser suficiente.", "A reasonable evolution sequence: well-indexed tables, then **partitioning** of the tables that grow without stopping (logs, events, orders), **read replicas**, **functional separation** when domains become independent and, last, **sharding** if a single machine is no longer enough."]),

      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      ul(
        ["**Use** quando a tabela tem centenas de milhões de linhas ou centenas de GB, a maior parte das consultas filtra por um critério natural (data, região, tenant) e há necessidade de **descartar dados antigos** com frequência.", "**Use** when the table has hundreds of millions of rows or hundreds of GB, most queries filter by a natural criterion (date, region, tenant) and there is a need to **drop old data** often."],
        ["**Evite** em tabelas pequenas (a poda e o gerenciamento custam mais do que ajudam), quando as consultas **não** incluem a chave de partição (todas as partições seriam lidas) e quando a chave escolhida força linhas a mudar de partição com frequência.", "**Avoid** on small tables (pruning and management cost more than they help), when queries **do not** include the partition key (all partitions would be read) and when the chosen key makes rows move partitions frequently."],
        ["Cuidado com **partições demais**: milhares delas aumentam o tempo de planejamento das consultas e o uso de memória. Dezenas a poucas centenas costumam ser um bom limite.", "Beware of **too many partitions**: thousands of them increase query planning time and memory use. Tens to a few hundred is usually a good limit."],
      ),

      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Particionar por uma coluna que quase nenhuma consulta usa, ganhando complexidade sem poda.", "Partitioning by a column almost no query uses, gaining complexity without pruning."],
        ["Esquecer de criar as partições futuras e ver as inserções falharem à meia-noite do dia 1º. Use a partição `DEFAULT` e automação.", "Forgetting to create future partitions and watching inserts fail at midnight on the 1st. Use the `DEFAULT` partition and automation."],
        ["Esperar que chaves únicas globais funcionem sem incluir a chave de partição: o PostgreSQL exige que ela faça parte do índice único.", "Expecting global unique keys to work without including the partition key: PostgreSQL requires it to be part of the unique index."],
        ["Confundir particionamento com backup ou com alta disponibilidade: tudo continua em um servidor só.", "Confusing partitioning with backup or high availability: everything is still on a single server."],
        ["Separar verticalmente colunas que são sempre lidas juntas, trocando uma leitura por uma junção sem benefício.", "Vertically splitting columns that are always read together, swapping one read for a join with no benefit."],
      ),

      h(["Resumo", "Summary"]),
      ul(
        ["Horizontal divide as linhas (faixa, lista, hash); vertical divide as colunas; funcional divide por domínio em bancos separados.", "Horizontal splits rows (range, list, hash); vertical splits columns; functional splits by domain into separate databases."],
        ["No PostgreSQL, use `PARTITION BY RANGE | LIST | HASH`; a chave de partição entra na PK; a poda só funciona se a consulta filtra por ela.", "In PostgreSQL, use `PARTITION BY RANGE | LIST | HASH`; the partition key goes into the PK; pruning only works if the query filters by it."],
        ["O maior ganho operacional é descartar dados antigos com `DROP`/`DETACH` em vez de `DELETE`.", "The biggest operational gain is dropping old data with `DROP`/`DETACH` instead of `DELETE`."],
        ["Particionar não substitui índices, réplicas nem sharding; é uma etapa intermediária.", "Partitioning does not replace indexes, replicas or sharding; it is an intermediate step."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Particionar acelera qualquer consulta?** Não. Só ajuda quando a consulta filtra pela chave de partição, permitindo poda; caso contrário pode até piorar.", "**Does partitioning speed up any query?** No. It only helps when the query filters by the partition key, allowing pruning; otherwise it may even make things worse."],
        ["**Qual a diferença entre partição e índice?** O índice é uma estrutura auxiliar que aponta para linhas; a partição divide fisicamente os dados. Eles se complementam: cada partição tem seus próprios índices.", "**What is the difference between a partition and an index?** The index is an auxiliary structure pointing to rows; the partition physically divides the data. They complement each other: each partition has its own indexes."],
        ["**Posso particionar uma tabela existente?** Não com `ALTER`: crie a tabela particionada, copie os dados em lotes e troque os nomes, ou use ferramentas como `pg_partman` para a migração.", "**Can I partition an existing table?** Not with `ALTER`: create the partitioned table, copy the data in batches and swap the names, or use tools such as `pg_partman` for the migration."],
        ["**Em MySQL também existe?** Sim: `PARTITION BY RANGE/LIST/HASH/KEY`, com a regra de que a chave de partição esteja em todas as chaves únicas.", "**Does MySQL have it too?** Yes: `PARTITION BY RANGE/LIST/HASH/KEY`, with the rule that the partition key be in all unique keys."],
      ),
      tip(["Escolha como chave de partição a coluna que aparece no `WHERE` das suas consultas mais importantes e que também define o que você descarta ou arquiva. Quando as duas coincidem (a data), o particionamento rende o máximo.", "Choose as partition key the column that appears in the `WHERE` of your most important queries and that also defines what you drop or archive. When the two coincide (the date), partitioning pays off the most."]),
    ] },
];

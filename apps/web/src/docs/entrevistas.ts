import { h, p, ul, tip, code, table, fig, node, edge, type DocArticle } from "./kit";

/** Seção "entrevistas". */
export const ARTICLES: DocArticle[] = [
  { id: "roteiro-da-entrevista-de-system-design", section: "entrevistas", level: 0, icon: "timer", minutes: 11,
    title: ["Roteiro da entrevista de system design", "A roadmap for the system design interview"],
    summary: ["Um passo a passo com tempos para os 45 minutos, perguntas de esclarecimento e como conduzir a conversa.", "A step-by-step plan with timings for the 45 minutes, clarifying questions and how to lead the conversation."],
    body: [
      p(["A pergunta é vaga de propósito: “projete um encurtador de URL”, “projete um chat”. O entrevistador não quer ver você desenhar de cabeça uma arquitetura que decorou. Ele quer observar **como você pensa diante da ambiguidade**: que perguntas faz, como transforma um pedido nebuloso em requisitos, como usa números para decidir, como defende uma escolha e como reage quando alguém aponta um furo. Um roteiro fixo evita o branco no início e mostra que você tem método.", "The question is vague on purpose: “design a URL shortener”, “design a chat”. The interviewer does not want to watch you draw a memorized architecture. They want to observe **how you think when facing ambiguity**: which questions you ask, how you turn a fuzzy request into requirements, how you use numbers to decide, how you defend a choice and how you react when someone points out a flaw. A fixed roadmap avoids the initial blank and shows you have a method."]),
      p(["Este artigo descreve o roteiro que usamos nas resoluções completas desta seção. Ele serve para entrevistas de 45 a 60 minutos; se a sua for mais curta, comprima as estimativas e a API, mas nunca elimine os requisitos nem o aprofundamento. O ArchLab também tem casos de estudo práticos no menu Casos, onde você pode treinar a montagem da arquitetura e ver como ela se comporta sob carga.", "This article describes the roadmap we use in the full walkthroughs in this section. It fits interviews of 45 to 60 minutes; if yours is shorter, compress estimates and API, but never drop the requirements or the deep dive. ArchLab also has hands-on case studies in the Cases menu, where you can practice assembling the architecture and see how it behaves under load."]),
      h(["O que o entrevistador avalia", "What the interviewer evaluates"]),
      ul(
        ["**Estruturação do problema**: você delimita o escopo e conduz, em vez de esperar instruções.", "**Problem structuring**: you bound the scope and lead instead of waiting for instructions."],
        ["**Profundidade técnica**: você sabe como as peças funcionam por dentro (índices, replicação, filas, caches) e não só os nomes.", "**Technical depth**: you know how the parts work inside (indexes, replication, queues, caches), not only their names."],
        ["**Julgamento de trade-offs**: toda escolha tem custo, e você diz qual.", "**Trade-off judgment**: every choice has a cost, and you say which."],
        ["**Comunicação**: você pensa em voz alta, desenha com clareza e aceita pistas.", "**Communication**: you think aloud, draw clearly and accept hints."],
        ["**Pragmatismo**: você começa simples e só complica quando um requisito pede.", "**Pragmatism**: you start simple and only add complexity when a requirement asks for it."],
      ),
      h(["Os passos e o tempo de cada um", "The steps and their timing"]),
      table([["Etapa", "Step"], ["Tempo", "Time"], ["Resultado esperado", "Expected output"]],
        [["1. Escopo e metas", "1. Scope and goals"], ["3 min", "3 min"], ["O que entra, o que fica de fora", "What is in, what is out"]],
        [["2. Requisitos", "2. Requirements"], ["5 min", "5 min"], ["Funcionais e não funcionais, anotados", "Functional and non-functional, written down"]],
        [["3. Estimativas", "3. Estimates"], ["4 min", "4 min"], ["QPS, armazenamento, banda", "QPS, storage, bandwidth"]],
        [["4. API", "4. API"], ["3 min", "3 min"], ["3 a 5 endpoints principais", "3 to 5 main endpoints"]],
        [["5. Modelo de dados", "5. Data model"], ["4 min", "4 min"], ["Entidades, chaves, tipo de armazenamento", "Entities, keys, kind of storage"]],
        [["6. Design de alto nível", "6. High-level design"], ["8 min", "8 min"], ["Caixas e setas que atendem os requisitos", "Boxes and arrows that meet the requirements"]],
        [["7. Aprofundamento", "7. Deep dive"], ["12 min", "12 min"], ["Uma ou duas partes difíceis, com alternativas", "One or two hard parts, with alternatives"]],
        [["8. Gargalos e falhas", "8. Bottlenecks and failures"], ["4 min", "4 min"], ["Pontos únicos de falha, o que quebra com 10x", "Single points of failure, what breaks at 10x"]],
        [["9. Fechamento", "9. Wrap-up"], ["3 min", "3 min"], ["Resumo e próximos passos", "Summary and next steps"]],
      ),
      p(["A soma dá 45 minutos. Os tempos são guia, não cronômetro: se o entrevistador puxa um assunto, siga-o, porque ele está mostrando o que quer avaliar. O erro mais comum é gastar 20 minutos nas etapas 1 a 5 e chegar ao aprofundamento, que é onde a nota é decidida, com 5 minutos.", "The total is 45 minutes. Timings are a guide, not a stopwatch: if the interviewer pulls on a topic, follow it, because they are showing what they want to evaluate. The most common mistake is spending 20 minutes on steps 1 to 5 and reaching the deep dive, where the grade is decided, with 5 minutes left."]),
      fig(["O fluxo da entrevista", "The flow of the interview"],
        [[node("req", ["Requisitos", "Requirements"], "client")], [node("est", ["Estimativas", "Estimates"], "edge")], [node("api", ["API e dados", "API and data"], "service")], [node("hld", ["Design de alto nível", "High-level design"], "service")], [node("deep", ["Aprofundar e criticar", "Deep dive and critique"], "data")]],
        [edge("req", "est"), edge("est", "api"), edge("api", "hld"), edge("hld", "deep"), edge("deep", "req", ["volte se mudar", "revisit if it changes"], { dashed: true })]),
      h(["Etapa 1 e 2: esclarecer e fixar requisitos", "Steps 1 and 2: clarify and pin down requirements"]),
      p(["Nunca comece desenhando. Faça perguntas que mudem o desenho e anote as respostas em um canto do quadro, porque você vai voltar a elas. Separe os **requisitos funcionais** (o que o sistema faz) dos **não funcionais** (como ele se comporta: latência, disponibilidade, consistência, durabilidade, escala). Boas perguntas de esclarecimento, com o motivo de cada uma:", "Never start by drawing. Ask questions that change the design and write the answers in a corner of the board, because you will come back to them. Separate **functional requirements** (what the system does) from **non-functional** (how it behaves: latency, availability, consistency, durability, scale). Good clarifying questions, with the reason for each:"]),
      table([["Pergunta", "Question"], ["Por que importa", "Why it matters"]],
        [["Quantos usuários ativos por dia e qual a taxa de crescimento?", "How many daily active users and what growth rate?"], ["Define a escala e quando o design simples deixa de bastar", "Sets the scale and when the simple design stops being enough"]],
        [["A carga é dominada por leitura ou por escrita? Em que proporção?", "Is the load dominated by reads or writes? In what ratio?"], ["Decide cache, réplicas de leitura, fila de escrita", "Decides cache, read replicas, write queue"]],
        [["Qual a latência aceitável no p99?", "What is the acceptable p99 latency?"], ["Define se cabe um salto extra ou se precisa de cache e pré-cálculo", "Defines whether an extra hop fits or you need caching and precomputation"]],
        [["Posso perder dados? Posso mostrar dado velho?", "Can I lose data? Can I show stale data?"], ["Escolhe entre consistência forte e eventual, e o grau de replicação", "Chooses between strong and eventual consistency, and the replication level"]],
        [["Quais são os clientes: web, celular, parceiros via API?", "Who are the clients: web, mobile, partners via API?"], ["Afeta protocolo, autenticação e limites por cliente", "Affects protocol, authentication and per-client limits"]],
        [["O que está fora do escopo (autenticação, analytics, administração)?", "What is out of scope (authentication, analytics, administration)?"], ["Protege o tempo e evita desenhar o que ninguém pediu", "Protects time and avoids designing what nobody asked for"]],
        [["Há requisitos regionais ou legais (dados na UE, auditoria)?", "Are there regional or legal requirements (EU data, auditing)?"], ["Pode forçar multirregião, retenção e criptografia", "May force multi-region, retention and encryption"]],
      ),
      p(["Termine a etapa repetindo em voz alta: “então vou desenhar para 50 milhões de usuários por dia, leitura 100 vezes maior que escrita, disponibilidade de 99,99% e consistência eventual aceitável para a leitura. Concorda?”. Esse resumo é um contrato: se o entrevistador mudar de ideia depois, você pode apontar o que mudou.", "End the step by repeating aloud: “so I will design for 50 million users per day, reads 100 times writes, 99.99% availability and eventual consistency acceptable for reads. Agreed?”. This summary is a contract: if the interviewer changes their mind later, you can point out what changed."]),
      h(["Etapa 3: estimativas de ordem de grandeza", "Step 3: order-of-magnitude estimates"]),
      p(["O objetivo das contas não é a precisão, e sim descobrir **qual recurso é o gargalo**: CPU, banco, disco ou rede. Use números redondos e mostre o raciocínio. Um dia tem cerca de 86 mil segundos (arredonde para 100 mil quando quiser rapidez). Um mês tem cerca de 2,5 milhões de segundos, e um ano cerca de 30 milhões.", "The goal of the math is not precision but finding **which resource is the bottleneck**: CPU, database, disk or network. Use round numbers and show your reasoning. A day has about 86 thousand seconds (round to 100 thousand when you want speed). A month has about 2.5 million seconds, and a year about 30 million."]),
      code(`DAU            = 100,000,000
requests/user  = 10 / day
total/day      = 1,000,000,000
avg QPS        = 1e9 / 86,400  ~= 11,600 req/s
peak QPS       ~= 3 x avg       ~= 35,000 req/s

record size    = 500 B, 1% of requests create one
writes/day     = 10,000,000  -> 5 GB/day -> ~1.8 TB/year
read bandwidth = 35,000 req/s x 2 KB = 70 MB/s`),
      p(["Com isso você já decide: 35 mil leituras por segundo não cabem em um banco relacional único, mas cabem em um conjunto de réplicas com cache na frente; 1,8 TB por ano cabe em um nó, então sharding por volume não é urgente. Dizer isso em voz alta mostra que a conta serviu para alguma coisa.", "With that you already decide: 35 thousand reads per second do not fit a single relational database, but fit a set of replicas with a cache in front; 1.8 TB per year fits one node, so sharding for volume is not urgent. Saying this aloud shows the math served a purpose."]),
      h(["Etapas 4 e 5: API e modelo de dados", "Steps 4 and 5: API and data model"]),
      p(["Liste de três a cinco endpoints com método, caminho, parâmetros principais e resposta. Isso ancora o design e deixa explícito quem chama quem. Em seguida, desenhe as entidades com suas chaves e diga **como a consulta principal será atendida**: qual índice, qual chave de partição. Escolher o armazenamento a partir do padrão de acesso, e não por moda, é um dos sinais mais fortes de maturidade.", "List three to five endpoints with method, path, main parameters and response. This anchors the design and makes explicit who calls whom. Then draw the entities with their keys and say **how the main query will be served**: which index, which partition key. Choosing storage from the access pattern, not from fashion, is one of the strongest maturity signals."]),
      h(["Etapa 6: design de alto nível", "Step 6: high-level design"]),
      p(["Comece pelo mais simples que atende os requisitos: cliente, balanceador, serviço sem estado, banco. Só então adicione um componente quando um requisito o justificar, dizendo o motivo na hora: “entra um cache aqui porque a leitura é 100 vezes a escrita e o p99 pede menos de 100 ms”. Desenhe da esquerda para a direita seguindo o caminho de uma requisição, e depois percorra o caminho de escrita e o de leitura apontando cada seta.", "Start with the simplest thing that meets the requirements: client, load balancer, stateless service, database. Only then add a component when a requirement justifies it, saying the reason on the spot: “a cache goes here because reads are 100 times writes and the p99 asks for under 100 ms”. Draw left to right following a request path, then walk the write path and the read path pointing at each arrow."]),
      h(["Etapa 7: o aprofundamento", "Step 7: the deep dive"]),
      p(["É a etapa mais pesada na avaliação. Escolha a parte genuinamente difícil do problema (geração de IDs no encurtador, fan-out no feed, entrega no chat, idempotência nos pagamentos) ou deixe o entrevistador escolher. Apresente **duas ou três alternativas**, compare custo e risco de cada uma, escolha uma e diga o que faria se a premissa mudasse. Números ajudam: “com 1 milhão de seguidores, o fan-out na escrita gera 1 milhão de gravações por post, então para celebridades eu trocaria para leitura”.", "This is the heaviest step in the evaluation. Pick the genuinely hard part of the problem (ID generation in the shortener, fan-out in the feed, delivery in the chat, idempotency in payments) or let the interviewer pick. Present **two or three alternatives**, compare the cost and risk of each, choose one and say what you would do if the premise changed. Numbers help: “with 1 million followers, fan-out on write produces 1 million writes per post, so for celebrities I would switch to reads”."]),
      h(["Etapas 8 e 9: gargalos, falhas e fechamento", "Steps 8 and 9: bottlenecks, failures and wrap-up"]),
      p(["Revise o seu próprio desenho como um crítico. Procure caixas sem redundância, filas sem limite, consultas que cruzam shards, caches sem plano de invalidação. Responda à pergunta “o que quebra primeiro se o tráfego multiplicar por dez?” antes que ela seja feita. No fechamento, resuma em três frases a arquitetura, o principal trade-off aceito e o que você faria com mais tempo (monitoramento, multirregião, custos).", "Review your own design as a critic. Look for boxes without redundancy, unbounded queues, queries crossing shards, caches without an invalidation plan. Answer “what breaks first if traffic grows tenfold?” before it is asked. In the wrap-up, summarize in three sentences the architecture, the main trade-off accepted and what you would do with more time (monitoring, multi-region, costs)."]),
      h(["Como conduzir a conversa", "How to lead the conversation"]),
      ul(
        ["**Narre o que está fazendo e por quê**: “agora vou estimar o tráfego para saber se um banco aguenta”. O entrevistador acompanha e pode corrigir cedo.", "**Narrate what you are doing and why**: “now I will estimate traffic to know whether one database can cope”. The interviewer follows and can correct early."],
        ["**Faça check-ins curtos**: ao fim de cada etapa, pergunte se faz sentido seguir ou se há um ponto que ele prefira explorar.", "**Make short check-ins**: at the end of each step, ask whether it makes sense to continue or whether there is a point they would rather explore."],
        ["**Declare premissas**: se não houver resposta, assuma e diga que assumiu, para o entrevistador poder trocar a premissa.", "**State assumptions**: if there is no answer, assume and say you assumed, so the interviewer can swap the premise."],
        ["**Trate pistas como presentes**: “e se o cache cair?” não é um ataque, é um caminho. Agradeça, reavalie e ajuste.", "**Treat hints as gifts**: “what if the cache dies?” is not an attack, it is a path. Acknowledge, reassess and adjust."],
        ["**Use o quadro com ordem**: requisitos no canto, números à parte, diagrama no centro, uma cor ou marcação para o caminho crítico.", "**Use the board in an orderly way**: requirements in a corner, numbers aside, diagram in the middle, one color or marking for the critical path."],
        ["**Seja honesto sobre o que não sabe**: “não sei o detalhe do protocolo, mas o que eu precisaria dele é isto” vale mais do que inventar.", "**Be honest about what you do not know**: “I do not know the protocol detail, but what I would need from it is this” is worth more than inventing."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Siga uma ordem: requisitos, números, API, dados, desenho, aprofundamento, falhas, fechamento.", "Follow an order: requirements, numbers, API, data, design, deep dive, failures, wrap-up."],
        ["Gaste a maior fatia do tempo (cerca de um quarto) no aprofundamento.", "Spend the biggest slice of time (about a quarter) on the deep dive."],
        ["Comece simples, adicione componentes só com um requisito que os justifique e diga o gatilho.", "Start simple, add components only with a requirement that justifies them and name the trigger."],
        ["Pense em voz alta e trate as intervenções do entrevistador como pistas.", "Think aloud and treat the interviewer's interventions as hints."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**E se eu travar no meio?** Volte aos requisitos e pergunte a si mesmo qual deles o desenho atual não atende. Dizer isso em voz alta já destrava a conversa.", "**What if I get stuck midway?** Go back to the requirements and ask yourself which one the current design fails. Saying so aloud already unblocks the conversation."],
        ["**Preciso decorar números de capacidade?** Poucos: tempo de um dia em segundos, tamanho típico de um registro, e ordens de grandeza de disco, memória e rede. O resto você deduz.", "**Do I need to memorize capacity numbers?** A few: seconds in a day, typical record size, and orders of magnitude for disk, memory and network. The rest you derive."],
        ["**Posso citar tecnologias específicas?** Pode, desde que diga por que a escolheu e qual é a alternativa. “Redis” sem motivo vale menos que “um armazenamento em memória com TTL”.", "**May I name specific technologies?** Yes, as long as you say why and name the alternative. “Redis” with no reason is worth less than “an in-memory store with TTL”."],
        ["**O entrevistador mudou os requisitos no meio. E agora?** Aceite, diga o que muda no desenho e ajuste só essa parte. Mostra flexibilidade.", "**The interviewer changed the requirements midway. Now what?** Accept, say what changes in the design and adjust only that part. It shows flexibility."],
      ),
      tip(["Pense em voz alta. Silêncio não dá pontos; uma hipótese errada dita em voz alta e corrigida mostra raciocínio.", "Think out loud. Silence earns no points; a wrong hypothesis spoken aloud and corrected shows reasoning."]),
    ] },

  { id: "conceitos-que-mais-caem", section: "entrevistas", level: 1, icon: "checklist", minutes: 12,
    title: ["Conceitos que mais caem", "The concepts that come up most"],
    summary: ["Lista comentada do que dominar e o que dizer sobre cada tema, com os números que valem decorar.", "An annotated list of what to master and what to say about each topic, with the numbers worth memorizing."],
    body: [
      p(["Quase toda pergunta de entrevista é uma combinação dos mesmos blocos: armazenar dados, servi-los rápido, absorver picos, manter consistência e sobreviver a falhas. Conhecer cada bloco o bastante para dizer **quando usar, quanto custa e como falha** vale mais do que decorar arquiteturas prontas, porque o entrevistador sempre muda um requisito para ver se você entendeu o motivo da arquitetura.", "Almost every interview question is a combination of the same blocks: storing data, serving it fast, absorbing spikes, keeping consistency and surviving failures. Knowing each block well enough to say **when to use it, what it costs and how it fails** is worth more than memorizing ready-made architectures, because the interviewer always changes a requirement to see whether you understood the reason for the architecture."]),
      p(["Este artigo é um mapa de revisão. Cada tópico tem um artigo próprio nas outras seções da documentação; aqui o foco é **o que dizer sobre ele em uma entrevista**.", "This article is a review map. Each topic has its own article in the other documentation sections; here the focus is **what to say about it in an interview**."]),
      h(["Dados e armazenamento", "Data and storage"]),
      table([["Decisão", "Decision"], ["Quando escolher", "When to choose"], ["Custo e risco", "Cost and risk"]],
        [["Banco relacional (SQL)", "Relational database (SQL)"], ["Transações, junções, consultas variadas, volume moderado", "Transactions, joins, varied queries, moderate volume"], ["Escala de escrita é vertical; sharding é trabalhoso", "Write scale is vertical; sharding is laborious"]],
        [["Chave-valor", "Key-value"], ["Acesso por chave, latência baixa, escala horizontal", "Access by key, low latency, horizontal scale"], ["Sem consultas ricas; modelagem guiada pelo acesso", "No rich queries; access-driven modeling"]],
        [["Documentos", "Document store"], ["Registros hierárquicos, esquema flexível", "Hierarchical records, flexible schema"], ["Junções caras; consistência varia por produto", "Expensive joins; consistency varies by product"]],
        [["Colunar largo (estilo Cassandra)", "Wide-column (Cassandra style)"], ["Escrita massiva, séries temporais, várias regiões", "Massive writes, time series, multiple regions"], ["Consultas só pela chave de partição; consistência eventual", "Queries only by partition key; eventual consistency"]],
        [["Armazenamento de objetos", "Object storage"], ["Arquivos grandes: vídeo, imagem, backup", "Large files: video, images, backups"], ["Latência maior; sem edição parcial", "Higher latency; no partial edits"]],
        [["Índice de busca", "Search index"], ["Texto, filtros, relevância", "Text, filters, relevance"], ["Eventualmente consistente com a fonte; custo de reindexar", "Eventually consistent with the source; reindexing cost"]],
      ),
      ul(
        ["**Índices**: aceleram leitura e custam escrita e espaço. Cite o índice que a consulta principal usaria e se ele cobre a consulta.", "**Indexes**: speed up reads and cost writes and space. Name the index the main query would use and whether it covers the query."],
        ["**Replicação**: réplicas escalam leitura e dão disponibilidade, mas introduzem *atraso de replicação*; leituras logo após uma escrita podem ver dado velho. Mencione a leitura do próprio líder ou a sessão fixa como remédio.", "**Replication**: replicas scale reads and give availability, but introduce *replication lag*; reads right after a write may see stale data. Mention reading from the leader or sticky sessions as a remedy."],
        ["**Sharding**: escala escrita e volume, ao custo de consultas entre shards, transações difíceis e rebalanceamento. A **chave de partição** é a decisão central: ela deve espalhar a carga e agrupar o que é consultado junto. Evite chaves que criam pontos quentes (tempo, por exemplo).", "**Sharding**: scales writes and volume, at the cost of cross-shard queries, hard transactions and rebalancing. The **partition key** is the central decision: it must spread load and group what is queried together. Avoid keys that create hot spots (time, for example)."],
      ),
      h(["Desempenho e tráfego", "Performance and traffic"]),
      fig(["Camadas de leitura rápida", "Layers of fast reads"],
        [[node("cl", ["Cliente", "Client"], "client")], [node("cdn", "CDN", "edge")], [node("lb", ["Balanceador", "Load balancer"], "edge")], [node("app", ["Serviço", "Service"], "service")], [node("ca", "Cache", "cache"), node("db", ["Banco", "Database"], "data")]],
        [edge("cl", "cdn"), edge("cdn", "lb", ["miss", "miss"]), edge("lb", "app"), edge("app", "ca", ["1º", "1st"]), edge("app", "db", ["se errar", "on miss"], { dashed: true })]),
      ul(
        ["**Cache**: o padrão mais comum é *cache-aside* (a aplicação lê o cache, e em caso de erro busca no banco e preenche). Cite TTL, invalidação na escrita, a **debandada de cache** (muitos pedidos simultâneos para uma chave recém-expirada, mitigada com bloqueio por chave ou TTL com variação aleatória) e o que acontece quando o cache cai.", "**Caching**: the most common pattern is *cache-aside* (the application reads the cache and on a miss fetches from the database and fills it). Mention TTL, invalidation on write, the **cache stampede** (many simultaneous requests for a freshly expired key, mitigated with per-key locking or TTL jitter) and what happens when the cache dies."],
        ["**Balanceamento de carga**: algoritmos (round robin, menos conexões, hash), camada 4 x camada 7, verificação de saúde e o balanceador como ponto único de falha (use um par ou DNS com vários).", "**Load balancing**: algorithms (round robin, least connections, hash), layer 4 vs layer 7, health checks and the balancer as a single point of failure (use a pair or DNS with several)."],
        ["**Hashing consistente**: ao adicionar ou remover um nó, só uma fração das chaves muda de lugar, em vez de quase todas. Essencial em caches e bancos particionados.", "**Consistent hashing**: when a node is added or removed, only a fraction of keys move instead of nearly all. Essential for caches and partitioned databases."],
        ["**CDN**: conteúdo estático e de vídeo servido perto do usuário, reduz latência e tira carga da origem.", "**CDN**: static and video content served near the user reduces latency and takes load off the origin."],
        ["**Rate limiting**: protege contra abuso e vizinhos barulhentos. Token bucket e janela deslizante são os algoritmos mais citados.", "**Rate limiting**: protects against abuse and noisy neighbors. Token bucket and sliding window are the most cited algorithms."],
      ),
      h(["Consistência e assincronia", "Consistency and asynchrony"]),
      fig(["Escrita síncrona e trabalho assíncrono", "Synchronous write and asynchronous work"],
        [[node("api", "API", "service")], [node("db", ["Banco", "Database"], "data"), node("q", ["Fila", "Queue"], "queue")], [node("w", ["Workers", "Workers"], "service")], [node("ex", ["Sistemas externos", "External systems"], "ext")]],
        [edge("api", "db", ["grava", "writes"]), edge("api", "q", ["publica", "publishes"]), edge("q", "w", ["consome", "consumes"]), edge("w", "ex", ["e-mail, push", "email, push"])]),
      ul(
        ["**CAP e PACELC**: durante uma partição de rede, escolhe-se consistência ou disponibilidade; fora dela, a troca é entre latência e consistência. Dê exemplos: saldo bancário prefere consistência, contador de curtidas aceita consistência eventual.", "**CAP and PACELC**: during a network partition you choose consistency or availability; outside it, the trade is latency versus consistency. Give examples: bank balance prefers consistency, a like counter accepts eventual consistency."],
        ["**Filas e streams**: desacoplam produtor e consumidor, absorvem picos e permitem reprocessar. Diga que a entrega é, na prática, *pelo menos uma vez*, e que o consumidor precisa ser **idempotente**.", "**Queues and streams**: decouple producer and consumer, absorb spikes and allow reprocessing. Say that delivery is, in practice, *at least once*, and that the consumer must be **idempotent**."],
        ["**Transações distribuídas**: prefira saga (passos locais com compensação) a commit em duas fases quando possível, aceitando estados intermediários visíveis.", "**Distributed transactions**: prefer a saga (local steps with compensation) over two-phase commit when possible, accepting visible intermediate states."],
        ["**Consenso e eleição de líder**: saiba que Raft e Paxos existem para eleger líder e replicar um log de forma segura, e que você os usa por meio de sistemas como etcd ou ZooKeeper, não os reimplementa.", "**Consensus and leader election**: know that Raft and Paxos exist to elect a leader and replicate a log safely, and that you use them through systems like etcd or ZooKeeper, not reimplement them."],
        ["**Padrão outbox**: grave o evento na mesma transação do dado e publique depois, para não perder mensagens entre o banco e a fila.", "**Outbox pattern**: write the event in the same transaction as the data and publish it later, so messages are not lost between the database and the queue."],
      ),
      h(["Confiabilidade e operação", "Reliability and operations"]),
      ul(
        ["**Redundância**: elimine pontos únicos de falha em todas as camadas; diga quantas zonas de disponibilidade usa.", "**Redundancy**: remove single points of failure at every layer; say how many availability zones you use."],
        ["**Timeouts, retentativas e circuit breaker**: retentativa com recuo exponencial e variação aleatória, sempre com limite, e disjuntor para não martelar um serviço doente.", "**Timeouts, retries and circuit breaker**: retries with exponential backoff and jitter, always bounded, and a breaker so you do not hammer a sick service."],
        ["**Degradação graciosa**: se a recomendação falhar, mostre a lista padrão em vez de um erro.", "**Graceful degradation**: if recommendations fail, show the default list instead of an error."],
        ["**Observabilidade**: métricas, logs e traces; defina SLIs e SLOs e alerte sobre sintomas (erro e latência), não sobre causas.", "**Observability**: metrics, logs and traces; define SLIs and SLOs and alert on symptoms (errors and latency), not causes."],
      ),
      p(["Um último hábito vale para qualquer tópico acima: **traduzir o conceito em uma frase de decisão**. Em vez de “usamos cache”, diga “cacheio o perfil por 60 segundos porque ele é lido mil vezes mais do que muda, e invalido ao salvar”. Em vez de “usamos fila”, diga “a fila absorve o pico de campanha e permite que o worker consuma na velocidade que o provedor aceita”. A frase de decisão prova que você entendeu o motivo, que é exatamente o que o entrevistador testa ao mudar um requisito.", "One last habit applies to any topic above: **translate the concept into a decision sentence**. Instead of “we use a cache”, say “I cache the profile for 60 seconds because it is read a thousand times more than it changes, and I invalidate on save”. Instead of “we use a queue”, say “the queue absorbs the campaign spike and lets the worker consume at the speed the provider accepts”. The decision sentence proves you understood the reason, which is exactly what the interviewer tests by changing a requirement."]),
      h(["Números que valem decorar", "Numbers worth memorizing"]),
      table([["Item", "Item"], ["Ordem de grandeza", "Order of magnitude"]],
        [["Leitura de memória (RAM)", "Reading from memory (RAM)"], ["~100 ns", "~100 ns"]],
        [["Ida e volta no mesmo datacenter", "Round trip within a datacenter"], ["~0,5 ms", "~0.5 ms"]],
        [["Leitura aleatória em SSD", "Random read on SSD"], ["~100 µs", "~100 µs"]],
        [["Busca em disco rotativo", "Seek on a spinning disk"], ["~10 ms", "~10 ms"]],
        [["Ida e volta entre continentes", "Round trip across continents"], ["~150 ms", "~150 ms"]],
        [["Segundos em um dia", "Seconds in a day"], ["~86.400 (use 100 mil)", "~86,400 (use 100 thousand)"]],
        [["1 milhão de req/dia", "1 million req/day"], ["~12 req/s de média", "~12 req/s average"]],
      ),
      p(["Esses valores são ordens de grandeza para raciocinar, não medições de um produto específico. O ponto é lembrar que memória é cerca de mil vezes mais rápida que SSD em acesso aleatório, e que atravessar o oceano custa mais do que qualquer computação local.", "These values are orders of magnitude for reasoning, not measurements of a specific product. The point is remembering that memory is roughly a thousand times faster than SSD for random access, and that crossing an ocean costs more than any local computation."]),
      h(["Resumo", "Summary"]),
      ul(
        ["Escolha o armazenamento pelo padrão de acesso e justifique a chave de partição.", "Choose storage by access pattern and justify the partition key."],
        ["Camadas de cache e CDN tiram a leitura do caminho do banco; diga como invalida.", "Cache and CDN layers take reads off the database path; say how you invalidate."],
        ["Trabalho que não precisa ser síncrono vai para fila, com consumidores idempotentes.", "Work that need not be synchronous goes to a queue, with idempotent consumers."],
        ["Para cada componente: por que existe, o que acontece se cair, o que muda com 10x de tráfego.", "For each component: why it exists, what happens if it fails, what changes at 10x traffic."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Preciso saber todos os bancos NoSQL?** Não. Saiba as quatro famílias e o que cada uma faz bem, e cite um exemplo de cada.", "**Do I need to know all NoSQL databases?** No. Know the four families and what each does well, and cite one example each."],
        ["**CAP é só teoria?** É um modelo para explicar o que acontece na falha de rede. Use-o para justificar uma escolha concreta, não para recitar a definição.", "**Is CAP only theory?** It is a model to explain what happens in a network failure. Use it to justify a concrete choice, not to recite the definition."],
        ["**Quanto de detalhe de implementação devo dar?** O suficiente para mostrar que sabe como funciona por dentro, e pare quando o entrevistador mudar de assunto.", "**How much implementation detail should I give?** Enough to show you know how it works inside, and stop when the interviewer changes subject."],
      ),
      tip(["Para cada componente que você desenhar, esteja pronto para responder três perguntas: por que ele existe, o que acontece se ele falhar e o que muda se o tráfego multiplicar por dez.", "For each component you draw, be ready to answer three questions: why does it exist, what happens if it fails and what changes if traffic grows tenfold."]),
    ] },

  { id: "perguntas-comuns-de-entrevista", section: "entrevistas", level: 1, icon: "quiz", minutes: 12,
    title: ["Perguntas comuns de entrevista", "Common interview questions"],
    summary: ["O ângulo central, a armadilha e a pergunta de aprofundamento de cada problema clássico.", "The central angle, the pitfall and the deep-dive question of each classic problem."],
    body: [
      p(["Cada problema clássico existe para testar uma ideia específica. Se você identifica rápido o **ângulo central**, sabe onde gastar os 12 minutos de aprofundamento e quais armadilhas evitar. Um problema aparece com nomes diferentes (um “sistema de lembretes” é um sistema de notificações, um “Pastebin” é um encurtador com texto), então vale treinar a reconhecer o padrão por baixo do enunciado.", "Each classic problem exists to test a specific idea. If you quickly spot the **central angle**, you know where to spend the 12 minutes of deep dive and which pitfalls to avoid. A problem shows up under different names (a “reminder system” is a notification system, a “Pastebin” is a shortener with text), so it pays to practice recognizing the pattern beneath the statement."]),
      p(["As oito primeiras perguntas abaixo têm resolução completa nos artigos seguintes desta seção. O ArchLab também tem casos de estudo práticos no menu Casos, para montar a arquitetura e testá-la sob carga.", "The first eight questions below have full walkthroughs in the following articles of this section. ArchLab also has hands-on case studies in the Cases menu to assemble the architecture and test it under load."]),
      table([["Problema", "Problem"], ["Ângulo central", "Central angle"], ["Armadilha típica", "Typical pitfall"]],
        [["Encurtador de URL", "URL shortener"], ["IDs únicos e curtos; leitura domina", "Unique short IDs; reads dominate"], ["Ignorar colisão e expiração", "Ignoring collisions and expiry"]],
        [["Chat", "Chat"], ["Conexões persistentes e roteamento", "Persistent connections and routing"], ["Tratar como HTTP comum", "Treating it as plain HTTP"]],
        [["Feed de notícias", "News feed"], ["Fan-out na escrita x na leitura", "Fan-out on write vs on read"], ["Um só modelo para todos", "One model for everyone"]],
        [["Rate limiter", "Rate limiter"], ["Algoritmo e contador compartilhado", "Algorithm and shared counter"], ["Condição de corrida", "Race condition"]],
        [["Notificações", "Notifications"], ["Fila por canal, deduplicação, limites", "Queue per channel, dedup, limits"], ["Enviar de forma síncrona", "Sending synchronously"]],
        [["Streaming de vídeo", "Video streaming"], ["Transcodificação e CDN", "Transcoding and CDN"], ["Passar o arquivo pela aplicação", "Passing the file through the app"]],
        [["Pagamentos", "Payments"], ["Idempotência e consistência", "Idempotency and consistency"], ["Cobrança duplicada", "Double charging"]],
        [["Autocomplete", "Autocomplete"], ["Estrutura de prefixos e latência", "Prefix structure and latency"], ["Consultar o banco a cada tecla", "Querying the database on each keystroke"]],
      ),
      h(["Armazenamento e leitura em escala", "Storage and reading at scale"]),
      ul(
        ["**Encurtador de URL**: gerar IDs únicos e curtos (contador em base 62, hash com tratamento de colisão, ou faixas de IDs por servidor); a leitura é muito maior que a escrita, então cache e redirecionamento 301 x 302. *Aprofundamento:* como evitar colisão sem ponto único de falha? Armadilha: ignorar expiração.", "**URL shortener**: generating unique short IDs (base-62 counter, hash with collision handling, or ID ranges per server); reads far exceed writes, hence caching and 301 vs 302 redirects. *Deep dive:* how to avoid collisions without a single point of failure? Pitfall: ignoring expiry."],
        ["**Feed de notícias**: fan-out na escrita (pré-calcular o feed de cada seguidor) x na leitura (montar na hora), e a abordagem híbrida para celebridades. *Aprofundamento:* o que acontece quando alguém com 50 milhões de seguidores posta?", "**News feed**: fan-out on write (precompute each follower's feed) vs on read (build on the fly), and the hybrid approach for celebrities. *Deep dive:* what happens when someone with 50 million followers posts?"],
        ["**Busca e autocomplete**: índice invertido para busca, ou trie com as melhores sugestões pré-calculadas por nó, atualizada em lote. *Aprofundamento:* como refletir termos em alta sem reconstruir tudo?", "**Search and autocomplete**: an inverted index for search, or a trie with the top suggestions precomputed per node, updated in batches. *Deep dive:* how to reflect trending terms without rebuilding everything?"],
        ["**Cache distribuído**: particionamento com hashing consistente, política de remoção (LRU), replicação e o que fazer quando um nó cai. *Aprofundamento:* como evitar a debandada e o rebalanceamento em cascata?", "**Distributed cache**: partitioning with consistent hashing, eviction policy (LRU), replication and what to do when a node dies. *Deep dive:* how to avoid the stampede and cascading rebalancing?"],
        ["**Armazenamento de arquivos (estilo Dropbox)**: dividir em blocos, deduplicar por hash, sincronizar apenas o que mudou. *Aprofundamento:* resolução de conflitos entre dispositivos.", "**File storage (Dropbox style)**: split into blocks, deduplicate by hash, sync only what changed. *Deep dive:* conflict resolution across devices."],
      ),
      h(["Tempo real e fluxos assíncronos", "Real time and asynchronous flows"]),
      ul(
        ["**Chat**: conexões persistentes (WebSocket), roteamento de mensagem ao servidor em que o destinatário está conectado, ordenação, entrega offline e confirmação de leitura. *Aprofundamento:* como saber em que servidor o usuário está?", "**Chat**: persistent connections (WebSocket), routing a message to the server where the recipient is connected, ordering, offline delivery and read receipts. *Deep dive:* how do you know which server the user is on?"],
        ["**Notificações**: fila por canal (push, e-mail, SMS), preferências do usuário, deduplicação, retentativas e limites por provedor. *Aprofundamento:* como garantir que a mesma notificação não saia duas vezes?", "**Notifications**: a queue per channel (push, email, SMS), user preferences, deduplication, retries and per-provider limits. *Deep dive:* how to ensure the same notification does not go out twice?"],
        ["**Upload e streaming de vídeo**: upload em partes por URL pré-assinada, fila de transcodificação em várias resoluções, armazenamento de objetos e CDN com streaming adaptativo. *Aprofundamento:* paralelizar a transcodificação de um vídeo longo.", "**Video upload and streaming**: chunked upload via pre-signed URL, a transcoding queue for multiple resolutions, object storage and a CDN with adaptive streaming. *Deep dive:* parallelizing the transcoding of a long video."],
        ["**Corrida de carros ou entregas (estilo Uber)**: localização em tempo real, índice geoespacial (geohash ou quadtree), pareamento. *Aprofundamento:* consultar motoristas próximos com milhões de atualizações por minuto.", "**Ride hailing (Uber style)**: real-time location, geospatial index (geohash or quadtree), matching. *Deep dive:* querying nearby drivers with millions of updates per minute."],
      ),
      h(["Proteção e dinheiro", "Protection and money"]),
      ul(
        ["**Rate limiter**: algoritmo (token bucket, janela deslizante), contador compartilhado em memória rápida (Redis), onde aplicar (gateway) e o que fazer se o contador falhar. *Aprofundamento:* atomicidade do incremento entre várias instâncias.", "**Rate limiter**: algorithm (token bucket, sliding window), a shared counter in fast memory (Redis), where to apply it (gateway) and what to do if the counter fails. *Deep dive:* atomicity of the increment across several instances."],
        ["**Pagamentos**: **idempotência** (uma chave por tentativa), consistência forte, trilha de auditoria (livro-razão imutável), conciliação com o provedor e saga para falhas parciais. *Aprofundamento:* o que fazer quando o provedor não responde?", "**Payments**: **idempotency** (one key per attempt), strong consistency, an audit trail (immutable ledger), reconciliation with the provider and a saga for partial failures. *Deep dive:* what to do when the provider does not answer?"],
        ["**Ingressos e reservas**: a mesma vaga disputada por muitos; bloqueio temporário, locking otimista e fila de espera. *Aprofundamento:* evitar venda duplicada sem serializar tudo.", "**Tickets and bookings**: the same seat contested by many; temporary holds, optimistic locking and a waiting room. *Deep dive:* avoiding double sales without serializing everything."],
      ),
      h(["Padrões que se repetem entre os problemas", "Patterns that repeat across problems"]),
      fig(["Três famílias de problema e o remédio de cada uma", "Three problem families and the remedy for each"],
        [[node("rd", ["Leitura domina", "Reads dominate"], "client"), node("wr", ["Escrita domina", "Writes dominate"], "client"), node("cs", ["Consistência domina", "Consistency dominates"], "client")], [node("r1", ["Cache, CDN e réplicas", "Cache, CDN and replicas"], "cache"), node("w1", ["Filas, logs e particionamento", "Queues, logs and partitioning"], "queue"), node("c1", ["Transações e idempotência", "Transactions and idempotency"], "data")], [node("ex1", ["Encurtador, feed, autocomplete", "Shortener, feed, autocomplete"], "service"), node("ex2", ["Chat, notificações, vídeo", "Chat, notifications, video"], "service"), node("ex3", ["Pagamentos, reservas", "Payments, bookings"], "service")]],
        [edge("rd", "r1"), edge("wr", "w1"), edge("cs", "c1"), edge("r1", "ex1"), edge("w1", "ex2"), edge("c1", "ex3")]),
      p(["Quando a leitura domina, a pergunta é **onde guardar o resultado pronto** (cache, CDN, pré-cálculo). Quando a escrita domina, é **como absorver o volume** (fila, log, partição por chave). Quando a consistência domina, é **como garantir um único efeito** (transação, chave de idempotência, livro imutável). Quase todo problema novo é uma mistura dessas três famílias, e identificar qual pesa mais já dá a espinha do desenho.", "When reads dominate, the question is **where to keep the ready-made result** (cache, CDN, precomputation). When writes dominate, it is **how to absorb the volume** (queue, log, partition by key). When consistency dominates, it is **how to guarantee a single effect** (transaction, idempotency key, immutable ledger). Almost every new problem is a mix of these three families, and identifying which weighs most already gives the spine of the design."]),
      h(["Como se preparar com estas perguntas", "How to prepare with these questions"]),
      p(["Para cada problema, treine a mesma rotina: descubra na primeira pergunta se ele é dominado por **leitura, escrita ou consistência**, estime o tráfego, escreva a API, escolha a chave de partição, desenhe o caminho feliz e só depois percorra as falhas. Cronometre. Depois de resolver, compare com uma resolução de referência e anote o que você esqueceu: normalmente é a mesma meia dúzia de itens (idempotência, expiração, ponto único de falha, hot key, backpressure).", "For each problem, practice the same routine: find out in the first question whether it is dominated by **reads, writes or consistency**, estimate traffic, write the API, choose the partition key, draw the happy path and only then walk through failures. Time yourself. After solving, compare with a reference walkthrough and note what you forgot: it is usually the same half dozen items (idempotency, expiry, single point of failure, hot key, backpressure)."]),
      h(["Resumo", "Summary"]),
      ul(
        ["Cada problema clássico testa uma ideia; identifique-a nos primeiros minutos.", "Each classic problem tests one idea; identify it in the first minutes."],
        ["Prepare uma resposta para a pergunta de aprofundamento de cada um.", "Prepare an answer for each one's deep-dive question."],
        ["Treine reconhecendo o padrão sob nomes diferentes.", "Practice recognizing the pattern under different names."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Preciso resolver todos antes da entrevista?** Não. Resolva bem de quatro a seis, de famílias diferentes (leitura, tempo real, dinheiro), e o resto vira variação.", "**Do I need to solve all before the interview?** No. Solve four to six well, from different families (reads, real time, money), and the rest becomes variation."],
        ["**E se aparecer um problema que nunca vi?** Use o roteiro: requisitos, números, API, dados, desenho. O método funciona sem o decoreba.", "**What if a problem I have never seen appears?** Use the roadmap: requirements, numbers, API, data, design. The method works without memorization."],
        ["**Devo seguir a resolução de referência à risca?** Não. Elas são exemplos de raciocínio; mude premissas e veja o que muda no desenho.", "**Should I follow the reference walkthrough to the letter?** No. They are examples of reasoning; change assumptions and see what changes in the design."],
      ),
      tip(["Para cada problema, descubra na primeira pergunta se ele é dominado por leitura, escrita ou consistência. Essa resposta define quase todas as decisões seguintes.", "For each problem, find out with the first question whether it is dominated by reads, writes or consistency. That answer drives almost every following decision."]),
    ] },

  { id: "projetando-um-encurtador-de-url", section: "entrevistas", level: 1, icon: "link", minutes: 12,
    title: ["Projetando um encurtador de URL", "Designing a URL shortener"],
    summary: ["Como eu resolveria: requisitos, números, API, geração de IDs, cache, redirecionamento e falhas.", "How I would solve it: requirements, numbers, API, ID generation, caching, redirects and failures."],
    body: [
      p(["Um encurtador transforma `https://exemplo.com/artigos/2024/um-caminho-muito-longo?utm=x` em algo como `https://enc.co/aZ3k9Q`. Parece trivial, e por isso é o problema mais clássico: ele esconde duas ideias que valem a entrevista. A primeira é **gerar identificadores curtos, únicos e sem coordenação cara**. A segunda é um sistema com **leitura enormemente maior que escrita**, que se resolve com cache e bom uso de HTTP. Vou resolver como faria na entrevista, seguindo o roteiro.", "A shortener turns `https://example.com/articles/2024/a-very-long-path?utm=x` into something like `https://sho.rt/aZ3k9Q`. It looks trivial, which is why it is the most classic problem: it hides two ideas worth the interview. The first is **generating short, unique identifiers without expensive coordination**. The second is a system with **reads vastly exceeding writes**, solved with caching and good use of HTTP. I will solve it as I would in the interview, following the roadmap."]),
      h(["1. Requisitos", "1. Requirements"]),
      p(["Pergunto antes de desenhar e fixo o seguinte, que declaro em voz alta:", "I ask before drawing and fix the following, which I state aloud:"]),
      table([["Tipo", "Type"], ["Requisito", "Requirement"]],
        [["Funcional", "Functional"], ["Dada uma URL longa, gerar um link curto único", "Given a long URL, generate a unique short link"]],
        [["Funcional", "Functional"], ["Ao acessar o link curto, redirecionar para a URL original", "On accessing the short link, redirect to the original URL"]],
        [["Funcional", "Functional"], ["Alias personalizado opcional e data de expiração opcional", "Optional custom alias and optional expiry date"]],
        [["Funcional", "Functional"], ["Contagem de cliques (analytics simples, não em tempo real)", "Click counts (simple analytics, not real time)"]],
        [["Não funcional", "Non-functional"], ["Redirecionamento muito rápido: p99 abaixo de 100 ms", "Very fast redirect: p99 under 100 ms"]],
        [["Não funcional", "Non-functional"], ["Alta disponibilidade (99,99%): link quebrado é inaceitável", "High availability (99.99%): a broken link is unacceptable"]],
        [["Não funcional", "Non-functional"], ["Links não devem ser previsíveis (não dá para enumerar todos)", "Links must not be predictable (cannot enumerate them all)"]],
        [["Fora de escopo", "Out of scope"], ["Contas de usuário completas, painel, detecção de malware", "Full user accounts, dashboards, malware detection"]],
      ),
      h(["2. Estimativas", "2. Estimates"]),
      code(`new URLs        = 100,000,000 / month
write QPS       = 1e8 / 2.5e6      ~= 40 /s   (peak ~120 /s)
read:write      = 100 : 1
read QPS        = 40 x 100         ~= 4,000 /s (peak ~12,000 /s)

retention       = 5 years -> 100M x 12 x 5 = 6 billion URLs
record size     ~= 500 B (long URL up to ~400 B + metadata)
storage         = 6e9 x 500 B      ~= 3 TB total

short code len  : 62^6 = 5.7e10, 62^7 = 3.5e12
                  6 billion fits in 7 chars with large margin

cache           : 20% of links produce 80% of reads
                  daily reads 4,000 x 86,400 ~= 350M; hot set ~70M x 500 B ~= 35 GB`),
      p(["As contas contam a história: 40 escritas por segundo é trivial, 12 mil leituras por segundo no pico é manejável com cache, 3 TB cabem em um banco particionado sem drama, e 7 caracteres em base 62 bastam com folga. O difícil não é a escala, é **gerar o código sem colisão e sem ponto único de falha**.", "The math tells the story: 40 writes per second is trivial, 12 thousand reads per second at peak is manageable with a cache, 3 TB fits a partitioned database without drama, and 7 base-62 characters are plenty. The hard part is not scale, it is **generating the code without collisions and without a single point of failure**."]),
      h(["3. API", "3. API"]),
      code(`POST /api/v1/urls
  body: { "longUrl": "https://...", "alias": "my-link"?, "expiresAt": "2027-01-01T00:00:00Z"? }
  201:  { "shortUrl": "https://enc.co/aZ3k9Q", "code": "aZ3k9Q" }
  409:  alias already taken
  Header: Idempotency-Key (optional, same key returns the same link)

GET /{code}
  301 or 302, Location: <longUrl>
  404 not found, 410 expired

GET /api/v1/urls/{code}/stats
  200: { "clicks": 1234, "byDay": [...] }`),
      p(["Uso `GET /{code}` na raiz para o link ficar curto. A escolha entre **301** (permanente) e **302** (temporário) é uma decisão de produto: o 301 é cacheado pelo navegador e reduz carga, mas as visitas seguintes nem chegam ao servidor, então a contagem de cliques fica incompleta e não dá para desativar o link. Com analytics e expiração como requisitos, uso **302** (ou 301 com cache curto controlado por `Cache-Control`).", "I use `GET /{code}` at the root to keep the link short. The choice between **301** (permanent) and **302** (temporary) is a product decision: 301 is cached by the browser and reduces load, but later visits never reach the server, so click counting becomes incomplete and the link cannot be disabled. With analytics and expiry as requirements, I use **302** (or 301 with a short cache controlled via `Cache-Control`)."]),
      h(["4. Modelo de dados", "4. Data model"]),
      code(`CREATE TABLE urls (
  code        VARCHAR(10) PRIMARY KEY,   -- the short code
  long_url    TEXT        NOT NULL,
  owner_id    BIGINT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ
);
-- access pattern: lookup by code only -> key-value fits perfectly`),
      p(["O único acesso quente é “dado o código, devolva a URL”. Isso é uma busca por chave, sem junções, então um armazenamento chave-valor ou colunar largo (DynamoDB, Cassandra) escala melhor e com menos esforço que um relacional particionado manualmente. Um PostgreSQL com réplicas também atenderia esta escala (3 TB é viável); eu o citaria como alternativa mais simples de operar se o time já o usa. A tabela de cliques fica separada, alimentada por eventos assíncronos.", "The only hot access is “given the code, return the URL”. That is a key lookup with no joins, so a key-value or wide-column store (DynamoDB, Cassandra) scales better and with less effort than a manually partitioned relational database. A PostgreSQL with replicas would also serve this scale (3 TB is feasible); I would mention it as the simpler-to-operate alternative if the team already uses it. The clicks table is separate, fed by asynchronous events."]),
      h(["5. Design de alto nível", "5. High-level design"]),
      fig(["Encurtador de URL", "URL shortener"],
        [[node("cl", ["Navegador", "Browser"], "client")], [node("lb", ["Balanceador", "Load balancer"], "edge")], [node("w", ["Serviço de escrita", "Write service"], "service"), node("r", ["Serviço de redirect", "Redirect service"], "service")], [node("ca", "Cache", "cache"), node("id", ["Gerador de IDs", "ID generator"], "service")], [node("db", ["Banco de URLs", "URL store"], "data"), node("q", ["Fila de cliques", "Click queue"], "queue")]],
        [edge("cl", "lb"), edge("lb", "w", "POST"), edge("lb", "r", "GET"), edge("w", "id", ["pede faixa", "gets range"]), edge("w", "db", ["grava", "writes"]), edge("r", "ca", ["1º", "1st"]), edge("r", "db", ["se errar", "on miss"], { dashed: true }), edge("r", "q", ["evento", "event"], { dashed: true })]),
      p(["Separo os caminhos de **escrita** e de **redirecionamento** porque têm perfis opostos: o segundo recebe cem vezes mais tráfego, deve ficar leve e escalar sozinho. Os dois são serviços sem estado atrás do balanceador, então escalam horizontalmente. O redirecionamento consulta o cache antes do banco e publica um evento de clique em uma fila **sem esperar por ela**, para a contagem não aumentar a latência.", "I separate the **write** and **redirect** paths because they have opposite profiles: the second gets a hundred times more traffic, should stay light and scale on its own. Both are stateless services behind the balancer, so they scale horizontally. Redirect queries the cache before the database and publishes a click event to a queue **without waiting for it**, so counting does not add latency."]),
      h(["6. Aprofundamento: gerar o código curto", "6. Deep dive: generating the short code"]),
      table([["Abordagem", "Approach"], ["Como funciona", "How it works"], ["Vantagem", "Advantage"], ["Problema", "Problem"]],
        [["Hash da URL (MD5, SHA-256) e truncar", "Hash of the URL (MD5, SHA-256), truncated"], ["Pega 7 caracteres do hash em base 62", "Takes 7 base-62 characters of the hash"], ["Sem coordenação; mesma URL, mesmo código", "No coordination; same URL, same code"], ["Colisão: truncar aumenta a chance; exige verificar e tentar de novo", "Collisions: truncating raises the chance; requires checking and retrying"]],
        [["Contador global em base 62", "Global counter in base 62"], ["Um contador incrementa e converte o número para base 62", "A counter increments and the number is converted to base 62"], ["Sem colisões, códigos curtos", "No collisions, short codes"], ["Previsível; contador único é gargalo e ponto de falha", "Predictable; a single counter is a bottleneck and SPOF"]],
        [["Faixas de IDs por servidor", "ID ranges per server"], ["Um serviço entrega a cada servidor um bloco (por exemplo, 1 milhão de números)", "A service hands each server a block (for example, 1 million numbers)"], ["Sem colisões; coordena uma vez por bloco, não por URL", "No collisions; coordinates once per block, not per URL"], ["Sequencial sem embaralhar; perder um servidor desperdiça o resto do bloco", "Sequential unless shuffled; losing a server wastes the rest of its block"]],
        [["ID aleatório (7 caracteres) com inserção condicional", "Random ID (7 chars) with conditional insert"], ["Sorteia, tenta inserir se não existir, repete se existir", "Draws, inserts if absent, retries if present"], ["Imprevisível; simples", "Unpredictable; simple"], ["Com 6 bilhões de 3,5 trilhões, a chance de colisão é de cerca de 0,2%: raro, mas precisa do retry", "With 6 billion of 3.5 trillion, collision chance is about 0.2%: rare but needs the retry"]],
      ),
      p(["Minha escolha: **faixas de IDs por servidor** combinadas com um embaralhamento reversível (uma permutação bijetiva dos bits, ou uma cifra de formato preservado) antes de converter para base 62. A faixa elimina colisões e coordenação por URL; o embaralhamento torna o código imprevisível sem perder a unicidade. O serviço de faixas pode ser um banco com `UPDATE counter SET next = next + 1000000 RETURNING` ou o ZooKeeper/etcd. Se ele cair, os servidores continuam gerando códigos até acabar o bloco, e o bloco pode ser grande o bastante para durar minutos ou horas.", "My choice: **ID ranges per server** combined with a reversible shuffle (a bijective bit permutation, or a format-preserving cipher) before converting to base 62. The range removes collisions and per-URL coordination; the shuffle makes the code unpredictable without losing uniqueness. The range service can be a database with `UPDATE counter SET next = next + 1000000 RETURNING` or ZooKeeper/etcd. If it goes down, servers keep generating codes until the block runs out, and the block can be large enough to last minutes or hours."]),
      code(`const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function toBase62(n: bigint): string {
  if (n === 0n) return "0";
  let out = "";
  while (n > 0n) { out = ALPHABET[Number(n % 62n)] + out; n /= 62n; }
  return out;
}

// scramble is a bijection on [0, 62^7): same input, same output, never collides
function newCode(nextId: bigint): string {
  return toBase62(scramble(nextId)).padStart(7, "0");
}`),
      p(["O **alias personalizado** é uma inserção condicional (`INSERT ... IF NOT EXISTS`): se já existe, responde 409. Para **expiração**, guardo `expires_at` e checo na leitura; uma rotina em segundo plano apaga os vencidos, e o TTL nativo do armazenamento ajuda. O código de um link expirado só deve ser reutilizado depois de um período de quarentena, para links antigos não apontarem para destinos novos.", "The **custom alias** is a conditional insert (`INSERT ... IF NOT EXISTS`): if it exists, answer 409. For **expiry**, I store `expires_at` and check on read; a background job deletes expired ones, and the store's native TTL helps. An expired link's code should only be reused after a quarantine period, so old links do not point to new destinations."]),
      h(["7. Aprofundamento: a leitura rápida", "7. Deep dive: the fast read"]),
      p(["O caminho do redirecionamento é: cache em memória (Redis ou Memcached) com a chave `code`, e em caso de erro o banco, preenchendo o cache em seguida (*cache-aside*). Como 20% dos links geram 80% do tráfego, cerca de 35 GB bastam para o conjunto quente, que cabe em poucos nós. Uso a política LRU e TTL com variação aleatória para evitar expirações simultâneas. Para um link viral (uma chave quente), o cache local no processo do serviço de redirecionamento, com TTL de segundos, impede que um único nó do Redis vire gargalo.", "The redirect path is: in-memory cache (Redis or Memcached) keyed by `code`, and on a miss the database, filling the cache afterwards (*cache-aside*). Since 20% of links produce 80% of traffic, about 35 GB covers the hot set, which fits a few nodes. I use LRU and TTL with jitter to avoid simultaneous expirations. For a viral link (a hot key), a local in-process cache in the redirect service with a TTL of seconds prevents a single Redis node from becoming a bottleneck."]),
      p(["Também cacheio **respostas negativas** por pouco tempo (códigos inexistentes), para um atacante que varre códigos aleatórios não derrubar o banco, e aplico um limitador de taxa por IP no balanceador. Uma CDN na frente também ajuda quando se usa 301 com cache curto.", "I also cache **negative responses** for a short time (nonexistent codes), so an attacker scanning random codes does not take down the database, and apply a per-IP rate limit at the balancer. A CDN in front also helps when using 301 with a short cache."]),
      h(["8. Analytics sem pesar no redirecionamento", "8. Analytics without weighing down the redirect"]),
      p(["Cada clique vira um evento (`code`, instante, país, agente de usuário) publicado em uma fila ou stream (Kafka, por exemplo) de forma assíncrona. Um consumidor agrega por minuto e grava em uma tabela de contagem ou em um armazenamento analítico. Se a fila estiver indisponível, o redirecionamento continua e o evento é descartado ou guardado localmente: **a disponibilidade do redirecionamento vem antes da exatidão da contagem**. Esse é um trade-off que declaro explicitamente.", "Each click becomes an event (`code`, time, country, user agent) published to a queue or stream (Kafka, for instance) asynchronously. A consumer aggregates per minute and writes to a counts table or an analytics store. If the queue is unavailable, the redirect keeps working and the event is dropped or buffered locally: **redirect availability comes before count accuracy**. This is a trade-off I state explicitly."]),
      h(["9. Gargalos, falhas e escala", "9. Bottlenecks, failures and scale"]),
      ul(
        ["**Banco**: particiono por `code` (hash), com 3 réplicas e leitura das réplicas. Hashing consistente permite adicionar nós sem mover tudo.", "**Database**: partition by `code` (hash), with 3 replicas and reads served from replicas. Consistent hashing lets me add nodes without moving everything."],
        ["**Serviço de faixas de IDs**: pode ser SPOF. Mitigo com blocos grandes e três réplicas do serviço com consenso.", "**ID range service**: may be a SPOF. I mitigate with large blocks and three replicas of the service with consensus."],
        ["**Queda do cache**: o banco recebe todas as leituras. Mantenho margem de capacidade, proteção contra debandada (bloqueio por chave) e réplicas do cache.", "**Cache loss**: the database receives all reads. I keep capacity headroom, stampede protection (per-key lock) and cache replicas."],
        ["**Abuso**: encurtadores são usados para phishing. Verificação contra listas de URLs maliciosas na criação e limite de criação por usuário e IP.", "**Abuse**: shorteners are used for phishing. Check against malicious URL lists at creation and cap creation per user and IP."],
        ["**Multirregião**: réplicas do armazenamento e serviços de redirecionamento em várias regiões, roteados por DNS por latência; a escrita pode ir a uma região líder, pois é rara.", "**Multi-region**: store replicas and redirect services in several regions, routed by latency-based DNS; writes can go to a leader region since they are rare."],
      ),
      h(["Perguntas de follow-up", "Follow-up questions"]),
      ul(
        ["**E se o mesmo link longo for encurtado duas vezes?** Pode gerar dois códigos (mais simples, e cada usuário tem suas estatísticas) ou deduplicar por hash da URL (economiza espaço, mas mistura estatísticas). Escolho gerar dois por padrão.", "**What if the same long link is shortened twice?** It can produce two codes (simpler, and each user has their own stats) or deduplicate by URL hash (saves space but mixes stats). I choose two codes by default."],
        ["**Como evitar que adivinhem links privados?** Códigos imprevisíveis de 7 ou mais caracteres e, para conteúdo sensível, um token longo aleatório e autenticação.", "**How to prevent guessing private links?** Unpredictable codes of 7 or more characters and, for sensitive content, a long random token plus authentication."],
        ["**Como suportar 100 vezes mais tráfego?** Mais réplicas de cache e serviço de redirecionamento, CDN com 301 curto, cache local por processo e particionamento do banco.", "**How to support 100 times more traffic?** More cache and redirect service replicas, a CDN with a short 301, per-process local cache and database partitioning."],
        ["**Como apagar um link?** Marcar como removido e invalidar o cache; o 410 informa ao cliente.", "**How to delete a link?** Mark it removed and invalidate the cache; 410 tells the client."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Leitura é cem vezes a escrita: separe os serviços e coloque cache na frente.", "Reads are a hundred times writes: split the services and put a cache in front."],
        ["O núcleo é gerar o código: faixas por servidor mais embaralhamento dão unicidade sem coordenação por URL.", "The core is code generation: per-server ranges plus a shuffle give uniqueness without per-URL coordination."],
        ["Use 302 quando analytics ou expiração importam; 301 quando a carga importa mais.", "Use 302 when analytics or expiry matter; 301 when load matters more."],
        ["Analytics é assíncrono e perdoável; o redirecionamento nunca espera por ele.", "Analytics is asynchronous and forgivable; the redirect never waits for it."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Por que base 62 e não base 64?** A base 64 inclui `+` e `/`, que não são seguros em URLs sem codificação; a base 62 usa só letras e dígitos.", "**Why base 62 and not base 64?** Base 64 includes `+` and `/`, which are not URL-safe without encoding; base 62 uses only letters and digits."],
        ["**Um hash não seria mais simples?** É simples, mas exige tratar colisões e a mesma URL gera o mesmo código para todos os usuários, o que complica estatísticas e remoção.", "**Would a hash not be simpler?** It is simple, but requires handling collisions and the same URL yields the same code for all users, which complicates stats and removal."],
        ["**Preciso de SQL ou NoSQL?** O acesso é por chave, então NoSQL se encaixa; um SQL com réplicas serve nessa escala. Justifique pelo acesso e pela equipe.", "**Do I need SQL or NoSQL?** Access is by key, so NoSQL fits; SQL with replicas works at this scale. Justify by access pattern and team."],
      ),
      tip(["No encurtador, o que o entrevistador quer ouvir é o raciocínio sobre a geração do código e sobre 301 x 302. O resto é aplicação de cache e partição.", "In the shortener, what the interviewer wants to hear is the reasoning about code generation and about 301 vs 302. The rest is applying cache and partitioning."]),
    ] },

  { id: "projetando-um-chat", section: "entrevistas", level: 2, icon: "chat", minutes: 12,
    title: ["Projetando um chat", "Designing a chat"],
    summary: ["Como eu resolveria: conexões persistentes, roteamento, ordenação, entrega offline, grupos e presença.", "How I would solve it: persistent connections, routing, ordering, offline delivery, groups and presence."],
    body: [
      p(["Um chat (pense em WhatsApp, Telegram ou o chat de uma plataforma) parece uma tabela de mensagens, mas o desafio está em outro lugar: **entregar em tempo real a quem está conectado em algum de milhares de servidores**, sem perder nem duplicar mensagens, mantendo a ordem e funcionando quando o destinatário está offline. Este problema testa conexões persistentes, roteamento, armazenamento de grande escrita e semântica de entrega.", "A chat (think WhatsApp, Telegram or a platform's chat) looks like a messages table, but the challenge lies elsewhere: **delivering in real time to someone connected to one of thousands of servers**, without losing or duplicating messages, keeping order and working when the recipient is offline. This problem tests persistent connections, routing, write-heavy storage and delivery semantics."]),
      h(["1. Requisitos", "1. Requirements"]),
      table([["Tipo", "Type"], ["Requisito", "Requirement"]],
        [["Funcional", "Functional"], ["Conversas um a um e em grupo (até 500 pessoas)", "One-to-one and group conversations (up to 500 people)"]],
        [["Funcional", "Functional"], ["Entrega em tempo real quando o destinatário está online", "Real-time delivery when the recipient is online"]],
        [["Funcional", "Functional"], ["Entrega posterior quando está offline, com notificação push", "Later delivery when offline, with a push notification"]],
        [["Funcional", "Functional"], ["Histórico sincronizado entre dispositivos; recibos de entrega e leitura", "History synced across devices; delivery and read receipts"]],
        [["Funcional", "Functional"], ["Indicador de presença (online, visto por último)", "Presence indicator (online, last seen)"]],
        [["Não funcional", "Non-functional"], ["Latência de entrega abaixo de 200 ms entre usuários online", "Delivery latency under 200 ms between online users"]],
        [["Não funcional", "Non-functional"], ["Nenhuma mensagem aceita pode ser perdida (durabilidade)", "No accepted message may be lost (durability)"]],
        [["Não funcional", "Non-functional"], ["Ordem consistente dentro de cada conversa", "Consistent order within each conversation"]],
        [["Fora de escopo", "Out of scope"], ["Chamadas de voz e vídeo, criptografia ponta a ponta (cito como extensão)", "Voice and video calls, end-to-end encryption (mentioned as an extension)"]],
      ),
      h(["2. Estimativas", "2. Estimates"]),
      code(`DAU                 = 100,000,000
messages/user/day   = 40
messages/day        = 4e9            -> avg ~46,000 msg/s (peak ~150,000 msg/s)

message size        = 200 B (text) + metadata
storage/day         = 4e9 x 200 B    = 800 GB/day -> ~290 TB/year (before replication x3)

concurrent connections ~= 30% of DAU = 30,000,000
per gateway server     ~= 100,000 connections
gateways needed        ~= 300 (plus headroom -> ~450)`),
      p(["Duas conclusões: a **escrita domina** (cada mensagem é uma gravação, e o histórico cresce a centenas de terabytes por ano), e o número de **conexões simultâneas** (dezenas de milhões) dita a frota de servidores de conexão, não o CPU por mensagem. Um servidor moderno com um runtime orientado a eventos mantém centenas de milhares de conexões ociosas; o limite real é memória por conexão e descritores de arquivo.", "Two conclusions: **writes dominate** (each message is a write, and history grows by hundreds of terabytes per year), and the number of **concurrent connections** (tens of millions) dictates the connection server fleet, not CPU per message. A modern server with an event-driven runtime holds hundreds of thousands of idle connections; the real limit is memory per connection and file descriptors."]),
      h(["3. API e protocolo", "3. API and protocol"]),
      p(["Para tempo real uso **WebSocket**: uma conexão TCP persistente e bidirecional, o servidor empurra mensagens sem o cliente perguntar. A alternativa é *long polling* (mais simples, mais caro) ou Server-Sent Events (só do servidor para o cliente). Operações que não são tempo real (histórico, perfil, grupos) ficam em uma API REST comum.", "For real time I use **WebSocket**: a persistent bidirectional TCP connection where the server pushes messages without the client asking. The alternatives are *long polling* (simpler, more expensive) or Server-Sent Events (server to client only). Non-real-time operations (history, profile, groups) stay in a plain REST API."]),
      code(`// client -> server (WebSocket frames)
{ "type": "send",  "clientMsgId": "uuid", "conversationId": "c42", "body": "hi" }
{ "type": "ack",   "messageId": "m991" }          // delivered to device
{ "type": "read",  "conversationId": "c42", "upTo": "m991" }

// server -> client
{ "type": "message", "messageId": "m991", "conversationId": "c42", "senderId": "u7", "seq": 1204, "body": "hi" }
{ "type": "sent",    "clientMsgId": "uuid", "messageId": "m991", "seq": 1204 }

// REST
GET /v1/conversations/{id}/messages?before=seq&limit=50
POST /v1/groups   { "name": "...", "members": ["u1","u2"] }`),
      p(["O `clientMsgId` gerado no cliente torna o envio **idempotente**: se a conexão cair antes do `sent`, o cliente reenvia com o mesmo id e o servidor reconhece a duplicata. O `seq` é a posição da mensagem na conversa e resolve a ordenação.", "The `clientMsgId` generated by the client makes sending **idempotent**: if the connection drops before `sent`, the client resends with the same id and the server recognizes the duplicate. The `seq` is the message's position in the conversation and solves ordering."]),
      h(["4. Modelo de dados", "4. Data model"]),
      code(`-- wide-column store, partitioned by conversation
messages(
  conversation_id  PARTITION KEY,
  seq              CLUSTERING KEY (ascending),
  message_id, sender_id, body, created_at, client_msg_id
)

conversations(conversation_id, type, name, created_at)
members(conversation_id, user_id, last_read_seq, muted)
inbox(user_id, conversation_id, last_seq, last_activity)   -- list of chats`),
      p(["O acesso quente é “as últimas N mensagens de uma conversa”, em ordem. Particionar por `conversation_id` e ordenar por `seq` entrega isso em uma leitura sequencial. Um armazenamento colunar largo (Cassandra, ScyllaDB) lida bem com escrita enorme e partições ordenadas; o histórico antigo pode migrar para armazenamento frio. Metadados de conversas e membros, de baixo volume e com relações, ficam em um banco relacional.", "The hot access is “the last N messages of a conversation”, in order. Partitioning by `conversation_id` and ordering by `seq` delivers it in one sequential read. A wide-column store (Cassandra, ScyllaDB) handles huge writes and ordered partitions well; old history can move to cold storage. Metadata for conversations and members, low volume and relational, lives in a relational database."]),
      h(["5. Design de alto nível", "5. High-level design"]),
      fig(["Chat com conexões persistentes", "Chat with persistent connections"],
        [[node("a", ["Cliente A", "Client A"], "client"), node("b", ["Cliente B", "Client B"], "client")], [node("gw1", ["Gateway 1 (WebSocket)", "Gateway 1 (WebSocket)"], "edge"), node("gw2", ["Gateway 2 (WebSocket)", "Gateway 2 (WebSocket)"], "edge")], [node("cs", ["Serviço de chat", "Chat service"], "service"), node("pr", ["Registro de sessões", "Session registry"], "cache")], [node("bus", ["Barramento pub/sub", "Pub/sub bus"], "queue"), node("st", ["Armazenamento de mensagens", "Message store"], "data")], [node("push", ["Serviço de push", "Push service"], "ext")]],
        [edge("a", "gw1", "WS", { both: true }), edge("b", "gw2", "WS", { both: true }), edge("gw1", "cs"), edge("cs", "st", ["grava", "persists"]), edge("cs", "pr", ["onde está B?", "where is B?"]), edge("cs", "bus", ["roteia", "routes"]), edge("bus", "gw2", ["entrega", "delivers"]), edge("cs", "push", ["se offline", "if offline"], { dashed: true })]),
      p(["O fluxo de uma mensagem de A para B:", "The flow of a message from A to B:"]),
      ul(
        ["A envia pelo WebSocket ao **gateway 1**, que apenas mantém conexões e repassa ao serviço de chat (sem regra de negócio, para ser leve e sem estado de conversa).", "A sends over WebSocket to **gateway 1**, which only holds connections and forwards to the chat service (no business logic, to stay light and without conversation state)."],
        ["O serviço de chat valida, atribui `seq` e **grava no armazenamento antes de confirmar**. Só então responde `sent` a A. Essa ordem garante que nenhuma mensagem confirmada se perca.", "The chat service validates, assigns `seq` and **writes to the store before acknowledging**. Only then does it reply `sent` to A. This order guarantees no acknowledged message is lost."],
        ["Consulta o **registro de sessões** (um armazenamento rápido: usuário para gateway) para saber em que gateway B está conectado.", "It queries the **session registry** (a fast store: user to gateway) to learn which gateway B is connected to."],
        ["Publica a mensagem no canal do gateway 2 no barramento (Redis Pub/Sub ou Kafka). O gateway 2 empurra para B pelo WebSocket.", "It publishes the message to gateway 2's channel on the bus (Redis Pub/Sub or Kafka). Gateway 2 pushes it to B over WebSocket."],
        ["B responde `ack`; o serviço marca como entregue e notifica A (um tique duplo).", "B replies `ack`; the service marks it delivered and notifies A (a double tick)."],
        ["Se B está offline (nenhuma sessão), a mensagem já está no armazenamento; o serviço aciona o **push** (APNs/FCM). Quando B reconectar, pede tudo com `seq` maior que o último que viu.", "If B is offline (no session), the message is already in the store; the service triggers **push** (APNs/FCM). When B reconnects, it requests everything with `seq` greater than the last one it saw."],
      ),
      h(["6. Aprofundamento: ordenação e entrega confiável", "6. Deep dive: ordering and reliable delivery"]),
      p(["**Ordenação.** Relógios de máquinas diferentes discordam, então ordenar por horário de chegada é frágil. Em conversas, preciso de ordem **dentro de cada conversa**, não global. Atribuo um `seq` crescente por conversa: o serviço que processa aquela conversa incrementa o contador (um contador por partição, no próprio armazenamento ou em memória com um líder por conversa). Como todas as mensagens de uma conversa passam por um único líder de partição, a ordem é definida lá. Isso evita um relógio global, que é caro.", "**Ordering.** Clocks on different machines disagree, so ordering by arrival time is fragile. In conversations I need order **within each conversation**, not global. I assign an increasing `seq` per conversation: the service handling that conversation increments the counter (one counter per partition, in the store itself or in memory with a leader per conversation). Since all messages of a conversation pass through a single partition leader, order is defined there. This avoids a global clock, which is expensive."]),
      p(["**Entrega pelo menos uma vez com deduplicação.** Redes falham, então o sistema reenvia até receber o `ack`. Isso gera duplicatas, que o cliente descarta pelo `messageId`/`seq` já visto. O resultado percebido é “exatamente uma vez” sem ser um protocolo exatamente-uma-vez de verdade. Se o cliente perceber um buraco na sequência (viu 1203 e 1205), pede a faixa faltante.", "**At-least-once delivery with deduplication.** Networks fail, so the system resends until it gets the `ack`. This causes duplicates, which the client discards by the `messageId`/`seq` already seen. The perceived result is “exactly once” without being a true exactly-once protocol. If the client sees a gap in the sequence (saw 1203 and 1205), it requests the missing range."]),
      p(["**Sincronização entre dispositivos.** Cada dispositivo guarda o último `seq` visto por conversa e pede o que falta ao conectar. O estado de leitura (`last_read_seq` por usuário e conversa) é uma só linha por membro, não um registro por mensagem.", "**Multi-device sync.** Each device stores the last `seq` seen per conversation and asks for what is missing on connect. Read state (`last_read_seq` per user and conversation) is one row per member, not one record per message."]),
      h(["7. Aprofundamento: grupos, presença e conexões", "7. Deep dive: groups, presence and connections"]),
      p(["**Grupos.** Em um grupo de 500 pessoas, a mensagem é gravada **uma vez** na partição da conversa e entregue a cada membro online: o serviço consulta o registro de sessões para os 500 e publica nos gateways relevantes (agrupando por gateway para enviar um evento por gateway, não por membro). Quem está offline recebe push e busca depois. Para grupos muito grandes (milhares), a entrega por empurrar vira cara e o modelo muda para “empurrar um aviso leve e deixar o cliente puxar”.", "**Groups.** In a group of 500 people, the message is written **once** to the conversation partition and delivered to each online member: the service queries the session registry for all 500 and publishes to the relevant gateways (grouping by gateway to send one event per gateway, not per member). Offline members get a push and fetch later. For very large groups (thousands), push delivery gets expensive and the model shifts to “push a light notice and let the client pull”."]),
      p(["**Presença.** Cada cliente envia um *heartbeat* a cada poucos segundos; o registro de sessões guarda `user -> gateway` com TTL de cerca de 30 segundos. Se o heartbeat parar, a chave expira e o usuário aparece offline. Para não inundar a rede, os contatos não recebem cada mudança: o cliente consulta a presença só dos contatos visíveis na tela, ou assina apenas esses canais.", "**Presence.** Each client sends a *heartbeat* every few seconds; the session registry stores `user -> gateway` with a TTL of about 30 seconds. If the heartbeat stops, the key expires and the user shows as offline. To avoid flooding the network, contacts do not get every change: the client queries presence only for contacts visible on screen, or subscribes only to those channels."]),
      p(["**Conexões.** O balanceador de camada 4 distribui as conexões TCP; como elas são longas, a carga pode ficar desigual com o tempo, então o gateway pode pedir ao cliente que reconecte (*drain*) durante deploys. Reconexões em massa depois de uma queda geram uma **tempestade**: o cliente reconecta com recuo exponencial e variação aleatória.", "**Connections.** The layer-4 balancer distributes TCP connections; since they are long-lived, load may become uneven over time, so a gateway can ask the client to reconnect (*drain*) during deploys. Mass reconnection after an outage creates a **storm**: the client reconnects with exponential backoff and jitter."]),
      table([["Decisão", "Decision"], ["Alternativa", "Alternative"], ["Por que a minha escolha", "Why my choice"]],
        [["WebSocket", "WebSocket"], ["Long polling", "Long polling"], ["Menos sobrecarga por mensagem; empurra do servidor", "Less per-message overhead; server push"]],
        [["Armazenamento colunar particionado por conversa", "Wide-column store partitioned by conversation"], ["SQL com sharding", "Sharded SQL"], ["Escrita enorme e leitura sequencial por partição", "Huge writes and sequential reads per partition"]],
        [["`seq` por conversa", "Per-conversation `seq`"], ["Relógio global / timestamp", "Global clock / timestamp"], ["Ordem local suficiente e barata", "Local order is enough and cheap"]],
        [["Gravar antes de confirmar", "Write before acknowledging"], ["Confirmar e gravar depois", "Acknowledge then write"], ["Durabilidade acima de um pouco de latência", "Durability over a bit of latency"]],
      ),
      h(["8. Gargalos e falhas", "8. Bottlenecks and failures"]),
      ul(
        ["**Queda de um gateway**: milhares de clientes reconectam a outros; a mensagem em trânsito não se perde, pois está no armazenamento e o cliente pede o que falta.", "**A gateway dies**: thousands of clients reconnect to others; an in-flight message is not lost since it is in the store and the client asks for what is missing."],
        ["**Registro de sessões indisponível**: o serviço trata todos como offline e envia push; ao reconectar, o cliente sincroniza. Degradamos a latência, não a correção.", "**Session registry unavailable**: the service treats everyone as offline and sends push; on reconnect the client syncs. We degrade latency, not correctness."],
        ["**Partição quente**: uma conversa gigante concentra escrita. Mitigo dividindo a partição por intervalo de tempo (por exemplo, por dia) na chave.", "**Hot partition**: a giant conversation concentrates writes. I mitigate by splitting the partition by time bucket (for example, per day) in the key."],
        ["**Retenção e custo**: mensagens antigas vão para armazenamento frio e mídia (fotos, vídeos) para objetos com CDN, referenciada por URL na mensagem.", "**Retention and cost**: old messages move to cold storage and media (photos, videos) to object storage with CDN, referenced by URL in the message."],
        ["**Segurança**: TLS, autenticação por token na abertura da conexão, limite de taxa por usuário e, se pedido, criptografia ponta a ponta (o servidor só roteia texto cifrado e as chaves ficam nos dispositivos).", "**Security**: TLS, token authentication on connection open, per-user rate limits and, if asked, end-to-end encryption (the server only routes ciphertext and keys stay on devices)."],
      ),
      h(["Perguntas de follow-up", "Follow-up questions"]),
      ul(
        ["**Como mostrar “digitando…”?** Evento efêmero pelo mesmo canal, sem gravar, com expiração de poucos segundos; perder um deles não importa.", "**How to show “typing…”?** An ephemeral event over the same channel, not persisted, expiring in a few seconds; losing one does not matter."],
        ["**Como lidar com mensagens apagadas?** Evento de remoção que referencia o `messageId`; os dispositivos aplicam ao sincronizar.", "**How to handle deleted messages?** A deletion event referencing the `messageId`; devices apply it on sync."],
        ["**E a busca no histórico?** Índice de busca separado alimentado por stream; com criptografia ponta a ponta, a busca passa a ser local no dispositivo.", "**What about history search?** A separate search index fed by a stream; with end-to-end encryption, search becomes local on the device."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["WebSocket para empurrar mensagens; gateways só seguram conexões.", "WebSocket to push messages; gateways only hold connections."],
        ["Gravar antes de confirmar, entrega pelo menos uma vez, deduplicação no cliente.", "Write before acknowledging, at-least-once delivery, deduplication on the client."],
        ["Ordem por conversa com `seq`, não por relógio global.", "Order per conversation with `seq`, not a global clock."],
        ["Registro de sessões para rotear; push para quem está offline.", "Session registry to route; push for those offline."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Por que não usar HTTP simples?** Cada mensagem exigiria uma requisição do receptor perguntando se há algo novo (polling), com latência e custo altos.", "**Why not plain HTTP?** Each message would require the receiver to poll for news, with high latency and cost."],
        ["**Kafka ou Redis para o barramento?** Redis Pub/Sub é leve e sem persistência, bom para o roteamento efêmero; a durabilidade já vem do armazenamento. Kafka serve para reprocessamento e analytics.", "**Kafka or Redis for the bus?** Redis Pub/Sub is light and non-persistent, good for ephemeral routing; durability already comes from the store. Kafka suits reprocessing and analytics."],
        ["**Como saber quantos gateways preciso?** Conexões simultâneas divididas pela capacidade por servidor, com folga para falha e deploy.", "**How do I know how many gateways I need?** Concurrent connections divided by per-server capacity, with headroom for failure and deploys."],
      ),
      tip(["Se o entrevistador perguntar “e se o servidor cair no meio do envio?”, a resposta é a ordem das operações: gravar, confirmar, entregar, e o cliente sempre pode pedir o que falta pelo `seq`.", "If the interviewer asks “what if the server dies mid-send?”, the answer is the order of operations: persist, acknowledge, deliver, and the client can always request what is missing by `seq`."]),
    ] },

  { id: "projetando-um-feed-de-noticias", section: "entrevistas", level: 2, icon: "dynamic_feed", minutes: 12,
    title: ["Projetando um feed de notícias", "Designing a news feed"],
    summary: ["Como eu resolveria: fan-out na escrita x na leitura, o problema das celebridades, ranking e cache.", "How I would solve it: fan-out on write vs on read, the celebrity problem, ranking and caching."],
    body: [
      p(["O feed é a página inicial de uma rede social: uma lista de posts de quem você segue, em ordem recente ou por relevância. A pergunta parece simples (“me dê os posts dos meus amigos”), mas em escala vira um dilema clássico: **calcular o feed quando alguém posta ou quando alguém abre o aplicativo?** Cada resposta empurra o custo para um lado, e a resposta madura é combinar as duas.", "The feed is a social network's home page: a list of posts from people you follow, in recent order or by relevance. The question seems simple (“give me my friends' posts”), but at scale it becomes a classic dilemma: **compute the feed when someone posts or when someone opens the app?** Each answer pushes cost to one side, and the mature answer is to combine both."]),
      h(["1. Requisitos", "1. Requirements"]),
      table([["Tipo", "Type"], ["Requisito", "Requirement"]],
        [["Funcional", "Functional"], ["Publicar um post (texto e mídia)", "Publish a post (text and media)"]],
        [["Funcional", "Functional"], ["Seguir e deixar de seguir usuários", "Follow and unfollow users"]],
        [["Funcional", "Functional"], ["Ver o feed: posts de quem sigo, mais novos primeiro, com paginação infinita", "View the feed: posts from people I follow, newest first, with infinite pagination"]],
        [["Funcional", "Functional"], ["Curtidas e comentários (contagens aproximadas)", "Likes and comments (approximate counts)"]],
        [["Não funcional", "Non-functional"], ["Carregar o feed em menos de 300 ms (p99)", "Load the feed in under 300 ms (p99)"]],
        [["Não funcional", "Non-functional"], ["Alta disponibilidade; consistência eventual é aceitável (um post aparecer segundos depois é tolerável)", "High availability; eventual consistency is acceptable (a post appearing seconds later is tolerable)"]],
        [["Não funcional", "Non-functional"], ["Suportar contas com dezenas de milhões de seguidores", "Support accounts with tens of millions of followers"]],
      ),
      h(["2. Estimativas", "2. Estimates"]),
      code(`DAU                  = 200,000,000
feed opens/user/day  = 5      -> 1e9 opens/day -> ~12,000/s avg (peak ~40,000/s)
posts/user/day       = 0.2    -> 4e7 posts/day -> ~460/s avg (peak ~1,500/s)
avg followers        = 200

fan-out on write     = 460 x 200 = 92,000 feed writes/s (avg)
celebrity (30M followers): 1 post = 30,000,000 feed writes

post size            = 1 KB metadata (media in object storage)
post storage/day     = 4e7 x 1 KB = 40 GB/day -> ~15 TB/year
feed cache entry     = 500 post IDs x 8 B = 4 KB per user
all active users     = 2e8 x 4 KB ~= 800 GB`),
      p(["A leitura (12 mil por segundo) é 25 vezes maior que a escrita de posts, mas o **fan-out** multiplica cada post por 200 seguidores em média e por 30 milhões para uma celebridade. Esse número é o que decide a arquitetura. O feed de cada usuário guardado como lista de IDs de post cabe em cerca de 800 GB, ou seja, em um cluster de memória, porque guardamos só IDs (8 bytes) e não o conteúdo do post.", "Reads (12 thousand per second) are 25 times post writes, but **fan-out** multiplies each post by 200 followers on average and by 30 million for a celebrity. That number decides the architecture. Each user's feed stored as a list of post IDs fits in about 800 GB, that is, a memory cluster, because we store only IDs (8 bytes) and not post content."]),
      h(["3. API", "3. API"]),
      code(`POST /v1/posts            { "text": "...", "mediaIds": ["m1"] }       -> 201 { "postId": "p88" }
POST /v1/follow/{userId}  / DELETE /v1/follow/{userId}
GET  /v1/feed?cursor=<opaque>&limit=20
     -> { "items": [ { "postId", "author", "text", "media", "likeCount" } ], "nextCursor": "..." }
POST /v1/posts/{id}/like`),
      p(["A paginação usa um **cursor** (por exemplo, o ID do último post visto), não `offset`: com `offset`, novos posts deslocam a lista e o usuário vê itens repetidos ou perde itens. IDs de post devem ser ordenáveis pelo tempo (estilo Snowflake: carimbo de tempo mais identificador de máquina mais sequência), o que permite ordenar sem coluna extra.", "Pagination uses a **cursor** (for example, the ID of the last post seen), not `offset`: with `offset`, new posts shift the list and the user sees repeated or missing items. Post IDs should be time-sortable (Snowflake style: timestamp plus machine identifier plus sequence), which allows sorting without an extra column."]),
      h(["4. Modelo de dados", "4. Data model"]),
      code(`posts(post_id PK, author_id, text, media_refs, created_at)        -- partition by post_id
follows(follower_id, followee_id)                                  -- two views:
   followers_of(followee_id -> follower_ids)    followees_of(follower_id -> followee_ids)
feed_cache  (user_id -> sorted list of post_ids, newest first, capped at ~500)   -- in memory
counters(post_id -> likes, comments)                               -- eventually consistent`),
      h(["5. Design de alto nível", "5. High-level design"]),
      fig(["Feed com fan-out na escrita e na leitura", "Feed with fan-out on write and on read"],
        [[node("cl", "Client", "client")], [node("api", ["API do feed", "Feed API"], "service"), node("pp", ["Serviço de posts", "Post service"], "service")], [node("fo", ["Workers de fan-out", "Fan-out workers"], "service"), node("q", ["Fila de posts", "Post queue"], "queue")], [node("fc", ["Cache de feeds", "Feed cache"], "cache"), node("sg", ["Grafo social", "Social graph"], "data")], [node("ps", ["Armazenamento de posts", "Post store"], "data")]],
        [edge("cl", "api", ["lê feed", "reads feed"]), edge("cl", "pp", ["posta", "posts"]), edge("pp", "ps", ["grava", "writes"]), edge("pp", "q", ["evento", "event"]), edge("q", "fo"), edge("fo", "sg", ["seguidores", "followers"]), edge("fo", "fc", ["insere ID", "pushes ID"]), edge("api", "fc", ["IDs", "IDs"]), edge("api", "ps", ["hidrata", "hydrates"], { dashed: true })]),
      h(["6. Aprofundamento: fan-out na escrita x na leitura", "6. Deep dive: fan-out on write vs on read"]),
      table([["Aspecto", "Aspect"], ["Fan-out na escrita (push)", "Fan-out on write (push)"], ["Fan-out na leitura (pull)", "Fan-out on read (pull)"]],
        [["Quando calcula", "When it computes"], ["Quando alguém posta: insere o ID no feed de cada seguidor", "When someone posts: inserts the ID into every follower's feed"], ["Quando alguém abre o app: busca os posts de quem segue e mescla", "When someone opens the app: fetches posts from followees and merges"]],
        [["Leitura do feed", "Reading the feed"], ["Muito rápida: uma leitura do cache", "Very fast: one cache read"], ["Lenta: muitas consultas e uma mesclagem por abertura", "Slow: many queries and a merge per open"]],
        [["Custo de escrita", "Write cost"], ["Alto para quem tem muitos seguidores", "High for those with many followers"], ["Baixo: só grava o post", "Low: just stores the post"]],
        [["Espaço", "Space"], ["Um feed por usuário (IDs)", "One feed per user (IDs)"], ["Nenhum extra", "None extra"]],
        [["Usuários inativos", "Inactive users"], ["Desperdício: calcula feeds que ninguém lê", "Waste: computes feeds nobody reads"], ["Sem desperdício", "No waste"]],
        [["Frescor", "Freshness"], ["Atraso de segundos para chegar", "Seconds of delay to arrive"], ["Sempre atual", "Always current"]],
      ),
      p(["**Minha escolha: modelo híbrido.** Para a grande maioria dos autores (centenas ou poucos milhares de seguidores), uso **fan-out na escrita**: o post vai a uma fila, e workers leem a lista de seguidores e inserem o ID no feed em cache de cada um (apenas dos usuários *ativos* recentemente, para não desperdiçar). Para **celebridades** (acima de um limite, por exemplo 100 mil seguidores), não faço fan-out: o post é só gravado. Na hora da leitura, o serviço pega o feed pré-calculado do usuário (IDs), **busca os posts recentes das celebridades que ele segue** e mescla por tempo. Assim, o custo de postar de uma celebridade é uma gravação e não 30 milhões, e o custo extra de leitura é de poucas consultas.", "**My choice: a hybrid model.** For the vast majority of authors (hundreds or a few thousand followers), I use **fan-out on write**: the post goes to a queue and workers read the follower list and insert the ID into each one's cached feed (only for recently *active* users, to avoid waste). For **celebrities** (above a threshold, for example 100 thousand followers), I do no fan-out: the post is just stored. At read time, the service takes the user's precomputed feed (IDs), **fetches recent posts from the celebrities they follow** and merges by time. Thus a celebrity's posting cost is one write instead of 30 million, and the extra read cost is a few queries."]),
      code(`async function readFeed(userId: string, cursor?: string, limit = 20) {
  const pushed = await feedCache.range(userId, cursor, limit * 2);        // precomputed IDs
  const celebs = await graph.celebrityFollowees(userId);                 // few, cached
  const recent = await Promise.all(celebs.map((c) => posts.recentIds(c, cursor, limit)));
  const ids = mergeByTimeDesc(pushed, ...recent).slice(0, limit);         // IDs are time-sortable
  return hydrate(ids);                                                    // batch fetch post bodies
}`),
      h(["7. Aprofundamento: o que o fan-out realmente faz", "7. Deep dive: what fan-out actually does"]),
      ul(
        ["**Fila e workers**: o serviço de posts grava o post e publica um evento; a gravação responde ao usuário na hora, e o fan-out acontece de forma assíncrona. Se os workers atrasarem, o feed fica defasado, mas o post não se perde.", "**Queue and workers**: the post service stores the post and publishes an event; the write answers the user immediately and fan-out happens asynchronously. If workers lag, the feed is stale but the post is not lost."],
        ["**Particionamento da lista de seguidores**: para autores com muitos seguidores, a lista é dividida em lotes (por exemplo, 1.000 por tarefa) processados em paralelo.", "**Partitioning the follower list**: for authors with many followers, the list is split into batches (for example, 1,000 per task) processed in parallel."],
        ["**Cache de feeds**: lista ordenada de IDs por usuário em Redis (estrutura de conjunto ordenado) com tamanho máximo (~500). Quem rola além disso cai no modelo de leitura.", "**Feed cache**: an ordered list of IDs per user in Redis (sorted set) with a maximum size (~500). Whoever scrolls past that falls into the pull model."],
        ["**Hidratação**: o feed guarda só IDs; os corpos dos posts vêm de um cache de posts em lote (multi-get), com contagens de curtidas lidas de contadores aproximados.", "**Hydration**: the feed stores only IDs; post bodies come from a batched post cache (multi-get), with like counts read from approximate counters."],
        ["**Deixar de seguir e apagar post**: na leitura, filtro IDs de posts apagados ou de autores que o usuário deixou de seguir; a limpeza física do cache é preguiçosa.", "**Unfollow and delete**: at read time I filter IDs of deleted posts or authors the user stopped following; physical cache cleanup is lazy."],
      ),
      h(["8. Ranking e curtidas", "8. Ranking and likes"]),
      p(["Um feed cronológico é o mais simples. Para um feed **ranqueado**, as IDs candidatas (algumas centenas) passam por um serviço de ranking que pontua cada uma com sinais (afinidade com o autor, tipo de mídia, engajamento recente, idade) usando um modelo treinado; o resultado é reordenado antes de devolver. O ranking acrescenta latência, então roda sobre poucos candidatos e com características pré-calculadas em um armazenamento rápido.", "A chronological feed is simplest. For a **ranked** feed, the candidate IDs (a few hundred) go through a ranking service that scores each with signals (affinity with the author, media type, recent engagement, age) using a trained model; the result is reordered before returning. Ranking adds latency, so it runs over few candidates and with precomputed features in a fast store."]),
      p(["**Curtidas**: uma curtida é uma escrita pequena em altíssimo volume (e quente para um post viral). Gravo o evento em um stream e agrego em contadores de forma assíncrona, com contadores fragmentados em várias chaves para um post popular somadas na leitura. A contagem exata não importa; a de “1,2 mil” basta.", "**Likes**: a like is a small write at very high volume (and hot for a viral post). I write the event to a stream and aggregate into counters asynchronously, with counters sharded across several keys for a popular post and summed on read. The exact count does not matter; “1.2k” is enough."]),
      h(["9. Gargalos, falhas e escala", "9. Bottlenecks, failures and scale"]),
      ul(
        ["**Perda do cache de feeds**: reconstruímos sob demanda pelo modelo de leitura (puxar os posts de quem o usuário segue). É lento, então protejo com limite de taxa e reconstruo gradualmente.", "**Feed cache loss**: we rebuild on demand through the pull model (fetching posts from followees). It is slow, so I protect it with rate limits and rebuild gradually."],
        ["**Grafo social**: milhões de leituras por segundo na lista de seguidores; guardo em um armazenamento particionado por usuário e cacheio as listas quentes.", "**Social graph**: millions of reads per second on the follower list; I store it in a per-user partitioned store and cache hot lists."],
        ["**Worker atrasado**: monitoro a latência da fila de fan-out; escalo workers pelo tamanho da fila.", "**Lagging worker**: I monitor fan-out queue latency; I scale workers by queue size."],
        ["**Multirregião**: posts replicados entre regiões; cada região mantém os feeds dos seus usuários.", "**Multi-region**: posts replicated across regions; each region keeps its users' feeds."],
      ),
      h(["Perguntas de follow-up", "Follow-up questions"]),
      ul(
        ["**Quando uma conta vira “celebridade”?** Por limite de seguidores, ajustado por observação (o custo do fan-out contra o da leitura). Pode ser por post: uma conta que viraliza muda de modelo.", "**When does an account become a “celebrity”?** By a follower threshold, tuned by observation (fan-out cost vs read cost). It can be per post: an account that goes viral changes model."],
        ["**Como mostrar um post novo imediatamente ao autor?** Insiro o ID diretamente no feed dele na hora (leitura do próprio autor), sem esperar o fan-out.", "**How to show a new post to its author immediately?** I insert the ID directly into their own feed at once, without waiting for fan-out."],
        ["**E stories ou posts temporários?** Mesmo modelo, com TTL no cache e no armazenamento.", "**What about stories or temporary posts?** Same model, with TTL in cache and store."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["O feed guarda IDs pré-calculados por usuário em memória; o conteúdo é hidratado depois.", "The feed stores precomputed IDs per user in memory; content is hydrated afterwards."],
        ["Híbrido: push para a maioria, pull para celebridades, mesclando na leitura.", "Hybrid: push for most, pull for celebrities, merging at read time."],
        ["Cursor em vez de offset; IDs ordenáveis por tempo.", "Cursor instead of offset; time-sortable IDs."],
        ["Fan-out e contadores são assíncronos, e a consistência é eventual.", "Fan-out and counters are asynchronous, and consistency is eventual."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Por que não consultar o banco juntando posts e seguidores?** Uma junção por abertura de aplicativo, a 12 mil por segundo, não escala; o feed pré-calculado transforma isso em uma leitura por chave.", "**Why not query the database joining posts and followers?** A join per app open, at 12 thousand per second, does not scale; the precomputed feed turns it into a key read."],
        ["**Posso usar só fan-out na leitura?** Em escala pequena, sim, e é mais simples. O híbrido existe para escala grande.", "**Can I use only fan-out on read?** At small scale, yes, and it is simpler. The hybrid exists for large scale."],
        ["**Como garantir a ordem?** IDs ordenáveis por tempo e mesclagem por esse ID. Pequenas inversões de segundos são aceitáveis.", "**How to guarantee order?** Time-sortable IDs and merging by that ID. Small inversions of seconds are acceptable."],
      ),
      tip(["Diga o número do problema das celebridades em voz alta: um post de quem tem 30 milhões de seguidores vira 30 milhões de gravações. É esse cálculo que justifica o modelo híbrido.", "Say the celebrity problem's number out loud: one post from someone with 30 million followers becomes 30 million writes. That calculation justifies the hybrid model."]),
    ] },

  { id: "projetando-um-rate-limiter", section: "entrevistas", level: 1, icon: "speed", minutes: 11,
    title: ["Projetando um rate limiter", "Designing a rate limiter"],
    summary: ["Como eu resolveria: algoritmos, contador compartilhado atômico, onde aplicar e o que fazer sob falha.", "How I would solve it: algorithms, an atomic shared counter, where to apply it and what to do under failure."],
    body: [
      p(["Um **rate limiter** limita quantas requisições um cliente pode fazer em um período. Ele protege o sistema de abusos e de picos acidentais, evita que um cliente barulhento prejudique os outros (o problema do *vizinho barulhento*), controla custos e implementa planos comerciais (100 requisições por minuto no plano grátis, 10 mil no pago). Em entrevista, a pergunta testa se você escolhe o algoritmo certo, **atualiza um contador compartilhado sem condição de corrida** e decide o comportamento quando o próprio limitador falha.", "A **rate limiter** limits how many requests a client may make in a period. It protects the system from abuse and accidental spikes, prevents a noisy client from harming others (the *noisy neighbor* problem), controls costs and implements commercial plans (100 requests per minute on the free plan, 10 thousand on the paid one). In an interview, the question tests whether you choose the right algorithm, **update a shared counter without a race condition** and decide the behavior when the limiter itself fails."]),
      h(["1. Requisitos", "1. Requirements"]),
      table([["Tipo", "Type"], ["Requisito", "Requirement"]],
        [["Funcional", "Functional"], ["Limitar por identificador (chave de API, usuário ou IP) e por rota", "Limit by identifier (API key, user or IP) and by route"]],
        [["Funcional", "Functional"], ["Regras configuráveis sem redeploy (limite e janela por plano)", "Rules configurable without redeploy (limit and window per plan)"]],
        [["Funcional", "Functional"], ["Rejeitar com HTTP 429 e informar quando tentar de novo", "Reject with HTTP 429 and say when to retry"]],
        [["Não funcional", "Non-functional"], ["Overhead mínimo: menos de 2 ms por checagem", "Minimal overhead: under 2 ms per check"]],
        [["Não funcional", "Non-functional"], ["Funcionar em um cluster distribuído com limites globais por cliente", "Work in a distributed cluster with global per-client limits"]],
        [["Não funcional", "Non-functional"], ["Alta disponibilidade: a falha do limitador não pode derrubar a API", "High availability: limiter failure must not take the API down"]],
        [["Não funcional", "Non-functional"], ["Precisão razoável, não perfeita (pequeno excesso é tolerável)", "Reasonable, not perfect, accuracy (slight overshoot is tolerable)"]],
      ),
      h(["2. Estimativas", "2. Estimates"]),
      code(`API traffic          = 500,000 requests/s at peak (every one is checked)
active clients       = 10,000,000 keys in a window
state per key        ~= 50 B (key + counters/timestamps)
memory               = 1e7 x 50 B = 500 MB       -> one Redis node holds it,
                                                    but 500k ops/s needs a cluster (shards by key)
latency budget       = < 2 ms  -> in-memory store in the same datacenter`),
      p(["O estado cabe em memória com folga, mas a taxa de operações (cada requisição faz uma checagem) exige um cluster particionado pela chave do cliente. Repare que o limitador é **mais caro em operações** do que em dados, e que ele fica no caminho de **toda** requisição: latência e disponibilidade dele são críticas.", "The state fits in memory comfortably, but the operation rate (every request does a check) requires a cluster partitioned by client key. Note that the limiter is **more expensive in operations** than in data, and it sits on the path of **every** request: its latency and availability are critical."]),
      h(["3. Algoritmos", "3. Algorithms"]),
      table([["Algoritmo", "Algorithm"], ["Como funciona", "How it works"], ["Vantagem", "Advantage"], ["Desvantagem", "Disadvantage"]],
        [["Token bucket", "Token bucket"], ["Um balde enche a uma taxa fixa até um máximo; cada requisição retira um token", "A bucket refills at a fixed rate up to a max; each request takes one token"], ["Permite rajadas controladas; pouca memória (dois números)", "Allows controlled bursts; little memory (two numbers)"], ["Dois parâmetros para ajustar; a rajada pode surpreender", "Two parameters to tune; the burst may surprise"]],
        [["Leaky bucket", "Leaky bucket"], ["Requisições entram em uma fila que esvazia a taxa constante", "Requests enter a queue that drains at a constant rate"], ["Saída suave e previsível", "Smooth, predictable output"], ["Rajadas enchem a fila e atrasam; pedidos novos podem ser descartados", "Bursts fill the queue and delay; new requests may be dropped"]],
        [["Janela fixa", "Fixed window"], ["Contador por intervalo (por exemplo, por minuto), zerado ao virar a janela", "A counter per interval (for example per minute), reset when the window rolls"], ["Muito simples e barato", "Very simple and cheap"], ["Rajada na virada: até o dobro do limite em torno da fronteira", "Burst at the boundary: up to double the limit around the edge"]],
        [["Janela deslizante (log)", "Sliding window log"], ["Guarda o instante de cada requisição e conta as da última janela", "Stores each request's time and counts those in the last window"], ["Preciso", "Accurate"], ["Memória proporcional ao limite por cliente", "Memory proportional to the limit per client"]],
        [["Janela deslizante (contador)", "Sliding window counter"], ["Combina o contador da janela atual e o da anterior, ponderado pela fração decorrida", "Combines the current and previous window counters, weighted by elapsed fraction"], ["Boa precisão com memória pequena", "Good accuracy with small memory"], ["Aproximação (assume distribuição uniforme)", "Approximation (assumes uniform distribution)"]],
      ),
      p(["**Minha escolha: token bucket**, porque APIs reais precisam tolerar rajadas curtas (um cliente que acorda e manda 20 requisições de uma vez) sem estourar a média, e porque guarda só dois valores por chave: `tokens` e `lastRefill`. Para planos que exigem limite estrito por janela (“100 por minuto”), a janela deslizante com contador é a alternativa. O token bucket não precisa de um processo que “encha” baldes: calculo o enchimento de forma preguiçosa na checagem.", "**My choice: token bucket**, because real APIs must tolerate short bursts (a client that wakes up and sends 20 requests at once) without breaking the average, and because it stores only two values per key: `tokens` and `lastRefill`. For plans requiring a strict per-window limit (“100 per minute”), the sliding window counter is the alternative. Token bucket needs no process to “fill” buckets: I compute the refill lazily at check time."]),
      code(`function allow(bucket, now, rate, capacity) {
  // refill lazily based on elapsed time
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * rate);
  bucket.lastRefill = now;
  if (bucket.tokens >= 1) { bucket.tokens -= 1; return true; }
  return false;                                    // reject: 429
}`),
      h(["4. Design de alto nível", "4. High-level design"]),
      fig(["Rate limiter no gateway", "Rate limiter at the gateway"],
        [[node("cl", "Client", "client")], [node("gw", ["API gateway + limiter", "API gateway + limiter"], "edge")], [node("rs", ["Regras (configuração)", "Rules (config)"], "data"), node("rd", ["Redis (contadores)", "Redis (counters)"], "cache")], [node("api", ["Serviços da API", "API services"], "service")]],
        [edge("cl", "gw"), edge("gw", "rs", ["lê e cacheia", "reads, caches"], { dashed: true }), edge("gw", "rd", ["checa e atualiza", "check and update"]), edge("gw", "api", ["se permitido", "if allowed"])]),
      p(["**Onde aplicar:** no **API gateway** (ou em um *sidecar*/middleware), antes de a requisição tocar os serviços. É um ponto único para regras consistentes, e a rejeição acontece cedo, barata. Aplicar dentro de cada serviço duplica a lógica e deixa o custo da rejeição maior. Limitadores adicionais por trás (por exemplo, no banco) protegem cada recurso.", "**Where to apply:** at the **API gateway** (or a *sidecar*/middleware), before the request touches the services. It is a single point for consistent rules, and rejection happens early, cheaply. Applying inside each service duplicates logic and makes rejection costlier. Additional limiters behind (for example at the database) protect each resource."]),
      p(["A resposta de rejeição é **HTTP 429 Too Many Requests**, com cabeçalhos que ajudam o cliente a se comportar:", "The rejection response is **HTTP 429 Too Many Requests**, with headers that help the client behave:"]),
      code(`HTTP/1.1 429 Too Many Requests
Retry-After: 12
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735689600`),
      h(["5. Aprofundamento: o contador compartilhado", "5. Deep dive: the shared counter"]),
      p(["Com várias instâncias de gateway, o estado precisa ser **compartilhado**, senão cada instância permitiria o limite inteiro (com 10 instâncias, dez vezes o limite). Uso um armazenamento em memória central (Redis) particionado pela chave do cliente. O perigo é a **condição de corrida**: duas instâncias leem `tokens = 1` quase ao mesmo tempo, as duas decidem permitir e gravam `0`, e passam duas requisições onde só cabia uma.", "With several gateway instances, state must be **shared**, otherwise each instance would allow the full limit (with 10 instances, ten times the limit). I use a central in-memory store (Redis) partitioned by client key. The danger is the **race condition**: two instances read `tokens = 1` almost at once, both decide to allow and write `0`, and two requests pass where only one fit."]),
      p(["A solução é tornar o **ler, calcular e gravar** uma operação **atômica**. No Redis, faço isso com um script Lua, que é executado sem interrupção no servidor, ou com operações atômicas como `INCR`/`EXPIRE` para a janela fixa:", "The solution is to make **read, compute and write** one **atomic** operation. In Redis, I do it with a Lua script, which runs uninterrupted on the server, or with atomic operations like `INCR`/`EXPIRE` for fixed windows:"]),
      code(`-- KEYS[1] = bucket key, ARGV = rate, capacity, now(ms), cost
local data   = redis.call("HMGET", KEYS[1], "tokens", "ts")
local tokens = tonumber(data[1]) or tonumber(ARGV[2])
local ts     = tonumber(data[2]) or tonumber(ARGV[3])
local rate, cap, now, cost = tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3]), tonumber(ARGV[4])

tokens = math.min(cap, tokens + (now - ts) / 1000 * rate)
local allowed = tokens >= cost
if allowed then tokens = tokens - cost end

redis.call("HSET", KEYS[1], "tokens", tokens, "ts", now)
redis.call("EXPIRE", KEYS[1], math.ceil(cap / rate) * 2)   -- free idle keys
return allowed and 1 or 0`),
      p(["Duas observações. Primeiro, o relógio deve ser o **do armazenamento** (ou um relógio monotônico consistente), para instâncias com horas diferentes não distorcerem o enchimento. Segundo, o `EXPIRE` evita acumular chaves de clientes que sumiram. Um script Lua por requisição significa uma ida e volta à rede (cerca de 0,5 ms no mesmo datacenter), dentro do orçamento.", "Two notes. First, the clock should be **the store's** (or a consistent monotonic one), so instances with different times do not distort refill. Second, `EXPIRE` avoids accumulating keys of clients that vanished. One Lua script per request means one network round trip (about 0.5 ms in the same datacenter), within the budget."]),
      h(["6. Aprofundamento: escala, precisão e falhas", "6. Deep dive: scale, accuracy and failures"]),
      ul(
        ["**Reduzir a carga no Redis**: cada instância de gateway pode manter um **balde local** com um pedaço do limite (por exemplo, retira 10 tokens do central de uma vez e consome localmente). Troca-se precisão por menos idas e voltas; o excesso máximo é limitado ao tamanho dos lotes multiplicado pelo número de instâncias.", "**Reducing Redis load**: each gateway instance can keep a **local bucket** with a slice of the limit (for example, takes 10 tokens from the central store at once and spends them locally). It trades accuracy for fewer round trips; the maximum overshoot is bounded by batch size times number of instances."],
        ["**Particionamento**: hashing consistente pela chave do cliente distribui o conjunto entre nós; réplicas dão disponibilidade. Em multirregião, cada região pode ter seu limite local (mais rápido, limite global aproximado) ou sincronizar de forma assíncrona.", "**Partitioning**: consistent hashing by client key spreads the set across nodes; replicas provide availability. In multi-region, each region may have its local limit (faster, approximate global limit) or sync asynchronously."],
        ["**Quando o Redis cai: falhar aberto ou fechado?** Se o limitador é só proteção, **falhe aberto**: deixe passar e use limites locais por instância como rede de segurança, porque derrubar a API inteira por um erro do limitador é pior que um excesso temporário. Se o limite é uma regra de segurança (tentativas de login), **falhe fechado** para esse endpoint. Declare a escolha por rota.", "**When Redis dies: fail open or closed?** If the limiter is only protection, **fail open**: let traffic through and use per-instance local limits as a safety net, because taking down the whole API over a limiter error is worse than a temporary overshoot. If the limit is a security rule (login attempts), **fail closed** for that endpoint. State the choice per route."],
        ["**Regras**: guardadas em um serviço de configuração, cacheadas nas instâncias com TTL curto, para mudar limites sem redeploy.", "**Rules**: stored in a configuration service, cached in instances with short TTL, to change limits without redeploy."],
        ["**Quem é o cliente?** Chave de API ou usuário autenticado é melhor que IP, porque muitos usuários compartilham um IP (NAT, empresas), e um atacante troca de IP. Para rotas anônimas, IP mais impressões digitais do cliente.", "**Who is the client?** API key or authenticated user beats IP, because many users share an IP (NAT, companies) and an attacker switches IPs. For anonymous routes, IP plus client fingerprints."],
      ),
      h(["7. Gargalos e extensões", "7. Bottlenecks and extensions"]),
      ul(
        ["**Chave quente**: um cliente com tráfego enorme concentra operações em um nó. O balde local por instância divide essa carga.", "**Hot key**: a client with huge traffic concentrates operations on one node. The per-instance local bucket splits that load."],
        ["**Limites em camadas**: por IP na borda (CDN/WAF), por cliente no gateway e por recurso no serviço; cada um protege algo diferente.", "**Layered limits**: per IP at the edge (CDN/WAF), per client at the gateway and per resource in the service; each protects something different."],
        ["**Limitar por custo**: requisições caras (exportar relatório) consomem mais tokens (`cost` no script).", "**Limiting by cost**: expensive requests (export a report) consume more tokens (`cost` in the script)."],
        ["**Observabilidade**: métricas de requisições permitidas, rejeitadas e por regra; alerta quando a taxa de rejeição sobe de repente.", "**Observability**: metrics for allowed, rejected and per-rule requests; alert when the rejection rate jumps."],
      ),
      h(["Perguntas de follow-up", "Follow-up questions"]),
      ul(
        ["**Como o cliente deve reagir ao 429?** Respeitar `Retry-After` e usar recuo exponencial com variação aleatória; um cliente bem comportado nunca insiste em loop.", "**How should the client react to 429?** Respect `Retry-After` and use exponential backoff with jitter; a well-behaved client never loops."],
        ["**Como testar?** Testes de carga com vários clientes simulados e verificação de que o total permitido respeita o limite com tolerância.", "**How to test?** Load tests with several simulated clients and verification that the total allowed respects the limit within tolerance."],
        ["**Limite por usuário em um sistema com milhões de usuários não estoura a memória?** Chaves com TTL, e só clientes ativos na janela ocupam espaço.", "**Does a per-user limit across millions of users not blow the memory?** Keys have TTL, and only clients active in the window occupy space."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Token bucket permite rajadas e usa pouca memória; janela deslizante é mais estrita.", "Token bucket allows bursts and uses little memory; sliding window is stricter."],
        ["O estado é compartilhado em memória rápida e a atualização é atômica (script Lua).", "State is shared in fast memory and the update is atomic (Lua script)."],
        ["Aplique no gateway, responda 429 com `Retry-After`.", "Apply at the gateway, answer 429 with `Retry-After`."],
        ["Decida, por rota, se o limitador falha aberto ou fechado.", "Decide, per route, whether the limiter fails open or closed."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Posso limitar no cliente?** Não como proteção: o cliente é controlado por quem pode ser mal-intencionado. Só no servidor vale.", "**Can I limit on the client?** Not as protection: the client is controlled by someone who may be malicious. Only the server counts."],
        ["**Rate limiting é o mesmo que throttling?** São parentes: limitar rejeita o excesso; *throttling* o atrasa ou reduz a velocidade. Muitos sistemas usam os dois.", "**Is rate limiting the same as throttling?** They are relatives: limiting rejects the excess; *throttling* delays or slows it. Many systems use both."],
        ["**Por que não contar em um banco relacional?** A taxa de operações (centenas de milhares por segundo) e a latência de 2 ms pedem memória, não disco com transação.", "**Why not count in a relational database?** The operation rate (hundreds of thousands per second) and the 2 ms latency call for memory, not disk with transactions."],
      ),
      tip(["A frase que resume o problema: o difícil não é o algoritmo, é atualizar o contador de forma atômica em um cluster e decidir o que fazer quando o contador some.", "The sentence that sums up the problem: the hard part is not the algorithm, it is updating the counter atomically across a cluster and deciding what to do when the counter disappears."]),
    ] },

  { id: "projetando-um-sistema-de-notificacoes", section: "entrevistas", level: 1, icon: "notifications_active", minutes: 11,
    title: ["Projetando um sistema de notificações", "Designing a notification system"],
    summary: ["Como eu resolveria: canais, filas, preferências, deduplicação, retentativas e limites de provedores.", "How I would solve it: channels, queues, preferences, deduplication, retries and provider limits."],
    body: [
      p(["Um sistema de notificações entrega mensagens a usuários por vários **canais**: push móvel, e-mail, SMS e avisos dentro do aplicativo. Outras equipes o chamam por API (“o pedido saiu para entrega”, “seu código é 482913”), e ele cuida do restante: escolher o canal, respeitar preferências, montar a mensagem, enviar pelo provedor externo e tentar de novo se falhar. O problema testa **desacoplamento por filas, entrega confiável sem duplicar e respeito a limites de terceiros**.", "A notification system delivers messages to users through several **channels**: mobile push, email, SMS and in-app notices. Other teams call it by API (“your order shipped”, “your code is 482913”), and it handles the rest: choosing the channel, respecting preferences, building the message, sending through the external provider and retrying on failure. The problem tests **decoupling through queues, reliable delivery without duplicates and respect for third-party limits**."]),
      h(["1. Requisitos", "1. Requirements"]),
      table([["Tipo", "Type"], ["Requisito", "Requirement"]],
        [["Funcional", "Functional"], ["Canais: push (APNs e FCM), e-mail, SMS e notificação dentro do app", "Channels: push (APNs and FCM), email, SMS and in-app"]],
        [["Funcional", "Functional"], ["Notificações transacionais (código de login), em lote (campanha) e agendadas", "Transactional (login code), bulk (campaign) and scheduled notifications"]],
        [["Funcional", "Functional"], ["Preferências do usuário por canal e tipo; opt-out; horário de silêncio", "User preferences per channel and type; opt-out; quiet hours"]],
        [["Funcional", "Functional"], ["Modelos com variáveis e idiomas diferentes", "Templates with variables and different languages"]],
        [["Funcional", "Functional"], ["Status de entrega e rastreio (enviada, entregue, aberta, falha)", "Delivery status and tracking (sent, delivered, opened, failed)"]],
        [["Não funcional", "Non-functional"], ["Transacional: entrega em segundos; campanhas: minutos são aceitáveis", "Transactional: delivered in seconds; campaigns: minutes are acceptable"]],
        [["Não funcional", "Non-functional"], ["Pelo menos uma vez, com deduplicação; nenhuma notificação importante se perde", "At least once with deduplication; no important notification is lost"]],
        [["Não funcional", "Non-functional"], ["Escala para picos (campanha para milhões de usuários)", "Scale for spikes (a campaign to millions of users)"]],
      ),
      h(["2. Estimativas", "2. Estimates"]),
      code(`users                = 50,000,000
notifications/user   = 5 / day   -> 2.5e8 / day -> ~2,900 /s avg
peak (campaign)      = 1,000,000 messages dispatched in ~5 min -> ~3,300 /s on top
                       design for ~10,000 /s peak

event size           = 1 KB   -> 250 GB/day of event log
retention for status = 30 days -> ~7.5 TB
provider limits      = e.g. one provider accepts N requests/s per account -> must be respected`),
      p(["A média é modesta, mas o **pico** vem de campanhas e de eventos em massa (uma partida de futebol, uma promoção). A fila é o amortecedor: ela absorve o pico e os workers consomem à taxa que o provedor permite. Sem fila, o pico vira falha ou estoura os limites do provedor.", "The average is modest, but the **peak** comes from campaigns and mass events (a football match, a promotion). The queue is the shock absorber: it absorbs the peak and workers consume at the rate the provider allows. Without a queue, the peak becomes failure or breaks the provider's limits."]),
      h(["3. API", "3. API"]),
      code(`POST /v1/notifications
  Idempotency-Key: 7c1f-...                  // prevents duplicates on client retry
  {
    "userId": "u123",
    "type": "order_shipped",                 // maps to a template and priority
    "channels": ["push", "email"],           // optional: defaults from preferences
    "data": { "orderId": "A991", "eta": "2026-10-22" },
    "scheduleAt": "2026-10-21T18:00:00Z"?    // optional
  }
  202 Accepted { "notificationId": "n77" }

GET  /v1/notifications/{id}                  // status per channel
PUT  /v1/users/{id}/preferences              // channels, types, quiet hours
POST /v1/devices                             // register push token`),
      p(["A resposta é **202 Accepted**: o sistema aceita o pedido e o processa de forma assíncrona. Isso mantém a API rápida e independe dos provedores. O `Idempotency-Key` impede que uma retentativa do chamador gere duas notificações.", "The response is **202 Accepted**: the system accepts the request and processes it asynchronously. This keeps the API fast and independent of providers. `Idempotency-Key` prevents a caller retry from generating two notifications."]),
      h(["4. Modelo de dados", "4. Data model"]),
      code(`user_preferences(user_id, type, channel, enabled, quiet_start, quiet_end, timezone)
devices(user_id, device_id, platform, push_token, last_seen)
templates(type, channel, locale, subject, body)         -- body has {{variables}}
notifications(notification_id, user_id, type, payload, created_at, dedup_key)
deliveries(notification_id, channel, status, attempts, provider_msg_id, updated_at)
  -- status: queued | sent | delivered | opened | failed | suppressed`),
      h(["5. Design de alto nível", "5. High-level design"]),
      fig(["Pipeline de notificações", "Notification pipeline"],
        [[node("src", ["Serviços chamadores", "Calling services"], "client")], [node("api", ["API de notificações", "Notification API"], "service")], [node("pr", ["Orquestrador (preferências, modelo, dedup)", "Orchestrator (prefs, template, dedup)"], "service"), node("db", ["Preferências e status", "Prefs and status"], "data")], [node("qp", ["Fila push", "Push queue"], "queue"), node("qe", ["Fila e-mail", "Email queue"], "queue"), node("qs", ["Fila SMS", "SMS queue"], "queue")], [node("ext", ["APNs, FCM, e-mail, SMS", "APNs, FCM, email, SMS"], "ext")]],
        [edge("src", "api"), edge("api", "pr", ["evento", "event"]), edge("pr", "db", ["consulta", "queries"]), edge("pr", "qp"), edge("pr", "qe"), edge("pr", "qs"), edge("qp", "ext", ["workers", "workers"]), edge("qe", "ext"), edge("qs", "ext")]),
      p(["O fluxo:", "The flow:"]),
      ul(
        ["A API valida, registra a notificação e a coloca em uma **fila de entrada**; responde 202 sem esperar o envio.", "The API validates, records the notification and puts it on an **intake queue**; it answers 202 without waiting for sending."],
        ["O **orquestrador** consome a fila: busca preferências, aplica horário de silêncio e opt-out, **deduplica**, escolhe os canais, renderiza o modelo no idioma do usuário e enfileira uma mensagem por canal.", "The **orchestrator** consumes the queue: loads preferences, applies quiet hours and opt-out, **deduplicates**, chooses channels, renders the template in the user's language and enqueues one message per channel."],
        ["**Workers por canal** consomem sua fila e chamam o provedor (APNs/FCM, serviço de e-mail, SMS). Cada canal tem a própria fila porque os provedores diferem em velocidade, limites e falhas: o SMS lento não pode atrasar o push.", "**Per-channel workers** consume their queue and call the provider (APNs/FCM, email service, SMS). Each channel has its own queue because providers differ in speed, limits and failures: slow SMS must not delay push."],
        ["Os provedores devolvem *callbacks* (webhooks) de entregue, aberta, falha e devolução de e-mail; um serviço de eventos atualiza o status e remove tokens inválidos.", "Providers return *callbacks* (webhooks) for delivered, opened, failed and email bounce; an event service updates status and removes invalid tokens."],
      ),
      h(["6. Aprofundamento: confiabilidade sem duplicar", "6. Deep dive: reliability without duplicating"]),
      p(["A entrega por filas é **pelo menos uma vez**: um worker pode enviar ao provedor, cair antes de confirmar a mensagem na fila, e a mensagem será reentregue a outro worker, que enviará de novo. Para o usuário isso é um SMS repetido, e para um código de login, um problema. A defesa tem camadas:", "Queue delivery is **at least once**: a worker may send to the provider, crash before acknowledging the queue message, and the message will be redelivered to another worker, who sends again. For the user that is a repeated SMS, and for a login code, a problem. The defense has layers:"]),
      ul(
        ["**Chave de deduplicação** `dedup_key = hash(userId, type, referência do evento, canal)` gravada com inserção condicional (ou `SET NX` com TTL no Redis) **antes** de enviar. Se já existe, o worker descarta.", "**Deduplication key** `dedup_key = hash(userId, type, event reference, channel)` written with a conditional insert (or `SET NX` with TTL in Redis) **before** sending. If it exists, the worker discards."],
        ["**Idempotência no provedor**: vários provedores aceitam uma chave de idempotência ou um identificador de mensagem; passe o `notificationId`.", "**Idempotency at the provider**: several providers accept an idempotency key or message identifier; pass the `notificationId`."],
        ["**Máquina de estados**: `queued -> sent -> delivered`. Um worker só envia se o estado é `queued`; a transição é uma atualização condicional.", "**State machine**: `queued -> sent -> delivered`. A worker sends only if the state is `queued`; the transition is a conditional update."],
        ["**Aceitar o resto**: entre as opções “possivelmente duplicar” e “possivelmente perder”, notificações geralmente toleram a duplicata rara, enquanto perder um aviso de segurança não. Declaro isso.", "**Accept the remainder**: between “possibly duplicate” and “possibly lose”, notifications usually tolerate the rare duplicate, while losing a security alert is not acceptable. I state this."],
      ),
      p(["**Retentativas.** Falha temporária do provedor (timeout, 5xx) leva a nova tentativa com **recuo exponencial e variação aleatória** (1 s, 2 s, 4 s...), até um limite de tentativas. Falha permanente (token inválido, número inexistente, e-mail devolvido) não deve ser repetida: marca-se o destino como inválido. Mensagens que esgotam as tentativas vão para uma **fila de mensagens mortas** (DLQ), com alerta e possibilidade de reprocessar. Para notificações com prazo (um código de 5 minutos), a retentativa tem validade: depois do prazo, descarta.", "**Retries.** A temporary provider failure (timeout, 5xx) leads to a new attempt with **exponential backoff and jitter** (1 s, 2 s, 4 s...), up to an attempt limit. A permanent failure (invalid token, nonexistent number, bounced email) must not be retried: mark the destination invalid. Messages that exhaust attempts go to a **dead-letter queue** (DLQ), with an alert and a way to reprocess. For deadline-bound notifications (a 5-minute code), the retry has an expiry: after the deadline, discard."]),
      h(["7. Aprofundamento: prioridade, limites e escala", "7. Deep dive: priority, limits and scale"]),
      ul(
        ["**Prioridade**: filas separadas por prioridade (transacional, alta; marketing, baixa), para a campanha de um milhão de mensagens não atrasar o código de login. Os workers atendem a fila de alta prioridade primeiro ou têm capacidade reservada.", "**Priority**: separate queues by priority (transactional high; marketing low), so a one-million-message campaign does not delay the login code. Workers serve the high-priority queue first or have reserved capacity."],
        ["**Limites do provedor**: cada provedor limita requisições por segundo e por conta. Os workers usam um **rate limiter** (token bucket) por provedor e consomem da fila na velocidade permitida; a fila absorve o resto. Provedores de reserva (um segundo serviço de SMS) entram em *failover* quando o primário falha.", "**Provider limits**: each provider limits requests per second and per account. Workers use a **rate limiter** (token bucket) per provider and consume from the queue at the allowed speed; the queue absorbs the rest. Backup providers (a second SMS service) take over on *failover* when the primary fails."],
        ["**Campanhas em lote**: um job lê o público em páginas e enfileira em lotes, em vez de criar um milhão de chamadas de API. Respeita fuso horário e horário de silêncio de cada usuário.", "**Bulk campaigns**: a job reads the audience in pages and enqueues in batches, instead of creating a million API calls. It respects each user's time zone and quiet hours."],
        ["**Agendamento**: notificações futuras ficam em um armazenamento ordenado por horário (ou na fila com atraso); um agendador varre o próximo minuto e enfileira.", "**Scheduling**: future notifications sit in a store ordered by time (or in a delayed queue); a scheduler scans the next minute and enqueues."],
        ["**Agrupar e limitar frequência**: para não spammar, limite por usuário (no máximo N push por hora, agrupando eventos semelhantes em um resumo).", "**Batching and frequency capping**: to avoid spam, limit per user (at most N pushes per hour, grouping similar events into a digest)."],
        ["**Escala**: workers sem estado, escalados pelo tamanho da fila; filas particionadas por usuário garantem a ordem das notificações do mesmo usuário se isso importar.", "**Scale**: stateless workers scaled by queue size; queues partitioned by user keep a user's notifications in order if that matters."],
      ),
      table([["Canal", "Channel"], ["Característica", "Characteristic"], ["Cuidado", "Care"]],
        [["Push", "Push"], ["Barato e rápido; depende do token do dispositivo e do provedor da plataforma", "Cheap and fast; depends on the device token and platform provider"], ["Tokens expiram: remover os inválidos", "Tokens expire: remove invalid ones"]],
        [["E-mail", "Email"], ["Rico em conteúdo; entrega e abertura não garantidas", "Rich content; delivery and opens not guaranteed"], ["Reputação do remetente, devoluções e reclamações", "Sender reputation, bounces and complaints"]],
        [["SMS", "SMS"], ["Alcance universal; caro; bom para códigos", "Universal reach; expensive; good for codes"], ["Custo por mensagem e regras por país", "Cost per message and per-country rules"]],
        [["No app", "In-app"], ["Sem provedor externo; visto ao abrir o app", "No external provider; seen when opening the app"], ["Precisa de armazenamento por usuário e contagem de não lidas", "Needs per-user storage and unread counts"]],
      ),
      h(["8. Gargalos e falhas", "8. Bottlenecks and failures"]),
      ul(
        ["**Provedor fora do ar**: as filas acumulam, os workers esperam e usam o reserva. Um *circuit breaker* evita martelar um provedor doente.", "**Provider down**: queues accumulate, workers wait and use the backup. A *circuit breaker* avoids hammering a sick provider."],
        ["**Fila cresce sem limite**: alerta no atraso (idade da mensagem mais antiga) e escala dos workers; descarte de campanhas atrasadas demais.", "**Queue grows without bound**: alert on lag (age of the oldest message) and scale workers; drop campaigns that are too late."],
        ["**Banco de preferências lento**: cacheio as preferências com TTL curto; uma preferência desatualizada por alguns segundos é aceitável, mas um opt-out deve ser respeitado logo (invalidar o cache ao salvar).", "**Slow preferences database**: I cache preferences with short TTL; slightly stale preferences are acceptable, but an opt-out must be honored quickly (invalidate the cache on save)."],
        ["**Conformidade**: opt-out e link de descadastro obrigatórios em e-mail de marketing; dados pessoais protegidos e com retenção limitada.", "**Compliance**: opt-out and unsubscribe link required in marketing email; personal data protected and with limited retention."],
      ),
      h(["Perguntas de follow-up", "Follow-up questions"]),
      ul(
        ["**Como garantir a ordem de duas notificações do mesmo usuário?** Particiono a fila por `userId`; um consumidor por partição processa em ordem.", "**How to guarantee order of two notifications for the same user?** I partition the queue by `userId`; one consumer per partition processes in order."],
        ["**Como medir a taxa de entrega?** Os callbacks alimentam métricas por canal e provedor: enviadas, entregues, abertas, falhas, com alerta de queda.", "**How to measure delivery rate?** Callbacks feed metrics per channel and provider: sent, delivered, opened, failed, with alerts on drops."],
        ["**E se o usuário tem vários dispositivos?** Enviamos ao push de todos os dispositivos ativos e deduplicamos na tela com o `notificationId`.", "**What if the user has several devices?** We send push to all active devices and deduplicate on screen using the `notificationId`."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["API assíncrona (202), fila de entrada, orquestrador e uma fila por canal.", "Asynchronous API (202), intake queue, orchestrator and one queue per channel."],
        ["Pelo menos uma vez, com chave de deduplicação e máquina de estados.", "At least once, with deduplication key and state machine."],
        ["Retentativa com recuo, DLQ e provedor reserva; prioridade separa transacional de marketing.", "Retry with backoff, DLQ and backup provider; priority separates transactional from marketing."],
        ["Rate limiter por provedor; preferências respeitadas e cacheadas.", "Rate limiter per provider; preferences honored and cached."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Por que não enviar direto na requisição?** O provedor pode ser lento ou cair, e a requisição do usuário ficaria presa; a fila isola e permite retentativa.", "**Why not send straight inside the request?** The provider can be slow or fail and the user's request would hang; the queue isolates and allows retries."],
        ["**Kafka ou uma fila simples?** Para este volume, qualquer fila gerenciada serve; Kafka ajuda se você quer reprocessar e particionar por usuário.", "**Kafka or a simple queue?** At this volume any managed queue works; Kafka helps if you want reprocessing and per-user partitioning."],
        ["**Entrega exatamente uma vez existe?** Na prática, não de ponta a ponta com sistemas externos; usa-se pelo menos uma vez mais idempotência.", "**Does exactly-once delivery exist?** In practice not end to end with external systems; use at-least-once plus idempotency."],
      ),
      tip(["Mostre que você separa o que é urgente (código de login) do que é volume (campanha). É essa separação em filas e prioridades que o entrevistador procura.", "Show that you separate what is urgent (login code) from what is volume (campaign). That separation into queues and priorities is what the interviewer looks for."]),
    ] },

  { id: "projetando-um-servico-de-streaming-de-video", section: "entrevistas", level: 2, icon: "smart_display", minutes: 12,
    title: ["Projetando um serviço de streaming de vídeo", "Designing a video streaming service"],
    summary: ["Como eu resolveria: upload em partes, transcodificação paralela, armazenamento, CDN e streaming adaptativo.", "How I would solve it: chunked upload, parallel transcoding, storage, CDN and adaptive streaming."],
    body: [
      p(["Um serviço de vídeo (pense em YouTube ou Netflix) tem duas metades muito diferentes. A **publicação**: receber um arquivo grande, convertê-lo em vários formatos e guardá-lo. A **reprodução**: entregar bytes de vídeo a milhões de espectadores com início rápido e sem travar, em redes de qualidade variável. A chave é que o vídeo **nunca passa pelos servidores de aplicação**: ele vai direto ao armazenamento de objetos e sai por uma CDN. O banco de dados só guarda metadados.", "A video service (think YouTube or Netflix) has two very different halves. **Publishing**: receiving a large file, converting it into several formats and storing it. **Playback**: delivering video bytes to millions of viewers with quick start and no stalling, over networks of varying quality. The key is that video **never passes through application servers**: it goes straight to object storage and leaves through a CDN. The database only holds metadata."]),
      h(["1. Requisitos", "1. Requirements"]),
      table([["Tipo", "Type"], ["Requisito", "Requirement"]],
        [["Funcional", "Functional"], ["Enviar vídeos (até algumas horas e vários GB)", "Upload videos (up to a few hours and several GB)"]],
        [["Funcional", "Functional"], ["Assistir em qualquer dispositivo, com início rápido e qualidade adaptada à rede", "Watch on any device, with quick start and quality adapted to the network"]],
        [["Funcional", "Functional"], ["Busca e recomendação (fora do foco; cito como serviços à parte)", "Search and recommendation (out of focus; mentioned as separate services)"]],
        [["Funcional", "Functional"], ["Miniaturas, título, descrição, contagem de visualizações", "Thumbnails, title, description, view counts"]],
        [["Não funcional", "Non-functional"], ["Alta disponibilidade na reprodução; início em menos de 2 segundos", "High availability for playback; start in under 2 seconds"]],
        [["Não funcional", "Non-functional"], ["Durabilidade: nenhum vídeo enviado pode ser perdido", "Durability: no uploaded video may be lost"]],
        [["Não funcional", "Non-functional"], ["Custo controlado: armazenamento e banda são as maiores despesas", "Controlled cost: storage and bandwidth are the largest expenses"]],
        [["Fora de escopo", "Out of scope"], ["Transmissão ao vivo, comentários, anúncios, DRM (extensões)", "Live streaming, comments, ads, DRM (extensions)"]],
      ),
      h(["2. Estimativas", "2. Estimates"]),
      code(`DAU                    = 100,000,000, 5 videos/day watched -> 5e8 views/day -> ~5,800 starts/s
uploads                = 500,000 videos/day (avg 5 min, raw 300 MB) -> 150 TB/day raw

after transcoding      : ~5 renditions (240p..1080p/4K) ~= 2x the raw size of one version
storage/day            ~= 500k x 600 MB = 300 TB/day -> ~110 PB/year  (cold tiers matter)

egress (playback)      : avg bitrate 3 Mbps; concurrent viewers ~10M (peak) -> 30 Tbps
                         -> origin cannot serve this; the CDN must serve >95% of bytes
metadata               : tiny (a few KB/video) -> relational DB with replicas is enough`),
      p(["A conta mostra onde está o problema: **armazenamento (petabytes por ano) e banda de saída (terabits por segundo)**, não consultas ao banco. Ninguém serve 30 Tbps a partir de uma origem; é a CDN, com cache perto do usuário, que entrega a maior parte dos bytes. Isso justifica toda a arquitetura de borda e as camadas de armazenamento por temperatura (vídeo popular em disco rápido, cauda longa em armazenamento frio).", "The math shows where the problem is: **storage (petabytes per year) and egress bandwidth (terabits per second)**, not database queries. Nobody serves 30 Tbps from an origin; the CDN, with caches near the user, delivers most bytes. This justifies the entire edge architecture and storage tiers by temperature (popular video on fast disk, the long tail on cold storage)."]),
      h(["3. API", "3. API"]),
      code(`POST /v1/videos                       { "title": "...", "size": 734003200, "contentType": "video/mp4" }
  -> 201 { "videoId": "v91", "uploadUrls": ["https://storage/...part1?sig=...", ...] }   // pre-signed
POST /v1/videos/{id}/complete         { "etags": [...] }   -> 202 (processing starts)
GET  /v1/videos/{id}                  -> { "status": "processing|ready|failed", "title", "manifestUrl", "thumbs" }
GET  https://cdn.example/v91/master.m3u8       // manifest for adaptive streaming`),
      p(["O cliente não envia o arquivo ao servidor de aplicação: recebe **URLs pré-assinadas** (válidas por tempo limitado) e envia as partes diretamente ao armazenamento de objetos. O servidor de aplicação só trata metadados, o que evita que arquivos de gigabytes consumam suas conexões e memória.", "The client does not send the file to the application server: it receives **pre-signed URLs** (valid for a limited time) and sends parts straight to object storage. The application server only handles metadata, which prevents gigabyte files from consuming its connections and memory."]),
      h(["4. Design de alto nível", "4. High-level design"]),
      fig(["Publicação e reprodução de vídeo", "Video publishing and playback"],
        [[node("up", ["Criador", "Uploader"], "client"), node("vw", ["Espectador", "Viewer"], "client")], [node("api", ["API de metadados", "Metadata API"], "service"), node("cdn", "CDN", "edge")], [node("ob", ["Armazenamento de objetos (original)", "Object storage (original)"], "data"), node("q", ["Fila de transcodificação", "Transcode queue"], "queue")], [node("tw", ["Workers de transcodificação", "Transcoding workers"], "service")], [node("or", ["Armazenamento de objetos (renditions)", "Object storage (renditions)"], "data"), node("md", ["Banco de metadados", "Metadata DB"], "data")]],
        [edge("up", "api", ["inicia", "starts"]), edge("up", "ob", ["partes (URL assinada)", "parts (signed URL)"]), edge("ob", "q", ["evento", "event"]), edge("q", "tw"), edge("tw", "or", ["segmentos", "segments"]), edge("tw", "md", ["status", "status"]), edge("api", "md"), edge("vw", "cdn", ["manifesto e segmentos", "manifest and segments"]), edge("cdn", "or", ["se errar", "on miss"], { dashed: true })]),
      h(["5. Aprofundamento: upload em partes", "5. Deep dive: chunked upload"]),
      p(["Arquivos grandes falham no meio: a rede do celular cai, o navegador fecha. Por isso o upload é **dividido em partes** (por exemplo, 8 a 16 MB), enviadas em paralelo e **retomáveis**: se a parte 37 falhou, reenvia-se só ela. O armazenamento de objetos oferece o *multipart upload*: cada parte devolve um identificador (ETag), e o `complete` as junta. O cliente guarda quais partes já foram enviadas e, ao retomar, consulta o servidor. Ao receber o `complete`, o armazenamento emite um evento que dispara o processamento. Uma rotina limpa uploads incompletos antigos para não pagar por armazenamento sem uso.", "Large files fail midway: the phone network drops, the browser closes. So the upload is **split into parts** (for example 8 to 16 MB), sent in parallel and **resumable**: if part 37 failed, only that part is resent. Object storage offers *multipart upload*: each part returns an identifier (ETag) and `complete` joins them. The client records which parts were sent and, on resume, asks the server. On receiving `complete`, storage emits an event that triggers processing. A job cleans old incomplete uploads to avoid paying for unused storage."]),
      h(["6. Aprofundamento: transcodificação", "6. Deep dive: transcoding"]),
      p(["O arquivo original pode estar em qualquer codec, resolução e taxa de bits. Para tocar bem em qualquer dispositivo e rede, o pipeline gera várias **versões (renditions)** em resoluções e taxas diferentes (por exemplo, 240p, 480p, 720p, 1080p), codecs (H.264 como base amplamente suportada; VP9, AV1 ou HEVC para economizar banda onde o dispositivo suporta) e as **fatia em segmentos** curtos (2 a 10 segundos). Gera também miniaturas e, se necessário, áudios em vários idiomas e legendas.", "The original file may be in any codec, resolution and bitrate. To play well on any device and network, the pipeline generates several **renditions** at different resolutions and bitrates (for example 240p, 480p, 720p, 1080p), codecs (H.264 as the widely supported base; VP9, AV1 or HEVC to save bandwidth where the device supports them) and **slices them into short segments** (2 to 10 seconds). It also generates thumbnails and, if needed, audio tracks in several languages and subtitles."]),
      p(["A transcodificação é pesada em CPU e demorada: um vídeo longo levaria horas em uma máquina. A solução é **paralelizar**: o vídeo é dividido em pedaços (por exemplo, a cada grupo de quadros, em pontos de corte limpos), e cada pedaço de cada resolução vira uma **tarefa independente** em uma fila. Workers (muitos, baratos, até instâncias interrompíveis) consomem as tarefas; um passo final junta os pedaços e escreve os manifestos. Se um worker morre, a tarefa volta à fila (a tarefa é idempotente, pois reescreve a mesma saída). O estado do processamento é um grafo de tarefas (DAG): dividir, transcodificar cada rendition em paralelo, gerar miniaturas, montar o manifesto, marcar `ready`.", "Transcoding is CPU-heavy and slow: a long video would take hours on one machine. The solution is to **parallelize**: the video is split into pieces (for example at each group of pictures, at clean cut points), and each piece of each resolution becomes an **independent task** in a queue. Workers (many, cheap, even preemptible instances) consume the tasks; a final step joins the pieces and writes the manifests. If a worker dies, the task returns to the queue (the task is idempotent since it rewrites the same output). Processing state is a task graph (DAG): split, transcode each rendition in parallel, generate thumbnails, assemble the manifest, mark `ready`."]),
      code(`video uploaded
  -> split into chunks (GOP-aligned)
  -> for each chunk x each rendition: transcode (parallel tasks)
  -> merge chunks into segments (4 s), write playlists
  -> master manifest lists renditions:
       #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360   360p/index.m3u8
       #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720 720p/index.m3u8
  -> status = ready`),
      h(["7. Aprofundamento: streaming adaptativo e CDN", "7. Deep dive: adaptive streaming and CDN"]),
      p(["Em vez de baixar um arquivo único, o player baixa o **manifesto** (HLS usa listas `.m3u8`; MPEG-DASH usa `.mpd`), que lista as versões disponíveis e os segmentos. O player mede a vazão e o nível do buffer e **escolhe, a cada segmento, a melhor versão** que cabe na rede naquele momento: se a rede piora, passa para uma rendition menor sem pausar; quando melhora, sobe. É o que permite começar rápido (primeiro segmento em baixa qualidade) e evitar travamentos. Como os segmentos são arquivos HTTP comuns, funcionam com qualquer CDN e cache.", "Instead of downloading a single file, the player downloads the **manifest** (HLS uses `.m3u8` playlists; MPEG-DASH uses `.mpd`), which lists the available renditions and segments. The player measures throughput and buffer level and **picks, per segment, the best rendition** that fits the network at that moment: if the network worsens it drops to a smaller rendition without pausing; when it improves, it climbs. This enables fast start (first segment at low quality) and avoids stalls. Since segments are plain HTTP files, they work with any CDN and cache."]),
      p(["A **CDN** guarda segmentos em servidores de borda perto do espectador. O primeiro espectador de um vídeo em uma região causa um *miss* e busca na origem (ou em uma camada intermediária de cache); os seguintes recebem da borda. Vídeos populares ficam quentes na borda; a cauda longa (a maioria dos títulos, vistos raramente) vem da origem, então a latência é maior. Para reduzir a carga da origem, usa-se uma camada de cache regional entre a borda e a origem, e pré-aquecimento (*prefetch*) para lançamentos esperados. Grandes operadoras de vídeo chegam a instalar servidores de cache dentro das redes dos provedores de internet para tirar o tráfego do backbone.", "The **CDN** stores segments on edge servers near the viewer. The first viewer of a video in a region causes a *miss* and fetches from origin (or an intermediate cache tier); the next get it from the edge. Popular videos stay hot at the edge; the long tail (most titles, rarely watched) comes from origin, so latency is higher. To reduce origin load, a regional cache tier sits between edge and origin, with pre-warming (*prefetch*) for expected releases. Large video operators even install cache servers inside ISP networks to take traffic off the backbone."]),
      table([["Protocolo", "Protocol"], ["Características", "Characteristics"]],
        [["HLS", "HLS"], ["Listas `.m3u8`; suportado nativamente em dispositivos Apple e por quase todos os players", "`.m3u8` playlists; natively supported on Apple devices and by almost all players"]],
        [["MPEG-DASH", "MPEG-DASH"], ["Padrão aberto com manifesto `.mpd`; muito usado em web e TV", "Open standard with `.mpd` manifest; widely used on web and TV"]],
        [["Download progressivo", "Progressive download"], ["Um arquivo MP4 só; simples, mas sem adaptação e com início lento em redes ruins", "A single MP4; simple but no adaptation and slow start on poor networks"]],
      ),
      h(["8. Dados, custos, gargalos e falhas", "8. Data, costs, bottlenecks and failures"]),
      ul(
        ["**Metadados**: título, dono, status, duração, caminhos dos manifestos. Um banco relacional com réplicas basta; particionar por `videoId` se crescer. Visualizações são contadas por eventos assíncronos e agregadas, não por escrita direta no banco.", "**Metadata**: title, owner, status, duration, manifest paths. A relational database with replicas suffices; partition by `videoId` if it grows. Views are counted via asynchronous events and aggregated, not by direct database writes."],
        ["**Armazenamento por temperatura**: vídeos recentes e populares em armazenamento padrão; vídeos antigos e pouco vistos migram para classes mais baratas. O original pode ir ao arquivo frio depois de gerar as versões, mantendo-o para retranscodificar com codecs novos.", "**Storage by temperature**: recent and popular videos on standard storage; old and rarely viewed ones migrate to cheaper classes. The original can move to cold archive after generating renditions, kept for re-transcoding with newer codecs."],
        ["**Custo**: a banda de saída é a maior despesa. Codecs mais eficientes (AV1) reduzem bytes; escolher quais renditions gerar por vídeo (um vídeo pouco visto não precisa de 4K) reduz armazenamento e computação.", "**Cost**: egress bandwidth is the largest expense. More efficient codecs (AV1) reduce bytes; choosing which renditions to generate per video (a rarely watched video does not need 4K) reduces storage and compute."],
        ["**Falha na transcodificação**: tarefas idempotentes com retentativa; vídeo preso vai ao estado `failed` com alerta, e o criador pode reenviar.", "**Transcoding failure**: idempotent tasks with retry; a stuck video goes to `failed` with an alert, and the creator can re-upload."],
        ["**Queda da CDN ou da origem**: múltiplas CDNs, origem replicada em mais de uma região, e o player tenta outro endereço se um segmento falha.", "**CDN or origin outage**: multiple CDNs, origin replicated across more than one region, and the player tries another address if a segment fails."],
        ["**Proteção do conteúdo**: URLs de segmentos assinadas e de curta duração; DRM para conteúdo licenciado.", "**Content protection**: signed, short-lived segment URLs; DRM for licensed content."],
      ),
      h(["Perguntas de follow-up", "Follow-up questions"]),
      ul(
        ["**Como suportar transmissão ao vivo?** Segmentos gerados em tempo real por um ingestor (RTMP ou similar), com latência de alguns segundos a dezenas de segundos em HLS/DASH, ou protocolos de baixa latência quando necessário. A transcodificação precisa acompanhar o ritmo do ao vivo.", "**How to support live streaming?** Segments generated in real time by an ingest server (RTMP or similar), with latency of a few to tens of seconds in HLS/DASH, or low-latency protocols when needed. Transcoding must keep up with live pace."],
        ["**Como retomar um vídeo de onde parou?** Salvo a posição periodicamente (a cada poucos segundos) em um armazenamento chave-valor por usuário e vídeo.", "**How to resume a video where it stopped?** Save the position periodically (every few seconds) in a key-value store per user and video."],
        ["**Como detectar conteúdo duplicado ou proibido?** Impressão digital do conteúdo (fingerprint) comparada a uma base, em um passo assíncrono do pipeline antes de publicar.", "**How to detect duplicate or prohibited content?** Content fingerprinting compared against a database, in an asynchronous pipeline step before publishing."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["O vídeo nunca passa pela aplicação: upload por URL assinada, entrega por CDN.", "Video never passes through the app: upload by signed URL, delivery by CDN."],
        ["Upload em partes e retomável; transcodificação paralela por pedaço e por rendition em uma fila.", "Chunked, resumable upload; parallel transcoding per chunk and per rendition from a queue."],
        ["HLS/DASH com várias renditions deixam o player adaptar a qualidade à rede.", "HLS/DASH with several renditions let the player adapt quality to the network."],
        ["Armazenamento e banda são o custo: camadas por temperatura e CDN em camadas.", "Storage and bandwidth are the cost: tiers by temperature and a layered CDN."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Por que não guardar o vídeo no banco?** Banco de dados não é feito para arquivos de gigabytes: caro, lento e sem CDN. Guarde só a referência.", "**Why not store the video in the database?** Databases are not built for gigabyte files: expensive, slow and no CDN. Keep only the reference."],
        ["**Por que vários segmentos pequenos?** Permitem trocar de qualidade rápido, começar a tocar antes de baixar tudo, pular para um ponto e cachear em CDN.", "**Why many small segments?** They allow quick quality switches, starting playback before everything downloads, seeking and CDN caching."],
        ["**Quanto tempo leva a publicação?** Depende do tamanho; com paralelização, a transcodificação dura uma fração da duração do vídeo. Pode-se liberar uma qualidade baixa primeiro e as demais depois.", "**How long does publishing take?** Depends on size; with parallelization, transcoding takes a fraction of the video's duration. A low quality can be released first and the others later."],
      ),
      tip(["Cite os números de armazenamento e de banda de saída logo no início. Eles explicam por que o vídeo vai direto ao armazenamento de objetos e por que a CDN é o centro do desenho.", "Cite the storage and egress numbers early. They explain why the video goes straight to object storage and why the CDN is the center of the design."]),
    ] },

  { id: "projetando-um-sistema-de-pagamentos", section: "entrevistas", level: 2, icon: "payments", minutes: 12,
    title: ["Projetando um sistema de pagamentos", "Designing a payment system"],
    summary: ["Como eu resolveria: idempotência, livro-razão, estados do pagamento, provedores, conciliação e falhas parciais.", "How I would solve it: idempotency, ledger, payment states, providers, reconciliation and partial failures."],
    body: [
      p(["Em um sistema de pagamentos, o erro mais grave não é a lentidão, e sim **cobrar duas vezes, não cobrar, ou perder o rastro do dinheiro**. Por isso o problema inverte as prioridades de outros: a **correção e a auditabilidade** vêm antes da latência, e a consistência forte onde há dinheiro vale mais que a disponibilidade a qualquer custo. Vou resolver o caso de um e-commerce que cobra de clientes usando um provedor de pagamentos externo (um adquirente ou processador de cartões), sem lidar diretamente com números de cartão.", "In a payment system, the worst error is not slowness but **charging twice, not charging, or losing track of the money**. That is why the problem inverts the priorities of others: **correctness and auditability** come before latency, and strong consistency wherever money is involved beats availability at any cost. I will solve the case of an e-commerce charging customers through an external payment provider (an acquirer or card processor), without handling card numbers directly."]),
      h(["1. Requisitos", "1. Requirements"]),
      table([["Tipo", "Type"], ["Requisito", "Requirement"]],
        [["Funcional", "Functional"], ["Cobrar um pedido: autorizar e capturar o pagamento (cartão, Pix, boleto, carteiras)", "Charge an order: authorize and capture the payment (card, instant bank transfer, vouchers, wallets)"]],
        [["Funcional", "Functional"], ["Reembolsos totais e parciais; estornos (chargebacks)", "Full and partial refunds; chargebacks"]],
        [["Funcional", "Functional"], ["Status do pagamento em tempo real para o cliente e para o pedido", "Real-time payment status for customer and order"]],
        [["Funcional", "Functional"], ["Relatórios e conciliação financeira com os provedores", "Reports and financial reconciliation with providers"]],
        [["Não funcional", "Non-functional"], ["Nunca cobrar duas vezes o mesmo pedido, mesmo com retentativas e falhas", "Never charge the same order twice, even with retries and failures"]],
        [["Não funcional", "Non-functional"], ["Consistência forte e durabilidade dos registros financeiros", "Strong consistency and durability of financial records"]],
        [["Não funcional", "Non-functional"], ["Trilha de auditoria imutável; segurança e conformidade (PCI DSS)", "Immutable audit trail; security and compliance (PCI DSS)"]],
        [["Não funcional", "Non-functional"], ["Disponibilidade alta, tolerando falha do provedor", "High availability, tolerating provider failure"]],
      ),
      h(["2. Estimativas", "2. Estimates"]),
      code(`orders               = 10,000,000 / day  -> ~115 payments/s avg (peak ~1,000/s on sales days)
payment record       = 2 KB + ledger entries (2-4 rows x 200 B)
storage              = 1e7 x ~3 KB = 30 GB/day -> ~11 TB/year (kept for years: legal retention)
latency              : provider call 200-2,000 ms dominates; our own overhead < 100 ms`),
      p(["O volume é **baixo** para os padrões de sistemas distribuídos: mil transações por segundo cabem em um banco relacional bem configurado, com réplicas. O que torna o problema difícil não é a escala, e sim a **semântica**: o que acontece quando a chamada ao provedor expira e não sabemos se o dinheiro foi cobrado. Por isso eu escolho um banco relacional com transações ACID e deixo a escala horizontal (sharding por `merchantId` ou `customerId`) para quando for necessária.", "The volume is **low** by distributed-systems standards: a thousand transactions per second fits a well-configured relational database with replicas. What makes the problem hard is not scale but **semantics**: what happens when the call to the provider times out and we do not know whether the money was charged. So I choose a relational database with ACID transactions and leave horizontal scaling (sharding by `merchantId` or `customerId`) for when it is needed."]),
      h(["3. API", "3. API"]),
      code(`POST /v1/payments
  Idempotency-Key: ord_8841_attempt_1            // one key per payment intent
  { "orderId": "8841", "amount": 12990, "currency": "BRL",
    "method": { "type": "card", "token": "tok_abc" },   // token from the provider; no raw PAN here
    "customerId": "c77" }
  201 { "paymentId": "pay_5", "status": "authorized" }
  202 { "paymentId": "pay_5", "status": "pending" }     // processing, wait for webhook
  200 same body as the first call if the key was already used

GET  /v1/payments/{id}
POST /v1/payments/{id}/capture      POST /v1/payments/{id}/refunds  { "amount": 5000 }
POST /v1/webhooks/provider          // provider notifies the final status`),
      p(["Valores são sempre **inteiros na menor unidade da moeda** (centavos), nunca ponto flutuante, que acumula erro de arredondamento. A moeda viaja junto. O cartão nunca chega aos nossos servidores: o navegador envia os dados direto ao provedor e recebe um **token**, o que reduz muito o escopo de conformidade PCI DSS.", "Amounts are always **integers in the smallest currency unit** (cents), never floating point, which accumulates rounding error. The currency travels along. The card never reaches our servers: the browser sends the data directly to the provider and receives a **token**, which greatly reduces PCI DSS compliance scope."]),
      h(["4. Modelo de dados e livro-razão", "4. Data model and ledger"]),
      code(`CREATE TABLE payments (
  payment_id       TEXT PRIMARY KEY,
  order_id         TEXT NOT NULL,
  idempotency_key  TEXT NOT NULL UNIQUE,         -- enforces "once" at the database level
  amount           BIGINT NOT NULL CHECK (amount > 0),
  currency         CHAR(3) NOT NULL,
  status           TEXT NOT NULL,                -- created|pending|authorized|captured|failed|refunded
  provider         TEXT, provider_ref TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- double-entry ledger: append-only, never updated or deleted
CREATE TABLE ledger_entries (
  entry_id    BIGSERIAL PRIMARY KEY,
  payment_id  TEXT NOT NULL REFERENCES payments,
  account     TEXT NOT NULL,                     -- e.g. customer, merchant, fees, provider_clearing
  direction   CHAR(1) NOT NULL CHECK (direction IN ('D','C')),
  amount      BIGINT NOT NULL CHECK (amount > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- invariant per payment: sum(D) = sum(C)`),
      p(["O **livro-razão de partida dobrada** registra cada movimento como duas pernas (débito e crédito) que somam zero. Ele é **apenas de inclusão** (*append-only*): correções são novos lançamentos, nunca edições. Isso dá auditabilidade completa (“de onde veio cada centavo”) e permite reconstruir qualquer saldo somando os lançamentos. O saldo exibido pode ser uma projeção em cache, mas a verdade é o livro.", "The **double-entry ledger** records each movement as two legs (debit and credit) that sum to zero. It is **append-only**: corrections are new entries, never edits. This gives full auditability (“where did each cent come from”) and lets you rebuild any balance by summing entries. The displayed balance may be a cached projection, but the truth is the ledger."]),
      h(["5. Design de alto nível", "5. High-level design"]),
      fig(["Fluxo de pagamento", "Payment flow"],
        [[node("cl", ["Checkout", "Checkout"], "client")], [node("api", ["API de pagamentos", "Payments API"], "service")], [node("db", ["Banco relacional (pagamentos + livro)", "Relational DB (payments + ledger)"], "data"), node("q", ["Fila de eventos", "Event queue"], "queue")], [node("psp", ["Serviço do provedor (adaptador)", "Provider service (adapter)"], "service"), node("rec", ["Conciliação", "Reconciliation"], "service")], [node("ext", ["Provedores de pagamento", "Payment providers"], "ext")]],
        [edge("cl", "api", ["POST + chave", "POST + key"]), edge("api", "db", ["cria intenção", "creates intent"]), edge("api", "psp", ["cobra", "charges"]), edge("psp", "ext", ["autoriza", "authorizes"]), edge("ext", "psp", ["webhook", "webhook"], { dashed: true }), edge("psp", "db", ["atualiza estado", "updates state"], { dashed: true }), edge("db", "q", ["outbox", "outbox"]), edge("rec", "ext", ["extratos", "statements"], { dashed: true }), edge("rec", "db", ["compara", "compares"])]),
      h(["6. Aprofundamento: idempotência", "6. Deep dive: idempotency"]),
      p(["A rede falha, o cliente clica duas vezes, o balanceador reenvia. Sem proteção, cada repetição vira uma cobrança. A defesa central é a **chave de idempotência**: o cliente gera um identificador por **intenção** de pagamento (não por requisição HTTP) e o envia em cada tentativa. O servidor garante que a mesma chave produz **um único efeito** e a mesma resposta.", "The network fails, the client double-clicks, the balancer resends. Without protection, each repetition becomes a charge. The central defense is the **idempotency key**: the client generates an identifier per payment **intent** (not per HTTP request) and sends it on every attempt. The server guarantees the same key produces **one single effect** and the same response."]),
      code(`async function createPayment(req: CreatePayment, key: string) {
  // 1) claim the key atomically: unique index makes concurrent duplicates fail
  const inserted = await db.tx(async (tx) => {
    const row = await tx.insertIfAbsent("payments", { idempotency_key: key, status: "created", ...req });
    return row; // null if the key already existed
  });
  if (!inserted) return await loadPaymentByKey(key);   // return the original outcome

  // 2) call the provider passing OUR id as its idempotency key as well
  const result = await provider.charge({ amount: req.amount, token: req.token, idempotencyKey: inserted.paymentId });

  // 3) record the result + ledger entries in ONE transaction
  await db.tx((tx) => applyResult(tx, inserted.paymentId, result));
  return await loadPayment(inserted.paymentId);
}`),
      p(["Três pontos. **Primeiro**, a unicidade é garantida pelo **índice único no banco**, não por um `if` na aplicação (que sofre condição de corrida). **Segundo**, repasso uma chave de idempotência também ao provedor (a maioria dos provedores a aceita), de modo que uma retentativa nossa não gera uma segunda cobrança lá. **Terceiro**, a chave guarda a **resposta original**; se chega a mesma chave com um corpo diferente, devolvo erro (uso indevido).", "Three points. **First**, uniqueness is guaranteed by the **database unique index**, not by an `if` in the application (which suffers a race condition). **Second**, I pass an idempotency key to the provider as well (most providers accept it), so a retry from our side does not generate a second charge there. **Third**, the key stores the **original response**; if the same key arrives with a different body, I return an error (misuse)."]),
      h(["7. Aprofundamento: estados, falhas parciais e conciliação", "7. Deep dive: states, partial failures and reconciliation"]),
      p(["O pagamento é uma **máquina de estados** com transições explícitas e permitidas: `created -> pending -> authorized -> captured`, com ramos para `failed`, `refunded` e `partially_refunded`. Cada transição é uma atualização condicional (`UPDATE ... WHERE status = 'pending'`) na mesma transação que grava os lançamentos do livro. Isso evita estados impossíveis (reembolsar o que não foi capturado) e torna as retentativas seguras.", "The payment is a **state machine** with explicit allowed transitions: `created -> pending -> authorized -> captured`, with branches to `failed`, `refunded` and `partially_refunded`. Each transition is a conditional update (`UPDATE ... WHERE status = 'pending'`) in the same transaction that writes the ledger entries. This prevents impossible states (refunding what was not captured) and makes retries safe."]),
      p(["**O caso difícil: o provedor expirou (timeout) e não sabemos se cobrou.** Não é seguro repetir a cobrança nem marcar falha. A saída: marcar o pagamento como `pending` (**desconhecido**), consultar o provedor pelo identificador (a consulta é segura) e/ou esperar o **webhook** com o resultado final. Um trabalho periódico reexamina pagamentos presos em `pending` além de um prazo, consulta o status no provedor e os resolve. Se o provedor jamais registrou a transação, cancela-se com segurança. Nunca se assume o resultado sem confirmação.", "**The hard case: the provider timed out and we do not know whether it charged.** It is unsafe to repeat the charge or to mark failure. The way out: mark the payment `pending` (**unknown**), query the provider by identifier (the query is safe) and/or wait for the **webhook** with the final result. A periodic job re-examines payments stuck in `pending` past a deadline, queries status at the provider and resolves them. If the provider never recorded the transaction, it is safely canceled. The result is never assumed without confirmation."]),
      p(["**Webhooks** devem ser tratados com cuidado: verifique a **assinatura**, trate-os como idempotentes (o mesmo evento pode chegar várias vezes e fora de ordem) e responda 2xx rápido, processando de forma assíncrona. **Conciliação**: diariamente, um processo baixa os extratos do provedor e compara, transação a transação, com o nosso livro. Diferenças (cobrado no provedor e não registrado aqui, ou o contrário) geram alertas e ajustes por lançamentos de correção. É a rede de segurança que detecta o que as outras defesas não pegaram.", "**Webhooks** need care: verify the **signature**, treat them as idempotent (the same event may arrive several times and out of order) and answer 2xx quickly, processing asynchronously. **Reconciliation**: daily, a process downloads the provider's statements and compares them, transaction by transaction, with our ledger. Differences (charged at the provider and not recorded here, or the reverse) trigger alerts and adjustments through correction entries. It is the safety net that catches what other defenses missed."]),
      p(["**Fluxos de várias etapas** (reservar estoque, cobrar, emitir nota, liberar o produto) não cabem em uma só transação distribuída. Use uma **saga**: cada passo local com sua **compensação** (estornar a cobrança se a reserva falhar). Para publicar eventos sem perda entre o banco e a fila, use o padrão **outbox**: o evento é gravado na mesma transação do pagamento e um processo o publica depois.", "**Multi-step flows** (reserve stock, charge, issue invoice, release the product) do not fit in one distributed transaction. Use a **saga**: each local step with its **compensation** (refund the charge if the reservation fails). To publish events without loss between the database and the queue, use the **outbox** pattern: the event is written in the same transaction as the payment and a process publishes it later."]),
      table([["Problema", "Problem"], ["Mecanismo", "Mechanism"]],
        [["Retentativa do cliente", "Client retry"], ["Chave de idempotência com índice único", "Idempotency key with unique index"]],
        [["Timeout do provedor", "Provider timeout"], ["Estado `pending`, consulta de status, webhook, job de resolução", "`pending` state, status query, webhook, resolution job"]],
        [["Webhook duplicado ou fora de ordem", "Duplicate or out-of-order webhook"], ["Verificação de assinatura, transições condicionais por estado", "Signature check, state-conditional transitions"]],
        [["Erro entre sistemas", "Cross-system mismatch"], ["Conciliação diária e lançamentos de correção", "Daily reconciliation and correction entries"]],
        [["Falha no meio de um fluxo", "Failure mid-flow"], ["Saga com compensações; outbox para eventos", "Saga with compensations; outbox for events"]],
        [["Adulteração de registros", "Record tampering"], ["Livro apenas de inclusão, auditoria e controle de acesso", "Append-only ledger, audit and access control"]],
      ),
      h(["8. Segurança, gargalos e escala", "8. Security, bottlenecks and scale"]),
      ul(
        ["**Dados de cartão**: use tokenização pelo provedor, nunca armazene o número completo nem o CVV; fale com o provedor por TLS e restrinja o acesso por rede e identidade. Isso reduz o escopo do PCI DSS.", "**Card data**: use provider tokenization, never store the full number or CVV; talk to the provider over TLS and restrict access by network and identity. This reduces the PCI DSS scope."],
        ["**Provedor lento ou fora**: *circuit breaker* e **roteamento entre provedores** (se o principal falha, tenta-se o secundário para novas tentativas de pagamento, nunca para repetir a mesma cobrança sem a confirmação de que a primeira falhou).", "**Slow or down provider**: *circuit breaker* and **routing across providers** (if the primary fails, try the secondary for new payment attempts, never to repeat the same charge without confirmation that the first failed)."],
        ["**Banco**: réplicas para leitura (relatórios), líder para escrita; sharding por comerciante quando o volume exigir. Transações curtas e sem chamadas externas dentro delas (nunca segure uma transação aberta esperando o provedor).", "**Database**: replicas for reads (reports), leader for writes; sharding by merchant when volume demands. Short transactions with no external calls inside (never hold a transaction open waiting on the provider)."],
        ["**Fraude**: regras e modelos de risco antes de autorizar, limites de valor e de velocidade, verificação adicional (3-D Secure) em casos suspeitos.", "**Fraud**: rules and risk models before authorizing, amount and velocity limits, extra verification (3-D Secure) in suspicious cases."],
        ["**Disponibilidade**: banco com failover síncrono em outra zona. Aqui prefiro **perder disponibilidade a perder consistência** (CP): é aceitável recusar temporariamente um pagamento; não é aceitável cobrar errado.", "**Availability**: database with synchronous failover to another zone. Here I prefer **losing availability to losing consistency** (CP): temporarily declining a payment is acceptable; charging wrongly is not."],
      ),
      h(["Perguntas de follow-up", "Follow-up questions"]),
      ul(
        ["**Como fazer um reembolso parcial seguro?** Cada reembolso tem a própria chave de idempotência e o sistema valida que a soma dos reembolsos não passa do valor capturado, em uma transação com bloqueio da linha do pagamento.", "**How to make a partial refund safe?** Each refund has its own idempotency key and the system validates that the sum of refunds does not exceed the captured amount, in a transaction locking the payment row."],
        ["**E moedas diferentes?** Valor e moeda sempre juntos; conversão como lançamento explícito com a taxa usada registrada.", "**What about different currencies?** Amount and currency always together; conversion as an explicit entry with the rate used recorded."],
        ["**Como pagar vendedores (marketplace)?** Livro com contas por vendedor, repasses agendados e lançamentos de taxa; conciliação por vendedor.", "**How to pay sellers (marketplace)?** Ledger with per-seller accounts, scheduled payouts and fee entries; reconciliation per seller."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Consistência forte e auditoria vêm antes de latência e disponibilidade irrestrita.", "Strong consistency and auditability come before latency and unrestricted availability."],
        ["Idempotência por intenção, garantida por índice único e repassada ao provedor.", "Idempotency per intent, enforced by a unique index and passed to the provider."],
        ["Livro de partida dobrada, apenas de inclusão; valores em inteiros.", "Double-entry, append-only ledger; amounts as integers."],
        ["Timeout significa desconhecido: consulte, espere o webhook e concilie.", "A timeout means unknown: query, wait for the webhook and reconcile."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Por que não usar um banco NoSQL?** Dá para, mas as transações ACID, restrições e junções do relacional simplificam a correção. A escala do problema não exige o resto.", "**Why not use a NoSQL database?** You can, but relational ACID transactions, constraints and joins simplify correctness. The problem's scale does not require otherwise."],
        ["**Exatamente uma vez existe aqui?** Entre sistemas independentes, não: o que existe é pelo menos uma vez mais idempotência, que dá o mesmo efeito.", "**Does exactly-once exist here?** Between independent systems, no: what exists is at-least-once plus idempotency, which gives the same effect."],
        ["**Quem guarda o saldo?** O livro. O saldo é derivado e pode ser reconstruído somando os lançamentos.", "**Who stores the balance?** The ledger. The balance is derived and can be rebuilt by summing entries."],
      ),
      tip(["Se só puder dizer uma frase sobre pagamentos, diga: cada tentativa tem uma chave de idempotência, cada movimento é um lançamento imutável e todo resultado incerto é resolvido por consulta e conciliação, nunca por suposição.", "If you can say only one sentence about payments, say: every attempt has an idempotency key, every movement is an immutable ledger entry and every uncertain result is resolved by querying and reconciliation, never by assumption."]),
    ] },

  { id: "projetando-autocomplete-de-busca", section: "entrevistas", level: 1, icon: "manage_search", minutes: 11,
    title: ["Projetando autocomplete de busca", "Designing search autocomplete"],
    summary: ["Como eu resolveria: trie com sugestões pré-calculadas, pipeline de atualização, cache e latência abaixo de 100 ms.", "How I would solve it: a trie with precomputed suggestions, an update pipeline, caching and latency under 100 ms."],
    body: [
      p(["Ao digitar “siste” em uma caixa de busca, o sistema sugere “sistema solar”, “sistemas distribuídos”, “sistema operacional”. A sugestão precisa aparecer **enquanto o usuário digita**, ou seja, a cada tecla, em menos de cerca de 100 ms para parecer instantânea. Isso significa **muito tráfego de leitura de baixa latência** sobre uma estrutura que deve refletir o que as pessoas buscam, mas sem consultar um banco a cada letra. O problema testa estruturas de dados (trie), pré-cálculo, cache e pipelines de atualização em lote.", "When you type “syst” in a search box, the system suggests “system design”, “systems of equations”, “system restore”. The suggestion must appear **while the user types**, that is, on every keystroke, within about 100 ms to feel instant. This means **heavy low-latency read traffic** over a structure that must reflect what people search, without querying a database on each letter. The problem tests data structures (trie), precomputation, caching and batch update pipelines."]),
      h(["1. Requisitos", "1. Requirements"]),
      table([["Tipo", "Type"], ["Requisito", "Requirement"]],
        [["Funcional", "Functional"], ["Dado um prefixo, devolver as 5 a 10 melhores sugestões, ordenadas por popularidade", "Given a prefix, return the 5 to 10 best suggestions, ordered by popularity"]],
        [["Funcional", "Functional"], ["Sugestões refletem o que as pessoas buscam, atualizadas em horas (ou minutos para termos em alta)", "Suggestions reflect what people search, updated within hours (or minutes for trending terms)"]],
        [["Funcional", "Functional"], ["Filtrar conteúdo impróprio; opcionalmente personalizar por usuário ou idioma", "Filter inappropriate content; optionally personalize by user or language"]],
        [["Não funcional", "Non-functional"], ["Latência abaixo de 100 ms (p99), de ponta a ponta", "Latency under 100 ms (p99), end to end"]],
        [["Não funcional", "Non-functional"], ["Alta disponibilidade: se cair, a busca continua funcionando, só sem sugestões", "High availability: if it fails, search keeps working, just without suggestions"]],
        [["Não funcional", "Non-functional"], ["Consistência eventual aceitável: uma sugestão nova demorar a aparecer não é problema", "Eventual consistency acceptable: a new suggestion taking time to appear is no problem"]],
      ),
      h(["2. Estimativas", "2. Estimates"]),
      code(`searches/day            = 500,000,000        (~5,800 searches/s avg)
avg query length        = 20 chars, a request per keystroke (minus debounce) ~ 10 requests/search
autocomplete QPS        = 5,800 x 10 = 58,000 /s avg -> peak ~150,000 /s

distinct queries        = ~100,000,000 (unique strings in the log window)
suggestion data         = 1e8 x 30 B ~= 3 GB of strings; trie with top-K per node ~ 20-50 GB
                          -> fits in memory of a few machines (replicated), not a huge dataset`),
      p(["O tráfego é grande (150 mil requisições por segundo no pico), mas **o conjunto de dados é pequeno** para uma máquina moderna. Isso aponta a solução: manter a estrutura **inteira em memória**, replicada em várias máquinas, sem consulta a disco no caminho de leitura. A parte difícil não é a leitura, é manter a estrutura **atualizada** a partir de bilhões de buscas.", "Traffic is large (150 thousand requests per second at peak), but **the dataset is small** for a modern machine. That points to the solution: keep the structure **entirely in memory**, replicated across many machines, with no disk access on the read path. The hard part is not reading, it is keeping the structure **up to date** from billions of searches."]),
      h(["3. API", "3. API"]),
      code(`GET /v1/suggest?q=syst&limit=8&lang=pt
  -> 200 { "prefix": "syst", "suggestions": ["system design", "systems of equations", "system restore"] }
  Cache-Control: public, max-age=300

// client best practices
// - debounce: wait ~100-150 ms after the last keystroke before sending
// - cancel in-flight requests when a new key arrives
// - cache results per prefix in the browser`),
      h(["4. Aprofundamento: a estrutura de dados", "4. Deep dive: the data structure"]),
      p(["**A ideia ingênua** é um `SELECT query FROM searches WHERE query LIKE 'syst%' ORDER BY count DESC LIMIT 8` a cada tecla. Mesmo com índice, é uma consulta de disco por tecla, e a ordenação por popularidade sobre todos os termos com aquele prefixo é cara; a 150 mil por segundo, não escala. A solução é uma **trie** (árvore de prefixos): cada nó representa um caractere, e o caminho da raiz a um nó é um prefixo. Encontrar o nó de um prefixo de comprimento *L* custa *O(L)*, independente do número de termos.", "**The naive idea** is `SELECT query FROM searches WHERE query LIKE 'syst%' ORDER BY count DESC LIMIT 8` on every keystroke. Even with an index, it is a disk query per keystroke, and ordering by popularity over all terms with that prefix is expensive; at 150 thousand per second it does not scale. The solution is a **trie** (prefix tree): each node represents a character, and the path from root to a node is a prefix. Finding the node for a prefix of length *L* costs *O(L)*, independent of the number of terms."]),
      p(["Mas só a trie não basta: depois de achar o nó do prefixo, ainda seria preciso **percorrer toda a subárvore** para achar as melhores sugestões, o que é caro para prefixos curtos (o prefixo “s” tem milhões de descendentes). A otimização decisiva é **guardar em cada nó a lista pré-calculada das K melhores sugestões** da sua subárvore. Assim, a consulta é: descer *L* nós e devolver a lista guardada, *O(L)* no total. Trocamos memória e trabalho de construção por leitura quase instantânea.", "But a trie alone is not enough: after finding the prefix node you would still have to **walk the whole subtree** to find the best suggestions, which is costly for short prefixes (prefix “s” has millions of descendants). The decisive optimization is to **store in each node the precomputed list of the K best suggestions** of its subtree. Then a query is: descend *L* nodes and return the stored list, *O(L)* total. We trade memory and build work for near-instant reads."]),
      code(`interface TrieNode {
  children: Map<string, TrieNode>;
  top: { term: string; score: number }[];     // best K (e.g. 8) terms in this subtree
}

function suggest(root: TrieNode, prefix: string): string[] {
  let node = root;
  for (const ch of prefix) {
    const next = node.children.get(ch);
    if (!next) return [];                      // unknown prefix
    node = next;
  }
  return node.top.map((t) => t.term);          // O(L), no subtree walk
}`),
      table([["Alternativa", "Alternative"], ["Prós", "Pros"], ["Contras", "Cons"]],
        [["`LIKE 'prefixo%'` no SQL", "SQL `LIKE 'prefix%'`"], ["Nenhum componente novo", "No new component"], ["Disco por tecla e ordenação cara; não escala", "Disk per keystroke and expensive sort; does not scale"]],
        [["Índice de busca (Elasticsearch, edge n-grams)", "Search index (Elasticsearch, edge n-grams)"], ["Pronto, com fuzzy e filtros", "Ready-made, with fuzzy and filters"], ["Mais pesado e caro em latência e hardware", "Heavier and costlier in latency and hardware"]],
        [["Trie com top-K por nó em memória", "In-memory trie with top-K per node"], ["Leitura *O(L)*, latência de microssegundos", "*O(L)* reads, microsecond latency"], ["Construção offline e uso de memória; atualização não é em tempo real", "Offline build and memory use; updates not real time"]],
        [["Mapa prefixo para lista (hash)", "Prefix-to-list map (hash)"], ["Mais simples; uma leitura por chave", "Simplest; one read per key"], ["Muitas chaves (todos os prefixos); mais memória que a trie compartilhada", "Many keys (all prefixes); more memory than a shared trie"]],
      ),
      p(["Uma alternativa prática é **materializar** cada prefixo (até um comprimento máximo, como 20) como uma chave de um armazenamento chave-valor em memória (Redis) cujo valor é a lista das K melhores sugestões. Fica trivial de distribuir e cachear, ao custo de mais espaço. Para a entrevista, explico a trie e cito o mapa de prefixos como a variante operacional.", "A practical alternative is to **materialize** each prefix (up to a maximum length, such as 20) as a key in an in-memory key-value store (Redis) whose value is the list of the K best suggestions. It becomes trivial to distribute and cache, at the cost of more space. For the interview, I explain the trie and mention the prefix map as the operational variant."]),
      h(["5. Design de alto nível", "5. High-level design"]),
      fig(["Autocomplete: leitura rápida e atualização em lote", "Autocomplete: fast reads and batch updates"],
        [[node("cl", ["Navegador", "Browser"], "client")], [node("cdn", ["CDN / cache de borda", "CDN / edge cache"], "edge"), node("lb", ["Balanceador", "Load balancer"], "edge")], [node("sg", ["Serviço de sugestões (trie em memória)", "Suggestion service (in-memory trie)"], "service")], [node("lg", ["Log de buscas", "Search logs"], "queue"), node("ag", ["Agregação em lote", "Batch aggregation"], "service")], [node("bs", ["Construtor de trie", "Trie builder"], "service"), node("st", ["Snapshots (armazenamento de objetos)", "Snapshots (object storage)"], "data")]],
        [edge("cl", "cdn", ["prefixo", "prefix"]), edge("cdn", "lb", ["se errar", "on miss"], { dashed: true }), edge("lb", "sg"), edge("sg", "lg", ["registra busca", "logs search"], { dashed: true }), edge("lg", "ag"), edge("ag", "bs", ["contagens", "counts"]), edge("bs", "st", ["gera", "builds"]), edge("st", "sg", ["carrega", "loads"], { dashed: true })]),
      h(["6. Aprofundamento: manter as sugestões atualizadas", "6. Deep dive: keeping suggestions up to date"]),
      p(["Atualizar a trie a cada busca seria um desastre: 5.800 escritas por segundo em uma estrutura lida por 150 mil requisições por segundo, com o top-K de todos os ancestrais mudando a cada incremento. Por isso separo **o caminho de leitura do caminho de atualização**:", "Updating the trie on each search would be a disaster: 5,800 writes per second on a structure read by 150 thousand requests per second, with the top-K of every ancestor changing on each increment. So I separate **the read path from the update path**:"]),
      ul(
        ["**Coleta**: cada busca concluída gera um evento (consulta, instante, idioma) em um log/stream (Kafka). Não bloqueia nada.", "**Collection**: each completed search emits an event (query, time, language) to a log/stream (Kafka). It blocks nothing."],
        ["**Agregação**: um job em lote (a cada hora, ou em micro-lotes de minutos) soma as contagens por consulta em uma janela (por exemplo, os últimos 7 dias, com decaimento para valorizar o recente) e filtra termos raros demais, ofensivos ou de baixa qualidade.", "**Aggregation**: a batch job (hourly, or in minute-level micro-batches) sums counts per query over a window (for example the last 7 days, with decay to favor recent) and filters terms that are too rare, offensive or low quality."],
        ["**Construção**: um construtor gera uma nova trie (ou o mapa de prefixos) com top-K por nó e grava um **snapshot** versionado no armazenamento de objetos.", "**Build**: a builder generates a new trie (or the prefix map) with top-K per node and writes a versioned **snapshot** to object storage."],
        ["**Implantação**: os servidores de sugestão carregam o novo snapshot em segundo plano e **trocam o ponteiro** da trie antiga pela nova de forma atômica (*blue/green* em memória), sem interromper leituras. Se o snapshot estiver ruim, volta-se à versão anterior.", "**Rollout**: suggestion servers load the new snapshot in the background and **atomically swap the pointer** from the old trie to the new one (in-memory *blue/green*), without interrupting reads. If the snapshot is bad, roll back to the previous version."],
        ["**Termos em alta**: um caminho rápido separado detecta picos (uma notícia de última hora) com uma janela curta e injeta esses termos em uma pequena trie ou lista complementar, mesclada na consulta.", "**Trending terms**: a separate fast path detects spikes (breaking news) with a short window and injects these terms into a small complementary trie or list, merged at query time."],
      ),
      p(["O resultado: leitura imutável e rápida, atualização eventualmente consistente com defasagem de minutos a horas, que cumpre o requisito. Como a trie é imutável durante o uso, **não há bloqueios** na leitura.", "The result: fast immutable reads, eventually consistent updates with minutes-to-hours lag, which meets the requirement. Since the trie is immutable while in use, there are **no locks** on reads."]),
      h(["7. Aprofundamento: latência, cache e escala", "7. Deep dive: latency, caching and scale"]),
      ul(
        ["**Cache em camadas**: o navegador guarda resultados por prefixo e reaproveita ao apagar/redigitar; a CDN cacheia respostas de prefixos populares com TTL de minutos (`Cache-Control: max-age=300`). Prefixos curtos, os mais pedidos, ficam quase todos nesse cache.", "**Layered caching**: the browser stores results per prefix and reuses them when deleting/retyping; the CDN caches answers for popular prefixes with a TTL of minutes (`Cache-Control: max-age=300`). Short prefixes, the most requested, almost all live in this cache."],
        ["**Debounce e cancelamento no cliente**: esperar 100 a 150 ms após a última tecla e cancelar a requisição anterior corta o tráfego em mais da metade e evita respostas fora de ordem.", "**Client debounce and cancellation**: waiting 100 to 150 ms after the last key and canceling the previous request cuts traffic by more than half and prevents out-of-order responses."],
        ["**Réplicas em vez de partições**: o conjunto cabe em uma máquina, então escalo para mais tráfego com **réplicas idênticas** atrás de um balanceador. Se crescesse demais (muitos idiomas), particionaria por idioma ou por faixa de prefixo (a-m, n-z), com um roteador que escolhe a partição pelo primeiro caractere.", "**Replicas instead of partitions**: the set fits one machine, so I scale for more traffic with **identical replicas** behind a balancer. If it grew too large (many languages), I would partition by language or prefix range (a-m, n-z), with a router that picks the partition by first character."],
        ["**Multirregião**: cada região carrega o snapshot e serve localmente, reduzindo a latência de rede.", "**Multi-region**: each region loads the snapshot and serves locally, cutting network latency."],
        ["**Degradação**: se o serviço cai, a interface esconde a lista e a busca continua. Por isso a sugestão não deve estar no caminho crítico da busca.", "**Degradation**: if the service dies, the interface hides the list and search carries on. That is why suggestion must not sit on search's critical path."],
      ),
      h(["8. Qualidade das sugestões", "8. Suggestion quality"]),
      ul(
        ["**Filtragem**: lista de bloqueio de termos ofensivos, de dados pessoais e de consultas ilegais, aplicada na agregação e na leitura.", "**Filtering**: blocklist of offensive terms, personal data and illegal queries, applied at aggregation and at read time."],
        ["**Ranqueamento**: mais que contagem bruta: popularidade recente (decaimento), taxa de cliques nas sugestões, idioma e localização, e opcionalmente o histórico do usuário combinado às globais.", "**Ranking**: more than raw count: recent popularity (decay), click-through on suggestions, language and location, and optionally the user's history combined with the global ones."],
        ["**Tolerância a erros de digitação**: correções (distância de edição, *fuzzy*) são mais pesadas; costumam ficar em um passo à parte ou no índice de busca, não na trie básica.", "**Typo tolerance**: corrections (edit distance, *fuzzy*) are heavier; they usually live in a separate step or in the search index, not in the basic trie."],
        ["**Acentos e maiúsculas**: normalizar (minúsculas, sem acentos, Unicode canônico) antes de inserir e de consultar.", "**Accents and case**: normalize (lowercase, strip accents, canonical Unicode) before inserting and querying."],
      ),
      h(["Perguntas de follow-up", "Follow-up questions"]),
      ul(
        ["**Como reduzir a memória da trie?** Comprimir caminhos de nós com um filho só (trie compacta/radix), guardar IDs de termos em vez de strings repetidas nas listas top-K.", "**How to reduce the trie's memory?** Compress single-child paths (compact/radix trie), store term IDs instead of repeated strings in the top-K lists."],
        ["**Como personalizar?** Mesclar, na consulta, as sugestões globais com uma lista pequena do histórico do usuário, mantida em um armazenamento chave-valor por usuário.", "**How to personalize?** At query time, merge global suggestions with a small list from the user's history, kept in a per-user key-value store."],
        ["**Como medir o sucesso?** Taxa de aceitação da sugestão, tempo até o clique, proporção de buscas sem resultado e a latência p99.", "**How to measure success?** Suggestion acceptance rate, time to click, share of searches with no result and p99 latency."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Trie com top-K pré-calculado em cada nó: consulta em *O(L)*, sem varrer a subárvore.", "Trie with precomputed top-K per node: *O(L)* query, no subtree walk."],
        ["Leitura e atualização separadas: log, agregação em lote, snapshot imutável e troca atômica.", "Reads and updates separated: log, batch aggregation, immutable snapshot and atomic swap."],
        ["Cache em camadas (navegador, CDN) e debounce no cliente cortam a maior parte do tráfego.", "Layered caching (browser, CDN) and client debounce cut most of the traffic."],
        ["Se o serviço cair, a busca continua; a consistência é eventual.", "If the service fails, search continues; consistency is eventual."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Por que não usar Elasticsearch?** Funciona, e é uma resposta válida se o requisito inclui fuzzy e filtros. Para sugestão por prefixo pura e latência mínima, a trie em memória é mais barata e rápida.", "**Why not use Elasticsearch?** It works, and is a valid answer if the requirement includes fuzzy and filters. For pure prefix suggestion with minimum latency, the in-memory trie is cheaper and faster."],
        ["**A trie precisa caber em uma máquina?** Neste caso sim, e isso simplifica tudo. Se não couber, particione por prefixo ou idioma.", "**Must the trie fit in one machine?** In this case yes, and it simplifies everything. If not, partition by prefix or language."],
        ["**Com que frequência reconstruir?** De hora em hora costuma bastar; termos em alta têm um caminho rápido à parte.", "**How often to rebuild?** Hourly is usually enough; trending terms have a separate fast path."],
      ),
      tip(["O ponto que mais impressiona: mostrar que a leitura não toca disco nem faz varredura (trie com top-K) e que a atualização foi tirada do caminho de leitura (snapshot e troca atômica).", "The point that impresses most: showing that reading touches no disk and does no scan (trie with top-K) and that updating was removed from the read path (snapshot and atomic swap)."]),
    ] },

  { id: "erros-comuns-e-como-evita-los", section: "entrevistas", level: 0, icon: "warning", minutes: 10,
    title: ["Erros comuns e como evitá-los", "Common mistakes and how to avoid them"],
    summary: ["O que derruba candidatos fortes, a consequência de cada erro e a correção, em uma tabela de consulta rápida.", "What sinks strong candidates, the consequence of each mistake and the fix, in a quick-reference table."],
    body: [
      p(["A maioria das reprovações em entrevistas de system design não vem de falta de conhecimento, e sim de **comportamento**: pular etapas, defender sem justificar, ignorar o que dá errado, falar sem checar se o entrevistador acompanha. A boa notícia é que todos esses erros são **hábitos**, e hábito se corrige com treino deliberado, cronômetro e alguém para dar retorno.", "Most rejections in system design interviews do not come from lack of knowledge but from **behavior**: skipping steps, defending without justifying, ignoring what goes wrong, talking without checking that the interviewer follows. The good news is that all of these mistakes are **habits**, and habits are fixed with deliberate practice, a timer and someone to give feedback."]),
      p(["Este artigo agrupa os erros por tipo e termina com uma tabela de consulta rápida (erro, consequência, como evitar) que você pode repassar antes de cada simulação.", "This article groups mistakes by type and ends with a quick-reference table (mistake, consequence, how to avoid) that you can review before each mock interview."]),
      h(["Erros de processo", "Process mistakes"]),
      ul(
        ["**Pular os requisitos**: começar a desenhar na hora. Sem requisitos você resolve o problema errado, e o entrevistador percebe que você não confirma premissas. Correção: gaste os primeiros minutos perguntando, anote e repita o contrato em voz alta.", "**Skipping requirements**: starting to draw right away. Without requirements you solve the wrong problem, and the interviewer notices you do not confirm assumptions. Fix: spend the first minutes asking, write it down and repeat the contract aloud."],
        ["**Números sem conta**: dizer “precisa escalar” sem estimar. Correção: calcule QPS e armazenamento, mesmo de forma grosseira, e use o resultado para decidir (cabe em um nó? precisa de cache? de sharding?).", "**Numbers without math**: saying “it needs to scale” without estimating. Fix: compute QPS and storage, even roughly, and use the result to decide (fits one node? needs a cache? sharding?)."],
        ["**Gastar tempo demais no começo**: 20 minutos em estimativas deixam 5 para o que importa. Correção: vigie o relógio e combine o foco com o entrevistador (“posso aprofundar a geração de IDs?”).", "**Spending too long at the start**: 20 minutes of estimates leave 5 for what matters. Fix: watch the clock and agree on the focus with the interviewer (“may I deep dive into ID generation?”)."],
        ["**Não ter ordem no quadro**: um diagrama que cresce sem estrutura confunde você e quem avalia. Correção: desenhe da esquerda para a direita, nomeie as caixas, numere o fluxo.", "**No order on the board**: a diagram that grows without structure confuses you and the evaluator. Fix: draw left to right, name the boxes, number the flow."],
      ),
      h(["Erros de design", "Design mistakes"]),
      ul(
        ["**Over-engineering**: colocar Kafka, microsserviços e sharding em um sistema de mil usuários. Correção: comece pelo simples e evolua conforme o requisito exige, dizendo o gatilho (“se passar de X, eu faria Y”).", "**Over-engineering**: putting Kafka, microservices and sharding in a system for a thousand users. Fix: start simple and evolve as requirements demand, naming the trigger (“if it passes X, I would do Y”)."],
        ["**Não justificar trade-offs**: citar tecnologias como lista de compras. Correção: para cada escolha, diga a alternativa e o motivo. “Escolho consistência eventual aqui porque o usuário tolera segundos de atraso e ganho disponibilidade.”", "**Not justifying trade-offs**: naming technologies like a shopping list. Fix: for each choice, state the alternative and the reason. “I pick eventual consistency here because the user tolerates seconds of delay and I gain availability.”"],
        ["**Ignorar falhas**: o desenho só funciona quando tudo está de pé. Correção: para cada componente, pergunte o que acontece quando ele cai, fica lento ou devolve erro.", "**Ignoring failures**: the design only works when everything is up. Fix: for each component, ask what happens when it dies, slows down or returns errors."],
        ["**Ponto único de falha esquecido**: um balanceador ou banco sem réplica. Correção: revise o diagrama procurando caixas sem redundância.", "**Forgotten single point of failure**: a load balancer or database without a replica. Fix: review the diagram looking for boxes without redundancy."],
        ["**Escolher tecnologia sem o padrão de acesso**: “vou usar MongoDB” sem dizer qual consulta ele serve. Correção: descreva primeiro a consulta principal e só depois o armazenamento.", "**Choosing technology without the access pattern**: “I will use MongoDB” without saying which query it serves. Fix: describe the main query first and the storage afterwards."],
        ["**Esquecer o caminho de escrita ou o de leitura**: desenhar só um dos dois. Correção: percorra os dois com o dedo no diagrama.", "**Forgetting the write path or the read path**: drawing only one of the two. Fix: walk both with your finger on the diagram."],
        ["**Consistência sem contexto**: exigir consistência forte em tudo (caro) ou eventual em tudo (perigoso). Correção: classifique os dados: dinheiro e estoque pedem forte; curtidas e visualizações aceitam eventual.", "**Consistency without context**: demanding strong consistency everywhere (expensive) or eventual everywhere (dangerous). Fix: classify data: money and stock need strong; likes and views accept eventual."],
      ),
      h(["Erros de comunicação", "Communication mistakes"]),
      ul(
        ["**Monólogo**: falar sem checar se o entrevistador acompanha. Correção: pare em cada etapa e pergunte “faz sentido seguir por aqui?”.", "**Monologue**: talking without checking that the interviewer follows. Fix: pause at each step and ask “does it make sense to go this way?”."],
        ["**Defender a ideia em vez de avaliá-la**: quando o entrevistador aponta um problema, ele costuma estar oferecendo uma pista. Correção: agradeça, reavalie e ajuste.", "**Defending the idea instead of evaluating it**: when the interviewer points out a problem, they are often offering a hint. Fix: acknowledge, reassess and adjust."],
        ["**Silêncio longo**: pensar em silêncio por dois minutos. Correção: narre o raciocínio, mesmo que incompleto (“estou comparando A e B porque...”).", "**Long silence**: thinking quietly for two minutes. Fix: narrate your reasoning, even incomplete (“I am comparing A and B because...”)."],
        ["**Fingir que sabe**: inventar o funcionamento interno de algo que não domina. Correção: diga o que sabe e o que presume, e raciocine a partir dos requisitos.", "**Pretending to know**: inventing the internals of something you do not master. Fix: say what you know and what you assume, and reason from requirements."],
        ["**Jargão sem definição**: usar siglas sem explicar o que significam na decisão. Correção: uma frase de contexto na primeira vez.", "**Jargon without definition**: using acronyms without saying what they mean for the decision. Fix: one sentence of context the first time."],
      ),
      fig(["Onde cada tipo de erro aparece na entrevista", "Where each kind of mistake shows up in the interview"],
        [[node("p", ["Processo", "Process"], "client")], [node("r", ["Requisitos e números", "Requirements and numbers"], "edge")], [node("d", ["Desenho e aprofundamento", "Design and deep dive"], "service")], [node("c", ["Comunicação", "Communication"], "data")]],
        [edge("p", "r", ["pular etapas", "skipping steps"]), edge("r", "d", ["sem contas", "no math"]), edge("d", "c", ["sem justificar", "no justification"]), edge("c", "p", ["feedback ignorado", "feedback ignored"], { dashed: true })]),
      h(["Tabela de consulta rápida", "Quick-reference table"]),
      table([["Erro", "Mistake"], ["Consequência", "Consequence"], ["Como evitar", "How to avoid"]],
        [["Começar a desenhar sem perguntar", "Drawing without asking"], ["Resolve o problema errado; parece pouco cuidadoso", "Solves the wrong problem; looks careless"], ["Reserve 5 minutos para requisitos e repita o contrato", "Reserve 5 minutes for requirements and repeat the contract"]],
        [["Dizer “precisa escalar” sem número", "Saying “it must scale” without a number"], ["Decisões arbitrárias; sem base para cache ou sharding", "Arbitrary decisions; no basis for caching or sharding"], ["Estime QPS, armazenamento e banda; conclua com o gargalo", "Estimate QPS, storage and bandwidth; conclude with the bottleneck"]],
        [["Estimativas longas demais", "Overlong estimates"], ["Sobra pouco tempo para o aprofundamento", "Little time left for the deep dive"], ["Limite a 4 minutos e use números redondos", "Cap at 4 minutes and use round numbers"]],
        [["Over-engineering", "Over-engineering"], ["Complexidade sem requisito; mostra falta de pragmatismo", "Complexity without a requirement; shows lack of pragmatism"], ["Comece simples e diga o gatilho para evoluir", "Start simple and name the trigger to evolve"]],
        [["Listar tecnologias sem trade-off", "Listing technologies without trade-offs"], ["Parece decorado; não demonstra julgamento", "Looks memorized; shows no judgment"], ["Para cada escolha, diga a alternativa e o motivo", "For each choice, state the alternative and the reason"]],
        [["Ignorar falhas", "Ignoring failures"], ["O desenho quebra na primeira queda de componente", "The design breaks at the first component failure"], ["Pergunte, para cada caixa, o que ocorre se cair ou ficar lenta", "Ask, for each box, what happens if it fails or slows"]],
        [["Ponto único de falha", "Single point of failure"], ["Disponibilidade menor que a exigida", "Availability lower than required"], ["Revise o diagrama procurando caixas sem redundância", "Review the diagram looking for boxes without redundancy"]],
        [["Escolher armazenamento por moda", "Choosing storage by fashion"], ["Consulta principal mal atendida", "Main query poorly served"], ["Defina o padrão de acesso antes do banco", "Define the access pattern before the database"]],
        [["Consistência igual para tudo", "Same consistency for everything"], ["Custo alto ou dados errados onde importa", "High cost or wrong data where it matters"], ["Classifique os dados: dinheiro forte, contadores eventual", "Classify data: money strong, counters eventual"]],
        [["Defender em vez de avaliar", "Defending instead of evaluating"], ["Perde as pistas do entrevistador; parece rígido", "Misses the interviewer's hints; looks rigid"], ["Agradeça a objeção, reavalie e ajuste em voz alta", "Thank the objection, reassess and adjust aloud"]],
        [["Silêncio ou monólogo", "Silence or monologue"], ["O entrevistador não acompanha o raciocínio", "The interviewer cannot follow your reasoning"], ["Narre e faça check-ins curtos a cada etapa", "Narrate and make short check-ins at each step"]],
        [["Inventar o que não sabe", "Inventing what you do not know"], ["Perda de credibilidade no resto", "Lost credibility for the rest"], ["Declare a premissa e raciocine a partir dela", "State the assumption and reason from it"]],
      ),
      h(["Como treinar para eliminar esses erros", "How to train to eliminate these mistakes"]),
      ul(
        ["**Simule com cronômetro e em voz alta**, sozinho ou com um amigo. Os erros de processo quase sempre aparecem na primeira simulação.", "**Simulate with a timer and out loud**, alone or with a friend. Process mistakes almost always show up in the first run."],
        ["**Grave a sessão** e escute: monólogos, silêncios e jargão ficam evidentes.", "**Record the session** and listen: monologues, silences and jargon become obvious."],
        ["**Mantenha uma lista pessoal de erros**: três itens que você repete. Revise antes de cada simulação e foque neles.", "**Keep a personal list of mistakes**: three items you repeat. Review before each mock and focus on them."],
        ["**Compare com uma resolução de referência** depois de resolver, e anote o que você esqueceu (normalmente idempotência, expiração, falhas).", "**Compare with a reference walkthrough** after solving, and note what you forgot (usually idempotency, expiry, failures)."],
        ["**Use os casos práticos do ArchLab** (menu Casos) para ver o que acontece quando um gargalo ou um ponto único de falha aparece sob carga: entender o efeito torna a justificativa natural.", "**Use ArchLab's hands-on cases** (Cases menu) to see what happens when a bottleneck or single point of failure shows up under load: understanding the effect makes justification natural."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Os erros mais caros são de comportamento, não de conhecimento.", "The costliest mistakes are about behavior, not knowledge."],
        ["Requisitos e números primeiro; simples primeiro; trade-offs sempre justificados.", "Requirements and numbers first; simple first; trade-offs always justified."],
        ["Pense em falhas para cada caixa e procure pontos únicos de falha.", "Think about failures for each box and look for single points of failure."],
        ["Converse: narre, cheque, trate objeções como pistas.", "Converse: narrate, check in, treat objections as hints."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Qual é o erro mais comum?** Pular os requisitos e desenhar de imediato. É também o mais fácil de corrigir.", "**What is the most common mistake?** Skipping requirements and drawing immediately. It is also the easiest to fix."],
        ["**E se eu perceber um erro no meio?** Diga em voz alta e corrija. Reconhecer e consertar um erro é visto como um ponto positivo.", "**What if I notice a mistake midway?** Say it aloud and fix it. Recognizing and repairing a mistake is seen as a plus."],
        ["**Quantas simulações bastam?** Cinco a dez simulações completas, com retorno, costumam eliminar os erros de processo.", "**How many mock interviews are enough?** Five to ten full mocks with feedback usually eliminate process mistakes."],
      ),
      tip(["Treine em voz alta com um cronômetro. Os erros de processo quase sempre aparecem na primeira simulação.", "Practice out loud with a timer. Process mistakes almost always show up in the first mock run."]),
    ] },

  { id: "entrevista-de-low-level-design", section: "entrevistas", level: 1, icon: "record_voice_over", minutes: 12,
    title: ["Entrevista de Low Level Design", "The Low Level Design interview"],
    summary: ["Como abordar questões de design orientado a objetos, do esclarecimento ao código, com um exemplo resolvido.", "How to approach object-oriented design questions, from clarification to code, with a worked example."],
    body: [
      p(["Em uma questão de **OOD** (*object-oriented design*), como “projete um estacionamento, um elevador, um jogo de xadrez, uma máquina de venda”, o foco muda da infraestrutura para a **modelagem e o código**. O entrevistador avalia se você transforma requisitos vagos em classes claras, extensíveis e corretas, em 35 a 45 minutos, e se você sabe quando aplicar princípios e padrões de projeto em vez de despejá-los.", "In an **OOD** (*object-oriented design*) question, such as “design a parking lot, an elevator, a chess game, a vending machine”, the focus shifts from infrastructure to **modeling and code**. The interviewer evaluates whether you turn vague requirements into clear, extensible and correct classes, in 35 to 45 minutes, and whether you know when to apply principles and design patterns rather than dumping them."]),
      p(["A diferença para o system design: aqui o escopo é um processo só, não há milhões de usuários, e o que se avalia é a qualidade do modelo (responsabilidades, relações, extensão) e do código que o implementa. Os artigos da seção Low Level Design cobrem SOLID, UML e padrões; este explica como usá-los sob a pressão da entrevista.", "The difference from system design: here the scope is a single process, there are no millions of users, and what is evaluated is the quality of the model (responsibilities, relationships, extension) and the code that implements it. The articles in the Low Level Design section cover SOLID, UML and patterns; this one explains how to use them under interview pressure."]),
      h(["O roteiro", "The roadmap"]),
      table([["Etapa", "Step"], ["Tempo", "Time"], ["O que fazer", "What to do"]],
        [["1. Esclarecer", "1. Clarify"], ["5 min", "5 min"], ["Casos de uso principais, o que fica fora, regras especiais", "Main use cases, what is out, special rules"]],
        [["2. Entidades", "2. Entities"], ["5 min", "5 min"], ["Liste substantivos candidatos a classe; descarte os que são só atributos", "List noun candidates for classes; discard those that are just attributes"]],
        [["3. Relações e responsabilidades", "3. Relationships and responsibilities"], ["8 min", "8 min"], ["Composição, interfaces, onde vive cada regra; diagrama de classes enxuto", "Composition, interfaces, where each rule lives; a lean class diagram"]],
        [["4. Padrões onde cabem", "4. Patterns where they fit"], ["3 min", "3 min"], ["Cite o padrão pelo problema que resolve", "Name the pattern by the problem it solves"]],
        [["5. Código", "5. Code"], ["15 min", "15 min"], ["Implemente o fluxo principal: interfaces primeiro, depois as classes centrais", "Implement the main flow: interfaces first, then core classes"]],
        [["6. Extensibilidade", "6. Extensibility"], ["5 min", "5 min"], ["Absorva uma mudança proposta sem reescrever", "Absorb a proposed change without a rewrite"]],
      ),
      h(["Etapas 1 e 2: esclarecer e achar as entidades", "Steps 1 and 2: clarify and find the entities"]),
      p(["Perguntas úteis para o estacionamento: há vários andares? Que tipos de veículo (moto, carro, caminhão) e de vaga? Como se cobra (por hora, tarifa diária, primeira hora grátis)? Há cancelamento, reserva, pagamento em dinheiro e cartão? Um ou vários portões? Anote as respostas e **declare o escopo**: “vou modelar entrada, saída, vagas por tipo e cobrança por hora; fora: reservas e pagamento real”.", "Useful questions for the parking lot: are there several floors? What vehicle types (motorcycle, car, truck) and spot types? How is it priced (hourly, daily rate, first hour free)? Is there cancellation, reservation, cash and card payment? One gate or several? Write down the answers and **declare the scope**: “I will model entry, exit, spots by type and hourly pricing; out: reservations and real payment”."]),
      p(["Para achar entidades, leia o enunciado e sublinhe os **substantivos** (estacionamento, andar, vaga, veículo, ticket, tarifa, pagamento) e os **verbos** (estacionar, sair, cobrar, achar vaga livre). Os substantivos viram classes ou atributos; os verbos viram métodos, e a pergunta é **de qual classe**: o método fica com quem tem os dados necessários.", "To find entities, read the statement and underline the **nouns** (parking lot, floor, spot, vehicle, ticket, rate, payment) and the **verbs** (park, leave, charge, find a free spot). Nouns become classes or attributes; verbs become methods, and the question is **in which class**: the method goes with whoever has the needed data."]),
      h(["Etapa 3: relações e responsabilidades", "Step 3: relationships and responsibilities"]),
      fig(["Modelo do estacionamento", "Parking lot model"],
        [[node("lot", "ParkingLot", "service")], [node("fl", "Floor", "service"), node("tk", "Ticket", "data")], [node("sp", "Spot", "service"), node("pol", "PricingPolicy", "edge")], [node("vh", "Vehicle", "client"), node("hr", "HourlyPricing", "ext"), node("fp", "FlatPricing", "ext")]],
        [edge("lot", "fl", "1..*"), edge("lot", "tk", ["emite", "issues"]), edge("fl", "sp", "1..*"), edge("tk", "sp"), edge("tk", "vh"), edge("lot", "pol", ["usa", "uses"]), edge("pol", "hr", ["implementa", "implemented by"], { dashed: true }), edge("pol", "fp", ["implementa", "implemented by"], { dashed: true })]),
      ul(
        ["**Composição**: `ParkingLot` contém `Floor`s, que contêm `Spot`s. Quem possui o ciclo de vida é o todo.", "**Composition**: `ParkingLot` contains `Floor`s, which contain `Spot`s. The whole owns the lifecycle."],
        ["**Interfaces**: `PricingPolicy` é uma interface com implementações trocáveis. O estacionamento depende da abstração, não da tarifa concreta (Princípio da Inversão de Dependência).", "**Interfaces**: `PricingPolicy` is an interface with swappable implementations. The lot depends on the abstraction, not on the concrete rate (Dependency Inversion Principle)."],
        ["**Responsabilidade única**: `Spot` sabe se está livre e se aceita um tipo de veículo; `Ticket` guarda entrada e vaga; `PricingPolicy` calcula o valor; `ParkingLot` orquestra. Se uma classe precisa de “e” para se descrever, são duas.", "**Single responsibility**: `Spot` knows whether it is free and whether it accepts a vehicle type; `Ticket` holds entry and spot; `PricingPolicy` computes the amount; `ParkingLot` orchestrates. If a class needs “and” to describe it, it is two."],
      ),
      h(["Etapa 4: padrões onde cabem", "Step 4: patterns where they fit"]),
      table([["Necessidade", "Need"], ["Padrão", "Pattern"], ["Exemplo", "Example"]],
        [["Regra de preço variável", "Variable pricing rule"], ["Strategy", "Strategy"], ["`HourlyPricing`, `FlatPricing`, `EventPricing`", "`HourlyPricing`, `FlatPricing`, `EventPricing`"]],
        [["Ciclo de vida com estados", "Lifecycle with states"], ["State", "State"], ["Elevador: parado, subindo, descendo, porta aberta", "Elevator: idle, going up, going down, door open"]],
        [["Avisar vários interessados", "Notify several interested parties"], ["Observer", "Observer"], ["Painel de vagas livres atualiza quando uma vaga muda", "Free-spot board updates when a spot changes"]],
        [["Criar objetos por tipo", "Create objects by type"], ["Factory", "Factory"], ["Criar `Car`, `Motorcycle` a partir de uma entrada", "Create `Car`, `Motorcycle` from an input"]],
        [["Uma única instância compartilhada", "A single shared instance"], ["Singleton (com cautela)", "Singleton (with caution)"], ["Prefira injetar a instância; singleton dificulta testes", "Prefer injecting the instance; singleton hampers tests"]],
        [["Ações como objetos (desfazer)", "Actions as objects (undo)"], ["Command", "Command"], ["Jogo de tabuleiro com histórico de jogadas", "Board game with move history"]],
      ),
      p(["O erro típico é encaixar um padrão que o problema não pede. Diga o padrão **pelo problema que ele resolve** (“a tarifa muda com frequência, então isolo atrás de uma Strategy”). Se não houver um problema, não use o padrão.", "The typical mistake is forcing a pattern the problem does not ask for. Say the pattern **by the problem it solves** (“the rate changes often, so I isolate it behind a Strategy”). If there is no problem, do not use the pattern."]),
      h(["Etapa 5: código do fluxo principal", "Step 5: code for the main flow"]),
      code(`type VehicleType = "motorcycle" | "car" | "truck";

interface Vehicle { plate: string; type: VehicleType }

interface PricingPolicy {
  price(entry: Date, exit: Date, vehicle: Vehicle): number;     // cents
}

class HourlyPricing implements PricingPolicy {
  constructor(private readonly centsPerHour: Record<VehicleType, number>) {}
  price(entry: Date, exit: Date, v: Vehicle): number {
    const hours = Math.max(1, Math.ceil((exit.getTime() - entry.getTime()) / 3_600_000));
    return hours * this.centsPerHour[v.type];
  }
}

class Spot {
  private occupiedBy: Vehicle | null = null;
  constructor(readonly id: string, readonly accepts: VehicleType[]) {}
  canFit(v: Vehicle) { return this.occupiedBy === null && this.accepts.includes(v.type); }
  park(v: Vehicle) { if (!this.canFit(v)) throw new Error("spot unavailable"); this.occupiedBy = v; }
  free() { this.occupiedBy = null; }
}

class Ticket {
  constructor(readonly id: string, readonly vehicle: Vehicle, readonly spot: Spot, readonly entry: Date) {}
}

class ParkingLot {
  private tickets = new Map<string, Ticket>();
  constructor(private readonly spots: Spot[], private readonly pricing: PricingPolicy,
              private readonly clock: () => Date = () => new Date()) {}

  enter(v: Vehicle): Ticket {
    const spot = this.spots.find((s) => s.canFit(v));
    if (!spot) throw new Error("lot full");                      // explicit error case
    spot.park(v);
    const t = new Ticket(crypto.randomUUID(), v, spot, this.clock());
    this.tickets.set(t.id, t);
    return t;
  }

  leave(ticketId: string): number {
    const t = this.tickets.get(ticketId);
    if (!t) throw new Error("invalid ticket");
    const amount = this.pricing.price(t.entry, this.clock(), t.vehicle);
    t.spot.free();
    this.tickets.delete(ticketId);
    return amount;
  }
}`),
      p(["Repare nas decisões: a política de preço e o relógio são **injetados** (testável sem esperar uma hora), os casos de erro são tratados (lotado, ticket inválido), valores são inteiros em centavos e cada classe tem uma responsabilidade clara. Uma versão ingênua faria `ParkingLot` calcular preço com um `if` por tipo de veículo e dependeria de `new Date()` diretamente.", "Note the decisions: pricing policy and clock are **injected** (testable without waiting an hour), error cases are handled (full, invalid ticket), values are integers in cents and each class has a clear responsibility. A naive version would make `ParkingLot` compute price with an `if` per vehicle type and depend on `new Date()` directly."]),
      h(["Etapa 6: extensibilidade e concorrência", "Step 6: extensibility and concurrency"]),
      p(["O entrevistador vai propor uma mudança: “e se houver vagas para veículos elétricos com carregador?”, “e se a tarifa for diferente no fim de semana?”. Mostre que cada uma **vira uma classe ou uma configuração nova, não uma reescrita**: uma nova `Spot` com `accepts: [“electric”]` e um `VehicleType` a mais; uma nova `PricingPolicy` (por exemplo, `WeekendPricing`, ou um decorador que muda o valor). Essa é a essência do princípio aberto-fechado: aberto para extensão, fechado para modificação.", "The interviewer will propose a change: “what if there are spots for electric vehicles with chargers?”, “what if the rate differs on weekends?”. Show that each one **becomes a new class or configuration, not a rewrite**: a new `Spot` with `accepts: [\"electric\"]` and one more `VehicleType`; a new `PricingPolicy` (for example `WeekendPricing`, or a decorator that changes the amount). That is the essence of the open-closed principle: open for extension, closed for modification."]),
      p(["**Concorrência** merece uma frase: dois portões podem tentar ocupar a mesma vaga ao mesmo tempo. Em um processo único, protejo `findAndPark` com um bloqueio (ou uma fila por andar); com banco de dados, uso uma atualização condicional (`UPDATE spots SET occupied = true WHERE id = ? AND occupied = false`) e verifico quantas linhas mudaram. Não transforme o problema em outro: mencione e siga.", "**Concurrency** deserves a sentence: two gates may try to occupy the same spot at once. In a single process, I protect `findAndPark` with a lock (or a queue per floor); with a database, I use a conditional update (`UPDATE spots SET occupied = true WHERE id = ? AND occupied = false`) and check how many rows changed. Do not turn the problem into another one: mention it and move on."]),
      h(["Dicas que fazem diferença", "Tips that make a difference"]),
      ul(
        ["Comece por um modelo pequeno que funcione e evolua. Um desenho completo que não termina a tempo é pior que um simples correto.", "Start with a small working model and evolve it. A complete design that does not finish in time is worse than a simple correct one."],
        ["Dê às classes uma responsabilidade que você consiga dizer em uma frase.", "Give each class a responsibility you can state in one sentence."],
        ["Prefira interfaces e composição à herança profunda. Injete dependências para tornar o código testável.", "Prefer interfaces and composition over deep inheritance. Inject dependencies to make the code testable."],
        ["Trate os casos de erro: vaga cheia, pagamento recusado, entrada inválida. Eles mostram maturidade.", "Handle error cases: lot full, payment declined, invalid input. They show maturity."],
        ["Escreva a assinatura pública antes do corpo e nomeie bem: bons nomes são metade do design.", "Write the public signature before the body and name things well: good names are half the design."],
        ["Pense em voz alta sobre o que **não** vai modelar e por quê.", "Think aloud about what you will **not** model and why."],
      ),
      h(["Problemas clássicos para treinar", "Classic problems to practice"]),
      ul(
        ["**Elevador**: estados (parado, subindo, descendo), fila de pedidos e uma estratégia de despacho.", "**Elevator**: states (idle, up, down), a request queue and a dispatch strategy."],
        ["**Jogo de xadrez ou de damas**: `Piece` com movimentos por tipo (polimorfismo), `Board`, validação de jogadas e histórico (Command).", "**Chess or checkers**: `Piece` with moves per type (polymorphism), `Board`, move validation and history (Command)."],
        ["**Máquina de venda**: máquina de estados (sem dinheiro, com dinheiro, dispensando) e inventário.", "**Vending machine**: state machine (no money, has money, dispensing) and inventory."],
        ["**Biblioteca ou locadora**: livros, exemplares, sócios, empréstimos, multas e regras de renovação.", "**Library or rental**: books, copies, members, loans, fines and renewal rules."],
        ["**Reservas (hotel, cinema)**: disponibilidade por período, conflito de reservas e cancelamento.", "**Bookings (hotel, cinema)**: availability per period, booking conflicts and cancellation."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Esclareça, ache as entidades, defina responsabilidades e só depois escreva código.", "Clarify, find the entities, define responsibilities and only then write code."],
        ["Use padrões pelo problema que resolvem; prefira composição e injeção de dependência.", "Use patterns for the problem they solve; prefer composition and dependency injection."],
        ["Implemente o fluxo principal com casos de erro tratados.", "Implement the main flow with error cases handled."],
        ["Prove a extensibilidade mostrando que uma mudança vira uma classe nova.", "Prove extensibility by showing that a change becomes a new class."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Preciso desenhar UML completo?** Não. Um diagrama de classes enxuto com nomes, relações e métodos principais basta.", "**Do I need to draw full UML?** No. A lean class diagram with names, relationships and main methods is enough."],
        ["**Qual linguagem usar?** A que você domina e que a vaga aceita; o que importa é a modelagem, não a sintaxe.", "**Which language to use?** The one you master and the role accepts; modeling matters, not syntax."],
        ["**Devo usar todos os princípios SOLID?** Use os que o problema pede e cite-os com o motivo. Forçar todos soa decorado.", "**Should I use all SOLID principles?** Use the ones the problem asks for and cite them with the reason. Forcing all sounds memorized."],
        ["**E se eu não terminar o código?** Termine o fluxo principal e descreva o resto em pseudocódigo. Um modelo correto e incompleto vale mais que um completo e errado.", "**What if I do not finish the code?** Finish the main flow and describe the rest in pseudocode. A correct incomplete model is worth more than a complete wrong one."],
      ),
      tip(["Comente concorrência quando fizer sentido (duas pessoas pegando o mesmo recurso), mas não transforme o problema em outro: uma frase sobre bloqueio ou atualização condicional costuma bastar.", "Mention concurrency when relevant (two people grabbing the same resource), but do not turn the problem into another one: a sentence about locking or conditional update is usually enough."]),
    ] },
];

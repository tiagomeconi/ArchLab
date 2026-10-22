import { h, p, ul, tip, code, table, fig, node, edge, type DocArticle } from "./kit";

/** Seção "distribuidos". */
export const ARTICLES: DocArticle[] = [
  { id: "introducao-a-sistemas-distribuidos", section: "distribuidos", level: 2, icon: "hub", minutes: 14,
    title: ["Introdução a sistemas distribuídos", "Introduction to distributed systems"],
    summary: ["Características, as oito falácias, falhas parciais, relógios físicos e lógicos, ordem dos eventos e modelos de falha.", "Characteristics, the eight fallacies, partial failures, physical and logical clocks, event ordering and failure models."],
    body: [
      p(["Um **sistema distribuído** é um conjunto de computadores independentes que se comunicam pela rede e, para o usuário, parecem um só sistema. Usamos essa arquitetura por três razões: um computador não basta para a carga (capacidade), um computador cai (disponibilidade) e os usuários estão espalhados pelo mundo (latência). O preço é um problema novo: **coisas dão errado no meio do caminho e ninguém sabe ao certo o que aconteceu**. Quase tudo o que se estuda nesta seção (consenso, resiliência, transações, rastreamento) é uma resposta a essa incerteza.", "A **distributed system** is a set of independent computers that communicate over a network and, to the user, look like a single system. We use this architecture for three reasons: one computer is not enough for the load (capacity), one computer fails (availability) and users are spread around the world (latency). The price is a new kind of problem: **things go wrong along the way and nobody knows for sure what happened**. Almost everything studied in this section (consensus, resilience, transactions, tracing) is an answer to that uncertainty."]),
      h(["Características de um sistema distribuído", "Characteristics of a distributed system"]),
      ul(
        ["**Concorrência.** Vários componentes executam ao mesmo tempo e disputam recursos compartilhados, como uma linha do banco ou um arquivo.", "**Concurrency.** Several components run at the same time and compete for shared resources, such as a database row or a file."],
        ["**Ausência de relógio global.** Cada máquina tem seu próprio relógio, com desvios diferentes. Não existe um 'agora' único que todos enxerguem.", "**No global clock.** Each machine has its own clock, with different drift. There is no single 'now' that everyone sees."],
        ["**Falhas independentes.** Uma máquina, um disco, um cabo ou um processo pode falhar sem que os outros percebam na hora.", "**Independent failures.** A machine, a disk, a cable or a process can fail without the others noticing right away."],
        ["**Comunicação por mensagens.** Não há memória compartilhada: tudo o que um nó sabe do outro chegou por uma mensagem que pode atrasar, duplicar, reordenar ou se perder.", "**Message-based communication.** There is no shared memory: everything a node knows about another arrived in a message that can be delayed, duplicated, reordered or lost."],
        ["**Heterogeneidade e crescimento.** Há linguagens, versões, sistemas operacionais e hardware diferentes, e o conjunto muda enquanto roda.", "**Heterogeneity and growth.** There are different languages, versions, operating systems and hardware, and the set changes while it runs."],
      ),
      h(["As oito falácias da computação distribuída", "The eight fallacies of distributed computing"]),
      p(["Peter Deutsch e colegas da Sun Microsystems listaram suposições falsas que todo iniciante faz. Cada uma gera um bug característico:", "Peter Deutsch and colleagues at Sun Microsystems listed false assumptions that every newcomer makes. Each one produces a characteristic bug:"]),
      table([["Falácia", "Fallacy"], ["A realidade", "The reality"], ["Consequência no projeto", "Design consequence"]],
        [["A rede é confiável", "The network is reliable"], ["Pacotes se perdem, conexões caem, switches reiniciam.", "Packets get lost, connections drop, switches reboot."], ["Timeouts, retentativas e operações idempotentes.", "Timeouts, retries and idempotent operations."]],
        [["A latência é zero", "Latency is zero"], ["Cerca de 0,5 ms no mesmo datacenter e 100 a 200 ms entre continentes.", "About 0.5 ms inside a datacenter and 100 to 200 ms across continents."], ["Menos chamadas em cadeia, cache, processamento em lote.", "Fewer chained calls, caching, batching."]],
        [["A largura de banda é infinita", "Bandwidth is infinite"], ["O enlace tem teto e é compartilhado.", "The link has a ceiling and is shared."], ["Compressão, paginação, enviar só o necessário.", "Compression, pagination, sending only what is needed."]],
        [["A rede é segura", "The network is secure"], ["Tráfego interno também é interceptável.", "Internal traffic can be intercepted too."], ["TLS em todo lugar, autenticação entre serviços.", "TLS everywhere, service-to-service authentication."]],
        [["A topologia não muda", "Topology does not change"], ["Instâncias sobem, descem e mudam de endereço.", "Instances come, go and change address."], ["Descoberta de serviços, DNS com TTL curto, sem IP fixo.", "Service discovery, short-TTL DNS, no hardcoded IPs."]],
        [["Existe um só administrador", "There is one administrator"], ["Vários times e empresas operam partes diferentes.", "Several teams and companies run different parts."], ["Contratos de API, versionamento, observabilidade comum.", "API contracts, versioning, shared observability."]],
        [["O custo de transporte é zero", "Transport cost is zero"], ["Serializar e mover dados gasta CPU e dinheiro; tráfego entre zonas é cobrado.", "Serializing and moving data costs CPU and money; cross-zone traffic is billed."], ["Formatos compactos, localidade dos dados.", "Compact formats, data locality."]],
        [["A rede é homogênea", "The network is homogeneous"], ["Versões, protocolos e equipamentos variam.", "Versions, protocols and equipment vary."], ["Padrões abertos e tolerância a versões diferentes.", "Open standards and tolerance of mixed versions."]],
      ),
      h(["Falhas parciais e a incerteza do timeout", "Partial failures and timeout uncertainty"]),
      p(["Num programa único, ou tudo funciona ou tudo cai. Num distribuído, **parte** funciona. Você envia um pedido de pagamento e recebe um timeout. O pagamento foi feito? Há três possibilidades: a requisição nunca chegou, chegou e foi processada mas a resposta se perdeu, ou o serviço está apenas lento. Do seu lado, as três parecem idênticas. Por isso as operações precisam ser **idempotentes** e deve ser possível consultar o estado depois ('qual o status do pagamento X?').", "In a single program, either everything works or everything crashes. In a distributed one, **part** of it works. You send a payment request and get a timeout. Was the payment made? There are three possibilities: the request never arrived, it arrived and was processed but the response was lost, or the service is just slow. From your side all three look identical. That is why operations must be **idempotent** and it must be possible to query the state afterwards ('what is the status of payment X?')."]),
      fig(["Três histórias que parecem iguais para o cliente", "Three stories that look the same to the client"],
        [[node("c", "Client", "client")], [node("n", "Network", "edge")], [node("s", "Service", "service")], [node("d", "DB", "data")]],
        [edge("c", "n", ["1. pedido", "1. request"]), edge("n", "s", ["2. pode se perder", "2. may be lost"], { dashed: true }), edge("s", "d", ["3. grava", "3. writes"]), edge("d", "c", ["4. resposta pode se perder", "4. reply may be lost"], { dashed: true })]),
      p(["Esse é o ponto central: em sistemas distribuídos, **um nó lento é indistinguível de um nó morto**. Detectores de falha usam batimentos (*heartbeats*) e prazos, e sempre erram de vez em quando, seja declarando morto um nó vivo, seja demorando para notar um morto.", "This is the central point: in distributed systems, **a slow node is indistinguishable from a dead one**. Failure detectors use heartbeats and deadlines, and they are always wrong now and then, either declaring a live node dead or taking too long to notice a dead one."]),
      h(["Relógios físicos e o problema do tempo", "Physical clocks and the problem of time"]),
      p(["Cada computador mede o tempo com um oscilador de quartzo que adianta ou atrasa alguns milissegundos por dia (*clock drift*). O **NTP** sincroniza o relógio local com servidores de referência, mas a precisão típica na internet é de alguns a dezenas de milissegundos, e correções podem fazer o relógio **andar para trás**. Duas consequências práticas: nunca meça duração com o relógio de parede (use o relógio monotônico do sistema) e nunca use o horário de duas máquinas para decidir qual evento veio primeiro.", "Each computer measures time with a quartz oscillator that gains or loses a few milliseconds per day (*clock drift*). **NTP** synchronizes the local clock with reference servers, but typical precision over the internet is a few to tens of milliseconds, and corrections can make the clock **go backwards**. Two practical consequences: never measure a duration with the wall clock (use the system's monotonic clock) and never use the timestamps of two machines to decide which event came first."]),
      p(["O Google Spanner enfrenta isso com o **TrueTime**: relógios atômicos e GPS em cada datacenter e uma API que devolve não um instante, mas um **intervalo** `[earliest, latest]` que garante conter o tempo real. Para confirmar uma transação, o Spanner espera a incerteza passar (*commit wait*), e assim consegue ordenar transações globalmente. É a prova de que tempo confiável é possível, mas custa hardware e espera.", "Google Spanner deals with this using **TrueTime**: atomic clocks and GPS receivers in each datacenter and an API that returns not an instant but an **interval** `[earliest, latest]` guaranteed to contain real time. To commit a transaction, Spanner waits for the uncertainty to pass (*commit wait*), which lets it order transactions globally. It shows reliable time is possible, but it costs hardware and waiting."]),
      h(["Relógios lógicos: ordenar sem relógio", "Logical clocks: ordering without a clock"]),
      p(["Em 1978, Leslie Lamport observou que, para muitos problemas, não precisamos saber *quando* algo aconteceu, só **o que veio antes do quê**. Definiu a relação **aconteceu-antes** (*happened-before*, `a → b`): vale se a e b ocorrem no mesmo processo com a antes de b, se a é o envio de uma mensagem e b o seu recebimento, ou por transitividade. Eventos sem essa relação são **concorrentes**.", "In 1978, Leslie Lamport observed that for many problems we do not need to know *when* something happened, only **what came before what**. He defined the **happened-before** relation (`a → b`): it holds if a and b occur in the same process with a first, if a is the sending of a message and b its receipt, or by transitivity. Events without this relation are **concurrent**."]),
      p(["O **relógio de Lamport** é um contador inteiro por processo. A cada evento local, incrementa. Ao enviar, anexa o contador à mensagem. Ao receber, faz `contador = max(contador, recebido) + 1`. Garante que, se `a → b`, então `L(a) < L(b)`. A volta não vale: `L(a) < L(b)` não prova que a veio antes de b, pode ser concorrência.", "The **Lamport clock** is an integer counter per process. On each local event, it increments. When sending, it attaches the counter to the message. On receiving, it does `counter = max(counter, received) + 1`. It guarantees that if `a → b`, then `L(a) < L(b)`. The converse does not hold: `L(a) < L(b)` does not prove a came before b, it may be concurrency."]),
      p(["Os **vector clocks** corrigem isso. Cada processo mantém um vetor com um contador por processo. Comparando dois vetores, descobrimos se um evento precede o outro ou se são concorrentes (nenhum vetor domina o outro). Bancos como o Dynamo original usaram vetores para detectar escritas conflitantes e devolver as duas versões ao cliente para reconciliação. O custo é o tamanho do vetor, que cresce com o número de participantes.", "**Vector clocks** fix this. Each process keeps a vector with one counter per process. By comparing two vectors we can tell whether one event precedes the other or whether they are concurrent (neither vector dominates). Databases such as the original Dynamo used vectors to detect conflicting writes and hand both versions to the client for reconciliation. The cost is the vector size, which grows with the number of participants."]),
      code(`# vector clocks, 3 processes (A, B, C)
A: a1=[1,0,0] ---msg---------------> 
B:                    b1=[1,1,0] (receive: max + own tick)
C: c1=[0,0,1]                       (concurrent with a1 and b1)

compare([1,1,0], [0,0,1]) -> concurrent (neither dominates)
compare([1,0,0], [1,1,0]) -> before     (all <=, one <)`),
      table([["Relógio", "Clock"], ["Garante", "Guarantees"], ["Detecta concorrência", "Detects concurrency"], ["Custo", "Cost"]],
        [["Físico (NTP)", "Physical (NTP)"], ["Hora aproximada", "Approximate time"], ["Não", "No"], ["Baixo", "Low"]],
        [["TrueTime", "TrueTime"], ["Intervalo de incerteza limitado", "Bounded uncertainty interval"], ["Sim, com espera", "Yes, with waiting"], ["Hardware e espera no commit", "Hardware and commit wait"]],
        [["Lamport", "Lamport"], ["Ordem consistente com causalidade", "Order consistent with causality"], ["Não", "No"], ["Um inteiro", "One integer"]],
        [["Vector clock", "Vector clock"], ["Causalidade exata", "Exact causality"], ["Sim", "Yes"], ["Um contador por participante", "One counter per participant"]],
      ),
      h(["Modelos de falha", "Failure models"]),
      p(["Antes de projetar um algoritmo, definimos **que tipo de falha** ele tolera. Quanto mais cruel o modelo, mais caro o algoritmo.", "Before designing an algorithm we define **what kind of failure** it tolerates. The crueler the model, the more expensive the algorithm."]),
      ul(
        ["**Crash-stop:** o nó para e nunca volta. É o modelo mais simples, e raro na prática.", "**Crash-stop:** the node stops and never returns. It is the simplest model, and rare in practice."],
        ["**Crash-recovery:** o nó para e pode voltar, com ou sem memória do que tinha (por isso o disco e o log importam). É o modelo realista que Raft e Paxos assumem.", "**Crash-recovery:** the node stops and may return, with or without memory of what it had (which is why disk and log matter). It is the realistic model Raft and Paxos assume."],
        ["**Omissão:** o nó funciona, mas deixa de enviar ou receber algumas mensagens.", "**Omission:** the node works, but fails to send or receive some messages."],
        ["**Temporização:** o nó responde, mas fora do prazo esperado.", "**Timing:** the node responds, but outside the expected deadline."],
        ["**Bizantina:** o nó se comporta de forma arbitrária ou maliciosa, inclusive mentindo. Exige algoritmos específicos (BFT) e 3f+1 nós para tolerar f traidores.", "**Byzantine:** the node behaves arbitrarily or maliciously, including lying. It requires specific algorithms (BFT) and 3f+1 nodes to tolerate f traitors."],
      ),
      p(["Também se descreve o modelo de **rede**: síncrona (atrasos têm limite conhecido), assíncrona (sem limite algum) ou parcialmente síncrona (limites existem, mas só são válidos depois de um tempo desconhecido). A maioria dos sistemas reais é modelada como parcialmente síncrona, e é nela que os algoritmos de consenso funcionam bem.", "The **network** model is also described: synchronous (delays have a known bound), asynchronous (no bound at all) or partially synchronous (bounds exist, but only hold after an unknown time). Most real systems are modeled as partially synchronous, and that is where consensus algorithms work well."]),
      h(["Vantagens, desvantagens e quando usar", "Pros, cons and when to use"]),
      ul(
        ["**Vantagens:** escala horizontal, tolerância a falhas, latência menor perto do usuário, isolamento entre equipes.", "**Advantages:** horizontal scaling, fault tolerance, lower latency near users, isolation between teams."],
        ["**Desvantagens:** complexidade operacional, depuração difícil, consistência mais fraca ou mais cara, mais pontos de falha, custo de rede.", "**Disadvantages:** operational complexity, hard debugging, weaker or costlier consistency, more points of failure, network cost."],
        ["**Quando evitar:** se uma máquina grande com réplica resolve, a distribuição só adiciona problemas. Distribua quando houver uma razão mensurável (carga, disponibilidade, geografia, autonomia de equipes).", "**When to avoid:** if one big machine with a replica solves it, distribution only adds problems. Distribute when there is a measurable reason (load, availability, geography, team autonomy)."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Tratar uma chamada de rede como chamada de função local, sem timeout e sem plano para falha.", "Treating a network call as a local function call, with no timeout and no failure plan."],
        ["Usar `Date.now()` de máquinas diferentes para ordenar eventos ou resolver conflitos (o 'last write wins' por relógio perde dados).", "Using `Date.now()` from different machines to order events or resolve conflicts (clock-based 'last write wins' loses data)."],
        ["Assumir que uma mensagem chega exatamente uma vez. O realista é *pelo menos uma vez* com consumidores idempotentes.", "Assuming a message arrives exactly once. The realistic choice is *at least once* with idempotent consumers."],
        ["Criar uma cadeia longa de chamadas síncronas: a disponibilidade total é o produto das individuais (cinco serviços de 99,9% dão cerca de 99,5%).", "Building a long chain of synchronous calls: total availability is the product of the individual ones (five 99.9% services give about 99.5%)."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Sistemas distribuídos trocam simplicidade por capacidade, disponibilidade e latência.", "Distributed systems trade simplicity for capacity, availability and latency."],
        ["As oito falácias descrevem o que não se pode assumir sobre a rede.", "The eight fallacies describe what cannot be assumed about the network."],
        ["Falhas são parciais e um timeout é ambíguo; use idempotência.", "Failures are partial and a timeout is ambiguous; use idempotency."],
        ["Relógios físicos divergem; Lamport e vector clocks ordenam por causalidade.", "Physical clocks diverge; Lamport and vector clocks order by causality."],
        ["O modelo de falha (crash, omissão, bizantina) define o custo do algoritmo.", "The failure model (crash, omission, Byzantine) defines the cost of the algorithm."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Microsserviços são sistemas distribuídos?** Sim. No momento em que a chamada cruza a rede, todas as falácias passam a valer.", "**Are microservices distributed systems?** Yes. The moment a call crosses the network, all the fallacies apply."],
        ["**Por que não usar o horário para ordenar eventos?** Porque os relógios divergem e podem voltar; só a causalidade (Lamport, vetores) é confiável sem hardware especial.", "**Why not use time to order events?** Because clocks diverge and can go backwards; only causality (Lamport, vectors) is reliable without special hardware."],
        ["**Um banco com réplica já é distribuído?** É, e herda os problemas de atraso de replicação e de failover.", "**Is a database with a replica already distributed?** Yes, and it inherits replication lag and failover problems."],
        ["**Qual o menor modelo realista de falha?** Crash-recovery com rede parcialmente síncrona.", "**What is the smallest realistic failure model?** Crash-recovery with a partially synchronous network."],
      ),
      tip(["Regra prática: escreva toda chamada remota perguntando 'e se isto atrasar? e se falhar depois de ter funcionado? e se for repetido?'.", "Rule of thumb: write every remote call asking 'what if this is slow? what if it fails after having worked? what if it is repeated?'."]),
    ] },
  { id: "algoritmos-de-consenso", section: "distribuidos", level: 2, icon: "how_to_vote", minutes: 14,
    title: ["Algoritmos de consenso", "Consensus algorithms"],
    summary: ["Paxos, Raft em detalhe, ZAB, quórum, split brain, tolerância bizantina e eleição de líder em aplicações.", "Paxos, Raft in detail, ZAB, quorum, split brain, Byzantine tolerance and leader election in applications."],
    body: [
      p(["**Consenso** é o problema de fazer vários nós concordarem num único valor, mesmo que alguns falhem e mensagens atrasem. Parece simples, mas está por trás de coisas muito práticas: eleger o líder de um banco, decidir a ordem de gravações num log replicado, guardar configuração que todos precisam enxergar igual, manter um bloqueio distribuído. Sem consenso, dois nós podem achar que são o líder ao mesmo tempo e corromper os dados.", "**Consensus** is the problem of making several nodes agree on a single value, even if some fail and messages are delayed. It sounds simple, but it sits behind very practical things: electing a database leader, deciding the order of writes in a replicated log, storing configuration everyone must see identically, holding a distributed lock. Without consensus, two nodes may believe they are the leader at once and corrupt data."]),
      h(["O que um algoritmo de consenso garante", "What a consensus algorithm guarantees"]),
      ul(
        ["**Acordo (agreement):** nenhum par de nós decide valores diferentes.", "**Agreement:** no two nodes decide different values."],
        ["**Validade:** o valor decidido foi proposto por alguém (não é inventado).", "**Validity:** the decided value was proposed by someone (it is not made up)."],
        ["**Terminação (liveness):** se a rede se comportar por tempo suficiente e uma maioria estiver viva, uma decisão sai.", "**Termination (liveness):** if the network behaves long enough and a majority is alive, a decision is reached."],
      ),
      p(["O resultado **FLP** (Fischer, Lynch e Paterson, 1985) mostra que, numa rede totalmente assíncrona, nenhum algoritmo determinístico garante terminar se até um único nó puder falhar. Não é uma sentença de morte: Paxos e Raft sempre preservam a *segurança* (nunca decidem errado) e sacrificam a *vivacidade* apenas em períodos de instabilidade, usando temporizadores aleatórios para sair de impasses na prática.", "The **FLP** result (Fischer, Lynch and Paterson, 1985) shows that in a fully asynchronous network no deterministic algorithm can guarantee termination if even a single node may fail. It is not a death sentence: Paxos and Raft always preserve *safety* (they never decide wrongly) and sacrifice *liveness* only during instability, using randomized timers to break deadlocks in practice."]),
      h(["Quórum: por que a maioria", "Quorum: why a majority"]),
      p(["A ideia central é o **quórum**: uma decisão só vale se uma **maioria** de nós a aceitou. Duas maiorias de um mesmo grupo sempre têm pelo menos um nó em comum, e é esse nó que impede que dois líderes tomem decisões contraditórias. Com N nós, a maioria é `floor(N/2) + 1` e o cluster tolera `floor((N-1)/2)` falhas. Por isso se usam números **ímpares**: 5 nós toleram 2 falhas; 6 nós também toleram só 2, gastando mais.", "The central idea is the **quorum**: a decision only counts if a **majority** of nodes accepted it. Two majorities of the same group always share at least one node, and that node prevents two leaders from making contradictory decisions. With N nodes the majority is `floor(N/2) + 1` and the cluster tolerates `floor((N-1)/2)` failures. That is why **odd** numbers are used: 5 nodes tolerate 2 failures; 6 nodes also tolerate only 2, costing more."]),
      table([["Nós (N)", "Nodes (N)"], ["Quórum", "Quorum"], ["Falhas toleradas", "Failures tolerated"]],
        [["3", "3"], ["2", "2"], ["1", "1"]],
        [["4", "4"], ["3", "3"], ["1", "1"]],
        [["5", "5"], ["3", "3"], ["2", "2"]],
        [["7", "7"], ["4", "4"], ["3", "3"]],
      ),
      p(["O **split brain** acontece quando uma partição de rede divide o cluster e os dois lados continuam aceitando escritas. Com quórum, só o lado que tem a maioria segue operando; o lado minoritário para de aceitar escritas (sacrifica disponibilidade para preservar consistência, a escolha CP do teorema CAP). Em 5 nós divididos em 3 e 2, o grupo de 3 continua e o de 2 fica parado até a rede voltar.", "**Split brain** happens when a network partition divides the cluster and both sides keep accepting writes. With a quorum, only the side that holds the majority keeps operating; the minority side stops accepting writes (it sacrifices availability to preserve consistency, the CP choice of the CAP theorem). With 5 nodes split 3 and 2, the group of 3 continues and the group of 2 stalls until the network heals."]),
      h(["Paxos básico", "Basic Paxos"]),
      p(["Paxos, de Leslie Lamport, é o algoritmo clássico, famoso por ser difícil de entender e de implementar. O Paxos básico decide **um único valor** e tem três papéis, que na prática um mesmo nó acumula: *proposers* (propõem), *acceptors* (votam) e *learners* (aprendem o resultado). Funciona em duas fases:", "Paxos, by Leslie Lamport, is the classic algorithm, famous for being hard to understand and implement. Basic Paxos decides **one single value** and has three roles, which in practice one node plays together: *proposers* (propose), *acceptors* (vote) and *learners* (learn the outcome). It works in two phases:"]),
      ul(
        ["**Fase 1 (prepare/promise):** o proposer escolhe um número de proposta `n` único e crescente e envia `prepare(n)` aos acceptors. Cada acceptor que ainda não prometeu um número maior responde `promise(n)` e informa o valor mais recente que já aceitou, se houver.", "**Phase 1 (prepare/promise):** the proposer picks a unique, increasing proposal number `n` and sends `prepare(n)` to the acceptors. Each acceptor that has not promised a higher number replies `promise(n)` and reports the latest value it has already accepted, if any."],
        ["**Fase 2 (accept/accepted):** com promessas de uma maioria, o proposer envia `accept(n, v)`. O valor `v` é obrigatoriamente o do maior número já aceito reportado, ou um valor livre se ninguém aceitou nada. Os acceptors aceitam se não prometeram um número maior.", "**Phase 2 (accept/accepted):** with promises from a majority, the proposer sends `accept(n, v)`. The value `v` must be the one with the highest accepted number reported, or a free value if nobody accepted anything. Acceptors accept it if they have not promised a higher number."],
        ["Quando uma maioria aceitou, o valor está **escolhido** e os learners são avisados.", "When a majority has accepted, the value is **chosen** and learners are told."],
      ),
      p(["Dois proposers concorrentes podem se atropelar indefinidamente (*duelling proposers*), por isso na prática elege-se um líder que propõe sozinho. O **Multi-Paxos** reaproveita a fase 1 para uma sequência de valores, formando um log replicado. O Google Chubby e o Spanner usam variações de Paxos.", "Two concurrent proposers can keep trampling each other (*duelling proposers*), so in practice a leader is elected to propose alone. **Multi-Paxos** reuses phase 1 for a sequence of values, forming a replicated log. Google's Chubby and Spanner use Paxos variants."]),
      h(["Raft em detalhe", "Raft in detail"]),
      p(["Raft (Ongaro e Ousterhout, 2014) foi desenhado para ser **compreensível** e equivale em garantias ao Multi-Paxos. Divide o problema em três partes: eleição de líder, replicação do log e segurança. Cada nó está em um de três estados: **seguidor** (follower), **candidato** ou **líder**. O tempo é dividido em **termos** numerados, que funcionam como relógio lógico: cada termo tem no máximo um líder.", "Raft (Ongaro and Ousterhout, 2014) was designed to be **understandable** and is equivalent in guarantees to Multi-Paxos. It splits the problem into three parts: leader election, log replication and safety. Each node is in one of three states: **follower**, **candidate** or **leader**. Time is divided into numbered **terms**, which act as a logical clock: each term has at most one leader."]),
      fig(["Estados de um nó Raft", "States of a Raft node"],
        [[node("f", ["Seguidor", "Follower"], "service")], [node("c", ["Candidato", "Candidate"], "queue")], [node("l", ["Líder", "Leader"], "edge")]],
        [edge("f", "c", ["sem heartbeat: timeout", "no heartbeat: timeout"]), edge("c", "l", ["recebeu maioria", "got majority"]), edge("c", "f", ["outro líder ou termo maior", "other leader or higher term"], { dashed: true }), edge("l", "f", ["vê termo maior", "sees higher term"], { dashed: true })]),
      h(["Raft: eleição de líder", "Raft: leader election"]),
      p(["O líder envia **heartbeats** periódicos (mensagens `AppendEntries` vazias). Cada seguidor tem um **timeout de eleição** aleatório, tipicamente entre 150 e 300 ms. Se nenhum heartbeat chegar nesse prazo, o seguidor incrementa o termo, vota em si mesmo, vira candidato e envia `RequestVote` aos demais. Cada nó vota em **no máximo um candidato por termo**, por ordem de chegada, e só vota em quem tem um log pelo menos tão atualizado quanto o seu. O candidato que reunir votos de uma maioria vira líder e envia heartbeats para impor autoridade.", "The leader sends periodic **heartbeats** (empty `AppendEntries` messages). Each follower has a randomized **election timeout**, typically between 150 and 300 ms. If no heartbeat arrives in that window, the follower increments the term, votes for itself, becomes a candidate and sends `RequestVote` to the others. Each node votes for **at most one candidate per term**, first come first served, and only for a candidate whose log is at least as up to date as its own. The candidate that gathers votes from a majority becomes leader and sends heartbeats to assert authority."]),
      p(["Se dois candidatos empatam e ninguém tem maioria, o termo termina sem líder e os timeouts aleatórios fazem um deles tentar de novo antes do outro, resolvendo o impasse. Um nó que vê uma mensagem com termo maior que o seu atualiza o termo e volta a seguidor: isso derruba líderes antigos que reaparecem depois de uma partição.", "If two candidates tie and nobody has a majority, the term ends without a leader and the random timeouts make one of them retry before the other, resolving the deadlock. A node that sees a message with a term higher than its own updates its term and reverts to follower: this deposes old leaders that reappear after a partition."]),
      h(["Raft: replicação do log e commit", "Raft: log replication and commit"]),
      p(["Todas as escritas passam pelo líder. O fluxo de um comando:", "All writes go through the leader. The flow of one command:"]),
      fig(["Replicação de uma entrada do log", "Replication of a log entry"],
        [[node("cl", "Client", "client")], [node("ld", "Leader", "edge")], [node("f1", "Follower 1", "service"), node("f2", "Follower 2", "service")], [node("sm", ["State machine", "State machine"], "data")]],
        [edge("cl", "ld", ["1. comando", "1. command"]), edge("ld", "f1", ["2. AppendEntries", "2. AppendEntries"]), edge("ld", "f2", ["2. AppendEntries", "2. AppendEntries"]), edge("f1", "sm", ["4. aplica", "4. apply"], { dashed: true }), edge("ld", "sm", ["3. commit + aplica", "3. commit + apply"])]),
      ul(
        ["O líder anexa o comando ao próprio log como uma nova entrada `(termo, índice, comando)`.", "The leader appends the command to its own log as a new entry `(term, index, command)`."],
        ["Envia `AppendEntries` aos seguidores, com o índice e o termo da entrada anterior. O seguidor só aceita se tiver essa entrada anterior idêntica; do contrário recusa, e o líder recua e reenvia até achar o ponto em que os logs coincidem, sobrescrevendo o que divergir.", "It sends `AppendEntries` to followers, with the index and term of the previous entry. A follower only accepts if it has that identical previous entry; otherwise it refuses, and the leader backs up and resends until it finds the point where the logs match, overwriting whatever diverges."],
        ["Quando uma **maioria** gravou a entrada em disco, ela está **commitada**. O líder aplica o comando à máquina de estados e responde ao cliente.", "When a **majority** has written the entry to disk, it is **committed**. The leader applies the command to the state machine and replies to the client."],
        ["O líder informa o índice de commit nos próximos `AppendEntries` e os seguidores aplicam as entradas commitadas, na mesma ordem.", "The leader reports the commit index in the next `AppendEntries` and followers apply the committed entries, in the same order."],
      ),
      h(["Raft: garantias de segurança", "Raft: safety guarantees"]),
      ul(
        ["**Election safety:** no máximo um líder por termo.", "**Election safety:** at most one leader per term."],
        ["**Leader append-only:** um líder nunca apaga nem sobrescreve o próprio log.", "**Leader append-only:** a leader never deletes or overwrites its own log."],
        ["**Log matching:** se dois logs têm uma entrada com mesmo índice e termo, os logs são idênticos até ali.", "**Log matching:** if two logs have an entry with the same index and term, the logs are identical up to that point."],
        ["**Leader completeness:** toda entrada commitada em um termo aparece nos logs dos líderes de termos posteriores. A regra de voto (só votar em candidato com log atualizado) garante isso, pois qualquer maioria que commitou intersecta a maioria que elege.", "**Leader completeness:** every entry committed in a term appears in the logs of leaders of later terms. The voting rule (only vote for a candidate with an up-to-date log) guarantees it, since any majority that committed intersects the majority that elects."],
        ["**State machine safety:** nenhum nó aplica comandos diferentes no mesmo índice.", "**State machine safety:** no node applies different commands at the same index."],
      ),
      p(["Na prática, o Raft inclui ainda **snapshots** (para compactar o log), **mudança de membros** (com consenso conjunto, para trocar nós sem criar duas maiorias) e leituras linearizáveis (o líder confirma que ainda é líder, via *ReadIndex* ou lease, antes de responder).", "In practice Raft also includes **snapshots** (to compact the log), **membership changes** (using joint consensus, to swap nodes without creating two majorities) and linearizable reads (the leader confirms it is still the leader, via *ReadIndex* or a lease, before answering)."]),
      h(["ZAB, ZooKeeper, etcd e Consul", "ZAB, ZooKeeper, etcd and Consul"]),
      p(["O **ZAB** (ZooKeeper Atomic Broadcast) é o protocolo do Apache ZooKeeper. Também elege um líder e replica transações em ordem por maioria, mas prioriza a **ordem total das mudanças** e a recuperação de um líder novo sincronizando todos os seguidores antes de aceitar novas escritas. Na prática se parece com Raft e Multi-Paxos.", "**ZAB** (ZooKeeper Atomic Broadcast) is the protocol of Apache ZooKeeper. It also elects a leader and replicates transactions in order by majority, but prioritizes the **total order of changes** and, on a new leader, synchronizing all followers before accepting new writes. In practice it resembles Raft and Multi-Paxos."]),
      table([["Sistema", "System"], ["Consenso", "Consensus"], ["Usos típicos", "Typical uses"]],
        [["etcd", "etcd"], ["Raft", "Raft"], ["Dados do Kubernetes, configuração, locks", "Kubernetes data, configuration, locks"]],
        [["ZooKeeper", "ZooKeeper"], ["ZAB", "ZAB"], ["Coordenação, eleição de líder, metadados (Kafka antigo, HBase)", "Coordination, leader election, metadata (older Kafka, HBase)"]],
        [["Consul", "Consul"], ["Raft", "Raft"], ["Descoberta de serviços, configuração, health checks", "Service discovery, configuration, health checks"]],
        [["Spanner / Chubby", "Spanner / Chubby"], ["Paxos", "Paxos"], ["Replicação global, serviço de locks", "Global replication, lock service"]],
      ),
      p(["Esses sistemas guardam **pouco dado** (megabytes a poucos gigabytes) e servem de espinha dorsal de coordenação. Não os use como banco de dados geral: toda escrita passa por um único líder e por uma maioria, então a vazão é limitada.", "These systems hold **little data** (megabytes to a few gigabytes) and serve as the coordination backbone. Do not use them as a general database: every write goes through a single leader and a majority, so throughput is limited."]),
      h(["Tolerância a falhas bizantinas", "Byzantine fault tolerance"]),
      p(["Paxos e Raft assumem que nós **falham parando**, nunca mentem. Quando há nós maliciosos ou com defeito arbitrário, usa-se **BFT**, como o PBFT (Castro e Liskov, 1999). Para tolerar `f` nós bizantinos são necessários `3f + 1` nós e mais fases de troca de mensagens, o que custa caro em latência e em número de mensagens (quadrático). É pertinente em blockchains e sistemas entre organizações que não confiam entre si; dentro de uma empresa, com nós sob o mesmo controle, Raft basta.", "Paxos and Raft assume nodes **fail by stopping**, never by lying. When there are malicious or arbitrarily faulty nodes, **BFT** is used, such as PBFT (Castro and Liskov, 1999). To tolerate `f` Byzantine nodes you need `3f + 1` nodes and more rounds of messages, which is expensive in latency and message count (quadratic). It is relevant in blockchains and systems among organizations that do not trust each other; inside a company, with nodes under the same control, Raft is enough."]),
      h(["Eleição de líder em aplicações", "Leader election in applications"]),
      p(["Você raramente implementa consenso. O normal é **usá-lo** por meio de um serviço: vários processos da sua aplicação disputam um lock ou uma chave com lease no etcd, no ZooKeeper ou no Consul; quem conseguir é o líder (por exemplo, o único job agendador) e renova o lease periodicamente. Se morrer, o lease expira e outro assume. Um cuidado essencial é o **fencing**: um líder velho, pausado por GC ou por rede, pode acordar acreditando ainda ser líder. A solução é um **token de fencing** monotônico (o número do termo ou da revisão), que o recurso protegido valida, recusando tokens menores que o último visto.", "You rarely implement consensus. The usual way is to **use** it through a service: several processes of your application compete for a lock or a key with a lease in etcd, ZooKeeper or Consul; whoever wins is the leader (for example, the only scheduler job) and renews the lease periodically. If it dies, the lease expires and another takes over. An essential precaution is **fencing**: an old leader, paused by GC or by the network, can wake up still believing it is the leader. The fix is a monotonic **fencing token** (the term or revision number), which the protected resource validates, rejecting tokens lower than the last one seen."]),
      code(`# conceptual leader election with a lease (pseudocode)
lease = store.grant_lease(ttl = 10s)
ok = store.put_if_absent("/jobs/scheduler/leader", myId, lease)
if ok:
    token = store.revision_of("/jobs/scheduler/leader")   # fencing token
    while alive():
        store.keep_alive(lease)           # renew before ttl
        do_work(token)                    # the resource rejects stale tokens
else:
    watch("/jobs/scheduler/leader")       # wait for the leader's lease to expire`),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Rodar um cluster de consenso com número par de nós ou em uma só zona de disponibilidade.", "Running a consensus cluster with an even number of nodes or in a single availability zone."],
        ["Usar um lock com timeout sem fencing, achando que o dono nunca fica lento.", "Using a lock with a timeout and no fencing, assuming the owner never gets slow."],
        ["Colocar dados volumosos ou alta taxa de escrita no etcd ou no ZooKeeper.", "Putting bulky data or a high write rate in etcd or ZooKeeper."],
        ["Implementar o próprio Paxos ou Raft em produção em vez de usar uma biblioteca madura.", "Implementing your own Paxos or Raft in production instead of using a mature library."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Consenso faz nós concordarem em um valor com falhas; a segurança nunca é sacrificada.", "Consensus makes nodes agree on a value despite failures; safety is never sacrificed."],
        ["O quórum de maioria impede split brain; use número ímpar de nós.", "A majority quorum prevents split brain; use an odd number of nodes."],
        ["Paxos tem duas fases (prepare/accept); Raft divide em eleição, replicação e segurança, com termos e logs.", "Paxos has two phases (prepare/accept); Raft splits into election, replication and safety, with terms and logs."],
        ["etcd e Consul usam Raft, ZooKeeper usa ZAB; servem para coordenação, não como banco geral.", "etcd and Consul use Raft, ZooKeeper uses ZAB; they are for coordination, not a general database."],
        ["Para nós maliciosos é preciso BFT, com 3f+1 nós.", "Malicious nodes require BFT, with 3f+1 nodes."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Raft é mais rápido que Paxos?** Não necessariamente; é mais fácil de entender e implementar corretamente. O desempenho é equivalente ao do Multi-Paxos.", "**Is Raft faster than Paxos?** Not necessarily; it is easier to understand and implement correctly. Performance is equivalent to Multi-Paxos."],
        ["**Posso ter dois datacenters?** Não com tolerância a falhas de um deles: a maioria nunca fica garantida. Use três locais.", "**Can I have two datacenters?** Not with tolerance to losing one: a majority is never guaranteed. Use three locations."],
        ["**O que acontece sem maioria?** O cluster para de aceitar escritas (e leituras linearizáveis) até recuperar o quórum.", "**What happens without a majority?** The cluster stops accepting writes (and linearizable reads) until it regains quorum."],
        ["**Consenso resolve transações distribuídas?** Resolve a replicação e a ordem; transações entre vários serviços ainda pedem 2PC ou sagas.", "**Does consensus solve distributed transactions?** It solves replication and ordering; transactions across several services still need 2PC or sagas."],
      ),
      tip(["Para a maioria das aplicações, a pergunta certa não é 'qual algoritmo implementar' e sim 'qual serviço de coordenação já maduro eu uso, e como protejo minhas operações com fencing'.", "For most applications, the right question is not 'which algorithm do I implement' but 'which mature coordination service do I use, and how do I protect my operations with fencing'."]),
    ] },
  { id: "resiliencia", section: "distribuidos", level: 2, icon: "shield", minutes: 14,
    title: ["Resiliência", "Resilience"],
    summary: ["Timeout, retry com backoff e jitter, circuit breaker, bulkhead, rate limiting, fallback, hedging e load shedding.", "Timeout, retry with backoff and jitter, circuit breaker, bulkhead, rate limiting, fallback, hedging and load shedding."],
    body: [
      p(["**Resiliência** é a capacidade de um sistema continuar entregando valor, ainda que degradado, quando partes dele falham ou ficam lentas. Num sistema distribuído a falha é rotina, e o pior cenário raramente é um serviço cair de vez: é um serviço ficar **lento**. Uma chamada que nunca responde prende uma thread, depois outra, até o chamador inteiro esgotar seus recursos e cair também. É a **falha em cascata**, e os padrões deste artigo existem para impedi-la.", "**Resilience** is the ability of a system to keep delivering value, even if degraded, when parts of it fail or slow down. In a distributed system failure is routine, and the worst case is rarely a service going down completely: it is a service becoming **slow**. A call that never answers holds one thread, then another, until the whole caller runs out of resources and goes down too. This is **cascading failure**, and the patterns in this article exist to prevent it."]),
      fig(["Como uma lentidão vira uma queda em cascata", "How a slowdown becomes a cascading outage"],
        [[node("u", "Users", "client")], [node("api", "API", "service")], [node("pay", ["Pagamentos", "Payments"], "service")], [node("db", ["Banco lento", "Slow DB"], "data")]],
        [edge("u", "api", ["mais requisições", "more requests"]), edge("api", "pay", ["threads presas", "stuck threads"]), edge("pay", "db", ["lento", "slow"], { dashed: true })]),
      h(["Timeout", "Timeout"]),
      p(["Toda chamada remota precisa de um **prazo**. Sem ele, a espera é infinita. Defina timeouts separados para **conectar** e para **ler a resposta**, e escolha valores a partir da latência medida (por exemplo, um pouco acima do p99 do serviço chamado). Em cadeias de chamadas, propague um **prazo total** (*deadline*): se o usuário desiste em 2 s, não adianta o terceiro serviço da cadeia trabalhar por 10 s. O gRPC faz isso nativamente com deadlines; em HTTP, você repassa o prazo restante por cabeçalho.", "Every remote call needs a **deadline**. Without one, the wait is infinite. Set separate timeouts for **connecting** and for **reading the response**, and choose values from measured latency (for example, a little above the called service's p99). In call chains, propagate a **total deadline**: if the user gives up in 2 s, it makes no sense for the third service in the chain to work for 10 s. gRPC does this natively with deadlines; in HTTP you pass the remaining time in a header."]),
      h(["Retry com backoff exponencial e jitter", "Retry with exponential backoff and jitter"]),
      p(["Falhas transitórias (um pacote perdido, uma réplica reiniciando) somem se você tentar de novo. Mas retentar sem critério piora tudo: se 1000 clientes falham ao mesmo tempo e todos retentam imediatamente, o serviço doente recebe o dobro da carga justamente quando precisa respirar (*retry storm*). Três regras:", "Transient failures (a lost packet, a replica restarting) disappear if you try again. But retrying without care makes everything worse: if 1000 clients fail at the same time and all retry immediately, the sick service gets double the load just when it needs to breathe (*retry storm*). Three rules:"]),
      ul(
        ["**Backoff exponencial:** espere 100 ms, 200 ms, 400 ms, 800 ms... entre tentativas, com um teto.", "**Exponential backoff:** wait 100 ms, 200 ms, 400 ms, 800 ms... between attempts, with a cap."],
        ["**Jitter:** sorteie o intervalo (por exemplo, entre 0 e o valor calculado) para que os clientes não retentem em sincronia. O *full jitter* é uma escolha simples e eficaz.", "**Jitter:** randomize the interval (for example, between 0 and the computed value) so that clients do not retry in sync. *Full jitter* is a simple, effective choice."],
        ["**Limite e orçamento:** poucas tentativas (2 a 4) e, melhor ainda, um *retry budget* (por exemplo, retentativas limitadas a 10% do tráfego). Só retente erros **transitórios** (timeout, 503, 429 respeitando `Retry-After`) e só operações **idempotentes**.", "**Limits and budget:** few attempts (2 to 4) and, better still, a *retry budget* (for example, retries limited to 10% of traffic). Only retry **transient** errors (timeout, 503, 429 honoring `Retry-After`) and only **idempotent** operations."],
      ),
      p(["Cuidado com retentativas em camadas: se três níveis da cadeia retentam 3 vezes cada, uma falha no último gera até 27 chamadas. Retente em **um** nível, normalmente o mais próximo da falha ou o de borda.", "Beware of retries at several layers: if three levels of the chain retry 3 times each, one failure at the bottom generates up to 27 calls. Retry at **one** level, usually the one closest to the failure or the edge."]),
      h(["Circuit breaker", "Circuit breaker"]),
      p(["O **circuit breaker** (disjuntor) observa as chamadas a uma dependência e, quando a taxa de falhas passa de um limite, **para de chamá-la** por um tempo: a chamada falha imediatamente, sem consumir thread nem sobrecarregar o serviço doente. Depois de um intervalo, deixa passar poucas chamadas de teste para ver se ele se recuperou.", "The **circuit breaker** watches calls to a dependency and, when the failure rate crosses a threshold, **stops calling it** for a while: the call fails immediately, without using a thread or overloading the sick service. After an interval it lets a few probe calls through to see whether it has recovered."]),
      fig(["Máquina de estados do circuit breaker", "Circuit breaker state machine"],
        [[node("closed", ["Fechado", "Closed"], "service")], [node("open", ["Aberto", "Open"], "edge")], [node("half", ["Semiaberto", "Half-open"], "queue")]],
        [edge("closed", "open", ["falhas > limite", "failures > threshold"]), edge("open", "half", ["após espera", "after wait"]), edge("half", "closed", ["testes ok", "probes ok"], { dashed: true }), edge("half", "open", ["teste falhou", "probe failed"], { dashed: true })]),
      ul(
        ["**Fechado:** tudo passa; o breaker conta sucessos e falhas numa janela (por contagem ou por tempo).", "**Closed:** everything passes; the breaker counts successes and failures in a window (by count or by time)."],
        ["**Aberto:** nada passa; chamadas falham de imediato (ou vão para o fallback) até acabar o tempo de espera.", "**Open:** nothing passes; calls fail immediately (or go to the fallback) until the wait time ends."],
        ["**Semiaberto:** deixa passar um número pequeno de chamadas. Se tiverem sucesso, fecha; se falharem, reabre.", "**Half-open:** lets a small number of calls through. If they succeed, it closes; if they fail, it reopens."],
      ),
      h(["Bulkhead, rate limiting, fallback e load shedding", "Bulkhead, rate limiting, fallback and load shedding"]),
      p(["**Bulkhead** (antepara, como nas divisórias de um navio) isola recursos por dependência: um pool de threads ou um limite de conexões simultâneas para cada serviço chamado. Se um fica lento, só o seu compartimento enche; os demais seguem funcionando. **Rate limiting** limita quantas requisições um cliente pode fazer por período (token bucket, janela deslizante), protegendo o serviço contra abuso e contra picos. **Fallback** é a resposta alternativa quando a chamada falha: um valor em cache, um padrão sensato, uma versão simplificada (recomendações populares em vez de personalizadas) ou uma mensagem honesta de indisponibilidade. **Load shedding** é recusar propositalmente parte da carga quando o servidor está saturado, priorizando as requisições mais importantes, em vez de atender todas lentamente e falhar em todas.", "**Bulkhead** (like the compartments of a ship) isolates resources per dependency: a thread pool or a concurrent-connection limit for each called service. If one slows down, only its compartment fills up; the others keep working. **Rate limiting** limits how many requests a client may make per period (token bucket, sliding window), protecting the service against abuse and spikes. **Fallback** is the alternative response when the call fails: a cached value, a sensible default, a simplified version (popular recommendations instead of personalized ones) or an honest unavailability message. **Load shedding** is deliberately rejecting part of the load when the server is saturated, prioritizing the most important requests, instead of serving everything slowly and failing all of it."]),
      h(["Hedged requests", "Hedged requests"]),
      p(["Para reduzir a **latência de cauda**, o *hedging* envia uma segunda requisição a outra réplica se a primeira não respondeu dentro de um limiar curto (por exemplo, o p95) e usa a resposta que chegar primeiro, cancelando a outra. Jeff Dean e Luiz Barroso descreveram a técnica no artigo 'The Tail at Scale'. Custa um pequeno aumento de carga (cerca de 5% se o limiar for o p95), e só é seguro para operações idempotentes e de leitura.", "To reduce **tail latency**, *hedging* sends a second request to another replica if the first has not answered within a short threshold (for example, the p95) and uses whichever response arrives first, cancelling the other. Jeff Dean and Luiz Barroso described the technique in the paper 'The Tail at Scale'. It costs a small load increase (about 5% if the threshold is the p95), and is only safe for idempotent, read operations."]),
      table([["Padrão", "Pattern"], ["Problema que resolve", "Problem it solves"], ["Cuidado", "Caveat"]],
        [["Timeout", "Timeout"], ["Espera infinita", "Infinite wait"], ["Valor muito alto não protege; muito baixo gera falsos erros", "Too high does not protect; too low causes false errors"]],
        [["Retry + backoff + jitter", "Retry + backoff + jitter"], ["Falhas transitórias", "Transient failures"], ["Retry storm, operações não idempotentes", "Retry storm, non-idempotent operations"]],
        [["Circuit breaker", "Circuit breaker"], ["Dependência doente derrubando o chamador", "Sick dependency taking down the caller"], ["Calibrar limiares e janela", "Tune thresholds and window"]],
        [["Bulkhead", "Bulkhead"], ["Uma dependência consumir todos os recursos", "One dependency consuming all resources"], ["Tamanho dos pools", "Pool sizing"]],
        [["Rate limiting", "Rate limiting"], ["Abuso e picos", "Abuse and spikes"], ["Limites por cliente e por rota", "Per-client and per-route limits"]],
        [["Fallback", "Fallback"], ["Falha total da dependência", "Total failure of the dependency"], ["Dados velhos podem enganar", "Stale data can mislead"]],
        [["Hedging", "Hedging"], ["Latência de cauda", "Tail latency"], ["Carga extra; só idempotente", "Extra load; idempotent only"]],
        [["Load shedding", "Load shedding"], ["Saturação do servidor", "Server saturation"], ["Definir prioridades", "Define priorities"]],
      ),
      h(["Bibliotecas: Resilience4j e Polly", "Libraries: Resilience4j and Polly"]),
      p(["Você não precisa escrever tudo à mão. A **Resilience4j** (Java, sucessora do Hystrix, que está em manutenção) oferece CircuitBreaker, Retry, Bulkhead, RateLimiter e TimeLimiter como decoradores combináveis. A **Polly** (.NET) oferece retry, circuit breaker, timeout, bulkhead e fallback como políticas encadeáveis (*pipelines*). Em service meshes como Istio e Linkerd, parte disso (timeouts, retries, detecção de outliers) é configurada na infraestrutura, sem mexer no código.", "You do not need to write everything by hand. **Resilience4j** (Java, successor of Hystrix, which is in maintenance) offers CircuitBreaker, Retry, Bulkhead, RateLimiter and TimeLimiter as composable decorators. **Polly** (.NET) offers retry, circuit breaker, timeout, bulkhead and fallback as chainable policies (*pipelines*). In service meshes such as Istio and Linkerd, part of this (timeouts, retries, outlier detection) is configured in the infrastructure, without touching code."]),
      h(["Exemplo: retry e circuit breaker em TypeScript", "Example: retry and circuit breaker in TypeScript"]),
      code(`// Retry with exponential backoff and full jitter
async function retry<T>(fn: () => Promise<T>, tries = 4, baseMs = 100, capMs = 2000): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isTransient(err) || attempt === tries - 1) break;
      const ceiling = Math.min(capMs, baseMs * 2 ** attempt);
      const delay = Math.random() * ceiling;          // full jitter
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

type State = "closed" | "open" | "half-open";

class CircuitBreaker {
  private state: State = "closed";
  private failures = 0;
  private openedAt = 0;

  constructor(private maxFailures = 5, private resetMs = 10000) {}

  async call<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.openedAt < this.resetMs) {
        if (fallback) return fallback();
        throw new Error("circuit open");
      }
      this.state = "half-open";                       // let a probe through
    }
    try {
      const result = await fn();
      this.failures = 0;
      this.state = "closed";
      return result;
    } catch (err) {
      this.failures++;
      if (this.state === "half-open" || this.failures >= this.maxFailures) {
        this.state = "open";
        this.openedAt = Date.now();
      }
      if (fallback) return fallback();
      throw err;
    }
  }
}

// usage: breaker wraps the retry, each attempt under a timeout
const breaker = new CircuitBreaker();
const profile = await breaker.call(
  () => retry(() => fetch(url, { signal: AbortSignal.timeout(800) }).then((r) => r.json())),
  () => ({ name: "guest" }),
);`),
      p(["Esta versão é didática: em produção, o breaker mede uma janela de tempo, limita as chamadas de teste do estado semiaberto e expõe métricas de estado. Note a ordem: o breaker envolve o retry, e cada tentativa tem seu próprio timeout.", "This version is didactic: in production the breaker measures a time window, limits the probe calls in the half-open state and exposes state metrics. Note the order: the breaker wraps the retry, and each attempt has its own timeout."]),
      h(["Quando usar e erros comuns", "When to use and common mistakes"]),
      ul(
        ["Aplique timeout em **toda** chamada remota; retry só onde há idempotência; breaker em dependências que podem degradar; bulkhead onde uma dependência pode monopolizar recursos.", "Apply a timeout to **every** remote call; retry only where idempotency exists; a breaker on dependencies that may degrade; bulkheads where one dependency could monopolize resources."],
        ["Erro: retry sem jitter e sem limite, causando retry storm.", "Mistake: retry without jitter and without limits, causing a retry storm."],
        ["Erro: fallback que mascara o problema sem alertar ninguém. Registre e meça cada uso do fallback.", "Mistake: a fallback that hides the problem without alerting anyone. Log and measure every use of the fallback."],
        ["Erro: nunca testar as falhas. Use testes de caos (injetar latência e erros) para confirmar que os padrões funcionam.", "Mistake: never testing failures. Use chaos tests (inject latency and errors) to confirm the patterns work."],
        ["Erro: timeouts maiores no cliente do que no servidor, que trabalha para ninguém depois que o cliente desiste.", "Mistake: client timeouts longer than the server's, which keeps working for nobody after the client gives up."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["A lentidão é mais perigosa que a queda: use timeouts e deadlines em tudo.", "Slowness is more dangerous than an outage: use timeouts and deadlines everywhere."],
        ["Retry com backoff exponencial, jitter e orçamento, só para operações idempotentes.", "Retry with exponential backoff, jitter and a budget, only for idempotent operations."],
        ["Circuit breaker: fechado, aberto e semiaberto.", "Circuit breaker: closed, open and half-open."],
        ["Bulkhead isola, rate limiting protege, fallback degrada com elegância, hedging corta a cauda, load shedding preserva o essencial.", "Bulkhead isolates, rate limiting protects, fallback degrades gracefully, hedging cuts the tail, load shedding preserves the essential."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Retry e circuit breaker não se contradizem?** Não: o retry cobre falhas curtas; o breaker corta quando a falha é persistente.", "**Do retry and circuit breaker contradict each other?** No: retry covers short failures; the breaker cuts in when failure is persistent."],
        ["**Posso retentar um POST?** Só se for idempotente, por exemplo com uma chave de idempotência.", "**Can I retry a POST?** Only if it is idempotent, for example with an idempotency key."],
        ["**Qual o limiar do breaker?** Depende do tráfego; um ponto de partida comum é abrir com 50% de falhas numa janela com volume mínimo de chamadas.", "**What threshold for the breaker?** It depends on traffic; a common starting point is opening at 50% failures in a window with a minimum call volume."],
        ["**Load shedding não é perder requisições?** É, de propósito: recusar rápido algumas é melhor que atender todas devagar e falhar.", "**Isn't load shedding losing requests?** It is, on purpose: rejecting some quickly beats serving all slowly and failing."],
      ),
      tip(["Resiliência se prova, não se declara: injete falhas em ambiente de teste e meça se o sistema degrada como você planejou.", "Resilience is proven, not declared: inject failures in a test environment and measure whether the system degrades as planned."]),
    ] },
  { id: "transacoes-distribuidas", section: "distribuidos", level: 2, icon: "swap_horiz", minutes: 15,
    title: ["Transações distribuídas", "Distributed transactions"],
    summary: ["ACID x BASE, 2PC, 3PC, sagas, outbox, TCC, idempotência e uma visão de CQRS e event sourcing.", "ACID vs BASE, 2PC, 3PC, sagas, outbox, TCC, idempotency and an overview of CQRS and event sourcing."],
    body: [
      p(["Num banco único, uma **transação** agrupa várias operações que valem todas ou nenhuma. Num pedido de e-commerce, porém, os dados vivem em serviços diferentes: o de pedidos, o de estoque, o de pagamentos. Não existe um `BEGIN ... COMMIT` que cubra os três bancos. Como garantir que não se cobre o cartão de um pedido sem estoque, nem se reserve estoque para um pagamento recusado? Este artigo apresenta as duas famílias de resposta: **protocolos de commit atômico** (2PC, 3PC), que mantêm a atomicidade ao custo de bloqueio e acoplamento, e **consistência eventual com compensação** (sagas, outbox, TCC), que aceitam estados intermediários visíveis.", "In a single database, a **transaction** groups several operations that all take effect or none do. In an e-commerce order, however, data lives in different services: orders, inventory, payments. There is no `BEGIN ... COMMIT` that spans all three databases. How can we make sure we do not charge the card for an order without stock, nor reserve stock for a declined payment? This article presents the two families of answers: **atomic commit protocols** (2PC, 3PC), which keep atomicity at the cost of blocking and coupling, and **eventual consistency with compensation** (sagas, outbox, TCC), which accept visible intermediate states."]),
      h(["ACID x BASE", "ACID vs BASE"]),
      p(["**ACID** descreve bancos transacionais: **A**tomicidade (tudo ou nada), **C**onsistência (as regras de integridade se mantêm), **I**solamento (transações concorrentes não se enxergam pela metade) e **D**urabilidade (o que foi confirmado sobrevive a quedas). **BASE** é a filosofia oposta de muitos sistemas distribuídos: *Basically Available* (sempre responde, mesmo degradado), *Soft state* (o estado pode mudar sem novas entradas, enquanto a replicação converge) e *Eventually consistent* (sem novas escritas, todas as réplicas acabam iguais).", "**ACID** describes transactional databases: **A**tomicity (all or nothing), **C**onsistency (integrity rules hold), **I**solation (concurrent transactions do not see each other half done) and **D**urability (what was committed survives crashes). **BASE** is the opposite philosophy of many distributed systems: *Basically Available* (always answers, even if degraded), *Soft state* (state may change without new input while replication converges) and *Eventually consistent* (without new writes, all replicas end up equal)."]),
      table([["Aspecto", "Aspect"], ["ACID", "ACID"], ["BASE", "BASE"]],
        [["Prioridade", "Priority"], ["Correção imediata", "Immediate correctness"], ["Disponibilidade e escala", "Availability and scale"]],
        [["Consistência", "Consistency"], ["Forte", "Strong"], ["Eventual", "Eventual"]],
        [["Escopo típico", "Typical scope"], ["Um banco", "One database"], ["Vários serviços e réplicas", "Several services and replicas"]],
        [["Em falha", "On failure"], ["Aborta e desfaz", "Aborts and rolls back"], ["Compensa ou repete", "Compensates or retries"]],
      ),
      h(["Two-Phase Commit (2PC)", "Two-Phase Commit (2PC)"]),
      p(["O **2PC** coordena uma transação entre vários participantes (bancos ou serviços) por meio de um **coordenador**. Na fase 1 (**prepare**), o coordenador pergunta a cada participante se consegue confirmar; cada um grava tudo em disco, trava os recursos envolvidos e responde `yes` ou `no`. Na fase 2 (**commit**), se todos disseram sim, o coordenador manda `commit`; se algum disse não ou não respondeu, manda `abort`. Os padrões XA e os gerenciadores de transação de bancos relacionais implementam esse protocolo.", "**2PC** coordinates a transaction across several participants (databases or services) through a **coordinator**. In phase 1 (**prepare**), the coordinator asks each participant whether it can commit; each one writes everything to disk, locks the resources involved and answers `yes` or `no`. In phase 2 (**commit**), if all said yes, the coordinator sends `commit`; if any said no or did not answer, it sends `abort`. The XA standards and the transaction managers of relational databases implement this protocol."]),
      fig(["Fluxo do 2PC", "2PC flow"],
        [[node("co", "Coordinator", "edge")], [node("p1", "Participant A", "service"), node("p2", "Participant B", "service")], [node("log", ["Log durável", "Durable log"], "data")]],
        [edge("co", "p1", ["1. prepare", "1. prepare"]), edge("co", "p2", ["1. prepare", "1. prepare"]), edge("p1", "log", ["votos: yes", "votes: yes"], { dashed: true }), edge("co", "log", ["2. commit/abort", "2. commit/abort"], { dashed: true })]),
      p(["O problema do 2PC é o **bloqueio**. Depois de votar sim, um participante fica **em dúvida** (*in doubt*): não pode confirmar nem desfazer sozinho, e mantém seus bloqueios até saber a decisão. Se o coordenador cai entre as fases, os participantes ficam presos até ele voltar, com linhas travadas e outras transações esperando. O coordenador também é um ponto único de falha e a latência soma duas idas e voltas mais gravações em disco. Por isso o 2PC é razoável dentro de uma mesma organização e rede rápida, e raramente entre serviços independentes na internet.", "The problem with 2PC is **blocking**. After voting yes, a participant is **in doubt**: it can neither commit nor roll back on its own, and holds its locks until it learns the decision. If the coordinator crashes between phases, participants are stuck until it comes back, with rows locked and other transactions waiting. The coordinator is also a single point of failure and latency adds two round trips plus disk writes. That is why 2PC is reasonable inside one organization on a fast network, and rarely between independent services over the internet."]),
      h(["Three-Phase Commit (3PC)", "Three-Phase Commit (3PC)"]),
      p(["O **3PC** insere uma fase intermediária (`can-commit`, `pre-commit`, `do-commit`) e usa timeouts para que os participantes possam decidir sozinhos se o coordenador sumir, reduzindo o bloqueio. Funciona sob a suposição de rede síncrona e sem partições, o que não vale na prática: numa partição, lados diferentes podem decidir de formas diferentes. Por isso quase não é usado; sistemas modernos preferem consenso (Paxos ou Raft) para tornar o coordenador tolerante a falhas, como faz o Spanner com 2PC sobre grupos replicados.", "**3PC** inserts an intermediate phase (`can-commit`, `pre-commit`, `do-commit`) and uses timeouts so that participants can decide on their own if the coordinator disappears, reducing blocking. It works under the assumption of a synchronous network without partitions, which does not hold in practice: in a partition, different sides may decide differently. That is why it is almost never used; modern systems prefer consensus (Paxos or Raft) to make the coordinator fault tolerant, as Spanner does with 2PC over replicated groups."]),
      h(["Saga: sequência de transações locais com compensação", "Saga: a sequence of local transactions with compensation"]),
      p(["Uma **saga** (Hector Garcia-Molina e Kenneth Salem, 1987) divide a transação distribuída em uma sequência de **transações locais**, cada uma confirmada no seu próprio banco. Se uma etapa falha, executam-se **transações compensatórias** que desfazem semanticamente as anteriores, em ordem inversa. Compensar não é voltar o relógio: um pagamento já feito é estornado, uma reserva é cancelada, um e-mail enviado não se apaga (pede-se desculpas). Por isso as sagas oferecem atomicidade e consistência *eventuais*, **sem isolamento**: outros leitores veem estados intermediários, como um pedido 'criado' que logo será cancelado.", "A **saga** (Hector Garcia-Molina and Kenneth Salem, 1987) splits the distributed transaction into a sequence of **local transactions**, each committed in its own database. If a step fails, **compensating transactions** run that semantically undo the previous ones, in reverse order. Compensating is not turning back the clock: a payment already made is refunded, a reservation is cancelled, a sent email cannot be unsent (an apology is). That is why sagas offer *eventual* atomicity and consistency, **without isolation**: other readers see intermediate states, such as an 'created' order that will soon be cancelled."]),
      h(["Saga coreografada x orquestrada", "Choreographed vs orchestrated saga"]),
      fig(["Saga de um pedido, coreografada por eventos", "An order saga, choreographed by events"],
        [[node("ord", ["Pedidos", "Orders"], "service")], [node("bus", ["Barramento de eventos", "Event bus"], "queue")], [node("inv", ["Estoque", "Inventory"], "service"), node("pay", ["Pagamentos", "Payments"], "service")]],
        [edge("ord", "bus", "OrderCreated"), edge("bus", "inv", "OrderCreated"), edge("inv", "bus", "StockReserved"), edge("bus", "pay", "StockReserved"), edge("pay", "bus", ["PaymentFailed", "PaymentFailed"], { dashed: true })]),
      fig(["A mesma saga, orquestrada", "The same saga, orchestrated"],
        [[node("orc", ["Orquestrador", "Orchestrator"], "edge")], [node("s1", ["Pedidos", "Orders"], "service"), node("s2", ["Estoque", "Inventory"], "service"), node("s3", ["Pagamentos", "Payments"], "service")]],
        [edge("orc", "s1", "1"), edge("orc", "s2", "2"), edge("orc", "s3", "3")]),
      table([["Aspecto", "Aspect"], ["Coreografia", "Choreography"], ["Orquestração", "Orchestration"]],
        [["Controle", "Control"], ["Distribuído: cada serviço reage a eventos", "Distributed: each service reacts to events"], ["Central: um orquestrador comanda os passos", "Central: an orchestrator drives the steps"]],
        [["Acoplamento", "Coupling"], ["Baixo entre serviços, mas o fluxo fica implícito", "Low between services, but the flow becomes implicit"], ["Serviços ficam simples; o orquestrador conhece o fluxo", "Services stay simple; the orchestrator knows the flow"]],
        [["Visibilidade", "Visibility"], ["Difícil acompanhar e depurar", "Hard to follow and debug"], ["Fácil: o estado da saga está num lugar", "Easy: the saga state is in one place"]],
        [["Bom para", "Good for"], ["Fluxos curtos com 2 ou 3 passos", "Short flows with 2 or 3 steps"], ["Fluxos longos ou com ramificações", "Long flows or with branches"]],
        [["Ferramentas", "Tools"], ["Kafka, RabbitMQ", "Kafka, RabbitMQ"], ["Temporal, AWS Step Functions, Camunda", "Temporal, AWS Step Functions, Camunda"]],
      ),
      h(["Exemplo completo: pedido de e-commerce", "Complete example: an e-commerce order"]),
      p(["Uma saga orquestrada para um pedido tem quatro passos, cada um com sua compensação:", "An orchestrated saga for an order has four steps, each with its compensation:"]),
      table([["Passo", "Step"], ["Ação", "Action"], ["Compensação", "Compensation"]],
        [["1", "1"], ["Criar pedido com status PENDING", "Create the order with status PENDING"], ["Marcar pedido como CANCELLED", "Mark the order as CANCELLED"]],
        [["2", "2"], ["Reservar estoque", "Reserve stock"], ["Liberar a reserva", "Release the reservation"]],
        [["3", "3"], ["Cobrar o cartão", "Charge the card"], ["Estornar a cobrança", "Refund the charge"]],
        [["4", "4"], ["Confirmar o pedido (CONFIRMED) e avisar o cliente", "Confirm the order (CONFIRMED) and notify the customer"], ["Sem compensação: é o último passo", "No compensation: it is the last step"]],
      ),
      code(`// Orchestrator sketch: each step has an action and a compensation
interface Step { name: string; run(ctx: Ctx): Promise<void>; undo?(ctx: Ctx): Promise<void>; }

async function runSaga(steps: Step[], ctx: Ctx) {
  const done: Step[] = [];
  for (const step of steps) {
    try {
      await step.run(ctx);               // must be idempotent (retried after a crash)
      done.push(step);
      await saveProgress(ctx.sagaId, step.name);   // durable state
    } catch (err) {
      for (const s of done.reverse()) {
        await s.undo?.(ctx);             // compensation must be idempotent too
      }
      await markFailed(ctx.sagaId, err);
      return;
    }
  }
  await markCompleted(ctx.sagaId);
}

const orderSaga: Step[] = [
  { name: "create-order",  run: createOrder,  undo: cancelOrder },
  { name: "reserve-stock", run: reserveStock, undo: releaseStock },
  { name: "charge-card",   run: chargeCard,   undo: refundCard },
  { name: "confirm-order", run: confirmOrder },
];`),
      p(["Detalhes que fazem diferença: o orquestrador **persiste o progresso** (se cair, retoma de onde parou), cada ação e cada compensação são **idempotentes**, e a compensação pode falhar também, então ela é retentada até dar certo. Se o cartão é recusado no passo 3, o orquestrador libera a reserva e cancela o pedido, e o cliente vê o motivo.", "Details that matter: the orchestrator **persists progress** (if it crashes, it resumes where it stopped), each action and each compensation is **idempotent**, and the compensation can fail too, so it is retried until it works. If the card is declined at step 3, the orchestrator releases the reservation and cancels the order, and the customer sees the reason."]),
      h(["Transactional Outbox", "Transactional Outbox"]),
      p(["Um serviço precisa gravar no seu banco **e** publicar um evento. Se gravar e depois publicar e o processo cair no meio, o evento se perde; se publicar primeiro, pode anunciar algo que não foi gravado. Isso é o problema da **escrita dupla**. O padrão **outbox** resolve: na **mesma transação local**, grave a mudança de negócio e uma linha na tabela `outbox`. Um processo separado (um *relay* que lê a tabela, ou **CDC** como o Debezium lendo o log do banco) publica as linhas no broker e as marca como enviadas. A entrega é *pelo menos uma vez*, então os consumidores precisam ser idempotentes.", "A service must write to its database **and** publish an event. If it writes and then publishes and the process crashes in between, the event is lost; if it publishes first, it may announce something that was not saved. This is the **dual write** problem. The **outbox** pattern solves it: in the **same local transaction**, write the business change and a row in the `outbox` table. A separate process (a *relay* that reads the table, or **CDC** such as Debezium reading the database log) publishes the rows to the broker and marks them as sent. Delivery is *at least once*, so consumers must be idempotent."]),
      code(`BEGIN;
  UPDATE orders SET status = 'CONFIRMED' WHERE id = 42;
  INSERT INTO outbox (id, aggregate_id, type, payload, created_at)
  VALUES (gen_random_uuid(), 42, 'OrderConfirmed', '{"orderId":42}', now());
COMMIT;
-- a relay (or Debezium) reads new outbox rows and publishes them to the broker`),
      h(["TCC: Try-Confirm-Cancel", "TCC: Try-Confirm-Cancel"]),
      p(["O **TCC** é uma alternativa que reserva recursos antes de confirmar. Na fase **Try**, cada serviço reserva o que precisa sem efeito definitivo (bloqueia R$ 100 do saldo, separa 1 unidade do estoque). Se todos conseguiram, o coordenador chama **Confirm** em todos; se algum falhou, chama **Cancel** nos que reservaram. Diferente da saga, a reserva isola o recurso, evitando que outros o consumam no meio do caminho, mas exige que cada serviço implemente três operações idempotentes e trate reservas que expiram.", "**TCC** is an alternative that reserves resources before confirming. In the **Try** phase, each service reserves what it needs with no final effect (blocks R$ 100 of the balance, sets aside 1 unit of stock). If all succeed, the coordinator calls **Confirm** on all; if any failed, it calls **Cancel** on those that reserved. Unlike a saga, the reservation isolates the resource, preventing others from consuming it midway, but each service must implement three idempotent operations and handle reservations that expire."]),
      h(["Idempotência", "Idempotency"]),
      p(["Como mensagens e chamadas podem ser repetidas, toda operação de uma saga precisa ser **idempotente**: executá-la duas vezes tem o mesmo efeito de uma. Para operações naturalmente não idempotentes (cobrar, transferir), o cliente envia uma **chave de idempotência** (um UUID por intenção). O servidor guarda `(chave → resultado)` numa tabela com índice único; se a chave já existe, devolve o resultado salvo em vez de executar de novo. A Stripe popularizou o cabeçalho `Idempotency-Key`. No consumidor de eventos, o equivalente é guardar os ids de mensagens processadas (ou usar uma operação condicional, como `UPDATE ... WHERE version = n`).", "Since messages and calls can be repeated, every operation of a saga must be **idempotent**: executing it twice has the same effect as once. For naturally non-idempotent operations (charge, transfer), the client sends an **idempotency key** (one UUID per intent). The server stores `(key -> result)` in a table with a unique index; if the key already exists, it returns the saved result instead of executing again. Stripe popularized the `Idempotency-Key` header. In an event consumer, the equivalent is to store the ids of processed messages (or use a conditional operation, such as `UPDATE ... WHERE version = n`)."]),
      h(["CQRS e event sourcing, de relance", "CQRS and event sourcing at a glance"]),
      p(["O **CQRS** separa o modelo de escrita (comandos) do de leitura (consultas), com bancos e formatos diferentes, sincronizados por eventos; leituras ficam rápidas e a escrita fica simples, ao custo de consistência eventual entre os lados. O **event sourcing** guarda não o estado atual, mas a **sequência de eventos** que levou até ele (`PedidoCriado`, `ItemAdicionado`, `PedidoPago`); o estado é recalculado reaplicando os eventos. Dá auditoria completa e facilita sagas e projeções, mas traz complexidade: versionamento de eventos, snapshots e consultas mais difíceis. Os dois combinam bem, mas nenhum é obrigatório para usar sagas.", "**CQRS** separates the write model (commands) from the read model (queries), with different databases and shapes, synchronized by events; reads become fast and writes simple, at the cost of eventual consistency between the sides. **Event sourcing** stores not the current state but the **sequence of events** that led to it (`OrderCreated`, `ItemAdded`, `OrderPaid`); state is recomputed by replaying the events. It gives full audit and eases sagas and projections, but brings complexity: event versioning, snapshots and harder queries. The two combine well, but neither is required to use sagas."]),
      h(["Quando usar cada abordagem", "When to use each approach"]),
      table([["Abordagem", "Approach"], ["Use quando", "Use when"], ["Evite quando", "Avoid when"]],
        [["Transação local", "Local transaction"], ["Os dados cabem num só banco", "The data fits one database"], ["Os dados já vivem em serviços separados", "The data already lives in separate services"]],
        [["2PC / XA", "2PC / XA"], ["Poucos bancos confiáveis na mesma rede", "Few reliable databases on the same network"], ["Serviços independentes, internet, alta escala", "Independent services, internet, high scale"]],
        [["Saga", "Saga"], ["Processos longos entre serviços", "Long processes across services"], ["Quando precisa de isolamento forte", "When strong isolation is needed"]],
        [["TCC", "TCC"], ["Recursos reserváveis (saldo, estoque)", "Reservable resources (balance, stock)"], ["Recursos sem reserva natural", "Resources with no natural reservation"]],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Dividir um domínio em microsserviços e depois tentar recriar transações distribuídas. Muitas vezes o limite do serviço está errado.", "Splitting a domain into microservices and then trying to recreate distributed transactions. Often the service boundary is wrong."],
        ["Escrita dupla (banco e broker) sem outbox.", "Dual writes (database and broker) without an outbox."],
        ["Compensações não idempotentes ou que assumem que sempre dão certo.", "Non-idempotent compensations, or ones that assume they always succeed."],
        ["Ignorar a falta de isolamento: dois pedidos disputando o último item podem ambos passar do passo 1.", "Ignoring the lack of isolation: two orders competing for the last item can both pass step 1."],
        ["Não persistir o estado da saga, perdendo o progresso numa queda do orquestrador.", "Not persisting saga state, losing progress when the orchestrator crashes."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["ACID garante tudo no mesmo banco; entre serviços se aceita BASE.", "ACID guarantees everything inside one database; across services BASE is accepted."],
        ["2PC dá atomicidade, mas bloqueia e depende do coordenador; 3PC quase não se usa.", "2PC gives atomicity but blocks and depends on the coordinator; 3PC is almost unused."],
        ["Saga = transações locais + compensações; coreografia é distribuída, orquestração é centralizada.", "Saga = local transactions + compensations; choreography is distributed, orchestration is centralized."],
        ["Outbox elimina a escrita dupla; idempotência torna as repetições seguras.", "Outbox removes the dual write; idempotency makes repeats safe."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Saga garante atomicidade?** Eventual: o sistema chega a um estado consistente, mas passa por estados intermediários visíveis.", "**Does a saga guarantee atomicity?** Eventual: the system reaches a consistent state but passes through visible intermediate states."],
        ["**E se a compensação falhar?** É retentada até funcionar; se não for possível, vira um caso para intervenção humana.", "**What if the compensation fails?** It is retried until it works; if impossible, it becomes a case for human intervention."],
        ["**Kafka resolve transações distribuídas?** Oferece transações dentro do Kafka (produção atômica e exactly-once entre tópicos), não entre seu banco e outro serviço.", "**Does Kafka solve distributed transactions?** It offers transactions within Kafka (atomic production and exactly-once across topics), not between your database and another service."],
        ["**Quando 2PC ainda faz sentido?** Dentro de um mesmo banco distribuído que o implementa internamente, como o Spanner ou o CockroachDB.", "**When does 2PC still make sense?** Inside a distributed database that implements it internally, such as Spanner or CockroachDB."],
      ),
      tip(["Antes de adotar sagas, tente remover a necessidade: agrupe os dados que mudam juntos no mesmo serviço. A melhor transação distribuída é a que você não precisa fazer.", "Before adopting sagas, try to remove the need: group data that changes together in the same service. The best distributed transaction is the one you do not need."]),
    ] },
  { id: "rastreamento-distribuido", section: "distribuidos", level: 2, icon: "timeline", minutes: 14,
    title: ["Rastreamento distribuído", "Distributed tracing"],
    summary: ["Logs, métricas e traces, spans, propagação traceparent, OpenTelemetry, Jaeger, Tempo, Zipkin e amostragem.", "Logs, metrics and traces, spans, traceparent propagation, OpenTelemetry, Jaeger, Tempo, Zipkin and sampling."],
    body: [
      p(["Num monolito, quando algo está lento, você abre o profiler ou lê um log. Numa arquitetura com dezenas de serviços, **um único clique do usuário atravessa cinco, dez, vinte processos**, e nenhum deles sozinho sabe por que o total demorou 3 segundos. O **rastreamento distribuído** (*distributed tracing*) reconstrói o caminho completo de uma requisição entre serviços, com o tempo gasto em cada etapa, para responder a perguntas como 'onde está o gargalo?', 'qual chamada falhou?' e 'quem chamou quem?'.", "In a monolith, when something is slow, you open the profiler or read a log. In an architecture with dozens of services, **a single user click crosses five, ten, twenty processes**, and none of them alone knows why the total took 3 seconds. **Distributed tracing** rebuilds the complete path of a request across services, with the time spent at each step, to answer questions such as 'where is the bottleneck?', 'which call failed?' and 'who called whom?'."]),
      h(["Os três pilares da observabilidade", "The three pillars of observability"]),
      table([["Sinal", "Signal"], ["O que é", "What it is"], ["Responde", "Answers"], ["Limitação", "Limitation"]],
        [["Logs", "Logs"], ["Registros de eventos discretos, com texto ou campos estruturados", "Records of discrete events, with text or structured fields"], ["O que aconteceu neste ponto, em detalhe", "What happened at this point, in detail"], ["Volume alto; sem visão do caminho entre serviços", "High volume; no view of the path across services"]],
        [["Métricas", "Metrics"], ["Números agregados no tempo (taxa, erros, latência)", "Numbers aggregated over time (rate, errors, latency)"], ["Está saudável? Está piorando?", "Is it healthy? Is it getting worse?"], ["Agregadas: não explicam uma requisição específica", "Aggregated: they do not explain one specific request"]],
        [["Traces", "Traces"], ["A árvore de chamadas de uma requisição, com tempos", "The tree of calls of one request, with timings"], ["Onde o tempo foi gasto e onde falhou", "Where time went and where it failed"], ["Custo de coleta; exige instrumentação e amostragem", "Collection cost; needs instrumentation and sampling"]],
      ),
      p(["Os três se completam: a **métrica** avisa que a latência subiu, o **trace** mostra qual chamada ficou lenta, e o **log** daquele trace explica a causa.", "The three complement each other: the **metric** warns that latency went up, the **trace** shows which call became slow, and the **log** for that trace explains the cause."]),
      h(["Conceitos: trace, span e contexto", "Concepts: trace, span and context"]),
      ul(
        ["**Trace:** a história completa de uma requisição, identificada por um `trace_id` único que atravessa todos os serviços.", "**Trace:** the complete story of a request, identified by a unique `trace_id` that crosses all services."],
        ["**Span:** uma unidade de trabalho dentro do trace (uma chamada HTTP, uma consulta SQL, uma função). Tem `span_id`, nome, horário de início, duração, atributos (como `http.method` ou `db.statement`), eventos e status.", "**Span:** a unit of work inside the trace (an HTTP call, a SQL query, a function). It has a `span_id`, name, start time, duration, attributes (such as `http.method` or `db.statement`), events and status."],
        ["**Relação pai-filho:** cada span aponta para o `parent_span_id` do span que o originou, formando uma árvore.", "**Parent-child relation:** each span points to the `parent_span_id` of the span that originated it, forming a tree."],
        ["**Contexto de trace (context propagation):** o `trace_id` e o span corrente, passados adiante em cada chamada para que o próximo serviço continue o mesmo trace.", "**Trace context (context propagation):** the `trace_id` and the current span, passed along in each call so that the next service continues the same trace."],
      ),
      fig(["Uma requisição vira uma árvore de spans", "One request becomes a tree of spans"],
        [[node("gw", "Gateway", "edge")], [node("ord", ["Pedidos", "Orders"], "service")], [node("inv", ["Estoque", "Inventory"], "service"), node("pay", ["Pagamentos", "Payments"], "service")], [node("db", "DB", "data"), node("ext", ["Operadora do cartão", "Card network"], "ext")]],
        [edge("gw", "ord", "span A"), edge("ord", "inv", "span B"), edge("ord", "pay", "span C"), edge("inv", "db", "span D"), edge("pay", "ext", "span E")]),
      p(["Visualizado numa ferramenta, o mesmo trace aparece como uma **cascata** (*waterfall*): barras horizontais, uma por span, alinhadas no tempo. Você enxerga de relance quais chamadas ocorreram em sequência (e poderiam ser paralelas), qual é a mais longa (o **caminho crítico**) e onde há tempo ocioso entre elas.", "Visualized in a tool, the same trace shows up as a **waterfall**: horizontal bars, one per span, aligned in time. At a glance you see which calls ran in sequence (and could be parallel), which is the longest (the **critical path**) and where there is idle time between them."]),
      code(`trace 4bf92f3577b34da6a3ce929d0e0e4736  total 412 ms
GET /checkout                    |==============================| 412 ms  gateway
  POST /orders                    |=============================|  398 ms  orders
    SELECT stock                   |==|                             38 ms   inventory
    POST /charge                      |======================|      290 ms   payments
      card-network.authorize          |==================|        245 ms   external`),
      h(["Propagação de contexto: W3C Trace Context", "Context propagation: W3C Trace Context"]),
      p(["Para o trace atravessar processos, o contexto viaja em **cabeçalhos**. O padrão da W3C, o **Trace Context**, define o cabeçalho `traceparent`, com quatro campos separados por hífen: versão, `trace-id` (16 bytes em hexadecimal), `parent-id` (8 bytes, o span que está chamando) e `trace-flags` (por exemplo, `01` indica que o trace foi amostrado). Um segundo cabeçalho, `tracestate`, carrega dados específicos de fornecedores.", "For the trace to cross processes, the context travels in **headers**. The W3C standard, **Trace Context**, defines the `traceparent` header, with four hyphen-separated fields: version, `trace-id` (16 bytes in hexadecimal), `parent-id` (8 bytes, the calling span) and `trace-flags` (for example, `01` indicates the trace was sampled). A second header, `tracestate`, carries vendor-specific data."]),
      code(`GET /orders HTTP/1.1
Host: orders.internal
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
tracestate: vendor1=opaque
#            ver trace-id (32 hex)                span-id (16 hex) flags`),
      p(["Cada serviço lê o `traceparent` recebido, cria um span filho (com novo `span-id` e o recebido como pai) e envia no `traceparent` de saída o seu próprio `span-id`. O mesmo vale para mensagens em filas: o contexto vai nos **cabeçalhos da mensagem** (Kafka headers, atributos do SQS), de modo que o consumidor continue o trace do produtor. Padrões anteriores, como os cabeçalhos `X-B3-*` do Zipkin, ainda existem; o OpenTelemetry suporta ambos.", "Each service reads the incoming `traceparent`, creates a child span (with a new `span-id` and the received one as parent) and sends its own `span-id` in the outgoing `traceparent`. The same applies to queue messages: the context goes in the **message headers** (Kafka headers, SQS attributes), so the consumer continues the producer's trace. Earlier standards, such as Zipkin's `X-B3-*` headers, still exist; OpenTelemetry supports both."]),
      h(["OpenTelemetry", "OpenTelemetry"]),
      p(["O **OpenTelemetry** (OTel), projeto da CNCF, é o padrão aberto para gerar e exportar **traces, métricas e logs**, independente de fornecedor. Tem APIs e SDKs para as principais linguagens, **instrumentação automática** para frameworks comuns (HTTP, gRPC, drivers de banco) e o **Collector**, um processo que recebe dados no protocolo **OTLP**, os processa (filtra, amostra, enriquece) e exporta para Jaeger, Tempo, Zipkin ou serviços comerciais. A vantagem é instrumentar uma vez e trocar o destino sem mexer na aplicação.", "**OpenTelemetry** (OTel), a CNCF project, is the open, vendor-neutral standard to generate and export **traces, metrics and logs**. It has APIs and SDKs for the main languages, **automatic instrumentation** for common frameworks (HTTP, gRPC, database drivers) and the **Collector**, a process that receives data in the **OTLP** protocol, processes it (filters, samples, enriches) and exports to Jaeger, Tempo, Zipkin or commercial services. The advantage is instrumenting once and changing the destination without touching the application."]),
      fig(["Caminho dos dados de telemetria", "Telemetry data path"],
        [[node("app", ["Apps + SDK OTel", "Apps + OTel SDK"], "service")], [node("col", ["Collector OTel", "OTel Collector"], "edge")], [node("jg", "Jaeger / Tempo", "data"), node("pm", "Prometheus", "data")], [node("ui", ["Grafana / UI", "Grafana / UI"], "client")]],
        [edge("app", "col", "OTLP"), edge("col", "jg", "traces"), edge("col", "pm", ["métricas", "metrics"]), edge("jg", "ui"), edge("pm", "ui")]),
      code(`// Node.js: tracing setup, loaded before the app (OpenTelemetry SDK)
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const sdk = new NodeSDK({
  serviceName: "orders",
  traceExporter: new OTLPTraceExporter({ url: "http://otel-collector:4318/v1/traces" }),
  instrumentations: [getNodeAutoInstrumentations()],   // http, express, pg, kafka...
});
sdk.start();

// Manual span around a business operation
import { trace, SpanStatusCode } from "@opentelemetry/api";
const tracer = trace.getTracer("orders");

export async function reserveStock(orderId: string, sku: string) {
  return tracer.startActiveSpan("reserve-stock", async (span) => {
    span.setAttribute("order.id", orderId);
    span.setAttribute("sku", sku);
    try {
      const result = await inventory.reserve(sku);       // child spans nest automatically
      span.addEvent("stock-reserved", { quantity: result.quantity });
      return result;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}`),
      h(["Ferramentas: Jaeger, Tempo e Zipkin", "Tools: Jaeger, Tempo and Zipkin"]),
      table([["Ferramenta", "Tool"], ["Característica", "Trait"], ["Armazenamento", "Storage"]],
        [["Jaeger", "Jaeger"], ["Originado na Uber, projeto da CNCF; interface de busca e cascata, grafo de dependências", "Originated at Uber, a CNCF project; search UI and waterfall, dependency graph"], ["Elasticsearch, Cassandra, Badger (local)", "Elasticsearch, Cassandra, Badger (local)"]],
        [["Grafana Tempo", "Grafana Tempo"], ["Foco em baixo custo: indexa só o trace id e busca por atributos com TraceQL; integra com Grafana, Loki e Prometheus", "Cost-focused: indexes only the trace id and searches attributes with TraceQL; integrates with Grafana, Loki and Prometheus"], ["Armazenamento de objetos (S3, GCS)", "Object storage (S3, GCS)"]],
        [["Zipkin", "Zipkin"], ["Originado no Twitter, inspirado no Dapper do Google; simples de operar", "Originated at Twitter, inspired by Google's Dapper; simple to operate"], ["Memória, Cassandra, Elasticsearch, MySQL", "Memory, Cassandra, Elasticsearch, MySQL"]],
      ),
      p(["O artigo **Dapper** (Google, 2010) inspirou todos eles. Fornecedores comerciais (Datadog, New Relic, Honeycomb, entre outros) aceitam OTLP, de modo que a escolha do backend fica reversível.", "The **Dapper** paper (Google, 2010) inspired them all. Commercial vendors (Datadog, New Relic, Honeycomb, among others) accept OTLP, so the choice of backend remains reversible."]),
      h(["Amostragem: head x tail", "Sampling: head vs tail"]),
      p(["Guardar todos os traces de um sistema com milhares de requisições por segundo é caro e quase sempre desnecessário. A **amostragem** decide quais traces conservar.", "Keeping every trace of a system with thousands of requests per second is expensive and almost always unnecessary. **Sampling** decides which traces to keep."]),
      table([["Estratégia", "Strategy"], ["Como decide", "How it decides"], ["Vantagem", "Advantage"], ["Desvantagem", "Drawback"]],
        [["Head-based", "Head-based"], ["No início da requisição, por exemplo 1% aleatório; o resultado vai no flag do `traceparent`", "At the start of the request, for example 1% at random; the result goes in the `traceparent` flag"], ["Barata, simples, decisão consistente em todos os serviços", "Cheap, simple, a consistent decision across all services"], ["Pode descartar justamente os traces com erro ou lentos", "May discard exactly the traces with errors or slowness"]],
        [["Tail-based", "Tail-based"], ["No fim, com o trace completo, em geral no Collector: guarda 100% dos erros e dos lentos, e uma fração do resto", "At the end, with the full trace, usually in the Collector: keeps 100% of errors and slow ones, and a fraction of the rest"], ["Preserva o que é interessante", "Keeps what is interesting"], ["Precisa reter os spans na memória até o fim; mais complexa; todos os spans do trace devem chegar ao mesmo Collector", "Must hold spans in memory until the end; more complex; all spans of a trace must reach the same Collector"]],
      ),
      h(["Correlação de logs e métricas", "Correlating logs and metrics"]),
      p(["Para saltar de um trace aos logs correspondentes, grave o `trace_id` e o `span_id` em **cada linha de log**. Com logs estruturados em JSON, basta adicionar os campos; muitas bibliotecas de log o fazem automaticamente quando o OpenTelemetry está ativo. Do outro lado, as **métricas** podem trazer *exemplars*: amostras de pontos com um `trace_id` anexado, de modo que, ao ver um pico no histograma de latência, você clique e abra um trace típico daquele pico.", "To jump from a trace to the corresponding logs, write the `trace_id` and `span_id` on **every log line**. With structured JSON logs, just add the fields; many logging libraries do it automatically when OpenTelemetry is active. On the other side, **metrics** can carry *exemplars*: sample points with an attached `trace_id`, so that when you see a spike in the latency histogram you can click and open a typical trace of that spike."]),
      code(`{"ts":"2026-03-14T10:21:07.412Z","level":"error","service":"payments",
 "msg":"card authorization timed out","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736",
 "span_id":"00f067aa0ba902b7","order_id":"42","timeout_ms":800}`),
      h(["Analisando latência com traces", "Analyzing latency with traces"]),
      ul(
        ["**Caminho crítico:** siga a cadeia de spans que determina a duração total. Otimizar um span fora dele não muda o total.", "**Critical path:** follow the chain of spans that determines the total duration. Optimizing a span outside it does not change the total."],
        ["**Chamadas sequenciais que poderiam ser paralelas:** barras escalonadas na cascata, sem sobreposição.", "**Sequential calls that could be parallel:** staggered bars in the waterfall, with no overlap."],
        ["**N+1:** dezenas de spans de consulta idênticos dentro de um span pai, sinal de um laço consultando um item por vez.", "**N+1:** dozens of identical query spans inside a parent span, a sign of a loop querying one item at a time."],
        ["**Tempo ocioso:** lacunas entre spans (fila, pool de conexões esgotado, GC).", "**Idle time:** gaps between spans (queue, exhausted connection pool, GC)."],
        ["**Latência de cauda:** compare traces do p50 e do p99 para ver o que muda entre os dois.", "**Tail latency:** compare p50 and p99 traces to see what differs between the two."],
      ),
      h(["Boas práticas e erros comuns", "Good practices and common mistakes"]),
      ul(
        ["Propague o contexto em **todas** as fronteiras: HTTP, gRPC, filas, jobs assíncronos. Uma quebra na cadeia parte o trace em dois.", "Propagate context across **all** boundaries: HTTP, gRPC, queues, async jobs. A break in the chain splits the trace in two."],
        ["Nomeie spans por **operação** de baixa cardinalidade (`GET /orders/{id}`), nunca com valores variáveis (`GET /orders/42`); ids vão em atributos.", "Name spans by low-cardinality **operation** (`GET /orders/{id}`), never with variable values (`GET /orders/42`); ids go in attributes."],
        ["Não coloque dados pessoais ou segredos em atributos de span: traces são armazenados e compartilhados.", "Do not put personal data or secrets in span attributes: traces are stored and shared."],
        ["Defina a amostragem de propósito e meça o overhead (em geral baixo, mas não zero).", "Define sampling on purpose and measure overhead (usually low, but not zero)."],
        ["Erro: tratar o trace como substituto de métricas e alertas. O trace explica; quem avisa é a métrica.", "Mistake: treating the trace as a substitute for metrics and alerts. The trace explains; the metric alerts."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Logs, métricas e traces se complementam; o trace mostra o caminho entre serviços.", "Logs, metrics and traces complement each other; the trace shows the path across services."],
        ["Um trace é uma árvore de spans ligada por `trace_id` e `parent_span_id`.", "A trace is a tree of spans linked by `trace_id` and `parent_span_id`."],
        ["O cabeçalho `traceparent` (W3C) propaga o contexto, inclusive em mensagens de fila.", "The `traceparent` header (W3C) propagates context, including in queue messages."],
        ["OpenTelemetry padroniza a instrumentação; Jaeger, Tempo e Zipkin guardam e exibem.", "OpenTelemetry standardizes instrumentation; Jaeger, Tempo and Zipkin store and display."],
        ["Amostragem head é barata; tail preserva erros e lentidão.", "Head sampling is cheap; tail sampling preserves errors and slowness."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Tracing substitui logs?** Não; o trace mostra a estrutura e o tempo, o log traz o detalhe. Correlacione os dois.", "**Does tracing replace logs?** No; the trace shows structure and time, the log brings detail. Correlate the two."],
        ["**Qual o overhead?** Costuma ser pequeno com amostragem e exportação em lote assíncrona, mas deve ser medido no seu caso.", "**What is the overhead?** Usually small with sampling and asynchronous batch export, but it should be measured in your case."],
        ["**Preciso alterar o código?** A instrumentação automática cobre bibliotecas comuns; spans de negócio exigem código manual.", "**Do I have to change code?** Automatic instrumentation covers common libraries; business spans need manual code."],
        ["**O que fazer com sistemas legados sem suporte?** Gere o `traceparent` no gateway e propague o que for possível; mesmo um trace parcial ajuda.", "**What about legacy systems without support?** Generate the `traceparent` at the gateway and propagate what you can; even a partial trace helps."],
      ),
      tip(["Comece pelos pontos de entrada e pelas chamadas entre serviços: com a instrumentação automática do OpenTelemetry e um Collector você já enxerga o mapa do sistema em poucas horas.", "Start with the entry points and the calls between services: with OpenTelemetry automatic instrumentation and a Collector you can see the system map within a few hours."]),
    ] },
  { id: "comunicacao-segura-entre-servicos", section: "distribuidos", level: 2, icon: "lock", minutes: 14,
    title: ["Comunicação segura entre serviços", "Secure service-to-service communication"],
    summary: ["TLS e mTLS, certificados e rotação, service mesh, JWT e OAuth, SPIFFE, zero trust, Vault e network policies.", "TLS and mTLS, certificates and rotation, service mesh, JWT and OAuth, SPIFFE, zero trust, Vault and network policies."],
    body: [
      p(["Durante anos, a segurança de uma empresa foi desenhada como um castelo: um **perímetro** forte (firewall, VPN) e, lá dentro, confiança total. Esse modelo falha em arquiteturas de microsserviços por dois motivos. Primeiro, há **muito tráfego leste-oeste** (serviço para serviço) que nunca passa pelo perímetro. Segundo, basta um serviço ser comprometido, ou um atacante entrar na rede, para que todo o tráfego interno em texto claro seja lido e forjado. A quarta falácia da computação distribuída ('a rede é segura') é falsa também por dentro. Este artigo mostra como proteger a comunicação entre serviços em três dimensões: **confidencialidade e integridade** (criptografia), **autenticação** (quem é você?) e **autorização** (o que você pode fazer?).", "For years, company security was designed like a castle: a strong **perimeter** (firewall, VPN) and, inside, total trust. This model fails in microservice architectures for two reasons. First, there is **a lot of east-west traffic** (service to service) that never crosses the perimeter. Second, it takes only one compromised service, or an attacker getting into the network, for all clear-text internal traffic to be read and forged. The fourth fallacy of distributed computing ('the network is secure') is false on the inside too. This article shows how to protect service communication in three dimensions: **confidentiality and integrity** (encryption), **authentication** (who are you?) and **authorization** (what may you do?)."]),
      h(["TLS: criptografia em trânsito", "TLS: encryption in transit"]),
      p(["O **TLS** (Transport Layer Security) cria um canal cifrado e íntegro sobre TCP. No *handshake*, o cliente e o servidor negociam parâmetros, o servidor apresenta um **certificado** assinado por uma autoridade certificadora (CA) em que o cliente confia, e ambos derivam uma chave de sessão simétrica usada no resto da conexão. No TLS 1.3, o handshake leva uma ida e volta e só admite conjuntos de cifras modernos com sigilo perfeito (*forward secrecy*). Com TLS comum, só o **servidor** se autentica: o cliente sabe com quem fala, mas o servidor não sabe quem é o cliente.", "**TLS** (Transport Layer Security) creates an encrypted, tamper-proof channel over TCP. In the *handshake*, client and server negotiate parameters, the server presents a **certificate** signed by a certificate authority (CA) the client trusts, and both derive a symmetric session key used for the rest of the connection. In TLS 1.3 the handshake takes one round trip and only allows modern cipher suites with forward secrecy. With plain TLS only the **server** authenticates: the client knows who it is talking to, but the server does not know who the client is."]),
      h(["mTLS: autenticação nos dois sentidos", "mTLS: authentication in both directions"]),
      p(["No **TLS mútuo** (mTLS), o servidor também exige um certificado do cliente e o valida contra a CA. Cada serviço passa a ter uma **identidade criptográfica** (por exemplo, `orders` ou `payments`), e quem não apresenta um certificado válido é recusado antes de qualquer lógica de negócio. É o bloco básico de uma rede de confiança zero entre serviços.", "In **mutual TLS** (mTLS), the server also demands a certificate from the client and validates it against the CA. Each service gets a **cryptographic identity** (for example, `orders` or `payments`), and whoever does not present a valid certificate is refused before any business logic. It is the basic building block of a zero-trust network between services."]),
      fig(["Handshake do mTLS entre dois serviços", "mTLS handshake between two services"],
        [[node("a", ["Serviço A (cliente)", "Service A (client)"], "service")], [node("b", ["Serviço B (servidor)", "Service B (server)"], "service")], [node("ca", ["CA interna", "Internal CA"], "ext")]],
        [edge("a", "b", ["1. ClientHello", "1. ClientHello"]), edge("b", "a", ["2. cert do servidor + pede cert", "2. server cert + asks for cert"], { dashed: true }), edge("a", "b", ["3. cert do cliente", "3. client cert"]), edge("ca", "a", ["emite e assina", "issues and signs"], { dashed: true }), edge("ca", "b", ["emite e assina", "issues and signs"], { dashed: true })]),
      table([["Aspecto", "Aspect"], ["TLS", "TLS"], ["mTLS", "mTLS"]],
        [["Quem se autentica", "Who authenticates"], ["Só o servidor", "Server only"], ["Servidor e cliente", "Server and client"]],
        [["Certificados a gerenciar", "Certificates to manage"], ["Um por servidor", "One per server"], ["Um por serviço (cliente e servidor)", "One per service (client and server)"]],
        [["Uso típico", "Typical use"], ["Navegador para site", "Browser to website"], ["Serviço para serviço, APIs B2B", "Service to service, B2B APIs"]],
        [["Proteção", "Protection"], ["Sigilo e integridade", "Confidentiality and integrity"], ["Sigilo, integridade e identidade do cliente", "Confidentiality, integrity and client identity"]],
      ),
      h(["Certificados, CA interna e rotação", "Certificates, internal CA and rotation"]),
      p(["Para mTLS você precisa de uma **CA interna** (ou intermediária) que emita certificados para os serviços. O desafio é operacional: certificados **expiram**, e um certificado vencido derruba a comunicação. Por isso a prática moderna é emitir certificados de **vida curta** (horas ou poucos dias) e **renová-los automaticamente**, de modo que o vazamento de uma chave tenha janela de uso pequena e a revogação seja menos crítica. Ferramentas: **cert-manager** no Kubernetes, **Vault PKI**, **Let's Encrypt** (via ACME, para certificados públicos) e as CAs embutidas das service meshes. Boas práticas: guarde a chave da CA raiz offline, use uma CA intermediária para emitir, monitore a data de expiração e teste a renovação antes de precisar dela.", "For mTLS you need an **internal CA** (or intermediate) that issues certificates to services. The challenge is operational: certificates **expire**, and an expired certificate breaks communication. So modern practice is to issue **short-lived** certificates (hours or a few days) and **renew them automatically**, so a leaked key has a small window of use and revocation matters less. Tools: **cert-manager** on Kubernetes, **Vault PKI**, **Let's Encrypt** (via ACME, for public certificates) and the built-in CAs of service meshes. Good practices: keep the root CA key offline, use an intermediate CA for issuing, monitor expiry dates and test renewal before you need it."]),
      h(["Service mesh: Istio e Linkerd", "Service mesh: Istio and Linkerd"]),
      p(["Implementar mTLS em cada linguagem e cada serviço é trabalhoso. Uma **service mesh** o move para a infraestrutura: um **proxy sidecar** (Envoy no Istio, `linkerd2-proxy` no Linkerd) é colocado ao lado de cada instância, intercepta todo o tráfego de entrada e saída e faz mTLS, retentativas, timeouts e métricas de forma transparente. Um **plano de controle** distribui configuração e emite os certificados (o Istio, pelo `istiod`; o Linkerd, por seu *identity controller*). A aplicação fala HTTP simples com o sidecar local, e os sidecars falam mTLS entre si.", "Implementing mTLS in every language and every service is laborious. A **service mesh** moves it into the infrastructure: a **sidecar proxy** (Envoy in Istio, `linkerd2-proxy` in Linkerd) is placed beside each instance, intercepts all inbound and outbound traffic and does mTLS, retries, timeouts and metrics transparently. A **control plane** distributes configuration and issues certificates (Istio through `istiod`; Linkerd through its identity controller). The application speaks plain HTTP to the local sidecar, and the sidecars speak mTLS to each other."]),
      fig(["Service mesh: sidecars fazem o mTLS", "Service mesh: sidecars do the mTLS"],
        [[node("ap1", "App A", "service")], [node("sc1", "Sidecar A", "edge")], [node("sc2", "Sidecar B", "edge")], [node("ap2", "App B", "service")]],
        [edge("ap1", "sc1", "HTTP"), edge("sc1", "sc2", "mTLS"), edge("sc2", "ap2", "HTTP")]),
      code(`# Istio: require mTLS for every workload in the namespace
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata: { name: default, namespace: shop }
spec:
  mtls: { mode: STRICT }
---
# Only the "orders" identity may call "payments" with POST /charge
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata: { name: payments-allow-orders, namespace: shop }
spec:
  selector: { matchLabels: { app: payments } }
  action: ALLOW
  rules:
    - from:
        - source: { principals: ["cluster.local/ns/shop/sa/orders"] }
      to:
        - operation: { methods: ["POST"], paths: ["/charge"] }`),
      p(["Os custos da mesh são reais: consumo extra de CPU e memória por sidecar, uma pequena latência por salto, mais componentes a operar e uma curva de aprendizado. O Istio tem mais recursos e mais complexidade; o Linkerd privilegia simplicidade e leveza. O Istio também oferece o modo *ambient*, sem sidecar por pod. Avalie se o ganho compensa; para poucos serviços, uma biblioteca ou o próprio gateway podem bastar.", "The costs of a mesh are real: extra CPU and memory per sidecar, a small latency per hop, more components to operate and a learning curve. Istio has more features and more complexity; Linkerd favors simplicity and lightness. Istio also offers an *ambient* mode, without a sidecar per pod. Evaluate whether the gain is worth it; for a few services, a library or the gateway itself may be enough."]),
      h(["Autenticação e autorização: JWT e OAuth entre serviços", "Authentication and authorization: JWT and OAuth between services"]),
      p(["O mTLS responde 'qual **serviço** está chamando'. Muitas vezes também é preciso saber **em nome de quem**: o usuário final. Para isso se usam tokens. Um **JWT** (JSON Web Token) é um token assinado com três partes (cabeçalho, claims e assinatura) que carrega afirmações como `sub` (sujeito), `iss` (emissor), `aud` (destinatário), `exp` (validade) e papéis. O serviço valida a assinatura com a chave pública do emissor (obtida de um endpoint JWKS), confere `exp` e `aud` e decide a autorização. Dois fluxos do **OAuth 2.0** são comuns:", "mTLS answers 'which **service** is calling'. Often you also need to know **on behalf of whom**: the end user. Tokens are used for this. A **JWT** (JSON Web Token) is a signed token with three parts (header, claims and signature) that carries assertions such as `sub` (subject), `iss` (issuer), `aud` (audience), `exp` (expiry) and roles. The service validates the signature with the issuer's public key (obtained from a JWKS endpoint), checks `exp` and `aud` and decides authorization. Two **OAuth 2.0** flows are common:"]),
      ul(
        ["**Client Credentials:** o serviço se autentica no servidor de autorização com as próprias credenciais e recebe um token de acesso para chamar outro serviço, sem usuário envolvido (jobs, integrações).", "**Client Credentials:** the service authenticates to the authorization server with its own credentials and receives an access token to call another service, with no user involved (jobs, integrations)."],
        ["**Propagação do token do usuário:** o gateway valida o token do usuário e o repassa (ou o troca, via *token exchange*, RFC 8693, por um token com escopo e audiência menores para o serviço seguinte). Assim o usuário não ganha poderes que o serviço intermediário tem.", "**User token propagation:** the gateway validates the user token and forwards it (or exchanges it, via *token exchange*, RFC 8693, for a token with narrower scope and audience for the next service). This keeps the user from gaining powers the intermediate service has."],
      ),
      p(["Cuidados com JWT: validar sempre a assinatura e rejeitar o algoritmo `none`; verificar `aud` e `exp`; usar tokens de vida curta; não colocar dados sensíveis no corpo, pois é apenas codificado, não cifrado; e lembrar que um JWT não se revoga antes de expirar sem uma lista de bloqueio.", "JWT cautions: always validate the signature and reject the `none` algorithm; check `aud` and `exp`; use short-lived tokens; do not put sensitive data in the body, since it is only encoded, not encrypted; and remember a JWT cannot be revoked before it expires without a blocklist."]),
      h(["SPIFFE e SPIRE: identidade de carga de trabalho", "SPIFFE and SPIRE: workload identity"]),
      p(["O **SPIFFE** (Secure Production Identity Framework for Everyone) é um padrão para dar a cada carga de trabalho uma identidade verificável, independente de IP ou rede. A identidade é um **SPIFFE ID**, uma URI como `spiffe://example.org/ns/shop/sa/orders`, entregue em um documento chamado **SVID**, que pode ser um certificado X.509 (para mTLS) ou um JWT. O **SPIRE** é a implementação de referência: seus *agents* **atestam** a carga de trabalho (por exemplo, pelo service account do Kubernetes e pelo nó) antes de emitir o SVID, e o renovam automaticamente. Essa abordagem funciona em Kubernetes, VMs e várias nuvens, e é a base de identidades de serviço do Istio e de outros.", "**SPIFFE** (Secure Production Identity Framework for Everyone) is a standard for giving each workload a verifiable identity, independent of IP or network. The identity is a **SPIFFE ID**, a URI such as `spiffe://example.org/ns/shop/sa/orders`, delivered in a document called an **SVID**, which can be an X.509 certificate (for mTLS) or a JWT. **SPIRE** is the reference implementation: its *agents* **attest** the workload (for example, through the Kubernetes service account and the node) before issuing the SVID, and renew it automatically. This approach works on Kubernetes, VMs and several clouds, and is the basis of service identities in Istio and others."]),
      h(["Zero trust", "Zero trust"]),
      p(["**Zero trust** ('nunca confie, sempre verifique') abandona a ideia de que estar dentro da rede dá confiança. Cada requisição é autenticada, autorizada e criptografada, independentemente de origem. Seus princípios: **identidade forte** para pessoas e cargas de trabalho; **privilégio mínimo** (cada serviço só pode chamar o que precisa, e cada token só tem o escopo necessário); **assumir invasão** (limitar o raio de ação de um comprometimento por segmentação); **verificação contínua** e registro de auditoria de todas as decisões. A combinação de mTLS, identidades SPIFFE, políticas de autorização e network policies é a implementação prática entre serviços.", "**Zero trust** ('never trust, always verify') abandons the idea that being inside the network grants trust. Every request is authenticated, authorized and encrypted, regardless of origin. Its principles: **strong identity** for people and workloads; **least privilege** (each service may only call what it needs, and each token has only the required scope); **assume breach** (limit the blast radius of a compromise through segmentation); and **continuous verification** and audit logging of all decisions. The combination of mTLS, SPIFFE identities, authorization policies and network policies is the practical implementation between services."]),
      h(["Gestão de segredos e Vault", "Secrets management and Vault"]),
      p(["Senhas de banco, chaves de API e chaves privadas **não devem** estar no código, em imagens de contêiner nem em variáveis de ambiente versionadas. O **HashiCorp Vault** (e alternativas como AWS Secrets Manager, Google Secret Manager e Azure Key Vault) centraliza segredos com criptografia, controle de acesso por política, **auditoria** de cada leitura e **rotação**. Duas capacidades se destacam: **segredos dinâmicos**, em que o Vault cria sob demanda uma credencial de banco com validade curta (por exemplo, 1 hora) para cada instância, revogando-a ao fim, e o **Vault PKI**, que emite certificados de vida curta. A aplicação se autentica no Vault com sua identidade (service account do Kubernetes, papel de nuvem), nunca com uma senha fixa. Resolve-se assim o 'segredo zero': a primeira credencial vem da identidade da plataforma.", "Database passwords, API keys and private keys **must not** be in code, in container images or in versioned environment variables. **HashiCorp Vault** (and alternatives such as AWS Secrets Manager, Google Secret Manager and Azure Key Vault) centralizes secrets with encryption, policy-based access control, **auditing** of every read and **rotation**. Two capabilities stand out: **dynamic secrets**, where Vault creates on demand a short-lived database credential (for example, 1 hour) for each instance, revoking it at the end, and **Vault PKI**, which issues short-lived certificates. The application authenticates to Vault with its identity (Kubernetes service account, cloud role), never with a fixed password. This solves the 'secret zero' problem: the first credential comes from the platform identity."]),
      h(["Network policies e defesa em profundidade", "Network policies and defense in depth"]),
      p(["No Kubernetes, por padrão todos os pods se falam. As **NetworkPolicies** definem quem pode falar com quem, na camada de rede (IPs, portas, rótulos), e são aplicadas pelo plugin de rede (Calico, Cilium). A prática segura é **negar tudo por padrão** e liberar apenas os fluxos necessários. Elas complementam, e não substituem, o mTLS: a policy corta caminhos de rede; o mTLS e a autorização verificam identidade.", "In Kubernetes, by default all pods can talk to each other. **NetworkPolicies** define who may talk to whom, at the network layer (IPs, ports, labels), and are enforced by the network plugin (Calico, Cilium). The safe practice is **deny everything by default** and open only the necessary flows. They complement, not replace, mTLS: the policy cuts network paths; mTLS and authorization verify identity."]),
      code(`# deny all ingress to pods in the namespace, then allow only orders -> payments
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny, namespace: shop }
spec:
  podSelector: {}
  policyTypes: [Ingress]
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-orders-to-payments, namespace: shop }
spec:
  podSelector: { matchLabels: { app: payments } }
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector: { matchLabels: { app: orders } }
      ports:
        - { protocol: TCP, port: 8443 }`),
      table([["Camada", "Layer"], ["Mecanismo", "Mechanism"], ["Protege contra", "Protects against"]],
        [["Rede", "Network"], ["Network policies, segmentação", "Network policies, segmentation"], ["Movimento lateral", "Lateral movement"]],
        [["Transporte", "Transport"], ["TLS e mTLS", "TLS and mTLS"], ["Escuta, adulteração, falsificação de serviço", "Eavesdropping, tampering, service spoofing"]],
        [["Identidade", "Identity"], ["SPIFFE, certificados curtos", "SPIFFE, short-lived certificates"], ["Serviço impostor", "Impostor service"]],
        [["Aplicação", "Application"], ["JWT, OAuth, políticas de autorização", "JWT, OAuth, authorization policies"], ["Uso indevido de permissões", "Misuse of permissions"]],
        [["Segredos", "Secrets"], ["Vault, rotação", "Vault, rotation"], ["Vazamento de credenciais", "Credential leaks"]],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Confiar no perímetro e deixar o tráfego interno em texto claro.", "Trusting the perimeter and leaving internal traffic in clear text."],
        ["Certificados de vida longa, sem automação de renovação, que expiram numa sexta à noite.", "Long-lived certificates with no renewal automation, which expire on a Friday night."],
        ["Modo mTLS permissivo deixado ligado para sempre; passe a STRICT depois da migração.", "Permissive mTLS mode left on forever; switch to STRICT after migration."],
        ["Tokens com escopo amplo, repassados indefinidamente entre serviços.", "Broadly scoped tokens passed along indefinitely between services."],
        ["Segredos em repositórios ou variáveis de ambiente de pipelines sem proteção.", "Secrets in repositories or unprotected pipeline environment variables."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["O perímetro não basta: autentique, autorize e cifre também o tráfego interno.", "The perimeter is not enough: authenticate, authorize and encrypt internal traffic too."],
        ["mTLS dá identidade a cada serviço; certificados de vida curta e rotação automática são essenciais.", "mTLS gives each service an identity; short-lived certificates and automatic rotation are essential."],
        ["Service mesh (Istio, Linkerd) leva o mTLS e as políticas para a infraestrutura, ao custo de complexidade.", "A service mesh (Istio, Linkerd) moves mTLS and policies into the infrastructure, at the cost of complexity."],
        ["JWT e OAuth carregam o usuário; SPIFFE padroniza a identidade das cargas de trabalho.", "JWT and OAuth carry the user; SPIFFE standardizes workload identity."],
        ["Vault guarda segredos e emite credenciais dinâmicas; network policies limitam o alcance de um invasor.", "Vault stores secrets and issues dynamic credentials; network policies limit an attacker's reach."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**mTLS substitui JWT?** Não: mTLS identifica o serviço; o JWT identifica o usuário e suas permissões. Costumam coexistir.", "**Does mTLS replace JWT?** No: mTLS identifies the service; the JWT identifies the user and their permissions. They usually coexist."],
        ["**Preciso de service mesh para ter mTLS?** Não; dá para usar bibliotecas e cert-manager. A mesh poupa esforço em frotas grandes e heterogêneas.", "**Do I need a service mesh to have mTLS?** No; libraries and cert-manager work. The mesh saves effort in large, heterogeneous fleets."],
        ["**Qual a validade ideal de um certificado?** Quanto menor, melhor, desde que a renovação seja automática e confiável; horas a poucos dias é comum em meshes.", "**What is the ideal certificate lifetime?** The shorter the better, as long as renewal is automatic and reliable; hours to a few days is common in meshes."],
        ["**Variáveis de ambiente são aceitáveis para segredos?** São melhores que o código, mas vazam em dumps e logs; prefira volumes montados ou acesso direto ao Vault.", "**Are environment variables acceptable for secrets?** They beat code, but leak in dumps and logs; prefer mounted volumes or direct Vault access."],
      ),
      tip(["Ordem prática de adoção: TLS em tudo, mTLS com certificados curtos, autorização por identidade de serviço e, só então, refinamentos como tokens com escopo mínimo e segredos dinâmicos.", "Practical adoption order: TLS everywhere, mTLS with short-lived certificates, authorization by service identity and only then refinements such as minimum-scope tokens and dynamic secrets."]),
    ] },
  { id: "problemas-de-projeto-em-sistemas-distribuidos", section: "distribuidos", level: 2, icon: "extension", minutes: 13,
    title: ["Problemas de projeto em sistemas distribuídos", "Design issues in distributed systems"],
    summary: ["Transparência, heterogeneidade, concorrência, falhas, escalabilidade, segurança, consistência e partições, com o mapa problema e técnica.", "Transparency, heterogeneity, concurrency, failures, scalability, security, consistency and partitions, with a problem-to-technique map."],
    body: [
      p(["Projetar um sistema distribuído é, em boa parte, **listar os problemas que a distribuição cria e escolher técnicas para cada um**. Os livros clássicos (Coulouris, Tanenbaum) organizam esses problemas em um conjunto de metas de projeto que reaparece em qualquer sistema, de um banco replicado a uma plataforma de microsserviços. Este artigo percorre cada um, diz por que é difícil e aponta as técnicas usuais, fechando com uma tabela que liga problema a solução e com um roteiro de decisão.", "Designing a distributed system is largely about **listing the problems that distribution creates and choosing techniques for each**. The classic textbooks (Coulouris, Tanenbaum) organize these problems into a set of design goals that reappears in any system, from a replicated database to a microservice platform. This article goes through each one, says why it is hard and points out the usual techniques, closing with a table linking problem to solution and a decision roadmap."]),
      h(["Transparência", "Transparency"]),
      p(["**Transparência** é esconder do usuário (e do programador) que o sistema é distribuído, para que ele pareça um só. Há várias formas:", "**Transparency** means hiding from the user (and the programmer) that the system is distributed, so that it looks like one. There are several forms:"]),
      table([["Tipo", "Type"], ["Esconde", "Hides"], ["Exemplo", "Example"]],
        [["Acesso", "Access"], ["Diferenças de representação e de como se acessa", "Differences in representation and in how things are accessed"], ["Uma API que funciona igual para dados locais e remotos", "An API that works the same for local and remote data"]],
        [["Localização", "Location"], ["Onde o recurso está", "Where the resource is"], ["Nomes lógicos e DNS em vez de IPs", "Logical names and DNS instead of IPs"]],
        [["Migração", "Migration"], ["Que o recurso mudou de lugar", "That the resource moved"], ["Mover um serviço de datacenter sem mudar clientes", "Moving a service between datacenters without changing clients"]],
        [["Replicação", "Replication"], ["Que existem várias cópias", "That several copies exist"], ["Ler de qualquer réplica do banco", "Reading from any database replica"]],
        [["Concorrência", "Concurrency"], ["Que outros usuários usam o recurso", "That other users use the resource"], ["Transações isoladas", "Isolated transactions"]],
        [["Falha", "Failure"], ["Que um componente falhou e foi recuperado", "That a component failed and recovered"], ["Failover automático", "Automatic failover"]],
      ),
      p(["A transparência total é uma **armadilha**. Como lembra o artigo de Waldo e colegas ('A Note on Distributed Computing'), tratar chamadas remotas como locais esconde latência, falha parcial e erros de rede que o programador precisa tratar. Esconda o que for seguro (localização, replicação), mas exponha o que importa (prazos, erros, possibilidade de resultado incerto).", "Full transparency is a **trap**. As the paper by Waldo and colleagues ('A Note on Distributed Computing') reminds us, treating remote calls as local ones hides latency, partial failure and network errors that the programmer must handle. Hide what is safe (location, replication), but expose what matters (deadlines, errors, the possibility of an uncertain result)."]),
      h(["Heterogeneidade", "Heterogeneity"]),
      p(["Componentes diferem em hardware, sistema operacional, linguagem, versão e rede. A técnica clássica é concordar em **padrões e protocolos** (HTTP, gRPC, JSON, Protobuf), usar **camadas de abstração** (*middleware*) e definir **contratos** explícitos de API com versionamento e compatibilidade em ambos os sentidos: o novo servidor aceita clientes antigos (*backward compatible*) e o cliente antigo ignora campos que não conhece (*forward compatible*). Contêineres e máquinas virtuais uniformizam o ambiente de execução. Esquemas como Protobuf, Avro e OpenAPI ajudam a evoluir mensagens sem quebrar consumidores.", "Components differ in hardware, operating system, language, version and network. The classic technique is to agree on **standards and protocols** (HTTP, gRPC, JSON, Protobuf), use **abstraction layers** (*middleware*) and define explicit API **contracts** with versioning and compatibility in both directions: the new server accepts old clients (*backward compatible*) and the old client ignores fields it does not know (*forward compatible*). Containers and virtual machines standardize the runtime environment. Schemas such as Protobuf, Avro and OpenAPI help evolve messages without breaking consumers."]),
      h(["Concorrência", "Concurrency"]),
      p(["Vários clientes acessam o mesmo recurso ao mesmo tempo, em máquinas diferentes, sem memória compartilhada. Condições de corrida (dois saques simultâneos sobre o mesmo saldo) exigem controle: **bloqueios** distribuídos (com lease e fencing), **concorrência otimista** (versionar a linha e rejeitar a atualização se a versão mudou, o *compare-and-set*), **transações** com níveis de isolamento, filas que serializam o acesso a um recurso e estruturas de dados que **convergem** sem coordenação (CRDTs). A escolha é entre coordenar (correto e mais lento) e tolerar conflito (rápido, com reconciliação depois).", "Several clients access the same resource at once, on different machines, without shared memory. Race conditions (two simultaneous withdrawals from the same balance) require control: distributed **locks** (with lease and fencing), **optimistic concurrency** (version the row and reject the update if the version changed, *compare-and-set*), **transactions** with isolation levels, queues that serialize access to a resource and data structures that **converge** without coordination (CRDTs). The choice is between coordinating (correct and slower) and tolerating conflict (fast, with reconciliation later)."]),
      code(`-- optimistic concurrency: update only if nobody changed the row since we read it
UPDATE accounts
   SET balance = 900, version = version + 1
 WHERE id = 7 AND version = 12;
-- 0 rows affected -> conflict: re-read and retry`),
      h(["Tratamento de falhas", "Failure handling"]),
      p(["As falhas são parciais, independentes e difíceis de detectar. As técnicas se organizam em quatro movimentos: **detectar** (heartbeats, timeouts, health checks), **mascarar** (retry, replicação, failover), **tolerar** (degradar com elegância, circuit breaker, fallback) e **recuperar** (logs de gravação antecipada, snapshots, reinício de nós, reconciliação). A **redundância** é a ferramenta central: dados replicados em várias máquinas e zonas, serviços com várias instâncias. Os padrões de resiliência (timeout, retry, breaker, bulkhead) e o uso de operações idempotentes fecham o quadro. Toda recuperação deve ser testada com injeção de falhas.", "Failures are partial, independent and hard to detect. The techniques fall into four moves: **detect** (heartbeats, timeouts, health checks), **mask** (retry, replication, failover), **tolerate** (graceful degradation, circuit breaker, fallback) and **recover** (write-ahead logs, snapshots, node restarts, reconciliation). **Redundancy** is the central tool: data replicated on several machines and zones, services with several instances. Resilience patterns (timeout, retry, breaker, bulkhead) and idempotent operations complete the picture. All recovery must be tested with fault injection."]),
      h(["Escalabilidade", "Scalability"]),
      p(["Um sistema é escalável se continua adequado quando a carga, os dados ou o número de usuários crescem. Escala-se **verticalmente** (máquina maior) até um limite, e **horizontalmente** (mais máquinas), que é o que a distribuição permite. O que impede a escala é o que **não** se divide: estado compartilhado, um nó coordenador, um banco único, bloqueios globais. As técnicas: servidores **sem estado** atrás de balanceadores, **particionamento** (*sharding*) dos dados por chave, **replicação** para leituras, **cache** e CDN, processamento **assíncrono** com filas e **distribuição geográfica**. A **lei de Amdahl** lembra que a parte serial do trabalho limita o ganho: se 5% da tarefa é serial, o ganho máximo é de 20 vezes, por mais máquinas que se adicionem. E a **lei de escala universal** (Gunther) acrescenta que o custo de coordenação pode até reduzir a vazão.", "A system is scalable if it remains adequate when load, data or number of users grow. You scale **vertically** (bigger machine) up to a limit, and **horizontally** (more machines), which is what distribution enables. What blocks scaling is what **cannot** be divided: shared state, a coordinator node, a single database, global locks. The techniques: **stateless** servers behind load balancers, data **partitioning** (*sharding*) by key, **replication** for reads, **caching** and CDN, **asynchronous** processing with queues and **geographic distribution**. **Amdahl's law** reminds us that the serial part of the work limits the gain: if 5% of the task is serial, the maximum speedup is 20x, however many machines are added. And the **universal scalability law** (Gunther) adds that coordination cost can even reduce throughput."]),
      h(["Segurança", "Security"]),
      p(["A distribuição amplia a superfície de ataque: cada link de rede e cada serviço é uma porta. É preciso **autenticar** quem chama (mTLS, tokens), **autorizar** com privilégio mínimo, **cifrar** o tráfego e os dados em repouso, **auditar** acessos, proteger **segredos** e limitar o dano de um comprometimento com segmentação de rede. Os problemas específicos incluem ataques de repetição (*replay*), falsificação de identidade, negação de serviço e a confiança entre organizações diferentes. O artigo sobre comunicação segura entre serviços detalha essas técnicas.", "Distribution widens the attack surface: each network link and each service is a door. You must **authenticate** callers (mTLS, tokens), **authorize** with least privilege, **encrypt** traffic and data at rest, **audit** accesses, protect **secrets** and limit the damage of a compromise with network segmentation. Specific problems include replay attacks, identity spoofing, denial of service and trust between different organizations. The article on secure service communication details these techniques."]),
      h(["Consistência e replicação", "Consistency and replication"]),
      p(["Para ser rápido e disponível, o dado é copiado. Copiar cria o problema de manter as cópias de acordo. Há um espectro de **modelos de consistência**, do mais forte ao mais fraco: **linearizável** (cada operação parece acontecer num instante, na ordem do tempo real, como se houvesse uma só cópia), **sequencial**, **causal** (respeita a relação causa e efeito), **leitura do que escreveu** (*read-your-writes*) e **eventual** (as réplicas convergem se as escritas cessarem). Quanto mais forte, mais coordenação e latência. A replicação pode ser **síncrona** (espera as réplicas, consistente, mais lenta) ou **assíncrona** (rápida, mas pode perder escritas num failover e mostrar dados atrasados). Para resolver conflitos de escritas concorrentes usam-se vector clocks, regras de negócio, *last-write-wins* (simples e com perda de dados) ou CRDTs.", "To be fast and available, data is copied. Copying creates the problem of keeping the copies in agreement. There is a spectrum of **consistency models**, from strongest to weakest: **linearizable** (each operation appears to happen at one instant, in real-time order, as if there were a single copy), **sequential**, **causal** (respects cause and effect), **read-your-writes** and **eventual** (replicas converge if writes stop). The stronger, the more coordination and latency. Replication can be **synchronous** (waits for replicas, consistent, slower) or **asynchronous** (fast, but may lose writes on failover and show stale data). To resolve concurrent write conflicts, vector clocks, business rules, *last-write-wins* (simple, with data loss) or CRDTs are used."]),
      h(["Partições de rede e o teorema CAP", "Network partitions and the CAP theorem"]),
      p(["Uma **partição** divide os nós em grupos que não conseguem se falar, embora todos estejam vivos. O **teorema CAP** (Brewer, formalizado por Gilbert e Lynch) afirma que, **durante uma partição**, é preciso escolher entre **consistência** (recusar operações para não divergir) e **disponibilidade** (responder, aceitando divergir). Como partições acontecem, o 'P' não é opcional. Sistemas **CP** (etcd, ZooKeeper, bancos com consenso) recusam escritas na minoria. Sistemas **AP** (Cassandra e Dynamo em configurações de quórum baixo) aceitam escritas dos dois lados e reconciliam depois. O **PACELC** completa: *se há partição (P), escolha A ou C; senão (E, else), escolha entre latência (L) e consistência (C)*. Mesmo sem partição, consistência forte custa latência.", "A **partition** splits the nodes into groups that cannot talk to each other, although all are alive. The **CAP theorem** (Brewer, formalized by Gilbert and Lynch) states that, **during a partition**, you must choose between **consistency** (refuse operations to avoid diverging) and **availability** (answer, accepting divergence). Since partitions happen, the 'P' is not optional. **CP** systems (etcd, ZooKeeper, databases with consensus) refuse writes on the minority side. **AP** systems (Cassandra and Dynamo with low quorum settings) accept writes on both sides and reconcile later. **PACELC** completes it: *if partition (P), choose A or C; else (E), choose between latency (L) and consistency (C)*. Even with no partition, strong consistency costs latency."]),
      fig(["Uma partição de rede forçando a escolha", "A network partition forcing the choice"],
        [[node("c1", ["Cliente 1", "Client 1"], "client")], [node("n1", ["Lado A (maioria)", "Side A (majority)"], "service")], [node("n2", ["Lado B (minoria)", "Side B (minority)"], "service")], [node("c2", ["Cliente 2", "Client 2"], "client")]],
        [edge("c1", "n1", ["escreve: aceita", "writes: accepted"]), edge("n1", "n2", ["partição", "partition"], { dashed: true, both: true }), edge("c2", "n2", ["CP: recusa / AP: aceita", "CP: refuses / AP: accepts"])]),
      h(["Outros problemas: ordem, tempo e detecção de falhas", "Other problems: ordering, time and failure detection"]),
      ul(
        ["**Ordem e tempo:** sem relógio global, usa-se relógios lógicos (Lamport, vetores) ou consenso para ordenar eventos.", "**Ordering and time:** without a global clock, logical clocks (Lamport, vectors) or consensus are used to order events."],
        ["**Detecção de falhas:** não distingue lento de morto; use detectores adaptativos (como o *phi accrual*) e aceite falsos positivos.", "**Failure detection:** it cannot tell slow from dead; use adaptive detectors (such as *phi accrual*) and accept false positives."],
        ["**Descoberta e nomes:** serviços mudam de endereço; use registro de serviços, DNS e balanceadores.", "**Discovery and naming:** services change address; use service registries, DNS and load balancers."],
        ["**Observabilidade:** sem logs, métricas e traces correlacionados, nenhum problema anterior é depurável.", "**Observability:** without correlated logs, metrics and traces, none of the earlier problems is debuggable."],
        ["**Evolução:** atualizar sem parar, com versões diferentes convivendo (implantação gradual, compatibilidade de contratos).", "**Evolution:** upgrading without downtime, with different versions coexisting (gradual rollout, contract compatibility)."],
      ),
      h(["Mapa: problema e técnica", "Map: problem and technique"]),
      table([["Problema", "Problem"], ["Técnica", "Technique"], ["Custo", "Cost"]],
        [["Heterogeneidade", "Heterogeneity"], ["Protocolos padrão, contratos versionados, contêineres", "Standard protocols, versioned contracts, containers"], ["Disciplina de compatibilidade", "Compatibility discipline"]],
        [["Concorrência", "Concurrency"], ["Locks com fencing, concorrência otimista, filas, CRDTs", "Locks with fencing, optimistic concurrency, queues, CRDTs"], ["Latência ou reconciliação", "Latency or reconciliation"]],
        [["Falhas parciais", "Partial failures"], ["Timeout, retry com jitter, circuit breaker, replicação, idempotência", "Timeout, retry with jitter, circuit breaker, replication, idempotency"], ["Complexidade e capacidade extra", "Complexity and extra capacity"]],
        [["Escalabilidade", "Scalability"], ["Stateless, sharding, cache, filas, replicação de leitura", "Stateless, sharding, caching, queues, read replication"], ["Operação e consistência mais fraca", "Operations and weaker consistency"]],
        [["Segurança", "Security"], ["mTLS, tokens, privilégio mínimo, Vault, network policies", "mTLS, tokens, least privilege, Vault, network policies"], ["Gestão de identidades e segredos", "Identity and secret management"]],
        [["Consistência", "Consistency"], ["Consenso, quóruns, replicação síncrona, modelos causais", "Consensus, quorums, synchronous replication, causal models"], ["Latência e disponibilidade", "Latency and availability"]],
        [["Partições", "Partitions"], ["Escolha CP ou AP por operação, reconciliação, quórum", "Choose CP or AP per operation, reconciliation, quorum"], ["Recusar ou divergir", "Refusing or diverging"]],
        [["Ordem de eventos", "Event ordering"], ["Lamport, vector clocks, log replicado", "Lamport, vector clocks, replicated log"], ["Metadados e coordenação", "Metadata and coordination"]],
        [["Transações entre serviços", "Cross-service transactions"], ["Saga, outbox, 2PC dentro de um banco", "Saga, outbox, 2PC inside a database"], ["Estados intermediários visíveis", "Visible intermediate states"]],
        [["Depuração", "Debugging"], ["Logs estruturados, métricas, traces com OpenTelemetry", "Structured logs, metrics, traces with OpenTelemetry"], ["Volume de dados e custo", "Data volume and cost"]],
      ),
      h(["Um roteiro de decisão", "A decision roadmap"]),
      ul(
        ["1. Precisa mesmo distribuir? Se uma máquina com réplica basta, pare aqui.", "1. Do you really need to distribute? If one machine with a replica is enough, stop here."],
        ["2. Defina os requisitos de disponibilidade, latência, volume e consistência de **cada dado**, não do sistema inteiro.", "2. Define availability, latency, volume and consistency requirements for **each piece of data**, not the whole system."],
        ["3. Escolha o modelo de consistência mais fraco que o negócio tolera (dinheiro e estoque pedem mais; curtidas e contadores toleram menos).", "3. Pick the weakest consistency model the business tolerates (money and stock need more; likes and counters need less)."],
        ["4. Projete as falhas: o que acontece quando cada dependência cai, atrasa ou responde errado?", "4. Design for failures: what happens when each dependency goes down, slows down or answers wrongly?"],
        ["5. Torne as operações idempotentes e os contratos versionados.", "5. Make operations idempotent and contracts versioned."],
        ["6. Instrumente antes de escalar: sem observabilidade você não sabe o que melhorar.", "6. Instrument before scaling: without observability you do not know what to improve."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Buscar consistência forte e disponibilidade total para todos os dados, o que é impossível durante partições.", "Seeking strong consistency and full availability for all data, which is impossible during partitions."],
        ["Esconder a rede por trás de uma abstração e esquecer prazos, retentativas e erros parciais.", "Hiding the network behind an abstraction and forgetting deadlines, retries and partial errors."],
        ["Escalar horizontalmente um sistema com um gargalo serial (banco único, lock global).", "Scaling out a system with a serial bottleneck (single database, global lock)."],
        ["Tratar segurança como etapa final, em vez de requisito desde o início.", "Treating security as a final step instead of a requirement from the start."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Os problemas centrais: transparência, heterogeneidade, concorrência, falhas, escalabilidade, segurança, consistência e partições.", "The central problems: transparency, heterogeneity, concurrency, failures, scalability, security, consistency and partitions."],
        ["Esconda o que for seguro e exponha o que importa.", "Hide what is safe and expose what matters."],
        ["Durante uma partição, escolha entre consistência e disponibilidade, por operação.", "During a partition, choose between consistency and availability, per operation."],
        ["Cada problema tem técnicas conhecidas e todas têm custo; a decisão é trocar um custo por outro, de forma consciente.", "Each problem has known techniques and all have a cost; the decision is to trade one cost for another, consciously."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Qual o problema mais difícil?** Em geral, as falhas parciais combinadas com consistência: é aí que surgem os bugs raros.", "**What is the hardest problem?** Usually partial failures combined with consistency: that is where rare bugs come from."],
        ["**CAP significa escolher 2 de 3?** É uma simplificação; a escolha só existe durante uma partição, e pode variar por operação.", "**Does CAP mean pick 2 of 3?** It is a simplification; the choice only exists during a partition, and may vary per operation."],
        ["**Transparência total é desejável?** Não; esconder latência e falha induz erros. Esconda a localização, mostre os limites.", "**Is full transparency desirable?** No; hiding latency and failure induces errors. Hide location, show limits."],
        ["**Por onde começar um projeto novo?** Pelos requisitos por dado e pelos modos de falha, depois a arquitetura.", "**Where to start a new project?** With per-data requirements and failure modes, then the architecture."],
      ),
      tip(["Um bom exercício de projeto: para cada seta do seu diagrama de arquitetura, escreva ao lado o que acontece se ela atrasar, falhar ou duplicar a mensagem.", "A good design exercise: for each arrow in your architecture diagram, write beside it what happens if it is slow, fails or duplicates the message."]),
    ] },
];

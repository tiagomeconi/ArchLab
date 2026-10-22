import { h, p, ul, tip, code, table, fig, node, edge, type DocArticle } from "./kit";

/** Seção "mensageria". */
export const ARTICLES: DocArticle[] = [
  { id: "filas-e-assincrono", section: "mensageria", level: 1, icon: "stacks", minutes: 12,
    title: ["Filas e processamento assíncrono", "Queues and asynchronous processing"],
    summary: ["Tirar o trabalho pesado do caminho do usuário, absorver picos e entender ack, visibility timeout, prefetch e backpressure.", "Taking heavy work off the user's path, absorbing spikes, and understanding ack, visibility timeout, prefetch and backpressure."],
    body: [
      p(["Nem tudo precisa acontecer *antes* de responder ao usuário. Enviar um e-mail de confirmação, gerar um relatório em PDF, redimensionar uma foto ou transcodificar um vídeo podem esperar alguns segundos, ou até minutos, sem que ninguém perceba. O problema aparece quando o sistema tenta fazer tudo isso dentro da própria requisição: a resposta fica lenta, uma falha em um serviço auxiliar derruba o pedido inteiro e um pico de tráfego esgota as threads do servidor.", "Not everything has to happen *before* answering the user. Sending a confirmation email, generating a PDF report, resizing a photo or transcoding a video can wait a few seconds, or even minutes, without anyone noticing. The problem appears when the system tries to do all of it inside the request itself: the response gets slow, a failure in a helper service takes the whole request down, and a traffic spike exhausts the server's threads."]),
      p(["Uma **fila de mensagens** (*message queue*) resolve isso colocando um intermediário entre quem pede o trabalho e quem o executa. Quem pede (o **produtor**) grava uma mensagem descrevendo a tarefa e responde ao usuário na hora. Quem executa (o **consumidor**, ou **worker**) retira mensagens da fila no seu próprio ritmo. A fila guarda o que ainda não foi feito, de forma durável, e funciona como um amortecedor entre os dois lados.", "A **message queue** solves this by placing an intermediary between whoever asks for the work and whoever performs it. The requester (the **producer**) writes a message describing the task and answers the user immediately. The executor (the **consumer**, or **worker**) takes messages from the queue at its own pace. The queue durably holds what has not yet been done and acts as a shock absorber between the two sides."]),
      fig(["Fluxo básico produtor, fila, consumidor", "Basic producer, queue, consumer flow"],
        [[node("user", ["Usuário", "User"], "client")], [node("api", "API", "service")], [node("q", ["Fila", "Queue"], "queue")], [node("w1", "Worker 1", "service"), node("w2", "Worker 2", "service")], [node("db", ["Resultado", "Result"], "data")]],
        [edge("user", "api", ["pedido", "request"]), edge("api", "q", ["enfileira", "enqueue"]), edge("q", "w1"), edge("q", "w2"), edge("w1", "db"), edge("w2", "db"), edge("api", "user", ["202 Accepted", "202 Accepted"], { dashed: true })]),
      h(["Conceitos-chave", "Key concepts"]),
      ul(
        ["**Produtor**: o componente que cria e publica mensagens. Ele não sabe quem vai consumir nem quando.", "**Producer**: the component that creates and publishes messages. It does not know who will consume them or when."],
        ["**Consumidor / worker**: o componente que retira mensagens e executa a tarefa. Pode haver dezenas de instâncias lendo da mesma fila (*competing consumers*).", "**Consumer / worker**: the component that takes messages and runs the task. Dozens of instances may read from the same queue (*competing consumers*)."],
        ["**Broker**: o servidor que armazena e distribui as mensagens (RabbitMQ, SQS, Kafka e outros).", "**Broker**: the server that stores and distributes messages (RabbitMQ, SQS, Kafka and others)."],
        ["**Mensagem**: um corpo (em geral JSON ou Protobuf), cabeçalhos (ids, tipo, timestamp, chave de correlação) e metadados do broker.", "**Message**: a body (usually JSON or Protobuf), headers (ids, type, timestamp, correlation key) and broker metadata."],
        ["**Ack (confirmação)**: sinal do consumidor dizendo que terminou com sucesso. Só então o broker pode descartar a mensagem.", "**Ack (acknowledgement)**: a signal from the consumer saying it finished successfully. Only then may the broker discard the message."],
        ["**Nack / requeue**: sinal de que o processamento falhou e a mensagem deve voltar à fila ou seguir para outro destino.", "**Nack / requeue**: a signal that processing failed and the message should return to the queue or go elsewhere."],
      ),
      h(["Como funciona passo a passo", "How it works step by step"]),
      ul(
        ["O produtor envia a mensagem ao broker e espera a confirmação de que ela foi gravada (de preferência em disco). Só depois responde ao usuário.", "The producer sends the message to the broker and waits for confirmation that it was stored (preferably on disk). Only then does it answer the user."],
        ["O broker entrega a mensagem a um consumidor disponível, marcando-a como *em andamento*.", "The broker hands the message to an available consumer, marking it as *in flight*."],
        ["O consumidor executa a tarefa. Se terminar bem, envia o **ack** e o broker apaga a mensagem. Se falhar, envia **nack** ou simplesmente some (cai, perde a conexão).", "The consumer runs the task. If it finishes, it sends the **ack** and the broker deletes the message. If it fails, it sends a **nack** or simply disappears (crashes, loses its connection)."],
        ["Sem ack dentro do prazo, o broker considera que o consumidor morreu e **reentrega** a mensagem a outro. É assim que nenhuma tarefa se perde quando um worker cai no meio do trabalho.", "Without an ack within the deadline, the broker assumes the consumer died and **redelivers** the message to another. This is how no task is lost when a worker dies mid-job."],
      ),
      h(["Ack, visibility timeout e prefetch", "Ack, visibility timeout and prefetch"]),
      p(["Existem dois jeitos de o broker saber que o consumidor ainda está vivo. No **RabbitMQ**, a mensagem fica ligada à conexão do consumidor: se a conexão cai, ela volta para a fila. No **SQS**, não há conexão persistente; em vez disso vale o **visibility timeout**: ao receber a mensagem, ela fica invisível para os outros consumidores por um tempo (30 segundos por padrão). Se o consumidor não apagar a mensagem nesse intervalo, ela reaparece. O valor deve ser maior que o tempo normal de processamento, senão duas instâncias acabam fazendo a mesma tarefa ao mesmo tempo. Tarefas longas devem estender o timeout durante a execução (um *heartbeat*).", "There are two ways for the broker to know the consumer is still alive. In **RabbitMQ**, the message is tied to the consumer's connection: if the connection drops, it returns to the queue. In **SQS** there is no persistent connection; instead the **visibility timeout** applies: once received, the message is hidden from other consumers for a while (30 seconds by default). If the consumer does not delete the message within that interval, it reappears. The value must exceed normal processing time, otherwise two instances end up doing the same task at once. Long tasks should extend the timeout while running (a *heartbeat*)."]),
      p(["O **prefetch** (também chamado de *QoS* no RabbitMQ) limita quantas mensagens sem ack o broker entrega a cada consumidor de uma vez. Com prefetch ilimitado, um worker lento acumula centenas de mensagens enquanto os vizinhos ficam ociosos. Com prefetch 1, a distribuição é justa, mas cada mensagem custa uma ida e volta de rede. Na prática, valores de 10 a 100 equilibram vazão e justiça, e tarefas longas pedem valores pequenos.", "**Prefetch** (also called *QoS* in RabbitMQ) limits how many unacknowledged messages the broker hands each consumer at once. With unlimited prefetch, one slow worker hoards hundreds of messages while its neighbors sit idle. With prefetch 1, distribution is fair, but each message costs a network round trip. In practice values from 10 to 100 balance throughput and fairness, and long tasks call for small values."]),
      h(["Backpressure: quando a fila enche", "Backpressure: when the queue fills up"]),
      p(["A fila absorve picos, mas não resolve um desequilíbrio permanente. Se os produtores geram 1.000 tarefas por segundo e os consumidores processam 800, a fila cresce 200 mensagens por segundo, indefinidamente, até acabar o disco ou até a latência de ponta a ponta virar horas. O mecanismo de defesa é o **backpressure**: fazer o excesso de pressão voltar para quem o causa.", "A queue absorbs spikes, but it does not fix a permanent imbalance. If producers generate 1,000 tasks per second and consumers process 800, the queue grows by 200 messages per second, forever, until the disk runs out or end-to-end latency becomes hours. The defense is **backpressure**: pushing excess pressure back to whoever causes it."]),
      ul(
        ["**Limite de tamanho**: filas com capacidade máxima rejeitam ou bloqueiam o produtor quando enchem (o RabbitMQ tem *max-length* e controle de fluxo por conexão).", "**Size limit**: queues with a maximum capacity reject or block the producer when full (RabbitMQ has *max-length* and per-connection flow control)."],
        ["**Autoscaling pelo tamanho da fila**: adicionar workers conforme a profundidade ou a idade da mensagem mais antiga cresce.", "**Autoscaling on queue size**: add workers as depth or the age of the oldest message grows."],
        ["**Descarte controlado**: para dados que perdem valor rápido (telemetria, posição de um motorista), descartar o antigo é melhor que processar atrasado.", "**Controlled shedding**: for data that loses value quickly (telemetry, a driver's position), dropping the old is better than processing it late."],
        ["**Rate limiting na entrada**: recusar pedidos novos com 429 antes que eles virem backlog (veja o artigo de rate limiting).", "**Rate limiting at the entrance**: refuse new requests with 429 before they become backlog (see the rate limiting article)."],
      ),
      h(["Fila ou tópico?", "Queue or topic?"]),
      p(["Numa **fila** ponto a ponto, cada mensagem é entregue a *um* consumidor: serve para dividir trabalho. Num **tópico** (*publish/subscribe*), a mensagem é entregue a *todos* os grupos inscritos: serve para avisar vários sistemas sobre o mesmo fato. Os dois modelos se combinam: no Kafka, cada *consumer group* funciona como uma fila que divide o trabalho entre seus membros, e vários grupos leem o mesmo tópico de forma independente. No RabbitMQ, uma *exchange* do tipo *fanout* copia a mensagem para várias filas.", "In a point-to-point **queue**, each message goes to *one* consumer: it is for splitting work. In a **topic** (*publish/subscribe*), the message goes to *every* subscribed group: it is for telling several systems about the same fact. The two models combine: in Kafka, each *consumer group* behaves like a queue that splits work among its members, and several groups read the same topic independently. In RabbitMQ, a *fanout* exchange copies the message into several queues."]),
      table([["Aspecto", "Aspect"], ["Fila (work queue)", "Queue (work queue)"], ["Tópico (pub/sub)", "Topic (pub/sub)"]],
        [["Quem recebe", "Who receives"], ["Um consumidor por mensagem", "One consumer per message"], ["Todos os grupos inscritos", "Every subscribed group"]],
        [["Uso típico", "Typical use"], ["Dividir tarefas pesadas", "Splitting heavy tasks"], ["Notificar vários sistemas de um fato", "Notifying several systems of a fact"]],
        [["Adicionar um novo interessado", "Adding a new interested party"], ["Exige outra fila ou copiar mensagens", "Needs another queue or copying messages"], ["Basta criar um novo grupo", "Just create a new group"]],
        [["Exemplo", "Example"], ["Gerar thumbnails", "Generating thumbnails"], ["pedido.criado lido por estoque, e-mail e analytics", "order.created read by inventory, email and analytics"]]),
      h(["Priorização e work queues", "Prioritization and work queues"]),
      p(["Uma **work queue** distribui tarefas custosas entre vários workers. O padrão é simples, mas a realidade pede refinamentos. Tarefas de usuários pagantes não deveriam esperar atrás de um lote de importação de 2 milhões de linhas. Existem três abordagens: filas de **prioridade** nativas (o RabbitMQ aceita prioridade por mensagem, mas custa desempenho e só funciona bem com poucos níveis), **filas separadas** por classe de serviço (alta, normal, baixa) com mais workers dedicados às filas importantes, ou uma fila única com **particionamento por tenant** para que um cliente barulhento não monopolize os workers.", "A **work queue** spreads costly tasks across several workers. The pattern is simple, but reality needs refinements. Paying customers' tasks should not wait behind a 2-million-row import batch. There are three approaches: native **priority** queues (RabbitMQ accepts per-message priority, but it costs performance and works well only with few levels), **separate queues** per service class (high, normal, low) with more workers dedicated to the important ones, or one queue with **per-tenant partitioning** so a noisy customer cannot monopolize the workers."]),
      p(["Filas separadas são a opção mais previsível. O risco da prioridade estrita é a **inanição** (*starvation*): se sempre chegam mensagens de alta prioridade, as de baixa nunca saem. Uma solução é consumir em proporção, por exemplo 6 mensagens da fila alta para 3 da normal e 1 da baixa.", "Separate queues are the most predictable option. The risk of strict priority is **starvation**: if high-priority messages keep arriving, low-priority ones never leave. One fix is consuming in proportion, say 6 messages from the high queue for 3 from normal and 1 from low."]),
      h(["Entrega, ordem e idempotência", "Delivery, ordering and idempotency"]),
      p(["A maioria das filas oferece **pelo menos uma entrega** (*at-least-once*): como o ack pode se perder ou chegar tarde, uma mensagem pode ser entregue duas vezes. A alternativa *at-most-once* (sem reentrega) perde tarefas quando um worker cai, e *exactly-once* de verdade só existe dentro de sistemas bem delimitados (veja o artigo sobre message queues na prática). Por isso o consumidor precisa ser **idempotente**: processar duas vezes tem o mesmo efeito que processar uma. Um caminho comum é guardar o id de cada mensagem tratada numa tabela com chave única e ignorar duplicatas.", "Most queues offer **at-least-once delivery**: because the ack can be lost or arrive late, a message may be delivered twice. The *at-most-once* alternative (no redelivery) loses tasks when a worker dies, and true *exactly-once* only exists inside well-bounded systems (see the article on message queues in practice). So the consumer must be **idempotent**: processing twice has the same effect as processing once. A common route is storing the id of each handled message in a table with a unique key and ignoring duplicates."]),
      p(["Quanto à ordem, uma fila com **vários consumidores** não a preserva: a mensagem 2 pode terminar antes da 1. Se a ordem importa (as atualizações de uma mesma conta, por exemplo), é preciso particionar por chave e garantir um único consumidor por partição, como o Kafka faz.", "As for ordering, a queue with **several consumers** does not preserve it: message 2 may finish before message 1. If order matters (updates to the same account, for instance), you must partition by key and ensure a single consumer per partition, as Kafka does."]),
      h(["Mensagens que falham", "Messages that fail"]),
      p(["Uma mensagem que sempre dá erro (*poison message*) não pode travar a fila. A prática é limitar as tentativas, esperando mais a cada nova (*backoff* exponencial), e depois enviar a mensagem para uma **dead-letter queue** (DLQ), onde alguém investiga. O artigo de tratamento de erros em eventos detalha essa estratégia.", "A message that always errors (a *poison message*) cannot block the queue. The practice is limiting attempts, waiting longer after each (exponential *backoff*), and then sending the message to a **dead-letter queue** (DLQ), where someone investigates. The article on error handling in events covers this strategy in detail."]),
      h(["Exemplo: aceitar o pedido e processar depois", "Example: accept the request and process later"]),
      code(`// API: answer fast, delegate the heavy work
app.post("/reports", async (req, res) => {
  const jobId = crypto.randomUUID();
  await db.insert("jobs", { id: jobId, status: "queued", user: req.user.id });
  await queue.send({ jobId, type: "build-report", params: req.body });
  res.status(202).json({ jobId, statusUrl: "/reports/" + jobId });
});

// Worker: ack only after finishing
queue.consume(async (msg) => {
  await db.update("jobs", msg.jobId, { status: "running" });
  const file = await buildReport(msg.params);   // slow
  await db.update("jobs", msg.jobId, { status: "done", file });
  await msg.ack();
});`),
      p(["Repare no **202 Accepted** e na URL de status: o cliente consulta o andamento (polling), recebe uma notificação por WebSocket ou por webhook. A tarefa só é confirmada depois de gravar o resultado, então uma queda no meio faz a mensagem voltar e o trabalho recomeçar.", "Note the **202 Accepted** and the status URL: the client polls for progress, or gets a notification via WebSocket or webhook. The task is only acknowledged after the result is stored, so a crash midway makes the message return and the work restart."]),
      h(["Vantagens e desvantagens", "Pros and cons"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Drawbacks"]],
        [["Resposta rápida ao usuário", "Fast response to the user"], ["Resultado deixa de ser imediato; a interface precisa lidar com isso", "Result is no longer immediate; the UI must cope with it"]],
        [["Absorve picos e protege o banco", "Absorbs spikes and protects the database"], ["Mais uma peça para operar e monitorar", "One more component to run and monitor"]],
        [["Falhas isoladas e reentrega automática", "Isolated failures and automatic redelivery"], ["Duplicatas e fora de ordem exigem consumidores idempotentes", "Duplicates and out-of-order delivery demand idempotent consumers"]],
        [["Escala workers de forma independente", "Scales workers independently"], ["Depurar um fluxo assíncrono é mais difícil", "Debugging an asynchronous flow is harder"]]),
      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      ul(
        ["**Use** para tarefas lentas ou instáveis (e-mail, PDFs, mídia, integrações externas), para suavizar picos, para conectar sistemas com ritmos diferentes e para repetir automaticamente o que falhou.", "**Use it** for slow or unreliable tasks (email, PDFs, media, external integrations), to smooth spikes, to connect systems with different paces and to automatically retry what fails."],
        ["**Evite** quando o usuário precisa do resultado para continuar (a validação de um cartão no checkout costuma ser síncrona), quando a tarefa é mais barata que o custo de enfileirar, ou quando a equipe ainda não tem como monitorar e depurar fluxos assíncronos.", "**Avoid it** when the user needs the result to proceed (card validation at checkout is usually synchronous), when the task is cheaper than the cost of enqueuing, or when the team cannot yet monitor and debug asynchronous flows."],
      ),
      h(["Casos reais", "Real-world cases"]),
      p(["Lojas virtuais enfileiram o envio de e-mails e a emissão de nota fiscal depois de confirmar o pedido. Plataformas de vídeo enfileiram a transcodificação de cada upload. Serviços de pagamento enfileiram o envio de webhooks aos comerciantes, com reenvio automático. Em todos, o usuário recebe a confirmação em milissegundos e o trabalho pesado corre por trás.", "Online stores enqueue email delivery and invoice issuing after confirming the order. Video platforms enqueue transcoding of each upload. Payment services enqueue webhook delivery to merchants, with automatic retry. In all of them, the user gets confirmation in milliseconds and the heavy work runs behind the scenes."]),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Dar ack antes de terminar: se o worker cai depois do ack, a tarefa se perde.", "Acking before finishing: if the worker dies after the ack, the task is lost."],
        ["Visibility timeout menor que o tempo da tarefa: a mensagem é reentregue e processada em paralelo.", "Visibility timeout shorter than the task: the message is redelivered and processed in parallel."],
        ["Não ter DLQ nem limite de tentativas: uma mensagem ruim fica em loop e consome os workers.", "Having no DLQ or retry limit: one bad message loops and consumes the workers."],
        ["Colocar o payload inteiro (um arquivo de 50 MB) na mensagem em vez de uma referência a ele.", "Putting the whole payload (a 50 MB file) in the message instead of a reference to it."],
        ["Olhar apenas para erros e ignorar a profundidade da fila e a idade da mensagem mais antiga.", "Watching only errors and ignoring queue depth and the age of the oldest message."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["A fila desacopla produtor e consumidor no tempo e na capacidade.", "The queue decouples producer and consumer in time and capacity."],
        ["O ack só deve ser enviado após o trabalho concluir; sem ele, a mensagem é reentregue.", "The ack should only be sent after the work completes; without it, the message is redelivered."],
        ["Visibility timeout e prefetch controlam reentrega e justiça entre workers.", "Visibility timeout and prefetch control redelivery and fairness among workers."],
        ["Backpressure, limites e autoscaling evitam que a fila vire um buraco sem fundo.", "Backpressure, limits and autoscaling keep the queue from becoming a bottomless pit."],
        ["Entrega at-least-once pede consumidores idempotentes; falhas persistentes vão para uma DLQ.", "At-least-once delivery calls for idempotent consumers; persistent failures go to a DLQ."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Fila garante ordem?** Uma fila com um único consumidor, sim. Com vários consumidores em paralelo, não; é preciso particionar por chave.", "**Does a queue guarantee order?** With a single consumer, yes. With several consumers in parallel, no; you need to partition by key."],
        ["**Qual a diferença entre fila e tópico?** A fila entrega cada mensagem a um consumidor; o tópico entrega a todos os grupos inscritos.", "**What is the difference between a queue and a topic?** A queue delivers each message to one consumer; a topic delivers it to every subscribed group."],
        ["**Posso garantir que uma tarefa rode exatamente uma vez?** Na prática, entrega-se pelo menos uma vez e torna-se o efeito idempotente.", "**Can I guarantee a task runs exactly once?** In practice you deliver at least once and make the effect idempotent."],
        ["**O que fazer quando a fila só cresce?** Escalar os consumidores, otimizar a tarefa, limitar a entrada ou descartar o que perdeu valor.", "**What to do when the queue only grows?** Scale the consumers, optimize the task, limit the input or drop what lost its value."],
      ),
      tip(["Monitore a **profundidade da fila** e, mais ainda, a **idade da mensagem mais antiga**: ela mostra o atraso real que o usuário sente. Se só cresce, os workers estão mais lentos que a chegada de tarefas.", "Monitor the **queue depth** and, even more, the **age of the oldest message**: it shows the real delay users feel. If it only grows, workers are slower than arrivals."]),
    ] },

  { id: "message-queues-na-pratica", section: "mensageria", level: 1, icon: "stacks", minutes: 14,
    title: ["Message queues na prática: RabbitMQ, SQS e Kafka", "Message queues in practice: RabbitMQ, SQS and Kafka"],
    summary: ["Brokers de tarefas x logs, partições, consumer groups, offsets, retenção, compaction e garantias de entrega.", "Task brokers vs logs, partitions, consumer groups, offsets, retention, compaction and delivery guarantees."],
    body: [
      p(["Saber que existe uma fila é o começo. Na hora de escolher uma tecnologia, as diferenças importam: **RabbitMQ**, **Amazon SQS**, **Apache Kafka**, **Apache Pulsar** e **NATS** resolvem problemas parecidos de jeitos bem diferentes, e a escolha errada aparece como mensagens fora de ordem, perdidas, duplicadas ou como uma conta de infraestrutura inesperada. Este artigo compara os modelos e entra nos detalhes do Kafka, que é o mais mal entendido.", "Knowing a queue exists is only the beginning. When choosing a technology, the differences matter: **RabbitMQ**, **Amazon SQS**, **Apache Kafka**, **Apache Pulsar** and **NATS** solve similar problems in very different ways, and the wrong choice shows up as out-of-order, lost or duplicated messages, or as an unexpected infrastructure bill. This article compares the models and goes into the details of Kafka, the most misunderstood of them."]),
      h(["Dois modelos: broker de tarefas e log", "Two models: task broker and log"]),
      p(["No **RabbitMQ** e no **SQS**, a mensagem é uma tarefa: o broker entrega a um consumidor e, depois do *ack*, **apaga**. O broker cuida de quem recebeu o quê, e cada mensagem tem estado individual (disponível, em andamento, confirmada). No **Kafka**, a mensagem é um registro num **log** particionado e persistente: ela não some quando é lida, fica pelo tempo de retenção (dias, semanas ou para sempre) e cada consumidor guarda apenas o seu **offset**, a posição até onde leu. O broker é quase burro: só acrescenta no fim do log e serve leituras sequenciais, e é essa simplicidade que dá a vazão enorme.", "In **RabbitMQ** and **SQS**, a message is a task: the broker hands it to a consumer and, after the *ack*, **deletes** it. The broker tracks who received what, and each message has individual state (available, in flight, acknowledged). In **Kafka**, a message is a record in a partitioned, persistent **log**: it does not vanish when read, it stays for the retention period (days, weeks or forever) and each consumer only keeps its **offset**, how far it has read. The broker is nearly dumb: it only appends to the end of the log and serves sequential reads, and that simplicity is what gives the huge throughput."]),
      fig(["Broker de tarefas (apaga) x log (retém)", "Task broker (deletes) vs log (retains)"],
        [[node("p", ["Produtor", "Producer"], "service")], [node("q", ["Fila: msg some após ack", "Queue: msg gone after ack"], "queue"), node("lg", ["Log: msg fica, offset avança", "Log: msg stays, offset moves"], "queue")], [node("c1", ["Consumidor A", "Consumer A"], "service"), node("c2", ["Consumidor B", "Consumer B"], "service")]],
        [edge("p", "q"), edge("p", "lg"), edge("q", "c1"), edge("lg", "c2", ["lê e pode reler", "reads, can re-read"])]),
      h(["Comparação das principais tecnologias", "Comparing the main technologies"]),
      table([["Tecnologia", "Technology"], ["Modelo", "Model"], ["Pontos fortes", "Strengths"], ["Atenção", "Watch out"]],
        [["RabbitMQ", "RabbitMQ"], ["Broker com exchanges e filas (AMQP)", "Broker with exchanges and queues (AMQP)"], ["Roteamento rico, prioridades, TTL, baixa latência", "Rich routing, priorities, TTL, low latency"], ["Não é feito para reter histórico longo nem para milhões de msg/s", "Not meant for long history or millions of msg/s"]],
        [["Amazon SQS", "Amazon SQS"], ["Fila gerenciada (standard e FIFO)", "Managed queue (standard and FIFO)"], ["Sem servidores, escala quase ilimitada, integra com Lambda e SNS", "No servers, near-unlimited scale, integrates with Lambda and SNS"], ["Standard é at-least-once sem ordem; FIFO tem vazão limitada por grupo", "Standard is at-least-once without order; FIFO throughput is bounded per group"]],
        [["Apache Kafka", "Apache Kafka"], ["Log distribuído particionado", "Partitioned distributed log"], ["Vazão enorme, retenção, replay, ordem por partição, ecossistema (Connect, Streams)", "Huge throughput, retention, replay, per-partition order, ecosystem (Connect, Streams)"], ["Operação complexa; não tem roteamento rico nem ack por mensagem", "Complex to operate; no rich routing or per-message ack"]],
        [["Apache Pulsar", "Apache Pulsar"], ["Log com camada de armazenamento separada (BookKeeper)", "Log with separate storage layer (BookKeeper)"], ["Multi-tenant, assinaturas flexíveis (shared, failover, key_shared), tiered storage", "Multi-tenant, flexible subscriptions (shared, failover, key_shared), tiered storage"], ["Mais peças para operar; comunidade menor que a do Kafka", "More parts to operate; smaller community than Kafka's"]],
        [["NATS", "NATS"], ["Mensageria leve; JetStream adiciona persistência", "Lightweight messaging; JetStream adds persistence"], ["Latência muito baixa, binário pequeno, simples de operar", "Very low latency, small binary, simple to operate"], ["Sem JetStream o core é fire-and-forget (sem durabilidade)", "Without JetStream the core is fire-and-forget (no durability)"]]),
      h(["RabbitMQ em um parágrafo", "RabbitMQ in one paragraph"]),
      p(["O produtor publica numa **exchange**, que roteia para **filas** conforme regras (*bindings*). Os tipos principais são *direct* (chave exata), *topic* (padrões como `pedido.*.criado`), *fanout* (copia para todas) e *headers*. Cada fila entrega a seus consumidores com ack e prefetch. Filas *quorum* replicam via Raft e são a escolha para durabilidade; filas clássicas espelhadas estão em desuso. Cabe bem em integrações com muito roteamento e cargas moderadas.", "The producer publishes to an **exchange**, which routes to **queues** according to rules (*bindings*). The main types are *direct* (exact key), *topic* (patterns like `order.*.created`), *fanout* (copies to all) and *headers*. Each queue delivers to its consumers with ack and prefetch. *Quorum* queues replicate via Raft and are the choice for durability; mirrored classic queues are deprecated. It fits integrations with heavy routing and moderate loads."]),
      h(["SQS: standard e FIFO", "SQS: standard and FIFO"]),
      p(["A fila **standard** oferece vazão praticamente ilimitada, entrega pelo menos uma vez e ordem apenas aproximada. A fila **FIFO** preserva a ordem dentro de cada **message group id** (a chave de ordenação) e deduplica mensagens com o mesmo *deduplication id* por uma janela de 5 minutos, com limites de vazão por fila bem menores (o modo de alto throughput eleva o teto). Tudo o que não for ordenado por grupo pode ser processado em paralelo. O SQS tem DLQ nativa via *redrive policy* (`maxReceiveCount`) e retenção de até 14 dias.", "The **standard** queue offers practically unlimited throughput, at-least-once delivery and only approximate ordering. The **FIFO** queue preserves order within each **message group id** (the ordering key) and deduplicates messages with the same *deduplication id* over a 5-minute window, with much lower throughput limits per queue (high-throughput mode raises the ceiling). Whatever is not ordered by group may be processed in parallel. SQS has a native DLQ through a *redrive policy* (`maxReceiveCount`) and retention up to 14 days."]),
      h(["Kafka: tópicos, partições e brokers", "Kafka: topics, partitions and brokers"]),
      p(["Um **tópico** é dividido em **partições**, e cada partição é um log append-only ordenado, com offsets sequenciais (0, 1, 2...). A ordem é garantida **somente dentro de uma partição**, nunca entre partições. O produtor escolhe a partição: se a mensagem tem **chave**, o Kafka aplica um hash da chave e manda sempre para a mesma partição; assim todos os eventos de um mesmo cliente ficam em ordem. Sem chave, a distribuição é por lotes (*sticky*) ou round-robin. Cada partição é replicada em vários brokers: uma réplica é o **líder** (recebe escritas e leituras) e as outras são **seguidoras**. As seguidoras em sincronia formam o **ISR** (*in-sync replicas*).", "A **topic** is split into **partitions**, and each partition is an ordered append-only log with sequential offsets (0, 1, 2...). Ordering is guaranteed **only within a partition**, never across partitions. The producer picks the partition: if the message has a **key**, Kafka hashes the key and always sends it to the same partition, so all events of one customer stay in order. Without a key, distribution is batched (*sticky*) or round-robin. Each partition is replicated across brokers: one replica is the **leader** (handles writes and reads) and the others are **followers**. The followers that are caught up form the **ISR** (*in-sync replicas*)."]),
      fig(["Tópico com 3 partições e dois consumer groups", "Topic with 3 partitions and two consumer groups"],
        [[node("prod", ["Produtor (chave = cliente)", "Producer (key = customer)"], "service")], [node("p0", "Partition 0", "queue"), node("p1", "Partition 1", "queue"), node("p2", "Partition 2", "queue")], [node("a1", ["Grupo A: consumidor 1", "Group A: consumer 1"], "service"), node("a2", ["Grupo A: consumidor 2", "Group A: consumer 2"], "service"), node("b1", ["Grupo B: consumidor 1", "Group B: consumer 1"], "service")]],
        [edge("prod", "p0"), edge("prod", "p1"), edge("prod", "p2"), edge("p0", "a1"), edge("p1", "a1"), edge("p2", "a2"), edge("p0", "b1", "", { dashed: true })]),
      h(["Consumer groups e offsets", "Consumer groups and offsets"]),
      p(["Um **consumer group** é um conjunto de consumidores que cooperam: o Kafka atribui cada partição a **exatamente um** consumidor do grupo, então o paralelismo máximo de um grupo é o número de partições (consumidores além disso ficam ociosos). Grupos diferentes são independentes e leem tudo, cada um no seu ritmo, o que dá o comportamento de publish/subscribe. Quando um consumidor entra ou sai, ocorre um **rebalance**, que redistribui partições e pausa brevemente o consumo (o protocolo cooperativo reduz esse impacto).", "A **consumer group** is a set of cooperating consumers: Kafka assigns each partition to **exactly one** consumer in the group, so a group's maximum parallelism is the number of partitions (extra consumers sit idle). Different groups are independent and each reads everything at its own pace, which gives publish/subscribe behavior. When a consumer joins or leaves, a **rebalance** happens, redistributing partitions and briefly pausing consumption (the cooperative protocol reduces that impact)."]),
      p(["O **offset** committed de cada grupo e partição fica guardado num tópico interno (`__consumer_offsets`). Ele define o *at-least-once* ou *at-most-once* do consumidor: se você confirma o offset **antes** de processar e cai, perde mensagens; se confirma **depois** e cai, reprocessa as últimas. O padrão seguro é processar, depois confirmar (commit manual) e tornar o processamento idempotente. Como o offset é só um número, **reprocessar** é trivial: basta voltar o offset (*seek*) ou criar um grupo novo que comece do início.", "Each group's **committed offset** per partition is stored in an internal topic (`__consumer_offsets`). It defines the consumer's *at-least-once* or *at-most-once* behavior: if you commit the offset **before** processing and crash, you lose messages; if you commit **after** and crash, you reprocess the latest ones. The safe pattern is process, then commit (manual commit) and make processing idempotent. Since the offset is just a number, **reprocessing** is trivial: seek back, or create a new group that starts from the beginning."]),
      h(["Retenção e log compaction", "Retention and log compaction"]),
      p(["O Kafka apaga dados antigos por **tempo** (`retention.ms`, padrão de 7 dias) e/ou por **tamanho** (`retention.bytes`), sempre em segmentos inteiros, não mensagem a mensagem. Retenção longa é barata porque a leitura é sequencial em disco. Para tópicos que representam o **estado atual** de entidades (por exemplo, o perfil mais recente de cada usuário), existe a **log compaction** (`cleanup.policy=compact`): o Kafka mantém ao menos o **último valor de cada chave** e descarta os anteriores. Uma mensagem com valor nulo (*tombstone*) apaga a chave. Assim o tópico funciona como uma tabela que pode ser reconstruída do zero a qualquer momento.", "Kafka deletes old data by **time** (`retention.ms`, default 7 days) and/or by **size** (`retention.bytes`), always in whole segments, not message by message. Long retention is cheap because reads are sequential on disk. For topics that represent the **current state** of entities (say, each user's latest profile), there is **log compaction** (`cleanup.policy=compact`): Kafka keeps at least the **last value for each key** and discards earlier ones. A message with a null value (a *tombstone*) deletes the key. The topic then behaves like a table that can be rebuilt from scratch at any time."]),
      h(["Garantias de entrega e exactly-once no Kafka", "Delivery guarantees and exactly-once in Kafka"]),
      p(["No lado do produtor, `acks=all` faz o líder esperar todas as réplicas do ISR antes de confirmar, e `min.insync.replicas=2` impede aceitar escritas quando há réplicas demais fora de sincronia; juntos evitam perda de dados quando um broker cai. O **produtor idempotente** (`enable.idempotence=true`, padrão nas versões recentes) atribui a cada lote um número de sequência por partição, de modo que reenvios por timeout não geram duplicatas no log. As **transações** do Kafka permitem gravar em várias partições e tópicos de forma atômica (`transactional.id`) e, junto com `isolation.level=read_committed` nos consumidores, o padrão **consumir, processar e produzir** dentro do próprio Kafka passa a ter semântica *exactly-once*: os offsets consumidos e as mensagens produzidas são confirmados juntos. O Kafka Streams ativa isso com `processing.guarantee=exactly_once_v2`.", "On the producer side, `acks=all` makes the leader wait for all ISR replicas before confirming, and `min.insync.replicas=2` refuses writes when too many replicas are out of sync; together they prevent data loss when a broker dies. The **idempotent producer** (`enable.idempotence=true`, default in recent versions) assigns each batch a per-partition sequence number so retries after timeouts do not create duplicates in the log. Kafka **transactions** allow writing to several partitions and topics atomically (`transactional.id`) and, with `isolation.level=read_committed` on consumers, the **consume, process, produce** pattern inside Kafka gains *exactly-once* semantics: consumed offsets and produced messages are committed together. Kafka Streams enables it with `processing.guarantee=exactly_once_v2`."]),
      tip(["Atenção ao limite do exactly-once: ele vale **dentro do Kafka**. Se o consumidor também grava num banco, envia um e-mail ou chama uma API, esse efeito externo pode se repetir. Fora do Kafka, a resposta é idempotência (ou o padrão outbox).", "Mind the limit of exactly-once: it holds **inside Kafka**. If the consumer also writes to a database, sends an email or calls an API, that external effect can repeat. Outside Kafka the answer is idempotency (or the outbox pattern)."]),
      h(["Ordenação na prática", "Ordering in practice"]),
      ul(
        ["**Kafka**: ordem por partição. Use a chave certa (id da conta, do pedido) para que tudo que precisa de ordem caia na mesma partição. Cuidado ao aumentar o número de partições: o hash muda e a ordem de uma chave pode quebrar durante a transição.", "**Kafka**: order per partition. Use the right key (account id, order id) so everything that needs order lands in the same partition. Careful when increasing the partition count: the hash mapping changes and a key's order can break during the transition."],
        ["**SQS FIFO**: ordem por *message group id*; mensagens de grupos diferentes correm em paralelo.", "**SQS FIFO**: order per *message group id*; messages from different groups run in parallel."],
        ["**RabbitMQ**: ordem dentro de uma fila com um consumidor; com vários consumidores ou reentregas, a ordem não é garantida.", "**RabbitMQ**: order within a queue with one consumer; with several consumers or redeliveries, order is not guaranteed."],
        ["**Retries** quebram ordem: se a mensagem 1 falha e vai para um retry enquanto a 2 passa, a 2 é processada antes. Se a ordem importa, bloqueie a chave até a 1 terminar.", "**Retries** break order: if message 1 fails and goes to a retry while 2 passes, 2 is processed first. If order matters, block the key until 1 finishes."],
      ),
      h(["Exemplo em TypeScript (KafkaJS)", "TypeScript example (KafkaJS)"]),
      code(`import { Kafka } from "kafkajs";

const kafka = new Kafka({ clientId: "orders", brokers: ["kafka:9092"] });

// Producer: key = customerId keeps one customer's events ordered
const producer = kafka.producer({ idempotent: true });
await producer.connect();
await producer.send({
  topic: "orders.created",
  acks: -1, // all in-sync replicas
  messages: [{ key: order.customerId, value: JSON.stringify(order) }],
});

// Consumer: manual commit AFTER processing (at-least-once)
const consumer = kafka.consumer({ groupId: "billing" });
await consumer.connect();
await consumer.subscribe({ topic: "orders.created", fromBeginning: false });
await consumer.run({
  autoCommit: false,
  eachMessage: async ({ topic, partition, message }) => {
    const order = JSON.parse(message.value!.toString());
    await billOnce(order);                  // idempotent by order.id
    await consumer.commitOffsets([{
      topic, partition,
      offset: (BigInt(message.offset) + 1n).toString(),
    }]);
  },
});`),
      p(["O offset confirmado é sempre o do **próximo** registro a ler, daí o `+ 1`. A função `billOnce` consulta uma tabela de deduplicação pela chave `order.id`, de modo que um reprocessamento depois de uma queda não cobre duas vezes.", "The committed offset is always that of the **next** record to read, hence the `+ 1`. The `billOnce` function checks a deduplication table by `order.id`, so reprocessing after a crash does not bill twice."]),
      h(["Como escolher", "How to choose"]),
      ul(
        ["Tarefas em segundo plano com roteamento, prioridades e atraso (*delayed*): **RabbitMQ** ou **SQS**.", "Background tasks with routing, priorities and delay: **RabbitMQ** or **SQS**."],
        ["Nuvem AWS, equipe pequena, sem querer operar nada: **SQS** (mais SNS para fan-out).", "AWS cloud, small team, nothing to operate: **SQS** (plus SNS for fan-out)."],
        ["Fluxo contínuo de eventos, vários consumidores independentes, replay, integração com bancos e analytics, milhões de mensagens por segundo: **Kafka**.", "Continuous flow of events, several independent consumers, replay, integration with databases and analytics, millions of messages per second: **Kafka**."],
        ["Multi-tenancy forte e armazenamento em camadas: **Pulsar**. Latência mínima, microserviços e edge: **NATS**.", "Strong multi-tenancy and tiered storage: **Pulsar**. Minimal latency, microservices and edge: **NATS**."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Usar o Kafka como fila de tarefas com tempos muito diferentes: uma tarefa lenta bloqueia as seguintes da mesma partição (*head-of-line blocking*).", "Using Kafka as a task queue with very different durations: one slow task blocks the following ones in the same partition (*head-of-line blocking*)."],
        ["Escolher poucas partições no início: o paralelismo fica limitado e aumentar depois altera o mapeamento de chaves.", "Choosing too few partitions at the start: parallelism is limited and increasing later changes key mapping."],
        ["Chaves com distribuição desigual (uma chave quente): uma partição fica sobrecarregada, as outras ociosas.", "Skewed keys (a hot key): one partition is overloaded while the others idle."],
        ["Confirmar o offset antes de processar e depois perder mensagens numa queda.", "Committing the offset before processing and then losing messages in a crash."],
        ["Achar que exactly-once do Kafka cobre efeitos em banco de dados ou APIs externas.", "Assuming Kafka's exactly-once covers effects on databases or external APIs."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["RabbitMQ e SQS entregam e apagam tarefas; Kafka e Pulsar guardam um log e cada leitor tem seu offset.", "RabbitMQ and SQS deliver and delete tasks; Kafka and Pulsar keep a log and each reader has its offset."],
        ["No Kafka, a ordem vale por partição e o paralelismo de um grupo é limitado pelo número de partições.", "In Kafka, order holds per partition and a group's parallelism is capped by the partition count."],
        ["Retenção e compaction decidem o que o log guarda; replay é voltar o offset.", "Retention and compaction decide what the log keeps; replay is moving the offset back."],
        ["Exactly-once do Kafka usa produtor idempotente, transações e read_committed, dentro do Kafka.", "Kafka's exactly-once uses the idempotent producer, transactions and read_committed, inside Kafka."],
        ["Fora dele, use at-least-once com consumidores idempotentes.", "Outside it, use at-least-once with idempotent consumers."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Kafka é uma fila?** Não exatamente: é um log. Com consumer groups ele se comporta como fila, mas sem ack por mensagem e sem apagar ao ler.", "**Is Kafka a queue?** Not exactly: it is a log. With consumer groups it behaves like a queue, but without per-message ack and without deleting on read."],
        ["**Quantas partições devo ter?** Comece pelo paralelismo desejado do consumo mais lento, com folga para crescer; evite centenas por tópico sem necessidade.", "**How many partitions should I have?** Start from the desired parallelism of the slowest consumption, with room to grow; avoid hundreds per topic without need."],
        ["**SQS FIFO substitui o Kafka?** Só para ordem simples e vazão moderada; não há replay nem múltiplos leitores independentes.", "**Does SQS FIFO replace Kafka?** Only for simple ordering and moderate throughput; there is no replay or multiple independent readers."],
        ["**O que acontece se um consumidor Kafka for lento?** O lag (diferença entre o fim do log e o offset) cresce; monitore-o e escale até o número de partições.", "**What happens if a Kafka consumer is slow?** Lag (the gap between log end and offset) grows; monitor it and scale up to the partition count."],
      ),
      tip(["O indicador mais útil de um consumidor Kafka é o **consumer lag**. Alerte pela tendência (lag crescendo), não por um valor absoluto.", "The most useful indicator of a Kafka consumer is **consumer lag**. Alert on the trend (lag growing), not on an absolute value."]),
    ] },

  { id: "rate-limiting", section: "mensageria", level: 1, icon: "speed", minutes: 11,
    title: ["Rate limiting: proteger o sistema do excesso", "Rate limiting: protecting the system from excess"],
    summary: ["Por que limitar, onde aplicar, qual chave usar, headers de resposta, limites distribuídos e fail-open x fail-closed.", "Why limit, where to apply it, which key to use, response headers, distributed limits and fail-open vs fail-closed."],
    body: [
      p(["Todo serviço tem capacidade finita. Quando um cliente com um script em loop, um bot de scraping, um bug que faz retry sem parar ou um ataque deliberado enviam muito mais requisições do que o sistema aguenta, quem sofre são todos os outros usuários. O **rate limiting** (limitação de taxa) é o mecanismo que decide, para cada requisição, se ela passa, espera ou é recusada, de modo que o abuso de um não derrube o serviço de todos.", "Every service has finite capacity. When a client running a looping script, a scraping bot, a bug that retries endlessly or a deliberate attack sends far more requests than the system can handle, everyone else suffers. **Rate limiting** is the mechanism that decides, for each request, whether it passes, waits or is refused, so one party's abuse does not take down the service for all."]),
      h(["Por que limitar", "Why limit"]),
      ul(
        ["**Proteção contra sobrecarga**: impede que um pico (legítimo ou não) esgote CPU, conexões ou banco e cause falha em cascata.", "**Overload protection**: keeps a spike (legitimate or not) from exhausting CPU, connections or the database and causing cascading failure."],
        ["**Justiça entre clientes**: um cliente barulhento não rouba a capacidade dos demais (*noisy neighbor*).", "**Fairness among clients**: a noisy client does not steal capacity from the rest (*noisy neighbor*)."],
        ["**Segurança**: dificulta força bruta em login, enumeração de contas, *credential stuffing* e scraping.", "**Security**: makes brute force on login, account enumeration, credential stuffing and scraping harder."],
        ["**Custo**: chamadas a serviços pagos (LLMs, SMS, mapas) têm preço por requisição; o limite protege o orçamento.", "**Cost**: calls to paid services (LLMs, SMS, maps) are priced per request; the limit protects the budget."],
        ["**Modelo de negócio**: planos gratuito, pro e enterprise diferem, entre outras coisas, na cota permitida.", "**Business model**: free, pro and enterprise plans differ, among other things, in the allowed quota."],
      ),
      h(["Onde aplicar", "Where to apply it"]),
      p(["O limite pode viver em várias camadas, e quanto mais cedo a requisição for barrada, mais barato é o descarte. Nas **bordas** (CDN, WAF, API gateway, balanceador como o nginx) ficam limites grossos por IP e por rota, que cortam o grosso do tráfego abusivo sem acordar a aplicação. Na **aplicação** ou num middleware, ficam limites finos por usuário, chave de API ou tenant, que dependem de autenticação e de regras de negócio. Em **serviços internos**, limites protegem dependências frágeis (um banco legado, um parceiro externo) mesmo contra chamadas de outros times.", "The limit can live in several layers, and the earlier a request is blocked, the cheaper the discard. At the **edges** (CDN, WAF, API gateway, a balancer like nginx) sit coarse limits per IP and route, which cut most abusive traffic without waking the application. In the **application** or a middleware sit fine-grained limits per user, API key or tenant, which depend on authentication and business rules. In **internal services**, limits protect fragile dependencies (a legacy database, an external partner) even against calls from other teams."]),
      fig(["Rate limiter em camadas", "Layered rate limiter"],
        [[node("cl", "Clients", "client")], [node("edge", ["CDN / WAF: por IP", "CDN / WAF: per IP"], "edge")], [node("gw", ["API gateway: por chave", "API gateway: per key"], "edge")], [node("rl", ["Limiter", "Limiter"], "service"), node("rd", "Redis", "cache")], [node("app", ["Serviço", "Service"], "service")]],
        [edge("cl", "edge"), edge("edge", "gw"), edge("gw", "rl", ["pode passar?", "may pass?"]), edge("rl", "rd", ["contadores", "counters"], { both: true }), edge("gw", "app", ["se permitido", "if allowed"])]),
      h(["Qual chave usar", "Which key to use"]),
      p(["A **chave** define quem divide o mesmo balde. Escolher mal gera injustiça ou furos.", "The **key** defines who shares the same bucket. Choosing badly creates unfairness or gaps."]),
      table([["Chave", "Key"], ["Quando serve", "When it fits"], ["Cuidado", "Caveat"]],
        [["IP", "IP"], ["Tráfego anônimo, antes do login", "Anonymous traffic, before login"], ["NAT corporativo e redes móveis fazem milhares de pessoas dividirem um IP; atacantes trocam de IP", "Corporate NAT and mobile networks put thousands of people behind one IP; attackers rotate IPs"]],
        [["Usuário / conta", "User / account"], ["APIs autenticadas", "Authenticated APIs"], ["Não protege o endpoint de login em si", "Does not protect the login endpoint itself"]],
        [["Chave de API / token", "API key / token"], ["Integrações e planos pagos", "Integrations and paid plans"], ["Chaves vazadas são usadas por terceiros", "Leaked keys get used by third parties"]],
        [["Tenant / organização", "Tenant / organization"], ["SaaS multi-cliente", "Multi-customer SaaS"], ["Um tenant grande precisa de teto maior", "A large tenant needs a higher ceiling"]],
        [["Rota + chave", "Route + key"], ["Endpoints caros (busca, exportação) com limites próprios", "Costly endpoints (search, export) with own limits"], ["Mais regras para manter", "More rules to maintain"]]),
      p(["Em geral combinam-se chaves: por exemplo 1.000 req/min por chave de API, 20 req/s por IP e 5 tentativas de login por minuto por conta. Atrás de proxies, lembre de ler o IP real do cabeçalho `X-Forwarded-For`, confiando apenas nos proxies que você controla; do contrário o cliente forja o cabeçalho e foge do limite.", "Keys are usually combined: for example 1,000 req/min per API key, 20 req/s per IP and 5 login attempts per minute per account. Behind proxies, remember to read the real IP from the `X-Forwarded-For` header, trusting only the proxies you control; otherwise the client forges the header and escapes the limit."]),
      h(["Como responder: status e headers", "How to respond: status and headers"]),
      p(["Quando o limite é excedido, o padrão é responder **429 Too Many Requests**. Um bom limiter diz ao cliente o que fazer em seguida. O cabeçalho `Retry-After` indica quantos segundos esperar (ou uma data). Os cabeçalhos `X-RateLimit-Limit`, `X-RateLimit-Remaining` e `X-RateLimit-Reset` são convenção muito usada (GitHub, Twitter e outros), e há uma proposta do IETF para padronizar os campos `RateLimit-Limit`, `RateLimit-Remaining` e `RateLimit-Reset`. Devolver esses cabeçalhos também nas respostas de sucesso permite que clientes bem comportados se ajustem antes de bater no teto.", "When the limit is exceeded, the standard is to answer **429 Too Many Requests**. A good limiter tells the client what to do next. The `Retry-After` header says how many seconds to wait (or a date). The `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers are a widely used convention (GitHub, Twitter and others), and there is an IETF proposal to standardize the `RateLimit-Limit`, `RateLimit-Remaining` and `RateLimit-Reset` fields. Returning these headers on success responses too lets well-behaved clients adjust before hitting the ceiling."]),
      code(`HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 12
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1767225612

{ "error": "rate_limited", "message": "Try again in 12 seconds" }`),
      p(["Do lado do cliente, a resposta correta é respeitar o `Retry-After` e, na falta dele, usar *backoff* exponencial com jitter, para que milhares de clientes não tentem todos no mesmo instante e causem o efeito manada (*thundering herd*).", "On the client side, the correct response is to honor `Retry-After` and, lacking it, use exponential *backoff* with jitter, so thousands of clients do not all retry at the same instant and cause a *thundering herd*."]),
      h(["Limites distribuídos", "Distributed limits"]),
      p(["Com uma única instância, um contador em memória basta. Com dezenas de instâncias atrás de um balanceador, cada uma só enxerga uma fração do tráfego, e um limite de 100 req/min viraria na prática 100 por instância. As opções são:", "With a single instance, an in-memory counter is enough. With dozens of instances behind a balancer, each sees only a fraction of the traffic, and a 100 req/min limit would effectively become 100 per instance. The options are:"]),
      ul(
        ["**Estado central no Redis**: todas as instâncias consultam o mesmo contador. É exato, mas cada requisição custa uma ida ao Redis (cerca de 0,2 a 1 ms) e o Redis vira dependência crítica. Use scripts Lua ou comandos atômicos para evitar condições de corrida entre ler e escrever.", "**Central state in Redis**: all instances query the same counter. It is exact, but each request costs a trip to Redis (around 0.2 to 1 ms) and Redis becomes a critical dependency. Use Lua scripts or atomic commands to avoid read-then-write races."],
        ["**Limite local com cota dividida**: cada instância recebe uma fração (limite ÷ N). Sem rede, mas impreciso quando o tráfego é desigual ou o número de instâncias muda.", "**Local limit with divided quota**: each instance gets a fraction (limit ÷ N). No network, but imprecise when traffic is uneven or the instance count changes."],
        ["**Híbrido**: cada instância usa um contador local e sincroniza com o Redis em lotes (por exemplo a cada 100 ms ou a cada 10 requisições). Reduz a carga no Redis aceitando um pequeno excesso.", "**Hybrid**: each instance uses a local counter and syncs with Redis in batches (for example every 100 ms or every 10 requests). It lowers Redis load while accepting a small overshoot."],
        ["**Sticky routing**: direcionar o mesmo cliente sempre à mesma instância permite contagem local, mas amarra o balanceamento e sofre quando uma instância cai.", "**Sticky routing**: always routing the same client to the same instance allows local counting, but ties up balancing and suffers when an instance dies."],
      ),
      h(["Fail-open x fail-closed", "Fail-open vs fail-closed"]),
      p(["E se o Redis do limiter ficar fora do ar? Há duas políticas. **Fail-open**: na dúvida, deixar a requisição passar. A disponibilidade é preservada, mas por um período o serviço fica sem proteção, o que é perigoso se a causa da queda for justamente uma avalanche de tráfego. **Fail-closed**: na dúvida, recusar. É mais seguro contra abuso, mas uma falha do limiter derruba o produto inteiro. A maioria das APIs públicas escolhe fail-open com limite local de emergência como rede de segurança; endpoints sensíveis (login, recuperação de senha, pagamento) tendem a fail-closed. Defina timeouts curtos (poucos milissegundos) na chamada ao Redis para que o limiter nunca vire o gargalo.", "What if the limiter's Redis goes down? There are two policies. **Fail-open**: when in doubt, let the request through. Availability is preserved, but for a while the service is unprotected, which is dangerous if the outage itself was caused by a traffic avalanche. **Fail-closed**: when in doubt, refuse. It is safer against abuse, but a limiter failure takes the whole product down. Most public APIs choose fail-open with an emergency local limit as a safety net; sensitive endpoints (login, password recovery, payment) lean to fail-closed. Set short timeouts (a few milliseconds) on the Redis call so the limiter never becomes the bottleneck."]),
      h(["Quotas x throttling", "Quotas vs throttling"]),
      p(["Os dois termos são parecidos, mas resolvem problemas diferentes. O **throttling** (ou rate limiting propriamente dito) controla a **velocidade**: requisições por segundo ou minuto, para proteger o sistema agora. Uma **quota** controla o **volume total** num período longo: 10 mil chamadas por mês, 5 GB por dia. Ela serve ao modelo de cobrança e ao planejamento de capacidade, e o estouro costuma resultar em bloqueio até a renovação ou em cobrança extra. Um plano típico combina os dois: 100 req/s de teto e 1 milhão por mês de cota. Além de recusar, o throttling pode **atrasar** (enfileirar a requisição até haver espaço) ou **degradar** (devolver uma resposta mais simples).", "The two terms look alike but solve different problems. **Throttling** (rate limiting proper) controls **speed**: requests per second or minute, to protect the system now. A **quota** controls **total volume** over a long period: 10 thousand calls per month, 5 GB per day. It serves the billing model and capacity planning, and exceeding it usually means blocking until renewal or extra charges. A typical plan combines both: a 100 req/s ceiling and a 1 million per month quota. Besides refusing, throttling can **delay** (queue the request until there is room) or **degrade** (return a simpler response)."]),
      h(["Exemplo: middleware simples em TypeScript", "Example: simple middleware in TypeScript"]),
      code(`// Express middleware: 100 requests/minute per API key, state in Redis
import type { Request, Response, NextFunction } from "express";

const LIMIT = 100, WINDOW_S = 60;

export async function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = "rl:" + (req.header("x-api-key") ?? req.ip);
  try {
    const count = await redis.incr(key);          // atomic
    if (count === 1) await redis.expire(key, WINDOW_S);
    const ttl = await redis.ttl(key);
    res.set("X-RateLimit-Limit", String(LIMIT));
    res.set("X-RateLimit-Remaining", String(Math.max(0, LIMIT - count)));
    if (count > LIMIT) {
      res.set("Retry-After", String(ttl));
      return res.status(429).json({ error: "rate_limited" });
    }
  } catch {
    // fail-open: if Redis is down, let the request through
  }
  next();
}`),
      p(["Este é o algoritmo de janela fixa, o mais simples; o próximo artigo mostra como ele falha na borda da janela e quais algoritmos corrigem isso. Há ainda uma pequena falha: se o processo cair entre `incr` e `expire`, a chave fica sem validade. Um script Lua evita isso.", "This is the fixed window algorithm, the simplest; the next article shows how it fails at the window edge and which algorithms fix that. There is also a small flaw: if the process dies between `incr` and `expire`, the key is left without expiry. A Lua script avoids that."]),
      h(["Vantagens e desvantagens", "Pros and cons"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Drawbacks"]],
        [["Protege o sistema e os outros clientes", "Protects the system and other clients"], ["Pode bloquear usuários legítimos em picos reais", "May block legitimate users during real spikes"]],
        [["Barra abuso e reduz custo", "Blocks abuse and reduces cost"], ["Acrescenta latência e um ponto de falha (o estado compartilhado)", "Adds latency and a point of failure (the shared state)"]],
        [["Dá previsibilidade para planos e SLAs", "Gives predictability for plans and SLAs"], ["Exige escolher bem chaves, valores e política de falha", "Requires choosing keys, values and failure policy well"]]),
      h(["Casos reais", "Real-world cases"]),
      p(["O GitHub limita sua API REST por token autenticado e informa o saldo nos cabeçalhos de cada resposta. APIs de pagamento aplicam limites por chave e por rota. O nginx oferece `limit_req` (por IP, usando balde com *burst*) e `limit_conn`. Provedores de nuvem como o API Gateway da AWS e Cloudflare permitem regras de limitação por rota ou cabeçalho, e serviços de LLM combinam limites de requisições e de tokens por minuto.", "GitHub limits its REST API per authenticated token and reports the balance in the headers of each response. Payment APIs apply limits per key and per route. nginx offers `limit_req` (per IP, using a bucket with *burst*) and `limit_conn`. Cloud providers like AWS API Gateway and Cloudflare allow limiting rules by route or header, and LLM services combine request-per-minute and token-per-minute limits."]),
      h(["Boas práticas e erros comuns", "Best practices and common mistakes"]),
      ul(
        ["Limitar só por IP e esquecer o NAT: escritórios inteiros ficam bloqueados.", "Limiting only by IP and forgetting NAT: whole offices get blocked."],
        ["Não devolver `Retry-After`: os clientes insistem imediatamente e pioram a carga.", "Not returning `Retry-After`: clients retry immediately and worsen the load."],
        ["Fazer *read-then-write* no Redis sem atomicidade: duas requisições simultâneas passam pelo mesmo ponto.", "Doing read-then-write in Redis without atomicity: two simultaneous requests pass the same point."],
        ["Esquecer de monitorar quantas requisições são bloqueadas e por quem; um aumento súbito indica ataque ou um cliente com bug.", "Forgetting to monitor how many requests are blocked and by whom; a sudden rise signals an attack or a client with a bug."],
        ["Aplicar o mesmo limite a todas as rotas, quando uma busca custa 100 vezes mais que uma leitura simples.", "Applying the same limit to all routes when a search costs 100 times more than a simple read."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Rate limiting protege capacidade, justiça, segurança e custo.", "Rate limiting protects capacity, fairness, security and cost."],
        ["Aplique limites grossos na borda e finos na aplicação, com a chave certa (IP, usuário, chave de API, tenant).", "Apply coarse limits at the edge and fine ones in the application, with the right key (IP, user, API key, tenant)."],
        ["Responda 429 com `Retry-After` e cabeçalhos `X-RateLimit-*`.", "Answer 429 with `Retry-After` and `X-RateLimit-*` headers."],
        ["Em ambiente distribuído, use estado atômico (Redis + Lua) e decida entre fail-open e fail-closed.", "In a distributed setup, use atomic state (Redis + Lua) and decide between fail-open and fail-closed."],
        ["Throttling controla velocidade; quota controla volume total.", "Throttling controls speed; a quota controls total volume."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Rate limiting é o mesmo que proteção contra DDoS?** Não. Ele ajuda, mas um DDoS volumétrico precisa de mitigação na rede e em CDN antes de chegar ao seu limiter.", "**Is rate limiting the same as DDoS protection?** No. It helps, but a volumetric DDoS needs mitigation at the network level and CDN before reaching your limiter."],
        ["**429 ou 503?** 429 quando o cliente excedeu a própria cota; 503 quando o servidor está sobrecarregado ou indisponível.", "**429 or 503?** 429 when the client exceeded its own quota; 503 when the server is overloaded or unavailable."],
        ["**Devo contar requisições bloqueadas?** Em geral sim para logins (para deter força bruta); para APIs, depende da regra.", "**Should blocked requests count?** Usually yes for logins (to deter brute force); for APIs, it depends on the rule."],
        ["**Qual o melhor algoritmo?** Depende do comportamento de burst desejado; veja o próximo artigo.", "**Which algorithm is best?** It depends on the desired burst behavior; see the next article."],
      ),
      tip(["Comece simples: um limite por chave de API e um por IP para o login já resolvem a maior parte dos casos. Refine com os dados de quem está sendo bloqueado.", "Start simple: one limit per API key and one per IP for login already solves most cases. Refine using data on who is being blocked."]),
    ] },

  { id: "algoritmos-de-rate-limiting", section: "mensageria", level: 2, icon: "speed", minutes: 14,
    title: ["Algoritmos de rate limiting", "Rate limiting algorithms"],
    summary: ["Token bucket, leaky bucket, janela fixa, janela deslizante em log e em contador, com código em TypeScript e Lua.", "Token bucket, leaky bucket, fixed window, sliding window log and counter, with TypeScript and Lua code."],
    body: [
      p(["Decidir *que* requisições limitar é uma parte do problema; a outra é *como contar*. Os algoritmos abaixo diferem em quatro pontos: quanta **memória** gastam por chave, quanto **burst** (rajada) toleram, quão **precisos** são e como se comportam na **borda** entre períodos. Não existe um vencedor universal; a escolha depende do tráfego e do que você quer proteger.", "Deciding *which* requests to limit is one part of the problem; the other is *how to count*. The algorithms below differ in four points: how much **memory** they spend per key, how much **burst** they tolerate, how **accurate** they are and how they behave at the **edge** between periods. There is no universal winner; the choice depends on the traffic and on what you want to protect."]),
      fig(["Famílias de algoritmos", "Algorithm families"],
        [[node("req", ["Requisição", "Request"], "client")], [node("tb", "Token bucket", "service"), node("lb", "Leaky bucket", "service"), node("fw", ["Janela fixa", "Fixed window"], "service"), node("sw", ["Janela deslizante", "Sliding window"], "service")], [node("st", ["Estado por chave (Redis)", "Per-key state (Redis)"], "cache")], [node("dec", ["Permitir ou 429", "Allow or 429"], "edge")]],
        [edge("req", "tb"), edge("req", "lb"), edge("req", "fw"), edge("req", "sw"), edge("tb", "st"), edge("lb", "st"), edge("fw", "st"), edge("sw", "st"), edge("st", "dec")]),
      h(["1. Token bucket (balde de fichas)", "1. Token bucket"]),
      p(["Imagine um balde com capacidade para **B fichas**. Uma fonte adiciona fichas a uma taxa constante de **R por segundo**, até encher. Cada requisição retira uma ficha; se não há fichas, é recusada. O resultado: o cliente pode fazer **rajadas de até B** requisições de uma vez (balde cheio), mas a taxa média sustentada nunca passa de R. É o algoritmo mais usado em prática (nginx `limit_req burst`, API Gateway da AWS, Stripe) por ser simples, barato e permitir a rajada que clientes reais fazem.", "Imagine a bucket with room for **B tokens**. A source adds tokens at a constant rate of **R per second**, until full. Each request removes one token; if there are none, it is refused. The result: the client can make **bursts of up to B** requests at once (full bucket), but the sustained average never exceeds R. It is the most used algorithm in practice (nginx `limit_req burst`, AWS API Gateway, Stripe) because it is simple, cheap and allows the burst real clients make."]),
      p(["A implementação não precisa de um processo reabastecendo o balde. Basta guardar, por chave, o número de fichas e o instante da última atualização; ao chegar uma requisição, calcula-se de forma preguiçosa quantas fichas surgiram desde então (`tempo decorrido × R`, limitado a B).", "The implementation needs no process refilling the bucket. It is enough to store, per key, the token count and the time of the last update; when a request arrives, you lazily compute how many tokens appeared since then (`elapsed time × R`, capped at B)."]),
      code(`// Token bucket (single process, in memory)
type Bucket = { tokens: number; last: number };
const buckets = new Map<string, Bucket>();

export function allow(key: string, capacity = 10, refillPerSec = 5, cost = 1, now = Date.now()): boolean {
  const b = buckets.get(key) ?? { tokens: capacity, last: now };
  const elapsed = (now - b.last) / 1000;
  b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerSec);
  b.last = now;
  const ok = b.tokens >= cost;
  if (ok) b.tokens -= cost;
  buckets.set(key, b);
  return ok;
}`),
      p(["Para vários servidores, a leitura e a escrita precisam ser atômicas. No Redis, um script Lua roda sem interrupção:", "For several servers, read and write must be atomic. In Redis, a Lua script runs without interruption:"]),
      code(`-- KEYS[1] = bucket key
-- ARGV: capacity, refill_per_sec, now_ms, cost
local cap, rate, now, cost = tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3]), tonumber(ARGV[4])
local d = redis.call("HMGET", KEYS[1], "tokens", "ts")
local tokens = tonumber(d[1]) or cap
local ts = tonumber(d[2]) or now
tokens = math.min(cap, tokens + math.max(0, now - ts) / 1000 * rate)
local allowed = 0
if tokens >= cost then tokens = tokens - cost; allowed = 1 end
redis.call("HSET", KEYS[1], "tokens", tokens, "ts", now)
redis.call("PEXPIRE", KEYS[1], math.ceil(cap / rate * 1000) * 2)
return allowed`),
      h(["2. Leaky bucket (balde furado)", "2. Leaky bucket"]),
      p(["No leaky bucket, as requisições entram num balde (uma fila de tamanho fixo) que **vaza a uma taxa constante**. Se o balde está cheio, a requisição que chega é descartada. A saída é sempre **suave e uniforme**: mesmo que cheguem 100 requisições juntas, elas saem espaçadas, por exemplo uma a cada 100 ms. Isso é ideal quando o destino não tolera rajadas (uma API de terceiros com limite rígido, um dispositivo de rede) e é o princípio da modelagem de tráfego (*traffic shaping*). Em contrapartida, rajadas legítimas ganham **latência** (esperam na fila) e uma rajada antiga pode atrasar as novas.", "In the leaky bucket, requests enter a bucket (a fixed-size queue) that **leaks at a constant rate**. If the bucket is full, the arriving request is dropped. The output is always **smooth and uniform**: even if 100 requests arrive together, they leave spaced out, say one every 100 ms. This is ideal when the destination cannot tolerate bursts (a third-party API with a hard limit, a network device) and is the principle of *traffic shaping*. In return, legitimate bursts gain **latency** (they wait in the queue) and an old burst can delay new ones."]),
      p(["A diferença prática em relação ao token bucket: o token bucket **limita a taxa média, mas deixa a rajada passar**; o leaky bucket **suaviza a saída**. Uma variante usada em implementação sem fila (*leaky bucket as a meter*) é matematicamente equivalente a um token bucket com a conta invertida.", "The practical difference from the token bucket: the token bucket **limits the average rate but lets the burst through**; the leaky bucket **smooths the output**. A variant used in queue-less implementations (*leaky bucket as a meter*) is mathematically equivalent to a token bucket with the accounting inverted."]),
      code(`// Leaky bucket as a queue: tasks leave at a fixed rate
class LeakyBucket {
  private queue: Array<() => void> = [];
  constructor(private capacity: number, intervalMs: number) {
    setInterval(() => this.queue.shift()?.(), intervalMs); // leak
  }
  submit(task: () => void): boolean {
    if (this.queue.length >= this.capacity) return false;   // overflow: drop
    this.queue.push(task);
    return true;
  }
}`),
      h(["3. Fixed window (janela fixa)", "3. Fixed window"]),
      p(["O tempo é dividido em janelas fixas (cada minuto, por exemplo). Um contador por chave e por janela é incrementado a cada requisição; ao passar do limite, as demais são recusadas até a próxima janela, quando o contador zera. É o mais simples e barato (um inteiro por chave, um `INCR` e um `EXPIRE` no Redis) e fácil de explicar ao cliente: 100 por minuto, renovado a cada minuto cheio.", "Time is divided into fixed windows (each minute, for example). A counter per key and window is incremented on every request; once over the limit, the rest are refused until the next window, when the counter resets. It is the simplest and cheapest (one integer per key, one `INCR` and one `EXPIRE` in Redis) and easy to explain to the client: 100 per minute, renewed on every full minute."]),
      p(["O defeito clássico é o **burst na borda da janela**. Com limite de 100 por minuto, um cliente pode mandar 100 requisições nos últimos segundos do minuto 1 e outras 100 nos primeiros segundos do minuto 2: são **200 requisições em poucos segundos**, o dobro do limite, sem violar nenhuma janela. Se o destino sofre com esse pico, a janela fixa não protege.", "The classic flaw is the **burst at the window edge**. With a limit of 100 per minute, a client can send 100 requests in the last seconds of minute 1 and another 100 in the first seconds of minute 2: that is **200 requests within a few seconds**, double the limit, without violating either window. If the target suffers from that peak, the fixed window does not protect it."]),
      code(`-- Fixed window in Redis (Lua): atomic INCR + EXPIRE
-- KEYS[1] = "rl:{user}:<window_start>", ARGV: limit, window_seconds
local n = redis.call("INCR", KEYS[1])
if n == 1 then redis.call("EXPIRE", KEYS[1], tonumber(ARGV[2])) end
if n > tonumber(ARGV[1]) then return 0 end
return 1`),
      h(["4. Sliding window log (log da janela deslizante)", "4. Sliding window log"]),
      p(["Em vez de contadores por janela, o algoritmo guarda o **instante de cada requisição** recente (por exemplo num *sorted set* do Redis, com o timestamp como score). Ao chegar uma requisição, removem-se os registros mais antigos que a janela (`agora - 60 s`) e conta-se o que sobrou: se for menor que o limite, aceita-se e registra-se. A janela é sempre os últimos 60 segundos *a partir de agora*, então não existe o burst da borda: o limite vale para **qualquer** intervalo de 60 segundos. A conta é **exata**.", "Instead of per-window counters, the algorithm stores the **timestamp of each recent request** (for example in a Redis *sorted set*, with the timestamp as score). When a request arrives, entries older than the window (`now - 60 s`) are removed and what remains is counted: if below the limit, it is accepted and recorded. The window is always the last 60 seconds *from now*, so there is no edge burst: the limit holds for **any** 60-second interval. The count is **exact**."]),
      p(["O preço é a **memória**: um registro por requisição aceita, ou seja, até N entradas por chave. Para limites altos (10 mil por minuto) e milhões de chaves, isso pesa. Serve bem para limites baixos e sensíveis, como tentativas de login.", "The price is **memory**: one entry per accepted request, i.e. up to N entries per key. For high limits (10 thousand per minute) and millions of keys, that is heavy. It suits low, sensitive limits such as login attempts."]),
      code(`-- Sliding window log in Redis (Lua)
-- KEYS[1] = zset, ARGV: now_ms, window_ms, limit, unique_member
local now, win, limit = tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
redis.call("ZREMRANGEBYSCORE", KEYS[1], 0, now - win)
if redis.call("ZCARD", KEYS[1]) < limit then
  redis.call("ZADD", KEYS[1], now, ARGV[4])
  redis.call("PEXPIRE", KEYS[1], win)
  return 1
end
return 0`),
      h(["5. Sliding window counter (contador da janela deslizante)", "5. Sliding window counter"]),
      p(["É um meio-termo inteligente: guarda apenas **dois contadores**, o da janela atual e o da anterior, e estima a contagem da janela deslizante por **média ponderada**. Se estamos a 30% do caminho dentro do minuto atual, a janela deslizante cobre 70% do minuto anterior e 30% do atual:", "It is a smart middle ground: it stores only **two counters**, the current window's and the previous one's, and estimates the sliding window count by a **weighted average**. If we are 30% through the current minute, the sliding window covers 70% of the previous minute and 30% of the current:"]),
      code(`estimate = previous_count * (1 - elapsed_fraction) + current_count
// previous = 80, current = 20, elapsed = 0.3
// estimate = 80 * 0.7 + 20 = 76  -> allowed if limit = 100`),
      p(["Usa memória constante (dois inteiros por chave), elimina o grande burst da borda e é uma aproximação muito boa, assumindo que as requisições da janela anterior se distribuíram uniformemente. Segundo testes publicados pela Cloudflare, o erro dessa aproximação foi muito pequeno em dados reais, e por isso o método é muito usado em escala.", "It uses constant memory (two integers per key), eliminates the large edge burst and is a very good approximation, assuming requests in the previous window were spread uniformly. According to tests published by Cloudflare, the approximation's error was very small on real data, which is why the method is widely used at scale."]),
      code(`// Sliding window counter (in memory, sketch)
const counters = new Map<string, { win: number; cur: number; prev: number }>();

export function allowSw(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const win = Math.floor(now / windowMs);
  let c = counters.get(key) ?? { win, cur: 0, prev: 0 };
  if (c.win !== win) {
    c = { win, cur: 0, prev: c.win === win - 1 ? c.cur : 0 }; // roll the window
  }
  const frac = (now % windowMs) / windowMs;
  const estimate = c.prev * (1 - frac) + c.cur;
  const ok = estimate < limit;
  if (ok) c.cur++;
  counters.set(key, c);
  return ok;
}`),
      h(["Tabela comparativa", "Comparison table"]),
      table([["Algoritmo", "Algorithm"], ["Memória por chave", "Memory per key"], ["Permite burst?", "Allows burst?"], ["Precisão", "Accuracy"], ["Ponto fraco", "Weak point"]],
        [["Token bucket", "Token bucket"], ["2 valores (fichas e hora)", "2 values (tokens and time)"], ["Sim, até a capacidade B", "Yes, up to capacity B"], ["Boa", "Good"], ["Rajada de B pode ser grande demais para o destino", "A burst of B may be too large for the target"]],
        [["Leaky bucket", "Leaky bucket"], ["Fila de tamanho fixo (ou 2 valores no modo medidor)", "Fixed-size queue (or 2 values in meter mode)"], ["Não: saída suave", "No: smooth output"], ["Boa", "Good"], ["Rajadas esperam; latência extra", "Bursts wait; extra latency"]],
        [["Janela fixa", "Fixed window"], ["1 contador", "1 counter"], ["Até 2x o limite na borda", "Up to 2x the limit at the edge"], ["Baixa na borda", "Low at the edge"], ["Burst na virada da janela", "Burst at the window rollover"]],
        [["Sliding window log", "Sliding window log"], ["1 entrada por requisição", "1 entry per request"], ["Não ultrapassa o limite", "Never exceeds the limit"], ["Exata", "Exact"], ["Memória alta com limites grandes", "High memory with large limits"]],
        [["Sliding window counter", "Sliding window counter"], ["2 contadores", "2 counters"], ["Quase não", "Almost never"], ["Aproximada, muito boa", "Approximate, very good"], ["Supõe distribuição uniforme na janela anterior", "Assumes uniform distribution in the previous window"]]),
      h(["Como escolher", "How to choose"]),
      ul(
        ["**API pública com clientes variados**: token bucket. Aceita rajadas curtas e limita a média.", "**Public API with varied clients**: token bucket. It accepts short bursts and bounds the average."],
        ["**Proteger um destino que não aguenta rajadas** (parceiro, banco legado): leaky bucket ou um token bucket com capacidade pequena.", "**Protecting a target that cannot take bursts** (partner, legacy database): leaky bucket or a token bucket with small capacity."],
        ["**Limite simples e barato, tolerando imprecisão**: janela fixa (por exemplo cotas por hora ou dia, onde o erro da borda importa pouco).", "**Simple cheap limit, tolerating imprecision**: fixed window (for example hourly or daily quotas, where the edge error matters little)."],
        ["**Limite pequeno e crítico** (tentativas de login, envio de SMS): sliding window log, pela exatidão.", "**Small critical limit** (login attempts, SMS sending): sliding window log, for exactness."],
        ["**Escala grande com boa precisão**: sliding window counter.", "**Large scale with good accuracy**: sliding window counter."],
      ),
      h(["Detalhes de implementação que importam", "Implementation details that matter"]),
      ul(
        ["**Atomicidade**: use Lua ou `MULTI/EXEC`; um `GET` seguido de `SET` permite que duas requisições vejam o mesmo valor.", "**Atomicity**: use Lua or `MULTI/EXEC`; a `GET` followed by `SET` lets two requests see the same value."],
        ["**Relógio**: passe o tempo do servidor Redis (`TIME`) ou de uma fonte única, para não depender de relógios desalinhados das instâncias.", "**Clock**: use the Redis server time (`TIME`) or a single source so you do not depend on skewed instance clocks."],
        ["**Expiração**: toda chave precisa de TTL, ou os clientes inativos consomem memória para sempre.", "**Expiry**: every key needs a TTL, or inactive clients consume memory forever."],
        ["**Custo variável**: o token bucket permite cobrar mais de uma ficha por requisição cara (`cost`), útil para busca, exportação e para tokens de LLM.", "**Variable cost**: the token bucket allows charging more than one token per costly request (`cost`), useful for search, export and LLM tokens."],
        ["**Cluster Redis**: as chaves de um mesmo script devem cair no mesmo slot (use *hash tags* como `{usuario}`).", "**Redis Cluster**: a script's keys must land in the same slot (use *hash tags* like `{user}`)."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Usar janela fixa para proteger algo sensível a picos e descobrir o burst de 2x só em produção.", "Using a fixed window to protect something spike-sensitive and discovering the 2x burst only in production."],
        ["Definir o balde do token bucket grande demais: na prática, não há limite para rajadas.", "Setting the token bucket too big: in practice there is no limit on bursts."],
        ["Não expirar o log da janela deslizante e acumular milhões de entradas.", "Not expiring the sliding window log and accumulating millions of entries."],
        ["Calcular o tempo de espera do `Retry-After` de forma errada e levar os clientes a tentar cedo ou tarde demais.", "Computing the `Retry-After` wait wrongly and leading clients to retry too early or too late."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Token bucket: média limitada, rajada permitida. É o padrão geral.", "Token bucket: bounded average, burst allowed. The general default."],
        ["Leaky bucket: saída uniforme, ótimo para proteger quem não tolera picos.", "Leaky bucket: uniform output, great to protect what cannot take spikes."],
        ["Janela fixa: simples e barata, mas permite 2x o limite na borda.", "Fixed window: simple and cheap, but allows 2x the limit at the edge."],
        ["Janela deslizante em log é exata e cara; em contador é aproximada e barata.", "Sliding window log is exact and costly; the counter version is approximate and cheap."],
        ["Em ambientes distribuídos, implemente tudo com operações atômicas.", "In distributed setups, implement everything with atomic operations."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Token bucket e leaky bucket são o mesmo?** São parentes. O token bucket deixa a rajada passar; o leaky bucket impõe saída constante.", "**Are token bucket and leaky bucket the same?** They are relatives. The token bucket lets bursts through; the leaky bucket enforces constant output."],
        ["**Qual o menor custo em Redis?** Janela fixa (um `INCR`); depois o contador deslizante e o token bucket (dois valores).", "**Which has the lowest Redis cost?** Fixed window (one `INCR`); then the sliding counter and the token bucket (two values)."],
        ["**Como medir burst e média ao mesmo tempo?** Combine dois limites, por exemplo 10 por segundo e 300 por minuto.", "**How do I bound burst and average at once?** Combine two limits, for example 10 per second and 300 per minute."],
        ["**Posso usar um banco SQL?** Para volumes baixos sim, mas contadores com alta concorrência pedem um armazenamento em memória como o Redis.", "**Can I use a SQL database?** For low volumes yes, but highly concurrent counters call for in-memory storage like Redis."],
      ),
      tip(["Se tiver dúvida, comece com **token bucket** com capacidade pequena. Ele é fácil de explicar (fichas por segundo), tolera rajadas honestas e custa pouco.", "When in doubt, start with a **token bucket** with small capacity. It is easy to explain (tokens per second), tolerates honest bursts and costs little."]),
    ] },

  { id: "event-sourcing-vs-event-streaming", section: "mensageria", level: 2, icon: "history", minutes: 14,
    title: ["Event sourcing x event streaming", "Event sourcing vs event streaming"],
    summary: ["Dois usos de um log de eventos: guardar o estado como histórico (com CQRS, snapshots e upcasting) ou transportar fatos entre sistemas.", "Two uses of an event log: storing state as history (with CQRS, snapshots and upcasting), or moving facts between systems."],
    body: [
      p(["Os nomes são parecidos e as ferramentas se misturam (é comum guardar eventos de event sourcing num tópico do Kafka), então a confusão é frequente. Mas são **duas ideias diferentes**. **Event sourcing** é um modo de **persistir o estado** de um sistema: em vez de gravar o valor atual, grava-se a sequência de eventos que o produziu. **Event streaming** é um modo de **mover dados** entre sistemas: eventos fluem de produtores para vários consumidores, em tempo real, por meio de uma plataforma como o Kafka. Um não exige o outro.", "The names are similar and the tools blend (it is common to store event sourcing events in a Kafka topic), so confusion is frequent. But they are **two different ideas**. **Event sourcing** is a way of **persisting state**: instead of storing the current value, you store the sequence of events that produced it. **Event streaming** is a way of **moving data** between systems: events flow from producers to many consumers, in real time, through a platform like Kafka. Neither requires the other."]),
      h(["Event sourcing: o estado é uma consequência", "Event sourcing: state is a consequence"]),
      p(["Num sistema tradicional, a tabela `contas` guarda o saldo atual e cada `UPDATE` destrói a informação anterior: você sabe que o saldo é 700, mas não por quê. No event sourcing, o que se grava é um **log imutável** (*append-only*) de fatos já ocorridos, nomeados no passado: `ContaAberta`, `DepositoRealizado`, `SaqueRealizado`. O estado atual é **derivado** reproduzindo esses eventos em ordem. Os eventos nunca são alterados nem apagados; um erro é corrigido com um novo evento compensatório (um estorno), como no livro-razão da contabilidade, que nunca usa borracha.", "In a traditional system, the `accounts` table stores the current balance and each `UPDATE` destroys the previous information: you know the balance is 700, but not why. In event sourcing, what is stored is an **immutable log** (*append-only*) of facts that already happened, named in the past tense: `AccountOpened`, `DepositMade`, `WithdrawalMade`. The current state is **derived** by replaying those events in order. Events are never changed or deleted; a mistake is fixed with a new compensating event (a reversal), as in an accounting ledger, which never uses an eraser."]),
      fig(["Event sourcing com CQRS", "Event sourcing with CQRS"],
        [[node("cmd", ["Comando", "Command"], "client")], [node("agg", ["Agregado (regras)", "Aggregate (rules)"], "service")], [node("es", ["Event store (log)", "Event store (log)"], "data")], [node("proj", ["Projeções", "Projections"], "service")], [node("rm", ["Read model", "Read model"], "cache"), node("qry", ["Consulta", "Query"], "client")]],
        [edge("cmd", "agg"), edge("agg", "es", ["append evento", "append event"]), edge("es", "agg", ["replay", "replay"], { dashed: true }), edge("es", "proj", ["eventos", "events"]), edge("proj", "rm"), edge("qry", "rm", ["lê", "reads"])]),
      h(["Exemplo: conta bancária", "Example: bank account"]),
      p(["Considere o ciclo de vida de uma conta. O estado nunca é salvo; o que existe é a lista de eventos, e o saldo sai de uma função pura que dobra (*fold*) a lista:", "Consider an account's lifecycle. The state is never saved; what exists is the list of events, and the balance comes from a pure function that folds the list:"]),
      code(`#1  AccountOpened      { id: "acc-1", owner: "Ana" }
#2  DepositMade        { amount: 1000 }
#3  WithdrawalMade     { amount: 300 }
#4  DepositMade        { amount: 50 }
--> balance = 0 + 1000 - 300 + 50 = 750`),
      code(`type AccountEvent =
  | { type: "AccountOpened"; owner: string }
  | { type: "DepositMade"; amount: number }
  | { type: "WithdrawalMade"; amount: number };

type Account = { owner: string; balance: number; version: number };

// Pure function: apply one event to the state
function apply(state: Account | null, e: AccountEvent): Account {
  switch (e.type) {
    case "AccountOpened":  return { owner: e.owner, balance: 0, version: 1 };
    case "DepositMade":    return { ...state!, balance: state!.balance + e.amount, version: state!.version + 1 };
    case "WithdrawalMade": return { ...state!, balance: state!.balance - e.amount, version: state!.version + 1 };
  }
}

const rehydrate = (events: AccountEvent[]) => events.reduce<Account | null>(apply, null);

// Command handler: validate against current state, emit new events
async function withdraw(id: string, amount: number) {
  const { events, version } = await store.load(id);
  const acc = rehydrate(events)!;
  if (acc.balance < amount) throw new Error("insufficient funds");
  // optimistic concurrency: fails if someone appended after 'version'
  await store.append(id, [{ type: "WithdrawalMade", amount }], version);
}`),
      p(["O ponto crucial é o **controle otimista de concorrência**: o `append` informa a versão que o comando leu, e o *event store* rejeita a gravação se outro evento foi acrescentado no meio. Sem isso, dois saques simultâneos poderiam passar pela verificação de saldo.", "The crucial point is **optimistic concurrency control**: `append` states the version the command read, and the *event store* rejects the write if another event was appended in between. Without it, two simultaneous withdrawals could both pass the balance check."]),
      h(["Projeções, CQRS, snapshots e replay", "Projections, CQRS, snapshots and replay"]),
      ul(
        ["**Projeção**: um consumidor lê os eventos e monta uma **visão de leitura** pensada para uma consulta (saldo por conta, extrato, total por mês). Pode ser uma tabela SQL, um índice de busca ou um cache. Várias projeções partem dos mesmos eventos.", "**Projection**: a consumer reads the events and builds a **read view** designed for a query (balance per account, statement, monthly totals). It can be a SQL table, a search index or a cache. Several projections stem from the same events."],
        ["**CQRS** (*Command Query Responsibility Segregation*): separar o modelo que **escreve** (comandos que geram eventos) do que **lê** (projeções). Combina naturalmente com event sourcing, mas pode ser usado sem ele. Cada lado escala e é otimizado separadamente; o custo é a **consistência eventual**, porque a projeção atrasa alguns milissegundos em relação ao log.", "**CQRS** (*Command Query Responsibility Segregation*): separating the model that **writes** (commands producing events) from the one that **reads** (projections). It combines naturally with event sourcing, but can be used without it. Each side scales and is optimized separately; the cost is **eventual consistency**, because the projection lags the log by a few milliseconds."],
        ["**Snapshot**: reproduzir 50 mil eventos de uma conta antiga a cada comando é lento. Um snapshot grava o estado depois do evento N (por exemplo a cada 100 eventos); para reconstruir, carrega-se o snapshot mais recente e reproduzem-se só os eventos posteriores. É uma otimização: o log continua sendo a fonte da verdade.", "**Snapshot**: replaying 50 thousand events of an old account on every command is slow. A snapshot stores the state after event N (say every 100 events); to rebuild, load the latest snapshot and replay only the later events. It is an optimization: the log remains the source of truth."],
        ["**Replay**: como o histórico é completo, é possível reconstruir qualquer projeção do zero, criar uma projeção nova (um relatório que ninguém previu) ou investigar o estado em uma data passada (*time travel*). Basta reler os eventos.", "**Replay**: since history is complete, you can rebuild any projection from scratch, create a new projection (a report nobody foresaw) or inspect the state at a past date (*time travel*). Just reread the events."],
      ),
      h(["Evolução do esquema: upcasting", "Schema evolution: upcasting"]),
      p(["Como eventos são imutáveis e guardados para sempre, o formato deles envelhece. Se `DepositMade` passou de `{ amount }` para `{ amount, currency }`, os milhões de eventos antigos continuam no formato velho. A técnica comum é o **upcasting**: uma função que converte, na hora da leitura, o evento da versão antiga para a nova antes de entregá-lo ao código (`v1 -> v2` com `currency: BRL` como padrão). Registre a **versão do esquema** em cada evento, prefira mudanças aditivas (campos opcionais) e use um *schema registry* com Avro ou Protobuf. Reescrever o histórico é a última opção e vai contra o espírito do modelo.", "Because events are immutable and stored forever, their format ages. If `DepositMade` went from `{ amount }` to `{ amount, currency }`, millions of old events remain in the old shape. The usual technique is **upcasting**: a function that converts, at read time, the old-version event to the new one before handing it to the code (`v1 -> v2` with `currency: BRL` as default). Record the **schema version** in each event, prefer additive changes (optional fields) and use a *schema registry* with Avro or Protobuf. Rewriting history is the last resort and goes against the spirit of the model."]),
      code(`const upcast = (e: any) =>
  e.type === "DepositMade" && e.v === 1 ? { ...e, v: 2, currency: "BRL" } : e;`),
      h(["Event streaming: eventos como fluxo entre sistemas", "Event streaming: events as a flow between systems"]),
      p(["No event streaming, um evento como `PedidoCriado` é publicado num tópico (Kafka, Pulsar, Kinesis) e muitos consumidores reagem a ele de forma independente: estoque, faturamento, notificações, análise. A plataforma guarda o log por um tempo de retenção definido (dias, semanas), então novos consumidores podem entrar e **ler do início**. A diferença central: aqui o log é um **meio de transporte** (e talvez um *buffer* durável); o estado de cada serviço continua num banco comum, e o log pode expirar. No event sourcing, o log **é** o banco e não pode expirar.", "In event streaming, an event like `OrderCreated` is published to a topic (Kafka, Pulsar, Kinesis) and many consumers react to it independently: inventory, billing, notifications, analytics. The platform keeps the log for a defined retention time (days, weeks), so new consumers can join and **read from the beginning**. The central difference: here the log is a **transport** (and maybe a durable *buffer*); each service's state stays in an ordinary database, and the log may expire. In event sourcing, the log **is** the database and cannot expire."]),
      p(["O streaming também inclui **processamento contínuo**: calcular janelas de tempo, junções e agregações enquanto os eventos passam. O **Kafka Streams** (biblioteca Java dentro da sua aplicação) e o **Apache Flink** (motor distribuído, forte em tempo de evento e estado grande) são os exemplos mais conhecidos. Com eles, uma detecção de fraude pode contar transações por cartão nos últimos 5 minutos, mantendo o estado local, com tolerância a falhas por *checkpoints*.", "Streaming also includes **continuous processing**: computing time windows, joins and aggregations as events pass by. **Kafka Streams** (a Java library inside your application) and **Apache Flink** (a distributed engine, strong in event time and large state) are the best-known examples. With them, a fraud detector can count transactions per card in the last 5 minutes, keeping local state, with fault tolerance through *checkpoints*."]),
      h(["Comparação", "Comparison"]),
      table([["Aspecto", "Aspect"], ["Event sourcing", "Event sourcing"], ["Event streaming", "Event streaming"]],
        [["Objetivo", "Goal"], ["Persistir o estado de um serviço como histórico", "Persist a service's state as history"], ["Transportar e processar eventos entre sistemas", "Transport and process events between systems"]],
        [["O log é", "The log is"], ["A fonte da verdade (nunca expira)", "The source of truth (never expires)"], ["Um canal durável com retenção", "A durable channel with retention"]],
        [["Escopo", "Scope"], ["Dentro de um bounded context", "Inside one bounded context"], ["Entre serviços e equipes", "Across services and teams"]],
        [["Granularidade", "Granularity"], ["Um fluxo por entidade (agregado)", "One stream per entity (aggregate)"], ["Tópicos com milhões de eventos", "Topics with millions of events"]],
        [["Leitura", "Reading"], ["Reconstruir o estado e gerar projeções", "Rebuild state and generate projections"], ["Reagir, agregar e integrar", "React, aggregate and integrate"]],
        [["Ferramentas", "Tools"], ["EventStoreDB, tabela de eventos em Postgres, Axon", "EventStoreDB, an events table in Postgres, Axon"], ["Kafka, Pulsar, Kinesis, Flink", "Kafka, Pulsar, Kinesis, Flink"]],
        [["Principal risco", "Main risk"], ["Complexidade e evolução do esquema", "Complexity and schema evolution"], ["Consumidores duplicados, ordem e lag", "Duplicate consumers, ordering and lag"]]),
      h(["Como se combinam", "How they combine"]),
      p(["É comum, e saudável, usar as duas ideias juntas: um serviço usa event sourcing internamente e **publica** seus eventos de domínio num tópico do Kafka, de onde outros serviços os consomem (event streaming). Cuidado ao expor o log interno diretamente: os eventos internos são detalhes de implementação, e acoplar outros times a eles dificulta mudar o esquema. Prefira publicar **eventos de integração** estáveis e menores, derivados dos internos. A publicação deve ser feita com o padrão outbox (veja o artigo sobre tratamento de erros) para não perder nem duplicar eventos entre o event store e o tópico.", "It is common, and healthy, to use both ideas together: a service uses event sourcing internally and **publishes** its domain events to a Kafka topic, from which other services consume them (event streaming). Be careful when exposing the internal log directly: internal events are implementation details, and coupling other teams to them makes changing the schema hard. Prefer publishing stable, smaller **integration events** derived from the internal ones. Publication should use the outbox pattern (see the error handling article) so events are neither lost nor duplicated between the event store and the topic."]),
      h(["Vantagens e desvantagens do event sourcing", "Pros and cons of event sourcing"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Drawbacks"]],
        [["Auditoria completa e natural", "Complete, natural audit trail"], ["Curva de aprendizado e mudança de mentalidade", "Learning curve and mindset shift"]],
        [["Replay e novas projeções a qualquer momento", "Replay and new projections at any time"], ["Consultas diretas ao log são difíceis; exige projeções", "Direct queries on the log are hard; projections required"]],
        [["Depuração temporal e análise do que aconteceu", "Temporal debugging and analysis of what happened"], ["Evolução de esquema de eventos é trabalhosa", "Event schema evolution is laborious"]],
        [["Casa bem com sistemas orientados a eventos", "Fits event-driven systems well"], ["Consistência eventual nas leituras; privacidade (apagar dados pessoais, LGPD/GDPR) é difícil num log imutável", "Eventual consistency on reads; privacy (erasing personal data, LGPD/GDPR) is hard in an immutable log"]]),
      p(["Sobre o último ponto, a solução usual é o *crypto-shredding*: os dados pessoais são cifrados por usuário e a chave é descartada quando o titular pede o apagamento.", "On the last point, the usual solution is *crypto-shredding*: personal data is encrypted per user and the key is discarded when the data subject requests erasure."]),
      h(["Quando usar cada um", "When to use each"]),
      ul(
        ["**Event sourcing** vale a pena quando a **história é parte do negócio**: finanças, contabilidade, seguros, logística, saúde, auditoria regulada, sistemas colaborativos. Evite para um CRUD simples, onde só o estado atual interessa.", "**Event sourcing** pays off when **history is part of the business**: finance, accounting, insurance, logistics, healthcare, regulated auditing, collaborative systems. Avoid it for simple CRUD, where only the current state matters."],
        ["**Event streaming** vale a pena para integrar muitos sistemas em tempo quase real, alimentar analytics e data lakes, detectar fraude, sincronizar caches e índices (por exemplo com CDC) e propagar mudanças sem acoplar serviços.", "**Event streaming** pays off to integrate many systems in near real time, feed analytics and data lakes, detect fraud, sync caches and indexes (for example with CDC) and propagate changes without coupling services."],
        ["**Nenhum dos dois** se a escala é pequena, o time é novo no assunto e uma simples chamada HTTP ou um job agendado resolve.", "**Neither** if scale is small, the team is new to the subject and a plain HTTP call or scheduled job solves it."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Adotar event sourcing em todo o sistema, quando só um ou dois domínios se beneficiam dele.", "Adopting event sourcing across the whole system when only one or two domains benefit."],
        ["Criar eventos que são apenas CRUD disfarçado (`ContaAtualizada`) em vez de fatos de negócio.", "Creating events that are merely disguised CRUD (`AccountUpdated`) instead of business facts."],
        ["Ler a projeção para validar um comando: ela pode estar atrasada. Valide contra o estado reconstruído do agregado.", "Reading the projection to validate a command: it may be stale. Validate against the rebuilt aggregate state."],
        ["Esquecer a idempotência das projeções: um replay não deve duplicar linhas.", "Forgetting projection idempotency: a replay must not duplicate rows."],
        ["Tratar o tópico do Kafka com retenção curta como se fosse o event store.", "Treating a short-retention Kafka topic as if it were the event store."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Event sourcing persiste fatos; o estado é derivado por replay, com snapshots como otimização.", "Event sourcing persists facts; state is derived by replay, with snapshots as an optimization."],
        ["CQRS separa escrita e leitura; as projeções são eventualmente consistentes.", "CQRS separates writes from reads; projections are eventually consistent."],
        ["Upcasting trata eventos de versões antigas sem reescrever o histórico.", "Upcasting handles old-version events without rewriting history."],
        ["Event streaming move eventos entre sistemas e permite processamento contínuo (Kafka Streams, Flink).", "Event streaming moves events between systems and enables continuous processing (Kafka Streams, Flink)."],
        ["Podem se combinar, mas resolvem problemas diferentes.", "They can combine, but they solve different problems."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Posso usar o Kafka como event store?** Para sistemas pequenos e retenção infinita é possível, mas faltam leitura por agregado e controle otimista de concorrência; bancos próprios para isso costumam ser mais adequados.", "**Can I use Kafka as an event store?** For small systems with infinite retention it is possible, but per-aggregate reads and optimistic concurrency control are missing; purpose-built stores are usually more suitable."],
        ["**Event sourcing exige CQRS?** Na prática sim, porque consultar o log diretamente é inviável, então as leituras vêm de projeções.", "**Does event sourcing require CQRS?** In practice yes, because querying the log directly is impractical, so reads come from projections."],
        ["**Com que frequência fazer snapshot?** Quando o replay começar a pesar; algo como a cada 100 a 1.000 eventos é um começo.", "**How often to snapshot?** When replay starts to weigh; something like every 100 to 1,000 events is a start."],
        ["**Event streaming é o mesmo que message queue?** Não: o log guarda o histórico e permite reler; a fila clássica apaga após a entrega.", "**Is event streaming the same as a message queue?** No: the log keeps history and allows rereading; a classic queue deletes after delivery."],
      ),
      tip(["Pergunte primeiro: *preciso do histórico como dado de negócio?* Se a resposta for sim, considere event sourcing. Se só precisa avisar outros sistemas, event streaming (ou uma simples fila) basta.", "Ask first: *do I need history as business data?* If yes, consider event sourcing. If you only need to notify other systems, event streaming (or a plain queue) is enough."]),
    ] },

  { id: "tratamento-de-erros-em-eventos", section: "mensageria", level: 2, icon: "error", minutes: 14,
    title: ["Tratamento de erros em sistemas de eventos", "Error handling in event-driven systems"],
    summary: ["Retries com backoff e jitter, DLQ, poison messages, idempotência, outbox/inbox, ordenação, reprocessamento e compensações.", "Retries with backoff and jitter, DLQs, poison messages, idempotency, outbox/inbox, ordering, reprocessing and compensations."],
    body: [
      p(["Em um sistema síncrono, uma falha vira um erro que volta ao chamador. Em um sistema de eventos, ninguém está esperando a resposta: se o consumidor falha, o erro some no log do servidor e o evento pode ser perdido, duplicado ou travar toda a fila. Por isso o tratamento de erros em mensageria é um projeto à parte. As falhas são inevitáveis (rede, deploy, banco lento, bug, dado inesperado); o que se controla é **o que acontece depois delas**.", "In a synchronous system, a failure becomes an error returned to the caller. In an event-driven system nobody waits for the answer: if the consumer fails, the error vanishes into a server log and the event can be lost, duplicated or block the whole queue. That is why error handling in messaging is a project of its own. Failures are inevitable (network, deploy, slow database, bug, unexpected data); what you control is **what happens afterwards**."]),
      h(["Tipos de falha", "Kinds of failure"]),
      ul(
        ["**Transitória**: some sozinha (timeout, deadlock, serviço reiniciando, limite de taxa). A resposta é tentar de novo mais tarde.", "**Transient**: goes away on its own (timeout, deadlock, restarting service, rate limit). The answer is to retry later."],
        ["**Permanente**: nunca vai funcionar (JSON malformado, campo obrigatório ausente, regra de negócio violada, bug no código). Repetir só desperdiça recursos e atrasa o resto da fila.", "**Permanent**: will never work (malformed JSON, missing required field, violated business rule, bug in the code). Repeating only wastes resources and delays the rest of the queue."],
        ["**Parcial**: o consumidor fez metade do trabalho (gravou no banco, mas caiu antes do ack). É a mais traiçoeira e a razão pela qual a idempotência é indispensável.", "**Partial**: the consumer did half the work (wrote to the database but crashed before the ack). It is the trickiest and the reason idempotency is indispensable."],
      ),
      p(["O primeiro passo é **classificar**: tentar de novo erros transitórios e enviar os permanentes direto para uma DLQ, sem gastar tentativas.", "The first step is to **classify**: retry transient errors and send permanent ones straight to a DLQ without wasting attempts."]),
      h(["Retries com backoff exponencial e jitter", "Retries with exponential backoff and jitter"]),
      p(["Tentar de novo imediatamente costuma falhar de novo e, pior, martela um serviço que já está com problemas. O **backoff exponencial** espera cada vez mais entre tentativas (1 s, 2 s, 4 s, 8 s, até um teto). Mas se mil consumidores falharam juntos, eles voltarão juntos, em ondas sincronizadas que derrubam o serviço outra vez (*thundering herd*). O **jitter** acrescenta aleatoriedade à espera para espalhar as tentativas. A variante *full jitter* sorteia uniformemente entre 0 e o valor do backoff, e se mostra a mais eficiente em evitar colisões.", "Retrying immediately usually fails again and, worse, hammers a service already in trouble. **Exponential backoff** waits longer between attempts (1 s, 2 s, 4 s, 8 s, up to a cap). But if a thousand consumers failed together, they will return together, in synchronized waves that knock the service over again (*thundering herd*). **Jitter** adds randomness to the wait to spread attempts out. The *full jitter* variant draws uniformly between 0 and the backoff value, and proves the most effective at avoiding collisions."]),
      code(`function backoffMs(attempt: number, baseMs = 500, capMs = 60_000): number {
  const exp = Math.min(capMs, baseMs * 2 ** attempt);
  return Math.random() * exp;               // full jitter
}

async function withRetry<T>(fn: () => Promise<T>, max = 5): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await fn(); }
    catch (err) {
      if (!isTransient(err) || attempt + 1 >= max) throw err;   // give up -> DLQ
      await sleep(backoffMs(attempt));
    }
  }
}`),
      p(["Em filas sem espera nativa, o *retry* costuma ser implementado com **filas de retry em degraus**: `retry-5s`, `retry-1m`, `retry-10m`. A mensagem falha, vai para a fila do degrau seguinte (com TTL ou atraso agendado) e retorna à fila principal quando o tempo expira. No SQS, ajusta-se o *visibility timeout* a cada falha; no RabbitMQ usam-se TTL e *dead-letter exchange*; no Kafka, tópicos `retry` separados, para não bloquear a partição.", "In queues without native delay, *retry* is usually implemented with **stepped retry queues**: `retry-5s`, `retry-1m`, `retry-10m`. The message fails, goes to the next step's queue (with TTL or scheduled delay) and returns to the main queue when the time expires. In SQS, you adjust the *visibility timeout* on each failure; in RabbitMQ you use TTL and a *dead-letter exchange*; in Kafka, separate `retry` topics, so the partition is not blocked."]),
      h(["Dead-letter queue e poison messages", "Dead-letter queue and poison messages"]),
      p(["Uma **poison message** é aquela que sempre falha: o consumidor a lê, quebra, a mensagem volta, o consumidor quebra de novo, num ciclo infinito que consome CPU e pode bloquear tudo atrás dela. A **dead-letter queue** (DLQ) é o destino da mensagem depois de esgotar as tentativas (por exemplo 5) ou de ser classificada como permanente. Ela guarda a mensagem original junto com metadados: motivo do erro, stack trace, número de tentativas, hora, fila de origem. Com isso o time pode investigar sem pressão, corrigir o bug ou os dados e **reenviar** (*redrive*) as mensagens à fila principal.", "A **poison message** is one that always fails: the consumer reads it, breaks, the message returns, the consumer breaks again, in an infinite loop that eats CPU and can block everything behind it. The **dead-letter queue** (DLQ) is where the message goes after exhausting its attempts (say 5) or being classified as permanent. It stores the original message together with metadata: error reason, stack trace, attempt count, time, source queue. The team can then investigate without pressure, fix the bug or the data and **redrive** the messages to the main queue."]),
      fig(["Retries e DLQ", "Retries and DLQ"],
        [[node("main", ["Fila principal", "Main queue"], "queue")], [node("w", "Consumer", "service")], [node("rt", ["Fila de retry (atraso)", "Retry queue (delay)"], "queue"), node("dlq", "DLQ", "queue")], [node("ops", ["Alerta + redrive", "Alert + redrive"], "ext")]],
        [edge("main", "w"), edge("w", "rt", ["falha transitória", "transient failure"]), edge("rt", "main", ["após atraso", "after delay"], { dashed: true }), edge("w", "dlq", ["permanente ou esgotou", "permanent or exhausted"]), edge("dlq", "ops")]),
      ul(
        ["Uma DLQ **sem alarme** vira cemitério: configure alerta quando a DLQ deixar de estar vazia.", "A DLQ **without an alarm** becomes a graveyard: alert whenever the DLQ is not empty."],
        ["Defina retenção da DLQ maior que a da fila principal, para não perder o que ainda não foi analisado.", "Set DLQ retention longer than the main queue's, so you do not lose what has not been analyzed yet."],
        ["No SQS a *redrive policy* (`maxReceiveCount`) move a mensagem sozinha; no Kafka a DLQ é um tópico que a aplicação precisa publicar.", "In SQS the *redrive policy* (`maxReceiveCount`) moves the message automatically; in Kafka the DLQ is a topic that the application must publish to."],
      ),
      h(["Idempotência e tabela de deduplicação", "Idempotency and the deduplication table"]),
      p(["Com entrega *at-least-once*, reentregas são parte do contrato. Uma operação é **idempotente** quando repeti-la não muda o resultado além da primeira vez. Algumas já são (`SET status = 'pago'`); outras não (`saldo = saldo - 100`, enviar e-mail). Para as que não são, usa-se uma **tabela de deduplicação** (ou *inbox*): cada evento tem um id único (`event_id`); o consumidor insere esse id numa tabela com chave primária e executa o trabalho **na mesma transação**. Se o insert falha por duplicata, o evento já foi tratado e é ignorado.", "With *at-least-once* delivery, redeliveries are part of the contract. An operation is **idempotent** when repeating it does not change the result beyond the first time. Some already are (`SET status = 'paid'`); others are not (`balance = balance - 100`, sending an email). For those that are not, use a **deduplication table** (or *inbox*): each event has a unique id (`event_id`); the consumer inserts that id into a table with a primary key and runs the work **in the same transaction**. If the insert fails as a duplicate, the event was already handled and is ignored."]),
      code(`-- Inbox table: processed events
CREATE TABLE processed_events (
  event_id   uuid PRIMARY KEY,
  handled_at timestamptz NOT NULL DEFAULT now()
);

-- Consumer, inside ONE transaction:
BEGIN;
  INSERT INTO processed_events (event_id) VALUES ($1)
    ON CONFLICT DO NOTHING;                 -- 0 rows = duplicate
  -- if 1 row inserted: apply the business effect
  UPDATE accounts SET balance = balance - $2 WHERE id = $3;
COMMIT;`),
      p(["Duas observações práticas. Primeira: o id precisa ser **estável** (gerado pelo produtor, não pelo broker a cada entrega). Segunda: para efeitos externos (e-mail, cobrança em um gateway), repasse o id do evento como **chave de idempotência** na chamada (`Idempotency-Key`), para que o fornecedor também deduplique. Limpe a tabela depois de um período maior que o da maior reentrega possível (por exemplo 7 dias).", "Two practical notes. First: the id must be **stable** (generated by the producer, not by the broker at each delivery). Second: for external effects (email, charging on a gateway), pass the event id as an **idempotency key** on the call (`Idempotency-Key`), so the provider also deduplicates. Clean the table after a period longer than the longest possible redelivery (say 7 days)."]),
      h(["Outbox e inbox: o problema da escrita dupla", "Outbox and inbox: the dual-write problem"]),
      p(["Um serviço precisa gravar no banco *e* publicar um evento. Se faz as duas coisas em sequência, qualquer queda entre elas deixa o sistema inconsistente: gravou mas não publicou (o resto do sistema nunca fica sabendo) ou publicou mas o banco falhou (um evento sobre algo que não aconteceu). Não existe transação distribuída barata entre um banco e um broker. A solução é o **transactional outbox**: o evento é gravado numa tabela `outbox` **na mesma transação** que a mudança de estado. Um processo separado (um *relay* ou um *CDC* como o Debezium lendo o log do banco) lê a tabela e publica no broker, marcando o que foi enviado. Como o relay pode publicar duas vezes, os consumidores usam a **inbox** (tabela de deduplicação) do tópico anterior. O conjunto dá um efeito *exactly-once* de ponta a ponta, construído com at-least-once mais idempotência.", "A service must write to the database *and* publish an event. If it does both in sequence, any crash between them leaves the system inconsistent: it wrote but did not publish (the rest of the system never learns) or it published but the database failed (an event about something that did not happen). There is no cheap distributed transaction between a database and a broker. The solution is the **transactional outbox**: the event is written to an `outbox` table **in the same transaction** as the state change. A separate process (a *relay* or a *CDC* tool like Debezium reading the database log) reads the table and publishes to the broker, marking what was sent. Since the relay may publish twice, consumers use the **inbox** (deduplication table) from the previous topic. Together they give an end-to-end *exactly-once* effect, built from at-least-once plus idempotency."]),
      fig(["Outbox + relay + inbox", "Outbox + relay + inbox"],
        [[node("svc", ["Serviço A", "Service A"], "service")], [node("db", ["Banco A: estado + outbox", "DB A: state + outbox"], "data")], [node("rel", ["Relay / CDC", "Relay / CDC"], "service")], [node("bk", ["Broker", "Broker"], "queue")], [node("cons", ["Serviço B + inbox", "Service B + inbox"], "service")]],
        [edge("svc", "db", ["1 transação", "1 transaction"]), edge("db", "rel"), edge("rel", "bk", ["at-least-once", "at-least-once"]), edge("bk", "cons")]),
      code(`BEGIN;
  UPDATE orders SET status = 'paid' WHERE id = $1;
  INSERT INTO outbox (id, aggregate_id, type, payload)
    VALUES (gen_random_uuid(), $1, 'OrderPaid', $2);
COMMIT;
-- relay: SELECT ... FROM outbox WHERE sent_at IS NULL ORDER BY created_at
--        FOR UPDATE SKIP LOCKED; publish; UPDATE outbox SET sent_at = now()`),
      h(["Ordenação e reprocessamento", "Ordering and reprocessing"]),
      p(["Retries e paralelismo bagunçam a ordem. Se o evento 1 (`PedidoCriado`) falha e vai para a fila de retry enquanto o evento 2 (`PedidoCancelado`) passa, o consumidor tenta cancelar um pedido que ainda não existe. Estratégias: (1) **bloquear por chave**: enquanto um evento de uma chave está em retry, os seguintes da mesma chave esperam (o Kafka faz isso naturalmente se você não pula a mensagem); (2) **versão ou sequência** no evento: o consumidor ignora eventos mais antigos que o estado que já tem e coloca em espera os que chegaram adiantados; (3) tornar os eventos **comutativos** ou carregar o estado completo (*event-carried state transfer*), de modo que a ordem não importe; (4) aceitar a desordem em domínios em que ela é inofensiva.", "Retries and parallelism scramble order. If event 1 (`OrderCreated`) fails and goes to the retry queue while event 2 (`OrderCancelled`) passes, the consumer tries to cancel an order that does not yet exist. Strategies: (1) **block per key**: while an event of a key is in retry, the following ones of the same key wait (Kafka does this naturally if you do not skip the message); (2) a **version or sequence** in the event: the consumer ignores events older than the state it already has and parks those that arrived early; (3) make events **commutative** or carry the full state (*event-carried state transfer*), so order does not matter; (4) accept disorder in domains where it is harmless."]),
      p(["O **reprocessamento** (replay) depois de corrigir um bug é rotina: reler a DLQ ou voltar o offset de um consumidor para uma data. Ele só é seguro se o consumidor for idempotente e se os efeitos colaterais externos puderem ser suprimidos (não reenviar mil e-mails antigos). Muitos times separam o consumidor em duas partes: a que atualiza o estado, que pode ser repetida, e a que dispara efeitos, que consulta antes se o efeito já ocorreu. Para reprocessar em massa, use um grupo de consumidores novo e limite a taxa para não derrubar os sistemas a jusante.", "**Reprocessing** (replay) after fixing a bug is routine: rereading the DLQ or moving a consumer's offset to a date. It is only safe if the consumer is idempotent and if external side effects can be suppressed (do not resend a thousand old emails). Many teams split the consumer in two parts: the one that updates state, which may repeat, and the one that fires effects, which checks first whether the effect already happened. To reprocess in bulk, use a new consumer group and limit the rate so as not to knock over downstream systems."]),
      h(["Restauração de estado após falha: snapshots e replay", "State recovery after failure: snapshots and replay"]),
      p(["Consumidores com estado (um agregador de janelas, uma projeção, um processador de streams) perdem a memória quando caem. Para voltar sem perder dados, a combinação é a mesma do event sourcing: periodicamente grava-se um **snapshot** (ou *checkpoint*) do estado junto com o **offset** correspondente; ao reiniciar, carrega-se o snapshot e **reproduz-se o log** a partir daquele offset. O Kafka Streams mantém o estado em um banco local (RocksDB) e o espelha num tópico de *changelog*; o Flink grava checkpoints consistentes em armazenamento durável. O essencial é que estado e offset sejam gravados **juntos de forma atômica**; senão, ao restaurar, eventos são contados duas vezes ou nenhuma.", "Stateful consumers (a window aggregator, a projection, a stream processor) lose their memory when they crash. To come back without losing data, the recipe is the same as in event sourcing: periodically write a **snapshot** (or *checkpoint*) of the state together with the matching **offset**; on restart, load the snapshot and **replay the log** from that offset. Kafka Streams keeps state in a local database (RocksDB) and mirrors it in a *changelog* topic; Flink writes consistent checkpoints to durable storage. The essential point is that state and offset are saved **together atomically**; otherwise, on restore, events are counted twice or not at all."]),
      h(["Compensações e sagas", "Compensations and sagas"]),
      p(["Quando um processo envolve vários serviços, não há `ROLLBACK` global. Se o pagamento foi aprovado mas o estoque falhou, é preciso **desfazer semanticamente** o pagamento. Uma **saga** divide o processo em passos locais, cada um com uma **ação compensatória**: reservar estoque (liberar reserva), cobrar (estornar), emitir nota (cancelar nota). Se um passo falha de forma definitiva, executam-se as compensações dos passos já concluídos, em ordem inversa. Compensar não é voltar no tempo: o histórico mostra a cobrança e o estorno, e o cliente pode até ver ambos. As compensações também precisam ser idempotentes e ter retry, pois podem falhar.", "When a process spans several services, there is no global `ROLLBACK`. If payment was approved but inventory failed, you must **semantically undo** the payment. A **saga** splits the process into local steps, each with a **compensating action**: reserve stock (release reservation), charge (refund), issue invoice (cancel invoice). If a step fails definitively, the compensations of the completed steps run in reverse order. Compensating is not time travel: history shows the charge and the refund, and the customer may even see both. Compensations must also be idempotent and retried, since they can fail too."]),
      h(["Boas práticas", "Best practices"]),
      ul(
        ["Classifique erros (transitório x permanente) e trate cada um de forma diferente.", "Classify errors (transient vs permanent) and handle each differently."],
        ["Limite o número de tentativas e o tempo total; use backoff com jitter.", "Cap the number of attempts and total time; use backoff with jitter."],
        ["Toda mensagem leva um id estável, um id de correlação e a versão do esquema.", "Every message carries a stable id, a correlation id and the schema version."],
        ["Monitore: taxa de erro, tamanho e idade da fila, tamanho da DLQ, lag de consumo.", "Monitor: error rate, queue size and age, DLQ size, consumption lag."],
        ["Teste de caos: derrube consumidores no meio do processamento e confirme que nada é perdido nem duplicado.", "Chaos testing: kill consumers mid-processing and confirm nothing is lost or duplicated."],
        ["Use um *circuit breaker* diante de dependências instáveis, pausando o consumo em vez de enviar tudo para a DLQ.", "Use a *circuit breaker* in front of unstable dependencies, pausing consumption instead of sending everything to the DLQ."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Retry infinito e imediato: derruba o serviço dependente e esgota os workers.", "Infinite, immediate retry: knocks over the dependent service and exhausts the workers."],
        ["Engolir exceções e dar ack: o erro desaparece e a mensagem é perdida em silêncio.", "Swallowing exceptions and acking: the error disappears and the message is silently lost."],
        ["Publicar no broker depois do commit no banco sem outbox: uma queda entre os dois gera eventos perdidos.", "Publishing to the broker after the database commit without an outbox: a crash between the two loses events."],
        ["Deduplicar com um cache em memória: reiniciar o consumidor apaga a memória e permite duplicatas.", "Deduplicating with an in-memory cache: restarting the consumer erases memory and permits duplicates."],
        ["Reprocessar a DLQ sem corrigir a causa: as mesmas mensagens voltam para ela.", "Reprocessing the DLQ without fixing the cause: the same messages return to it."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Classifique falhas; tente de novo as transitórias com backoff e jitter, e envie as permanentes à DLQ.", "Classify failures; retry transient ones with backoff and jitter, and send permanent ones to the DLQ."],
        ["Idempotência com tabela de deduplicação na mesma transação do efeito é a base da segurança.", "Idempotency with a deduplication table in the same transaction as the effect is the foundation of safety."],
        ["Outbox resolve a escrita dupla banco + broker; inbox resolve as duplicatas na leitura.", "Outbox solves the database + broker dual write; inbox solves duplicates on read."],
        ["Ordem se protege com chave, versão ou eventos comutativos.", "Order is protected with keys, versions or commutative events."],
        ["Estado se restaura por snapshot + replay; processos distribuídos se desfazem por compensação.", "State is restored by snapshot + replay; distributed processes are undone by compensation."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Quantas tentativas fazer?** Em geral 3 a 5 com backoff, ou um tempo máximo total; depende de quanto a falha transitória costuma durar.", "**How many attempts?** Usually 3 to 5 with backoff, or a maximum total time; it depends on how long transient failures typically last."],
        ["**Devo guardar a DLQ para sempre?** Não, mas tempo suficiente para análise (dias ou semanas) e com alarme.", "**Should I keep the DLQ forever?** No, but long enough for analysis (days or weeks) and with an alarm."],
        ["**Exactly-once existe?** Como efeito de ponta a ponta, sim, combinando at-least-once, outbox e idempotência. Como garantia do transporte, só em sistemas limitados.", "**Does exactly-once exist?** As an end-to-end effect, yes, combining at-least-once, outbox and idempotency. As a transport guarantee, only in bounded systems."],
        ["**Posso pular uma mensagem que quebra a partição do Kafka?** Sim, enviando-a a uma DLQ e avançando o offset, mas registre o motivo para reprocessar depois.", "**Can I skip a message that breaks a Kafka partition?** Yes, by sending it to a DLQ and advancing the offset, but record the reason to reprocess later."],
      ),
      tip(["Pense em cada consumidor com a pergunta: *e se esta mensagem chegar duas vezes, fora de ordem, ou nunca chegar?* Se a resposta for aceitável nos três casos, o desenho está sólido.", "Ask of every consumer: *what if this message arrives twice, out of order, or never?* If the answer is acceptable in all three cases, the design is solid."]),
    ] },

  { id: "request-driven-vs-event-driven", section: "mensageria", level: 1, icon: "swap_horiz", minutes: 13,
    title: ["Request-driven x event-driven", "Request-driven vs event-driven"],
    summary: ["Pedir, enviar mensagem ou anunciar um fato; acoplamento temporal, coreografia x orquestração, consistência eventual e observabilidade.", "Ask, send a message or announce a fact; temporal coupling, choreography vs orchestration, eventual consistency and observability."],
    body: [
      p(["Quando um serviço precisa de outro, há três formas de conversar, e a escolha define quanto os dois ficam amarrados. Pode **pedir** e esperar a resposta (*request-driven*), **mandar uma mensagem** a um destinatário conhecido e seguir em frente (*message-driven*) ou **anunciar um fato** a quem quiser ouvir (*event-driven*). Quase todo sistema real mistura as três, e o trabalho de design é decidir onde cada uma se encaixa.", "When one service needs another, there are three ways to talk, and the choice sets how tightly the two are tied. It can **ask** and wait for the answer (*request-driven*), **send a message** to a known recipient and move on (*message-driven*), or **announce a fact** to whoever wants to listen (*event-driven*). Almost every real system mixes the three, and the design work is deciding where each fits."]),
      h(["Request-driven: perguntar e esperar", "Request-driven: ask and wait"]),
      p(["O cliente chama o servidor (HTTP/REST, gRPC) e **espera a resposta** antes de continuar. O fluxo é simples de entender e de depurar: uma chamada, um resultado, um stack trace. Um erro volta imediatamente ao chamador, que decide o que fazer. É o modelo certo quando o chamador **precisa da resposta para prosseguir**: consultar o saldo antes de exibir a tela, validar um cupom, autenticar um usuário.", "The client calls the server (HTTP/REST, gRPC) and **waits for the answer** before continuing. The flow is easy to understand and debug: one call, one result, one stack trace. An error returns immediately to the caller, who decides what to do. It is the right model when the caller **needs the answer to proceed**: querying a balance before showing the screen, validating a coupon, authenticating a user."]),
      p(["O custo é o **acoplamento temporal**: os dois serviços precisam estar no ar **ao mesmo tempo**. Se o serviço B está lento, o A fica lento (as threads ficam presas esperando); se B cai, A falha. Numa cadeia A, B, C, D, a disponibilidade combinada é o produto das individuais: quatro serviços com 99,9% cada resultam em cerca de 99,6%, ou 35 horas de indisponibilidade por ano, em vez de 8,8. Também há acoplamento de **conhecimento**: A precisa saber o endereço de B, o formato da chamada e a ordem correta em que chamar vários serviços.", "The cost is **temporal coupling**: both services must be up **at the same time**. If B is slow, A is slow (threads stay stuck waiting); if B dies, A fails. In a chain A, B, C, D, combined availability is the product of the individual ones: four services at 99.9% each give about 99.6%, or 35 hours of downtime a year instead of 8.8. There is also **knowledge** coupling: A must know B's address, the call format and the right order for calling several services."]),
      h(["Message-driven: enviar uma mensagem a um destinatário", "Message-driven: send a message to a recipient"]),
      p(["Aqui o remetente entrega uma **mensagem** (em geral um *comando*, como `EnviarEmail` ou `GerarRelatório`) a uma fila e segue em frente. O destinatário é conhecido (a fila tem dono) e a mensagem pede uma **ação**. O broker guarda a mensagem até alguém tratá-la, então os dois lados **não precisam estar no ar ao mesmo tempo**. O remetente ainda sabe *quem* deve agir, só não espera o resultado. Resposta, quando necessária, vem por outra mensagem (um *reply* com id de correlação) ou por consulta posterior.", "Here the sender hands a **message** (usually a *command*, like `SendEmail` or `GenerateReport`) to a queue and moves on. The recipient is known (the queue has an owner) and the message asks for an **action**. The broker keeps the message until someone handles it, so the two sides **need not be up at the same time**. The sender still knows *who* should act; it just does not wait for the result. A reply, when needed, comes through another message (a *reply* with a correlation id) or a later query."]),
      h(["Event-driven: anunciar fatos", "Event-driven: announce facts"]),
      p(["No modelo orientado a eventos, o serviço publica um **evento**: um fato já ocorrido, no passado (`PedidoCriado`, `PagamentoAprovado`), sem saber quem vai reagir nem se alguém reage. Zero, um ou dez serviços podem consumir. Adicionar um novo interessado (um serviço de recomendações, um painel de análise) **não exige mudar o produtor**. A diferença com o message-driven é de intenção: o comando diz *o que fazer*, o evento diz *o que aconteceu*. O produtor de um evento não se responsabiliza pelo que os outros fazem com ele.", "In the event-driven model, the service publishes an **event**: a fact that already happened, in the past tense (`OrderCreated`, `PaymentApproved`), without knowing who will react or whether anyone does. Zero, one or ten services may consume it. Adding a new interested party (a recommendation service, an analytics dashboard) **does not require changing the producer**. The difference from message-driven is intent: a command says *what to do*, an event says *what happened*. The producer of an event takes no responsibility for what others do with it."]),
      fig(["Pedido: chamadas em cadeia x eventos", "Order: call chain vs events"],
        [[node("cli", "Client", "client")], [node("ord", ["Pedidos", "Orders"], "service")], [node("bus", ["Tópico: PedidoCriado", "Topic: OrderCreated"], "queue")], [node("pay", ["Pagamento", "Payment"], "service"), node("inv", ["Estoque", "Inventory"], "service"), node("mail", ["E-mail", "Email"], "service")]],
        [edge("cli", "ord", ["POST /orders", "POST /orders"]), edge("ord", "bus", ["publica evento", "publishes event"]), edge("bus", "pay"), edge("bus", "inv"), edge("bus", "mail")]),
      h(["Comparação", "Comparison"]),
      table([["Aspecto", "Aspect"], ["Request-driven", "Request-driven"], ["Message-driven", "Message-driven"], ["Event-driven", "Event-driven"]],
        [["Intenção", "Intent"], ["Pergunta ou ordem com resposta", "Question or order with answer"], ["Comando para um destinatário", "Command to a recipient"], ["Fato já ocorrido", "Fact that already happened"]],
        [["Quem sabe de quem", "Who knows whom"], ["Chamador conhece o servidor", "Caller knows the server"], ["Remetente conhece o destinatário", "Sender knows the recipient"], ["Produtor não conhece consumidores", "Producer does not know consumers"]],
        [["Acoplamento temporal", "Temporal coupling"], ["Alto: ambos no ar", "High: both up"], ["Baixo: o broker guarda", "Low: the broker holds it"], ["Baixo: o broker guarda", "Low: the broker holds it"]],
        [["Resposta", "Response"], ["Imediata e síncrona", "Immediate and synchronous"], ["Opcional, assíncrona", "Optional, asynchronous"], ["Não há; reações são independentes", "None; reactions are independent"]],
        [["Consistência", "Consistency"], ["Fácil de ter forte", "Easy to make strong"], ["Eventual", "Eventual"], ["Eventual", "Eventual"]],
        [["Depuração", "Debugging"], ["Simples (um trace)", "Simple (one trace)"], ["Média", "Medium"], ["Difícil sem tracing e correlação", "Hard without tracing and correlation"]],
        [["Extensibilidade", "Extensibility"], ["Mudar o chamador para cada novo uso", "Change the caller for each new use"], ["Média", "Medium"], ["Alta: novos consumidores sem mexer no produtor", "High: new consumers without touching the producer"]]),
      h(["Coreografia x orquestração", "Choreography vs orchestration"]),
      p(["Quando um processo de negócio passa por vários serviços (pedido, pagamento, estoque, entrega), há duas formas de coordená-lo. Na **coreografia**, não existe coordenador: cada serviço reage a eventos e publica os seus (`PedidoCriado` leva o pagamento a publicar `PagamentoAprovado`, que leva o estoque a reservar, e assim por diante). É desacoplada e escala bem, mas o **fluxo fica implícito**, espalhado entre os serviços: para saber o que acontece no checkout é preciso ler cinco repositórios, e ciclos acidentais de eventos são possíveis. Na **orquestração**, um componente central (o orquestrador, como Temporal, AWS Step Functions, Camunda ou uma saga própria) conhece o processo, chama cada passo na ordem, controla estado, timeouts e compensações. O fluxo é **explícito e visível**, o que facilita auditar e mudar, ao preço de um ponto central de coordenação e de maior acoplamento dos serviços ao orquestrador.", "When a business process crosses several services (order, payment, inventory, shipping), there are two ways to coordinate it. In **choreography** there is no coordinator: each service reacts to events and publishes its own (`OrderCreated` makes payment publish `PaymentApproved`, which makes inventory reserve, and so on). It is decoupled and scales well, but the **flow stays implicit**, scattered across services: to know what happens at checkout you must read five repositories, and accidental event cycles are possible. In **orchestration**, a central component (the orchestrator, like Temporal, AWS Step Functions, Camunda or a custom saga) knows the process, calls each step in order, and manages state, timeouts and compensations. The flow is **explicit and visible**, which eases auditing and change, at the price of a central coordination point and heavier coupling of services to the orchestrator."]),
      table([["Critério", "Criterion"], ["Coreografia", "Choreography"], ["Orquestração", "Orchestration"]],
        [["Controle do fluxo", "Flow control"], ["Distribuído, implícito", "Distributed, implicit"], ["Central, explícito", "Central, explicit"]],
        [["Acoplamento", "Coupling"], ["Entre eventos e esquemas", "Via events and schemas"], ["Serviços conhecem o orquestrador", "Services know the orchestrator"]],
        [["Visibilidade", "Visibility"], ["Baixa sem tracing", "Low without tracing"], ["Alta (estado do processo num só lugar)", "High (process state in one place)"]],
        [["Bom para", "Good for"], ["Fluxos curtos e simples, integrações leves", "Short, simple flows, light integrations"], ["Processos longos, com regras, timeouts e compensações", "Long processes with rules, timeouts and compensations"]],
        [["Risco", "Risk"], ["Espaguete de eventos", "Event spaghetti"], ["Orquestrador vira um monolito de lógica", "Orchestrator becomes a logic monolith"]]),
      h(["Tabela de decisão: qual usar?", "Decision table: which to use?"]),
      table([["Situação", "Situation"], ["Escolha", "Choice"], ["Motivo", "Reason"]],
        [["O usuário precisa do resultado agora (login, saldo, cálculo de frete)", "The user needs the result now (login, balance, shipping quote)"], ["Request-driven", "Request-driven"], ["Resposta imediata e erro direto", "Immediate answer and direct error"]],
        [["Tarefa lenta que alguém específico executa (gerar PDF, enviar e-mail)", "Slow task a specific party performs (generate PDF, send email)"], ["Message-driven", "Message-driven"], ["Comando, retry, absorve picos", "Command, retry, absorbs spikes"]],
        [["Vários sistemas reagem ao mesmo fato (pedido criado)", "Several systems react to the same fact (order created)"], ["Event-driven", "Event-driven"], ["Novos consumidores sem mudar o produtor", "New consumers without changing the producer"]],
        [["Processo longo com compensações e prazos (checkout, onboarding)", "Long process with compensations and deadlines (checkout, onboarding)"], ["Orquestração", "Orchestration"], ["Fluxo explícito e auditável", "Explicit, auditable flow"]],
        [["Notificar mudança de dados entre domínios", "Notifying data changes across domains"], ["Event-driven (coreografia)", "Event-driven (choreography)"], ["Baixo acoplamento", "Low coupling"]],
        [["Consulta que cruza dados de vários serviços para uma tela", "Query crossing data from several services for a screen"], ["Request-driven com agregador, ou projeção por eventos", "Request-driven with aggregator, or event-built projection"], ["Leitura rápida sem cadeia de chamadas", "Fast read without a call chain"]]),
      h(["Exemplo: do síncrono ao orientado a eventos", "Example: from synchronous to event-driven"]),
      p(["Versão síncrona do checkout: o serviço de pedidos chama pagamento, depois estoque, depois e-mail, e responde quando todos terminam. Se o serviço de e-mail está lento, o checkout inteiro fica lento. Na versão com eventos, o serviço de pedidos grava o pedido, publica `OrderCreated` e responde. Pagamento, estoque e e-mail reagem por conta própria.", "Synchronous checkout version: the orders service calls payment, then inventory, then email, and answers when all finish. If the email service is slow, the whole checkout is slow. In the event version, the orders service writes the order, publishes `OrderCreated` and answers. Payment, inventory and email react on their own."]),
      code(`// Request-driven: chain of calls
async function checkout(order: Order) {
  await payments.charge(order);        // if it fails, everything fails
  await inventory.reserve(order);
  await email.sendReceipt(order);      // slow email slows the checkout
  return { status: "done" };
}

// Event-driven: record + announce
async function checkoutEvents(order: Order) {
  await db.transaction(async (tx) => {
    await tx.insert("orders", { ...order, status: "pending" });
    await tx.insert("outbox", { type: "OrderCreated", payload: order });
  });
  return { status: "pending" };        // 202: the rest happens afterwards
}

// Each consumer reacts independently
on("OrderCreated", async (e) => { await payments.charge(e.payload); await emit("PaymentApproved", e.payload.id); });
on("PaymentApproved", async (e) => { await inventory.reserve(e.orderId); });`),
      p(["Note o que mudou para o usuário: a resposta é *pendente*, e a interface precisa tratar estados intermediários (*processando pagamento*), notificações ou polling. Esse é o preço da independência.", "Note what changed for the user: the answer is *pending*, and the interface must handle intermediate states (*processing payment*), notifications or polling. That is the price of independence."]),
      h(["Consistência eventual", "Eventual consistency"]),
      p(["Com eventos, os dados dos serviços deixam de ficar sincronizados no mesmo instante: há uma janela, de milissegundos a minutos, em que o estoque ainda não refletiu o pedido, ou a busca ainda não indexou o produto novo. Isso é a **consistência eventual**: se não houver novas mudanças, todos os serviços acabam concordando. Para conviver bem com ela: modele estados intermediários explícitos (`PENDENTE`, `CONFIRMADO`), mostre ao usuário o que está acontecendo, projete operações idempotentes, use compensações em vez de transações distribuídas, e evite que a lógica dependa de ler dados de outro serviço que podem estar desatualizados. Para o que *exige* consistência forte (saldo que não pode ficar negativo), mantenha a operação dentro de um único serviço e banco, com transação local.", "With events, services' data stops being synchronized at the same instant: there is a window, from milliseconds to minutes, in which inventory has not yet reflected the order, or search has not yet indexed the new product. This is **eventual consistency**: absent new changes, all services end up agreeing. To live well with it: model explicit intermediate states (`PENDING`, `CONFIRMED`), show users what is happening, design idempotent operations, use compensations instead of distributed transactions, and avoid logic that depends on reading another service's possibly stale data. For what *requires* strong consistency (a balance that cannot go negative), keep the operation inside a single service and database with a local transaction."]),
      h(["Observabilidade em sistemas orientados a eventos", "Observability in event-driven systems"]),
      p(["Numa cadeia síncrona, um trace mostra a chamada inteira. Num fluxo assíncrono, o raciocínio se perde entre serviços, e depurar \"por que o cliente não recebeu o e-mail\" pode virar uma investigação em seis sistemas. O que ajuda:", "In a synchronous chain, one trace shows the whole call. In an asynchronous flow, the thread of reasoning gets lost between services, and debugging \"why did the customer not get the email\" can become an investigation across six systems. What helps:"]),
      ul(
        ["**Id de correlação** em todo evento (gerado na entrada e propagado), presente em todos os logs.", "A **correlation id** on every event (generated at the entry point and propagated), present in all logs."],
        ["**Tracing distribuído** (OpenTelemetry): propague o contexto de trace nos cabeçalhos da mensagem, para que o consumo apareça como parte do mesmo trace.", "**Distributed tracing** (OpenTelemetry): propagate trace context in message headers so consumption appears as part of the same trace."],
        ["**Métricas de saúde do fluxo**: tamanho e idade das filas, lag dos consumidores, taxa de erros, tamanho da DLQ, tempo ponta a ponta do evento até o efeito final.", "**Flow health metrics**: queue size and age, consumer lag, error rate, DLQ size, end-to-end time from event to final effect."],
        ["**Catálogo de eventos e esquemas** (schema registry, AsyncAPI) para saber quem publica e quem consome o quê.", "**Event and schema catalog** (schema registry, AsyncAPI) to know who publishes and who consumes what."],
        ["**Alertas de negócio**: pedidos em estado pendente há mais de X minutos indicam um evento perdido ou travado.", "**Business alerts**: orders pending for more than X minutes indicate a lost or stuck event."],
      ),
      h(["Vantagens e desvantagens do modelo orientado a eventos", "Pros and cons of the event-driven model"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Drawbacks"]],
        [["Baixo acoplamento e evolução independente", "Low coupling and independent evolution"], ["Fluxo menos visível e mais difícil de depurar", "Less visible flow, harder to debug"]],
        [["Resiliência: falhas isoladas, mensagens esperam", "Resilience: isolated failures, messages wait"], ["Consistência eventual e estados intermediários", "Eventual consistency and intermediate states"]],
        [["Escala e absorve picos", "Scales and absorbs spikes"], ["Duplicatas, ordem e idempotência exigem cuidado", "Duplicates, ordering and idempotency need care"]],
        [["Fácil adicionar consumidores", "Easy to add consumers"], ["Infraestrutura e governança extras (broker, esquemas)", "Extra infrastructure and governance (broker, schemas)"]]),
      h(["Casos reais", "Real-world cases"]),
      p(["Comércio eletrônico: o checkout é síncrono até o pagamento ser aceito, e o resto (nota fiscal, e-mail, separação no estoque, recomendações) corre por eventos. Aplicativos de corrida: a posição do motorista flui como eventos para vários consumidores (mapa, preço dinâmico, estimativa de chegada), enquanto o pedido da corrida é uma chamada síncrona. Bancos: a transferência é orquestrada como saga (debitar, creditar, notificar), com compensação se o crédito falhar.", "E-commerce: checkout is synchronous until payment is accepted, and the rest (invoice, email, warehouse picking, recommendations) runs on events. Ride-hailing apps: the driver's position flows as events to several consumers (map, dynamic pricing, arrival estimate), while ordering the ride is a synchronous call. Banks: a transfer is orchestrated as a saga (debit, credit, notify), with compensation if the credit fails."]),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Fazer *event-driven* só de fachada: um evento que na verdade é um comando disfarçado, com o produtor esperando uma reação específica.", "Fake event-driven: an event that is really a disguised command, with the producer expecting a specific reaction."],
        ["Eventos gordos demais (o banco inteiro) ou finos demais (só o id, forçando cada consumidor a chamar o produtor de volta, recriando o acoplamento síncrono).", "Events too fat (the whole database) or too thin (only the id, forcing each consumer to call the producer back, recreating synchronous coupling)."],
        ["Mudar o esquema do evento sem versionamento e quebrar consumidores desconhecidos.", "Changing the event schema without versioning and breaking unknown consumers."],
        ["Adotar eventos para tudo, inclusive onde uma simples chamada resolveria.", "Adopting events for everything, even where a simple call would do."],
        ["Não monitorar atrasos e deixar fluxos travarem sem ninguém notar.", "Not monitoring delays and letting flows stall unnoticed."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Request-driven pergunta e espera: simples, mas amarra os dois lados no tempo.", "Request-driven asks and waits: simple, but ties both sides together in time."],
        ["Message-driven envia um comando a um destinatário; event-driven anuncia um fato a quem quiser.", "Message-driven sends a command to a recipient; event-driven announces a fact to whoever wants it."],
        ["Coreografia é descentralizada e implícita; orquestração é central e explícita.", "Choreography is decentralized and implicit; orchestration is central and explicit."],
        ["O preço dos eventos é a consistência eventual e a necessidade de boa observabilidade.", "The price of events is eventual consistency and the need for good observability."],
        ["Misture os estilos: síncrono onde se precisa da resposta, eventos onde se quer independência.", "Mix the styles: synchronous where the answer is needed, events where independence is wanted."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Event-driven substitui REST?** Não. REST e gRPC continuam ideais para consultas e comandos que precisam de resposta; eventos complementam.", "**Does event-driven replace REST?** No. REST and gRPC remain ideal for queries and commands that need an answer; events complement them."],
        ["**Qual a diferença entre evento e comando?** O evento é passado e afirma um fato; o comando é imperativo e pede uma ação a alguém específico.", "**What is the difference between event and command?** An event is past tense and states a fact; a command is imperative and asks a specific party for an action."],
        ["**Coreografia ou orquestração?** Coreografia para fluxos curtos; orquestração quando o processo é longo, tem prazos e compensações e precisa ser auditável.", "**Choreography or orchestration?** Choreography for short flows; orchestration when the process is long, has deadlines and compensations, and must be auditable."],
        ["**Como dar feedback ao usuário num fluxo assíncrono?** Responda 202 com um id, exiba o estado e atualize por polling, WebSocket ou notificação.", "**How to give feedback to the user in an asynchronous flow?** Answer 202 with an id, show the state and update by polling, WebSocket or notification."],
      ),
      tip(["Regra prática: use **chamada síncrona** quando o chamador não pode prosseguir sem a resposta e **evento** quando o produtor não deveria se importar com o que os outros fazem. Em dúvida, comece síncrono e extraia eventos onde o acoplamento doer.", "Rule of thumb: use a **synchronous call** when the caller cannot proceed without the answer and an **event** when the producer should not care what others do. When in doubt, start synchronous and extract events where coupling hurts."]),
    ] },
];

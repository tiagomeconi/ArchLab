import { h, p, ul, tip, code, table, fig, node, edge, type DocArticle } from "./kit";

/** Seção "balanceamento". */
export const ARTICLES: DocArticle[] = [
  { id: "balanceamento-de-carga", section: "balanceamento", level: 1, icon: "alt_route", minutes: 10,
    title: ["Balanceamento de carga e escala horizontal", "Load balancing and horizontal scaling"],
    summary: ["Como atender mais gente colocando mais máquinas, em vez de uma máquina maior: o que o balanceador faz, onde fica e o que o impede de funcionar.", "How to serve more people by adding machines instead of a bigger machine: what the balancer does, where it sits and what stops it from working."],
    body: [
      p(["Todo serviço bem-sucedido chega ao dia em que uma única máquina não dá mais conta. O processador satura, a memória acaba, a fila de conexões cresce e a latência dispara. Há dois caminhos clássicos para sair dessa situação, e a escolha entre eles define boa parte da arquitetura que vem depois. Este artigo explica o caminho horizontal, o papel do **balanceador de carga** (*load balancer*), o que ele faz além de \"repartir pedidos\" e quais condições a aplicação precisa cumprir para que tudo isso funcione.", "Every successful service reaches the day when a single machine can no longer cope. The processor saturates, memory runs out, the connection queue grows and latency shoots up. There are two classic ways out, and the choice between them shapes much of the architecture that follows. This article explains the horizontal path, the role of the **load balancer**, what it does beyond \"splitting requests\" and which conditions the application must meet for all of this to work."]),
      h(["Escala vertical x escala horizontal", "Vertical vs horizontal scaling"]),
      p(["**Escala vertical** (*scale up*) é trocar a máquina por outra maior: mais núcleos, mais RAM, discos mais rápidos. É a solução mais simples, porque o software não muda e não há nada para coordenar. Mas tem três limites: existe um teto físico (e o preço sobe mais rápido que a capacidade perto desse teto), a troca costuma exigir reinício e a máquina continua sendo um **ponto único de falha**: se ela cai, o serviço inteiro cai.", "**Vertical scaling** (*scale up*) means swapping the machine for a bigger one: more cores, more RAM, faster disks. It is the simplest solution, because the software does not change and there is nothing to coordinate. But it has three limits: there is a physical ceiling (and price climbs faster than capacity near that ceiling), the swap usually requires a restart, and the machine remains a **single point of failure**: if it goes down, the whole service goes down."]),
      p(["**Escala horizontal** (*scale out*) é colocar várias cópias de tamanho comum lado a lado. Não há teto prático (basta adicionar mais), o custo cresce de forma aproximadamente linear, e a perda de uma cópia reduz a capacidade em uma fração em vez de derrubar tudo. O preço é a complexidade: alguém precisa distribuir o tráfego entre as cópias, e a aplicação precisa tolerar que dois pedidos consecutivos do mesmo usuário sejam atendidos por máquinas diferentes.", "**Horizontal scaling** (*scale out*) means running several ordinary-sized copies side by side. There is no practical ceiling (just add more), cost grows roughly linearly, and losing one copy reduces capacity by a fraction instead of taking everything down. The price is complexity: someone must distribute traffic among the copies, and the application must tolerate two consecutive requests from the same user being served by different machines."]),
      table([["Aspecto", "Aspect"], ["Escala vertical", "Vertical scaling"], ["Escala horizontal", "Horizontal scaling"]],
        [["Como cresce", "How it grows"], ["Máquina maior", "Bigger machine"], ["Mais máquinas", "More machines"]],
        [["Teto", "Ceiling"], ["Sim, físico e financeiro", "Yes, physical and financial"], ["Praticamente nenhum", "Practically none"]],
        [["Falha", "Failure"], ["Ponto único de falha", "Single point of failure"], ["Perde-se uma fração da capacidade", "A fraction of capacity is lost"]],
        [["Mudança no código", "Code changes"], ["Nenhuma", "None"], ["Exige aplicação sem estado local", "Requires no local state"]],
        [["Indisponibilidade ao crescer", "Downtime when growing"], ["Frequente (reinício)", "Common (restart)"], ["Nenhuma, com drenagem", "None, with draining"]],
        [["Complexidade operacional", "Operational complexity"], ["Baixa", "Low"], ["Maior: balanceador, deploy, observabilidade", "Higher: balancer, deploy, observability"]]),
      h(["O que é um balanceador de carga e onde ele fica", "What a load balancer is and where it sits"]),
      p(["O **balanceador de carga** é o componente que fica na frente das cópias, recebe cada pedido e escolhe para onde enviá-lo. Para o cliente existe um único endereço (um nome DNS, um IP); atrás dele há um conjunto de servidores chamado de *pool*, *backend* ou *upstream*. Ele entrega três benefícios ao mesmo tempo: **vazão** (soma a capacidade de todas as cópias), **disponibilidade** (tira do rodízio as cópias doentes) e **flexibilidade** (cópias podem entrar, sair e ser atualizadas sem que o cliente perceba).", "The **load balancer** is the component that sits in front of the copies, receives each request and chooses where to send it. To the client there is a single address (a DNS name, an IP); behind it is a set of servers called the *pool*, *backend* or *upstream*. It delivers three benefits at once: **throughput** (it sums the capacity of all copies), **availability** (it pulls sick copies out of rotation) and **flexibility** (copies can join, leave and be upgraded without the client noticing)."]),
      fig(["Balanceador entre clientes e cópias da aplicação", "Balancer between clients and application copies"],
        [[node("c1", ["Cliente A", "Client A"], "client"), node("c2", ["Cliente B", "Client B"], "client")], [node("lb", ["Load balancer", "Load balancer"], "edge")], [node("a1", ["App 1", "App 1"], "service"), node("a2", ["App 2", "App 2"], "service"), node("a3", ["App 3", "App 3"], "service")], [node("cache", ["Sessões (Redis)", "Sessions (Redis)"], "cache"), node("db", ["Banco de dados", "Database"], "data")]],
        [edge("c1", "lb"), edge("c2", "lb"), edge("lb", "a1"), edge("lb", "a2"), edge("lb", "a3"), edge("a1", "cache"), edge("a2", "cache"), edge("a3", "db"), edge("a1", "db", undefined, { dashed: true })]),
      p(["Em uma arquitetura típica há balanceadores em mais de um ponto. Na borda, um balanceador (ou CDN/WAF) recebe o tráfego da internet. Entre camadas internas, outro distribui chamadas do front-end para os serviços, ou o próprio cliente da chamada faz a escolha (*client-side load balancing*, comum em gRPC e service meshes). Em frente a réplicas de leitura de um banco, um proxy como o PgBouncer ou o ProxySQL pode distribuir as consultas. A ideia é a mesma em todos: um endereço lógico, vários executores físicos.", "In a typical architecture there are balancers at more than one point. At the edge, a balancer (or CDN/WAF) receives internet traffic. Between internal tiers, another distributes calls from the front end to the services, or the caller itself makes the choice (*client-side load balancing*, common in gRPC and service meshes). In front of a database's read replicas, a proxy such as PgBouncer or ProxySQL can spread queries. The idea is the same everywhere: one logical address, several physical executors."]),
      h(["Como o balanceador decide e vigia as cópias", "How the balancer decides and watches the copies"]),
      p(["A cada pedido, o balanceador executa um ciclo curto: aceita a conexão, escolhe um servidor saudável segundo um algoritmo (o próximo artigo desta seção os detalha), encaminha o pedido, devolve a resposta e registra métricas. Para que a escolha só recaia sobre servidores vivos, ele mantém uma lista de quem está saudável. Há duas técnicas complementares:", "For each request, the balancer runs a short cycle: it accepts the connection, picks a healthy server according to an algorithm (the next article in this section details them), forwards the request, returns the response and records metrics. So that the choice only falls on live servers, it keeps a list of which ones are healthy. There are two complementary techniques:"]),
      ul(
        ["**Health checks ativos**: o balanceador envia sondas periódicas por conta própria (por exemplo, um `GET /health` a cada 2 a 5 segundos) e considera o servidor fora de serviço após *N* falhas seguidas (`fall`) e de volta após *M* sucessos (`rise`). Detectam servidores ociosos que quebraram, mas custam tráfego extra e só enxergam o que o endpoint de saúde expõe.", "**Active health checks**: the balancer sends periodic probes on its own (for example, a `GET /health` every 2 to 5 seconds) and considers the server out of service after *N* consecutive failures (`fall`) and back after *M* successes (`rise`). They catch idle servers that broke, but cost extra traffic and only see what the health endpoint exposes."],
        ["**Health checks passivos** (*outlier detection*): o balanceador observa o tráfego real e ejeta o servidor que devolve erros 5xx, estoura tempo limite ou recusa conexões. Reagem ao que os usuários de fato sofrem, sem custo extra, mas só detectam o problema depois que alguns pedidos já falharam. O NGINX de código aberto faz só essa forma (`max_fails` e `fail_timeout`); o Envoy chama de *outlier detection*.", "**Passive health checks** (*outlier detection*): the balancer watches real traffic and ejects the server that returns 5xx errors, times out or refuses connections. They react to what users actually experience, at no extra cost, but only detect the problem after some requests have already failed. Open-source NGINX does only this form (`max_fails` and `fail_timeout`); Envoy calls it *outlier detection*."],
      ),
      p(["O ideal é combinar os dois: o ativo tira cedo quem está morto, o passivo tira quem está \"vivo mas ruim\". Quanto ao conteúdo do endpoint, separe **liveness** (o processo está de pé; se falhar, reinicie) de **readiness** (pronto para receber tráfego: conexões abertas, cache aquecido, migrações concluídas; se falhar, apenas tire do rodízio). Um health check que consulta o banco a cada sondagem pode derrubar o próprio banco quando há muitos balanceadores; prefira uma verificação leve, com resultado em cache por alguns segundos.", "The ideal is to combine both: the active one removes the dead early, the passive one removes the \"alive but bad\". As for the endpoint content, separate **liveness** (the process is up; if it fails, restart it) from **readiness** (ready for traffic: connections open, cache warm, migrations done; if it fails, just pull it from rotation). A health check that queries the database on every probe can take down the database itself when there are many balancers; prefer a lightweight check, with its result cached for a few seconds."]),
      h(["Recursos que o balanceador costuma oferecer", "Features balancers usually offer"]),
      ul(
        ["**Sticky sessions** (afinidade de sessão): o balanceador envia o mesmo cliente sempre ao mesmo servidor, por cookie, hash do IP ou outro identificador. Resolve de forma rápida o caso de sessão guardada na memória da cópia, mas desequilibra a carga (um usuário pesado fica preso a uma máquina), atrapalha o escalonamento e perde a sessão quando a cópia morre. Trate como remendo, não como projeto.", "**Sticky sessions** (session affinity): the balancer always sends the same client to the same server, by cookie, IP hash or another identifier. It quickly solves the case of a session held in the copy's memory, but unbalances load (a heavy user is pinned to one machine), hinders scaling and loses the session when the copy dies. Treat it as a patch, not a design."],
        ["**Drenagem de conexões** (*connection draining*, *deregistration delay*): ao remover uma cópia (deploy, redução de escala), o balanceador deixa de enviar *novos* pedidos, mas espera os que estão em andamento terminarem, até um limite de tempo. Sem isso, cada deploy derruba requisições no meio. No ALB da AWS o atraso padrão de desregistro é de 300 segundos; no HAProxy usa-se o estado `drain` do servidor.", "**Connection draining** (*deregistration delay*): when removing a copy (deploy, scale-in), the balancer stops sending *new* requests but waits for in-flight ones to finish, up to a time limit. Without it, every deploy drops requests midway. On AWS ALB the default deregistration delay is 300 seconds; in HAProxy you use the server's `drain` state."],
        ["**Terminação de TLS** (*TLS termination*): o balanceador decifra o HTTPS e fala HTTP puro com os servidores internos, centralizando certificados e tirando a criptografia da aplicação. Permite inspecionar o conteúdo (L7). O custo é que o trecho interno fica sem cifra, o que muitas organizações não aceitam; alternativas são recifrar até o backend (*TLS re-encryption*) ou usar *TLS passthrough*, em que o balanceador só repassa os bytes cifrados e não vê o conteúdo.", "**TLS termination**: the balancer decrypts HTTPS and speaks plain HTTP to internal servers, centralizing certificates and taking encryption off the application. It allows inspecting content (L7). The cost is that the internal leg is unencrypted, which many organizations do not accept; alternatives are re-encrypting up to the backend (*TLS re-encryption*) or *TLS passthrough*, where the balancer just relays encrypted bytes and cannot see the content."],
        ["**Limites e proteção**: limite de taxa, limite de conexões por IP, tempos limite, filas e *circuit breakers*, que protegem os servidores de uma enxurrada.", "**Limits and protection**: rate limiting, per-IP connection limits, timeouts, queues and circuit breakers, which shield the servers from a flood."],
        ["**Observabilidade**: o balanceador vê todo o tráfego e é o lugar natural para métricas de taxa, erro e latência (a base dos *golden signals*) e para gerar o identificador de requisição que percorre os logs.", "**Observability**: the balancer sees all traffic and is the natural place for rate, error and latency metrics (the basis of the *golden signals*) and for generating the request ID that flows through the logs."],
      ),
      code(`# nginx: tres copias, menos conexoes, falha passiva e uma reserva
upstream app {
    least_conn;
    server 10.0.1.11:8080 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:8080 max_fails=3 fail_timeout=30s;
    server 10.0.1.13:8080 weight=2;       # maquina maior
    server 10.0.2.10:8080 backup;         # so entra se todos falharem
}
server {
    listen 443 ssl;
    ssl_certificate     /etc/ssl/site.pem;
    ssl_certificate_key /etc/ssl/site.key;
    location / {
        proxy_pass http://app;
        proxy_next_upstream error timeout http_502 http_503;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}`),
      h(["O que impede de escalar horizontalmente", "What blocks horizontal scaling"]),
      p(["Adicionar cópias só ajuda se elas forem **sem estado local** (*stateless*): qualquer cópia consegue atender qualquer pedido porque tudo de que precisa vem no próprio pedido ou de um armazenamento compartilhado. Os obstáculos mais comuns são:", "Adding copies only helps if they are **stateless**: any copy can serve any request because everything it needs comes in the request itself or from shared storage. The most common obstacles are:"]),
      ul(
        ["**Sessão em memória**: mova para um armazenamento compartilhado (Redis, Memcached) ou use tokens assinados (JWT, cookie assinado) que carregam a identidade no próprio cliente.", "**In-memory session**: move it to shared storage (Redis, Memcached) or use signed tokens (JWT, signed cookie) that carry identity on the client side."],
        ["**Arquivos gravados em disco local**: uploads, relatórios gerados e cache em arquivo precisam ir para um armazenamento de objetos (S3 e equivalentes) ou volume compartilhado.", "**Files written to local disk**: uploads, generated reports and file caches need to go to object storage (S3 and equivalents) or a shared volume."],
        ["**Tarefas agendadas dentro da aplicação**: com três cópias, um cron interno roda três vezes. Use um agendador único, uma fila ou um lock de liderança.", "**Scheduled jobs inside the application**: with three copies, an internal cron runs three times. Use a single scheduler, a queue or a leader lock."],
        ["**WebSockets e conexões longas**: a conexão fica presa a uma cópia, então a distribuição acontece só na abertura; balanceie por *menos conexões* e planeje reconexão ao reduzir a escala.", "**WebSockets and long-lived connections**: the connection stays pinned to one copy, so distribution happens only at open; balance by *least connections* and plan for reconnection when scaling in."],
        ["**O banco de dados**: mais cópias da aplicação significam mais conexões abertas. Um banco relacional com 200 conexões máximas não suporta 50 cópias com pools de 10. Use pool de conexões central (PgBouncer), réplicas de leitura, cache e, em último caso, particionamento. O banco costuma ser o próximo gargalo.", "**The database**: more application copies mean more open connections. A relational database capped at 200 connections cannot support 50 copies with pools of 10. Use a central connection pooler (PgBouncer), read replicas, caching and, as a last resort, partitioning. The database is usually the next bottleneck."],
      ),
      h(["Vantagens e desvantagens", "Advantages and disadvantages"]),
      table([["Vantagens", "Advantages"], ["Desvantagens", "Disadvantages"]],
        [["Capacidade cresce somando máquinas baratas", "Capacity grows by adding cheap machines"], ["Mais peças móveis e mais coisas que podem falhar", "More moving parts and more things that can fail"]],
        [["Uma cópia pode cair sem derrubar o serviço", "A copy can fail without taking the service down"], ["O próprio balanceador pode virar ponto único de falha", "The balancer itself can become a single point of failure"]],
        [["Deploys sem parada (rolling, canário, azul-verde)", "Zero-downtime deploys (rolling, canary, blue-green)"], ["A aplicação precisa ser sem estado local", "The application must be free of local state"]],
        [["Ponto central para TLS, métricas e limites", "Central point for TLS, metrics and limits"], ["Depuração mais difícil: o pedido passa por várias máquinas", "Harder debugging: a request crosses several machines"]]),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Deixar o balanceador como instância única: o ponto único de falha apenas mudou de lugar. Use serviço gerenciado multi-AZ ou um par com IP virtual.", "Leaving the balancer as a single instance: the single point of failure just moved. Use a multi-AZ managed service or a pair with a virtual IP."],
        ["Dimensionar sem folga: se três cópias operam a 80% e uma cai, as duas restantes precisariam de 120%. Planeje **N+1**.", "Sizing with no headroom: if three copies run at 80% and one fails, the remaining two would need 120%. Plan for **N+1**."],
        ["Health check que sempre devolve 200, ou que testa algo diferente do que o usuário usa.", "A health check that always returns 200, or that tests something different from what users rely on."],
        ["Tempos limite incoerentes: o do balanceador menor que o da aplicação gera erros 504 enquanto a aplicação ainda trabalha.", "Inconsistent timeouts: the balancer's being shorter than the application's produces 504 errors while the application is still working."],
        ["Perder o IP do cliente: atrás de um proxy, o IP visto pela aplicação é o do balanceador. Leia `X-Forwarded-For` ou use o *PROXY protocol*, e só confie nesses cabeçalhos vindos do seu próprio balanceador.", "Losing the client IP: behind a proxy, the IP the application sees is the balancer's. Read `X-Forwarded-For` or use the *PROXY protocol*, and only trust those headers when they come from your own balancer."],
      ),
      h(["Casos de uso", "Use cases"]),
      p(["Praticamente toda aplicação web de porte usa balanceamento. APIs REST ficam atrás de um ALB ou NGINX; tráfego gRPC usa Envoy ou balanceamento do lado do cliente; lojas e portais enfrentam picos (Black Friday, finais de campeonato) somando cópias automaticamente com *auto scaling* que registra e remove instâncias do balanceador. Bancos com réplicas de leitura usam proxies para dividir consultas. E em múltiplas regiões, o balanceamento global leva o usuário ao ponto mais próximo, tema do artigo seguinte.", "Practically every sizable web application uses load balancing. REST APIs sit behind an ALB or NGINX; gRPC traffic uses Envoy or client-side balancing; stores and portals face peaks (Black Friday, championship finals) by adding copies automatically with *auto scaling* that registers and removes instances from the balancer. Databases with read replicas use proxies to split queries. And across multiple regions, global balancing takes the user to the nearest point, the topic of the next article."]),
      h(["Resumo", "Summary"]),
      ul(
        ["Escala vertical é simples mas tem teto e é ponto único de falha; escala horizontal cresce somando máquinas e exige distribuição de tráfego.", "Vertical scaling is simple but has a ceiling and is a single point of failure; horizontal scaling grows by adding machines and requires traffic distribution."],
        ["O balanceador dá um endereço único, soma capacidade e tira cópias doentes do rodízio.", "The balancer gives a single address, sums capacity and pulls sick copies out of rotation."],
        ["Combine health checks ativos e passivos; separe liveness de readiness.", "Combine active and passive health checks; separate liveness from readiness."],
        ["Use drenagem de conexões em todo deploy e prefira terminação de TLS no balanceador com recifragem quando exigido.", "Use connection draining on every deploy and prefer TLS termination at the balancer with re-encryption when required."],
        ["A aplicação precisa ser sem estado local; o banco costuma ser o próximo gargalo.", "The application must be free of local state; the database is usually the next bottleneck."],
        ["O balanceador também precisa ser redundante.", "The balancer must be redundant too."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Preciso de balanceador se tenho só duas cópias?** Sim: sem ele o cliente não sabe qual das duas está viva, e ninguém reparte a carga nem tira a doente do ar.", "**Do I need a balancer with only two copies?** Yes: without one the client does not know which of the two is alive, and nobody splits load or pulls the sick one."],
        ["**Sticky session é sempre ruim?** Não é sempre ruim, mas é um acoplamento. Serve para transição ou para cache local valioso; o ideal é que perder a cópia não perca o usuário.", "**Are sticky sessions always bad?** Not always, but they are a coupling. They serve transitions or valuable local cache; ideally, losing the copy does not lose the user."],
        ["**Qual a diferença entre health check e monitoramento?** O health check decide em segundos se o servidor recebe tráfego. O monitoramento observa tendências e alerta pessoas.", "**What is the difference between a health check and monitoring?** A health check decides in seconds whether the server gets traffic. Monitoring watches trends and alerts people."],
        ["**O balanceador não vira gargalo?** Pode, em vazão extrema, por isso se usam L4 de alto desempenho na frente, vários balanceadores e serviços gerenciados que escalam sozinhos.", "**Doesn't the balancer become the bottleneck?** It can, at extreme throughput, which is why high-performance L4 balancers are placed in front, with multiple balancers and managed services that scale on their own."],
      ),
      tip(["Teste o cenário que importa: derrube uma cópia em horário de pico, em ambiente de teste, e veja se o usuário percebe. Um balanceador só é prova de alta disponibilidade depois de ter sido posto à prova.", "Test the scenario that matters: kill one copy at peak load, in a test environment, and see whether users notice. A balancer is only proof of high availability once it has been put to the test."]),
    ] },

  { id: "tipos-de-load-balancer", section: "balanceamento", level: 1, icon: "lan", minutes: 12,
    title: ["Tipos de load balancer: L4, L7, hardware, DNS e global", "Types of load balancer: L4, L7, hardware, DNS and global"],
    summary: ["Em que camada o balanceador decide, onde ele roda, como o tráfego passa por ele e qual escolher, com configurações reais de NGINX e HAProxy.", "At which layer the balancer decides, where it runs, how traffic flows through it and which to pick, with real NGINX and HAProxy configurations."],
    body: [
      p(["\"Load balancer\" é um nome para várias coisas diferentes. Elas se distinguem por **em qual camada** olham o tráfego, **onde** rodam (aparelho, software, serviço de nuvem), **como o pacote passa** por elas (proxy ou pass-through) e **em que escala geográfica** atuam (um servidor, um data center, o planeta). Saber distinguir essas dimensões evita escolher uma ferramenta cara demais, fraca demais ou simplesmente inadequada ao protocolo.", "\"Load balancer\" is one name for several different things. They differ by **which layer** they inspect, **where** they run (appliance, software, cloud service), **how the packet passes** through them (proxy or pass-through) and **at what geographic scale** they operate (a server, a data center, the planet). Telling these dimensions apart avoids picking a tool that is too costly, too weak or simply unsuited to the protocol."]),
      h(["Camada 4 x camada 7", "Layer 4 vs layer 7"]),
      p(["Um balanceador **L4** trabalha na camada de transporte do modelo OSI: enxerga IPs de origem e destino, portas e o estado da conexão TCP ou UDP, mas não o conteúdo. A decisão usa a tupla (IP e porta de origem, IP e porta de destino) e o pacote é encaminhado quase sem processamento. Resultado: vazão altíssima (milhões de conexões por segundo), latência de microssegundos e compatibilidade com qualquer protocolo sobre TCP/UDP: bancos de dados, MQTT, SMTP, jogos, TLS opaco. Em troca, não sabe de URL, cabeçalho ou cookie.", "An **L4** balancer works at the transport layer of the OSI model: it sees source and destination IPs, ports and the state of the TCP or UDP connection, but not the content. The decision uses the tuple (source IP and port, destination IP and port) and the packet is forwarded with almost no processing. Result: very high throughput (millions of connections per second), microsecond latency and compatibility with any protocol over TCP/UDP: databases, MQTT, SMTP, games, opaque TLS. In exchange, it knows nothing about URLs, headers or cookies."]),
      p(["Um balanceador **L7** trabalha na camada de aplicação: termina a conexão do cliente, lê a requisição HTTP e decide por caminho, host, método, cabeçalho ou cookie; depois abre (ou reaproveita) outra conexão com o servidor escolhido. Isso habilita roteamento por conteúdo (`/api` para um grupo, `/img` para outro, `tenant.exemplo.com` para um cluster dedicado), terminação de TLS, compressão, cache, reescrita de URL, autenticação, limite de taxa, deploys canário (5% do tráfego para a versão nova) e balanceamento **por requisição**, não por conexão. Este último ponto é decisivo com HTTP/2 e gRPC, onde uma única conexão longa carrega milhares de chamadas: um L4 enviaria todas ao mesmo servidor.", "An **L7** balancer works at the application layer: it terminates the client connection, reads the HTTP request and decides by path, host, method, header or cookie; then it opens (or reuses) another connection to the chosen server. That enables content-based routing (`/api` to one group, `/img` to another, `tenant.example.com` to a dedicated cluster), TLS termination, compression, caching, URL rewriting, authentication, rate limiting, canary deploys (5% of traffic to the new version) and **per-request** rather than per-connection balancing. The last point is decisive with HTTP/2 and gRPC, where one long connection carries thousands of calls: an L4 would send them all to the same server."]),
      fig(["Dois balanceadores em camadas: L4 na frente, L7 roteando", "Two layered balancers: L4 in front, L7 routing"],
        [[node("u", ["Usuários", "Users"], "client")], [node("l4", ["L4 (NLB, IPVS)", "L4 (NLB, IPVS)"], "edge")], [node("l7a", ["L7 (NGINX/Envoy) A", "L7 (NGINX/Envoy) A"], "edge"), node("l7b", ["L7 (NGINX/Envoy) B", "L7 (NGINX/Envoy) B"], "edge")], [node("api", ["Serviço /api", "/api service"], "service"), node("web", ["Serviço /web", "/web service"], "service"), node("img", ["Imagens /img", "/img images"], "service")]],
        [edge("u", "l4"), edge("l4", "l7a"), edge("l4", "l7b"), edge("l7a", "api"), edge("l7a", "web"), edge("l7b", "api"), edge("l7b", "img")]),
      table([["Critério", "Criterion"], ["L4", "L4"], ["L7", "L7"]],
        [["Enxerga", "Sees"], ["IP, porta, TCP/UDP", "IP, port, TCP/UDP"], ["URL, cabeçalhos, cookies, corpo", "URL, headers, cookies, body"]],
        [["Desempenho", "Performance"], ["Muito alto, latência mínima", "Very high, minimal latency"], ["Alto, com mais CPU e latência", "High, with more CPU and latency"]],
        [["Protocolos", "Protocols"], ["Qualquer um sobre TCP/UDP", "Any over TCP/UDP"], ["Principalmente HTTP, gRPC, WebSocket", "Mostly HTTP, gRPC, WebSocket"]],
        [["TLS", "TLS"], ["Passthrough (ou terminação em alguns)", "Passthrough (or termination in some)"], ["Normalmente termina e recifra", "Usually terminates and re-encrypts"]],
        [["Roteamento por conteúdo", "Content routing"], ["Não", "No"], ["Sim", "Yes"]],
        [["Exemplos", "Examples"], ["AWS NLB, IPVS, HAProxy modo tcp", "AWS NLB, IPVS, HAProxy tcp mode"], ["AWS ALB, NGINX, Envoy, HAProxy modo http", "AWS ALB, NGINX, Envoy, HAProxy http mode"]]),
      h(["Proxy x pass-through", "Proxy vs pass-through"]),
      p(["Outra dimensão é como o pacote atravessa o balanceador. No modelo de **proxy** (ou *full proxy*), o balanceador mantém duas conexões independentes: uma com o cliente e outra com o servidor. Ele pode inspecionar, modificar, armazenar em buffer e reutilizar conexões com o backend (*keep-alive*), mas todo o tráfego de ida e volta passa por ele, e o servidor vê como origem o IP do balanceador (por isso existem `X-Forwarded-For` e o *PROXY protocol*). NGINX, HAProxy, Envoy e o ALB são proxies.", "Another dimension is how the packet crosses the balancer. In the **proxy** model (or *full proxy*), the balancer keeps two independent connections: one with the client and one with the server. It can inspect, modify, buffer and reuse backend connections (*keep-alive*), but all traffic both ways passes through it, and the server sees the balancer's IP as the source (hence `X-Forwarded-For` and the *PROXY protocol*). NGINX, HAProxy, Envoy and the ALB are proxies."]),
      p(["No modelo **pass-through** (encaminhamento de pacotes), o balanceador só reescreve cabeçalhos de rede e entrega o pacote ao servidor, sem terminar a conexão. Há variantes: **NAT** (o balanceador troca o IP de destino e a resposta volta por ele) e **DSR** (*direct server return*), em que o servidor responde diretamente ao cliente, sem passar de volta pelo balanceador. Como as respostas costumam ser muito maiores que os pedidos (um vídeo, uma página), o DSR faz o balanceador carregar só uma fração do tráfego. A contrapartida: o servidor precisa aceitar o IP virtual do balanceador e o balanceador não vê a resposta, o que limita health checks passivos e recursos L7. O IPVS do Linux, o Maglev do Google e o Katran do Facebook são exemplos de balanceadores L4 por encaminhamento de pacotes.", "In the **pass-through** model (packet forwarding), the balancer only rewrites network headers and hands the packet to the server, without terminating the connection. There are variants: **NAT** (the balancer swaps the destination IP and the response returns through it) and **DSR** (*direct server return*), where the server answers the client directly, not passing back through the balancer. Since responses are usually far larger than requests (a video, a page), DSR makes the balancer carry only a fraction of the traffic. The trade-off: the server must accept the balancer's virtual IP and the balancer does not see the response, which limits passive health checks and L7 features. Linux IPVS, Google's Maglev and Facebook's Katran are examples of L4 packet-forwarding balancers."]),
      fig(["Proxy (resposta volta pelo balanceador) e DSR (resposta direta)", "Proxy (response returns through the balancer) and DSR (direct response)"],
        [[node("cl", ["Cliente", "Client"], "client")], [node("lb", "LB", "edge")], [node("s1", ["Servidor 1", "Server 1"], "service"), node("s2", ["Servidor 2", "Server 2"], "service")]],
        [edge("cl", "lb", ["pedido", "request"]), edge("lb", "s1", ["pedido", "request"]), edge("lb", "s2"), edge("s1", "cl", ["DSR: resposta direta", "DSR: direct reply"], { dashed: true })]),
      h(["Hardware, software e nuvem", "Hardware, software and cloud"]),
      ul(
        ["**Hardware** (F5 BIG-IP, Citrix NetScaler/ADC): aparelhos dedicados, com chips especializados para criptografia, grande vazão e suporte do fabricante. São caros, de capacidade fixa (o pico é comprado com antecedência) e mais difíceis de automatizar. Ainda aparecem em data centers próprios e ambientes regulados.", "**Hardware** (F5 BIG-IP, Citrix NetScaler/ADC): dedicated appliances with specialized chips for cryptography, large throughput and vendor support. They are costly, fixed-capacity (peak is bought in advance) and harder to automate. They still appear in on-premises data centers and regulated environments."],
        ["**Software** (NGINX, HAProxy, Envoy, Traefik, Caddy): rodam em servidores comuns ou contêineres, configurados como código, e escalam com mais instâncias. Hoje é a escolha padrão em ambientes novos. Exigem que você opere, atualize e proteja a instância.", "**Software** (NGINX, HAProxy, Envoy, Traefik, Caddy): run on ordinary servers or containers, configured as code, and scale with more instances. Today the default in new environments. They require you to operate, patch and secure the instance."],
        ["**Nuvem gerenciada** (AWS ALB/NLB/GWLB, Google Cloud Load Balancing, Azure Application Gateway e Load Balancer): o provedor opera, escala e torna redundante; você paga por uso e configura por API. É o ponto de partida mais comum, com menos controle fino que o software próprio.", "**Managed cloud** (AWS ALB/NLB/GWLB, Google Cloud Load Balancing, Azure Application Gateway and Load Balancer): the provider operates, scales and makes it redundant; you pay by usage and configure by API. It is the most common starting point, with less fine-grained control than self-run software."],
        ["**Em cluster Kubernetes**: um Service do tipo `LoadBalancer` cria um balanceador de nuvem; um *Ingress controller* (NGINX, Traefik, Envoy/Contour) faz L7 dentro do cluster; um *service mesh* (Istio, Linkerd) coloca um proxy ao lado de cada pod, e o balanceamento passa a ser entre serviços, do lado do cliente.", "**Inside Kubernetes**: a `LoadBalancer` Service creates a cloud balancer; an *Ingress controller* (NGINX, Traefik, Envoy/Contour) does L7 inside the cluster; a *service mesh* (Istio, Linkerd) puts a proxy next to each pod, and balancing happens between services, on the client side."],
      ),
      p(["Sobre os produtos: o **NGINX** é servidor web e proxy reverso muito usado em L7 (e em L4 com o módulo `stream`); a verificação ativa de saúde é recurso da versão comercial (NGINX Plus). O **HAProxy** é a referência em balanceamento L4/L7 de alto desempenho, com health checks, métricas e *stick tables* ricos. O **Envoy** é um proxy moderno, base de service meshes como o Istio, com configuração dinâmica por API (xDS) e observabilidade nativa. O **ALB** da AWS é L7 (roteamento por caminho, host, cabeçalho); o **NLB** é L4, aguenta milhões de requisições por segundo e oferece IP estático por zona.", "On the products: **NGINX** is a web server and reverse proxy widely used at L7 (and at L4 with the `stream` module); active health checking is a feature of the commercial version (NGINX Plus). **HAProxy** is the reference for high-performance L4/L7 balancing, with rich health checks, metrics and *stick tables*. **Envoy** is a modern proxy, the basis of service meshes such as Istio, with API-driven dynamic configuration (xDS) and native observability. AWS **ALB** is L7 (routing by path, host, header); **NLB** is L4, handles millions of requests per second and offers a static IP per zone."]),
      h(["Configurações reais: NGINX e HAProxy", "Real configurations: NGINX and HAProxy"]),
      p(["O primeiro exemplo é um NGINX fazendo L7 (roteamento por caminho, TLS e passagem do IP do cliente) e, em seguida, L4 puro com o módulo `stream`, útil para balancear um banco ou qualquer protocolo que não seja HTTP.", "The first example is NGINX doing L7 (path routing, TLS and client IP passing) and then pure L4 with the `stream` module, useful for balancing a database or any non-HTTP protocol."]),
      code(`# nginx.conf (L7 + L4)
http {
    upstream api_pool { least_conn; server 10.0.1.11:8080; server 10.0.1.12:8080; }
    upstream web_pool { server 10.0.2.11:3000; server 10.0.2.12:3000; }

    server {
        listen 443 ssl http2;
        server_name example.com;
        ssl_certificate     /etc/ssl/example.pem;
        ssl_certificate_key /etc/ssl/example.key;

        location /api/ { proxy_pass http://api_pool; proxy_set_header X-Real-IP $remote_addr; }
        location /     { proxy_pass http://web_pool; }
    }
}

stream {                       # L4: no HTTP parsing
    upstream pg_replicas { server 10.0.3.11:5432; server 10.0.3.12:5432; }
    server { listen 5432; proxy_pass pg_replicas; }
}`),
      p(["O segundo exemplo é um HAProxy com os dois modos: `mode http` com health check ativo (`check`), pesos e cookie de afinidade, e `mode tcp` para um serviço qualquer. Os parâmetros `inter`, `fall` e `rise` definem o intervalo da sonda e quantas falhas ou sucessos mudam o estado.", "The second example is HAProxy with both modes: `mode http` with an active health check (`check`), weights and an affinity cookie, and `mode tcp` for an arbitrary service. The `inter`, `fall` and `rise` parameters define the probe interval and how many failures or successes flip the state."]),
      code(`# haproxy.cfg
defaults
    timeout connect 5s
    timeout client  30s
    timeout server  30s

frontend fe_https
    mode http
    bind :443 ssl crt /etc/haproxy/example.pem
    acl is_api path_beg /api
    use_backend be_api if is_api
    default_backend be_web

backend be_api
    mode http
    balance leastconn
    option httpchk GET /health
    http-check expect status 200
    cookie SRV insert indirect nocache
    server api1 10.0.1.11:8080 check inter 2s fall 3 rise 2 weight 100 cookie a1
    server api2 10.0.1.12:8080 check inter 2s fall 3 rise 2 weight 50  cookie a2

backend be_web
    mode http
    balance roundrobin
    server web1 10.0.2.11:3000 check
    server web2 10.0.2.12:3000 check

listen mqtt
    mode tcp
    bind :1883
    balance source
    server m1 10.0.4.11:1883 check
    server m2 10.0.4.12:1883 check`),
      h(["DNS, anycast e balanceamento global (GSLB)", "DNS, anycast and global balancing (GSLB)"]),
      p(["O **DNS** pode devolver vários IPs para o mesmo nome (*DNS round-robin*) ou escolher uma resposta conforme a localização do cliente, a latência medida ou a saúde dos destinos. É simples, funciona antes de qualquer conexão e não exige nenhum equipamento no caminho. Mas é grosseiro: os resolvedores e navegadores guardam a resposta pelo **TTL**, então tirar um servidor doente da resposta pode levar minutos; o cliente escolhe sozinho entre os IPs devolvidos; e o DNS desconhece a carga real dos servidores.", "**DNS** can return several IPs for one name (*DNS round-robin*) or choose an answer by the client's location, measured latency or the health of the destinations. It is simple, works before any connection and requires no equipment in the path. But it is coarse: resolvers and browsers cache the answer for the **TTL**, so pulling a sick server from the answer can take minutes; the client picks among the returned IPs on its own; and DNS does not know the servers' real load."]),
      p(["O **balanceamento global de servidores** (GSLB) combina DNS (ou anycast) com health checks entre **regiões**: envia o usuário à região saudável mais próxima, divide por percentuais (migrações graduais) e redireciona tudo se uma região inteira cair. Exemplos: Amazon Route 53 com políticas de latência, ponderada e de failover; Cloudflare Load Balancing; Google Cloud Global Load Balancing, que usa um único IP anycast. Use TTLs baixos (30 a 60 segundos) nos registros com failover, sabendo que alguns resolvedores ignoram TTLs muito curtos.", "**Global server load balancing** (GSLB) combines DNS (or anycast) with health checks across **regions**: it sends the user to the nearest healthy region, splits by percentages (gradual migrations) and redirects everything if a whole region fails. Examples: Amazon Route 53 with latency, weighted and failover policies; Cloudflare Load Balancing; Google Cloud Global Load Balancing, which uses a single anycast IP. Use low TTLs (30 to 60 seconds) on records with failover, knowing that some resolvers ignore very short TTLs."]),
      p(["No **anycast**, o mesmo endereço IP é anunciado por BGP a partir de vários pontos do mundo, e a própria rede roteia o pacote ao ponto mais próximo em termos de rotas. Não depende de TTL: se um ponto some, o anúncio é retirado e o tráfego converge para outro em segundos. É a técnica por trás de CDNs, de DNS público (os resolvedores 1.1.1.1 e 8.8.8.8) e de mitigação de DDoS, que dilui um ataque entre muitos pontos de presença.", "With **anycast**, the same IP address is announced via BGP from several places in the world, and the network itself routes the packet to the nearest point in routing terms. It does not depend on TTL: if a point disappears, the announcement is withdrawn and traffic converges on another within seconds. It is the technique behind CDNs, public DNS (the 1.1.1.1 and 8.8.8.8 resolvers) and DDoS mitigation, which dilutes an attack across many points of presence."]),
      fig(["Balanceamento global: DNS escolhe a região, o balanceador regional escolhe o servidor", "Global balancing: DNS picks the region, the regional balancer picks the server"],
        [[node("user", ["Usuário", "User"], "client")], [node("dns", ["DNS / GSLB", "DNS / GSLB"], "edge")], [node("br", ["LB região Brasil", "Brazil region LB"], "edge"), node("us", ["LB região EUA", "US region LB"], "edge")], [node("sb", ["Servidores BR", "BR servers"], "service"), node("su", ["Servidores EUA", "US servers"], "service")]],
        [edge("user", "dns", "1"), edge("dns", "br", ["2: mais perto", "2: nearest"]), edge("dns", "us", ["reserva", "backup"], { dashed: true }), edge("br", "sb"), edge("us", "su")]),
      table([["Técnica", "Technique"], ["Decide por", "Decides by"], ["Reação a falha", "Failure reaction"], ["Uso típico", "Typical use"]],
        [["DNS round-robin", "DNS round-robin"], ["Rodízio de IPs na resposta", "IP rotation in the answer"], ["Lenta (TTL)", "Slow (TTL)"], ["Distribuição simples e barata", "Simple, cheap distribution"]],
        [["GSLB por DNS", "DNS-based GSLB"], ["Latência, geografia, saúde, peso", "Latency, geography, health, weight"], ["Dezenas de segundos a minutos", "Tens of seconds to minutes"], ["Multi-região, failover entre regiões", "Multi-region, cross-region failover"]],
        [["Anycast", "Anycast"], ["Proximidade na rede (BGP)", "Network proximity (BGP)"], ["Segundos, sem TTL", "Seconds, no TTL"], ["CDN, DNS, mitigação de DDoS", "CDN, DNS, DDoS mitigation"]],
        [["LB regional (L4/L7)", "Regional LB (L4/L7)"], ["Algoritmo e saúde por servidor", "Algorithm and per-server health"], ["Milissegundos a segundos", "Milliseconds to seconds"], ["Distribuir dentro de uma região", "Spread within a region"]]),
      h(["Como escolher", "How to choose"]),
      ul(
        ["Aplicação HTTP em uma região, equipe pequena: **L7 gerenciado** (ALB, Cloud Load Balancing, Application Gateway).", "HTTP application in one region, small team: **managed L7** (ALB, Cloud Load Balancing, Application Gateway)."],
        ["Protocolo que não é HTTP, IP fixo exigido ou milhões de conexões: **L4** (NLB, HAProxy tcp, IPVS).", "Non-HTTP protocol, fixed IP required or millions of connections: **L4** (NLB, HAProxy tcp, IPVS)."],
        ["Microsserviços com gRPC e necessidade de política fina: **Envoy** ou service mesh, com balanceamento do lado do cliente.", "gRPC microservices needing fine-grained policy: **Envoy** or a service mesh, with client-side balancing."],
        ["Mais de uma região ou usuários espalhados pelo mundo: **GSLB** ou **anycast** na frente dos balanceadores regionais.", "More than one region or users spread across the world: **GSLB** or **anycast** in front of regional balancers."],
        ["Requisitos regulatórios e infraestrutura própria já existente: **hardware** ou software em servidores dedicados.", "Regulatory requirements and existing own infrastructure: **hardware** or software on dedicated servers."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Usar L7 para tudo e pagar CPU e latência sem precisar de roteamento por conteúdo.", "Using L7 for everything and paying CPU and latency without needing content routing."],
        ["Usar L4 diante de gRPC ou HTTP/2 e descobrir que uma conexão longa manda todas as chamadas a um único servidor.", "Using L4 in front of gRPC or HTTP/2 and discovering that one long connection sends all calls to a single server."],
        ["Confiar em DNS para failover rápido com TTL de horas.", "Relying on DNS for fast failover with a TTL of hours."],
        ["Esquecer de redundância do balanceador e de verificar limites de cota (conexões, novos pedidos por segundo) dos serviços gerenciados.", "Forgetting balancer redundancy and checking quota limits (connections, new requests per second) of managed services."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["L4 decide por IP e porta e é rápido e genérico; L7 entende HTTP e permite roteamento por conteúdo.", "L4 decides by IP and port and is fast and generic; L7 understands HTTP and allows content routing."],
        ["Proxy termina conexões e inspeciona; pass-through (NAT, DSR) só encaminha pacotes e escala melhor para respostas grandes.", "A proxy terminates connections and inspects; pass-through (NAT, DSR) only forwards packets and scales better for large responses."],
        ["Hardware dá vazão e suporte; software dá flexibilidade; nuvem gerenciada dá comodidade.", "Hardware gives throughput and support; software gives flexibility; managed cloud gives convenience."],
        ["DNS e GSLB escolhem a região; anycast aproxima o usuário sem depender de TTL.", "DNS and GSLB pick the region; anycast brings the user closer without relying on TTL."],
        ["Arranjos reais combinam camadas: GSLB, depois L4, depois L7, depois os serviços.", "Real setups combine layers: GSLB, then L4, then L7, then the services."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**O NGINX é L4 ou L7?** Os dois: o bloco `http` faz L7 e o bloco `stream` faz L4.", "**Is NGINX L4 or L7?** Both: the `http` block does L7 and the `stream` block does L4."],
        ["**Posso terminar TLS em um L4?** Alguns L4 (como o NLB) suportam terminação de TLS, mas o normal é passthrough; para ler o conteúdo HTTP é preciso um L7.", "**Can I terminate TLS on an L4?** Some L4 balancers (such as NLB) support TLS termination, but passthrough is the norm; reading HTTP content requires an L7."],
        ["**Round-robin de DNS substitui um balanceador?** Só para distribuição grosseira e sem exigência de failover rápido.", "**Does DNS round-robin replace a balancer?** Only for coarse distribution with no need for fast failover."],
        ["**O que é o PROXY protocol?** Um cabeçalho que o balanceador L4 envia no início da conexão com o IP real do cliente, para o servidor não ver só o IP do balanceador.", "**What is the PROXY protocol?** A header the L4 balancer sends at the start of the connection carrying the client's real IP, so the server does not see only the balancer's IP."],
      ),
      tip(["Regra prática: comece com um balanceador L7 gerenciado. Vá para L4 quando o protocolo não for HTTP ou a vazão exigir, e para GSLB quando houver mais de uma região. Complexidade deve ser adotada quando um requisito a justifica.", "Rule of thumb: start with a managed L7 balancer. Move to L4 when the protocol is not HTTP or throughput demands it, and to GSLB when there is more than one region. Adopt complexity when a requirement justifies it."]),
    ] },

  { id: "algoritmos-de-balanceamento", section: "balanceamento", level: 1, icon: "tune", minutes: 12,
    title: ["Algoritmos de balanceamento", "Load balancing algorithms"],
    summary: ["Round-robin, ponderado, menos conexões, menor tempo de resposta, hash, aleatório, power of two choices e maglev: como cada um funciona, em código, e quando vence.", "Round-robin, weighted, least connections, least response time, hash, random, power of two choices and maglev: how each works, in code, and when it wins."],
    body: [
      p(["Dado um pedido e N servidores saudáveis, qual escolher? A resposta depende de perguntas práticas: os pedidos custam parecido, ou uns são dezenas de vezes mais caros que outros? Os servidores têm a mesma capacidade? O balanceador precisa se lembrar do cliente? Há um só balanceador ou vários operando em paralelo? Os algoritmos abaixo vão dos mais simples aos mais sofisticados, e cada um traz um conjunto diferente de suposições. Todos os trechos de código usam TypeScript e uma interface mínima de servidor.", "Given a request and N healthy servers, which to pick? The answer depends on practical questions: do requests cost about the same, or are some dozens of times more expensive than others? Do servers have the same capacity? Must the balancer remember the client? Is there one balancer or several running in parallel? The algorithms below go from the simplest to the most sophisticated, and each brings a different set of assumptions. All code snippets use TypeScript and a minimal server interface."]),
      code(`interface Server {
  id: string;
  weight: number;        // relative capacity
  active: number;        // in-flight requests
  avgMs: number;         // recent latency (EWMA)
}
type Pick = (servers: Server[], key?: string) => Server;`),
      h(["Algoritmos estáticos", "Static algorithms"]),
      p(["Algoritmos **estáticos** decidem sem olhar o estado atual dos servidores. São baratos, previsíveis e fáceis de depurar, mas cegos a quem está sobrecarregado no momento.", "**Static** algorithms decide without looking at the servers' current state. They are cheap, predictable and easy to debug, but blind to who is overloaded at the moment."]),
      p(["**Round-robin**: percorre a lista em ordem circular (1, 2, 3, 1, 2, 3...). Não guarda nada além de um índice. É ótimo quando os pedidos são curtos e uniformes e os servidores idênticos. É ruim quando os custos variam muito: por azar, um servidor pode receber uma sequência de pedidos pesados enquanto outro fica ocioso.", "**Round-robin**: walks the list in circular order (1, 2, 3, 1, 2, 3...). It keeps nothing but an index. Great when requests are short and uniform and servers identical. Bad when costs vary widely: by bad luck, one server may receive a run of heavy requests while another sits idle."]),
      code(`let i = 0;
const roundRobin: Pick = (servers) => servers[i++ % servers.length];`),
      p(["**Round-robin ponderado** (*weighted round-robin*): cada servidor tem um peso proporcional à capacidade. Um servidor de peso 3 recebe três pedidos a cada um do peso 1. Útil em frotas mistas (máquinas de gerações diferentes) e em deploys graduais (peso 1 para a versão nova contra 19 para a antiga, aproximadamente 5%). A versão ingênua envia três pedidos seguidos ao mesmo servidor; o NGINX usa o **round-robin ponderado suave** (*smooth*), que intercala as escolhas.", "**Weighted round-robin**: each server has a weight proportional to capacity. A weight-3 server receives three requests for every one a weight-1 server gets. Useful for mixed fleets (machines of different generations) and gradual deploys (weight 1 for the new version against 19 for the old, roughly 5%). The naive version sends three requests in a row to the same server; NGINX uses **smooth weighted round-robin**, which interleaves the choices."]),
      code(`// smooth weighted round-robin (the idea used by nginx)
const current = new Map<string, number>();
const smoothWrr: Pick = (servers) => {
  const total = servers.reduce((s, x) => s + x.weight, 0);
  let best = servers[0];
  for (const s of servers) {
    current.set(s.id, (current.get(s.id) ?? 0) + s.weight);
    if (current.get(s.id)! > current.get(best.id)!) best = s;
  }
  current.set(best.id, current.get(best.id)! - total);
  return best;           // weights 5,1,1 -> A A B A C A A (interleaved)
};`),
      p(["**Aleatório** (*random*): sorteia um servidor. Sem estado algum, trivial de implementar e, com muitos pedidos e muitos servidores, a distribuição fica razoavelmente uniforme. A variância, porém, é maior que a do round-robin: a carga do servidor mais cheio cresce como log N / log log N acima da média.", "**Random**: draws a server. No state at all, trivial to implement and, with many requests and many servers, the distribution becomes reasonably uniform. The variance, however, is larger than round-robin's: the load of the fullest server grows like log N / log log N above the average."]),
      p(["**Hash de IP ou de chave** (*IP hash*, *source hash*, *URI hash*): `hash(chave) mod N` escolhe o servidor, então a mesma chave sempre cai no mesmo servidor, sem cookie e sem tabela de sessões. Serve para afinidade, para aproveitar cache local (hash da URL) e para estados em memória. Os problemas: uma chave muito quente sobrecarrega um servidor e, principalmente, mudar N remaneja quase todas as chaves. A correção é o hashing consistente, tema de um artigo próprio.", "**IP or key hash** (*IP hash*, *source hash*, *URI hash*): `hash(key) mod N` picks the server, so the same key always lands on the same server, with no cookie and no session table. It serves affinity, exploiting local cache (URL hash) and in-memory state. The problems: a very hot key overloads one server and, mainly, changing N reshuffles almost every key. The fix is consistent hashing, the topic of its own article."]),
      code(`const ipHash: Pick = (servers, key = "") => servers[fnv1a(key) % servers.length];

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}`),
      h(["Algoritmos dinâmicos", "Dynamic algorithms"]),
      p(["Algoritmos **dinâmicos** usam informação do estado dos servidores. Reagem a pedidos de duração variável e a servidores degradados, ao custo de manter e atualizar essa informação.", "**Dynamic** algorithms use information about the servers' state. They react to requests of varying duration and to degraded servers, at the cost of maintaining and updating that information."]),
      p(["**Menos conexões** (*least connections*): escolhe o servidor com menos requisições em andamento. Se um servidor está preso em pedidos lentos, acumula conexões e deixa de ser escolhido, sem que o balanceador precise saber o motivo. É a melhor opção geral quando a duração varia: WebSockets, uploads, consultas pesadas, streaming. Existe a versão **ponderada** (conexões divididas pelo peso). No Envoy equivale a `LEAST_REQUEST`; no ALB, a *least outstanding requests*.", "**Least connections**: picks the server with the fewest in-flight requests. If a server is stuck on slow requests, it accumulates connections and stops being chosen, without the balancer needing to know why. It is the best general option when duration varies: WebSockets, uploads, heavy queries, streaming. A **weighted** version exists (connections divided by weight). In Envoy this corresponds to `LEAST_REQUEST`; in the ALB, to *least outstanding requests*."]),
      code(`const leastConnections: Pick = (servers) =>
  servers.reduce((a, b) => (b.active / b.weight < a.active / a.weight ? b : a));

// the balancer must keep 'active' correct:
//   server.active++ on dispatch, server.active-- when the response ends`),
      p(["**Menor tempo de resposta** (*least response time*): combina conexões ativas com a latência recente de cada servidor (uma média móvel exponencial) e prefere o mais rápido. Reage a servidores degradados (disco lento, vizinho barulhento), mas as medições ficam desatualizadas e o algoritmo pode oscilar: todos correm para o servidor aparentemente mais rápido e o afogam, e só depois a latência medida piora. Por isso costuma ser usado com média suavizada e junto de um limite de conexões.", "**Least response time**: combines active connections with each server's recent latency (an exponentially weighted moving average) and prefers the fastest. It reacts to degraded servers (slow disk, noisy neighbor), but measurements go stale and the algorithm can oscillate: everyone rushes to the seemingly fastest server and drowns it, and only then does the measured latency worsen. That is why it is usually used with a smoothed average and alongside a connection cap."]),
      code(`const leastResponseTime: Pick = (servers) =>
  servers.reduce((a, b) => (score(b) < score(a) ? b : a));

const score = (s: Server) => (s.active + 1) * s.avgMs / s.weight;   // lower is better

// after each response: avgMs = 0.8 * avgMs + 0.2 * observedMs   (EWMA)`),
      h(["Power of two choices (P2C)", "Power of two choices (P2C)"]),
      p(["Menos conexões exige conhecer o estado de **todos** os servidores. Isso é caro com centenas de backends e fica desatualizado quando vários balanceadores operam em paralelo, pois todos veem o mesmo \"menos carregado\" e mandam a ele uma rajada ao mesmo tempo (**efeito manada**). A alternativa é o **P2C** (*power of two random choices*): sorteie **dois** servidores ao acaso e mande o pedido para o menos carregado dos dois.", "Least connections requires knowing the state of **all** servers. That is costly with hundreds of backends and goes stale when several balancers run in parallel, because all of them see the same \"least loaded\" and send it a burst at once (the **herd effect**). The alternative is **P2C** (*power of two random choices*): pick **two** servers at random and send the request to the less loaded of the two."]),
      p(["Há um resultado clássico da teoria de balls-into-bins: ao lançar n bolas em n urnas escolhendo uma ao acaso, a urna mais cheia terá cerca de log n / log log n bolas; escolhendo duas ao acaso e usando a menos cheia, cai para cerca de log log n, uma melhora exponencial com custo mínimo. Não precisa de visão global, escala bem e espalha as decisões, evitando a manada. Envoy (`LEAST_REQUEST` sorteia dois por padrão), HAProxy (`balance random(2)`), NGINX (`random two least_conn`) e o gRPC o usam.", "There is a classic balls-into-bins result: throwing n balls into n bins, each into a random bin, the fullest bin will hold about log n / log log n balls; picking two bins at random and using the emptier one drops it to about log log n, an exponential improvement at minimal cost. It needs no global view, scales well and scatters decisions, avoiding the herd. Envoy (`LEAST_REQUEST` samples two by default), HAProxy (`balance random(2)`), NGINX (`random two least_conn`) and gRPC use it."]),
      code(`const powerOfTwo: Pick = (servers) => {
  const a = servers[Math.floor(Math.random() * servers.length)];
  let b = servers[Math.floor(Math.random() * servers.length)];
  if (servers.length > 1) while (b === a) b = servers[Math.floor(Math.random() * servers.length)];
  return a.active <= b.active ? a : b;
};`),
      h(["Ring hash e Maglev", "Ring hash and Maglev"]),
      p(["Quando é preciso afinidade por chave (mesmo usuário, mesma URL, mesmo cache) e a frota muda com frequência, o hash simples `mod N` é inadequado. O **ring hash** posiciona servidores (com muitas réplicas virtuais cada) em um anel e leva cada chave ao primeiro servidor no sentido horário. Quando um servidor entra ou sai, só cerca de 1/N das chaves muda. O **Maglev**, desenvolvido no Google, monta uma **tabela de consulta** de tamanho fixo (um número primo, como 65537) em que cada servidor ocupa uma fração proporcional ao seu peso, preenchida segundo permutações próprias de cada servidor. A busca é uma única leitura de tabela, O(1), mais rápida que a busca binária do anel, com distribuição muito uniforme e perturbação mínima quando a frota muda. Ambos estão disponíveis no Envoy (`RING_HASH`, `MAGLEV`) e no HAProxy (`hash-type consistent`). Os detalhes do anel estão no artigo de hashing consistente.", "When key affinity is needed (same user, same URL, same cache) and the fleet changes often, plain `mod N` hashing is inadequate. **Ring hash** places servers (each with many virtual replicas) on a ring and takes each key to the first server clockwise. When a server joins or leaves, only about 1/N of keys change. **Maglev**, developed at Google, builds a fixed-size **lookup table** (a prime number such as 65537) where each server occupies a fraction proportional to its weight, filled according to each server's own permutation. Lookup is a single table read, O(1), faster than the ring's binary search, with very uniform distribution and minimal disruption when the fleet changes. Both are available in Envoy (`RING_HASH`, `MAGLEV`) and HAProxy (`hash-type consistent`). The ring details are in the consistent hashing article."]),
      fig(["Do estático ao dinâmico: o que cada algoritmo precisa saber", "From static to dynamic: what each algorithm needs to know"],
        [[node("req", ["Pedido", "Request"], "client")], [node("lb", ["Balanceador", "Balancer"], "edge")], [node("st", ["Estático: índice, peso, hash", "Static: index, weight, hash"], "cache"), node("dy", ["Dinâmico: conexões, latência", "Dynamic: connections, latency"], "cache")], [node("s1", ["Servidor 1", "Server 1"], "service"), node("s2", ["Servidor 2", "Server 2"], "service"), node("s3", ["Servidor 3", "Server 3"], "service")]],
        [edge("req", "lb"), edge("lb", "st"), edge("lb", "dy"), edge("st", "s1"), edge("dy", "s2"), edge("dy", "s3"), edge("s2", "dy", ["carga medida", "measured load"], { dashed: true })]),
      h(["Comparação", "Comparison"]),
      table([["Algoritmo", "Algorithm"], ["Estado necessário", "State needed"], ["Ponto forte", "Strength"], ["Ponto fraco", "Weakness"]],
        [["Round-robin", "Round-robin"], ["Um índice", "One index"], ["Simples, justo em carga uniforme", "Simple, fair under uniform load"], ["Cego a pedidos pesados", "Blind to heavy requests"]],
        [["Ponderado", "Weighted"], ["Pesos", "Weights"], ["Frotas mistas, deploy gradual", "Mixed fleets, gradual deploy"], ["Pesos manuais ficam velhos", "Manual weights go stale"]],
        [["Aleatório", "Random"], ["Nenhum", "None"], ["Sem coordenação entre balanceadores", "No coordination across balancers"], ["Variância maior", "Higher variance"]],
        [["Hash / IP hash", "Hash / IP hash"], ["Chave", "Key"], ["Afinidade sem cookie, cache local", "Affinity without cookie, local cache"], ["Remaneja tudo ao mudar N; chaves quentes", "Reshuffles all when N changes; hot keys"]],
        [["Menos conexões", "Least connections"], ["Conexões ativas por servidor", "Active connections per server"], ["Bom com durações variáveis", "Good with varying durations"], ["Visão global custosa e manada", "Costly global view and herd"]],
        [["Menor tempo de resposta", "Least response time"], ["Latência recente", "Recent latency"], ["Evita servidores degradados", "Avoids degraded servers"], ["Oscilação e medidas velhas", "Oscillation and stale measures"]],
        [["P2C", "P2C"], ["Carga de dois servidores", "Load of two servers"], ["Quase ótimo, escala, sem manada", "Near-optimal, scalable, no herd"], ["Aleatoriedade dificulta reproduzir casos", "Randomness makes cases hard to reproduce"]],
        [["Ring hash / Maglev", "Ring hash / Maglev"], ["Anel ou tabela", "Ring or table"], ["Afinidade estável com frota mutável", "Stable affinity with a changing fleet"], ["Distribuição só estatística; chaves quentes", "Only statistical distribution; hot keys"]]),
      h(["Como escolher", "How to choose"]),
      ul(
        ["Serviço sem estado, pedidos parecidos e máquinas iguais: **round-robin**.", "Stateless service, similar requests and identical machines: **round-robin**."],
        ["Máquinas diferentes ou deploy gradual: **ponderado**.", "Different machines or gradual deploy: **weighted**."],
        ["Duração variável dos pedidos: **menos conexões** ou, com muitos balanceadores e backends, **P2C**.", "Variable request duration: **least connections** or, with many balancers and backends, **P2C**."],
        ["Afinidade ou cache por chave: **hash consistente** (ring hash ou Maglev), em vez de `mod N`.", "Affinity or per-key cache: **consistent hash** (ring hash or Maglev), instead of `mod N`."],
        ["Conexões longas (WebSocket): **menos conexões**, lembrando que o equilíbrio só se aplica à abertura.", "Long connections (WebSocket): **least connections**, remembering that balance only applies at open."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Usar round-robin com pedidos de custos muito diferentes e culpar o servidor mais lento.", "Using round-robin with widely different request costs and blaming the slowest server."],
        ["Esquecer de desfazer a contagem de conexões quando o pedido falha ou o cliente desconecta, o que desequilibra o menos conexões.", "Forgetting to decrement the connection count when the request fails or the client disconnects, which unbalances least connections."],
        ["Reiniciar um servidor e jogar todo o tráfego nele: prefira *slow start*, que aumenta o peso gradualmente enquanto o cache e as JITs aquecem.", "Restarting a server and throwing all traffic at it: prefer *slow start*, which raises the weight gradually while caches and JITs warm up."],
        ["Pensar que o algoritmo resolve falhas: sem health check, qualquer algoritmo continua enviando tráfego a um servidor morto.", "Thinking the algorithm solves failures: without a health check, any algorithm keeps sending traffic to a dead server."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Estáticos (round-robin, ponderado, aleatório, hash) são baratos e cegos à carga; dinâmicos (menos conexões, menor tempo de resposta) reagem ao estado.", "Static ones (round-robin, weighted, random, hash) are cheap and load-blind; dynamic ones (least connections, least response time) react to state."],
        ["P2C obtém quase o desempenho do ótimo olhando apenas dois servidores e evita o efeito manada.", "P2C gets near-optimal performance by looking at just two servers and avoids the herd effect."],
        ["Ring hash e Maglev dão afinidade estável quando a frota muda.", "Ring hash and Maglev give stable affinity when the fleet changes."],
        ["O health check importa mais que o algoritmo.", "The health check matters more than the algorithm."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Qual é o algoritmo padrão?** Round-robin no NGINX e no HAProxy (`roundrobin`); o ALB usa round-robin por padrão e permite *least outstanding requests*.", "**What is the default algorithm?** Round-robin in NGINX and HAProxy (`roundrobin`); the ALB uses round-robin by default and allows *least outstanding requests*."],
        ["**Round-robin é injusto?** Só quando os pedidos têm custos diferentes. Com carga uniforme é perfeitamente justo.", "**Is round-robin unfair?** Only when requests have different costs. With uniform load it is perfectly fair."],
        ["**Posso combinar algoritmos?** Sim: hash para escolher o grupo e menos conexões dentro dele, ou ponderado com P2C.", "**Can I combine algorithms?** Yes: hash to choose the group and least connections within it, or weighted with P2C."],
        ["**Por que o P2C funciona tão bem?** Porque comparar dois candidatos aleatórios já corrige o pior desequilíbrio do sorteio puro, sem exigir informação global.", "**Why does P2C work so well?** Because comparing two random candidates already corrects the worst imbalance of pure random, without requiring global information."],
      ),
      tip(["O algoritmo importa menos do que o health check. O melhor algoritmo do mundo continua mandando tráfego a um servidor morto se ninguém o tirar do rodízio.", "The algorithm matters less than the health check. The best algorithm in the world still sends traffic to a dead server if nobody pulls it from rotation."]),
    ] },

  { id: "hashing-consistente", section: "balanceamento", level: 2, icon: "donut_large", minutes: 14,
    title: ["Hashing consistente", "Consistent hashing"],
    summary: ["Como distribuir chaves entre servidores movendo o mínimo quando um entra ou sai: anel, nós virtuais, rendezvous e jump hash, com implementação completa.", "How to distribute keys across servers while moving as little as possible when one joins or leaves: ring, virtual nodes, rendezvous and jump hash, with a full implementation."],
    body: [
      p(["Muitos sistemas precisam mapear uma chave (um usuário, uma URL, uma linha de tabela) para um servidor: caches distribuídos, shards de banco, nós de armazenamento, balanceadores com afinidade. O mapeamento precisa ser **determinístico** (a mesma chave sempre leva ao mesmo lugar, sem consultar um catálogo central), **uniforme** (nenhum servidor sobrecarregado) e, principalmente, **estável**: quando o número de servidores muda, o menor volume possível de dados deve se mover. O hashing consistente é a família de técnicas que resolve esse terceiro requisito.", "Many systems must map a key (a user, a URL, a table row) to a server: distributed caches, database shards, storage nodes, affinity balancers. The mapping must be **deterministic** (the same key always leads to the same place, without consulting a central catalog), **uniform** (no overloaded server) and, above all, **stable**: when the number of servers changes, as little data as possible should move. Consistent hashing is the family of techniques that solves this third requirement."]),
      h(["O problema do módulo N", "The modulo-N problem"]),
      p(["A ideia ingênua é `servidor = hash(chave) mod N`. Funciona bem com N fixo e distribui de maneira uniforme. O desastre vem quando N muda. Exemplo: um cache com 4 nós. A chave com hash 10 vai para o nó `10 mod 4 = 2`. Adicione um quinto nó e a mesma chave vai para `10 mod 5 = 0`. Uma chave só permanece no lugar quando `k mod 4 == k mod 5`, o que ocorre para apenas 4 em cada 20 valores consecutivos: ficam **20%** e se movem **80%**. Em geral, ao passar de N para N+1 nós, uma fração **N/(N+1)** das chaves muda de dono. Com 100 nós, adicionar um move 99% dos dados.", "The naive idea is `server = hash(key) mod N`. It works well with fixed N and distributes uniformly. The disaster comes when N changes. Example: a cache with 4 nodes. The key with hash 10 goes to node `10 mod 4 = 2`. Add a fifth node and the same key goes to `10 mod 5 = 0`. A key only stays put when `k mod 4 == k mod 5`, which happens for only 4 out of every 20 consecutive values: **20%** stay and **80%** move. In general, going from N to N+1 nodes, a fraction **N/(N+1)** of keys changes owner. With 100 nodes, adding one moves 99% of the data."]),
      p(["Num cache, isso significa uma enxurrada de *misses* simultâneos: todo o tráfego despenca sobre o banco de dados exatamente no momento em que você tentava aumentar a capacidade. Num banco particionado, significa migrar quase todos os dados pela rede. Queremos algo em que adicionar um nó mova apenas cerca de **1/(N+1)** das chaves, o mínimo teoricamente necessário para equilibrar a carga.", "In a cache, that means a flood of simultaneous *misses*: all traffic crashes onto the database exactly when you were trying to add capacity. In a partitioned database, it means migrating nearly all data across the network. We want something where adding a node moves only about **1/(N+1)** of keys, the theoretical minimum needed to balance the load."]),
      h(["O anel de hash", "The hash ring"]),
      p(["No **hashing consistente** (Karger et al., 1997, criado para caches web), o espaço de hash, por exemplo 0 a 2^32 - 1, é imaginado como um **anel**: o maior valor volta ao zero. Cada servidor recebe uma posição no anel (o hash do seu nome ou IP). Para achar o dono de uma chave, calcula-se o hash dela, marca-se o ponto no anel e caminha-se **no sentido horário até o primeiro servidor**. Cada servidor é responsável pelo arco entre o servidor anterior e ele mesmo.", "In **consistent hashing** (Karger et al., 1997, created for web caches), the hash space, say 0 to 2^32 - 1, is imagined as a **ring**: the largest value wraps to zero. Each server gets a position on the ring (the hash of its name or IP). To find a key's owner, compute its hash, mark the point on the ring and walk **clockwise to the first server**. Each server is responsible for the arc between the previous server and itself."]),
      fig(["Anel com quatro servidores e quatro chaves", "Ring with four servers and four keys"],
        [[node("k1", "k1", "client"), node("k2", "k2", "client"), node("k3", "k3", "client"), node("k4", "k4", "client")], [node("s1", "S1", "service"), node("s2", "S2", "service"), node("s3", "S3", "service"), node("s4", "S4", "service")]],
        [edge("k1", "s2", ["horário", "clockwise"]), edge("k2", "s3"), edge("k3", "s4"), edge("k4", "s1")]),
      code(`            0
        S1 .----. k1
      k4  /        \\ S2         k1 -> S2  (next server clockwise)
         |   ring   |          k2 -> S3
      S4  \\        /  k2       k3 -> S4
        k3 '----' S3          k4 -> S1`),
      p(["A vantagem está na mudança. Se S5 entra no anel, ele só assume as chaves entre o seu antecessor e ele mesmo, que antes eram do seu sucessor; todo o resto fica onde estava. Se S3 sai, suas chaves passam ao próximo servidor e nada mais se mexe. Em média, apenas **1/N** das chaves se move, em vez de quase todas. Observe que **ninguém** precisa de um catálogo central: qualquer cliente que conheça a lista de servidores calcula o mesmo resultado.", "The advantage is in the change. If S5 joins the ring, it only takes keys between its predecessor and itself, which used to belong to its successor; everything else stays put. If S3 leaves, its keys pass to the next server and nothing else moves. On average only **1/N** of keys move, instead of nearly all. Note that **nobody** needs a central catalog: any client that knows the server list computes the same result."]),
      h(["Nós virtuais", "Virtual nodes"]),
      p(["Com poucos servidores, as posições aleatórias no anel geram arcos de tamanhos muito diferentes: um servidor pode ficar com 40% das chaves e outro com 10%. Além disso, quando um servidor sai, **todas** as suas chaves vão para o vizinho seguinte, que pode ficar sobrecarregado e, por sua vez, cair (efeito dominó). A correção são os **nós virtuais** (*vnodes*): cada servidor físico aparece no anel em dezenas ou centenas de posições (`S1#0`, `S1#1`, ...). Os arcos se equilibram estatisticamente (o desvio cai aproximadamente com a raiz do número de pontos) e, ao sair um servidor, suas chaves se espalham entre **muitos** vizinhos. Também permite pesos: uma máquina com o dobro de capacidade recebe o dobro de vnodes. O custo é memória para guardar os pontos e a tarefa de recalcular o anel quando a lista muda.", "With few servers, random positions on the ring create arcs of very different sizes: one server may hold 40% of the keys and another 10%. Also, when a server leaves, **all** its keys go to the next neighbor, which may become overloaded and, in turn, fall (domino effect). The fix is **virtual nodes** (*vnodes*): each physical server appears on the ring at tens or hundreds of positions (`S1#0`, `S1#1`, ...). Arcs balance out statistically (the deviation falls roughly with the square root of the number of points) and, when a server leaves, its keys spread across **many** neighbors. It also allows weights: a machine with double the capacity gets double the vnodes. The cost is memory to hold the points and the task of recomputing the ring when the list changes."]),
      h(["Implementação completa em TypeScript", "Full TypeScript implementation"]),
      p(["O código abaixo implementa o anel com nós virtuais, busca binária, remoção, réplicas em servidores físicos distintos e uma pequena medição de quantas chaves mudam ao adicionar um nó. A função de hash mistura bits (finalizador do MurmurHash3) para espalhar bem os pontos; em produção use uma função como MurmurHash3 ou xxHash completa.", "The code below implements the ring with virtual nodes, binary search, removal, replicas on distinct physical servers and a small measurement of how many keys change when adding a node. The hash function mixes bits (the MurmurHash3 finalizer) to spread points well; in production use a full function such as MurmurHash3 or xxHash."]),
      code(`function hash32(s: string): number {
  let h = 0x811c9dc5;                                  // FNV-1a
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);         // murmur3 fmix32
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

class HashRing {
  private points: { pos: number; node: string }[] = [];   // sorted by pos
  private weights = new Map<string, number>();

  constructor(private vnodes = 150) {}

  add(node: string, weight = 1): void {
    this.weights.set(node, weight);
    const count = Math.round(this.vnodes * weight);
    for (let i = 0; i < count; i++) this.points.push({ pos: hash32(node + "#" + i), node });
    this.points.sort((a, b) => a.pos - b.pos);
  }

  remove(node: string): void {
    this.weights.delete(node);
    this.points = this.points.filter((p) => p.node !== node);
  }

  /** index of the first point with pos >= h (wraps to 0) */
  private find(h: number): number {
    let lo = 0, hi = this.points.length;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (this.points[mid].pos < h) lo = mid + 1; else hi = mid; }
    return lo % this.points.length;
  }

  get(key: string): string {
    return this.points[this.find(hash32(key))].node;
  }

  /** the n distinct physical nodes that follow the key (for replication) */
  getN(key: string, n: number): string[] {
    const out: string[] = [];
    let i = this.find(hash32(key));
    for (let step = 0; step < this.points.length && out.length < Math.min(n, this.weights.size); step++) {
      const node = this.points[(i + step) % this.points.length].node;
      if (!out.includes(node)) out.push(node);
    }
    return out;
  }
}

// How many keys move when a node is added?
const ring = new HashRing();
["cache-a", "cache-b", "cache-c", "cache-d"].forEach((n) => ring.add(n));
const keys = Array.from({ length: 100000 }, (_, i) => "user:" + i);
const before = keys.map((k) => ring.get(k));
ring.add("cache-e");
const moved = keys.filter((k, i) => ring.get(k) !== before[i]).length;
console.log((moved / keys.length * 100).toFixed(1) + "% moved");   // about 20% (1/5), not 80%`),
      h(["Rendezvous hashing e jump hash", "Rendezvous hashing and jump hash"]),
      p(["O anel não é a única forma de obter estabilidade. O **rendezvous hashing** (ou *highest random weight*, HRW) é mais simples: para uma chave, calcula-se uma pontuação `hash(servidor, chave)` para **cada** servidor e escolhe-se o de maior pontuação. Quando um servidor sai, só as chaves que ele ganhava vão para o segundo colocado; quando um entra, só leva as chaves em que passa a ter a maior pontuação (cerca de 1/N). Não há anel, nem vnodes, nem estrutura para reconstruir, e a distribuição é naturalmente uniforme; os pesos entram por uma fórmula logarítmica simples. A busca custa O(N) por chave, aceitável para dezenas ou poucas centenas de nós e usada com frequência em balanceadores e sistemas de armazenamento.", "The ring is not the only way to get stability. **Rendezvous hashing** (or *highest random weight*, HRW) is simpler: for a key, compute a score `hash(server, key)` for **each** server and pick the highest. When a server leaves, only the keys it was winning go to the runner-up; when one joins, it only takes keys where it now has the highest score (about 1/N). There is no ring, no vnodes, no structure to rebuild, and the distribution is naturally uniform; weights enter through a simple logarithmic formula. Lookup costs O(N) per key, acceptable for tens or a few hundred nodes and frequently used in balancers and storage systems."]),
      code(`function rendezvous(key: string, nodes: string[]): string {
  let best = nodes[0], bestScore = -1;
  for (const n of nodes) {
    const score = hash32(n + "|" + key);
    if (score > bestScore) { bestScore = score; best = n; }
  }
  return best;
}`),
      p(["O **jump consistent hash** (Lamping e Veach, Google, 2014) vai ao extremo da economia: sem memória, sem anel, em tempo O(log N), com distribuição quase perfeita e movimentação mínima. A restrição é que os servidores são apenas **numerados de 0 a N-1** e só dá para adicionar ou remover o último: serve para shards que crescem de forma ordenada (partições de um armazenamento), não para um conjunto em que qualquer nó pode cair no meio.", "**Jump consistent hash** (Lamping and Veach, Google, 2014) goes to the extreme of economy: no memory, no ring, O(log N) time, near-perfect distribution and minimal movement. The restriction is that servers are only **numbered 0 to N-1** and only the last one can be added or removed: it fits shards that grow in order (partitions of a storage system), not a set where any node can fail in the middle."]),
      code(`// Jump consistent hash: maps a 64-bit key to a bucket in [0, n)
function jumpHash(key: bigint, n: number): number {
  const MASK = (1n << 64n) - 1n;
  let b = -1, j = 0;
  while (j < n) {
    b = j;
    key = (key * 2862933555777941757n + 1n) & MASK;
    j = Math.floor((b + 1) * (2 ** 31 / (Number(key >> 33n) + 1)));
  }
  return b;
}
// jumpHash(k, 10) -> jumpHash(k, 11): the key either stays or jumps to bucket 10`),
      table([["Técnica", "Technique"], ["Busca", "Lookup"], ["Memória", "Memory"], ["Pesos / remoção", "Weights / removal"], ["Uso típico", "Typical use"]],
        [["mod N", "mod N"], ["O(1)", "O(1)"], ["Nenhuma", "None"], ["Remaneja quase tudo", "Reshuffles almost everything"], ["N fixo", "Fixed N"]],
        [["Anel + vnodes", "Ring + vnodes"], ["O(log V)", "O(log V)"], ["N x vnodes pontos", "N x vnodes points"], ["Pesos por vnodes; remove qualquer nó", "Weights via vnodes; removes any node"], ["Dynamo, Cassandra, ketama", "Dynamo, Cassandra, ketama"]],
        [["Rendezvous (HRW)", "Rendezvous (HRW)"], ["O(N)", "O(N)"], ["Só a lista de nós", "Only the node list"], ["Pesos simples; remove qualquer nó", "Simple weights; removes any node"], ["Balanceadores, sistemas de arquivos", "Balancers, file systems"]],
        [["Jump hash", "Jump hash"], ["O(log N)", "O(log N)"], ["Nenhuma", "None"], ["Só adiciona e remove o último", "Only adds/removes the last"], ["Shards numerados", "Numbered shards"]],
        [["Maglev", "Maglev"], ["O(1)", "O(1)"], ["Tabela de ~65 mil entradas", "Table of ~65 thousand entries"], ["Pesos; rebuild da tabela ao mudar", "Weights; table rebuild on change"], ["Balanceadores L4 de alto desempenho", "High-performance L4 balancers"]]),
      h(["Onde é usado", "Where it is used"]),
      ul(
        ["**Caches distribuídos**: clientes de Memcached que usam o esquema *ketama* e proxies de Redis distribuem chaves por anel, para que perder um nó invalide só uma fração do cache. O servidor Memcached em si não sabe nada disso: a escolha é feita no cliente.", "**Distributed caches**: Memcached clients that use the *ketama* scheme and Redis proxies distribute keys by ring, so losing a node only invalidates a fraction of the cache. The Memcached server itself knows nothing about it: the choice is made on the client."],
        ["**Bancos particionados**: o Dynamo da Amazon (descrito em artigo de 2007) e seus descendentes Cassandra e Riak posicionam dados no anel, com vnodes e réplicas nos próximos nós. (O Redis Cluster usa 16384 *hash slots* fixos, uma variação da mesma ideia: as chaves vão para slots, e os slots são movidos entre nós.)", "**Partitioned databases**: Amazon's Dynamo (described in a 2007 paper) and its descendants Cassandra and Riak place data on the ring, with vnodes and replicas on the next nodes. (Redis Cluster uses 16384 fixed *hash slots*, a variation of the same idea: keys map to slots, and slots are moved between nodes.)"],
        ["**Balanceadores com afinidade**: Envoy e HAProxy oferecem *ring hash* e *maglev* para que o mesmo cliente ou chave caia no mesmo backend, mesmo com a frota mudando.", "**Affinity balancers**: Envoy and HAProxy offer *ring hash* and *maglev* so the same client or key lands on the same backend even as the fleet changes."],
        ["**CDNs e armazenamento de objetos**: decidir qual servidor guarda qual arquivo de cache, concentrando acessos repetidos na mesma máquina.", "**CDNs and object stores**: deciding which server holds which cached file, concentrating repeated accesses on the same machine."],
      ),
      h(["Limitações e cuidados", "Limitations and caveats"]),
      ul(
        ["**Chaves quentes**: o hashing consistente distribui chaves, não carga. Uma única chave muito popular continua pesando em um só nó. Replique a chave, divida-a em subchaves (`chave#0` a `chave#7`) ou use um cache local à frente.", "**Hot keys**: consistent hashing distributes keys, not load. A single very popular key still weighs on one node. Replicate the key, split it into subkeys (`key#0` to `key#7`) or put a local cache in front."],
        ["**Consistência da visão**: se dois clientes têm listas de servidores diferentes por alguns segundos, eles mapeiam a mesma chave para nós distintos. Em caches isso causa só um *miss*; em armazenamento exige protocolos de associação (*gossip*, quórum) para convergir.", "**View consistency**: if two clients have different server lists for a few seconds, they map the same key to different nodes. In caches that only causes a *miss*; in storage it requires membership protocols (*gossip*, quorum) to converge."],
        ["**Estado ao mover**: ao entrar um nó, as chaves que mudam de dono precisam ser transferidas (ou aquecidas no cache) e a antiga origem deve parar de servi-las; isso é a parte difícil dos bancos.", "**State on movement**: when a node joins, keys that change owner must be transferred (or warmed in the cache) and the old source must stop serving them; that is the hard part of databases."],
        ["**Quantidade de vnodes**: poucos geram desequilíbrio; muitos aumentam memória e o custo de reconstruir o anel. Algumas centenas por nó são um ponto de partida comum.", "**Number of vnodes**: too few produce imbalance; too many increase memory and the cost of rebuilding the ring. A few hundred per node is a common starting point."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Usar uma função de hash fraca ou não uniforme (como somar bytes), que concentra pontos e produz arcos desiguais.", "Using a weak or non-uniform hash function (such as summing bytes), which clusters points and produces uneven arcs."],
        ["Trocar a função de hash em um dos clientes: o mapeamento deixa de coincidir.", "Changing the hash function on one client: the mapping stops matching."],
        ["Posicionar os vnodes com `hash(nó + índice)` e depois mudar o nome do nó, movendo tudo sem necessidade; use identificadores estáveis.", "Positioning vnodes with `hash(node + index)` and later renaming the node, moving everything needlessly; use stable identifiers."],
        ["Esquecer o caso do anel vazio ou com um único nó.", "Forgetting the empty-ring or single-node case."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["`hash mod N` remaneja cerca de N/(N+1) das chaves quando N muda; o hashing consistente move cerca de 1/N.", "`hash mod N` reshuffles about N/(N+1) of keys when N changes; consistent hashing moves about 1/N."],
        ["No anel, a chave pertence ao primeiro servidor no sentido horário; nós virtuais equilibram a carga e permitem pesos.", "On the ring, the key belongs to the first server clockwise; virtual nodes balance load and allow weights."],
        ["Rendezvous hashing é mais simples (O(N)); jump hash não usa memória mas só cresce no fim; Maglev troca memória por busca O(1).", "Rendezvous hashing is simpler (O(N)); jump hash uses no memory but only grows at the end; Maglev trades memory for O(1) lookup."],
        ["Usado em Dynamo, Cassandra, clientes de Memcached, Envoy e HAProxy; não resolve chaves quentes.", "Used in Dynamo, Cassandra, Memcached clients, Envoy and HAProxy; it does not solve hot keys."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Por que é \"consistente\"?** Porque o mapeamento permanece consistente (estável) diante de mudanças no conjunto de servidores, em contraste com `mod N`.", "**Why \"consistent\"?** Because the mapping stays consistent (stable) in the face of changes in the server set, in contrast to `mod N`."],
        ["**Quantos vnodes devo usar?** Dezenas a centenas por servidor; teste o desvio de carga medido nas suas chaves.", "**How many vnodes should I use?** Tens to hundreds per server; test the measured load deviation on your keys."],
        ["**Redis Cluster usa hashing consistente?** Usa 16384 slots fixos com CRC16, uma variação de partição por slots, não o anel clássico.", "**Does Redis Cluster use consistent hashing?** It uses 16384 fixed slots with CRC16, a slot-partitioning variation, not the classic ring."],
        ["**Quando prefiro rendezvous ao anel?** Quando há poucos nós, pesos variáveis e você valoriza simplicidade acima de O(log N) por busca.", "**When do I prefer rendezvous over the ring?** When there are few nodes, variable weights and you value simplicity over O(log N) lookup."],
      ),
      tip(["Antes de adotar o anel, confirme que o problema é realmente o remanejamento. Se o cache pode ser esvaziado sem dor, `mod N` já basta; se os dados são o ativo, o hashing consistente com réplicas é o ponto de partida.", "Before adopting the ring, confirm the problem really is reshuffling. If the cache can be emptied painlessly, `mod N` is enough; if the data is the asset, consistent hashing with replicas is the starting point."]),
    ] },

  { id: "load-balancing-vs-failover", section: "balanceamento", level: 1, icon: "swap_horiz", minutes: 11,
    title: ["Load balancing x failover", "Load balancing vs failover"],
    summary: ["Dois mecanismos que parecem iguais mas resolvem problemas diferentes: ativo-ativo, ativo-passivo, VRRP e keepalived, failover por DNS e como combiná-los.", "Two mechanisms that look alike but solve different problems: active-active, active-passive, VRRP and keepalived, DNS failover and how to combine them."],
    body: [
      p(["Os dois colocam mais de uma cópia de um serviço atrás de um endereço, e por isso são confundidos. Mas respondem a perguntas distintas. O **balanceamento de carga** pergunta: \"como divido o trabalho entre cópias que estão todas saudáveis?\". O **failover** (*tomada de controle*, ou *comutação por falha*) pergunta: \"o que acontece quando a cópia que está trabalhando morre?\". Um sistema pode ter um, o outro ou os dois, e confundi-los leva a decisões erradas: contar com um par ativo-passivo para ganhar desempenho, ou achar que três servidores balanceados protegem automaticamente o banco de dados.", "Both put more than one copy of a service behind one address, which is why they get confused. But they answer different questions. **Load balancing** asks: \"how do I split work among copies that are all healthy?\". **Failover** (*switchover on failure*) asks: \"what happens when the copy doing the work dies?\". A system can have one, the other or both, and mixing them up leads to wrong decisions: counting on an active-passive pair for performance, or assuming three balanced servers automatically protect the database."]),
      h(["Diferenças principais", "Key differences"]),
      table([["Aspecto", "Aspect"], ["Balanceamento de carga", "Load balancing"], ["Failover", "Failover"]],
        [["Objetivo", "Goal"], ["Desempenho, vazão, uso uniforme dos recursos", "Performance, throughput, even use of resources"], ["Continuidade do serviço diante de falhas", "Service continuity in the face of failures"]],
        [["Quem trabalha", "Who works"], ["Todas as cópias ao mesmo tempo (ativo-ativo)", "All copies at once (active-active)"], ["Uma serve e a outra espera (ativo-passivo)", "One serves and the other waits (active-passive)"]],
        [["Quando age", "When it acts"], ["Em todo pedido", "On every request"], ["Só quando uma falha é detectada", "Only when a failure is detected"]],
        [["Custo", "Cost"], ["Todo o hardware é usado", "All hardware is used"], ["A reserva fica ociosa (é um seguro)", "The standby sits idle (it is insurance)"]],
        [["Estado", "State"], ["Trivial para serviços sem estado", "Trivial for stateless services"], ["Exige que a reserva tenha os dados: replicação, atraso, risco de perda", "Requires the standby to have the data: replication, lag, risk of loss"]],
        [["Tempo de recuperação", "Recovery time"], ["Segundos ou menos (health check)", "Seconds or less (health check)"], ["Segundos a minutos (detecção, promoção)", "Seconds to minutes (detection, promotion)"]],
        [["Exemplos", "Examples"], ["ALB com 3 instâncias, NGINX upstream", "ALB with 3 instances, NGINX upstream"], ["PostgreSQL primário e réplica, par de firewalls, keepalived", "PostgreSQL primary and replica, firewall pair, keepalived"]]),
      fig(["Balanceamento (todos trabalham) e failover (a reserva assume)", "Balancing (all work) and failover (standby takes over)"],
        [[node("c", ["Clientes", "Clients"], "client")], [node("lb", "Load balancer", "edge"), node("vip", ["IP virtual (VIP)", "Virtual IP (VIP)"], "edge")], [node("a", "A", "service"), node("b", "B", "service"), node("c2", "C", "service")], [node("pri", ["Primário", "Primary"], "data"), node("stb", ["Standby", "Standby"], "data")]],
        [edge("c", "lb"), edge("c", "vip"), edge("lb", "a"), edge("lb", "b"), edge("lb", "c2"), edge("vip", "pri"), edge("vip", "stb", ["assume se o primário cair", "takes over if primary fails"], { dashed: true }), edge("pri", "stb", ["replicação", "replication"], { dashed: true })]),
      h(["Modos: ativo-ativo, ativo-passivo e N+1", "Modes: active-active, active-passive and N+1"]),
      ul(
        ["**Ativo-ativo** (*active-active*): todas as cópias recebem tráfego. Quando uma cai, o balanceador a retira e as demais absorvem a carga, de modo que o failover vira um efeito colateral do balanceamento. É o jeito mais barato de ter alta disponibilidade em camadas sem estado, desde que sobre capacidade.", "**Active-active**: all copies receive traffic. When one dies, the balancer removes it and the others absorb the load, so failover becomes a side effect of balancing. It is the cheapest way to get high availability in stateless tiers, as long as capacity remains."],
        ["**Ativo-passivo** (*active-passive*, *hot standby*): uma cópia atende e a outra acompanha em silêncio, pronta para assumir. Comum onde só uma pode ser a dona do estado: o primário de um banco, um firewall com tabela de conexões, um agendador único. Há variações: **hot** (sincronizada e pronta em segundos), **warm** (ligada mas atrasada ou com cache frio) e **cold** (desligada; ligar e restaurar leva minutos ou horas).", "**Active-passive** (*hot standby*): one copy serves and the other follows silently, ready to take over. Common where only one can own the state: a database primary, a firewall with a connection table, a single scheduler. There are variations: **hot** (synced and ready in seconds), **warm** (running but behind or with a cold cache) and **cold** (powered off; starting and restoring takes minutes or hours)."],
        ["**N+1 e N+2**: o dimensionamento que torna o ativo-ativo seguro. Se três servidores operam a 80% e um morre, os dois restantes teriam que aguentar 120% e cairiam em cascata. Planeje a frota para suportar o pico **mesmo sem o maior componente** (N+1) ou sem dois (N+2).", "**N+1 and N+2**: the sizing that makes active-active safe. If three servers run at 80% and one dies, the remaining two would have to handle 120% and would fall in cascade. Plan the fleet to handle peak **even without its largest component** (N+1) or without two (N+2)."],
      ),
      h(["Failover em um servidor: VRRP e keepalived", "Failover on a server: VRRP and keepalived"]),
      p(["O balanceador também pode falhar, e o padrão clássico para protegê-lo é um **IP virtual** (VIP) compartilhado por dois nós. O **VRRP** (*Virtual Router Redundancy Protocol*) elege um **mestre**, que anuncia ser dono do VIP, e um ou mais **reservas**. O mestre envia mensagens de anúncio (*advertisements*) em intervalos curtos, normalmente a cada segundo; se as mensagens param, o reserva de maior prioridade assume o VIP e envia um ARP gratuito para atualizar as tabelas dos vizinhos. No Linux, o **keepalived** implementa VRRP e ainda pode checar a saúde de scripts locais (por exemplo, \"o HAProxy está respondendo?\") para baixar a prioridade e forçar a troca.", "The load balancer can fail too, and the classic pattern to protect it is a **virtual IP** (VIP) shared by two nodes. **VRRP** (*Virtual Router Redundancy Protocol*) elects a **master**, which announces it owns the VIP, and one or more **backups**. The master sends advertisement messages at short intervals, typically every second; if the messages stop, the highest-priority backup takes over the VIP and sends a gratuitous ARP to update neighbors' tables. On Linux, **keepalived** implements VRRP and can also check the health of local scripts (for example, \"is HAProxy responding?\") to lower priority and force the switch."]),
      code(`# /etc/keepalived/keepalived.conf (node 1, MASTER)
vrrp_script chk_haproxy {
    script "/usr/bin/pidof haproxy"
    interval 2
    fall 2
    rise 2
}

vrrp_instance VI_1 {
    state MASTER              # node 2 uses: state BACKUP
    interface eth0
    virtual_router_id 51
    priority 110              # node 2 uses a lower value, e.g. 100
    advert_int 1
    authentication { auth_type PASS  auth_pass s3cret }
    virtual_ipaddress { 10.0.0.100/24 }
    track_script { chk_haproxy }
}`),
      p(["Esse arranjo tem uma limitação: o VIP por ARP exige que os nós estejam na **mesma rede de camada 2**. Em nuvens públicas isso é substituído por mecanismos próprios: IPs elásticos que são remapeados por API, ou balanceadores gerenciados que já são redundantes entre zonas de disponibilidade.", "This arrangement has a limitation: an ARP-based VIP requires the nodes to be on the **same layer 2 network**. In public clouds this is replaced by their own mechanisms: elastic IPs remapped by API, or managed balancers that are already redundant across availability zones."]),
      h(["Failover por DNS e entre regiões", "DNS failover and cross-region"]),
      p(["Para falhas maiores (uma zona ou região inteira), o failover sobe para o **DNS** ou para o anycast. O serviço de DNS faz health checks nos endpoints de cada região e, quando o primário falha, passa a devolver o IP da região secundária. Exemplo: o Amazon Route 53 oferece registros de *failover* (primário e secundário) ligados a health checks, além de políticas de latência e ponderada. O limite é o **TTL**: resolvedores e navegadores guardam a resposta, e parte do tráfego continua indo ao destino morto até o cache expirar. Por isso se usam TTLs baixos (30 a 60 s) em registros com failover e, quando a velocidade importa, anycast ou balanceadores globais que não dependem de cache.", "For larger failures (a whole zone or region), failover moves up to **DNS** or anycast. The DNS service runs health checks on each region's endpoints and, when the primary fails, starts returning the secondary region's IP. Example: Amazon Route 53 offers *failover* records (primary and secondary) tied to health checks, besides latency and weighted policies. The limit is the **TTL**: resolvers and browsers cache the answer, and part of the traffic keeps going to the dead destination until the cache expires. That is why low TTLs (30 to 60 s) are used on failover records and, when speed matters, anycast or global balancers that do not depend on caching."]),
      fig(["Failover entre regiões por DNS com health check", "DNS-based cross-region failover with a health check"],
        [[node("u", ["Usuários", "Users"], "client")], [node("dns", ["DNS com health check", "DNS with health check"], "edge")], [node("r1", ["Região primária", "Primary region"], "service"), node("r2", ["Região secundária", "Secondary region"], "service")], [node("db1", ["Banco primário", "Primary DB"], "data"), node("db2", ["Réplica", "Replica"], "data")]],
        [edge("u", "dns"), edge("dns", "r1", ["normal", "normal"]), edge("dns", "r2", ["se r1 falhar", "if r1 fails"], { dashed: true }), edge("r1", "db1"), edge("r2", "db2"), edge("db1", "db2", ["replicação assíncrona", "async replication"], { dashed: true })]),
      h(["Failover de dados e a parte difícil", "Data failover and the hard part"]),
      p(["Trocar de servidor de aplicação é fácil porque ele não guarda nada que importe. Trocar o **banco de dados** é difícil porque a réplica precisa ter os mesmos dados. Com **replicação assíncrona**, o primário confirma a escrita antes de a réplica recebê-la: o failover é rápido, mas escritas recentes podem ser perdidas (o *RPO*, objetivo de ponto de recuperação, é maior que zero). Com **replicação síncrona**, o primário só confirma depois da réplica: não perde dados, mas cada escrita fica mais lenta e depende de a réplica estar viva. Há ainda o tempo para detectar a falha, promover a réplica e redirecionar as aplicações (o *RTO*, objetivo de tempo de recuperação). Ferramentas como Patroni (PostgreSQL), Orchestrator (MySQL) e o Sentinel do Redis automatizam essa promoção, decidindo por consenso quem é o novo primário.", "Swapping an application server is easy because it stores nothing that matters. Swapping the **database** is hard because the replica must have the same data. With **asynchronous replication**, the primary acknowledges the write before the replica receives it: failover is fast, but recent writes may be lost (the *RPO*, recovery point objective, is greater than zero). With **synchronous replication**, the primary only acknowledges after the replica: no data is lost, but each write is slower and depends on the replica being alive. There is also the time to detect the failure, promote the replica and redirect applications (the *RTO*, recovery time objective). Tools such as Patroni (PostgreSQL), Orchestrator (MySQL) and Redis Sentinel automate this promotion, deciding by consensus who is the new primary."]),
      p(["O pior risco é o **split-brain**: por uma partição de rede, a reserva acha que o primário morreu e se promove, enquanto o primário continua vivo. Dois nós aceitam escritas divergentes e os dados se corrompem. As defesas são **quórum** (só se promove com a maioria dos votos, daí o número ímpar de nós em sistemas de consenso como etcd e ZooKeeper) e **fencing** (isolar de forma forçada o antigo primário, por exemplo, desligando-o ou revogando seu acesso ao disco antes de promover o novo).", "The worst risk is **split-brain**: due to a network partition, the standby thinks the primary died and promotes itself while the primary is still alive. Two nodes accept divergent writes and data gets corrupted. The defenses are **quorum** (promote only with a majority of votes, hence the odd number of nodes in consensus systems such as etcd and ZooKeeper) and **fencing** (forcibly isolating the old primary, for example by powering it off or revoking its disk access before promoting the new one)."]),
      h(["Como os dois se combinam", "How the two combine"]),
      p(["Na prática, quase toda arquitetura confiável usa as duas ideias em camadas. O balanceador distribui entre instâncias de aplicação ativas em várias zonas (balanceamento com failover implícito). Os balanceadores são eles mesmos redundantes, por VIP ou por serviço gerenciado. Os dados ficam em um primário com réplicas que podem ser promovidas (failover). E, acima de tudo, um GSLB ou DNS decide a região. Cada camada tem o seu tempo de recuperação, de milissegundos (balanceador) a minutos (promoção de banco, DNS com TTL alto), e o serviço fica tão disponível quanto a camada mais lenta de se recuperar.", "In practice, almost every reliable architecture uses both ideas in layers. The balancer spreads across active application instances in several zones (balancing with implicit failover). The balancers are themselves redundant, via VIP or a managed service. Data sits in a primary with replicas that can be promoted (failover). And on top, a GSLB or DNS decides the region. Each layer has its own recovery time, from milliseconds (balancer) to minutes (database promotion, DNS with a high TTL), and the service is only as available as the slowest layer to recover."]),
      h(["Cuidados", "Pitfalls"]),
      ul(
        ["**Failover em cascata**: a carga da cópia que morreu derruba a seguinte, e assim por diante. Mitigue com folga de capacidade (N+1), limites de taxa, filas e disjuntores (*circuit breakers*).", "**Cascading failover**: the load from the dead copy knocks over the next one, and so on. Mitigate with spare capacity (N+1), rate limits, queues and circuit breakers."],
        ["**Standby frio ou nunca testado**: a reserva existe, mas está desatualizada, com cache vazio ou com a configuração antiga. Prefira *warm standby* e faça simulações regulares (*game days*, *chaos engineering*).", "**Cold or never-tested standby**: the standby exists but is outdated, has an empty cache or old configuration. Prefer *warm standby* and run regular drills (*game days*, *chaos engineering*)."],
        ["**Split-brain**: dois primários ao mesmo tempo. Use quórum e fencing.", "**Split-brain**: two primaries at once. Use quorum and fencing."],
        ["**Detecção agressiva demais**: um health check sensível causa failovers espúrios (*flapping*) em cada soluço de rede. Exija várias falhas seguidas e use histerese.", "**Overly aggressive detection**: a sensitive health check causes spurious failovers (*flapping*) at every network hiccup. Require several consecutive failures and use hysteresis."],
        ["**Failback**: voltar ao primário original também é um evento de risco; automatize com cautela, ou deixe o antigo primário virar a nova réplica.", "**Failback**: returning to the original primary is also a risky event; automate with care, or let the old primary become the new replica."],
        ["**Dependência escondida**: a reserva está em outra máquina, mas no mesmo rack, na mesma zona ou no mesmo provedor de DNS. Revise domínios de falha.", "**Hidden dependency**: the standby is on another machine, but in the same rack, the same zone or the same DNS provider. Review failure domains."],
      ),
      h(["Quando usar cada um", "When to use each"]),
      ul(
        ["**Camadas sem estado** (APIs, front-ends, workers): ativo-ativo atrás de balanceador, em pelo menos duas zonas.", "**Stateless tiers** (APIs, front ends, workers): active-active behind a balancer, in at least two zones."],
        ["**Componentes com estado único** (banco primário, agendador, líder): ativo-passivo com promoção automática e quórum, ou um sistema de consenso.", "**Single-state components** (primary database, scheduler, leader): active-passive with automatic promotion and quorum, or a consensus system."],
        ["**Entrada do tráfego** (balanceador, firewall): par com VIP, ou serviço gerenciado multi-zona.", "**Traffic entry** (balancer, firewall): a pair with a VIP, or a multi-zone managed service."],
        ["**Desastres regionais**: DNS/GSLB com região secundária, avaliando RPO e RTO que o negócio aceita.", "**Regional disasters**: DNS/GSLB with a secondary region, weighing the RPO and RTO the business accepts."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Balanceamento reparte trabalho entre cópias saudáveis; failover assume quando a cópia ativa morre.", "Balancing splits work among healthy copies; failover takes over when the active copy dies."],
        ["Ativo-ativo usa todo o hardware e exige folga N+1; ativo-passivo deixa a reserva ociosa, mas protege o que tem estado.", "Active-active uses all the hardware and demands N+1 headroom; active-passive leaves the standby idle but protects what holds state."],
        ["VRRP/keepalived move um IP virtual entre nós; DNS e GSLB movem o tráfego entre regiões, limitados pelo TTL.", "VRRP/keepalived moves a virtual IP between nodes; DNS and GSLB move traffic across regions, limited by TTL."],
        ["O difícil é o estado: replicação, RPO, RTO, split-brain, quórum e fencing.", "The hard part is state: replication, RPO, RTO, split-brain, quorum and fencing."],
        ["Teste o failover regularmente; um failover nunca testado é uma esperança, não um recurso.", "Test failover regularly; an untested failover is a hope, not a feature."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Um balanceador já garante alta disponibilidade?** Para a camada que ele balanceia, sim, se houver capacidade de sobra e ele mesmo for redundante. Não protege o banco nem o próprio balanceador sozinho.", "**Does a balancer already guarantee high availability?** For the tier it balances, yes, if there is spare capacity and it is itself redundant. It protects neither the database nor itself on its own."],
        ["**Qual a diferença entre RPO e RTO?** RPO é quanto dado (em tempo) você aceita perder; RTO é quanto tempo você aceita ficar fora do ar.", "**What is the difference between RPO and RTO?** RPO is how much data (in time) you accept losing; RTO is how long you accept being down."],
        ["**Posso usar ativo-ativo em banco de dados?** Sim, com replicação multimestre ou bancos distribuídos, mas surgem conflitos de escrita e consistência; por isso o padrão ainda é primário e réplicas.", "**Can I run a database active-active?** Yes, with multi-master replication or distributed databases, but write conflicts and consistency issues arise; that is why primary plus replicas is still the default."],
        ["**O TTL baixo resolve o failover de DNS?** Ajuda, mas não elimina: alguns resolvedores e aplicações ignoram TTLs curtos e mantêm conexões abertas ao destino antigo.", "**Does a low TTL solve DNS failover?** It helps, but does not eliminate the issue: some resolvers and applications ignore short TTLs and keep connections open to the old destination."],
      ),
      tip(["Modelo mental: balanceie as camadas sem estado (ativo-ativo) e faça failover das camadas com estado (primário e réplica, ou consenso). Quase toda arquitetura confiável é essa combinação.", "Mental model: balance the stateless layers (active-active) and fail over the stateful ones (primary and replica, or consensus). Nearly every reliable architecture is this combination."]),
    ] },

  { id: "concorrencia-e-paralelismo", section: "balanceamento", level: 2, icon: "memory", minutes: 14,
    title: ["Concorrência e paralelismo", "Concurrency and parallelism"],
    summary: ["Threads, processos, event loop, async/await, atores, locks e os bugs clássicos (race condition, deadlock) que só aparecem sob carga, com exemplos de código.", "Threads, processes, event loop, async/await, actors, locks and the classic bugs (race condition, deadlock) that only show up under load, with code examples."],
    body: [
      p(["Um servidor atende milhares de clientes ao mesmo tempo, mas tem poucos núcleos. Entender como o trabalho é intercalado dentro de uma máquina é o complemento natural de distribuí-lo entre máquinas: o balanceador reparte pedidos entre servidores, e cada servidor precisa repartir esses pedidos entre suas threads, processos ou tarefas. Este artigo mostra os modelos de execução, os problemas que surgem quando duas linhas de execução tocam o mesmo dado e as ferramentas para lidar com eles. Muitos bugs que \"só aparecem em produção\" têm origem aqui.", "A server serves thousands of clients at once, but has few cores. Understanding how work is interleaved inside a machine is the natural companion to distributing it across machines: the balancer splits requests among servers, and each server must split those requests among its threads, processes or tasks. This article shows the execution models, the problems that arise when two lines of execution touch the same data and the tools to deal with them. Many bugs that \"only show up in production\" originate here."]),
      h(["Concorrência x paralelismo", "Concurrency vs parallelism"]),
      p(["**Concorrência** é *lidar com* várias coisas ao mesmo tempo: estruturar o programa para que várias tarefas progridam de forma intercalada, mesmo em um único núcleo (um garçom atendendo várias mesas, anotando um pedido enquanto a cozinha prepara outro). **Paralelismo** é *executar* várias coisas ao mesmo tempo, de fato, em núcleos diferentes (vários garçons). Concorrência é sobre estrutura; paralelismo é sobre execução. Um sistema pode ser concorrente sem ser paralelo (o Node.js em um núcleo), paralelo sem muita concorrência (um laço matemático dividido em quatro núcleos) ou ambos.", "**Concurrency** is *dealing with* many things at once: structuring the program so that several tasks progress interleaved, even on a single core (one waiter serving several tables, taking one order while the kitchen prepares another). **Parallelism** is *executing* many things at once, truly, on different cores (several waiters). Concurrency is about structure; parallelism is about execution. A system can be concurrent without being parallel (Node.js on one core), parallel without much concurrency (a math loop split over four cores) or both."]),
      p(["Antes de escolher um modelo, classifique a carga. **I/O-bound** (espera rede, disco, banco de dados): a CPU fica ociosa quase todo o tempo, então vale ter muitas tarefas em espera simultânea, o que a concorrência resolve bem. **CPU-bound** (criptografia, compressão, codificação de vídeo, cálculo): só mais núcleos ajudam, e ter mais threads que núcleos traz apenas troca de contexto. Uma regra de partida: para I/O, o número de tarefas pode ser enorme; para CPU, use algo próximo ao número de núcleos. A **Lei de Amdahl** lembra que o ganho tem teto: se 10% do programa é sequencial, nunca se passa de 10 vezes mais rápido, por mais núcleos que existam.", "Before picking a model, classify the workload. **I/O-bound** (waits on network, disk, database): the CPU sits idle most of the time, so it pays to have many tasks waiting simultaneously, which concurrency handles well. **CPU-bound** (cryptography, compression, video encoding, math): only more cores help, and having more threads than cores just adds context switching. A starting rule: for I/O, the number of tasks can be huge; for CPU, use something close to the number of cores. **Amdahl's law** reminds us that the gain has a ceiling: if 10% of the program is sequential, you never exceed 10 times faster, however many cores exist."]),
      h(["Threads e processos", "Threads and processes"]),
      p(["Um **processo** é um programa em execução com seu próprio espaço de memória, isolado dos outros: um que trava não derruba os demais, e a comunicação exige mecanismos explícitos (pipes, sockets, memória compartilhada). Uma **thread** é uma linha de execução dentro de um processo, que **compartilha a memória** com as outras threads do mesmo processo: criar e trocar entre threads é mais barato, e a comunicação é direta (basta ler e escrever a mesma variável), mas é aí que nascem as corridas de dados. O sistema operacional agenda as threads nos núcleos e as alterna (**troca de contexto**) a cada poucos milissegundos, ou quando uma bloqueia em I/O. Linguagens como Python (com o GIL no CPython tradicional) limitam o paralelismo real entre threads de CPU, e por isso usam múltiplos processos para isso.", "A **process** is a running program with its own memory space, isolated from others: one that crashes does not take the others down, and communication requires explicit mechanisms (pipes, sockets, shared memory). A **thread** is a line of execution inside a process, which **shares memory** with the other threads of the same process: creating and switching between threads is cheaper, and communication is direct (just read and write the same variable), but that is where data races are born. The operating system schedules threads on cores and switches them (**context switch**) every few milliseconds, or when one blocks on I/O. Languages like Python (with the GIL in traditional CPython) limit true parallelism between CPU threads, and therefore use multiple processes for that."]),
      h(["Modelos de execução em servidores", "Execution models in servers"]),
      fig(["Três formas de atender muitas conexões", "Three ways to serve many connections"],
        [[node("cl", ["Conexões", "Connections"], "client")], [node("m1", ["Thread por pedido", "Thread per request"], "service"), node("m2", ["Pool de threads + fila", "Thread pool + queue"], "queue"), node("m3", ["Event loop (1 thread)", "Event loop (1 thread)"], "service")], [node("io", ["Rede, disco, banco", "Network, disk, database"], "data")]],
        [edge("cl", "m1"), edge("cl", "m2"), edge("cl", "m3"), edge("m1", "io", ["bloqueia", "blocks"]), edge("m2", "io", ["bloqueia", "blocks"]), edge("m3", "io", ["não bloqueia", "non-blocking"], { dashed: true })]),
      ul(
        ["**Uma thread (ou processo) por requisição**: o modelo clássico (Apache prefork, servlets Java tradicionais). Código simples e linear, mas cada thread custa memória (cerca de 1 MB de pilha por padrão em muitas plataformas) e o escalonador sofre com dezenas de milhares delas.", "**One thread (or process) per request**: the classic model (Apache prefork, traditional Java servlets). Simple, linear code, but each thread costs memory (around 1 MB of stack by default on many platforms) and the scheduler struggles with tens of thousands of them."],
        ["**Pool de threads**: um número fixo de threads consome uma fila de tarefas. Limita o uso de recursos e dá **contrapressão** (a fila enche e o sistema pode recusar trabalho), mas, se todas as threads bloqueiam esperando o mesmo recurso lento, o servidor para (esgotamento do pool).", "**Thread pool**: a fixed number of threads consumes a task queue. It bounds resource use and gives **backpressure** (the queue fills and the system can refuse work), but if all threads block waiting on the same slow resource, the server stops (pool exhaustion)."],
        ["**Event loop** (Node.js, NGINX, Redis, Netty): uma thread monitora milhares de conexões com `epoll` (Linux) ou `kqueue` (BSD/macOS) e só trabalha quando há algo pronto. Muito eficiente em I/O, porém **uma operação que bloqueia ou calcula demais trava todos os clientes**. É por isso que o Redis executa comandos em uma thread e se evita comandos lentos como `KEYS *` em produção, e que o Node.js envia tarefas pesadas para *worker threads* ou processos separados.", "**Event loop** (Node.js, NGINX, Redis, Netty): one thread watches thousands of connections via `epoll` (Linux) or `kqueue` (BSD/macOS) and only works when something is ready. Very efficient for I/O, but **one blocking or heavy operation freezes every client**. That is why Redis runs commands on one thread and slow commands like `KEYS *` are avoided in production, and why Node.js sends heavy tasks to *worker threads* or separate processes."],
        ["**Async/await e corrotinas**: sintaxe linear sobre um event loop (JavaScript, Python `asyncio`, Kotlin, C#). Uma função `async` pode ser suspensa em cada `await`, devolvendo o controle ao loop até a operação terminar. Corrotinas são cooperativas: só cedem a vez nos pontos de espera, o que torna muitas corridas impossíveis em um loop de uma thread, mas **não elimina** as que atravessam um `await`.", "**Async/await and coroutines**: linear syntax over an event loop (JavaScript, Python `asyncio`, Kotlin, C#). An `async` function can be suspended at each `await`, handing control back to the loop until the operation finishes. Coroutines are cooperative: they only yield at wait points, which makes many races impossible in a single-thread loop, but **does not eliminate** those that span an `await`."],
        ["**Threads leves**: goroutines do Go, *virtual threads* do Java 21 e processos do Erlang custam alguns KB e permitem milhões de tarefas com código bloqueante simples, escalonadas pela linguagem sobre poucas threads do sistema.", "**Lightweight threads**: Go goroutines, Java 21 *virtual threads* and Erlang processes cost a few KB and allow millions of tasks with simple blocking-style code, scheduled by the runtime over a few OS threads."],
        ["**Atores e passagem de mensagens**: cada ator tem estado privado e se comunica apenas por mensagens, processadas uma de cada vez (Akka, Erlang/Elixir, Orleans). Sem memória compartilhada, não há locks; o lema do Go é parecido: *não se comunique compartilhando memória; compartilhe memória comunicando-se*.", "**Actors and message passing**: each actor has private state and communicates only by messages, processed one at a time (Akka, Erlang/Elixir, Orleans). With no shared memory, there are no locks; Go's motto is similar: *do not communicate by sharing memory; share memory by communicating*."],
      ),
      code(`// Concurrency (not parallelism): one thread, three requests in flight
async function handle(userId: string): Promise<string> {
  const [profile, orders] = await Promise.all([   // both I/O waits overlap
    fetch("/profile/" + userId).then((r) => r.text()),
    fetch("/orders/" + userId).then((r) => r.text()),
  ]);
  return profile + orders;
}

// Parallelism: CPU work needs other cores (Node.js worker thread)
import { Worker } from "node:worker_threads";
const w = new Worker("./hash-worker.js", { workerData: { input: "big payload" } });
w.on("message", (digest) => console.log(digest));`),
      table([["Modelo", "Model"], ["Ponto forte", "Strength"], ["Ponto fraco", "Weakness"], ["Bom para", "Good for"]],
        [["Thread por pedido", "Thread per request"], ["Código simples", "Simple code"], ["Memória e troca de contexto", "Memory and context switching"], ["Centenas de conexões, lógica pesada", "Hundreds of connections, heavy logic"]],
        [["Pool de threads", "Thread pool"], ["Recursos limitados, contrapressão", "Bounded resources, backpressure"], ["Esgotamento do pool", "Pool exhaustion"], ["Serviços Java/.NET clássicos", "Classic Java/.NET services"]],
        [["Event loop", "Event loop"], ["Dezenas de milhares de conexões ociosas", "Tens of thousands of idle connections"], ["Um bloqueio trava tudo", "One block freezes everything"], ["Proxies, APIs com muito I/O", "Proxies, I/O-heavy APIs"]],
        [["Threads leves", "Lightweight threads"], ["Escala e código linear", "Scale and linear code"], ["Depende do runtime", "Depends on the runtime"], ["Go, Erlang, Java 21", "Go, Erlang, Java 21"]],
        [["Atores", "Actors"], ["Sem locks, isolamento de falhas", "No locks, fault isolation"], ["Mais difícil de raciocinar sobre o todo", "Harder to reason about the whole"], ["Sistemas distribuídos de longa vida", "Long-lived distributed systems"]]),
      h(["Estado compartilhado: o que dá errado", "Shared state: what goes wrong"]),
      p(["O perigo surge quando duas linhas de execução mexem no mesmo dado. Uma **condição de corrida** (*race condition*) acontece quando o resultado depende da ordem, não controlada, em que elas se intercalam. O exemplo clássico é incrementar um contador, que é na verdade três passos: ler, somar 1, escrever. Se duas threads leem 5 ao mesmo tempo, ambas escrevem 6 e uma atualização se perde. O mesmo vale entre servidores: dois pedidos leem o estoque (1 unidade), cada um vê \"há 1\" e ambos vendem. Esse padrão, **ler-modificar-escrever**, deve ser tratado como suspeito em qualquer código concorrente.", "The danger arises when two lines of execution touch the same data. A **race condition** happens when the result depends on the uncontrolled order in which they interleave. The classic example is incrementing a counter, which is really three steps: read, add 1, write. If two threads read 5 at the same time, both write 6 and one update is lost. The same applies across servers: two requests read the stock (1 unit), each sees \"there is 1\" and both sell it. This **read-modify-write** pattern should be treated as suspect in any concurrent code."]),
      code(`thread A: reads counter (5)            thread B: reads counter (5)
thread A: writes 6                     thread B: writes 6     <- should be 7`),
      code(`// The same bug at the async level: the race crosses an await
let stock = 1;
async function buy(): Promise<boolean> {
  if (stock > 0) {                       // check
    await chargeCard();                  // another request runs here
    stock -= 1;                          // act: may go to -1
    return true;
  }
  return false;
}
// Fix: reserve first (stock -= 1 before the await) or use a conditional DB update:
// UPDATE items SET qty = qty - 1 WHERE id = $1 AND qty > 0   (check rows affected)`),
      h(["Ferramentas de sincronização", "Synchronization tools"]),
      ul(
        ["**Mutex** (*mutual exclusion*) e **locks**: só uma thread entra na **seção crítica** por vez. Corrigem a corrida, mas introduzem espera (contenção) e o risco de deadlock. Mantenha as seções curtas e nunca chame código externo ou faça I/O dentro delas.", "**Mutex** (*mutual exclusion*) and **locks**: only one thread enters the **critical section** at a time. They fix the race, but add waiting (contention) and the risk of deadlock. Keep sections short and never call external code or do I/O inside them."],
        ["**Semáforo**: um contador de permissões que permite até *k* acessos simultâneos (um pool de conexões com 10 vagas é um semáforo de 10). O mutex é o caso particular com *k* = 1.", "**Semaphore**: a permit counter that allows up to *k* simultaneous accesses (a connection pool with 10 slots is a semaphore of 10). The mutex is the special case with *k* = 1."],
        ["**Lock de leitura e escrita** (*read-write lock*): muitos leitores simultâneos ou um único escritor. Vale quando as leituras dominam.", "**Read-write lock**: many simultaneous readers or a single writer. Worth it when reads dominate."],
        ["**Variáveis de condição e filas bloqueantes**: permitem esperar até que algo aconteça (um item na fila) sem gastar CPU, base do padrão produtor-consumidor.", "**Condition variables and blocking queues**: allow waiting until something happens (an item in the queue) without burning CPU, the basis of the producer-consumer pattern."],
        ["**Operações atômicas e CAS** (*compare-and-swap*): \"troque 5 por 6 apenas se o valor ainda for 5\", executado como uma única instrução do processador. Sem lock, rápido, ideal para contadores e flags. No banco de dados, o equivalente é o `UPDATE ... WHERE qtd > 0` condicional ou o *lock otimista* com coluna de versão.", "**Atomic operations and CAS** (*compare-and-swap*): \"swap 5 for 6 only if the value is still 5\", executed as a single processor instruction. Lock-free, fast, ideal for counters and flags. In a database, the equivalent is the conditional `UPDATE ... WHERE qty > 0` or *optimistic locking* with a version column."],
      ),
      code(`// A tiny async mutex: serializes critical sections in an event loop
class Mutex {
  private tail: Promise<void> = Promise.resolve();
  lock(): Promise<() => void> {
    let release!: () => void;
    const next = new Promise<void>((res) => (release = res));
    const acquired = this.tail.then(() => release);
    this.tail = this.tail.then(() => next);
    return acquired;
  }
}

const m = new Mutex();
async function safeBuy() {
  const unlock = await m.lock();
  try { await buy(); } finally { unlock(); }     // always release
}

// Lock-free counter shared by worker threads: Atomics on a SharedArrayBuffer
const counter = new Int32Array(new SharedArrayBuffer(4));
Atomics.add(counter, 0, 1);                       // atomic read-modify-write
// compare-and-swap: Atomics.compareExchange(counter, 0, expected, desired)`),
      h(["Deadlock e as quatro condições de Coffman", "Deadlock and the four Coffman conditions"]),
      p(["O **deadlock** é a situação em que duas ou mais tarefas ficam bloqueadas para sempre, cada uma esperando um recurso que outra segura. Exemplo: a thread A segura o lock 1 e espera o 2; a thread B segura o 2 e espera o 1; ninguém avança. O sistema não trava com erro: simplesmente para de responder, e só uma análise de *thread dump* mostra quem espera quem. Em 1971, Coffman e colegas mostraram que o deadlock exige **quatro condições simultâneas**:", "**Deadlock** is the situation in which two or more tasks are blocked forever, each waiting for a resource another one holds. Example: thread A holds lock 1 and waits for 2; thread B holds 2 and waits for 1; nobody advances. The system does not fail with an error: it simply stops responding, and only a *thread dump* analysis shows who waits for whom. In 1971, Coffman and colleagues showed that deadlock requires **four simultaneous conditions**:"]),
      ul(
        ["**Exclusão mútua**: o recurso só pode ser usado por uma tarefa por vez.", "**Mutual exclusion**: the resource can only be used by one task at a time."],
        ["**Posse e espera** (*hold and wait*): a tarefa segura um recurso enquanto espera por outro.", "**Hold and wait**: the task holds one resource while waiting for another."],
        ["**Não preempção**: o recurso só é liberado voluntariamente por quem o segura; ninguém pode tomá-lo à força.", "**No preemption**: the resource is only released voluntarily by its holder; nobody can take it by force."],
        ["**Espera circular**: existe um ciclo de tarefas, cada uma esperando um recurso da próxima.", "**Circular wait**: there is a cycle of tasks, each waiting for a resource held by the next."],
      ),
      fig(["Deadlock: ciclo de espera entre duas threads e dois locks", "Deadlock: wait cycle between two threads and two locks"],
        [[node("ta", ["Thread A", "Thread A"], "service")], [node("l1", ["Lock 1", "Lock 1"], "data"), node("l2", ["Lock 2", "Lock 2"], "data")], [node("tb", ["Thread B", "Thread B"], "service")]],
        [edge("l1", "ta", ["A segura", "A holds"]), edge("ta", "l2", ["A espera", "A waits"], { dashed: true }), edge("l2", "tb", ["B segura", "B holds"]), edge("tb", "l1", ["B espera", "B waits"], { dashed: true })]),
      p(["Basta quebrar **uma** das condições para impedir o deadlock. Na prática, a mais fácil é a espera circular: imponha uma **ordem global** de aquisição (sempre o lock 1 antes do 2). Outras defesas: adquirir todos os locks de uma vez ou nenhum, usar `tryLock` com **tempo limite** e desistir (liberando o que já tem), reduzir a quantidade de locks e evitar chamadas externas dentro da seção crítica. Bancos de dados detectam ciclos de espera entre transações e abortam uma delas (a vítima), o que obriga a aplicação a repetir a transação. Primos do deadlock: o **livelock** (todas as tarefas cedem uma à outra e ficam em movimento sem progresso, como duas pessoas desviando para o mesmo lado em um corredor) e a **starvation** (uma tarefa nunca consegue a vez porque outras sempre têm prioridade).", "Breaking **one** of the conditions is enough to prevent deadlock. In practice the easiest is circular wait: impose a **global order** of acquisition (always lock 1 before 2). Other defenses: acquire all locks at once or none, use `tryLock` with a **timeout** and give up (releasing what it holds), reduce the number of locks and avoid external calls inside the critical section. Databases detect wait cycles between transactions and abort one (the victim), which forces the application to retry the transaction. Cousins of deadlock: **livelock** (all tasks yield to each other and stay busy without progress, like two people dodging to the same side in a corridor) and **starvation** (a task never gets its turn because others always have priority)."]),
      code(`// Deadlock-prone: opposite orders
//   A: lock(x); lock(y);        B: lock(y); lock(x);
// Fixed: a global order (here, by id) for every caller
async function transfer(from: Account, to: Account, amount: number) {
  const [first, second] = from.id < to.id ? [from, to] : [to, from];
  const u1 = await first.mutex.lock();
  const u2 = await second.mutex.lock();
  try { from.balance -= amount; to.balance += amount; }
  finally { u2(); u1(); }
}`),
      h(["Estruturas lock-free e como evitar estado compartilhado", "Lock-free structures and avoiding shared state"]),
      p(["Estruturas **lock-free** (sem trava) usam operações atômicas como CAS em vez de locks: se a tentativa falha porque outra thread mudou o valor, repete-se o laço com o novo valor. Garantem que *alguma* thread sempre progride (nenhuma fica parada por causa de uma thread suspensa segurando um lock), e aparecem em filas e pilhas concorrentes, em contadores e na `ConcurrentHashMap` do Java. São difíceis de escrever corretamente (problema ABA, ordenação de memória), então use as implementações da biblioteca-padrão em vez de criar as suas. Existem ainda as estruturas **wait-free**, que garantem progresso de todas as threads, mais raras. Um exemplo clássico é a fila do padrão *LMAX Disruptor* (um *ring buffer* com um único escritor), usada em negociação de baixa latência.", "**Lock-free** structures use atomic operations such as CAS instead of locks: if the attempt fails because another thread changed the value, the loop repeats with the new value. They guarantee that *some* thread always progresses (none is stalled by a suspended thread holding a lock), and appear in concurrent queues and stacks, counters and Java's `ConcurrentHashMap`. They are hard to write correctly (the ABA problem, memory ordering), so use the standard library implementations instead of building your own. There are also **wait-free** structures, which guarantee progress for every thread, rarer still. A classic example is the *LMAX Disruptor* pattern (a *ring buffer* with a single writer), used in low-latency trading."]),
      code(`// CAS loop: lock-free "add if below limit" using Atomics
function addCapped(cell: Int32Array, delta: number, cap: number): boolean {
  while (true) {
    const cur = Atomics.load(cell, 0);
    if (cur + delta > cap) return false;
    if (Atomics.compareExchange(cell, 0, cur, cur + delta) === cur) return true;
    // someone else changed it: retry with the fresh value
  }
}`),
      p(["O jeito mais seguro de lidar com tudo isso é **evitar estado compartilhado mutável**: dados imutáveis; uma única thread ou ator dono de cada dado (como as filas por chave do Kafka, que garantem ordem dentro de uma partição); comunicação por canais e mensagens; e delegar ao banco de dados, com transações e restrições, o papel de árbitro final. Entre servidores, locks distribuídos (Redis `SET NX PX`, ZooKeeper, etcd) existem, mas são frágeis frente a pausas de processo e relógios dessincronizados: prefira operações **idempotentes** (repetir não causa dano) e **escritas condicionais** (com versão ou `WHERE`).", "The safest way to deal with all this is to **avoid shared mutable state**: immutable data; a single thread or actor owning each piece of data (such as Kafka's per-key queues, which guarantee order within a partition); communication by channels and messages; and delegating to the database, with transactions and constraints, the role of final arbiter. Across servers, distributed locks (Redis `SET NX PX`, ZooKeeper, etcd) exist but are fragile against process pauses and unsynchronized clocks: prefer **idempotent** operations (repeating does no harm) and **conditional writes** (with a version or `WHERE`)."]),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Bloquear o event loop com cálculo pesado, `JSON.parse` de um corpo gigante ou uma chamada síncrona de disco.", "Blocking the event loop with heavy computation, `JSON.parse` of a giant body or a synchronous disk call."],
        ["Criar threads sem limite: sob pico, o servidor esgota memória. Use pools com fila limitada.", "Creating threads without limit: at peak, the server runs out of memory. Use pools with a bounded queue."],
        ["Fazer chamadas de rede dentro de um lock: um serviço lento transforma o lock em fila para todos.", "Making network calls inside a lock: one slow service turns the lock into a queue for everyone."],
        ["Achar que `async` é paralelo: duas funções `async` em um loop de uma thread se alternam, não rodam ao mesmo tempo.", "Assuming `async` means parallel: two `async` functions on a one-thread loop alternate, they do not run at the same time."],
        ["Testar só com um usuário: corridas aparecem sob carga. Use testes de estresse e detectores (ThreadSanitizer, `go test -race`).", "Testing only with one user: races appear under load. Use stress tests and detectors (ThreadSanitizer, `go test -race`)."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Concorrência é estrutura (muitas tarefas em progresso); paralelismo é execução simultânea em vários núcleos.", "Concurrency is structure (many tasks in progress); parallelism is simultaneous execution on several cores."],
        ["I/O-bound pede concorrência (event loop, async, threads leves); CPU-bound pede paralelismo, com um número de threads perto do de núcleos.", "I/O-bound work calls for concurrency (event loop, async, lightweight threads); CPU-bound work calls for parallelism, with a thread count near the number of cores."],
        ["Race condition nasce do ler-modificar-escrever sem proteção; corrija com mutex, atômicos, CAS ou escritas condicionais no banco.", "A race condition comes from unprotected read-modify-write; fix with mutexes, atomics, CAS or conditional writes in the database."],
        ["Deadlock exige as quatro condições de Coffman; quebre uma, normalmente impondo ordem de aquisição ou usando tempo limite.", "Deadlock requires the four Coffman conditions; break one, usually by imposing acquisition order or using timeouts."],
        ["O melhor lock é o que não existe: dados imutáveis, donos únicos e passagem de mensagens.", "The best lock is the one that does not exist: immutable data, single owners and message passing."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Node.js é single-thread, então não tem race condition?** Tem, nas operações que cruzam um `await` e entre processos ou servidores que compartilham banco e cache.", "**Node.js is single-threaded, so no race conditions?** It has them, in operations that cross an `await` and across processes or servers sharing a database and cache."],
        ["**Quantas threads devo usar em um pool?** Para CPU, cerca do número de núcleos; para I/O bloqueante, mais, calculado pela razão entre tempo de espera e tempo de computação. Meça.", "**How many threads should a pool use?** For CPU, about the number of cores; for blocking I/O, more, computed from the ratio of wait time to compute time. Measure."],
        ["**Qual a diferença entre mutex e semáforo?** O mutex permite um por vez e normalmente tem dono (quem trava, destrava); o semáforo permite até *k* e qualquer tarefa pode liberar uma permissão.", "**What is the difference between a mutex and a semaphore?** A mutex allows one at a time and normally has an owner (whoever locks, unlocks); a semaphore allows up to *k* and any task may release a permit."],
        ["**Lock-free é sempre mais rápido?** Não. Sob baixa contenção a diferença é pequena e o código é mais difícil; sob alta contenção, laços de CAS também podem competir e repetir muito.", "**Is lock-free always faster?** No. Under low contention the difference is small and the code is harder; under high contention, CAS loops can also compete and retry a lot."],
      ),
      tip(["Bugs de concorrência raramente aparecem em teste com um usuário. Rode testes de carga, use detectores de corrida e trate toda leitura-modificação-escrita como suspeita.", "Concurrency bugs rarely show up in single-user tests. Run load tests, use race detectors and treat every read-modify-write as suspect."]),
    ] },

];

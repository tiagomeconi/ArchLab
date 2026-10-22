import { h, p, ul, tip, code, table, fig, node, edge, type DocArticle } from "./kit";

/** Seção "rede". */
export const ARTICLES: DocArticle[] = [
  { id: "protocolos-de-comunicacao", section: "rede", level: 0, icon: "lan", minutes: 14,
    title: ["Protocolos de comunicação: de TCP a HTTP/3", "Communication protocols: from TCP to HTTP/3"],
    summary: ["Camadas, TCP x UDP, a evolução do HTTP, QUIC, TLS, gRPC e GraphQL.", "Layers, TCP vs UDP, the evolution of HTTP, QUIC, TLS, gRPC and GraphQL."],
    body: [
      p(["Dois programas em máquinas diferentes só conseguem conversar se concordarem sobre muita coisa: como os bits viajam pelo cabo ou pelo ar, como achar a máquina certa entre bilhões, o que fazer quando um pacote se perde, como saber se quem responde é quem diz ser e, por fim, o que significa cada mensagem. Ninguém resolve tudo isso de uma vez. A solução da engenharia de redes foi dividir o problema em **camadas**: cada uma resolve uma parte, oferece um serviço simples para a de cima e esconde os detalhes da de baixo. Um navegador não sabe se o Wi-Fi usa 2,4 ou 5 GHz, e o Wi-Fi não sabe se o que carrega é uma página, um vídeo ou uma transferência bancária.", "Two programs on different machines can only talk if they agree on a lot: how bits travel over the cable or the air, how to find the right machine among billions, what to do when a packet is lost, how to know whether the one answering is who it claims to be and, finally, what each message means. Nobody solves all of that at once. Network engineering split the problem into **layers**: each one solves one part, offers a simple service to the layer above and hides the details of the one below. A browser does not know whether Wi-Fi uses 2.4 or 5 GHz, and Wi-Fi does not know whether it is carrying a page, a video or a bank transfer."]),
      p(["Para quem projeta sistemas, entender esses protocolos não é erudição: é o que explica por que uma chamada demora 150 ms em vez de 5, por que um balanceador devolve erros 502 esporádicos, por que o vídeo congela mas a chamada de voz não, e por que o HTTP/3 existe. Este artigo percorre a pilha de baixo para cima e termina nas escolhas de protocolo de aplicação que você faz no dia a dia.", "For someone designing systems, understanding these protocols is not erudition: it explains why a call takes 150 ms instead of 5, why a load balancer returns sporadic 502 errors, why video freezes but a voice call does not, and why HTTP/3 exists. This article walks the stack from bottom to top and ends with the application protocol choices you make day to day."]),

      h(["O modelo em camadas: OSI e TCP/IP", "The layered model: OSI and TCP/IP"]),
      p(["O modelo de referência **OSI** descreve sete camadas: física, enlace, rede, transporte, sessão, apresentação e aplicação. Na internet real vale o modelo **TCP/IP**, mais enxuto, com quatro: **enlace** (Ethernet, Wi-Fi), **internet** (IP), **transporte** (TCP, UDP) e **aplicação** (HTTP, DNS, SMTP, gRPC). As camadas de sessão e apresentação do OSI foram absorvidas pela aplicação. O TLS fica num lugar curioso, entre o transporte e a aplicação, e por isso aparece nos diagramas como uma camada à parte.", "The **OSI** reference model describes seven layers: physical, data link, network, transport, session, presentation and application. On the real internet the leaner **TCP/IP** model applies, with four: **link** (Ethernet, Wi-Fi), **internet** (IP), **transport** (TCP, UDP) and **application** (HTTP, DNS, SMTP, gRPC). OSI's session and presentation layers were absorbed by the application. TLS sits in a curious place, between transport and application, which is why it shows up in diagrams as a layer of its own."]),
      fig(["Pilha de protocolos de uma requisição HTTPS", "Protocol stack of an HTTPS request"],
        [[node("app", ["Aplicação\nHTTP, gRPC, DNS", "Application\nHTTP, gRPC, DNS"], "client")],
         [node("tls", ["Segurança\nTLS", "Security\nTLS"], "edge")],
         [node("tr", ["Transporte\nTCP ou UDP", "Transport\nTCP or UDP"], "service")],
         [node("ip", ["Internet\nIP", "Internet\nIP"], "queue")],
         [node("lk", ["Enlace\nEthernet, Wi-Fi", "Link\nEthernet, Wi-Fi"], "data")]],
        [edge("app", "tls", ["bytes", "bytes"]), edge("tls", "tr", ["cifrado", "encrypted"]), edge("tr", "ip", ["segmentos", "segments"]), edge("ip", "lk", ["pacotes", "packets"])]),
      p(["Na prática, cada camada **encapsula** a de cima: o HTTP produz uma mensagem, o TLS a cifra em registros, o TCP a corta em segmentos numerados, o IP coloca cada segmento num pacote com origem e destino e o enlace o transforma em quadros. No destino o caminho se inverte. Cada camada acrescenta um cabeçalho (20 bytes no IPv4, 20 ou mais no TCP), o que explica por que mensagens minúsculas têm custo proporcionalmente alto.", "In practice each layer **encapsulates** the one above: HTTP produces a message, TLS encrypts it into records, TCP cuts it into numbered segments, IP puts each segment in a packet with source and destination and the link layer turns it into frames. At the destination the path is reversed. Each layer adds a header (20 bytes for IPv4, 20 or more for TCP), which is why tiny messages have a proportionally high cost."]),
      p(["O **IP** é o serviço de entrega do melhor esforço: leva pacotes de um endereço a outro, mas pode perdê-los, duplicá-los ou entregá-los fora de ordem, e limita o tamanho a cerca de 1500 bytes na Ethernet (o MTU). Tudo o que parece garantia na internet, como ordem e confiabilidade, é construído em cima dele pelo transporte ou pela aplicação.", "**IP** is a best-effort delivery service: it carries packets from one address to another, but may lose, duplicate or reorder them, and limits the size to about 1500 bytes on Ethernet (the MTU). Everything that looks like a guarantee on the internet, such as order and reliability, is built on top of it by the transport layer or by the application."]),

      h(["TCP: confiabilidade a um custo", "TCP: reliability at a cost"]),
      p(["O **TCP** transforma o IP não confiável em um **fluxo de bytes** confiável e ordenado entre dois processos. Ele faz isso com cinco mecanismos que valem ser conhecidos, porque cada um deixa marcas na latência que você mede em produção.", "**TCP** turns unreliable IP into a reliable, ordered **byte stream** between two processes. It does so with five mechanisms worth knowing, because each leaves marks on the latency you measure in production."]),
      ul(
        ["**Handshake de três vias**: antes de qualquer dado, cliente e servidor trocam `SYN`, `SYN-ACK` e `ACK`. Isso confirma que os dois lados estão vivos e sincroniza os números de sequência iniciais. Custa **1 RTT** (ida e volta) antes do primeiro byte útil.", "**Three-way handshake**: before any data, client and server exchange `SYN`, `SYN-ACK` and `ACK`. This confirms both sides are alive and synchronizes the initial sequence numbers. It costs **1 RTT** (round trip) before the first useful byte."],
        ["**Numeração e confirmação**: cada byte tem um número de sequência e o receptor devolve `ACK`s dizendo até onde recebeu. É assim que se detecta o que faltou.", "**Numbering and acknowledgment**: every byte has a sequence number and the receiver returns ACKs saying how far it has received. That is how what is missing gets detected."],
        ["**Retransmissão**: se o `ACK` não chega dentro de um tempo calculado a partir do RTT medido (o RTO), ou chegam três `ACK`s duplicados, o emissor reenvia. Uma perda custa pelo menos um RTT adicional.", "**Retransmission**: if the ACK does not arrive within a time computed from the measured RTT (the RTO), or three duplicate ACKs arrive, the sender resends. A loss costs at least one extra RTT."],
        ["**Controle de fluxo**: o receptor anuncia uma *janela* com o espaço livre no seu buffer, e o emissor nunca envia mais que isso sem confirmação. Protege o receptor lento.", "**Flow control**: the receiver advertises a *window* with the free space in its buffer, and the sender never sends more than that unacknowledged. It protects a slow receiver."],
        ["**Controle de congestionamento**: o emissor mantém uma *janela de congestionamento* que começa pequena (tipicamente 10 segmentos), dobra a cada RTT na fase de *slow start* e depois cresce devagar; ao detectar perda, reduz. Algoritmos como CUBIC (padrão no Linux) e BBR (do Google) variam na forma de reagir. O efeito prático: **uma conexão nova é lenta no começo**, e por isso reaproveitar conexões é tão valioso.", "**Congestion control**: the sender keeps a *congestion window* that starts small (typically 10 segments), doubles every RTT during *slow start* and then grows slowly; on detecting loss, it shrinks. Algorithms such as CUBIC (Linux default) and BBR (from Google) differ in how they react. The practical effect: **a new connection is slow at first**, which is why reusing connections is so valuable."],
      ),
      code(`client                                server
  | ---- SYN (seq=x) ---------------> |
  | <--- SYN-ACK (seq=y, ack=x+1) --- |   1 RTT
  | ---- ACK (ack=y+1) -------------> |
  | ---- data ----------------------> |   (TLS handshake adds 1 RTT in TLS 1.3)
  | <--- ACK + data ----------------- |
  | ---- FIN ... FIN-ACK ...          |   graceful close`),
      p(["O preço da confiabilidade é o **head-of-line blocking**: como a entrega é em ordem, um segmento perdido segura todos os seguintes no buffer do receptor até ser retransmitido, mesmo que já tenham chegado. Para uma página com 50 recursos multiplexados na mesma conexão, uma perda atrasa os 50.", "The price of reliability is **head-of-line blocking**: since delivery is in order, a lost segment holds all following ones in the receiver's buffer until it is retransmitted, even though they already arrived. For a page with 50 resources multiplexed over the same connection, one loss delays all 50."]),

      h(["UDP: simples e sem garantias", "UDP: simple and without guarantees"]),
      p(["O **UDP** acrescenta ao IP apenas portas e uma soma de verificação. Cada datagrama é independente: não há conexão, ordem, retransmissão nem controle de congestionamento. Isso parece um defeito, mas é uma qualidade quando a garantia do TCP atrapalha. Em uma chamada de voz, um trecho que chega 300 ms atrasado é pior que um trecho perdido; em um jogo online, a posição de 200 ms atrás não interessa; no DNS, uma pergunta e uma resposta pequenas não justificam um handshake.", "**UDP** adds to IP only ports and a checksum. Each datagram is independent: there is no connection, ordering, retransmission or congestion control. That looks like a flaw, but it is a virtue when TCP's guarantee gets in the way. In a voice call, a snippet that arrives 300 ms late is worse than a lost one; in an online game, the position from 200 ms ago does not matter; in DNS, a small question and answer do not justify a handshake."]),
      table([["Aspecto", "Aspect"], ["TCP", "TCP"], ["UDP", "UDP"]],
        [["Conexão", "Connection"], ["Sim, com handshake", "Yes, with handshake"], ["Não", "No"]],
        [["Entrega", "Delivery"], ["Confiável e em ordem", "Reliable and ordered"], ["Melhor esforço", "Best effort"]],
        [["Unidade", "Unit"], ["Fluxo de bytes", "Byte stream"], ["Datagramas", "Datagrams"]],
        [["Congestionamento", "Congestion"], ["Controla sozinho", "Self-controlled"], ["Cabe à aplicação", "Up to the application"]],
        [["Overhead de cabeçalho", "Header overhead"], ["20 bytes ou mais", "20 bytes or more"], ["8 bytes", "8 bytes"]],
        [["Usos típicos", "Typical uses"], ["HTTP/1.1 e 2, bancos de dados, SSH, e-mail", "HTTP/1.1 and 2, databases, SSH, email"], ["DNS, voz e vídeo, jogos, QUIC", "DNS, voice and video, games, QUIC"]]),

      h(["A evolução do HTTP", "The evolution of HTTP"]),
      p(["O **HTTP** é o protocolo de aplicação da web: o cliente envia uma requisição e o servidor devolve uma resposta. Sua semântica (métodos, status, cabeçalhos) quase não mudou em 30 anos. O que mudou foi **como as mensagens viajam**, sempre atacando o mesmo inimigo: a latência de abrir conexões e esperar respostas.", "**HTTP** is the web's application protocol: the client sends a request and the server returns a response. Its semantics (methods, status, headers) barely changed in 30 years. What changed was **how the messages travel**, always attacking the same enemy: the latency of opening connections and waiting for responses."]),
      ul(
        ["**HTTP/1.1** (1997): texto legível, conexões persistentes (*keep-alive*) e, em teoria, *pipelining*, que na prática quase ninguém usou por causa do head-of-line blocking na aplicação: a resposta 2 só sai depois da 1. Os navegadores contornaram abrindo cerca de 6 conexões TCP por origem, o que também levou ao *domain sharding* e aos arquivos agrupados (*bundles*, *sprites*).", "**HTTP/1.1** (1997): readable text, persistent connections (*keep-alive*) and, in theory, *pipelining*, which almost nobody used in practice because of application-level head-of-line blocking: response 2 only leaves after response 1. Browsers worked around it by opening about 6 TCP connections per origin, which also led to *domain sharding* and bundled files (*bundles*, *sprites*)."],
        ["**HTTP/2** (2015): formato binário, **multiplexação** de vários *streams* na mesma conexão TCP, compressão de cabeçalhos com HPACK, priorização e *server push* (hoje praticamente abandonado). Resolve o head-of-line da aplicação, mas não o do TCP: uma perda de pacote ainda paralisa todos os streams. Em redes com perda alta (celular), isso pode até piorar em relação a 6 conexões separadas.", "**HTTP/2** (2015): binary format, **multiplexing** of many *streams* over the same TCP connection, header compression with HPACK, prioritization and *server push* (now practically abandoned). It fixes the application-level head-of-line but not TCP's: a packet loss still stalls every stream. On high-loss networks (mobile) it can even be worse than 6 separate connections."],
        ["**HTTP/3** (2022): roda sobre **QUIC**, um transporte construído sobre UDP que implementa em espaço de usuário confiabilidade, controle de congestionamento e **TLS 1.3 integrado**. Cada stream tem entrega ordenada própria, então a perda de um pacote atrasa só o seu stream. O handshake de transporte e o de TLS acontecem juntos (1 RTT; **0-RTT** em conexões retomadas, com ressalvas de segurança contra replay) e a conexão é identificada por um ID, não pelo par IP/porta, de modo que **sobrevive à troca de rede** (Wi-Fi para 4G).", "**HTTP/3** (2022): runs over **QUIC**, a transport built on UDP that implements reliability, congestion control and **integrated TLS 1.3** in user space. Each stream has its own ordered delivery, so a lost packet delays only its stream. The transport and TLS handshakes happen together (1 RTT; **0-RTT** on resumed connections, with replay-safety caveats) and the connection is identified by an ID, not the IP/port pair, so it **survives a network change** (Wi-Fi to 4G)."],
      ),
      table([["Característica", "Feature"], ["HTTP/1.1", "HTTP/1.1"], ["HTTP/2", "HTTP/2"], ["HTTP/3", "HTTP/3"]],
        [["Formato", "Format"], ["Texto", "Text"], ["Binário", "Binary"], ["Binário", "Binary"]],
        [["Transporte", "Transport"], ["TCP", "TCP"], ["TCP", "TCP"], ["QUIC sobre UDP", "QUIC over UDP"]],
        [["Requisições simultâneas", "Concurrent requests"], ["1 por conexão (6 conexões)", "1 per connection (6 connections)"], ["Multiplexadas", "Multiplexed"], ["Multiplexadas, independentes", "Multiplexed, independent"]],
        [["Cabeçalhos", "Headers"], ["Repetidos em texto", "Repeated as text"], ["HPACK", "HPACK"], ["QPACK", "QPACK"]],
        [["Head-of-line blocking", "Head-of-line blocking"], ["Na aplicação", "In the application"], ["No TCP", "In TCP"], ["Só dentro do stream", "Only within the stream"]],
        [["Handshake até o 1º byte", "Handshake to first byte"], ["TCP + TLS: 2 a 3 RTT", "TCP + TLS: 2 to 3 RTT"], ["Igual ao 1.1", "Same as 1.1"], ["1 RTT (0 ao retomar)", "1 RTT (0 on resume)"]],
        [["Troca de rede", "Network change"], ["Reconecta", "Reconnects"], ["Reconecta", "Reconnects"], ["Mantém a conexão", "Keeps the connection"]]),
      p(["Na prática, o navegador descobre que o servidor suporta HTTP/3 por um cabeçalho `Alt-Svc` ou pelo registro DNS `HTTPS`, e tenta QUIC em paralelo, voltando ao TCP se o UDP for bloqueado (comum em redes corporativas). Por isso um servidor ou CDN que fala HTTP/3 deve sempre manter HTTP/2 e 1.1 como alternativas.", "In practice the browser learns that the server supports HTTP/3 through an `Alt-Svc` header or the `HTTPS` DNS record, and tries QUIC in parallel, falling back to TCP if UDP is blocked (common on corporate networks). That is why a server or CDN speaking HTTP/3 must always keep HTTP/2 and 1.1 as alternatives."]),

      h(["A anatomia de uma requisição HTTP", "Anatomy of an HTTP exchange"]),
      p(["Uma mensagem HTTP tem uma linha inicial, cabeçalhos e um corpo opcional. Os **métodos** expressam a intenção: `GET` lê (seguro e idempotente), `POST` cria ou executa uma ação, `PUT` substitui um recurso inteiro, `PATCH` altera parcialmente, `DELETE` remove, `HEAD` e `OPTIONS` consultam metadados e capacidades. Os **status** são agrupados em famílias: `1xx` informativo, `2xx` sucesso, `3xx` redirecionamento, `4xx` erro do cliente e `5xx` erro do servidor.", "An HTTP message has a start line, headers and an optional body. **Methods** express the intent: `GET` reads (safe and idempotent), `POST` creates or runs an action, `PUT` replaces a whole resource, `PATCH` changes it partially, `DELETE` removes, `HEAD` and `OPTIONS` query metadata and capabilities. **Status codes** are grouped in families: `1xx` informational, `2xx` success, `3xx` redirection, `4xx` client error and `5xx` server error."]),
      code(`POST /v1/orders HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json
Accept: application/json
Idempotency-Key: 7c9e6679-7425-40de-944b-e07fc1f90ae7
Content-Length: 47

{"customerId": 42, "items": [{"sku": "A1", "qty": 2}]}

HTTP/1.1 201 Created
Content-Type: application/json
Location: /v1/orders/9001
Cache-Control: no-store
ETag: "a1b2c3"
Content-Length: 58

{"id": 9001, "status": "pending", "total": 59.80}`),
      p(["Os cabeçalhos mais importantes para quem projeta sistemas: `Host` (qual site, permitindo vários no mesmo IP), `Authorization` (credenciais), `Content-Type` e `Accept` (negociação de formato), `Cache-Control`, `ETag` e `If-None-Match` (cache e requisições condicionais, que devolvem `304 Not Modified` sem corpo), `Location` (onde está o recurso criado ou para onde redirecionar), `Retry-After` (quando tentar de novo após `429` ou `503`) e `X-Forwarded-For` (IP original atrás de proxies).", "The most important headers for system designers: `Host` (which site, allowing many on one IP), `Authorization` (credentials), `Content-Type` and `Accept` (format negotiation), `Cache-Control`, `ETag` and `If-None-Match` (caching and conditional requests, which return `304 Not Modified` with no body), `Location` (where the created resource is or where to redirect), `Retry-After` (when to try again after `429` or `503`) and `X-Forwarded-For` (original IP behind proxies)."]),

      h(["TLS de relance", "TLS at a glance"]),
      p(["O **TLS** (o S do HTTPS) entrega três coisas: **confidencialidade** (ninguém no caminho lê), **integridade** (ninguém altera sem ser detectado) e **autenticação** do servidor. O servidor apresenta um **certificado** que liga seu nome de domínio a uma chave pública e é assinado por uma autoridade certificadora (CA) em que o cliente já confia. As pontas combinam então uma chave de sessão por troca Diffie-Hellman efêmera, o que dá *forward secrecy*: roubar a chave privada do servidor no futuro não decifra o tráfego antigo. A partir daí os dados usam cifra simétrica (AES-GCM ou ChaCha20-Poly1305), muito rápida.", "**TLS** (the S in HTTPS) delivers three things: **confidentiality** (nobody on the path can read), **integrity** (nobody alters without detection) and server **authentication**. The server presents a **certificate** that ties its domain name to a public key and is signed by a certificate authority (CA) the client already trusts. The ends then agree on a session key via ephemeral Diffie-Hellman, which provides *forward secrecy*: stealing the server's private key in the future does not decrypt old traffic. From there data uses symmetric ciphers (AES-GCM or ChaCha20-Poly1305), which are very fast."]),
      p(["O TLS 1.3 reduziu o handshake a **1 RTT** (e 0-RTT na retomada). Em sistemas grandes o TLS costuma ser **terminado** no balanceador ou na borda, e o tráfego interno segue em rede privada, ou com **mTLS**, em que servidor e cliente apresentam certificados e se autenticam mutuamente, padrão em service meshes. Certificados expiram: automatize a renovação (Let's Encrypt, ACME), porque um certificado vencido derruba o serviço tão completamente quanto um servidor desligado.", "TLS 1.3 cut the handshake to **1 RTT** (and 0-RTT on resume). In large systems TLS is usually **terminated** at the load balancer or edge, and internal traffic runs on a private network, or with **mTLS**, where server and client present certificates and authenticate each other, standard in service meshes. Certificates expire: automate renewal (Let's Encrypt, ACME), because an expired certificate takes the service down as completely as a switched-off server."]),

      h(["gRPC e Protocol Buffers", "gRPC and Protocol Buffers"]),
      p(["O **gRPC** é um framework de chamada remota de procedimentos que roda sobre HTTP/2. Você descreve o contrato em um arquivo `.proto`, e o compilador gera o cliente e o esqueleto do servidor, tipados, em dezenas de linguagens. As mensagens usam **Protocol Buffers**, um formato binário em que cada campo tem um número e um tipo; os nomes não viajam, só os números, o que gera mensagens muito menores que JSON e processamento mais rápido. A compatibilidade evolui por regra: nunca reutilize um número de campo, e campos novos são opcionais para quem não os conhece.", "**gRPC** is a remote procedure call framework running over HTTP/2. You describe the contract in a `.proto` file, and the compiler generates the typed client and server skeleton in dozens of languages. Messages use **Protocol Buffers**, a binary format in which each field has a number and a type; names do not travel, only numbers, producing messages far smaller than JSON and faster processing. Compatibility evolves by rule: never reuse a field number, and new fields are optional for those who do not know them."]),
      code(`syntax = "proto3";

service OrderService {
  rpc GetOrder (GetOrderRequest) returns (Order);                 // unary
  rpc WatchOrders (WatchRequest) returns (stream Order);          // server streaming
  rpc Upload (stream Item) returns (Summary);                     // client streaming
  rpc Chat (stream Msg) returns (stream Msg);                     // bidirectional
}

message GetOrderRequest { int64 id = 1; }
message Order {
  int64 id = 1;
  string status = 2;
  repeated Item items = 3;
}`),
      p(["O gRPC oferece quatro modos (unário e três de streaming), *deadlines* propagados entre serviços, cancelamento e códigos de status próprios. As desvantagens: o formato binário dificulta depurar com `curl` (use `grpcurl`), navegadores não falam gRPC nativamente e exigem o **gRPC-Web** com um proxy, e balancear exige atenção, porque uma conexão HTTP/2 longa carrega muitas chamadas e um balanceador de conexão (L4) concentraria tudo num servidor. É preciso balanceamento por chamada (L7, Envoy) ou balanceamento no cliente.", "gRPC offers four modes (unary and three streaming kinds), *deadlines* propagated between services, cancellation and its own status codes. The drawbacks: the binary format makes debugging with `curl` harder (use `grpcurl`), browsers do not speak gRPC natively and need **gRPC-Web** with a proxy, and balancing needs care, because one long HTTP/2 connection carries many calls and a connection-level (L4) balancer would pile everything on one server. You need per-call balancing (L7, Envoy) or client-side balancing."]),

      h(["REST, GraphQL e gRPC lado a lado", "REST, GraphQL and gRPC side by side"]),
      p(["O **GraphQL** expõe um único endpoint em que o cliente descreve exatamente os campos que quer, inclusive atravessando relações, numa só requisição. Resolve o *over-fetching* (vir dados demais) e o *under-fetching* (precisar de várias chamadas), e é ótimo para clientes diversos como apps móveis. Em troca, o cache HTTP padrão não funciona bem (tudo é `POST` para a mesma URL), consultas muito aninhadas podem sobrecarregar o banco (o problema N+1, resolvido com *batching* como o DataLoader) e é preciso limitar profundidade e custo das consultas.", "**GraphQL** exposes a single endpoint in which the client describes exactly the fields it wants, even across relations, in one request. It solves *over-fetching* (too much data) and *under-fetching* (needing several calls), and is great for diverse clients such as mobile apps. In exchange, standard HTTP caching does not work well (everything is a `POST` to the same URL), deeply nested queries can overload the database (the N+1 problem, solved with *batching* such as DataLoader) and you must limit query depth and cost."]),
      table([["Critério", "Criterion"], ["REST/JSON", "REST/JSON"], ["GraphQL", "GraphQL"], ["gRPC", "gRPC"]],
        [["Formato", "Format"], ["JSON, texto", "JSON, text"], ["JSON, texto", "JSON, text"], ["Protobuf, binário", "Protobuf, binary"]],
        [["Contrato", "Contract"], ["OpenAPI (opcional)", "OpenAPI (optional)"], ["Schema obrigatório", "Mandatory schema"], ["`.proto` obrigatório", "Mandatory `.proto`"]],
        [["Cache HTTP", "HTTP cache"], ["Excelente", "Excellent"], ["Difícil", "Hard"], ["Não aplicável", "Not applicable"]],
        [["Streaming", "Streaming"], ["Limitado (SSE)", "Limited (SSE)"], ["Subscriptions", "Subscriptions"], ["Nativo, 3 modos", "Native, 3 modes"]],
        [["Navegador", "Browser"], ["Nativo", "Native"], ["Nativo", "Native"], ["Precisa de gRPC-Web", "Needs gRPC-Web"]],
        [["Uso ideal", "Ideal use"], ["APIs públicas", "Public APIs"], ["Front-ends variados", "Varied front ends"], ["Serviço a serviço", "Service to service"]]),

      h(["Escolhendo o protocolo", "Choosing the protocol"]),
      ul(
        ["API pública consumida por terceiros: **REST sobre HTTP/JSON**, pela facilidade e pelo cache.", "Public API consumed by third parties: **REST over HTTP/JSON**, for ease and caching."],
        ["Comunicação interna entre microsserviços com baixa latência e contrato forte: **gRPC**.", "Internal communication between microservices with low latency and a strong contract: **gRPC**."],
        ["Vários clientes com necessidades de dados diferentes: **GraphQL**, ou um BFF com REST.", "Several clients with different data needs: **GraphQL**, or a BFF with REST."],
        ["Voz, vídeo ao vivo, jogos, telemetria tolerante a perda: **UDP** (ou WebRTC, QUIC).", "Voice, live video, games, loss-tolerant telemetry: **UDP** (or WebRTC, QUIC)."],
        ["Atualizações do servidor para o cliente: SSE ou WebSocket (veja o artigo sobre polling).", "Server-to-client updates: SSE or WebSocket (see the article on polling)."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Abrir uma conexão nova por requisição, pagando handshake de TCP e TLS todas as vezes, em vez de reaproveitar com keep-alive ou pools.", "Opening a new connection per request, paying the TCP and TLS handshakes every time, instead of reusing with keep-alive or pools."],
        ["Ignorar o RTT: um serviço a 150 ms de distância com 4 chamadas sequenciais já gasta 600 ms só esperando a rede.", "Ignoring RTT: a service 150 ms away with 4 sequential calls already spends 600 ms just waiting on the network."],
        ["Assumir que UDP \"é mais rápido\" sem saber que terá de reimplementar confiabilidade e controle de congestionamento.", "Assuming UDP \"is faster\" without knowing you will have to reimplement reliability and congestion control."],
        ["Usar `POST` para tudo e perder cache, idempotência e semântica.", "Using `POST` for everything and losing caching, idempotency and semantics."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["A rede é feita em camadas que encapsulam umas às outras; o IP entrega pacotes sem garantia.", "The network is built from layers that encapsulate each other; IP delivers packets with no guarantee."],
        ["TCP dá fluxo confiável e ordenado com handshake, retransmissão, controle de fluxo e de congestionamento; paga com latência e head-of-line blocking.", "TCP gives a reliable, ordered stream with handshake, retransmission, flow and congestion control; it pays with latency and head-of-line blocking."],
        ["UDP é leve e sem garantias, base do DNS, da voz e do QUIC.", "UDP is light and without guarantees, the basis of DNS, voice and QUIC."],
        ["HTTP/2 multiplexa sobre TCP; HTTP/3 usa QUIC, com streams independentes, handshake mais curto e migração de conexão.", "HTTP/2 multiplexes over TCP; HTTP/3 uses QUIC, with independent streams, a shorter handshake and connection migration."],
        ["TLS 1.3 dá sigilo, integridade e autenticação em 1 RTT; mTLS autentica os dois lados.", "TLS 1.3 gives secrecy, integrity and authentication in 1 RTT; mTLS authenticates both sides."],
        ["REST para o mundo externo, gRPC dentro do datacenter, GraphQL para clientes heterogêneos.", "REST for the outside world, gRPC inside the datacenter, GraphQL for heterogeneous clients."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**O HTTP/3 substitui o TCP?** Não totalmente: ele usa QUIC sobre UDP, mas o HTTP/1.1 e o HTTP/2 continuam sobre TCP e coexistem por muito tempo.", "**Does HTTP/3 replace TCP?** Not entirely: it uses QUIC over UDP, but HTTP/1.1 and HTTP/2 remain on TCP and will coexist for a long time."],
        ["**O UDP é inseguro?** Não por si só. Ele não oferece garantias de entrega, mas o QUIC e o DTLS adicionam criptografia por cima.", "**Is UDP insecure?** Not by itself. It offers no delivery guarantees, but QUIC and DTLS add encryption on top."],
        ["**Por que o gRPC é mais rápido que REST/JSON?** Mensagens binárias menores, HTTP/2 com multiplexação e geração de código que evita análise de texto.", "**Why is gRPC faster than REST/JSON?** Smaller binary messages, HTTP/2 multiplexing and generated code that avoids text parsing."],
        ["**Preciso de HTTPS em rede interna?** Se há dados sensíveis ou política de confiança zero, sim: use mTLS. Rede privada não é sinônimo de rede confiável.", "**Do I need HTTPS on an internal network?** If there is sensitive data or a zero-trust policy, yes: use mTLS. A private network is not a trusted network."],
      ),
      tip(["Regra prática: HTTP/JSON para o mundo externo, gRPC para dentro do datacenter, UDP/QUIC quando latência e perda parcial importam mais que ordem estrita.", "Rule of thumb: HTTP/JSON for the outside world, gRPC inside the datacenter, UDP/QUIC when latency and partial loss matter more than strict order."]),
    ] },

  { id: "dns", section: "rede", level: 0, icon: "dns", minutes: 14,
    title: ["DNS: a lista telefônica da internet", "DNS: the phone book of the internet"],
    summary: ["Hierarquia, resolução passo a passo, registros, cache, TTL, balanceamento, failover e DNSSEC.", "Hierarchy, step-by-step resolution, records, caching, TTL, balancing, failover and DNSSEC."],
    body: [
      p(["Computadores se falam por endereços IP, pessoas lembram de nomes. O **DNS** (*Domain Name System*) é o sistema distribuído que traduz `www.exemplo.com` em `93.184.216.34` (ou em um endereço IPv6). Sem ele, você precisaria decorar números e, pior, qualquer troca de servidor quebraria todos os usuários. Ele é a primeira coisa que acontece em quase toda requisição e, quando falha, o serviço \"some\" mesmo com todos os servidores de pé. Foi o que ocorreu em grandes incidentes públicos de provedores de DNS: o site estava saudável, mas ninguém sabia seu endereço.", "Computers talk through IP addresses, people remember names. **DNS** (*Domain Name System*) is the distributed system that translates `www.example.com` into `93.184.216.34` (or an IPv6 address). Without it you would have to memorize numbers and, worse, any server change would break every user. It is the first thing that happens in almost every request and, when it fails, the service \"disappears\" even with all servers up. That is what happened in large public incidents at DNS providers: the site was healthy, but nobody knew its address."]),
      p(["O DNS é também um dos maiores bancos de dados distribuídos do mundo, e funciona por três ideias: uma **hierarquia** em que cada nível delega ao seguinte, **delegação de autoridade** (cada organização gere seus próprios nomes) e **cache agressivo** em todas as camadas. Entender essas três ideias explica quase todo comportamento estranho que você verá em produção.", "DNS is also one of the largest distributed databases in the world, and it works through three ideas: a **hierarchy** in which each level delegates to the next, **delegation of authority** (each organization manages its own names) and **aggressive caching** at every layer. Understanding these three ideas explains almost every odd behavior you will see in production."]),

      h(["A hierarquia de nomes", "The name hierarchy"]),
      p(["Os nomes formam uma árvore lida da direita para a esquerda. No topo está a **raiz** (`.`, escrita implicitamente no fim de `www.exemplo.com.`), servida por 13 identidades de servidores raiz (letras A a M) que, via anycast, correspondem a centenas de instâncias pelo mundo. Abaixo ficam os **TLDs** (*top-level domains*): genéricos como `.com` e `.org`, e de país como `.br` e `.de`. Depois vem o domínio registrado (`exemplo`) e, por fim, os subdomínios e hosts (`www`, `api`), que o dono do domínio cria à vontade.", "Names form a tree read from right to left. At the top is the **root** (`.`, implicitly written at the end of `www.example.com.`), served by 13 root server identities (letters A to M) that, via anycast, map to hundreds of instances worldwide. Below are the **TLDs** (top-level domains): generic ones such as `.com` and `.org`, and country ones such as `.br` and `.de`. Then comes the registered domain (`example`) and, finally, subdomains and hosts (`www`, `api`), which the domain owner creates freely."]),
      p(["Quatro papéis de servidor aparecem o tempo todo. O **resolver recursivo** (ou *resolver*) é quem faz o trabalho pelo cliente: seu provedor de internet, ou um serviço público como 1.1.1.1 e 8.8.8.8. Os **servidores raiz** e os **servidores de TLD** sabem apenas indicar o próximo passo (são *referrals*). O **servidor autoritativo** guarda de fato os registros da zona do domínio e é a fonte da verdade (Route 53, Cloudflare, Google Cloud DNS, ou o seu próprio BIND). E o **stub resolver** é o pequeno cliente do sistema operacional que pergunta ao resolver recursivo.", "Four server roles appear all the time. The **recursive resolver** does the work on the client's behalf: your internet provider, or a public service such as 1.1.1.1 and 8.8.8.8. **Root servers** and **TLD servers** only point to the next step (*referrals*). The **authoritative server** actually holds the domain zone's records and is the source of truth (Route 53, Cloudflare, Google Cloud DNS, or your own BIND). And the **stub resolver** is the operating system's small client that asks the recursive resolver."]),

      h(["Resolução recursiva passo a passo", "Recursive resolution step by step"]),
      p(["Quando você digita `www.exemplo.com` e nada está em cache, o resolver percorre a hierarquia. Note que o cliente faz **uma** pergunta e recebe **uma** resposta; as consultas intermediárias são do resolver.", "When you type `www.example.com` and nothing is cached, the resolver walks the hierarchy. Note that the client asks **one** question and gets **one** answer; the intermediate queries belong to the resolver."]),
      fig(["Resolução de www.exemplo.com sem cache", "Resolving www.example.com with no cache"],
        [[node("c", ["Navegador\n+ stub", "Browser\n+ stub"], "client")],
         [node("r", ["Resolver\nrecursivo", "Recursive\nresolver"], "edge")],
         [node("root", ["Servidor\nraiz", "Root\nserver"], "service"), node("tld", ["Servidor\nde .com", ".com\nserver"], "service"), node("auth", ["Servidor\nautoritativo", "Authoritative\nserver"], "data")]],
        [edge("c", "r", ["1 pergunta", "1 question"]), edge("r", "root", ["2 quem tem .com?", "2 who has .com?"]), edge("r", "tld", ["3 quem tem exemplo.com?", "3 who has example.com?"]), edge("r", "auth", ["4 IP de www?", "4 IP of www?"])]),
      ul(
        ["O navegador consulta seu cache interno e o do sistema operacional. Sem resposta, o stub resolver envia a pergunta ao resolver recursivo configurado (por DHCP, em geral o do provedor).", "The browser checks its internal cache and the operating system's. With no answer, the stub resolver sends the question to the configured recursive resolver (via DHCP, usually the provider's)."],
        ["Se o resolver também não tem em cache, ele pergunta a um **servidor raiz**, que responde com a lista de servidores do TLD `.com` (um *referral*, não a resposta final).", "If the resolver has no cache either, it asks a **root server**, which answers with the list of servers for the `.com` TLD (a *referral*, not the final answer)."],
        ["Ele pergunta a um servidor de `.com`, que responde com os servidores de nomes do domínio (`ns1.exemplo.com`, registros **NS**, geralmente acompanhados dos endereços como *glue records*).", "It asks a `.com` server, which answers with the domain's name servers (`ns1.example.com`, **NS** records, usually accompanied by addresses as *glue records*)."],
        ["Ele pergunta ao **servidor autoritativo**, que responde de fato: `www.exemplo.com A 93.184.216.34`, com um **TTL**.", "It asks the **authoritative server**, which actually answers: `www.example.com A 93.184.216.34`, with a **TTL**."],
        ["O resolver guarda a resposta em cache pelo TTL (e também os referrals de raiz e TLD, que duram bem mais) e a devolve ao cliente, que também a guarda.", "The resolver caches the answer for the TTL (and also the root and TLD referrals, which last far longer) and returns it to the client, which caches it too."],
      ),
      p(["Na maioria das consultas, os passos 2 e 3 nem acontecem, porque o resolver já conhece os servidores do TLD. Por isso o DNS típico leva de 1 a 50 ms para um nome popular em cache e de 20 a 200 ms para um nome frio. Você pode acompanhar o caminho real com `dig +trace www.exemplo.com`.", "In most queries steps 2 and 3 do not even happen, because the resolver already knows the TLD servers. That is why typical DNS takes 1 to 50 ms for a popular cached name and 20 to 200 ms for a cold one. You can follow the real path with `dig +trace www.example.com`."]),
      code(`$ dig +short www.example.com A
93.184.216.34

$ dig www.example.com A

;; ANSWER SECTION:
www.example.com.   3600  IN  A      93.184.216.34

$ dig +trace www.example.com
.                  518400 IN NS  a.root-servers.net.
com.               172800 IN NS  a.gtld-servers.net.
example.com.       172800 IN NS  a.iana-servers.net.
www.example.com.   3600   IN A   93.184.216.34`),
      p(["O DNS usa por padrão **UDP na porta 53**, porque perguntas e respostas cabem em um datagrama. Cai para **TCP** quando a resposta é grande (por exemplo, com DNSSEC) ou em transferências de zona. Existem também variantes cifradas, **DNS sobre HTTPS** (DoH) e **DNS sobre TLS** (DoT), que impedem a rede local de ver os nomes consultados.", "DNS uses **UDP on port 53** by default, because questions and answers fit in a datagram. It falls back to **TCP** when the answer is large (for instance with DNSSEC) or in zone transfers. There are also encrypted variants, **DNS over HTTPS** (DoH) and **DNS over TLS** (DoT), which prevent the local network from seeing queried names."]),

      h(["Tipos de registros", "Record types"]),
      table([["Registro", "Record"], ["Para que serve", "What it is for"], ["Exemplo", "Example"]],
        [["A", "A"], ["Nome para endereço IPv4", "Name to IPv4 address"], ["`www  A  93.184.216.34`", "`www  A  93.184.216.34`"]],
        [["AAAA", "AAAA"], ["Nome para endereço IPv6", "Name to IPv6 address"], ["`www  AAAA  2606:2800:220:1::1`", "`www  AAAA  2606:2800:220:1::1`"]],
        [["CNAME", "CNAME"], ["Apelido para outro nome", "Alias to another name"], ["`app  CNAME  lb.provedor.com.`", "`app  CNAME  lb.provider.com.`"]],
        [["MX", "MX"], ["Servidores de e-mail, com prioridade", "Mail servers, with priority"], ["`@  MX  10 mail.exemplo.com.`", "`@  MX  10 mail.example.com.`"]],
        [["TXT", "TXT"], ["Texto livre: SPF, DKIM, DMARC, verificação de posse", "Free text: SPF, DKIM, DMARC, ownership verification"], ["`@  TXT  \"v=spf1 include:_spf.google.com ~all\"`", "`@  TXT  \"v=spf1 include:_spf.google.com ~all\"`"]],
        [["NS", "NS"], ["Servidores autoritativos da zona", "Authoritative servers of the zone"], ["`@  NS  ns1.exemplo.com.`", "`@  NS  ns1.example.com.`"]],
        [["SOA", "SOA"], ["Metadados da zona: serial, tempos de atualização", "Zone metadata: serial, refresh timers"], ["`@  SOA  ns1 admin 2025010101 ...`", "`@  SOA  ns1 admin 2025010101 ...`"]],
        [["SRV", "SRV"], ["Host e porta de um serviço", "Host and port of a service"], ["`_sip._tcp  SRV  10 60 5060 sip.exemplo.com.`", "`_sip._tcp  SRV  10 60 5060 sip.example.com.`"]],
        [["CAA", "CAA"], ["Quais CAs podem emitir certificados", "Which CAs may issue certificates"], ["`@  CAA  0 issue \"letsencrypt.org\"`", "`@  CAA  0 issue \"letsencrypt.org\"`"]],
        [["PTR", "PTR"], ["DNS reverso: IP para nome", "Reverse DNS: IP to name"], ["`34.216.184.93.in-addr.arpa  PTR  host.exemplo.com.`", "`34.216.184.93.in-addr.arpa  PTR  host.example.com.`"]]),
      p(["Duas regras que pegam muita gente: um **CNAME** não pode coexistir com outros registros no mesmo nome, e por isso não pode estar no *apex* do domínio (`exemplo.com`, que já precisa de NS e SOA). Provedores oferecem pseudo-registros **ALIAS** ou **ANAME** (ou o *CNAME flattening* da Cloudflare) para contornar isso. E um **MX** deve apontar para um nome, nunca direto para um CNAME.", "Two rules that catch many people: a **CNAME** cannot coexist with other records at the same name, and so cannot sit at the domain *apex* (`example.com`, which already needs NS and SOA). Providers offer **ALIAS** or **ANAME** pseudo-records (or Cloudflare's *CNAME flattening*) to work around this. And an **MX** must point to a name, never directly to a CNAME."]),

      h(["Cache, TTL e propagação", "Caching, TTL and propagation"]),
      p(["Sem cache, cada acesso geraria várias consultas e os servidores raiz seriam esmagados. Cada resposta traz um **TTL** (*time to live*, em segundos), e todos que a repassam podem guardá-la até esse tempo vencer. O cache existe em **vários níveis**, e é isso que complica diagnósticos:", "Without caching, every access would generate several queries and root servers would be crushed. Each answer carries a **TTL** (*time to live*, in seconds), and everyone who relays it may keep it until that time expires. The cache exists at **several levels**, which is what complicates diagnosis:"]),
      ul(
        ["**Navegador**: Chrome e Firefox mantêm um cache próprio por poucos minutos, independente do TTL.", "**Browser**: Chrome and Firefox keep their own cache for a few minutes, regardless of TTL."],
        ["**Sistema operacional**: o serviço de resolução local (`systemd-resolved`, o cache do Windows, o `mDNSResponder` no macOS).", "**Operating system**: the local resolution service (`systemd-resolved`, the Windows cache, `mDNSResponder` on macOS)."],
        ["**Roteador doméstico ou corporativo**: muitos rodam um encaminhador com cache (dnsmasq).", "**Home or corporate router**: many run a caching forwarder (dnsmasq)."],
        ["**Resolver recursivo** do provedor ou público: o cache mais importante e o que você não controla.", "**Recursive resolver** of the provider or public: the most important cache and the one you do not control."],
        ["**Aplicação**: a JVM, por exemplo, guarda resultados de DNS por padrão por um tempo próprio (`networkaddress.cache.ttl`), e bibliotecas de pools de conexão podem manter IPs por dias.", "**Application**: the JVM, for example, keeps DNS results for its own default time (`networkaddress.cache.ttl`), and connection pool libraries may hold IPs for days."],
      ),
      p(["A consequência prática é a famosa \"propagação\": ao mudar um registro, cada cache só o descobre quando o TTL antigo vence. Não existe um \"broadcast\" de atualização. Por isso, antes de uma migração, **reduza o TTL** (por exemplo para 60 s) com pelo menos o tempo do TTL antigo de antecedência, faça a troca e aumente de novo depois. Registros com TTL de 24 h a que se pede troca imediata levam um dia para sumir de verdade. Respostas negativas (o nome não existe, `NXDOMAIN`) também são guardadas, pelo valor mínimo do SOA, então criar um registro logo depois de alguém consultá-lo pode demorar a aparecer.", "The practical consequence is the famous \"propagation\": when you change a record, each cache only finds out when the old TTL expires. There is no update \"broadcast\". So before a migration, **lower the TTL** (say to 60 s) at least one old-TTL ahead of time, make the switch and raise it again afterward. Records with a 24 h TTL where an immediate change is asked take a day to truly vanish. Negative answers (the name does not exist, `NXDOMAIN`) are also cached, for the SOA minimum value, so creating a record right after someone queried it may take a while to appear."]),

      h(["Como limpar o cache de DNS", "How to flush the DNS cache"]),
      p(["Quando você alterou um registro e sua máquina ainda enxerga o antigo, limpe o cache local. Isso só afeta o seu computador, não os resolvers dos outros. Confirme o resultado consultando um resolver direto, por exemplo `dig @8.8.8.8 www.exemplo.com`, que ignora o cache local.", "When you changed a record and your machine still sees the old one, flush the local cache. This only affects your own computer, not other people's resolvers. Confirm the result by querying a resolver directly, for example `dig @8.8.8.8 www.example.com`, which bypasses the local cache."]),
      code(`# Linux (systemd-resolved)
sudo resolvectl flush-caches
resolvectl statistics            # confirm that cache counters reset

# Linux with nscd or dnsmasq
sudo nscd -i hosts
sudo systemctl restart dnsmasq

# Windows (PowerShell or cmd, as administrator)
ipconfig /flushdns
ipconfig /displaydns             # shows what is still cached (older versions)

# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Chrome: open chrome://net-internals/#dns and click "Clear host cache"`),
      p(["Lembre que mesmo com o cache local limpo, o resolver do seu provedor ainda pode devolver o valor antigo até o TTL vencer. Trocar temporariamente o DNS do computador para 1.1.1.1 ou 8.8.8.8 ajuda a testar, e `dig +norecurse @ns1.exemplo.com www.exemplo.com` consulta direto o autoritativo, a fonte da verdade.", "Remember that even with the local cache flushed, your provider's resolver may still return the old value until the TTL expires. Temporarily switching the computer's DNS to 1.1.1.1 or 8.8.8.8 helps testing, and `dig +norecurse @ns1.example.com www.example.com` queries the authoritative directly, the source of truth."]),

      h(["DNS para balanceamento, failover e geografia", "DNS for balancing, failover and geography"]),
      p(["Como o DNS decide o que responder, ele pode distribuir tráfego. É uma forma barata de balanceamento, com limites claros por causa do cache.", "Since DNS decides what to answer, it can distribute traffic. It is a cheap form of balancing, with clear limits because of caching."]),
      ul(
        ["**Round-robin**: vários registros A para o mesmo nome; o servidor embaralha a ordem a cada resposta e os clientes tendem a usar o primeiro. Simples, mas não sabe quem está saudável e a distribuição é desigual, pois um resolver grande com cache representa milhares de usuários.", "**Round-robin**: several A records for the same name; the server shuffles the order each answer and clients tend to use the first. Simple, but unaware of who is healthy and distribution is uneven, since a large caching resolver represents thousands of users."],
        ["**Roteamento ponderado**: respostas proporcionais a pesos, útil para *canary* (10% para a versão nova) e migrações graduais.", "**Weighted routing**: answers proportional to weights, useful for *canary* (10% to the new version) and gradual migrations."],
        ["**Roteamento por latência e geo-DNS**: o autoritativo escolhe a resposta conforme a localização do resolver (ou, com a extensão EDNS Client Subnet, do cliente) e devolve o datacenter mais próximo, ou o de uma região exigida por lei. Route 53, NS1 e Cloudflare oferecem isso.", "**Latency routing and geo-DNS**: the authoritative picks the answer according to the resolver's location (or, with the EDNS Client Subnet extension, the client's) and returns the nearest datacenter, or one in a region required by law. Route 53, NS1 and Cloudflare offer this."],
        ["**Failover com health checks**: o provedor monitora cada endpoint e remove do DNS o que falhou, ou promove o secundário em um par ativo-passivo.", "**Failover with health checks**: the provider monitors each endpoint and removes the failed one from DNS, or promotes the secondary in an active-passive pair."],
        ["**Anycast**: o mesmo IP é anunciado por vários locais via BGP e a rede leva cada cliente ao mais próximo. É como os servidores raiz, os resolvers públicos e as CDNs funcionam.", "**Anycast**: the same IP is announced from many places via BGP and the network routes each client to the nearest. It is how root servers, public resolvers and CDNs work."],
      ),
      p(["O limite do failover por DNS é o TTL: mesmo com 30 s, alguns resolvers e aplicações o ignoram e seguram o valor por mais tempo, então parte dos usuários continua indo ao servidor morto. Para recuperação em segundos, combine DNS com balanceadores e IPs anycast ou flutuantes, em vez de depender só dele.", "The limit of DNS failover is the TTL: even at 30 s, some resolvers and applications ignore it and hold the value longer, so part of the users keep going to the dead server. For recovery in seconds, combine DNS with load balancers and anycast or floating IPs instead of relying on it alone."]),

      h(["DNSSEC de relance", "DNSSEC at a glance"]),
      p(["O DNS original confiava cegamente nas respostas, o que permite o *cache poisoning*: um atacante injeta uma resposta falsa no resolver e desvia milhões de usuários para um site falso. O **DNSSEC** acrescenta **assinaturas digitais** aos registros: a zona assina seus registros (RRSIG) com uma chave (DNSKEY), e a validade da chave é atestada pelo registro **DS** na zona-pai, formando uma cadeia de confiança que vai até a raiz. Um resolver que valida consegue detectar respostas adulteradas. Ele garante autenticidade e integridade, **não sigilo** (use DoH/DoT para isso), e exige cuidado operacional: uma rotação de chaves errada faz o domínio inteiro falhar para quem valida.", "Original DNS trusted answers blindly, which allows *cache poisoning*: an attacker injects a fake answer into the resolver and diverts millions of users to a fake site. **DNSSEC** adds **digital signatures** to records: the zone signs its records (RRSIG) with a key (DNSKEY), and the key's validity is vouched for by the **DS** record in the parent zone, forming a chain of trust up to the root. A validating resolver can detect tampered answers. It ensures authenticity and integrity, **not secrecy** (use DoH/DoT for that), and demands operational care: a wrong key rotation makes the whole domain fail for those who validate."]),

      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Esquecer de reduzir o TTL antes de uma migração e depois esperar horas pela propagação.", "Forgetting to lower the TTL before a migration and then waiting hours for propagation."],
        ["Colocar um CNAME no apex do domínio ou ao lado de um MX.", "Putting a CNAME at the domain apex or next to an MX."],
        ["Ter apenas um servidor autoritativo: sempre use ao menos dois NS em redes e provedores independentes.", "Having only one authoritative server: always use at least two NS on independent networks and providers."],
        ["Codificar IPs fixos na aplicação ou manter conexões eternas, ignorando mudanças de DNS.", "Hard-coding IPs in the application or keeping connections forever, ignoring DNS changes."],
        ["Confundir o cache do navegador com o do resolver ao testar mudanças.", "Confusing the browser cache with the resolver's when testing changes."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["O DNS traduz nomes em endereços por uma hierarquia raiz, TLD e autoritativo, com delegação entre os níveis.", "DNS translates names to addresses through a root, TLD and authoritative hierarchy, with delegation between levels."],
        ["O cliente conversa com o resolver recursivo, que percorre a hierarquia e guarda as respostas em cache.", "The client talks to the recursive resolver, which walks the hierarchy and caches the answers."],
        ["Os registros A, AAAA, CNAME, MX, TXT e NS cobrem a maioria dos usos; CNAME não vai no apex.", "A, AAAA, CNAME, MX, TXT and NS records cover most uses; CNAME does not go at the apex."],
        ["O TTL controla a duração do cache em vários níveis; reduza-o antes de mudanças.", "TTL controls cache duration at several levels; lower it before changes."],
        ["Round-robin, pesos, latência, geo-DNS e anycast distribuem tráfego, limitados pelo cache.", "Round-robin, weights, latency, geo-DNS and anycast distribute traffic, limited by caching."],
        ["DNSSEC assina as respostas; DoH e DoT cifram as consultas.", "DNSSEC signs the answers; DoH and DoT encrypt the queries."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Quanto tempo leva a propagação do DNS?** No máximo o maior TTL antigo em cache. Com TTL de 300 s, em geral minutos; com 86400 s, até um dia.", "**How long does DNS propagation take?** At most the longest old TTL in cache. With a 300 s TTL, usually minutes; with 86400 s, up to a day."],
        ["**Por que meu site abre para mim e não para outro?** Cada um usa um resolver diferente, com cache em momentos diferentes. Compare com `dig @8.8.8.8` e `dig @1.1.1.1`.", "**Why does my site open for me but not for someone else?** Each uses a different resolver, with caches at different moments. Compare with `dig @8.8.8.8` and `dig @1.1.1.1`."],
        ["**CNAME ou A?** Use A/AAAA quando controla o IP; CNAME quando aponta para um serviço de terceiros cujo IP muda (balanceador de nuvem, CDN).", "**CNAME or A?** Use A/AAAA when you control the IP; CNAME when pointing to a third-party service whose IP changes (cloud balancer, CDN)."],
        ["**O DNS é um ponto único de falha?** Pode ser, se mal configurado. Use vários NS em provedores diferentes e TTLs razoáveis.", "**Is DNS a single point of failure?** It can be, if poorly configured. Use several NS across different providers and reasonable TTLs."],
      ),
      tip(["O failover por DNS é limitado pelo TTL e por clientes que ignoram TTLs baixos. Para recuperação em segundos, combine com balanceadores e IPs anycast em vez de depender só do DNS.", "DNS failover is limited by TTL and by clients that ignore low TTLs. For recovery in seconds, combine it with load balancers and anycast IPs instead of relying on DNS alone."]),
    ] },

  { id: "apis-e-protocolos", section: "rede", level: 0, icon: "api", minutes: 14,
    title: ["APIs e protocolos de comunicação", "APIs and communication protocols"],
    summary: ["REST, maturidade, idempotência, paginação, versionamento, erros e OpenAPI.", "REST, maturity, idempotency, pagination, versioning, errors and OpenAPI."],
    body: [
      p(["Uma **API** (*Application Programming Interface*) é o contrato que diz como falar com um serviço: quais pedidos existem, o que enviar, o que esperar de volta e o que acontece quando algo dá errado. Quando o cliente é outro programa, a API é a interface do produto, e é difícil de mudar depois de publicada, porque aplicativos que você não controla dependem dela. Por isso, desenhar uma API é um exercício de **compatibilidade a longo prazo**, mais que de elegância.", "An **API** (*Application Programming Interface*) is the contract that says how to talk to a service: which requests exist, what to send, what to expect back and what happens when something goes wrong. When the client is another program, the API is the product's interface, and it is hard to change after publication, because apps you do not control depend on it. So designing an API is an exercise in **long-term compatibility** more than elegance."]),
      p(["Este artigo foca em APIs HTTP, o caso dominante, com **REST** como estilo central. O protocolo de transporte (HTTP/1.1, HTTP/2, gRPC, WebSocket) está no artigo sobre protocolos de comunicação; aqui o assunto é o desenho do contrato: recursos, métodos, erros, paginação, versões e documentação.", "This article focuses on HTTP APIs, the dominant case, with **REST** as the central style. The transport protocol (HTTP/1.1, HTTP/2, gRPC, WebSocket) is covered in the article on communication protocols; here the subject is contract design: resources, methods, errors, pagination, versions and documentation."]),

      fig(["Uma chamada de API do cliente ao banco", "One API call from client to database"],
        [[node("cl", ["App cliente", "Client app"], "client")], [node("gw", ["API gateway", "API gateway"], "edge")], [node("sv", ["Serviço de pedidos", "Orders service"], "service")], [node("ca", "Cache", "cache"), node("db", ["Banco de dados", "Database"], "data")]],
        [edge("cl", "gw", "GET /orders/42"), edge("gw", "sv", ["autentica e limita", "auth + limits"]), edge("sv", "ca", ["1. consulta", "1. lookup"]), edge("sv", "db", ["2. se errar", "2. on miss"], { dashed: true }), edge("sv", "cl", ["200 + JSON", "200 + JSON"], { dashed: true })]),

      h(["REST: recursos, verbos e restrições", "REST: resources, verbs and constraints"]),
      p(["O **REST** (*Representational State Transfer*), descrito por Roy Fielding em 2000, é um estilo arquitetural, não um padrão. Ele organiza a API em torno de **recursos** (substantivos com endereço, como `/pedidos/42`) manipulados por um conjunto pequeno e uniforme de verbos HTTP. As restrições centrais são: interface uniforme, cliente e servidor separados, **ausência de estado** entre requisições (cada pedido traz o que o servidor precisa, o que permite escalar horizontalmente), respostas **cacheáveis** quando possível e um sistema em camadas (proxies e gateways são transparentes).", "**REST** (*Representational State Transfer*), described by Roy Fielding in 2000, is an architectural style, not a standard. It organizes the API around **resources** (nouns with an address, such as `/orders/42`) manipulated through a small, uniform set of HTTP verbs. The central constraints are: uniform interface, separate client and server, **no state** between requests (each request carries what the server needs, which allows horizontal scaling), **cacheable** responses where possible and a layered system (proxies and gateways are transparent)."]),
      table([["Método", "Method"], ["Ação", "Action"], ["Seguro", "Safe"], ["Idempotente", "Idempotent"], ["Exemplo", "Example"]],
        [["GET", "GET"], ["Ler", "Read"], ["Sim", "Yes"], ["Sim", "Yes"], ["`GET /orders/42`", "`GET /orders/42`"]],
        [["POST", "POST"], ["Criar ou executar ação", "Create or run an action"], ["Não", "No"], ["Não", "No"], ["`POST /orders`", "`POST /orders`"]],
        [["PUT", "PUT"], ["Substituir inteiro", "Replace entirely"], ["Não", "No"], ["Sim", "Yes"], ["`PUT /orders/42`", "`PUT /orders/42`"]],
        [["PATCH", "PATCH"], ["Alterar parcialmente", "Partial update"], ["Não", "No"], ["Depende", "Depends"], ["`PATCH /orders/42`", "`PATCH /orders/42`"]],
        [["DELETE", "DELETE"], ["Remover", "Remove"], ["Não", "No"], ["Sim", "Yes"], ["`DELETE /orders/42`", "`DELETE /orders/42`"]]),
      p(["Algumas convenções de nomenclatura ajudam a evitar confusão: use **substantivos no plural** (`/orders`, não `/getOrders`), hierarquia só quando há posse real (`/orders/42/items`), minúsculas com hífen, e deixe a ação no verbo HTTP. Para operações que não são CRUD, como cancelar um pedido, é aceitável modelar como sub-recurso ou ação explícita (`POST /orders/42/cancel`), melhor do que forçar um `PATCH` obscuro.", "Some naming conventions help avoid confusion: use **plural nouns** (`/orders`, not `/getOrders`), hierarchy only when there is real ownership (`/orders/42/items`), lowercase with hyphens, and leave the action to the HTTP verb. For non-CRUD operations, such as cancelling an order, it is acceptable to model them as a sub-resource or an explicit action (`POST /orders/42/cancel`), better than forcing an obscure `PATCH`."]),

      h(["O modelo de maturidade de Richardson", "The Richardson maturity model"]),
      p(["Leonard Richardson propôs quatro níveis para medir o quanto uma API \"HTTP\" realmente usa os recursos da web. Serve como régua, não como meta obrigatória.", "Leonard Richardson proposed four levels to measure how much an \"HTTP\" API really uses the web's features. It serves as a ruler, not a mandatory goal."]),
      ul(
        ["**Nível 0**: um único endpoint e um único verbo (em geral `POST`) usados como túnel, como no SOAP e em muitas APIs RPC sobre HTTP.", "**Level 0**: a single endpoint and a single verb (usually `POST`) used as a tunnel, as in SOAP and many RPC-over-HTTP APIs."],
        ["**Nível 1**: **recursos** com endereços próprios (`/orders/42`), mas ainda com poucos verbos.", "**Level 1**: **resources** with their own addresses (`/orders/42`), but still few verbs."],
        ["**Nível 2**: uso correto dos **verbos HTTP e dos códigos de status**. É onde a maioria das APIs ditas REST para.", "**Level 2**: correct use of **HTTP verbs and status codes**. This is where most so-called REST APIs stop."],
        ["**Nível 3**: **HATEOAS** (*Hypermedia As The Engine Of Application State*): as respostas trazem links para as próximas ações possíveis, e o cliente os segue em vez de montar URLs.", "**Level 3**: **HATEOAS** (*Hypermedia As The Engine Of Application State*): responses carry links to the next possible actions, and the client follows them instead of building URLs."],
      ),
      code(`GET /orders/42
{
  "id": 42,
  "status": "pending",
  "total": 59.80,
  "_links": {
    "self":    { "href": "/orders/42" },
    "pay":     { "href": "/orders/42/payment", "method": "POST" },
    "cancel":  { "href": "/orders/42/cancel",  "method": "POST" },
    "items":   { "href": "/orders/42/items" }
  }
}`),
      p(["O HATEOAS promete um cliente desacoplado das URLs e que descobre o que pode fazer pelo estado (um pedido já pago não mostra o link `cancel`). Na prática é raro, porque clientes reais tendem a ter a lógica embutida de qualquer forma, e o custo extra pesa. Vale mais em APIs de longa vida com muitos clientes de terceiros.", "HATEOAS promises a client decoupled from URLs that discovers what it can do from the state (an already-paid order does not show the `cancel` link). In practice it is rare, because real clients tend to have the logic built in anyway, and the extra cost weighs. It is worth more in long-lived APIs with many third-party clients."]),

      h(["Idempotência e chaves de idempotência", "Idempotency and idempotency keys"]),
      p(["Uma operação é **idempotente** quando repeti-la produz o mesmo estado final que fazê-la uma vez. `PUT`, `DELETE` e `GET` são idempotentes por definição; `POST` não é. Isso importa porque redes falham: o cliente envia um pagamento, a conexão cai antes da resposta e ele não sabe se deu certo. Repetir é a atitude natural, e se o servidor processar duas vezes, o cliente é cobrado em dobro.", "An operation is **idempotent** when repeating it produces the same final state as doing it once. `PUT`, `DELETE` and `GET` are idempotent by definition; `POST` is not. This matters because networks fail: the client sends a payment, the connection drops before the response and it does not know whether it worked. Retrying is the natural move, and if the server processes twice, the customer is charged double."]),
      p(["A solução padrão é a **chave de idempotência**: o cliente gera um identificador único (um UUID) para a intenção e o envia em um cabeçalho (`Idempotency-Key`). O servidor guarda a chave junto do resultado; se a mesma chave chega de novo, devolve o resultado guardado sem reexecutar. O Stripe popularizou esse padrão em APIs de pagamento. A chave deve expirar depois de um tempo (por exemplo, 24 h) e a verificação precisa ser atômica, com uma restrição de unicidade no banco, para tolerar duas requisições simultâneas com a mesma chave.", "The standard solution is the **idempotency key**: the client generates a unique identifier (a UUID) for the intent and sends it in a header (`Idempotency-Key`). The server stores the key along with the result; if the same key arrives again, it returns the stored result without re-executing. Stripe popularized this pattern in payment APIs. The key should expire after a while (say, 24 h) and the check must be atomic, with a uniqueness constraint in the database, to tolerate two simultaneous requests with the same key."]),
      code(`// idempotent POST handler (pseudocode in TypeScript)
async function createPayment(req: Request): Promise<Response> {
  const key = req.headers.get("Idempotency-Key");
  if (!key) return json(400, { error: "missing_idempotency_key" });

  // atomic: INSERT ... ON CONFLICT DO NOTHING on a unique (key) column
  const first = await db.tryInsertKey(key, hash(req.body));
  if (!first) {
    const saved = await db.getResult(key);
    if (saved.bodyHash !== hash(req.body)) return json(422, { error: "key_reused_with_different_body" });
    return saved.response ?? json(409, { error: "in_progress" });
  }
  const result = await charge(req.body);
  await db.saveResult(key, result);
  return json(201, result);
}`),

      h(["Códigos de status e erros padronizados", "Status codes and standardized errors"]),
      p(["O código de status é parte do contrato e deve dizer ao cliente o que fazer. `200` OK, `201` criado (com `Location`), `202` aceito para processamento assíncrono, `204` sem conteúdo; `301`/`302`/`304` redirecionamentos e cache; `400` pedido malformado, `401` sem identidade, `403` sem permissão, `404` não existe, `409` conflito de estado, `422` entidade inválida semanticamente, `429` limite excedido (com `Retry-After`); `500` erro interno, `502` e `504` falhas de intermediário, `503` indisponível. A regra mais valiosa: **`4xx` é erro de quem chamou, não deve ser repetido sem mudar nada; `5xx` e `429` são candidatos a nova tentativa com backoff**.", "The status code is part of the contract and should tell the client what to do. `200` OK, `201` created (with `Location`), `202` accepted for asynchronous processing, `204` no content; `301`/`302`/`304` redirects and caching; `400` malformed request, `401` no identity, `403` no permission, `404` not found, `409` state conflict, `422` semantically invalid entity, `429` limit exceeded (with `Retry-After`); `500` internal error, `502` and `504` intermediary failures, `503` unavailable. The most valuable rule: **`4xx` is the caller's error and must not be retried unchanged; `5xx` and `429` are candidates for retry with backoff**."]),
      p(["Além do status, o corpo do erro deve ser **estruturado e consistente** em toda a API. O RFC 9457 (antigo 7807), *Problem Details for HTTP APIs*, define um formato JSON padrão com `type`, `title`, `status`, `detail` e `instance`, aberto a campos extras.", "Beyond the status, the error body should be **structured and consistent** across the whole API. RFC 9457 (formerly 7807), *Problem Details for HTTP APIs*, defines a standard JSON format with `type`, `title`, `status`, `detail` and `instance`, open to extra fields."]),
      code(`HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "detail": "2 fields are invalid.",
  "instance": "/v1/orders",
  "errors": [
    { "field": "items[0].qty", "message": "must be >= 1" },
    { "field": "customerId",   "message": "unknown customer" }
  ],
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
}`),

      h(["Paginação, filtros e ordenação", "Pagination, filtering and sorting"]),
      p(["Nunca devolva uma lista sem limite: ela cresce, estoura a memória e o tempo de resposta. Há três abordagens principais, com trocas distintas.", "Never return an unbounded list: it grows, blows memory and response time. There are three main approaches, with distinct trade-offs."]),
      table([["Estratégia", "Strategy"], ["Como funciona", "How it works"], ["Vantagem", "Advantage"], ["Problema", "Problem"]],
        [["Offset/limit", "Offset/limit"], ["`?offset=100&limit=20`", "`?offset=100&limit=20`"], ["Simples; permite pular para a página N", "Simple; allows jumping to page N"], ["Lento em offsets grandes; itens duplicados ou perdidos se há inserções", "Slow at large offsets; duplicated or missed items when inserts happen"]],
        [["Cursor (keyset)", "Cursor (keyset)"], ["`?after=ord_9001&limit=20`", "`?after=ord_9001&limit=20`"], ["Estável e rápido com índice; escala bem", "Stable and fast with an index; scales well"], ["Sem salto para página arbitrária", "No jump to an arbitrary page"]],
        [["Por página", "Page number"], ["`?page=5&size=20`", "`?page=5&size=20`"], ["Fácil para interfaces numeradas", "Easy for numbered UIs"], ["Mesmos problemas do offset", "Same problems as offset"]]),
      code(`GET /v1/orders?status=paid&sort=-createdAt&limit=20&after=ord_9001

{
  "data": [ { "id": "ord_9000", "total": 59.8 }, ... ],
  "page": { "limit": 20, "nextCursor": "ord_8981", "hasMore": true }
}

-- SQL behind the cursor (needs index on (created_at, id))
SELECT * FROM orders
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;`),
      p(["Para listas muito grandes, o cursor é a escolha profissional: o custo da consulta não cresce com a profundidade, e você evita o `COUNT(*)` total, que é caro em tabelas enormes.", "For very large lists, the cursor is the professional choice: the query cost does not grow with depth, and you avoid the total `COUNT(*)`, which is expensive on huge tables."]),

      h(["Versionamento e evolução", "Versioning and evolution"]),
      p(["A melhor estratégia é **evoluir sem quebrar**: adicionar campos opcionais, nunca remover nem mudar o significado, e exigir que os clientes ignorem campos desconhecidos (a *lei de Postel*). Quando uma mudança incompatível é inevitável, crie uma nova versão e mantenha a antiga por um período anunciado de descontinuação.", "The best strategy is to **evolve without breaking**: add optional fields, never remove or change meaning, and require clients to ignore unknown fields (*Postel's law*). When an incompatible change is unavoidable, create a new version and keep the old one for an announced deprecation period."]),
      ul(
        ["**No caminho** (`/v2/orders`): explícito, fácil de testar e de rotear no gateway. É o mais usado.", "**In the path** (`/v2/orders`): explicit, easy to test and to route at the gateway. The most used."],
        ["**Em cabeçalho** (`Accept: application/vnd.example.v2+json` ou `Api-Version: 2`): URLs limpas, porém mais difíceis de testar no navegador e de cachear.", "**In a header** (`Accept: application/vnd.example.v2+json` or `Api-Version: 2`): clean URLs, but harder to test in the browser and to cache."],
        ["**Por data** (como a Stripe): a conta fica presa à versão do dia em que começou e escolhe quando atualizar.", "**By date** (as Stripe does): the account is pinned to the version of the day it started and chooses when to upgrade."],
      ),
      p(["Sinalize a descontinuação nas respostas com cabeçalhos como `Deprecation` e `Sunset` (RFC 8594) e acompanhe nas métricas quem ainda usa a versão antiga antes de desligá-la.", "Signal deprecation in responses with headers such as `Deprecation` and `Sunset` (RFC 8594) and track in metrics who still uses the old version before turning it off."]),

      h(["Documentação com OpenAPI", "Documentation with OpenAPI"]),
      p(["O **OpenAPI** (antigo Swagger) é a especificação padrão para descrever APIs REST em YAML ou JSON. Do mesmo arquivo saem documentação interativa, clientes e esqueletos de servidor gerados, validação de requisições e testes de contrato. Tratar o arquivo como a fonte de verdade (o *design-first*) evita que a documentação e a implementação se afastem.", "**OpenAPI** (formerly Swagger) is the standard specification for describing REST APIs in YAML or JSON. From the same file come interactive documentation, generated clients and server skeletons, request validation and contract tests. Treating the file as the source of truth (*design-first*) prevents documentation and implementation from drifting apart."]),
      code(`openapi: 3.0.3
info:
  title: Orders API
  version: 1.0.0
paths:
  /orders/{id}:
    get:
      summary: Get an order
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: The order
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Order" }
        "404":
          description: Order not found
components:
  schemas:
    Order:
      type: object
      required: [id, status]
      properties:
        id: { type: integer }
        status: { type: string, enum: [pending, paid, cancelled] }
        total: { type: number }`),

      h(["Segurança, limites e boas práticas", "Security, limits and good practices"]),
      ul(
        ["**Autenticação**: OAuth 2.0 e tokens JWT de curta duração para usuários; chaves de API ou mTLS para serviços. Sempre sobre HTTPS.", "**Authentication**: OAuth 2.0 and short-lived JWT tokens for users; API keys or mTLS for services. Always over HTTPS."],
        ["**Autorização por recurso**: verifique se *este* usuário pode acessar *este* objeto, e não só se está logado (a falha BOLA/IDOR, líder no ranking de riscos da OWASP para APIs).", "**Per-resource authorization**: check whether *this* user may access *this* object, not just whether they are logged in (the BOLA/IDOR flaw, at the top of OWASP's API risk ranking)."],
        ["**Limites de taxa** com `429` e `Retry-After`, e limites de tamanho de corpo e de consulta.", "**Rate limits** with `429` and `Retry-After`, and body and query size limits."],
        ["**Validação** estrita de entrada pelo schema, nunca confiando no cliente.", "**Strict validation** of input against the schema, never trusting the client."],
        ["**Observabilidade**: um `traceId` em cada resposta e nos logs para correlacionar chamadas entre serviços.", "**Observability**: a `traceId` in every response and in logs to correlate calls across services."],
        ["**Cache**: `ETag` e `Cache-Control` em leituras, para economizar banda e processamento.", "**Caching**: `ETag` and `Cache-Control` on reads, to save bandwidth and processing."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Devolver `200 OK` com um corpo de erro, quebrando clientes e monitoramento que dependem do status.", "Returning `200 OK` with an error body, breaking clients and monitoring that rely on the status."],
        ["Verbos nas URLs (`/createOrder`) e formatos de erro diferentes em cada endpoint.", "Verbs in URLs (`/createOrder`) and different error formats on each endpoint."],
        ["Expor o modelo do banco diretamente: qualquer mudança de tabela vira quebra de API.", "Exposing the database model directly: any table change becomes an API break."],
        ["Esquecer paginação e limites desde o primeiro dia; adicioná-los depois é uma mudança incompatível.", "Forgetting pagination and limits from day one; adding them later is a breaking change."],
        ["Retornar IDs sequenciais previsíveis sem checar a autorização.", "Returning predictable sequential IDs without checking authorization."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["REST organiza a API em recursos e verbos HTTP uniformes, sem estado entre requisições.", "REST organizes the API around resources and uniform HTTP verbs, with no state between requests."],
        ["A maioria das APIs vive no nível 2 de Richardson; o HATEOAS (nível 3) é raro.", "Most APIs live at Richardson level 2; HATEOAS (level 3) is rare."],
        ["Idempotência com `Idempotency-Key` torna seguras as tentativas repetidas de `POST`.", "Idempotency with `Idempotency-Key` makes repeated `POST` attempts safe."],
        ["Status corretos e erros no formato Problem Details dizem ao cliente o que fazer.", "Correct statuses and errors in Problem Details format tell the client what to do."],
        ["Paginação por cursor escala melhor que offset; evolua sem quebrar e versione só quando preciso.", "Cursor pagination scales better than offset; evolve without breaking and version only when needed."],
        ["OpenAPI descreve o contrato e alimenta documentação, clientes e testes.", "OpenAPI describes the contract and feeds documentation, clients and tests."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**PUT ou PATCH?** `PUT` substitui o recurso inteiro e é idempotente; `PATCH` envia só as mudanças. Prefira `PATCH` para atualizações parciais.", "**PUT or PATCH?** `PUT` replaces the whole resource and is idempotent; `PATCH` sends only the changes. Prefer `PATCH` for partial updates."],
        ["**401 ou 403?** `401` significa que não sei quem você é; `403` que sei, mas você não pode.", "**401 or 403?** `401` means I do not know who you are; `403` that I do, but you may not."],
        ["**REST ou GraphQL?** REST para APIs públicas e cacheáveis; GraphQL quando clientes variados precisam de formatos de dados distintos.", "**REST or GraphQL?** REST for public, cacheable APIs; GraphQL when varied clients need different data shapes."],
        ["**Preciso implementar HATEOAS?** Normalmente não; o nível 2 bem feito já atende a maioria dos casos.", "**Do I need to implement HATEOAS?** Usually not; a well-done level 2 already serves most cases."],
      ),
      tip(["Trate a API como um produto: o contrato publicado é uma promessa. Comece pequeno, seja rigoroso com o que expõe e use testes de contrato para garantir que a implementação não se afaste do OpenAPI.", "Treat the API as a product: the published contract is a promise. Start small, be strict about what you expose and use contract tests to ensure the implementation does not drift from the OpenAPI."]),
    ] },

  { id: "proxies-forward-e-reverse", section: "rede", level: 1, icon: "swap_horiz", minutes: 14,
    title: ["Proxies: forward e reverse", "Proxies: forward and reverse"],
    summary: ["Forward, reverse e transparente, VPN, cache, WAF, TLS e um NGINX de exemplo.", "Forward, reverse and transparent, VPN, caching, WAF, TLS and an NGINX example."],
    body: [
      p(["Em uma conexão direta, o cliente fala com o servidor e cada um vê o endereço do outro. Isso é simples, mas inconveniente em muitos cenários: a empresa quer controlar para onde os funcionários navegam, o site quer distribuir carga entre dez máquinas sem que o usuário saiba, o time de segurança quer filtrar ataques antes que cheguem à aplicação. A resposta comum é colocar um **proxy** no meio. Um proxy é um intermediário que recebe a requisição de uma ponta e a repassa à outra, podendo inspecioná-la, modificá-la, guardar a resposta ou negá-la.", "In a direct connection, the client talks to the server and each sees the other's address. That is simple but inconvenient in many scenarios: the company wants to control where employees browse, the site wants to spread load across ten machines without the user knowing, the security team wants to filter attacks before they reach the application. The common answer is to put a **proxy** in the middle. A proxy is an intermediary that receives a request from one end and forwards it to the other, and may inspect it, modify it, cache the response or deny it."]),
      p(["O que distingue os tipos de proxy não é a tecnologia (o mesmo NGINX pode ser os dois), e sim **de que lado ele trabalha**, isto é, a quem representa. Esse é o ponto que mais confunde quem está começando, então vale fixá-lo: o *forward proxy* representa o **cliente** perante a internet; o *reverse proxy* representa o **servidor** perante os clientes.", "What distinguishes proxy types is not the technology (the same NGINX can be both), but **which side it works for**, that is, whom it represents. This is the point that most confuses beginners, so it is worth fixing: the *forward proxy* represents the **client** to the internet; the *reverse proxy* represents the **server** to the clients."]),

      h(["Forward proxy: no lado do cliente", "Forward proxy: on the client side"]),
      p(["O forward proxy fica na frente dos **clientes** e sai para a internet em nome deles. O cliente é configurado para usá-lo (no navegador, no sistema ou por variáveis como `HTTPS_PROXY`), e o servidor de destino vê o IP do proxy, não o do cliente. Em HTTPS o cliente pede ao proxy um túnel com o método `CONNECT host:443` e passa a trocar bytes cifrados por ele, sem que o proxy leia o conteúdo (a menos que a empresa instale seu próprio certificado e faça inspeção TLS).", "The forward proxy sits in front of the **clients** and goes out to the internet on their behalf. The client is configured to use it (in the browser, in the system or via variables such as `HTTPS_PROXY`), and the destination server sees the proxy's IP, not the client's. With HTTPS the client asks the proxy for a tunnel with the `CONNECT host:443` method and exchanges encrypted bytes through it, without the proxy reading the content (unless the company installs its own certificate and performs TLS inspection)."]),
      fig(["Forward proxy: o proxy representa os clientes", "Forward proxy: the proxy represents the clients"],
        [[node("c1", ["Funcionário A", "Employee A"], "client"), node("c2", ["Funcionário B", "Employee B"], "client")],
         [node("fp", ["Forward\nproxy", "Forward\nproxy"], "edge")],
         [node("net", ["Internet\n(sites)", "Internet\n(sites)"], "ext")]],
        [edge("c1", "fp"), edge("c2", "fp"), edge("fp", "net", ["IP do proxy", "proxy IP"])]),
      ul(
        ["**Controle e auditoria** em redes corporativas: bloquear categorias de sites, registrar acessos, aplicar políticas de uso.", "**Control and auditing** on corporate networks: block site categories, log access, enforce usage policies."],
        ["**Anonimato e contorno de bloqueios geográficos**: o destino vê outro IP. Serviços de proxy e VPN fazem isso, com uma diferença: a VPN cifra todo o tráfego do dispositivo por um túnel na camada de rede, enquanto um proxy costuma tratar só o tráfego de aplicações configuradas.", "**Anonymity and bypassing geo-blocks**: the destination sees another IP. Proxy and VPN services do this, with one difference: a VPN encrypts all of the device's traffic through a tunnel at the network layer, while a proxy usually handles only the traffic of configured applications."],
        ["**Cache compartilhado** de downloads, como um espelho interno de pacotes (Nexus, Artifactory) que evita baixar a mesma dependência mil vezes.", "**Shared cache** of downloads, such as an internal package mirror (Nexus, Artifactory) that avoids downloading the same dependency a thousand times."],
        ["**Saída controlada de servidores** (*egress filtering*): só o proxy pode chamar a internet, e só para uma lista permitida de destinos, o que limita o estrago se um servidor for comprometido.", "**Controlled egress from servers** (*egress filtering*): only the proxy may call the internet, and only to an allowed list of destinations, which limits the damage if a server is compromised."],
      ),

      h(["Reverse proxy: no lado do servidor", "Reverse proxy: on the server side"]),
      p(["O reverse proxy fica na frente dos **servidores**. O cliente acredita falar com o site, mas fala com o proxy, que escolhe um servidor real atrás dele e repassa a requisição. O cliente não precisa de configuração alguma, e não sabe quantos servidores existem, onde estão ou se um deles caiu. É a peça mais presente em arquiteturas web.", "The reverse proxy sits in front of the **servers**. The client believes it talks to the site, but talks to the proxy, which picks a real server behind it and forwards the request. The client needs no configuration at all, and does not know how many servers exist, where they are or whether one has failed. It is the most common piece in web architectures."]),
      fig(["Reverse proxy: o proxy representa os servidores", "Reverse proxy: the proxy represents the servers"],
        [[node("u1", ["Usuários", "Users"], "client")],
         [node("rp", ["Reverse proxy\nTLS, cache, WAF", "Reverse proxy\nTLS, cache, WAF"], "edge")],
         [node("a", ["App 1", "App 1"], "service"), node("b", ["App 2", "App 2"], "service"), node("s", ["Estáticos", "Static files"], "cache")]],
        [edge("u1", "rp", "HTTPS"), edge("rp", "a", "HTTP"), edge("rp", "b", "HTTP"), edge("rp", "s", "/static")]),
      p(["Em vez de ficar sobrecarregado com tudo isso, o servidor de aplicação passa a cuidar só de lógica. As responsabilidades típicas do reverse proxy:", "Instead of being overloaded with all this, the application server now handles only logic. The typical reverse proxy responsibilities:"]),
      ul(
        ["**Balanceamento de carga** entre várias instâncias, com *health checks* e algoritmos como round-robin, menos conexões e hash consistente.", "**Load balancing** across several instances, with health checks and algorithms such as round-robin, least connections and consistent hash."],
        ["**Terminação de TLS**: certificados, renovação e criptografia em um só lugar, aliviando a CPU dos servidores de aplicação.", "**TLS termination**: certificates, renewal and encryption in one place, relieving the application servers' CPU."],
        ["**Cache e compressão** (gzip, Brotli) de respostas estáticas e de conteúdo público.", "**Caching and compression** (gzip, Brotli) of static responses and public content."],
        ["**Proteção**: esconde a topologia interna, aplica limites de taxa, bloqueia IPs abusivos e roda um **WAF** (*Web Application Firewall*) que reconhece padrões de ataque como injeção de SQL e XSS.", "**Protection**: hides the internal topology, applies rate limits, blocks abusive IPs and runs a **WAF** (*Web Application Firewall*) that recognizes attack patterns such as SQL injection and XSS."],
        ["**Roteamento por host ou caminho**: `/api` para um serviço, `/` para outro, `blog.exemplo.com` para um terceiro.", "**Routing by host or path**: `/api` to one service, `/` to another, `blog.example.com` to a third."],
        ["**Terminação de HTTP/2 e HTTP/3**: fala os protocolos modernos com o cliente e HTTP/1.1 simples com o backend.", "**HTTP/2 and HTTP/3 termination**: speaks modern protocols with the client and plain HTTP/1.1 with the backend."],
      ),
      table([["Aspecto", "Aspect"], ["Forward proxy", "Forward proxy"], ["Reverse proxy", "Reverse proxy"]],
        [["Representa", "Represents"], ["Os clientes", "The clients"], ["Os servidores", "The servers"]],
        [["Quem o configura", "Who configures it"], ["O cliente (ou a rede dele)", "The client (or its network)"], ["Quem opera o site", "Whoever runs the site"]],
        [["Quem é escondido", "Who is hidden"], ["O cliente", "The client"], ["Os servidores", "The servers"]],
        [["Uso típico", "Typical use"], ["Filtro corporativo, anonimato, cache de saída", "Corporate filter, anonymity, egress cache"], ["Balanceamento, TLS, cache, WAF", "Balancing, TLS, cache, WAF"]],
        [["Exemplos", "Examples"], ["Squid, proxies de VPN", "Squid, VPN proxies"], ["NGINX, HAProxy, Envoy, Traefik, CDNs", "NGINX, HAProxy, Envoy, Traefik, CDNs"]]),

      h(["Proxy transparente, VPN e inspeção", "Transparent proxy, VPN and inspection"]),
      p(["Um **proxy transparente** (ou interceptador) é um forward proxy em que o cliente nem sabe: o roteador ou o firewall redireciona o tráfego da porta 80 ou 443 para o proxy, sem configuração no dispositivo. É comum em redes de hotéis, escolas e provedores para filtro ou cache. A desvantagem é que, com HTTPS, só dá para inspecionar o conteúdo se o proxy se passar pelo site com um certificado próprio (*TLS interception*), o que exige instalar uma CA confiável nas máquinas e traz riscos de privacidade e de segurança.", "A **transparent proxy** (or intercepting proxy) is a forward proxy where the client does not even know: the router or firewall redirects port 80 or 443 traffic to the proxy, with no device configuration. It is common in hotel, school and ISP networks for filtering or caching. The drawback is that, with HTTPS, content can only be inspected if the proxy impersonates the site with its own certificate (*TLS interception*), which requires installing a trusted CA on the machines and brings privacy and security risks."]),
      p(["A **VPN** (*Virtual Private Network*) não é exatamente um proxy, mas cumpre um papel parecido: cria um túnel cifrado até uma rede remota (WireGuard, IPsec, OpenVPN) e o tráfego do dispositivo sai por lá. Serve para acessar a rede da empresa de casa ou para ocultar o IP. Em arquiteturas de nuvem, é comum ligar duas redes por uma VPN site a site.", "A **VPN** (*Virtual Private Network*) is not exactly a proxy, but plays a similar role: it creates an encrypted tunnel to a remote network (WireGuard, IPsec, OpenVPN) and the device's traffic leaves through there. It serves to reach the company network from home or to hide the IP. In cloud architectures, linking two networks with a site-to-site VPN is common."]),

      h(["Um reverse proxy na prática: NGINX", "A reverse proxy in practice: NGINX"]),
      p(["O NGINX é o reverse proxy mais usado do mundo. A configuração abaixo reúne os recursos principais: balanceamento com health check passivo, terminação de TLS, redirecionamento de HTTP para HTTPS, cache de respostas, compressão, servir estáticos diretamente e repasse dos cabeçalhos que a aplicação precisa para saber quem é o cliente real.", "NGINX is the world's most used reverse proxy. The configuration below brings together the main features: balancing with passive health checks, TLS termination, HTTP-to-HTTPS redirect, response caching, compression, serving static files directly and forwarding the headers the application needs to know who the real client is."]),
      code(`proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=10m;

upstream app_backend {
    least_conn;
    server 10.0.1.11:8080 max_fails=3 fail_timeout=10s;
    server 10.0.1.12:8080 max_fails=3 fail_timeout=10s;
    server 10.0.1.13:8080 backup;
    keepalive 64;                       # reuse connections to the backend
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/ssl/example.com.crt;
    ssl_certificate_key /etc/ssl/example.com.key;
    ssl_protocols       TLSv1.2 TLSv1.3;

    gzip on;
    gzip_types text/css application/json application/javascript;

    location /static/ {
        root /var/www;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /api/ {
        proxy_pass http://app_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";          # needed for upstream keepalive
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 2s;
        proxy_read_timeout 30s;
        proxy_next_upstream error timeout http_502 http_503;

        proxy_cache api_cache;
        proxy_cache_valid 200 1m;
        proxy_cache_use_stale error timeout updating;
    }
}`),
      p(["Pontos que merecem atenção: `least_conn` envia a próxima requisição ao servidor com menos conexões ativas; `max_fails` e `fail_timeout` implementam a detecção passiva de falhas; `keepalive` e `Connection \"\"` reaproveitam conexões com o backend, evitando abrir uma por requisição; `proxy_next_upstream` tenta outro servidor em erro (cuide para só repetir operações idempotentes); e `proxy_cache_use_stale` serve a cópia antiga quando o backend está falhando, o que dá resiliência quase de graça.", "Points worth attention: `least_conn` sends the next request to the server with the fewest active connections; `max_fails` and `fail_timeout` implement passive failure detection; `keepalive` and `Connection \"\"` reuse connections to the backend, avoiding opening one per request; `proxy_next_upstream` tries another server on error (take care to only retry idempotent operations); and `proxy_cache_use_stale` serves the old copy when the backend is failing, which gives resilience almost for free."]),

      h(["IP real do cliente e cabeçalhos", "Real client IP and headers"]),
      p(["Quando a requisição passa por um proxy, o servidor de aplicação enxerga o IP do proxy como origem. Para recuperar o IP real, o proxy acrescenta cabeçalhos: o `X-Forwarded-For` (uma lista, em que cada salto acrescenta o IP de quem lhe enviou), o `X-Forwarded-Proto` (se o cliente usou HTTP ou HTTPS) e o padronizado `Forwarded`. O risco é que **qualquer cliente pode enviar esses cabeçalhos forjados**. A aplicação só deve confiar neles quando a conexão vier de um proxy conhecido, e usar o último ou penúltimo valor adicionado por infraestrutura sua, não o primeiro. Um erro clássico é ler o primeiro valor do `X-Forwarded-For` para aplicar limites de taxa: o atacante simplesmente envia um valor novo a cada requisição.", "When a request passes through a proxy, the application server sees the proxy's IP as the source. To recover the real IP, the proxy adds headers: `X-Forwarded-For` (a list, in which each hop appends the IP of whoever sent it to it), `X-Forwarded-Proto` (whether the client used HTTP or HTTPS) and the standardized `Forwarded`. The risk is that **any client can send these headers forged**. The application should only trust them when the connection comes from a known proxy, and use the last or second-to-last value added by your own infrastructure, not the first. A classic mistake is reading the first `X-Forwarded-For` value to apply rate limits: the attacker simply sends a new value on every request."]),

      h(["Proxies no ecossistema moderno", "Proxies in the modern ecosystem"]),
      p(["**HAProxy** é focado em balanceamento TCP e HTTP de altíssimo desempenho; **Envoy** nasceu na Lyft e é a base de muitos service meshes e gateways, com configuração dinâmica por API; **Traefik** descobre rotas automaticamente em Docker e Kubernetes; **Squid** é o forward proxy clássico. **CDNs** como Cloudflare e Fastly são, na essência, reverse proxies globais com cache e WAF em centenas de pontos de presença. No Kubernetes, o *ingress controller* (muitas vezes um NGINX ou Envoy) cumpre esse papel, e em *service meshes* o Envoy roda como **sidecar** ao lado de cada serviço, tratando mTLS, *retries* e métricas.", "**HAProxy** focuses on very high-performance TCP and HTTP balancing; **Envoy** was born at Lyft and underpins many service meshes and gateways, with dynamic configuration over an API; **Traefik** discovers routes automatically in Docker and Kubernetes; **Squid** is the classic forward proxy. **CDNs** such as Cloudflare and Fastly are, in essence, global reverse proxies with cache and WAF at hundreds of points of presence. In Kubernetes the *ingress controller* (often NGINX or Envoy) plays this role, and in *service meshes* Envoy runs as a **sidecar** next to each service, handling mTLS, retries and metrics."]),
      h(["Vantagens, custos e quando evitar", "Advantages, costs and when to avoid"]),
      ul(
        ["**Vantagens**: um ponto único para segurança, TLS, cache e roteamento; os servidores ficam simples e substituíveis; mudanças de topologia ficam invisíveis ao cliente.", "**Advantages**: a single point for security, TLS, caching and routing; servers stay simple and replaceable; topology changes stay invisible to the client."],
        ["**Custos**: um salto a mais (microssegundos a milissegundos), mais um componente a operar, e, se for único, um **ponto único de falha**. Rode ao menos dois, atrás de um IP virtual (keepalived/VRRP), de anycast ou de DNS.", "**Costs**: an extra hop (microseconds to milliseconds), one more component to operate and, if single, a **single point of failure**. Run at least two, behind a virtual IP (keepalived/VRRP), anycast or DNS."],
        ["**Quando evitar**: em um sistema minúsculo com uma única instância e sem TLS próprio, ele só acrescenta complexidade; e em tráfego de latência ultrabaixa (trading), cada salto conta.", "**When to avoid**: in a tiny system with a single instance and no TLS of its own, it only adds complexity; and in ultra-low-latency traffic (trading), every hop counts."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Confiar em `X-Forwarded-For` vindo direto da internet.", "Trusting `X-Forwarded-For` coming straight from the internet."],
        ["Timeouts do proxy menores que os da aplicação (ou o contrário), produzindo erros 502/504 intermitentes.", "Proxy timeouts shorter than the application's (or the reverse), producing intermittent 502/504 errors."],
        ["Fazer cache de respostas personalizadas, vazando a página de um usuário para outro. Varie o cache por cookie ou `Vary`, ou não faça cache.", "Caching personalized responses, leaking one user's page to another. Vary the cache by cookie or `Vary`, or do not cache."],
        ["Esquecer o `Host` ao repassar, fazendo a aplicação gerar links com o nome interno.", "Forgetting `Host` when forwarding, making the application generate links with the internal name."],
        ["Não reaproveitar conexões com o backend e esgotar portas efêmeras sob carga.", "Not reusing backend connections and exhausting ephemeral ports under load."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["Proxy é um intermediário; o que o diferencia é o lado que representa.", "A proxy is an intermediary; what sets it apart is the side it represents."],
        ["Forward proxy representa clientes: controle, anonimato, cache e filtro de saída.", "A forward proxy represents clients: control, anonymity, caching and egress filtering."],
        ["Reverse proxy representa servidores: balanceamento, TLS, cache, WAF e roteamento.", "A reverse proxy represents servers: balancing, TLS, cache, WAF and routing."],
        ["Proxy transparente intercepta sem configuração; VPN cifra todo o tráfego do dispositivo.", "A transparent proxy intercepts without configuration; a VPN encrypts all device traffic."],
        ["Leia o IP real por `X-Forwarded-For`, mas só confie nele vindo de proxies seus.", "Read the real IP from `X-Forwarded-For`, but only trust it coming from your own proxies."],
        ["Rode proxies redundantes para não criar um ponto único de falha.", "Run redundant proxies to avoid creating a single point of failure."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Reverse proxy e load balancer são a mesma coisa?** O balanceador é uma das funções do reverse proxy; muitos reverse proxies (NGINX, HAProxy, Envoy) fazem as duas.", "**Are a reverse proxy and a load balancer the same thing?** Balancing is one function of the reverse proxy; many reverse proxies (NGINX, HAProxy, Envoy) do both."],
        ["**Uma CDN é um reverse proxy?** Sim, distribuído globalmente, com cache nas pontas.", "**Is a CDN a reverse proxy?** Yes, distributed globally, with cache at the edges."],
        ["**Um proxy lê meu tráfego HTTPS?** Um forward proxy normal só vê o destino do `CONNECT`; só lê o conteúdo se fizer inspeção TLS com certificado próprio instalado.", "**Does a proxy read my HTTPS traffic?** A normal forward proxy only sees the `CONNECT` destination; it reads content only if it performs TLS inspection with its own installed certificate."],
        ["**Posso usar um proxy para esconder meu servidor de ataques?** Ajuda (o IP de origem não é exposto), mas só se o servidor aceitar conexões apenas do proxy ou da CDN.", "**Can I use a proxy to hide my server from attacks?** It helps (the origin IP is not exposed), but only if the server accepts connections solely from the proxy or CDN."],
      ),
      tip(["Ao repassar a requisição, o reverse proxy esconde o IP real do cliente. Leia-o do cabeçalho `X-Forwarded-For` (ou `Forwarded`) e só confie nele quando vier de um proxy seu.", "When forwarding, the reverse proxy hides the client's real IP. Read it from the `X-Forwarded-For` (or `Forwarded`) header and only trust it when it comes from your own proxy."]),
    ] },

  { id: "servidores-web-e-de-aplicacao", section: "rede", level: 1, icon: "dns", minutes: 14,
    title: ["Servidores web e de aplicação", "Web and application servers"],
    summary: ["Apache, NGINX, Tomcat, Node e Gunicorn: modelos de concorrência, pools, filas e keep-alive.", "Apache, NGINX, Tomcat, Node and Gunicorn: concurrency models, pools, queues and keep-alive."],
    body: [
      p(["Quando você coloca um sistema no ar, alguma coisa precisa ficar escutando uma porta, aceitar conexões, entender o HTTP e entregar cada requisição ao código certo. Essa \"alguma coisa\" são os servidores web e de aplicação, e a escolha entre eles (e de como configurá-los) determina quantas requisições por segundo você aguenta, quanta memória gasta e como o sistema se comporta sob sobrecarga. Muitos incidentes de produção não vêm de bugs de lógica, mas de um pool pequeno demais, de um timeout mal ajustado ou de uma fila que cresceu sem limite.", "When you put a system online, something has to listen on a port, accept connections, understand HTTP and hand each request to the right code. That \"something\" is the web and application servers, and the choice between them (and how to configure them) determines how many requests per second you handle, how much memory is used and how the system behaves under overload. Many production incidents come not from logic bugs but from a pool that is too small, a badly tuned timeout or a queue that grew without bound."]),

      h(["Servidor web x servidor de aplicação", "Web server vs application server"]),
      p(["Um **servidor web** (NGINX, Apache httpd, Caddy) é especializado no protocolo: aceita conexões, faz TLS, lê o HTTP, serve **arquivos estáticos** do disco, comprime, aplica limites e **repassa** requisições dinâmicas adiante. Um **servidor de aplicação** (Tomcat, Jetty, Gunicorn, uWSGI, Puma, Node.js, Uvicorn) executa o **código do seu negócio** na linguagem escolhida, gerencia o ciclo de vida das requisições e conversa com o banco. A fronteira é difusa, porque Node e Go servem HTTP sozinhos e o Apache pode executar PHP internamente, mas a divisão de responsabilidades continua útil.", "A **web server** (NGINX, Apache httpd, Caddy) specializes in the protocol: it accepts connections, does TLS, reads HTTP, serves **static files** from disk, compresses, applies limits and **forwards** dynamic requests onward. An **application server** (Tomcat, Jetty, Gunicorn, uWSGI, Puma, Node.js, Uvicorn) runs **your business code** in the chosen language, manages the request lifecycle and talks to the database. The boundary is blurry, because Node and Go serve HTTP on their own and Apache can run PHP internally, but the division of responsibilities remains useful."]),
      fig(["Arquitetura em três camadas", "Three-tier architecture"],
        [[node("cl", ["Navegador\nou app", "Browser\nor app"], "client")],
         [node("web", ["Servidor web\nNGINX", "Web server\nNGINX"], "edge")],
         [node("app", ["Servidor de\naplicação", "Application\nserver"], "service")],
         [node("db", ["Banco de\ndados", "Database"], "data"), node("ch", "Cache", "cache")]],
        [edge("cl", "web", "HTTPS"), edge("web", "app", ["HTTP/FastCGI/\nuwsgi", "HTTP/FastCGI/\nuwsgi"]), edge("app", "db", "SQL"), edge("app", "ch")]),
      p(["Esse desenho é o clássico de **três camadas**: apresentação (cliente e servidor web), lógica (servidor de aplicação) e dados. O servidor web na frente absorve conexões lentas, faz TLS, serve estáticos e protege a aplicação; atrás, o servidor de aplicação fica livre para trabalhar. Em contêineres, isso costuma virar um *ingress* ou *sidecar* NGINX na frente de um processo Gunicorn, Puma ou Node.", "This is the classic **three-tier** design: presentation (client and web server), logic (application server) and data. The web server in front absorbs slow connections, does TLS, serves static files and protects the application; behind, the application server is free to work. In containers this often becomes an NGINX *ingress* or *sidecar* in front of a Gunicorn, Puma or Node process."]),
      p(["Na prática, o repasse usa protocolos específicos: HTTP simples (`proxy_pass`) para Node, Tomcat e Gunicorn; **FastCGI** para PHP-FPM; **uwsgi** para o uWSGI; ou, no ecossistema Python moderno, a interface **WSGI** (síncrona) e **ASGI** (assíncrona) entre servidor e framework (Gunicorn com Uvicorn workers para FastAPI; em Java, a *Servlet API* implementada pelo Tomcat).", "In practice the handoff uses specific protocols: plain HTTP (`proxy_pass`) for Node, Tomcat and Gunicorn; **FastCGI** for PHP-FPM; **uwsgi** for uWSGI; or, in the modern Python ecosystem, the **WSGI** (synchronous) and **ASGI** (asynchronous) interface between server and framework (Gunicorn with Uvicorn workers for FastAPI; in Java, the *Servlet API* implemented by Tomcat)."]),

      h(["Modelos de concorrência", "Concurrency models"]),
      p(["A pergunta central é: como o servidor atende **milhares de conexões ao mesmo tempo**? Há três respostas clássicas, e entendê-las explica o comportamento de cada produto.", "The central question is: how does the server handle **thousands of simultaneous connections**? There are three classic answers, and understanding them explains how each product behaves."]),
      ul(
        ["**Um processo por conexão** (Apache *prefork*, Gunicorn com workers síncronos): cada requisição ocupa um processo inteiro. Isolamento ótimo (um travamento não afeta os outros) e código simples, mas o custo de memória é alto, de dezenas de MB por processo. Com 10 mil conexões ociosas, o servidor sofre.", "**One process per connection** (Apache *prefork*, Gunicorn with synchronous workers): each request occupies a whole process. Excellent isolation (a hang does not affect others) and simple code, but memory cost is high, tens of MB per process. With 10k idle connections the server suffers."],
        ["**Uma thread por conexão** (Apache *worker*/*event*, Tomcat clássico, Jetty): threads são mais leves que processos (de centenas de KB a poucos MB de pilha), compartilham memória e permitem milhares de conexões, mas a troca de contexto e a memória ainda limitam o teto. O código é simples e bloqueante.", "**One thread per connection** (Apache *worker*/*event*, classic Tomcat, Jetty): threads are lighter than processes (hundreds of KB to a few MB of stack), share memory and allow thousands of connections, but context switching and memory still cap the ceiling. The code is simple and blocking."],
        ["**Orientado a eventos** (NGINX, Node.js, Redis, Vert.x): poucos *workers* (em geral um por núcleo) com um laço de eventos e **I/O não bloqueante** (`epoll` no Linux, `kqueue` no BSD) atendem dezenas de milhares de conexões, pois uma conexão ociosa custa apenas alguns KB. Excelente para conexões lentas ou longas. O perigo: uma tarefa pesada de CPU (parsing enorme, criptografia, um laço longo) **bloqueia o laço** e trava todas as conexões do worker.", "**Event-driven** (NGINX, Node.js, Redis, Vert.x): a few *workers* (usually one per core) with an event loop and **non-blocking I/O** (`epoll` on Linux, `kqueue` on BSD) handle tens of thousands of connections, since an idle connection costs only a few KB. Excellent for slow or long connections. The danger: a heavy CPU task (huge parsing, cryptography, a long loop) **blocks the loop** and stalls all of the worker's connections."],
        ["**Threads leves e corrotinas** (goroutines em Go, threads virtuais do Java 21, processos do Erlang, `async/await` em Python e Rust): escrevem-se programas em estilo bloqueante e simples, e o runtime multiplexa milhões de tarefas leves sobre poucas threads do sistema.", "**Lightweight threads and coroutines** (goroutines in Go, Java 21 virtual threads, Erlang processes, `async/await` in Python and Rust): programs are written in simple blocking style, and the runtime multiplexes millions of light tasks over a few OS threads."],
      ),
      table([["Servidor", "Server"], ["Modelo", "Model"], ["Ponto forte", "Strength"], ["Atenção", "Watch out"]],
        [["Apache httpd", "Apache httpd"], ["Processos ou threads (MPM prefork/worker/event)", "Processes or threads (MPM prefork/worker/event)"], ["Módulos, `.htaccess`, enorme ecossistema", "Modules, `.htaccess`, huge ecosystem"], ["Mais memória por conexão; prefork não escala em conexões longas", "More memory per connection; prefork does not scale for long connections"]],
        [["NGINX", "NGINX"], ["Eventos, workers por núcleo", "Events, one worker per core"], ["Estáticos, proxy reverso, muitas conexões", "Static files, reverse proxy, many connections"], ["Lógica dinâmica exige um backend", "Dynamic logic needs a backend"]],
        [["Tomcat", "Tomcat"], ["Pool de threads (NIO)", "Thread pool (NIO)"], ["Servlets e Java EE, maduro", "Servlets and Java EE, mature"], ["`maxThreads` e filas precisam de ajuste", "`maxThreads` and queues need tuning"]],
        [["Node.js", "Node.js"], ["Laço de eventos único por processo", "Single event loop per process"], ["I/O intenso, WebSockets", "Heavy I/O, WebSockets"], ["CPU pesada trava o laço; use cluster/worker threads", "Heavy CPU stalls the loop; use cluster/worker threads"]],
        [["Gunicorn", "Gunicorn"], ["Pré-fork de workers (sync, gthread, async)", "Pre-fork workers (sync, gthread, async)"], ["Padrão em Python/WSGI", "Standard in Python/WSGI"], ["Workers sync não suportam conexões longas; ponha NGINX na frente", "Sync workers do not support long connections; put NGINX in front"]]),

      h(["Pools, filas e dimensionamento", "Pools, queues and sizing"]),
      p(["Servidores de aplicação limitam a concorrência de propósito, com um **pool de threads** (Tomcat: `maxThreads`, 200 por padrão) ou de processos (Gunicorn: `--workers`). Sem esse limite, uma explosão de tráfego criaria threads até esgotar a memória. Quando o pool enche, as requisições novas esperam em duas **filas** em série: a fila de aceitação do sistema operacional (o *backlog* do `listen`, e no Tomcat o `acceptCount`) e a fila interna do servidor. Se as filas também enchem, novas conexões são recusadas. O sintoma típico é a latência disparar muito antes de os erros aparecerem, porque a requisição passa a maior parte do tempo **esperando na fila**, não sendo processada.", "Application servers limit concurrency on purpose, with a **thread pool** (Tomcat: `maxThreads`, 200 by default) or a process pool (Gunicorn: `--workers`). Without that limit, a traffic burst would create threads until memory ran out. When the pool fills, new requests wait in two **queues** in series: the operating system's accept queue (the `listen` *backlog*, and in Tomcat `acceptCount`) and the server's internal queue. If the queues fill too, new connections are refused. The typical symptom is latency spiking long before errors appear, because the request spends most of its time **waiting in the queue**, not being processed."]),
      p(["A mesma lógica vale para o **pool de conexões com o banco**: se 200 threads competem por 20 conexões, 180 esperam. Dimensione de trás para frente: o banco aguenta N conexões ativas, então o total de instâncias vezes o pool de cada uma deve caber nisso, com folga. Cem instâncias com pool de 20 pedem 2000 conexões, o que muitos bancos (PostgreSQL, por exemplo) não suportam bem sem um intermediário como o PgBouncer.", "The same logic applies to the **database connection pool**: if 200 threads compete for 20 connections, 180 wait. Size from the back to the front: the database handles N active connections, so instances times each one's pool must fit within that, with headroom. A hundred instances with a pool of 20 ask for 2000 connections, which many databases (PostgreSQL, for instance) do not handle well without an intermediary such as PgBouncer."]),
      p(["A **Lei de Little** dá a conta de partida: concorrência média = vazão × latência. Se você quer 500 requisições por segundo e cada uma leva 100 ms, precisa de cerca de 50 requisições em andamento ao mesmo tempo, então um pool de 50 a 70 threads (com folga) basta. Para trabalho dominado por CPU, a regra clássica é cerca de **um worker por núcleo**; para trabalho dominado por I/O, bem mais, porque os workers passam a maior parte do tempo esperando. Meça e ajuste: o número certo vem de teste de carga, não de fórmula.", "**Little's Law** gives the starting calculation: average concurrency = throughput × latency. If you want 500 requests per second and each takes 100 ms, you need about 50 requests in flight at once, so a pool of 50 to 70 threads (with headroom) is enough. For CPU-bound work, the classic rule is about **one worker per core**; for I/O-bound work, many more, because workers spend most of their time waiting. Measure and adjust: the right number comes from load testing, not a formula."]),
      code(`# gunicorn.conf.py  (Python, FastAPI behind NGINX)
bind = "127.0.0.1:8000"
workers = 4                       # about 1 per core for CPU-bound code
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 30                      # kill a worker stuck for more than 30 s
graceful_timeout = 30
keepalive = 5                     # seconds of keep-alive toward NGINX
max_requests = 10000              # recycle workers to contain memory leaks
max_requests_jitter = 1000

# Tomcat server.xml (Java)
# <Connector port="8080" protocol="HTTP/1.1"
#            maxThreads="200" acceptCount="100"
#            connectionTimeout="20000" keepAliveTimeout="15000"/>`),

      h(["Keep-alive, timeouts e desligamento gracioso", "Keep-alive, timeouts and graceful shutdown"]),
      p(["Abrir uma conexão TCP com TLS custa de 1 a 3 idas e voltas. O **keep-alive** mantém a conexão aberta para várias requisições, economizando esse custo, mas cada conexão ociosa consome um descritor de arquivo e, em servidores de thread por conexão, uma thread inteira. Daí a necessidade de um *idle timeout* e de um número máximo de requisições por conexão.", "Opening a TCP connection with TLS costs 1 to 3 round trips. **Keep-alive** keeps the connection open for several requests, saving that cost, but each idle connection consumes a file descriptor and, in thread-per-connection servers, a whole thread. Hence the need for an *idle timeout* and a maximum number of requests per connection."]),
      p(["A armadilha clássica é a **ordem dos timeouts** em uma cadeia balanceador, servidor web, aplicação. O *idle timeout* do componente de trás deve ser **maior** que o do componente da frente. Caso contrário, o de trás fecha a conexão exatamente quando o da frente acabou de enviar uma requisição por ela, e o cliente recebe um **502** esporádico, difícil de reproduzir. (Por exemplo, o ALB da AWS tem 60 s por padrão, então o servidor atrás deve usar mais que isso.) Defina também timeouts de leitura do cabeçalho, de leitura do corpo, de escrita e de requisição total, para que clientes lentos não segurem workers (o ataque *slowloris* explora justamente servidores de thread por conexão sem esses limites; o NGINX na frente o neutraliza porque absorve a conexão lenta com poucos recursos).", "The classic trap is the **order of timeouts** in a load balancer, web server, application chain. The *idle timeout* of the component behind must be **longer** than that of the component in front. Otherwise the one behind closes the connection exactly when the one in front just sent a request on it, and the client gets a sporadic **502**, hard to reproduce. (For example, AWS's ALB has 60 s by default, so the server behind should use more.) Also set header read, body read, write and total request timeouts, so slow clients cannot hold workers (the *slowloris* attack exploits exactly thread-per-connection servers without these limits; NGINX in front neutralizes it because it absorbs the slow connection with few resources)."]),
      p(["Em deploys e escalonamentos, o servidor deve ter um **desligamento gracioso**: ao receber `SIGTERM`, para de aceitar conexões novas, termina as requisições em andamento (até um limite) e só então sai. Em Kubernetes, isso se combina com a sonda de prontidão (*readiness*), que tira a instância do balanceamento antes do desligamento. Sem isso, cada deploy derruba requisições no meio.", "In deploys and scale-downs, the server should have a **graceful shutdown**: on receiving `SIGTERM`, it stops accepting new connections, finishes in-flight requests (up to a limit) and only then exits. In Kubernetes this combines with the readiness probe, which removes the instance from balancing before shutdown. Without it, every deploy drops requests midway."]),
      code(`// graceful shutdown in Node.js (TypeScript)
import http from "node:http";

const server = http.createServer(handler);
server.listen(8080);

process.on("SIGTERM", () => {
  console.log("draining...");
  server.close(() => process.exit(0));     // stops accepting, waits for in-flight
  server.closeIdleConnections();           // drops idle keep-alive sockets
  setTimeout(() => process.exit(1), 25_000).unref();  // hard stop
});`),

      h(["Escolhendo e combinando", "Choosing and combining"]),
      ul(
        ["**Site com muito conteúdo estático e várias aplicações**: NGINX na frente, servindo estáticos e repassando o dinâmico.", "**Site with lots of static content and several applications**: NGINX in front, serving static files and forwarding the dynamic."],
        ["**Aplicação Java**: Tomcat ou Jetty (ou Spring Boot, que embute um deles), com NGINX ou um balanceador à frente.", "**Java application**: Tomcat or Jetty (or Spring Boot, which embeds one of them), with NGINX or a load balancer in front."],
        ["**Aplicação Python**: Gunicorn (ou Uvicorn/Hypercorn para ASGI) atrás de NGINX; ajuste workers ao número de núcleos.", "**Python application**: Gunicorn (or Uvicorn/Hypercorn for ASGI) behind NGINX; set workers to the number of cores."],
        ["**Muitas conexões longas** (WebSockets, SSE): servidores orientados a eventos ou com corrotinas (Node, Go, Elixir).", "**Many long connections** (WebSockets, SSE): event-driven or coroutine-based servers (Node, Go, Elixir)."],
        ["**Aplicação PHP**: NGINX com PHP-FPM, em que o FPM gerencia um pool de processos.", "**PHP application**: NGINX with PHP-FPM, where FPM manages a process pool."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Deixar o servidor de aplicação servir arquivos estáticos pesados e ocupar workers com downloads.", "Letting the application server serve heavy static files and occupy workers with downloads."],
        ["Bloquear o laço de eventos em Node com cálculos pesados ou chamadas síncronas (`fs.readFileSync`, `bcrypt` síncrono).", "Blocking the event loop in Node with heavy calculations or synchronous calls (`fs.readFileSync`, synchronous `bcrypt`)."],
        ["Aumentar o pool de threads indefinidamente para \"resolver\" lentidão, quando o gargalo está no banco: o resultado é uma enxurrada de conexões que o derruba de vez.", "Increasing the thread pool indefinitely to \"fix\" slowness, when the bottleneck is the database: the result is a flood of connections that takes it down for good."],
        ["Filas sem limite: sob sobrecarga, a latência cresce indefinidamente em vez de a aplicação rejeitar rápido com `503` (*load shedding*).", "Unbounded queues: under overload, latency grows indefinitely instead of the application rejecting fast with `503` (*load shedding*)."],
        ["Esquecer do desligamento gracioso e dos timeouts em cascata.", "Forgetting graceful shutdown and cascading timeouts."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["O servidor web cuida do protocolo e dos estáticos; o de aplicação executa a lógica de negócio.", "The web server handles the protocol and static files; the application server runs the business logic."],
        ["Os modelos são processo por conexão, thread por conexão, eventos e corrotinas, cada um com um custo por conexão diferente.", "The models are process per connection, thread per connection, events and coroutines, each with a different cost per connection."],
        ["Pools e filas limitam a concorrência; dimensione pela Lei de Little e pelo limite do banco.", "Pools and queues cap concurrency; size by Little's Law and the database limit."],
        ["Keep-alive economiza handshakes, mas os timeouts devem crescer de frente para trás na cadeia.", "Keep-alive saves handshakes, but timeouts must grow from front to back along the chain."],
        ["Faça desligamento gracioso e rejeite rápido sob sobrecarga.", "Do graceful shutdown and reject fast under overload."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Preciso de NGINX se uso Node ou Spring Boot?** Não é obrigatório, mas costuma valer: ele faz TLS, estáticos e absorve clientes lentos. Muitos usam o balanceador da nuvem no lugar.", "**Do I need NGINX if I use Node or Spring Boot?** Not mandatory, but usually worth it: it does TLS, static files and absorbs slow clients. Many use the cloud load balancer instead."],
        ["**Quantos workers devo usar no Gunicorn?** Um ponto de partida comum é (2 x núcleos) + 1 para workers síncronos; meça com seu tráfego.", "**How many workers should I use in Gunicorn?** A common starting point is (2 x cores) + 1 for synchronous workers; measure with your traffic."],
        ["**Apache ou NGINX?** Para novos projetos, NGINX costuma ganhar em concorrência e simplicidade de proxy; o Apache é forte quando se precisa de módulos e `.htaccess`.", "**Apache or NGINX?** For new projects, NGINX usually wins on concurrency and proxy simplicity; Apache is strong when you need modules and `.htaccess`."],
        ["**Por que recebo 502 esporádicos?** Frequentemente é o idle timeout do backend menor que o do proxy, ou instâncias reiniciando sem desligamento gracioso.", "**Why do I get sporadic 502s?** Often the backend's idle timeout is shorter than the proxy's, or instances restarting without graceful shutdown."],
      ),
      tip(["Faça o servidor web servir estáticos e deixe o de aplicação só com o que exige lógica. Um NGINX entrega dezenas de milhares de arquivos por segundo por núcleo; o seu framework, não.", "Let the web server serve static files and keep the application server for what needs logic. NGINX delivers tens of thousands of files per second per core; your framework does not."]),
    ] },

  { id: "api-gateway", section: "rede", level: 1, icon: "alt_route", minutes: 14,
    title: ["API Gateway: a porta de entrada", "API Gateway: the front door"],
    summary: ["Roteamento, autenticação, rate limit, agregação, BFF, circuit breaker e comparação com mesh e balanceador.", "Routing, authentication, rate limiting, aggregation, BFF, circuit breaker and comparison with mesh and load balancer."],
    body: [
      p(["Imagine uma plataforma com vinte microsserviços: usuários, pedidos, pagamentos, catálogo, notificações. Se cada um fosse exposto diretamente ao aplicativo, o cliente precisaria conhecer vinte endereços, autenticar-se vinte vezes, lidar com vinte formatos de erro e vinte políticas de limite, e qualquer mudança interna (dividir um serviço em dois, mudar uma porta) quebraria todos os aplicativos já instalados nos celulares dos usuários, que você não consegue atualizar à força. O **API Gateway** resolve isso: é uma porta única, um reverse proxy especializado em APIs, que cuida do que é comum a todos os serviços e esconde a estrutura interna.", "Imagine a platform with twenty microservices: users, orders, payments, catalog, notifications. If each were exposed directly to the app, the client would need to know twenty addresses, authenticate twenty times, deal with twenty error formats and twenty limit policies, and any internal change (splitting a service in two, changing a port) would break every app already installed on users' phones, which you cannot force-update. The **API Gateway** solves this: it is a single door, a reverse proxy specialized in APIs, that handles what is common to all services and hides the internal structure."]),
      fig(["Gateway como porta única para os serviços", "Gateway as the single door to the services"],
        [[node("web", "Web", "client"), node("mob", "Mobile", "client"), node("par", ["Parceiros", "Partners"], "client")],
         [node("gw", ["API\nGateway", "API\nGateway"], "edge")],
         [node("us", ["Usuários", "Users"], "service"), node("or", ["Pedidos", "Orders"], "service"), node("pay", ["Pagamentos", "Payments"], "service")],
         [node("db", ["Bancos", "Databases"], "data")]],
        [edge("web", "gw"), edge("mob", "gw"), edge("par", "gw"), edge("gw", "us", "/users"), edge("gw", "or", "/orders"), edge("gw", "pay", "/payments"), edge("or", "db"), edge("us", "db")]),

      h(["O que o gateway faz", "What the gateway does"]),
      ul(
        ["**Roteamento**: `/orders/*` vai ao serviço de pedidos, `/users/*` ao de usuários, com regras por caminho, host, método e cabeçalho. Os serviços podem mudar de lugar, ser divididos ou migrados sem que o cliente perceba.", "**Routing**: `/orders/*` goes to the orders service, `/users/*` to the users service, with rules by path, host, method and header. Services can move, split or migrate without the client noticing."],
        ["**Autenticação e autorização**: valida o JWT, o token OAuth 2.0 ou a chave de API **uma vez**, na borda, e repassa a identidade aos serviços em cabeçalhos confiáveis. Os serviços deixam de reimplementar a validação (embora a defesa em profundidade recomende que ainda verifiquem a autorização dos seus dados).", "**Authentication and authorization**: validates the JWT, OAuth 2.0 token or API key **once**, at the edge, and passes the identity to the services in trusted headers. Services stop reimplementing validation (although defense in depth recommends they still check authorization for their own data)."],
        ["**Rate limiting e cotas**: limita por cliente, chave ou plano (por exemplo, 100 req/s e 1 milhão por mês) e responde `429 Too Many Requests` com `Retry-After`, protegendo o backend de abuso e de clientes com bug. Os algoritmos mais usados são *token bucket* e *sliding window*, com contadores em Redis quando há várias instâncias do gateway.", "**Rate limiting and quotas**: limits per client, key or plan (say, 100 req/s and 1 million per month) and answers `429 Too Many Requests` with `Retry-After`, protecting the backend from abuse and buggy clients. The most used algorithms are *token bucket* and *sliding window*, with counters in Redis when there are several gateway instances."],
        ["**Transformação e versionamento**: traduz protocolos (REST para gRPC), adapta formatos, acrescenta ou remove cabeçalhos e mantém `/v1` e `/v2` apontando para implementações diferentes.", "**Transformation and versioning**: translates protocols (REST to gRPC), adapts formats, adds or removes headers and keeps `/v1` and `/v2` pointing to different implementations."],
        ["**Cache e terminação de TLS** na borda, mais compressão e CORS centralizados.", "Edge **caching and TLS termination**, plus centralized compression and CORS."],
        ["**Observabilidade**: logs de acesso padronizados, métricas por rota (taxa, erros, latência p50/p95/p99), e geração de um **ID de correlação** ou *trace ID* que acompanha a requisição por todos os serviços.", "**Observability**: standardized access logs, per-route metrics (rate, errors, latency p50/p95/p99), and generation of a **correlation ID** or *trace ID* that follows the request through all services."],
        ["**Resiliência**: timeouts, *retries* limitados, e **circuit breaker** que para de chamar um serviço doente.", "**Resilience**: timeouts, limited retries and a **circuit breaker** that stops calling a sick service."],
      ),
      code(`# Kong declarative configuration (decK / kong.yml)
_format_version: "3.0"
services:
  - name: orders
    url: http://orders.internal:8080
    routes:
      - name: orders-route
        paths: ["/v1/orders"]
        strip_path: false
    plugins:
      - name: jwt                  # authenticate at the edge
      - name: rate-limiting
        config: { minute: 600, policy: redis, redis_host: redis.internal }
      - name: correlation-id
        config: { header_name: X-Request-Id, generator: uuid }
      - name: cors`),

      h(["Agregação e BFF", "Aggregation and BFF"]),
      p(["Uma tela do aplicativo pode precisar de dados de cinco serviços: perfil, pedidos recentes, recomendações, saldo e notificações. Em vez de o celular fazer cinco chamadas por uma rede lenta e instável, o gateway recebe **uma** chamada e as dispara em paralelo aos serviços, juntando as respostas em um único corpo. Isso se chama **agregação** (ou composição). A latência total passa a ser a do mais lento, não a soma, e o cliente fica mais simples. É preciso decidir o que fazer quando uma das chamadas falha: devolver uma resposta parcial e marcar o campo ausente costuma ser melhor que falhar tudo.", "A screen in the app may need data from five services: profile, recent orders, recommendations, balance and notifications. Instead of the phone making five calls over a slow, unstable network, the gateway receives **one** call and fires them in parallel to the services, merging the responses into a single body. This is called **aggregation** (or composition). Total latency becomes that of the slowest, not the sum, and the client gets simpler. You must decide what to do when one call fails: returning a partial response and marking the missing field is usually better than failing everything."]),
      fig(["Agregação: uma chamada do cliente, várias aos serviços", "Aggregation: one client call, several to services"],
        [[node("app", ["App\nmobile", "Mobile\napp"], "client")],
         [node("gw", ["Gateway\n(agregador)", "Gateway\n(aggregator)"], "edge")],
         [node("p", ["Perfil", "Profile"], "service"), node("o", ["Pedidos", "Orders"], "service"), node("r", ["Recomen-\ndações", "Recommen-\ndations"], "service")]],
        [edge("app", "gw", ["1 chamada", "1 call"]), edge("gw", "p", ["paralelo", "parallel"]), edge("gw", "o"), edge("gw", "r")]),
      p(["Esse conceito evolui para o padrão **BFF** (*Backend For Frontend*), popularizado por Sam Newman: em vez de um gateway único e genérico, há um por tipo de cliente (web, mobile, parceiros, TVs), cada um sob medida, com o formato e o volume de dados que aquele cliente precisa (o mobile quer respostas enxutas e imagens pequenas; o painel web quer tudo). A equipe responsável pelo front pode evoluir o seu BFF sem esperar os times dos serviços e sem atrapalhar os outros clientes. O custo é ter mais componentes e algum código duplicado entre BFFs.", "This concept evolves into the **BFF** (*Backend For Frontend*) pattern, popularized by Sam Newman: instead of a single, generic gateway, there is one per client type (web, mobile, partners, TVs), each tailored, with the format and amount of data that client needs (mobile wants lean responses and small images; the web dashboard wants everything). The team responsible for the front end can evolve its BFF without waiting for the service teams and without disturbing other clients. The cost is more components and some duplicated code between BFFs."]),

      h(["Resiliência no gateway: circuit breaker, timeouts e retries", "Resilience at the gateway: circuit breaker, timeouts and retries"]),
      p(["Como o gateway fica no centro, ele é o lugar natural para impedir que a falha de um serviço se propague (a **falha em cascata**). Três ferramentas se combinam.", "Since the gateway sits at the center, it is the natural place to stop one service's failure from spreading (the **cascading failure**). Three tools combine."]),
      ul(
        ["**Timeouts curtos** por rota, para que um serviço lento não prenda conexões e threads do gateway.", "**Short timeouts** per route, so a slow service does not hold the gateway's connections and threads."],
        ["**Retries limitados**, só para operações idempotentes e com backoff e jitter. Retries sem limite multiplicam a carga justamente quando o serviço já está sofrendo (uma *retry storm*).", "**Limited retries**, only for idempotent operations and with backoff and jitter. Unbounded retries multiply load exactly when the service is already struggling (a *retry storm*)."],
        ["**Circuit breaker**: monitora a taxa de falhas; passado um limite (digamos, 50% de erros em 10 s), o circuito **abre** e as chamadas falham imediatamente (ou usam um *fallback*, como um cache) por um tempo; depois passa a **meio aberto**, deixa passar poucas chamadas de teste e, se tiverem sucesso, **fecha** de novo. Isso dá tempo ao serviço para se recuperar.", "**Circuit breaker**: monitors the failure rate; past a threshold (say, 50% errors in 10 s), the circuit **opens** and calls fail immediately (or use a *fallback*, such as a cache) for a while; then it goes **half-open**, lets a few test calls through and, if they succeed, **closes** again. This gives the service time to recover."],
      ),
      code(`// circuit breaker in a few lines (TypeScript)
type State = "closed" | "open" | "half-open";

class CircuitBreaker {
  private state: State = "closed";
  private failures = 0;
  private openedAt = 0;
  constructor(private maxFailures = 5, private resetMs = 10_000) {}

  async call<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.openedAt < this.resetMs) return fallback();
      this.state = "half-open";                 // allow a probe call
    }
    try {
      const result = await fn();
      this.state = "closed"; this.failures = 0;
      return result;
    } catch {
      this.failures++;
      if (this.state === "half-open" || this.failures >= this.maxFailures) {
        this.state = "open"; this.openedAt = Date.now();
      }
      return fallback();
    }
  }
}`),

      h(["Gateway, load balancer, service mesh e reverse proxy", "Gateway, load balancer, service mesh and reverse proxy"]),
      p(["Esses termos se sobrepõem e geram confusão, porque o mesmo software (NGINX, Envoy) pode cumprir vários papéis. A diferença está no **escopo e no objetivo**.", "These terms overlap and cause confusion, because the same software (NGINX, Envoy) can fulfill several roles. The difference is in **scope and purpose**."]),
      table([["Componente", "Component"], ["Foco", "Focus"], ["Onde fica", "Where it sits"], ["Conhece", "Knows about"]],
        [["Load balancer", "Load balancer"], ["Distribuir conexões ou requisições entre cópias iguais", "Spread connections or requests across identical copies"], ["Na frente de um grupo de instâncias", "In front of a group of instances"], ["Saúde e carga (L4 ou L7)", "Health and load (L4 or L7)"]],
        [["Reverse proxy", "Reverse proxy"], ["Intermediar: TLS, cache, roteamento básico", "Intermediate: TLS, cache, basic routing"], ["Na frente de um ou mais servidores", "In front of one or more servers"], ["HTTP, hosts e caminhos", "HTTP, hosts and paths"]],
        [["API Gateway", "API Gateway"], ["Políticas de **API**: autenticação, cotas, agregação, planos", "**API** policies: authentication, quotas, aggregation, plans"], ["Na borda, entre clientes externos e serviços", "At the edge, between external clients and services"], ["Consumidores, chaves, rotas, versões", "Consumers, keys, routes, versions"]],
        [["Service mesh", "Service mesh"], ["Tráfego **leste-oeste** entre serviços: mTLS, retries, métricas", "**East-west** traffic between services: mTLS, retries, metrics"], ["Sidecars ao lado de cada serviço", "Sidecars beside each service"], ["Identidade de cada serviço e topologia interna", "Each service's identity and the internal topology"]]),
      p(["Em arquiteturas reais convivem em camadas: a requisição passa por uma **CDN**, depois por um **balanceador** na entrada da nuvem, chega ao **API Gateway** (tráfego **norte-sul**: do mundo externo para dentro) e daí aos serviços, que conversam entre si pela **malha** (tráfego leste-oeste) e cada um por trás de seu próprio balanceamento por instância. O gateway não substitui o balanceador: costuma ficar atrás de um, e os serviços ainda precisam de balanceamento próprio. E o mesh não substitui o gateway: ele não lida com chaves de API, planos de cobrança ou portais de desenvolvedores.", "In real architectures they coexist in layers: the request passes through a **CDN**, then a **load balancer** at the cloud entry, reaches the **API Gateway** (**north-south** traffic: from the outside world in) and from there the services, which talk to each other through the **mesh** (east-west traffic), each behind its own per-instance balancing. The gateway does not replace the load balancer: it usually sits behind one, and services still need their own balancing. And the mesh does not replace the gateway: it does not handle API keys, billing plans or developer portals."]),

      h(["Opções do mercado", "Market options"]),
      ul(
        ["**Kong** (construído sobre NGINX/OpenResty), **Tyk** e **KrakenD**: abertos, extensíveis por plugins, rodam onde você quiser, inclusive no Kubernetes.", "**Kong** (built on NGINX/OpenResty), **Tyk** and **KrakenD**: open, plugin-extensible, run wherever you like, including Kubernetes."],
        ["**Envoy**, com gateways como Emissary, Gloo e Istio Gateway: alto desempenho, configuração dinâmica, muito usado em ambientes nativos de nuvem e malhas.", "**Envoy**, with gateways such as Emissary, Gloo and Istio Gateway: high performance, dynamic configuration, widely used in cloud-native environments and meshes."],
        ["**AWS API Gateway**: gerenciado, integra com Lambda, Cognito e planos de uso com chaves; cobra por requisição e tem limites de payload e de timeout (29 s em tipos REST, por padrão). Os tipos HTTP e WebSocket têm preços e recursos diferentes.", "**AWS API Gateway**: managed, integrates with Lambda, Cognito and usage plans with keys; charges per request and has payload and timeout limits (29 s on REST types by default). The HTTP and WebSocket types have different prices and features."],
        ["**Apigee** (Google Cloud), **Azure API Management**: plataformas completas, com foco em monetização, análises e portal de desenvolvedores.", "**Apigee** (Google Cloud), **Azure API Management**: full platforms, focused on monetization, analytics and developer portals."],
        ["**Traefik** e **NGINX Ingress**: comuns como gateway simples em Kubernetes.", "**Traefik** and **NGINX Ingress**: common as a simple gateway on Kubernetes."],
      ),

      h(["Riscos e como evitá-los", "Risks and how to avoid them"]),
      ul(
        ["**Gargalo e ponto único de falha**: todo o tráfego passa por ali. Rode várias instâncias sem estado em zonas diferentes e escale horizontalmente.", "**Bottleneck and single point of failure**: all traffic passes through it. Run several stateless instances across zones and scale horizontally."],
        ["**Regra de negócio no gateway**: é tentador colocar lógica ali, o que o transforma em um monólito disfarçado, com deploys arriscados e propriedade difusa. Mantenha-o **fino**: só preocupações transversais (autenticação, limites, roteamento, agregação simples).", "**Business rules in the gateway**: tempting to put logic there, which turns it into a monolith in disguise, with risky deploys and diffuse ownership. Keep it **thin**: only cross-cutting concerns (authentication, limits, routing, simple aggregation)."],
        ["**Latência adicional**: um salto a mais e, com plugins pesados, mais ainda. Meça e mantenha os plugins por rota enxutos.", "**Added latency**: one more hop and, with heavy plugins, even more. Measure and keep per-route plugins lean."],
        ["**Configuração como código**: rotas e políticas manuais viram um pesadelo. Use configuração declarativa em repositório, com revisão e CI.", "**Configuration as code**: manual routes and policies become a nightmare. Use declarative configuration in a repository, with review and CI."],
      ),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Autenticar só no gateway e deixar os serviços abertos a qualquer chamada interna: um atacante na rede interna ignora o gateway.", "Authenticating only at the gateway and leaving services open to any internal call: an attacker on the internal network bypasses the gateway."],
        ["Aplicar rate limit global em vez de por cliente, de modo que um abusador esgota a cota de todos.", "Applying a global rate limit instead of per client, so one abuser exhausts everyone's quota."],
        ["Retries automáticos em operações não idempotentes (`POST` de pagamento).", "Automatic retries on non-idempotent operations (a payment `POST`)."],
        ["Esquecer de propagar o ID de correlação e perder o rastro entre serviços.", "Forgetting to propagate the correlation ID and losing the trail between services."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["O gateway é a porta única que centraliza o que é comum às APIs e esconde a estrutura interna.", "The gateway is the single door that centralizes what is common to APIs and hides the internal structure."],
        ["Faz roteamento, autenticação, rate limit, transformação, cache, observabilidade e resiliência.", "It does routing, authentication, rate limiting, transformation, caching, observability and resilience."],
        ["Agregação reduz as chamadas do cliente; BFF dá um gateway sob medida por tipo de cliente.", "Aggregation reduces client calls; BFF gives a tailored gateway per client type."],
        ["Circuit breaker, timeouts e retries limitados contêm a falha em cascata.", "Circuit breaker, timeouts and limited retries contain cascading failure."],
        ["Gateway, balanceador, reverse proxy e mesh têm focos diferentes e convivem em camadas.", "Gateway, load balancer, reverse proxy and mesh have different focuses and coexist in layers."],
        ["Mantenha-o fino e redundante.", "Keep it thin and redundant."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**Preciso de um gateway com poucos serviços?** Com dois ou três, um reverse proxy simples basta; o gateway compensa quando crescem serviços, clientes e políticas.", "**Do I need a gateway with few services?** With two or three, a simple reverse proxy is enough; the gateway pays off as services, clients and policies grow."],
        ["**Gateway e BFF são a mesma coisa?** O BFF é uma especialização: um gateway dedicado a um tipo de cliente, com agregação sob medida.", "**Are gateway and BFF the same thing?** The BFF is a specialization: a gateway dedicated to one client type, with tailored aggregation."],
        ["**Onde fica a autorização detalhada?** Regras amplas (escopos, planos) no gateway; regras de dados (este usuário pode ver este pedido) nos serviços.", "**Where does fine-grained authorization go?** Broad rules (scopes, plans) at the gateway; data rules (this user may see this order) in the services."],
        ["**Um gateway serve para tráfego interno?** Pode, mas o tráfego leste-oeste costuma ser mais bem tratado por service mesh ou bibliotecas de cliente.", "**Can a gateway serve internal traffic?** It can, but east-west traffic is usually better handled by a service mesh or client libraries."],
      ),
      tip(["Gateway não substitui o balanceador: ele costuma ficar atrás de um (ou de uma CDN) e na frente dos serviços, que ainda têm balanceamento próprio por instância.", "A gateway does not replace the load balancer: it usually sits behind one (or a CDN) and in front of the services, which still have their own per-instance balancing."]),
    ] },

  { id: "polling-long-polling-e-websockets", section: "rede", level: 1, icon: "sync", minutes: 15,
    title: ["Polling, long polling, SSE e WebSockets", "Polling, long polling, SSE and WebSockets"],
    summary: ["Quatro formas de manter o cliente atualizado, com fluxos, código TypeScript e escala de conexões.", "Four ways to keep the client up to date, with flows, TypeScript code and connection scaling."],
    body: [
      p(["O HTTP nasceu como pergunta e resposta: o cliente pede, o servidor responde, e a conversa acaba. Esse modelo funciona perfeitamente para abrir uma página, mas falha quando o interesse é **ser avisado**: uma mensagem nova no chat, o placar de um jogo, a cotação de uma ação, o status de um pagamento, o progresso de um relatório. O servidor sabe quando algo mudou, mas, pelo modelo clássico, **não tem como falar primeiro**. Quatro técnicas contornam isso, em ordem crescente de sofisticação: *short polling*, *long polling*, *Server-Sent Events* (SSE) e **WebSockets**.", "HTTP was born as question and answer: the client asks, the server replies, and the conversation ends. This model works perfectly for opening a page, but fails when the interest is **being notified**: a new chat message, a game score, a stock quote, a payment status, a report's progress. The server knows when something changed but, under the classic model, **has no way to speak first**. Four techniques work around this, in increasing sophistication: *short polling*, *long polling*, *Server-Sent Events* (SSE) and **WebSockets**."]),
      p(["A escolha importa porque cada técnica tem um custo diferente em latência, em número de requisições, em conexões abertas no servidor e em complexidade de operar. Escolher WebSocket para uma tela que atualiza a cada 5 minutos é exagero; escolher polling a cada segundo para um chat de milhões de usuários é um desastre de custo.", "The choice matters because each technique has a different cost in latency, number of requests, open connections on the server and operational complexity. Choosing WebSocket for a screen that updates every 5 minutes is overkill; choosing polling every second for a chat with millions of users is a cost disaster."]),

      h(["Short polling: perguntar de tempos em tempos", "Short polling: asking from time to time"]),
      p(["O **polling** (ou *short polling*) é a técnica mais simples: o cliente repete uma requisição a cada N segundos (`GET /status`) e o servidor responde na hora, haja novidade ou não. Funciona em qualquer lugar, sem recurso especial de rede, é fácil de cachear e de depurar, e é *stateless* no servidor. Os defeitos são dois: a maior parte das respostas é \"nada novo\" (desperdício de requisições, banda e bateria), e a atualização chega com um atraso de **até N segundos**. Reduzir N melhora a latência, mas multiplica a carga: 100 mil usuários consultando a cada 2 segundos são 50 mil requisições por segundo, a maioria inútil.", "**Polling** (or *short polling*) is the simplest technique: the client repeats a request every N seconds (`GET /status`) and the server answers right away, news or not. It works anywhere, with no special network feature, is easy to cache and debug, and is *stateless* on the server. The flaws are two: most answers are \"nothing new\" (wasted requests, bandwidth and battery), and the update arrives with a delay of **up to N seconds**. Reducing N improves latency but multiplies load: 100k users polling every 2 seconds is 50k requests per second, most of them useless."]),
      p(["Quando faz sentido: atualizações raras e tolerantes a atraso (verificar o status de um pagamento a cada 5 a 10 s por poucos minutos, ver se um *job* terminou), poucos clientes, ou ambientes em que nada mais funciona. Melhore com **backoff** (intervalos crescentes), com `ETag`/`If-None-Match` para respostas `304` baratas e com intervalos que respeitem o `Retry-After`.", "When it makes sense: rare, delay-tolerant updates (checking a payment status every 5 to 10 s for a few minutes, seeing if a job finished), few clients, or environments where nothing else works. Improve it with **backoff** (growing intervals), with `ETag`/`If-None-Match` for cheap `304` responses and with intervals that respect `Retry-After`."]),

      h(["Long polling: segurar a resposta", "Long polling: holding the response"]),
      p(["No **long polling**, o cliente faz a requisição e o servidor **não responde imediatamente**: ele segura a conexão aberta até haver algo a enviar (ou até um timeout de 20 a 60 s, quando responde vazio). Assim que o cliente recebe a resposta, processa-a e abre **imediatamente** outra requisição. A latência fica próxima à de um canal em tempo real, sem tecnologia nova, só HTTP. Foi a base de muitos chats antes do WebSocket e continua sendo o *fallback* de bibliotecas como Socket.IO.", "In **long polling**, the client makes the request and the server **does not answer immediately**: it holds the connection open until there is something to send (or until a timeout of 20 to 60 s, when it answers empty). As soon as the client receives the response, it processes it and **immediately** opens another request. Latency gets close to that of a real-time channel, with no new technology, just HTTP. It was the basis of many chats before WebSocket and remains the *fallback* of libraries such as Socket.IO."]),
      fig(["Polling x long polling", "Polling vs long polling"],
        [[node("c1", ["Cliente\n(polling)", "Client\n(polling)"], "client"), node("c2", ["Cliente\n(long polling)", "Client\n(long polling)"], "client")],
         [node("srv", "Servidor", "service")],
         [node("ev", ["Fila de\neventos", "Event\nqueue"], "queue")]],
        [edge("c1", "srv", ["a cada N s: novidade?", "every N s: news?"]), edge("c2", "srv", ["pergunta e espera", "asks and waits"], { dashed: true }), edge("ev", "srv", ["evento chega", "event arrives"], { dashed: true })]),
      p(["Os custos: cada cliente ocupa uma conexão pendente no servidor (então o servidor precisa ser orientado a eventos ou assíncrono, não de thread por conexão); a cada ciclo há o custo de cabeçalhos HTTP, de autenticação e de uma nova requisição; e é preciso tratar com cuidado eventos que chegam **entre** uma resposta e a requisição seguinte (use um identificador de último evento visto, para o servidor reenviar o que foi perdido). Proxies e balanceadores com timeouts curtos podem cortar a espera: o timeout do long poll deve ser **menor** que o deles.", "The costs: each client occupies a pending connection on the server (so the server must be event-driven or asynchronous, not thread-per-connection); each cycle pays HTTP headers, authentication and a new request; and events that arrive **between** one response and the next request must be handled carefully (use a last-seen event identifier, so the server resends what was missed). Proxies and balancers with short timeouts may cut the wait: the long poll timeout must be **shorter** than theirs."]),

      h(["Server-Sent Events (SSE)", "Server-Sent Events (SSE)"]),
      p(["O **SSE** abre uma única resposta HTTP que **nunca termina**, e o servidor vai escrevendo eventos de texto nela, no formato `text/event-stream`. É **unidirecional** (servidor para cliente); para o caminho inverso, o cliente usa requisições HTTP comuns. A API do navegador, `EventSource`, é simples e traz de graça o que se tem de escrever à mão em outras técnicas: **reconexão automática** e **retomada do último evento** pelo cabeçalho `Last-Event-ID`. Por ser HTTP puro, atravessa proxies e firewalls com facilidade, funciona bem com HTTP/2 (várias streams na mesma conexão) e se autentica como qualquer requisição (cookies, ou cabeçalhos com bibliotecas de *fetch streaming*).", "**SSE** opens a single HTTP response that **never ends**, and the server keeps writing text events into it, in the `text/event-stream` format. It is **one-way** (server to client); for the reverse path, the client uses ordinary HTTP requests. The browser API, `EventSource`, is simple and brings for free what must be hand-written in other techniques: **automatic reconnection** and **resuming from the last event** via the `Last-Event-ID` header. Being plain HTTP, it crosses proxies and firewalls easily, works well with HTTP/2 (many streams over one connection) and authenticates like any request (cookies, or headers with *fetch streaming* libraries)."]),
      code(`GET /events HTTP/1.1
Accept: text/event-stream
Last-Event-ID: 41

HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache

id: 42
event: order-updated
data: {"id": 9001, "status": "paid"}

id: 43
retry: 5000
data: plain message

: heartbeat comment (keeps proxies from closing the connection)`),
      p(["Limitações: só texto (use JSON), um limite de cerca de 6 conexões por origem em HTTP/1.1 (um problema que o HTTP/2 elimina), e suporte do navegador em `EventSource` sem cabeçalhos personalizados. É a escolha certa para **feeds, notificações, progresso de tarefas, painéis ao vivo e respostas de IA transmitidas por partes**, em que só o servidor fala.", "Limitations: text only (use JSON), a limit of about 6 connections per origin on HTTP/1.1 (a problem HTTP/2 removes), and browser `EventSource` without custom headers. It is the right choice for **feeds, notifications, task progress, live dashboards and streamed AI responses**, where only the server speaks."]),

      h(["WebSockets: um canal bidirecional", "WebSockets: a bidirectional channel"]),
      p(["O **WebSocket** (RFC 6455) abre uma conexão **bidirecional e persistente**, em que qualquer lado envia mensagens a qualquer momento, com baixíssimo overhead por mensagem (de 2 a 14 bytes de cabeçalho, contra centenas de bytes de um HTTP). Começa como uma requisição HTTP comum que pede a mudança de protocolo, e, se o servidor aceita, a mesma conexão TCP passa a falar o protocolo WebSocket.", "**WebSocket** (RFC 6455) opens a **bidirectional, persistent** connection, in which either side sends messages at any time, with very low per-message overhead (2 to 14 bytes of header, against the hundreds of bytes of HTTP). It starts as an ordinary HTTP request asking for a protocol change, and, if the server accepts, the same TCP connection starts speaking the WebSocket protocol."]),
      code(`GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: https://example.com

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

(from here on: WebSocket frames in both directions)`),
      fig(["Fluxo de um WebSocket", "WebSocket flow"],
        [[node("cl", "Cliente", "client")],
         [node("lb", ["Balanceador\n(suporta WS)", "Load balancer\n(WS aware)"], "edge")],
         [node("ws", ["Servidor\nWebSocket", "WebSocket\nserver"], "service")],
         [node("bus", ["Pub/sub\n(Redis, NATS)", "Pub/sub\n(Redis, NATS)"], "queue")]],
        [edge("cl", "lb", ["Upgrade -> 101", "Upgrade -> 101"]), edge("lb", "ws", ["mensagens", "messages"], { both: true }), edge("ws", "bus", "pub/sub", { both: true })]),
      p(["O preço da liberdade é que você perde o que o HTTP dava de graça: não há cache, não há balanceamento por requisição (a conexão é presa a um servidor), a autenticação é feita na abertura (cuidado para validar o cabeçalho `Origin` e evitar *cross-site WebSocket hijacking*), e você precisa tratar sozinho **reconexão**, **heartbeats**, **backpressure** e o formato das mensagens (muitos usam JSON, outros Protobuf ou subprotocolos como STOMP). Bibliotecas como Socket.IO e SignalR empacotam muito disso, com *fallback* para long polling.", "The price of freedom is losing what HTTP gave for free: there is no cache, no per-request balancing (the connection is pinned to a server), authentication happens at open (take care to validate the `Origin` header and avoid *cross-site WebSocket hijacking*), and you must handle **reconnection**, **heartbeats**, **backpressure** and message format yourself (many use JSON, others Protobuf or subprotocols such as STOMP). Libraries like Socket.IO and SignalR package much of this, with *fallback* to long polling."]),

      h(["Exemplo de código: servidor e cliente em TypeScript", "Code example: server and client in TypeScript"]),
      p(["O servidor abaixo (Node.js com a biblioteca `ws`) mantém um conjunto de conexões, faz *broadcast* e detecta clientes mortos com ping/pong. O cliente reconecta com backoff exponencial e jitter.", "The server below (Node.js with the `ws` library) keeps a set of connections, does *broadcast* and detects dead clients with ping/pong. The client reconnects with exponential backoff and jitter."]),
      code(`// server.ts  (npm i ws)
import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080, path: "/chat" });
const alive = new WeakMap<WebSocket, boolean>();

wss.on("connection", (socket, req) => {
  // authenticate here: validate token and req.headers.origin
  alive.set(socket, true);
  socket.on("pong", () => alive.set(socket, true));

  socket.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    for (const peer of wss.clients) {
      if (peer.readyState === WebSocket.OPEN) peer.send(JSON.stringify(msg));
    }
  });
});

// heartbeat: ping every 30 s, terminate clients that did not answer the last one
setInterval(() => {
  for (const socket of wss.clients) {
    if (alive.get(socket) === false) { socket.terminate(); continue; }
    alive.set(socket, false);
    socket.ping();
  }
}, 30_000);

// client.ts (browser)
function connect(attempt = 0): void {
  const ws = new WebSocket("wss://example.com/chat");

  ws.onopen = () => { attempt = 0; ws.send(JSON.stringify({ type: "hello" })); };
  ws.onmessage = (ev) => console.log("message:", JSON.parse(ev.data));
  ws.onclose = () => {
    const base = Math.min(30_000, 500 * 2 ** attempt);   // exponential, capped
    const delay = Math.random() * base;                  // full jitter
    setTimeout(() => connect(attempt + 1), delay);
  };
  ws.onerror = () => ws.close();
}
connect();`),
      code(`// SSE in Node.js (server) and browser (client)
// server
import http from "node:http";
http.createServer((req, res) => {
  if (req.url !== "/events") { res.writeHead(404).end(); return; }
  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  let id = Number(req.headers["last-event-id"] ?? 0);
  const t = setInterval(() => res.write("id: " + (++id) + "\\ndata: " + JSON.stringify({ n: id }) + "\\n\\n"), 1000);
  const hb = setInterval(() => res.write(": hb\\n\\n"), 15000);
  req.on("close", () => { clearInterval(t); clearInterval(hb); });
}).listen(3000);

// client
const es = new EventSource("/events");
es.onmessage = (e) => console.log(JSON.parse(e.data));`),

      h(["Heartbeats e reconexão", "Heartbeats and reconnection"]),
      p(["Conexões longas morrem em silêncio: um celular entra em um túnel, um NAT esquece a conexão, um balanceador corta um canal ocioso após 60 s. Nenhum lado percebe até tentar escrever. Por isso se enviam **heartbeats**: pings periódicos (a cada 15 a 30 s) que mantêm os intermediários acordados e permitem que cada lado detecte o outro morto e o remova. Do lado do cliente, a **reconexão** deve usar **backoff exponencial com jitter**, para que, depois de uma queda do servidor, milhares de clientes não retornem todos no mesmo instante (a *thundering herd*, que derruba o servidor de novo). Ao reconectar, o cliente deve **ressincronizar** o estado: informar o último evento que viu para receber o que perdeu, ou buscar um *snapshot* via HTTP.", "Long connections die silently: a phone enters a tunnel, a NAT forgets the connection, a load balancer cuts an idle channel after 60 s. Neither side notices until it tries to write. That is why **heartbeats** are sent: periodic pings (every 15 to 30 s) that keep intermediaries awake and let each side detect the other as dead and remove it. On the client side, **reconnection** should use **exponential backoff with jitter**, so that after a server drop thousands of clients do not all come back at the same instant (the *thundering herd*, which knocks the server down again). On reconnect, the client must **resynchronize** state: report the last event it saw to receive what it missed, or fetch a *snapshot* over HTTP."]),

      h(["Escalar conexões abertas", "Scaling open connections"]),
      p(["Conexões persistentes são *stateful*: um servidor guarda milhares delas, e isso muda como se escala. Um nó bem ajustado, orientado a eventos, aguenta de **100 mil a mais de 1 milhão** de conexões ociosas, limitado por memória (alguns KB por conexão, mais os buffers), **descritores de arquivo** (aumente `ulimit -n` e `fs.file-max`), portas efêmeras nos balanceadores e CPU de criptografia. O difícil não é segurar as conexões, mas distribuir as mensagens: é o **fan-out**. O usuário A está conectado ao servidor 1 e o B ao servidor 7, e a mensagem de A precisa chegar a B.", "Persistent connections are *stateful*: one server holds thousands of them, and that changes how you scale. A well-tuned, event-driven node handles **100k to over 1 million** idle connections, limited by memory (a few KB per connection, plus buffers), **file descriptors** (raise `ulimit -n` and `fs.file-max`), ephemeral ports on load balancers and TLS CPU. The hard part is not holding the connections but distributing the messages: **fan-out**. User A is connected to server 1 and B to server 7, and A's message must reach B."]),
      fig(["Fan-out entre servidores de conexão", "Fan-out across connection servers"],
        [[node("a", ["Usuário A", "User A"], "client"), node("b", ["Usuário B", "User B"], "client")],
         [node("s1", ["Servidor 1", "Server 1"], "service"), node("s7", ["Servidor 7", "Server 7"], "service")],
         [node("bus", ["Pub/sub\n(Redis, Kafka,\nNATS)", "Pub/sub\n(Redis, Kafka,\nNATS)"], "queue")],
         [node("pr", ["Presença\n(Redis)", "Presence\n(Redis)"], "cache")]],
        [edge("a", "s1", "WS", { both: true }), edge("b", "s7", "WS", { both: true }), edge("s1", "bus", ["publica", "publishes"]), edge("bus", "s7", ["entrega", "delivers"]), edge("s7", "pr", ["quem está onde", "who is where"], { dashed: true })]),
      ul(
        ["Um **barramento pub/sub** (Redis Pub/Sub, NATS, Kafka) entre os servidores de conexão: cada servidor assina os canais dos seus usuários conectados, e a mensagem publicada chega aos servidores certos.", "A **pub/sub bus** (Redis Pub/Sub, NATS, Kafka) between connection servers: each server subscribes to the channels of its connected users, and the published message reaches the right servers."],
        ["Um **registro de presença** (quem está em qual servidor) em um Redis, para rotear mensagens diretas e mostrar quem está online, com expiração para limpar clientes que somem.", "A **presence registry** (who is on which server) in Redis, to route direct messages and show who is online, with expiry to clean up vanished clients."],
        ["**Balanceador com suporte a WebSocket**, *idle timeouts* longos e, se necessário, *sticky sessions* (afinidade) para o fluxo de *fallback* de long polling. Para conexões simples, balancear por menor número de conexões distribui melhor que round-robin.", "A **load balancer with WebSocket support**, long *idle timeouts* and, if necessary, *sticky sessions* (affinity) for the long polling fallback flow. For simple connections, balancing by fewest connections distributes better than round-robin."],
        ["**Desligamentos e deploys**: ao reiniciar um nó, todos os seus clientes reconectam de uma vez. Drene aos poucos, avise os clientes para reconectar em tempos aleatórios e use o backoff com jitter.", "**Shutdowns and deploys**: when a node restarts, all its clients reconnect at once. Drain gradually, tell clients to reconnect at random times and use backoff with jitter."],
        ["**Backpressure**: um cliente lento não pode acumular mensagens sem limite na memória do servidor. Imponha um buffer máximo por conexão e descarte ou desconecte quem não acompanha.", "**Backpressure**: a slow client must not accumulate unbounded messages in the server's memory. Impose a maximum buffer per connection and drop or disconnect those who cannot keep up."],
      ),
      p(["Em casos extremos, serviços gerenciados (AWS API Gateway WebSocket, Pusher, Ably, Firebase) assumem a operação das conexões, e o seu backend só publica eventos. Pesa-se aí o custo por conexão e por mensagem contra o trabalho operacional.", "In extreme cases, managed services (AWS API Gateway WebSocket, Pusher, Ably, Firebase) take over operating the connections, and your backend only publishes events. There you weigh the cost per connection and per message against the operational work."]),

      h(["Tabela de decisão", "Decision table"]),
      table([["Critério", "Criterion"], ["Short polling", "Short polling"], ["Long polling", "Long polling"], ["SSE", "SSE"], ["WebSocket", "WebSocket"]],
        [["Direção", "Direction"], ["Cliente pergunta", "Client asks"], ["Cliente pergunta, servidor segura", "Client asks, server holds"], ["Servidor para cliente", "Server to client"], ["Bidirecional", "Bidirectional"]],
        [["Latência", "Latency"], ["Até N s", "Up to N s"], ["Baixa", "Low"], ["Baixa", "Low"], ["Muito baixa", "Very low"]],
        [["Carga no servidor", "Server load"], ["Muitas requisições", "Many requests"], ["Conexões pendentes e reabertura", "Pending connections and reopening"], ["Uma conexão por cliente", "One connection per client"], ["Uma conexão por cliente", "One connection per client"]],
        [["Complexidade", "Complexity"], ["Mínima", "Minimal"], ["Média", "Medium"], ["Baixa (reconexão automática)", "Low (automatic reconnection)"], ["Alta (tudo manual)", "High (all manual)"]],
        [["Atravessa proxies", "Crosses proxies"], ["Sempre", "Always"], ["Quase sempre", "Almost always"], ["Quase sempre", "Almost always"], ["Pode exigir ajuste", "May need tuning"]],
        [["Uso ideal", "Ideal use"], ["Status raro, poucos clientes", "Rare status, few clients"], ["Fallback, ambientes restritos", "Fallback, restricted environments"], ["Feeds, notificações, progresso, IA em streaming", "Feeds, notifications, progress, streamed AI"], ["Chat, jogos, colaboração, trading", "Chat, games, collaboration, trading"]]),

      h(["Quando usar e quando evitar", "When to use and when to avoid"]),
      ul(
        ["Atualização rara e tolerância a atraso: **polling** com intervalo longo e backoff.", "Rare updates and delay tolerance: **polling** with a long interval and backoff."],
        ["Só o servidor envia (notificações, feed, progresso de tarefa, resposta de IA em partes): **SSE**.", "Only the server sends (notifications, feed, task progress, chunked AI response): **SSE**."],
        ["Os dois lados enviam com frequência e baixa latência (chat, jogo, edição colaborativa): **WebSocket**.", "Both sides send often with low latency (chat, game, collaborative editing): **WebSocket**."],
        ["Redes restritivas ou infraestrutura sem suporte: **long polling** como *fallback*.", "Restrictive networks or infrastructure without support: **long polling** as a fallback."],
        ["Evite WebSocket quando o fluxo é só servidor para cliente (SSE é mais simples) e quando a atualização é rara (polling basta).", "Avoid WebSocket when the flow is only server to client (SSE is simpler) and when updates are rare (polling is enough)."],
      ),
      h(["Casos reais", "Real cases"]),
      p(["Aplicativos de chat e colaboração usam WebSocket ou protocolos equivalentes; painéis de monitoramento e transmissões de respostas de modelos de linguagem usam SSE; plataformas de negociação financeira usam WebSocket para cotações; pagamentos por Pix ou cartão costumam usar polling curto por alguns minutos ou *webhooks* para avisar o servidor; e bibliotecas como Socket.IO escolhem automaticamente WebSocket com *fallback* para long polling.", "Chat and collaboration apps use WebSocket or equivalent protocols; monitoring dashboards and streamed language model responses use SSE; financial trading platforms use WebSocket for quotes; payments often use short polling for a few minutes or *webhooks* to notify the server; and libraries like Socket.IO automatically pick WebSocket with *fallback* to long polling."]),
      h(["Erros comuns", "Common mistakes"]),
      ul(
        ["Usar WebSocket por moda, assumindo o custo de estado e de escala sem necessidade.", "Using WebSocket out of fashion, taking on state and scaling cost without need."],
        ["Não enviar heartbeats e descobrir conexões mortas só quando o usuário reclama.", "Not sending heartbeats and discovering dead connections only when the user complains."],
        ["Reconectar imediatamente em laço, sem backoff, e derrubar o servidor na volta.", "Reconnecting immediately in a loop, without backoff, and knocking the server down on return."],
        ["Não validar `Origin` e autenticação na abertura do WebSocket.", "Not validating `Origin` and authentication when opening the WebSocket."],
        ["Esquecer de ressincronizar o estado após reconectar, deixando o cliente com dados velhos.", "Forgetting to resynchronize state after reconnecting, leaving the client with stale data."],
      ),
      h(["Resumo", "Summary"]),
      ul(
        ["O HTTP clássico não deixa o servidor falar primeiro; quatro técnicas contornam isso.", "Classic HTTP does not let the server speak first; four techniques work around this."],
        ["Polling é simples, mas desperdiça requisições e atrasa até N segundos.", "Polling is simple but wastes requests and delays up to N seconds."],
        ["Long polling segura a resposta até haver novidade: baixa latência com HTTP puro.", "Long polling holds the response until there is news: low latency with plain HTTP."],
        ["SSE é um fluxo de eventos do servidor para o cliente, com reconexão automática.", "SSE is a stream of events from server to client, with automatic reconnection."],
        ["WebSocket é um canal bidirecional persistente, que exige heartbeats, reconexão e fan-out.", "WebSocket is a persistent bidirectional channel, requiring heartbeats, reconnection and fan-out."],
        ["Escala de conexões exige pub/sub entre servidores, presença, backpressure e backoff com jitter.", "Connection scaling requires pub/sub between servers, presence, backpressure and backoff with jitter."],
      ),
      h(["Perguntas frequentes", "FAQ"]),
      ul(
        ["**WebSocket é melhor que SSE?** Não necessariamente: para comunicação só do servidor ao cliente, SSE é mais simples e se recupera sozinho.", "**Is WebSocket better than SSE?** Not necessarily: for server-to-client only communication, SSE is simpler and recovers by itself."],
        ["**Quantos WebSockets um servidor aguenta?** Dezenas a centenas de milhares em um nó ajustado; o limite real é memória, descritores e o trabalho por mensagem.", "**How many WebSockets can a server handle?** Tens to hundreds of thousands on a tuned node; the real limit is memory, descriptors and per-message work."],
        ["**WebSocket funciona com balanceador comum?** Precisa de suporte a `Upgrade` e de idle timeout longo; a maioria dos balanceadores modernos já oferece.", "**Does WebSocket work with an ordinary load balancer?** It needs `Upgrade` support and a long idle timeout; most modern balancers already offer them."],
        ["**E o HTTP/2 e o HTTP/3?** Há extensões para WebSocket sobre eles (RFC 8441 e 9220), mas o SSE já se beneficia diretamente da multiplexação.", "**What about HTTP/2 and HTTP/3?** There are extensions for WebSocket over them (RFC 8441 and 9220), but SSE already benefits directly from multiplexing."],
      ),
      tip(["Para notificações em celular fechado, nenhuma conexão sua sobrevive: use push do sistema (FCM, APNs). A conexão persistente serve só enquanto o app está aberto.", "For notifications on a closed phone none of your connections survives: use the OS push service (FCM, APNs). The persistent connection only serves while the app is open."]),
    ] },
];

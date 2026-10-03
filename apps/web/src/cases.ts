import { emptyRequirements, type Checks, type Session, type Load, type Need, type PathRule, type Requirements } from "./session";

export type CaseGroup = "Empresas" | "Social e mídia" | "Comunicação" | "Comércio e pagamentos" | "Infraestrutura e utilidades" | "Mobilidade e serviços";
export interface StudyCase {
  id: string; title: string; icon: string; group: CaseGroup; level: "Iniciante" | "Intermediário" | "Avançado";
  /** Casos de empresa: logo (id em logos.generated), cor da marca e o foco do system design dela. */
  company?: { logo: string; name: string; brand: string; focus: string };
  summary: string; concepts: string[]; req: Partial<Requirements> & Pick<Requirements, "functional" | "nonFunctional">;
}

/** Casos clássicos de entrevista de system design. O de links curtos abre com o desenho de referência já montado. */
export const CASES: StudyCase[] = [
  { id: "url-shortener", title: "Encurtador de links", icon: "link", group: "Infraestrutura e utilidades", level: "Iniciante",
    summary: "Gera links curtos e redireciona com baixíssima latência para uma carga muito concentrada em leitura.", concepts: ["Cache", "Read-heavy", "Geração de IDs"],
    req: { functional: ["Criar link curto a partir de uma URL", "Redirecionar o link curto para a URL original", "Expiração opcional do link"], nonFunctional: ["Redirecionamento muito rápido", "Alta disponibilidade", "Links não podem colidir"],
      scale: { users: "100 milhões de links/mês", rps: "5.000 leituras/s no pico", readWrite: "99% leitura", storage: "~500 GB em 5 anos" }, targets: { latency: "p95 < 100 ms", availability: "99,99%", consistency: "Eventual nas leituras" } } },
  { id: "rate-limiter", title: "Rate limiter", icon: "speed", group: "Infraestrutura e utilidades", level: "Intermediário",
    summary: "Limita requisições por usuário ou chave de API, de forma distribuída e sem virar gargalo.", concepts: ["Token bucket", "Redis", "Consistência"],
    req: { functional: ["Limitar requisições por cliente e por rota", "Responder 429 com tempo de espera", "Regras configuráveis"], nonFunctional: ["Overhead mínimo por requisição", "Funcionar com várias instâncias", "Tolerar falha do contador"] } },
  { id: "key-value-store", title: "Banco chave-valor distribuído", icon: "key", group: "Infraestrutura e utilidades", level: "Avançado",
    summary: "Armazenamento particionado e replicado, com escolhas explícitas entre consistência e disponibilidade.", concepts: ["Sharding", "Replicação", "CAP"],
    req: { functional: ["Get, put e delete por chave", "Escala horizontal", "Replicação entre zonas"], nonFunctional: ["Baixa latência", "Tolerar partição de rede", "Rebalanceamento sem parada"] } },
  { id: "notification-system", title: "Sistema de notificações", icon: "notifications", group: "Comunicação", level: "Intermediário",
    summary: "Envia push, e-mail e SMS em escala, com filas, retentativas e preferências do usuário.", concepts: ["Filas", "Workers", "Idempotência"],
    req: { functional: ["Enviar por push, e-mail e SMS", "Respeitar preferências do usuário", "Agendar envios"], nonFunctional: ["Não perder mensagens", "Não duplicar envios", "Absorver picos de campanha"] } },
  { id: "chat", title: "Chat em tempo real", icon: "chat", group: "Comunicação", level: "Intermediário",
    summary: "Mensagens 1:1 e em grupo com entrega ordenada, presença online e histórico.", concepts: ["WebSocket", "Pub/Sub", "Ordenação"],
    req: { functional: ["Mensagens 1:1 e em grupo", "Status de entrega e leitura", "Histórico e sincronização entre dispositivos"], nonFunctional: ["Entrega em tempo real", "Ordem preservada por conversa", "Milhões de conexões simultâneas"] } },
  { id: "video-call", title: "Videochamada", icon: "videocam", group: "Comunicação", level: "Avançado",
    summary: "Áudio e vídeo em tempo real entre vários participantes, com sinalização e mídia separadas.", concepts: ["WebRTC", "SFU", "Latência"],
    req: { functional: ["Salas com vários participantes", "Compartilhamento de tela", "Gravação opcional"], nonFunctional: ["Latência fim a fim baixa", "Adaptar qualidade à rede", "Escala por região"] } },
  { id: "social-feed", title: "Feed de rede social", icon: "dynamic_feed", group: "Social e mídia", level: "Intermediário",
    summary: "Monta a timeline de cada usuário a partir de quem ele segue, equilibrando escrita e leitura.", concepts: ["Fan-out", "Cache", "Ranking"],
    req: { functional: ["Publicar posts", "Seguir usuários", "Ver o feed ordenado"], nonFunctional: ["Feed carrega rápido", "Suportar contas com milhões de seguidores", "Consistência eventual aceitável"] } },
  { id: "video-streaming", title: "Streaming de vídeo", icon: "movie", group: "Social e mídia", level: "Intermediário",
    summary: "Upload, transcodificação e entrega de vídeo para milhões de espectadores.", concepts: ["CDN", "Transcodificação", "Armazenamento de objetos"],
    req: { functional: ["Upload de vídeos", "Reprodução adaptativa", "Busca e recomendações"], nonFunctional: ["Início da reprodução rápido", "Custo de banda controlado", "Alta disponibilidade de leitura"] } },
  { id: "photo-sharing", title: "Compartilhamento de fotos", icon: "photo_camera", group: "Social e mídia", level: "Iniciante",
    summary: "Envio, armazenamento e exibição de imagens em várias resoluções.", concepts: ["Object storage", "CDN", "Miniaturas"],
    req: { functional: ["Enviar fotos", "Gerar miniaturas", "Curtir e comentar"], nonFunctional: ["Imagens carregam rápido no mundo todo", "Durabilidade dos arquivos"] } },
  { id: "search-autocomplete", title: "Busca com autocomplete", icon: "search", group: "Social e mídia", level: "Intermediário",
    summary: "Sugere termos enquanto a pessoa digita, com respostas em dezenas de milissegundos.", concepts: ["Trie", "Índice invertido", "Cache"],
    req: { functional: ["Sugerir termos por prefixo", "Ordenar por popularidade", "Atualizar sugestões com novos termos"], nonFunctional: ["Resposta em poucas dezenas de ms", "Muito tráfego de leitura"] } },
  { id: "ecommerce", title: "E-commerce", icon: "shopping_cart", group: "Comércio e pagamentos", level: "Avançado",
    summary: "Catálogo, carrinho, estoque e pedidos, com cuidado para não vender o que não existe.", concepts: ["Transações", "Saga", "Estoque"],
    req: { functional: ["Navegar e buscar produtos", "Carrinho e checkout", "Controle de estoque e pedidos"], nonFunctional: ["Não vender além do estoque", "Suportar picos (Black Friday)", "Pedidos nunca podem se perder"] } },
  { id: "payments", title: "Sistema de pagamentos", icon: "payments", group: "Comércio e pagamentos", level: "Avançado",
    summary: "Processa cobranças com idempotência, reconciliação e trilha de auditoria.", concepts: ["Idempotência", "Ledger", "Reconciliação"],
    req: { functional: ["Autorizar e capturar pagamentos", "Estornos", "Conciliação com provedores"], nonFunctional: ["Nunca cobrar duas vezes", "Consistência forte nos saldos", "Auditoria completa"] } },
  { id: "ticketing", title: "Venda de ingressos", icon: "confirmation_number", group: "Comércio e pagamentos", level: "Avançado",
    summary: "Milhares de pessoas disputando os mesmos assentos no mesmo segundo.", concepts: ["Reserva temporária", "Fila de espera", "Concorrência"],
    req: { functional: ["Escolher assentos", "Reservar por tempo limitado", "Confirmar compra"], nonFunctional: ["Sem venda duplicada do mesmo assento", "Suportar abertura de vendas com pico extremo"] } },
  { id: "ride-hailing", title: "App de corridas", icon: "local_taxi", group: "Mobilidade e serviços", level: "Avançado",
    summary: "Casa passageiros e motoristas próximos, com localização atualizada o tempo todo.", concepts: ["Geoindexação", "Matching", "Tempo real"],
    req: { functional: ["Solicitar corrida", "Encontrar motoristas próximos", "Acompanhar o trajeto em tempo real"], nonFunctional: ["Localização com poucos segundos de atraso", "Alta taxa de escrita de posições"] } },
  { id: "food-delivery", title: "Delivery de comida", icon: "delivery_dining", group: "Mobilidade e serviços", level: "Intermediário",
    summary: "Conecta restaurantes, clientes e entregadores com status do pedido ao vivo.", concepts: ["Eventos", "Geolocalização", "Estados do pedido"],
    req: { functional: ["Cardápio e pedido", "Atribuir entregador", "Acompanhar status"], nonFunctional: ["Status atualizado em tempo real", "Picos nos horários de refeição"] } },
  { id: "file-storage", title: "Armazenamento de arquivos", icon: "cloud_upload", group: "Infraestrutura e utilidades", level: "Intermediário",
    summary: "Sincroniza arquivos entre dispositivos, com versões, compartilhamento e upload em partes.", concepts: ["Chunking", "Deduplicação", "Sincronização"],
    req: { functional: ["Upload e download", "Sincronizar entre dispositivos", "Compartilhar com permissões"], nonFunctional: ["Durabilidade altíssima", "Upload retomável", "Economia de banda e armazenamento"] } },
  { id: "web-crawler", title: "Web crawler", icon: "bug_report", group: "Infraestrutura e utilidades", level: "Intermediário",
    summary: "Percorre a web de forma educada e escalável, sem repetir páginas.", concepts: ["Fila de URLs", "Deduplicação", "Politeness"],
    req: { functional: ["Baixar páginas a partir de sementes", "Extrair e enfileirar novos links", "Reprocessar páginas alteradas"], nonFunctional: ["Respeitar limites por domínio", "Evitar duplicatas", "Escalar horizontalmente"] } },
];

const co = (id: string, title: string, logo: string, brand: string, focus: string, level: StudyCase["level"], summary: string, concepts: string[], req: StudyCase["req"]): StudyCase =>
  ({ id, title, icon: "business", group: "Empresas", level, summary, concepts, company: { logo: logo.startsWith("icon:") ? logo : `co-${logo}`, name: title, brand, focus }, req });

/** Casos inspirados na arquitetura pública das grandes empresas (blogs de engenharia, palestras e artigos). Números são ordens de grandeza para ensino. */
export const COMPANY_CASES: StudyCase[] = [
  co("netflix", "Netflix", "netflix", "#E50914", "Streaming global com CDN própria (Open Connect)", "Avançado",
    "Entrega vídeo sob demanda a centenas de milhões de assinantes, com a mídia servida de dentro dos provedores de internet e um plano de controle em microsserviços.",
    ["CDN própria", "Bitrate adaptativo", "Resiliência"],
    { functional: ["Catálogo e busca de títulos", "Reproduzir vídeo com qualidade adaptativa (DASH/HLS)", "Retomar de onde parou em qualquer dispositivo", "Recomendações personalizadas por perfil", "Pipeline de ingestão: codificar cada título em dezenas de formatos e resoluções"],
      nonFunctional: ["Separar plano de controle (login, catálogo, recomendação) do plano de dados (bytes de vídeo)", "Servir o vídeo pela borda: caches dentro dos ISPs, pré-posicionados fora do horário de pico", "Degradação graciosa: se a recomendação cair, mostrar uma lista genérica, nunca uma tela de erro", "Disjuntores e timeouts em toda chamada entre microsserviços", "Testar falhas de propósito (chaos engineering) em produção", "Início da reprodução em poucos segundos mesmo em rede ruim"],
      scale: { users: "centenas de milhões de assinantes", rps: "picos noturnos regionais", readWrite: "leitura altíssima", storage: "petabytes de vídeo em vários formatos" }, targets: { latency: "início da reprodução em poucos segundos", availability: "99,99% no plano de controle", consistency: "Eventual no catálogo e nas recomendações" },
      constraints: "Decisões que a entrevista costuma cobrar: cache na borda vs. CDN pública, codificação por título, tolerância a falha regional, A/B testing contínuo e custo de banda." }),
  co("youtube", "YouTube", "youtube", "#FF0000", "Upload massivo, transcodificação e contagem de views em escala", "Avançado",
    "Recebe horas de vídeo por segundo, transcodifica, distribui e conta bilhões de visualizações sem perder consistência nos números.",
    ["Transcodificação", "Contagem de views", "Content ID"],
    { functional: ["Upload retomável de vídeos grandes", "Transcodificar em várias resoluções e codecs", "Reproduzir com bitrate adaptativo", "Comentários, curtidas e inscrições", "Detectar conteúdo protegido por direitos autorais no upload"],
      nonFunctional: ["Pipeline de transcodificação em etapas paralelas (DAG) sobre chunks do vídeo", "Contador de views aproximado e barato, com consolidação posterior", "Vídeos virais: tratar a cauda longa e o pico no mesmo desenho", "Armazenamento em camadas: quente para populares, frio para o resto", "Metadados fortemente consistentes; contadores eventualmente consistentes"],
      scale: { users: "mais de 2 bilhões de usuários logados/mês", rps: "milhões de reproduções simultâneas", readWrite: "leitura muito maior que escrita", storage: "exabytes" }, targets: { latency: "início rápido da reprodução", availability: "99,95%", consistency: "Eventual nos contadores" } }),
  co("spotify", "Spotify", "spotify", "#1DB954", "Streaming de áudio, playlists colaborativas e recomendação", "Intermediário",
    "Reproduz áudio instantaneamente, permite editar playlists em conjunto e contabiliza cada execução para royalties e recomendação.",
    ["Playlists colaborativas", "Eventos de reprodução", "Recomendação"],
    { functional: ["Buscar e tocar faixas", "Criar e editar playlists, inclusive em conjunto", "Downloads para ouvir offline", "Mixes semanais personalizados", "Registrar cada execução para royalties"],
      nonFunctional: ["Início da faixa quase instantâneo (pré-carregar a próxima)", "Edição concorrente de playlist sem perder alterações (CRDT ou transformação operacional)", "Contagem de execuções sem perda e sem duplicidade (idempotência)", "Pipeline de eventos em streaming alimentando recomendações", "Licenças por região: catálogo diferente por país"],
      scale: { users: "centenas de milhões de usuários ativos", rps: "milhões de eventos/s no pico", readWrite: "leitura alta, eventos contínuos", storage: "dezenas de milhões de faixas" }, targets: { latency: "p95 < 300 ms para iniciar", availability: "99,95%", consistency: "Forte nos royalties; eventual nas recomendações" } }),
  co("tiktok", "TikTok", "tiktok", "#25F4EE", "Feed de vídeos curtos guiado por recomendação em tempo real", "Avançado",
    "O feed não depende de quem você segue: o ranking aprende com cada gesto em segundos e o próximo vídeo já está pré-carregado.",
    ["Recomendação", "Cold start", "Pré-carregamento"],
    { functional: ["Upload e processamento de vídeos curtos", "Feed infinito personalizado (For You)", "Curtir, comentar e compartilhar", "Efeitos e sons reutilizáveis", "Moderação de conteúdo"],
      nonFunctional: ["Sinais de engajamento (tempo assistido, repetição, pulo) entram no ranking em segundos", "Cold start: novos vídeos e novos usuários precisam de exploração controlada", "Pré-carregar os próximos vídeos no dispositivo sem desperdiçar banda", "Moderação automática antes da distribuição ampla", "Geradores de candidatos separados do ranqueador final"],
      scale: { users: "mais de 1 bilhão de usuários ativos", rps: "milhões de requisições de feed/s", readWrite: "leitura dominante", storage: "petabytes de vídeo curto" }, targets: { latency: "próximo vídeo sem espera perceptível", availability: "99,9%", consistency: "Eventual" } }),
  co("instagram", "Instagram", "instagram", "#E4405F", "Feed, Stories e mídia com fan-out híbrido", "Intermediário",
    "Combina um feed ranqueado, Stories que expiram em 24 horas e armazenamento massivo de fotos e vídeos.",
    ["Fan-out híbrido", "Stories (TTL)", "IDs distribuídos"],
    { functional: ["Publicar fotos e vídeos", "Seguir contas e ver o feed", "Stories que expiram em 24 horas", "Curtir, comentar e mensagens diretas", "Explorar conteúdo de contas que não segue"],
      nonFunctional: ["Fan-out na escrita para contas comuns e na leitura para contas com milhões de seguidores", "IDs ordenáveis no tempo, gerados sem coordenação central", "Expiração de Stories sem varrer a base inteira (TTL)", "Mídia em várias resoluções servida por CDN", "Sharding dos dados do usuário sem perder consultas por relacionamento"],
      scale: { users: "bilhões de usuários", rps: "centenas de milhares de leituras de feed/s", readWrite: "leitura muito maior que escrita", storage: "petabytes de mídia" }, targets: { latency: "feed em < 500 ms", availability: "99,95%", consistency: "Eventual no feed" } }),
  co("x", "X (Twitter)", "x", "#9AA4B2", "Timeline em tempo real e trending topics", "Avançado",
    "O clássico problema do fan-out: a mesma postagem pode precisar chegar a milhões de linhas do tempo em segundos.",
    ["Fan-out", "Top-K em streaming", "Busca em tempo real"],
    { functional: ["Postar mensagens curtas", "Seguir contas e ver a linha do tempo", "Busca com resultados em tempo real", "Assuntos em alta por região", "Repostar e responder em cadeia"],
      nonFunctional: ["Híbrido: pré-computar timelines comuns e mesclar contas gigantes na leitura", "Trending topics por contagem aproximada em janelas deslizantes (top-K em streaming)", "Índice de busca atualizado em segundos", "IDs únicos e ordenáveis (estilo Snowflake)", "Limites de taxa por usuário e por aplicativo"],
      scale: { users: "centenas de milhões de usuários ativos", rps: "centenas de milhares de leituras/s", readWrite: "leitura muito maior que escrita", storage: "bilhões de posts" }, targets: { latency: "timeline em < 300 ms", availability: "99,95%", consistency: "Eventual" } }),
  co("linkedin", "LinkedIn", "linkedin", "#0A66C2", "Grafo social, graus de conexão e busca profissional", "Intermediário",
    "Responde perguntas sobre o grafo (conexões em comum, 2º e 3º graus) e sugere pessoas e vagas em tempo hábil.",
    ["Grafo social", "Busca", "Kafka"],
    { functional: ["Conectar-se com outros profissionais", "Ver o grau de conexão entre duas pessoas", "Feed profissional e mensagens", "Busca de pessoas, vagas e empresas", "Sugestões de pessoas que talvez você conheça"],
      nonFunctional: ["Consulta ao grafo (2º e 3º graus) em milissegundos, com grafo em memória e particionado", "Mudanças propagadas como log de eventos (Kafka) para busca, feed e recomendação", "Busca com permissões: o resultado depende de quem pergunta", "Dados do perfil consistentes; sugestões podem ser atrasadas", "Isolamento entre produtos para que um não derrube o outro"],
      scale: { users: "centenas de milhões de membros", rps: "dezenas de milhares de consultas de grafo/s", readWrite: "leitura alta", storage: "bilhões de arestas" }, targets: { latency: "p95 < 200 ms", availability: "99,95%", consistency: "Forte no perfil, eventual no restante" } }),
  co("whatsapp", "WhatsApp", "whatsapp", "#25D366", "Mensageria com criptografia de ponta a ponta e milhões de conexões por servidor", "Avançado",
    "Entrega mensagens com poucos servidores por usuário, sem que a empresa consiga ler o conteúdo, mesmo com o destinatário offline.",
    ["Criptografia E2E", "Armazena e encaminha", "Conexões persistentes"],
    { functional: ["Mensagens 1:1 e em grupo", "Confirmação de entrega e leitura", "Enviar fotos, vídeos e documentos", "Status de presença", "Mensagens para quem está offline"],
      nonFunctional: ["Criptografia de ponta a ponta: o servidor só vê mensagens cifradas", "Armazenar e encaminhar: guardar apenas até a entrega e depois apagar", "Cada servidor mantém centenas de milhares de conexões persistentes", "Ordem preservada por conversa, sem duplicar na reconexão", "Grupos: fan-out da mesma mensagem cifrada para cada membro", "Mídia enviada separada da mensagem, com link cifrado"],
      scale: { users: "mais de 2 bilhões de usuários", rps: "milhões de mensagens/s", readWrite: "equilibrado", storage: "mensagens guardadas só em trânsito" }, targets: { latency: "entrega em < 1 s com ambos online", availability: "99,99%", consistency: "Ordem forte por conversa" } }),
  co("discord", "Discord", "discord", "#5865F2", "Chat e voz para comunidades enormes, com partições quentes", "Avançado",
    "Servidores com milhões de membros geram partições de dados muito desiguais e exigem presença e voz em tempo real.",
    ["Partições quentes", "Presença", "Voz (SFU)"],
    { functional: ["Canais de texto e voz por servidor", "Histórico de mensagens pesquisável", "Presença e digitação em tempo real", "Cargos e permissões", "Chamadas de voz e vídeo"],
      nonFunctional: ["Mensagens particionadas por canal e janela de tempo, para evitar partições quentes", "Presença de milhões de membros sem enviar a cada um todas as mudanças (fan-out controlado)", "Voz por SFU, escolhendo o servidor mais próximo", "Cada guild atendida por um único processo coordenador, que serializa os eventos", "Cache de leitura para canais muito lidos"],
      scale: { users: "centenas de milhões de usuários", rps: "milhões de eventos/s", readWrite: "equilibrado", storage: "trilhões de mensagens" }, targets: { latency: "mensagem em < 200 ms", availability: "99,95%", consistency: "Ordem por canal" } }),
  co("uber", "Uber", "uber", "#A0A8B8", "Pareamento geoespacial em tempo real e preço dinâmico", "Avançado",
    "Casa passageiros e motoristas próximos em segundos, com localização atualizada o tempo todo e estados de corrida que não podem se perder.",
    ["Índice geoespacial", "Matching", "Preço dinâmico"],
    { functional: ["Pedir corrida e ver motoristas próximos", "Parear passageiro e motorista", "Acompanhar o trajeto em tempo real", "Estimar tempo de chegada e preço", "Pagamento e avaliação ao final"],
      nonFunctional: ["Atualizações de posição de milhões de motoristas a cada poucos segundos", "Índice geoespacial em células (ex.: H3) para buscas por proximidade", "Pareamento sem oferecer o mesmo motorista a dois passageiros", "Corrida como máquina de estados durável e idempotente", "Preço dinâmico calculado por região e por janela de tempo", "Dados de localização fora do banco principal"],
      scale: { users: "dezenas de milhões de corridas/dia", rps: "milhões de pings de localização/s", readWrite: "escrita alta de posições", storage: "séries temporais de trajetos" }, targets: { latency: "pareamento em poucos segundos", availability: "99,99%", consistency: "Forte no estado da corrida" } }),
  co("airbnb", "Airbnb", "airbnb", "#FF5A5F", "Busca por localização, disponibilidade e preço sem reserva duplicada", "Intermediário",
    "Combina busca geográfica com calendário e preço, e garante que dois hóspedes nunca reservem o mesmo período.",
    ["Busca geográfica", "Reserva sem conflito", "Pagamento em custódia"],
    { functional: ["Buscar por local, datas e filtros", "Ver calendário e preço por noite", "Reservar com pagamento", "Mensagens entre hóspede e anfitrião", "Avaliações mútuas"],
      nonFunctional: ["Índice de busca que combina geografia, disponibilidade e preço", "Reserva atômica: nunca duas confirmadas para o mesmo período", "Pagamento mantido em custódia e liberado após o check-in", "Avaliações em duplo cego, reveladas juntas", "Ranking que equilibra relevância, qualidade e novidade", "Preços e disponibilidade atualizados sem travar a busca"],
      scale: { users: "dezenas de milhões de hóspedes", rps: "milhares de buscas/s", readWrite: "leitura muito maior que escrita", storage: "milhões de anúncios e fotos" }, targets: { latency: "busca em < 500 ms", availability: "99,95%", consistency: "Forte na reserva, eventual na busca" } }),
  co("amazon", "Amazon", "amazon", "#FF9900", "Carrinho sempre disponível, estoque e pedidos orquestrados", "Avançado",
    "Um carrinho que aceita escrita mesmo durante falhas, estoque que não vende o que não existe e um pedido que atravessa dezenas de serviços.",
    ["Alta disponibilidade", "Saga de pedidos", "Estoque"],
    { functional: ["Navegar e buscar produtos", "Carrinho e checkout", "Reservar estoque e confirmar pedido", "Pagamento e entrega", "Recomendações de produtos"],
      nonFunctional: ["Carrinho sempre gravável: priorizar disponibilidade e resolver conflitos depois", "Pedido orquestrado como saga com compensações", "Checkout idempotente: o mesmo clique nunca cobra duas vezes", "Reserva de estoque com expiração", "Resistir a picos de Black Friday com degradação seletiva", "Equipes e serviços independentes com contratos estáveis"],
      scale: { users: "centenas de milhões de clientes", rps: "dezenas de milhares de pedidos/s no pico", readWrite: "leitura alta, escrita crítica", storage: "centenas de milhões de itens" }, targets: { latency: "página em < 300 ms", availability: "99,99%", consistency: "Eventual no carrinho, forte no pagamento" } }),
  co("stripe", "Stripe", "stripe", "#635BFF", "Pagamentos com idempotência, livro-razão e webhooks confiáveis", "Avançado",
    "Cada cobrança precisa acontecer exatamente uma vez, deixar rastro contábil completo e avisar o cliente de forma confiável.",
    ["Idempotência", "Livro-razão", "Webhooks"],
    { functional: ["Criar cobranças e assinaturas", "Estornos e disputas", "Webhooks para eventos de pagamento", "Painel e relatórios", "Versionamento da API"],
      nonFunctional: ["Chaves de idempotência em toda operação que muda dinheiro", "Livro-razão de dupla entrada, imutável e auditável", "Webhooks com retentativas, backoff e assinatura", "Isolamento de dados de cartão (PCI) do restante do sistema", "Limites de taxa em camadas por conta e por endpoint", "Mudanças de API compatíveis com clientes antigos"],
      scale: { users: "milhões de empresas", rps: "milhares de transações/s", readWrite: "escrita crítica", storage: "histórico financeiro permanente" }, targets: { latency: "p99 < 1 s", availability: "99,999% na criação de cobranças", consistency: "Forte" } }),
  co("dropbox", "Dropbox", "dropbox", "#0061FF", "Sincronização por blocos, deduplicação e resolução de conflitos", "Intermediário",
    "Só trafega o que mudou, guarda cada bloco uma única vez e resolve o que acontece quando dois dispositivos editam o mesmo arquivo.",
    ["Blocos e deduplicação", "Sincronização", "Conflitos"],
    { functional: ["Enviar e baixar arquivos", "Sincronizar entre dispositivos", "Histórico de versões", "Compartilhar com permissões", "Retomar upload interrompido"],
      nonFunctional: ["Dividir arquivos em blocos e enviar só os que mudaram", "Deduplicar blocos por hash, inclusive entre usuários", "Metadados em banco consistente, blocos em armazenamento de objetos", "Notificar clientes de mudanças sem fazer polling pesado", "Conflitos: manter as duas versões em vez de perder uma", "Durabilidade altíssima dos dados"],
      scale: { users: "centenas de milhões de usuários", rps: "milhões de operações de sincronização/dia", readWrite: "equilibrado", storage: "exabytes de blocos" }, targets: { latency: "mudança visível nos outros dispositivos em segundos", availability: "99,95%", consistency: "Forte nos metadados" } }),
  co("ticketmaster", "Ticketmaster", "ticketmaster", "#026CDF", "Fila virtual e reserva de assentos sob pico extremo", "Avançado",
    "Milhões de pessoas disputam poucos assentos no mesmo minuto, com robôs tentando furar a fila.",
    ["Fila virtual", "Reserva temporária", "Anti-bot"],
    { functional: ["Ver mapa de assentos em tempo real", "Reservar assentos por tempo limitado", "Pagar e emitir ingresso", "Entrar na fila quando o evento estiver cheio", "Transferir ingressos"],
      nonFunctional: ["Fila virtual que admite só quem o sistema consegue atender", "Reserva temporária (hold) com expiração automática", "Nunca vender o mesmo assento duas vezes", "Detecção de robôs e limites por pessoa", "Pico de abertura de vendas: absorver na borda antes de chegar ao banco", "Pagamento com tempo limite e liberação do assento em caso de falha"],
      scale: { users: "milhões de pessoas simultâneas na abertura", rps: "picos de centenas de milhares de req/s", readWrite: "leitura alta, escrita disputada", storage: "inventário por evento" }, targets: { latency: "resposta em < 1 s após entrar", availability: "99,9% durante vendas", consistency: "Forte no assento" } }),
  co("google-search", "Google Search", "google", "#4285F4", "Rastreio, índice invertido e consulta em milissegundos", "Avançado",
    "Percorre a web, constrói um índice distribuído e responde a cada consulta combinando milhares de máquinas em uma fração de segundo.",
    ["Índice invertido", "Sharding por documento", "Ranking em camadas"],
    { functional: ["Rastrear e atualizar páginas continuamente", "Montar um índice de busca por termo", "Responder consultas com resultados ranqueados", "Sugerir termos e corrigir erros de digitação", "Mostrar trechos relevantes (snippets)"],
      nonFunctional: ["Índice particionado: cada consulta é enviada a todos os shards e os resultados são mesclados", "Ranking em camadas: recuperação barata de candidatos e reordenação cara só nos melhores", "Consultas populares servidas por cache; cauda longa vai ao índice", "Índice atualizado em camadas (tempo real, diário, completo)", "Tolerar shards lentos sem atrasar a resposta (requisição com réplica e corte por tempo)"],
      scale: { users: "bilhões de consultas/dia", rps: "centenas de milhares de consultas/s", readWrite: "leitura quase total", storage: "trilhões de documentos indexados" }, targets: { latency: "p95 < 200 ms", availability: "99,99%", consistency: "Eventual no índice" } }),
  co("google-maps", "Google Maps", "googlemaps", "#34A853", "Mapas em blocos, rotas e trânsito em tempo real", "Avançado",
    "Serve blocos de mapa pré-renderizados, calcula rotas sobre um grafo gigante e atualiza o trânsito a partir de milhões de dispositivos.",
    ["Blocos de mapa", "Grafo de rotas", "Trânsito em tempo real"],
    { functional: ["Exibir mapa em vários níveis de zoom", "Buscar lugares e endereços", "Calcular rotas e tempo de chegada", "Mostrar trânsito ao vivo", "Navegação passo a passo com recálculo"],
      nonFunctional: ["Mapa em blocos (tiles) pré-gerados e servidos por CDN", "Roteamento em grafo hierárquico: não percorrer a malha inteira a cada pedido", "Posições anônimas agregadas em streaming para estimar velocidade nas vias", "Recalcular rota rapidamente quando o trânsito muda", "Suporte offline com blocos e grafo regionais baixados"],
      scale: { users: "mais de 1 bilhão de usuários/mês", rps: "centenas de milhares de requisições de bloco/s", readWrite: "leitura muito maior que escrita", storage: "petabytes de mapas e imagens" }, targets: { latency: "bloco em < 100 ms; rota em < 1 s", availability: "99,95%", consistency: "Eventual no trânsito" } }),
  co("slack", "Slack", "slack", "#9C5BA6", "Mensagens por workspace com busca e entrega em tempo real", "Intermediário",
    "Cada empresa é um espaço isolado, com canais, histórico pesquisável e milhares de conexões abertas por cliente.",
    ["Isolamento por workspace", "WebSocket", "Busca por permissão"],
    { functional: ["Canais públicos, privados e mensagens diretas", "Histórico pesquisável", "Threads, reações e arquivos", "Notificações no desktop e no celular", "Integrações e bots via API"],
      nonFunctional: ["Particionar dados por workspace para isolar clientes grandes e escalar", "Entrega em tempo real por conexão persistente com reconexão e catch-up", "Busca respeitando as permissões de cada canal", "Notificações sem duplicar entre dispositivos", "Limites de taxa por integração para proteger a plataforma"],
      scale: { users: "dezenas de milhões de usuários diários", rps: "dezenas de milhares de mensagens/s", readWrite: "leitura maior que escrita", storage: "bilhões de mensagens" }, targets: { latency: "mensagem entregue em < 500 ms", availability: "99,99%", consistency: "Ordem por canal" } }),
  co("zoom", "Zoom", "zoom", "#0B5CFF", "Videoconferência com mídia roteada por SFU e adaptação à rede", "Avançado",
    "Mantém dezenas de participantes em tempo real distribuindo vídeo por servidores de mídia e degradando a qualidade antes de travar.",
    ["SFU", "Adaptação de banda", "Roteamento regional"],
    { functional: ["Criar e entrar em reuniões", "Áudio e vídeo de vários participantes", "Compartilhar tela e gravar", "Salas de apoio e chat", "Reuniões agendadas e convites"],
      nonFunctional: ["Mídia por SFU: cada participante envia um fluxo e o servidor replica para os demais", "Simulcast: vários níveis de qualidade e escolha por receptor", "Escolher o servidor de mídia mais próximo e migrar quando necessário", "Sinalização separada da mídia", "Gravação em segundo plano sem afetar a reunião"],
      scale: { users: "centenas de milhões de participantes/dia", rps: "milhões de fluxos de mídia simultâneos", readWrite: "escrita (mídia) contínua", storage: "gravações sob demanda" }, targets: { latency: "latência fim a fim < 300 ms", availability: "99,99%", consistency: "Eventual nos metadados" } }),
  co("pinterest", "Pinterest", "pinterest", "#E60023", "Grafo de interesses, descoberta visual e imagens em escala", "Intermediário",
    "Organiza bilhões de pins em quadros e recomenda por similaridade visual e comportamento, com imagens servidas em vários tamanhos.",
    ["Recomendação visual", "Sharding por usuário", "Imagens em CDN"],
    { functional: ["Salvar pins em quadros", "Seguir pessoas e interesses", "Feed de descoberta personalizado", "Busca visual por imagem", "Compartilhar e comentar"],
      nonFunctional: ["Dados particionados por usuário, com mapeamento fixo de ID para shard", "Imagens em vários tamanhos geradas no envio e servidas por CDN", "Candidatos por grafo e embeddings, depois ranqueados por modelo", "Feed pré-computado e cacheado, atualizado de forma assíncrona", "Deduplicar pins iguais"],
      scale: { users: "centenas de milhões de usuários/mês", rps: "dezenas de milhares de consultas de feed/s", readWrite: "leitura muito maior que escrita", storage: "dezenas de bilhões de pins" }, targets: { latency: "feed em < 500 ms", availability: "99,95%", consistency: "Eventual" } }),
  co("reddit", "Reddit", "reddit", "#FF4500", "Votos, comentários em árvore e ranking que muda o tempo todo", "Intermediário",
    "Milhões de votos por minuto reordenam listas e threads de comentários profundas, com picos de atenção imprevisíveis.",
    ["Contagem de votos", "Comentários em árvore", "Ranking quente"],
    { functional: ["Postar em comunidades", "Votar em posts e comentários", "Comentários aninhados", "Ordenar por quente, novo e melhores", "Moderação por comunidade"],
      nonFunctional: ["Votos agregados de forma assíncrona: contador aproximado agora, exato depois", "Comentários em árvore carregados por partes (profundidade limitada)", "Ranking recalculado em lote e em streaming", "Posts virais: cache agressivo e proteção do banco", "Moderação com regras por comunidade e filas de revisão"],
      scale: { users: "centenas de milhões de usuários/mês", rps: "dezenas de milhares de leituras/s", readWrite: "leitura muito maior que escrita", storage: "bilhões de comentários" }, targets: { latency: "p95 < 300 ms", availability: "99,9%", consistency: "Eventual nos votos" } }),
  co("twitch", "Twitch", "twitch", "#9146FF", "Transmissão ao vivo com baixa latência e chat em massa", "Avançado",
    "Recebe vídeo ao vivo de milhões de streamers, transcodifica na hora e entrega a espectadores enquanto um chat gigantesco corre ao lado.",
    ["Ingestão ao vivo", "Transcodificação em tempo real", "Chat em massa"],
    { functional: ["Transmitir ao vivo (ingestão RTMP)", "Assistir com qualidade adaptativa", "Chat da transmissão", "Clipes e reprises", "Seguir e receber avisos de início"],
      nonFunctional: ["Ingestão perto do streamer e transcodificação imediata em várias qualidades", "Entrega por CDN com poucos segundos de atraso", "Chat com limite por canal, lentidão e moderação automática", "Canais gigantes: fan-out do chat sem derrubar o servidor", "Gravar a transmissão para reprises sem atrasar o ao vivo"],
      scale: { users: "dezenas de milhões de espectadores/dia", rps: "milhões de mensagens de chat/min", readWrite: "leitura (vídeo) muito alta", storage: "petabytes de reprises" }, targets: { latency: "atraso ao vivo de poucos segundos", availability: "99,95%", consistency: "Eventual no chat" } }),
  co("wikipedia", "Wikipedia", "wikipedia", "#9AA4B2", "Leitura global quase toda em cache, escrita com histórico", "Iniciante",
    "Um site de leitura intensa servido quase inteiro por cache e CDN, com edições versionadas e reversíveis.",
    ["Cache em camadas", "Versionamento", "Leitura global"],
    { functional: ["Ler artigos em vários idiomas", "Editar com histórico de revisões", "Buscar artigos", "Reverter vandalismo", "Páginas de discussão"],
      nonFunctional: ["Mais de 95% das leituras servidas por cache e CDN", "Invalidar o cache da página editada sem derrubar o resto", "Todas as revisões guardadas e comparáveis", "Busca por texto completo", "Operar com custo baixo e picos por notícias"],
      scale: { users: "centenas de milhões de leitores/mês", rps: "dezenas de milhares de requisições/s", readWrite: "99% leitura", storage: "dezenas de TB de texto e histórico" }, targets: { latency: "p95 < 200 ms", availability: "99,95%", consistency: "Forte na edição, eventual na leitura" } }),
  co("ifood", "iFood", "ifood", "#EA1D2C", "Pedido, restaurante e entregador em tempo real no horário de pico", "Intermediário",
    "No horário do almoço, milhões de pedidos precisam ser aceitos, repassados ao restaurante e despachados a entregadores próximos.",
    ["Máquina de estados do pedido", "Despacho geográfico", "Picos de refeição"],
    { functional: ["Cardápios e busca por restaurantes próximos", "Fazer e pagar o pedido", "Repassar ao restaurante e acompanhar o preparo", "Despachar entregador e rastrear a entrega", "Avaliações e cupons"],
      nonFunctional: ["Pedido como máquina de estados durável (criado, aceito, em preparo, a caminho, entregue)", "Busca por restaurantes por localização e disponibilidade", "Despacho considera distância, fila do restaurante e carga do entregador", "Pico no almoço e jantar: pré-escalar e degradar recursos secundários", "Idempotência no pagamento e na confirmação do pedido"],
      scale: { users: "dezenas de milhões de pedidos/mês", rps: "milhares de pedidos/min no pico", readWrite: "leitura maior que escrita", storage: "milhões de itens de cardápio" }, targets: { latency: "p95 < 400 ms", availability: "99,95%", consistency: "Forte no pedido" } }),
  co("nubank", "Nubank", "nubank", "#A855F7", "Contas e cartões com consistência forte e auditoria completa", "Avançado",
    "Cada centavo precisa estar certo: transações viram eventos imutáveis e todo saldo é derivado de um livro-razão auditável.",
    ["Event sourcing", "Livro-razão", "Consistência forte"],
    { functional: ["Contas, cartões e extrato", "Autorizar compras no cartão", "Transferências entre contas", "Fatura e limite em tempo real", "Notificação a cada transação"],
      nonFunctional: ["Estado derivado de eventos imutáveis (event sourcing)", "Autorização do cartão em poucos milissegundos, mesmo sob falha parcial", "Saldo nunca negativo por concorrência: serializar por conta", "Auditoria e rastreabilidade de toda alteração", "Reprocessar eventos para corrigir erros sem perder histórico", "Isolamento de dados sensíveis"],
      scale: { users: "dezenas de milhões de clientes", rps: "milhares de transações/s", readWrite: "equilibrado, escrita crítica", storage: "histórico financeiro permanente" }, targets: { latency: "autorização em < 200 ms", availability: "99,99%", consistency: "Forte por conta" } }),
  co("pix", "Pix", "pix", "#32BCAD", "Pagamento instantâneo 24×7 com liquidação em segundos", "Avançado",
    "Transferências entre instituições em menos de 10 segundos, a qualquer hora, sem duplicar nem perder uma operação.",
    ["Liquidação instantânea", "Idempotência", "Diretório de chaves"],
    { functional: ["Cadastrar e consultar chaves (CPF, e-mail, telefone, aleatória)", "Iniciar pagamento por chave ou QR Code", "Liquidar entre instituições em segundos", "Devolução e contestação", "Comprovante e extrato"],
      nonFunctional: ["Operar 24 horas por dia, todos os dias, sem janela de manutenção", "Liquidação em poucos segundos com confirmação para ambos os lados", "Idempotência: a mesma ordem nunca debita duas vezes", "Diretório de chaves consultado em milissegundos", "Reconciliação entre instituições e trilha de auditoria", "Limites e antifraude no caminho da transação"],
      scale: { users: "dezenas de milhões de usuários ativos", rps: "milhares de transações/s no pico", readWrite: "escrita crítica", storage: "histórico financeiro permanente" }, targets: { latency: "p95 < 1 s por etapa; fim a fim < 10 s", availability: "99,99%", consistency: "Forte" } }),
  co("mercado-livre", "Mercado Livre", "mercado-livre", "#FFC400", "Marketplace com busca, anúncios e pedidos de milhões de vendedores", "Avançado",
    "Um marketplace em que preço e estoque mudam o tempo todo, a busca precisa ser rápida e cada pedido envolve vendedor, pagamento e envio.",
    ["Busca e filtros", "Estoque por vendedor", "Pedido com pagamento e envio"],
    { functional: ["Publicar e editar anúncios", "Buscar com filtros e ordenação", "Carrinho, compra e pagamento", "Perguntas e avaliações", "Rastrear o envio"],
      nonFunctional: ["Índice de busca atualizado quando preço ou estoque mudam", "Estoque por anúncio sem vender além do disponível", "Pedido orquestrado entre pagamento, vendedor e logística (saga)", "Picos em campanhas: cache de páginas de produto e filas para tarefas assíncronas", "Isolar falhas de um vendedor ou serviço do restante"],
      scale: { users: "dezenas de milhões de compradores/mês", rps: "dezenas de milhares de consultas/s", readWrite: "leitura muito maior que escrita", storage: "centenas de milhões de anúncios" }, targets: { latency: "busca em < 400 ms", availability: "99,95%", consistency: "Forte no estoque, eventual na busca" } }),
  co("free-fire", "Free Fire", "freefire", "#F9A21B", "Partidas em tempo real e pico de lançamento de atualização", "Avançado",
    "Um battle royale mobile com milhões de jogadores ao mesmo tempo: montar partidas rápido, manter cada partida em tempo real e sobreviver ao dia em que todo mundo baixa a atualização.",
    ["Matchmaking", "Servidor de partida", "Distribuição de patch"],
    { functional: ["Login e perfil do jogador", "Matchmaking por região e nível de habilidade", "Partida em tempo real com dezenas de jogadores", "Loja, inventário e compras dentro do jogo", "Ranking e temporadas", "Baixar a atualização do jogo"],
      nonFunctional: ["Dia de lançamento: milhões baixando o patch ao mesmo tempo, servido pela CDN e não pelo backend", "Estado da partida em memória e em tempo real, com servidor autoritativo contra trapaça", "Matchmaking que não trava em pico: fila de espera e limites de entrada por região", "Compras com consistência forte: nunca cobrar duas vezes nem perder um item", "Telemetria e eventos de jogo em log para antitrapaça e balanceamento", "Degradação graciosa: se a loja cair, as partidas continuam"],
      scale: { users: "dezenas de milhões de jogadores ativos por dia", rps: "picos de centenas de milhares de req/s no lançamento", readWrite: "leitura alta, escrita constante de eventos", storage: "perfis, inventários e patches de vários GB" }, targets: { latency: "resposta de partida em < 100 ms", availability: "99,95% durante eventos", consistency: "Forte nas compras, eventual no ranking" },
      constraints: "Decisões que a entrevista costuma cobrar: separar plano de partida do plano de conta, regionalizar servidores de jogo, pré-distribuir o patch pela CDN, proteger o login em pico e tratar trapaça." }),
  co("shopee", "Shopee", "shopee", "#EE4D2D", "Marketplace mobile com flash sales e campanhas de pico (11.11)", "Avançado",
    "Um marketplace usado quase só pelo celular, onde campanhas como 11.11 concentram milhões de compras em minutos e o estoque de cada oferta relâmpago é limitado.",
    ["Flash sale", "Estoque atômico", "Checkout em pico"],
    { functional: ["Buscar produtos com filtros", "Ver ofertas relâmpago com contagem regressiva", "Carrinho e checkout com pagamento", "Cupons e moedas de desconto", "Acompanhar pedido e entrega", "Chat entre comprador e vendedor"],
      nonFunctional: ["Estoque da oferta relâmpago decrementado de forma atômica: nunca vender além do disponível", "Pico de campanha: páginas e imagens em cache e CDN, checkout protegido por fila", "Pedido orquestrado entre pagamento, estoque e logística (saga), com compensação em caso de falha", "Índice de busca atualizado quando preço ou estoque mudam", "Limites por usuário e proteção contra robôs de compra", "Isolar falha de um vendedor ou serviço do restante"],
      scale: { users: "dezenas de milhões de compradores por dia em campanha", rps: "dezenas de milhares de req/s no pico do 11.11", readWrite: "leitura muito maior que escrita, com rajadas de escrita", storage: "centenas de milhões de produtos e imagens" }, targets: { latency: "busca e página de produto em < 400 ms", availability: "99,95% em campanha", consistency: "Forte no estoque, eventual na busca" },
      constraints: "Decisões que a entrevista costuma cobrar: reserva atômica de estoque (Redis ou banco), fila para o checkout, pré-aquecer cache antes da campanha, idempotência de pedido e degradar recomendações antes do pagamento." }),
  co("itau", "Itaú", "itau", "#EC7000", "Banco digital em escala: transações consistentes, antifraude e legado integrado", "Avançado",
    "Um banco com milhões de clientes no app, Pix e cartões: cada operação precisa ser consistente e auditável, com antifraude em tempo real e integração com sistemas legados.",
    ["Ledger", "Antifraude em tempo real", "Integração com legado"],
    { functional: ["Saldo e extrato", "Transferências, Pix e pagamento de contas", "Cartões: compra, fatura e limite", "Alertas de segurança e notificações", "Autenticação forte no app", "Investimentos e consulta de posição"],
      nonFunctional: ["Consistência forte em saldo e transferências: nunca perder ou duplicar dinheiro", "Eventos imutáveis de transação como trilha de auditoria exigida por regulação", "Antifraude em tempo real analisando cada operação sem atrasar o cliente", "Picos em dia de pagamento e de 13º salário: leitura de saldo em cache", "Core bancário legado protegido por uma camada de integração, sem sobrecarregá-lo", "Alta disponibilidade e recuperação de desastre entre regiões"],
      scale: { users: "dezenas de milhões de clientes", rps: "dezenas de milhares de consultas por segundo", readWrite: "leitura maior que escrita, com escrita crítica", storage: "histórico de transações por décadas" }, targets: { latency: "operação em < 300 ms", availability: "99,99% nas operações essenciais", consistency: "Forte nas transações" },
      constraints: "Decisões que a entrevista costuma cobrar: ledger como fonte da verdade, idempotência em Pix e transferências, camada anticorrupção sobre o legado, antifraude assíncrono com bloqueio síncrono só quando necessário e conformidade." }),
];


export const caseRequirements = (c: StudyCase): Requirements => ({ ...emptyRequirements(), ...c.req });

/** Pico e mistura de leitura/escrita de cada caso (ordens de grandeza de ensino). Quem não aparece aqui usa o padrão do encurtador. */
const LOADS: Record<string, Load> = {
  "url-shortener": { peakRps: 5000, readPct: 99 }, "rate-limiter": { peakRps: 20000, readPct: 50 }, "key-value-store": { peakRps: 50000, readPct: 70 },
  "notification-system": { peakRps: 10000, readPct: 20 }, chat: { peakRps: 30000, readPct: 50 }, "video-call": { peakRps: 5000, readPct: 50 },
  "social-feed": { peakRps: 20000, readPct: 95 }, "video-streaming": { peakRps: 30000, readPct: 99 }, "photo-sharing": { peakRps: 8000, readPct: 95 },
  "search-autocomplete": { peakRps: 40000, readPct: 99 }, ecommerce: { peakRps: 10000, readPct: 90 }, payments: { peakRps: 3000, readPct: 30 },
  ticketing: { peakRps: 50000, readPct: 70 }, "ride-hailing": { peakRps: 25000, readPct: 30 }, "food-delivery": { peakRps: 8000, readPct: 60 },
  "file-storage": { peakRps: 5000, readPct: 60 }, "web-crawler": { peakRps: 5000, readPct: 20 },
  netflix: { peakRps: 100000, readPct: 98 }, youtube: { peakRps: 80000, readPct: 97 }, spotify: { peakRps: 50000, readPct: 90 }, tiktok: { peakRps: 100000, readPct: 95 },
  instagram: { peakRps: 60000, readPct: 95 }, x: { peakRps: 60000, readPct: 92 }, linkedin: { peakRps: 30000, readPct: 92 }, whatsapp: { peakRps: 60000, readPct: 50 },
  discord: { peakRps: 70000, readPct: 60 }, uber: { peakRps: 40000, readPct: 30 }, airbnb: { peakRps: 15000, readPct: 97 }, amazon: { peakRps: 50000, readPct: 90 },
  stripe: { peakRps: 20000, readPct: 40 }, "google-search": { peakRps: 100000, readPct: 99 }, "google-maps": { peakRps: 60000, readPct: 97 }, slack: { peakRps: 30000, readPct: 80 },
  zoom: { peakRps: 20000, readPct: 50 }, pinterest: { peakRps: 30000, readPct: 95 }, reddit: { peakRps: 30000, readPct: 90 }, twitch: { peakRps: 50000, readPct: 80 }, wikipedia: { peakRps: 40000, readPct: 99 },
  ifood: { peakRps: 15000, readPct: 85 }, nubank: { peakRps: 15000, readPct: 60 }, pix: { peakRps: 10000, readPct: 40 }, "mercado-livre": { peakRps: 30000, readPct: 92 }, dropbox: { peakRps: 20000, readPct: 60 }, ticketmaster: { peakRps: 60000, readPct: 80 },
  "free-fire": { peakRps: 90000, readPct: 70 }, shopee: { peakRps: 70000, readPct: 88 }, itau: { peakRps: 25000, readPct: 65 },
};
export const loadOf = (id: string): Load | undefined => LOADS[id];

const N = (label: string, any: string[], why: string): Need => ({ label, any, why });
const CDN = N("CDN na borda", ["cdn"], "Mídia e estáticos servidos perto do usuário, longe do backend.");
const CACHE = N("Cache de leitura", ["redis"], "Absorve a leitura repetida e protege o banco.");
const STREAM = N("Log de eventos ou fila", ["kafka", "queue"], "Desacopla produtores de consumidores e absorve picos.");
const WS = N("Conexões persistentes", ["websocket"], "Entrega em tempo real sem polling.");
const DB = N("Banco de dados", ["sql-database", "nosql-database"], "Armazenamento durável da fonte da verdade.");
const SQL = N("Banco SQL", ["sql-database"], "Transações e consistência forte onde o dinheiro ou o estoque estão em jogo.");
const NOSQL = N("Banco NoSQL", ["nosql-database"], "Escala horizontal para volume e escrita altos.");
const OBJ = N("Object storage", ["object-storage"], "Blobs grandes (vídeo, foto, arquivo) fora do banco.");
const SEARCH = N("Índice de busca", ["search-engine"], "Busca por texto e filtros sem varrer o banco.");
const WORKER = N("Workers", ["worker"], "Processamento assíncrono fora do caminho da requisição.");
const GW = N("Gateway ou balanceador", ["api-gateway", "load-balancer"], "Ponto de entrada com roteamento, limites e distribuição de carga.");

/** Verificações automáticas por caso: meta de p95 e componentes que a arquitetura de referência costuma ter. */
const CHECKS: Record<string, Checks> = {
  "url-shortener": { p95Ms: 100, needs: [CACHE, DB] }, "rate-limiter": { p95Ms: 60, needs: [N("Contador rápido", ["redis"], "Contagem por cliente em memória, com expiração."), GW] },
  "key-value-store": { p95Ms: 60, needs: [NOSQL, CACHE] }, "notification-system": { needs: [STREAM, WORKER, N("Serviço de notificações", ["notification-service"], "Envio por push, e-mail e SMS.")] },
  chat: { p95Ms: 200, needs: [WS, STREAM, DB] }, "video-call": { p95Ms: 150, needs: [WS, GW] }, "social-feed": { p95Ms: 300, needs: [CACHE, STREAM, DB] },
  "video-streaming": { needs: [CDN, OBJ, STREAM, WORKER] }, "photo-sharing": { p95Ms: 300, needs: [CDN, OBJ] }, "search-autocomplete": { p95Ms: 100, needs: [SEARCH, CACHE] },
  ecommerce: { p95Ms: 300, needs: [SQL, STREAM, CACHE, SEARCH] }, payments: { p95Ms: 1000, needs: [SQL, STREAM] }, ticketing: { p95Ms: 1000, needs: [CACHE, SQL, STREAM] },
  "ride-hailing": { p95Ms: 500, needs: [CACHE, N("Log de eventos", ["kafka"], "Fluxo contínuo de posições e estados da corrida."), WS] },
  "food-delivery": { p95Ms: 500, needs: [STREAM, WS, DB] }, "file-storage": { p95Ms: 500, needs: [OBJ, SQL, N("Aviso de mudanças", ["queue", "kafka", "websocket"], "Notifica os dispositivos sem polling.")] },
  "web-crawler": { needs: [N("Fila de URLs", ["queue", "kafka"], "Fronteira de URLs a visitar."), WORKER, OBJ] },
  netflix: { p95Ms: 200, needs: [CDN, CACHE, N("Log de eventos", ["kafka"], "Eventos de reprodução e telemetria para recomendação."), N("API Gateway", ["api-gateway"], "Entrada única do plano de controle."), NOSQL, OBJ] },
  youtube: { p95Ms: 300, needs: [CDN, OBJ, STREAM, WORKER, CACHE] }, spotify: { p95Ms: 300, needs: [CDN, N("Log de eventos", ["kafka"], "Eventos de execução para royalties e recomendação."), CACHE, NOSQL] },
  tiktok: { p95Ms: 300, needs: [CDN, N("Log de eventos", ["kafka"], "Sinais de engajamento em tempo quase real."), CACHE, OBJ] },
  instagram: { p95Ms: 500, needs: [CDN, CACHE, OBJ, DB, STREAM] }, x: { p95Ms: 300, needs: [CACHE, N("Log de eventos", ["kafka"], "Fan-out e trending em streaming."), SEARCH, NOSQL] },
  linkedin: { p95Ms: 200, needs: [N("Log de eventos", ["kafka"], "Propaga mudanças do grafo para busca, feed e recomendação."), SEARCH, CACHE, DB] },
  whatsapp: { p95Ms: 200, needs: [WS, STREAM, NOSQL, OBJ] }, discord: { p95Ms: 200, needs: [WS, NOSQL, CACHE, N("Log de eventos", ["kafka"], "Eventos entre guilds e serviços.")] },
  uber: { p95Ms: 500, needs: [N("Log de eventos", ["kafka"], "Fluxo de posições e estados de corrida."), CACHE, WS, SQL] },
  airbnb: { p95Ms: 500, needs: [SEARCH, SQL, CACHE, STREAM] }, amazon: { p95Ms: 300, needs: [SQL, NOSQL, STREAM, CACHE, CDN] },
  stripe: { p95Ms: 1000, needs: [SQL, STREAM, N("API Gateway", ["api-gateway"], "Autenticação, limites de taxa e versionamento na entrada.")] },
  "google-search": { p95Ms: 200, needs: [SEARCH, CACHE, WORKER, OBJ] }, "google-maps": { p95Ms: 300, needs: [CDN, OBJ, N("Log de eventos", ["kafka"], "Posições anônimas agregadas em streaming para o trânsito."), CACHE, NOSQL] },
  slack: { p95Ms: 500, needs: [WS, SEARCH, DB, STREAM] }, zoom: { p95Ms: 300, needs: [WS, GW, DB] }, pinterest: { p95Ms: 500, needs: [CDN, CACHE, OBJ, DB, STREAM] },
  reddit: { p95Ms: 300, needs: [CACHE, STREAM, SQL, SEARCH] }, twitch: { p95Ms: 500, needs: [CDN, WS, OBJ, STREAM, WORKER] }, wikipedia: { p95Ms: 200, needs: [CDN, CACHE, SQL, SEARCH] },
  ifood: { p95Ms: 400, needs: [SEARCH, SQL, STREAM, CACHE, WS] }, nubank: { p95Ms: 200, needs: [SQL, N("Log de eventos", ["kafka"], "Eventos imutáveis são a fonte da verdade (event sourcing)."), CACHE, GW] },
  pix: { p95Ms: 1000, needs: [SQL, STREAM, CACHE, GW] }, "mercado-livre": { p95Ms: 400, needs: [SEARCH, SQL, CACHE, STREAM, CDN] },
  dropbox: { p95Ms: 500, needs: [OBJ, SQL, STREAM] }, ticketmaster: { p95Ms: 1000, needs: [CACHE, SQL, STREAM, N("Balanceador", ["load-balancer"], "Distribui a abertura de vendas.")] },
  "free-fire": { p95Ms: 100, needs: [CDN, OBJ, WS, CACHE, NOSQL, SQL, N("Log de eventos", ["kafka"], "Telemetria de partida e sinais de antitrapaça em streaming."), GW] },
  shopee: { p95Ms: 400, needs: [SEARCH, CACHE, SQL, CDN, N("Log de eventos", ["kafka"], "Pedidos, estoque e pagamentos orquestrados por eventos."), GW] },
  itau: { p95Ms: 300, needs: [SQL, N("Log de eventos", ["kafka"], "Eventos imutáveis de transação para auditoria e antifraude."), CACHE, GW, N("Serviço de notificações", ["notification-service"], "Alertas de segurança e de transação ao cliente.")] },
};


/** Falhas do modo caos que mais interessam em cada caso (ids de chaos.ts). */
const CHAOS_HINTS: Record<string, string[]> = {
  "url-shortener": ["redis", "t10", "dblat"], "rate-limiter": ["redis", "spike"], "key-value-store": ["partition", "disk", "az"], "notification-system": ["svc", "spike"],
  chat: ["flap", "partition"], "video-call": ["highlat", "loss"], "social-feed": ["redis", "spike"], "video-streaming": ["bw", "t10"], "photo-sharing": ["disk", "t10"],
  "search-autocomplete": ["redis", "t10"], ecommerce: ["t100", "dbdown"], payments: ["dbdown", "partition"], ticketing: ["t100", "spike"], "ride-hailing": ["highlat", "spike"],
  "food-delivery": ["svc", "spike"], "file-storage": ["disk", "corrupt"], "web-crawler": ["loss", "svc"],
  netflix: ["redis", "xregion", "t10", "dblat"], youtube: ["dblat", "t10", "disk"], spotify: ["redis", "dbdown"], tiktok: ["redis", "spike"], instagram: ["redis", "dbdown", "az"],
  x: ["spike", "redis", "dbdown"], linkedin: ["dbdown", "partition"], whatsapp: ["partition", "az", "loss"], discord: ["flap", "spike", "partition"], uber: ["xregion", "dblat", "spike"],
  airbnb: ["dbdown", "dblat"], "google-search": ["t10", "redis", "dblat"], "google-maps": ["t10", "xregion", "redis"], slack: ["flap", "partition", "dbdown"], zoom: ["highlat", "loss", "az"],
  pinterest: ["redis", "dbdown"], reddit: ["spike", "redis", "dbdown"], twitch: ["spike", "bw", "az"], wikipedia: ["t10", "redis"], ifood: ["spike", "svc", "dbdown"],
  nubank: ["dbdown", "partition", "az"], pix: ["dbdown", "partition", "xregion"], "mercado-livre": ["t10", "dbdown", "redis"],
  amazon: ["t100", "dbdown", "az"], stripe: ["dbdown", "partition", "dblat"], dropbox: ["disk", "corrupt", "partition"], ticketmaster: ["t100", "spike", "redis"],
  "free-fire": ["spike", "t100", "partition"], shopee: ["t100", "dbdown", "redis"], itau: ["dbdown", "partition", "az", "dblat"],
};
const DBS = ["sql-database", "nosql-database"], APPS = ["backend", "microservice"], ENTRY = ["api-gateway", "load-balancer"], LOGS = ["kafka", "queue"];
/** Regras de caminho deduzidas dos componentes que o caso exige: não basta ter a peça, ela precisa estar no caminho certo. */
function pathsFor(needs: Need[]): PathRule[] {
  // só exige o caminho quando o componente é obrigatório; requisitos com alternativas (ex.: fila ou WebSocket) não geram regra de caminho
  const has = (t: string) => needs.some((n) => n.any.length === 1 && n.any[0] === t);
  const out: PathRule[] = [{ label: "Escrita chega ao banco, passando pelo serviço", seq: [APPS, DBS], op: "write", why: "Todo dado novo precisa de um caminho até o armazenamento durável." }];
  if (has("redis")) out.push({ label: "Leitura passa pelo cache antes do banco", seq: [["redis"], DBS], op: "read", why: "O cache só protege o banco se estiver antes dele no fluxo de leitura (cache-aside)." });
  if (needs.some((n) => n.any.some((t) => LOGS.includes(t)))) out.push({ label: "Serviço publica no log ou fila", seq: [APPS, LOGS], why: "O produtor publica o evento e segue; o consumo acontece de forma assíncrona." });
  if (has("cdn") && has("object-storage")) out.push({ label: "Mídia sai do object storage pela CDN", seq: [["cdn"], ["object-storage"]], op: "read", why: "A CDN busca na origem só em caso de miss; o object storage guarda os bytes." });
  if (has("search-engine")) out.push({ label: "Busca passa pelo índice", seq: [APPS, ["search-engine"]], op: "read", why: "Consultas por texto vão ao índice, não ao banco transacional." });
  if (has("websocket")) out.push({ label: "Conexão persistente chega ao serviço", seq: [["websocket"], APPS], why: "A conexão aberta entrega eventos em tempo real sem polling." });
  if (needs.some((n) => n.any.some((t) => ENTRY.includes(t)))) out.push({ label: "Entrada distribui carga antes do serviço", seq: [ENTRY, APPS], why: "O tráfego passa por um ponto de entrada antes de chegar às instâncias." });
  return out;
}
export const checksOf = (id: string): Checks | undefined => {
  const c = CHECKS[id]; if (!c) return undefined;
  return { ...c, chaos: CHAOS_HINTS[id], paths: pathsFor(c.needs), minHitRate: c.needs.some((n) => n.any.includes("redis")) ? 0.8 : undefined };
};

export const caseById = (id: string): StudyCase | undefined => [...COMPANY_CASES, ...CASES].find((c) => c.id === id);
/** Sessão de estudo de um caso: requisitos, carga e verificações. */
export const sessionFor = (c: StudyCase): Session => ({ mode: "study", title: c.title, caseId: c.id, summary: c.summary, requirements: caseRequirements(c), load: loadOf(c.id), checks: checksOf(c.id) });

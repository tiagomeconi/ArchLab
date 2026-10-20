# Publicar

O ArchLab é um site **estático**. O backend (login e dados por usuário) é o **Supabase**, e é opcional: sem as variáveis da seção 3 o app roda em modo local, sem conta. Qualquer hospedagem de arquivos serve, desde que reescreva rotas desconhecidas para `index.html` (o app usa rotas como `/start/estudo` e `/app`).

## 1. Subir para o GitHub

```bash
# crie um repositório vazio no GitHub (sem README/licença) e copie a URL
git remote add origin git@github.com:SEU_USUARIO/archlab.git     # ou a URL https
git branch -M main
git push -u origin main
```

Os documentos internos (`docs-internal/`), `.env` e dependências não vão para o GitHub (veja `.gitignore`).

## 2. Hospedar (recomendado: Vercel, Netlify ou Cloudflare Pages)

Configuração igual nos três:

| Campo | Valor |
| --- | --- |
| Framework | Vite |
| Install | `pnpm install` |
| Build | `pnpm --filter @archlab/web build` |
| Output | `apps/web/dist` |
| Node | 20 ou superior |

Reescrita de rotas já está pronta: `vercel.json` (Vercel) e `apps/web/public/_redirects` (Netlify e Cloudflare Pages).

**Vercel:** *Add New → Project → importar o repositório*. A Vercel detecta duas aplicações (`apps/web` e `e2e`): clique em **Import single project** na linha **web** (Vite, `apps/web`). Confirme Framework = Vite, Root Directory = `apps/web`, Output = `dist` e deixe ligada a opção *Include source files outside of the Root Directory* (o app usa o pacote `packages/domain`). A reescrita de rotas vem de `apps/web/vercel.json`. Deploy. Domínio próprio em *Settings → Domains*.

**Netlify:** *Add new site → Import from Git* → mesmos campos (o `netlify.toml` já aponta o build).

**Cloudflare Pages:** *Workers & Pages → Create → Pages → Connect to Git* → mesmos campos.

### GitHub Pages (alternativa)

Não reescreve rotas, então links diretos como `/start/estudo` dão 404. Se optar por ele, é preciso copiar `index.html` para `404.html` no build e, se for publicar em `usuario.github.io/repositorio`, definir `base: "/repositorio/"` em `apps/web/vite.config.ts`. Prefira uma das opções acima.

## 3. Conferir antes de publicar

```bash
pnpm typecheck && pnpm test && pnpm --filter @archlab/web build
pnpm --filter @archlab/web exec vite preview     # serve o build localmente
```

Os vídeos e imagens da landing ficam em `apps/web/public/shots` (≈ 9 MB). Se a hospedagem cobrar por banda, considere servi-los por uma CDN.

## 3. Login e banco de dados (Supabase)

1. Crie um projeto em https://supabase.com.
2. No **SQL Editor**, rode, **em ordem**, os arquivos de `supabase/migrations/`: `0001_init.sql` (progresso, desenhos e links, com RLS: cada usuário só vê os próprios dados), `0002_profiles.sql` (perfil e data de nascimento), `0003_avatars.sql` (fotos de perfil) e `0004_social.sql` (dias praticados e perfil público opt-in) e `0005_ranking_and_delete.sql` (ranking e exclusão da própria conta). Todos podem ser rodados de novo sem erro.
3. Em **Authentication → Providers**, deixe *Email* ligado. Em **Authentication → URL Configuration**, ponha o domínio publicado em *Site URL* e adicione `https://SEU-DOMINIO/**` (e `http://localhost:5173/**`) em *Redirect URLs*. **Se o *Site URL* ficar em `http://localhost:3000`, o link do e-mail de confirmação leva a pessoa para o localhost.** Defina também `VITE_SITE_URL=https://SEU-DOMINIO` na hospedagem: o link do e-mail abre `/confirmado`, a página que avisa que a conta foi validada.
4. Em **Project Settings → API**, copie a *Project URL* e a chave **anon** para as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (Vercel/Netlify → *Environment Variables*; local: `apps/web/.env.local`). Nunca use a chave `service_role` no front-end.
5. Refaça o deploy. Com as variáveis definidas, `/start` e `/app` exigem login; a landing continua pública.

A CSP (`vercel.json` e `netlify.toml`) já libera `*.supabase.co` em `connect-src`.

## 4. Termos de uso e política de privacidade

As páginas `/termos` e `/privacidade` já existem, em português e inglês, escritas a partir do que o sistema realmente faz. São um **texto-modelo: peça a revisão de uma pessoa da área jurídica antes de divulgar**. Defina estas variáveis (as mesmas da seção 3, na Vercel/Netlify e no `.env`) para que o texto cite quem opera o projeto e como falar com ele; sem elas o texto usa uma frase genérica:

| Variável | Para quê |
| --- | --- |
| `VITE_LEGAL_NAME` | Nome da pessoa ou empresa responsável (ex.: "Tiago Meconi") |
| `VITE_CONTACT_EMAIL` | E-mail para pedidos sobre dados pessoais |

Ao mudar o texto, atualize `LEGAL_VERSION` em `apps/web/src/legal.ts`: o cadastro grava essa versão e a data do aceite nos metadados da conta.

## E-mails de autenticação (aparência)

Modelos prontos em `supabase/email-templates/`. No Supabase, em **Authentication → Email Templates**, cole `confirmacao.html` em *Confirm signup* (assunto: `Confirme seu e-mail no ArchLab`) e `recuperacao.html` em *Reset password* (assunto: `Crie uma nova senha no ArchLab`). **O Supabase só libera a edição dos modelos depois que um SMTP próprio é configurado** (Authentication → SMTP Settings, ex.: Resend). O SMTP próprio também troca o remetente "Supabase Auth" e tira o limite baixo de envios. Atenção: o remetente de teste `onboarding@resend.dev` só entrega para o e-mail da conta do Resend; para enviar a qualquer pessoa é preciso um domínio próprio verificado no Resend.

## Login com GitHub e Google (sem e-mail de confirmação)

O app mostra os botões GitHub e Google na tela de entrar/criar conta. Quem entra por eles não recebe e-mail de confirmação (o provedor já verifica o e-mail) e completa nome, nascimento e aceite dos termos numa tela única, na primeira entrada. Para ligar, em cada provedor use esta *callback URL*: `https://<seu-projeto>.supabase.co/auth/v1/callback`.

- **GitHub:** github.com → Settings → Developer settings → OAuth Apps → New OAuth App. *Homepage URL* = o endereço do site; *Authorization callback URL* = a callback acima. Gere um *Client secret*. No Supabase, em **Authentication → Providers → GitHub**, ligue e cole *Client ID* e *Client secret*.
- **Google:** console.cloud.google.com → APIs e serviços → Tela de consentimento OAuth (tipo Externo, publique em "Em produção") → Credenciais → Criar ID do cliente OAuth (Aplicativo da Web). *Origens JS autorizadas* = o endereço do site; *URIs de redirecionamento* = a callback acima. No Supabase, em **Providers → Google**, ligue e cole *Client ID* e *Client secret*.
- Em **Authentication → URL Configuration**, o domínio publicado (e `http://localhost:5173/**` para testes) precisa estar em *Redirect URLs*.

## Pendências para quando houver domínio próprio

Hoje o site roda em `*.vercel.app`. Com um domínio seu, vale fazer tudo junto:
- **E-mail:** verificar o domínio no Resend (registros SPF/DKIM) e trocar o remetente do SMTP no Supabase para `no-reply@seudominio`. Sem isso, só a conta do Resend recebe e-mail de confirmação; quem entra por GitHub/Google não depende disto.
- **Tela do Google:** o texto "Prosseguir para `<projeto>.supabase.co`" some com a verificação de marca no Google (logo + domínio verificado no Search Console) ou com o *Custom Domain* pago do Supabase (`auth.seudominio`).
- **URLs:** atualizar *Site URL* e *Redirect URLs* no Supabase, `VITE_SITE_URL` na hospedagem, a origem autorizada no cliente OAuth do Google e a *Homepage URL* do app no GitHub.
- **Chaves:** o *Client secret* do Google deve ficar só no painel do Supabase; se aparecer em print ou chat, gere outro e apague o antigo.

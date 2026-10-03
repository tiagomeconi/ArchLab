# Publicar

O ArchLab é um site **estático** (não tem backend nem variáveis de ambiente obrigatórias). Qualquer hospedagem de arquivos serve, desde que reescreva rotas desconhecidas para `index.html` (o app usa rotas como `/start/estudo` e `/app`).

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

**Vercel:** *Add New → Project → importar o repositório* → conferir os campos acima → Deploy. Domínio próprio em *Settings → Domains*.

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

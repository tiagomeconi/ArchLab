// os testes importam arquivos do app web, que leem import.meta.env (tipado pelo vite/client lá)
interface ImportMeta { readonly env: Record<string, string | undefined> }

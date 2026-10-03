# Testes de ponta a ponta

Dirigem o app num Chromium real (Playwright + pytest): navegação, laboratório, referência, guia, compartilhar por link, exportar/importar, idioma, acessibilidade (axe) e responsivo.

```bash
pip install -r e2e/requirements.txt
python -m playwright install chromium
pytest e2e            # sobe o Vite sozinho numa porta livre
BASE_URL=http://127.0.0.1:5173 pytest e2e   # ou usa um servidor que já está rodando
```

Cada teste falha se a página lançar um erro de JavaScript. Os testes de idioma procuram texto em português que sobrou na interface em inglês; ao adicionar texto novo na UI, envolva-o em `t("…")` e inclua a tradução em `apps/web/src/i18n/`.

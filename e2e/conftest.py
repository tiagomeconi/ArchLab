"""Testes de ponta a ponta: sobem o Vite (se necessário) e dirigem o app num Chromium real.

Uso:  pip install -r e2e/requirements.txt && python -m playwright install chromium && pytest e2e
Variáveis: BASE_URL (usa um servidor já rodando em vez de subir o Vite).
"""
import os, socket, subprocess, time, pathlib, urllib.request
import pytest
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
WEB = ROOT / "apps" / "web"


def _up(url: str) -> bool:
    try:
        urllib.request.urlopen(url, timeout=1.5); return True
    except Exception:
        return False


@pytest.fixture(scope="session")
def base_url():
    url = os.environ.get("BASE_URL")
    if url:
        assert _up(url), f"BASE_URL {url} não responde"
        yield url.rstrip("/"); return
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]
    vite = WEB / "node_modules" / ".bin" / "vite"
    proc = subprocess.Popen([str(vite), "--host", "127.0.0.1", "--port", str(port), "--strictPort"], cwd=WEB, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    url = f"http://127.0.0.1:{port}"
    try:
        for _ in range(60):
            if _up(url): break
            time.sleep(0.5)
        else:
            raise RuntimeError("o Vite não subiu a tempo")
        yield url
    finally:
        proc.terminate()


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch()
        yield b
        b.close()


@pytest.fixture
def make_page(browser, base_url):
    """Cria uma página nova com tema, idioma e viewport escolhidos. Falha o teste se a página lançar erro de JS."""
    ctxs, errors = [], []

    def make(width=1400, height=900, theme="dark", lang="pt", permissions=None, **kw):
        ctx = browser.new_context(viewport={"width": width, "height": height}, accept_downloads=True, **kw)
        # só define se ainda não houver valor: assim o teste de persistência do idioma enxerga o que o app gravou
        ctx.add_init_script(f"if(!localStorage.getItem('archlab:theme')) localStorage.setItem('archlab:theme','{theme}'); if(!localStorage.getItem('archlab:lang')) localStorage.setItem('archlab:lang','{lang}')")
        if permissions: ctx.grant_permissions(permissions, origin=base_url)
        pg = ctx.new_page(); pg.set_default_timeout(8000)
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.base = base_url
        ctxs.append(ctx); return pg

    yield make
    for c in ctxs: c.close()
    assert not errors, f"erros de JavaScript na página: {errors}"


@pytest.fixture
def page(make_page):
    return make_page()

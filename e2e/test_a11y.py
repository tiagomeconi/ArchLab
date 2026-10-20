import pytest
from axe_playwright_python.sync_playwright import Axe
from helpers import open_case

axe = Axe()


def violacoes(pg):
    return [f"{v['id']} ({v['impact']}): {v['help']} → {[n['target'][0] for n in v['nodes'][:2]]}" for v in axe.run(pg).response["violations"]]


def violacoes_em(pg, contexto):
    """Como `violacoes`, mas só dentro de um elemento (um diálogo modal escurece o resto da página e falsearia o contraste)."""
    return [f"{v['id']} ({v['impact']}): {v['help']} → {[n['target'][0] for n in v['nodes'][:2]]}" for v in axe.run(pg, context=contexto).response["violations"]]


@pytest.mark.parametrize("theme", ["dark", "light"])
@pytest.mark.parametrize("path", ["/", "/start", "/start/aulas", "/start/estudo", "/start/trilhas", "/start/livre", "/desenhos", "/planos", "/termos", "/privacidade", "/confirmado"])
def test_paginas_sem_violacoes_do_axe(make_page, theme, path):
    pg = make_page(theme=theme)
    pg.goto(pg.base + path); pg.wait_for_timeout(1500)
    assert violacoes(pg) == []


@pytest.mark.parametrize("theme", ["dark", "light"])
def test_laboratorio_sem_violacoes_do_axe(make_page, theme):
    pg = make_page(theme=theme)
    open_case(pg, "Netflix")
    assert violacoes(pg) == []
    pg.goto(pg.base + "/app"); pg.wait_for_selector(".react-flow__node"); pg.wait_for_timeout(1000)
    assert violacoes(pg) == []


def test_paginas_em_ingles_sem_violacoes(make_page):
    pg = make_page(lang="en")
    for path in ("/start", "/start/estudo"):
        pg.goto(pg.base + path); pg.wait_for_timeout(1200)
        assert violacoes(pg) == [], path


def test_navegacao_por_teclado_na_lista_de_casos(page):
    page.goto(page.base + "/start/estudo")
    page.wait_for_selector("h1")
    page.keyboard.press("Tab")  # link “pular para o conteúdo”
    assert page.evaluate("document.activeElement.textContent").startswith("Pular para o conteúdo")
    page.keyboard.press("Enter")
    # chega a um cartão e abre com Enter
    for _ in range(30):
        page.keyboard.press("Tab")
        if page.evaluate("document.activeElement.tagName") == "BUTTON" and "Ver requisitos" in page.evaluate("document.activeElement.textContent"): break
    page.keyboard.press("Enter")
    page.wait_for_selector(".react-flow")
    assert "/app" in page.url


def test_campo_de_busca_tem_nome_acessivel(page):
    page.goto(page.base + "/start/estudo")
    page.get_by_role("textbox", name="Buscar casos").wait_for()
    assert page.get_by_role("textbox", name="Buscar casos").is_visible()


def test_respeita_reducao_de_movimento(make_page):
    pg = make_page(reduced_motion="reduce")
    pg.goto(pg.base + "/start")
    pg.wait_for_selector("h1")
    dur = pg.evaluate("getComputedStyle(document.querySelector('a[href=\"/start/estudo\"]')).transitionDuration")
    assert dur in ("1e-05s", "0.00001s", "0s")


@pytest.mark.parametrize("theme", ["dark", "light"])
def test_revisao_cartao_de_conceito_grupos_e_dialogos_novos_sem_violacoes(make_page, theme):
    import re
    from helpers import add_component
    pg = make_page(theme=theme)
    pg.goto(pg.base + "/app?blank=1"); pg.wait_for_selector(".react-flow")
    pg.get_by_role("button", name="Padrões prontos").click()
    assert violacoes_em(pg, "dialog[open]") == []  # diálogo de padrões
    pg.locator("dialog[open]").get_by_role("button", name=re.compile("Fila e workers")).click(); pg.wait_for_timeout(800)
    pg.locator(".react-flow__pane").click(position={"x": 300, "y": 600}); pg.keyboard.press("Control+a"); pg.keyboard.press("g"); pg.wait_for_timeout(500)
    pg.get_by_role("tab", name=re.compile("Revisão")).click(); pg.wait_for_timeout(300)
    assert violacoes(pg) == []  # canvas com grupo selecionado + aba de revisão
    pg.get_by_role("button", name="Versões do desenho").click()
    assert violacoes_em(pg, "dialog[open]") == []  # diálogo de versões

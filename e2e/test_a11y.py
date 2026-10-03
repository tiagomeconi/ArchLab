import pytest
from axe_playwright_python.sync_playwright import Axe
from helpers import open_case

axe = Axe()


def violacoes(pg):
    return [f"{v['id']} ({v['impact']}): {v['help']} → {[n['target'][0] for n in v['nodes'][:2]]}" for v in axe.run(pg).response["violations"]]


@pytest.mark.parametrize("theme", ["dark", "light"])
@pytest.mark.parametrize("path", ["/", "/start", "/start/estudo", "/start/livre"])
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

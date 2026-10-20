import pytest


@pytest.mark.parametrize("path", ["/", "/start", "/start/estudo", "/start/livre", "/desenhos", "/termos", "/privacidade"])
@pytest.mark.parametrize("w", [360, 390, 768])
def test_sem_rolagem_horizontal(make_page, path, w):
    pg = make_page(width=w, height=800)
    pg.goto(pg.base + path); pg.wait_for_timeout(1500)
    h = pg.evaluate("document.body.scrollHeight")
    for y in range(0, h, 600):
        pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(100)
    sobra = pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    assert sobra <= 1, f"{path} em {w}px rola {sobra}px na horizontal"


def test_ciclo_no_celular_nao_corta_o_painel(make_page):
    pg = make_page(width=390, height=844)
    pg.goto(pg.base + "/"); pg.wait_for_timeout(1500)
    pg.evaluate("document.getElementById('ciclo').scrollIntoView()")
    for i in range(6):
        pg.locator("#ciclo ol button").nth(i).click(); pg.wait_for_timeout(1200)
        painel = pg.locator("#ciclo .aspect-square, #ciclo [class*='min-h-[36rem]']").first
        box = painel.bounding_box()
        assert box and box["x"] >= 0 and box["x"] + box["width"] <= 391


@pytest.mark.parametrize("largura", [1280, 1440, 1600, 1892])
def test_header_do_laboratorio_fica_numa_linha_so_em_modo_estudo(make_page, largura):
    from helpers import open_case
    pg = make_page(width=largura - 50, height=800)   # 50 px a menos: espaço do avatar da conta, que o teste local não mostra
    open_case(pg, "YouTube"); pg.wait_for_timeout(400)
    h = pg.locator("header").first.bounding_box()["height"]
    assert h < 90, f"header com {h:.0f}px de altura em {largura}px: quebrou em duas linhas"

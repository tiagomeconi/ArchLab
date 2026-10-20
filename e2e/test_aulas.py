import re
from helpers import add_component


def _continuar(page, nome="Continuar"):
    page.get_by_role("button", name=nome).click(); page.wait_for_timeout(300)


def test_aula_1_guia_cada_passo_confere_a_tarefa_e_conclui(page):
    page.goto(page.base + "/start/aulas"); page.get_by_role("heading", name="Aulas", exact=True).wait_for()
    assert "0/7" in page.inner_text("main")
    page.get_by_role("button", name=re.compile("^Começar")).first.click()
    page.wait_for_selector(".react-flow"); panel = page.get_by_role("region", name="Aula")
    panel.get_by_role("heading", name="Quem pede e quem responde").wait_for()
    assert page.get_by_role("button", name="Continuar").count() == 0      # a tarefa ainda não foi feita
    # passo 1: Cliente
    add_component(page, "Cliente"); panel.get_by_role("status").wait_for(); _continuar(page)
    # passo 2: Backend
    panel.get_by_role("heading", name="O servidor").wait_for(); add_component(page, "Backend"); panel.get_by_role("status").wait_for(); _continuar(page)
    # passo 3: ligar os dois (arrastando as bolinhas) — afasta os blocos antes
    panel.get_by_role("heading", name="Ligar os dois").wait_for()
    ns = page.locator(".react-flow__node-arch")
    for i, (x, y) in enumerate([(300, 450), (700, 450)]):
        bb = ns.nth(i).bounding_box(); page.mouse.move(bb["x"] + bb["width"] / 2, bb["y"] + 20); page.mouse.down(); page.mouse.move(x + 120, y + 20, steps=8); page.mouse.up(); page.wait_for_timeout(200)
    ha = ns.nth(0).locator('.react-flow__handle[data-handleid="right"]').bounding_box(); hb = ns.nth(1).locator('.react-flow__handle[data-handleid="left"]').bounding_box()
    page.mouse.move(ha["x"] + 5, ha["y"] + 5); page.mouse.down(); page.mouse.move(hb["x"] + 5, hb["y"] + 5, steps=12); page.mouse.up(); page.wait_for_timeout(300)
    if page.locator("dialog[open]").count(): page.get_by_role("button", name="Conectar").click()
    panel.get_by_role("status").wait_for(); _continuar(page)
    # passo 4: simular
    panel.get_by_role("heading", name="Quantos pedidos por segundo?").wait_for()
    page.get_by_role("button", name=re.compile("^.*Simular")).first.click(); page.wait_for_timeout(5500)
    panel.get_by_role("status").wait_for(); _continuar(page)
    # passo 5: selecionar o backend
    panel.get_by_role("heading", name="Lendo o resultado").wait_for()
    page.locator(".react-flow__node-arch", has_text="Backend").first.click()
    panel.get_by_role("status").wait_for(); _continuar(page, "Concluir aula")
    page.get_by_role("region", name="Aula concluída").wait_for()
    assert "Cliente" in page.get_by_role("region", name="Aula concluída").inner_text()
    page.get_by_role("button", name="Voltar às aulas").click()
    page.get_by_role("heading", name="Aulas", exact=True).wait_for()
    assert "1/7" in page.inner_text("main")


def test_aula_com_ponto_de_partida_monta_o_desenho_inicial(page):
    page.goto(page.base + "/start/aulas"); page.get_by_role("heading", name="Aulas", exact=True).wait_for()
    page.get_by_role("listitem").filter(has_text="Muita gente ao mesmo tempo").get_by_role("button", name=re.compile("^Começar")).click()
    page.wait_for_selector(".react-flow__node-arch"); page.wait_for_timeout(1200)
    assert page.locator(".react-flow__node-arch").count() == 3 and page.locator(".react-flow__edge").count() == 2
    page.get_by_role("region", name="Aula").get_by_role("heading", name="Mais cópias do servidor").wait_for()


def test_aula_sem_violacoes_do_axe_e_em_ingles(make_page):
    from axe_playwright_python.sync_playwright import Axe
    for theme, lang in (("dark", "pt"), ("light", "pt"), ("dark", "en")):
        pg = make_page(theme=theme, lang=lang)
        pg.goto(pg.base + "/start/aulas")
        pg.get_by_role("heading", name="Aulas" if lang == "pt" else "Lessons", exact=True).wait_for()
        pg.get_by_role("button", name=re.compile("^(Começar|Start)")).first.click()
        pg.wait_for_selector(".react-flow"); pg.wait_for_timeout(800)
        pg.get_by_role("region", name="Aula" if lang == "pt" else "Lesson").wait_for()
        v = Axe().run(pg).response["violations"]
        assert [f"{x['id']}: {[n['target'][0] for n in x['nodes'][:2]]}" for x in v] == [], (theme, lang)
        if lang == "en": assert "Who asks and who answers" in pg.inner_text("body")

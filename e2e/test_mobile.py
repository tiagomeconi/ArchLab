"""Celular e tablet: o laboratório com o layout próprio (gavetas, navegação inferior, conectar por toque). Emulação de toque no Chromium."""
import re
import pytest

CELULAR = dict(width=390, height=844, has_touch=True, is_mobile=True)
TABLET_PE = dict(width=820, height=1180, has_touch=True, is_mobile=True)


def _abre_aula(pg, nome=None):
    pg.goto(pg.base + "/start/aulas"); pg.get_by_role("heading", name="Aulas", exact=True).wait_for()
    alvo = pg.get_by_role("listitem").filter(has_text=nome) if nome else pg
    alvo.get_by_role("button", name=re.compile("^Começar")).first.tap()
    pg.wait_for_selector(".react-flow"); pg.wait_for_timeout(900)


def _sem_rolagem_horizontal(pg):
    return pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")


@pytest.mark.parametrize("disp", [CELULAR, TABLET_PE], ids=["celular", "tablet-em-pe"])
def test_laboratorio_abre_com_o_layout_de_gavetas_e_nao_pede_computador(make_page, disp):
    pg = make_page(**disp)
    _abre_aula(pg)
    assert pg.locator(".lab.ly-sheet").count() == 1
    assert pg.get_by_role("heading", name="Edite no computador").count() == 0
    # barra superior fina, navegação inferior e o canvas com a maior parte da tela quando a gaveta fecha
    assert pg.locator(".topbar.compact").bounding_box()["height"] <= 60
    assert pg.get_by_role("navigation", name="Navegação do laboratório").is_visible()
    pg.get_by_role("button", name="Fechar o painel").first.tap(); pg.wait_for_timeout(500)
    canvas = pg.locator(".react-flow").bounding_box()
    livre = disp["height"] - 56 - 62 - 20
    assert canvas["height"] >= disp["height"] - 10   # o canvas ocupa a tela toda; as barras flutuam por cima
    assert _sem_rolagem_horizontal(pg) <= 1
    assert livre > disp["height"] * 0.7


def test_celular_aula_1_inteira_so_com_toques_inclusive_conectar(make_page):
    pg = make_page(**CELULAR); _abre_aula(pg)
    painel = pg.get_by_role("region", name="Aula")
    painel.get_by_role("heading", name="Quem pede e quem responde").wait_for()
    # a gaveta da aula abre sozinha; fecha e vai para os componentes
    def pega_componente(nome):
        pg.get_by_role("button", name="Componentes").tap(); pg.wait_for_timeout(500)
        pg.locator(".pitem", has_text=nome).first.tap(); pg.wait_for_timeout(600)   # tocar na linha adiciona e fecha a gaveta
        if pg.locator("dialog[open]").count(): pg.keyboard.press("Escape"); pg.wait_for_timeout(300)   # escolha de provedor: dispensável
    def continua(depois=None):
        pg.locator(".lesson-strip").tap(); pg.wait_for_timeout(500)
        painel.get_by_role("button", name=re.compile("^(Continuar|Concluir aula)")).tap(); pg.wait_for_timeout(400)
    pg.get_by_role("button", name="Fechar o painel").first.tap(); pg.wait_for_timeout(400)
    pega_componente("Cliente")
    assert pg.get_by_role("toolbar", name=re.compile("Ações de")).is_visible()       # barra de ações do bloco selecionado
    pg.locator(".lesson-strip.ok").wait_for(); continua()
    pg.get_by_role("button", name="Fechar o painel").first.tap(); pg.wait_for_timeout(400)
    pega_componente("Backend")
    pg.locator(".lesson-strip.ok").wait_for(); continua()
    pg.get_by_role("button", name="Fechar o painel").first.tap(); pg.wait_for_timeout(400)
    # passo 3: conectar por toque (selecionar a origem, "Conectar", tocar no destino)
    pg.get_by_role("button", name="Enquadrar o desenho").tap(); pg.wait_for_timeout(700)
    cliente = pg.locator(".react-flow__node-arch", has_text="Cliente").first
    backend = pg.locator(".react-flow__node-arch", has_text="Backend").first
    cliente.tap(); pg.wait_for_timeout(300)
    pg.get_by_role("button", name="Conectar").tap(); pg.wait_for_timeout(300)
    assert pg.get_by_text("Toque no destino").is_visible()
    backend.tap(); pg.wait_for_timeout(500)
    pg.get_by_role("dialog").get_by_role("button", name="Conectar").tap(); pg.wait_for_timeout(500)
    pg.locator(".lesson-strip.ok").wait_for(); continua()
    pg.get_by_role("button", name="Fechar o painel").first.tap(); pg.wait_for_timeout(300)
    # passo 4: simular (botão da barra superior)
    pg.get_by_role("button", name="Simular").tap(); pg.wait_for_timeout(5500)
    pg.locator(".lesson-strip.ok").wait_for(); continua()
    pg.get_by_role("button", name="Fechar o painel").first.tap(); pg.wait_for_timeout(300)
    # passo 5: selecionar o backend
    pg.locator(".react-flow__node-arch", has_text="Backend").first.tap(); pg.wait_for_timeout(400)
    pg.locator(".lesson-strip.ok").wait_for(); continua()
    pg.get_by_role("region", name="Aula concluída").wait_for()

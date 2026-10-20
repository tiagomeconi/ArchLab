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


TABLET_DEITADO = dict(width=1180, height=820, has_touch=True, is_mobile=True)


def test_tablet_deitado_tem_barra_compacta_aula_visivel_e_barra_de_acoes(make_page):
    pg = make_page(**TABLET_DEITADO); _abre_aula(pg, "Muita gente ao mesmo tempo")
    assert pg.locator(".lab.ly-dock.touch").count() == 1
    assert pg.locator("header").first.bounding_box()["height"] <= 62          # barra compacta, não duas linhas
    pg.get_by_role("region", name="Aula").get_by_role("heading", name="Mais cópias do servidor").wait_for()   # a aula fica à mostra ao lado do canvas
    assert _sem_rolagem_horizontal(pg) <= 1
    pg.locator(".react-flow__node-arch", has_text="Backend").first.tap(); pg.wait_for_timeout(400)
    assert pg.get_by_role("toolbar", name=re.compile("Ações de")).is_visible()
    # as réplicas pela barra de ações cumprem a tarefa da aula (3 réplicas no Backend)
    for _ in range(2): pg.get_by_role("button", name="Mais uma réplica").last.tap(); pg.wait_for_timeout(200)
    pg.get_by_role("region", name="Aula").get_by_role("status").wait_for()
    # menu "Mais": cenário da simulação na folha de baixo
    pg.get_by_role("button", name="Mais opções").tap()
    pg.get_by_role("dialog", name="Mais opções").get_by_text("Cenário da simulação").wait_for()


@pytest.mark.parametrize("disp", [CELULAR, TABLET_PE, TABLET_DEITADO], ids=["celular", "tablet-em-pe", "tablet-deitado"])
def test_telas_principais_cabem_na_largura_em_toque(make_page, disp):
    pg = make_page(**disp)
    for path in ("/start", "/start/aulas", "/start/estudo", "/start/trilhas", "/start/livre", "/desenhos", "/planos"):
        pg.goto(pg.base + path); pg.wait_for_selector("h1"); pg.wait_for_timeout(500)
        assert _sem_rolagem_horizontal(pg) <= 1, path

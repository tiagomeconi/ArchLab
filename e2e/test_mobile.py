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


@pytest.mark.parametrize("theme", ["dark", "light"])
def test_laboratorio_em_toque_sem_violacoes_do_axe(make_page, theme):
    from axe_playwright_python.sync_playwright import Axe
    pg = make_page(theme=theme, **CELULAR); _abre_aula(pg)
    def ok(ctx=None, tag=""):
        v = (Axe().run(pg, context=ctx) if ctx else Axe().run(pg)).response["violations"]
        assert [f"{x['id']}: {[n['target'][0] for n in x['nodes'][:2]]}" for x in v] == [], (theme, tag)
    ok(tag="gaveta da aula aberta")
    pg.get_by_role("button", name="Fechar o painel").first.tap(); pg.wait_for_timeout(500)
    ok(tag="canvas com a faixa da aula")
    pg.locator(".dock").get_by_role("button", name="Componentes").tap(); pg.wait_for_timeout(600)
    ok(tag="gaveta de componentes")
    pg.get_by_role("button", name="Mais opções").tap(); pg.wait_for_timeout(600)
    ok("dialog[open]", "menu Mais")


# ── gestos de toque de verdade (eventos de toque via DevTools, não o mouse) ──
def _toque(pg, pontos_ini, pontos_fim, passos=12):
    """Arrasta um ou mais dedos de `pontos_ini` até `pontos_fim` com eventos de toque reais."""
    cdp = pg.context.new_cdp_session(pg)
    pts = lambda ps: [{"x": x, "y": y, "id": i} for i, (x, y) in enumerate(ps)]
    cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": pts(pontos_ini)})
    for k in range(1, passos + 1):
        f = k / passos
        cur = [(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f) for a, b in zip(pontos_ini, pontos_fim)]
        cdp.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": pts(cur)})
    cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
    pg.wait_for_timeout(300)


def _viewport(pg):
    t = pg.locator(".react-flow__viewport").get_attribute("style")
    m = re.search(r"translate\(([-\d.]+)px,\s*([-\d.]+)px\)\s*scale\(([-\d.]+)\)", t)
    return tuple(float(v) for v in m.groups())


def test_gestos_de_toque_arrastar_bloco_deslizar_o_canvas_e_pinca(make_page):
    pg = make_page(**CELULAR); _abre_aula(pg, "Muita gente ao mesmo tempo")
    pg.get_by_role("button", name="Fechar o painel").first.tap(); pg.wait_for_timeout(500)
    pg.get_by_role("button", name="Enquadrar o desenho").tap(); pg.wait_for_timeout(700)
    # arrastar um bloco com o dedo
    bk = pg.locator(".react-flow__node-arch", has_text="Backend").first
    antes = bk.bounding_box(); cx, cy = antes["x"] + antes["width"] / 2, antes["y"] + 14
    _toque(pg, [(cx, cy)], [(cx, cy + 120)])
    depois = pg.locator(".react-flow__node-arch", has_text="Backend").first.bounding_box()
    assert depois["y"] - antes["y"] > 60, (antes, depois)
    # deslizar o canvas (dedo no fundo) move o enquadramento
    v0 = _viewport(pg); _toque(pg, [(200, 420)], [(120, 360)])
    v1 = _viewport(pg); assert abs(v1[0] - v0[0]) > 40 and abs(v1[1] - v0[1]) > 20, (v0, v1)
    # pinça com dois dedos muda o zoom
    z0 = _viewport(pg)[2]; _toque(pg, [(150, 400), (250, 400)], [(60, 400), (340, 400)])
    z1 = _viewport(pg)[2]; assert z1 > z0 * 1.2, (z0, z1)


def test_gaveta_arrasta_pela_alca_e_rola_o_conteudo_sem_mexer_no_canvas(make_page):
    pg = make_page(**CELULAR); _abre_aula(pg)
    pg.get_by_role("button", name="Fechar o painel").first.tap(); pg.wait_for_timeout(400)
    pg.locator(".dock").get_by_role("button", name="Componentes").tap(); pg.wait_for_timeout(600)
    gaveta = pg.locator("aside.sidebar.sheet")
    assert gaveta.get_attribute("data-snap") == "half"
    def alca():
        c = pg.locator("aside.sidebar .grip-hit").bounding_box(); return c["x"] + c["width"] / 2, c["y"] + c["height"] / 2
    x, y = alca(); _toque(pg, [(x, y)], [(x, y - 260)]); assert gaveta.get_attribute("data-snap") == "full"     # arrastar para cima abre mais
    pg.wait_for_timeout(500); x, y = alca(); _toque(pg, [(x, y)], [(x, y + 120)]); assert gaveta.get_attribute("data-snap") == "half"   # para baixo reduz
    pg.wait_for_timeout(500); x, y = alca(); _toque(pg, [(x, y)], [(x, y + 200)]); assert gaveta.get_attribute("data-snap") == "closed"
    # deslizar a lista de componentes rola a gaveta e deixa o canvas parado
    for _ in range(2):   # o emulador descarta o primeiro toque depois de um gesto enviado pelo DevTools (com o mouse isso não acontece)
        pg.locator(".dock").get_by_role("button", name="Componentes").tap(); pg.wait_for_timeout(700)
        if gaveta.get_attribute("data-snap") != "closed": break
    v0 = _viewport(pg); lista = pg.locator("aside.sidebar .palette"); topo0 = lista.evaluate("e => e.scrollTop")
    caixa = lista.bounding_box(); cx = caixa["x"] + caixa["width"] / 2
    _toque(pg, [(cx, caixa["y"] + caixa["height"] - 40)], [(cx, caixa["y"] + 30)])
    assert lista.evaluate("e => e.scrollTop") > topo0 + 80
    assert _viewport(pg) == v0


def test_interface_de_toque_em_ingles_nao_deixa_texto_em_portugues(make_page):
    pg = make_page(lang="en", **CELULAR)
    pg.goto(pg.base + "/start/aulas"); pg.get_by_role("heading", name="Lessons", exact=True).wait_for()
    pg.get_by_role("button", name=re.compile("^Start")).first.tap(); pg.wait_for_selector(".react-flow"); pg.wait_for_timeout(800)
    def texto(sel): return pg.locator(sel).first.inner_text()
    pt = re.compile(r"\b(Aula|Componentes|Fluxos|Propriedades|Revisão|Conectar|Simular|Passo|Mais opções|Fechar|Cenário)\b")
    pg.get_by_role("button", name="Close the panel").first.tap(); pg.wait_for_timeout(400)
    assert not pt.search(texto(".dock")), texto(".dock")
    pg.locator(".react-flow__pane").tap(); pg.get_by_role("button", name="More options").tap(); pg.wait_for_timeout(500)
    corpo = pg.locator("dialog[open]").inner_text()
    assert "simulation scenario" in corpo.lower() and not pt.search(corpo), corpo[:300]

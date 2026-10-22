"""Celular e tablet: o laboratório com o layout próprio (gavetas, navegação inferior, conectar por toque). Emulação de toque no Chromium."""
import re
import pytest

CELULAR = dict(width=390, height=844, has_touch=True, is_mobile=True)
TABLET_PE = dict(width=820, height=1180, has_touch=True, is_mobile=True)


def _abre_lab(pg, *tipos):
    """Abre um desenho livre em branco e, se pedido, adiciona os componentes tocando na gaveta (como a pessoa faria)."""
    pg.goto(pg.base + "/app?blank=1&s=1&d=" + "test0001"); pg.wait_for_selector(".react-flow"); pg.wait_for_timeout(900)
    for nome in tipos:
        if pg.locator(".dock").count(): pg.locator(".dock").get_by_role("button", name="Componentes").tap(); pg.wait_for_timeout(500)
        else:
            aba = pg.get_by_role("tab", name="Componentes")
            if aba.count(): aba.first.tap(); pg.wait_for_timeout(300)
        pg.locator(".pitem", has_text=nome).first.locator(".add").tap(); pg.wait_for_timeout(600)
        if pg.locator("dialog[open]").count(): pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    fechar = pg.get_by_role("button", name="Fechar o painel")
    if fechar.count() and fechar.first.is_visible(): fechar.first.tap(); pg.wait_for_timeout(400)
    enq = pg.get_by_role("button", name="Enquadrar o desenho")
    if tipos and enq.count(): enq.first.tap(); pg.wait_for_timeout(700)

def _sem_rolagem_horizontal(pg):
    return pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")


@pytest.mark.parametrize("disp", [CELULAR, TABLET_PE], ids=["celular", "tablet-em-pe"])
def test_laboratorio_abre_com_o_layout_de_gavetas_e_nao_pede_computador(make_page, disp):
    pg = make_page(**disp)
    _abre_lab(pg)
    assert pg.locator(".lab.ly-sheet").count() == 1
    assert pg.get_by_role("heading", name="Edite no computador").count() == 0
    # barra superior fina, navegação inferior e o canvas com a maior parte da tela
    assert pg.locator(".topbar.compact").bounding_box()["height"] <= 60
    assert pg.get_by_role("navigation", name="Navegação do laboratório").is_visible()
    canvas = pg.locator(".react-flow").bounding_box()
    assert canvas["height"] >= disp["height"] - 10   # o canvas ocupa a tela toda; as barras flutuam por cima
    assert _sem_rolagem_horizontal(pg) <= 1


TABLET_DEITADO = dict(width=1180, height=820, has_touch=True, is_mobile=True)


def test_tablet_deitado_tem_barra_compacta_e_barra_de_acoes(make_page):
    pg = make_page(**TABLET_DEITADO); _abre_lab(pg, "Cliente", "Backend")
    assert pg.locator(".lab.ly-dock.touch").count() == 1
    assert pg.locator("header").first.bounding_box()["height"] <= 62          # barra compacta, não duas linhas
    assert _sem_rolagem_horizontal(pg) <= 1
    pg.locator(".react-flow__node-arch", has_text="Backend").first.tap(); pg.wait_for_timeout(400)
    assert pg.get_by_role("toolbar", name=re.compile("Ações de")).is_visible()
    pg.get_by_role("button", name="Mais uma réplica").last.tap(); pg.wait_for_timeout(200)
    # menu "Mais": cenário da simulação na folha de baixo
    pg.get_by_role("button", name="Mais opções").tap()
    pg.get_by_role("dialog", name="Mais opções").get_by_text("Cenário da simulação").wait_for()


@pytest.mark.parametrize("disp", [CELULAR, TABLET_PE, TABLET_DEITADO], ids=["celular", "tablet-em-pe", "tablet-deitado"])
def test_telas_principais_cabem_na_largura_em_toque(make_page, disp):
    pg = make_page(**disp)
    for path in ("/start", "/start/aulas", "/start/estudo", "/start/livre", "/desenhos", "/planos"):
        pg.goto(pg.base + path); pg.wait_for_selector("h1"); pg.wait_for_timeout(500)
        assert _sem_rolagem_horizontal(pg) <= 1, path


@pytest.mark.parametrize("theme", ["dark", "light"])
def test_laboratorio_em_toque_sem_violacoes_do_axe(make_page, theme):
    from axe_playwright_python.sync_playwright import Axe
    pg = make_page(theme=theme, **CELULAR); _abre_lab(pg, "Cliente")
    def ok(ctx=None, tag=""):
        v = (Axe().run(pg, context=ctx) if ctx else Axe().run(pg)).response["violations"]
        assert [f"{x['id']}: {[n['target'][0] for n in x['nodes'][:2]]}" for x in v] == [], (theme, tag)
    ok(tag="canvas")
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
    pg = make_page(**CELULAR); _abre_lab(pg, "Cliente", "Backend")
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
    pg = make_page(**CELULAR); _abre_lab(pg)
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
    pg.goto(pg.base + "/app?blank=1&s=1&d=test0001"); pg.wait_for_selector(".react-flow"); pg.wait_for_timeout(800)
    def texto(sel): return pg.locator(sel).first.inner_text()
    pt = re.compile(r"\b(Aula|Componentes|Fluxos|Propriedades|Revisão|Conectar|Simular|Passo|Mais opções|Fechar|Cenário)\b")
    assert not pt.search(texto(".dock")), texto(".dock")
    pg.locator(".react-flow__pane").tap(); pg.get_by_role("button", name="More options").tap(); pg.wait_for_timeout(500)
    corpo = pg.locator("dialog[open]").inner_text()
    assert "simulation scenario" in corpo.lower() and not pt.search(corpo), corpo[:300]


from test_conta import auth_url, conta  # noqa: E402,F401  (fixtures: sessão simulada com o Supabase falso)


def test_barra_de_baixo_logada_tem_quatro_abas_e_mais_sem_nomes_cortados(conta):
    pg = conta(width=390, height=800); pg.goto(pg.base + "/start"); pg.wait_for_selector("h1")
    nav = pg.get_by_role("navigation", name="Navegação inferior")
    itens = nav.locator("a, button")
    assert itens.count() == 5
    cortados = nav.locator("span.truncate").evaluate_all("els => els.filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent)")
    assert cortados == [], cortados                                   # nenhum rótulo com reticências
    nav.get_by_role("button", name="Mais").click()
    menu = pg.get_by_role("menu", name="Mais seções")
    for nome in ("Meus desenhos", "Ranking", "Perfil"): assert menu.get_by_role("menuitem", name=nome).count() == 1, nome
    menu.get_by_role("menuitem", name="Perfil").click()
    pg.wait_for_url("**/perfil"); pg.wait_for_timeout(300); assert pg.get_by_role("menu", name="Mais seções").count() == 0       # o menu fecha ao navegar
    assert nav.get_by_role("button", name="Mais").evaluate("e => getComputedStyle(e).color") != nav.get_by_role("link", name="Aulas").evaluate("e => getComputedStyle(e).color")   # "Mais" fica destacado quando a página atual é uma das dele


_ESTOURA = """() => { const vw = innerWidth, out = [];
  // só vale como "cortado de propósito" quem tem um contêiner com rolagem/corte DENTRO do conteúdo da página (o contêiner da página em si esconde o excesso, e é isso que queremos pegar)
  const cortado = (el, raiz) => { for (let a = el.parentElement; a && a !== raiz; a = a.parentElement) { if (getComputedStyle(a).overflowX !== 'visible' && a.getBoundingClientRect().right <= vw + 1) return true; } return false; };
  for (const raiz of document.querySelectorAll('main, #conteudo')) for (const el of raiz.querySelectorAll('*')) { const r = el.getBoundingClientRect(); if (r.width > 0 && r.right > vw + 1 && !cortado(el, raiz)) out.push(el.tagName + '.' + String(el.className).slice(0, 60)); }
  return [...new Set(out)].slice(0, 6); }"""


@pytest.mark.parametrize("largura", [360, 390, 820])
def test_nenhum_elemento_passa_da_borda_da_tela_nas_paginas_logadas(conta, largura):
    """Pega o que a rolagem horizontal da página não pega: cartões que ficam cortados à direita em vez de caber."""
    pg = conta(width=largura, height=800)
    for path in ("/start", "/start/aulas", "/start/estudo", "/start/livre", "/desenhos", "/ranking", "/perfil", "/perfil#conquistas", "/perfil#casos", "/perfil#desenhos", "/perfil#atividade", "/configuracoes", "/planos", "/u/tiagomeconi"):
        pg.goto(pg.base + path); pg.wait_for_selector("h1"); pg.wait_for_timeout(900)
        assert pg.evaluate(_ESTOURA) == [], (largura, path)

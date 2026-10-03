import json
from helpers import add_component, nodes, open_case


def test_verificacoes_acompanham_o_desenho(page):
    open_case(page, "Netflix")
    assert "0/" in page.locator(".score").first.inner_text()
    add_component(page, "CDN")
    assert nodes(page) == 1
    page.wait_for_timeout(500)
    assert page.locator(".reqs li", has_text="CDN na borda").locator(".rs.meets").count() == 1


def test_replicas_no_card_e_nome_editavel(page):
    open_case(page, "Netflix")
    add_component(page, "Backend")
    node = page.locator(".react-flow__node").first
    assert "×1" in node.inner_text()
    node.get_by_label("Mais uma réplica").click()
    node.get_by_label("Mais uma réplica").click()
    assert "×3" in node.inner_text()
    node.get_by_label("Menos uma réplica").click()
    assert "×2" in node.inner_text()
    # nome pelo painel de propriedades
    node.click()
    page.locator(".tabs button").nth(2).click()
    campo = page.get_by_label("Nome do componente")
    campo.fill("Serviço de catálogo"); campo.press("Enter")
    assert "Serviço de catálogo" in page.locator(".react-flow__node").first.inner_text()


def test_solucao_de_referencia_e_volta(page):
    open_case(page, "Netflix")
    add_component(page, "CDN")
    page.get_by_role("button", name="Ver solução de referência").click()
    page.get_by_role("button", name="Ver a referência").click()
    page.wait_for_timeout(800)
    assert nodes(page) >= 8
    page.wait_for_timeout(500)
    metas = page.locator(".score").first.inner_text()
    ok, total = metas.replace("\n", "").split("/")
    assert int(ok) == int(total), f"a referência deve atender todas as verificações ({metas})"
    page.get_by_role("button", name="Voltar ao meu desenho").first.click()
    page.wait_for_timeout(500)
    assert nodes(page) == 1


def test_guia_e_cronometro(page):
    open_case(page, "Netflix")
    page.locator(".seg button").nth(1).click()
    assert page.get_by_text("Guia de 45 minutos").is_visible()
    assert page.locator(".timer b").inner_text() == "45:00"
    page.get_by_label("Iniciar").click()
    page.wait_for_timeout(2300)
    assert page.locator(".timer b").inner_text() != "45:00"
    page.get_by_label("Pausar").click()
    page.locator(".stage-head input").first.check()
    assert "1/7" in page.locator(".score").inner_text().replace("\n", "")


def test_autosave_sobrevive_ao_reload(page):
    open_case(page, "Netflix")
    add_component(page, "CDN")
    page.wait_for_timeout(1200)
    page.reload()
    page.wait_for_selector(".react-flow__node")
    assert nodes(page) == 1


def test_exportar_e_importar(page, tmp_path):
    open_case(page, "Netflix")
    add_component(page, "CDN"); add_component(page, "Cache / KV")
    page.get_by_role("button", name="Exportar").click()
    with page.expect_download() as d:
        page.get_by_role("menuitem", name="Desenho (.json)").click()
    arq = tmp_path / "desenho.json"; d.value.save_as(arq)
    j = json.loads(arq.read_text())
    assert j["format"] == "archlab-design" and len(j["snap"]["n"]) == 2
    open_case(page, "Uber")
    assert nodes(page) == 0
    page.locator("input[type=file]").set_input_files(str(arq))
    page.wait_for_timeout(700)
    assert nodes(page) == 2


def test_importar_arquivo_invalido_nao_quebra(page, tmp_path):
    open_case(page, "Netflix")
    ruim = tmp_path / "ruim.json"; ruim.write_text('{"x": 1}')
    page.locator("input[type=file]").set_input_files(str(ruim))
    page.wait_for_timeout(500)
    assert page.locator(".toast").inner_text().startswith("Arquivo inválido")
    assert nodes(page) == 0


def test_compartilhar_por_link(make_page):
    a = make_page(permissions=["clipboard-read", "clipboard-write"])
    open_case(a, "Netflix")
    a.get_by_role("button", name="Ver solução de referência").click()
    a.get_by_role("button", name="Ver a referência").click()
    a.wait_for_timeout(800)
    n = nodes(a)
    a.get_by_label("Copiar link do desenho").click(); a.wait_for_timeout(600)
    link = a.evaluate("navigator.clipboard.readText()")
    assert "#d=" in link and len(link) < 6000
    b = make_page()
    b.goto(link); b.wait_for_selector(".react-flow__node")
    b.wait_for_timeout(1200)
    assert nodes(b) == n
    assert b.locator(".brand small").inner_text() == "Netflix"


def test_link_compartilhado_corrompido_avisa(page):
    page.goto(page.base + "/app?blank=1&shared=1#d=lixo")
    page.wait_for_selector(".react-flow")
    page.wait_for_timeout(800)
    assert "inválido" in page.locator(".toast").inner_text()


def test_carga_do_caso_aparece_no_cabecalho(page):
    open_case(page, "Netflix")
    page.wait_for_timeout(800)
    topo = page.locator(".topbar").text_content()
    assert "100.000" in topo and "98% read" in topo


def test_progresso_aparece_na_lista(page):
    open_case(page, "Netflix")
    add_component(page, "CDN")
    page.wait_for_timeout(1500)
    page.goto(page.base + "/start/estudo")
    page.wait_for_timeout(500)
    assert page.get_by_text("em andamento").first.is_visible() or page.get_by_text("Continuar:").is_visible()


def _desenho_sem_fluxos(page, tmp_path):
    """Exporta a referência do Netflix e remove os fluxos: sobra só o desenho e as conexões, como quem acabou de ligar tudo."""
    open_case(page, "Netflix")
    page.get_by_role("button", name="Ver solução de referência").click()
    page.get_by_role("button", name="Ver a referência").click()
    page.wait_for_timeout(800)
    page.get_by_role("button", name="Exportar").click()
    with page.expect_download() as d:
        page.get_by_role("menuitem", name="Desenho (.json)").click()
    arq = tmp_path / "ref.json"; d.value.save_as(arq)
    j = json.loads(arq.read_text()); j["snap"]["f"], j["snap"]["w"], j["snap"]["m"] = [], [], {}
    sem = tmp_path / "sem-fluxos.json"; sem.write_text(json.dumps(j))
    return sem


def test_simular_com_desenho_sem_fluxos_deriva_os_fluxos_das_conexoes(page, tmp_path):
    sem = _desenho_sem_fluxos(page, tmp_path)
    open_case(page, "Uber")
    page.locator("input[type=file]").set_input_files(str(sem)); page.wait_for_timeout(800)
    assert page.locator(".simbtn.play").is_enabled()
    page.locator(".simbtn.play").click()
    page.wait_for_timeout(2500)
    oferecidas = page.locator(".simpanel .stat", has_text="Oferecidas").locator("b").inner_text()
    assert oferecidas.split("/")[0].strip() not in ("0", ""), f"a simulação não gerou carga ({oferecidas})"


def test_modo_fixture_mantem_criacao_manual_de_fluxo(page):
    page.goto(page.base + "/app"); page.wait_for_selector(".react-flow")
    page.locator(".tabs button").nth(1).click()
    novo = page.get_by_role("button", name="Novo fluxo")
    assert novo.is_visible() and novo.bounding_box()["width"] > 60


def test_canvas_em_branco_nao_tem_edicao_manual_de_passos(page):
    page.goto(page.base + "/app?blank=1"); page.wait_for_selector(".react-flow")
    page.locator(".tabs button").nth(1).click()
    assert page.get_by_role("button", name="Novo fluxo").count() == 0
    assert page.get_by_text("Adicionar passo").count() == 0
    assert page.get_by_text("Os fluxos seguem as conexões").is_visible()


def test_refazer_fluxos_a_partir_das_conexoes(page, tmp_path):
    sem = _desenho_sem_fluxos(page, tmp_path)
    open_case(page, "Uber")
    page.locator("input[type=file]").set_input_files(str(sem)); page.wait_for_timeout(800)
    page.locator(".tabs button").nth(1).click()
    assert page.locator(".flow-pill").count() == 0
    page.get_by_role("button", name="Refazer a partir das conexões").click()
    page.wait_for_timeout(600)
    assert page.locator(".flow-pill").count() >= 3
    assert page.get_by_role("tree").is_visible()


def test_ligar_no_canvas_aparece_sozinho_no_fluxo(page):
    page.goto(page.base + "/app?blank=1"); page.wait_for_selector(".react-flow")
    add_component(page, "Cliente"); add_component(page, "Load balancer"); add_component(page, "Backend")
    page.wait_for_timeout(400)
    ns = page.locator(".react-flow__node")
    # arruma lado a lado e liga cliente → lb → backend arrastando as bolinhas
    caixas = [ns.nth(i).bounding_box() for i in range(3)]
    for i, (dx, dy) in enumerate([(-420, -150), (-100, -150), (220, -150)]):
        c = caixas[i]
        page.mouse.move(c["x"] + c["width"] / 2, c["y"] + 20); page.mouse.down()
        page.mouse.move(c["x"] + c["width"] / 2 + dx, c["y"] + 20 + dy, steps=8); page.mouse.up()
    page.wait_for_timeout(400)
    def ligar(i, j):
        a, b = ns.nth(i).locator(".react-flow__handle.source").bounding_box(), ns.nth(j).locator(".react-flow__handle.target").bounding_box()
        page.mouse.move(a["x"] + a["width"] / 2, a["y"] + a["height"] / 2); page.mouse.down()
        page.mouse.move(b["x"] + b["width"] / 2, b["y"] + b["height"] / 2, steps=12); page.mouse.up()
        page.wait_for_timeout(300)
        if page.locator("dialog[open]").count(): page.get_by_role("button", name="Conectar").click(); page.wait_for_timeout(300)
    ligar(0, 1)
    page.locator(".tabs button").nth(1).click()
    page.wait_for_timeout(400)
    assert page.locator(".flow-pill").count() == 1
    ligar(1, 2)
    page.wait_for_timeout(500)
    arvore = page.get_by_role("tree")
    nomes = [arvore.get_by_role("treeitem").nth(i).locator(".ft-name").inner_text() for i in range(arvore.get_by_role("treeitem").count())]
    assert nomes == ["Cliente", "Load balancer", "Backend"], nomes


def test_conexoes_tem_protocolo_com_identidade_e_trafego_animado(page):
    open_case(page, "Netflix")
    page.get_by_role("button", name="Ver solução de referência").click()
    page.get_by_role("button", name="Ver a referência").click()
    page.wait_for_timeout(1200)
    # legenda com os protocolos em uso e rótulos coloridos por protocolo
    for nome in ("HTTPS", "Kafka", "Redis"):
        assert page.locator(".proto-legend .proto-chip", has_text=nome).count() == 1
    assert page.locator(".edge-label .proto-name").count() >= 8
    # tráfego: partículas andando nas conexões que levam carga
    assert page.locator(".edge-traffic .traffic-dot").count() >= 8
    assert page.locator(".edge-traffic animateMotion").count() >= 8


def test_legenda_destaca_conexoes_do_protocolo(page):
    open_case(page, "Netflix")
    page.get_by_role("button", name="Ver solução de referência").click()
    page.get_by_role("button", name="Ver a referência").click()
    page.wait_for_timeout(1200)
    page.locator(".proto-chip", has_text="Kafka").hover()
    page.wait_for_timeout(300)
    opacidades = page.evaluate("[...document.querySelectorAll('.edge-traffic')].map(e => +getComputedStyle(e).opacity)")
    assert any(o < 0.5 for o in opacidades) and any(o == 1 for o in opacidades)


def test_dialogo_de_conexao_mostra_protocolo_colorido(page):
    open_case(page, "Netflix")
    page.get_by_role("button", name="Ver solução de referência").click()
    page.get_by_role("button", name="Ver a referência").click()
    page.wait_for_timeout(1000)
    page.locator(".edge-label .edge-type").first.click(force=True)
    assert page.locator("dialog[open] .proto-tag").count() >= 1


def test_foco_no_protocolo_destaca_so_os_componentes_que_conversam(page):
    open_case(page, "Netflix")
    page.get_by_role("button", name="Ver solução de referência").click()
    page.get_by_role("button", name="Ver a referência").click()
    page.wait_for_timeout(1200)
    page.locator(".proto-chip", has_text="Redis").hover()
    page.wait_for_timeout(800)
    vivos = page.evaluate("[...document.querySelectorAll('.node:not(.dim)')].map(n => n.querySelector('.name').textContent.trim())")
    assert sorted(vivos) == ["Backend", "Cache"]
    assert float(page.evaluate("getComputedStyle(document.querySelector('.node.dim')).opacity")) < 0.5
    page.mouse.move(5, 5); page.wait_for_timeout(600)
    assert page.locator(".node.dim").count() == 0


def test_cronometro_cabe_no_painel_em_todos_os_estados(page):
    open_case(page, "Netflix")
    page.locator(".seg button").nth(1).click()
    caixa = lambda sel: page.locator(sel).bounding_box()
    for estado in ("parado", "rodando", "pausado"):
        if estado == "rodando": page.get_by_label("Iniciar").click(); page.wait_for_timeout(1200)
        if estado == "pausado": page.get_by_label("Pausar").click(); page.wait_for_timeout(200)
        painel, reset = caixa(".brief"), caixa(".timer .chip.icon-only")
        assert reset["x"] + reset["width"] <= painel["x"] + painel["width"], f"botão de zerar fora do painel ({estado})"
        assert page.evaluate("document.querySelector('.timer').scrollWidth <= document.querySelector('.timer').clientWidth")


def test_caminho_do_fluxo_e_uma_arvore_recolhivel(page):
    open_case(page, "Netflix")
    page.get_by_role("button", name="Ver solução de referência").click()
    page.get_by_role("button", name="Ver a referência").click()
    page.wait_for_timeout(1000)
    page.locator(".tabs button").nth(1).click()
    page.locator(".flow-pill").first.click()
    arvore = page.get_by_role("tree")
    assert arvore.is_visible()
    itens = arvore.get_by_role("treeitem")
    total = itens.count()
    assert total >= 5
    niveis = [int(itens.nth(i).get_attribute("aria-level")) for i in range(total)]
    assert niveis[0] == 1 and max(niveis) >= 4          # hierarquia com recuo
    assert arvore.locator(".ft-guide").count() >= 4     # guias de recuo desenhadas
    # nada sai do cartão: todo ícone e botão de remover fica dentro da árvore
    caixa = arvore.bounding_box()
    for sel in (".ft-ico", ".ft-del"):
        for i in range(arvore.locator(sel).count()):
            b = arvore.locator(sel).nth(i).bounding_box()
            assert b["x"] >= caixa["x"] and b["x"] + b["width"] <= caixa["x"] + caixa["width"]
    # recolher esconde os descendentes; expandir traz de volta
    arvore.locator(".ft-caret:not(.ft-leaf)").first.click()
    assert arvore.get_by_role("treeitem").count() == 1
    arvore.locator(".ft-caret:not(.ft-leaf)").first.click()
    assert arvore.get_by_role("treeitem").count() == total


def _referencia(page):
    page.get_by_role("button", name="Ver solução de referência").click()
    page.get_by_role("button", name="Ver a referência").click()
    page.wait_for_timeout(1500)


def test_overall_sem_desenho_nao_inventa_nota(page):
    open_case(page, "Netflix")
    chip = page.locator(".ovr-chip")
    assert "sem nota" in chip.inner_text() and chip.locator(".ovr-num").inner_text() == "—"


def test_overall_da_referencia_e_cartao_com_seis_atributos(page):
    open_case(page, "Netflix")
    _referencia(page)
    nota = int(page.locator(".ovr-chip .ovr-num").inner_text())
    assert nota >= 90
    page.locator(".ovr-chip").click()
    cartao = page.get_by_role("dialog", name="Nota geral do desenho")
    assert cartao.is_visible()
    assert cartao.locator(".ovr-list > li").count() == 6
    assert cartao.locator(".ovr-stat").count() == 6
    for abbr in ("CAP", "RES", "LAT", "ARQ", "COM", "EFI"):
        assert cartao.locator(".ovr-stat small", has_text=abbr).count() == 1
    page.keyboard.press("Escape")
    assert page.get_by_role("dialog", name="Nota geral do desenho").count() == 0


def test_overall_cai_com_um_desenho_fragil(page, tmp_path):
    open_case(page, "Netflix")
    _referencia(page)
    bom = int(page.locator(".ovr-chip .ovr-num").inner_text())
    page.get_by_role("button", name="Exportar").click()
    with page.expect_download() as d:
        page.get_by_role("menuitem", name="Desenho (.json)").click()
    arq = tmp_path / "ref.json"; d.value.save_as(arq)
    j = json.loads(arq.read_text())
    for n in j["snap"]["n"]: n["d"]["replicas"] = 1           # uma réplica em tudo: nada aguenta perder uma instância
    frágil = tmp_path / "fragil.json"; frágil.write_text(json.dumps(j))
    open_case(page, "Uber")
    page.locator("input[type=file]").set_input_files(str(frágil)); page.wait_for_timeout(1500)
    ruim = int(page.locator(".ovr-chip .ovr-num").inner_text())
    assert ruim < bom and ruim < 70
    page.locator(".ovr-chip").click()
    resiliencia = page.locator(".ovr-list > li", has_text="Resiliência")
    assert "derruba" in resiliencia.inner_text()     # diz qual componente derruba o sistema
    assert "réplicas" in resiliencia.inner_text()    # e o que fazer


def test_botoes_de_replicas_nao_se_movem_quando_o_status_muda(page):
    page.goto(page.base + "/app?blank=1"); page.wait_for_selector(".react-flow")
    for nome in ("Cliente", "Backend", "Banco SQL"): add_component(page, nome)
    page.wait_for_timeout(300)
    def posicoes():
        return page.evaluate("""()=>[...document.querySelectorAll('.react-flow__node')].map(n=>{
          const s=n.querySelector('.node-step').getBoundingClientRect(), r=n.querySelector('.node').getBoundingClientRect();
          return [Math.round(r.right-s.right), Math.round(s.top-r.top), Math.round(r.width)]})""")
    antes = posicoes()
    assert len({tuple(p) for p in antes}) == 1, f"status diferentes (origem x sem fluxo) deslocaram os botões: {antes}"
    assert antes[0][2] >= 232, "o card novo já deve nascer largo o bastante para o status e os botões"
    no = page.locator(".react-flow__node").nth(1)
    for _ in range(4): no.get_by_label("Mais uma réplica").click()
    assert posicoes()[1] == antes[1], "mudar o número de réplicas moveu os botões"


def test_relatorio_em_imagem_baixa_um_png_com_o_caso(page):
    open_case(page, "Netflix")
    page.get_by_role("button", name="Ver solução de referência").click()
    page.get_by_role("button", name="Ver a referência").click()
    page.wait_for_timeout(1000)
    page.get_by_role("button", name="Exportar").click()
    assert page.get_by_role("menuitem").count() == 2
    with page.expect_download() as d:
        page.get_by_role("menuitem", name="Relatório em imagem").click()
    arq = d.value
    assert arq.suggested_filename == "archlab-relatorio-netflix.png"
    dados = open(arq.path(), "rb").read()
    assert dados[:8] == b"\x89PNG\r\n\x1a\n"
    largura, altura = int.from_bytes(dados[16:20], "big"), int.from_bytes(dados[20:24], "big")
    assert 4800 <= largura <= 6800 and 1800 < altura < 3200 and largura > altura * 1.8, (largura, altura)  # horizontal, de 2400 a 3400 px em 2x


def test_exportar_json_continua_no_menu(page):
    page.goto(page.base + "/app?blank=1"); page.wait_for_selector(".react-flow")
    add_component(page, "Backend")
    page.get_by_role("button", name="Exportar").click()
    with page.expect_download() as d:
        page.get_by_role("menuitem", name="Desenho (.json)").click()
    assert d.value.suggested_filename.endswith(".json")


def test_painel_de_requisitos_mostra_o_logo_do_caso(page):
    open_case(page, "Spotify")
    logo = page.locator(".brief-logo svg[role=img]")
    assert logo.count() == 1 and logo.get_attribute("aria-label") == "Spotify"
    box = logo.bounding_box(); assert box["width"] >= 20 and box["height"] >= 20

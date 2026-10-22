import re
from helpers import open_case, set_language


def test_landing_leva_a_escolha_de_modo(page):
    page.goto(page.base + "/")
    page.get_by_role("link", name="Acessar o laboratório").first.click()
    page.wait_for_url("**/start")
    page.get_by_role("heading", name=re.compile(r"^(Bom dia|Boa tarde|Boa noite)")).wait_for()


def test_escolha_de_modo_abre_estudo_e_livre(page):
    page.goto(page.base + "/start")
    page.get_by_text("Treinar para uma entrevista").click()
    page.wait_for_url("**/start/estudo")
    page.go_back()
    page.get_by_text("Desenhar meu sistema").click()
    page.wait_for_url("**/start/livre")


def test_busca_e_filtro_de_casos(page):
    page.goto(page.base + "/start/estudo")
    page.get_by_role("heading", name="Netflix").wait_for()
    total = page.get_by_text("Ver requisitos").count() + page.get_by_text("Começar do zero").count() + page.get_by_text("Com desenho pronto").count()
    assert total >= 40
    page.get_by_label("Buscar casos").fill("netflix")
    assert page.get_by_role("heading", name="Netflix").count() == 1
    assert page.get_by_role("heading", name="Uber").count() == 0
    page.get_by_label("Buscar casos").fill("zzzz-nada")
    assert page.get_by_text("Nenhum caso encontrado.").is_visible()
    page.get_by_role("button", name="Limpar filtros").click()
    assert page.get_by_role("heading", name="Netflix").count() == 1


def test_filtro_por_categoria(page):
    page.goto(page.base + "/start/estudo")
    page.get_by_role("button", name="Comunicação", exact=True).click()
    assert page.get_by_role("heading", name="Chat em tempo real").is_visible()
    assert page.get_by_role("heading", name="Netflix").count() == 0


def test_abrir_caso_mostra_requisitos_no_laboratorio(page):
    open_case(page, "Netflix")
    assert page.locator(".dn-name span").first.inner_text() == "Netflix"
    assert page.get_by_text("Verificado pelo laboratório").is_visible()
    assert "/app?blank=1&s=1" in page.url


def test_modo_livre_com_requisitos(page):
    page.goto(page.base + "/start/livre")
    page.get_by_placeholder("Ex.: Plataforma de agendamento").fill("Meu app")
    page.get_by_label("Requisitos funcionais").fill("Agendar horário")
    page.keyboard.press("Enter")
    page.get_by_placeholder("5000").fill("2000")
    page.get_by_placeholder("99", exact=True).fill("80")
    page.get_by_text("Abrir o canvas").click()
    page.wait_for_selector(".react-flow")
    assert page.locator(".dn-name span").first.inner_text() == "Meu app"
    page.wait_for_timeout(600)
    assert "80% read" in page.locator(".hctl").nth(2).text_content()
    assert "2.000" in page.locator(".hctl").nth(1).text_content()


def test_modo_livre_sem_requisitos_nao_tem_painel(page):
    page.goto(page.base + "/start/livre")
    page.get_by_text("Pular e desenhar sem requisitos").click()
    page.wait_for_selector(".react-flow")
    assert page.locator(".brief").count() == 0


def test_app_direto_nao_herda_caso_anterior(page):
    open_case(page, "Netflix")
    page.goto(page.base + "/app?blank=1")
    page.wait_for_selector(".react-flow")
    assert page.locator(".brief").count() == 0
    assert page.locator(".dn-name span").first.inner_text() == "Canvas livre"
    page.goto(page.base + "/app")
    page.wait_for_selector(".react-flow")
    assert "Links curtos" in page.locator(".brand small").inner_text()


def test_todo_cartao_de_empresa_mostra_o_logo_em_svg(page):
    page.goto(page.base + "/start/estudo"); page.wait_for_timeout(1200)
    cartoes = page.locator("button:has(h3)").filter(has=page.locator("svg[role=img]"))
    assert cartoes.count() >= 27, cartoes.count()
    for i in range(cartoes.count()):
        box = cartoes.nth(i).locator("svg[role=img]").first.bounding_box()
        assert box and box["width"] >= 20 and box["height"] >= 12, (i, box)


def test_video_da_landing_continua_tocando_ao_trocar_o_tema(page):
    page.goto(page.base + "/"); page.wait_for_selector("video")
    video = page.locator("video").first
    video.scroll_into_view_if_needed()
    def tocando():
        a = video.evaluate("v => v.currentTime"); page.wait_for_timeout(900)
        b = video.evaluate("v => [v.currentTime, v.paused, v.currentSrc]")
        return b[0] > a and not b[1], b[2]
    ok, src = tocando(); assert ok and "dark" in src, src
    for esperado in ("light", "dark"):
        page.locator(".tt-btn").first.click(); page.wait_for_timeout(1200)
        ok, src = tocando()
        assert ok, f"o vídeo parou depois de trocar para o tema {esperado}"
        assert esperado in src, src


def test_tutorial_de_primeiro_uso_guia_e_nao_volta_depois_de_concluido(make_page):
    pg = make_page(tour=True)
    open_case(pg, "Netflix")
    dialogo = pg.get_by_role("dialog", name="Bem-vindo ao laboratório")
    dialogo.wait_for()
    total = int(dialogo.get_by_text("Passo 1 de").text_content().split(" de ")[1])
    assert total >= 6
    # o balão sempre fica dentro da janela e o destaque aparece a partir do segundo passo
    for i in range(total - 1):
        pg.get_by_role("button", name="Próximo").click(); pg.wait_for_timeout(450)
        b = pg.locator(".tour-pop").bounding_box()
        assert b["x"] >= 0 and b["y"] >= 0 and b["x"] + b["width"] <= 1400 and b["y"] + b["height"] <= 900
        assert pg.locator(".tour-spot").count() == 1
    pg.get_by_role("button", name="Concluir").click()
    assert pg.locator(".tour-layer").count() == 0
    assert pg.evaluate("localStorage.getItem('archlab:tour-done')") == "1"
    pg.reload(); pg.wait_for_selector(".react-flow"); pg.wait_for_timeout(1800)
    assert pg.locator(".tour-layer").count() == 0


def test_tutorial_fecha_com_esc_e_pode_ser_revisto_pela_ajuda(make_page):
    pg = make_page(tour=True)
    open_case(pg, "Netflix")
    pg.get_by_role("dialog", name="Bem-vindo ao laboratório").wait_for()
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    assert pg.locator(".tour-layer").count() == 0
    pg.keyboard.press("?"); pg.get_by_role("button", name="Rever o tutorial").click()
    pg.get_by_role("dialog", name="Bem-vindo ao laboratório").wait_for()


def test_termos_e_privacidade_sao_publicos_e_traduzidos(make_page):
    pg = make_page()
    pg.goto(pg.base + "/termos")
    pg.get_by_role("heading", name="Termos de uso", exact=True).wait_for()
    pg.get_by_role("link", name="Política de privacidade").click()
    pg.get_by_role("heading", name="Política de privacidade", exact=True).wait_for()
    assert "/privacidade" in pg.url and pg.get_by_role("heading", level=2).count() >= 8
    set_language(pg, "English")
    pg.get_by_role("heading", name="Privacy policy", exact=True).wait_for()
    assert "LGPD" in pg.locator("article").inner_text()


def test_aviso_de_conta_excluida_aparece_na_landing_e_some_ao_fechar(page):
    page.goto(page.base + "/?conta=excluida")
    page.get_by_text("Sua conta e todos os seus dados foram excluídos.").wait_for()
    page.get_by_role("button", name="Fechar").click()
    assert page.get_by_text("Sua conta e todos os seus dados foram excluídos.").count() == 0
    assert "conta=excluida" not in page.url


def test_aulas_sao_documentacao_com_lista_por_nivel_e_artigo(page):
    page.goto(page.base + "/start/aulas"); page.get_by_role("heading", name="Aulas", exact=True).wait_for()
    assert page.get_by_role("link", name="Cache: responder sem refazer o trabalho").count() == 1
    page.get_by_role("link", name="Cache: responder sem refazer o trabalho").click()
    page.get_by_role("heading", name="Cache: responder sem refazer o trabalho", level=1).wait_for()
    assert "/start/aulas/cache" in page.url
    page.get_by_role("navigation", name="Outros artigos").get_by_role("link", name=re.compile("Cache distribuído")).click()   # próximo artigo
    page.get_by_role("heading", name=re.compile("^Cache distribuído"), level=1).wait_for()
    page.get_by_role("navigation", name="Nesta seção").get_by_role("link", name=re.compile("^Políticas de remoção")).click()
    page.get_by_role("link", name="Voltar às aulas").click()
    page.get_by_role("heading", name="Aulas", exact=True).wait_for()
    page.get_by_role("searchbox", name="Buscar nas aulas").fill("raft")
    page.get_by_role("link", name=re.compile("Algoritmos de consenso")).wait_for()
    assert page.get_by_role("link", name=re.compile("Hashing consistente")).count() == 0


def test_paleta_acha_tecnologia_pelo_nome_e_adiciona_ja_escolhida(page):
    page.goto(page.base + "/app?blank=1&s=1&d=test0001"); page.wait_for_selector(".palette")
    busca = page.get_by_label("Buscar componente")
    busca.fill("n8n")
    linha = page.get_by_role("button", name="Adicionar n8n como Orquestrador de workflow")
    linha.wait_for()
    assert "como Orquestrador de workflow" in page.locator(".tech-row").first.inner_text()
    linha.click()
    page.locator(".react-flow__node").first.wait_for()
    assert page.locator("dialog[open]").count() == 0        # a tecnologia já veio escolhida: não pergunta de novo
    assert page.locator(".react-flow__node svg[aria-label='n8n']").count() == 1


def test_paleta_node_red_aparece_em_mais_de_um_componente(page):
    page.goto(page.base + "/app?blank=1&s=1&d=test0001"); page.wait_for_selector(".palette")
    page.get_by_label("Buscar componente").fill("node-red")
    comps = page.locator(".tech-row .tech-text small").all_inner_texts()
    assert len([c for c in comps if "Gateway IoT" in c]) == 1 and len([c for c in comps if "Computação de borda" in c]) == 1, comps


def test_paleta_mostra_as_tecnologias_de_cada_componente(page):
    page.goto(page.base + "/app?blank=1&s=1&d=test0001"); page.wait_for_selector(".palette")
    cli = page.locator(".pitem-wrap", has_text="Fonte de requisições")
    cli.get_by_role("button", name=re.compile("^Ver as \\d+ tecnologias de Cliente")).click()
    cli.get_by_role("button", name="Adicionar Google Chrome como Cliente").click()
    page.locator(".react-flow__node svg[aria-label='Google Chrome']").wait_for()
    assert page.locator("dialog[open]").count() == 0


def test_paleta_lista_longa_mostra_as_primeiras_e_o_resto_sob_demanda(page):
    page.goto(page.base + "/app?blank=1&s=1&d=test0001"); page.wait_for_selector(".palette")
    sql = page.locator(".pitem-wrap", has_text="Relacional transacional")
    sql.get_by_role("button", name=re.compile("^Ver as \\d+ tecnologias de Banco SQL")).click()
    antes = sql.locator(".tech-chip").count()
    assert antes == 8, antes
    sql.get_by_role("button", name=re.compile("^Ver todas")).click()
    assert sql.locator(".tech-chip").count() > antes
    sql.get_by_role("button", name="Mostrar menos").click()
    assert sql.locator(".tech-chip").count() == 8

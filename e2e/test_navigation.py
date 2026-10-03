from helpers import open_case


def test_landing_leva_a_escolha_de_modo(page):
    page.goto(page.base + "/")
    page.get_by_role("link", name="Acessar o laboratório").first.click()
    page.wait_for_url("**/start")
    page.get_by_role("heading", name="O que você quer fazer hoje?").wait_for()


def test_escolha_de_modo_abre_estudo_e_livre(page):
    page.goto(page.base + "/start")
    page.get_by_text("Treinar para uma entrevista").click()
    page.wait_for_url("**/start/estudo")
    page.go_back()
    page.get_by_text("Desenhar o meu sistema").click()
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
    assert page.locator(".brand small").inner_text() == "Netflix"
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
    assert page.locator(".brand small").inner_text() == "Meu app"
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
    assert page.locator(".brand small").inner_text() == "Canvas livre"
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

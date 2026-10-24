"""Telas que só existem com o Supabase configurado (perfil, configurações, ranking, perfil público).
Sobe uma segunda instância do app com um Supabase falso e simula as respostas da API no navegador."""
import base64, copy, datetime, json, os, socket, subprocess, time, urllib.request, uuid
import pytest
from playwright.sync_api import expect
from conftest import WEB, _up

REF = "fake"
USER_ID = "11111111-1111-1111-1111-111111111111"
DAYS = [(datetime.date.today() - datetime.timedelta(days=i)).isoformat() for i in (0, 1, 2, 3, 6, 7, 8)]
PROG = {"netflix": {"met": 6, "total": 6, "stages": 3, "status": "done", "updatedAt": 3, "ovr": 84},
        "url-shortener": {"met": 5, "total": 5, "stages": 3, "status": "done", "updatedAt": 2, "ovr": 91},
        "uber": {"met": 3, "total": 6, "stages": 1, "status": "started", "updatedAt": 1, "ovr": 61}}
SNAP = {"n": [{"id": "c", "x": 0, "y": 0, "w": 240, "d": {"name": "c", "type": "client", "replicas": 1}}, {"id": "a", "x": 400, "y": 0, "w": 240, "d": {"name": "a", "type": "backend", "replicas": 2}}],
        "e": [{"source": "c", "target": "a"}], "f": [], "w": [], "m": {}}
PROFILE = {"full_name": "Tiago Meconi", "birth_date": "1995-04-12", "created_at": "2026-10-19T12:00:00Z", "handle": "tiagomeconi", "is_public": True, "bio": "Backend, fã de filas e caches.", "country":"BR"}
PUBLIC = {"handle": "tiagomeconi", "name": "Tiago Meconi", "bio": PROFILE["bio"], "uid": USER_ID, "avatarV": None, "since": "2026-10-19T12:00:00Z",
          "progress": [{"case": k, "met": v["met"], "total": v["total"], "status": v["status"], "ovr": v["ovr"]} for k, v in PROG.items()], "days": DAYS}
BOARD = [{"handle": "ana_dev", "name": "Ana Souza", "uid": "22222222-2222-2222-2222-222222222222", "avatarV": None, "points": 812, "overall": 81, "done": 10, "cases": 10},
         {"handle": "tiagomeconi", "name": "Tiago Meconi", "uid": USER_ID, "avatarV": None, "points": 540, "overall": 77, "done": 6, "cases": 7}]


def _b64(d): return base64.urlsafe_b64encode(json.dumps(d).encode()).decode().rstrip("=")


@pytest.fixture(scope="module")
def auth_url():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]
    env = {**os.environ, "VITE_SUPABASE_URL": f"https://{REF}.supabase.co", "VITE_SUPABASE_ANON_KEY": "fake-anon-key"}
    proc = subprocess.Popen([str(WEB / "node_modules" / ".bin" / "vite"), "--host", "127.0.0.1", "--port", str(port), "--strictPort"], cwd=WEB, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    url = f"http://127.0.0.1:{port}"
    try:
        for _ in range(60):
            if _up(url): break
            time.sleep(0.5)
        else:
            raise RuntimeError("o Vite (com Supabase falso) não subiu a tempo")
        yield url
    finally:
        proc.terminate()


@pytest.fixture
def conta(browser, auth_url):
    """Cria uma página com (ou sem) sessão simulada. Falha o teste se a página lançar erro de JavaScript."""
    ctxs, errors, calls = [], [], []

    def make(logged=True, width=1440, height=1000, profile=PROFILE, public=PUBLIC, showcase=None, publish_error=False, progress=PROG, assessments=None, attempts=None, submit_error=False):
        competition = copy.deepcopy(assessments or {"points":0,"companies":0,"best":[],"deliveries":[],"seasons":[],"active":[],"currentSeason":"2026-Q4"})
        attempt_store = copy.deepcopy(attempts or {})
        submit_count = [0]
        ctx = browser.new_context(viewport={"width": width, "height": height}); ctxs.append(ctx)
        exp = int(time.time()) + 3600
        user = {"id": USER_ID, "aud": "authenticated", "role": "authenticated", "email": "tiago@exemplo.com", "created_at": "2026-10-19T12:00:00Z", "app_metadata": {}, "user_metadata": {"name": "Tiago Meconi", "birth_date": "1995-04-12", "terms_accepted_at": "2026-10-19T12:00:00Z"}}
        sess = {"access_token": f"{_b64({'alg': 'HS256'})}.{_b64({'sub': USER_ID, 'exp': exp, 'role': 'authenticated'})}.sig", "refresh_token": "r", "expires_in": 3600, "expires_at": exp, "token_type": "bearer", "user": user}
        init = ("localStorage.setItem('archlab:tour-done','1');localStorage.setItem('archlab:theme','dark');localStorage.setItem('archlab:lang','pt');"
                f"localStorage.setItem('archlab:progress', {json.dumps(json.dumps(progress))});localStorage.setItem('archlab:activity', {json.dumps(json.dumps(DAYS))});localStorage.setItem('archlab:ach-seen','[]');")
        if logged: init += f"localStorage.setItem('sb-{REF}-auth-token', {json.dumps(json.dumps(sess))});"
        ctx.add_init_script(init)
        pg = ctx.new_page(); pg.base = auth_url; pg.calls = calls
        pg.on("pageerror", lambda e: errors.append(str(e)))

        def rest(r):
            u, m = r.request.url, r.request.method
            body = lambda x: r.fulfill(status=200, content_type="application/json", body=json.dumps(x))
            if "rpc/get_assessment_profile" in u:
                result = copy.deepcopy(competition)
                if not logged:
                    for record in result["best"] + result["deliveries"]:
                        if not record["published"]: record["snap"] = None
                return body(result)
            if "rpc/get_assessment_board" in u:
                args=json.loads(r.request.post_data or "{}")
                rows=[{**row,"country":"BR","companies":row["cases"],"worldRank":i+1,"countryRank":i+1} for i,row in enumerate(BOARD)]
                return body([row for row in rows if not args.get("p_country") or row["country"]==args["p_country"]])
            if "/assessment_seasons" in u: return body([{"id":v["season"]} for v in competition["seasons"]])
            if "rpc/" in u and any(op in u for op in ["start_assessment","get_assessment_attempt","save_assessment_draft","abandon_assessment","publish_assessment","cancel_assessment_correction"]):
                op=u.split("rpc/")[1].split("?")[0]; args=json.loads(r.request.post_data or "{}")
                calls.append(("assessment",op,args))
                if op=="start_assessment":
                    existing=next((a for a in attempt_store.values() if a["case_id"]==args["p_case"] and a["status"] in ("active","submitted")),None)
                    if existing and existing["status"]=="submitted": return r.fulfill(status=400,content_type="application/json",body=json.dumps({"message":"Você já fez esta avaliação. Agora só dá para corrigir a sua entrega."}))
                    if existing: return body(existing)
                    aid=str(uuid.uuid4()); a={"id":aid,"user_id":USER_ID,"case_id":args["p_case"],"case_version":"assessment-v1:"+args["p_case"],"rules_version":"assessment-v1","country":args["p_country"],"status":"active","started_at":"2026-10-21T12:00:00Z","draft":None,"points":0,"passed":False,"published":False}; attempt_store[aid]=a; return body(a)
                a=attempt_store.get(args.get("p_id"))
                if op=="get_assessment_attempt": return body(a)
                if op=="save_assessment_draft":
                    if a and (a["status"]=="active" or (a["status"]=="submitted" and a.get("draft"))): a["draft"]=args["p_snap"]; return body(True)
                    return body(False)
                if op=="start_assessment_correction":
                    if not a or a["status"]!="submitted": return r.fulfill(status=400,content_type="application/json",body='{"message":"Entrega não encontrada."}')
                    a["draft"]=a.get("draft") or a["snap"]; return body(a)
                if op=="cancel_assessment_correction":
                    if a: a["draft"]=None
                    return body(bool(a))
                if op=="abandon_assessment":
                    if a: a["status"]="abandoned"
                    return body(bool(a))
                if op=="publish_assessment":
                    if publish_error: return r.fulfill(status=500,content_type="application/json",body='{"message":"unavailable"}')
                    for record in competition["best"]+competition["deliveries"]:
                        if record["id"]==args["p_id"]: record["published"]=args["p_public"]
                    return body(True)
            if "rpc/get_public_profile" in u: return body(public)
            if "rpc/get_profile_showcase" in u: return body(showcase or {"solutions": [], "seasons": []})
            if "/profile_solutions" in u:
                calls.append(("solutions", m, r.request.post_data))
                if publish_error: return r.fulfill(status=500, content_type="application/json", body='{"message":"unavailable"}')
                return r.fulfill(status=204, body="")
            if "rpc/get_leaderboard" in u: return body(BOARD)
            if "rpc/get_my_rank" in u: return body({"rank": 2, "total": 2, "points": 540})
            if "rpc/delete_my_account" in u: calls.append("delete"); return r.fulfill(status=204, body="")
            if "/profiles" in u:
                if m != "GET": calls.append(("profiles", m, r.request.post_data)); return r.fulfill(status=204, body="")
                return body(profile)
            if "/designs" in u: return body([{"case_key": "netflix", "title": "Netflix", "snap": SNAP, "updated_at": "2026-10-19T20:00:00Z"}, {"case_key": "free-ab12cd34", "title": "Agenda de consultas", "snap": SNAP, "updated_at": "2026-10-10T20:00:00Z"}])
            if "/activity_days" in u: return body([{"day": d} for d in DAYS])
            body([])
        pg.route("**/rest/v1/**", rest)
        def assessment_function(r):
            args=json.loads(r.request.post_data or "{}"); calls.append(("assessment","submit",args)); submit_count[0]+=1
            if submit_error and submit_count[0]==1: return r.fulfill(status=503,content_type="application/json",body='{"message":"Servidor indisponível. Tente novamente."}')
            a=attempt_store.get(args.get("attemptId"))
            if not a: return r.fulfill(status=404,content_type="application/json",body='{"message":"not found"}')
            if a["status"]=="active" or (a["status"]=="submitted" and a.get("draft")): a.update({"revision":a.get("revision",0)+1 if a["status"]=="submitted" else 0,"status":"submitted","submitted_at":"2026-10-21T12:30:00Z","season":"2026-Q4","score":84,"points":84,"passed":True,"snap":args["snap"],"draft":None,"report":{"rating":{"overall":84,"tier":"gold","attrs":[]},"checks":[{"id":"spof","label":"Sem ponto único de falha","detail":"Todo componente do fluxo tem 2 ou mais réplicas.","status":"meets"}]}})
            return r.fulfill(status=200,content_type="application/json",body=json.dumps(a))
        pg.route("**/functions/v1/assessment",assessment_function)
        pg.route("**/auth/v1/**", lambda r: r.fulfill(status=200, content_type="application/json", body=json.dumps(user)))
        pg.route("**/storage/v1/**", lambda r: r.fulfill(status=200, content_type="application/json", body="{}"))
        return pg

    yield make
    for c in ctxs: c.close()
    assert not errors, errors


def test_perfil_tem_cabecalho_liga_e_paineis_que_trocam(conta):
    pg = conta(); pg.goto(pg.base + "/perfil")
    pg.get_by_role("heading", name="Tiago Meconi", level=1).wait_for()
    assert pg.get_by_text("@tiagomeconi").count() == 1 and pg.get_by_text("Backend, fã de filas e caches.").count() == 1
    assert pg.get_by_text("Pérola", exact=True).count() == 0  # practice averages do not award profile ranks
    pg.get_by_text("Pontos de avaliação",exact=True).wait_for()
    pg.get_by_role("tab", name="Conquistas").click(); pg.get_by_text("Primeiro passo").wait_for()
    assert pg.evaluate("location.hash") == "#conquistas"
    pg.get_by_role("tab", name="Práticas concluídas").click()
    pg.get_by_role("group", name="Filtrar casos").wait_for()
    assert pg.get_by_role("button", name="Concluídos").get_attribute("aria-pressed") == "true"
    assert pg.get_by_text("Netflix", exact=True).count() >= 1 and pg.get_by_text("Uber", exact=True).count() == 0
    pg.get_by_role("tab", name="Desenhos").click(); pg.get_by_text("Agenda de consultas").wait_for()
    pg.get_by_role("tab", name="Sequência").click(); pg.get_by_text("dias praticados nas últimas 53 semanas").wait_for()


def test_perfil_abre_direto_na_aba_do_endereco(conta):
    pg = conta(); pg.goto(pg.base + "/perfil#conquistas")
    pg.get_by_role("tab", name="Conquistas", selected=True).wait_for()


def test_perfil_publico_abre_sem_login_so_leitura_e_perfil_inexistente(conta):
    pg = conta(logged=False); pg.goto(pg.base + "/u/tiagomeconi")
    pg.get_by_role("heading", name="Tiago Meconi", level=1).wait_for()
    assert pg.get_by_role("tab", name="Desenhos").count() == 0  # desenhos são só do dono
    assert pg.get_by_role("link", name="Criar minha conta").count() == 1 and pg.get_by_role("link", name="Editar perfil").count() == 0
    pg2 = conta(logged=False, public=None); pg2.goto(pg2.base + "/u/ninguem123")
    pg2.get_by_role("heading", name="Perfil não encontrado").wait_for()


def test_editar_perfil_leva_as_configuracoes_e_bio_e_salva(conta):
    pg = conta(); pg.goto(pg.base + "/perfil")
    pg.get_by_role("link", name="Editar perfil").click()
    pg.get_by_role("heading", name="Configurações", level=1).wait_for()
    pg.get_by_label("Sobre você").fill("Nova frase sobre mim")
    pg.get_by_role("button", name="Salvar alterações").click(); pg.get_by_text("Dados salvos.").wait_for()
    enviado = [c for c in pg.calls if isinstance(c, tuple) and c[0] == "profiles"]
    assert enviado and "Nova frase sobre mim" in enviado[-1][2]


def test_excluir_conta_so_libera_com_a_frase_exata_e_a_senha(conta):
    pg = conta(); pg.goto(pg.base + "/configuracoes")
    pg.get_by_role("button", name="Quero excluir a minha conta").click()
    botao = pg.get_by_role("button", name="Excluir tudo")
    pg.locator("#delpw").fill("qualquer")
    for errada in ("EXCLUIR", "excluir", "Excluir minha conta", "excluir minha cont"):
        pg.locator("#delword").fill(errada); assert botao.is_disabled(), errada
    pg.locator("#delword").fill("excluir minha conta"); assert botao.is_enabled()
    assert "delete" not in pg.calls


def test_ranking_mostra_a_classificacao_e_a_sua_posicao(conta):
    pg = conta(); pg.goto(pg.base + "/ranking")
    pg.get_by_role("heading", name="Ranking de avaliações").wait_for()
    pg.get_by_role("list",name="Classificação").wait_for()
    linhas = pg.get_by_role("list", name="Classificação").get_by_role("listitem")
    assert linhas.count() == 2 and linhas.nth(1).get_attribute("aria-current") == "true"


def test_perfil_no_celular_nao_estoura_a_largura_e_mostra_as_abas_no_topo(conta):
    pg = conta(width=390, height=844); pg.goto(pg.base + "/perfil")
    pg.get_by_role("heading", name="Tiago Meconi", level=1).wait_for(); pg.wait_for_timeout(600)
    assert pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth") <= 1
    abas = pg.get_by_role("tab", name="Visão geral").bounding_box(); conteudo = pg.get_by_role("heading", name="Conquistas em destaque").bounding_box()
    assert abas["y"] < conteudo["y"]  # as abas vêm antes do conteúdo
    caixa = pg.locator("main section").first.bounding_box()
    assert caixa["x"] + caixa["width"] <= 391


def test_vitrine_prioriza_avaliacoes_sem_converter_pratica_em_pontos(conta):
    pg=conta();pg.goto(pg.base+"/perfil")
    best=pg.get_by_role("region",name="Melhores avaliações de empresas");best.wait_for()
    pg.get_by_text("Ainda sem avaliações aprovadas.",exact=False).wait_for()
    assert best.locator("article").count()==0
    assert best.bounding_box()["y"] < pg.get_by_role("region",name="Conquistas em destaque").bounding_box()["y"]
    pg.get_by_role("button",name="Ver histórico de temporadas").click()
    pg.get_by_role("dialog",name="Histórico de temporadas").get_by_text("Nenhuma temporada de avaliação registrada ainda.").wait_for()
    pg.keyboard.press("Escape")


def test_visitante_consulta_arquitetura_e_fluxo_sem_alterar_desenhos(conta):
    snap = {**SNAP, "f": [{"id": "read", "steps": [{"id": "s1", "nodeId": "c", "operationClass": "read"}, {"id": "s2", "nodeId": "a", "operationClass": "read"}]}], "m": {"read": {"name": "Consultar catálogo"}}}
    pg = conta(logged=False, showcase={"solutions": [{"caseId": "netflix", "title": "Netflix", "snap": snap, "publishedAt": "2026-10-21T12:00:00Z"}], "seasons": []})
    pg.goto(pg.base + "/u/tiagomeconi#casos")
    pg.get_by_role("button", name="Ver solução", exact=True).click()
    dialog = pg.get_by_role("dialog", name="Solução de Netflix")
    dialog.locator(".react-flow__node").first.wait_for()
    assert dialog.locator(".react-flow__node").count() == 2
    # O canvas só deve medir os nós depois que o diálogo estiver aberto.
    pg.wait_for_timeout(300)
    canvas = dialog.locator(".react-flow").bounding_box()
    for box in [n.bounding_box() for n in dialog.locator(".react-flow__node").all()]:
        assert box["width"] > 30
        assert canvas["x"] <= box["x"] and box["x"] + box["width"] <= canvas["x"] + canvas["width"] + 1
        assert canvas["y"] <= box["y"] and box["y"] + box["height"] <= canvas["y"] + canvas["height"] + 1
    dialog.get_by_role("button", name="Consultar catálogo", exact=True).click()
    assert dialog.get_by_role("button", name="Consultar catálogo", exact=True).get_attribute("aria-pressed") == "true"
    assert dialog.locator("ol li").count() == 2
    assert pg.get_by_role("button", name="Publicar solução", exact=True).count() == 0
    assert pg.evaluate("Object.keys(localStorage).filter(k=>k.startsWith('archlab:design:')).length") == 0
    pg.keyboard.press("Escape")
    pg.get_by_role("heading", name="Casos de prática").wait_for()


def test_autor_publica_copia_e_pode_retirar_sem_apagar_desenho(conta):
    pg = conta(); pg.goto(pg.base + "/perfil#casos")
    pg.get_by_role("button", name="Publicar solução", exact=True).click()
    dialog = pg.get_by_role("dialog", name="Publicar solução")
    expect(dialog).to_contain_text("Uma cópia do desenho salvo")
    dialog.get_by_role("button", name="Publicar solução", exact=True).click()
    pg.get_by_role("button", name="Retirar do perfil público").wait_for()
    payload = json.loads([c for c in pg.calls if isinstance(c, tuple) and c[:2] == ("solutions", "POST")][-1][2])
    assert payload["case_id"] == "netflix" and payload["snap"] == SNAP
    pg.get_by_role("button", name="Retirar do perfil público").click()
    pg.get_by_role("button", name="Publicar solução", exact=True).wait_for()
    assert any(c[:2] == ("solutions", "DELETE") for c in pg.calls if isinstance(c, tuple))
    pg.get_by_role("button", name="Ver solução", exact=True).click()
    pg.get_by_role("dialog", name="Solução de Netflix").wait_for()


def test_publicacao_com_erro_permite_tentar_novamente(conta):
    pg = conta(publish_error=True); pg.goto(pg.base + "/perfil#casos")
    pg.get_by_role("button", name="Publicar solução", exact=True).click()
    dialog = pg.get_by_role("dialog", name="Publicar solução")
    dialog.get_by_role("button", name="Publicar solução", exact=True).click()
    dialog.get_by_role("alert").wait_for()
    assert dialog.get_by_role("button", name="Publicar solução", exact=True).is_enabled()
    pg.keyboard.press("Escape")
    assert pg.get_by_role("button", name="Retirar do perfil público").count() == 0


@pytest.mark.parametrize("width", [1440, 390])
def test_solucao_usa_quadro_original_preserva_detalhes_e_impede_edicao(conta, width):
    snap = {**SNAP,
        "n": [SNAP["n"][0], {**SNAP["n"][1], "w": 300, "d": {"name": "Catálogo", "type": "backend", "replicas": 3, "providerId": "nodejs", "note": "Serviço de catálogo em três zonas."}}],
        "e": [{"id": "e1", "source": "c", "target": "a", "sourcePort": "bottom", "targetPort": "top", "configuration": {"protocol": "grpc", "mode": "sync", "bidirectional": True}}],
        "f": [{"id": "read", "steps": [{"id": "s1", "nodeId": "c", "operationClass": "compute"}, {"id": "s2", "parentStepId": "s1", "nodeId": "a", "operationClass": "read", "edgeId": "e1"}]}],
        "m": {"read": {"name": "Consultar catálogo"}},
        "r": [{"id": "region", "name": "Região principal", "color": "sky", "x": -60, "y": -60, "w": 820, "h": 250}],
        "g": "Separar leitura e escrita do catálogo."}
    pg = conta(logged=False, width=width, height=900, showcase={"solutions": [{"caseId": "netflix", "title": "Netflix", "snap": snap, "publishedAt": "2026-10-21T12:00:00Z"}], "seasons": []})
    pg.goto(pg.base + "/u/tiagomeconi#casos")
    pg.get_by_role("button", name="Ver solução", exact=True).click()
    dialog = pg.get_by_role("dialog", name="Solução de Netflix")
    node = dialog.locator('.react-flow__node-arch[data-id="a"]')
    node.locator(".node-head").wait_for()
    expect(node).to_contain_text("Node.js")
    expect(node).to_contain_text("×3")
    assert dialog.locator(".group-name").input_value() == "Região principal"
    assert dialog.locator(".group-name").get_attribute("readonly") is not None
    assert dialog.get_by_role("button", name="Mais uma réplica").count() == 0
    assert dialog.get_by_label("Redimensionar horizontalmente").count() == 0
    assert dialog.get_by_role("button", name="Cortar conexão", exact=False).count() == 0
    expect(dialog.locator(".proto-name")).to_have_text("gRPC")
    if width > 640:
        expect(dialog.locator(".react-flow__minimap-node")).to_have_count(3)
    assert dialog.bounding_box()["width"] > width * 0.9
    assert dialog.evaluate("el => el.scrollWidth <= el.clientWidth")
    before = node.get_attribute("style")
    # Arrastar um card pode mover a câmera, mas nunca o componente salvo.
    node.locator(".node-head").hover(); pg.mouse.down(); pg.mouse.move(200, 200, steps=5); pg.mouse.up()
    assert node.get_attribute("style") == before
    dialog.get_by_role("button", name="Tamanho original (100%)").click()
    dialog.get_by_role("button", name="Componente", exact=True).click()
    dialog.get_by_text("Clique em um componente no quadro para consultar sua configuração.").wait_for()
    # Pela etapa, localizar o componente e consultar seus detalhes.
    dialog.get_by_role("button", name="Fluxos", exact=True).click()
    dialog.get_by_role("button", name="Consultar catálogo", exact=True).click()
    dialog.locator("ol button").last.click()
    dialog.get_by_role("button", name="Componente", exact=True).click()
    dialog.get_by_text("Serviço de catálogo em três zonas.").wait_for()
    dialog.get_by_role("button", name="Anotações", exact=True).click()
    dialog.get_by_text("Separar leitura e escrita do catálogo.").wait_for()
    pg.keyboard.press("Delete")
    assert dialog.locator(".react-flow__node-arch").count() == 2
    assert pg.evaluate("Object.keys(localStorage).filter(k=>k.startsWith('archlab:design:')).length") == 0
    assert not any(c[0] == "solutions" for c in pg.calls if isinstance(c, tuple))


@pytest.mark.parametrize("width", [1440, 390])
def test_home_destaca_retomada_e_abre_o_desenho_salvo(conta, width):
    pg = conta(width=width)
    snap = {**SNAP, "e": [{"id": "e1", "source": "c", "target": "a", "sourcePort": "right", "targetPort": "left", "configuration": {"protocol": "https", "mode": "sync", "tls": True}}]}
    saved = {"v": 1, "snap": json.dumps(snap), "savedAt": 9999999999999}
    pg.add_init_script("localStorage.setItem('archlab:design:uber', " + json.dumps(json.dumps(saved)) + ")")
    pg.goto(pg.base + "/start")
    resume = pg.get_by_role("region", name="Continuar de onde parou")
    resume.get_by_role("heading", name="Uber", exact=True).wait_for()
    assert resume.bounding_box()["y"] < pg.get_by_role("region", name="Desafio da semana").bounding_box()["y"]
    assert pg.get_by_role("button", name="Retomar desenho de Uber").count() == (1 if width >= 640 else 0)
    assert pg.evaluate("document.documentElement.scrollWidth <= innerWidth")
    resume.get_by_role("button", name="Retomar", exact=True).click()
    pg.locator(".react-flow").wait_for()
    assert pg.locator(".react-flow__node-arch").count() == 2


def test_home_sem_progresso_oferece_primeiro_caso_e_aulas(conta):
    pg = conta(progress={}); pg.goto(pg.base + "/start")
    pg.get_by_role("region", name="Comece por aqui").get_by_role("button", name="Começar", exact=True).wait_for()
    assert pg.get_by_role("button", name="Retomar", exact=True).count() == 0
    assert pg.get_by_role("region", name="Aprender system design").get_by_role("link", name="Ler as aulas").count() == 1
    assert "—" in pg.get_by_role("definition").all_inner_texts()[-1]

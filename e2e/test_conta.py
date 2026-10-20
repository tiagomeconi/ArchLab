"""Telas que só existem com o Supabase configurado (perfil, configurações, ranking, perfil público).
Sobe uma segunda instância do app com um Supabase falso e simula as respostas da API no navegador."""
import base64, datetime, json, os, socket, subprocess, time, urllib.request
import pytest
from conftest import WEB, _up

REF = "fake"
USER_ID = "11111111-1111-1111-1111-111111111111"
DAYS = [(datetime.date.today() - datetime.timedelta(days=i)).isoformat() for i in (0, 1, 2, 3, 6, 7, 8)]
PROG = {"netflix": {"met": 6, "total": 6, "stages": 3, "status": "done", "updatedAt": 3, "ovr": 84},
        "url-shortener": {"met": 5, "total": 5, "stages": 3, "status": "done", "updatedAt": 2, "ovr": 91},
        "uber": {"met": 3, "total": 6, "stages": 1, "status": "started", "updatedAt": 1, "ovr": 61}}
SNAP = {"n": [{"id": "c", "x": 0, "y": 0, "w": 240, "d": {"name": "c", "type": "client", "replicas": 1}}, {"id": "a", "x": 400, "y": 0, "w": 240, "d": {"name": "a", "type": "backend", "replicas": 2}}],
        "e": [{"source": "c", "target": "a"}], "f": [], "w": [], "m": {}}
PROFILE = {"full_name": "Tiago Meconi", "birth_date": "1995-04-12", "created_at": "2026-10-19T12:00:00Z", "handle": "tiagomeconi", "is_public": True, "bio": "Backend, fã de filas e caches."}
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

    def make(logged=True, width=1440, height=1000, profile=PROFILE, public=PUBLIC):
        ctx = browser.new_context(viewport={"width": width, "height": height}); ctxs.append(ctx)
        exp = int(time.time()) + 3600
        user = {"id": USER_ID, "aud": "authenticated", "role": "authenticated", "email": "tiago@exemplo.com", "created_at": "2026-10-19T12:00:00Z", "app_metadata": {}, "user_metadata": {"name": "Tiago Meconi", "birth_date": "1995-04-12"}}
        sess = {"access_token": f"{_b64({'alg': 'HS256'})}.{_b64({'sub': USER_ID, 'exp': exp, 'role': 'authenticated'})}.sig", "refresh_token": "r", "expires_in": 3600, "expires_at": exp, "token_type": "bearer", "user": user}
        init = ("localStorage.setItem('archlab:tour-done','1');localStorage.setItem('archlab:theme','dark');localStorage.setItem('archlab:lang','pt');"
                f"localStorage.setItem('archlab:progress', {json.dumps(json.dumps(PROG))});localStorage.setItem('archlab:activity', {json.dumps(json.dumps(DAYS))});localStorage.setItem('archlab:ach-seen','[]');")
        if logged: init += f"localStorage.setItem('sb-{REF}-auth-token', {json.dumps(json.dumps(sess))});"
        ctx.add_init_script(init)
        pg = ctx.new_page(); pg.base = auth_url; pg.calls = calls
        pg.on("pageerror", lambda e: errors.append(str(e)))

        def rest(r):
            u, m = r.request.url, r.request.method
            body = lambda x: r.fulfill(status=200, content_type="application/json", body=json.dumps(x))
            if "rpc/get_public_profile" in u: return body(public)
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
    assert pg.get_by_text("Pérola").count() >= 1  # média de 84, 91 e 61 → 79: Pérola
    pg.get_by_role("tab", name="Conquistas").click(); pg.get_by_text("Primeiro passo").wait_for()
    assert pg.evaluate("location.hash") == "#conquistas"
    pg.get_by_role("tab", name="Casos concluídos").click()
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
    pg.get_by_role("heading", name="Você está em 2º lugar").wait_for()
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

"""Turmas (professor e aluno) com o Supabase simulado no navegador."""
import json
from test_conta import USER_ID, auth_url, conta  # noqa: F401  (fixtures)

CLASS = {"id": "c1", "name": "Backend 2026.1", "join_code": "AB12CD34", "owner_id": USER_ID, "created_at": "2026-10-19T12:00:00Z"}
OTHER = {"id": "c2", "name": "Turma da Maria", "join_code": "ZZ99ZZ99", "owner_id": "99999999-9999-9999-9999-999999999999", "created_at": "2026-10-18T12:00:00Z"}
ASSIGN = [{"case_id": "netflix", "due_at": None}, {"case_id": "uber", "due_at": None}]
PROGRESS = [
    {"user_id": "u1", "full_name": "Ana Souza", "case_id": "netflix", "met": 6, "total": 6, "status": "done", "ovr": 84, "updated_at": None},
    {"user_id": "u1", "full_name": "Ana Souza", "case_id": "uber", "met": 0, "total": 0, "status": "none", "ovr": None, "updated_at": None},
    {"user_id": "u2", "full_name": "", "case_id": "netflix", "met": 2, "total": 6, "status": "started", "ovr": 50, "updated_at": None},
    {"user_id": "u2", "full_name": "", "case_id": "uber", "met": 0, "total": 0, "status": "none", "ovr": None, "updated_at": None},
]


def _stub(pg, classes):
    calls = []
    def j(r, x, status=200): r.fulfill(status=status, content_type="application/json", body=json.dumps(x))
    def rest(r):
        u, m = r.request.url, r.request.method
        if "rpc/join_class" in u:
            body = json.loads(r.request.post_data or "{}"); calls.append(("join", body.get("code")))
            return j(r, "c2") if body.get("code") == "ZZ99ZZ99" else j(r, {"message": "invalid code"}, 400)
        if "rpc/class_progress" in u: return j(r, PROGRESS)
        if "/class_assignments" in u:
            if m != "GET": calls.append(("assign", m, r.request.post_data)); return r.fulfill(status=201, body="")
            return j(r, ASSIGN)
        if "/class_members" in u: calls.append(("members", m)); return r.fulfill(status=204, body="")
        if "/classes" in u:
            if m == "POST": calls.append(("create", r.request.post_data)); return j(r, {"id": "c1"})
            if m == "DELETE": calls.append(("delete",)); return r.fulfill(status=204, body="")
            return j(r, classes)
        r.fallback()
    pg.route("**/rest/v1/**", rest)
    return calls


def test_professor_ve_o_codigo_os_casos_e_o_progresso_de_cada_aluno(conta):
    pg = conta(); calls = _stub(pg, [CLASS]); pg.goto(pg.base + "/turmas")
    pg.get_by_role("heading", name="Turmas", exact=True).wait_for()
    pg.get_by_role("button", name="Backend 2026.1").click()
    pg.get_by_text("AB12CD34").wait_for()
    assert pg.get_by_text("Você ensina").count() == 1
    tabela = pg.get_by_role("table")
    tabela.wait_for()
    assert "Ana Souza" in tabela.inner_text() and "Aluno 2" in tabela.inner_text()  # sem nome no perfil vira "Aluno N"
    assert "84" in tabela.inner_text() and "Em andamento" in tabela.inner_text()
    pg.get_by_label("Escolher caso para atribuir").select_option("stripe")
    pg.get_by_role("button", name="Atribuir").click(); pg.wait_for_timeout(300)
    assert any(c[0] == "assign" and c[1] == "POST" for c in calls)


def test_aluno_entra_pelo_codigo_e_codigo_invalido_mostra_erro(conta):
    pg = conta(); calls = _stub(pg, [OTHER]); pg.goto(pg.base + "/turmas")
    pg.get_by_label("Código da turma").wait_for()
    pg.get_by_label("Código da turma").fill("abc"); pg.get_by_role("button", name="Entrar", exact=True).click()
    pg.get_by_text("O código tem 8 letras ou números.").wait_for()
    pg.get_by_label("Código da turma").fill("nao1nao1"); pg.get_by_role("button", name="Entrar", exact=True).click()
    pg.get_by_text("Código não encontrado").wait_for()
    pg.get_by_label("Código da turma").fill("zz99 zz99"); pg.get_by_role("button", name="Entrar", exact=True).click()
    pg.get_by_text("Você estuda").wait_for()
    assert ("join", "ZZ99ZZ99") in calls
    pg.get_by_role("button", name="Turma da Maria").click()
    assert pg.get_by_text("Casos atribuídos").count() == 1
    assert pg.get_by_role("table").count() == 0  # aluno não vê a tabela de progresso da turma

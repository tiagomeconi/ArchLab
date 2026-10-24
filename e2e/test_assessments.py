"""Competition flows use a mocked authenticated API; evaluator and database are tested separately."""
import copy, json
import pytest
from playwright.sync_api import expect
from test_conta import conta, auth_url, SNAP, USER_ID
from helpers import add_component

def choose(pg,label,option):
    """Seletor próprio do sistema (não é um <select> nativo): abre a lista e clica na opção pelo nome visível."""
    pg.get_by_label(label,exact=True).click()
    pg.get_by_role("option",name=option,exact=True).click()


ID = "33333333-3333-3333-3333-333333333333"
DRAWING = {**SNAP, "e": [{"id":"e1","source":"c","target":"a","sourcePort":"right","targetPort":"left","configuration":{"protocol":"https","mode":"sync","tls":True,"timeoutMs":1000,"networkLatencyMs":5,"required":True,"maxAttempts":1,"backoffMs":0,"retryable":False}}],"g":"Decisão preservada na entrega."}
ATTEMPT = {"id":ID,"user_id":USER_ID,"case_id":"netflix","case_version":"assessment-v1:netflix","rules_version":"assessment-v1","country":"BR","status":"active","started_at":"2026-10-21T12:00:00Z","points":0,"passed":False,"published":False,"draft":DRAWING,"draft_updated_at":"2026-10-21T12:01:00Z"}
RECORD = {"id":ID,"caseId":"netflix","score":84,"points":84,"passed":True,"season":"2026-Q4","country":"BR","submittedAt":"2026-10-21T12:30:00Z","rulesVersion":"assessment-v1","caseVersion":"assessment-v1:netflix","published":False,"snap":DRAWING}
COMPETITION = {"points":84,"companies":1,"best":[RECORD],"deliveries":[RECORD],"seasons":[{"season":"2026-Q4","points":84,"companies":1,"country":"BR","worldRank":2,"countryRank":1,"closed":False,"startsAt":"2026-10-01","endsAt":"2027-01-01"},{"season":"2026-Q3","points":75,"companies":1,"country":"BR","worldRank":12,"countryRank":3,"closed":True,"startsAt":"2026-07-01","endsAt":"2026-10-01"}],"active":[],"currentSeason":"2026-Q4"}

@pytest.mark.parametrize("width",[1440,390])
def test_avaliacao_inicia_em_branco_sem_assistencia_e_separa_rascunho(conta,width):
    pg=conta(width=width);pg.goto(pg.base+"/avaliacao/netflix")
    pg.get_by_role("heading",name="Avaliação sem dicas · Netflix").wait_for()
    choose(pg,"País","Brasil")
    pg.get_by_role("button",name="Iniciar avaliação",exact=True).click()
    pg.locator(".react-flow").wait_for()
    assert pg.locator(".react-flow__node-arch").count()==0
    assert pg.get_by_role("tab",name="Revisão").count()==0
    assert pg.get_by_role("tab",name="Guia").count()==0
    assert pg.get_by_text("Ver dica",exact=True).count()==0
    assert pg.get_by_text("Sobre este componente",exact=True).count()==0
    assert pg.locator(".ovr").count()==0
    assert pg.get_by_role("button",name="Padrões prontos",exact=True).count()==0
    assert pg.get_by_role("button",name="Entregar avaliação").is_disabled()
    if width==390:
        pg.get_by_role("button",name="Componentes",exact=True).click()
        pg.wait_for_timeout(300)
        pg.get_by_label("Adicionar Cliente",exact=True).click(force=True)
        if pg.locator("dialog[open]").count(): pg.keyboard.press("Escape")
    else:
        add_component(pg,"Cliente")
    expect(pg.get_by_role("button",name="Entregar avaliação")).to_be_enabled()
    pg.wait_for_timeout(1400)
    saved=[c for c in pg.calls if isinstance(c,tuple) and c[:2]==("assessment","save_assessment_draft")]
    assert saved and len(saved[-1][2]["p_snap"]["n"])==1
    assert pg.evaluate("Object.keys(localStorage).some(k=>k.startsWith('archlab:assessment-draft:'))")
    assert not pg.evaluate("Object.keys(localStorage).some(k=>k.startsWith('archlab:design:assessment-'))")


def test_entrega_recalcula_no_servidor_exibe_diagnostico_e_recupera_falha(conta):
    pg=conta(attempts={ID:ATTEMPT},submit_error=True)
    pg.goto(pg.base+"/avaliacao/tentativa/"+ID)
    pg.locator(".react-flow__node-arch").first.wait_for()
    assert pg.locator(".react-flow__node-arch").count()==2
    before=pg.evaluate("localStorage.getItem('archlab:progress')")
    pg.get_by_role("button",name="Entregar avaliação").click()
    dialog=pg.get_by_role("dialog",name="Entregar avaliação")
    dialog.get_by_role("button",name="Confirmar entrega").click()
    dialog.get_by_role("alert").wait_for()
    assert pg.locator(".react-flow__node-arch").count()==2
    dialog.get_by_role("button",name="Confirmar entrega").click()
    pg.get_by_role("heading",name="Resultado da avaliação · Netflix").wait_for()
    pg.get_by_role("heading",name="Diagnóstico da entrega").wait_for()
    assert pg.get_by_text("84",exact=True).first.is_visible() and pg.get_by_text("/ 100",exact=True).count()==1
    requests=[c[2] for c in pg.calls if isinstance(c,tuple) and c[:2]==("assessment","submit")]
    assert len(requests)==2 and requests[0]==requests[1]
    assert set(requests[-1])=={"attemptId","snap"}
    assert requests[-1]["snap"]["g"]==DRAWING["g"]
    assert pg.evaluate("localStorage.getItem('archlab:progress')")==before
    pg.get_by_role("button",name="Ver solução entregue").click()
    pg.get_by_role("dialog",name="Solução de Netflix").locator(".node-head").first.wait_for()
    assert pg.get_by_role("button",name="Mais uma réplica").count()==0


def test_perfil_pontos_historico_e_publicacao_independente_do_resultado(conta):
    pg=conta(assessments=COMPETITION);pg.goto(pg.base+"/perfil")
    best=pg.get_by_role("region",name="Melhores avaliações de empresas")
    best.get_by_role("heading",name="Netflix",exact=True).wait_for()
    assert best.locator("article").count()==1
    assert best.get_by_role("heading",name="Encurtador de links",exact=True).count()==0
    best.get_by_role("button",name="Publicar solução avaliada").click()
    best.get_by_role("button",name="Retirar do perfil público").wait_for()
    changes=[c[2] for c in pg.calls if isinstance(c,tuple) and c[:2]==("assessment","publish_assessment")]
    assert changes[-1]=={"p_id":ID,"p_public":True}
    pg.get_by_role("button",name="Ver histórico de temporadas").click()
    dialog=pg.get_by_role("dialog",name="Histórico de temporadas")
    dialog.get_by_text("2026 · T3",exact=True).wait_for()
    expect(dialog).to_contain_text("Mundial: #12")
    expect(dialog).to_contain_text("Brasil: #3")
    dialog.get_by_text("2026 · T4",exact=True).click()
    dialog.get_by_role("heading",name="Avaliações · 2026 · T4").wait_for()


def test_visitante_ve_resultado_mas_so_abre_desenho_publicado(conta):
    pg=conta(logged=False,assessments=COMPETITION);pg.goto(pg.base+"/u/tiagomeconi")
    pg.get_by_text("O autor não publicou este desenho.").wait_for()
    assert pg.get_by_role("button",name="Ver solução entregue").count()==0
    public=copy.deepcopy(COMPETITION)
    public["best"][0]["published"]=True
    pg2=conta(logged=False,assessments=public);pg2.goto(pg2.base+"/u/tiagomeconi")
    pg2.get_by_role("button",name="Ver solução entregue").click()
    pg2.get_by_role("dialog",name="Solução de Netflix").locator(".node-head").first.wait_for()
    assert pg2.get_by_role("button",name="Publicar solução avaliada").count()==0


def test_ranking_filtra_pais_sem_recalcular_posicao_no_cliente(conta):
    pg=conta(assessments=COMPETITION);pg.goto(pg.base+"/ranking")
    rows=pg.get_by_role("list",name="Classificação").get_by_role("listitem")
    expect(rows).to_have_count(2)
    choose(pg,"País","Brasil")
    expect(rows.nth(1)).to_contain_text("#2")
    choose(pg,"País","Estados Unidos")
    pg.get_by_text("Ainda não há avaliações públicas nesta classificação.").wait_for()
    choose(pg,"Temporada","2026 · T3")
    pg.get_by_text("Temporada encerrada",exact=False).wait_for()


def test_caso_classico_nao_oferece_avaliacao_competitiva(conta):
    pg=conta();pg.goto(pg.base+"/avaliacao/url-shortener")
    pg.get_by_text("Somente casos de empresas podem ser avaliados.").wait_for()
    assert pg.get_by_role("button",name="Iniciar avaliação").count()==0


SUBMITTED={**ATTEMPT,"draft":None,"draft_updated_at":None,"status":"submitted","submitted_at":"2026-10-21T12:30:00Z","season":"2026-Q4","score":95,"points":0,"passed":False,"snap":DRAWING,
           "report":{"rating":{"overall":95,"tier":None,"attrs":[]},"checks":[{"id":"w","label":"Escrita chega ao banco, passando pelo serviço","detail":"Todo dado novo precisa de um caminho até o armazenamento durável.","status":"fails"}],"rulesVersion":"assessment-v1","caseVersion":"assessment-v1:netflix"}}


def test_so_uma_prova_por_caso_depois_so_correcao_e_a_ultima_versao_vale(conta):
    pg=conta(attempts={ID:SUBMITTED})
    rows=[{"id":ID,"case_id":"netflix","score":95,"points":0,"passed":False,"season":"2026-Q4","country":"BR","submitted_at":"2026-10-21T12:30:00Z"},
          {"id":"44444444-4444-4444-4444-444444444444","case_id":"wikipedia","score":88,"points":88,"passed":True,"season":"2026-Q4","country":"BR","submitted_at":"2026-10-22T12:30:00Z"}]
    pg.route("**/rest/v1/assessment_attempts*",lambda r:r.fulfill(status=200,content_type="application/json",body=json.dumps(rows)))
    # Meus desenhos: abas Desenhos | Avaliações entregues
    pg.goto(pg.base+"/desenhos")
    pg.get_by_role("tab",name="Avaliações entregues").click()
    assert pg.get_by_role("tab",name="Avaliações entregues").get_attribute("aria-selected")=="true"
    assert pg.get_by_text("Não aprovada").count()==1 and pg.get_by_text("Aprovada · 88 pontos").count()==1
    pg.wait_for_timeout(500); pg.screenshot(path="/tmp/claude-1000/-home-meconi-Documentos-Meconi-Portif-lio-GitHub-System-Forge/1f42be0e-ff28-4c80-a2a4-67bdd15f1287/scratchpad/deliveries.png",full_page=True)
    # a lista de casos oferece corrigir (e não uma nova prova) para quem já entregou
    pg.goto(pg.base+"/start/estudo")
    pg.get_by_role("link",name="Corrigir entrega · 95").wait_for()
    # abrir o caso já entregue leva ao resultado, sem botão de refazer a prova
    pg.goto(pg.base+"/avaliacao/netflix")
    pg.get_by_role("link",name="Ver resultado e corrigir entrega").click()
    pg.get_by_role("heading",name="Resultado da avaliação · Netflix").wait_for()
    assert pg.get_by_role("link",name="Nova avaliação").count()==0 and pg.get_by_role("button",name="Abrir no modo livre").count()==0
    # editar a entrega: o laboratório abre com o desenho entregue e dá para cancelar a correção
    pg.get_by_role("button",name="Editar entrega").click()
    pg.locator(".react-flow__node-arch").first.wait_for()
    assert pg.locator(".react-flow__node-arch").count()==2
    pg.get_by_role("button",name="Cancelar correção").first.click()
    pg.get_by_role("heading",name="Resultado da avaliação · Netflix").wait_for()
    # corrigir de novo e entregar: a nova versão substitui a anterior
    pg.get_by_role("button",name="Editar entrega").click()
    pg.locator(".react-flow__node-arch").first.wait_for()
    pg.get_by_role("button",name="Entregar avaliação").first.click()
    dialog=pg.get_by_role("dialog",name="Entregar correção")
    dialog.get_by_role("button",name="Confirmar correção").click()
    pg.get_by_role("heading",name="Resultado da avaliação · Netflix").wait_for()
    pg.get_by_text("correção 1 da sua entrega").wait_for()
    assert pg.get_by_text("84",exact=True).first.is_visible()

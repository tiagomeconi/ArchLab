import re
from helpers import open_case

PT = re.compile(r"[áàâãéêíóôõúç]|\b(você|não|uma|seu|sua|está|são|pelo|pela|sobre|quando|também|ainda|cada|desenho|requisitos|falhas?|carga|leitura|escrita)\b", re.I)
JS = """() => { const out=[]; const w=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
 while(w.nextNode()){ const n=w.currentNode, t=n.nodeValue.trim(), p=n.parentElement; if(!t||!p||['SCRIPT','STYLE'].includes(p.tagName)) continue; if(getComputedStyle(p).display==='none') continue; out.push(t);}
 for (const el of document.querySelectorAll('[aria-label],[placeholder],[title]')) for (const a of ['aria-label','placeholder','title']) { const v=el.getAttribute(a); if(v) out.push(v);} return out; }"""


def portugues_restante(pg, ignorar=()):
    textos = pg.evaluate(JS)
    return sorted({t for t in textos if PT.search(t) and not any(i in t for i in ignorar)})


def test_alternar_idioma_persiste(make_page):
    pg = make_page(lang="pt")
    pg.goto(pg.base + "/start")
    pg.wait_for_selector("h1")
    assert pg.evaluate("document.documentElement.lang") == "pt-BR"
    pg.get_by_label("Mudar idioma para inglês (English)").click()
    pg.get_by_role("heading", name="What do you want to do today?").wait_for()
    assert pg.evaluate("document.documentElement.lang") == "en"
    pg.reload()
    pg.get_by_role("heading", name="What do you want to do today?").wait_for()


def test_telas_de_inicio_sem_portugues_em_ingles(make_page):
    pg = make_page(lang="en")
    for path in ("/start", "/start/estudo", "/start/livre"):
        pg.goto(pg.base + path); pg.wait_for_timeout(900)
        assert portugues_restante(pg, ignorar=["Português", "Itaú"]) == [], path


def test_laboratorio_sem_portugues_em_ingles(make_page):
    pg = make_page(lang="en")
    open_case(pg, "Netflix", lang="en")
    assert portugues_restante(pg, ignorar=["Português", "Itaú"]) == []
    pg.locator(".seg button").nth(1).click()
    for b in pg.locator(".stage-title").all(): b.click()
    assert portugues_restante(pg, ignorar=["Português", "Itaú"]) == []
    pg.locator(".seg button").nth(0).click()
    pg.get_by_role("button", name="See reference solution").click()
    pg.get_by_role("button", name="See the reference").click()
    pg.wait_for_timeout(1200)
    assert portugues_restante(pg, ignorar=["Português", "Itaú"]) == []
    pg.locator(".ovr-chip").click()
    assert pg.get_by_role("dialog", name="Design overall").is_visible()
    assert portugues_restante(pg, ignorar=["Português", "Itaú"]) == []
    pg.keyboard.press("Escape")
    pg.get_by_label("Keyboard shortcuts").first.click()
    assert portugues_restante(pg, ignorar=["Português", "Itaú"]) == []


def test_landing_sem_portugues_em_ingles(make_page):
    pg = make_page(lang="en")
    pg.goto(pg.base + "/"); pg.wait_for_timeout(2000)
    h = pg.evaluate("document.body.scrollHeight")
    for y in range(0, h, 700):
        pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(150)
    restante = portugues_restante(pg, ignorar=["Português", "Draftbit", "Júlia", "personas.draftbit"])
    assert restante == []


def test_trocar_idioma_no_lab_preserva_o_desenho(make_page):
    pg = make_page(lang="en")
    open_case(pg, "Netflix", lang="en")
    from helpers import add_component, nodes
    add_component(pg, "CDN")
    pg.get_by_label("Switch language to Portuguese").click()
    pg.wait_for_timeout(500)
    assert nodes(pg) == 1
    assert pg.get_by_text("Verificado pelo laboratório").is_visible()

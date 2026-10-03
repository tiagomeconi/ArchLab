import re


def open_case(pg, name=None, index=0, lang="pt"):
    """Abre um caso de estudo pela tela de escolha. Sem `name`, usa o `index`-ésimo cartão."""
    pg.goto(pg.base + "/start/estudo")
    label = "Ver requisitos" if lang == "pt" else "See requirements"
    if name:
        pg.get_by_role("heading", name=name, exact=True).first.locator("xpath=ancestor::button[1]").click()
    else:
        pg.get_by_text(label).nth(index).click()
    pg.wait_for_selector(".react-flow")
    pg.wait_for_timeout(500)


def add_component(pg, label):
    """Adiciona um componente pelo botão “+” da paleta e fecha o seletor de provedor, se abrir."""
    pg.locator(".tabs button").nth(0).click()  # adicionar seleciona o nó e leva a paleta para “Propriedades”
    pg.get_by_label(re.compile(rf"^(Adicionar|Add) {re.escape(label)}$")).click(force=True)
    pg.wait_for_timeout(300)
    if pg.locator("dialog[open]").count(): pg.keyboard.press("Escape")
    pg.wait_for_timeout(200)


def nodes(pg):
    return pg.locator(".react-flow__node").count()

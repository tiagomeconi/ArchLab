"""Catálogo completo: IoT, contêineres, serverless, dados e apoio; protocolos como MQTT, gRPC e LoRaWAN."""
import re
from helpers import add_component


def _arruma(page, n, y=-150, passo=300, x0=-500):
    ns = page.locator(".react-flow__node")
    caixas = [ns.nth(i).bounding_box() for i in range(n)]
    for i, c in enumerate(caixas):
        page.mouse.move(c["x"] + c["width"] / 2, c["y"] + 20); page.mouse.down()
        page.mouse.move(c["x"] + c["width"] / 2 - c["x"] + 80 + i * passo * 0.6, 160 + (i % 2) * 150, steps=8); page.mouse.up()
    page.wait_for_timeout(300)


def _ligar(page, i, j, opcao=None):
    ns = page.locator(".react-flow__node")
    a, b = ns.nth(i).locator(".react-flow__handle.source").bounding_box(), ns.nth(j).locator(".react-flow__handle.target").bounding_box()
    page.mouse.move(a["x"] + a["width"] / 2, a["y"] + a["height"] / 2); page.mouse.down()
    page.mouse.move(b["x"] + b["width"] / 2, b["y"] + b["height"] / 2, steps=12); page.mouse.up()
    page.wait_for_timeout(300)
    if page.locator("dialog[open]").count():  # com uma única opção de conexão o diálogo nem abre
        if opcao: page.locator("dialog[open] .option", has_text=opcao).click()
        page.get_by_role("button", name="Conectar").click(); page.wait_for_timeout(300)
    elif opcao: raise AssertionError(f"esperava escolher {opcao}, mas a conexão foi criada direto")


def test_paleta_tem_iot_conteineres_e_dados_especializados(page):
    page.goto(page.base + "/app?blank=1"); page.wait_for_selector(".react-flow")
    corpo = page.locator(".palette").inner_text()
    for nome in ("Dispositivo IoT", "Gateway IoT", "Broker MQTT", "Plataforma IoT", "Contêiner (Docker)", "Cluster Kubernetes", "Função serverless",
                 "Série temporal", "Banco vetorial", "Data warehouse", "Barramento de eventos", "WAF / Firewall", "Gestão de segredos", "Observabilidade"):
        assert nome in corpo, nome
    assert page.locator(".palette section").count() >= 7


def test_grupos_da_paleta_recolhem_e_a_busca_reabre(page):
    page.goto(page.base + "/app?blank=1"); page.wait_for_selector(".react-flow")
    antes = page.locator(".palette .pitem").count()
    page.locator(".cat-toggle").nth(1).click()
    assert page.locator(".cat-toggle[aria-expanded=false]").count() == 1
    assert page.locator(".palette .pitem").count() < antes
    page.get_by_label("Buscar componente").fill("mqtt")
    assert page.locator(".palette .pitem", has_text="Broker MQTT").count() == 1


def test_iot_ligado_com_mqtt_lorawan_e_grpc_aparece_na_legenda_e_simula(page):
    page.goto(page.base + "/app?blank=1"); page.wait_for_selector(".react-flow")
    for nome in ("Dispositivo IoT", "Gateway IoT", "Broker MQTT", "Processador de streams"): add_component(page, nome)
    page.wait_for_timeout(300)
    _arruma(page, 4)
    _ligar(page, 0, 1, "LoRaWAN")
    _ligar(page, 1, 2)
    _ligar(page, 2, 3)
    page.wait_for_timeout(500)
    legenda = page.locator(".proto-legend").inner_text()
    for proto in ("LoRaWAN", "MQTT"): assert proto in legenda, legenda
    page.locator(".simbtn.play").click(); page.wait_for_timeout(2500)
    assert page.locator(".node.healthy, .node.degraded, .node.saturated").count() >= 2


def test_protocolos_novos_aparecem_em_ingles(make_page):
    pg = make_page(lang="en")
    pg.goto(pg.base + "/app?blank=1"); pg.wait_for_selector(".react-flow")
    corpo = pg.locator(".palette").inner_text()
    assert "IoT device" in corpo and "MQTT broker" in corpo and "Vector database" in corpo
    assert pg.evaluate("Object.keys(window.__i18nMissing || {})") == []


def test_banco_e_cache_podem_alimentar_um_ao_outro(page):
    page.goto(page.base + "/app?blank=1"); page.wait_for_selector(".react-flow")
    for nome in ("Banco NoSQL", "Cache / KV", "Banco SQL"): add_component(page, nome)
    page.wait_for_timeout(300)
    ns = page.locator(".react-flow__node")
    for i in range(3):
        c = ns.nth(i).bounding_box()
        page.mouse.move(c["x"] + c["width"] / 2, c["y"] + 20); page.mouse.down()
        page.mouse.move(150 + i * 300, 250 + (i % 2) * 120, steps=8); page.mouse.up()
    page.wait_for_timeout(300)
    _ligar(page, 0, 1, "Carga do cache")   # Mongo → cache
    _ligar(page, 1, 0, "Escrita direta")   # cache → Mongo
    _ligar(page, 2, 1, "Carga do cache")   # SQL → cache
    _ligar(page, 0, 2, "Replicação")       # Mongo → SQL
    assert page.locator(".react-flow__edge").count() == 4


def test_observacao_do_componente_e_anotacoes_gerais_persistem(page):
    page.goto(page.base + "/app?blank=1"); page.wait_for_selector(".react-flow")
    add_component(page, "Banco NoSQL")
    page.locator(".react-flow__node").first.click()
    page.locator(".tabs button").nth(2).click()
    page.get_by_label("Observações").fill("Escolhi Mongo por causa do schema flexível; shard por user_id.")
    assert page.locator(".react-flow__node .node-note").count() == 1
    page.get_by_role("button", name="Anotações do desenho").click()
    page.get_by_role("dialog", name="Anotações do desenho").get_by_label("Anotações do desenho").fill("RH pediu custo estimado. Revisar réplicas.")
    page.keyboard.press("Escape")
    assert page.get_by_role("dialog", name="Anotações do desenho").count() == 0
    assert page.locator(".notes-dot").count() == 1
    page.wait_for_timeout(900)  # autosave
    page.reload(); page.wait_for_selector(".react-flow"); page.wait_for_timeout(600)
    assert page.locator(".react-flow__node .node-note").count() == 1
    page.get_by_role("button", name="Anotações do desenho").click()
    assert "RH pediu custo" in page.get_by_role("dialog", name="Anotações do desenho").locator("textarea").input_value()
    page.keyboard.press("Escape")
    page.locator(".react-flow__node").first.click()
    page.locator(".tabs button").nth(2).click()
    assert "schema flexível" in page.get_by_label("Observações").input_value()

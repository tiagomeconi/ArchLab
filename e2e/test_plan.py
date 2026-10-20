import os
import pytest

# só roda com a restrição ligada: VITE_PAYWALL=on python3 -m pytest e2e/test_plan.py
pytestmark = pytest.mark.skipif(os.environ.get("VITE_PAYWALL") != "on", reason="restrição de plano desligada")


def test_plano_gratuito_bloqueia_casos_intermediarios_e_avancados(page):
    page.goto(page.base + "/start/estudo"); page.wait_for_selector("h1")
    assert page.get_by_title("Disponível na assinatura").count() > 0  # cadeado nos casos fechados
    page.get_by_role("heading", name="Rate limiter", exact=True).click()  # nível Intermediário
    page.wait_for_url("**/planos")
    assert page.get_by_role("heading", name="Planos", exact=True).count() == 1
    assert page.get_by_role("region", name="Plano Pro").count() == 1

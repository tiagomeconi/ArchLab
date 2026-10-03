/** Cache do retângulo de um elemento (evita getBoundingClientRect a cada movimento do mouse). */
export function createRectCache(el: Element): { current: DOMRect; destroy: () => void } {
  const cache = { current: el.getBoundingClientRect(), destroy: () => {} };
  const update = () => { cache.current = el.getBoundingClientRect(); };
  const ro = new ResizeObserver(update);
  ro.observe(el);
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  cache.destroy = () => { ro.disconnect(); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  return cache;
}

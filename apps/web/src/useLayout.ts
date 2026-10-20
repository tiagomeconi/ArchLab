import { useEffect, useState } from "react";

/**
 * Como o laboratório se organiza no aparelho:
 * - `sheet`: celular e tablet em pé (< 1024 px). Tela toda é o canvas; os painéis viram gavetas que sobem de baixo, com uma barra de navegação.
 * - `dock`: tablet deitado e computador (≥ 1024 px). Painéis laterais fixos; em toque, com alvos maiores.
 * `phone` (< 768 px) é um caso do `sheet` com tudo mais compacto; `touch` diz se o ponteiro principal é o dedo.
 */
export interface Layout { sheet: boolean; phone: boolean; touch: boolean }
const Q = { sheet: "(max-width: 1023px)", phone: "(max-width: 767px)", touch: "(pointer: coarse)" } as const;
const read = (): Layout => (typeof matchMedia === "undefined" ? { sheet: false, phone: false, touch: false }
  : { sheet: matchMedia(Q.sheet).matches, phone: matchMedia(Q.phone).matches, touch: matchMedia(Q.touch).matches });

export function useLayout(): Layout {
  const [l, setL] = useState<Layout>(read);
  useEffect(() => {
    const ms = Object.values(Q).map((q) => matchMedia(q)); const on = () => setL(read());
    ms.forEach((m) => m.addEventListener("change", on)); on();
    return () => ms.forEach((m) => m.removeEventListener("change", on));
  }, []);
  return l;
}

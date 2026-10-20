/** Formato do tráfego durante a simulação: o multiplicador do controle "Tráfego" é o pico; o formato diz como a carga chega a ele. */
export type Shape = "flat" | "spike" | "daily" | "ramp";
export const SHAPES: { id: Shape; label: string }[] = [
  { id: "flat", label: "Constante" }, { id: "spike", label: "Pico repentino" }, { id: "daily", label: "Ciclo diário" }, { id: "ramp", label: "Crescimento" },
];
/** Multiplicador da carga no segundo `t` de uma simulação de `duration` segundos. */
export function shapeFactor(shape: Shape, t: number, duration = 300): number {
  const x = Math.min(1, Math.max(0, t / duration));
  switch (shape) {
    case "spike": { // carga normal, salta para 3× entre 1/3 e 1/2 do tempo, com subida e descida de ~10 s
      const a = duration / 3, b = duration / 2, edge = 10;
      const up = Math.min(1, Math.max(0, (t - a) / edge)), down = Math.min(1, Math.max(0, (b - t) / edge));
      return 1 + 2 * Math.min(up, down);
    }
    case "daily": return 0.35 + 0.65 * (0.5 - 0.5 * Math.cos(2 * Math.PI * x)); // vale → pico no meio → vale
    case "ramp": return 0.25 + 1.25 * x; // cresce de 25% até 150% do valor do controle
    default: return 1;
  }
}

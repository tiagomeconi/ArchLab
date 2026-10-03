// Gera src/landing/avatars.generated.ts: avatares ILUSTRADOS (DiceBear, estilo "personas") para as personas da landing.
// São ilustrações, não fotos de pessoas reais. Rode: pnpm --filter @archlab/web gen:avatars
import { createAvatar } from "@dicebear/core";
import * as collection from "@dicebear/collection";
import { writeFileSync } from "node:fs";

const style = collection[process.argv[2] || "personas"];
const PEOPLE = { Ana: "b6e3f4", Bruno: "c0aede", Carla: "ffd5dc", Marina: "d1f4d9", Rafael: "ffdfbf", "Júlia": "c7f0e6", Tiago: "cfe0ff", Diego: "e6d4ff" };
const out = {};
for (const [name, bg] of Object.entries(PEOPLE)) {
  // expressões neutras/simpáticas e sem chupeta, para ficar com cara de perfil profissional
  out[name] = createAvatar(style, { seed: name, backgroundColor: [bg], radius: 50, size: 96, mouth: ["smile", "bigSmile", "smirk"], eyes: ["open", "happy", "glasses"] }).toString();
}
writeFileSync(new URL("../src/landing/avatars.generated.ts", import.meta.url),
  `// GERADO por scripts/gen-avatars.mjs — não editar à mão. Ilustrações DiceBear (estilo personas).\nexport const AVATARS: Record<string, string> = ${JSON.stringify(out)};\n`);
console.log("avatares:", Object.keys(out).length, "| ~", Math.round(JSON.stringify(out).length / 1024), "KB");

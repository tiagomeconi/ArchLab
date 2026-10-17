// Pré-compila o JSON Schema em código (Ajv standalone). Assim o app não precisa de `new Function` em tempo de execução
// e a CSP pode proibir `unsafe-eval`. Rode após qualquer mudança em src/architecture.schema.json.
import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const here = (p) => new URL(`../${p}`, import.meta.url);
export function build() {
  const schema = JSON.parse(readFileSync(here("src/architecture.schema.json"), "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false, code: { source: true, esm: true } });
  const code = standaloneCode(ajv, ajv.compile(schema)).replaceAll('require("ajv/dist/runtime/ucs2length").default', "ucs2length"); // o navegador não resolve require
  if (code.includes("require(")) throw new Error("o validador gerado ainda usa require()");
  return `// GERADO por scripts/gen-validator.mjs a partir de architecture.schema.json. Não edite à mão.\n// @ts-nocheck\nimport ucs2length from "ajv/dist/runtime/ucs2length.js";\n${code}`;
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) writeFileSync(here("src/validate.generated.js"), build());

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
// @ts-expect-error módulo .mjs sem tipos
import { build } from "../scripts/gen-validator.mjs";

describe("validador pré-compilado", () => {
  it("está em dia com architecture.schema.json (rode `npm run gen:validator` em packages/domain se falhar)", () => {
    expect(readFileSync(new URL("../src/validate.generated.js", import.meta.url), "utf8")).toBe(build());
  });
  it("não usa eval nem new Function (a CSP do site proíbe unsafe-eval)", () => {
    const code = readFileSync(new URL("../src/validate.generated.js", import.meta.url), "utf8");
    expect(code).not.toMatch(/new Function|\beval\(|require\(/);
  });
});

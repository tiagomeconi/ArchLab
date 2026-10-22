import { build } from 'vite';
import { countries } from 'country-flag-icons';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { writeFile, readFile } from 'node:fs/promises';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const out = resolve(root, 'supabase/functions/_shared');
const result = await build({ configFile: false, root: resolve(root, 'apps/web'), logLevel: 'warn', resolve: { alias: [{ find: /^\.\/i18n$/, replacement: resolve(out, 'server-i18n.ts') }] }, build: { copyPublicDir: false, write: false, emptyOutDir: false, minify: false, target: 'es2022', outDir: out, lib: { entry: resolve(root, 'apps/web/src/assessmentEvaluator.ts'), formats: ['es'], fileName: () => 'evaluator-v1.generated.mjs' } } });
const code = (Array.isArray(result) ? result : [result]).flatMap((entry) => entry.output).find((chunk) => chunk.type === 'chunk').code;
const target = resolve(out,'evaluator-v1.generated.mjs');
let previous;try { previous = await readFile(target,'utf8'); } catch {}
if (previous && previous !== code && !process.argv.includes('--update-unreleased')) throw new Error('Released evaluators must remain frozen. Create a new rule version instead. --update-unreleased is only for development before release.');
await writeFile(target,code);
const { COMPANY_CONFIGS, ASSESSMENT_RULES } = await import(new URL('../../../supabase/functions/_shared/evaluator-v1.generated.mjs', import.meta.url));
const quote = (v) => "'" + String(v).replaceAll("'", "''") + "'";
const sql = Object.entries(COMPANY_CONFIGS).map(([id,c]) => `(${quote(id)},${quote(c.title)},${quote(c.version)})`).join(',\n');
await writeFile(resolve(root, 'supabase/migrations/0009_assessment_companies.sql'), `-- Generated catalog for ${ASSESSMENT_RULES}; preserve after release.\ninsert into public.assessment_companies(case_id,title,case_version) values\n${sql}\non conflict (case_id) do nothing;\n`);
await writeFile(resolve(root, 'supabase/migrations/0010_assessment_countries.sql'), '-- Supported two-letter countries and territories.\ninsert into public.assessment_countries(code) values\n'+countries.filter(c=>/^[A-Z]{2}$/.test(c)).map(c=>`('${c}')`).join(',')+'\non conflict do nothing;\n');
console.log('Versioned evaluator and catalogs verified.');

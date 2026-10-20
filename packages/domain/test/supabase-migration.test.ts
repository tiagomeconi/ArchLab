import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../../../supabase/migrations/", import.meta.url);
const sql = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort().map((f) => readFileSync(new URL(f, dir), "utf8")).join("\n");
const tables = [...sql.matchAll(/create table if not exists public\.(\w+)/g)].map((m) => m[1]!);

describe("migração do Supabase", () => {
  it("toda tabela tem RLS ligada e nenhuma policy para anon", () => {
    expect(tables.length).toBeGreaterThanOrEqual(5);
    for (const t of tables) expect(new RegExp(`alter table public\\.${t}\\s+enable row level security`).test(sql), t).toBe(true);
    expect(/\bto\s+(anon|public)\b(?!\.)/.test(sql.replace(/revoke all on function[^;]*;/g, "").replace(/grant execute on function public\.get_public_profile\(text\) to anon, authenticated;/g, ""))).toBe(false);
  });
  it("toda policy compara com o usuário logado", () => {
    const policies = sql.split("create policy").slice(1);
    for (const p of policies) expect(p).toContain("auth.uid()");
  });
  it("o perfil público só sai por função, desligado por padrão, sem e-mail nem nascimento", () => {
    expect(sql).toContain("is_public boolean not null default false");
    const fn = /create or replace function public\.get_public_profile[\s\S]*?end \$\$;/.exec(sql)![0];
    expect(fn).toContain("and is_public"); expect(fn).not.toMatch(/birth_date|email|snap/);
    expect(sql).toContain("grant execute on function public.get_public_profile(text) to anon, authenticated");
  });
  it("ranking e exclusão de conta: só para quem está logado, e a exclusão apaga apenas a própria conta", () => {
    for (const f of ["get_leaderboard(int)", "get_my_rank()", "delete_my_account()"]) {
      expect(sql, f).toContain(`revoke all on function public.${f} from public, anon`);
      expect(sql, f).toContain(`grant execute on function public.${f} to authenticated`);
    }
    const del = /create or replace function public\.delete_my_account[\s\S]*?end \$\$;/.exec(sql)![0];
    expect(del).toContain("where id = auth.uid()"); expect(del).toContain("auth.uid() is null");
    const board = /create or replace function public\.get_leaderboard[\s\S]*?\$\$;/.exec(sql)![0];
    expect(board).toContain("where p.is_public"); expect(board).not.toMatch(/birth_date|email|snap/);
  });
  it("a frase do perfil tem limite e a versão mais nova do perfil público não vaza dados privados", () => {
    expect(sql).toContain("char_length(bio) <= 160");
    const fns = [...sql.matchAll(/create or replace function public\.get_public_profile[\s\S]*?end \$\$;/g)].map((m) => m[0]);
    expect(fns.length).toBeGreaterThanOrEqual(2); const last = fns[fns.length - 1]!;
    expect(last).toContain("'bio', p.bio"); expect(last).toContain("and is_public"); expect(last).not.toMatch(/birth_date|email|snap/);
  });
  it("a função de leitura de link compartilhado não é pública", () => {
    expect(sql).toContain("revoke all on function public.get_shared_design(uuid) from public, anon");
  });
});

describe("turmas", () => {
  it("entrar só pela função, e o progresso só sai para quem criou a turma", () => {
    expect(sql).not.toMatch(/create policy "[^"]*" on public\.class_members for insert/);
    const join = /create or replace function public\.join_class[\s\S]*?end \$\$;/.exec(sql)![0];
    expect(join).toContain("auth.uid() is null"); expect(join).toContain("join_code = upper(btrim(code))");
    const prog = /create or replace function public\.class_progress[\s\S]*?end \$\$;/.exec(sql)![0];
    expect(prog).toContain("is_class_owner(cid, auth.uid())"); expect(prog).toContain("a.class_id = cid"); expect(prog).not.toMatch(/birth_date|email|snap/);
    for (const f of ["join_class(text)", "class_progress(uuid)", "is_class_owner(uuid, uuid)", "is_class_member(uuid, uuid)"]) {
      expect(sql, f).toContain(`revoke all on function public.${f} from public, anon`);
      expect(sql, f).toContain(`grant execute on function public.${f} to authenticated`);
    }
  });
});

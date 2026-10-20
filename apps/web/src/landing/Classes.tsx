import { useCallback, useEffect, useState, type FormEvent } from "react";
import "./landing.css";
import { CASES, COMPANY_CASES, caseById } from "../cases";
import { addAssignment, classProgress, createClass, deleteClass, JOIN_CODE, joinClass, leaveClass, listAssignments, listClasses, normalizeCode, removeAssignment, removeStudent, studentLabel, type Assignment, type ClassRow, type Student } from "../classes";
import { loadProgress } from "../progress";
import { useAuth } from "../auth";
import { Icon } from "../ui";
import { t, useLang } from "../i18n";
import { openCase } from "./Start";

const field = "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-text-2/60 focus:border-accent";
const btn = "inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60";
const ALL = [...COMPANY_CASES, ...CASES];
const errText = (e: unknown) => {
  const m = String((e as { message?: string })?.message ?? e).toLowerCase();
  return m.includes("invalid code") ? t("Código não encontrado. Confira com quem criou a turma.") : m.includes("duplicate") ? t("Esse caso já está na turma.") : t("Não foi possível concluir. Tente de novo");
};

/** Turmas: quem ensina cria a turma, atribui casos e acompanha o progresso; quem estuda entra pelo código e vê o que foi atribuído. */
export function Classes() {
  useLang();
  const auth = useAuth(); const uid = auth.user?.id ?? "";
  const [list, setList] = useState<ClassRow[] | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [name, setName] = useState(""); const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const reload = useCallback(async () => { try { setList(await listClasses(uid)); } catch (e) { setErr(errText(e)); setList([]); } }, [uid]);
  useEffect(() => { if (uid) void reload(); }, [uid, reload]);

  const create = async (e: FormEvent) => {
    e.preventDefault(); if (busy || !name.trim()) return; setBusy(true); setErr("");
    try { const id = await createClass(name); setName(""); await reload(); setSel(id); } catch (x) { setErr(errText(x)); } finally { setBusy(false); }
  };
  const join = async (e: FormEvent) => {
    e.preventDefault(); if (busy) return;
    if (!JOIN_CODE.test(normalizeCode(code))) { setErr(t("O código tem 8 letras ou números.")); return; }
    setBusy(true); setErr("");
    try { const id = await joinClass(code); setCode(""); await reload(); setSel(id); } catch (x) { setErr(errText(x)); } finally { setBusy(false); }
  };

  const current = list?.find((c) => c.id === sel);
  return (
    <>
      <h1 className="text-balance text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.024em]">{t("Turmas")}</h1>
      <p className="mt-2 max-w-2xl text-lg leading-snug text-text-2">{t("Crie uma turma para atribuir casos e acompanhar o progresso, ou entre na turma de quem está ensinando você.")}</p>
      <div className="mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
        <form onSubmit={create} className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="font-semibold">{t("Criar uma turma")}</h2>
          <label className="mt-3 grid gap-1.5 text-sm font-medium">{t("Nome da turma")}
            <input className={field} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder={t("Ex.: Backend 2026.1")} /></label>
          <button className={`${btn} mt-4`} disabled={busy || !name.trim()}><Icon name="add" size={16} />{t("Criar turma")}</button>
        </form>
        <form onSubmit={join} className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="font-semibold">{t("Entrar numa turma")}</h2>
          <label className="mt-3 grid gap-1.5 text-sm font-medium">{t("Código da turma")}
            <input className={`${field} uppercase tracking-widest`} value={code} maxLength={12} onChange={(e) => setCode(e.target.value)} placeholder="AB12CD34" autoComplete="off" /></label>
          <p className="mt-2 text-xs leading-snug text-text-2">{t("Ao entrar, quem criou a turma passa a ver o seu progresso nos casos atribuídos (e só neles).")}</p>
          <button className={`${btn} mt-4`} disabled={busy || !code.trim()}><Icon name="login" size={16} />{t("Entrar")}</button>
        </form>
      </div>
      <div aria-live="polite" className="mt-3 min-h-5 text-sm">{err && <p role="alert" className="text-danger">{err}</p>}</div>

      <h2 className="mt-6 text-xl font-semibold tracking-tight">{t("Suas turmas")}</h2>
      {list === null ? <p className="mt-3 text-text-2">{t("Aguarde…")}</p> : list.length === 0 ? <p className="mt-3 text-text-2">{t("Você ainda não participa de nenhuma turma.")}</p> : (
        <ul className="mt-4 grid max-w-4xl gap-2">
          {list.map((c) => (
            <li key={c.id}>
              <button onClick={() => setSel(c.id === sel ? null : c.id)} aria-expanded={c.id === sel}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${c.id === sel ? "border-accent bg-accent-soft" : "border-line bg-surface hover:bg-track"}`}>
                <Icon name="groups" size={22} /><b className="flex-1 truncate">{c.name}</b>
                <span className="rounded-full bg-track px-2.5 py-0.5 text-xs font-semibold text-text-2">{c.owner ? t("Você ensina") : t("Você estuda")}</span>
              </button>
              {c.id === sel && current && <ClassDetail key={current.id} c={current} uid={uid} onGone={() => { setSel(null); void reload(); }} />}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ClassDetail({ c, uid, onGone }: { c: ClassRow; uid: string; onGone: () => void }) {
  const [assign, setAssign] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [pick, setPick] = useState(""); const [err, setErr] = useState(""); const [copied, setCopied] = useState(false);
  const mine = loadProgress();
  const load = useCallback(async () => {
    try { setAssign(await listAssignments(c.id)); if (c.owner) setStudents(await classProgress(c.id)); } catch (e) { setErr(errText(e)); }
  }, [c.id, c.owner]);
  useEffect(() => { void load(); }, [load]);
  const run = async (fn: () => Promise<unknown>) => { setErr(""); try { await fn(); await load(); } catch (e) { setErr(errText(e)); } };
  const free = ALL.filter((x) => !assign.some((a) => a.caseId === x.id));
  const copy = async () => { try { await navigator.clipboard.writeText(c.joinCode); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* sem permissão */ } };
  const icon = (s?: { status: string; ovr: number | null }) => !s || s.status === "none" ? <span className="text-text-2" aria-label={t("Não começou")}>—</span>
    : s.status === "done" ? <span className="inline-flex items-center gap-1 font-semibold text-ok"><Icon name="check_circle" size={16} />{s.ovr ?? ""}</span> : <span className="font-semibold text-warn">{t("Em andamento")}</span>;

  return (
    <section className="mt-2 rounded-2xl border border-line bg-surface p-5" aria-label={c.name}>
      {c.owner && (
        <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
          <span className="text-sm text-text-2">{t("Código para os alunos entrarem")}:</span>
          <b className="rounded-lg bg-track px-3 py-1 font-mono text-lg tracking-widest">{c.joinCode}</b>
          <button className="text-sm font-semibold text-accent hover:underline" onClick={copy}>{copied ? t("Copiado") : t("Copiar")}</button>
        </div>
      )}
      <div aria-live="polite" className="min-h-5 text-sm">{err && <p role="alert" className="text-danger">{err}</p>}</div>

      <h3 className="mt-2 text-base font-semibold">{t("Casos atribuídos")}</h3>
      {assign.length === 0 ? <p className="mt-2 text-sm text-text-2">{c.owner ? t("Nenhum caso ainda. Escolha abaixo o que a turma deve fazer.") : t("Quem ensina ainda não atribuiu casos.")}</p> : (
        <ul className="mt-2 grid gap-1.5">
          {assign.map((a) => {
            const cs = caseById(a.caseId); const p = mine[a.caseId];
            return (
              <li key={a.caseId} className="flex items-center gap-3 rounded-xl bg-track/50 px-3 py-2">
                <b className="flex-1 truncate text-sm">{t(cs?.company?.name ?? cs?.title ?? a.caseId)}</b>
                {!c.owner && icon(p ? { status: p.status === "done" ? "done" : "started", ovr: p.ovr ?? null } : undefined)}
                {cs && <button className="text-sm font-semibold text-accent hover:underline" onClick={() => openCase(cs)}>{t("Abrir")}</button>}
                {c.owner && <button className="text-text-2 hover:text-danger" aria-label={`${t("Remover")}: ${cs?.title ?? a.caseId}`} onClick={() => run(() => removeAssignment(c.id, a.caseId))}><Icon name="close" size={16} /></button>}
              </li>
            );
          })}
        </ul>
      )}
      {c.owner && (
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (pick) void run(async () => { await addAssignment(c.id, pick); setPick(""); }); }}>
          <select className={field} value={pick} onChange={(e) => setPick(e.target.value)} aria-label={t("Escolher caso para atribuir")}>
            <option value="">{t("Escolha um caso…")}</option>
            {free.map((x) => <option key={x.id} value={x.id}>{t(x.company?.name ?? x.title)} · {t(x.level)}</option>)}
          </select>
          <button className={btn} disabled={!pick}>{t("Atribuir")}</button>
        </form>
      )}

      {c.owner && (
        <>
          <h3 className="mt-6 text-base font-semibold">{t("Progresso dos alunos")}</h3>
          {students.length === 0 ? <p className="mt-2 text-sm text-text-2">{t("Ninguém entrou ainda. Passe o código para os alunos.")}</p> : assign.length === 0 ? <p className="mt-2 text-sm text-text-2">{students.length} {t("alunos na turma")}.</p> : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead><tr className="text-left text-xs text-text-2"><th className="py-1.5 pr-3 font-medium">{t("Aluno")}</th>{assign.map((a) => <th key={a.caseId} className="px-2 py-1.5 font-medium">{t(caseById(a.caseId)?.company?.name ?? caseById(a.caseId)?.title ?? a.caseId)}</th>)}<th /></tr></thead>
                <tbody>{students.map((s, i) => (
                  <tr key={s.userId} className="border-t border-line">
                    <td className="py-2 pr-3 font-medium">{studentLabel(s, i, t("Aluno"))}</td>
                    {assign.map((a) => <td key={a.caseId} className="px-2 py-2">{icon(s.cells[a.caseId])}</td>)}
                    <td className="text-right"><button className="text-text-2 hover:text-danger" aria-label={`${t("Remover aluno")}: ${studentLabel(s, i, t("Aluno"))}`} onClick={() => run(() => removeStudent(c.id, s.userId))}><Icon name="person_remove" size={16} /></button></td>
                  </tr>))}</tbody>
              </table>
            </div>
          )}
        </>
      )}
      <div className="mt-6 border-t border-line pt-4">
        {c.owner
          ? <button className="text-sm font-semibold text-danger hover:underline" onClick={() => { if (confirm(t("Excluir a turma? Os alunos deixam de vê-la."))) run(async () => { await deleteClass(c.id); onGone(); }); }}>{t("Excluir turma")}</button>
          : <button className="text-sm font-semibold text-danger hover:underline" onClick={() => { if (confirm(t("Sair da turma? Quem ensina deixa de ver o seu progresso."))) run(async () => { await leaveClass(c.id, uid); onGone(); }); }}>{t("Sair da turma")}</button>}
      </div>
    </section>
  );
}

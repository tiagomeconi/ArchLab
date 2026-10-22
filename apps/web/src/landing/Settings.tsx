import { useEffect, useRef, useState, type FormEvent } from "react";
import { authEnabled, authMessage, avatarOf, removeAvatar, setNewPassword, updateAccount, uploadAvatar, useAuth, signOut, verifyPassword } from "../auth";
import { prepareAvatar } from "../avatar";
import { birthError, fullNameOk, handleError, passwordOk, sanitizeHandle } from "../account";
import { deleteAccount, exportMyData, fetchProfile, saveCountry, savePublicSettings, type Profile as ProfileData } from "../cloud";
import { go, link } from "../nav";
import { CountrySelect } from "./CountrySelect";
import { DatePicker } from "./DatePicker";
import { Avatar } from "../AccountMenu";
import { Icon } from "../ui";
import { t, useLang } from "../i18n";
import { field, PasswordChecklist, PasswordInput } from "./AuthShell";

const card = "rounded-2xl border border-line bg-surface p-6";

/** Configurações da conta: foto, dados pessoais, perfil público, senha, privacidade e exclusão. A vitrine (liga, conquistas) fica em /perfil. */
export function Settings() {
  useLang();
  const auth = useAuth();
  const user = auth.user;
  const meta = user?.user_metadata ?? {};
  const [country, setCountry] = useState("");
  const [countryMsg, setCountryMsg] = useState("");
  const [countryBusy, setCountryBusy] = useState(false);
  const [loaded, setLoaded] = useState<ProfileData | null>(null);
  const [name, setName] = useState(String(meta.name ?? "")); const [birth, setBirth] = useState(String(meta.birth_date ?? "")); const [bio, setBio] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null); const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState(""); const [pmsg, setPmsg] = useState<{ ok: boolean; text: string } | null>(null); const [pbusy, setPbusy] = useState(false);
  const [handle, setHandle] = useState(""); const [isPublic, setIsPublic] = useState(false);
  const [pubMsg, setPubMsg] = useState<{ ok: boolean; text: string } | null>(null); const [pubBusy, setPubBusy] = useState(false); const [copied, setCopied] = useState(false);
  const [dataBusy, setDataBusy] = useState(false); const [dataMsg, setDataMsg] = useState("");
  const [delOpen, setDelOpen] = useState(false); const [delPw, setDelPw] = useState(""); const [delWord, setDelWord] = useState(""); const [delBusy, setDelBusy] = useState(false); const [delMsg, setDelMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoBusy, setPhotoBusy] = useState(false); const [photoMsg, setPhotoMsg] = useState("");
  const photo = avatarOf(user);

  const pickPhoto = async (f: File | undefined) => {
    if (!f || photoBusy) return;
    setPhotoBusy(true); setPhotoMsg("");
    try { await uploadAvatar(await prepareAvatar(f)); }
    catch (x) {
      const m = (x as Error).message;
      setPhotoMsg(t(m === "tipo" ? "Use uma imagem JPG, PNG ou WebP." : m === "tamanho" ? "A imagem é grande demais (máximo de 8 MB)." : m === "ilegivel" ? "Não foi possível ler essa imagem." : "Não foi possível enviar a foto. Tente de novo."));
    } finally { setPhotoBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };
  const dropPhoto = async () => { if (photoBusy) return; setPhotoBusy(true); setPhotoMsg(""); try { await removeAvatar(); } catch { setPhotoMsg(t("Não foi possível remover a foto. Tente de novo.")); } finally { setPhotoBusy(false); } };

  useEffect(() => { if (!authEnabled) go("/start"); }, []);
  useEffect(() => { fetchProfile().then((p) => { if (!p) return; setLoaded(p); setName(p.fullName || String(meta.name ?? "")); setBirth(p.birthDate); setBio(p.bio); setHandle(p.handle); setIsPublic(p.isPublic); setCountry(p.country || ""); }); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);
  useEffect(() => { const id = location.hash.slice(1); if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 350); }, []);
  if (!user) return null;
  const email = user.email ?? "";
  const dirty = name.trim().replace(/\s+/g, " ") !== (loaded?.fullName ?? String(meta.name ?? "")) || birth !== (loaded?.birthDate ?? String(meta.birth_date ?? "")) || bio.trim() !== (loaded?.bio ?? "");

  const save = async (e: FormEvent) => {
    e.preventDefault(); if (saving) return;
    const bad = !fullNameOk(name) ? "Informe seu nome completo (nome e sobrenome)" : birthError(birth);
    if (bad) { setMsg({ ok: false, text: t(bad) }); return; }
    setSaving(true); setMsg(null);
    try {
      const clean = name.trim().replace(/\s+/g, " "); await updateAccount(clean, birth, bio.trim()); setName(clean);
      setLoaded((l) => ({ handle: "", isPublic: false, ...l, fullName: clean, birthDate: birth, bio: bio.trim(), createdAt: l?.createdAt ?? "" })); setMsg({ ok: true, text: t("Dados salvos.") });
    } catch (x) { setMsg({ ok: false, text: t(authMessage(x)) }); }
    finally { setSaving(false); }
  };
  const publicUrl = `${location.origin}/u/${handle}`;
  const savePublic = async (e: FormEvent) => {
    e.preventDefault(); if (pubBusy) return;
    if (isPublic && !handle) { setPubMsg({ ok: false, text: t("Escolha um @usuário para publicar o perfil.") }); return; }
    const bad = handle ? handleError(handle) : null;
    if (bad) { setPubMsg({ ok: false, text: t(bad) }); return; }
    setPubBusy(true); setPubMsg(null);
    const r = await savePublicSettings(handle, isPublic);
    if (r === "ok") { setLoaded((l) => ({ fullName: "", birthDate: "", bio: "", createdAt: "", ...l, handle, isPublic: isPublic && !!handle })); setPubMsg({ ok: true, text: isPublic ? t("Perfil público publicado.") : t("Perfil público desligado.") }); }
    else setPubMsg({ ok: false, text: t(r === "taken" ? "Esse @usuário já está em uso." : r === "invalid" ? "Esse @usuário não é válido." : "Não foi possível salvar. Tente de novo.") });
    setPubBusy(false);
  };
  const copyPublic = async () => { try { await navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { window.prompt(t("Copie o link do perfil:"), publicUrl); } };
  const downloadData = async () => {
    if (dataBusy) return; setDataBusy(true); setDataMsg("");
    const d = await exportMyData();
    if (!d) setDataMsg(t("Não foi possível reunir os seus dados. Tente de novo."));
    else { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: "application/json" })); a.download = "archlab-meus-dados.json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); setDataMsg(t("Arquivo gerado.")); }
    setDataBusy(false);
  };
  const confirmWord = t("excluir minha conta"); // como no GitHub: a frase inteira, exatamente como aparece
  const removeAccount = async (e: FormEvent) => {
    e.preventDefault(); if (delBusy) return;
    if (delWord.trim() !== confirmWord) { setDelMsg(t("A frase não confere. Digite exatamente: {palavra}", { palavra: confirmWord })); return; }
    setDelBusy(true); setDelMsg("");
    try { await verifyPassword(delPw); } catch { setDelMsg(t("Senha incorreta.")); setDelBusy(false); return; }
    if (!(await deleteAccount())) { setDelMsg(t("Não foi possível excluir a conta. Nada foi apagado; tente de novo.")); setDelBusy(false); return; }
    await signOut(); location.assign("/?conta=excluida");
  };
  const changePw = async (e: FormEvent) => {
    e.preventDefault(); if (pbusy) return;
    if (!passwordOk(pw)) { setPmsg({ ok: false, text: t("A senha não atende aos requisitos de segurança") }); return; }
    if (pw !== pw2) { setPmsg({ ok: false, text: t("As senhas não coincidem") }); return; }
    setPbusy(true); setPmsg(null);
    try { await setNewPassword(pw); setPw(""); setPw2(""); setPmsg({ ok: true, text: t("Senha alterada.") }); }
    catch (x) { setPmsg({ ok: false, text: t(authMessage(x)) }); }
    finally { setPbusy(false); }
  };
  const Note = ({ m }: { m: { ok: boolean; text: string } | null }) => <div aria-live="polite" className="min-h-5 text-sm">{m && <p role={m.ok ? "status" : "alert"} className={m.ok ? "text-text-2" : "text-danger"}>{m.text}</p>}</div>;
  const btn = "rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60";

  return (
    <div className="mx-auto max-w-3xl">
      <a {...link("/perfil")} className="inline-flex items-center gap-1.5 text-sm font-medium text-text-2 hover:text-text"><Icon name="arrow_back" size={18} />{t("Voltar ao perfil")}</a>
      <h1 className="mt-3 text-balance text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.024em]">{t("Configurações")}</h1>
      <p className="mt-2 text-lg leading-snug text-text-2">{t("Foto, dados pessoais, perfil público, senha e privacidade.")}</p>

      <section id="foto" className={`${card} mt-8 flex flex-wrap items-center gap-5 scroll-mt-24`} aria-label={t("Foto de perfil")}>
        <div className="flex flex-col items-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={photoBusy} aria-label={photo ? t("Trocar foto de perfil") : t("Adicionar foto de perfil")}
            className="group relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
            <Avatar name={name || String(meta.name ?? "")} email={email} src={photo} size={88} />
            <span className={`absolute inset-0 grid place-items-center rounded-full bg-black/50 text-white transition-opacity duration-200 ${photoBusy ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}><Icon name={photoBusy ? "hourglass_top" : "photo_camera"} size={26} /></span>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => void pickPhoto(e.target.files?.[0])} />
          {photo && <button type="button" onClick={() => void dropPhoto()} disabled={photoBusy} className="text-xs font-medium text-text-2 transition-colors hover:text-danger">{t("Remover foto")}</button>}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">{t("Foto de perfil")}</h2>
          <p className="text-sm text-text-2">{t("Aparece no seu perfil, no ranking e nos cartões. JPG, PNG ou WebP.")}</p>
          <div aria-live="polite" className="min-h-4 text-xs text-danger">{photoMsg}</div>
        </div>
      </section>

      <section className={`${card} mt-6`}>
        <h2 className="text-lg font-semibold">{t("Dados pessoais")}</h2>
        <form onSubmit={save} className="mt-4 grid gap-4" noValidate>
          <label className="grid gap-1.5 text-sm font-medium">{t("Nome completo")}
            <input className={field} type="text" autoComplete="name" required maxLength={120} value={name} onChange={(e) => { setName(e.target.value); setMsg(null); }} />
          </label>
          <div className="grid gap-1.5 text-sm font-medium"><label htmlFor="birth">{t("Data de nascimento")}</label>
            <DatePicker id="birth" autoComplete="bday" value={birth} onChange={(v) => { setBirth(v); setMsg(null); }} />
          </div>
          <div className="grid gap-1.5 text-sm font-medium"><label htmlFor="bio">{t("Sobre você")} <span className="font-normal text-text-2">({t("opcional")})</span></label>
            <textarea id="bio" className={`${field} min-h-20 resize-y`} maxLength={160} rows={2} value={bio} placeholder={t("Uma frase curta que aparece no seu perfil. Ex.: Backend, fã de filas e caches.")} onChange={(e) => { setBio(e.target.value); setMsg(null); }} />
            <span className="text-xs font-normal text-text-2">{bio.length}/160</span></div>
          <label className="grid gap-1.5 text-sm font-medium">{t("E-mail")}
            <input className={`${field} opacity-70`} type="email" value={email} readOnly aria-describedby="mail-hint" />
            <span id="mail-hint" className="text-xs font-normal text-text-2">{t("O e-mail é o seu login e não pode ser alterado aqui.")}</span>
          </label>
          <Note m={msg} />
          <div><button type="submit" disabled={saving || !dirty} className={btn}>{saving ? t("Aguarde…") : t("Salvar alterações")}</button></div>
        </form>
      </section>

      <section className={`${card} mt-6`} aria-label={t("País do ranking")}><h2 className="text-lg font-semibold">{t("País do ranking")}</h2><p className="mt-2 text-sm text-text-2">{t("País autodeclarado. Após a primeira avaliação aprovada, o país daquela temporada permanece fixo; mudanças valem para temporadas futuras.")}</p><div className="mt-4"><CountrySelect value={country} onChange={setCountry} /></div><button type="button" disabled={!country || countryBusy} className={`${btn} mt-4`} onClick={async () => { setCountryBusy(true); setCountryMsg(""); const ok = await saveCountry(country); setCountryMsg(t(ok ? "País salvo." : "Não foi possível salvar o país.")); setCountryBusy(false); }}>{t("Salvar país")}</button><p role="status" className="mt-3 text-sm text-text-2">{countryMsg}</p></section>

      <section id="publico" className={`${card} mt-6 scroll-mt-24`} aria-label={t("Perfil público")}>
        <h2 className="text-lg font-semibold">{t("Perfil público")}</h2>
        <p className="mt-1 text-sm text-text-2">{t("Ganhe um endereço para mostrar seus pontos, avaliações e conquistas. O perfil público permite participar dos rankings.")}</p>
        <form onSubmit={savePublic} className="mt-5 grid gap-4" noValidate>
          <div className="grid gap-1.5 text-sm font-medium"><label htmlFor="handle">{t("Seu @usuário")}</label>
            <div className="flex items-center rounded-xl border border-line bg-surface focus-within:border-accent">
              <span className="select-none pl-3.5 text-sm text-text-2" aria-hidden>{location.host}/u/</span>
              <input id="handle" className="min-w-0 flex-1 py-2.5 pr-3.5 pl-0.5 text-sm outline-none" style={{ border: 0, background: "transparent", boxShadow: "none", borderRadius: 0 }} value={handle} maxLength={20} autoComplete="off" spellCheck={false} placeholder="seu_usuario" onChange={(e) => { setHandle(sanitizeHandle(e.target.value)); setPubMsg(null); }} />
            </div>
            <span className="text-xs font-normal text-text-2">{t("De 3 a 20 letras minúsculas, números ou _.")}</span>
          </div>
          <div className="flex items-start gap-3.5">
            <button type="button" role="switch" aria-checked={isPublic} aria-labelledby="pub-label" onClick={() => { setIsPublic((v) => !v); setPubMsg(null); }}
              className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${isPublic ? "bg-accent" : "bg-track"}`}>
              <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${isPublic ? "translate-x-5" : ""}`} />
            </button>
            <div className="text-sm"><b id="pub-label" className="block">{t("Tornar o meu perfil público")}</b>
              <span className="text-text-2">{t("Visitantes veem nome, foto, pontos, país da temporada, avaliações e conquistas. Desenhos avaliados só aparecem quando você os publica. E-mail e nascimento permanecem privados.")}</span></div>
          </div>
          <div aria-live="polite" className="min-h-5 text-sm">{pubMsg && <p role={pubMsg.ok ? "status" : "alert"} className={pubMsg.ok ? "text-text-2" : "text-danger"}>{pubMsg.text}</p>}</div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={pubBusy} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60">{pubBusy ? t("Aguarde…") : t("Salvar")}</button>
            {loaded?.isPublic && loaded.handle && (
              <>
                <button type="button" onClick={() => void copyPublic()} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:bg-track"><Icon name={copied ? "check" : "link"} size={18} />{copied ? t("Link copiado") : t("Copiar link")}</button>
                <a href={`/u/${loaded.handle}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">{t("Ver como visitante")}<Icon name="arrow_outward" size={16} /></a>
              </>
            )}
          </div>
        </form>
      </section>

      <section className={`${card} mt-6`}>
        <h2 className="text-lg font-semibold">{t("Alterar senha")}</h2>
        <form onSubmit={changePw} className="mt-4 grid gap-4" noValidate>
          <div className="grid gap-1.5 text-sm font-medium"><label htmlFor="npw">{t("Nova senha")}</label>
            <PasswordInput id="npw" value={pw} onChange={(v) => { setPw(v); setPmsg(null); }} autoComplete="new-password" />
            <PasswordChecklist value={pw} />
          </div>
          <div className="grid gap-1.5 text-sm font-medium"><label htmlFor="npw2">{t("Confirmar senha")}</label>
            <PasswordInput id="npw2" value={pw2} onChange={(v) => { setPw2(v); setPmsg(null); }} autoComplete="new-password" invalid={pw2.length > 0 && pw2 !== pw} />
          </div>
          <Note m={pmsg} />
          <div><button type="submit" disabled={pbusy || !pw} className={btn}>{pbusy ? t("Aguarde…") : t("Alterar senha")}</button></div>
        </form>
      </section>

      <section id="privacidade" className={`${card} mt-6 scroll-mt-24`} aria-label={t("Privacidade e dados")}>
        <h2 className="text-lg font-semibold">{t("Privacidade e dados")}</h2>
        <p className="mt-1 text-sm text-text-2">{t("Você controla os seus dados. Leia os")} <a {...link("/termos")} className="font-semibold text-text underline">{t("Termos de uso")}</a> {t("e a")} <a {...link("/privacidade")} className="font-semibold text-text underline">{t("Política de privacidade")}</a>.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void downloadData()} disabled={dataBusy} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:bg-track disabled:opacity-60"><Icon name={dataBusy ? "hourglass_top" : "download"} size={18} />{t("Baixar meus dados (.json)")}</button>
          <span aria-live="polite" className="text-sm text-text-2">{dataMsg}</span>
        </div>

        <div className="mt-7 rounded-2xl border border-danger/40 bg-danger/5 p-5">
          <h3 className="flex items-center gap-2 font-semibold text-danger"><Icon name="warning" size={20} />{t("Excluir minha conta")}</h3>
          <p className="mt-1.5 text-sm text-text-2">{t("Apaga para sempre a sua conta, o perfil, a foto, os desenhos, as notas, as conquistas e a posição no ranking. Não dá para desfazer.")}</p>
          {!delOpen ? (
            <button type="button" onClick={() => setDelOpen(true)} className="mt-4 rounded-full border border-danger/60 px-4 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/10">{t("Quero excluir a minha conta")}</button>
          ) : (
            <form onSubmit={removeAccount} className="mt-4 grid gap-4" noValidate>
              <div className="grid gap-1.5 text-sm font-medium"><label htmlFor="delpw">{t("Sua senha")}</label><PasswordInput id="delpw" value={delPw} onChange={(v) => { setDelPw(v); setDelMsg(""); }} autoComplete="current-password" /></div>
              <div className="grid gap-1.5 text-sm font-medium"><label htmlFor="delword">{t("Para confirmar, digite")} <b className="select-all rounded-md bg-track px-1.5 py-0.5 font-mono text-[13px] font-semibold text-text">{confirmWord}</b> {t("no campo abaixo:")}</label>
                <input id="delword" className={field} value={delWord} autoComplete="off" spellCheck={false} aria-describedby="delhint" onChange={(e) => { setDelWord(e.target.value); setDelMsg(""); }} />
                <span id="delhint" className="text-xs font-normal text-text-2">{t("Igual está escrito acima, sem aspas e com as mesmas letras minúsculas.")}</span></div>
              <div aria-live="polite" className="min-h-5 text-sm">{delMsg && <p role="alert" className="text-danger">{delMsg}</p>}</div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" disabled={delBusy || !delPw || delWord.trim() !== confirmWord} className="rounded-full bg-danger px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">{delBusy ? t("Aguarde…") : t("Excluir tudo")}</button>
                <button type="button" onClick={() => { setDelOpen(false); setDelPw(""); setDelWord(""); setDelMsg(""); }} className="text-sm text-text-2 hover:text-text">{t("Cancelar")}</button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

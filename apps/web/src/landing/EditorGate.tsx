import { useEffect, useState } from "react";
import { caseById } from "../cases";
import { levelLocked } from "../plan";
import { loadSession } from "../session";
import { go } from "../nav";
import { useAuth } from "../auth";
import { App } from "../App";
import { editorForced, MobileEditor, useNarrow } from "./MobileEditor";

/** /app: em tela estreita (celular) mostra o resumo do desenho; o editor completo abre em telas maiores ou se a pessoa insistir. */
export function EditorGate() {
  const narrow = useNarrow();
  const auth = useAuth();
  const id = loadSession()?.caseId;
  const found = id ? caseById(id) : undefined;
  const locked = !!found && levelLocked(found.level);
  useEffect(() => { if (locked) go("/planos"); }, [locked, auth.user?.id]);
  const [forced, setForced] = useState(editorForced());
  if (locked) return null;
  return narrow && !forced ? <MobileEditor onForce={() => setForced(true)} /> : <App />;
}

import { useEffect } from "react";
import { caseById } from "../cases";
import { levelLocked } from "../plan";
import { loadSession } from "../session";
import { go } from "../nav";
import { useAuth } from "../auth";
import { App } from "../App";

/** /app: o laboratório abre em qualquer aparelho (celular e tablet têm o layout próprio dentro do App). Casos fechados pelo plano levam a /planos. */
export function EditorGate() {
  const auth = useAuth();
  const id = loadSession()?.caseId;
  const found = id ? caseById(id) : undefined;
  const locked = !!found && levelLocked(found.level);
  useEffect(() => { if (locked) go("/planos"); }, [locked, auth.user?.id]);
  if (locked) return null;
  return <App />;
}

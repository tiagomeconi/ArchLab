import { useState } from "react";
import { App } from "../App";
import { editorForced, MobileEditor, useNarrow } from "./MobileEditor";

/** /app: em tela estreita (celular) mostra o resumo do desenho; o editor completo abre em telas maiores ou se a pessoa insistir. */
export function EditorGate() {
  const narrow = useNarrow();
  const [forced, setForced] = useState(editorForced());
  return narrow && !forced ? <MobileEditor onForce={() => setForced(true)} /> : <App />;
}

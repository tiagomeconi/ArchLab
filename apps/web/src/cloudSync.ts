import { authEnabled, onUserChange, type AuthState } from "./auth";
import { pushDay, pushProgress, syncActivity, syncProgress } from "./cloud";
import { onDayRecorded } from "./activity";
import { onProgressSaved } from "./progress";

let signedIn = false;
/** Liga o progresso local à nuvem: grava cada avanço e junta os dados ao entrar. */
export function initCloudSync() {
  if (!authEnabled) return;
  onUserChange((u) => { signedIn = !!u; });
  onProgressSaved((id, p) => { if (signedIn) void pushProgress(id, p); });
  onDayRecorded((day) => { if (signedIn) void pushDay(day); });
}
/** Espera (no máximo `ms`) a primeira junção de progresso depois do login, para a tela já abrir atualizada. */
export async function firstSync(auth: AuthState, ms = 4000) {
  if (auth.status !== "in") return;
  signedIn = true;
  await Promise.race([Promise.all([syncProgress(), syncActivity()]), new Promise((r) => setTimeout(r, ms))]);
}

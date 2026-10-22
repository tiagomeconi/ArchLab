/** Request boundary shared by the edge adapter and integration tests. No caller-supplied score is persisted. */
export interface AttemptInfo { status: string; case_id: string; case_version: string; rules_version: string; [key: string]: unknown }
export interface EvaluationResult { rulesVersion: string; caseVersion: string; snap: unknown; [key: string]: unknown }
export interface AssessmentDependencies {
  rulesVersion: string;
  authenticate: () => Promise<boolean>;
  getAttempt: (id: string) => Promise<AttemptInfo | null>;
  evaluate: (caseId: string, raw: unknown) => EvaluationResult;
  finish: (id: string, result: EvaluationResult, hash: string) => Promise<unknown>;
}
export const assessmentHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json" };
const reply = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: assessmentHeaders });
export async function handleAssessment(req: Request, deps: AssessmentDependencies): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: assessmentHeaders });
  if (req.method !== "POST") return reply({ message: "Método inválido." },405);
  if (!(await deps.authenticate().catch(() => false))) return reply({ message: "Entre para entregar a avaliação." },401);
  let input: { attemptId?: unknown; snap?: unknown };
  try {
    const raw=await req.text();
    if (new TextEncoder().encode(raw).byteLength>2000000) return reply({ message: "Desenho grande demais." },413);
    input=JSON.parse(raw);
    if (!input || typeof input.attemptId!=="string" || !/^[0-9a-f-]{36}$/i.test(input.attemptId)) return reply({ message: "Tentativa inválida." },400);
  } catch { return reply({ message: "Requisição inválida." },400); }
  let attempt: AttemptInfo | null;
  try { attempt=await deps.getAttempt(input.attemptId as string); }
  catch { return reply({ message: "Não foi possível carregar a avaliação. Tente novamente." },503); }
  if (!attempt) return reply({ message: "Avaliação não encontrada." },404);
  if (attempt.status==="submitted") return reply(attempt);
  if (attempt.status!=="active" || attempt.rules_version!==deps.rulesVersion) return reply({ message: "Esta tentativa não pode ser entregue com as regras disponíveis." },409);
  let result: EvaluationResult;
  try { result=deps.evaluate(attempt.case_id,input.snap); }
  catch (error) { return reply({ message: error instanceof Error ? error.message : "Não foi possível avaliar o desenho." },400); }
  if (result.caseVersion!==attempt.case_version || result.rulesVersion!==attempt.rules_version) return reply({ message: "Versão do caso incompatível." },409);
  try {
    const hash=[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(JSON.stringify(result.snap))))].map((v)=>v.toString(16).padStart(2,"0")).join("");
    return reply(await deps.finish(input.attemptId as string,result,hash));
  } catch { return reply({ message: "Não foi possível registrar a entrega. Tente novamente." },503); }
}

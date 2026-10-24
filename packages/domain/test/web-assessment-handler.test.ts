import { describe,it,expect,vi } from "vitest";
import { handleAssessment, type AssessmentDependencies } from "../../../supabase/functions/_shared/assessment-handler";
const id="11111111-1111-1111-1111-111111111111";
const attempt={status:"active",case_id:"netflix",case_version:"assessment-v1:netflix",rules_version:"assessment-v1"};
const canonical={rulesVersion:"assessment-v1",caseVersion:"assessment-v1:netflix",snap:{n:[],e:[]},score:84,points:84,passed:true};
const request=(body:unknown={attemptId:id,snap:{n:["input"]},score:100,points:999999})=>new Request("https://example.com/assessment",{method:"POST",body:JSON.stringify(body)});
function dependencies(overrides:Partial<AssessmentDependencies>={}) {
 return {rulesVersion:"assessment-v1",authenticate:vi.fn(async()=>true),getAttempt:vi.fn(async()=>attempt),evaluate:vi.fn(()=>canonical),finish:vi.fn(async(_id,result,hash)=>({status:"submitted",...result,hash})),...overrides} as AssessmentDependencies;
}
describe("endpoint de entrega",()=>{
 it("exige autenticação e consulta a tentativa como o usuário, nunca como administrador",async()=>{
  const deps=dependencies({authenticate:async()=>false});expect((await handleAssessment(request(),deps)).status).toBe(401);expect(deps.getAttempt).not.toHaveBeenCalled();
  const missing=dependencies({getAttempt:async()=>null});expect((await handleAssessment(request(),missing)).status).toBe(404);expect(missing.finish).not.toHaveBeenCalled();
 });
 it("persiste apenas o resultado recalculado e o hash do desenho avaliado",async()=>{
  const deps=dependencies();const res=await handleAssessment(request(),deps);expect(res.status).toBe(200);
  expect(deps.evaluate).toHaveBeenCalledWith("netflix",{n:["input"]});
  expect(deps.finish).toHaveBeenCalledWith(id,canonical,expect.stringMatching(/^[0-9a-f]{64}$/));
  expect((await res.json()).points).toBe(84);
 });
 it("devolve o resultado anterior em uma repetição sem avaliar ou somar novamente",async()=>{
  const deps=dependencies({getAttempt:async()=>({...attempt,status:"submitted",score:80,points:80})});
  const res=await handleAssessment(request(),deps);expect((await res.json()).score).toBe(80);expect(deps.evaluate).not.toHaveBeenCalled();expect(deps.finish).not.toHaveBeenCalled();
 });
 it("reavalia uma entrega com correção aberta e ignora o reenvio depois que ela foi registrada",async()=>{
  const open=dependencies({getAttempt:async()=>({...attempt,status:"submitted",score:80,points:80,draft:{n:["edit"]}})});
  expect((await handleAssessment(request(),open)).status).toBe(200);expect(open.evaluate).toHaveBeenCalledWith("netflix",{n:["input"]});expect(open.finish).toHaveBeenCalledTimes(1);
  const done=dependencies({getAttempt:async()=>({...attempt,status:"submitted",score:84,points:84,draft:null})});
  expect((await (await handleAssessment(request(),done)).json()).score).toBe(84);expect(done.evaluate).not.toHaveBeenCalled();expect(done.finish).not.toHaveBeenCalled();
 });
 it("não grava tentativa encerrada, versão diferente ou desenho inválido",async()=>{
  for(const a of [{...attempt,status:"abandoned"},{...attempt,rules_version:"old"},{...attempt,case_version:"old"}]){
   const deps=dependencies({getAttempt:async()=>a});expect((await handleAssessment(request(),deps)).status).toBe(409);expect(deps.finish).not.toHaveBeenCalled();
  }
  const deps=dependencies({evaluate:()=>{throw new Error("Desenho inválido");}});expect((await handleAssessment(request(),deps)).status).toBe(400);expect(deps.finish).not.toHaveBeenCalled();
 });
 it("falha transitória permite repetir e não confirma sucesso",async()=>{
  const deps=dependencies({finish:async()=>{throw new Error("database down");}});expect((await handleAssessment(request(),deps)).status).toBe(503);
 });
 it("valida tamanho, formato e método",async()=>{
  const deps=dependencies();expect((await handleAssessment(request({attemptId:"invalid"}),deps)).status).toBe(400);
  expect((await handleAssessment(request({attemptId:id,snap:"x".repeat(2000001)}),deps)).status).toBe(413);
  expect((await handleAssessment(new Request("https://example.com"),deps)).status).toBe(405);
  expect((await handleAssessment(new Request("https://example.com",{method:"OPTIONS"}),deps)).status).toBe(200);
 });
});

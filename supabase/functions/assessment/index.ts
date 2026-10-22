import { createClient } from "npm:@supabase/supabase-js@2.118.0";
import { evaluateAssessment, ASSESSMENT_RULES } from "../_shared/evaluator-v1.generated.mjs";
import { handleAssessment } from "../_shared/assessment-handler.ts";
Deno.serve((req) => {
  const url=Deno.env.get("SUPABASE_URL")!;
  const client=createClient(url,Deno.env.get("SUPABASE_ANON_KEY")!,{ global:{headers:{Authorization:req.headers.get("Authorization")??""}},auth:{persistSession:false} });
  return handleAssessment(req,{
    rulesVersion:ASSESSMENT_RULES,
    authenticate:async()=>{const {data:{user},error}=await client.auth.getUser();return !error && !!user;},
    getAttempt:async(id)=>{const {data,error}=await client.rpc("get_assessment_attempt",{p_id:id});if(error)throw error;return data;},
    evaluate:evaluateAssessment,
    finish:async(id,result,hash)=>{
      const admin=createClient(url,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
      const {data,error}=await admin.rpc("finish_assessment",{p_id:id,p_result:result,p_hash:hash});if(error)throw error;return data;
    },
  });
});

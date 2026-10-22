import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {pendingFor,proposed,decisionForRisk,tx,type Participant} from '../shared/workshop.js';

const dimension=z.number().int().min(1).max(5);
const text=z.string().trim().min(1).max(1500);
export const responseInput=z.object({
 responseId:z.string().uuid(),
 baseline:z.object({likelihood:dimension,impact:dimension,reviewed:z.array(z.string()).max(500)}),
 decisions:z.array(z.object({id:z.string(),decision:z.enum(['Capture','Neglect']),confirmed:z.boolean().optional()})).max(200),
 assessment:z.object({likelihood:dimension,impact:dimension,notes:z.string().trim().max(1500)}).optional(),
 plan:z.object({title:text,owner:text,dueDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v),likelihoodReduction:z.number().min(0).max(4).multipleOf(.5),impactReduction:z.number().min(0).max(4).multipleOf(.5),notes:z.string().trim().max(1500)}).optional()
});

type ResponseResult={error:string;saved?:never;replayed?:never;score?:never;planCreated?:never}|{saved:true;error?:never;replayed?:boolean;score?:number;planCreated?:boolean};

// Validate on a detached copy. A rejected finish must never persist partial decisions.
export function completeRiskResponse(original:Participant,riskId:string,input:z.infer<typeof responseInput>,actor:string):ResponseResult{
 const p=structuredClone(original),r=p.risks.find(v=>v.id===riskId);
 const fail=(error:string)=>({error});
 if(!r)return fail('Risk not found.');
 if(r.completedResponses?.includes(input.responseId))return {saved:true,replayed:true};
 if(r.likelihood!==input.baseline.likelihood||r.impact!==input.baseline.impact||JSON.stringify([...r.reviewed].sort())!==JSON.stringify([...input.baseline.reviewed].sort()))return fail('This risk changed in another review. Reopen the response to use the latest assessment.');
 const undecided=p.signals.filter(s=>s.riskIds.includes(riskId)&&!decisionForRisk(s,riskId));
 const decisions=new Map(input.decisions.map(d=>[d.id,d]));
 if(decisions.size!==input.decisions.length||decisions.size!==undecided.length||undecided.some(s=>!decisions.has(s.id)))return fail('The signal list changed. Review every current signal before finishing.');
 const now=new Date().toISOString();
 for(const s of undecided){
  const d=decisions.get(s.id)!;
  if(d.decision==='Capture'&&s.type==='ca'&&!d.confirmed)return fail('Confirm the continuous assurance exception before accepting it.');
  s.riskDecisions={...(s.riskDecisions||Object.fromEntries(s.riskIds.flatMap(id=>s.decision?[[id,s.decision]]:[]))),[riskId]:d.decision};
  const complete=s.riskIds.every(id=>!!s.riskDecisions?.[id]);
  Object.assign(s,{decision:complete?(Object.values(s.riskDecisions).includes('Capture')?'Capture':'Neglect'):undefined,decidedAt:now,actor,...(s.type==='ca'?{confirmation:d.confirmed?'Confirmed':'Not confirmed'}:{})});
 }
 const pr=proposed(p,r),assessment=input.assessment;
 if(pr.signalIds.length){
  if(!assessment)return fail('Choose a risk score for the accepted evidence.');
  const custom=assessment.likelihood!==pr.likelihood||assessment.impact!==pr.impact;
  if(custom&&!assessment.notes.trim())return fail('Explain the reason for your custom score.');
  const score=assessment.likelihood*assessment.impact;
  if(score>12&&!input.plan)return fail('The new score exceeds tolerance. Create a mitigation plan before finishing.');
  if(input.plan&&p.plans.length>=100)return fail('Maximum 100 mitigation plans.');
  if(input.plan&&p.plans.some(v=>v.riskId===riskId&&tx(v.title)===input.plan!.title))return fail('A plan with this title already exists. Give the new action a distinct title.');
  const before={likelihood:r.likelihood,impact:r.impact},after={likelihood:assessment.likelihood,impact:assessment.impact};
  p.reviews.push({id:input.responseId,riskId,choice:before.likelihood===after.likelihood&&before.impact===after.impact?'Keep':'Update',before,after,signalIds:pr.signalIds,eventIds:pr.eventIds,notes:assessment.notes||tx(pr.reason),at:now,actor});
  Object.assign(r,after);r.reviewed.push(...pr.signalIds);
  if(input.plan)p.plans.push({...input.plan,id:randomUUID(),riskId,signalIds:pr.signalIds,status:'Open',evidence:'',createdAt:now});
 }else if(assessment||input.plan)return fail('No accepted evidence is waiting for reassessment.');
 if(!undecided.length&&!pr.signalIds.length)return fail('No new signal response to save.');
 r.completedResponses=[...(r.completedResponses||[]).slice(-19),input.responseId];
 Object.assign(original,p);
 return {saved:true,score:r.likelihood*r.impact,planCreated:!!input.plan};
}

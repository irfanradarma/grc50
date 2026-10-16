export function projectRisk(likelihood:number,impact:number,plans:{likelihoodReduction?:number;impactReduction?:number}[]){
 const valid=(v:number|undefined)=>Number.isFinite(v)?Math.max(0,v||0):0;
 const residualLikelihood=Math.max(1,likelihood-plans.reduce((s,p)=>s+valid(p.likelihoodReduction),0));
 const residualImpact=Math.max(1,impact-plans.reduce((s,p)=>s+valid(p.impactReduction),0));
 return {initialScore:likelihood*impact,residualLikelihood,residualImpact,residualScore:residualLikelihood*residualImpact};
}

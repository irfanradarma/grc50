export function runOperationalCheck(riskId:string){
 const checks:Record<string,{total:number;exceptions:number;threshold:number;unit:string;rule:string;references:string[]}>={
 route:{total:50,exceptions:Array.from({length:50},(_,i)=>({id:`DISPATCH-${i+1}`,late:i<11})).filter(r=>r.late).length,threshold:10,unit:'%',rule:'Late dispatch / total dispatch > 10%',references:Array.from({length:11},(_,i)=>`DISPATCH-${i+1}`)},
 capacity:{total:40,exceptions:Array.from({length:40},(_,i)=>({allocated:i>=8})).filter(r=>!r.allocated).length,threshold:10,unit:'%',rule:'Unallocated slots / planned vehicle slots > 10%',references:Array.from({length:8},(_,i)=>`VEHICLE-SLOT-${i+1}`)},
 outage:{total:1,exceptions:38,threshold:24,unit:'hours',rule:'Hours since completed backup > 24',references:['BACKUP-LAST-COMPLETED']},
 cyber:{total:18,exceptions:Array.from({length:18},(_,i)=>({approved:i>=3})).filter(r=>!r.approved).length,threshold:0,unit:'count',rule:'Unapproved privileged accounts > 0',references:['ACCESS-01','ACCESS-02','ACCESS-03']},
 procurement:{total:20,exceptions:Array.from({length:20},(_,i)=>({workingDays:i<4?6:3})).filter(r=>r.workingDays>5).length,threshold:0,unit:'count',rule:'Priority approvals pending > 5 working days',references:['APPROVAL-01','APPROVAL-02','APPROVAL-03','APPROVAL-04']},
 payment:{total:25,exceptions:Array.from({length:25},(_,i)=>({acceptance:i<2?'':`ACCEPT-${i}`})).filter(r=>!r.acceptance).length,threshold:0,unit:'count',rule:'Payments without acceptance references > 0',references:['PAYMENT-01','PAYMENT-02']}};
 const check=checks[riskId];const value=check.unit==='%'?check.exceptions/check.total*100:check.exceptions;return {...check,value,violated:value>check.threshold,engine:'Configured operational rule',evaluatedAt:new Date().toISOString()};
}

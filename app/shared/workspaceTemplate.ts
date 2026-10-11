/** Synthetic demonstration data. No claims about a real organization or event. */
export function workspaceTemplate(){
 const observedAt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const year=Number(observedAt.slice(0,4));
 const profile={name:'Aruna Public Services',sector:'Public sector',description:'A fictional regional agency providing digital licensing and citizen support through service centers. This is a synthetic learning template.',stakeholders:'Citizens, service-center teams, regional leadership, technology partners',dependencies:'Cloud hosting, digital identity provider, connectivity, critical software suppliers',appetite:'Low tolerance for personal-data exposure and prolonged service interruption. Moderate tolerance for short-term operational variation when recovery is prompt.'};
 const objectives=[
  {key:'service',year,title:'Complete public service requests on time',metric:'Requests completed within five working days (%)',target:'At least 95% within five working days',owner:'Head of Service Operations'},
  {key:'digital',year,title:'Keep digital services available',metric:'Service uptime during operating hours (%)',target:'At least 99.5% availability',owner:'Head of Digital Services'},
  {key:'trust',year,title:'Protect citizen information',metric:'Critical access findings resolved on time (%)',target:'Resolve 100% of critical findings within seven days',owner:'Information Security Lead'}
 ];
 const base={likelihood:3,impactScore:4,status:'Monitoring',source:'Random sample'};
 const risks=[
  {...base,key:'backlog',objectiveKey:'service',title:'Service backlog exceeds delivery capacity',category:'Operational',cause:'Uneven demand and limited capacity at service centers',event:'Unprocessed applications accumulate beyond the service window',impact:'The annual on-time completion target is missed',owner:'Service Operations Manager',controls:'Daily queue dashboard and workload redistribution',response:'Review staffing and prioritize aged applications'},
  {...base,key:'supplier',objectiveKey:'digital',title:'Critical cloud supplier interruption',category:'Technology',cause:'Reliance on one cloud provider and incomplete recovery testing',event:'A supplier outage interrupts licensing services',impact:'Digital availability falls below the annual target',owner:'IT Operations Manager',controls:'Availability monitoring, backups, and supplier service reviews',response:'Test failover and review supplier recovery commitments'},
  {...base,key:'access',objectiveKey:'trust',title:'Excessive access to citizen records',category:'Technology',cause:'Delayed removal of privileged access and incomplete recertification',event:'Unauthorized users access citizen information',impact:'Privacy harm and delayed resolution of critical access findings',owner:'Information Security Lead',controls:'Role-based access and quarterly account recertification',response:'Remove unused privileges and investigate flagged accounts'},
  {...base,key:'data',objectiveKey:'service',title:'Incomplete data delays service decisions',category:'Strategic',likelihood:2,impactScore:3,cause:'Inconsistent validation across application channels',event:'Case officers receive incomplete or conflicting application data',impact:'Rework increases and the completion-time objective is affected',owner:'Data Quality Lead',controls:'Required-field checks and daily reconciliation',response:'Strengthen validation and assign source-data ownership'}
 ];
 const kris=[
  {key:'aged',riskKey:'backlog',name:'Applications older than five working days',unit:'%',owner:'Service Operations Manager',frequency:'Weekly',direction:'Above',warning:5,critical:10},
  {key:'capacity',riskKey:'backlog',name:'Service team capacity utilization',unit:'%',owner:'Service Operations Manager',frequency:'Weekly',direction:'Above',warning:85,critical:95},
  {key:'uptime',riskKey:'supplier',name:'Digital service availability',unit:'%',owner:'IT Operations Manager',frequency:'Daily',direction:'Below',warning:99.5,critical:99},
  {key:'access',riskKey:'access',name:'Overdue privileged access reviews',unit:'accounts',owner:'Information Security Lead',frequency:'Monthly',direction:'Above',warning:3,critical:8},
  {key:'quality',riskKey:'data',name:'Applications requiring data correction',unit:'%',owner:'Data Quality Lead',frequency:'Weekly',direction:'Above',warning:4,critical:8}
 ];
 const readings=[{kriKey:'aged',value:7},{kriKey:'capacity',value:81},{kriKey:'uptime',value:99.8},{kriKey:'access',value:9},{kriKey:'quality',value:2}].map(r=>({...r,observedAt,notes:'Synthetic baseline observation for exploring the template.'}));
 const sources=[
  {key:'news',objectiveKey:'digital',name:'External technology and disruption news',kind:'news',format:'rss',endpoint:'https://feeds.bbci.co.uk/news/rss.xml',keywords:'technology,cyber,outage',cadence:'On demand',rule:''},
  {key:'periodic',objectiveKey:'service',riskKey:'backlog',name:'Monthly service performance report',kind:'manual_periodic',format:'reference',endpoint:'',keywords:'',cadence:'Monthly',rule:'Escalate when late applications exceed 5% or demand exceeds staffing capacity.'},
  {key:'incident',objectiveKey:'digital',riskKey:'supplier',name:'Digital service incident report',kind:'manual_incident',format:'reference',endpoint:'',keywords:'',cadence:'When an incident occurs',rule:'Report interruptions longer than 30 minutes and supplier service failures.'},
  {key:'assurance',objectiveKey:'trust',riskKey:'access',name:'Privileged access continuous assurance',kind:'assurance',format:'reference',endpoint:'',keywords:'',cadence:'Daily checks; monthly review',rule:'Compare privileged accounts with the approved user register. Flag terminated users, unapproved access, or overdue recertification.'}
 ];
 const reports=[
  {sourceKey:'periodic',title:'Sample report: service backlog increased',details:'Synthetic scenario: late applications reached 7%; review workload allocation and reassess the backlog risk.',observedAt,evidence:'Synthetic exercise report / SR-001',outcome:'Issue'},
  {sourceKey:'assurance',title:'Sample assurance result: access exceptions',details:'Synthetic scenario: nine privileged accounts have overdue recertification. Investigate ownership and potential citizen-data exposure.',observedAt,evidence:'Synthetic assurance register / CA-001',outcome:'Issue'},
  {sourceKey:'incident',title:'Sample incident report: no interruptions',details:'Synthetic normal result: no digital service interruptions were observed during the review period.',observedAt,evidence:'Synthetic exercise report / IR-001',outcome:'Normal'}
 ];
 const reviews=[{riskKey:'supplier',decision:'No change required',notes:'Synthetic review: availability is within target. Continue monitoring and schedule a recovery test.'}];
 return {id:'public-service-v1',profile,objectives,risks,kris,readings,sources,reports,reviews};
}

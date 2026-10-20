export type TourStep={title:string;instruction:string;target:string;tap?:boolean;tapTarget?:string};
export const tours:Record<string,TourStep[]>={
 context:[
  {title:'Choose your organization',instruction:'Select the context you want to lead.',target:'.w-org.selected',tap:true},
  {title:'Make it your workspace',instruction:'Use your own company name or the supplied example.',target:'.w-panel label',tap:true,tapTarget:'.w-panel label input'},
  {title:'Select your objective',instruction:'The objective brings its risks and starting plans.',target:'.w-objectives .selected',tap:true,tapTarget:'.w-objectives .selected input'},
  {title:'Open your workspace',instruction:'You now own the next risk decision.',target:'.w-stats'}],
 menus:[
  {title:'Inspect your risks',instruction:'Scores, owners and alerts share one risk list.',target:'.w-table'},
  {title:'Review existing commitments',instruction:'Each plan names its risk, owner and deadline.',target:'.w-table'},
  {title:'Activate news sources',instruction:'Choose the publishers for the next signal round.',target:'.w-source-table',tap:true,tapTarget:'.w-source-table input'},
  {title:'Return to the dashboard',instruction:'See the objective, exposure and next decisions together.',target:'.w-stats'}],
 capture:[
  {title:'Open the incoming signal',instruction:'Tap the news item to inspect its evidence.',target:'.w-signal>.w-row-title',tap:true},
  {title:'Review the proposed link',instruction:'Check the dependency. Approve or decline this risk link.',target:'.w-map-proposal',tap:true,tapTarget:'.w-map-proposal button'},
  {title:'Capture the useful signal',instruction:'The link is approved. Your capture notes are optional.',target:'[data-demo-capture]',tap:true},
  {title:'Continue to risk assessment',instruction:'Capture opens the risk; the score has not changed yet.',target:'.w-next-step'}],
 assessment:[
  {title:'Compare current and suggested',instruction:'The evidence proposes 12 to 16, with its rationale.',target:'.w-score-pair'},
  {title:'Review the suggested position',instruction:'S marks the proposal: likelihood 4, impact 4.',target:'.w-riskmap',tap:true,tapTarget:'.w-matrix .suggested'},
  {title:'Make the score decision',instruction:'Accept the suggestion, or select your own score with a reason.',target:'[data-demo-assessment]',tap:true},
  {title:'Respond above tolerance',instruction:'The approved score is 16. A response is now prompted.',target:'.w-response-prompt'}],
 mitigation:[
  {title:'Review the response proposal',instruction:'A higher exposure needs an accountable response.',target:'.w-response-prompt'},
  {title:'Confirm action and owner',instruction:'Approve the proposed action or customize the details.',target:'.w-plan-form label',tap:true,tapTarget:'.w-plan-form input'},
  {title:'Approve the mitigation plan',instruction:'Check the deadline and expected protection, then save.',target:'[data-demo-save-plan]',tap:true},
  {title:'Follow the commitment',instruction:'The new action is recorded against the risk.',target:'.w-plan-rows'}],
 protection:[
  {title:'Inspect the agreed action',instruction:'The plan aims to reduce likelihood by one point.',target:'[data-evidence-plan="true"]'},
  {title:'Compare exposure and protection',instruction:'Current risk is 16; effective action could bring it to 12.',target:'.w-projection'},
  {title:'Keep the distinction clear',instruction:'Approval alone never reduces the current assessment.',target:'.w-projection'},
  {title:'Verify before reassessing',instruction:'Monitor the action and obtain evidence of effectiveness.',target:'.w-plan-rows'}],
 internal:[
  {title:'Read the strategy report',instruction:'A periodic review challenges the growth assumptions.',target:'.w-signal>.w-row-title',tap:true},
  {title:'Test the report relationship',instruction:'Inspect the dependency proposed for human review.',target:'.w-map-proposal'},
  {title:'Bring in audit evidence',instruction:'An audit finding may challenge the same protection.',target:'.w-explanation'},
  {title:'Approve the relevant audit link',instruction:'Review related evidence together; do not add a point per report.',target:'.w-map-proposal',tap:true,tapTarget:'.w-map-proposal button'}],
 ca:[
  {title:'Open the automated exception',instruction:'CA brings a measured signal linked to a registered risk.',target:'.w-signal>.w-row-title',tap:true},
  {title:'Read the measurement',instruction:'Eight of twenty cases = 40%, above the 20% threshold.',target:'.w-check'},
  {title:'Inspect the exception records',instruction:'Confirm the scope and denominator before using the signal.',target:'.w-check details',tap:true,tapTarget:'.w-check summary'},
  {title:'Confirm and capture',instruction:'Approve the risk link and confirm the exception for review.',target:'[data-demo-capture]',tap:true}],
 dashboard:[
  {title:'See what changed',instruction:'One signal captured, one assessment reviewed, one response agreed.',target:'.w-flow-count'},
  {title:'Return to the objective',instruction:'Risk exposure informs the outlook; it is not a KPI forecast.',target:'.w-goal'},
  {title:'Inspect current exposure',instruction:'The heat map shows the approved score, not projected protection.',target:'.w-riskmap'},
  {title:'Trace the decision',instruction:'The history links evidence, judgment and the recorded score.',target:'.w-history'}]
};
export const tourBeatMs=2800;

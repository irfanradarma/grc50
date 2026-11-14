// Closed catalogue shared by Admin, API and the audience overlay.
// Audience paths contain no admin routes or credentials.
export const demoAppIds=['signal','ams','continuous-risk','hitl'];
export const demoApps=[
 {id:'hitl',label:{en:'Human-in-the-loop ? Find AI slop',id:'Human-in-the-loop ? Temukan AI slop'},workspace:null},
 {id:'signal',label:{en:'SIGNAL — Beyond Compliance',id:'SIGNAL — Beyond Compliance'},workspace:null},
 {id:'ams',label:{en:'AMS — AI in Audit and Beyond',id:'AMS — AI in Audit and Beyond'},workspace:'audit'},
 {id:'continuous-risk',label:{en:'Continuous Risk Assurance — AI in Audit and Beyond',id:'Continuous Risk Assurance — AI in Audit and Beyond'},workspace:'risk'}
];
export function getDemoApp(id){return demoApps.find(app=>app.id===id)||demoApps.find(app=>app.id==='signal');}
export function demoAppPath(id,role='audience'){
 const app=getDemoApp(id),query=new URLSearchParams({demoApp:app.id});
 if(app.workspace)query.set('workspace',app.workspace);
 return (role==='admin'?'/admin/demo/':'/audience/')+'?'+query;
}
export function audienceDemoUrl(id,frontendUrl){return new URL(demoAppPath(id).slice(1),frontendUrl.replace(/\/$/,'')+'/').href;}

export type DemoAppId='signal'|'ams'|'continuous-risk';
export type DemoApp={id:DemoAppId;label:{en:string;id:string};workspace:'audit'|'risk'|null};
export const demoAppIds:readonly ['signal','ams','continuous-risk'];
export const demoApps:DemoApp[];
export function getDemoApp(id:unknown):DemoApp;
export function demoAppPath(id:unknown,role?:'admin'|'audience'):string;
export function audienceDemoUrl(id:unknown,frontendUrl:string):string;

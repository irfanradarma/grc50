// Retry only connection-capacity failures during a rolling deploy. Configuration
// and schema errors must still fail immediately rather than being hidden.
export async function checkDatabase(check:()=>Promise<void>,wait=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms)),attempts=13){
 for(let attempt=1;;attempt++)try{await check();return;}catch(error){
  if((error as {code?:string}).code!=='53300'||attempt>=attempts)throw error;
  console.warn('Database connection capacity busy; retrying startup',attempt);
  await wait(5000);
 }
}

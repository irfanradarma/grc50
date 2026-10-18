/** Strip tracking data while retaining fields that identify an article. */
export function canonicalNewsUrl(value:string){try{const url=new URL(value);url.hash='';for(const key of [...url.searchParams.keys()])if(/^utm_|^(fbclid|gclid|oc)$/i.test(key))url.searchParams.delete(key);return url.href;}catch{return '';}}

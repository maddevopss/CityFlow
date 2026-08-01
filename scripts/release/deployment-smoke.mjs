const base=(process.env.CITYFLOW_API_URL||'').replace(/\/$/,'');
if(!base) throw new Error('CITYFLOW_API_URL requis');
if(/localhost|127\.0\.0\.1/.test(base) && process.env.ALLOW_LOCAL!=='true') throw new Error('Cible locale refusée sans ALLOW_LOCAL=true');
const paths=['/health','/api/v1/inspection-dashboard'];
const results=[];
for(const path of paths){const started=Date.now();const response=await fetch(base+path,{headers:process.env.CITYFLOW_E2E_EXECUTIVE_TOKEN?{Authorization:`Bearer ${process.env.CITYFLOW_E2E_EXECUTIVE_TOKEN}`}:{}});results.push({path,status:response.status,durationMs:Date.now()-started,ok:response.ok});}
console.log(JSON.stringify(results,null,2));
if(results.some(x=>!x.ok)) process.exitCode=1;

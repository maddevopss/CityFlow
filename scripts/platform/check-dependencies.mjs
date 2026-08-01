const deps=JSON.parse(process.argv[2]||'[]');
const timeoutMs=Number(process.env.DEPENDENCY_TIMEOUT_MS||3000);
const results=[];
for(const dep of deps){
 const started=Date.now();
 try{
  const c=new AbortController(); const t=setTimeout(()=>c.abort(),timeoutMs);
  const r=await fetch(dep.url,{method:dep.method||'GET',signal:c.signal}); clearTimeout(t);
  results.push({name:dep.name,ok:r.ok,status:r.status,latencyMs:Date.now()-started});
 }catch(error){results.push({name:dep.name,ok:false,error:error.name,latencyMs:Date.now()-started});}
}
process.stdout.write(JSON.stringify({ok:results.every(x=>x.ok),results},null,2));

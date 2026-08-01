const target=process.env.ROLLBACK_TARGET||'';
const current=process.env.CURRENT_RELEASE||'';
const confirm=process.env.CONFIRM_ROLLBACK||'';
if(!/^v?\d+\.\d+\.\d+$/.test(target)) throw new Error('ROLLBACK_TARGET invalide');
if(target===current) throw new Error('La cible doit différer de la version courante');
if(confirm!=='ROLLBACK') throw new Error('CONFIRM_ROLLBACK=ROLLBACK requis');
if(/prod|production/i.test(process.env.CITYFLOW_API_URL||'') && process.env.GITHUB_EVENT_NAME!=='workflow_dispatch') throw new Error('Rollback production uniquement manuel');
console.log(JSON.stringify({authorized:true,current,target,verifiedAt:new Date().toISOString()},null,2));

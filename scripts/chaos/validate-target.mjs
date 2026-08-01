const target=(process.env.CHAOS_TARGET||'').toLowerCase();
const scenario=process.env.CHAOS_SCENARIO||'';
const allowed=new Set(['database-unavailable','redis-unavailable','worker-stopped','latency']);
if(!target) throw new Error('CHAOS_TARGET requis');
if(target.includes('prod')||target.includes('production')) throw new Error('Cible de production interdite');
if(process.env.CHAOS_CONFIRM!=='CITYFLOW_CHAOS_AUTHORIZED') throw new Error('Confirmation explicite requise');
if(!allowed.has(scenario)) throw new Error('Scénario non autorisé');
console.log(JSON.stringify({authorized:true,target,scenario}));

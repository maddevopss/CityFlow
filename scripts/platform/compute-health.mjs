const input=JSON.parse(process.argv[2]||'{}');
const services=Object.entries(input.services||{}).map(([name,v])=>({name,status:v.status||'unknown',latencyMs:Number(v.latencyMs||0)}));
const weights={healthy:100,degraded:60,critical:0,unknown:20};
const score=services.length?Math.round(services.reduce((s,x)=>s+(weights[x.status]??20),0)/services.length):0;
const status=score>=85?'healthy':score>=50?'degraded':'critical';
process.stdout.write(JSON.stringify({status,score,services,generatedAt:new Date().toISOString()},null,2));

import fs from 'node:fs';
const registry=JSON.parse(fs.readFileSync(process.argv[2]||'config/secrets-registry.json','utf8'));
const names=new Set();
for(const secret of registry.secrets||[]){
 if(!/^[A-Z0-9_]+$/.test(secret.name)) throw new Error(`Nom invalide: ${secret.name}`);
 if(names.has(secret.name)) throw new Error(`Doublon: ${secret.name}`);
 names.add(secret.name);
 if(!['critical','sensitive','internal'].includes(secret.classification)) throw new Error(`Classification invalide: ${secret.name}`);
}
const missing=(registry.secrets||[]).filter(x=>x.required&&!process.env[x.name]).map(x=>x.name);
console.log(JSON.stringify({registered:names.size,missingRequired:missing},null,2));

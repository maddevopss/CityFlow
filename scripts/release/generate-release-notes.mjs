import fs from 'node:fs';
const manifest=JSON.parse(fs.readFileSync('config/production-readiness.json','utf8'));
const version=process.env.RELEASE_VERSION||'1.0.0';
const lines=[`# CityFlow ${version}`,'','## Préparation',`- Score minimal requis : ${manifest.minimumScore}%`,'','## Barrières',...manifest.gates.map(g=>`- ${g.id}: ${g.evidence}`)];
fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/RELEASE-NOTES.md',lines.join('\n')+'\n');
console.log(lines.join('\n'));

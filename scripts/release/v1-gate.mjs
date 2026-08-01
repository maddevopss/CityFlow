import fs from 'node:fs';
const required=['config/production-readiness.json','.github/workflows/security-suite.yml','.github/workflows/production-readiness.yml','docs/industrialization/DISASTER-RECOVERY.md','docs/industrialization/OPERATIONS-RUNBOOKS.md'];
const missing=required.filter(x=>!fs.existsSync(x));
const readiness=JSON.parse(fs.readFileSync('config/production-readiness.json','utf8'));
const verdict=missing.length===0&&readiness.minimumScore>=85?'GO':'NO-GO';
const report={version:'1.0.0',verdict,minimumScore:readiness.minimumScore,missing,checkedAt:new Date().toISOString()};
fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/V1-RELEASE-GATE.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(verdict!=='GO') process.exitCode=1;

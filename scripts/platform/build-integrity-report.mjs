import fs from 'node:fs';
const checks=[
 ['workflows',fs.existsSync('.github/workflows')],
 ['backendLock',fs.existsSync('backend/package-lock.json')],
 ['frontendLock',fs.existsSync('frontend/package-lock.json')],
 ['securityPolicy',fs.existsSync('docs/industrialization/SECURITY-HARDENING.md')],
 ['observabilityPolicy',fs.existsSync('docs/industrialization/OBSERVABILITY-OTEL.md')],
 ['disasterRecovery',fs.existsSync('docs/industrialization/DISASTER-RECOVERY.md')]
].map(([name,ok])=>({name,ok}));
const score=Math.round(checks.filter(x=>x.ok).length/checks.length*100);
const date=new Date().toISOString();
console.log(`# Rapport d’intégrité CityFlow\n\n- Généré : ${date}\n- Score : ${score}%\n\n${checks.map(x=>`- ${x.ok?'✅':'❌'} ${x.name}`).join('\n')}\n`);
if(score<80) process.exitCode=1;

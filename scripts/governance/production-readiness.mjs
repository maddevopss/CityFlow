import fs from 'node:fs';
const config=JSON.parse(fs.readFileSync('config/production-readiness.json','utf8'));
let score=0;
const results=[];
for(const gate of config.gates||[]){
  const passed=fs.existsSync(gate.evidence);
  if(passed) score+=gate.weight;
  results.push({...gate,passed});
}
const verdict=score>=config.minimumScore?'GO':'NO-GO';
const report={generatedAt:new Date().toISOString(),score,minimumScore:config.minimumScore,verdict,results};
console.log(JSON.stringify(report,null,2));
if(verdict!=='GO') process.exitCode=1;

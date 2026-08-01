import fs from 'node:fs';
import path from 'node:path';
const dir='.github/workflows';
const files=fs.readdirSync(dir).filter(x=>/\.ya?ml$/.test(x));
const findings=[];
for(const file of files){
 const text=fs.readFileSync(path.join(dir,file),'utf8');
 const hasPermissions=/^permissions:/m.test(text);
 const writePermissions=[...text.matchAll(/^\s+([A-Za-z-]+):\s*write\s*$/gm)].map(m=>m[1]);
 findings.push({file,hasPermissions,writePermissions});
}
const nonCompliant=findings.filter(x=>!x.hasPermissions);
const report={generatedAt:new Date().toISOString(),workflowCount:files.length,nonCompliant,findings};
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--strict')&&nonCompliant.length) process.exitCode=1;

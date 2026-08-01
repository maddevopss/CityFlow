import fs from 'node:fs';
const registry=JSON.parse(fs.readFileSync('config/required-documents.json','utf8'));
const missing=[];
for(const document of registry.documents||[]){
  if(document.required && !fs.existsSync(document.path)) missing.push(document.path);
  if(!document.owner) throw new Error(`Owner missing for ${document.path}`);
}
console.log(JSON.stringify({checked:registry.documents.length,missing},null,2));
if(missing.length) process.exitCode=1;

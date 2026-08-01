import fs from 'node:fs';
const dir='backend/prisma/migrations';
if(!fs.existsSync(dir)) throw new Error('Répertoire de migrations absent');
const entries=fs.readdirSync(dir).filter(x=>!x.startsWith('.'));
const duplicates=entries.filter((x,i,a)=>a.indexOf(x)!==i);
const report={count:entries.length,duplicates};
console.log(JSON.stringify(report,null,2));
if(!entries.length||duplicates.length) process.exitCode=1;

const fs = require('fs');
let env = fs.readFileSync('apps/mobile/.env', 'utf-8');
env = env.replace(/10\.76\.226\.162/g, '10.33.188.162');
fs.writeFileSync('apps/mobile/.env', env);

let api = fs.readFileSync('apps/mobile/src/services/api.ts', 'utf-8');
api = api.replace(/10\.76\.226\.162/g, '10.33.188.162');
fs.writeFileSync('apps/mobile/src/services/api.ts', api);

console.log("IP successfully updated in files.");

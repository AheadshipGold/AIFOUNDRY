const fs = require('fs');
const file = 'apps/web/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('{(shop.products || []).slice(0, 2).map((img, j) => (', '{(shop.products || []).slice(0, 2).map((img: string, j: number) => (');

fs.writeFileSync(file, content);
console.log('done');

const fs = require('fs');
let c = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');

c = c.replace(/\.map\(\(prod\) => \(/g, '.map((prod, idx) => (');
c = c.replace(/key=\{prod\.id\}/g, 'key={prod.id || String(idx)}');

fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', c);
console.log("Keys fixed!");

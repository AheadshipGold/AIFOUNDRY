const fs = require('fs');
let c = fs.readFileSync('perfect_fix_v2.js', 'utf-8');
c = c.replace(
    "ensureReplace(oldCr, newCr, 'Category Render');",
    "const crS = content.indexOf('{c.isAll ? ('); const crE = content.indexOf(')}', content.indexOf('{(c as any).icon}</Text>')) + 2; content = content.substring(0, crS) + newCr + content.substring(crE); console.log('SUCCESS: Category Render');"
);
fs.writeFileSync('perfect_fix_v2.js', c);

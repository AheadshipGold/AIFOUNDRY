const fs = require('fs');
let c = fs.readFileSync('perfect_fix_v2.js', 'utf-8');
c = c.replace(
    "ensureReplace(oldCats, newCats, 'Categories array');",
    "const cS = content.indexOf('const categories = ['); const cE = content.indexOf('];', cS) + 2; content = content.substring(0, cS) + newCats + content.substring(cE); console.log('SUCCESS: Categories');"
);
fs.writeFileSync('perfect_fix_v2.js', c);

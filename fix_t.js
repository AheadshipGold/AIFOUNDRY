const fs = require('fs');
let c = fs.readFileSync('perfect_fix_v2.js', 'utf-8');
c = c.replace(
    'const tEndStr = \'{isEn ? "Recommended for you" : "Recommandé pour vous"}\';',
    'const tEndStr = \'{isEn ? "Recommended for you" \';'
);
fs.writeFileSync('perfect_fix_v2.js', c);

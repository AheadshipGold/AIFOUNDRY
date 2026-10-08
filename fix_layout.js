const fs = require('fs');
let c = fs.readFileSync('apps/mobile/src/screens/buyer/SearchScreen.tsx', 'utf-8');

c = c.replace(
  /<View style=\{\{ flex: 1, gap: 12 \}\}>/g,
  '<View style={{ width: "48.5%", gap: 12 }}>'
);

fs.writeFileSync('apps/mobile/src/screens/buyer/SearchScreen.tsx', c);
console.log("Fixed masonry flex layout");

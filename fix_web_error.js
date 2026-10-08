const fs = require('fs');
let c = fs.readFileSync('apps/web/src/app/page.tsx', 'utf-8');

c = c.replace(
  '<span>{p.rating.toFixed(1)} ({p.reviewsCount})</span>',
  '<span>{(p.rating || 0).toFixed(1)} ({p.reviewsCount || 0})</span>'
);

fs.writeFileSync('apps/web/src/app/page.tsx', c);
console.log("Fixed page.tsx rating error");

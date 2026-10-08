const fs = require('fs');
let content = fs.readFileSync('apps/web/src/app/page.tsx', 'utf-8');

// Replace string prices with numeric prices in the mock data
content = content.replace('price: "270 000 FCFA",', 'price: 270000,');
content = content.replace('advance: "100 000 FCFA",', 'advance: 100000,');
content = content.replace('price: "150 000 FCFA",', 'price: 150000,');
content = content.replace('advance: "75 000 FCFA",', 'advance: 75000,');
content = content.replace('price: "185 000 FCFA",', 'price: 185000,');
content = content.replace('advance: "90 000 FCFA",', 'advance: 90000,');

// Just in case there are others
content = content.replace(/{formatPrice\(prop\.price\)}/g, '{typeof prop.price === "number" ? formatPrice(prop.price) : prop.price}');
content = content.replace(/{formatPrice\(prop\.advance\)}/g, '{typeof prop.advance === "number" ? formatPrice(prop.advance) : prop.advance}');

fs.writeFileSync('apps/web/src/app/page.tsx', content);
console.log("Fixed NaN display in modal");

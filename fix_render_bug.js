const fs = require('fs');
let c = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');

c = c.replace(/\{prod\.seller\}/g, '{prod.seller?.name || prod.seller}');

// Replace source={prod.image || ...}
// We have to be careful with the exact string.
// Let's replace the whole image block.
const oldImg = `source={prod.image || (isDark ? iconBrandDark : iconBrandLight)}`;
const newImg = `source={typeof prod.image === 'string' ? { uri: resolveImageUrl(prod.image) } : (prod.image || (isDark ? iconBrandDark : iconBrandLight))}`;

c = c.replace(new RegExp(oldImg.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&'), 'g'), newImg);

fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', c);
console.log('Fixed rendering bugs');

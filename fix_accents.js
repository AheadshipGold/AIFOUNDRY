const fs = require('fs');
let c = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');

c = c.replace(/Boutique VǸrifiǸe/g, 'Boutique Vérifiée');
c = c.replace(/Y''/g, '👑');
c = c.replace(/Y\?/g, '✨');
c = c.replace(/Os/g, '⌚️');
c = c.replace(/Y'o/g, '👜');
c = c.replace(/Y'\?/g, '💍');
c = c.replace(/Y></g, '🛋');
c = c.replace(/Y\?/g, '🏺');
c = c.replace(/Y\./g, '📱');
c = c.replace(/~\./g, '★');
c = c.replace(/RecommandǸ/g, 'Recommandé');
c = c.replace(/SǸLECTIONNǸE/g, 'SÉLECTIONNÉE');
c = c.replace(/DǸcor/g, 'Décoration');
c = c.replace(/NumǸrique/g, 'Numérique');
c = c.replace(/Y'/g, '👑');
c = c.replace(/~\./g, '★');
c = c.replace(/~\./g, '★');
c = c.replace(/Publier une demande de produit '/g, 'Publier une demande de produit →');

fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', c);
console.log("Accents fixed in mobile app.");

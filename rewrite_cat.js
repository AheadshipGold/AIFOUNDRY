const fs = require('fs');
const file = 'apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldCat = `const categories = [
    { id: "all", label: isEn ? "All" : "Tout", image: null, isAll: true, icon: "?" },
    { id: "watches", label: isEn ? "Watches" : "Montres", image: null, isAll: false, icon: "??" },
    { id: "leather", label: isEn ? "Leather" : "Maroquinerie", image: null, isAll: false, icon: "??" },
    { id: "fashion", label: isEn ? "Jewelry & Fashion" : "Bijoux & Mode", image: null, isAll: false, icon: "??" },
    { id: "home", label: isEn ? "Home & Decor" : "Maison & Mobilier", image: null, isAll: false, icon: "??" },
    { id: "art", label: isEn ? "Art & Sculptures" : "Art & Décoration", image: null, isAll: false, icon: "??" },
    { id: "digital", label: isEn ? "Digital" : "Numérique", image: null, isAll: false, icon: "??" },
  ];`;

const newCat = `const categories = [
    { id: "all", label: isEn ? "All" : "Tout", image: null, isAll: true, icon: "?" },
    { id: "watches", label: isEn ? "Watches" : "Montres", image: require("../../../assets/products/watch-chrono.jpg"), isAll: false, icon: "??" },
    { id: "leather", label: isEn ? "Leather" : "Maroquinerie", image: require("../../../assets/products/leather-tote.jpg"), isAll: false, icon: "??" },
    { id: "fashion", label: isEn ? "Jewelry & Fashion" : "Bijoux & Mode", image: require("../../../assets/products/jewelry-gold.jpg"), isAll: false, icon: "??" },
    { id: "home", label: isEn ? "Home & Decor" : "Maison & Mobilier", image: require("../../../assets/products/armchair.jpg"), isAll: false, icon: "??" },
    { id: "art", label: isEn ? "Art & Sculptures" : "Art & Décoration", image: require("../../../assets/products/art-bronze.jpg"), isAll: false, icon: "??" },
    { id: "digital", label: isEn ? "Digital" : "Numérique", image: require("../../../assets/products/digital-patterns.jpg"), isAll: false, icon: "??" },
  ];`;

const fixedCatOld = content.substring(content.indexOf('const categories = ['), content.indexOf('];', content.indexOf('const categories = [')) + 2);
content = content.replace(fixedCatOld, newCat);
fs.writeFileSync(file, content);
console.log('Categories updated');

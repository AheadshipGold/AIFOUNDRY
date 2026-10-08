const fs = require('fs');

let content = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');

// 1. Add CmsApi, API_BASE_URL
if (!content.includes('API_BASE_URL')) {
    content = content.replace(
        'import { CatalogApi, ProductItem } from "../../services/api";',
        'import { CatalogApi, CmsApi, ProductItem, API_BASE_URL } from "../../services/api";'
    );
}

// 2. Add CMS state & resolveImageUrl
if (!content.includes('resolveImageUrl')) {
    const helper = `\n  const [cms, setCms] = useState<any>(null);\n  const resolveImageUrl = (url: string) => {\n    if (!url) return '';\n    if (url.startsWith('http')) return url;\n    const base = API_BASE_URL.replace('/api', '');\n    return \`\${base}\${url.startsWith('/') ? url : '/' + url}\`;\n  };\n`;
    content = content.replace('const [loading, setLoading] = useState(false);', 'const [loading, setLoading] = useState(false);' + helper);
}

// 3. fetchProducts - just modify to also fetch cms
content = content.replace('const [apiProds] = await Promise.all([', 'const [apiProds, cmsRes] = await Promise.all([');
content = content.replace('CatalogApi.getProducts(query, category).catch(() => []),', 'CatalogApi.getProducts(query, category).catch(() => []),\n        CmsApi.getLandingConfig().catch(() => null)');
content = content.replace('const mappedApi = (apiProds || []).map(mapApiProduct);', 'if (cmsRes?.data) setCms(cmsRes.data);\n      const mappedApi = (apiProds || []).map(mapApiProduct);');

// 4. Categories array
const oldCats = `const categories = [
    { id: "all", label: isEn ? "All" : "Tout", isAll: true, icon: "✨" },
    { id: "watches", label: isEn ? "Watches" : "Montres", isAll: false, icon: "⌚️" },
    { id: "leather", label: isEn ? "Leather" : "Maroquinerie", isAll: false, icon: "👜" },
    { id: "fashion", label: isEn ? "Jewelry & Fashion" : "Bijoux & Mode", isAll: false, icon: "💍" },
    { id: "home", label: isEn ? "Home & Decor" : "Maison & Mobilier", isAll: false, icon: "🛋" },
    { id: "art", label: isEn ? "Art & Sculptures" : "Art & Décoration", isAll: false, icon: "🏺" },
    { id: "digital", label: isEn ? "Digital" : "Numérique", isAll: false, icon: "📱" },
  ];`;
const newCats = `const categories = [
    { id: "all", label: isEn ? "All" : "Tout", image: null, isAll: true, icon: "✨" },
    { id: "watches", label: isEn ? "Watches" : "Montres", image: require("../../../assets/products/watch-chrono.jpg"), isAll: false, icon: "⌚️" },
    { id: "leather", label: isEn ? "Leather" : "Maroquinerie", image: require("../../../assets/products/leather-tote.jpg"), isAll: false, icon: "👜" },
    { id: "fashion", label: isEn ? "Jewelry & Fashion" : "Bijoux & Mode", image: require("../../../assets/products/jewelry-gold.jpg"), isAll: false, icon: "💍" },
    { id: "home", label: isEn ? "Home & Decor" : "Maison & Mobilier", image: require("../../../assets/products/armchair.jpg"), isAll: false, icon: "🛋" },
    { id: "art", label: isEn ? "Art & Sculptures" : "Art & Décoration", image: require("../../../assets/products/art-bronze.jpg"), isAll: false, icon: "🏺" },
    { id: "digital", label: isEn ? "Digital" : "Numérique", image: require("../../../assets/products/digital-patterns.jpg"), isAll: false, icon: "📱" },
  ];`;
content = content.replace(oldCats, newCats);

// 5. Category Render
const oldCr = `<View style={{width: "100%", height: "100%", borderRadius: 27, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center"}}>
                      <Text style={{fontSize: 22}}>{(c as any).icon}</Text>
                    </View>`;
const newCr = `<View style={{width: "100%", height: "100%", borderRadius: 27, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", overflow: "hidden"}}>
                      {(c as any).image ? (
                        <Image source={(c as any).image} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
                      ) : (
                        <Text style={{fontSize: 22}}>{(c as any).icon}</Text>
                      )}
                    </View>`;
content = content.replace(oldCr, newCr);

// 6. Filtered logic
const oldFilt = 'const filtered = products;';
const newFilt = `const filtered = (cms?.featuredProducts || []).filter((p: any) => {
    const matchesCat = activeCat === "all" || p.category === activeCat;
    const matchesSearch = search.trim() === "" || (p.title || "").toLowerCase().includes(search.toLowerCase()) || (p.seller?.name || p.seller || "").toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });`;
content = content.replace(oldFilt, newFilt);

// 7. Seller and Image in Product rendering
content = content.replace(/\{prod\.seller\}/g, '{prod.seller?.name || prod.seller}');
content = content.replace(
  'source={prod.image || (isDark ? iconBrandDark : iconBrandLight)}',
  "source={typeof prod.image === 'string' ? { uri: resolveImageUrl(prod.image) } : (prod.image || (isDark ? iconBrandDark : iconBrandLight))}"
);
content = content.replace(
  'source={prod.image || (isDark ? iconBrandDark : iconBrandLight)}',
  "source={typeof prod.image === 'string' ? { uri: resolveImageUrl(prod.image) } : (prod.image || (isDark ? iconBrandDark : iconBrandLight))}"
);

// 8. Timeless Icons Images
content = content.replace(/\{icon\.image \? \(\n\s*<Image source=\{\{ uri: icon\.image \}\} style=\{\{ width: "100%", height: "100%", resizeMode: "cover" \}\} \/>/g, '{icon.image ? (\n                        <Image source={{ uri: resolveImageUrl(icon.image) }} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />');

// 9. Trusted Boutiques mapping
const oldShops = `[
              {
                name: "Maison Laurent",
                initials: "ML",
                specialty: "Maroquinerie & Bagagerie",
                rating: 4.9,
                reviews: 320,
                img1: iconBrandLight,
                img2: iconBrandLight,
              },
              {
                name: "Atelier d'Art & Fonderie",
                initials: "AG",
                specialty: "Sculptures & Bronze",
                rating: 4.9,
                reviews: 124,
                img1: iconBrandLight,
                img2: iconBrandLight,
              },
            ].map((shop, i) => (`;
const newShops = `(cms?.trustedShops || []).map((shop: any, i: number) => (`
content = content.replace(oldShops, newShops);

// 10. Trusted Boutiques Thumbnails
const oldThumb = `<View style={{ flexDirection: "row", gap: 4 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.canvas, overflow: "hidden" }}>
                      <Image source={shop.img1} style={{ width: "100%", height: "100%", resizeMode: "cover", opacity: 0.3 }} />
                    </View>
                    <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.canvas, overflow: "hidden" }}>
                      <Image source={shop.img2} style={{ width: "100%", height: "100%", resizeMode: "cover", opacity: 0.3 }} />
                    </View>
                  </View>`;
const newThumb = `<View style={{ flexDirection: "row", gap: 4 }}>
                    {(shop.products || []).slice(0, 2).map((img: string, j: number) => (
                      <View key={j} style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.canvas, overflow: "hidden" }}>
                        <Image source={{ uri: resolveImageUrl(img) }} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
                      </View>
                    ))}
                  </View>`;
content = content.replace(oldThumb, newThumb);

// 11. Array mapping fix
content = content.replace(/Array.from\(\{\s*length:\s*6\s*\}\)\.map\(\(\_, i\)\s*=>/g, 'Array.from({ length: 6 }).map((_: any, i: number) =>');
content = content.replace(/const prod = filtered\[i\];/g, 'const prod: any = filtered[i];');


fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', content);
console.log('Minimal fix applied');

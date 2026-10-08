const fs = require('fs');

let content = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');

function ensureReplace(search, replacement, desc) {
    if (!content.includes(search)) {
        console.error("FAIL: Could not find " + desc);
        process.exit(1);
    }
    content = content.replace(search, replacement);
    console.log("SUCCESS: Replaced " + desc);
}

// 1. Imports
ensureReplace(
    'import { CatalogApi, ProductItem } from "../../services/api";',
    'import { CatalogApi, CmsApi, ProductItem, API_BASE_URL } from "../../services/api";',
    'Imports'
);

// 2. States
ensureReplace(
    'const [loading, setLoading] = useState(false);',
    `const [cms, setCms] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Next.js serves images on port 3000
    const base = API_BASE_URL.replace(':3001/api', ':3000');
    return \`\${base}\${url.startsWith('/') ? url : '/' + url}\`;
  };`,
    'States'
);

// 3. fetchProducts
ensureReplace(
    'const apiProds = await CatalogApi.getProducts(query, category);',
    `const [apiProds, cmsRes] = await Promise.all([
        CatalogApi.getProducts(query, category).catch(() => []),
        CmsApi.getLandingConfig().catch(() => null)
      ]);
      if (cmsRes?.data) setCms(cmsRes.data);`,
    'fetchProducts'
);

// 4. Categories
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
const cS = content.indexOf('const categories = ['); const cE = content.indexOf('];', cS) + 2; content = content.substring(0, cS) + newCats + content.substring(cE); console.log('SUCCESS: Categories');

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
const crS = content.indexOf('{c.isAll ? ('); const crE = content.indexOf(')}', content.indexOf('{(c as any).icon}</Text>')) + 2; content = content.substring(0, crS) + newCr + content.substring(crE); console.log('SUCCESS: Category Render');

// 6. Filtered
ensureReplace(
    'const filtered = products;',
    `const filtered = (cms?.featuredProducts || []).filter((p: any) => {
    const matchesCat = activeCat === "all" || p.category === activeCat;
    const matchesSearch = search.trim() === "" || (p.title || "").toLowerCase().includes(search.toLowerCase()) || (p.seller?.name || p.seller || "").toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });`,
    'Filtered logic'
);

// 7. Seller and Image fix using full regex matching across the file
content = content.replace(/\{prod\.seller\}/g, '{prod.seller?.name || prod.seller}');
content = content.replace(
  /source=\{prod\.image \|\| \(isDark \? iconBrandDark : iconBrandLight\)\}/g,
  "source={typeof prod.image === 'string' ? { uri: resolveImageUrl(prod.image) } : (prod.image || (isDark ? iconBrandDark : iconBrandLight))}"
);
console.log("SUCCESS: Replaced Seller and Image renders globally");

// 8. Timeless Icons
const tStart = content.indexOf('{/* ==================== HERO SPOTLIGHT BANNER ==================== */}');
const tEndStr = '{isEn ? "Recommended for you" ';
const tEnd = content.indexOf(tEndStr);
if (tStart > -1 && tEnd > -1) {
    const recWrapper = content.lastIndexOf('2-COLUMN PRODUCT GRID ==================== */}', tEnd);
    if (recWrapper > -1) {
        const oldTimeless = content.substring(tStart, recWrapper);
        const newTimeless = `{/* ==================== TIMELESS ICONS ==================== */}
        {cms?.intemporelIcons?.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
            <View
              style={{
                backgroundColor: "#022B22",
                borderRadius: 24,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(212, 180, 131, 0.3)",
              }}
            >
              <View style={{ padding: 24 }}>
                <Text style={{ fontSize: 10, fontWeight: "800", letterSpacing: 1.2, color: colors.accent, textTransform: "uppercase", marginBottom: 6 }}>
                  {isEn ? "SELECTED COLLECTION" : "COLLECTION SÉLECTIONNÉE"}
                </Text>
                <Text style={{ fontFamily: Platform.OS === "android" ? "serif" : "Georgia", fontSize: 26, color: "#FFFFFF", fontWeight: "700", marginBottom: 6 }}>
                  {isEn ? "Timeless Icons" : "Icônes Intemporelles"}
                </Text>
                <Text style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.82)", lineHeight: 17, marginBottom: 16 }}>
                  {isEn ? "Exceptional pieces from yesterday, today, and tomorrow." : "Des pièces d'exception, hier, aujourd'hui et demain."}
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 12 }}>
                {(cms.intemporelIcons || []).map((icon: any, i: number) => (
                  <View key={i} style={{ width: 140 }}>
                    <View style={{ width: 140, height: 140, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: 8 }}>
                      {icon.image ? (
                        <Image source={{ uri: resolveImageUrl(icon.image) }} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
                      ) : null}
                    </View>
                    <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }} numberOfLines={1}>{icon.title}</Text>
                    <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }} numberOfLines={1}>{icon.subtitle}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}\n\n        `;
        content = content.replace(oldTimeless, newTimeless);
        console.log("SUCCESS: Replaced Timeless Icons");
    } else { console.error("FAIL: recWrapper not found"); process.exit(1); }
} else { console.error("FAIL: tStart/tEnd not found"); process.exit(1); }

// 9. Trusted Boutiques
const sStart = content.indexOf('{/* ==================== BOUTIQUES DE CONFIANCE (TRUSTED SHOPS) ==================== */}');
const sEndStr = '{/* ==================== COMMERCIAL PRODUCT REQUEST PROMPT ==================== */}';
const sEnd = content.indexOf(sEndStr);
if (sStart > -1 && sEnd > -1) {
    const oldShopsBlock = content.substring(sStart, sEnd);
    let newShops = oldShopsBlock;
    
    const bracketStart = newShops.indexOf('{[');
    const mapStart = newShops.indexOf('].map((shop, i) => (');
    if (bracketStart > -1 && mapStart > -1) {
        newShops = newShops.substring(0, bracketStart) + '{(cms?.trustedShops || [])' + newShops.substring(mapStart + 1);
        newShops = newShops.replace('.map((shop, i) => (', '.map((shop: any, i: number) => (');
        
        const rightActions = `{/* Right: Actions */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <Pressable style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.subtle }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: colors.text }}>Visiter</Text>
                  </Pressable>
                </View>`;
        const rightThumbnails = `{/* Right: Thumbnails & Actions */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {(shop.products || []).slice(0, 2).map((img: string, j: number) => (
                      <View key={j} style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.canvas, overflow: "hidden" }}>
                        <Image source={{ uri: resolveImageUrl(img) }} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
                      </View>
                    ))}
                  </View>
                  <Pressable style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.subtle }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: colors.text }}>Visiter</Text>
                  </Pressable>
                </View>`;
        newShops = newShops.replace(rightActions, rightThumbnails);
        
        // Add condition wrapper safely
        const vStart = newShops.indexOf('<View style={{ marginBottom: 32 }}>');
        if (vStart > -1) {
            newShops = newShops.substring(0, vStart) + '{cms?.trustedShops?.length > 0 && (\n        ' + newShops.substring(vStart);
            const vEnd = newShops.lastIndexOf('</View>');
            newShops = newShops.substring(0, vEnd + 7) + '\n        )}\n' + newShops.substring(vEnd + 7);
        }
        
        content = content.replace(oldShopsBlock, newShops);
        console.log("SUCCESS: Replaced Trusted Shops");
    } else { console.error("FAIL: Shops map not found"); process.exit(1); }
} else { console.error("FAIL: sStart/sEnd not found"); process.exit(1); }

// 10. Fix array any issues
content = content.replace(/Array.from\(\{\s*length:\s*6\s*\}\)\.map\(\(\_, i\)\s*=>/g, 'Array.from({ length: 6 }).map((_: any, i: number) =>');
content = content.replace(/const prod = filtered\[i\];/g, 'const prod: any = filtered[i];');

fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', content);
console.log("All done.");

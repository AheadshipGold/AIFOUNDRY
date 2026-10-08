const fs = require('fs');

const lines = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8').split('\n');

// HELPER: replace lines between startIdx and endIdx (inclusive)
function replaceLines(start, end, newLinesStr) {
    const newLines = newLinesStr.split('\n');
    lines.splice(start, end - start + 1, ...newLines);
}

// 1. Add CmsApi, API_BASE_URL (line 15-17)
for (let i=0; i<30; i++) {
    if (lines[i].includes('import { CatalogApi')) {
        lines[i] = 'import { CatalogApi, CmsApi, ProductItem, API_BASE_URL } from "../../services/api";';
        break;
    }
}

// 2. CMS State & resolveImageUrl
for (let i=50; i<100; i++) {
    if (lines[i].includes('const [loading, setLoading] = useState(false);')) {
        lines[i] = '  const [cms, setCms] = useState<any>(null);\n  const [loading, setLoading] = useState(false);\n  const resolveImageUrl = (url: string) => {\n    if (!url) return "";\n    if (url.startsWith("http")) return url;\n    const base = API_BASE_URL.replace("/api", "");\n    return `${base}${url.startsWith("/") ? url : "/" + url}`;\n  };';
        break;
    }
}

// 3. fetchProducts (search from 80 to 110)
let fStart = -1, fEnd = -1;
for (let i=70; i<130; i++) {
    if (lines[i].includes('const fetchProducts = async () => {')) fStart = i;
    if (fStart !== -1 && lines[i].includes('};') && i > fStart) { fEnd = i; break; }
}
if (fStart > -1 && fEnd > -1) {
    const newF = `  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = search.trim() ? search : undefined;
      const category = activeCat !== "all" ? activeCat : undefined;
      const [apiProds, cmsRes] = await Promise.all([
        CatalogApi.getProducts(query, category).catch(() => []),
        CmsApi.getLandingConfig().catch(() => null)
      ]);
      if (cmsRes?.data) setCms(cmsRes.data);
      const mappedApi = (apiProds || []).map(mapApiProduct);
      setProducts(mappedApi);
    } catch (err) {
      console.warn("API Error", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };`;
    replaceLines(fStart, fEnd, newF);
}

// 4. Categories (search from 100 to 130)
let catStart = -1, catEnd = -1;
for (let i=100; i<150; i++) {
    if (lines[i].includes('const categories = [')) catStart = i;
    if (catStart !== -1 && lines[i].includes('];') && i > catStart) { catEnd = i; break; }
}
if (catStart > -1 && catEnd > -1) {
    const newCat = `  const categories = [
    { id: "all", label: isEn ? "All" : "Tout", image: null, isAll: true, icon: "✨" },
    { id: "watches", label: isEn ? "Watches" : "Montres", image: require("../../../assets/products/watch-chrono.jpg"), isAll: false, icon: "⌚️" },
    { id: "leather", label: isEn ? "Leather" : "Maroquinerie", image: require("../../../assets/products/leather-tote.jpg"), isAll: false, icon: "👜" },
    { id: "fashion", label: isEn ? "Jewelry & Fashion" : "Bijoux & Mode", image: require("../../../assets/products/jewelry-gold.jpg"), isAll: false, icon: "💍" },
    { id: "home", label: isEn ? "Home & Decor" : "Maison & Mobilier", image: require("../../../assets/products/armchair.jpg"), isAll: false, icon: "🛋" },
    { id: "art", label: isEn ? "Art & Sculptures" : "Art & Décoration", image: require("../../../assets/products/art-bronze.jpg"), isAll: false, icon: "🏺" },
    { id: "digital", label: isEn ? "Digital" : "Numérique", image: require("../../../assets/products/digital-patterns.jpg"), isAll: false, icon: "📱" },
  ];`;
    replaceLines(catStart, catEnd, newCat);
}

// 5. Filtered
for (let i=120; i<160; i++) {
    if (lines[i].includes('const filtered = products;')) {
        lines[i] = `  const filtered = (cms?.featuredProducts || []).filter((p: any) => {
    const matchesCat = activeCat === "all" || p.category === activeCat;
    const matchesSearch = search.trim() === "" || (p.title || "").toLowerCase().includes(search.toLowerCase()) || (p.seller?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });`;
        break;
    }
}

// 6. Category Render (around 350-400)
let crStart = -1, crEnd = -1;
for (let i=350; i<450; i++) {
    if (lines[i].includes('{c.isAll ? (')) crStart = i;
    if (crStart !== -1 && lines[i].includes('{(c as any).icon}</Text>') && i > crStart) { crEnd = i + 2; break; }
}
if (crStart > -1 && crEnd > -1) {
    const newCr = `                  {c.isAll ? (
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 27,
                        backgroundColor: isActive ? colors.action : colors.surface,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        source={isDark ? iconBrandDark : iconBrandLight}
                        style={{ width: 28, height: 28, resizeMode: "contain" }}
                      />
                    </View>
                  ) : (
                    <View style={{width: "100%", height: "100%", borderRadius: 27, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", overflow: "hidden"}}>
                      {(c as any).image ? (
                        <Image source={(c as any).image} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
                      ) : (
                        <Text style={{fontSize: 22}}>{(c as any).icon}</Text>
                      )}
                    </View>
                  )}`;
    replaceLines(crStart, crEnd, newCr);
}

// 7. Timeless Icons block
let tStart = -1, tEnd = -1;
for (let i=380; i<550; i++) {
    if (lines[i] && lines[i].includes('HERO SPOTLIGHT BANNER')) tStart = i;
    if (tStart !== -1 && lines[i] && lines[i].includes('2-COLUMN PRODUCT GRID') && i > tStart) { tEnd = i - 1; break; }
}
if (tStart > -1 && tEnd > -1) {
    const newT = `        {/* ==================== TIMELESS ICONS ==================== */}
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
                {cms.intemporelIcons.map((icon: any, i: number) => (
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
        )}`;
    replaceLines(tStart, tEnd, newT);
}

// 8. Replace prod.seller and prod.image globally
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes('{prod.seller}')) {
        lines[i] = lines[i].replace('{prod.seller}', '{prod.seller?.name || prod.seller}');
    }
    if (lines[i].includes('source={prod.image || (isDark ? iconBrandDark : iconBrandLight)}')) {
        lines[i] = lines[i].replace('source={prod.image || (isDark ? iconBrandDark : iconBrandLight)}', "source={typeof prod.image === 'string' ? { uri: resolveImageUrl(prod.image) } : (prod.image || (isDark ? iconBrandDark : iconBrandLight))}");
    }
}

// 9. Trusted Shops Block
let sStart = -1, sEnd = -1;
for (let i=850; i<lines.length; i++) {
    if (lines[i].includes('TRUSTED BOUTIQUES')) sStart = i + 1; // <View style={{ marginBottom: 32 }}>
    if (sStart !== -1 && lines[i].includes('COMMERCIAL PRODUCT REQUEST PROMPT') && i > sStart) { sEnd = i - 2; break; } // </View>
}

if (sStart > -1 && sEnd > -1) {
    const oldShopsBlock = lines.slice(sStart, sEnd + 1).join('\n');
    // replace array with cms?.trustedShops
    let newShops = oldShopsBlock;
    const bracketStart = newShops.indexOf('{[');
    const mapStart = newShops.indexOf('].map((shop, i) => (');
    if (bracketStart > -1 && mapStart > -1) {
        newShops = newShops.substring(0, bracketStart) + '{((cms?.trustedShops as any[]) || [])' + newShops.substring(mapStart + 1);
    }
    // replace (shop, i) with (shop: any, i: number)
    newShops = newShops.replace('.map((shop, i) => (', '.map((shop: any, i: number) => (');
    
    // replace right actions
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
    
    // wrap with condition
    newShops = `{cms?.trustedShops?.length > 0 && (\n` + newShops + `\n)}`;
    
    replaceLines(sStart, sEnd, newShops);
}

fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', lines.join('\n'));
console.log("Bulletproof fix applied.");

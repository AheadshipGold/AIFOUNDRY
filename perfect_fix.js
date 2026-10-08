const fs = require('fs');

const lines = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8').split('\n');

function replaceLines(startLine, endLine, replacement) {
    const rLines = replacement.split('\n');
    lines.splice(startLine - 1, endLine - startLine + 1, ...rLines);
}

// 1. Add API_BASE_URL (Line 16)
replaceLines(16, 16, 'import { CatalogApi, CmsApi, ProductItem, API_BASE_URL } from "../../services/api";');

// 2. Add cms, resolveImageUrl (Lines 83)
const states = `  const [cms, setCms] = useState<any>(null);
  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = API_BASE_URL.replace('/api', '');
    return \`\${base}\${url.startsWith('/') ? url : '/' + url}\`;
  };`;
replaceLines(83, 83, states + '\n  const [loading, setLoading] = useState(false);');

// 3. fetchProducts (Lines 81 to 99 in ORIGINAL file, but because we just inserted lines, let's search dynamically from the start)
let fStart = lines.findIndex(l => l.includes('const fetchProducts = async () => {'));
let fEnd = lines.findIndex((l, i) => i > fStart && l.includes('};'));
const newFetch = `  const fetchProducts = async () => {
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
lines.splice(fStart, fEnd - fStart + 1, ...newFetch.split('\n'));

// 4. Categories array
let cStart = lines.findIndex(l => l.includes('const categories = ['));
let cEnd = lines.findIndex((l, i) => i > cStart && l.includes('];'));
const newCats = `  const categories = [
    { id: "all", label: isEn ? "All" : "Tout", image: null, isAll: true, icon: "✨" },
    { id: "watches", label: isEn ? "Watches" : "Montres", image: require("../../../assets/products/watch-chrono.jpg"), isAll: false, icon: "⌚️" },
    { id: "leather", label: isEn ? "Leather" : "Maroquinerie", image: require("../../../assets/products/leather-tote.jpg"), isAll: false, icon: "👜" },
    { id: "fashion", label: isEn ? "Jewelry & Fashion" : "Bijoux & Mode", image: require("../../../assets/products/jewelry-gold.jpg"), isAll: false, icon: "💍" },
    { id: "home", label: isEn ? "Home & Decor" : "Maison & Mobilier", image: require("../../../assets/products/armchair.jpg"), isAll: false, icon: "🛋" },
    { id: "art", label: isEn ? "Art & Sculptures" : "Art & Décoration", image: require("../../../assets/products/art-bronze.jpg"), isAll: false, icon: "🏺" },
    { id: "digital", label: isEn ? "Digital" : "Numérique", image: require("../../../assets/products/digital-patterns.jpg"), isAll: false, icon: "📱" },
  ];`;
lines.splice(cStart, cEnd - cStart + 1, ...newCats.split('\n'));

// 5. Filtered
let filtIdx = lines.findIndex(l => l.includes('const filtered = products;'));
lines.splice(filtIdx, 1); // delete it

let returnIdx = lines.findIndex(l => l.includes('return ('));
const newFilt = `  const filtered = (cms?.featuredProducts || []).filter((p: any) => {
    const matchesCat = activeCat === "all" || p.category === activeCat;
    const matchesSearch = search.trim() === "" || (p.title || "").toLowerCase().includes(search.toLowerCase()) || (p.seller?.name || p.seller || "").toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });`;
lines.splice(returnIdx, 0, ...newFilt.split('\n'));

// 6. Category Render
let crStart = lines.findIndex(l => l.includes('{c.isAll ? ('));
let crEnd = lines.findIndex((l, i) => i > crStart && l.includes('{(c as any).icon}</Text>')) + 2;
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
lines.splice(crStart, crEnd - crStart + 1, ...newCr.split('\n'));

// 7. Timeless Icons Block
let hStart = lines.findIndex(l => l.includes('{/* ==================== HERO SPOTLIGHT BANNER ==================== */}'));
let hEnd = lines.findIndex((l, i) => i > hStart && l.includes('{/* ==================== 2-COLUMN PRODUCT GRID ==================== */}')) - 1;
const newTimeless = `        {/* ==================== TIMELESS ICONS ==================== */}
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
        )}`;
lines.splice(hStart, hEnd - hStart + 1, ...newTimeless.split('\n'));

// 8. Find and replace `prod.seller` and `prod.image`
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{prod.seller}')) {
        lines[i] = lines[i].replace('{prod.seller}', '{prod.seller?.name || prod.seller}');
    }
    if (lines[i].includes('source={prod.image || (isDark ? iconBrandDark : iconBrandLight)}')) {
        lines[i] = lines[i].replace('source={prod.image || (isDark ? iconBrandDark : iconBrandLight)}', "source={typeof prod.image === 'string' ? { uri: resolveImageUrl(prod.image) } : (prod.image || (isDark ? iconBrandDark : iconBrandLight))}");
    }
}

// 9. Trusted Shops
let sStart = lines.findIndex(l => l.includes('{/* ==================== TRUSTED BOUTIQUES ==================== */}'));
let sEnd = lines.findIndex((l, i) => i > sStart && l.includes('{/* ==================== COMMERCIAL PRODUCT REQUEST PROMPT ==================== */}')) - 1;
const newShops = `        {/* ==================== TRUSTED BOUTIQUES ==================== */}
        {cms?.trustedShops?.length > 0 && (
        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              paddingHorizontal: 20,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                fontSize: 19,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {isEn ? "Trusted Boutiques" : "Boutiques de confiance"}
            </Text>

            <Pressable>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.action }}>
                {isEn ? "See all →" : "Voir tout →"}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
          >
            {(cms?.trustedShops || []).map((shop: any, i: number) => (
              <View
                key={i}
                style={{
                  width: 285,
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0 : 0.04,
                  shadowRadius: 6,
                  elevation: 1,
                }}
              >
                {/* Left: Avatar + Info */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: colors.subtle,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "rgba(212, 180, 131, 0.3)",
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
                      {shop.name ? shop.name.substring(0,2).toUpperCase() : 'AB'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontSize: 13, fontWeight: "700", color: colors.text }}
                      numberOfLines={1}
                    >
                      {shop.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 3,
                        backgroundColor: "rgba(212, 180, 131, 0.2)",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 10,
                        alignSelf: "flex-start",
                        marginTop: 2,
                      }}
                    >
                      <Text style={{ fontSize: 9 }}>👑</Text>
                      <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "800" }}>
                        Boutique Vérifiée
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Right: Thumbnails & Actions */}
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
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
        )}`;
lines.splice(sStart, sEnd - sStart + 1, ...newShops.split('\n'));

fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', lines.join('\n'));
console.log('Perfection achieved.');

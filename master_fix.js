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
    const helper = `\n  const resolveImageUrl = (url: string) => {\n    if (!url) return '';\n    if (url.startsWith('http')) return url;\n    const base = API_BASE_URL.replace('/api', '');\n    return \`\${base}\${url.startsWith('/') ? url : '/' + url}\`;\n  };\n`;
    content = content.replace('const [loading, setLoading] = useState(false);', 'const [cms, setCms] = useState<any>(null);\n  const [loading, setLoading] = useState(false);' + helper);
}

// 3. Update useEffect to fetch CMS
const useEffectStart = content.indexOf('const fetchProducts = async () => {');
const useEffectEnd = content.indexOf('};', useEffectStart);
if (useEffectStart > -1 && useEffectEnd > -1) {
    const newUseEffect = `const fetchProducts = async () => {
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
    `;
    const oldUseEffect = content.substring(useEffectStart, useEffectEnd + 2);
    content = content.replace(oldUseEffect, newUseEffect + '}');
}

// 4. Update Categories
const catStart = content.indexOf('const categories = [');
const catEnd = content.indexOf('];', catStart) + 2;
if (catStart > -1) {
    const newCat = `const categories = [
      { id: "all", label: isEn ? "All" : "Tout", image: null, isAll: true, icon: "✨" },
      { id: "watches", label: isEn ? "Watches" : "Montres", image: require("../../../assets/products/watch-chrono.jpg"), isAll: false, icon: "⌚️" },
      { id: "leather", label: isEn ? "Leather" : "Maroquinerie", image: require("../../../assets/products/leather-tote.jpg"), isAll: false, icon: "👜" },
      { id: "fashion", label: isEn ? "Jewelry & Fashion" : "Bijoux & Mode", image: require("../../../assets/products/jewelry-gold.jpg"), isAll: false, icon: "💍" },
      { id: "home", label: isEn ? "Home & Decor" : "Maison & Mobilier", image: require("../../../assets/products/armchair.jpg"), isAll: false, icon: "🛋" },
      { id: "art", label: isEn ? "Art & Sculptures" : "Art & Décoration", image: require("../../../assets/products/art-bronze.jpg"), isAll: false, icon: "🏺" },
      { id: "digital", label: isEn ? "Digital" : "Numérique", image: require("../../../assets/products/digital-patterns.jpg"), isAll: false, icon: "📱" },
    ];`;
    content = content.substring(0, catStart) + newCat + content.substring(catEnd);
}

// 5. Update Categories rendering to use image
const catRenderOld = `{c.isAll ? (
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
                    <View style={{width: "100%", height: "100%", borderRadius: 27, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center"}}>
                      <Text style={{fontSize: 22}}>{(c as any).icon}</Text>
                    </View>
                  )}`;
const catRenderNew = `{c.isAll ? (
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
content = content.replace(catRenderOld, catRenderNew);

// 6. Timeless Icons block replacement
const tStart = content.indexOf('{/* ==================== HERO SPOTLIGHT BANNER ==================== */}');
const tEnd = content.indexOf('{isEn ? "Recommended for you"');
if (tStart > -1 && tEnd > -1) {
    const recWrapper = content.lastIndexOf('<View style={{ paddingHorizontal: 20 }}>', tEnd);
    if (recWrapper > -1) {
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
        )}\n\n        `;
        content = content.substring(0, tStart) + newTimeless + content.substring(recWrapper);
    }
}

// 7. Update filtered to use cms?.featuredProducts
const oldFiltered = 'const filtered = products;';
const newFiltered = `  const filtered = (cms?.featuredProducts || []).filter((p: any) => {
    const matchesCat = activeCat === "all" || p.category === activeCat;
    const matchesSearch =
      search.trim() === "" ||
      (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.seller?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });`;
content = content.replace(oldFiltered, newFiltered);

// 8. Fix {prod.seller} Object Issue
content = content.replace(/\{prod\.seller\}/g, '{prod.seller?.name || prod.seller}');

// 9. Fix prod.image Object Issue
content = content.replace(
  'source={prod.image || (isDark ? iconBrandDark : iconBrandLight)}',
  "source={typeof prod.image === 'string' ? { uri: resolveImageUrl(prod.image) } : (prod.image || (isDark ? iconBrandDark : iconBrandLight))}"
);
content = content.replace(
  'source={prod.image || (isDark ? iconBrandDark : iconBrandLight)}',
  "source={typeof prod.image === 'string' ? { uri: resolveImageUrl(prod.image) } : (prod.image || (isDark ? iconBrandDark : iconBrandLight))}"
);

// 10. Update Trusted Shops
const shopOld = content.substring(content.indexOf('{[\\n                {\\n                  name: "Maison Laurent"'), content.indexOf('.map((shop, i) => ('));
if (shopOld && shopOld.length > 10) {
    content = content.replace(shopOld, '(cms?.trustedShops || [])');
}
content = content.replace('.map((shop, i) => (', '.map((shop: any, i: number) => (');

const innerOldStart = '{/* Right: Actions */}';
const innerOldEnd = '</View>\\n              ))}';
const innerOldIndex = content.indexOf(innerOldStart);
if (innerOldIndex > -1) {
    const endIdxOfInner = content.indexOf('</View>', innerOldIndex + innerOldStart.length);
    if (endIdxOfInner > -1) {
        const innerOld = content.substring(innerOldIndex, endIdxOfInner + '</View>'.length);
        const newInner = `{/* Right: Thumbnails & Actions */}
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
        content = content.replace(innerOld, newInner);
    }
}

const trustedStartStr = '{/* ==================== TRUSTED BOUTIQUES ==================== */}';
const trustedStartIndex = content.indexOf(trustedStartStr);
if (trustedStartIndex > -1) {
    const trustedEndStr = '</ScrollView>';
    const trustedEndIndex = content.indexOf(trustedEndStr, trustedStartIndex);
    if (trustedEndIndex > -1) {
        const viewEndIndex = content.indexOf('</View>', trustedEndIndex);
        if (viewEndIndex > -1) {
            const trustedOld = content.substring(trustedStartIndex, viewEndIndex + '</View>'.length);
            if (!trustedOld.includes('cms?.trustedShops?.length > 0')) {
                const trustedNew = `{cms?.trustedShops?.length > 0 && (\n` + trustedOld + `\n)}`;
                content = content.replace(trustedOld, trustedNew);
            }
        }
    }
}

fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', content);
console.log("Master fix applied.");

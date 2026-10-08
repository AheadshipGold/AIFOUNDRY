const fs = require('fs');

let content = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');

// 1. Fix Categories (replace the entire categories array to fix the "??" encoding issue)
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
    console.log('Categories fixed');
}

// 2. Fix Trusted Shops Images (Relative URLs like /products/... need the API URL in React Native)
// We'll add a helper function at the top of the component
if (!content.includes('resolveImageUrl')) {
    const helper = `\n  const resolveImageUrl = (url: string) => {\n    if (!url) return '';\n    if (url.startsWith('http')) return url;\n    return \`http://10.0.2.2:3001\${url.startsWith('/') ? url : '/' + url}\`;\n  };\n`;
    content = content.replace('const [loading, setLoading] = useState(false);', 'const [loading, setLoading] = useState(false);' + helper);
    
    // update the image source
    content = content.replace(/source=\{\{ uri: img \}\}/g, 'source={{ uri: resolveImageUrl(img) }}');
    console.log('Trusted shops images fixed');
}

// 3. Fix Timeless Icons (The previous script failed to find it due to encoding)
// Let's find it by a more robust marker
const timelessMarkerStart = '{/* ==================== TIMELESS ICONS ==================== */}';
const timelessMarkerEnd = '{/* ==================== FOR YOU ==================== */}';
const tStart = content.indexOf(timelessMarkerStart);
const tEnd = content.indexOf(timelessMarkerEnd);

if (tStart > -1 && tEnd > -1) {
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
        )}

        `;
    content = content.substring(0, tStart) + newTimeless + content.substring(tEnd);
    console.log('Timeless Icons fixed');
}

fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', content);

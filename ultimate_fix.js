const fs = require('fs');

let content = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');
const lines = content.split('\n');

// 1. Remove the old HERO SPOTLIGHT BANNER (from {/* ==================== HERO SPOTLIGHT BANNER ==================== */} to the start of "Recommended for you")
const heroStartIdx = lines.findIndex(l => l.includes('HERO SPOTLIGHT BANNER'));
const recommendedStrIdx = lines.findIndex(l => l.includes('Recommended for you'));
let recommendedViewIdx = recommendedStrIdx;
while (recommendedViewIdx > heroStartIdx && !lines[recommendedViewIdx].includes('<View')) {
    recommendedViewIdx--;
}
let recommendedWrapperIdx = recommendedViewIdx - 1;
while (recommendedWrapperIdx > heroStartIdx && !lines[recommendedWrapperIdx].includes('<View style={{ paddingHorizontal: 20 }}>')) {
    recommendedWrapperIdx--;
}

// 2. Remove the NEW TIMELESS ICONS block I inserted earlier to avoid double insertion
const newTimelessStartIdx = lines.findIndex(l => l.includes('{/* ==================== TIMELESS ICONS ==================== */}'));

let finalLines = [];
if (newTimelessStartIdx > -1 && newTimelessStartIdx < heroStartIdx) {
    // I inserted it before hero. So delete from newTimelessStartIdx to recommendedWrapperIdx
    finalLines = [...lines.slice(0, newTimelessStartIdx), ...lines.slice(recommendedWrapperIdx)];
} else {
    // Just delete from heroStartIdx to recommendedWrapperIdx
    finalLines = [...lines.slice(0, heroStartIdx), ...lines.slice(recommendedWrapperIdx)];
}

// Write the fixed file first
fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', finalLines.join('\n'));

// Now we read it again to cleanly insert the NEW Timeless Icons block and fix images
content = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');

// A. Fix API URL for images
if (!content.includes('import { API_BASE_URL }')) {
    content = content.replace('import { CatalogApi, CmsApi, ProductItem } from "../../services/api";', 'import { CatalogApi, CmsApi, ProductItem, API_BASE_URL } from "../../services/api";');
}
if (!content.includes('const resolveImageUrl')) {
    const helper = `\n  const resolveImageUrl = (url: string) => {\n    if (!url) return '';\n    if (url.startsWith('http')) return url;\n    const base = API_BASE_URL.replace('/api', '');\n    return \`\${base}\${url.startsWith('/') ? url : '/' + url}\`;\n  };\n`;
    content = content.replace('const [loading, setLoading] = useState(false);', 'const [loading, setLoading] = useState(false);' + helper);
    // Replace source={{ uri: img }} with resolveImageUrl
    content = content.replace(/source=\{\{\s*uri:\s*img\s*\}\}/g, 'source={{ uri: resolveImageUrl(img) }}');
    // For icon.image in timeless icons, we will use it natively in the block
}

// B. Insert the correct Timeless Icons block right before Recommended For You
const recIdx = content.indexOf('{isEn ? "Recommended for you" : "Recommandé pour vous"}');
// Find the exact wrapper of Recommended for you
const wrapperStart = content.lastIndexOf('<View style={{ paddingHorizontal: 20 }}>', recIdx);
if (wrapperStart > -1) {
    const newTimelessBlock = `        {/* ==================== TIMELESS ICONS ==================== */}
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
        )}\n\n`;
    content = content.substring(0, wrapperStart) + newTimelessBlock + content.substring(wrapperStart);
}

// C. Fix "Recommended for you" mapping to use cms.featuredProducts instead of CatalogApi
// In the current code, it's mapping over `filtered.map((prod...` or `products.map...`
const filteredStart = content.indexOf('const filtered = products;');
if (filteredStart > -1) {
    // Replace `const filtered = products;` with `const filtered = cms?.featuredProducts || [];`
    content = content.replace('const filtered = products;', 'const filtered = cms?.featuredProducts || [];');
}

fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', content);
console.log("All fixes applied successfully.");

const fs = require('fs');

let content = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');

// 1. Replace Trusted Shops array definition
const startIdx = content.indexOf('{[');
const endIdx = content.indexOf('].map((shop, i) => (');

if (startIdx > -1 && endIdx > -1) {
    const oldArr = content.substring(startIdx, endIdx + 1);
    if (oldArr.includes('Maison Laurent')) {
        content = content.replace(oldArr, '(cms?.trustedShops || [])');
        console.log("replaced trusted shops array");
    }
}

// Replace the inner action block
const innerOldStart = '{/* Right: Actions */}';
const innerOldEnd = '</View>\\n              ))}';

const innerOldIndex = content.indexOf(innerOldStart);
if (innerOldIndex > -1) {
    // safely search for the end tag
    const endIdxOfInner = content.indexOf('</View>', innerOldIndex + innerOldStart.length);
    if (endIdxOfInner > -1) {
        const innerOld = content.substring(innerOldIndex, endIdxOfInner + '</View>'.length);
        const newInner = `{/* Right: Thumbnails & Actions */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {(shop.products || []).slice(0, 2).map((img, j) => (
                      <View key={j} style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.canvas, overflow: "hidden" }}>
                        <Image source={{ uri: img }} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
                      </View>
                    ))}
                  </View>
                  <Pressable style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.subtle }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: colors.text }}>Visiter</Text>
                  </Pressable>
                </View>`;
        content = content.replace(innerOld, newInner);
        console.log("replaced inner actions");
    }
}

// Wrap trusted shops conditionally
const trustedStartStr = '{/* ==================== TRUSTED BOUTIQUES ==================== */}';
const trustedStartIndex = content.indexOf(trustedStartStr);
if (trustedStartIndex > -1) {
    const trustedEndStr = '</ScrollView>';
    const trustedEndIndex = content.indexOf(trustedEndStr, trustedStartIndex);
    if (trustedEndIndex > -1) {
        // find the closing View after ScrollView
        const viewEndIndex = content.indexOf('</View>', trustedEndIndex);
        if (viewEndIndex > -1) {
            const trustedOld = content.substring(trustedStartIndex, viewEndIndex + '</View>'.length);
            if (!trustedOld.includes('cms?.trustedShops?.length > 0')) {
                const trustedNew = `{cms?.trustedShops?.length > 0 && (\n<View>` + trustedOld + `</View>\n)}`;
                // Actually, just wrap the whole thing inside a fragment or conditional
                content = content.replace(trustedOld, `{cms?.trustedShops?.length > 0 && (\n` + trustedOld + `\n)}`);
                console.log("wrapped trusted shops");
            }
        }
    }
}

// Replace Timeless Icons
const timelessStartStr = '{/* ==================== TIMELESS ICONS ==================== */}';
const timelessEndStr = '{/* ==================== FOR YOU ==================== */}';
const timelessStartIndex = content.indexOf(timelessStartStr);
const timelessEndIndex = content.indexOf(timelessEndStr);
if (timelessStartIndex > -1 && timelessEndIndex > -1) {
    const timelessOld = content.substring(timelessStartIndex, timelessEndIndex);
    const timelessNew = `{/* ==================== TIMELESS ICONS ==================== */}
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
                  {isEn ? "SELECTED COLLECTION" : "COLLECTION SELECTIONNEE"}
                </Text>
                <Text style={{ fontFamily: Platform.OS === "android" ? "serif" : "Georgia", fontSize: 26, color: "#FFFFFF", fontWeight: "700", marginBottom: 6 }}>
                  {isEn ? "Timeless Icons" : "Icones Intemporelles"}
                </Text>
                <Text style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.82)", lineHeight: 17, marginBottom: 16 }}>
                  {isEn ? "Exceptional pieces from yesterday, today, and tomorrow." : "Des pieces d'exception, hier, aujourd'hui et demain."}
                </Text>
                <Pressable onPress={onOpenNeed} style={({ pressed }) => [{ alignSelf: "flex-start", backgroundColor: "#0D4A38", borderWidth: 1, borderColor: "rgba(212, 180, 131, 0.6)", paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
                  <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
                    {isEn ? "Discover Collection ->" : "Decouvrir la selection ->"}
                  </Text>
                </Pressable>
              </View>
              {/* Render dynamic items in a swiper or list */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 12 }}>
                {cms.intemporelIcons.map((icon, i) => (
                  <View key={i} style={{ width: 140 }}>
                    <View style={{ width: 140, height: 140, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: 8 }}>
                      {icon.image ? (
                        <Image source={{ uri: icon.image }} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
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
    content = content.replace(timelessOld, timelessNew);
    console.log("replaced timeless icons");
}

fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', content);
console.log('Done rewriting blocks');

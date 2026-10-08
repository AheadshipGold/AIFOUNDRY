import re

with open('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace Trusted Shops
shops_match = re.search(r'\[\s*\{\s*name:\s*"Maison Laurent"[\s\S]*?\].map\(\(shop, i\) => \(', content)
if shops_match:
    old_shops = shops_match.group(0)
    new_shops = '(cms?.trustedShops || []).map((shop: any, i: number) => ('
    content = content.replace(old_shops, new_shops)
    print("Replaced shops array mapping")

# Update shop inner block to include images
shop_inner_match = re.search(r'\{/\* Right: Actions \*/\}[\s\S]*?Visiter</Text>\s*</Pressable>\s*</View>', content)
if shop_inner_match:
    old_inner = shop_inner_match.group(0)
    new_inner = '''{/* Right: Thumbnails & Actions */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {(shop.products || []).slice(0, 2).map((img: string, j: number) => (
                      <View key={j} style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.canvas, overflow: "hidden" }}>
                        <Image source={{ uri: img }} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
                      </View>
                    ))}
                  </View>
                  <Pressable style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.subtle }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: colors.text }}>Visiter</Text>
                  </Pressable>
                </View>'''
    content = content.replace(old_inner, new_inner)
    print("Replaced shop inner")

# Wrap the Trusted Shops block so it only renders if cms?.trustedShops?.length > 0
trusted_shops_full = re.search(r'\{/\* ==================== TRUSTED BOUTIQUES ==================== \*/\}[\s\S]*?</ScrollView>\s*</View>', content)
if trusted_shops_full:
    old_full = trusted_shops_full.group(0)
    new_full = '{cms?.trustedShops?.length > 0 && (\n' + old_full + '\n)}'
    content = content.replace(old_full, new_full)
    print("Wrapped trusted shops")


# 2. Replace Intemporelles (Timeless Icons)
# Wait, Timeless icons is a hardcoded view.
timeless_match = re.search(r'\{/\* ==================== TIMELESS ICONS ==================== \*/\}[\s\S]*?{/\* ==================== FOR YOU ==================== \*/\}', content)
if timeless_match:
    old_timeless = timeless_match.group(0)
    new_timeless = '''{/* ==================== TIMELESS ICONS ==================== */}
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
                <Pressable onPress={onOpenNeed} style={({ pressed }) => [{ alignSelf: "flex-start", backgroundColor: "#0D4A38", borderWidth: 1, borderColor: "rgba(212, 180, 131, 0.6)", paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
                  <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
                    {isEn ? "Discover Collection ?" : "Découvrir la sélection ?"}
                  </Text>
                </Pressable>
              </View>
              {/* Render dynamic items in a swiper or list */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 12 }}>
                {cms.intemporelIcons.map((icon: any, i: number) => (
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

        {/* ==================== FOR YOU ==================== */}
'''
    content = content.replace(old_timeless, new_timeless)
    print("Replaced Timeless Icons")

with open('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

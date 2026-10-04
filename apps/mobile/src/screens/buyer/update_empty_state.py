import re

with open("BuyerHomeScreen.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add empty state
grid_start = '''<View style={{ flexDirection: "row", gap: 12 }}>'''
empty_state = '''{filtered.length === 0 && !loading ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🍃</Text>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 8, fontFamily: Platform.OS === "android" ? "serif" : "Georgia" }}>
                {isEn ? "No creations found" : "Aucune création trouvée"}
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20 }}>
                {isEn 
                  ? "We couldn't find any creations matching your search. Try different keywords or browse all categories." 
                  : "Nous n'avons trouvé aucune création correspondant à votre recherche. Essayez d'autres mots-clés ou parcourez toutes les catégories."}
              </Text>
            </View>
          ) : loading ? (
            <View style={{ paddingVertical: 60, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: 12 }}>'''

content = content.replace(grid_start, empty_state)

# Close the new conditional block at the end of the grid
grid_end_regex = r'(</View>\s*</View>\s*</ScrollView>\s*</View>\s*\);\s*})'
match = re.search(grid_end_regex, content)
if match:
    content = content[:match.start()] + ')}' + '\n          ' + content[match.start():]

# 2. Fix image render in the grid (there are two columns, so two places to replace)
image_render = '''<Image
                          source={prod.image}
                          style={{
                            width: "100%",
                            height: "100%",
                            resizeMode: "cover",
                          }}
                        />'''
image_render_new = '''<Image
                          source={prod.image || (isDark ? iconBrandDark : iconBrandLight)}
                          style={{
                            width: "100%",
                            height: "100%",
                            resizeMode: prod.image ? "cover" : "contain",
                            opacity: prod.image ? 1 : 0.3,
                          }}
                        />'''
content = content.replace(image_render, image_render_new)

with open("BuyerHomeScreen.tsx", "w", encoding="utf-8") as f:
    f.write(content)

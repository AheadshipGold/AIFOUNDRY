import re

with open("BuyerHomeScreen.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove img1 and img2 properties from the boutiques array
content = re.sub(r'\s*img1:\s*img[A-Za-z]+,\s*img2:\s*img[A-Za-z]+,', '', content)

old_imgs = '''{/* Right: 2 product preview images */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Image
                      source={shop.img1}
                      style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                    />
                  </View>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Image
                      source={shop.img2}
                      style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                    />
                  </View>
                </View>'''

new_imgs = '''{/* Right: Actions */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <Pressable style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.subtle }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: colors.text }}>Visiter</Text>
                  </Pressable>
                </View>'''

content = content.replace(old_imgs, new_imgs)

with open("BuyerHomeScreen.tsx", "w", encoding="utf-8") as f:
    f.write(content)

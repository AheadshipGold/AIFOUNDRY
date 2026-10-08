const fs = require('fs');
let c = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');

const sIdx = c.indexOf('{/* Right: Actions */}');
if (sIdx > -1) {
    const eIdx = c.indexOf('</View>', sIdx) + 7;
    const oldActions = c.substring(sIdx, eIdx);
    
    const newActions = `{/* Right: Thumbnails & Actions */}
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
    
    c = c.replace(oldActions, newActions);
    fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', c);
    console.log("Fixed thumbnails.");
} else {
    console.log("Could not find right actions block");
}

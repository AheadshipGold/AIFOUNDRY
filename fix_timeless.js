const fs = require('fs');

let content = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');

const tStart = content.indexOf('<View style={{ paddingHorizontal: 20, marginBottom: 24 }}>');
const tEnd = content.indexOf('<View style={{ paddingHorizontal: 20, marginBottom: 24 }}>', tStart + 10);
if (tStart > -1 && tEnd > -1) {
    const newTimeless = `        {cms?.intemporelIcons?.length > 0 && (
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
    fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', content);
} else {
    console.log("Could not find start/end", tStart, tEnd);
}

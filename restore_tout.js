const fs = require('fs');
let c = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');

const regex = /<View style=\{\{width: "100%", height: "100%", borderRadius: 27, backgroundColor: colors\.surface, alignItems: "center", justifyContent: "center", overflow: "hidden"\}\}>[\s\S]*?<\/View>/;

const replacementStr = `{(c as any).isAll ? (
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
                        <Image source={(c as any).image} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
                      </View>
                    )}`;

if (regex.test(c)) {
  c = c.replace(regex, replacementStr);
  fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', c);
  console.log("Restored the exact Tout circle styling!");
} else {
  console.log("Target string not found with regex.");
}

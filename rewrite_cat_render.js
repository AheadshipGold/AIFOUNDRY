const fs = require('fs');
const file = 'apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldRender = `{c.isAll ? (
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

const newRender = `{c.isAll ? (
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

content = content.replace(oldRender, newRender);
fs.writeFileSync(file, content);
console.log('Category render updated');

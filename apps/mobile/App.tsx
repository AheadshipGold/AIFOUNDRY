import React from "react";
import { View, Text } from "react-native";
import { DesignProvider, useDesign } from "./src/design-system/provider";
import ComponentGallery from "./src/design-system/gallery";

function Content() {
  const { colors, t } = useDesign();
  if (__DEV__) return <ComponentGallery />;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.canvas,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: colors.text }}>AI Foundry</Text>
      <Text style={{ color: colors.muted }}>{t.subtitle}</Text>
    </View>
  );
}
export default function App() {
  return (
    <DesignProvider>
      <Content />
    </DesignProvider>
  );
}

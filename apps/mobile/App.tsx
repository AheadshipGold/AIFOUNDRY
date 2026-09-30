import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { DesignProvider, useDesign } from "./src/design-system/provider";
import ComponentGallery from "./src/design-system/gallery";

// Screens
import BuyerHomeScreen from "./src/screens/buyer/BuyerHomeScreen";
import RequestNeedScreen from "./src/screens/buyer/RequestNeedScreen";
import SellerDashboardScreen from "./src/screens/seller/SellerDashboardScreen";
import SellerCashbookScreen from "./src/screens/seller/SellerCashbookScreen";

function MainNavigator() {
  const { colors, mode, locale } = useDesign();
  const isEn = locale === "en";

  // App Navigation State
  const [universe, setUniverse] = useState<"buyer" | "seller">("buyer");
  const [currentScreen, setCurrentScreen] = useState<string>("home");
  const [showGallery, setShowGallery] = useState(false);

  // If developer toggles the component gallery
  if (showGallery) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
        <Pressable
          onPress={() => setShowGallery(false)}
          style={{
            padding: 12,
            backgroundColor: colors.action,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>
            ← Retour à la véritable application Ojarket
          </Text>
        </Pressable>
        <ComponentGallery />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.canvas}
      />

      {/* Screen Body */}
      <View style={{ flex: 1 }}>
        {universe === "buyer" ? (
          /* Universe Acheteur */
          currentScreen === "need" ? (
            <RequestNeedScreen
              onBack={() => setCurrentScreen("home")}
              onSubmitted={() => setCurrentScreen("home")}
            />
          ) : (
            <BuyerHomeScreen
              onSelectProduct={(prod) => {}}
              onOpenNeed={() => setCurrentScreen("need")}
              onOpenCart={() => {}}
              onSwitchToSeller={() => {
                setUniverse("seller");
                setCurrentScreen("dashboard");
              }}
            />
          )
        ) : (
          /* Universe Vendeur Pro */
          currentScreen === "cashbook" ? (
            <SellerCashbookScreen
              onBack={() => setCurrentScreen("dashboard")}
            />
          ) : (
            <SellerDashboardScreen
              onOpenCashbook={() => setCurrentScreen("cashbook")}
              onOpenOrders={() => setCurrentScreen("cashbook")}
              onSwitchToBuyer={() => {
                setUniverse("buyer");
                setCurrentScreen("home");
              }}
            />
          )
        )}
      </View>

      {/* Native Bottom Navigation Bar (5 tabs) */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          paddingVertical: 10,
          paddingBottom: Platform.OS === "ios" ? 22 : 12,
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {universe === "buyer" ? (
          <>
            {/* Tab 1: Découvrir */}
            <Pressable
              onPress={() => setCurrentScreen("home")}
              style={{ alignItems: "center", gap: 3 }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: currentScreen === "home" ? colors.action : colors.muted,
                }}
              >
                ⌂
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: currentScreen === "home" ? "700" : "500",
                  color: currentScreen === "home" ? colors.action : colors.muted,
                }}
              >
                {isEn ? "Discover" : "Découvrir"}
              </Text>
            </Pressable>

            {/* Tab 2: Besoin D02 */}
            <Pressable
              onPress={() => setCurrentScreen("need")}
              style={{ alignItems: "center", gap: 3 }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: currentScreen === "need" ? colors.action : colors.muted,
                }}
              >
                ✦
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: currentScreen === "need" ? "700" : "500",
                  color: currentScreen === "need" ? colors.action : colors.muted,
                }}
              >
                {isEn ? "Custom Need" : "Sur-mesure"}
              </Text>
            </Pressable>

            {/* Tab 3: Bascule Vendeur */}
            <Pressable
              onPress={() => {
                setUniverse("seller");
                setCurrentScreen("dashboard");
              }}
              style={{ alignItems: "center", gap: 3 }}
            >
              <Text style={{ fontSize: 16, color: colors.accent }}>◈</Text>
              <Text style={{ fontSize: 10, fontWeight: "600", color: colors.accent }}>
                {isEn ? "Seller OS" : "Espace Vendeur"}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Tab 1: Dashboard Vendeur */}
            <Pressable
              onPress={() => setCurrentScreen("dashboard")}
              style={{ alignItems: "center", gap: 3 }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: currentScreen === "dashboard" ? colors.action : colors.muted,
                }}
              >
                ◫
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: currentScreen === "dashboard" ? "700" : "500",
                  color: currentScreen === "dashboard" ? colors.action : colors.muted,
                }}
              >
                {isEn ? "Dashboard" : "Tableau de bord"}
              </Text>
            </Pressable>

            {/* Tab 2: Caisse & FinOps */}
            <Pressable
              onPress={() => setCurrentScreen("cashbook")}
              style={{ alignItems: "center", gap: 3 }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: currentScreen === "cashbook" ? colors.action : colors.muted,
                }}
              >
                ◈
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: currentScreen === "cashbook" ? "700" : "500",
                  color: currentScreen === "cashbook" ? colors.action : colors.muted,
                }}
              >
                {isEn ? "Cashbook" : "Caisse FinOps"}
              </Text>
            </Pressable>

            {/* Tab 3: Bascule Acheteur */}
            <Pressable
              onPress={() => {
                setUniverse("buyer");
                setCurrentScreen("home");
              }}
              style={{ alignItems: "center", gap: 3 }}
            >
              <Text style={{ fontSize: 16, color: colors.text }}>⌂</Text>
              <Text style={{ fontSize: 10, fontWeight: "600", color: colors.text }}>
                {isEn ? "Buyer Mode" : "Mode Acheteur"}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <DesignProvider>
      <MainNavigator />
    </DesignProvider>
  );
}

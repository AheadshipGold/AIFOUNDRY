import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { DesignProvider, useDesign } from "./src/design-system/provider";

import BuyerHomeScreen from "./src/screens/buyer/BuyerHomeScreen";
import SearchScreen from "./src/screens/buyer/SearchScreen";
import RequestNeedScreen from "./src/screens/buyer/RequestNeedScreen";
import PurchasesScreen from "./src/screens/buyer/PurchasesScreen";
import ProfileScreen from "./src/screens/buyer/ProfileScreen";

import SellerDashboardScreen from "./src/screens/seller/SellerDashboardScreen";
import SellerOrdersScreen from "./src/screens/seller/SellerOrdersScreen";
import SellerCashbookScreen from "./src/screens/seller/SellerCashbookScreen";
import SellerOpportunitiesScreen from "./src/screens/seller/SellerOpportunitiesScreen";
import SellerShopScreen from "./src/screens/seller/SellerShopScreen";

import AuthModal, { restoreSession, clearSession } from "./src/components/auth/AuthModal";
import SellerOnboardingModal from "./src/components/seller/SellerOnboardingModal";
import ProductDetailModal from "./src/components/product/ProductDetailModal";
import { startPeriodicSync, stopPeriodicSync } from "./src/services/offlineSync";
import { type AuthUser, getAuthToken } from "./src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Universe = "buyer" | "seller";

const BottomNav = ({ 
  universe, 
  currentScreen, 
  setCurrentScreen 
}: { 
  universe: Universe; 
  currentScreen: string; 
  setCurrentScreen: (s: string) => void;
}) => {
  const insets = useSafeAreaInsets();
  const { colors, locale, mode } = useDesign();
  const isEn = locale === "en";
  const isDark = mode === "dark";

  const buyerTabs = [
    { key: "home", label: isEn ? "Discover" : "Découvrir", icon: "❖" },
    { key: "search", label: isEn ? "Search" : "Rechercher", icon: "🔍" },
    { key: "need", label: isEn ? "Requests" : "Demandes", icon: "✦" },
    { key: "purchases", label: isEn ? "Purchases" : "Achats", icon: "🛍" },
    { key: "profile", label: isEn ? "Profile" : "Profil", icon: "👤" },
  ];

  const sellerTabs = [
    { key: "dashboard", label: isEn ? "Today" : "Aujourd'hui", icon: "◈" },
    { key: "orders", label: isEn ? "Orders" : "Commandes", icon: "☵" },
    { key: "cashbook", label: isEn ? "Cashbook" : "Caisse", icon: "⚿" },
    { key: "opportunities", label: isEn ? "Requests" : "Demandes", icon: "✦" },
    { key: "shop", label: isEn ? "Atelier" : "Atelier", icon: "🏛" },
  ];

  const tabs = universe === "buyer" ? buyerTabs : sellerTabs;

  return (
    <View 
      style={[
        styles.navContainer, 
        { 
          backgroundColor: colors.surface, 
          borderTopColor: colors.border,
          shadowColor: isDark ? "#000" : "#151E1C",
          paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? 18 : 10),
        }
      ]}
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.key;
        return (
          <TouchableOpacity 
            key={tab.key} 
            activeOpacity={0.7}
            style={[
              styles.navItem,
              isActive && {
                backgroundColor: isDark ? "rgba(212, 180, 131, 0.16)" : "rgba(13, 74, 56, 0.08)",
                borderRadius: 16,
              }
            ]} 
            onPress={() => setCurrentScreen(tab.key)}
          >
            <Text 
              style={{ 
                fontSize: 18, 
                color: isActive ? (universe === 'seller' ? colors.accent : colors.action) : colors.muted,
                fontWeight: "800",
                transform: [{ scale: isActive ? 1.1 : 1 }],
              }}
            >
              {tab.icon}
            </Text>
            <Text 
              style={{ 
                fontSize: 10, 
                marginTop: 3, 
                color: isActive ? (universe === 'seller' ? colors.accent : colors.action) : colors.muted,
                fontWeight: isActive ? "800" : "600",
                letterSpacing: 0.3,
              }}
            >
              {tab.label}
            </Text>
            {isActive && (
              <View 
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: universe === 'seller' ? colors.accent : colors.action,
                  marginTop: 2,
                }} 
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const MainNavigator = () => {
  const { colors, mode } = useDesign();
  const [universe, setUniverse] = useState<Universe>("buyer");
  const [currentScreen, setCurrentScreen] = useState<string>("home");

  // Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Restore session on startup
  useEffect(() => {
    restoreSession().then((session) => {
      if (session) {
        setCurrentUser(session.user);
        startPeriodicSync();
      }
    });
    return () => stopPeriodicSync();
  }, []);

  // Request auth if not logged in, then perform the action
  const requireAuth = useCallback((action: string) => {
    if (currentUser) {
      return true; // Already authenticated
    }
    setPendingAction(action);
    setShowAuthModal(true);
    return false;
  }, [currentUser]);

  const handleAuthenticated = useCallback((user: AuthUser, _token: string) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    startPeriodicSync();

    // Execute pending action after auth
    if (pendingAction === 'switchToSeller') {
      if (user.shops && user.shops.length > 0) {
        setUniverse("seller");
        setCurrentScreen("dashboard");
      } else {
        setShowOnboarding(true);
      }
    } else if (pendingAction === 'need') {
      setCurrentScreen("need");
    } else if (pendingAction === 'purchases') {
      setCurrentScreen("purchases");
    } else if (pendingAction === 'profile') {
      setCurrentScreen("profile");
    }
    setPendingAction(null);
  }, [pendingAction]);

  const handleSelectProduct = useCallback((product: any) => {
    setSelectedProduct(product);
  }, []);

  // Guest-aware actions: these require authentication
  const switchToSeller = useCallback(() => {
    if (!currentUser) {
      requireAuth('switchToSeller');
      return;
    }
    if (!currentUser.shops || currentUser.shops.length === 0) {
      setShowOnboarding(true);
      return;
    }
    setUniverse("seller");
    setCurrentScreen("dashboard");
  }, [currentUser, requireAuth]);

  const switchToBuyer = useCallback(() => {
    setUniverse("buyer");
    setCurrentScreen("home");
  }, []);

  const handleOpenNeed = useCallback(() => {
    setCurrentScreen("need");
  }, []);

  const handleOpenPurchases = useCallback(() => {
    setCurrentScreen("purchases");
  }, []);

  const handleOpenProfile = useCallback(() => {
    setCurrentScreen("profile");
  }, []);

  const handleLogout = useCallback(async () => {
    await clearSession();
    setCurrentUser(null);
    setUniverse("buyer");
    setCurrentScreen("home");
    stopPeriodicSync();
  }, []);

  const handleUpdateProfile = useCallback(async (updatedUser: AuthUser) => {
    setCurrentUser(updatedUser);
    try {
      await AsyncStorage.setItem('ojarket.auth.session', JSON.stringify({
        token: getAuthToken(),
        user: updatedUser,
      }));
    } catch {
      // Ignore storage error
    }
  }, []);

  const handleShopCreated = useCallback((result: any) => {
    // Refresh user profile with new shop
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        role: 'SELLER' as const,
        shops: [...(currentUser.shops || []), {
          id: result.shop.id,
          slug: result.shop.slug,
          name: result.shop.name,
          craftType: result.shop.craftType,
          city: result.shop.city,
          country: result.shop.country,
          currency: 'XOF',
          isVerified: result.shop.isVerified,
          kycStatus: result.shop.kycStatus as any,
          productsCount: 0,
          ordersCount: 0,
          role: 'OWNER',
        }],
        activeShop: {
          id: result.shop.id,
          slug: result.shop.slug,
          name: result.shop.name,
          craftType: result.shop.craftType,
          city: result.shop.city,
          country: result.shop.country,
          currency: 'XOF',
          isVerified: result.shop.isVerified,
          kycStatus: result.shop.kycStatus as any,
          productsCount: 0,
          ordersCount: 0,
          role: 'OWNER',
        },
      };
      setCurrentUser(updatedUser);
    }
    setShowOnboarding(false);
    setUniverse("seller");
    setCurrentScreen("dashboard");
  }, [currentUser]);

  const renderScreen = () => {
    if (universe === "buyer") {
      switch (currentScreen) {
        case "home":
          return <BuyerHomeScreen 
            onSelectProduct={handleSelectProduct} 
            onOpenNeed={handleOpenNeed} 
            onOpenCart={handleOpenPurchases} 
            onSwitchToSeller={switchToSeller} 
          />;
        case "search":
          return <SearchScreen 
            onSelectProduct={handleSelectProduct} 
            onOpenNeed={handleOpenNeed} 
            onOpenCart={handleOpenPurchases} 
          />;
        case "need":
          return <RequestNeedScreen 
            onBack={() => setCurrentScreen("home")} 
            onSubmitted={() => setCurrentScreen("purchases")} 
          />;
        case "purchases":
          return <PurchasesScreen 
            onBack={() => setCurrentScreen("home")} 
            onContactSupport={() => {}} 
            onOpenNeed={handleOpenNeed}
          />;
        case "profile":
          return <ProfileScreen 
            currentUser={currentUser}
            onBack={() => setCurrentScreen("home")}
            onOpenAuth={() => {
              setPendingAction(null);
              setShowAuthModal(true);
            }}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            onSwitchToSeller={switchToSeller} 
            onOpenPurchases={handleOpenPurchases} 
            onOpenRequests={handleOpenNeed} 
          />;
        default:
          return <BuyerHomeScreen 
            onSelectProduct={() => {}} 
            onOpenNeed={handleOpenNeed} 
            onOpenCart={handleOpenPurchases} 
            onSwitchToSeller={switchToSeller} 
          />;
      }
    } else {
      switch (currentScreen) {
        case "dashboard":
          return <SellerDashboardScreen 
            onOpenCashbook={() => setCurrentScreen("cashbook")} 
            onOpenOrders={() => setCurrentScreen("orders")} 
            onOpenOpportunities={() => setCurrentScreen("opportunities")} 
            onSwitchToBuyer={switchToBuyer} 
          />;
        case "orders":
          return <SellerOrdersScreen 
            onBack={() => setCurrentScreen("dashboard")} 
          />;
        case "cashbook":
          return <SellerCashbookScreen 
            onBack={() => setCurrentScreen("dashboard")} 
          />;
        case "opportunities":
          return <SellerOpportunitiesScreen 
            onBack={() => setCurrentScreen("dashboard")} 
          />;
        case "shop":
          return <SellerShopScreen 
            onSwitchToBuyer={switchToBuyer} 
            onBack={() => setCurrentScreen("dashboard")} 
          />;
        default:
          return <SellerDashboardScreen 
            onOpenCashbook={() => setCurrentScreen("cashbook")} 
            onOpenOrders={() => setCurrentScreen("orders")} 
            onOpenOpportunities={() => setCurrentScreen("opportunities")} 
            onSwitchToBuyer={switchToBuyer} 
          />;
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      <BottomNav 
        universe={universe} 
        currentScreen={currentScreen} 
        setCurrentScreen={(screen) => setCurrentScreen(screen)} 
      />

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => { setShowAuthModal(false); setPendingAction(null); }}
        onAuthenticated={handleAuthenticated}
      />

      {/* Seller Onboarding */}
      <SellerOnboardingModal
        visible={showOnboarding}
        currentUser={currentUser}
        onRequireAuth={() => {
          setPendingAction('switchToSeller');
          setShowAuthModal(true);
        }}
        onClose={() => setShowOnboarding(false)}
        onShopCreated={handleShopCreated}
      />

      {/* Product Detail & Direct Order Modal */}
      <ProductDetailModal
        visible={!!selectedProduct && !showAuthModal}
        product={selectedProduct}
        currentUser={currentUser}
        onClose={() => setSelectedProduct(null)}
        onRequireAuth={() => {
          setPendingAction('checkoutProduct');
          setShowAuthModal(true);
        }}
        onOrderCompleted={(_order) => {
          setSelectedProduct(null);
          setCurrentScreen("purchases");
        }}
      />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <DesignProvider>
        <MainNavigator />
      </DesignProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    maxHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    overflow: 'hidden',
  },
  screenContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  navContainer: {
    flexDirection: "row",
    paddingTop: 8,
    borderTopWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 54,
  },
});

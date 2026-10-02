import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from "react-native";
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
import { type AuthUser } from "./src/services/api";

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
  const { colors, locale } = useDesign();
  const isEn = locale === "en";

  const buyerTabs = [
    { key: "home", label: isEn ? "Discover" : "Découvrir", icon: "⌂" },
    { key: "search", label: isEn ? "Search" : "Rechercher", icon: "🔍" },
    { key: "need", label: isEn ? "Requests" : "Demandes", icon: "✦" },
    { key: "purchases", label: isEn ? "Purchases" : "Achats", icon: "🛍" },
    { key: "profile", label: isEn ? "Profile" : "Profil", icon: "👤" },
  ];

  const sellerTabs = [
    { key: "dashboard", label: isEn ? "Today" : "Aujourd'hui", icon: "📊" },
    { key: "orders", label: isEn ? "Orders" : "Commandes", icon: "📦" },
    { key: "cashbook", label: isEn ? "Cashbook" : "Caisse", icon: "💰" },
    { key: "opportunities", label: isEn ? "Requests" : "Demandes", icon: "✦" },
    { key: "shop", label: isEn ? "Shop" : "Boutique", icon: "🏪" },
  ];

  const tabs = universe === "buyer" ? buyerTabs : sellerTabs;

  return (
    <View style={[styles.navContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.key;
        return (
          <TouchableOpacity 
            key={tab.key} 
            style={styles.navItem} 
            onPress={() => setCurrentScreen(tab.key)}
          >
            <Text style={{ fontSize: 24, color: isActive ? colors.action : colors.muted }}>
              {tab.icon}
            </Text>
            <Text style={{ 
              fontSize: 10, 
              marginTop: 4, 
              color: isActive ? colors.action : colors.muted,
              fontWeight: isActive ? "bold" : "normal"
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const MainNavigator = () => {
  const { colors } = useDesign();
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
    if (!requireAuth('switchToSeller')) return;
    
    if (currentUser?.shops && currentUser.shops.length > 0) {
      setUniverse("seller");
      setCurrentScreen("dashboard");
    } else {
      setShowOnboarding(true);
    }
  }, [currentUser, requireAuth]);

  const switchToBuyer = () => {
    setUniverse("buyer");
    setCurrentScreen("home");
  };

  const handleOpenNeed = useCallback(() => {
    if (!requireAuth('need')) return;
    setCurrentScreen("need");
  }, [requireAuth]);

  const handleOpenPurchases = useCallback(() => {
    if (!requireAuth('purchases')) return;
    setCurrentScreen("purchases");
  }, [requireAuth]);

  const handleOpenProfile = useCallback(() => {
    if (!requireAuth('profile')) return;
    setCurrentScreen("profile");
  }, [requireAuth]);

  const handleLogout = useCallback(async () => {
    await clearSession();
    setCurrentUser(null);
    setUniverse("buyer");
    setCurrentScreen("home");
    stopPeriodicSync();
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
          />;
        case "profile":
          return <ProfileScreen 
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]}>
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      <BottomNav universe={universe} currentScreen={currentScreen} setCurrentScreen={(screen) => {
        // Guest can freely browse home and search, but other tabs require auth
        if (universe === 'buyer' && (screen === 'need' || screen === 'purchases' || screen === 'profile')) {
          if (!requireAuth(screen)) return;
        }
        setCurrentScreen(screen);
      }} />

      {/* Auth Modal — shown only when an action requires login */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => { setShowAuthModal(false); setPendingAction(null); }}
        onAuthenticated={handleAuthenticated}
      />

      {/* Seller Onboarding — shown when authenticated user wants to become seller */}
      <SellerOnboardingModal
        visible={showOnboarding}
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
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <DesignProvider>
      <MainNavigator />
    </DesignProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  navContainer: {
    flexDirection: "row",
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
    paddingTop: 12,
    borderTopWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  }
});

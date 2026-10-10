import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, BackHandler, ToastAndroid, Linking } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { DesignProvider, useDesign } from "./src/design-system/provider";
import { Icon } from "./src/design-system/Icon";

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
import { type AuthUser, getAuthToken, CatalogApi, hasShop, getActiveShop, AuthApi } from "./src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Universe = "buyer" | "seller";

interface NavEntry {
  universe: Universe;
  screen: string;
}

const BottomNav = ({ 
  universe, 
  currentScreen, 
  onSelectTab 
}: { 
  universe: Universe; 
  currentScreen: string; 
  onSelectTab: (screen: string) => void;
}) => {
  const insets = useSafeAreaInsets();
  const { colors, locale, mode } = useDesign();
  const isEn = locale === "en";
  const isDark = mode === "dark";

  // Tab definitions using pure official Phosphor Icons (Style 2 Slim Architectural Line)
  const buyerTabs = [
    { key: "home", label: isEn ? "Discover" : "Découvrir", iconName: "home" },
    { key: "search", label: isEn ? "Search" : "Rechercher", iconName: "search" },
    { key: "need", label: isEn ? "Requests" : "Demandes", iconName: "file" },
    { key: "purchases", label: isEn ? "Purchases" : "Achats", iconName: "purchases" },
    { key: "profile", label: isEn ? "Profile" : "Profil", iconName: "profile" },
  ];

  const sellerTabs = [
    { key: "dashboard", label: isEn ? "Today" : "Aujourd'hui", iconName: "dashboard" },
    { key: "orders", label: isEn ? "Orders" : "Commandes", iconName: "orders" },
    { key: "cashbook", label: isEn ? "Cashbook" : "Caisse", iconName: "cashbook" },
    { key: "opportunities", label: isEn ? "Requests" : "Demandes", iconName: "file" },
    { key: "shop", label: isEn ? "Shop" : "Boutique", iconName: "storefront" },
  ];

  const tabs = universe === "buyer" ? buyerTabs : sellerTabs;

  // High-contrast luxury chromatic tokens for unmistakable active visibility
  const activeColor = isDark 
    ? "#D4B483" // Gold champagne joaillerie in dark mode for supreme luminescence
    : (universe === "seller" ? "#9E7134" : "#075D49"); // Imperial Emerald or Artisan Bronze in light mode

  const inactiveColor = isDark ? "#6B7A75" : "#80776D"; // Sophisticated muted slate

  // Controlled bottom inset calculation to eliminate excessive vertical padding
  const bottomPadding = Platform.OS === "ios" 
    ? Math.max(insets.bottom, 14) 
    : Math.max(insets.bottom ? insets.bottom - 4 : 4, 4);

  return (
    <View 
      style={[
        styles.navContainer, 
        { 
          backgroundColor: isDark ? "#0A1311" : "#F8F6F0", 
          borderTopColor: isDark ? "rgba(212, 180, 131, 0.22)" : "rgba(13, 74, 56, 0.12)",
          paddingBottom: bottomPadding,
        }
      ]}
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.key;
        return (
          <TouchableOpacity 
            key={tab.key} 
            activeOpacity={0.75}
            style={[
              styles.navItem,
              isActive && {
                backgroundColor: isDark ? "rgba(212, 180, 131, 0.14)" : "rgba(7, 93, 73, 0.08)",
                borderColor: isDark ? "rgba(212, 180, 131, 0.35)" : "rgba(7, 93, 73, 0.22)",
                borderWidth: 1,
              }
            ]} 
            onPress={() => onSelectTab(tab.key)}
          >
            {/* Top Indicator Bar for Active Tab */}
            {isActive && (
              <View 
                style={{
                  position: "absolute",
                  top: -6,
                  width: 20,
                  height: 2.5,
                  borderRadius: 2,
                  backgroundColor: activeColor,
                }} 
              />
            )}

            <Icon 
              name={tab.iconName} 
              size={isActive ? 21 : 20} 
              color={isActive ? activeColor : inactiveColor} 
              weight={isActive ? "fill" : "regular"} 
            />

            <Text 
              style={{ 
                fontSize: 10, 
                marginTop: 2, 
                color: isActive ? activeColor : inactiveColor,
                fontWeight: isActive ? "800" : "600",
                letterSpacing: isActive ? 0.4 : 0.2,
              }}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const MainNavigator = () => {
  const { colors, mode, locale } = useDesign();
  const isEn = locale === "en";

  const [universe, setUniverse] = useState<Universe>("buyer");
  const [currentScreen, setCurrentScreen] = useState<string>("home");
  const [navHistory, setNavHistory] = useState<NavEntry[]>([
    { universe: "buyer", screen: "home" },
  ]);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const lastBackPressTime = useRef<number>(0);

  // Central Navigation Dispatcher
  const navigateTo = useCallback((targetUniverse: Universe, targetScreen: string) => {
    setUniverse(targetUniverse);
    setCurrentScreen(targetScreen);
    setNavHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.universe === targetUniverse && last.screen === targetScreen) {
        return prev;
      }
      return [...prev, { universe: targetUniverse, screen: targetScreen }];
    });
  }, []);

  // Restore session on startup & rehydrate fresh profile from backend
  useEffect(() => {
    restoreSession().then(async (session) => {
      if (session) {
        setCurrentUser(session.user);
        startPeriodicSync();
        try {
          const fresh = await AuthApi.getMe(session.user?.activeShop?.id);
          if (fresh) {
            setCurrentUser(fresh);
            await AsyncStorage.setItem('ojarket.auth.session', JSON.stringify({
              token: session.token,
              user: fresh,
            }));
          }
        } catch (err) {
          console.warn("[App] Background session rehydration skipped:", err);
        }
      }
    });
    return () => stopPeriodicSync();
  }, []);

  // Deep Linking Handler (ojarket://product/:id, ojarket://shop/:slug, https://ojarket.com/...)
  useEffect(() => {
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;
      try {
        // Formats: ojarket://product/prod-01, ojarket://p/prod-01, https://ojarket.com/p/prod-01
        if (url.includes('product/') || url.includes('/p/')) {
          const parts = url.split(url.includes('product/') ? 'product/' : '/p/');
          const productId = parts[1]?.split('?')[0]?.replace(/\//g, '');
          if (productId) {
            try {
              const prod = await CatalogApi.getProduct(productId);
              if (prod) {
                setSelectedProduct(prod);
              }
            } catch {
              // Fallback placeholder modal
              setSelectedProduct({
                id: productId,
                title: 'Création Certifiée Ojarket',
                priceMinor: 0,
                currency: 'XOF',
              });
            }
          }
        } else if (url.includes('shop/') || url.includes('/shop/')) {
          navigateTo("buyer", "search");
        }
      } catch (err) {
        console.warn("[DeepLink] Error handling URL:", url, err);
      }
    };

    // 1. Handle app launch from cold start with initial URL
    Linking.getInitialURL().then(handleDeepLink);

    // 2. Handle background resume with incoming URL event
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, [navigateTo]);



  // Hardware Back Handler & App-wide back navigation
  const goBack = useCallback((): boolean => {
    // 1. Close open modals first
    if (selectedProduct) {
      setSelectedProduct(null);
      return true;
    }
    if (showAuthModal) {
      setShowAuthModal(false);
      setPendingAction(null);
      return true;
    }
    if (showOnboarding) {
      setShowOnboarding(false);
      return true;
    }

    // 2. Walk backwards through navigation history stack
    if (navHistory.length > 1) {
      const newHistory = [...navHistory];
      newHistory.pop(); // Pop current screen
      const previous = newHistory[newHistory.length - 1];
      setNavHistory(newHistory);
      setUniverse(previous.universe);
      setCurrentScreen(previous.screen);
      return true;
    }

    // 3. Fallback hierarchical navigation if history is 1-level deep
    if (universe === "seller") {
      if (currentScreen !== "dashboard") {
        setUniverse("seller");
        setCurrentScreen("dashboard");
        setNavHistory([{ universe: "seller", screen: "dashboard" }]);
        return true;
      } else {
        // Return from Seller Universe to Buyer Home
        setUniverse("buyer");
        setCurrentScreen("home");
        setNavHistory([{ universe: "buyer", screen: "home" }]);
        return true;
      }
    } else if (currentScreen !== "home") {
      setUniverse("buyer");
      setCurrentScreen("home");
      setNavHistory([{ universe: "buyer", screen: "home" }]);
      return true;
    }

    // 4. On root buyer home: prevent accidental exit with double-press toast
    const now = Date.now();
    if (now - lastBackPressTime.current < 2000) {
      return false; // Exit app
    }
    lastBackPressTime.current = now;
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        isEn ? "Press back again to exit" : "Appuyez à nouveau pour quitter",
        ToastAndroid.SHORT
      );
    }
    return true; // Intercept first press
  }, [selectedProduct, showAuthModal, showOnboarding, navHistory, universe, currentScreen, isEn]);

  // Register Android Hardware Back Listener
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => goBack()
    );
    return () => subscription.remove();
  }, [goBack]);

  // Request auth if not logged in, then perform the action
  const requireAuth = useCallback((action: string) => {
    if (currentUser) {
      return true; // Already authenticated
    }
    setPendingAction(action);
    setShowAuthModal(true);
    return false;
  }, [currentUser]);

  const handleAuthenticated = useCallback(async (user: AuthUser, _token: string) => {
    let effectiveUser = user;
    try {
      const fresh = await AuthApi.getMe(user?.activeShop?.id);
      if (fresh) {
        effectiveUser = fresh;
        await AsyncStorage.setItem('ojarket.auth.session', JSON.stringify({
          token: _token,
          user: fresh,
        }));
      }
    } catch {}

    setCurrentUser(effectiveUser);
    setShowAuthModal(false);
    startPeriodicSync();

    // Execute pending action after auth
    if (pendingAction === 'switchToSeller') {
      if (hasShop(effectiveUser)) {
        navigateTo("seller", "dashboard");
      } else {
        setShowOnboarding(true);
      }
    } else if (pendingAction === 'need') {
      navigateTo("buyer", "need");
    } else if (pendingAction === 'purchases') {
      navigateTo("buyer", "purchases");
    } else if (pendingAction === 'profile') {
      navigateTo("buyer", "profile");
    }
    setPendingAction(null);
  }, [pendingAction, navigateTo]);

  const handleSelectProduct = useCallback((product: any) => {
    setSelectedProduct(product);
  }, []);

  // Guest-aware actions: these require authentication
  const switchToSeller = useCallback(() => {
    if (!currentUser) {
      requireAuth('switchToSeller');
      return;
    }
    if (!hasShop(currentUser)) {
      setShowOnboarding(true);
      return;
    }
    navigateTo("seller", "dashboard");
  }, [currentUser, requireAuth, navigateTo]);

  const switchToBuyer = useCallback(() => {
    navigateTo("buyer", "home");
  }, [navigateTo]);

  const handleOpenNeed = useCallback(() => {
    navigateTo("buyer", "need");
  }, [navigateTo]);

  const handleOpenPurchases = useCallback(() => {
    navigateTo("buyer", "purchases");
  }, [navigateTo]);

  const handleOpenProfile = useCallback(() => {
    navigateTo("buyer", "profile");
  }, [navigateTo]);

  const handleLogout = useCallback(async () => {
    await clearSession();
    setCurrentUser(null);
    navigateTo("buyer", "home");
    stopPeriodicSync();
  }, [navigateTo]);

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
      const newShop = {
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
      };
      const updatedUser = {
        ...currentUser,
        role: 'SELLER' as const,
        shops: [...(currentUser.shops || []), newShop],
        activeShop: newShop,
      };
      setCurrentUser(updatedUser);
      AsyncStorage.setItem('ojarket.auth.session', JSON.stringify({
        token: getAuthToken(),
        user: updatedUser,
      })).catch(() => {});
    }
    setShowOnboarding(false);
    navigateTo("seller", "dashboard");
  }, [currentUser, navigateTo]);

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
            currentUser={currentUser}
            onBack={goBack} 
            onSubmitted={() => navigateTo("buyer", "purchases")} 
          />;
        case "purchases":
          return <PurchasesScreen 
            onBack={goBack} 
            onContactSupport={() => {}} 
            onOpenNeed={handleOpenNeed}
          />;
        case "profile":
          return <ProfileScreen 
            currentUser={currentUser}
            onBack={goBack}
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
            onSelectProduct={handleSelectProduct} 
            onOpenNeed={handleOpenNeed} 
            onOpenCart={handleOpenPurchases} 
            onSwitchToSeller={switchToSeller} 
          />;
      }
    } else {
      switch (currentScreen) {
        case "dashboard":
          return <SellerDashboardScreen 
            currentUser={currentUser}
            onOpenCashbook={() => navigateTo("seller", "cashbook")} 
            onOpenOrders={() => navigateTo("seller", "orders")} 
            onOpenOpportunities={() => navigateTo("seller", "opportunities")} 
            onOpenShop={() => navigateTo("seller", "shop")}
            onSwitchToBuyer={switchToBuyer} 
          />;
        case "orders":
          return <SellerOrdersScreen 
            currentUser={currentUser}
            onBack={goBack} 
          />;
        case "cashbook":
          return <SellerCashbookScreen 
            currentUser={currentUser}
            onBack={goBack} 
          />;
        case "opportunities":
          return <SellerOpportunitiesScreen 
            currentUser={currentUser}
            onBack={goBack} 
          />;
        case "shop":
          return <SellerShopScreen 
            currentUser={currentUser}
            onSwitchToBuyer={switchToBuyer} 
            onBack={goBack} 
          />;
        default:
          return <SellerDashboardScreen 
            currentUser={currentUser}
            onOpenCashbook={() => navigateTo("seller", "cashbook")} 
            onOpenOrders={() => navigateTo("seller", "orders")} 
            onOpenOpportunities={() => navigateTo("seller", "opportunities")} 
            onOpenShop={() => navigateTo("seller", "shop")}
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
        onSelectTab={(tabKey) => navigateTo(universe, tabKey)} 
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
          navigateTo("buyer", "purchases");
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
    paddingTop: 6,
    borderTopWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 4,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  navItem: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    minWidth: 56,
  },
});

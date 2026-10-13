import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  Platform,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesign } from "../../design-system/provider";
import Icon from "../../design-system/Icon";
import { CatalogApi, CmsApi, FavoritesApi, ReviewsApi, ProductItem, API_BASE_URL } from "../../services/api";

interface BuyerHomeScreenProps {
  onSelectProduct: (prod: any) => void;
  onOpenNeed: () => void;
  onOpenCart: () => void;
  onSwitchToSeller: () => void;
}

// Local image assets
const logoDark = require("../../../assets/brand/Ojarket_03_Compact_Wordmark_Dark_Transparent.png");
const logoLight = require("../../../assets/brand/Ojarket_03_Compact_Wordmark_Transparent.png");
const iconBrandDark = require("../../../assets/brand/Ojarket_01_Icon_UltraPremium_Dark_Transparent.png");
const iconBrandLight = require("../../../assets/brand/Ojarket_01_Icon_UltraPremium_Transparent.png");

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  seller: string;
  price: number;
  currency: string;
  rating: number | null;
  reviews: number;
  image: any;
  category: string;
  isDigital?: boolean;
  format?: string;
}

function formatXOF(price: number, currency = "FCFA") {
  return `${new Intl.NumberFormat("fr-FR").format(price)} ${currency}`;
}

const resolveImageUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^(https?:|data:|file:)/i.test(url)) return url;
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? url : '/' + url}`;
};

function mapApiProduct(prod: ProductItem): Product & { variants?: any[]; priceMinor?: number; artisanShop?: any; rawProduct?: any } {
  const isDigital = (prod.category || "").toLowerCase().includes("digital");
  const rawImage = prod.image || (prod as any).images?.[0] || null;
  return {
    id: prod.id,
    title: prod.title || "",
    subtitle: prod.description || "",
    seller: prod.artisanShop?.name || "Boutique Partenaire",
    price: Math.round(prod.priceMinor / 100),
    priceMinor: prod.priceMinor,
    currency: "FCFA",
    rating: (prod as any).rating !== undefined ? (prod as any).rating : null,
    reviews: (prod as any).reviewsCount !== undefined ? (prod as any).reviewsCount : 0,
    image: rawImage ? { uri: resolveImageUrl(rawImage) } : null,
    category: prod.category || "other",
    isDigital: !!isDigital,
    format: isDigital ? "PDF Vectoriel (14.5 Mo)" : undefined,
    variants: prod.variants || [],
    artisanShop: prod.artisanShop,
    rawProduct: prod,
  };
}

function getProductMaterial(title: string, category?: string, isEn?: boolean): string {
  const t = (title || "").toLowerCase();
  if (t.includes("chronomètre") || t.includes("montre") || t.includes("watch")) {
    return isEn ? "Acier & Or 18k" : "Acier & Or 18k";
  }
  if (t.includes("cabas") || t.includes("sac") || t.includes("bag") || category === "leather") {
    return isEn ? "Cuir Pleine Fleur" : "Cuir Pleine Fleur";
  }
  if (t.includes("fauteuil") || t.includes("armchair") || category === "home") {
    return isEn ? "Chêne & Lin" : "Chêne Massif & Lin";
  }
  if (t.includes("parure") || t.includes("émeraude") || t.includes("bague") || category === "fashion") {
    return isEn ? "Or 18k & Émeraude" : "Or 18k & Émeraude";
  }
  if (t.includes("buste") || t.includes("bronze") || category === "art") {
    return isEn ? "Bronze Ciselé" : "Bronze d'Art Ciselé";
  }
  if (category === "digital") {
    return isEn ? "Fichier Master" : "Fichier Master";
  }
  return isEn ? "Fait Main" : "Façonné Main";
}

export default function BuyerHomeScreen({
  onSelectProduct,
  onOpenNeed,
  onOpenCart,
  onSwitchToSeller,
}: BuyerHomeScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0);
  const { colors, locale, mode, setMode, setLocale } = useDesign();
  const isEn = locale === "en";
  const isDark = mode === "dark";
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  // Sync persistent favorites from database
  useEffect(() => {
    FavoritesApi.getMyIds()
      .then((ids) => {
        if (Array.isArray(ids)) {
          const map: Record<string, boolean> = {};
          ids.forEach((id) => { map[id] = true; });
          setFavorites(map);
        }
      })
      .catch(() => {});
  }, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [cms, setCms] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const heroScrollRef = useRef<ScrollView>(null);
  const heroIndexRef = useRef(0);
  const isInteractingHeroRef = useRef(false);

  const heroProducts = cms?.featuredProducts || cms?.intemporelIcons || [];

  useEffect(() => {
    if (!heroProducts || heroProducts.length <= 1) return;
    const interval = setInterval(() => {
      if (isInteractingHeroRef.current) return;
      heroIndexRef.current = (heroIndexRef.current + 1) % heroProducts.length;
      heroScrollRef.current?.scrollTo({
        x: heroIndexRef.current * 172,
        animated: true,
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [heroProducts]);

  const getProductImageSource = (img: any) => {
    if (!img) return isDark ? iconBrandDark : iconBrandLight;
    if (typeof img === 'number') return img;
    if (typeof img === 'object' && img?.uri) {
      const uri = typeof img.uri === 'string' ? resolveImageUrl(img.uri) : '';
      return uri ? { uri } : (isDark ? iconBrandDark : iconBrandLight);
    }
    if (typeof img === 'string') {
      const uri = resolveImageUrl(img);
      return uri ? { uri } : (isDark ? iconBrandDark : iconBrandLight);
    }
    return isDark ? iconBrandDark : iconBrandLight;
  };

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const query = search.trim() ? search : undefined;
      const category = activeCat !== "all" ? activeCat : undefined;
      const [apiProds, cmsRes, favRes] = await Promise.all([
        CatalogApi.getProducts(query, category).catch(() => []),
        CmsApi.getLandingConfig().catch(() => null),
        FavoritesApi.getMyIds().catch(() => []),
      ]);
      if (cmsRes?.data) setCms(cmsRes.data);
      if (Array.isArray(favRes)) {
        const map: Record<string, boolean> = {};
        favRes.forEach((id: string) => { map[id] = true; });
        setFavorites(map);
      }
      const mappedApi = (apiProds || []).map(mapApiProduct);
      setProducts(mappedApi);
    } catch (err) {
      console.warn("Pull to refresh error", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = search.trim() ? search : undefined;
        const category = activeCat !== "all" ? activeCat : undefined;
        const [apiProds, cmsRes] = await Promise.all([
          CatalogApi.getProducts(query, category).catch(() => []),
          CmsApi.getLandingConfig().catch(() => null)
        ]);
        if (cmsRes?.data) setCms(cmsRes.data);
        const mappedApi = (apiProds || []).map(mapApiProduct);
        setProducts(mappedApi);
      } catch (err) {
        console.warn("API Error", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    const timeout = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, activeCat]);

  const toggleFav = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    FavoritesApi.toggleFavorite(id).catch((err) => {
      console.warn("Failed to toggle favorite in database", err);
      setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    });
  };

  const categories = [
    { id: "all", label: isEn ? "All" : "Tout", image: null, isAll: true, icon: "sparkle" },
    { id: "watches", label: isEn ? "Watches" : "Montres", image: require("../../../assets/products/watch-chrono.jpg"), isAll: false, icon: "watch" },
    { id: "leather", label: isEn ? "Leather" : "Maroquinerie", image: require("../../../assets/products/leather-tote.jpg"), isAll: false, icon: "tote" },
    { id: "fashion", label: isEn ? "Jewelry & Fashion" : "Bijoux & Mode", image: require("../../../assets/products/jewelry-gold.jpg"), isAll: false, icon: "diamond" },
    { id: "home", label: isEn ? "Home & Decor" : "Maison & Mobilier", image: require("../../../assets/products/armchair.jpg"), isAll: false, icon: "armchair" },
    { id: "art", label: isEn ? "Art & Sculptures" : "Art & Décoration", image: require("../../../assets/products/art-bronze.jpg"), isAll: false, icon: "palette" },
    { id: "digital", label: isEn ? "Digital" : "Numérique", image: require("../../../assets/products/digital-patterns.jpg"), isAll: false, icon: "download" },
  ];

  const sourceList = (cms?.featuredProducts && cms.featuredProducts.length > 0)
    ? cms.featuredProducts
    : products;
  const filtered = sourceList.filter((p: any) => {
    const matchesCat = activeCat === "all" || p.category === activeCat;
    const matchesSearch = search.trim() === "" || (p.title || "").toLowerCase().includes(search.toLowerCase()) || (p.seller?.name || p.seller || "").toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* ==================== PINNED FIXED LUXURY TOP BAR ==================== */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 18,
          paddingTop: topInset > 0 ? topInset + 6 : (Platform.OS === "android" ? 36 : 14),
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
          zIndex: 10,
        }}
      >
        {/* Official Brand Logo */}
        <Image
          source={isDark ? logoDark : logoLight}
          style={{ width: 116, height: 32, resizeMode: "contain" }}
        />

        {/* Action Controls: Lang + Theme + Notifications + Cart */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          {/* FR / EN Toggle */}
          <Pressable
            onPress={() => setLocale(isEn ? "fr" : "en")}
            style={({ pressed }) => [{
              paddingHorizontal: 9,
              paddingVertical: 5,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.canvas,
              opacity: pressed ? 0.75 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            }]}
          >
            <Text style={{ fontSize: 11, fontWeight: "800", color: colors.text, letterSpacing: 0.5 }}>
              {isEn ? "FR" : "EN"}
            </Text>
          </Pressable>

          {/* Theme Toggle */}
          <Pressable
            onPress={() => setMode(isDark ? "light" : "dark")}
            style={({ pressed }) => [{
              width: 34,
              height: 34,
              borderRadius: 17,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.canvas,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.75 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            }]}
          >
            <Icon name={isDark ? "sun" : "moon"} size={16} color={colors.text} weight="bold" />
          </Pressable>

          {/* Notification Bell with Red Indicator */}
          <Pressable
            onPress={onSwitchToSeller}
            style={({ pressed }) => [{
              width: 34,
              height: 34,
              borderRadius: 17,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.canvas,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              opacity: pressed ? 0.75 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            }]}
          >
            <Icon name="bell" size={17} color={colors.text} weight="duotone" />
            <View
              style={{
                position: "absolute",
                top: 7,
                right: 7,
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: "#EF4444",
                borderWidth: 1,
                borderColor: colors.surface,
              }}
            />
          </Pressable>

          {/* Cart Icon */}
          <Pressable
            onPress={onOpenCart}
            style={({ pressed }) => [{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.action,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            }]}
          >
            <Icon name="cart" size={17} color="#FFFFFF" weight="duotone" />
          </Pressable>
        </View>
      </View>

      {/* ==================== SCROLLABLE FEED ==================== */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.action || "#10B981"}
            colors={[colors.action || "#10B981", colors.accent || "#D4B483"]}
          />
        }
      >
        {/* Prestige Ribbon Haute Facture */}
        <View
          style={{
            backgroundColor: isDark ? "rgba(13, 74, 56, 0.45)" : "rgba(212, 180, 131, 0.15)",
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingVertical: 7,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Icon name="sparkle" size={9} color={colors.accent} weight="fill" />
          <Text
            style={{
              fontSize: 9.5,
              fontWeight: "800",
              letterSpacing: 1.2,
              color: colors.accent,
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            {isEn
              ? "ONLINE MARKETPLACE · VERIFIED STORES · SECURE SHOPPING"
              : "MARKETPLACE EN LIGNE · BOUTIQUES VÉRIFIÉES · COMMANDES SÉCURISÉES"}
          </Text>
          <Icon name="sparkle" size={9} color={colors.accent} weight="fill" />
        </View>

        {/* ==================== EDITORIAL HERO TITLE ==================== */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 26,
              fontWeight: "700",
              color: colors.text,
              letterSpacing: -0.4,
              marginBottom: 4,
            }}
          >
            {isEn ? "Buy & Sell" : "Achetez & Vendez"}
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18 }}>
            {isEn
              ? "Verified stores and direct ordering."
              : "Boutiques certifiées et commandes directes."}
          </Text>
        </View>

        {/* ==================== LUXURY SEARCH PILL ==================== */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              height: 46,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0 : 0.04,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <View style={{ marginRight: 8 }}><Icon name="search" size={16} color={colors.muted} weight="bold" /></View>
            <TextInput
              placeholder={
                isEn
                  ? "Search for products, watches, boutiques..."
                  : "Rechercher un produit, une montre, une boutique..."
              }
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={setSearch}
              style={{
                flex: 1,
                fontSize: 13,
                color: colors.text,
                paddingVertical: 0,
              }}
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch("")} style={{ padding: 4 }}>
                <Text style={{ fontSize: 13, color: colors.muted }}>✕</Text>
              </Pressable>
            ) : (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: colors.subtle,
                }}
              >
                <Text style={{ fontSize: 11, color: colors.muted }}>SCAN</Text>
              </View>
            )}
          </View>
        </View>

        {/* ==================== CIRCULAR CATEGORIES ==================== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 16 }}
        >
          {categories.map((c) => {
            const isActive = activeCat === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setActiveCat(c.id)}
                style={({ pressed }) => [{
                  alignItems: "center",
                  width: 68,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                }]}
              >
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    borderWidth: isActive ? 2 : 1,
                    borderColor: isActive ? colors.accent : colors.border,
                    backgroundColor: isActive ? "rgba(212, 180, 131, 0.18)" : colors.surface,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                    overflow: "hidden",
                    shadowColor: isActive ? colors.accent : "#000",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: isActive ? 0.35 : 0.06,
                    shadowRadius: 6,
                    elevation: isActive ? 4 : 1,
                    padding: isActive ? 2 : 0,
                  }}
                >
                  {(c as any).isAll ? (
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
                    )}
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? "800" : "600",
                    color: isActive ? (isDark ? colors.accent : colors.action) : colors.muted,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ==================== FEATURED PRODUCTS (PRODUITS PHARES CMS) ==================== */}
        {heroProducts.length > 0 && (
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
              <View style={{ padding: 22, paddingBottom: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: "800", letterSpacing: 1.2, color: colors.accent, textTransform: "uppercase" }}>
                    {isEn ? "TRENDING NOW · VERIFIED STORE" : "TENDANCE DU MOMENT · BOUTIQUE VÉRIFIÉE"}
                  </Text>
                  <View style={{ backgroundColor: "rgba(212, 180, 131, 0.2)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: "rgba(212, 180, 131, 0.4)" }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: colors.accent }}>
                      {heroProducts.length} {isEn ? "items" : "produits"}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontFamily: Platform.OS === "android" ? "serif" : "Georgia", fontSize: 24, color: "#FFFFFF", fontWeight: "700", marginBottom: 4 }}>
                  {isEn ? "Trending Products" : "Produits en Vedette"}
                </Text>
                <Text style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.8)", lineHeight: 17 }}>
                  {isEn ? "Verified stores and direct ordering." : "Boutiques certifiées et commandes directes."}
                </Text>
              </View>

              <ScrollView
                ref={heroScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 22, gap: 12 }}
                onTouchStart={() => { isInteractingHeroRef.current = true; }}
                onTouchEnd={() => { setTimeout(() => { isInteractingHeroRef.current = false; }, 4000); }}
                onScrollBeginDrag={() => { isInteractingHeroRef.current = true; }}
                onScrollEndDrag={() => { setTimeout(() => { isInteractingHeroRef.current = false; }, 4000); }}
              >
                {heroProducts.map((prod: any, i: number) => {
                  return (
                    <Pressable
                      key={prod.id || String(i)}
                      onPress={() => onSelectProduct(prod)}
                      style={({ pressed }) => [{
                        width: 160,
                        backgroundColor: "#03362A",
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: pressed ? colors.accent : "rgba(212, 180, 131, 0.28)",
                        padding: 10,
                        overflow: "hidden",
                        opacity: pressed ? 0.88 : 1,
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                      }]}
                    >
                      <View style={{ width: "100%", height: 135, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 10 }}>
                        {prod.image ? (
                          <Image
                            source={{ uri: resolveImageUrl(prod.image) }}
                            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                          />
                        ) : null}
                        <View style={{ position: "absolute", top: 6, right: 6, backgroundColor: "rgba(2,43,34,0.85)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: "rgba(212,180,131,0.4)" }}>
                          {prod.badgeText ? (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                              <Icon name="sparkle" size={8} color={colors.accent} weight="fill" />
                              <Text style={{ fontSize: 8, fontWeight: "800", color: colors.accent, letterSpacing: 0.6 }}>{prod.badgeText.toUpperCase()}</Text>
                            </View>
                          ) : prod.reviewsCount && prod.reviewsCount > 0 && prod.rating != null ? (
                            <Text style={{ fontSize: 9, fontWeight: "800", color: colors.accent }}>★ {prod.rating.toFixed(1)}</Text>
                          ) : (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                              <Icon name="sparkle" size={8} color={colors.accent} weight="fill" />
                              <Text style={{ fontSize: 8, fontWeight: "800", color: colors.accent, letterSpacing: 0.6 }}>{isEn ? "NEW" : "NOUVEAU"}</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginBottom: 3 }} numberOfLines={1}>
                        {prod.title}
                      </Text>

                      {prod.seller?.name ? (
                        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, marginBottom: 6 }} numberOfLines={1}>
                          • {prod.seller.name}{prod.seller.city ? ` · ${prod.seller.city}` : ""}
                        </Text>
                      ) : null}

                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 4, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" }}>
                        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "800" }}>
                          {prod.price ? formatXOF(prod.price, prod.currency || "FCFA") : "Voir détails"}
                        </Text>
                        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.action, alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>→</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* ==================== 2-COLUMN PRODUCT GRID ==================== */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                fontSize: 19,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {isEn ? "Recommended for you" : "Recommandé pour vous"}
            </Text>

            <Pressable onPress={() => setActiveCat("all")}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.action }}>
                {isEn ? "See all →" : "Voir tout →"}
              </Text>
            </Pressable>
          </View>

          {/* 2-Column Grid of Creations */}
          {filtered.length === 0 && !loading ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 20 }}>
              <View style={{ marginBottom: 16 }}><Icon name="search" size={42} color={colors.accent} weight="duotone" /></View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 8, fontFamily: Platform.OS === "android" ? "serif" : "Georgia" }}>
                {isEn ? "No creations found" : "Aucune création trouvée"}
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20 }}>
                {isEn 
                  ? "We couldn't find any creations matching your search. Try different keywords or browse all categories." 
                  : "Nous n'avons trouvé aucune création correspondant à votre recherche. Essayez d'autres mots-clés ou parcourez toutes les catégories."}
              </Text>
            </View>
          ) : loading ? (
            <View style={{ paddingVertical: 60, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Column 1 */}
              <View style={{ flex: 1, gap: 14 }}>
                {filtered
                  .filter((_: any, i: number) => i % 2 === 0)
                  .map((prod: any, idx: number) => (
                    <Pressable
                      key={prod.id || String(idx)}
                      onPress={() => onSelectProduct(prod)}
                      style={({ pressed }) => [{
                        backgroundColor: colors.surface,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: colors.border,
                        overflow: "hidden",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: isDark ? 0 : 0.05,
                        shadowRadius: 8,
                        elevation: isDark ? 0 : 2,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      }]}
                    >
                      {/* Photo preview banner */}
                      <View
                        style={{
                          width: "100%",
                          aspectRatio: 4 / 5,
                          backgroundColor: colors.canvas,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          source={getProductImageSource(prod.image)}
                          style={{
                            width: "100%",
                            height: "100%",
                            resizeMode: prod.image ? "cover" : "contain",
                            opacity: prod.image ? 1 : 0.3,
                          }}
                        />
                        {/* Digital Badge */}
                        {prod.isDigital || prod.category === "digital" ? (
                          <View
                            style={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              backgroundColor: "rgba(2, 43, 34, 0.92)",
                              paddingHorizontal: 7,
                              paddingVertical: 3,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: colors.accent,
                            }}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                              <Icon name="download" size={10} color={colors.accent} weight="bold" />
                              <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "800", letterSpacing: 0.6 }}>NUMÉRIQUE</Text>
                            </View>
                          </View>
                        ) : null}

                        {/* Floating Wishlist Heart */}
                        <Pressable
                          onPress={() => toggleFav(prod.id)}
                          style={({ pressed }) => [{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            backgroundColor: "rgba(255,255,255,0.9)",
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 4,
                            elevation: 2,
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                          }]}
                        >
                          <Icon name="heart" size={16} color={favorites[prod.id] ? "#EF4444" : "#6B7280"} weight={favorites[prod.id] ? "fill" : "regular"} />
                        </Pressable>
                      </View>

                      {/* Body */}
                      <View style={{ padding: 12 }}>
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "800",
                            letterSpacing: 0.8,
                            color: colors.muted,
                            textTransform: "uppercase",
                            marginBottom: 2,
                          }}
                        >
                          {prod.seller?.name || prod.seller}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                            fontSize: 14,
                            fontWeight: "700",
                            color: colors.text,
                            marginBottom: 4,
                          }}
                          numberOfLines={1}
                        >
                          {prod.title}
                        </Text>

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            backgroundColor: isDark ? "rgba(212, 180, 131, 0.12)" : "rgba(212, 180, 131, 0.18)",
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: "rgba(212, 180, 131, 0.35)",
                            alignSelf: "flex-start",
                            maxWidth: "100%",
                            marginBottom: 4,
                          }}
                        >
                          <Icon name="sparkle" size={8} color={colors.accent} weight="fill" />
                          <Text
                            style={{
                              fontSize: 8.5,
                              fontWeight: "700",
                              color: colors.accent,
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                              flexShrink: 1,
                            }}
                            numberOfLines={1}
                          >
                            {getProductMaterial(prod.title, prod.category, isEn)}
                          </Text>
                        </View>

                        {/* Footer: Price + Solid Cart CTA */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 4,
                            paddingTop: 8,
                            borderTopWidth: 1,
                            borderTopColor: colors.border,
                          }}
                        >
                          <View>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "800",
                                color: colors.text,
                              }}
                            >
                              {formatXOF(prod.price)}
                            </Text>
                            {prod.reviews && prod.reviews > 0 && prod.rating != null ? (
                              <Text style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>
                                ★ {prod.rating.toFixed(1)} ({prod.reviews})
                              </Text>
                            ) : (
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                                <Icon name="sparkle" size={9} color={colors.accent} weight="fill" />
                                <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>
                                  {isEn ? "NEW ARRIVAL" : "NOUVEAU"}
                                </Text>
                              </View>
                            )}
                          </View>

                          <Pressable
                            onPress={() => onSelectProduct(prod)}
                            style={({ pressed }) => [{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              backgroundColor: prod.isDigital || prod.category === "digital" ? colors.accent : colors.action,
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: pressed ? 0.85 : 1,
                              transform: [{ scale: pressed ? 0.92 : 1 }],
                            }]}
                          >
                            {prod.isDigital || prod.category === "digital" ? (
                              <Icon name="download" size={17} color="#022B22" weight="bold" />
                            ) : (
                              <Icon name="cart" size={17} color="#FFFFFF" weight="duotone" />
                            )}
                          </Pressable>
                        </View>
                      </View>
                    </Pressable>
                  ))}
              </View>

              {/* Column 2 */}
              <View style={{ flex: 1, gap: 14 }}>
                {filtered
                  .filter((_: any, i: number) => i % 2 !== 0)
                  .map((prod: any, idx: number) => (
                    <Pressable
                      key={prod.id || String(idx)}
                      onPress={() => onSelectProduct(prod)}
                      style={({ pressed }) => [{
                        backgroundColor: colors.surface,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: colors.border,
                        overflow: "hidden",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: isDark ? 0 : 0.05,
                        shadowRadius: 8,
                        elevation: isDark ? 0 : 2,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      }]}
                    >
                      {/* Photo preview banner */}
                      <View
                        style={{
                          width: "100%",
                          aspectRatio: 4 / 5,
                          backgroundColor: colors.canvas,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          source={getProductImageSource(prod.image)}
                          style={{
                            width: "100%",
                            height: "100%",
                            resizeMode: prod.image ? "cover" : "contain",
                            opacity: prod.image ? 1 : 0.3,
                          }}
                        />
                        {/* Digital Badge */}
                        {prod.isDigital || prod.category === "digital" ? (
                          <View
                            style={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              backgroundColor: "rgba(2, 43, 34, 0.92)",
                              paddingHorizontal: 7,
                              paddingVertical: 3,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: colors.accent,
                            }}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                              <Icon name="download" size={10} color={colors.accent} weight="bold" />
                              <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "800", letterSpacing: 0.6 }}>NUMÉRIQUE</Text>
                            </View>
                          </View>
                        ) : null}

                        {/* Floating Wishlist Heart */}
                        <Pressable
                          onPress={() => toggleFav(prod.id)}
                          style={({ pressed }) => [{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            backgroundColor: "rgba(255,255,255,0.9)",
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 4,
                            elevation: 2,
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                          }]}
                        >
                          <Icon name="heart" size={16} color={favorites[prod.id] ? "#EF4444" : "#6B7280"} weight={favorites[prod.id] ? "fill" : "regular"} />
                        </Pressable>
                      </View>

                      {/* Body */}
                      <View style={{ padding: 12 }}>
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "800",
                            letterSpacing: 0.8,
                            color: colors.muted,
                            textTransform: "uppercase",
                            marginBottom: 2,
                          }}
                        >
                          {prod.seller?.name || prod.seller}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                            fontSize: 14,
                            fontWeight: "700",
                            color: colors.text,
                            marginBottom: 4,
                          }}
                          numberOfLines={1}
                        >
                          {prod.title}
                        </Text>

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            backgroundColor: isDark ? "rgba(212, 180, 131, 0.12)" : "rgba(212, 180, 131, 0.18)",
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: "rgba(212, 180, 131, 0.35)",
                            alignSelf: "flex-start",
                            maxWidth: "100%",
                            marginBottom: 4,
                          }}
                        >
                          <Icon name="sparkle" size={8} color={colors.accent} weight="fill" />
                          <Text
                            style={{
                              fontSize: 8.5,
                              fontWeight: "700",
                              color: colors.accent,
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                              flexShrink: 1,
                            }}
                            numberOfLines={1}
                          >
                            {getProductMaterial(prod.title, prod.category, isEn)}
                          </Text>
                        </View>

                        {/* Footer: Price + Solid Cart CTA */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 4,
                            paddingTop: 8,
                            borderTopWidth: 1,
                            borderTopColor: colors.border,
                          }}
                        >
                          <View>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "800",
                                color: colors.text,
                              }}
                            >
                              {formatXOF(prod.price)}
                            </Text>
                            {prod.reviews && prod.reviews > 0 && prod.rating != null ? (
                              <Text style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>
                                ★ {prod.rating.toFixed(1)} ({prod.reviews})
                              </Text>
                            ) : (
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                                <Icon name="sparkle" size={9} color={colors.accent} weight="fill" />
                                <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>
                                  {isEn ? "NEW ARRIVAL" : "NOUVEAU"}
                                </Text>
                              </View>
                            )}
                          </View>

                          <Pressable
                            onPress={() => onSelectProduct(prod)}
                            style={({ pressed }) => [{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              backgroundColor: prod.isDigital || prod.category === "digital" ? colors.accent : colors.action,
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: pressed ? 0.85 : 1,
                              transform: [{ scale: pressed ? 0.92 : 1 }],
                            }]}
                          >
                            {prod.isDigital || prod.category === "digital" ? (
                              <Icon name="download" size={17} color="#022B22" weight="bold" />
                            ) : (
                              <Icon name="cart" size={17} color="#FFFFFF" weight="duotone" />
                            )}
                          </Pressable>
                        </View>
                      </View>
                    </Pressable>
                  ))}
              </View>
            </View>
            )}
        </View>

        {/* ==================== BOUTIQUES DE CONFIANCE (TRUSTED SHOPS) ==================== */}
        <View style={{ marginBottom: 28 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              paddingHorizontal: 20,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                fontSize: 19,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {isEn ? "Trusted Boutiques" : "Boutiques de confiance"}
            </Text>

            <Pressable>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.action }}>
                {isEn ? "See all →" : "Voir tout →"}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
          >
            {(cms?.trustedShops || []).map((shop: any, i: number) => (
              <View
                key={i}
                style={{
                  width: 285,
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0 : 0.04,
                  shadowRadius: 6,
                  elevation: 1,
                }}
              >
                {/* Left: Avatar + Badge + Rating */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: colors.canvas,
                      borderWidth: 1.5,
                      borderColor: colors.accent,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                        fontSize: 14,
                        fontWeight: "700",
                        color: colors.accent,
                      }}
                    >
                      {shop.initials}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontSize: 13, fontWeight: "700", color: colors.text }}
                      numberOfLines={1}
                    >
                      {shop.name}
                    </Text>
                    {/* Gold Pill Badge */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 3,
                        backgroundColor: "rgba(212, 180, 131, 0.2)",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 10,
                        alignSelf: "flex-start",
                        marginTop: 2,
                      }}
                    >
                      <Icon name="crown" size={11} color={colors.accent} weight="fill" />
                      <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "800" }}>
                        Boutique Vérifiée
                      </Text>
                    </View>
                    {shop.reviews && shop.reviews > 0 && shop.rating ? (
                      <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                        ★ {Number(shop.rating).toFixed(1)} ({shop.reviews} {isEn ? "reviews" : "avis"})
                      </Text>
                    ) : (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 }}>
                        <Icon name="sparkle" size={9} color={colors.accent} weight="fill" />
                        <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" }}>
                          {isEn ? "VERIFIED STORE" : "BOUTIQUE CERTIFIÉE"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Right: Thumbnails & Actions */}
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
                  </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ==================== ATELIERS D'ART & MAÎTRES ARTISANS ==================== */}
        <View style={{ marginBottom: 28 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              paddingHorizontal: 20,
              marginBottom: 12,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  letterSpacing: 1.2,
                  color: colors.accent,
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                {isEn ? "HERITAGE & CRAFTSMANSHIP" : "SAVOIR-FAIRE MAÎTRE"}
              </Text>
              <Text
                style={{
                  fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                  fontSize: 19,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                {isEn ? "Master Art Studios" : "Ateliers d'Art Certifiés"}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.muted, fontStyle: "italic" }}>
              {isEn ? "Benin & West Africa" : "Façonné au Bénin"}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
          >
            {/* Atelier 1 */}
            <View
              style={{
                width: 270,
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                justifyContent: "space-between",
              }}
            >
              <View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 9.5, fontWeight: "800", color: colors.accent, letterSpacing: 0.8, textTransform: "uppercase" }}>
                    FONDERIE ROYALE D'ART
                  </Text>
                  <View style={{ backgroundColor: colors.canvas, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: colors.border }}>
                    <Text style={{ fontSize: 9, color: colors.muted }}>Ouidah</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: Platform.OS === "android" ? "serif" : "Georgia", fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
                  {isEn ? "Lost-Wax Bronze Casting" : "Ciselure & Fonte au Bronze"}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 16 }}>
                  {isEn ? "48h of manual sculpting per bust, following ancestral royal kingdom techniques." : "Plus de 48h de travail manuel par œuvre, selon les traditions royales séculaires."}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 12 }}>
                <Icon name="sparkle" size={9} color={colors.accent} weight="fill" />
                <Text style={{ fontSize: 9.5, fontWeight: "700", color: colors.accent, letterSpacing: 0.5 }}>
                  {isEn ? "MASTER PIECE SEAL · VERIFIED" : "SCEAU DE MAÎTRE · PIÈCE UNIQUE"}
                </Text>
              </View>
            </View>

            {/* Atelier 2 */}
            <View
              style={{
                width: 270,
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                justifyContent: "space-between",
              }}
            >
              <View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 9.5, fontWeight: "800", color: colors.accent, letterSpacing: 0.8, textTransform: "uppercase" }}>
                    ATELIER MAROQUINERIE GANHI
                  </Text>
                  <View style={{ backgroundColor: colors.canvas, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: colors.border }}>
                    <Text style={{ fontSize: 9, color: colors.muted }}>Cotonou</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: Platform.OS === "android" ? "serif" : "Georgia", fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
                  {isEn ? "Full-Grain Saddle Stitching" : "Maroquinerie & Piqûre Sellier"}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 16 }}>
                  {isEn ? "Vegetable-tanned full-grain leather, hand-stitched with waxed linen thread." : "Cuirs pleine fleur tannage végétal, cousus main au fil de lin ciré pour l'éternité."}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 12 }}>
                <Icon name="sparkle" size={9} color={colors.accent} weight="fill" />
                <Text style={{ fontSize: 9.5, fontWeight: "700", color: colors.accent, letterSpacing: 0.5 }}>
                  {isEn ? "CERTIFIED SADDLER · HANDMADE" : "ARTISAN SELLIER · 100% MAIN"}
                </Text>
              </View>
            </View>

            {/* Atelier 3 */}
            <View
              style={{
                width: 270,
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                justifyContent: "space-between",
              }}
            >
              <View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 9.5, fontWeight: "800", color: colors.accent, letterSpacing: 0.8, textTransform: "uppercase" }}>
                    HAUTE HORLOGERIE KINGSTON
                  </Text>
                  <View style={{ backgroundColor: colors.canvas, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: colors.border }}>
                    <Text style={{ fontSize: 9, color: colors.muted }}>Cotonou</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: Platform.OS === "android" ? "serif" : "Georgia", fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
                  {isEn ? "Chronometry & Fine Gems" : "Haute Joaillerie & Garde-Temps"}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 16 }}>
                  {isEn ? "Gem-setting under microscope and precision calibration by master watchmakers." : "Sertissage haute joaillerie sous microscope et calibres horlogers certifiés."}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 12 }}>
                <Icon name="sparkle" size={9} color={colors.accent} weight="fill" />
                <Text style={{ fontSize: 9.5, fontWeight: "700", color: colors.accent, letterSpacing: 0.5 }}>
                  {isEn ? "CERTIFIED CHRONOMETER · 18K GOLD" : "CALIBRE CERTIFIÉ · OR 18K"}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* ==================== COMMERCIAL PRODUCT REQUEST (BESPOKE LOUNGE D02) ==================== */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View
            style={{
              backgroundColor: "#022B22",
              borderRadius: 22,
              padding: 24,
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: "rgba(212, 180, 131, 0.4)",
              shadowColor: "#022B22",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 14,
              elevation: 4,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(212, 180, 131, 0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: "rgba(212, 180, 131, 0.35)", marginBottom: 12 }}>
              <Icon name="sparkle" size={9} color={colors.accent} weight="fill" />
              <Text
                style={{
                  fontSize: 9.5,
                  fontWeight: "800",
                  letterSpacing: 1.1,
                  color: colors.accent,
                  textTransform: "uppercase",
                }}
              >
                {isEn ? "BESPOKE LOUNGE · PRIVATE SERVICE" : "SALON PRIVÉ & CRÉATIONS SUR-MESURE"}
              </Text>
              <Icon name="sparkle" size={9} color={colors.accent} weight="fill" />
            </View>

            <Text
              style={{
                fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                fontSize: 20,
                lineHeight: 25,
                color: "#FFFFFF",
                fontWeight: "700",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {isEn
                ? "Dreaming of a creation that exists nowhere else?"
                : "Vous rêvez d'une création qui n'existe nulle part ailleurs ?"}
            </Text>

            <Text
              style={{
                fontSize: 12.5,
                color: "rgba(255, 255, 255, 0.85)",
                textAlign: "center",
                lineHeight: 18,
                marginBottom: 18,
              }}
            >
              {isEn
                ? "Commission bespoke pieces from verified master artisans. Receive tailored quotes and clear workshop timelines."
                : "Confiez votre vision à nos maîtres d'art. Joaillerie sur-mesure, maroquinerie monogrammée ou mobilier d'exception : devis et délais d'atelier certifiés."}
            </Text>

            <Pressable
              onPress={onOpenNeed}
              style={({ pressed }) => [{
                backgroundColor: colors.accent,
                paddingHorizontal: 22,
                paddingVertical: 12,
                borderRadius: 24,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
                shadowColor: "#D4B483",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 3,
              }]}
            >
              <Text style={{ color: "#022B22", fontSize: 13, fontWeight: "800" }}>
                {isEn ? "Open a Bespoke Request →" : "Ouvrir un projet sur-mesure →"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ==================== 4 ELITE TRUST SEALS (RÉASSURANCE LUXE) ==================== */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 18,
              gap: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(212, 180, 131, 0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(212, 180, 131, 0.35)" }}>
                <Icon name="shield" size={18} color={colors.accent} weight="duotone" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 2 }}>
                  {isEn ? "Numbered Certificate" : "Certificat d'Authenticité"}
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted, lineHeight: 15 }}>
                  {isEn ? "Every piece includes an official physical certificate of origin." : "Chaque création est livrée avec son certificat d'origine officiel scellé."}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(212, 180, 131, 0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(212, 180, 131, 0.35)" }}>
                <Icon name="wallet" size={18} color={colors.accent} weight="duotone" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 2 }}>
                  {isEn ? "Protected Settlement" : "Caisse Sécurisée & MoMo"}
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted, lineHeight: 15 }}>
                  {isEn ? "Funds held in escrow balance until physical handover inspection." : "Règlement Mobile Money sécurisé en livre de caisse certifié."}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(212, 180, 131, 0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(212, 180, 131, 0.35)" }}>
                <Icon name="package" size={18} color={colors.accent} weight="duotone" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 2 }}>
                  {isEn ? "Prestige Case Handover" : "Livraison en Écrin Scellé"}
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted, lineHeight: 15 }}>
                  {isEn ? "White-glove presentation packaging in Cotonou and main cities." : "Écrin d'art soigné et remise en mains propres sécurisée à Cotonou."}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(212, 180, 131, 0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(212, 180, 131, 0.35)" }}>
                <Icon name="chat" size={18} color={colors.accent} weight="duotone" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 2 }}>
                  {isEn ? "Private Concierge 7d/7" : "Conciergerie Privée 7j/7"}
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted, lineHeight: 15 }}>
                  {isEn ? "Direct dedicated WhatsApp advisory for inquiries and orders." : "Ligne directe d'assistance et accompagnement personnalisé."}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

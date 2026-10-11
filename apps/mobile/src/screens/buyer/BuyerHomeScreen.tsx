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

  const sourceList = products.length > 0 ? products : (cms?.featuredProducts || []);
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
      >
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
            {isEn ? "Discover the Marketplace" : "Découvrez la marketplace"}
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18 }}>
            {isEn
              ? "Unique products and commercial selections from verified merchants."
              : "Des produits de qualité et sélections exclusives proposés par nos commerçants vérifiés."}
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
                    {isEn ? "FEATURED SELECTION • CMS" : "PRODUITS PHARES • SÉLECTION DU SITE"}
                  </Text>
                  <View style={{ backgroundColor: "rgba(212, 180, 131, 0.2)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: "rgba(212, 180, 131, 0.4)" }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: colors.accent }}>
                      {heroProducts.length} {isEn ? "pieces" : "pièces"}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontFamily: Platform.OS === "android" ? "serif" : "Georgia", fontSize: 24, color: "#FFFFFF", fontWeight: "700", marginBottom: 4 }}>
                  {isEn ? "Curated Flagships" : "Pièces d'Exception"}
                </Text>
                <Text style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.8)", lineHeight: 17 }}>
                  {isEn ? "Exclusive creations highlighted by the platform administrator." : "Sélection exclusive mise en avant par l'administrateur de la plateforme."}
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
                            marginBottom: 6,
                          }}
                          numberOfLines={1}
                        >
                          {prod.title}
                        </Text>

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
                            marginBottom: 6,
                          }}
                          numberOfLines={1}
                        >
                          {prod.title}
                        </Text>

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

        {/* ==================== COMMERCIAL PRODUCT REQUEST PROMPT ==================== */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              backgroundColor: "#022B22",
              borderRadius: 20,
              padding: 22,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(212, 180, 131, 0.4)",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "800",
                letterSpacing: 1.2,
                color: colors.accent,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {isEn ? "MERCHANT & STORE NETWORK" : "RÉSEAU DE COMMERÇANTS & BOUTIQUES"}
            </Text>

            <Text
              style={{
                fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                fontSize: 18,
                lineHeight: 22,
                color: "#FFFFFF",
                fontWeight: "700",
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              {isEn
                ? "Looking for a specific product?"
                : "Vous cherchez un produit spécifique ?"}
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: "rgba(255, 255, 255, 0.82)",
                textAlign: "center",
                lineHeight: 17,
                marginBottom: 16,
              }}
            >
              {isEn
                ? "Describe what you are looking for. Verified merchants and stores will provide direct offers."
                : "Décrivez votre recherche de produit. Les commerçants et boutiques vérifiés vous soumettront directement leurs offres et devis."}
            </Text>

            <Pressable
              onPress={onOpenNeed}
              style={({ pressed }) => [{
                backgroundColor: colors.action,
                paddingHorizontal: 20,
                paddingVertical: 11,
                borderRadius: 24,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              }]}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
                {isEn ? "Post product request →" : "Publier une demande de produit →"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

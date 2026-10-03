import React, { useState, useEffect } from "react";
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
import { CatalogApi, ProductItem } from "../../services/api";

interface BuyerHomeScreenProps {
  onSelectProduct: (prod: any) => void;
  onOpenNeed: () => void;
  onOpenCart: () => void;
  onSwitchToSeller: () => void;
}

// Local image assets
const imgLeatherTote = require("../../../assets/products/leather-tote.jpg");
const imgWatchChrono = require("../../../assets/products/watch-chrono.jpg");
const imgArmchair = require("../../../assets/products/armchair.jpg");
const imgJewelryGold = require("../../../assets/products/jewelry-gold.jpg");
const imgArtBronze = require("../../../assets/products/art-bronze.jpg");
const imgDigitalPatterns = require("../../../assets/products/digital-patterns.jpg");
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
  rating: number;
  reviews: number;
  image: any;
  category: string;
  isDigital?: boolean;
  format?: string;
}

const CATALOG: Product[] = [
  {
    id: "prod-1",
    title: "Cabas Studio en Cuir",
    subtitle: "Cuir tanné végétal · Cognac",
    seller: "Maison Laurent",
    price: 48000,
    currency: "XOF",
    rating: 4.9,
    reviews: 124,
    image: imgLeatherTote,
    category: "leather",
    isDigital: false,
  },
  {
    id: "prod-2",
    title: "Chronographe Héritage",
    subtitle: "Automatique · Or & Acier",
    seller: "Atelier Horlogerie",
    price: 285000,
    currency: "XOF",
    rating: 5.0,
    reviews: 68,
    image: imgWatchChrono,
    category: "watches",
    isDigital: false,
  },
  {
    id: "prod-3",
    title: "Fauteuil Club Travertin",
    subtitle: "Pierre & Lin brut écru",
    seller: "Studio Djoliba",
    price: 145000,
    currency: "XOF",
    rating: 4.8,
    reviews: 42,
    image: imgArmchair,
    category: "home",
    isDigital: false,
  },
  {
    id: "prod-4",
    title: "Buste Royal Dahomey en Bronze",
    subtitle: "Bronze noble ciselé à la flamme",
    seller: "Fonderie Royale d'Abomey",
    price: 195000,
    currency: "XOF",
    rating: 5.0,
    reviews: 89,
    image: imgArtBronze,
    category: "art",
    isDigital: false,
  },
  {
    id: "prod-5",
    title: "Bague Sculpturale Or & Émeraude",
    subtitle: "Or jaune 18K · Émeraude ovale",
    seller: "Orfèvrerie Ashanti",
    price: 320000,
    currency: "XOF",
    rating: 4.9,
    reviews: 31,
    image: imgJewelryGold,
    category: "fashion",
    isDigital: false,
  },
  {
    id: "prod-6",
    title: "Traité de Modélisme & Patrons 1:1",
    subtitle: "Patrons vectoriels A0/A4 · Sac Cabas Royal",
    seller: "Studio Éditions",
    price: 6500,
    currency: "XOF",
    rating: 4.9,
    reviews: 215,
    image: imgDigitalPatterns,
    category: "digital",
    isDigital: true,
    format: "PDF Vectoriel (14.5 Mo)",
  },
  {
    id: "prod-7",
    title: "Guide Fonte Cire Perdue",
    subtitle: "Manuel technique d'alliages nobles",
    seller: "Fonderie Royale d'Abomey",
    price: 12000,
    currency: "XOF",
    rating: 5.0,
    reviews: 54,
    image: imgDigitalPatterns,
    category: "digital",
    isDigital: true,
    format: "E-Book Illustré (28.4 Mo)",
  },
  {
    id: "prod-8",
    title: "Tenture Bogolan & Soie",
    subtitle: "Soie sauvage · Pigments d'argile",
    seller: "Studio Djoliba",
    price: 36000,
    currency: "XOF",
    rating: 4.8,
    reviews: 89,
    image: imgLeatherTote,
    category: "art",
    isDigital: false,
  },
];

function formatXOF(price: number, currency = "FCFA") {
  return `${new Intl.NumberFormat("fr-FR").format(price)} ${currency}`;
}

function mapApiProduct(prod: ProductItem): Product {
  let image = imgLeatherTote;
  const cat = (prod.category || "").toLowerCase();
  const isDigital = cat.includes("digital") || cat.includes("patron") || cat.includes("guide");
  if (cat.includes("watch") || cat.includes("montre") || cat.includes("horlog")) {
    image = imgWatchChrono;
  } else if (cat.includes("home") || cat.includes("mobilier") || cat.includes("deco") || cat.includes("fauteuil")) {
    image = imgArmchair;
  } else if (cat.includes("jewel") || cat.includes("bijou") || cat.includes("or") || cat.includes("bague")) {
    image = imgJewelryGold;
  } else if (isDigital) {
    image = imgDigitalPatterns;
  } else if (cat.includes("art") || cat.includes("bronze") || cat.includes("sculpt")) {
    image = imgArtBronze;
  } else if (cat.includes("leather") || cat.includes("maroquinerie") || cat.includes("sac")) {
    image = imgLeatherTote;
  }
  
  return {
    id: prod.id,
    title: prod.title,
    subtitle: prod.description,
    seller: prod.artisanShop?.name || "Artisan d'Excellence",
    price: Math.round(prod.priceMinor / 100),
    currency: "FCFA",
    rating: 4.9,
    reviews: 24,
    image,
    category: prod.category || "other",
    isDigital: !!isDigital,
    format: isDigital ? "PDF Vectoriel (14.5 Mo)" : undefined,
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
  const [products, setProducts] = useState<any[]>(CATALOG);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = search.trim() ? search : undefined;
        const category = activeCat !== "all" ? activeCat : undefined;
        const apiProds = await CatalogApi.getProducts(query, category);
        const mappedApi = (apiProds || []).map(mapApiProduct);

        // Filter CATALOG baseline
        const filteredCatalog = CATALOG.filter((p) => {
          const matchCat = activeCat === "all" || p.category === activeCat;
          const matchSearch =
            !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.seller.toLowerCase().includes(search.toLowerCase());
          return matchCat && matchSearch;
        });

        // Combine CATALOG with API products (avoiding duplicates by id)
        const combined = [...filteredCatalog];
        for (const apiP of mappedApi) {
          if (!combined.some((p) => p.id === apiP.id)) {
            combined.push(apiP);
          }
        }
        setProducts(combined);
      } catch (err) {
        console.warn("API fallback to CATALOG", err);
        const filtered = CATALOG.filter((p) => {
          const matchCat = activeCat === "all" || p.category === activeCat;
          const matchSearch =
            !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.seller.toLowerCase().includes(search.toLowerCase());
          return matchCat && matchSearch;
        });
        setProducts(filtered);
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
  };

  const categories = [
    { id: "all", label: isEn ? "All" : "Tout", image: null, isAll: true },
    { id: "watches", label: isEn ? "Watches" : "Montres", image: imgWatchChrono, isAll: false },
    { id: "leather", label: isEn ? "Leather" : "Maroquinerie", image: imgLeatherTote, isAll: false },
    { id: "fashion", label: isEn ? "Jewelry" : "Bijoux d'Art", image: imgJewelryGold, isAll: false },
    { id: "home", label: isEn ? "Home" : "Mobilier d'Art", image: imgArmchair, isAll: false },
    { id: "art", label: isEn ? "Sculptures" : "Art & Bronze", image: imgArtBronze, isAll: false },
    { id: "digital", label: isEn ? "Digital" : "Numérique", image: imgDigitalPatterns, isAll: false },
  ];

  const filtered = products;

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
            <Text style={{ fontSize: 14, color: colors.text }}>
              {isDark ? "☼" : "☾"}
            </Text>
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
            <Text style={{ fontSize: 14 }}>🔔</Text>
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
            <Text style={{ fontSize: 16, color: "#FFFFFF" }}>🛍</Text>
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
            {isEn ? "Discover the Exceptional" : "Découvrez l'exceptionnel"}
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18 }}>
            {isEn
              ? "Unique pieces crafted by master artisans for discerning collectors."
              : "Des créations uniques confectionnées par des maîtres artisans d'exception."}
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
            <Text style={{ fontSize: 15, color: colors.muted, marginRight: 10 }}>🔍</Text>
            <TextInput
              placeholder={
                isEn
                  ? "Search for creations, watches, artisans..."
                  : "Rechercher une création, une montre, un atelier..."
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
                <Text style={{ fontSize: 11, color: colors.muted }}>⚲ SCAN</Text>
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
                  {c.isAll ? (
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
                    <Image
                      source={c.image}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 27,
                        resizeMode: "cover",
                      }}
                    />
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

        {/* ==================== HERO SPOTLIGHT BANNER ==================== */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: "#022B22",
              borderRadius: 22,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "rgba(212, 180, 131, 0.4)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 14,
              elevation: 5,
            }}
          >
            {/* Banner Text Content */}
            <View style={{ padding: 20, paddingBottom: 16 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  letterSpacing: 1.4,
                  color: colors.accent,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {isEn ? "CURATED COLLECTION" : "COLLECTION SÉLECTIONNÉE"}
              </Text>

              <Text
                style={{
                  fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                  fontSize: 24,
                  lineHeight: 28,
                  color: "#FFFFFF",
                  fontWeight: "700",
                  marginBottom: 6,
                }}
              >
                {isEn ? "Timeless Icons" : "Icônes Intemporelles"}
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(255, 255, 255, 0.82)",
                  lineHeight: 17,
                  marginBottom: 16,
                }}
              >
                {isEn
                  ? "Exceptional pieces from yesterday, today, and tomorrow."
                  : "Des pièces d'exception, hier, aujourd'hui et demain."}
              </Text>

              <Pressable
                onPress={onOpenNeed}
                style={({ pressed }) => [{
                  alignSelf: "flex-start",
                  backgroundColor: "#0D4A38",
                  borderWidth: 1,
                  borderColor: "rgba(212, 180, 131, 0.6)",
                  paddingHorizontal: 18,
                  paddingVertical: 9,
                  borderRadius: 22,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                }]}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
                  {isEn ? "Discover Collection →" : "Découvrir la sélection →"}
                </Text>
              </Pressable>
            </View>

            {/* Visual Header / Showcase Banner */}
            <View
              style={{
                height: 160,
                backgroundColor: "rgba(13, 74, 56, 0.5)",
                borderTopWidth: 1,
                borderColor: "rgba(212, 180, 131, 0.2)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Image
                source={imgWatchChrono}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: "rgba(2, 43, 34, 0.8)",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "700" }}>
                  Chronographe Héritage · Or & Acier
                </Text>
                {/* Pagination Dots */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 12,
                  }}
                >
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" }} />
                  <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "rgba(255,255,255,0.4)" }} />
                  <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "rgba(255,255,255,0.4)" }} />
                  <Text style={{ color: "#FFFFFF", fontSize: 9, fontWeight: "700", marginLeft: 3 }}>
                    1 / 4
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

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
          <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Column 1 */}
              <View style={{ flex: 1, gap: 14 }}>
                {filtered
                  .filter((_, i) => i % 2 === 0)
                  .map((prod) => (
                    <Pressable
                      key={prod.id}
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
                          source={prod.image}
                          style={{
                            width: "100%",
                            height: "100%",
                            resizeMode: "cover",
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
                            <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "800" }}>
                              ⚡ NUMÉRIQUE
                            </Text>
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
                          <Text
                            style={{
                              fontSize: 14,
                              color: favorites[prod.id] ? "#EF4444" : "#4B5563",
                            }}
                          >
                            {favorites[prod.id] ? "♥" : "♡"}
                          </Text>
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
                          {prod.seller}
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
                            <Text style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>
                              ★ {prod.rating.toFixed(1)} ({prod.reviews})
                            </Text>
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
                  .filter((_, i) => i % 2 !== 0)
                  .map((prod) => (
                    <Pressable
                      key={prod.id}
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
                          source={prod.image}
                          style={{
                            width: "100%",
                            height: "100%",
                            resizeMode: "cover",
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
                            <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "800" }}>
                              ⚡ NUMÉRIQUE
                            </Text>
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
                          <Text
                            style={{
                              fontSize: 14,
                              color: favorites[prod.id] ? "#EF4444" : "#4B5563",
                            }}
                          >
                            {favorites[prod.id] ? "♥" : "♡"}
                          </Text>
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
                          {prod.seller}
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
                            <Text style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>
                              ★ {prod.rating.toFixed(1)} ({prod.reviews})
                            </Text>
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
            {[
              {
                name: "Maison Laurent",
                initials: "ML",
                specialty: "Maroquinerie d'art",
                rating: 4.9,
                reviews: 320,
                img1: imgLeatherTote,
                img2: imgArmchair,
              },
              {
                name: "Atelier Horlogerie",
                initials: "AH",
                specialty: "Horlogerie & Joaillerie",
                rating: 5.0,
                reviews: 186,
                img1: imgWatchChrono,
                img2: imgLeatherTote,
              },
              {
                name: "Studio Djoliba",
                initials: "SD",
                specialty: "Design & Textiles nobles",
                rating: 4.8,
                reviews: 340,
                img1: imgArmchair,
                img2: imgWatchChrono,
              },
            ].map((shop, i) => (
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
                      <Text style={{ fontSize: 9 }}>👑</Text>
                      <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "800" }}>
                        Vendeur Pro
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                      ★ {shop.rating} ({shop.reviews})
                    </Text>
                  </View>
                </View>

                {/* Right: 2 product preview images */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Image
                      source={shop.img1}
                      style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                    />
                  </View>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Image
                      source={shop.img2}
                      style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ==================== ARTISAN REQUEST PROMPT ==================== */}
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
              {isEn ? "ARTISAN NETWORK" : "RÉSEAU D'ARTISANS"}
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
                ? "Cannot find the ideal creation?"
                : "Vous ne trouvez pas la création idéale ?"}
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
                ? "Describe your custom need. Master artisans submit tailored quotes directly to your inbox."
                : "Décrivez votre projet sur-mesure. Les maîtres artisans d'art vous soumettent directement leurs devis personnalisés."}
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
                {isEn ? "Post bespoke request →" : "Publier ma demande de création →"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

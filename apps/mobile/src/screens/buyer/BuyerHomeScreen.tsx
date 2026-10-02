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
} from "react-native";
import { useDesign } from "../../design-system/provider";
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
const imgBrandLight = require("../../../assets/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Transparent.png");
const imgBrandDark = require("../../../assets/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Dark_Transparent.png");

const CATALOG = [
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
  },
  {
    id: "prod-4",
    title: "Tenture Bogolan",
    subtitle: "Soie sauvage · Pigments",
    seller: "Studio Djoliba",
    price: 36000,
    currency: "XOF",
    rating: 4.9,
    reviews: 89,
    image: imgLeatherTote,
    category: "fashion",
  },
  {
    id: "prod-5",
    title: "Bague Sculpturale Or",
    subtitle: "Or 18K · Tourmaline",
    seller: "Orfèvrerie Ashanti",
    price: 95000,
    currency: "XOF",
    rating: 4.9,
    reviews: 31,
    image: imgWatchChrono,
    category: "watches",
  },
  {
    id: "prod-6",
    title: "Traité de Modélisme",
    subtitle: "Patrons échelle 1:1",
    seller: "Studio Éditions",
    price: 6500,
    currency: "XOF",
    rating: 4.7,
    reviews: 215,
    image: imgArmchair,
    category: "digital",
  },
];

function formatXOF(price: number, currency = "XOF") {
  return `${new Intl.NumberFormat("fr-FR").format(price)} ${currency}`;
}

function mapApiProduct(prod: ProductItem) {
  let image = imgLeatherTote;
  const cat = (prod.category || "").toLowerCase();
  if (cat.includes("joaillerie") || cat.includes("watches") || cat.includes("bijoux")) image = imgWatchChrono;
  else if (cat.includes("mobilier") || cat.includes("home") || cat.includes("deco")) image = imgArmchair;
  else if (cat.includes("mode") || cat.includes("fashion") || cat.includes("art")) image = imgLeatherTote;
  else if (cat.includes("maroquinerie") || cat.includes("leather")) image = imgLeatherTote;
  
  return {
    id: prod.id,
    title: prod.title,
    subtitle: prod.description,
    seller: prod.artisanShop?.name || "Artisan",
    price: Math.round(prod.priceMinor / 100),
    currency: prod.currency || "XOF",
    rating: 4.8,
    reviews: 12,
    image,
    category: prod.category,
  };
}

export default function BuyerHomeScreen({
  onSelectProduct,
  onOpenNeed,
  onOpenCart,
  onSwitchToSeller,
}: BuyerHomeScreenProps) {
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
        if (apiProds && apiProds.length > 0) {
          setProducts(apiProds.map(mapApiProduct));
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.warn("API failed, falling back to CATALOG", err);
        // Fallback filter
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
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, activeCat]);

  const toggleFav = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { id: "all", label: isEn ? "All" : "Tout", icon: "❖" },
    { id: "leather", label: isEn ? "Bags" : "Sacs", icon: "⌗" },
    { id: "watches", label: isEn ? "Watches" : "Montres", icon: "◷" },
    { id: "fashion", label: isEn ? "Art" : "Art", icon: "✦" },
    { id: "home", label: isEn ? "Home" : "Maison", icon: "⌂" },
    { id: "digital", label: isEn ? "Digital" : "Numérique", icon: "▤" },
  ];

  const filtered = products;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* ==================== PINNED FIXED TOP BAR ==================== */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: Platform.OS === "android" ? 14 : 10,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
          zIndex: 10,
        }}
      >
        <Image
          source={isDark ? imgBrandDark : imgBrandLight}
          style={{ width: 110, height: 26, resizeMode: "contain" }}
        />

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable
            onPress={() => setLocale(isEn ? "fr" : "en")}
            style={({ pressed }) => [{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            }]}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.text }}>
              {isEn ? "FR" : "EN"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMode(isDark ? "light" : "dark")}
            style={({ pressed }) => [{
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            }]}
          >
            <Text style={{ fontSize: 13, color: colors.text }}>
              {isDark ? "☼" : "☾"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onOpenCart}
            style={({ pressed }) => [{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            }]}
          >
            <Text style={{ fontSize: 15, color: colors.text }}>🛍</Text>
          </Pressable>
        </View>
      </View>

      {/* ==================== SCROLLABLE CONTENT ==================== */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== EDITORIAL LEAD ==================== */}
        <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12 }}>
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
        <Text style={{ fontSize: 13, color: colors.muted }}>
          {isEn
            ? "Unique pieces for unique individuals."
            : "Des produits uniques pour des personnes uniques."}
        </Text>
      </View>

      {/* ==================== SEARCH BAR ==================== */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.subtle,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            height: 44,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.muted, marginRight: 8 }}>🔍</Text>
          <TextInput
            placeholder={
              isEn
                ? "Search for products, brands..."
                : "Rechercher un produit, une marque..."
            }
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            style={{
              flex: 1,
              fontSize: 14,
              color: colors.text,
              paddingVertical: 0,
            }}
          />
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
              style={{ alignItems: "center", width: 62 }}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: isActive ? colors.action : colors.subtle,
                  borderWidth: 1,
                  borderColor: isActive ? colors.action : colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                  shadowColor: colors.action,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isActive ? 0.25 : 0,
                  shadowRadius: 4,
                  elevation: isActive ? 3 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: isActive ? "#FFFFFF" : colors.text,
                  }}
                >
                  {c.icon}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? colors.text : colors.muted,
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

      {/* ==================== HERO SPOTLIGHT ==================== */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <View
          style={{
            backgroundColor: "#022B22",
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(212, 180, 131, 0.35)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 14,
            elevation: 4,
          }}
        >
          {/* Card Text Content */}
          <View style={{ padding: 20, paddingBottom: 14 }}>
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
                color: "rgba(255, 255, 255, 0.8)",
                lineHeight: 17,
                marginBottom: 14,
              }}
            >
              {isEn
                ? "Exceptional pieces from yesterday, today, and tomorrow."
                : "Des pièces d'exception, hier, aujourd'hui et demain."}
            </Text>

            <Pressable
              onPress={onOpenNeed}
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#033C2F",
                borderWidth: 1,
                borderColor: "rgba(212, 180, 131, 0.5)",
                paddingHorizontal: 18,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
                {isEn ? "Discover →" : "Découvrir →"}
              </Text>
            </Pressable>
          </View>

          {/* Watch Visual */}
          <View style={{ height: 180, width: "100%", position: "relative" }}>
            <Image
              source={imgWatchChrono}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
            {/* Pagination Dots */}
            <View
              style={{
                position: "absolute",
                bottom: 10,
                left: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(0,0,0,0.4)",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 12,
              }}
            >
              <View
                style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" }}
              />
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: "rgba(255,255,255,0.4)",
                }}
              />
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: "rgba(255,255,255,0.4)",
                }}
              />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 10,
                  fontWeight: "600",
                  marginLeft: 4,
                }}
              >
                1 / 4
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ==================== 2-COLUMN PRODUCT GRID ==================== */}
      <View style={{ paddingHorizontal: 20, marginBottom: 26 }}>
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
              fontSize: 18,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {isEn ? "Recommended for you" : "Recommandé pour vous"}
          </Text>

          <Pressable onPress={() => setActiveCat("all")}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.action }}>
              {isEn ? "See all →" : "Voir tout →"}
            </Text>
          </Pressable>
        </View>

        {/* 2 Columns Layout */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          {/* Column 1 (even index) */}
          <View style={{ flex: 1, gap: 12 }}>
            {filtered
              .filter((_, i) => i % 2 === 0)
              .map((prod) => (
                <Pressable
                  key={prod.id}
                  onPress={() => onSelectProduct(prod)}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0 : 0.04,
                    shadowRadius: 6,
                    elevation: isDark ? 0 : 1,
                  }}
                >
                  {/* Photo 4:5 */}
                  <View style={{ width: "100%", aspectRatio: 4 / 5, position: "relative" }}>
                    <Image
                      source={prod.image}
                      style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                    />
                    {/* Wishlist Heart */}
                    <Pressable
                      onPress={() => toggleFav(prod.id)}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "rgba(255,255,255,0.85)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: favorites[prod.id] ? "#EF4444" : "#5B6661",
                        }}
                      >
                        {favorites[prod.id] ? "♥" : "♡"}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Body */}
                  <View style={{ padding: 10 }}>
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "700",
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
                        fontSize: 13,
                        fontWeight: "700",
                        color: colors.text,
                        marginBottom: 4,
                      }}
                      numberOfLines={1}
                    >
                      {prod.title}
                    </Text>

                    {/* Footer: Price + Cart */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 4,
                        paddingTop: 6,
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
                          {formatXOF(prod.price, prod.currency)}
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>
                          ★ {prod.rating.toFixed(1)}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => onOpenCart()}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          backgroundColor: colors.action,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
                          +
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              ))}
          </View>

          {/* Column 2 (odd index) */}
          <View style={{ flex: 1, gap: 12 }}>
            {filtered
              .filter((_, i) => i % 2 !== 0)
              .map((prod) => (
                <Pressable
                  key={prod.id}
                  onPress={() => onSelectProduct(prod)}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0 : 0.04,
                    shadowRadius: 6,
                    elevation: isDark ? 0 : 1,
                  }}
                >
                  {/* Photo 4:5 */}
                  <View style={{ width: "100%", aspectRatio: 4 / 5, position: "relative" }}>
                    <Image
                      source={prod.image}
                      style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                    />
                    {/* Wishlist Heart */}
                    <Pressable
                      onPress={() => toggleFav(prod.id)}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "rgba(255,255,255,0.85)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: favorites[prod.id] ? "#EF4444" : "#5B6661",
                        }}
                      >
                        {favorites[prod.id] ? "♥" : "♡"}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Body */}
                  <View style={{ padding: 10 }}>
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "700",
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
                        fontSize: 13,
                        fontWeight: "700",
                        color: colors.text,
                        marginBottom: 4,
                      }}
                      numberOfLines={1}
                    >
                      {prod.title}
                    </Text>

                    {/* Footer: Price + Cart */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 4,
                        paddingTop: 6,
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
                          {formatXOF(prod.price, prod.currency)}
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>
                          ★ {prod.rating.toFixed(1)}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => onOpenCart()}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          backgroundColor: colors.action,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
                          +
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              ))}
          </View>
        </View>
      </View>

      {/* ==================== BOUTIQUES DE CONFIANCE ==================== */}
      <View style={{ marginBottom: 26 }}>
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
              fontSize: 18,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {isEn ? "Trusted Shops" : "Boutiques de confiance"}
          </Text>

          <Pressable>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.action }}>
              {isEn ? "See all →" : "Voir tout →"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {[
            {
              name: "Maison Laurent",
              initials: "ML",
              verified: true,
              rating: 4.8,
              reviews: 320,
              photos: [imgLeatherTote, imgArmchair],
            },
            {
              name: "Atelier Horlogerie",
              initials: "AH",
              verified: true,
              rating: 4.9,
              reviews: 186,
              photos: [imgWatchChrono, imgLeatherTote],
            },
            {
              name: "Studio Djoliba",
              initials: "SD",
              verified: true,
              rating: 4.8,
              reviews: 340,
              photos: [imgArmchair, imgWatchChrono],
            },
          ].map((shop, i) => (
            <View
              key={i}
              style={{
                width: 270,
                backgroundColor: colors.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              {/* Left: Avatar + Info */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: colors.subtle,
                    borderWidth: 1,
                    borderColor: colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                      fontSize: 13,
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
                  <Text style={{ fontSize: 10, color: colors.action, fontWeight: "700" }}>
                    ✓ Vendeur Pro
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>
                    ★ {shop.rating} ({shop.reviews})
                  </Text>
                </View>
              </View>

              {/* Right: 2 photos */}
              <View style={{ flexDirection: "row", gap: 4 }}>
                {shop.photos.map((ph, idx) => (
                  <Image
                    key={idx}
                    source={ph}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ==================== ARTISAN REQUEST CARD ==================== */}
      <View style={{ paddingHorizontal: 20 }}>
        <View
          style={{
            backgroundColor: "#022B22",
            borderRadius: 18,
            padding: 20,
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
              color: "rgba(255, 255, 255, 0.8)",
              textAlign: "center",
              lineHeight: 16,
              marginBottom: 14,
            }}
          >
            {isEn
              ? "Describe your need. Verified artisans submit customized proposals."
              : "Décrivez votre besoin sur-mesure. Les artisans certifiés vous soumettent directement leurs devis."}
          </Text>

          <Pressable
            onPress={onOpenNeed}
            style={{
              backgroundColor: colors.action,
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
              {isEn ? "Post bespoke request →" : "Publier ma demande de création →"}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

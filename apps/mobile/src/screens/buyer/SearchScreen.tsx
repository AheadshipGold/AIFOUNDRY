import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useDesign } from "../../design-system/provider";
import { CatalogApi, ProductItem } from "../../services/api";

interface SearchScreenProps {
  onSelectProduct: (prod: any) => void;
  onOpenNeed: () => void;
  onOpenCart: () => void;
}

// Local image assets
const imgLeatherTote = require("../../../assets/products/leather-tote.jpg");
const imgWatchChrono = require("../../../assets/products/watch-chrono.jpg");
const imgArmchair = require("../../../assets/products/armchair.jpg");

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

function formatXOF(price: number, currency = "FCFA") {
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

export default function SearchScreen({
  onSelectProduct,
  onOpenNeed,
  onOpenCart,
}: SearchScreenProps) {
  const { colors, locale, mode } = useDesign();
  const isEn = locale === "en";
  const isDark = mode === "dark";

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [activePrice, setActivePrice] = useState("all");
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
          if (activeCat !== "all" && p.category !== activeCat) return false;
          if (search.trim()) {
            const q = search.toLowerCase();
            if (!p.title.toLowerCase().includes(q) && !p.seller.toLowerCase().includes(q)) return false;
          }
          if (activePrice === "low" && p.price >= 50000) return false;
          if (activePrice === "mid" && (p.price < 50000 || p.price > 150000)) return false;
          if (activePrice === "high" && p.price <= 150000) return false;
          return true;
        });

        // Merge API products without duplicating IDs
        const combined = [...filteredCatalog];
        for (const apiP of mappedApi) {
          if (!combined.some((p) => p.id === apiP.id)) {
            if (activePrice === "low" && apiP.price >= 50000) continue;
            if (activePrice === "mid" && (apiP.price < 50000 || apiP.price > 150000)) continue;
            if (activePrice === "high" && apiP.price <= 150000) continue;
            combined.push(apiP);
          }
        }
        setProducts(combined);
      } catch (err) {
        console.warn("API failed, falling back to CATALOG", err);
        // Fallback filter
        const filtered = CATALOG.filter((p) => {
          if (activeCat !== "all" && p.category !== activeCat) return false;
          if (search.trim()) {
            const q = search.toLowerCase();
            if (!p.title.toLowerCase().includes(q) && !p.seller.toLowerCase().includes(q)) return false;
          }
          if (activePrice === "low" && p.price >= 50000) return false;
          if (activePrice === "mid" && (p.price < 50000 || p.price > 150000)) return false;
          if (activePrice === "high" && p.price <= 150000) return false;
          return true;
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
  }, [search, activeCat, activePrice]);

  const toggleFav = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { id: "all", label: isEn ? "All" : "Tout" },
    { id: "leather", label: isEn ? "Leather" : "Maroquinerie" },
    { id: "watches", label: isEn ? "Watches" : "Horlogerie" },
    { id: "fashion", label: isEn ? "Fashion" : "Art & Soie" },
    { id: "home", label: isEn ? "Home" : "Mobilier & Déco" },
    { id: "digital", label: isEn ? "Digital" : "Numérique" },
  ];

  const priceRanges = [
    { id: "all", label: isEn ? "All" : "Tout" },
    { id: "low", label: "< 50 000 FCFA" },
    { id: "mid", label: "50 000 - 150 000 FCFA" },
    { id: "high", label: "> 150 000 FCFA" },
  ];

  const filtered = products;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* ==================== HEADER & SEARCH ==================== */}
      <View
        style={{
          paddingTop: Platform.OS === "android" ? 14 : 44,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.subtle,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            height: 48,
          }}
        >
          <Text style={{ fontSize: 16, color: colors.muted, marginRight: 8 }}>
            🔍
          </Text>
          <TextInput
            placeholder={
              isEn
                ? "Search for creations, artisans..."
                : "Rechercher des créations, artisans..."
            }
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            style={{
              flex: 1,
              fontSize: 15,
              color: colors.text,
              paddingVertical: 0,
            }}
          />
          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch("")}
              style={{ padding: 4, marginLeft: 4 }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: colors.muted,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 10, color: colors.surface, fontWeight: "bold" }}>
                  ✕
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ==================== FILTERS ==================== */}
        <View style={{ paddingTop: 16, paddingBottom: 12 }}>
          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
            style={{ marginBottom: 14 }}
          >
            {categories.map((cat) => {
              const isActive = activeCat === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setActiveCat(cat.id)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isActive ? colors.action : colors.surface,
                    borderWidth: 1,
                    borderColor: isActive ? colors.action : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? "600" : "400",
                      color: isActive ? "#FFFFFF" : colors.text,
                    }}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Price Ranges */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          >
            {priceRanges.map((pr) => {
              const isActive = activePrice === pr.id;
              return (
                <Pressable
                  key={pr.id}
                  onPress={() => setActivePrice(pr.id)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isActive ? colors.action : colors.surface,
                    borderWidth: 1,
                    borderColor: isActive ? colors.action : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? "600" : "400",
                      color: isActive ? "#FFFFFF" : colors.text,
                    }}
                  >
                    {pr.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ==================== RESULTS HEADER ==================== */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
            }}
          >
            {filtered.length}{" "}
            {isEn
              ? filtered.length === 1
                ? "creation available"
                : "creations available"
              : filtered.length === 1
              ? "création disponible"
              : "créations disponibles"}
          </Text>
        </View>

        {/* ==================== GRID OR ZERO STATE ==================== */}
        {filtered.length === 0 ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 24,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0 : 0.05,
                shadowRadius: 10,
                elevation: isDark ? 0 : 2,
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  marginBottom: 12,
                  color: colors.text,
                  opacity: 0.8,
                }}
              >
                ✧
              </Text>
              <Text
                style={{
                  fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.text,
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                {isEn
                  ? "Cannot find the ideal piece?"
                  : "Vous ne trouvez pas la création idéale ?"}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.muted,
                  textAlign: "center",
                  lineHeight: 20,
                  marginBottom: 24,
                }}
              >
                {isEn
                  ? "Post a request and describe your needs to our verified master artisans."
                  : "Décrivez votre besoin aux maîtres artisans vérifiés."}
              </Text>

              <Pressable
                onPress={onOpenNeed}
                style={{
                  backgroundColor: colors.action,
                  paddingHorizontal: 24,
                  paddingVertical: 14,
                  borderRadius: 24,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  {isEn ? "Post a request →" : "Exprimer un besoin →"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View
            style={{
              paddingHorizontal: 20,
              flexDirection: "row",
              gap: 12,
            }}
          >
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
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        aspectRatio: 4 / 5,
                        position: "relative",
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
                          fontFamily:
                            Platform.OS === "android" ? "serif" : "Georgia",
                          fontSize: 13,
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
                            {formatXOF(prod.price, "FCFA")}
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              color: colors.muted,
                              marginTop: 1,
                            }}
                          >
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
                          <Text
                            style={{
                              color: "#FFFFFF",
                              fontSize: 13,
                              fontWeight: "700",
                            }}
                          >
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
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        aspectRatio: 4 / 5,
                        position: "relative",
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
                          fontFamily:
                            Platform.OS === "android" ? "serif" : "Georgia",
                          fontSize: 13,
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
                            {formatXOF(prod.price, "FCFA")}
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              color: colors.muted,
                              marginTop: 1,
                            }}
                          >
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
                          <Text
                            style={{
                              color: "#FFFFFF",
                              fontSize: 13,
                              fontWeight: "700",
                            }}
                          >
                            +
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesign } from "../../design-system/provider";
import Icon from "../../design-system/Icon";
import { CatalogApi, FavoritesApi, ProductItem, API_BASE_URL } from "../../services/api";

interface SearchScreenProps {
  onSelectProduct: (prod: any) => void;
  onOpenNeed: () => void;
  onOpenCart: () => void;
}

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


const resolveImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = API_BASE_URL.replace(':3001/api', ':3000');
  return `${base}${url.startsWith('/') ? url : '/' + url}`;
};

function mapApiProduct(prod: ProductItem): Product {
  const cat = (prod.category || "").toLowerCase();
  const isDigital = cat.includes("digital") || cat.includes("patron") || cat.includes("guide");
  
  let cleanTitle = prod.title || "";
  let cleanSubtitle = prod.description || "";
  let cleanSeller = prod.artisanShop?.name || "Boutique Partenaire";

  const lowerT = cleanTitle.toLowerCase();
  const lowerS = cleanSeller.toLowerCase();

  if (lowerT.includes("guel") || lowerT.includes("gél") || lowerT.includes("masque") || lowerT.includes("vaudou") || lowerT.includes("fetich")) {
    cleanTitle = "Buste Royal en Bronze Ciselé";
    cleanSubtitle = "Œuvre sculpturale d'art en bronze noble et patine royale d'Abomey";
  }

  if (lowerS.includes("ouidah") || lowerS.includes("sculpture")) {
    cleanSeller = "Galerie d'Art Royale";
  }

  return {
    id: prod.id,
    title: cleanTitle,
    subtitle: cleanSubtitle,
    seller: cleanSeller,
    price: Math.round(prod.priceMinor / 100),
    currency: prod.currency || "XOF",
    rating: (prod as any).rating !== undefined ? (prod as any).rating : null,
    reviews: (prod as any).reviewsCount !== undefined ? (prod as any).reviewsCount : 0,
    image: prod.image ? { uri: resolveImageUrl(prod.image) } : undefined,
    category: prod.category || "other",
    isDigital: !!isDigital,
    format: isDigital ? "PDF Vectoriel (14.5 Mo)" : undefined,
  };
}

export default function SearchScreen({
  onSelectProduct,
  onOpenNeed,
  onOpenCart,
}: SearchScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0);
  const { colors, locale, mode } = useDesign();
  const isEn = locale === "en";
  const isDark = mode === "dark";

  

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [activePrice, setActivePrice] = useState("all");
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
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = search.trim() ? search : undefined;
        const category = activeCat !== "all" ? activeCat : undefined;
        const apiProds = await CatalogApi.getProducts(query, category);
        const mappedApi = (apiProds || []).map(mapApiProduct);

        const filteredApi = mappedApi.filter((p) => {
          if (activePrice === "low" && p.price >= 50000) return false;
          if (activePrice === "mid" && (p.price < 50000 || p.price > 150000)) return false;
          if (activePrice === "high" && p.price <= 150000) return false;
          return true;
        });

        setProducts(filteredApi);
      } catch (err) {
        console.warn("API failed", err);
        setProducts([]);
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
    FavoritesApi.toggleFavorite(id).catch((err) => {
      console.warn("Failed to toggle favorite in database", err);
      setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    });
  };

  const categories = [
    { id: "all", label: isEn ? "All" : "Tout" },
    { id: "watches", label: isEn ? "Watches" : "Montres" },
    { id: "leather", label: isEn ? "Leather" : "Maroquinerie" },
    { id: "fashion", label: isEn ? "Jewelry & Fashion" : "Bijoux & Mode" },
    { id: "home", label: isEn ? "Home & Decor" : "Maison & Mobilier" },
    { id: "art", label: isEn ? "Art & Sculptures" : "Art & Décoration" },
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
          paddingTop: topInset > 0 ? topInset + 6 : (Platform.OS === "android" ? 36 : 44),
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
            
          </Text>
          <TextInput
            placeholder={
              isEn
                ? "Search for products, boutiques..."
                : "Rechercher des produits, boutiques..."
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
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
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
                ? "product available"
                : "products available"
              : filtered.length === 1
              ? "produit disponible"
              : "produits disponibles"}
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
                  ? "Cannot find the ideal product?"
                  : "Vous ne trouvez pas le produit idéal ?"}
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
                  ? "Post a request and describe what you need to verified merchants and stores."
                  : "Décrivez votre recherche de produit aux commerçants et boutiques vérifiés."}
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
                  {isEn ? "Post a request →" : "Publier une demande →"}
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
            <View style={{ width: "48.5%", gap: 12 }}>
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
                            NUMÉRIQUE
                          </Text>
                        </View>
                      ) : null}

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
                        <Icon name="heart" size={15} color={favorites[prod.id] ? "#EF4444" : "#6B7280"} weight={favorites[prod.id] ? "fill" : "regular"} />
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
                          {prod.reviews && prod.reviews > 0 && prod.rating ? (
                            <Text style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>
                              ★ {prod.rating.toFixed(1)} ({prod.reviews})
                            </Text>
                          ) : (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
                              <Icon name="sparkle" size={9} color={colors.accent} weight="fill" />
                              <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>
                                {isEn ? "NEW ARRIVAL" : "NOUVEAU"}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Pressable
                          onPress={() => (prod.isDigital || prod.category === "digital" ? onSelectProduct(prod) : onOpenCart())}
                          style={({ pressed }) => [{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: prod.isDigital || prod.category === "digital" ? colors.accent : colors.action,
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: pressed ? 0.85 : 1,
                            transform: [{ scale: pressed ? 0.92 : 1 }],
                          }]}
                        >
                          {prod.isDigital || prod.category === "digital" ? (
                            <Icon name="download" size={16} color="#022B22" weight="bold" />
                          ) : (
                            <Icon name="plus" size={16} color="#FFFFFF" weight="bold" />
                          )}
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                ))}
            </View>

            {/* Column 2 (odd index) */}
            <View style={{ width: "48.5%", gap: 12 }}>
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
                            NUMÉRIQUE
                          </Text>
                        </View>
                      ) : null}

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
                        <Icon name="heart" size={15} color={favorites[prod.id] ? "#EF4444" : "#6B7280"} weight={favorites[prod.id] ? "fill" : "regular"} />
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
                          {prod.reviews && prod.reviews > 0 && prod.rating ? (
                            <Text style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>
                              ★ {prod.rating.toFixed(1)} ({prod.reviews})
                            </Text>
                          ) : (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
                              <Icon name="sparkle" size={9} color={colors.accent} weight="fill" />
                              <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>
                                {isEn ? "NEW ARRIVAL" : "NOUVEAU"}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Pressable
                          onPress={() => (prod.isDigital || prod.category === "digital" ? onSelectProduct(prod) : onOpenCart())}
                          style={({ pressed }) => [{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: prod.isDigital || prod.category === "digital" ? colors.accent : colors.action,
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: pressed ? 0.85 : 1,
                            transform: [{ scale: pressed ? 0.92 : 1 }],
                          }]}
                        >
                          {prod.isDigital || prod.category === "digital" ? (
                            <Icon name="download" size={16} color="#022B22" weight="bold" />
                          ) : (
                            <Icon name="plus" size={16} color="#FFFFFF" weight="bold" />
                          )}
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

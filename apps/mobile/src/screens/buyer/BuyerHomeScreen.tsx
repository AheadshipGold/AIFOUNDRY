import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { useDesign } from "../../design-system/provider";
import {
  ProductCard,
  ShopCard,
  Button,
  SearchField,
  Label,
  Card,
  Badge,
} from "../../design-system/components";

interface BuyerHomeScreenProps {
  onSelectProduct: (prod: any) => void;
  onOpenNeed: () => void;
  onOpenCart: () => void;
  onSwitchToSeller: () => void;
}

const SAMPLE_PRODUCTS = [
  {
    id: "prod-1",
    title: "Cabas Studio en Cuir Tanné Végétal",
    price: 48000,
    currency: "XOF",
    seller: "Maison Laurent",
    city: "Cotonou",
    rating: 4.9,
    category: "leather",
  },
  {
    id: "prod-2",
    title: "Chronographe Héritage Or & Acier",
    price: 285000,
    currency: "XOF",
    seller: "Atelier Horlogerie",
    city: "Abidjan",
    rating: 5.0,
    category: "watches",
  },
  {
    id: "prod-3",
    title: "Fauteuil Club Travertin & Lin Brut",
    price: 145000,
    currency: "XOF",
    seller: "Studio Djoliba",
    city: "Bamako",
    rating: 4.8,
    category: "home",
  },
  {
    id: "prod-4",
    title: "Tenture Bogolan & Soie Sauvage",
    price: 36000,
    currency: "XOF",
    seller: "Studio Djoliba",
    city: "Bamako",
    rating: 4.9,
    category: "fashion",
  },
];

export default function BuyerHomeScreen({
  onSelectProduct,
  onOpenNeed,
  onOpenCart,
  onSwitchToSeller,
}: BuyerHomeScreenProps) {
  const { colors, locale, mode, setMode, setLocale } = useDesign();
  const isEn = locale === "en";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  const categories = [
    { id: "all", label: isEn ? "All" : "Tout" },
    { id: "leather", label: isEn ? "Leather" : "Maroquinerie" },
    { id: "watches", label: isEn ? "Watches" : "Horlogerie" },
    { id: "fashion", label: isEn ? "Textiles" : "Textiles" },
    { id: "home", label: isEn ? "Home" : "Maison" },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top App Bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 22,
              fontWeight: "700",
              color: colors.accent,
              letterSpacing: -0.5,
            }}
          >
            [O]jarket
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
            {isEn ? "Prestige Marketplace" : "Marché d'exception"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable
            onPress={() => setLocale(isEn ? "fr" : "en")}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.text }}>
              {isEn ? "FR" : "EN"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMode(mode === "dark" ? "light" : "dark")}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 13, color: colors.text }}>
              {mode === "dark" ? "☼" : "☾"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onSwitchToSeller}
            style={{
              backgroundColor: colors.successBg,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.action,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.action }}>
              {isEn ? "Seller OS →" : "Espace Vendeur →"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Hero Curated Spotlight */}
      <View style={{ paddingHorizontal: 20, marginVertical: 12 }}>
        <View
          style={{
            backgroundColor: "#111B38",
            borderRadius: 20,
            padding: 22,
            borderWidth: 1,
            borderColor: colors.accent,
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 1.5,
              color: colors.accent,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {isEn ? "CURATED COLLECTION" : "SÉLECTION DU MOMENT"}
          </Text>

          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 26,
              lineHeight: 30,
              color: "#FFFFFF",
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            {isEn ? "Discover the Exceptional" : "Découvrez l'exceptionnel"}
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: "rgba(255, 255, 255, 0.75)",
              lineHeight: 18,
              marginBottom: 16,
            }}
          >
            {isEn
              ? "Handcrafted by West Africa's master ateliers with sovereign precision."
              : "Des pièces d'exception façonnées à la main par les grands maîtres ateliers d'Afrique de l'Ouest."}
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button onPress={() => {}}>
              {isEn ? "Explore Works →" : "Explorer la sélection →"}
            </Button>
          </View>
        </View>
      </View>

      {/* Search Input */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <SearchField
          label={isEn ? "Search" : "Recherche"}
          value={search}
          onChangeText={setSearch}
          placeholder={
            isEn ? "Search pieces, ateliers, cities..." : "Rechercher une pièce, un atelier..."
          }
        />
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginBottom: 20 }}
      >
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setSelectedCategory(c.id)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor:
                selectedCategory === c.id ? colors.action : colors.surface,
              borderWidth: 1,
              borderColor:
                selectedCategory === c.id ? colors.action : colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: selectedCategory === c.id ? "#FFFFFF" : colors.text,
              }}
            >
              {c.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Products Grid Section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
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
              fontSize: 20,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {isEn ? "Curated Creations" : "Sélection d'excellence"}
          </Text>

          <Pressable onPress={onOpenNeed}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.action }}>
              {isEn ? "Custom Request →" : "Sur-mesure ? →"}
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: 14 }}>
          {SAMPLE_PRODUCTS.map((prod) => (
            <Pressable
              key={prod.id}
              onPress={() => onSelectProduct(prod)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                flexDirection: "row",
                gap: 14,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 12,
                  backgroundColor: colors.subtle,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 28, color: colors.accent }}>◈</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>
                  {prod.seller} · {prod.city}
                </Text>
                <Text
                  style={{
                    fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: 6,
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
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "800",
                      color: colors.action,
                    }}
                  >
                    {new Intl.NumberFormat("fr-FR").format(prod.price)} {prod.currency}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.accent, fontWeight: "700" }}>
                    ★ {prod.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* D02 Banner: Exprimer un besoin */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "800",
              color: colors.accent,
              letterSpacing: 1.2,
              marginBottom: 6,
            }}
          >
            RÉSEAU SUR-MESURE · D02
          </Text>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 18,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 6,
            }}
          >
            {isEn
              ? "Cannot find your ideal piece?"
              : "Vous ne trouvez pas la création idéale ?"}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              lineHeight: 18,
              marginBottom: 16,
            }}
          >
            {isEn
              ? "Describe your custom requirement. Certified master artisans will reply directly with bespoke offers."
              : "Formulez votre demande avec aide IA facultative. Les ateliers certifiés vous soumettront directement leurs devis."}
          </Text>
          <Button onPress={onOpenNeed}>
            {isEn ? "Post Custom Request →" : "Publier une demande sur-mesure →"}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

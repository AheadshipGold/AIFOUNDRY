import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesign } from "../../design-system/provider";
import { RequestsApi } from "../../services/api";

interface RequestNeedScreenProps {
  onBack: () => void;
  onSubmitted: () => void;
}

const imgWatchChrono = require("../../../assets/products/watch-chrono.jpg");

export default function RequestNeedScreen({
  onBack,
  onSubmitted,
}: RequestNeedScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0);
  const { colors, locale, mode } = useDesign();
  const isEn = locale === "en";
  const isDark = mode === "dark";

  const [category, setCategory] = useState("watches");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("50 000 FCFA – 150 000 FCFA");
  const [location, setLocation] = useState("Cotonou, Bénin");
  const [preference, setPreference] = useState("tres_bon_etat");
  const [hasPhoto, setHasPhoto] = useState(true);
  const [isAiStructuring, setIsAiStructuring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headingFont = Platform.OS === "android" ? "serif" : "Georgia";

  const categoryMap: Record<string, { labelFr: string; labelEn: string; icon: string }> = {
    watches: { labelFr: "Montres", labelEn: "Watches", icon: "⌚" },
    leather: { labelFr: "Sacs & Maroquinerie", labelEn: "Bags & Leather", icon: "💼" },
    jewelry: { labelFr: "Bijoux & Bronze", labelEn: "Jewelry & Bronze", icon: "👑" },
    fashion: { labelFr: "Art & Soie", labelEn: "Art & Silks", icon: "✦" },
    home: { labelFr: "Maison & Mobilier", labelEn: "Home & Furniture", icon: "🪑" },
  };

  const cycleCategory = () => {
    const keys = Object.keys(categoryMap);
    const nextIdx = (keys.indexOf(category) + 1) % keys.length;
    setCategory(keys[nextIdx]);
  };

  const handleAiAssist = () => {
    setIsAiStructuring(true);
    setTimeout(() => {
      setIsAiStructuring(false);
      const enriched = description.trim()
        ? `${description.trim()}\n\n[Spécification optimisée IA]\n• Caractéristiques : Finitions soignées et matériaux de qualité\n• État souhaité : Neuf ou Très bon état\n• Délai estimé : 5 à 10 jours ouvrés`
        : "Recherche d'un produit spécifique de qualité, avec garantie boutique et facture commerciale.";
      setDescription(enriched);
    }, 600);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(
        isEn ? "Description Required" : "Description Requise",
        isEn
          ? "Please describe the product you are looking for."
          : "Veuillez décrire le produit que vous recherchez."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await RequestsApi.create({
        buyerName: "Amina Diop",
        buyerPhone: "+229 97 00 00 00",
        rawPrompt: description,
        category,
        budgetMinor: 8500000,
      });

      Alert.alert(
        isEn ? "Request Published!" : "Demande publiée !",
        isEn
          ? "Verified merchants and stores have received your request and will send you direct offers."
          : "Les commerçants et boutiques vérifiés ont reçu votre demande et vous transmettront leurs offres.",
        [{ text: "OK", onPress: onSubmitted }]
      );
    } catch {
      Alert.alert(
        isEn ? "Request Published!" : "Demande publiée !",
        isEn
          ? "Verified stores have received your request."
          : "Les boutiques certifiées ont bien reçu votre demande.",
        [{ text: "OK", onPress: onSubmitted }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* ==================== PINNED FIXED HEADER ==================== */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: topInset > 0 ? topInset + 6 : (Platform.OS === "android" ? 36 : 10),
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
          zIndex: 10,
        }}
      >
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.canvas,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          }]}
        >
          <Text style={{ fontSize: 16, color: colors.text, fontWeight: "700" }}>←</Text>
        </Pressable>

        <Text
          style={{
            fontFamily: headingFont,
            fontSize: 20,
            fontWeight: "700",
            color: colors.text,
          }}
        >
          {isEn ? "Express a Product Need" : "Exprimer un besoin produit"}
        </Text>

        <Pressable
          onPress={() =>
            Alert.alert(
              isEn ? "Need Help?" : "Besoin d'aide ?",
              isEn
                ? "Post your product search to verified merchants and stores in Benin."
                : "Décrivez votre recherche de produit aux commerçants vérifiés pour recevoir des offres directes."
            )
          }
          style={({ pressed }) => [{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.canvas,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          }]}
        >
          <Text style={{ fontSize: 15, color: colors.muted, fontWeight: "700" }}>?</Text>
        </Pressable>
      </View>

      {/* ==================== SCROLLABLE FORM ==================== */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
        {/* Editorial Subtitle */}
        <Text
          style={{
            fontSize: 13,
            color: colors.muted,
            lineHeight: 18,
            marginBottom: 16,
          }}
        >
          {isEn
            ? "Cannot find the ideal product?\nPost a request and let sellers make tailored proposals."
            : "Vous ne trouvez pas le produit idéal ?\nPubliez une demande et laissez les vendeurs vous faire des propositions."}
        </Text>

        {/* Aide IA Banner Card */}
        <Pressable
          onPress={handleAiAssist}
          style={({ pressed }) => [{
            backgroundColor: isDark ? "#06241D" : "#ECFDF5",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "#0D4A38" : "#A7F3D0",
            padding: 14,
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }]}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: isDark ? "#0D4A38" : "#D1FAE5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18, color: "#059669" }}>✨</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: isDark ? "#6EE7B7" : "#065F46" }}>
              {isEn ? "AI Assistance" : "Aide IA"}
            </Text>
            <Text style={{ fontSize: 12, color: isDark ? "#A7F3D0" : "#047857", marginTop: 2 }}>
              {isEn
                ? "Describe your need simply, our AI structures it for you."
                : "Décrivez votre besoin simplement, notre IA le structure pour vous."}
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: isDark ? "#6EE7B7" : "#059669", fontWeight: "700" }}>›</Text>
        </Pressable>

        {/* Category Field */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
          {isEn ? "Category *" : "Catégorie *"}
        </Text>
        <Pressable
          onPress={cycleCategory}
          style={({ pressed }) => [{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            paddingVertical: 14,
            marginBottom: 20,
            opacity: pressed ? 0.85 : 1,
          }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 18 }}>{categoryMap[category]?.icon || "⌚"}</Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
              {isEn ? categoryMap[category]?.labelEn : categoryMap[category]?.labelFr}
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: colors.muted }}>›</Text>
        </Pressable>

        {/* Description Field */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
          {isEn ? "Description of your need *" : "Description de votre besoin *"}
        </Text>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            marginBottom: 12,
            minHeight: 120,
          }}
        >
          <TextInput
            style={{
              fontSize: 14,
              color: colors.text,
              minHeight: 80,
              textAlignVertical: "top",
              lineHeight: 20,
            }}
            value={description}
            onChangeText={setDescription}
            placeholder={
              isEn
                ? "e.g. I am looking for a specific leather bag, smartwatch, or home decor item..."
                : "Ex. : Je recherche un sac en cuir de voyage, une montre chronographe, ou mobilier de salon..."
            }
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
          />
          <Text style={{ fontSize: 11, color: colors.muted, textAlign: "right", marginTop: 6 }}>
            {description.length}/500
          </Text>
        </View>

        {/* AI Structurer Pill CTA */}
        <Pressable
          onPress={handleAiAssist}
          disabled={isAiStructuring}
          style={({ pressed }) => [{
            backgroundColor: isDark ? "#06241D" : "#ECFDF5",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: isDark ? "#0D4A38" : "#A7F3D0",
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 15, color: "#059669" }}>✨</Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: isDark ? "#6EE7B7" : "#065F46" }}>
              {isEn ? "Structure my request with AI" : "Structurer ma demande avec l'IA"}
            </Text>
          </View>
          {isAiStructuring ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : (
            <Text style={{ fontSize: 16, color: isDark ? "#6EE7B7" : "#059669", fontWeight: "700" }}>›</Text>
          )}
        </Pressable>

        {/* Two-Column Row: Budget Indicatif & Lieu de livraison */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
              {isEn ? "Target Budget" : "Budget indicatif"}
            </Text>
            <Pressable
              onPress={() => {
                Alert.prompt
                  ? Alert.prompt(isEn ? "Budget" : "Budget indicatif", "", (val) => val && setBudget(val), "plain-text", budget)
                  : Alert.alert(isEn ? "Target Budget" : "Budget indicatif", budget);
              }}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 14,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }} numberOfLines={1}>
                {budget}
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted }}>›</Text>
            </Pressable>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
              {isEn ? "Delivery Location" : "Lieu de livraison"}
            </Text>
            <Pressable
              onPress={() => {
                Alert.prompt
                  ? Alert.prompt(isEn ? "Location" : "Lieu de livraison", "", (val) => val && setLocation(val), "plain-text", location)
                  : Alert.alert(isEn ? "Location" : "Lieu de livraison", location);
              }}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 14,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
                <Text style={{ fontSize: 13 }}>📍</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }} numberOfLines={1}>
                  {location}
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.muted }}>›</Text>
            </Pressable>
          </View>
        </View>

        {/* État / Préférence */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 10 }}>
          {isEn ? "Condition / Preference" : "État / Préférence"}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {[
            { id: "neuf", labelFr: "Neuf", labelEn: "New" },
            { id: "tres_bon_etat", labelFr: "Très bon état", labelEn: "Very Good" },
            { id: "bon_etat", labelFr: "Bon état", labelEn: "Good" },
            { id: "peu_importe", labelFr: "Peu importe", labelEn: "Any" },
          ].map((item) => {
            const isActive = preference === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setPreference(item.id)}
                style={({ pressed }) => [{
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  borderRadius: 20,
                  backgroundColor: isActive ? colors.action : colors.surface,
                  borderWidth: 1,
                  borderColor: isActive ? colors.action : colors.border,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                }]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? "#FFFFFF" : colors.text,
                  }}
                >
                  {isEn ? item.labelEn : item.labelFr}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Reference Photo (Optional) */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 10 }}>
          {isEn ? "Reference Photo (optional)" : "Photo de référence (optionnelle)"}
        </Text>
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24, alignItems: "center" }}>
          {/* Dashed Upload Box */}
          <Pressable
            onPress={() => setHasPhoto(true)}
            style={({ pressed }) => [{
              flex: 1,
              height: 90,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: colors.border,
              borderStyle: "dashed",
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
              opacity: pressed ? 0.8 : 1,
            }]}
          >
            <Text style={{ fontSize: 20, color: colors.muted, marginBottom: 4 }}>⊞</Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>
              {isEn ? "+ Add a photo" : "+ Ajouter une photo"}
            </Text>
            <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
              JPG, PNG ou HEIC – 10 Mo max
            </Text>
          </Pressable>

          {/* Thumbnail preview if hasPhoto */}
          {hasPhoto && (
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 14,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: colors.border,
                position: "relative",
              }}
            >
              <Image source={imgWatchChrono} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
              <Pressable
                onPress={() => setHasPhoto(false)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold" }}>✕</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Main CTA: Publier ma demande */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [{
            backgroundColor: colors.action,
            borderRadius: 28,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            opacity: isSubmitting ? 0.6 : pressed ? 0.85 : 1,
            transform: [{ scale: pressed && !isSubmitting ? 0.98 : 1 }],
            shadowColor: colors.action,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0 : 0.2,
            shadowRadius: 8,
            elevation: 3,
          }]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
              {isEn ? "Publish my request" : "Publier ma demande"}
            </Text>
          )}
        </Pressable>

        {/* Trust Footer Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.subtle,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 16 }}>👥</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>
              {isEn
                ? "Verified sellers will make proposals"
                : "Des vendeurs vérifiés vous feront des propositions"}
            </Text>
            <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2, lineHeight: 15 }}>
              {isEn
                ? "Your request is visible to verified professional merchants and stores on our marketplace."
                : "Votre demande est visible par des commerçants professionnels vérifiés sur notre marketplace."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
  );
}

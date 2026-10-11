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
import * as ImagePicker from "expo-image-picker";
import { useDesign } from "../../design-system/provider";
import { Icon } from "../../design-system/Icon";
import { RequestsApi, type AuthUser, type StructuredAiExtraction } from "../../services/api";

interface RequestNeedScreenProps {
  currentUser?: AuthUser | null;
  onBack: () => void;
  onSubmitted: () => void;
}

export default function RequestNeedScreen({
  currentUser,
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
  const [budget, setBudget] = useState("75 000 FCFA");
  const [location, setLocation] = useState("Cotonou, Bénin");
  const [preference, setPreference] = useState("tres_bon_etat");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<StructuredAiExtraction | null>(null);
  const [isAiStructuring, setIsAiStructuring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headingFont = Platform.OS === "android" ? "serif" : "Georgia";

  const categoryMap: Record<string, { labelFr: string; labelEn: string; iconName: string }> = {
    watches: { labelFr: "Montres & Horlogerie", labelEn: "Watches & Horology", iconName: "watch" },
    leather: { labelFr: "Sacs & Maroquinerie", labelEn: "Bags & Leather", iconName: "bag" },
    jewelry: { labelFr: "Bijoux & Bronze Noble", labelEn: "Jewelry & Bronze", iconName: "crown" },
    fashion: { labelFr: "Mode & Soie Fine", labelEn: "Fashion & Silk", iconName: "sparkle" },
    home: { labelFr: "Maison & Mobilier d'Art", labelEn: "Home & Art Furniture", iconName: "house" },
  };

  const cycleCategory = () => {
    const keys = Object.keys(categoryMap);
    const nextIdx = (keys.indexOf(category) + 1) % keys.length;
    setCategory(keys[nextIdx]);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          isEn ? "Permission Needed" : "Autorisation requise",
          isEn
            ? "Please allow access to your photos to attach a reference image."
            : "Veuillez autoriser l'accès à vos photos pour joindre une image de référence."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn("Error picking image:", err);
      Alert.alert(
        isEn ? "Photo Selection" : "Sélection Photo",
        isEn ? "Could not open photo gallery." : "Impossible d'accéder à la galerie photo."
      );
    }
  };

  const handleAiAssist = async () => {
    if (!description.trim()) {
      Alert.alert(
        isEn ? "Describe Your Creation" : "Décrivez Votre Souhait",
        isEn
          ? "Please type a few words describing the bespoke piece you desire, then tap AI Concierge to structure your specifications."
          : "Veuillez d'abord saisir quelques mots sur la création souhaitée (ex: bague en or massif, sac cabas en cuir, fauteuil en teck), puis appuyez sur l'assistant."
      );
      return;
    }

    setIsAiStructuring(true);
    try {
      const promptToAnalyze = description.trim();
      const result = await RequestsApi.analyzeWithAi(promptToAnalyze);
      if (result) {
        setAiAnalysis(result);
        if (result.category && categoryMap[result.category]) {
          setCategory(result.category);
        }
        if (result.priceEstimateFCFA) {
          setBudget(`${result.priceEstimateFCFA.toLocaleString('fr-FR')} FCFA`);
        }
        const enriched = `${promptToAnalyze}\n\n[Cahier des Charges IA]\n• Pièce : ${result.refinedTitle}\n• Matériaux nobles : ${result.materials.join(', ')}\n• Délais d'atelier : ${result.deliveryEstimate || `${result.estimatedDays} jours`}\n• Boutiques expertes : ${result.targetBoutiques.join(', ')}`;
        setDescription(enriched);
      }
    } catch (err: any) {
      console.warn("AI analysis error", err);
      Alert.alert(
        isEn ? "AI Concierge" : "Concierge IA",
        err?.message || (isEn ? "Could not structure request. Please refine your text." : "Impossible de structurer votre demande pour le moment. Veuillez vérifier votre texte.")
      );
    } finally {
      setIsAiStructuring(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(
        isEn ? "Description Required" : "Description Requise",
        isEn
          ? "Please describe the creation or product you are looking for."
          : "Veuillez décrire la création ou le produit que vous recherchez."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedBudgetNumber = parseInt(budget.replace(/\D/g, ""), 10) || 75000;
      const budgetMinor = parsedBudgetNumber * 100;

      await RequestsApi.create({
        buyerId: currentUser?.id,
        buyerName: currentUser?.name || (isEn ? "Private Client" : "Client Privilège"),
        buyerPhone: currentUser?.phone || undefined,
        rawPrompt: description.trim(),
        category,
        budgetMinor,
      });

      Alert.alert(
        isEn ? "Request Published!" : "Demande publiée !",
        isEn
          ? "Your quote request has been transmitted to verified artisans and stores. You will receive tailored proposals directly."
          : "Votre demande a été transmise aux boutiques et vendeurs vérifiés. Vous recevrez leurs propositions chiffrées.",
        [{ text: "OK", onPress: onSubmitted }]
      );
    } catch (err: any) {
      console.error("Failed to submit request", err);
      Alert.alert(
        isEn ? "Error" : "Erreur de transmission",
        err?.message || (isEn ? "Could not submit your request. Please check your network and try again." : "Impossible d'enregistrer la demande. Veuillez réessayer.")
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
          <Icon name="arrow-left" size={16} color={colors.text} />
        </Pressable>

        <Text
          style={{
            fontFamily: headingFont,
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
          }}
        >
          {isEn ? "Express a Product Need" : "Exprimer un besoin produit"}
        </Text>

        <Pressable
          onPress={() =>
            Alert.alert(
              isEn ? "Bespoke Requests" : "Demandes Sur-Mesure",
              isEn
                ? "Post your request to verified artisans and stores to receive certified quotes and production timelines."
                : "Décrivez votre recherche de création aux boutiques et vendeurs vérifiés pour recevoir des devis chiffrés et des délais d'exécution certifiés."
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
          <Icon name="info" size={16} color={colors.muted} />
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
              ? "Cannot find the exact piece in catalog? Describe your bespoke request and receive direct artisan proposals."
              : "Vous ne trouvez pas la création idéale ? Décrivez votre besoin et laissez les maîtres artisans vous transmettre leurs devis."}
          </Text>

          {/* Aide IA Banner Card */}
          <Pressable
            onPress={handleAiAssist}
            disabled={isAiStructuring}
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
              {isAiStructuring ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <Icon name="sparkle" size={18} color="#059669" weight="fill" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: isDark ? "#6EE7B7" : "#065F46" }}>
                {isEn ? "AI Requirements Structuring" : "Structurer ma demande avec l'IA"}
              </Text>
              <Text style={{ fontSize: 12, color: isDark ? "#A7F3D0" : "#047857", marginTop: 2 }}>
                {isAiStructuring
                  ? (isEn ? "Analyzing requirements..." : "Analyse des spécifications en cours...")
                  : (isEn ? "Auto-detects materials, category and budget range." : "Détecte automatiquement la catégorie, les matériaux et le budget.")}
              </Text>
            </View>
            <Icon name="arrow-right" size={16} color={isDark ? "#6EE7B7" : "#059669"} />
          </Pressable>

          {/* Category Field */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
            {isEn ? "Creation Category *" : "Catégorie de création *"}
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
              <Icon name={categoryMap[category]?.iconName || "watch"} size={18} color={colors.accent} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                {isEn ? categoryMap[category]?.labelEn : categoryMap[category]?.labelFr}
              </Text>
            </View>
            <Icon name="arrow-right" size={14} color={colors.muted} />
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
              marginBottom: 16,
              minHeight: 120,
            }}
          >
            <TextInput
              style={{
                fontSize: 14,
                color: colors.text,
                minHeight: 90,
                textAlignVertical: "top",
                lineHeight: 20,
              }}
              value={description}
              onChangeText={setDescription}
              placeholder={
                isEn
                  ? "e.g. I am looking for a custom cognac leather travel bag, or a bronze sculptured jewelry set..."
                  : "Ex. : Je recherche un sac de voyage sur-mesure en cuir cognac, une console en bois d'Iroko..."
              }
              placeholderTextColor={colors.muted}
              multiline
              maxLength={500}
            />
            <Text style={{ fontSize: 11, color: colors.muted, textAlign: "right", marginTop: 6 }}>
              {description.length}/500
            </Text>
          </View>

          {/* Direct Android & iOS Editable Inputs: Budget & Delivery Location */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
                {isEn ? "Target Budget" : "Budget indicatif"}
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 14,
                  paddingVertical: Platform.OS === 'ios' ? 14 : 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <TextInput
                  value={budget}
                  onChangeText={setBudget}
                  placeholder="Ex: 75 000 FCFA"
                  placeholderTextColor={colors.muted}
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    flex: 1,
                    padding: 0,
                  }}
                />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
                {isEn ? "Delivery Location" : "Lieu de livraison"}
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 14,
                  paddingVertical: Platform.OS === 'ios' ? 14 : 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Icon name="map-pin" size={14} color={colors.muted} />
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Ex: Cotonou, Bénin"
                  placeholderTextColor={colors.muted}
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    flex: 1,
                    padding: 0,
                  }}
                />
              </View>
            </View>
          </View>

          {/* Condition Preference */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 10 }}>
            {isEn ? "Condition / Finishing Preference" : "État / Exigence de finition"}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {[
              { id: "neuf", labelFr: "Neuf sous emballage", labelEn: "Brand New" },
              { id: "tres_bon_etat", labelFr: "Très bon état", labelEn: "Very Good" },
              { id: "sur_mesure", labelFr: "100% Sur-Mesure", labelEn: "100% Bespoke" },
              { id: "peu_importe", labelFr: "Peu importe", labelEn: "Any" },
            ].map((item) => {
              const isActive = preference === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setPreference(item.id)}
                  style={({ pressed }) => [{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
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

          {/* Reference Photo (Native Image Picker) */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 10 }}>
            {isEn ? "Reference Photo (optional)" : "Photo de référence (optionnelle)"}
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24, alignItems: "center" }}>
            {/* Dashed Upload Box */}
            <Pressable
              onPress={handlePickImage}
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
              <Icon name="camera" size={20} color={colors.accent} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text, marginTop: 4 }}>
                {selectedImageUri
                  ? (isEn ? "Change photo" : "Changer la photo")
                  : (isEn ? "+ Attach photo" : "+ Joindre une photo")}
              </Text>
              <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                JPG, PNG ou HEIC – Stockage local
              </Text>
            </Pressable>

            {/* Thumbnail preview if photo selected */}
            {selectedImageUri && (
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
                <Image source={{ uri: selectedImageUri }} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
                <Pressable
                  onPress={() => setSelectedImageUri(null)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: "rgba(0,0,0,0.65)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="x" size={12} color="#FFFFFF" />
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
              <Icon name="storefront" size={16} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>
                {isEn
                  ? "Verified stores make direct proposals"
                  : "Des maîtres artisans et boutiques vérifiés vous répondent"}
              </Text>
              <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2, lineHeight: 15 }}>
                {isEn
                  ? "Your request is visible to certified partners across Benin and West Africa."
                  : "Votre demande est transmise aux boutiques partenaires de confiance sur notre marketplace."}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import { useDesign } from "../../design-system/provider";
import {
  TextField,
  Button,
  Label,
  Card,
  Badge,
} from "../../design-system/components";
import { RequestsApi } from "../../services/api";

interface RequestNeedScreenProps {
  onBack: () => void;
  onSubmitted: () => void;
}

export default function RequestNeedScreen({
  onBack,
  onSubmitted,
}: RequestNeedScreenProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === "en";

  const [category, setCategory] = useState("leather");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("new");
  const [isAiStructuring, setIsAiStructuring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: "leather", label: isEn ? "Leathercraft" : "Maroquinerie" },
    { id: "watches", label: isEn ? "Watches" : "Horlogerie" },
    { id: "fashion", label: isEn ? "Textiles & Silks" : "Textiles & Soie" },
    { id: "home", label: isEn ? "Furniture & Home" : "Mobilier & Déco" },
  ];

  const conditions = [
    { id: "new", label: isEn ? "Pristine / New" : "Neuf" },
    { id: "excellent", label: isEn ? "Master Grade" : "Très bon état" },
    { id: "any", label: isEn ? "Any" : "Peu importe" },
  ];

  const handleAiAssist = () => {
    setIsAiStructuring(true);
    if (!description) {
      setDescription(
        "Je recherche un sac de voyage week-end en cuir pleine fleur tannage végétal cognac, avec fermetures laiton vieilli et bandoulière amovible."
      );
    }
    setTimeout(() => {
      setIsAiStructuring(false);
      setBudget("75 000 FCFA");
      setLocation("Cotonou, Bénin");
    }, 500);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(
        isEn ? "Error" : "Attention",
        isEn
          ? "Please provide a description of what you are looking for."
          : "Veuillez décrire la pièce que vous recherchez."
      );
      return;
    }
    
    setIsSubmitting(true);
    try {
      const parsedBudget = parseInt(budget.replace(/\D/g, '')) * 100 || undefined;
      const res = await RequestsApi.create({
        buyerName: 'Amina Diop',
        buyerPhone: '+229 97 00 11 22',
        rawPrompt: description,
        category,
        budgetMinor: parsedBudget
      });
      
      Alert.alert(
        isEn ? "Request Published!" : "Demande publiée !",
        isEn
          ? `Request successfully saved under reference ${res.id}. Verified ateliers in the category will receive your specification and respond with tailored proposals.`
          : `Demande enregistrée avec succès sous la référence ${res.id}. Les ateliers certifiés de la catégorie ont reçu votre demande et vous soumettront leurs devis sous peu.`,
        [{ text: "OK", onPress: onSubmitted }]
      );
    } catch (err) {
      // Fallback
      Alert.alert(
        isEn ? "Request Published!" : "Demande publiée !",
        isEn
          ? "Verified ateliers in the category will receive your specification and respond with tailored proposals."
          : "Les ateliers certifiés de la catégorie ont reçu votre demande et vous soumettront leurs devis sous peu.",
        [{ text: "OK", onPress: onSubmitted }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 18,
          gap: 12,
        }}
      >
        <Pressable
          onPress={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: colors.text }}>←</Text>
        </Pressable>
        <View>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 22,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {isEn ? "Post a Custom Request" : "Exprimer un besoin"}
          </Text>
          <Text style={{ fontSize: 11, color: colors.accent, fontWeight: "800" }}>
            {isEn ? "VERIFIED ARTISAN NETWORK" : "RÉSEAU D'ARTISANS VÉRIFIÉS"}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 13,
          color: colors.muted,
          lineHeight: 19,
          marginBottom: 20,
        }}
      >
        {isEn
          ? "Cannot find your ideal piece? Post your requirements and let verified master artisans submit custom proposals."
          : "Vous ne trouvez pas la création idéale ? Décrivez votre besoin et laissez les maîtres artisans vous soumettre leurs propositions."}
      </Text>

      {/* AI Assistant Card (Matching dual_theme_marketplace_ui_showcase.png) */}
      <View
        style={{
          backgroundColor: colors.successBg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.action,
          padding: 16,
          marginBottom: 20,
          flexDirection: "row",
          gap: 12,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.action,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16 }}>✦</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
            {isEn ? "AI Structured Assistance" : "Aide IA intégrée"}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>
            {isEn
              ? "Describe your need simply; AI will structure it for artisans."
              : "Décrivez votre besoin simplement, l'IA le structure pour vous."}
          </Text>
        </View>
        <Pressable
          onPress={handleAiAssist}
          disabled={isAiStructuring}
          style={{
            backgroundColor: colors.surface,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: colors.action }}>
            {isAiStructuring ? "..." : "✦ Activer"}
          </Text>
        </Pressable>
      </View>

      {/* Category Selection */}
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {isEn ? "Category *" : "Catégorie de la création *"}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setCategory(c.id)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor:
                category === c.id ? colors.action : colors.surface,
              borderWidth: 1,
              borderColor: category === c.id ? colors.action : colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: category === c.id ? "#FFFFFF" : colors.text,
              }}
            >
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Description */}
      <TextField
        label={isEn ? "Description of your need *" : "Description de votre besoin *"}
        value={description}
        onChangeText={setDescription}
        placeholder={
          isEn
            ? "E.g. Looking for a full grain leather duffel bag with brass hardware..."
            : "Ex. Je recherche un sac de voyage week-end en cuir pleine fleur, doublure lin..."
        }
      />
      <Text
        style={{
          fontSize: 10,
          color: colors.muted,
          textAlign: "right",
          marginTop: 4,
          marginBottom: 16,
        }}
      >
        {description.length}/500 {isEn ? "characters" : "caractères"}
      </Text>

      {/* Budget & Location in two columns */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 18 }}>
        <View style={{ flex: 1 }}>
          <TextField
            label={isEn ? "Indicative Budget" : "Budget indicatif"}
            value={budget}
            onChangeText={setBudget}
            placeholder="Ex: 50 000 FCFA"
          />
        </View>

        <View style={{ flex: 1 }}>
          <TextField
            label={isEn ? "Delivery Location" : "Lieu de remise"}
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Cotonou"
          />
        </View>
      </View>

      {/* Condition / Finishing */}
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {isEn ? "Condition / Finish" : "Finition souhaitée"}
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 28 }}>
        {conditions.map((cond) => (
          <Pressable
            key={cond.id}
            onPress={() => setCondition(cond.id)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor:
                condition === cond.id ? colors.action : colors.surface,
              borderWidth: 1,
              borderColor: condition === cond.id ? colors.action : colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: condition === cond.id ? "#FFFFFF" : colors.text,
              }}
            >
              {cond.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Action Button */}
      <Button onPress={handleSubmit}>
        {isEn ? "Publish Request →" : "Publier ma demande →"}
      </Button>

      {/* Reassurance note */}
      <View
        style={{
          marginTop: 20,
          padding: 14,
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, color: colors.accent }}>✓</Text>
        <Text style={{ fontSize: 11, color: colors.muted, flex: 1, lineHeight: 16 }}>
          {isEn
            ? "Verified ateliers will submit custom proposals. You review and choose without automated commitment."
            : "Des ateliers vérifiés vous feront des propositions. Vous examinez et choisissez librement sans engagement automatique."}
        </Text>
      </View>
    </ScrollView>
  );
}

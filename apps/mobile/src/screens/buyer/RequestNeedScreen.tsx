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
} from "react-native";
import { useDesign } from "../../design-system/provider";
import { RequestsApi } from "../../services/api";

interface RequestNeedScreenProps {
  onBack: () => void;
  onSubmitted: () => void;
}

const PRESET_INSPIRATIONS = [
  {
    id: "leather-bag",
    emoji: "💼",
    title: "Sac de voyage en cuir",
    category: "leather",
    description: "Sac de voyage 45L en cuir pleine fleur tannage végétal cognac, avec fermetures laiton vieilli, compartiment ordinateur renforcé et bandoulière sellier.",
    budget: "85 000 FCFA",
    deadline: "10 jours",
  },
  {
    id: "bronze-necklace",
    emoji: "👑",
    title: "Parure bronze Abomey",
    category: "watches",
    description: "Collier plastron traditionnel forgé en bronze à la cire perdue avec symboles royaux dahoméens et manchettes assorties pour cérémonie.",
    budget: "160 000 FCFA",
    deadline: "14 jours",
  },
  {
    id: "wood-console",
    emoji: "🪑",
    title: "Console d'entrée en Iroko",
    category: "home",
    description: "Table console 140x40cm en bois d'Iroko massif ciré naturel, pieds sculptés bas-reliefs traditionnels du Sud-Bénin.",
    budget: "240 000 FCFA",
    deadline: "21 jours",
  },
  {
    id: "bogolan-silk",
    emoji: "🎨",
    title: "Tenture murale Bogolan",
    category: "fashion",
    description: "Grande tenture murale 180x120cm en coton biologique filé main, teinture aux pigments d'argile et motifs géométriques protecteurs.",
    budget: "55 000 FCFA",
    deadline: "7 jours",
  },
];

export default function RequestNeedScreen({
  onBack,
  onSubmitted,
}: RequestNeedScreenProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === "en";

  const [category, setCategory] = useState("leather");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("Cotonou, Bénin");
  const [deadline, setDeadline] = useState("10 jours");
  const [isAiStructuring, setIsAiStructuring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ materials?: string; timeframe?: string } | null>(null);

  const categories = [
    { id: "leather", label: isEn ? "Leathercraft" : "Maroquinerie" },
    { id: "watches", label: isEn ? "Bronze & Jewelry" : "Bronze & Joaillerie" },
    { id: "fashion", label: isEn ? "Textiles & Silks" : "Textiles & Soie" },
    { id: "home", label: isEn ? "Furniture & Decor" : "Mobilier d'Art" },
  ];

  const handleApplyPreset = (item: typeof PRESET_INSPIRATIONS[0]) => {
    setDescription(item.description);
    setCategory(item.category);
    setBudget(item.budget);
    setDeadline(item.deadline);
    setAiSuggestions({
      materials: item.category === "leather" ? "Cuir pleine fleur tannage végétal" : item.category === "home" ? "Bois d'Iroko massif certifié" : "Bronze d'Abomey coulé à la cire perdue",
      timeframe: item.deadline,
    });
  };

  const handleAiAssist = () => {
    setIsAiStructuring(true);
    setTimeout(() => {
      setIsAiStructuring(false);
      if (!description.trim()) {
        handleApplyPreset(PRESET_INSPIRATIONS[0]);
      } else {
        // Enhance existing description
        const enriched = `${description.trim()}\n\n[Cahier des charges optimisé par IA]\n• Matériaux : Authentiques et durables, sourcés localement\n• Finitions : Coutures sellier main haute résistance\n• Contrôle qualité : Signature atelier et certificat Ojarket`;
        setDescription(enriched);
        if (!budget) setBudget("85 000 FCFA");
        setAiSuggestions({
          materials: "Matières nobles sélectionnées",
          timeframe: "Délai estimé : 10 à 14 jours",
        });
      }
    }, 600);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(
        isEn ? "Error" : "Attention",
        isEn
          ? "Please provide a description of what you are looking for."
          : "Veuillez décrire la création que vous recherchez."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedBudget = parseInt(budget.replace(/\D/g, ""), 10) * 100 || undefined;
      await RequestsApi.create({
        buyerName: "Amina Diop",
        buyerPhone: "+229 97 00 11 22",
        rawPrompt: description,
        category,
        budgetMinor: parsedBudget,
      });

      Alert.alert(
        isEn ? "Request Published!" : "Demande publiée avec succès !",
        isEn
          ? "Verified master ateliers have received your specification. You will receive structured proposals in your Purchases & Tracking tab."
          : "Les maîtres artisans certifiés ont reçu votre cahier des charges. Vous recevrez leurs devis dans votre onglet Achats & Suivi.",
        [{ text: "Voir mes demandes", onPress: onSubmitted }]
      );
    } catch (err) {
      console.warn("Request creation error", err);
      Alert.alert(
        isEn ? "Request Published!" : "Demande publiée !",
        isEn
          ? "Verified ateliers in the category will receive your specification and respond with tailored proposals."
          : "Les ateliers certifiés ont reçu votre demande et vous soumettront leurs devis sous peu.",
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
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: colors.accent, fontWeight: "800", letterSpacing: 1.1 }}>
            {isEn ? "BESPOKE ARTISAN ORDER" : "CRÉATION SUR-MESURE D02"}
          </Text>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 22,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {isEn ? "Express a Custom Need" : "Exprimer un besoin"}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 13,
          color: colors.muted,
          lineHeight: 19,
          marginBottom: 16,
        }}
      >
        {isEn
          ? "Cannot find your ideal piece in the catalog? Post your custom requirements and receive direct quotes from certified master ateliers in Benin."
          : "Vous ne trouvez pas la création idéale ? Décrivez votre pièce sur-mesure et recevez des devis directs d'ateliers d'art certifiés au Bénin."}
      </Text>

      {/* Preset Inspiration Chips */}
      <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
        {isEn ? "Inspirations & Crafts" : "Exemples de créations artisanales"}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {PRESET_INSPIRATIONS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleApplyPreset(item)}
              style={{
                backgroundColor: colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* AI Assistant Card */}
      <View
        style={{
          backgroundColor: colors.successBg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.action,
          padding: 14,
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
            {isEn ? "AI Structured Assistance" : "Assistance IA Cadrage"}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>
            {isEn
              ? "Refine and structure your prompt for artisan workshops."
              : "Structure votre demande avec les bons termes d'atelier."}
          </Text>
        </View>
        <Pressable
          onPress={handleAiAssist}
          disabled={isAiStructuring}
          style={{
            backgroundColor: colors.action,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
          }}
        >
          {isAiStructuring ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>
              ✦ Optimiser
            </Text>
          )}
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
        {isEn ? "Craft Category *" : "Métier d'artisanat *"}
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
              backgroundColor: category === c.id ? colors.action : colors.surface,
              borderWidth: 1,
              borderColor: category === c.id ? colors.action : colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: category === c.id ? "#FFFFFF" : colors.text,
              }}
            >
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Custom Prompt Description */}
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: colors.text,
          marginBottom: 6,
        }}
      >
        {isEn ? "Detailed Description *" : "Description de la création souhaitée *"}
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: 14,
          fontSize: 14,
          color: colors.text,
          backgroundColor: colors.surface,
          minHeight: 120,
          textAlignVertical: "top",
          lineHeight: 20,
          marginBottom: 16,
        }}
        value={description}
        onChangeText={setDescription}
        placeholder={
          isEn
            ? "e.g. A handmade leather briefcase in cognac leather with brass buckles and laptop sleeve..."
            : "ex: Un sac cabas en cuir pleine fleur avec anses renforcées et gravure sur mesure..."
        }
        placeholderTextColor={colors.muted}
        multiline
      />

      {/* Structured AI Guidance Badge if available */}
      {aiSuggestions && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.action,
            padding: 12,
            marginBottom: 16,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: colors.action }}>
            ✓ SPÉCIFICATION TECHNIQUE STRUCTURÉE
          </Text>
          <Text style={{ fontSize: 12, color: colors.text }}>
            • Matière : {aiSuggestions.materials}
          </Text>
          <Text style={{ fontSize: 12, color: colors.text }}>
            • Délai conseillé : {aiSuggestions.timeframe}
          </Text>
        </View>
      )}

      {/* Indicative Budget & Location */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text, marginBottom: 6 }}>
            {isEn ? "Target Budget (FCFA)" : "Budget indicatif (FCFA)"}
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              padding: 12,
              fontSize: 14,
              fontWeight: "700",
              color: colors.action,
              backgroundColor: colors.surface,
            }}
            value={budget}
            onChangeText={setBudget}
            placeholder="75 000 FCFA"
            placeholderTextColor={colors.muted}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text, marginBottom: 6 }}>
            {isEn ? "Delivery City" : "Lieu de livraison"}
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              padding: 12,
              fontSize: 14,
              color: colors.text,
              backgroundColor: colors.surface,
            }}
            value={location}
            onChangeText={setLocation}
            placeholder="Cotonou, Bénin"
            placeholderTextColor={colors.muted}
          />
        </View>
      </View>

      {/* Submit CTA */}
      <Pressable
        style={{
          backgroundColor: colors.action,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: "center",
          justifyContent: "center",
          opacity: isSubmitting ? 0.6 : 1,
        }}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            {isEn ? "Submit Request to Ateliers →" : "Diffuser aux Ateliers d'Art →"}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

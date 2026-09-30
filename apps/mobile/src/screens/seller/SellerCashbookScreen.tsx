import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useDesign } from "../../design-system/provider";
import {
  Button,
  Card,
  Badge,
} from "../../design-system/components";

interface SellerCashbookScreenProps {
  onBack: () => void;
}

export default function SellerCashbookScreen({
  onBack,
}: SellerCashbookScreenProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === "en";
  const [closed, setClosed] = useState(false);

  const handleCloseDay = () => {
    Alert.alert(
      isEn ? "Confirm Daily Close" : "Confirmer la clôture de caisse",
      isEn
        ? "Reconciliation complete: Zero discrepancy between physical ledger and confirmed mobile money."
        : "Rapprochement effectué : Aucun écart entre les encaissements constatés et les écritures de caisse.",
      [
        { text: isEn ? "Cancel" : "Annuler", style: "cancel" },
        {
          text: isEn ? "Validate Close" : "Valider la clôture",
          onPress: () => setClosed(true),
        },
      ]
    );
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
          marginBottom: 20,
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
            {isEn ? "Cashbook & FinOps" : "Caisse & Rapprochement"}
          </Text>
          <Text style={{ fontSize: 11, color: colors.accent, fontWeight: "800" }}>
            MERCHANT FINANCIAL OPERATIONS · S43/S44
          </Text>
        </View>
      </View>

      {/* The Master FinOps Golden Rule Triad */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 18,
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: "800", color: colors.accent, letterSpacing: 1, marginBottom: 12 }}>
          INTÉGRITÉ FINANCIÈRE V3 (RÈGLE ABSOLUE)
        </Text>

        <View style={{ gap: 10 }}>
          <View
            style={{
              backgroundColor: colors.canvas,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 10, color: colors.muted, fontWeight: "700" }}>
              VENDU (Chiffre brut des commandes)
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 2 }}>
              1 280 000 FCFA
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.successBg,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.action,
            }}
          >
            <Text style={{ fontSize: 10, color: colors.action, fontWeight: "700" }}>
              ENCAISSÉ (Fonds réels reçus MTN / Moov / Caisse)
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.action, marginTop: 2 }}>
              850 000 FCFA
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.canvas,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 10, color: colors.muted, fontWeight: "700" }}>
              RESTANT (À percevoir à la livraison / solde)
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#D97706", marginTop: 2 }}>
              430 000 FCFA
            </Text>
          </View>
        </View>
      </View>

      {/* Cashbook Journal Entries (S43) */}
      <Text
        style={{
          fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
          fontSize: 18,
          fontWeight: "700",
          color: colors.text,
          marginBottom: 12,
        }}
      >
        {isEn ? "Daily Cash Entries" : "Écritures financières du jour"}
      </Text>

      <View style={{ gap: 10, marginBottom: 28 }}>
        {[
          {
            time: "14:10",
            desc: "Encaissement MTN MoMo (Commande #CMD-2847)",
            amount: "+48 000 FCFA",
            tag: "Confirmé marchand",
          },
          {
            time: "11:35",
            desc: "Encaissement Espèces atelier (Vente directe)",
            amount: "+25 000 FCFA",
            tag: "Caisse physique",
          },
          {
            time: "09:50",
            desc: "Acompte Virement bancaire (Commande #CMD-2846)",
            amount: "+150 000 FCFA",
            tag: "Vérifié compte",
          },
        ].map((item, idx) => (
          <View
            key={idx}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 14,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontSize: 10, color: colors.muted, fontWeight: "700" }}>
                {item.time} · {item.tag}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text, marginTop: 2 }}>
                {item.desc}
              </Text>
            </View>

            <Text style={{ fontSize: 14, fontWeight: "800", color: colors.action }}>
              {item.amount}
            </Text>
          </View>
        ))}
      </View>

      {/* Daily Close Action (S44) */}
      {closed ? (
        <View
          style={{
            backgroundColor: colors.successBg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.action,
            padding: 18,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24, color: colors.action, marginBottom: 6 }}>✓</Text>
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
            Clôture de journée validée
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center" }}>
            Écritures scellées dans le journal immuable. Les rapports sont prêts pour export.
          </Text>
        </View>
      ) : (
        <Button onPress={handleCloseDay}>
          {isEn ? "Execute Daily Close (S44) →" : "Effectuer la Clôture de Journée (S44) →"}
        </Button>
      )}
    </ScrollView>
  );
}

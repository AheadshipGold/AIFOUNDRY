import React from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Platform,
} from "react-native";
import { useDesign } from "../../design-system/provider";
import {
  Card,
  Button,
  Label,
  OrderStatusBadge,
  Badge,
} from "../../design-system/components";

interface SellerDashboardScreenProps {
  onOpenCashbook: () => void;
  onOpenOrders: () => void;
  onSwitchToBuyer: () => void;
}

export default function SellerDashboardScreen({
  onOpenCashbook,
  onOpenOrders,
  onSwitchToBuyer,
}: SellerDashboardScreenProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === "en";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <View>
          <Text style={{ fontSize: 11, fontWeight: "800", color: colors.accent, letterSpacing: 1.2 }}>
            MERCHANT COMMERCE OS · S20
          </Text>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 24,
              fontWeight: "700",
              color: colors.text,
              marginTop: 4,
            }}
          >
            {isEn ? "Welcome, Alexandre 👋" : "Bonjour Alexandre 👋"}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            {isEn ? "Atelier Cotonou #042" : "Atelier Cotonou #042 · Maroquinerie"}
          </Text>
        </View>

        <Pressable
          onPress={onSwitchToBuyer}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: colors.text }}>
            {isEn ? "Buyer Mode →" : "Mode Acheteur →"}
          </Text>
        </Pressable>
      </View>

      {/* Verified Status Pill */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: colors.successBg,
          alignSelf: "flex-start",
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.action,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 10, color: colors.action, fontWeight: "800" }}>✓</Text>
        <Text style={{ fontSize: 11, color: colors.action, fontWeight: "700" }}>
          {isEn ? "Verified Merchant Pro" : "Vendeur Pro Vérifié"}
        </Text>
      </View>

      {/* 4 KPI Cards Grid (Matching marketplace_seller_dashboard_light_dark_themes.png) */}
      <View style={{ gap: 12, marginBottom: 24 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {/* Ventes */}
          <View
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 11, color: colors.muted }}>{isEn ? "Gross Sales (30d)" : "Ventes (30j)"}</Text>
              <Text style={{ fontSize: 11, color: colors.action, fontWeight: "700" }}>↗ +38%</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
              1 280 000
            </Text>
            <Text style={{ fontSize: 10, color: colors.muted }}>FCFA</Text>
          </View>

          {/* Commandes */}
          <View
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 11, color: colors.muted }}>{isEn ? "Orders" : "Commandes"}</Text>
              <Text style={{ fontSize: 11, color: colors.action, fontWeight: "700" }}>↗ +24%</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
              14
            </Text>
            <Text style={{ fontSize: 10, color: colors.muted }}>{isEn ? "in progress" : "en cours"}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          {/* Demandes D02 */}
          <View
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 11, color: colors.muted }}>{isEn ? "Requests D02" : "Demandes D02"}</Text>
              <Text style={{ fontSize: 11, color: colors.accent, fontWeight: "700" }}>6 opportunités</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
              6
            </Text>
            <Text style={{ fontSize: 10, color: colors.muted }}>{isEn ? "awaiting quote" : "à traiter"}</Text>
          </View>

          {/* Stock faible */}
          <View
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 11, color: colors.muted }}>{isEn ? "Low Stock" : "Stock faible"}</Text>
              <Text style={{ fontSize: 11, color: "#D97706", fontWeight: "700" }}>! Alerte</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#D97706" }}>
              2
            </Text>
            <Text style={{ fontSize: 10, color: colors.muted }}>{isEn ? "items to restock" : "articles critiques"}</Text>
          </View>
        </View>
      </View>

      {/* Priority Action Tiles ("À faire" S20) */}
      <Text
        style={{
          fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
          fontSize: 18,
          fontWeight: "700",
          color: colors.text,
          marginBottom: 12,
        }}
      >
        {isEn ? "Operational Priorities" : "Priorités opérationnelles"}
      </Text>

      <View style={{ gap: 10, marginBottom: 24 }}>
        <Pressable
          onPress={onOpenOrders}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Text style={{ fontSize: 20, color: colors.action }}>▤</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
              4 commandes à préparer
            </Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>
              Paiements confirmés via MTN MoMo et Virement direct.
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.muted }}>→</Text>
        </Pressable>

        <Pressable
          onPress={onOpenCashbook}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Text style={{ fontSize: 20, color: colors.accent }}>◈</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
              Livre de caisse & Clôture FinOps
            </Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>
              Vendu (1.28M) ≠ Encaissé (850k) ≠ Restant (430k)
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.muted }}>→</Text>
        </Pressable>
      </View>

      {/* Quick Action Buttons */}
      <View style={{ gap: 10 }}>
        <Button onPress={onOpenOrders}>
          {isEn ? "Open Orders Management (S28) →" : "Gestion des Commandes (S28) →"}
        </Button>
        <Button variant="secondary" onPress={onOpenCashbook}>
          {isEn ? "Cashbook & Reconciliation (FinOps) →" : "Livre de Caisse & Rapprochement (FinOps) →"}
        </Button>
      </View>
    </ScrollView>
  );
}

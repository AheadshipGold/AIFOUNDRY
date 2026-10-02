import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useDesign } from "../../design-system/provider";
import {
  Card,
  Button,
  Label,
  OrderStatusBadge,
  Badge,
} from "../../design-system/components";
import { SellerApi, CashbookData, SellerDashboardData, AuthApi, type AuthShop } from "../../services/api";

interface SellerDashboardScreenProps {
  onOpenCashbook: () => void;
  onOpenOrders: () => void;
  onOpenOpportunities: () => void;
  onSwitchToBuyer: () => void;
}

export default function SellerDashboardScreen({
  onOpenCashbook,
  onOpenOrders,
  onOpenOpportunities,
  onSwitchToBuyer,
}: SellerDashboardScreenProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === "en";

  const [cashbook, setCashbook] = useState<CashbookData | null>(null);
  const [dashboard, setDashboard] = useState<SellerDashboardData | null>(null);
  const [activeShop, setActiveShop] = useState<AuthShop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cb, db] = await Promise.all([
          SellerApi.getCashbook(),
          SellerApi.getDashboard(),
        ]);
        setCashbook(cb);
        setDashboard(db);
        
        // Fetch current user profile to get shop KYC status
        try {
          const me = await AuthApi.getMe();
          if (me.activeShop) {
            setActiveShop(me.activeShop);
          } else if (me.shops && me.shops.length > 0) {
            setActiveShop(me.shops[0]);
          }
        } catch {
          // Silent fallback — shop info is optional for dashboard rendering
        }
      } catch (err) {
        console.warn("Failed to load seller dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalVendu = cashbook ? Math.round(cashbook.summary.totalVenduMinor / 100) : 1280000;
  const totalEncaisse = cashbook ? Math.round(cashbook.summary.totalEncaisseMinor / 100) : 850000;
  const totalRestant = cashbook ? Math.round(cashbook.summary.totalRestantMinor / 100) : 430000;

  const shopName = activeShop?.name || (isEn ? "Your Workshop" : "Votre Atelier");
  const shopCity = activeShop?.city || "Cotonou";
  const shopCraft = activeShop?.craftType || "";
  const kycStatus = activeShop?.kycStatus || 'PENDING';
  const isVerified = activeShop?.isVerified ?? false;

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
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: "800", color: colors.accent, letterSpacing: 1.2 }}>
            {isEn ? "YOUR SHOP TODAY" : "VOTRE BOUTIQUE AUJOURD'HUI"}
          </Text>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 22,
              fontWeight: "700",
              color: colors.text,
              marginTop: 4,
            }}
          >
            {shopName}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            {shopCity}{shopCraft ? ` · ${shopCraft}` : ''}
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

      {/* KYC Status Banner — dynamic based on real shop status */}
      {kycStatus === 'VERIFIED' ? (
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
            {isEn ? "Verified Workshop" : "Atelier Certifié"}
          </Text>
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
            backgroundColor: '#FFF8E1',
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#FFB300',
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 18, marginTop: 1 }}>📋</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: '#E65100', marginBottom: 4 }}>
              {isEn ? "Workshop Under Review" : "Atelier en Cours de Vérification"}
            </Text>
            <Text style={{ fontSize: 12, color: '#795548', lineHeight: 18 }}>
              {isEn
                ? "Your workshop is being reviewed by the Ojarket team. You can prepare your products and record direct sales. Your creations will be visible to buyers after approval."
                : "Votre atelier est en cours de vérification par l'équipe Ojarket. Vous pouvez préparer vos produits et enregistrer vos ventes directes. Vos créations seront visibles par les acheteurs dès validation de votre dossier."
              }
            </Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={{ padding: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.action} />
        </View>
      ) : (
        <>
          {/* Financial Strip & Operational Rows */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            {/* 3-Part Financial Strip */}
            <View style={{ flexDirection: "row", backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
              {/* Vendu */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.muted }}>{isEn ? "Sold" : "Vendu"}</Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 4 }}>
                  {totalVendu.toLocaleString("fr-FR")}
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>FCFA</Text>
              </View>
              {/* Encaissé */}
              <View style={{ flex: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border, paddingHorizontal: 12, marginHorizontal: 8 }}>
                <Text style={{ fontSize: 11, color: colors.action, fontWeight: "700" }}>{isEn ? "Received" : "Encaissé"}</Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.action, marginTop: 4 }}>
                  {totalEncaisse.toLocaleString("fr-FR")}
                </Text>
                <Text style={{ fontSize: 10, color: colors.action }}>FCFA</Text>
              </View>
              {/* À recevoir */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.muted }}>{isEn ? "To receive" : "À recevoir"}</Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#D97706", marginTop: 4 }}>
                  {totalRestant.toLocaleString("fr-FR")}
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>FCFA</Text>
              </View>
            </View>

            {/* Operational Rows */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Demandes acheteurs */}
              <Pressable
                onPress={onOpenOpportunities}
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
                  <Text style={{ fontSize: 11, color: colors.muted }}>{isEn ? "Buyer Requests" : "Demandes acheteurs"}</Text>
                  <Text style={{ fontSize: 11, color: colors.accent, fontWeight: "700" }}>{isEn ? "6 to review →" : "6 à traiter →"}</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
                  6
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>{isEn ? "awaiting quote" : "à traiter"}</Text>
              </Pressable>

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

          {/* Priority Action Tiles */}
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
                  {isEn ? "4 orders to prepare" : "4 commandes à préparer"}
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted }}>
                  {isEn ? "Payments confirmed via MTN MoMo and Direct Transfer." : "Paiements confirmés via MTN MoMo et Virement direct."}
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
                  {isEn ? "Cashbook & Daily Close" : "Caisse & Clôture de journée"}
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted }}>
                  {isEn ? `Sold (${(totalVendu/1000).toFixed(1)}k) ≠ Received (${(totalEncaisse/1000).toFixed(1)}k) ≠ Remaining (${(totalRestant/1000).toFixed(1)}k)` : `Vendu (${(totalVendu/1000).toFixed(1)}k) ≠ Encaissé (${(totalEncaisse/1000).toFixed(1)}k) ≠ Restant (${(totalRestant/1000).toFixed(1)}k)`}
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.muted }}>→</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Quick Action Buttons */}
      <View style={{ gap: 10 }}>
        <Button onPress={onOpenOrders}>
          {isEn ? "Manage Orders →" : "Gérer les commandes →"}
        </Button>
        <Button variant="secondary" onPress={onOpenCashbook}>
          {isEn ? "Cashbook & Reconciliation →" : "Caisse & Rapprochement →"}
        </Button>
      </View>
    </ScrollView>
  );
}

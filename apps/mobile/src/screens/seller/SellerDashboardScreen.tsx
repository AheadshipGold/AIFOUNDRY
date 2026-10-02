import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useDesign } from "../../design-system/provider";
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
  const { colors, locale, mode, setMode } = useDesign();
  const isEn = locale === "en";
  const isDark = mode === "dark";

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

        try {
          const me = await AuthApi.getMe();
          if (me.activeShop) {
            setActiveShop(me.activeShop);
          } else if (me.shops && me.shops.length > 0) {
            setActiveShop(me.shops[0]);
          }
        } catch {}
      } catch (err) {
        console.warn("Failed to load seller dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalVendu = cashbook ? Math.round(cashbook.summary.totalVenduMinor / 100) : 4850000;
  const sellerName = "Alexandre";
  const shopName = activeShop?.name || "Maison Laurent";

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* ==================== PINNED FIXED TOP BAR ==================== */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 18,
          paddingTop: Platform.OS === "android" ? 14 : 10,
          paddingBottom: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          zIndex: 10,
        }}
      >
        {/* Brand Crest + Title */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              backgroundColor: colors.action,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.accent,
            }}
          >
            <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "900" }}>✦</Text>
          </View>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 17,
              fontWeight: "800",
              letterSpacing: 1.5,
              color: colors.text,
            }}
          >
            OJARKET
          </Text>
        </View>

        {/* Right Controls: Notifications + Avatar + Buyer Switch */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {/* Notification Bell */}
          <Pressable
            style={({ pressed }) => [{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.canvas,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              opacity: pressed ? 0.75 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            }]}
          >
            <Text style={{ fontSize: 15 }}>🔔</Text>
            <View
              style={{
                position: "absolute",
                top: 7,
                right: 7,
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: "#EF4444",
                borderWidth: 1,
                borderColor: colors.surface,
              }}
            />
          </Pressable>

          {/* Seller Avatar */}
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.action,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: colors.accent,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800" }}>
              AH
            </Text>
          </View>

          {/* Switch to Buyer Mode */}
          <Pressable
            onPress={onSwitchToBuyer}
            style={({ pressed }) => [{
              backgroundColor: colors.canvas,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 16,
              opacity: pressed ? 0.75 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            }]}
          >
            <Text style={{ fontSize: 11, fontWeight: "800", color: colors.action }}>
              {isEn ? "Buyer 🛍" : "Acheteur 🛍"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ==================== SCROLLABLE DASHBOARD FEED ==================== */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== GREETING HEADER ==================== */}
        <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text
                style={{
                  fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                  fontSize: 24,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                {isEn ? `Hello ${sellerName} 👋` : `Bonjour ${sellerName} 👋`}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                {shopName} · {isEn ? "Master Atelier Cotonou" : "Atelier d'Art Cotonou"}
              </Text>
            </View>

            {/* Gold Vendeur Pro Badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "rgba(212, 180, 131, 0.22)",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.accent,
              }}
            >
              <Text style={{ fontSize: 12 }}>👑</Text>
              <Text style={{ fontSize: 11, color: colors.accent, fontWeight: "800" }}>
                Vendeur Pro
              </Text>
            </View>
          </View>
        </View>

        {/* ==================== 2x2 METRIC CARDS GRID ==================== */}
        <View style={{ paddingHorizontal: 20, marginBottom: 22 }}>
          <View style={{ gap: 12 }}>
            {/* Row 1: Ventes + Commandes */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Ventes */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0 : 0.04,
                  shadowRadius: 6,
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted }}>
                    {isEn ? "Sales" : "Ventes"}
                  </Text>
                  <View style={{ backgroundColor: colors.successBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: "800", color: colors.action }}>
                      ↗ +38%
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
                  {totalVendu.toLocaleString("fr-FR")}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: "700", color: colors.accent, marginTop: 2 }}>
                  FCFA (Ce mois)
                </Text>
              </View>

              {/* Commandes */}
              <Pressable
                onPress={onOpenOrders}
                style={({ pressed }) => [{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0 : 0.04,
                  shadowRadius: 6,
                  elevation: 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                }]}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted }}>
                    {isEn ? "Orders" : "Commandes"}
                  </Text>
                  <View style={{ backgroundColor: colors.successBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: "800", color: colors.action }}>
                      ↗ +24%
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
                  142
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                  {isEn ? "3 to fulfill" : "3 à expédier"}
                </Text>
              </Pressable>
            </View>

            {/* Row 2: Demandes + Stock faible */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Demandes */}
              <Pressable
                onPress={onOpenOpportunities}
                style={({ pressed }) => [{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0 : 0.04,
                  shadowRadius: 6,
                  elevation: 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                }]}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted }}>
                    {isEn ? "Requests" : "Demandes"}
                  </Text>
                  <View style={{ backgroundColor: colors.successBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: "800", color: colors.action }}>
                      ↗ +60%
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
                  28
                </Text>
                <Text style={{ fontSize: 10, color: colors.accent, fontWeight: "700", marginTop: 2 }}>
                  {isEn ? "6 pending quotes" : "6 devis en attente"}
                </Text>
              </Pressable>

              {/* Stock faible */}
              <Pressable
                onPress={onOpenCashbook}
                style={({ pressed }) => [{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0 : 0.04,
                  shadowRadius: 6,
                  elevation: 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                }]}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted }}>
                    {isEn ? "Low Stock" : "Stock faible"}
                  </Text>
                  <View style={{ backgroundColor: "#FEF3C7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: "800", color: "#D97706" }}>
                      ⚠️ 3
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
                  3 pièces
                </Text>
                <Text style={{ fontSize: 10, color: "#D97706", fontWeight: "700", marginTop: 2 }}>
                  {isEn ? "Restock needed" : "Réapprovisionner"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ==================== 4 ACTION SHORTCUTS ==================== */}
        <View style={{ paddingHorizontal: 20, marginBottom: 26 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {[
              { label: isEn ? "Products" : "Produits", icon: "📦", action: onOpenCashbook },
              { label: isEn ? "Orders" : "Commandes", icon: "📋", action: onOpenOrders },
              { label: isEn ? "Messages" : "Messages", icon: "💬", action: onOpenOpportunities },
              { label: isEn ? "My Shop" : "Boutique", icon: "🏪", action: onOpenCashbook },
            ].map((item, idx) => (
              <Pressable
                key={idx}
                onPress={item.action}
                style={({ pressed }) => [{
                  alignItems: "center",
                  width: 72,
                  opacity: pressed ? 0.75 : 1,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                }]}
              >
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0 : 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.text,
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ==================== COMMANDES RÉCENTES ==================== */}
        <View style={{ paddingHorizontal: 20, marginBottom: 26 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <Text
              style={{
                fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                fontSize: 18,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {isEn ? "Recent Orders" : "Commandes récentes"}
            </Text>
            <Pressable onPress={onOpenOrders}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.action }}>
                {isEn ? "See all →" : "Voir tout →"}
              </Text>
            </Pressable>
          </View>

          <View style={{ gap: 10 }}>
            {[
              {
                id: "CMD-2847",
                title: "Sac de voyage weekend cuir",
                client: "Marcelle Houngbo",
                price: "190 000 FCFA",
                status: isEn ? "To Prepare" : "En préparation",
                statusColor: "#D97706",
                statusBg: "#FEF3C7",
                icon: "👜",
              },
              {
                id: "CMD-2846",
                title: "Chronographe Héritage Acier",
                client: "Didier Agossa",
                price: "285 000 FCFA",
                status: isEn ? "Delivered" : "Livrée",
                statusColor: colors.action,
                statusBg: colors.successBg,
                icon: "⌚",
              },
              {
                id: "CMD-2840",
                title: "Fauteuil Club Travertin",
                client: "Kodjo Mensah",
                price: "145 000 FCFA",
                status: isEn ? "Delivered" : "Livrée",
                statusColor: colors.action,
                statusBg: colors.successBg,
                icon: "🛋",
              },
            ].map((order, i) => (
              <Pressable
                key={i}
                onPress={onOpenOrders}
                style={({ pressed }) => [{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 12,
                  gap: 12,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                }]}
              >
                {/* Thumbnail Icon Box */}
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: colors.canvas,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{order.icon}</Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                      #{order.id}
                    </Text>
                    <View style={{ backgroundColor: order.statusBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 9, fontWeight: "800", color: order.statusColor }}>
                        {order.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.text, marginTop: 2 }} numberOfLines={1}>
                    {order.title}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted }}>
                    {order.client}
                  </Text>
                </View>

                {/* Price & Chevron */}
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: colors.action }}>
                    {order.price}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                    →
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ==================== ÉVOLUTION DES VENTES (CHART CARD) ==================== */}
        <View style={{ paddingHorizontal: 20, marginBottom: 26 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 18,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: isDark ? 0 : 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {/* Header with Selector */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <View>
                <Text
                  style={{
                    fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  {isEn ? "Sales Evolution" : "Évolution des ventes"}
                </Text>
                <Text style={{ fontSize: 11, color: colors.action, fontWeight: "700", marginTop: 2 }}>
                  ↗ +38% {isEn ? "vs last month" : "vs mois dernier"}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: colors.canvas,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: colors.text }}>
                  30 jours ⌄
                </Text>
              </View>
            </View>

            {/* Stylized Bar / Area Chart Representation */}
            <View style={{ height: 110, flexDirection: "row", alignItems: "flex-end", gap: 8, paddingTop: 10 }}>
              {[35, 48, 42, 60, 55, 75, 68, 85, 92, 100].map((h, idx) => (
                <View key={idx} style={{ flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                  <View
                    style={{
                      width: "100%",
                      height: `${h}%`,
                      backgroundColor: idx === 9 ? colors.action : (idx % 2 === 0 ? "rgba(13, 74, 56, 0.4)" : "rgba(212, 180, 131, 0.6)"),
                      borderRadius: 6,
                    }}
                  />
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <Text style={{ fontSize: 9, color: colors.muted }}>1 Mars</Text>
              <Text style={{ fontSize: 9, color: colors.muted }}>15 Mars</Text>
              <Text style={{ fontSize: 9, color: colors.action, fontWeight: "700" }}>Aujourd'hui</Text>
            </View>
          </View>
        </View>

        {/* ==================== DEMANDES EN ATTENTE (PENDING REQUESTS) ==================== */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <Text
              style={{
                fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                fontSize: 18,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {isEn ? "Pending Bespoke Requests" : "Demandes sur-mesure en attente"}
            </Text>
            <Pressable onPress={onOpenOpportunities}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.action }}>
                {isEn ? "View all (6) →" : "Voir tout (6) →"}
              </Text>
            </Pressable>
          </View>

          <View style={{ gap: 10 }}>
            {[
              {
                buyer: "Amina Diop",
                title: "Montre chronographe sur-mesure or rose",
                budget: "300 000 FCFA",
                time: "Il y a 2h",
              },
              {
                buyer: "Jean-Marc Dossou",
                title: "Cabas cuir pleine fleur avec gravure initiale",
                budget: "75 000 FCFA",
                time: "Il y a 5h",
              },
            ].map((req, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: "800", color: colors.accent }}>
                      {req.buyer}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.muted }}>
                      · {req.time}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 2 }} numberOfLines={1}>
                    {req.title}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: "800", color: colors.action, marginTop: 4 }}>
                    Budget: {req.budget}
                  </Text>
                </View>

                <Pressable
                  onPress={onOpenOpportunities}
                  style={({ pressed }) => [{
                    backgroundColor: colors.action,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 14,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  }]}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
                    {isEn ? "Quote >" : "Répondre >"}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

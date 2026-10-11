import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Image,
  Platform,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesign } from "../../design-system/provider";
import { Icon } from "../../design-system/Icon";
import {
  SellerApi,
  OrderRecord,
  SellerOverview,
  AuthApi,
  type AuthShop,
  type AuthUser,
  resolveMediaUrl,
} from "../../services/api";

const logoDark = require("../../../assets/brand/Ojarket_03_Compact_Wordmark_Dark_Transparent.png");
const logoLight = require("../../../assets/brand/Ojarket_03_Compact_Wordmark_Transparent.png");
const imgLeatherTote = require("../../../assets/products/leather-tote.jpg");
const imgWatchChrono = require("../../../assets/products/watch-chrono.jpg");
const imgArmchair = require("../../../assets/products/armchair.jpg");

interface SellerDashboardScreenProps {
  currentUser?: AuthUser | null;
  onOpenCashbook: () => void;
  onOpenOrders: () => void;
  onOpenOpportunities: () => void;
  onOpenShop?: () => void;
  onSwitchToBuyer: () => void;
}

export default function SellerDashboardScreen({
  currentUser,
  onOpenCashbook,
  onOpenOrders,
  onOpenOpportunities,
  onOpenShop,
  onSwitchToBuyer,
}: SellerDashboardScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0);
  const { colors, locale, mode } = useDesign();
  const isEn = locale === "en";
  const isDark = mode === "dark";

  const [overview, setOverview] = useState<SellerOverview | null>(null);
  const [activeShop, setActiveShop] = useState<AuthShop | null>(
    currentUser?.activeShop || (currentUser?.shops && currentUser.shops.length > 0 ? currentUser.shops[0] : null)
  );
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const sellerName = currentUser?.name
    ? currentUser.name.trim().split(/\s+/)[0]
    : (isEn ? "Merchant" : "Commerçant");
  const shopName = overview?.shop?.name
    || activeShop?.name
    || currentUser?.activeShop?.name
    || (currentUser?.shops && currentUser.shops[0]?.name)
    || (isEn ? "My Store" : "Ma Boutique");
  const initials = currentUser?.name
    ? currentUser.name.trim().split(/\s+/).map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : "MB";
  const kycStatus = overview?.shop?.kycStatus
    || activeShop?.kycStatus
    || currentUser?.activeShop?.kycStatus
    || (currentUser?.shops && currentUser.shops[0]?.kycStatus)
    || "PENDING";

  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ov, ord] = await Promise.all([
        SellerApi.getOverview().catch(() => null),
        SellerApi.getOrders().catch(() => []),
      ]);
      setOverview(ov);
      setOrders(ord || []);

      try {
        const me = await AuthApi.getMe();
        if (me.activeShop) {
          setActiveShop(me.activeShop);
        } else if (me.shops && me.shops.length > 0) {
          setActiveShop(me.shops[0]);
        }
      } catch {}
    } catch (err) {
      console.warn("Failed to load seller overview", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const monthRevenue = overview?.revenue?.monthMinor !== undefined
    ? Math.round(overview.revenue.monthMinor / 100)
    : 0;
  const growthPercent = overview?.revenue?.growthPercent;
  const ordersCount = overview?.orders?.total ?? orders.length;
  const toFulfillCount = overview?.orders?.toFulfill ?? 0;
  const lowStockCount = overview?.catalog?.lowStock ?? 0;
  const openRequestsCount = overview?.requests?.open ?? 0;
  const series = overview?.series || [];

  // Max series amount for relative bar heights
  const maxSeriesAmount = Math.max(...series.map((s) => s.amountMinor), 1);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* ==================== PINNED FIXED TOP BAR ==================== */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: topInset > 0 ? topInset + 6 : (Platform.OS === "android" ? 36 : 10),
          paddingBottom: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          zIndex: 10,
        }}
      >
        {/* Official Brand Logo + Boutique Subtitle */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Image
            source={isDark ? logoDark : logoLight}
            style={{ width: 100, height: 26, resizeMode: "contain" }}
          />
          <View
            style={{
              backgroundColor: "rgba(212, 180, 131, 0.18)",
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.accent,
            }}
          >
            <Text style={{ fontSize: 8.5, color: colors.accent, fontWeight: "800", letterSpacing: 0.5 }}>
              COMMERCE OS
            </Text>
          </View>
        </View>

        {/* Right Controls: Notifications + Avatar + Buyer Switch */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {/* Notification Bell */}
          <Pressable
            style={({ pressed }) => [{
              width: 32,
              height: 32,
              borderRadius: 16,
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
            <Icon name="bell" size={16} color={colors.text} />
          </Pressable>

          {/* Seller Avatar */}
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.action,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: colors.accent,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "800" }}>
              {initials}
            </Text>
          </View>

          {/* Switch to Buyer Mode */}
          <Pressable
            onPress={onSwitchToBuyer}
            style={({ pressed }) => [{
              backgroundColor: colors.action,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 14,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }]}
          >
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#FFFFFF" }}>
              {isEn ? "Buyer" : "Acheteur"}
            </Text>
            <Icon name="arrow-right" size={10} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      {/* ==================== SCROLLABLE DASHBOARD FEED ==================== */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.action || "#10B981"}
            colors={[colors.action || "#10B981", colors.accent || "#D4B483"]}
          />
        }
      >
        {/* ==================== GREETING HEADER ==================== */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                  fontSize: 22,
                  fontWeight: "700",
                  color: colors.text,
                  letterSpacing: -0.3,
                }}
              >
                {isEn ? `Hello ${sellerName}` : `Bonjour ${sellerName}`}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                <Text style={{ fontSize: 11, color: colors.muted }}>
                  {shopName} · {overview?.shop?.city || "Cotonou"}
                </Text>
                {kycStatus === 'PENDING' ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                      backgroundColor: "rgba(245, 158, 11, 0.15)",
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#F59E0B",
                    }}
                  >
                    <Icon name="clock" size={10} color="#D97706" />
                    <Text style={{ fontSize: 9.5, color: "#D97706", fontWeight: "800" }}>
                      {isEn ? "KYC Pending" : "Validation KYC en cours"}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                      backgroundColor: "rgba(212, 180, 131, 0.18)",
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.accent,
                    }}
                  >
                    <Icon name="crown" size={11} color={colors.accent} />
                    <Text style={{ fontSize: 9.5, color: colors.accent, fontWeight: "800" }}>
                      {isEn ? "Verified Store" : "Boutique Certifiée"}
                    </Text>
                  </View>
                )}
              </View>

              {kycStatus === 'PENDING' && (
                <View
                  style={{
                    marginTop: 10,
                    backgroundColor: "rgba(245, 158, 11, 0.08)",
                    padding: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(245, 158, 11, 0.25)",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Icon name="clock" size={16} color="#D97706" />
                  <Text style={{ flex: 1, fontSize: 11.5, color: colors.text, fontWeight: "600", lineHeight: 16 }}>
                    {isEn
                      ? "Your store verification is underway. You can manage products, orders, and payment accounts right away."
                      : "Votre boutique est en cours de validation. Vous pouvez dès à présent ajouter vos créations, gérer vos commandes et vos règlements."}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ==================== 2x2 METRIC CARDS GRID ==================== */}
        <View style={{ paddingHorizontal: 16, marginBottom: 22 }}>
          <View style={{ gap: 12 }}>
            {/* Row 1: Ventes + Commandes */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Ventes ce mois */}
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
                    {isEn ? "Sales (This Month)" : "Ventes (Ce mois)"}
                  </Text>
                  {growthPercent !== null && growthPercent !== undefined && (
                    <View
                      style={{
                        backgroundColor: growthPercent >= 0 ? colors.successBg : "#FEE2E2",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "800",
                          color: growthPercent >= 0 ? colors.action : "#DC2626",
                        }}
                      >
                        {growthPercent >= 0 ? `+${growthPercent}%` : `${growthPercent}%`}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
                  {monthRevenue.toLocaleString("fr-FR")}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: "700", color: colors.accent, marginTop: 2 }}>
                  FCFA (Certifié)
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
                  {toFulfillCount > 0 && (
                    <View style={{ backgroundColor: "#FEF3C7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: "800", color: "#D97706" }}>
                        {toFulfillCount} {isEn ? "pending" : "à traiter"}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
                  {ordersCount}
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                  {toFulfillCount > 0
                    ? (isEn ? `${toFulfillCount} to ship` : `${toFulfillCount} à expédier`)
                    : (isEn ? "All fulfilled" : "Toutes traitées")}
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
                    {isEn ? "Requests" : "Demandes sur-mesure"}
                  </Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
                  {openRequestsCount}
                </Text>
                <Text style={{ fontSize: 10, color: colors.accent, fontWeight: "700", marginTop: 2 }}>
                  {openRequestsCount > 0
                    ? (isEn ? `${openRequestsCount} pending quotes` : `${openRequestsCount} devis en attente`)
                    : (isEn ? "No active quotes" : "Aucun devis en attente")}
                </Text>
              </Pressable>

              {/* Stock faible */}
              <Pressable
                onPress={onOpenShop || onOpenCashbook}
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
                  {lowStockCount > 0 && (
                    <View style={{ backgroundColor: "#FEF3C7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: "800", color: "#D97706" }}>
                        {lowStockCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
                  {lowStockCount} {isEn ? "items" : "pièces"}
                </Text>
                <Text style={{ fontSize: 10, color: lowStockCount > 0 ? "#D97706" : colors.muted, fontWeight: "700", marginTop: 2 }}>
                  {lowStockCount > 0
                    ? (isEn ? "Restock needed" : "Réapprovisionner")
                    : (isEn ? "Inventory optimal" : "Stock optimal")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ==================== 4 ACTION SHORTCUTS (VECTOR NO EMOJIS) ==================== */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            {[
              { label: isEn ? "Products" : "Articles", icon: "tote", action: onOpenShop || onOpenCashbook },
              { label: isEn ? "Orders" : "Commandes", icon: "package", action: onOpenOrders },
              { label: isEn ? "Cashbook" : "Livre de Caisse", icon: "wallet", action: onOpenCashbook },
              { label: isEn ? "Store" : "Boutique", icon: "storefront", action: onOpenShop || onOpenCashbook },
            ].map((item, idx) => (
              <Pressable
                key={idx}
                onPress={item.action}
                style={({ pressed }) => [{
                  flex: 1,
                  alignItems: "center",
                  opacity: pressed ? 0.75 : 1,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                }]}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: colors.surface,
                    borderWidth: 1.5,
                    borderColor: colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0 : 0.05,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <Icon name={item.icon} size={22} color={colors.accent} />
                </View>
                <Text
                  style={{
                    fontSize: 10.5,
                    fontWeight: "700",
                    color: colors.text,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ==================== COMMANDES RÉCENTES ==================== */}
        <View style={{ paddingHorizontal: 16, marginBottom: 26 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <Text
              style={{
                fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                fontSize: 18,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {isEn ? "Recent Store Orders" : "Commandes récentes de la boutique"}
            </Text>
            <Pressable onPress={onOpenOrders}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.action }}>
                {isEn ? "See all →" : "Voir tout →"}
              </Text>
            </Pressable>
          </View>

          {orders.length > 0 ? (
            <View style={{ gap: 10 }}>
              {orders.slice(0, 3).map((order, i) => {
                const lines = order.lines || (order as any).items || [];
                const firstItemTitle = lines[0]?.itemTitle || (isEn ? "Creation" : "Création d'atelier");
                const firstImg = lines[0]?.image;

                let imageSource: any = imgWatchChrono;
                if (firstImg) {
                  const resolved = resolveMediaUrl(firstImg);
                  if (resolved) imageSource = { uri: resolved };
                } else if (firstItemTitle.toLowerCase().includes("cuir") || firstItemTitle.toLowerCase().includes("sac")) {
                  imageSource = imgLeatherTote;
                } else if (firstItemTitle.toLowerCase().includes("fauteuil") || firstItemTitle.toLowerCase().includes("mobilier")) {
                  imageSource = imgArmchair;
                }

                return (
                  <Pressable
                    key={order.id || i}
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
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        overflow: "hidden",
                        borderWidth: 1.5,
                        borderColor: colors.accent,
                        backgroundColor: colors.canvas,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        source={imageSource}
                        style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                          #{order.orderNumber || order.id}
                        </Text>
                        <View
                          style={{
                            backgroundColor: order.fulfillmentStatus === "DELIVERED"
                              ? colors.successBg
                              : order.fulfillmentStatus === "PREPARING"
                              ? "#FEF3C7"
                              : colors.subtle,
                            paddingHorizontal: 7,
                            paddingVertical: 2,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              fontWeight: "800",
                              color: order.fulfillmentStatus === "DELIVERED"
                                ? colors.action
                                : order.fulfillmentStatus === "PREPARING"
                                ? "#D97706"
                                : colors.text,
                            }}
                          >
                            {order.fulfillmentStatus || "EN COURS"}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, color: colors.text, marginTop: 2, fontWeight: "600" }} numberOfLines={1}>
                        {firstItemTitle}
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.muted }}>
                        Client : {order.buyerName || "Client Ojarket"}
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontSize: 13, fontWeight: "800", color: colors.action }}>
                        {Math.round(order.totalAmountMinor / 100).toLocaleString("fr-FR")} FCFA
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                        →
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ marginBottom: 6 }}><Icon name="package" size={24} color={colors.muted} /></View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, textAlign: "center" }}>
                {isEn ? "No store sales yet" : "Aucune commande pour le moment"}
              </Text>
              <Text style={{ fontSize: 11, color: colors.muted, textAlign: "center", marginTop: 4, lineHeight: 16 }}>
                {isEn
                  ? "Your boutique is live. When buyers purchase your creations, they will be listed here."
                  : "Votre boutique est en ligne. Dès qu'un client achète l'une de vos pièces, la commande s'affiche ici."}
              </Text>
            </View>
          )}
        </View>

        {/* ==================== ÉVOLUTION DES VENTES (REAL 14-DAY SERIES) ==================== */}
        <View style={{ paddingHorizontal: 16, marginBottom: 26 }}>
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
                  {isEn ? "Sales Activity (14 Days)" : "Activité des ventes (14 jours)"}
                </Text>
                <Text style={{ fontSize: 11, color: colors.action, fontWeight: "700", marginTop: 2 }}>
                  {growthPercent !== null && growthPercent !== undefined
                    ? `${growthPercent >= 0 ? `+${growthPercent}%` : `${growthPercent}%`} ${isEn ? "vs last month" : "vs mois dernier"}`
                    : (monthRevenue > 0
                        ? `${monthRevenue.toLocaleString("fr-FR")} FCFA ${isEn ? "collected" : "encaissés"}`
                        : (isEn ? "Store active · Ready for sales" : "Boutique active · Prête pour les ventes"))}
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
                  14j
                </Text>
              </View>
            </View>

            {/* Dynamic Real Bar Chart */}
            <View style={{ height: 110, flexDirection: "row", alignItems: "flex-end", gap: 5, paddingTop: 10 }}>
              {series.length > 0 ? (
                series.map((day, idx) => {
                  const ratio = day.amountMinor > 0 ? Math.max((day.amountMinor / maxSeriesAmount) * 100, 15) : 8;
                  const isToday = idx === series.length - 1;
                  return (
                    <View key={day.date || idx} style={{ flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                      <View
                        style={{
                          width: "100%",
                          height: `${Math.min(ratio, 100)}%`,
                          backgroundColor: day.amountMinor > 0
                            ? (isToday ? colors.action : colors.accent)
                            : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
                          borderRadius: 4,
                        }}
                      />
                    </View>
                  );
                })
              ) : (
                [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10].map((h, idx) => (
                  <View key={idx} style={{ flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                    <View
                      style={{
                        width: "100%",
                        height: `${h}%`,
                        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                        borderRadius: 4,
                      }}
                    />
                  </View>
                ))
              )}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <Text style={{ fontSize: 9, color: colors.muted }}>
                {series[0]?.date ? new Date(series[0].date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "J-14"}
              </Text>
              <Text style={{ fontSize: 9, color: colors.muted }}>
                {series[Math.floor(series.length / 2)]?.date
                  ? new Date(series[Math.floor(series.length / 2)].date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                  : "J-7"}
              </Text>
              <Text style={{ fontSize: 9, color: colors.action, fontWeight: "700" }}>
                {isEn ? "Today" : "Aujourd'hui"}
              </Text>
            </View>
          </View>
        </View>

        {/* ==================== DEMANDES SUR-MESURE (PENDING REQUESTS) ==================== */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <Text
              style={{
                fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                fontSize: 18,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {isEn ? "Pending Custom Requests" : "Demandes sur-mesure d'acheteurs"}
            </Text>
            <Pressable onPress={onOpenOpportunities}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.action }}>
                {isEn ? "View all →" : "Voir tout →"}
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ marginBottom: 6 }}><Icon name="sparkle" size={24} color={colors.accent} weight="fill" /></View>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, textAlign: "center" }}>
              {isEn ? "No pending buyer requests" : "Aucune demande d'acheteur pour le moment"}
            </Text>
            <Text style={{ fontSize: 11, color: colors.muted, textAlign: "center", marginTop: 4, lineHeight: 16 }}>
              {isEn
                ? "Custom bespoke requests (D02) from buyers will appear here in real time."
                : "Les commandes de créations sur-mesure (D02) et devis apparaîtront ici."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

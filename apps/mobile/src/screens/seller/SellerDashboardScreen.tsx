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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesign } from "../../design-system/provider";
import {
  SellerApi,
  OrdersApi,
  OrderRecord,
  CashbookData,
  SellerDashboardData,
  AuthApi,
  type AuthShop,
  type AuthUser,
} from "../../services/api";

const logoDark = require("../../../assets/brand/Ojarket_03_Compact_Wordmark_Dark_Transparent.png");
const logoLight = require("../../../assets/brand/Ojarket_03_Compact_Wordmark_Transparent.png");
const iconBrandDark = require("../../../assets/brand/Ojarket_01_Icon_UltraPremium_Dark_Transparent.png");
const iconBrandLight = require("../../../assets/brand/Ojarket_01_Icon_UltraPremium_Transparent.png");

const imgLeatherTote = require("../../../assets/products/leather-tote.jpg");
const imgWatchChrono = require("../../../assets/products/watch-chrono.jpg");
const imgArmchair = require("../../../assets/products/armchair.jpg");
const imgJewelryGold = require("../../../assets/products/jewelry-gold.jpg");
const imgArtBronze = require("../../../assets/products/art-bronze.jpg");

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
  const { colors, locale, mode, setMode } = useDesign();
  const isEn = locale === "en";
  const isDark = mode === "dark";

  const [cashbook, setCashbook] = useState<CashbookData | null>(null);
  const [dashboard, setDashboard] = useState<SellerDashboardData | null>(null);
  const [activeShop, setActiveShop] = useState<AuthShop | null>(
    currentUser?.activeShop || (currentUser?.shops && currentUser.shops.length > 0 ? currentUser.shops[0] : null)
  );
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const isDemo = currentUser?.email === 'demo@ojarket.test' || currentUser?.email === 'alexandre@ojarket.test';
  const sellerName = currentUser?.name
    ? currentUser.name.trim().split(/\s+/)[0]
    : (isDemo ? "Alexandre" : (isEn ? "Artisan" : "Artisan"));
  const shopName = activeShop?.name
    || currentUser?.activeShop?.name
    || (currentUser?.shops && currentUser.shops[0]?.name)
    || (isDemo ? "Maison Laurent" : (isEn ? "My Workshop" : "Mon Atelier"));
  const initials = currentUser?.name
    ? currentUser.name.trim().split(/\s+/).map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : (isDemo ? "AL" : "OA");
  const kycStatus = activeShop?.kycStatus
    || currentUser?.activeShop?.kycStatus
    || (currentUser?.shops && currentUser.shops[0]?.kycStatus)
    || (isDemo ? "VERIFIED" : "PENDING");

  useEffect(() => {
    async function loadData() {
      try {
        const [cb, db, ord] = await Promise.all([
          SellerApi.getCashbook().catch(() => null),
          SellerApi.getDashboard().catch(() => null),
          OrdersApi.getAll().catch(() => []),
        ]);
        setCashbook(cb);
        setDashboard(db);
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
        console.warn("Failed to load seller dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  const totalVendu = cashbook?.summary?.totalVenduMinor !== undefined
    ? Math.round(cashbook.summary.totalVenduMinor / 100)
    : (isDemo ? 4850000 : 0);
  const ordersCount = orders.length > 0
    ? orders.length
    : (activeShop?.ordersCount !== undefined ? activeShop.ordersCount : (isDemo ? 142 : 0));
  const rawLowStock = dashboard?.kpis?.find(k => k.label.toLowerCase().includes('stock'))?.value;
  const lowStockCount = rawLowStock !== undefined ? parseInt(rawLowStock, 10) : (isDemo ? 3 : 0);

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
        {/* Official Brand Logo + Atelier Subtitle */}
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
              ATELIER
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
            <Text style={{ fontSize: 13, color: colors.text }}>🔔</Text>
            <View
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.accent,
              }}
            />
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
              gap: 3,
            }]}
          >
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#FFFFFF" }}>
              {isEn ? "Buyer" : "Acheteur"}
            </Text>
            <Text style={{ fontSize: 10, color: colors.accent, fontWeight: "800" }}>
              →
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
                {isEn ? `Hello ${sellerName} 👋` : `Bonjour ${sellerName} 👋`}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                <Text style={{ fontSize: 11, color: colors.muted }}>
                  {shopName} · {isEn ? "Cotonou Atelier" : "Atelier Cotonou"}
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
                    <Text style={{ fontSize: 9.5 }}>⏳</Text>
                    <Text style={{ fontSize: 9.5, color: "#D97706", fontWeight: "800" }}>
                      {isEn ? "KYC Verification Pending" : "En cours de validation KYC"}
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
                    <Text style={{ fontSize: 10 }}>👑</Text>
                    <Text style={{ fontSize: 9.5, color: colors.accent, fontWeight: "800" }}>
                      {isEn ? "Certified Artisan" : "Atelier Certifié"}
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
                  }}
                >
                  <Text style={{ fontSize: 11.5, color: colors.text, fontWeight: "600", lineHeight: 16 }}>
                    {isEn
                      ? "⏳ Your workshop is being verified. You can already configure your atelier, add your creations, and manage your cashbook."
                      : "⏳ Votre atelier est en cours de validation. En attendant l’approbation officielle, vous pouvez dès à présent ajouter vos créations et configurer votre boutique."}
                  </Text>
                </View>
              )}
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
                  {ordersCount > 0 && (
                    <View style={{ backgroundColor: colors.successBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: "800", color: colors.action }}>
                        ↗ +24%
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
                  {ordersCount}
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                  {ordersCount > 0
                    ? (isEn ? `${ordersCount} active` : `${ordersCount} en cours`)
                    : (isEn ? "0 to fulfill" : "0 à expédier")}
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
                  {isDemo && (
                    <View style={{ backgroundColor: colors.successBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: "800", color: colors.action }}>
                        ↗ +60%
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
                  {isDemo ? "28" : "0"}
                </Text>
                <Text style={{ fontSize: 10, color: colors.accent, fontWeight: "700", marginTop: 2 }}>
                  {isDemo
                    ? (isEn ? "6 pending quotes" : "6 devis en attente")
                    : (isEn ? "0 pending quotes" : "0 devis en attente")}
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
                        ⚠️ {lowStockCount}
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

        {/* ==================== 4 ACTION SHORTCUTS ==================== */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            {[
              { label: isEn ? "Creations" : "Créations", symbol: "◈", action: onOpenShop || onOpenCashbook },
              { label: isEn ? "Orders" : "Commandes", symbol: "☵", action: onOpenOrders },
              { label: isEn ? "Bespoke" : "Sur-Mesure", symbol: "✦", action: onOpenOpportunities },
              { label: isEn ? "Atelier" : "Mon Atelier", symbol: "🏛", action: onOpenShop || onOpenCashbook },
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
                  <Text style={{ fontSize: 18, color: colors.accent, fontWeight: "900" }}>{item.symbol}</Text>
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
              {isEn ? "Recent Orders" : "Commandes récentes"}
            </Text>
            <Pressable onPress={onOpenOrders}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.action }}>
                {isEn ? "See all →" : "Voir tout →"}
              </Text>
            </Pressable>
          </View>

          {orders.length > 0 ? (
            <View style={{ gap: 10 }}>
              {orders.slice(0, 3).map((order, i) => (
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
                      source={imgLeatherTote}
                      style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                        #{order.orderNumber || order.id}
                      </Text>
                      <View style={{ backgroundColor: colors.successBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 9, fontWeight: "800", color: colors.action }}>
                          {order.fulfillmentStatus || "EN COURS"}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.text, marginTop: 2, fontWeight: "600" }} numberOfLines={1}>
                      {order.lines?.[0]?.itemTitle || (isEn ? "Creation Order" : "Commande de création")}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.muted }}>
                      Client : {order.buyerName}
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
              ))}
            </View>
          ) : isDemo ? (
            <View style={{ gap: 10 }}>
              {[
                {
                  id: "CMD-2847",
                  title: "Sac de voyage weekend cuir",
                  client: "Marcelle Houngbo",
                  price: "190 000 FCFA",
                  status: isEn ? "To Prepare" : "En préparation",
                  statusColor: "#D97706",
                  statusBg: "rgba(217, 119, 6, 0.12)",
                  image: imgLeatherTote,
                },
                {
                  id: "CMD-2846",
                  title: "Chronographe Héritage Acier",
                  client: "Didier Agossa",
                  price: "285 000 FCFA",
                  status: isEn ? "Delivered" : "Livrée",
                  statusColor: colors.action,
                  statusBg: colors.successBg,
                  image: imgWatchChrono,
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
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      overflow: "hidden",
                      borderWidth: 1.5,
                      borderColor: colors.accent,
                    }}
                  >
                    <Image
                      source={order.image}
                      style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                        #{order.id}
                      </Text>
                      <View style={{ backgroundColor: order.statusBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 9, fontWeight: "800", color: order.statusColor }}>
                          {order.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.text, marginTop: 2, fontWeight: "600" }} numberOfLines={1}>
                      {order.title}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.muted }}>
                      Client : {order.client}
                    </Text>
                  </View>

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
              <Text style={{ fontSize: 24, marginBottom: 6 }}>📦</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, textAlign: "center" }}>
                {isEn ? "No orders yet" : "Aucune commande pour le moment"}
              </Text>
              <Text style={{ fontSize: 11, color: colors.muted, textAlign: "center", marginTop: 4, lineHeight: 16 }}>
                {isEn
                  ? "Your workshop is ready! Client purchases will appear here in real time."
                  : "Votre atelier est configuré ! Vos commandes clients apparaîtront ici dès vos premières ventes."}
              </Text>
            </View>
          )}
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
                  {isEn ? "Sales Activity" : "Activité des ventes"}
                </Text>
                <Text style={{ fontSize: 11, color: colors.action, fontWeight: "700", marginTop: 2 }}>
                  {totalVendu > 0
                    ? `↗ +38% ${isEn ? "vs last month" : "vs mois dernier"}`
                    : (isEn ? "Workshop active · Ready for sales" : "Atelier actif · Prêt pour les encaissements")}
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
              {(isDemo
                ? [35, 48, 42, 60, 55, 75, 68, 85, 92, 100]
                : [10, 10, 10, 10, 10, 10, 10, 10, 10, totalVendu > 0 ? 100 : 10]
              ).map((h, idx) => (
                <View key={idx} style={{ flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                  <View
                    style={{
                      width: "100%",
                      height: `${h}%`,
                      backgroundColor: idx === 9 && totalVendu > 0
                        ? colors.action
                        : (idx % 2 === 0 ? "rgba(13, 74, 56, 0.25)" : "rgba(212, 180, 131, 0.35)"),
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
                {isDemo ? (isEn ? "View all (6) →" : "Voir tout (6) →") : (isEn ? "View all →" : "Voir tout →")}
              </Text>
            </Pressable>
          </View>

          {isDemo ? (
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
              <Text style={{ fontSize: 24, marginBottom: 6 }}>✦</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, textAlign: "center" }}>
                {isEn ? "No pending bespoke requests" : "Aucune demande sur-mesure pour le moment"}
              </Text>
              <Text style={{ fontSize: 11, color: colors.muted, textAlign: "center", marginTop: 4, lineHeight: 16 }}>
                {isEn
                  ? "Clients looking for custom creations will be matched to your workshop here."
                  : "Les demandes de devis et créations sur-mesure des acheteurs apparaîtront ici."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

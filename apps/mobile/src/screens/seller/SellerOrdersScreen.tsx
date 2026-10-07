import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesign } from "../../design-system/provider";
import { Icon } from "../../design-system/Icon";
import { OrdersApi, OrderRecord, type AuthUser } from "../../services/api";

const imgLeatherTote = require("../../../assets/products/leather-tote.jpg");
const imgWatchChrono = require("../../../assets/products/watch-chrono.jpg");
const imgArmchair = require("../../../assets/products/armchair.jpg");

interface SellerOrdersScreenProps {
  currentUser?: AuthUser | null;
  onBack: () => void;
}

export default function SellerOrdersScreen({ currentUser, onBack }: SellerOrdersScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0);
  const { colors, locale, mode } = useDesign();
  const isEn = locale === "en";
  const isDark = mode === "dark";

  const [activeFilter, setActiveFilter] = useState("all");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const isDemo = currentUser?.email === 'demo@ojarket.test' || currentUser?.email === 'alexandre@ojarket.test';

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  async function loadOrders() {
    try {
      setLoading(true);
      const targetShopId = currentUser?.activeShop?.id || (currentUser?.shops && currentUser.shops[0]?.id);
      const data = await OrdersApi.getAll(targetShopId);
      setOrders(data || []);
    } catch (err) {
      console.warn("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  }

  const updateOrderStatus = async (id: string, fulfillmentStatus: string) => {
    try {
      await OrdersApi.updateStatus(id, { fulfillmentStatus });
      Alert.alert(
        isEn ? "Success" : "Succès",
        isEn ? "Order status updated" : "Statut de la commande mis à jour"
      );
      loadOrders();
    } catch (err) {
      console.warn("Failed to update status", err);
      Alert.alert(isEn ? "Error" : "Erreur", isEn ? "Failed to update status" : "Échec de la mise à jour");
    }
  };

  const displayOrders = orders;

  const filters = [
    { id: "all", labelFr: `Toutes (${displayOrders.length})`, labelEn: `All (${displayOrders.length})` },
    {
      id: "active",
      labelFr: `En cours (${displayOrders.filter((o) => o.fulfillmentStatus !== "DELIVERED").length})`,
      labelEn: `Active (${displayOrders.filter((o) => o.fulfillmentStatus !== "DELIVERED").length})`,
    },
    {
      id: "delivered",
      labelFr: `Livrées (${displayOrders.filter((o) => o.fulfillmentStatus === "DELIVERED").length})`,
      labelEn: `Delivered (${displayOrders.filter((o) => o.fulfillmentStatus === "DELIVERED").length})`,
    },
  ];

  const filteredOrders = displayOrders.filter((o) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return o.fulfillmentStatus !== "DELIVERED";
    if (activeFilter === "delivered") return o.fulfillmentStatus === "DELIVERED";
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* ==================== PINNED FIXED TOP BAR ==================== */}
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: topInset > 0 ? topInset + 6 : (Platform.OS === "android" ? 36 : 10),
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
          zIndex: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
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
              opacity: pressed ? 0.75 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            }]}
          >
            <Text style={{ fontSize: 16, color: colors.action, fontWeight: "700" }}>←</Text>
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 9,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: colors.accent,
                fontWeight: "800",
              }}
            >
              {isEn ? "MERCHANT ORDERS" : "COMMANDES BOUTIQUE"}
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                color: colors.text,
              }}
            >
              {isEn ? "Order Management" : "Gestion des Commandes"}
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
        >
          {filters.map((f) => {
            const isSelected = activeFilter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setActiveFilter(f.id)}
                style={({ pressed }) => [{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.action : colors.border,
                  backgroundColor: isSelected ? colors.action : colors.canvas,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                }]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: isSelected ? "#FFFFFF" : colors.text,
                  }}
                >
                  {isEn ? f.labelEn : f.labelFr}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ==================== SCROLLABLE ORDER LIST ==================== */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 18, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.action} />
          </View>
        ) : filteredOrders.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 32,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <View style={{ marginBottom: 12 }}><Icon name="package" size={36} color={colors.muted} /></View>
            <Text
              style={{
                fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                fontSize: 17,
                fontWeight: "700",
                color: colors.text,
                textAlign: "center",
              }}
            >
              {isEn ? "No orders yet" : "Aucune commande pour le moment"}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                textAlign: "center",
                marginTop: 6,
                lineHeight: 18,
                maxWidth: 280,
              }}
            >
              {isEn
                ? "Your store is set up. When buyers place orders for your products, they will appear here."
                : "Votre boutique est prête. Dès que des clients commanderont vos produits, leurs commandes apparaîtront ici."}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {filteredOrders.map((order: any) => {
              const itemTitle = order.lines
                ? order.lines.map((l: any) => l.itemTitle).join(", ")
                : order.items?.map((i: any) => i.itemTitle).join(", ") || "Article de boutique";

              let orderImg = order.image || imgWatchChrono;
              if (itemTitle.toLowerCase().includes("cuir") || itemTitle.toLowerCase().includes("sac")) {
                orderImg = imgLeatherTote;
              } else if (itemTitle.toLowerCase().includes("fauteuil") || itemTitle.toLowerCase().includes("mobilier")) {
                orderImg = imgArmchair;
              }

              const isPreparing = order.fulfillmentStatus === "PREPARING";
              const isDelivered = order.fulfillmentStatus === "DELIVERED";
              const isPending = order.fulfillmentStatus === "PENDING";

              return (
                <View
                  key={order.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 18,
                    padding: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0 : 0.04,
                    shadowRadius: 6,
                    elevation: 1,
                  }}
                >
                  {/* Top Order Row with Thumbnail + ID + Status */}
                  <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                    <Image
                      source={orderImg}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    />

                    <View style={{ flex: 1, justifyContent: "center" }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>
                          #{order.orderNumber}
                        </Text>
                        <View
                          style={{
                            backgroundColor: isDelivered ? colors.successBg : (isPreparing ? "#FEF3C7" : colors.subtle),
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "800",
                              color: isDelivered ? colors.action : (isPreparing ? "#D97706" : colors.text),
                            }}
                          >
                            {isDelivered
                              ? (isEn ? "Delivered" : "Livrée")
                              : (isPreparing
                                  ? (isEn ? "Preparing" : "En préparation")
                                  : (isEn ? "Awaiting" : "En attente"))}
                          </Text>
                        </View>
                      </View>

                      <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                        {order.buyerName} · {order.deliveryAddress}
                      </Text>
                    </View>
                  </View>

                  {/* Creation Title */}
                  <Text
                    style={{
                      fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                      fontSize: 14,
                      color: colors.text,
                      fontWeight: "700",
                      marginBottom: 8,
                    }}
                    numberOfLines={2}
                  >
                    {itemTitle}
                  </Text>

                  {/* Price & Payment Row */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: colors.canvas,
                      padding: 10,
                      borderRadius: 10,
                      marginBottom: 12,
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 10, color: colors.muted }}>
                        {order.paymentChannel === "MTN_MOMO" ? "MTN MoMo" : (order.paymentChannel === "MOOV_MONEY" ? "Moov Money" : "Espèces")}
                      </Text>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: order.paymentStatus === "SETTLED_TO_MERCHANT" ? colors.action : "#D97706" }}>
                        {order.paymentStatus === "SETTLED_TO_MERCHANT" ? (isEn ? "✓ Paid" : "✓ Encaissé") : (isEn ? "Pending" : "En attente")}
                      </Text>
                    </View>

                    <Text style={{ fontSize: 15, fontWeight: "800", color: colors.action }}>
                      {Math.round(order.totalAmountMinor / 100).toLocaleString("fr-FR")} FCFA
                    </Text>
                  </View>

                  {/* Actions depending on fulfillment */}
                  {isPending && (
                    <Pressable
                      style={({ pressed }) => [{
                        backgroundColor: colors.action,
                        paddingVertical: 11,
                        borderRadius: 20,
                        alignItems: "center",
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      }]}
                      onPress={() => updateOrderStatus(order.id, "PREPARING")}
                    >
                      <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>
                        {isEn ? "Start Preparation →" : "Démarrer la préparation →"}
                      </Text>
                    </Pressable>
                  )}

                  {isPreparing && (
                    <Pressable
                      style={({ pressed }) => [{
                        backgroundColor: colors.canvas,
                        borderWidth: 1.5,
                        borderColor: colors.action,
                        paddingVertical: 10,
                        borderRadius: 20,
                        alignItems: "center",
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      }]}
                      onPress={() => updateOrderStatus(order.id, "DELIVERED")}
                    >
                      <Text style={{ color: colors.action, fontWeight: "800", fontSize: 12 }}>
                        {isEn ? "Mark as Delivered ✓" : "Marquer comme Livrée ✓"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

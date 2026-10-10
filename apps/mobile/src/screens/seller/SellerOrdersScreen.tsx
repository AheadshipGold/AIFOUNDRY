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
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesign } from "../../design-system/provider";
import { Icon } from "../../design-system/Icon";
import { SellerApi, OrdersApi, OrderRecord, type AuthUser, resolveMediaUrl } from "../../services/api";

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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await SellerApi.getOrders();
      setOrders(data || []);
    } catch (err) {
      console.warn("Failed to load seller orders, fallback to orders api", err);
      try {
        const targetShopId = currentUser?.activeShop?.id || (currentUser?.shops && currentUser.shops[0]?.id);
        const data = await OrdersApi.getAll(targetShopId);
        setOrders(data || []);
      } catch (e) {
        console.warn("Final fallback failed", e);
      }
    } finally {
      setLoading(false);
    }
  }

  const updateOrderStatus = async (id: string, updates: { fulfillmentStatus?: string; paymentStatus?: string }) => {
    try {
      setUpdatingId(id);
      await OrdersApi.updateStatus(id, updates);
      Alert.alert(
        isEn ? "Success" : "Succès",
        isEn ? "Order status updated" : "Statut de la commande mis à jour"
      );
      await loadOrders();
    } catch (err: any) {
      console.warn("Failed to update status", err);
      Alert.alert(
        isEn ? "Error" : "Erreur",
        err?.message || (isEn ? "Failed to update status" : "Échec de la mise à jour")
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCallBuyer = (phone: string) => {
    const clean = phone.replace(/[^\d+]/g, "");
    if (!clean) return;
    Linking.openURL(`tel:${clean}`).catch(() => {
      Alert.alert(
        isEn ? "Unable to call" : "Appel impossible",
        isEn ? `Cannot dial ${phone}` : `Impossible de composer le ${phone}`
      );
    });
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
            <Icon name="arrow-left" size={16} color={colors.action} />
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
                ? "Your store is set up. When buyers place orders for your creations, they will appear here in real time."
                : "Votre boutique est prête. Dès que des clients commanderont vos créations, leurs commandes apparaîtront ici en temps réel."}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {filteredOrders.map((order: any) => {
              const lines = order.lines || order.items || [];
              const itemTitle = lines.length > 0
                ? lines.map((l: any) => `${l.quantity > 1 ? `${l.quantity}x ` : ''}${l.itemTitle}`).join(", ")
                : "Article de boutique";

              const firstImage = lines[0]?.image;
              let imageSource: any = imgWatchChrono;
              if (firstImage) {
                const resolved = resolveMediaUrl(firstImage);
                if (resolved) {
                  imageSource = { uri: resolved };
                }
              } else if (itemTitle.toLowerCase().includes("cuir") || itemTitle.toLowerCase().includes("sac")) {
                imageSource = imgLeatherTote;
              } else if (itemTitle.toLowerCase().includes("fauteuil") || itemTitle.toLowerCase().includes("mobilier")) {
                imageSource = imgArmchair;
              }

              const isPreparing = order.fulfillmentStatus === "PREPARING";
              const isShipped = order.fulfillmentStatus === "SHIPPED";
              const isDelivered = order.fulfillmentStatus === "DELIVERED";
              const isPending = order.fulfillmentStatus === "PENDING" || !order.fulfillmentStatus;
              const isSettled = order.paymentStatus === "SETTLED_TO_MERCHANT";
              const isUpdating = updatingId === order.id;

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
                      source={imageSource}
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.canvas,
                      }}
                    />

                    <View style={{ flex: 1, justifyContent: "center" }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>
                          #{order.orderNumber}
                        </Text>
                        <View
                          style={{
                            backgroundColor: isDelivered ? colors.successBg : (isShipped ? "#E0E7FF" : isPreparing ? "#FEF3C7" : colors.subtle),
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "800",
                              color: isDelivered ? colors.action : (isShipped ? "#4338CA" : isPreparing ? "#D97706" : colors.text),
                            }}
                          >
                            {isDelivered
                              ? (isEn ? "Delivered" : "Livrée")
                              : isShipped
                              ? (isEn ? "Shipped" : "Expédiée")
                              : isPreparing
                              ? (isEn ? "Preparing" : "En préparation")
                              : (isEn ? "Awaiting" : "En attente")}
                          </Text>
                        </View>
                      </View>

                      <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                        {order.buyerName || "Client"}
                        {order.deliveryAddress ? ` · ${order.deliveryAddress}` : ""}
                      </Text>

                      {order.buyerPhone ? (
                        <View style={{ flexDirection: "row", marginTop: 4 }}>
                          <Pressable
                            onPress={() => handleCallBuyer(order.buyerPhone)}
                            style={({ pressed }) => [{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 5,
                              backgroundColor: colors.canvas,
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: colors.border,
                              opacity: pressed ? 0.7 : 1,
                            }]}
                          >
                            <Icon name="phone" size={11} color={colors.action} />
                            <Text style={{ fontSize: 10, fontWeight: "700", color: colors.action }}>
                              {order.buyerPhone}
                            </Text>
                          </Pressable>
                        </View>
                      ) : null}
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
                        {order.paymentChannel === "MTN_MOMO"
                          ? "MTN MoMo Direct"
                          : order.paymentChannel === "MOOV_MONEY"
                          ? "Moov Money Direct"
                          : order.paymentChannel === "CELTIIS_CASH"
                          ? "Celtiis Cash"
                          : order.paymentChannel === "CARD"
                          ? "Carte Bancaire"
                          : "Espèces à la livraison"}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 }}>
                        <Icon
                          name={isSettled ? "check-circle" : "clock"}
                          size={11}
                          color={isSettled ? colors.action : "#D97706"}
                        />
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: isSettled ? colors.action : "#D97706",
                          }}
                        >
                          {isSettled ? (isEn ? "Paid & Settled" : "Encaissé en caisse") : (isEn ? "Payment Pending" : "En attente d'encaissement")}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 15, fontWeight: "800", color: colors.action }}>
                      {Math.round(order.totalAmountMinor / 100).toLocaleString("fr-FR")} FCFA
                    </Text>
                  </View>

                  {/* Actions Row */}
                  <View style={{ gap: 8 }}>
                    {isUpdating ? (
                      <View style={{ paddingVertical: 8, alignItems: "center" }}>
                        <ActivityIndicator size="small" color={colors.action} />
                      </View>
                    ) : (
                      <>
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
                            onPress={() => updateOrderStatus(order.id, { fulfillmentStatus: "PREPARING" })}
                          >
                            <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>
                              {isEn ? "Start Preparation →" : "Démarrer la préparation →"}
                            </Text>
                          </Pressable>
                        )}

                        {isPreparing && (
                          <Pressable
                            style={({ pressed }) => [{
                              backgroundColor: colors.action,
                              paddingVertical: 11,
                              borderRadius: 20,
                              alignItems: "center",
                              opacity: pressed ? 0.85 : 1,
                              transform: [{ scale: pressed ? 0.97 : 1 }],
                            }]}
                            onPress={() => updateOrderStatus(order.id, { fulfillmentStatus: "SHIPPED" })}
                          >
                            <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>
                              {isEn ? "Mark as Shipped →" : "Expédier la commande →"}
                            </Text>
                          </Pressable>
                        )}

                        {isShipped && (
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
                            onPress={() => updateOrderStatus(order.id, { fulfillmentStatus: "DELIVERED" })}
                          >
                            <Text style={{ color: colors.action, fontWeight: "800", fontSize: 12 }}>
                              {isEn ? "Mark as Delivered ✓" : "Confirmer la livraison client ✓"}
                            </Text>
                          </Pressable>
                        )}

                        {!isSettled && (
                          <Pressable
                            style={({ pressed }) => [{
                              backgroundColor: colors.canvas,
                              borderWidth: 1,
                              borderColor: colors.accent,
                              paddingVertical: 8,
                              borderRadius: 16,
                              alignItems: "center",
                              flexDirection: "row",
                              justifyContent: "center",
                              gap: 6,
                              opacity: pressed ? 0.85 : 1,
                              transform: [{ scale: pressed ? 0.98 : 1 }],
                            }]}
                            onPress={() => updateOrderStatus(order.id, { paymentStatus: "SETTLED_TO_MERCHANT" })}
                          >
                            <Icon name="check" size={13} color={colors.accent} />
                            <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 11 }}>
                              {isEn ? "Confirm Payment Received" : "Encaisser en Livre de Caisse"}
                            </Text>
                          </Pressable>
                        )}
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

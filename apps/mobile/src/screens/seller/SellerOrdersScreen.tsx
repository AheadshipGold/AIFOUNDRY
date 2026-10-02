import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, Pressable, Platform, Alert, ActivityIndicator } from "react-native";
import { useDesign } from "../../design-system/provider";
import { OrdersApi, OrderRecord } from "../../services/api";

interface SellerOrdersScreenProps {
  onBack: () => void;
}

export default function SellerOrdersScreen({ onBack }: SellerOrdersScreenProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === "en";
  const [activeFilter, setActiveFilter] = useState("all");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await OrdersApi.getAll();
      setOrders(data);
    } catch (err) {
      console.warn("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  }

  const updateOrderStatus = async (id: string, fulfillmentStatus: string) => {
    try {
      await OrdersApi.updateStatus(id, { fulfillmentStatus });
      Alert.alert(isEn ? "Success" : "Succès", isEn ? "Order status updated" : "Statut de la commande mis à jour");
      loadOrders();
    } catch (err) {
      console.warn("Failed to update status", err);
      Alert.alert(isEn ? "Error" : "Erreur", isEn ? "Failed to update status" : "Échec de la mise à jour");
    }
  };

  const defaultOrders = [
    {
      id: "mock1",
      orderNumber: "CMD-2847",
      buyerName: "Marcelle Houngbo",
      deliveryAddress: "Porto-Novo",
      items: [{ itemTitle: "Sac de voyage weekend (Cuir pleine fleur patiné)" }],
      totalAmountMinor: 19000000,
      paymentChannel: "MTN_MOMO",
      paymentStatus: "SETTLED_TO_MERCHANT",
      fulfillmentStatus: "PENDING"
    },
    {
      id: "mock2",
      orderNumber: "CMD-2846",
      buyerName: "Didier Agossa",
      deliveryAddress: "Cotonou",
      items: [{ itemTitle: "Parure royale en bronze ciselé" }],
      totalAmountMinor: 28000000,
      paymentChannel: "CARD",
      paymentStatus: "PENDING",
      fulfillmentStatus: "PREPARING"
    },
    {
      id: "mock3",
      orderNumber: "CMD-2840",
      buyerName: "Kodjo Mensah",
      deliveryAddress: "Cotonou",
      items: [{ itemTitle: "Cabas Studio Cuir Cognac" }],
      totalAmountMinor: 4800000,
      paymentChannel: "CASH_ON_DELIVERY",
      paymentStatus: "SETTLED_TO_MERCHANT",
      fulfillmentStatus: "DELIVERED"
    }
  ] as any as OrderRecord[];

  const displayOrders = orders.length > 0 ? orders : defaultOrders;

  const filters = [
    { id: "all", labelFr: `Toutes (${displayOrders.length})`, labelEn: `All (${displayOrders.length})` },
    { id: "prepare", labelFr: `À préparer (${displayOrders.filter(o => o.fulfillmentStatus === 'PENDING').length})`, labelEn: `To Prepare (${displayOrders.filter(o => o.fulfillmentStatus === 'PENDING').length})` },
    { id: "awaiting", labelFr: `Paiement en attente (${displayOrders.filter(o => o.paymentStatus === 'PENDING').length})`, labelEn: `Awaiting Payment (${displayOrders.filter(o => o.paymentStatus === 'PENDING').length})` },
    { id: "fulfilled", labelFr: "Livrées", labelEn: "Fulfilled" },
  ];

  const filteredOrders = displayOrders.filter(o => {
    if (activeFilter === "all") return true;
    if (activeFilter === "prepare") return o.fulfillmentStatus === "PENDING";
    if (activeFilter === "awaiting") return o.paymentStatus === "PENDING";
    if (activeFilter === "fulfilled") return o.fulfillmentStatus === "DELIVERED";
    return true;
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ padding: 24, paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 60 }}>
        {/* Header */}
        <Pressable onPress={onBack} style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.action, fontSize: 16 }}>← {isEn ? "Back" : "Retour"}</Text>
        </Pressable>

        <Text style={{ 
          fontSize: 12, 
          letterSpacing: 1, 
          textTransform: "uppercase", 
          color: colors.muted,
          marginBottom: 8
        }}>
          {isEn ? "MERCHANT ORDERS" : "COMMANDES BOUTIQUE"}
        </Text>

        <Text style={{
          fontSize: 28,
          fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
          color: colors.text,
          marginBottom: 24
        }}>
          {isEn ? "Order Management" : "Gestion des Commandes"}
        </Text>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {filters.map(f => (
            <Pressable 
              key={f.id}
              onPress={() => setActiveFilter(f.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: activeFilter === f.id ? colors.action : colors.border,
                backgroundColor: activeFilter === f.id ? colors.action : "transparent",
                marginRight: 8
              }}
            >
              <Text style={{
                fontSize: 14,
                color: activeFilter === f.id ? colors.canvas : colors.text
              }}>
                {isEn ? f.labelEn : f.labelFr}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.action} />
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {filteredOrders.map(order => (
              <View key={order.id} style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 16
              }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>#{order.orderNumber}</Text>
                  <View style={{ backgroundColor: colors.subtle, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                    <Text style={{ fontSize: 12, color: colors.text }}>
                      {order.fulfillmentStatus}
                    </Text>
                  </View>
                </View>
                
                <Text style={{ fontSize: 14, color: colors.text, marginBottom: 4 }}>
                  {isEn ? `Buyer: ${order.buyerName} · ${order.deliveryAddress}` : `Acheteur : ${order.buyerName} · ${order.deliveryAddress}`}
                </Text>
                <Text style={{ fontSize: 14, color: colors.text, marginBottom: 8 }}>
                  {isEn ? "Item: " : "Article : "}
                  {order.lines ? order.lines.map(l => l.itemTitle).join(", ") : (order as any).items?.map((i: any) => i.itemTitle).join(", ")}
                </Text>
                
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 8 }}>
                  {Math.round(order.totalAmountMinor / 100).toLocaleString("fr-FR")} FCFA
                </Text>

                <View style={{ backgroundColor: colors.canvas, padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, color: colors.text, marginBottom: 4 }}>
                    <Text style={{ fontWeight: "600" }}>{order.paymentChannel}</Text>
                  </Text>
                  <Text style={{ fontSize: 13, color: order.paymentStatus === 'SETTLED_TO_MERCHANT' ? colors.successFg : colors.accent }}>
                    {order.paymentStatus}
                  </Text>
                </View>

                {order.fulfillmentStatus === 'PENDING' && (
                  <Pressable 
                    style={{ backgroundColor: colors.action, padding: 12, borderRadius: 8, alignItems: "center" }}
                    onPress={() => updateOrderStatus(order.id, 'PREPARING')}
                  >
                    <Text style={{ color: colors.canvas, fontWeight: "600", fontSize: 14 }}>
                      {isEn ? "Mark as Preparing →" : "Marquer en préparation →"}
                    </Text>
                  </Pressable>
                )}
                {order.fulfillmentStatus === 'PREPARING' && (
                  <Pressable 
                    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.action, padding: 12, borderRadius: 8, alignItems: "center" }}
                    onPress={() => updateOrderStatus(order.id, 'SHIPPED')}
                  >
                    <Text style={{ color: colors.action, fontWeight: "600", fontSize: 14 }}>
                      {isEn ? "Mark as Shipped →" : "Marquer comme expédiée →"}
                    </Text>
                  </Pressable>
                )}
                {order.fulfillmentStatus === 'SHIPPED' && (
                  <Pressable 
                    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.action, padding: 12, borderRadius: 8, alignItems: "center" }}
                    onPress={() => updateOrderStatus(order.id, 'DELIVERED')}
                  >
                    <Text style={{ color: colors.action, fontWeight: "600", fontSize: 14 }}>
                      {isEn ? "Mark as Delivered →" : "Marquer comme livrée →"}
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

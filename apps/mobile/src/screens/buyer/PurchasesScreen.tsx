import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Alert, ActivityIndicator } from 'react-native';
import { useDesign } from '../../design-system/provider';
import { OrdersApi, OrderRecord } from '../../services/api';

interface PurchasesScreenProps {
  onBack?: () => void;
  onContactSupport?: () => void;
}

export default function PurchasesScreen({ onBack, onContactSupport }: PurchasesScreenProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === 'en';
  const [activeTab, setActiveTab] = useState<'progress' | 'history'>('progress');
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [loading, setLoading] = useState(true);

  const headerFont = Platform.OS === 'android' ? 'serif' : 'Georgia';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await OrdersApi.getAll();
        setOrders(fetchedOrders);
      } catch (err) {
        setOrders(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const renderOrder = (order: OrderRecord) => {
    const amountStr = `${order.totalAmountMinor / 100} XOF`;
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR') : (isEn ? 'Recent' : 'Récemment');
    
    return (
      <View key={order.id} style={{ backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>#{order.id}</Text>
          <Text style={{ fontWeight: '700', color: colors.text }}>{amountStr}</Text>
        </View>
        <Text style={{ fontSize: 16, color: colors.text, marginBottom: 4 }}>{isEn ? 'Custom Order' : 'Commande sur mesure'}</Text>
        <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>{order.buyerName}</Text>

        <View style={{ gap: 12, marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{isEn ? 'Agreement' : 'Accord'}</Text>
            <Text style={{ fontSize: 14, color: colors.muted }}>{isEn ? `Validated on ${dateStr}.` : `Validé le ${dateStr}.`}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{isEn ? 'Payment' : 'Paiement'}</Text>
            <Text style={{ fontSize: 14, color: colors.muted }}>
              {order.paymentChannel === 'MTN_MOMO' ? (isEn ? 'MTN MoMo' : 'Canal MTN MoMo') : (isEn ? 'Cash' : 'Espèces')}
              {' · '}
              {order.paymentStatus === 'PAID' ? (isEn ? 'Confirmed' : 'Encaissé') : (isEn ? 'Pending' : 'En attente')}
              {order.paymentInstructions?.ussdCode ? ` · ${isEn ? 'USSD Code: ' : 'Code USSD : '}${order.paymentInstructions.ussdCode}` : ''}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{isEn ? 'Execution' : 'Exécution'}</Text>
            <Text style={{ fontSize: 14, color: colors.muted }}>
              {order.fulfillmentStatus === 'DELIVERED' ? (isEn ? 'Delivered' : 'Livré') : order.fulfillmentStatus === 'SHIPPED' ? (isEn ? 'Shipped' : 'Expédié') : (isEn ? 'Preparation in progress' : 'En préparation')}
            </Text>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Pressable
            onPress={() => showAlert(isEn ? 'Payment Proof' : 'Preuve de paiement', isEn ? `Transaction ID: ${order.id}\nAmount: ${amountStr}\nStatus: ${order.paymentStatus}` : `ID Transaction: ${order.id}\nMontant: ${amountStr}\nStatut: ${order.paymentStatus}`)}
            style={{ padding: 12, borderRadius: 8, backgroundColor: colors.canvas, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
          >
            <Text style={{ color: colors.text, fontWeight: '600' }}>{isEn ? 'Payment Proof' : 'Preuve de paiement'}</Text>
          </Pressable>
          <Pressable
            onPress={() => showAlert(isEn ? 'Contact' : 'Contact', isEn ? 'Opening chat...' : 'Ouverture du chat...')}
            style={{ padding: 12, borderRadius: 8, backgroundColor: colors.canvas, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
          >
            <Text style={{ color: colors.text, fontWeight: '600' }}>{isEn ? 'Contact Workshop' : "Contacter l'atelier"}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* Header Area */}
      <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {onBack && (
          <Pressable onPress={onBack} style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.action }}>{isEn ? '← Back' : '← Retour'}</Text>
          </Pressable>
        )}
        <Text style={{ fontFamily: headerFont, fontSize: 24, fontWeight: '700', color: colors.text }}>
          {isEn ? 'My Orders & Tracking' : 'Mes Achats & Suivi'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', padding: 16, gap: 12 }}>
        <Pressable
          onPress={() => setActiveTab('progress')}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: activeTab === 'progress' ? colors.action : colors.surface,
            borderWidth: 1,
            borderColor: activeTab === 'progress' ? colors.action : colors.border,
          }}
        >
          <Text style={{ color: activeTab === 'progress' ? '#FFFFFF' : colors.text, fontWeight: '600' }}>
            {isEn ? `In Progress (${orders ? orders.length : 2})` : `En cours (${orders ? orders.length : 2})`}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('history')}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: activeTab === 'history' ? colors.action : colors.surface,
            borderWidth: 1,
            borderColor: activeTab === 'history' ? colors.action : colors.border,
          }}
        >
          <Text style={{ color: activeTab === 'history' ? '#FFFFFF' : colors.text, fontWeight: '600' }}>
            {isEn ? 'History' : 'Historique'}
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.action} />
        ) : activeTab === 'history' ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
            <Text style={{ color: colors.muted, fontSize: 16 }}>
              {isEn ? 'No past orders yet.' : 'Aucun historique pour le moment.'}
            </Text>
          </View>
        ) : (
          <>
            {orders && orders.length > 0 ? (
              orders.map(renderOrder)
            ) : (
              <>
                {/* Fallback Mock Data */}
                {/* Order 1 */}
                <View style={{ backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>#CMD-2847</Text>
                    <Text style={{ fontWeight: '700', color: colors.text }}>48 000 FCFA</Text>
                  </View>
                  <Text style={{ fontSize: 16, color: colors.text, marginBottom: 4 }}>Cabas Studio en Cuir</Text>
                  <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>Maison Laurent</Text>

                  <View style={{ gap: 12, marginBottom: 16 }}>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{isEn ? 'Agreement' : 'Accord'}</Text>
                      <Text style={{ fontSize: 14, color: colors.muted }}>{isEn ? 'Quote validated on Sept 28.' : 'Devis validé le 28 sept.'}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{isEn ? 'Payment' : 'Paiement'}</Text>
                      <Text style={{ fontSize: 14, color: colors.muted }}>{isEn ? 'Received via MTN MoMo (100%)' : 'Encaissé direct MTN MoMo (100%)'}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{isEn ? 'Execution' : 'Exécution'}</Text>
                      <Text style={{ fontSize: 14, color: colors.muted }}>{isEn ? 'Making complete · Handover in progress in Cotonou' : 'Confection terminée · Remise en cours à Cotonou'}</Text>
                    </View>
                  </View>

                  <View style={{ gap: 8 }}>
                    <Pressable
                      onPress={() => showAlert(isEn ? 'Payment Proof' : 'Preuve de paiement', isEn ? 'Transaction ID: 89437984\nAmount: 48,000 FCFA\nStatus: Success' : 'ID Transaction: 89437984\nMontant: 48 000 FCFA\nStatut: Succès')}
                      style={{ padding: 12, borderRadius: 8, backgroundColor: colors.canvas, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
                    >
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{isEn ? 'Payment Proof' : 'Preuve de paiement'}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => showAlert(isEn ? 'Contact' : 'Contact', isEn ? 'Opening chat with Maison Laurent...' : 'Ouverture du chat avec Maison Laurent...')}
                      style={{ padding: 12, borderRadius: 8, backgroundColor: colors.canvas, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
                    >
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{isEn ? 'Contact Workshop' : "Contacter l'atelier"}</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Order 2 */}
                <View style={{ backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>#CMD-2846</Text>
                    <Text style={{ fontWeight: '700', color: colors.text }}>280 000 FCFA</Text>
                  </View>
                  <Text style={{ fontSize: 16, color: colors.text, marginBottom: 4 }}>Parure royale en bronze ciselé</Text>
                  <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>{isEn ? "Abomey's Workshop" : "Atelier d'Abomey"}</Text>

                  <View style={{ gap: 12, marginBottom: 16 }}>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{isEn ? 'Agreement' : 'Accord'}</Text>
                      <Text style={{ fontSize: 14, color: colors.muted }}>{isEn ? 'Quote accepted on Sept 29.' : 'Devis accepté le 29 sept.'}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{isEn ? 'Payment' : 'Paiement'}</Text>
                      <Text style={{ fontSize: 14, color: colors.muted }}>{isEn ? '100,000 FCFA deposit confirmed by merchant · Balance upon handover' : 'Acompte 100 000 FCFA confirmé marchand · Solde à la remise'}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{isEn ? 'Execution' : 'Exécution'}</Text>
                      <Text style={{ fontSize: 14, color: colors.muted }}>{isEn ? 'Casting and chiseling in progress at the workshop' : "En cours de fonte et ciselage à l'atelier"}</Text>
                    </View>
                  </View>

                  <View style={{ gap: 8 }}>
                    <Pressable
                      onPress={() => showAlert(isEn ? 'Payment Proof' : 'Preuve de paiement', isEn ? 'Transaction ID: 89437985\nAmount: 100,000 FCFA\nStatus: Success' : 'ID Transaction: 89437985\nMontant: 100 000 FCFA\nStatut: Succès')}
                      style={{ padding: 12, borderRadius: 8, backgroundColor: colors.canvas, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
                    >
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{isEn ? 'Payment Proof' : 'Preuve de paiement'}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => showAlert(isEn ? 'Contact' : 'Contact', isEn ? "Opening chat with Abomey's Workshop..." : "Ouverture du chat avec Atelier d'Abomey...")}
                      style={{ padding: 12, borderRadius: 8, backgroundColor: colors.canvas, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
                    >
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{isEn ? 'Contact Workshop' : "Contacter l'atelier"}</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}

            <Pressable
              onPress={onContactSupport}
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 12,
                backgroundColor: colors.action,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>
                {isEn ? 'Need Help?' : "Besoin d'aide"}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

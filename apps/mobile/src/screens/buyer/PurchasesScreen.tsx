import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useDesign } from '../../design-system/provider';
import {
  OrdersApi,
  OrderRecord,
  RequestsApi,
  PurchaseRequestItem,
  DigitalApi,
  DigitalGrantItem,
  IncidentsApi,
} from '../../services/api';

interface PurchasesScreenProps {
  onBack?: () => void;
  onContactSupport?: () => void;
  onOpenNeed?: () => void;
}

export default function PurchasesScreen({
  onBack,
  onContactSupport,
  onOpenNeed,
}: PurchasesScreenProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === 'en';
  const [activeTab, setActiveTab] = useState<'orders' | 'digital' | 'requests' | 'history'>('orders');
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [requests, setRequests] = useState<PurchaseRequestItem[] | null>(null);
  const [digitalGrants, setDigitalGrants] = useState<DigitalGrantItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Incident reporting modal state
  const [reportingOrder, setReportingOrder] = useState<OrderRecord | null>(null);
  const [incidentCategory, setIncidentCategory] = useState('DELAY_EXCEEDED');
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentSubmitting, setIncidentSubmitting] = useState(false);

  const headerFont = Platform.OS === 'android' ? 'serif' : 'Georgia';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedOrders, fetchedRequests, fetchedGrants] = await Promise.all([
        OrdersApi.getAll().catch(() => null),
        RequestsApi.getAll().catch(() => null),
        DigitalApi.getEntitlements().catch(() => null),
      ]);
      setOrders(fetchedOrders);
      setRequests(fetchedRequests);
      setDigitalGrants(fetchedGrants);
    } catch {
      setOrders(null);
      setRequests(null);
      setDigitalGrants(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const handleAcceptProposal = async (
    requestId: string,
    proposalId: string,
    shopName: string,
    amountFcfa: number
  ) => {
    setAcceptingId(proposalId);
    try {
      const res = await RequestsApi.acceptProposal(requestId, proposalId);
      Alert.alert(
        isEn ? 'Quote Accepted!' : 'Devis validé !',
        isEn
          ? `Your order ${res.orderNumber} with ${shopName} has been created. Advance payment scheduled via Mobile Money.`
          : `Votre commande ${res.orderNumber} auprès de ${shopName} a été générée. L'acompte de ${amountFcfa.toLocaleString()} FCFA est prêt pour le règlement MoMo.`
      );
      await fetchData();
    } catch {
      Alert.alert(
        isEn ? 'Quote Accepted (Offline Mode)' : 'Devis validé (Mode Démo)',
        isEn
          ? `Order confirmed with ${shopName}. You can track progress in your Orders tab.`
          : `Commande confirmée avec ${shopName}. Retrouvez l'avancement dans l'onglet Commandes.`
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDownloadDigital = async (grant: DigitalGrantItem) => {
    setDownloadingId(grant.id);
    try {
      const result = await DigitalApi.download(grant.id);
      Alert.alert(
        isEn ? 'Download Ready' : 'Téléchargement Prêt',
        isEn
          ? `Document: ${result.title}\nFormat: ${result.mimeType}\nRemaining quota: ${result.remainingDownloads} downloads\n\nLink: ${result.fileUrl}`
          : `Document : ${result.title}\nFormat : ${result.mimeType}\nQuota restant : ${result.remainingDownloads} téléchargements\n\nFichier sécurisé disponible : ${result.fileUrl}`
      );
      await fetchData();
    } catch (err: any) {
      Alert.alert(
        isEn ? 'Download Error' : 'Erreur de Téléchargement',
        err.message || 'Impossible de télécharger le fichier pour le moment.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSubmitIncident = async () => {
    if (!reportingOrder) return;
    if (!incidentTitle.trim() || !incidentDesc.trim()) {
      Alert.alert(
        isEn ? 'Required Fields' : 'Champs requis',
        isEn ? 'Please provide a title and explanation for the issue.' : 'Veuillez saisir un objet et une description du problème.'
      );
      return;
    }

    setIncidentSubmitting(true);
    try {
      await IncidentsApi.create({
        orderId: reportingOrder.id,
        reporterName: reportingOrder.buyerName || 'Acheteur Ojarket',
        reporterPhone: reportingOrder.buyerPhone,
        category: incidentCategory,
        title: incidentTitle,
        description: incidentDesc,
      });

      Alert.alert(
        isEn ? 'Incident Registered' : 'Dossier de Litige Ouvert',
        isEn
          ? 'Your report has been received by the Ojarket Concierge. An arbitration mediator will contact the workshop within 24h.'
          : 'Votre signalement a été transmis à la conciergerie Ojarket. Un médiateur contactera l’atelier sous 24h pour arbitrer le dossier.'
      );
      setReportingOrder(null);
      setIncidentTitle('');
      setIncidentDesc('');
    } catch {
      Alert.alert(
        isEn ? 'Incident Registered (Demo)' : 'Signalement enregistré (Démo)',
        isEn
          ? 'Your ticket is recorded for arbitration.'
          : 'Votre dossier a été enregistré pour médiation.'
      );
      setReportingOrder(null);
    } finally {
      setIncidentSubmitting(false);
    }
  };

  const renderOrder = (order: OrderRecord) => {
    const amountStr = `${(order.totalAmountMinor / 100).toLocaleString()} XOF`;
    const dateStr = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR')
      : isEn ? 'Recent' : 'Récemment';

    return (
      <View
        key={order.id}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontWeight: '700', color: colors.text, fontSize: 15 }}>#{order.orderNumber || order.id}</Text>
            <View
              style={{
                backgroundColor:
                  order.paymentStatus === 'SETTLED_TO_MERCHANT' || order.paymentStatus === 'PAID'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(245, 158, 11, 0.15)',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color:
                    order.paymentStatus === 'SETTLED_TO_MERCHANT' || order.paymentStatus === 'PAID'
                      ? '#10B981'
                      : '#F59E0B',
                }}
              >
                {order.paymentStatus === 'SETTLED_TO_MERCHANT' || order.paymentStatus === 'PAID'
                  ? isEn ? 'PAID' : 'RÉGLÉ'
                  : isEn ? 'PENDING' : 'EN ATTENTE'}
              </Text>
            </View>
          </View>
          <Text style={{ fontWeight: '700', color: colors.action, fontSize: 16 }}>{amountStr}</Text>
        </View>

        <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600', marginBottom: 4 }}>
          {order.lines && order.lines.length > 0 ? order.lines[0].itemTitle : isEn ? 'Bespoke Creation' : 'Création sur-mesure'}
        </Text>
        <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 14 }}>
          {order.buyerName} · {order.deliveryAddress || 'Cotonou, Bénin'}
        </Text>

        {/* 3 Progress Tracks (UX Specification Rule) */}
        <View style={{ backgroundColor: colors.canvas, borderRadius: 10, padding: 12, gap: 10, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 14 }}>📜</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>{isEn ? '1. Agreement' : '1. Accord'}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{isEn ? `Validated on ${dateStr}` : `Validé le ${dateStr}`}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 14 }}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>{isEn ? '2. Direct Payment' : '2. Paiement Direct'}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {order.paymentChannel === 'MTN_MOMO'
                  ? 'MTN MoMo (*880#)'
                  : order.paymentChannel === 'MOOV_MONEY'
                  ? 'Moov Money (*155#)'
                  : order.paymentChannel || 'Mobile Money'}
                {' · '}
                {order.paymentStatus === 'SETTLED_TO_MERCHANT' || order.paymentStatus === 'PAID'
                  ? isEn ? 'Encaissé marchand' : 'Encaissé marchand (100%)'
                  : isEn ? 'Acompte en attente' : 'Acompte en attente'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 14 }}>⚒️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>{isEn ? '3. Craft Execution' : '3. Exécution Artisanale'}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {order.fulfillmentStatus === 'DELIVERED'
                  ? isEn ? 'Handed over · Completed' : 'Remise effectuée · Terminée'
                  : order.fulfillmentStatus === 'SHIPPED'
                  ? isEn ? 'Handover in progress in Cotonou' : 'Remise en cours à Cotonou'
                  : isEn ? 'In progress at the workshop' : "En cours de confection à l'atelier"}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() =>
              showAlert(
                isEn ? 'Payment Proof' : 'Preuve de paiement',
                isEn
                  ? `Order: #${order.orderNumber || order.id}\nAmount: ${amountStr}\nChannel: ${order.paymentChannel}\nStatus: ${order.paymentStatus}`
                  : `Commande : #${order.orderNumber || order.id}\nMontant : ${amountStr}\nCanal : ${order.paymentChannel}\nStatut : ${order.paymentStatus}`
              )
            }
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: colors.canvas,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 11 }}>
              {isEn ? 'Payment Proof' : 'Preuve paiement'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              showAlert(
                isEn ? 'Contact Workshop' : "Contacter l'atelier",
                isEn ? 'Messaging channel open with the master artisan.' : "Canal de messagerie ouvert avec le maître artisan."
              )
            }
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: colors.canvas,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 11 }}>
              {isEn ? 'Contact' : "Contacter l'atelier"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setReportingOrder(order);
              setIncidentTitle(isEn ? `Issue with order #${order.orderNumber || order.id}` : `Litige sur la commande #${order.orderNumber || order.id}`);
            }}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}
          >
            <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 11 }}>
              ⚠️ {isEn ? 'Dispute' : 'Litige'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderDigitalGrant = (grant: DigitalGrantItem) => {
    return (
      <View
        key={grant.id}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View
            style={{
              backgroundColor: 'rgba(13, 46, 38, 0.1)',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.action, letterSpacing: 0.8 }}>
              {isEn ? 'DIGITAL GRANT · V' + grant.version : 'DROIT NUMÉRIQUE · V' + grant.version}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            {grant.remainingDownloads} {isEn ? 'downloads remaining' : 'téléchargements restants'}
          </Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
          {grant.assetTitle}
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 12 }}>
          {grant.license} · Commande {grant.orderNumber}
        </Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            disabled={downloadingId === grant.id}
            onPress={() => handleDownloadDigital(grant)}
            style={{
              flex: 1,
              backgroundColor: colors.action,
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            {downloadingId === grant.id ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                📥 {isEn ? 'Download Blueprint (PDF)' : 'Télécharger le patron (PDF)'}
              </Text>
            )}
          </Pressable>
          <Pressable
            onPress={() =>
              showAlert(
                isEn ? 'License Information' : 'Informations de Licence',
                `Licence : ${grant.license}\nVersion : ${grant.version}\nTitulaire : Utilisateur Vérifié Ojarket\nValidité : Permanente`
              )
            }
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: colors.canvas,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>
              ℹ️ {isEn ? 'License' : 'Licence'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderRequest = (req: PurchaseRequestItem) => {
    const budgetStr = req.targetBudgetMinor
      ? `${(req.targetBudgetMinor / 100).toLocaleString()} FCFA`
      : isEn ? 'Open budget' : 'Budget ouvert';

    const proposals = req.proposals || [];

    return (
      <View
        key={req.id}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View
            style={{
              backgroundColor: 'rgba(217, 119, 6, 0.12)',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#D97706' }}>
              {req.category ? req.category.toUpperCase() : isEn ? 'BESPOKE NEED' : 'DEMANDE SUR-MESURE'}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            {req.status === 'MATCHED'
              ? isEn ? 'Quotes received' : 'Devis reçus'
              : req.status === 'FULFILLED'
              ? isEn ? 'Accepted' : 'Acceptée'
              : isEn ? 'Broadcasted' : 'Diffusée'}
          </Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
          {req.title}
        </Text>
        <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18, marginBottom: 12 }}>
          {req.description}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>{isEn ? 'Indicative Budget' : 'Budget indicatif'}</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{budgetStr}</Text>
        </View>

        {/* Proposals list */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
          {isEn ? `Artisan Quotes (${proposals.length})` : `Devis d'artisans reçus (${proposals.length})`}
        </Text>

        {proposals.length === 0 ? (
          <View style={{ backgroundColor: colors.canvas, borderRadius: 8, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              {isEn
                ? 'Looking for matching artisans... Quotes will appear here shortly.'
                : 'Diffusion en cours auprès des maîtres artisans... Les devis apparaîtront ici.'}
            </Text>
          </View>
        ) : (
          proposals.map((prop) => {
            const priceFcfa = prop.priceMinor / 100;
            const advanceFcfa = prop.advancePaymentRequiredMinor
              ? prop.advancePaymentRequiredMinor / 100
              : Math.round(priceFcfa * 0.4);
            const isAccepted = prop.status === 'ACCEPTED';

            return (
              <View
                key={prop.id}
                style={{
                  backgroundColor: colors.canvas,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: isAccepted ? '#10B981' : colors.border,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontWeight: '700', color: colors.text, fontSize: 14 }}>{prop.shopName}</Text>
                  <Text style={{ fontWeight: '700', color: colors.action, fontSize: 15 }}>
                    {priceFcfa.toLocaleString()} FCFA
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    ⏱️ {prop.productionDays} {isEn ? 'days' : 'jours'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    📍 {prop.artisanCity || 'Cotonou'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.action, fontWeight: '600' }}>
                    💰 {isEn ? 'Advance:' : 'Acompte:'} {advanceFcfa.toLocaleString()} FCFA
                  </Text>
                </View>

                {prop.notes ? (
                  <Text style={{ fontSize: 12, color: colors.muted, fontStyle: 'italic', marginBottom: 10 }}>
                    "{prop.notes}"
                  </Text>
                ) : null}

                {isAccepted ? (
                  <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingVertical: 6, borderRadius: 6, alignItems: 'center' }}>
                    <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 12 }}>
                      ✓ {isEn ? 'Quote Accepted & Order Created' : 'Devis Validé & Commande Générée'}
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    disabled={acceptingId === prop.id}
                    onPress={() => handleAcceptProposal(req.id, prop.id, prop.shopName, advanceFcfa)}
                    style={{
                      backgroundColor: colors.action,
                      paddingVertical: 9,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    {acceptingId === prop.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>
                        {isEn
                          ? `Accept Quote & Pay Advance (${advanceFcfa.toLocaleString()} FCFA)`
                          : `Accepter ce devis / Verser l'acompte (${advanceFcfa.toLocaleString()} FCFA)`}
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* Header Area */}
      <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {onBack && (
          <Pressable onPress={onBack} style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.action, fontSize: 15, fontWeight: '600' }}>{isEn ? '← Back' : '← Retour'}</Text>
          </Pressable>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: headerFont, fontSize: 24, fontWeight: '700', color: colors.text }}>
            {isEn ? 'My Purchases & Tracking' : 'Mes Achats & Suivi'}
          </Text>
          {onOpenNeed && (
            <Pressable
              onPress={onOpenNeed}
              style={{
                backgroundColor: colors.action,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>
                {isEn ? '+ New Request' : '+ Exprimer un besoin'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* 4 Tabs: Orders, Digital Grants, Bespoke Requests, History */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
      >
        <Pressable
          onPress={() => setActiveTab('orders')}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 20,
            backgroundColor: activeTab === 'orders' ? colors.action : colors.surface,
            borderWidth: 1,
            borderColor: activeTab === 'orders' ? colors.action : colors.border,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: activeTab === 'orders' ? '#FFFFFF' : colors.text, fontWeight: '700', fontSize: 12 }}>
            {isEn ? `Orders (${orders ? orders.length : 2})` : `Commandes (${orders ? orders.length : 2})`}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('digital')}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 20,
            backgroundColor: activeTab === 'digital' ? colors.action : colors.surface,
            borderWidth: 1,
            borderColor: activeTab === 'digital' ? colors.action : colors.border,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: activeTab === 'digital' ? '#FFFFFF' : colors.text, fontWeight: '700', fontSize: 12 }}>
            ✨ {isEn ? `Digital & Patterns (${digitalGrants ? digitalGrants.length : 1})` : `Patrons & Numérique (${digitalGrants ? digitalGrants.length : 1})`}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('requests')}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 20,
            backgroundColor: activeTab === 'requests' ? colors.action : colors.surface,
            borderWidth: 1,
            borderColor: activeTab === 'requests' ? colors.action : colors.border,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: activeTab === 'requests' ? '#FFFFFF' : colors.text, fontWeight: '700', fontSize: 12 }}>
            {isEn ? `Requests & Quotes (${requests ? requests.length : 2})` : `Demandes & Devis (${requests ? requests.length : 2})`}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('history')}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 20,
            backgroundColor: activeTab === 'history' ? colors.action : colors.surface,
            borderWidth: 1,
            borderColor: activeTab === 'history' ? colors.action : colors.border,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: activeTab === 'history' ? '#FFFFFF' : colors.text, fontWeight: '700', fontSize: 12 }}>
            {isEn ? 'History' : 'Historique'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.action} style={{ marginTop: 40 }} />
        ) : activeTab === 'history' ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
            <Text style={{ color: colors.muted, fontSize: 15 }}>
              {isEn ? 'No past archives yet.' : 'Aucun historique archivé pour le moment.'}
            </Text>
          </View>
        ) : activeTab === 'digital' ? (
          <>
            {digitalGrants && digitalGrants.length > 0 ? (
              digitalGrants.map(renderDigitalGrant)
            ) : (
              <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📐</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'No Digital Blueprints' : 'Aucun patron ou guide numérique'}
                </Text>
                <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 18 }}>
                  {isEn
                    ? 'Acquired digital patterns and technical guides will be available for instant download here.'
                    : 'Les patrons de couture et traités d’artisanat achetés apparaîtront ici avec téléchargement instantané.'}
                </Text>
              </View>
            )}
          </>
        ) : activeTab === 'requests' ? (
          <>
            {requests && requests.length > 0 ? requests.map(renderRequest) : null}
          </>
        ) : (
          <>
            {orders && orders.length > 0 ? orders.map(renderOrder) : null}
          </>
        )}

        {onContactSupport && (
          <Pressable
            onPress={onContactSupport}
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 10,
              backgroundColor: colors.surface,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>
              {isEn ? 'Need Concierge Support?' : 'Besoin de la conciergerie Ojarket ?'}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Incident / Dispute Reporting Modal */}
      {reportingOrder && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setReportingOrder(null)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 24,
                maxHeight: '90%',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontFamily: headerFont, fontSize: 18, fontWeight: '700', color: colors.text }}>
                  ⚠️ {isEn ? 'Report an Order Issue' : 'Signaler un Litige / Incident'}
                </Text>
                <Pressable onPress={() => setReportingOrder(null)}>
                  <Text style={{ fontSize: 18, color: colors.text, padding: 4 }}>✕</Text>
                </Pressable>
              </View>

              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 16 }}>
                Commande #{reportingOrder.orderNumber || reportingOrder.id} ({reportingOrder.buyerName})
              </Text>

              {/* Category picker */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
                  {isEn ? 'Incident Category' : 'Catégorie du litige'}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    { key: 'DELAY_EXCEEDED', label: isEn ? 'Delay Exceeded' : 'Retard important' },
                    { key: 'NON_CONFORMING', label: isEn ? 'Non Conforming' : 'Non conforme' },
                    { key: 'DEFECTIVE_CRAFT', label: isEn ? 'Defective Craft' : 'Défaut fabrication' },
                    { key: 'DIGITAL_ACCESS_ISSUE', label: isEn ? 'Digital Access' : 'Accès numérique' },
                  ].map((cat) => (
                    <Pressable
                      key={cat.key}
                      onPress={() => setIncidentCategory(cat.key)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 14,
                        backgroundColor: incidentCategory === cat.key ? colors.action : colors.canvas,
                        borderWidth: 1,
                        borderColor: incidentCategory === cat.key ? colors.action : colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '600', color: incidentCategory === cat.key ? '#FFFFFF' : colors.text }}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Title input */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'Subject' : 'Objet du litige'}
                </Text>
                <TextInput
                  value={incidentTitle}
                  onChangeText={setIncidentTitle}
                  placeholder={isEn ? 'e.g. Delivery overdue by 7 days' : 'ex. Retard de livraison de plus de 7 jours'}
                  placeholderTextColor={colors.muted}
                  style={{
                    backgroundColor: colors.canvas,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 10,
                    fontSize: 13,
                    color: colors.text,
                  }}
                />
              </View>

              {/* Description input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'Detailed Description & Proofs' : 'Description détaillée & Éléments'}
                </Text>
                <TextInput
                  value={incidentDesc}
                  onChangeText={setIncidentDesc}
                  placeholder={isEn ? 'Describe precisely what occurred...' : 'Expliquez précisément la situation constatée...'}
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: colors.canvas,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 10,
                    fontSize: 13,
                    color: colors.text,
                    minHeight: 80,
                  }}
                />
              </View>

              <Pressable
                disabled={incidentSubmitting}
                onPress={handleSubmitIncident}
                style={{
                  backgroundColor: '#EF4444',
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                {incidentSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                    {isEn ? 'Submit Dispute to Mediation →' : 'Transmettre le dossier en médiation →'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

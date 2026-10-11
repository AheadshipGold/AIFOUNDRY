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
  StatusBar,
  Linking,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesign } from '../../design-system/provider';
import { Icon } from '../../design-system/Icon';
import {
  OrdersApi,
  OrderRecord,
  RequestsApi,
  PurchaseRequestItem,
  DigitalApi,
  DigitalGrantItem,
  IncidentsApi,
  ReviewsApi,
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
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0);
  const { colors, locale } = useDesign();
  const isEn = locale === 'en';
  const [activeTab, setActiveTab] = useState<'orders' | 'digital' | 'requests' | 'history'>('orders');
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [requests, setRequests] = useState<PurchaseRequestItem[] | null>(null);
  const [digitalGrants, setDigitalGrants] = useState<DigitalGrantItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Review modal state (Verified Purchase)
  const [reviewOrder, setReviewOrder] = useState<OrderRecord | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const handleOpenReview = (order: OrderRecord) => {
    setReviewOrder(order);
    setReviewRating(5);
    setReviewTitle('');
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!reviewOrder) return;
    const prodId = reviewOrder.lines && reviewOrder.lines.length > 0 ? reviewOrder.lines[0].productId : null;
    if (!prodId) {
      Alert.alert(isEn ? 'Error' : 'Erreur', isEn ? 'Product identifier not found on order line.' : 'Identifiant produit introuvable sur cette commande.');
      return;
    }

    setSubmittingReview(true);
    try {
      await ReviewsApi.createReview({
        productId: prodId,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim() || undefined,
      });

      Alert.alert(
        isEn ? 'Review Published!' : 'Avis Vérifié Publié !',
        isEn ? 'Thank you. Your verified review has been recorded with prestige standards.' : 'Merci. Votre avis d\'achat vérifié est désormais visible sur la fiche de l\'artisan.'
      );
      setReviewOrder(null);
    } catch (err: any) {
      Alert.alert(
        isEn ? 'Review Submission' : 'Dépôt d\'avis',
        err.message || (isEn ? 'Could not post review' : 'Impossible de déposer l\'avis pour le moment.')
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // Incident reporting modal state
  const [reportingOrder, setReportingOrder] = useState<OrderRecord | null>(null);
  const [incidentCategory, setIncidentCategory] = useState('DELAY_EXCEEDED');
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentSubmitting, setIncidentSubmitting] = useState(false);

  // Payment proof modal state
  const [proofOrder, setProofOrder] = useState<OrderRecord | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

  const handleContactShop = (order: OrderRecord) => {
    const rawPhone = order.paymentInstructions?.merchantAccount || "+22997000000";
    const shopName = order.paymentInstructions?.merchantName || "Kingston Bio";
    const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
    const phoneDigits = cleanPhone.replace(/[^\d]/g, '');
    const phoneForWa = phoneDigits.startsWith('229') ? phoneDigits : `229${phoneDigits.slice(-8)}`;
    const msg = encodeURIComponent(
      isEn
        ? `Hello ${shopName}, I am contacting you regarding my Ojarket order #${order.orderNumber || order.id}.`
        : `Bonjour ${shopName}, je vous contacte concernant ma commande Ojarket #${order.orderNumber || order.id}.`
    );
    const waUrl = `https://wa.me/${phoneForWa}?text=${msg}`;
    const telUrl = `tel:${cleanPhone}`;

    Linking.openURL(waUrl).catch(() => {
      Linking.openURL(telUrl).catch(() => {
        Alert.alert(
          isEn ? "Store Contact" : "Contact Boutique",
          `${shopName} : ${rawPhone}`
        );
      });
    });
  };

  const handleDeclarePayment = async () => {
    if (!proofOrder) return;
    if (!transactionRef.trim()) {
      Alert.alert(
        isEn ? "Reference Required" : "Référence Requise",
        isEn
          ? "Please enter your Mobile Money transaction ID or SMS reference."
          : "Veuillez entrer la référence de votre transaction Mobile Money (reçue par SMS)."
      );
      return;
    }

    setSubmittingProof(true);
    try {
      await OrdersApi.declarePayment(proofOrder.id, {
        transactionRef: transactionRef.trim(),
        notes: proofNotes.trim() || undefined,
      });

      Alert.alert(
        isEn ? "Payment Proof Transmitted!" : "Preuve Transmise !",
        isEn
          ? "Your payment proof has been forwarded to the boutique. The merchant will confirm receipt."
          : "Votre preuve de règlement a été transmise à la boutique. Le commerçant va valider l'encaissement."
      );

      setProofOrder(null);
      setTransactionRef('');
      setProofNotes('');
      await fetchData();
    } catch (err: any) {
      Alert.alert(
        isEn ? "Error" : "Erreur",
        err?.message || (isEn ? "Could not submit payment proof" : "Impossible d'enregistrer la déclaration pour le moment.")
      );
    } finally {
      setSubmittingProof(false);
    }
  };

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

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
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
    } catch (err: any) {
      Alert.alert(
        isEn ? 'Acceptance Failed' : 'Échec de validation',
        err?.message || (isEn ? 'Could not accept proposal' : 'Impossible de valider ce devis pour le moment.')
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
          ? 'Your report has been received by the Ojarket Concierge. An arbitration mediator will contact the store within 24h.'
          : 'Votre signalement a été transmis à la conciergerie Ojarket. Un médiateur contactera la boutique sous 24h pour arbitrer le dossier.'
      );
      setReportingOrder(null);
      setIncidentTitle('');
      setIncidentDesc('');
    } catch (err: any) {
      Alert.alert(
        isEn ? 'Incident Reporting Failed' : 'Échec du signalement',
        err?.message || (isEn ? 'Your ticket could not be transmitted for arbitration.' : 'Votre dossier n\'a pas pu être transmis pour le moment.')
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
                  order.paymentStatus === 'SETTLED_TO_MERCHANT' || order.paymentStatus === 'PAID' || order.paymentStatus === 'CONFIRMED'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : order.paymentStatus === 'DECLARED'
                    ? 'rgba(196, 154, 69, 0.15)'
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
                    order.paymentStatus === 'SETTLED_TO_MERCHANT' || order.paymentStatus === 'PAID' || order.paymentStatus === 'CONFIRMED'
                      ? '#10B981'
                      : order.paymentStatus === 'DECLARED'
                      ? '#C49A45'
                      : '#F59E0B',
                }}
              >
                {order.paymentStatus === 'SETTLED_TO_MERCHANT' || order.paymentStatus === 'PAID' || order.paymentStatus === 'CONFIRMED'
                  ? isEn ? 'PAID' : 'RÉGLÉ'
                  : order.paymentStatus === 'DECLARED'
                  ? isEn ? 'DECLARED' : 'DÉCLARÉ'
                  : isEn ? 'PENDING' : 'EN ATTENTE'}
              </Text>
            </View>
          </View>
          <Text style={{ fontWeight: '700', color: colors.action, fontSize: 16 }}>{amountStr}</Text>
        </View>

        <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600', marginBottom: 4 }}>
          {order.lines && order.lines.length > 0 ? order.lines[0].itemTitle : isEn ? 'Commercial Product' : 'Article de boutique'}
        </Text>
        <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 14 }}>
          {order.buyerName} · {order.deliveryAddress || 'Cotonou, Bénin'}
        </Text>

        {/* 3 Progress Tracks (UX Specification Rule) */}
        <View style={{ backgroundColor: colors.canvas, borderRadius: 10, padding: 12, gap: 10, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="invoice" size={14} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>{isEn ? '1. Agreement' : '1. Accord'}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{isEn ? `Validated on ${dateStr}` : `Validé le ${dateStr}`}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="card" size={14} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>{isEn ? '2. Direct Payment' : '2. Paiement Direct'}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {order.paymentChannel === 'MTN_MOMO'
                  ? 'MTN MoMo (*880#)'
                  : order.paymentChannel === 'MOOV_MONEY'
                  ? 'Moov Money (*155#)'
                  : order.paymentChannel || 'Mobile Money'}
                {' · '}
                {order.paymentStatus === 'SETTLED_TO_MERCHANT' || order.paymentStatus === 'PAID' || order.paymentStatus === 'CONFIRMED'
                  ? isEn ? 'Encaissé marchand' : 'Encaissé marchand (100%)'
                  : order.paymentStatus === 'DECLARED'
                  ? isEn ? 'Preuve déclarée' : 'Preuve déclarée · En attente encaissement'
                  : isEn ? 'Acompte en attente' : 'Acompte en attente'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="package" size={14} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>{isEn ? '3. Preparation & Delivery' : '3. Préparation & Livraison'}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {order.fulfillmentStatus === 'DELIVERED'
                  ? isEn ? 'Handed over · Completed' : 'Remise effectuée · Terminée'
                  : order.fulfillmentStatus === 'SHIPPED'
                  ? isEn ? 'Handover in progress in Cotonou' : 'Remise en cours à Cotonou'
                  : isEn ? 'In preparation at store' : "En cours de préparation en boutique"}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => setProofOrder(order)}
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
            onPress={() => handleContactShop(order)}
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
              {isEn ? 'Contact' : "Contacter la boutique"}
            </Text>
          </Pressable>
          {order.fulfillmentStatus === 'DELIVERED' && order.lines && order.lines.length > 0 && order.lines[0].productId && (
            <Pressable
              onPress={() => handleOpenReview(order)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: 'rgba(173, 132, 85, 0.12)',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#AD8455',
              }}
            >
              <Text style={{ color: '#AD8455', fontWeight: '700', fontSize: 11 }}>
                {isEn ? '★ Review' : '★ Avis vérifié'}
              </Text>
            </Pressable>
          )}
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
              {isEn ? 'Dispute' : 'Litige'}
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="download" size={14} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                  {isEn ? 'Download Blueprint (PDF)' : 'Télécharger le patron (PDF)'}
                </Text>
              </View>
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
              {req.category ? req.category.toUpperCase() : isEn ? 'PRODUCT REQUEST' : 'DEMANDE DE PRODUIT'}
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
          {isEn ? `Merchant Quotes (${proposals.length})` : `Offres & Devis reçus (${proposals.length})`}
        </Text>

        {proposals.length === 0 ? (
          <View style={{ backgroundColor: colors.canvas, borderRadius: 8, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              {isEn
                ? 'Broadcasted to verified stores... Offers will appear here shortly.'
                : 'Diffusion en cours auprès des commerçants vérifiés... Les offres et devis apparaîtront ici.'}
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
                    {prop.productionDays} {isEn ? 'days' : 'jours'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {prop.artisanCity || 'Cotonou'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.action, fontWeight: '600' }}>
                    {isEn ? 'Advance:' : 'Acompte:'} {advanceFcfa.toLocaleString()} FCFA
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
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: topInset > 0 ? topInset + 6 : (Platform.OS === 'android' ? 36 : 10),
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
          zIndex: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {onBack && (
              <Pressable
                onPress={onBack}
                style={({ pressed }) => [{
                  padding: 6,
                  borderRadius: 8,
                  backgroundColor: colors.canvas,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                }]}
              >
                <Text style={{ fontSize: 16, color: colors.action, fontWeight: '700' }}>←</Text>
              </Pressable>
            )}
            <Text style={{ fontFamily: headerFont, fontSize: 20, fontWeight: '700', color: colors.text }}>
              {isEn ? 'Purchases & Tracking' : 'Mes Achats & Suivi'}
            </Text>
          </View>

          {onOpenNeed && (
            <Pressable
              onPress={onOpenNeed}
              style={({ pressed }) => [{
                backgroundColor: colors.action,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 10,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              }]}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11 }}>
                {isEn ? '+ Request' : '+ Besoin'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* 4 Tabs: Orders, Digital Grants, Bespoke Requests, History */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <Pressable
            onPress={() => setActiveTab('orders')}
            style={({ pressed }) => [{
              paddingVertical: 7,
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: activeTab === 'orders' ? colors.action : colors.canvas,
              borderWidth: 1,
              borderColor: activeTab === 'orders' ? colors.action : colors.border,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            }]}
          >
            <Text style={{ color: activeTab === 'orders' ? '#FFFFFF' : colors.text, fontWeight: '700', fontSize: 12 }}>
              {isEn ? `Orders (${orders?.length || 0})` : `Commandes (${orders?.length || 0})`}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('digital')}
            style={({ pressed }) => [{
              paddingVertical: 7,
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: activeTab === 'digital' ? colors.action : colors.canvas,
              borderWidth: 1,
              borderColor: activeTab === 'digital' ? colors.action : colors.border,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            }]}
          >
            <Text style={{ color: activeTab === 'digital' ? '#FFFFFF' : colors.text, fontWeight: '700', fontSize: 12 }}>
              {isEn ? `Digital (${digitalGrants?.length || 0})` : `Numérique (${digitalGrants?.length || 0})`}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('requests')}
            style={({ pressed }) => [{
              paddingVertical: 7,
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: activeTab === 'requests' ? colors.action : colors.canvas,
              borderWidth: 1,
              borderColor: activeTab === 'requests' ? colors.action : colors.border,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            }]}
          >
            <Text style={{ color: activeTab === 'requests' ? '#FFFFFF' : colors.text, fontWeight: '700', fontSize: 12 }}>
              {isEn ? `Quotes (${requests?.length || 0})` : `Devis (${requests?.length || 0})`}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('history')}
            style={({ pressed }) => [{
              paddingVertical: 7,
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: activeTab === 'history' ? colors.action : colors.canvas,
              borderWidth: 1,
              borderColor: activeTab === 'history' ? colors.action : colors.border,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            }]}
          >
            <Text style={{ color: activeTab === 'history' ? '#FFFFFF' : colors.text, fontWeight: '700', fontSize: 12 }}>
              {isEn ? 'History' : 'Historique'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
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
                <View style={{ marginBottom: 8 }}><Icon name="download" size={32} color={colors.muted} /></View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'No Digital Blueprints' : 'Aucun patron ou guide numérique'}
                </Text>
                <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 18 }}>
                  {isEn
                    ? 'Acquired digital files and technical guides will be available for instant download here.'
                    : 'Les guides, e-books et fichiers numériques achetés apparaîtront ici avec téléchargement instantané.'}
                </Text>
              </View>
            )}
          </>
        ) : activeTab === 'requests' ? (
          <>
            {requests && requests.length > 0 ? (
              requests.map(renderRequest)
            ) : (
              <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                <View style={{ marginBottom: 8 }}><Icon name="file" size={32} color={colors.muted} /></View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'No Bespoke Requests' : 'Aucun devis en attente'}
                </Text>
                <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 18, marginBottom: onOpenNeed ? 14 : 0 }}>
                  {isEn
                    ? 'Submit a custom request to receive tailored proposals from master artisans.'
                    : 'Exprimez vos souhaits de création pour recevoir des devis personnalisés chiffrés par nos maîtres artisans.'}
                </Text>
                {onOpenNeed && (
                  <Pressable
                    onPress={onOpenNeed}
                    style={{ backgroundColor: colors.action, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 8 }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                      {isEn ? 'Express a Need →' : 'Exprimer un besoin →'}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </>
        ) : (
          <>
            {orders && orders.length > 0 ? (
              orders.map(renderOrder)
            ) : (
              <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                <View style={{ marginBottom: 8 }}><Icon name="orders" size={32} color={colors.muted} /></View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'No Orders Yet' : 'Aucune commande enregistrée'}
                </Text>
                <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 18 }}>
                  {isEn
                    ? 'Your certified purchase history is empty. Explore our catalog to place your first order.'
                    : 'Votre historique de commandes est vierge. Explorez les créations d\'exception pour passer votre première commande.'}
                </Text>
              </View>
            )}
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
                  {isEn ? 'Report an Order Issue' : 'Signaler un Litige / Incident'}
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

      {/* Payment Proof / Settlement Modal */}
      {proofOrder && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setProofOrder(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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
                  {isEn ? 'Proof of Payment' : 'Preuve de Règlement'}
                </Text>
                <Pressable onPress={() => setProofOrder(null)}>
                  <Text style={{ fontSize: 18, color: colors.text, padding: 4 }}>✕</Text>
                </Pressable>
              </View>

              {proofOrder.paymentStatus === 'CONFIRMED' || proofOrder.paymentStatus === 'SETTLED_TO_MERCHANT' || proofOrder.paymentStatus === 'PAID' ? (
                /* Certified Settled Receipt */
                <View style={{ gap: 14 }}>
                  <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#10B981', alignItems: 'center', gap: 6 }}>
                    <Icon name="check-circle" size={28} color="#10B981" />
                    <Text style={{ color: '#10B981', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 }}>
                      {isEn ? 'PAYMENT CERTIFIED & SETTLED' : 'RÈGLEMENT CERTIFIÉ & CONFIRMÉ'}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center' }}>
                      {isEn ? 'Funds verified and posted in the boutique ledger.' : 'Fonds vérifiés et enregistrés dans le livre de caisse de la boutique.'}
                    </Text>
                  </View>

                  <View style={{ backgroundColor: colors.canvas, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>{isEn ? 'Order Number' : 'N° Commande'}</Text>
                      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>#{proofOrder.orderNumber || proofOrder.id}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>{isEn ? 'Total Settled' : 'Montant Réglé'}</Text>
                      <Text style={{ color: colors.action, fontWeight: '800', fontSize: 14 }}>
                        {(proofOrder.totalAmountMinor / 100).toLocaleString('fr-FR')} FCFA
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>{isEn ? 'Payment Channel' : 'Canal'}</Text>
                      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>{proofOrder.paymentChannel}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>{isEn ? 'Buyer' : 'Acheteur'}</Text>
                      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>{proofOrder.buyerName}</Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => setProofOrder(null)}
                    style={{
                      backgroundColor: colors.action,
                      paddingVertical: 12,
                      borderRadius: 10,
                      alignItems: 'center',
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                      {isEn ? 'Close Receipt' : 'Fermer le reçu'}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                /* Unconfirmed: Declaration Form */
                <View style={{ gap: 14 }}>
                  {/* Settlement Instructions */}
                  <View style={{ backgroundColor: colors.canvas, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: 6 }}>
                    <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                      {isEn ? 'TRANSFER INSTRUCTIONS' : 'INSTRUCTIONS DE RÈGLEMENT DIRECT'}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 13, lineHeight: 18 }}>
                      {isEn ? 'Please send ' : 'Veuillez envoyer '}
                      <Text style={{ fontWeight: '800', color: colors.action }}>
                        {(proofOrder.totalAmountMinor / 100).toLocaleString('fr-FR')} FCFA
                      </Text>
                      {isEn ? ' to the boutique account:' : ' sur le compte marchand boutique :'}
                    </Text>
                    <View style={{ backgroundColor: colors.surface, padding: 10, borderRadius: 8, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ color: colors.muted, fontSize: 11 }}>
                          {proofOrder.paymentInstructions?.merchantName || 'Kingston Bio'} ({proofOrder.paymentChannel})
                        </Text>
                        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, letterSpacing: 0.5 }}>
                          {proofOrder.paymentInstructions?.merchantAccount || '+229 97 00 00 00'}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleContactShop(proofOrder)}
                        style={{ backgroundColor: 'rgba(173, 132, 85, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                      >
                        <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 11 }}>
                          {isEn ? 'WhatsApp' : 'WhatsApp'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Transaction Ref Input */}
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
                      {isEn ? 'Transaction ID / Reference *' : 'Référence de transaction MoMo / Virement *'}
                    </Text>
                    <TextInput
                      value={transactionRef}
                      onChangeText={setTransactionRef}
                      placeholder={isEn ? 'e.g. TXN-880-928491' : 'Ex: TXN-880-928491 ou ID SMS MTN/Moov'}
                      placeholderTextColor={colors.muted}
                      style={{
                        backgroundColor: colors.canvas,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: 12,
                        fontSize: 14,
                        color: colors.text,
                      }}
                    />
                  </View>

                  {/* Optional Notes */}
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
                      {isEn ? 'Optional Note' : 'Précisions complémentaires (facultatif)'}
                    </Text>
                    <TextInput
                      value={proofNotes}
                      onChangeText={setProofNotes}
                      placeholder={isEn ? 'Sender phone number or time...' : 'Numéro émetteur ou heure du transfert...'}
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

                  {/* Submit Button */}
                  <Pressable
                    disabled={submittingProof}
                    onPress={handleDeclarePayment}
                    style={{
                      backgroundColor: colors.action,
                      paddingVertical: 12,
                      borderRadius: 10,
                      alignItems: 'center',
                      marginTop: 4,
                    }}
                  >
                    {submittingProof ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                        {isEn ? 'Submit Proof to Store →' : 'Transmettre ma preuve de règlement →'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

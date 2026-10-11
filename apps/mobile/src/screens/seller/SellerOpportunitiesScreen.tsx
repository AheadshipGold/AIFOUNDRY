import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Platform,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesign } from "../../design-system/provider";
import { Button } from "../../design-system/components";
import { RequestsApi, PurchaseRequestItem, type AuthUser } from "../../services/api";

interface SellerOpportunitiesScreenProps {
  currentUser?: AuthUser | null;
  onBack: () => void;
}

export default function SellerOpportunitiesScreen({
  currentUser,
  onBack,
}: SellerOpportunitiesScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0);
  const { colors, locale } = useDesign();
  const isEn = locale === "en";

  const isDemo = currentUser?.email === 'demo@ojarket.test' || currentUser?.email === 'alexandre@ojarket.test';
  const activeShop = currentUser?.activeShop || (currentUser?.shops && currentUser.shops.length > 0 ? currentUser.shops[0] : null);

  const [requests, setRequests] = useState<PurchaseRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<PurchaseRequestItem | null>(null);
  const [quotePrice, setQuotePrice] = useState("270000");
  const [quoteAdvance, setQuoteAdvance] = useState("100000");
  const [quoteDays, setQuoteDays] = useState("12");
  const [quoteNotes, setQuoteNotes] = useState(
    "Cuir de premier choix tannage végétal ou travail du bronze à la cire perdue. Confection sous 12 jours."
  );
  const [submitting, setSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await RequestsApi.getAll();
      setRequests(data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const handleSubmitQuote = async () => {
    if (!selectedReq) return;
    const priceNum = parseInt(quotePrice, 10) || 0;
    const advNum = parseInt(quoteAdvance, 10) || 0;
    const daysNum = parseInt(quoteDays, 10) || 10;

    setSubmitting(true);
    try {
      await RequestsApi.submitProposal(selectedReq.id, {
        shopName: activeShop?.name || currentUser?.activeShop?.name || (currentUser?.shops && currentUser.shops[0]?.name) || "Ma Boutique",
        artisanCity: activeShop?.city || currentUser?.city || "Cotonou",
        priceMinor: priceNum * 100,
        advancePaymentRequiredMinor: advNum * 100,
        productionDays: daysNum,
        notes: quoteNotes,
      });

      Alert.alert(
        isEn ? "Quote Transmitted!" : "Devis transmis avec succès !",
        isEn
          ? "The buyer has received your structured proposal. You will be notified upon acceptance and direct deposit confirmation."
          : "Le client a reçu votre devis structuré. Vous serez notifié dès acceptation et versement de l'acompte direct."
      );
      setSelectedReq(null);
      await fetchRequests();
    } catch (err: any) {
      Alert.alert(
        isEn ? "Error" : "Erreur",
        err?.message || (isEn ? "Failed to transmit proposal to buyer." : "Échec de transmission du devis au client.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (valMinor?: number) => {
    if (!valMinor) return isEn ? "Open budget" : "Budget ouvert";
    return new Intl.NumberFormat("fr-FR").format(valMinor / 100) + " FCFA";
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* Pinned Fixed Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: topInset > 0 ? topInset + 6 : (Platform.OS === "android" ? 36 : 10),
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
          gap: 12,
          zIndex: 10,
        }}
      >
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
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          }]}
        >
          <Text style={{ fontSize: 16, color: colors.action, fontWeight: "700" }}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: colors.accent, fontWeight: "800", letterSpacing: 1.1 }}>
            {isEn ? "BUYER OPPORTUNITIES" : "OPPORTUNITÉS SUR-MESURE"}
          </Text>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 20,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {isEn ? "Buyer Requests" : "Demandes acheteurs"}
          </Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
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
        {/* Intro banner */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: colors.action,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
            {isEn ? "Direct Merchant Quotes" : "Devis & Offres Commerçantes"}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>
            {isEn
              ? "Respond to qualified buyer requests. State your total price, mandatory advance deposit, and delivery lead time."
              : "Répondez aux besoins exprimés par les clients. Définissez votre prix net, votre acompte direct et votre délai de livraison."}
          </Text>
        </View>

      {/* Loading state */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.action} style={{ marginTop: 24 }} />
      ) : requests.length === 0 ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 32,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 36, marginBottom: 12 }}>✦</Text>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 17,
              fontWeight: "700",
              color: colors.text,
              textAlign: "center",
            }}
          >
            {isEn ? "No product requests yet" : "Aucune demande de produit"}
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
              ? "When clients create custom requests matching your products and inventory, they will be listed here for you to submit price quotes."
              : "Dès que des acheteurs publieront des demandes de produits correspondant à votre activité, vous pourrez leur soumettre vos devis et offres ici."}
          </Text>
        </View>
      ) : (
        /* Requests List */
        <View style={{ gap: 16 }}>
          {requests.map((req) => {
            const hasMyProposal = req.proposals && req.proposals.some(p => p.status === 'PENDING' || p.status === 'ACCEPTED');
            const myProp = req.proposals && req.proposals[0];

            return (
              <View
                key={req.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colors.subtle,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "700", color: colors.action }}>
                      {req.category ? req.category.toUpperCase() : "SUR-MESURE"}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.muted }}>
                    {req.proposals ? req.proposals.length : 0} {isEn ? "quotes" : "devis"}
                  </Text>
                </View>

                <Text
                  style={{
                    fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: 6,
                  }}
                >
                  {req.title}
                </Text>

                <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 10 }}>
                  {req.buyerName} · Bénin
                </Text>

                <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: 14 }}>
                  {req.description}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: 12,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 10, color: colors.muted }}>
                      {isEn ? "Target Budget:" : "Budget indicatif :"}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "800", color: colors.action }}>
                      {formatPrice(req.targetBudgetMinor)}
                    </Text>
                  </View>

                  {hasMyProposal && myProp ? (
                    <View
                      style={{
                        backgroundColor: colors.successBg,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "700", color: colors.action }}>
                        ✓ {isEn ? "Quote Sent" : "Devis envoyé"} ({formatPrice(myProp.priceMinor)})
                      </Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => {
                        setSelectedReq(req);
                        if (req.targetBudgetMinor) {
                          setQuotePrice(String(Math.round(req.targetBudgetMinor / 100)));
                          setQuoteAdvance(String(Math.round((req.targetBudgetMinor / 100) * 0.4)));
                        }
                      }}
                      style={{
                        backgroundColor: colors.action,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#FFFFFF" }}>
                        {isEn ? "Quote →" : "Soumettre un devis →"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Quote Submission Modal */}
      {selectedReq && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedReq(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.6)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 24,
                maxHeight: keyboardHeight > 0 ? "98%" : "90%",
              }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets={true}
                contentContainerStyle={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 20 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    {isEn ? "Submit Store Quote / Offer" : "Soumettre un Devis / Offre Boutique"}
                  </Text>
                  <Pressable onPress={() => setSelectedReq(null)}>
                    <Text style={{ fontSize: 18, color: colors.text, padding: 4 }}>✕</Text>
                  </Pressable>
                </View>

                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 16 }}>
                  Demande : {selectedReq.title} ({formatPrice(selectedReq.targetBudgetMinor)})
                </Text>

                {/* Price input */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
                    {isEn ? "Total Quote (FCFA)" : "Prix total proposé (FCFA)"}
                  </Text>
                  <TextInput
                    value={quotePrice}
                    onChangeText={setQuotePrice}
                    keyboardType="numeric"
                    style={{
                      backgroundColor: colors.subtle,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 10,
                      fontSize: 14,
                      color: colors.text,
                    }}
                  />
                </View>

                {/* Advance input */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
                    {isEn ? "Direct Advance Deposit Required (FCFA)" : "Acompte direct exigé (FCFA)"}
                  </Text>
                  <TextInput
                    value={quoteAdvance}
                    onChangeText={setQuoteAdvance}
                    keyboardType="numeric"
                    style={{
                      backgroundColor: colors.subtle,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 10,
                      fontSize: 14,
                      color: colors.text,
                    }}
                  />
                </View>

                {/* Days input */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
                    {isEn ? "Delivery Lead Time (Days)" : "Délai de livraison (jours)"}
                  </Text>
                  <TextInput
                    value={quoteDays}
                    onChangeText={setQuoteDays}
                    keyboardType="numeric"
                    style={{
                      backgroundColor: colors.subtle,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 10,
                      fontSize: 14,
                      color: colors.text,
                    }}
                  />
                </View>

                {/* Notes input */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
                    {isEn ? "Commercial Terms & Notes" : "Conditions & Notes de vente"}
                  </Text>
                  <TextInput
                    value={quoteNotes}
                    onChangeText={setQuoteNotes}
                    multiline
                    numberOfLines={3}
                    style={{
                      backgroundColor: colors.subtle,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 10,
                      fontSize: 12,
                      color: colors.text,
                      minHeight: 60,
                    }}
                  />
                </View>

                <Button disabled={submitting} onPress={handleSubmitQuote}>
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    isEn ? "Submit Proposal →" : "Soumettre la proposition →"
                  )}
                </Button>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
      </ScrollView>
    </View>
  );
}

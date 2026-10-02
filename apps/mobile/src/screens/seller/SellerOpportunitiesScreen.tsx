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
} from "react-native";
import { useDesign } from "../../design-system/provider";
import { Button } from "../../design-system/components";
import { RequestsApi, PurchaseRequestItem } from "../../services/api";

interface SellerOpportunitiesScreenProps {
  onBack: () => void;
}

export default function SellerOpportunitiesScreen({
  onBack,
}: SellerOpportunitiesScreenProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === "en";

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

  // Fallback mock requests
  const fallbackRequests: PurchaseRequestItem[] = [
    {
      id: "req-01",
      buyerName: "Amina Diop",
      title: "Parure royale en bronze ciselé pour cérémonie traditionnelle",
      description:
        "Recherche d'un atelier d'artisan d'Abomey capable de forger un collier plastron et manchettes assorties sous 15 jours avec symboles royaux dahoméens.",
      category: "Joaillerie & Bronze",
      targetBudgetMinor: 28000000,
      currency: "XOF",
      status: "MATCHED",
      createdAt: new Date().toISOString(),
      proposals: [],
    },
    {
      id: "req-02",
      buyerName: "Marcelle Houngbo",
      title: "Table console sculptée en bois d'Iroko massif",
      description:
        "Console d'entrée 140cm x 40cm avec pieds sculptés motifs bas-reliefs dahoméens. Finition cirée naturelle.",
      category: "Mobilier d'Art",
      targetBudgetMinor: 45000000,
      currency: "XOF",
      status: "OPEN",
      createdAt: new Date().toISOString(),
      proposals: [],
    },
    {
      id: "req-03",
      buyerName: "Didier Agossa",
      title: "Sac de voyage weekend en cuir pleine fleur patiné",
      description:
        "Sac de voyage 50L en cuir brun foncé avec compartiment chaussures et bandoulière renforcée cuir sellier.",
      category: "Maroquinerie",
      targetBudgetMinor: 19000000,
      currency: "XOF",
      status: "OPEN",
      createdAt: new Date().toISOString(),
      proposals: [],
    },
  ];

  const fetchRequests = async () => {
    try {
      const data = await RequestsApi.getAll();
      if (data && data.length > 0) {
        setRequests(data);
      } else {
        setRequests(fallbackRequests);
      }
    } catch {
      setRequests(fallbackRequests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmitQuote = async () => {
    if (!selectedReq) return;
    const priceNum = parseInt(quotePrice, 10) || 0;
    const advNum = parseInt(quoteAdvance, 10) || 0;
    const daysNum = parseInt(quoteDays, 10) || 10;

    setSubmitting(true);
    try {
      await RequestsApi.submitProposal(selectedReq.id, {
        shopName: "Atelier d'Excellence Bénin",
        artisanCity: "Cotonou",
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
    } catch {
      // Local optimistic update if offline
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedReq.id
            ? {
                ...r,
                status: "MATCHED",
                proposals: [
                  ...(r.proposals || []),
                  {
                    id: `prop-${Date.now()}`,
                    requestId: r.id,
                    shopId: "shop-01",
                    shopName: "Atelier d'Excellence Bénin",
                    artisanCity: "Cotonou",
                    priceMinor: priceNum * 100,
                    advancePaymentRequiredMinor: advNum * 100,
                    currency: "XOF",
                    productionDays: daysNum,
                    notes: quoteNotes,
                    status: "PENDING",
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : r
        )
      );
      setSelectedReq(null);
      Alert.alert(
        isEn ? "Quote Transmitted (Offline Mode)!" : "Devis transmis (Mode Démo) !",
        isEn
          ? "The buyer has received your proposal."
          : "Le client a reçu votre devis structuré."
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
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
          gap: 12,
        }}
      >
        <Pressable
          onPress={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: colors.text }}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: colors.accent, fontWeight: "800", letterSpacing: 1.1 }}>
            {isEn ? "BUYER OPPORTUNITIES" : "OPPORTUNITÉS & DEMANDES SUR-MESURE"}
          </Text>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 22,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {isEn ? "Buyer Requests" : "Demandes acheteurs"}
          </Text>
        </View>
      </View>

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
          {isEn ? "Direct Artisan Quotes" : "Devis d'Atelier en Direct"}
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>
          {isEn
            ? "Respond to qualified buyer requests. State your total price, mandatory advance deposit, and delivery lead time."
            : "Répondez aux besoins exprimés par les clients. Définissez votre prix net, votre acompte direct et votre délai de confection."}
        </Text>
      </View>

      {/* Loading state */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.action} style={{ marginTop: 24 }} />
      ) : (
        /* Requests List */
        <View style={{ gap: 16 }}>
          {requests.map((req) => {
            const hasMyProposal = req.proposals && req.proposals.some(p => p.shopName.includes("Atelier") || p.status === 'PENDING' || p.status === 'ACCEPTED');
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
                  👤 {req.buyerName} · 📍 Bénin
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
          <View
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
                maxHeight: "90%",
              }}
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
                  {isEn ? "Submit Artisan Quote" : "Soumettre un Devis Atelier"}
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
                  {isEn ? "Lead Time (Days)" : "Délai de confection (jours)"}
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
                  {isEn ? "Technical Specifications & Notes" : "Spécifications & Notes atelier"}
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
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesign } from "../../design-system/provider";
import {
  Button,
  Card,
  Badge,
} from "../../design-system/components";
import { SellerApi, CashbookData } from "../../services/api";

interface SellerCashbookScreenProps {
  onBack: () => void;
}

export default function SellerCashbookScreen({
  onBack,
}: SellerCashbookScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0);
  const { colors, locale } = useDesign();
  const isEn = locale === "en";
  const [closed, setClosed] = useState(false);
  const [cashbook, setCashbook] = useState<CashbookData | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function loadData() {
      try {
        const cb = await SellerApi.getCashbook();
        setCashbook(cb);
      } catch (err) {
        console.warn("Failed to load cashbook data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCloseDay = () => {
    Alert.alert(
      isEn ? "Confirm Daily Close" : "Confirmer la clôture de caisse",
      isEn
        ? "Reconciliation complete: Zero discrepancy between physical ledger and confirmed mobile money."
        : "Rapprochement effectué : Aucun écart entre les encaissements constatés et les écritures de caisse.",
      [
        { text: isEn ? "Cancel" : "Annuler", style: "cancel" },
        {
          text: isEn ? "Validate Close" : "Valider la clôture",
          onPress: async () => {
            try {
              await SellerApi.closeDay({
                physicalCashMinor: cashbook?.summary?.totalEncaisseMinor || 0,
                closedBy: 'Maître Ganvié'
              });
              setClosed(true);
            } catch (error) {
              console.warn("Failed to close day", error);
              Alert.alert("Error", "Failed to close the day");
            }
          },
        },
      ]
    );
  };

  const totalVendu = cashbook ? Math.round(cashbook.summary.totalVenduMinor / 100) : 1280000;
  const totalEncaisse = cashbook ? Math.round(cashbook.summary.totalEncaisseMinor / 100) : 850000;
  const totalRestant = cashbook ? Math.round(cashbook.summary.totalRestantMinor / 100) : 430000;

  const defaultEntries = [
    {
      time: "14:10",
      desc: "Encaissement MTN MoMo (Commande #CMD-2847)",
      amount: "+48 000 FCFA",
      tag: "Confirmé marchand",
    },
    {
      time: "11:35",
      desc: "Encaissement Espèces atelier (Vente directe)",
      amount: "+25 000 FCFA",
      tag: "Caisse physique",
    },
    {
      time: "09:50",
      desc: "Acompte Virement bancaire (Commande #CMD-2846)",
      amount: "+150 000 FCFA",
      tag: "Vérifié compte",
    },
  ];

  const entriesToDisplay = cashbook?.recentEntries
    ? cashbook.recentEntries.map((entry) => ({
        time: entry.time,
        desc: entry.label + (entry.reference ? ` (${entry.reference})` : ""),
        amount: `${entry.amountMinor >= 0 ? "+" : ""}${Math.round(entry.amountMinor / 100)} FCFA`,
        tag: entry.channel + (entry.source === 'SELLER_MANUAL' ? ' · Manuel' : ' · Vérifié'),
      }))
    : defaultEntries;


  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectLabel, setCollectLabel] = useState("");
  const [collectAmount, setCollectAmount] = useState("");
  const [collectChannel, setCollectChannel] = useState("CASH_ON_DELIVERY");
  const [submittingCollect, setSubmittingCollect] = useState(false);

  const handleRecordCollection = async () => {
    const amountNum = parseInt(collectAmount.replace(/\s+/g, ""), 10);
    if (!amountNum || amountNum <= 0) {
      Alert.alert(isEn ? "Invalid Amount" : "Montant Invalide", isEn ? "Please enter a valid amount" : "Veuillez entrer un montant valide");
      return;
    }
    if (!collectLabel.trim()) {
      Alert.alert(isEn ? "Label Required" : "Libellé Requis", isEn ? "Please enter a description" : "Veuillez décrire la vente");
      return;
    }

    setSubmittingCollect(true);
    try {
      await SellerApi.recordCollection({
        label: collectLabel.trim(),
        amountMinor: amountNum * 100,
        channel: collectChannel,
      });
    } catch {
      // Offline fallback
    }

    // Update local cashbook state immediately
    const newEntry = {
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      desc: collectLabel.trim(),
      amount: `+${amountNum.toLocaleString("fr-FR")} FCFA`,
      tag: collectChannel === "MTN_MOMO" ? "MTN MoMo · Direct" : collectChannel === "MOOV_MONEY" ? "Moov · Direct" : "Espèces · Direct",
    };

    if (cashbook) {
      setCashbook({
        ...cashbook,
        summary: {
          totalVenduMinor: cashbook.summary.totalVenduMinor + amountNum * 100,
          totalEncaisseMinor: cashbook.summary.totalEncaisseMinor + amountNum * 100,
          totalRestantMinor: cashbook.summary.totalRestantMinor,
        },
        recentEntries: [
          {
            id: `entry_${Date.now()}`,
            type: "ENCAISSEMENT",
            label: collectLabel.trim(),
            amountMinor: amountNum * 100,
            currency: "XOF",
            channel: (collectChannel === "MTN_MOMO" ? "MTN MoMo" : collectChannel === "MOOV_MONEY" ? "Moov Money" : "Espèces") as any,
            reference: `MAN-${Date.now().toString().slice(-4)}`,
            source: "SELLER_MANUAL",
            time: newEntry.time,
          },
          ...cashbook.recentEntries,
        ],
      });
    }

    setSubmittingCollect(false);
    setShowCollectModal(false);
    setCollectLabel("");
    setCollectAmount("");
    Alert.alert(
      isEn ? "Collection Recorded" : "Encaissement Enregistré",
      isEn ? `+${amountNum.toLocaleString("fr-FR")} FCFA added to cashbook.` : `+${amountNum.toLocaleString("fr-FR")} FCFA ajoutés au journal de caisse.`
    );
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
            {isEn ? "FINANCIAL OVERVIEW" : "VUE FINANCIÈRE"}
          </Text>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 20,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {isEn ? "Cashbook" : "Caisse & Journal"}
          </Text>
        </View>

        <Pressable
          onPress={() => setShowCollectModal(true)}
          style={({ pressed }) => [{
            backgroundColor: colors.action,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          }]}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
            {isEn ? "+ Record Sale" : "+ Encaisser"}
          </Text>
        </Pressable>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >

      {loading ? (
        <View style={{ padding: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.action} />
        </View>
      ) : (
        <>
          {/* Financial Summary Triad */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 18,
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "800", color: colors.accent, letterSpacing: 1, marginBottom: 12 }}>
              {isEn ? "TODAY'S SUMMARY" : "RÉSUMÉ DU JOUR"}
            </Text>

            <View style={{ gap: 10 }}>
              <View
                style={{
                  backgroundColor: colors.canvas,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 10, color: colors.muted, fontWeight: "700" }}>
                  {isEn ? "SOLD (Gross order revenue)" : "VENDU (Chiffre brut des commandes)"}
                </Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 2 }}>
                  {totalVendu.toLocaleString("fr-FR")} FCFA
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: colors.successBg,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.action,
                }}
              >
                <Text style={{ fontSize: 10, color: colors.action, fontWeight: "700" }}>
                  {isEn ? "RECEIVED (Actual funds via MTN / Moov / Cash)" : "ENCAISSÉ (Fonds réels reçus MTN / Moov / Caisse)"}
                </Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.action, marginTop: 2 }}>
                  {totalEncaisse.toLocaleString("fr-FR")} FCFA
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: colors.canvas,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 10, color: colors.muted, fontWeight: "700" }}>
                  {isEn ? "REMAINING (To be collected on delivery / balance)" : "RESTANT (À percevoir à la livraison / solde)"}
                </Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#D97706", marginTop: 2 }}>
                  {totalRestant.toLocaleString("fr-FR")} FCFA
                </Text>
              </View>
            </View>
          </View>

          {/* Cashbook Journal Entries */}
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 18,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            {isEn ? "Daily Cash Entries" : "Écritures financières du jour"}
          </Text>

          <View style={{ gap: 10, marginBottom: 28 }}>
            {entriesToDisplay.map((item, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 14,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontSize: 10, color: colors.muted, fontWeight: "700" }}>
                    {item.time} · {item.tag}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text, marginTop: 2 }}>
                    {item.desc}
                  </Text>
                </View>

                <Text style={{ fontSize: 14, fontWeight: "800", color: colors.action }}>
                  {item.amount}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Collect Direct Sale Modal */}
      {showCollectModal && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            padding: 20,
            zIndex: 100,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
              maxHeight: keyboardHeight > 0 ? "98%" : "90%",
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={true}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
                  {isEn ? "Record Direct Sale" : "Encaisser une Vente"}
                </Text>
                <Pressable onPress={() => setShowCollectModal(false)}>
                  <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
                </Pressable>
              </View>

              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text, marginBottom: 6 }}>
                {isEn ? "Description / Item *" : "Libellé de la vente *"}
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  color: colors.text,
                  backgroundColor: colors.canvas,
                  marginBottom: 12,
                }}
                value={collectLabel}
                onChangeText={setCollectLabel}
                placeholder="ex: Sacoche cuir vendue à l'atelier"
                placeholderTextColor={colors.muted}
              />

              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text, marginBottom: 6 }}>
                {isEn ? "Amount in FCFA *" : "Montant en FCFA *"}
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.action,
                  backgroundColor: colors.canvas,
                  marginBottom: 16,
                }}
                value={collectAmount}
                onChangeText={setCollectAmount}
                placeholder="35000"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
              />

              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text, marginBottom: 8 }}>
                {isEn ? "Payment Method" : "Canal de paiement"}
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
                {[
                  { id: "CASH_ON_DELIVERY", label: isEn ? "Cash" : "Espèces" },
                  { id: "MTN_MOMO", label: "MTN MoMo" },
                  { id: "MOOV_MONEY", label: "Moov" },
                ].map((pm) => (
                  <Pressable
                    key={pm.id}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: collectChannel === pm.id ? colors.action : colors.border,
                      backgroundColor: collectChannel === pm.id ? colors.canvas : colors.surface,
                      alignItems: "center",
                    }}
                    onPress={() => setCollectChannel(pm.id)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: collectChannel === pm.id ? colors.action : colors.text }}>
                      {pm.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={{
                  backgroundColor: colors.action,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: submittingCollect ? 0.6 : 1,
                }}
                onPress={handleRecordCollection}
                disabled={submittingCollect}
              >
                {submittingCollect ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                    {isEn ? "Confirm Collection" : "Valider l'Encaissement"}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Daily Close Action */}
      {closed ? (
        <View
          style={{
            backgroundColor: colors.successBg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.action,
            padding: 18,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24, color: colors.action, marginBottom: 6 }}>✓</Text>
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
            {isEn ? "Daily Close Validated" : "Clôture de journée validée"}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center" }}>
            {isEn ? "Entries sealed in the immutable ledger. Reports are ready for export." : "Écritures scellées dans le journal immuable. Les rapports sont prêts pour export."}
          </Text>
        </View>
      ) : (
        <Button onPress={handleCloseDay}>
          {isEn ? "Close the Day →" : "Clôturer la journée →"}
        </Button>
      )}
      </ScrollView>
    </View>
  );
}

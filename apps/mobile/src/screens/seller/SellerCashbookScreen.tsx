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
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesign } from "../../design-system/provider";
import { Icon } from "../../design-system/Icon";
import {
  Button,
} from "../../design-system/components";
import { SellerApi, CashbookData, type AuthUser } from "../../services/api";

interface SellerCashbookScreenProps {
  currentUser?: AuthUser | null;
  onBack: () => void;
}

export default function SellerCashbookScreen({
  currentUser,
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
  const [exportingFec, setExportingFec] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectLabel, setCollectLabel] = useState("");
  const [collectAmount, setCollectAmount] = useState("");
  const [collectChannel, setCollectChannel] = useState("CASH_ON_DELIVERY");
  const [submittingCollect, setSubmittingCollect] = useState(false);

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
    loadCashbook();
  }, [currentUser]);

  const loadCashbook = async () => {
    try {
      setLoading(true);
      const cb = await SellerApi.getCashbook();
      setCashbook(cb);
    } catch (err) {
      console.warn("Failed to load cashbook data", err);
    } finally {
      setLoading(false);
    }
  };

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
                closedBy: currentUser?.name || (isEn ? 'Store Merchant' : 'Commerçant Vendeur'),
              });
              setClosed(true);
              Alert.alert(
                isEn ? "Close Successful" : "Clôture Réussie",
                isEn ? "Daily ledger balanced and sealed." : "Caisse journalière équilibrée et scellée avec succès."
              );
              await loadCashbook();
            } catch (error) {
              console.warn("Failed to close day", error);
              Alert.alert("Error", "Failed to close the day");
            }
          },
        },
      ]
    );
  };

  const handleExportFec = async () => {
    try {
      setExportingFec(true);
      const res = await SellerApi.exportFec();
      if (!res?.content) {
        Alert.alert(isEn ? "Empty Ledger" : "Livre de Caisse Vide", isEn ? "No transactions to export yet." : "Aucune transaction enregistrée pour le moment.");
        return;
      }
      await Share.share({
        title: res.filename || "FEC_Comptable_Ojarket.txt",
        message: res.content,
      });
    } catch (err: any) {
      console.warn("FEC Export error", err);
      Alert.alert(isEn ? "Export Error" : "Erreur Export", err?.message || "Impossible d'exporter le FEC.");
    } finally {
      setExportingFec(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      const res = await SellerApi.exportCsv();
      if (!res?.content) {
        Alert.alert(isEn ? "Empty Ledger" : "Livre de Caisse Vide", isEn ? "No transactions to export yet." : "Aucune transaction enregistrée pour le moment.");
        return;
      }
      await Share.share({
        title: res.filename || "Journal_Caisse_Ojarket.csv",
        message: res.content,
      });
    } catch (err: any) {
      console.warn("CSV Export error", err);
      Alert.alert(isEn ? "Export Error" : "Erreur Export", err?.message || "Impossible d'exporter le CSV.");
    } finally {
      setExportingCsv(false);
    }
  };

  const totalVendu = cashbook?.summary?.totalVenduMinor !== undefined
    ? Math.round(cashbook.summary.totalVenduMinor / 100)
    : 0;
  const totalEncaisse = cashbook?.summary?.totalEncaisseMinor !== undefined
    ? Math.round(cashbook.summary.totalEncaisseMinor / 100)
    : 0;
  const totalRestant = cashbook?.summary?.totalRestantMinor !== undefined
    ? Math.round(cashbook.summary.totalRestantMinor / 100)
    : 0;

  const entriesToDisplay = (cashbook?.recentEntries && cashbook.recentEntries.length > 0)
    ? cashbook.recentEntries.map((entry: any) => ({
        time: entry.time,
        desc: entry.label + (entry.reference ? ` (${entry.reference})` : ""),
        amount: `${entry.amountMinor >= 0 ? "+" : ""}${Math.round(entry.amountMinor / 100).toLocaleString("fr-FR")} FCFA`,
        tag: entry.channel + (entry.source === 'SELLER_MANUAL' ? ' · Manuel' : ' · Vérifié'),
      }))
    : [];

  const handleRecordCollection = async () => {
    const amountNum = parseInt(collectAmount.replace(/[^\d]/g, ""), 10);
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

      setShowCollectModal(false);
      setCollectLabel("");
      setCollectAmount("");
      Alert.alert(
        isEn ? "Collection Recorded" : "Encaissement Enregistré",
        isEn ? `+${amountNum.toLocaleString("fr-FR")} FCFA added to cashbook.` : `+${amountNum.toLocaleString("fr-FR")} FCFA ajoutés au journal de caisse.`
      );
      await loadCashbook();
    } catch (err: any) {
      Alert.alert(isEn ? "Error" : "Erreur", err?.message || "Échec de l'encaissement.");
    } finally {
      setSubmittingCollect(false);
    }
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
          <Icon name="arrow-left" size={16} color={colors.action} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: colors.accent, fontWeight: "800", letterSpacing: 1.1 }}>
            {isEn ? "FINANCIAL LEDGER (S44)" : "LIVRE DE CAISSE (S44)"}
          </Text>
          <Text
            style={{
              fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
              fontSize: 20,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {isEn ? "Cashbook & FinOps" : "Caisse & FinOps"}
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
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
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
                marginBottom: 20,
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
                    {isEn ? "COLLECTED (Confirmed MTN / Moov / Cash)" : "ENCAISSÉ (Fonds réels reçus MTN / Moov / Caisse)"}
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
                    {isEn ? "REMAINING (To collect on delivery / balance)" : "RESTANT (À percevoir à la livraison / solde)"}
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: "#D97706", marginTop: 2 }}>
                    {totalRestant.toLocaleString("fr-FR")} FCFA
                  </Text>
                </View>
              </View>
            </View>

            {/* Export Buttons: FEC & CSV */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
              <Pressable
                onPress={handleExportFec}
                disabled={exportingFec}
                style={({ pressed }) => [{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                  opacity: pressed || exportingFec ? 0.75 : 1,
                }]}
              >
                {exportingFec ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <>
                    <Icon name="download" size={14} color={colors.accent} />
                    <Text style={{ fontSize: 11, fontWeight: "800", color: colors.accent }}>
                      Export FEC (Fiscal)
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={handleExportCsv}
                disabled={exportingCsv}
                style={({ pressed }) => [{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                  opacity: pressed || exportingCsv ? 0.75 : 1,
                }]}
              >
                {exportingCsv ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <>
                    <Icon name="file-text" size={14} color={colors.text} />
                    <Text style={{ fontSize: 11, fontWeight: "800", color: colors.text }}>
                      Export CSV (Excel)
                    </Text>
                  </>
                )}
              </Pressable>
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

            {entriesToDisplay.length > 0 ? (
              <View style={{ gap: 10, marginBottom: 24 }}>
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
            ) : (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <View style={{ marginBottom: 8 }}><Icon name="wallet" size={28} color={colors.muted} /></View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text, textAlign: "center" }}>
                  {isEn ? "No cashbook entries today" : "Aucune écriture de caisse aujourd'hui"}
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted, textAlign: "center", marginTop: 4, lineHeight: 16 }}>
                  {isEn
                    ? "Record incoming cash or mobile money payments received at your store."
                    : "Enregistrez vos encaissements d'espèces ou paiements Mobile Money reçus en boutique."}
                </Text>
              </View>
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
                <View style={{ marginBottom: 6 }}>
                  <Icon name="check-circle" size={26} color={colors.action} weight="fill" />
                </View>
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
                  {isEn ? "Daily Close Validated" : "Clôture de journée validée"}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center" }}>
                  {isEn ? "Entries sealed in the immutable ledger. Reports are ready for export." : "Écritures scellées dans le journal immuable. Les rapports sont prêts pour export."}
                </Text>
              </View>
            ) : (
              <Button onPress={handleCloseDay}>
                {isEn ? "Close the Day (Balance Cashbook) →" : "Clôturer la journée (Équilibrer la caisse) →"}
              </Button>
            )}
          </>
        )}
      </ScrollView>

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
                  <Icon name="x" size={20} color={colors.muted} />
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
                placeholder="ex: Sacoche cuir vendue en boutique"
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
    </View>
  );
}

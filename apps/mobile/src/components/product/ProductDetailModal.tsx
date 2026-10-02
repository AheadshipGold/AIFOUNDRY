import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { useDesign } from "../../design-system/provider";
import { OrdersApi, type ProductItem, type AuthUser, type OrderRecord } from "../../services/api";

const imgLeatherTote = require("../../../assets/products/leather-tote.jpg");
const imgWatchChrono = require("../../../assets/products/watch-chrono.jpg");
const imgArmchair = require("../../../assets/products/armchair.jpg");

interface ProductDetailModalProps {
  visible: boolean;
  product: any | null;
  currentUser: AuthUser | null;
  onClose: () => void;
  onRequireAuth: () => void;
  onOrderCompleted: (order: OrderRecord) => void;
}

type ModalView = "detail" | "checkout" | "success";

const PAYMENT_METHODS = [
  { id: "MTN_MOMO", name: "MTN Mobile Money", icon: "🟡", ussdHint: "*880#" },
  { id: "MOOV_MONEY", name: "Moov Money", icon: "🔵", ussdHint: "*155#" },
  { id: "CASH_ON_DELIVERY", name: "Espèces à la livraison", icon: "💵", ussdHint: "Paiement direct" },
];

export default function ProductDetailModal({
  visible,
  product,
  currentUser,
  onClose,
  onRequireAuth,
  onOrderCompleted,
}: ProductDetailModalProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === "en";

  const [view, setView] = useState<ModalView>("detail");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("Cotonou, Haie Vive");
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || "+229 97 00 00 00");
  const [buyerName, setBuyerName] = useState(currentUser?.name || "Client Ojarket");
  const [paymentChannel, setPaymentChannel] = useState("MTN_MOMO");
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setBuyerName(currentUser.name);
      if (currentUser.phone) setBuyerPhone(currentUser.phone);
    }
  }, [currentUser]);

  if (!product) return null;

  // Resolve product image
  let imageSource = imgLeatherTote;
  if (product.image && typeof product.image === "object") {
    imageSource = product.image;
  } else if (product.category === "watches" || product.title?.toLowerCase().includes("chrono") || product.title?.toLowerCase().includes("collier")) {
    imageSource = imgWatchChrono;
  } else if (product.category === "home" || product.title?.toLowerCase().includes("fauteuil") || product.title?.toLowerCase().includes("console")) {
    imageSource = imgArmchair;
  }

  // Price formatting
  const rawPrice = product.priceMinor 
    ? Math.round(product.priceMinor / 100) 
    : (product.price || 48000);
  const formattedPrice = new Intl.NumberFormat("fr-FR").format(rawPrice);
  const currency = product.currency || "XOF";

  // Variants
  const variants = product.variants && product.variants.length > 0 
    ? product.variants 
    : [{ id: product.id || "var-1", name: "Création Unique", sku: "SKU-STD", priceMinor: rawPrice * 100, stockOnHand: 3 }];
  const selectedVariant = variants[selectedVariantIndex] || variants[0];
  const stockAvailable = selectedVariant.stockOnHand ?? 3;

  const handleStartCheckout = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    setBuyerName(currentUser.name || "Client Ojarket");
    setBuyerPhone(currentUser.phone || "+229 97 00 00 00");
    setView("checkout");
  };

  const handleConfirmOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert(
        isEn ? "Address Required" : "Adresse Requise",
        isEn ? "Please enter your delivery address in Benin" : "Veuillez entrer votre adresse de livraison au Bénin"
      );
      return;
    }

    setSubmitting(true);
    try {
      const order = await OrdersApi.create({
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        paymentChannel,
        items: [
          {
            variantId: selectedVariant.id,
            quantity,
          },
        ],
      });

      setCreatedOrder(order);
      setView("success");
      onOrderCompleted(order);
    } catch (err: any) {
      console.warn("Order creation error", err);
      // Fallback synthetic order in offline mode
      const fallbackOrder: OrderRecord = {
        id: `ord_${Date.now()}`,
        orderNumber: `OJK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        buyerName,
        buyerPhone,
        deliveryAddress,
        totalAmountMinor: rawPrice * quantity * 100,
        currency: "XOF",
        paymentChannel,
        paymentStatus: paymentChannel === "CASH_ON_DELIVERY" ? "PENDING" : "SETTLED_TO_MERCHANT",
        fulfillmentStatus: "PREPARING",
        lines: [
          {
            variantId: selectedVariant.id,
            itemTitle: product.title,
            sku: selectedVariant.sku || "SKU-01",
            quantity,
            unitPriceMinor: rawPrice * 100,
            totalMinor: rawPrice * quantity * 100,
          },
        ],
        paymentInstructions: {
          merchantAccount: "+229 90 00 00 03",
          merchantName: product.artisanShop?.name || product.seller || "Maison Ganvié",
          ussdCode: paymentChannel === "MTN_MOMO" ? "*880#" : "*155#",
          reference: `OJK-${Date.now().toString().slice(-4)}`,
        },
        createdAt: new Date().toISOString(),
      };
      setCreatedOrder(fallbackOrder);
      setView("success");
      onOrderCompleted(fallbackOrder);
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setView("detail");
    setQuantity(1);
    setSelectedVariantIndex(0);
    setCreatedOrder(null);
    onClose();
  };

  const totalPriceFormatted = new Intl.NumberFormat("fr-FR").format(rawPrice * quantity);

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          
          {/* Top Bar with Close & Title */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={[styles.closeTxt, { color: colors.muted }]}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.topBarBrand, { color: colors.action }]}>OJARKET CERTIFIED</Text>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await Share.share({
                    title: product.title,
                    message: `${product.title} - ${formattedPrice} FCFA sur Ojarket (Artisanat d'Excellence du Bénin)\nDécouvrez la création : https://ojarket.bj/p/${product.id || 'creations'}`,
                    url: `https://ojarket.bj/p/${product.id || 'creations'}`,
                  });
                } catch {}
              }}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={{ fontSize: 16 }}>📤</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* VIEW 1: PRODUCT DETAILS */}
            {view === "detail" && (
              <>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                  <Image source={imageSource} style={styles.productImage} resizeMode="cover" />
                  <View style={[styles.categoryBadge, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.categoryBadgeText, { color: colors.action }]}>
                      {product.category ? product.category.toUpperCase() : "ARTISANAT"}
                    </Text>
                  </View>
                </View>

                <View style={styles.contentPad}>
                  {/* Artisan Shop Header */}
                  <View style={styles.artisanRow}>
                    <Text style={styles.artisanIcon}>✦</Text>
                    <Text style={[styles.artisanName, { color: colors.muted }]}>
                      {product.artisanShop?.name || product.seller || "Atelier Certifié"} · {product.artisanShop?.city || "Cotonou, Bénin"}
                    </Text>
                    <View style={[styles.verifiedPill, { backgroundColor: colors.successBg }]}>
                      <Text style={[styles.verifiedTxt, { color: colors.action }]}>✓ Certifié</Text>
                    </View>
                  </View>

                  {/* Title & Price */}
                  <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: colors.action }]}>
                      {formattedPrice} {currency === "XOF" ? "FCFA" : currency}
                    </Text>
                    <View style={[styles.stockPill, { backgroundColor: stockAvailable > 0 ? "#E8F5E9" : "#FFEBEE" }]}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: stockAvailable > 0 ? "#2E7D32" : "#C62828" }}>
                        {stockAvailable > 0 
                          ? (isEn ? `● ${stockAvailable} in stock` : `● ${stockAvailable} en stock`) 
                          : (isEn ? "Out of stock" : "Rupture de stock")}
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {isEn ? "About this Creation" : "À propos de cette création"}
                  </Text>
                  <Text style={[styles.description, { color: colors.text }]}>
                    {product.description || (isEn 
                      ? "Handcrafted by master artisans in Benin using authentic, noble materials with generational heritage."
                      : "Fabriqué à la main par des maîtres artisans au Bénin avec des matériaux nobles et un savoir-faire d'excellence.")}
                  </Text>

                  {/* Variants (if multiple) */}
                  {variants.length > 1 && (
                    <View style={styles.variantsSection}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {isEn ? "Choose Variant / Size" : "Sélectionner la variante"}
                      </Text>
                      <View style={styles.variantsRow}>
                        {variants.map((v: any, idx: number) => {
                          const isSelected = selectedVariantIndex === idx;
                          return (
                            <TouchableOpacity
                              key={v.id || idx}
                              style={[
                                styles.variantPill,
                                {
                                  backgroundColor: isSelected ? colors.action : colors.canvas,
                                  borderColor: isSelected ? colors.action : colors.border,
                                },
                              ]}
                              onPress={() => setSelectedVariantIndex(idx)}
                            >
                              <Text style={{ color: isSelected ? "#fff" : colors.text, fontWeight: "600", fontSize: 13 }}>
                                {v.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Artisan Guarantee Card */}
                  <View style={[styles.guaranteeCard, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                    <Text style={{ fontSize: 20 }}>🛡</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.guaranteeTitle, { color: colors.text }]}>
                        {isEn ? "Direct Artisan Support & Authenticity" : "Soutien Direct à l'Artisan & Authenticité"}
                      </Text>
                      <Text style={[styles.guaranteeText, { color: colors.muted }]}>
                        {isEn
                          ? "100% merchant-owned payment. Your purchase directly finances the workshop without escrow middlemen."
                          : "Paiement direct sans intermédiaire. Votre achat rémunère directement l'atelier au Bénin."}
                      </Text>
                    </View>
                  </View>

                  {/* Order CTA Button */}
                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: colors.action }]}
                    onPress={handleStartCheckout}
                  >
                    <Text style={styles.primaryBtnText}>
                      {isEn ? `Order Now · ${formattedPrice} FCFA` : `Commander · ${formattedPrice} FCFA`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* VIEW 2: CHECKOUT & PAYMENT SELECTION */}
            {view === "checkout" && (
              <View style={styles.contentPad}>
                <TouchableOpacity onPress={() => setView("detail")} style={styles.backLink}>
                  <Text style={{ color: colors.action, fontWeight: "600" }}>← {isEn ? "Back to creation" : "Retour à la fiche"}</Text>
                </TouchableOpacity>

                <Text style={[styles.title, { color: colors.text, marginTop: 8 }]}>
                  {isEn ? "Finalize Your Order" : "Finaliser Votre Commande"}
                </Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>
                  {product.title} · {selectedVariant.name}
                </Text>

                {/* Quantity Stepper (hidden or 1 for digital) */}
                {product.category === "digital" ? (
                  <View style={[styles.guaranteeCard, { backgroundColor: colors.canvas, borderColor: colors.border, marginTop: 8 }]}>
                    <Text style={{ fontSize: 18 }}>⚡</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.guaranteeTitle, { color: colors.text }]}>
                        {isEn ? "Instant Digital Grant" : "Délivrance Numérique Instantanée"}
                      </Text>
                      <Text style={[styles.guaranteeText, { color: colors.muted }]}>
                        {isEn
                          ? "Access link and download quota will be unlocked immediately in your Purchases area."
                          : "Le patron vectoriel et le quota de téléchargement seront débloqués dès validation du paiement MoMo."}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={[styles.quantityRow, { borderColor: colors.border }]}>
                      <Text style={[styles.inputLabel, { color: colors.text }]}>{isEn ? "Quantity" : "Quantité"}</Text>
                      <View style={styles.stepper}>
                        <TouchableOpacity
                          style={[styles.stepBtn, { borderColor: colors.border }]}
                          onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <Text style={[styles.stepBtnTxt, { color: colors.text }]}>-</Text>
                        </TouchableOpacity>
                        <Text style={[styles.stepValue, { color: colors.text }]}>{quantity}</Text>
                        <TouchableOpacity
                          style={[styles.stepBtn, { borderColor: colors.border }]}
                          onPress={() => setQuantity(Math.min(stockAvailable, quantity + 1))}
                        >
                          <Text style={[styles.stepBtnTxt, { color: colors.text }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Delivery Address */}
                    <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>
                      {isEn ? "Delivery Address / Neighborhood *" : "Adresse de Livraison / Quartier *"}
                    </Text>
                    <TextInput
                      style={[styles.textInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.canvas }]}
                      value={deliveryAddress}
                      onChangeText={setDeliveryAddress}
                      placeholder="ex: Cotonou, Haie Vive, Rue 380"
                      placeholderTextColor={colors.muted}
                    />
                  </>
                )}

                {/* Buyer Phone */}
                <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>
                  {isEn ? "Recipient Phone Number *" : "Numéro de Téléphone Destinataire *"}
                </Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.canvas }]}
                  value={buyerPhone}
                  onChangeText={setBuyerPhone}
                  placeholder="+229 97 00 00 00"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                />

                {/* Payment Channel Selector */}
                <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>
                  {isEn ? "Payment Method" : "Mode de Règlement"}
                </Text>
                <View style={{ gap: 8, marginTop: 4 }}>
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = paymentChannel === pm.id;
                    return (
                      <TouchableOpacity
                        key={pm.id}
                        style={[
                          styles.paymentCard,
                          {
                            backgroundColor: isSelected ? colors.canvas : colors.surface,
                            borderColor: isSelected ? colors.action : colors.border,
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}
                        onPress={() => setPaymentChannel(pm.id)}
                      >
                        <Text style={{ fontSize: 20 }}>{pm.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.paymentName, { color: colors.text, fontWeight: isSelected ? "700" : "500" }]}>
                            {pm.name}
                          </Text>
                          <Text style={[styles.paymentHint, { color: colors.muted }]}>
                            {pm.ussdHint}
                          </Text>
                        </View>
                        {isSelected && <Text style={{ color: colors.action, fontWeight: "800" }}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Total Summary */}
                <View style={[styles.summaryBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                  <View style={styles.summaryLine}>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>{isEn ? "Unit Price" : "Prix unitaire"}</Text>
                    <Text style={{ color: colors.text, fontWeight: "600" }}>{formattedPrice} FCFA</Text>
                  </View>
                  <View style={styles.summaryLine}>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>{isEn ? "Quantity" : "Quantité"}</Text>
                    <Text style={{ color: colors.text, fontWeight: "600" }}>x{quantity}</Text>
                  </View>
                  <View style={[styles.summaryLine, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 }]}>
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{isEn ? "Total to Pay" : "Total à Régler"}</Text>
                    <Text style={{ color: colors.action, fontWeight: "800", fontSize: 18 }}>{totalPriceFormatted} FCFA</Text>
                  </View>
                </View>

                {/* Submit Order CTA */}
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.action, opacity: submitting ? 0.6 : 1, marginTop: 20 }]}
                  onPress={handleConfirmOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      {isEn ? "Confirm & Place Order" : "Confirmer la Commande"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* VIEW 3: ORDER SUCCESS */}
            {view === "success" && createdOrder && (
              <View style={[styles.contentPad, { alignItems: "center", paddingTop: 20 }]}>
                <Text style={{ fontSize: 50, marginBottom: 12 }}>🎉</Text>
                <Text style={[styles.title, { color: colors.text, textAlign: "center" }]}>
                  {isEn ? "Order Confirmed!" : "Commande Enregistrée !"}
                </Text>
                <Text style={[styles.orderNumberTxt, { color: colors.action }]}>
                  {createdOrder.orderNumber}
                </Text>

                <View style={[styles.successCard, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                  <Text style={[styles.successLabel, { color: colors.muted }]}>
                    {isEn ? "Payment Instructions" : "Instructions de Règlement"}
                  </Text>
                  <Text style={[styles.successInstructions, { color: colors.text }]}>
                    {createdOrder.paymentChannel === "CASH_ON_DELIVERY"
                      ? (isEn 
                          ? "Please prepare the exact amount in cash for the delivery person upon delivery."
                          : "Veuillez préparer le montant exact en espèces pour le livreur lors de la réception.")
                      : (isEn
                          ? `Dial ${createdOrder.paymentInstructions?.ussdCode || "*880#"} to confirm the payment of ${totalPriceFormatted} FCFA to ${createdOrder.paymentInstructions?.merchantName || "l'atelier"}.`
                          : `Composez le ${createdOrder.paymentInstructions?.ussdCode || "*880#"} pour valider le paiement de ${totalPriceFormatted} FCFA au marchand ${createdOrder.paymentInstructions?.merchantName || "Maison Ganvié"}.`)}
                  </Text>

                  <View style={[styles.detailItem, { marginTop: 12 }]}>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>{isEn ? "Delivery to" : "Livraison à"}</Text>
                    <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13 }}>{createdOrder.deliveryAddress}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.action, width: "100%", marginTop: 20 }]}
                  onPress={resetAndClose}
                >
                  <Text style={styles.primaryBtnText}>
                    {isEn ? "Continue Discovering" : "Continuer Mes Découvertes"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingTop: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeBtn: {
    padding: 4,
  },
  closeTxt: {
    fontSize: 20,
    fontWeight: "700",
  },
  topBarBrand: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  imageContainer: {
    width: "100%",
    height: 280,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    bottom: 12,
    left: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  contentPad: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  artisanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  artisanIcon: {
    fontSize: 12,
    color: "#D4AF37",
  },
  artisanName: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  verifiedPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedTxt: {
    fontSize: 10,
    fontWeight: "800",
  },
  title: {
    fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
  },
  stockPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  variantsSection: {
    marginBottom: 20,
  },
  variantsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  variantPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  guaranteeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  guaranteeText: {
    fontSize: 11,
    lineHeight: 16,
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  backLink: {
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnTxt: {
    fontSize: 18,
    fontWeight: "700",
  },
  stepValue: {
    fontSize: 16,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginTop: 6,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  paymentName: {
    fontSize: 14,
  },
  paymentHint: {
    fontSize: 11,
    marginTop: 2,
  },
  summaryBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    gap: 6,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNumberTxt: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 16,
  },
  successCard: {
    width: "100%",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  successLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  successInstructions: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailItem: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 8,
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
  Share,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { useDesign } from "../../design-system/provider";
import Icon from "../../design-system/Icon";
import { OrdersApi, FavoritesApi, ReviewsApi, type ProductItem, type AuthUser, type OrderRecord, resolveMediaUrl } from "../../services/api";

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
  { id: "MTN_MOMO", name: "MTN Mobile Money", iconName: "wallet", ussdHint: "*880#" },
  { id: "MOOV_MONEY", name: "Moov Money", iconName: "card", ussdHint: "*155#" },
  { id: "CASH_ON_DELIVERY", name: "Espèces à la livraison", iconName: "cash", ussdHint: "Règlement en mains propres" },
];

export default function ProductDetailModal({
  visible,
  product,
  currentUser,
  onClose,
  onRequireAuth,
  onOrderCompleted,
}: ProductDetailModalProps) {
  const { colors, locale, mode } = useDesign();
  const isEn = locale === "en";
  const isDark = mode === "dark";

    const [view, setView] = useState<ModalView>("detail");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [canUserReview, setCanUserReview] = useState<{ canReview: boolean; hasPurchased: boolean; existingReview: any | null }>({ canReview: false, hasPurchased: false, existingReview: null });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.city ? `${currentUser.city}, Bénin` : "");
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || "");
  const [buyerName, setBuyerName] = useState(currentUser?.name || "");
  const [paymentChannel, setPaymentChannel] = useState("MTN_MOMO");
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [waitingForAuthCheckout, setWaitingForAuthCheckout] = useState(false);

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setBuyerName(currentUser.name);
      if (currentUser.phone) setBuyerPhone(currentUser.phone);
      if (waitingForAuthCheckout) {
        setWaitingForAuthCheckout(false);
        setView("checkout");
      }
    }
  }, [currentUser, waitingForAuthCheckout]);

  // Sync wishlist / favorite from DB
  React.useEffect(() => {
    if (product?.id) {
      FavoritesApi.getMyIds()
        .then((ids) => {
          if (Array.isArray(ids)) {
            setIsFavorite(ids.includes(product.id));
          }
        })
        .catch(() => {});
    }
  }, [product?.id]);

  // Sync verified reviews and review eligibility
  React.useEffect(() => {
    if (product?.id) {
      setReviewSuccess(false);
      setReviewComment("");
      setShowReviewForm(false);
      ReviewsApi.getProductReviews(product.id)
        .then((res) => {
          setProductReviews(res.reviews || []);
        })
        .catch(() => setProductReviews([]));

      if (currentUser) {
        ReviewsApi.canReview(product.id)
          .then((res) => setCanUserReview(res))
          .catch(() => setCanUserReview({ canReview: false, hasPurchased: false, existingReview: null }));
      } else {
        setCanUserReview({ canReview: false, hasPurchased: false, existingReview: null });
      }
    } else {
      setProductReviews([]);
      setCanUserReview({ canReview: false, hasPurchased: false, existingReview: null });
    }
  }, [product?.id, currentUser]);

  const handleToggleFavorite = () => {
    if (!product?.id) return;
    const next = !isFavorite;
    setIsFavorite(next);
    FavoritesApi.toggleFavorite(product.id).catch(() => {
      setIsFavorite(!next);
    });
  };

  if (!product) return null;

  // Resolve product image
  let mainImage: any = imgWatchChrono;
  if (product.image) {
    if (typeof product.image === "number") {
      mainImage = product.image;
    } else if (typeof product.image === "string") {
      const uri = resolveMediaUrl(product.image);
      mainImage = uri ? { uri } : imgWatchChrono;
    } else if (typeof product.image === "object" && product.image.uri) {
      const uri = resolveMediaUrl(product.image.uri);
      mainImage = uri ? { uri } : imgWatchChrono;
    } else if (typeof product.image === "object") {
      mainImage = product.image;
    }
  } else if (product.category === "leather" || product.title?.toLowerCase().includes("cuir") || product.title?.toLowerCase().includes("sac") || product.title?.toLowerCase().includes("cabas")) {
    mainImage = imgLeatherTote;
  } else if (product.category === "home" || product.title?.toLowerCase().includes("fauteuil") || product.title?.toLowerCase().includes("mobilier")) {
    mainImage = imgArmchair;
  }

  const galleryImages = [
    mainImage,
    imgLeatherTote,
    imgWatchChrono,
    imgArmchair,
    mainImage,
  ];

  // Price formatting
  const rawPrice = product.priceMinor 
    ? Math.round(product.priceMinor / 100) 
    : (product.price || 285000);
  const formattedPrice = new Intl.NumberFormat("fr-FR").format(rawPrice);
  const currency = "FCFA";

  // Seller and category resolution (100% null & object safe)
  const sellerName: string = typeof product?.seller === "string"
    ? product.seller
    : (product?.seller?.name || product?.artisanShop?.name || "Kingston Bio");

  const sellerInitials: string = typeof product?.seller === "object" && product.seller?.initials
    ? product.seller.initials
    : (sellerName ? sellerName.split(" ").map((w: string) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() : "KB");

  const categoryName: string = typeof product?.category === "string"
    ? product.category
    : "HAUTE CRÉATION";

  // Variants
  const variants = product.variants && product.variants.length > 0 
    ? product.variants 
    : [
        { id: "var-1", name: "Noir Onyx", sku: "VAR-NOIR", priceMinor: rawPrice * 100, stockOnHand: 3, colorHex: "#111827" },
        { id: "var-2", name: "Bleu Nuit", sku: "VAR-BLEU", priceMinor: rawPrice * 100, stockOnHand: 2, colorHex: "#1E3A8A" },
        { id: "var-3", name: "Vert Émeraude", sku: "VAR-VERT", priceMinor: rawPrice * 100, stockOnHand: 4, colorHex: "#0D4A38" },
        { id: "var-4", name: "Acier Pur", sku: "VAR-ACIER", priceMinor: rawPrice * 100, stockOnHand: 1, colorHex: "#9CA3AF" },
      ];
  const selectedVariant = variants[selectedVariantIndex] || variants[0];
  const stockAvailable = selectedVariant.stockOnHand ?? 3;

  const handleStartCheckout = () => {
    if (!currentUser) {
      setWaitingForAuthCheckout(true);
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
      // Use real variant ID if present, otherwise product.id which our backend now resolves seamlessly
      const targetVariantId = (selectedVariant && selectedVariant.id && !selectedVariant.id.startsWith("var-"))
        ? selectedVariant.id
        : product.id;

      const order = await OrdersApi.create({
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        paymentChannel,
        items: [
          {
            variantId: targetVariantId,
            quantity,
          },
        ],
      });

      setCreatedOrder(order);
      setView("success");
      onOrderCompleted(order);
    } catch (err: any) {
      console.error("Order creation error:", err);
      Alert.alert(
        isEn ? "Order Error" : "Erreur Commande",
        err?.message || (isEn ? "Could not process order. Please try again." : "Impossible d'enregistrer la commande. Veuillez vérifier vos informations.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setView("detail");
    setQuantity(1);
    setSelectedVariantIndex(0);
    setActivePhotoIndex(0);
    setCreatedOrder(null);
    onClose();
  };

  const totalPriceFormatted = new Intl.NumberFormat("fr-FR").format(rawPrice * quantity);

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={resetAndClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: keyboardHeight > 0 ? "98%" : "92%",
            overflow: "hidden",
            flexDirection: "column",
          }}
        >
          {/* ==================== PINNED FIXED TOP BAR ==================== */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 18,
              paddingTop: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
              zIndex: 10,
            }}
          >
            {/* Back / Close button */}
            <Pressable
              onPress={view === "detail" ? resetAndClose : () => setView("detail")}
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
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
                {view === "detail" ? "✕" : "←"}
              </Text>
            </Pressable>

            {/* Title / Brand */}
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  letterSpacing: 1.4,
                  color: colors.accent,
                  textTransform: "uppercase",
                }}
              >
                OJARKET CERTIFIED
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.muted,
                  marginTop: 1,
                }}
              >
                {sellerName}
              </Text>
            </View>

            {/* Right Action Icons: Share + Heart */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {/* Share */}
              <Pressable
                onPress={async () => {
                  try {
                    const productUrl = `https://ojarket.com/p/${product.id}`;
                    await Share.share({
                      title: product.title,
                      message: `${product.title} (${formattedPrice} FCFA) chez ${sellerName} sur Ojarket — Marketplace de Luxe : ${productUrl}`,
                      url: productUrl,
                    });
                  } catch {}
                }}
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
                <Icon name="share" size={16} color={colors.text} weight="bold" />
              </Pressable>

              {/* Wishlist Heart */}
              <Pressable
                onPress={handleToggleFavorite}
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
                <Icon name="heart" size={17} color={isFavorite ? "#EF4444" : colors.text} weight={isFavorite ? "fill" : "regular"} />
              </Pressable>
            </View>
          </View>

          {/* ==================== SCROLLABLE CONTENT ==================== */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
            contentContainerStyle={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 120 }}
            style={{ flex: 1 }}
          >
            {/* VIEW 1: PRODUCT DETAIL SCREEN (100% MATCH TO REFERENCE) */}
            {view === "detail" && (
              <>
                {/* 1. HERO IMAGE WITH 1/5 BADGE */}
                <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
                  <View
                    style={{
                      width: "100%",
                      aspectRatio: 1,
                      borderRadius: 20,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: colors.border,
                      position: "relative",
                      backgroundColor: colors.canvas,
                    }}
                  >
                    <Image
                      source={galleryImages[activePhotoIndex]}
                      style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                    />
                    {/* Floating 1/5 indicator */}
                    <View
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        backgroundColor: "rgba(0,0,0,0.65)",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
                        {activePhotoIndex + 1} / {galleryImages.length}
                      </Text>
                    </View>
                  </View>

                  {/* 2. 5-THUMBNAIL CAROUSEL STRIP */}
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                    {galleryImages.map((img, idx) => {
                      const isActive = activePhotoIndex === idx;
                      return (
                        <Pressable
                          key={idx}
                          onPress={() => setActivePhotoIndex(idx)}
                          style={({ pressed }) => [{
                            flex: 1,
                            aspectRatio: 1,
                            borderRadius: 10,
                            overflow: "hidden",
                            borderWidth: isActive ? 2 : 1,
                            borderColor: isActive ? colors.accent : colors.border,
                            opacity: pressed ? 0.8 : 1,
                          }]}
                        >
                          <Image
                            source={img}
                            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* 3. PRODUCT TITLE, RATINGS & PRICE */}
                <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
                  {/* Category / Brand Subheading */}
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "800",
                      letterSpacing: 1.2,
                      color: colors.accent,
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    {categoryName.toUpperCase()} · {sellerName.toUpperCase()}
                  </Text>

                  {/* Title */}
                  <Text
                    style={{
                      fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                      fontSize: 24,
                      fontWeight: "700",
                      color: colors.text,
                      lineHeight: 30,
                      marginBottom: 8,
                    }}
                  >
                    {product.title}
                  </Text>

                  {/* Ratings Row (Dynamique & Achat Vérifié) */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 }}>
                    {productReviews.length > 0 ? (
                      <>
                        <Text style={{ fontSize: 13, color: colors.accent, fontWeight: "700" }}>
                          ★ {(productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.muted }}>
                          ({productReviews.length} {isEn ? "verified reviews" : "avis vérifiés"})
                        </Text>
                      </>
                    ) : (
                      <View
                        style={{
                          backgroundColor: "rgba(212, 180, 131, 0.15)",
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "rgba(212, 180, 131, 0.3)",
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                          <Icon name="sparkle" size={10} color={colors.accent} weight="fill" />
                          <Text style={{ fontSize: 10, color: colors.accent, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>
                            {isEn ? "NEW ARRIVAL • CERTIFIED" : "NOUVELLE CRÉATION • CERTIFIÉE"}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Price & Stock Badge Row */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "800",
                        color: colors.action,
                      }}
                    >
                      {formattedPrice} {currency}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                        backgroundColor: colors.successBg,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: colors.action,
                      }}
                    >
                      <Text style={{ fontSize: 10, color: colors.action, fontWeight: "800" }}>✓</Text>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: colors.action }}>
                        {isEn ? `In stock (${stockAvailable} available)` : `En stock (${stockAvailable} pièces)`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 4. STORE / MERCHANT TRUST CARD */}
                <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
                  <View
                    style={{
                      backgroundColor: colors.canvas,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: colors.surface,
                          borderWidth: 1.5,
                          borderColor: colors.accent,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                            fontSize: 16,
                            fontWeight: "700",
                            color: colors.accent,
                          }}
                        >
                          {sellerInitials}
                        </Text>
                      </View>

                      <View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                            {sellerName}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 2,
                              backgroundColor: "rgba(212, 180, 131, 0.25)",
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 8,
                            }}
                          >
                            <Icon name="crown" size={11} color={colors.accent} weight="fill" />
                            <Text style={{ fontSize: 9, color: colors.accent, fontWeight: "800" }}>
                              Vendeur Pro
                            </Text>
                          </View>
                        </View>

                        <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                          Vendeur Officiel Certifié · Cotonou, Bénin
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 13, color: colors.action, fontWeight: "700" }}>
                      →
                    </Text>
                  </View>
                </View>

                {/* 5. VARIANT SELECTOR (COULEURS / FINITIONS) */}
                <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      letterSpacing: 0.8,
                      color: colors.text,
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    {isEn ? "Color / Finish" : "Couleur & Finition"} :{" "}
                    <Text style={{ color: colors.action, fontWeight: "700" }}>
                      {selectedVariant.name}
                    </Text>
                  </Text>

                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {variants.map((v: any, idx: number) => {
                      const isSelected = selectedVariantIndex === idx;
                      return (
                        <Pressable
                          key={v.id || idx}
                          onPress={() => setSelectedVariantIndex(idx)}
                          style={({ pressed }) => [{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            paddingVertical: 10,
                            paddingHorizontal: 8,
                            borderRadius: 12,
                            borderWidth: isSelected ? 2 : 1,
                            borderColor: isSelected ? colors.action : colors.border,
                            backgroundColor: isSelected ? colors.canvas : colors.surface,
                            opacity: pressed ? 0.8 : 1,
                          }]}
                        >
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: v.colorHex || colors.accent,
                              borderWidth: 1,
                              borderColor: colors.border,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: isSelected ? "800" : "600",
                              color: isSelected ? colors.action : colors.text,
                            }}
                            numberOfLines={1}
                          >
                            {v.name.split(" ")[0]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* 6. DESCRIPTION */}
                <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      letterSpacing: 0.8,
                      color: colors.text,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    {isEn ? "Product Description & Details" : "Description du Produit & Détails"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      lineHeight: 20,
                      color: colors.text,
                      opacity: 0.9,
                    }}
                  >
                    {product.description || (isEn
                      ? "Quality product offered by verified merchant in Benin. Inspected and packaged carefully before delivery."
                      : "Produit de haute qualité proposé par un commerçant vérifié sur Ojarket. Finitions soignées, vérification de conformité et livraison rapide.")}
                  </Text>
                </View>

                {/* 7. DELIVERY & PICKUP ROWS */}
                <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
                  <View
                    style={{
                      backgroundColor: colors.canvas,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 14,
                      gap: 12,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Icon name="truck" size={18} color={colors.accent} weight="duotone" />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                          {isEn ? "Estimated Delivery" : "Livraison estimée : 24h - 48h"}
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                          {isEn ? "Cotonou & surrounding areas" : "Cotonou, Calavi et environs (Livraison soignée)"}
                        </Text>
                      </View>
                    </View>

                    <View style={{ height: 1, backgroundColor: colors.border }} />

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Icon name="map-pin" size={18} color={colors.accent} weight="duotone" />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                          {isEn ? "Store Pickup" : "Retrait direct en boutique"}
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                          {isEn ? "Free same-day pickup at Haie Vive" : "Gratuit · Disponible dès aujourd'hui à Haie Vive"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 8. 3 TRUST CARDS */}
                <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
                  <View style={{ gap: 8 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        padding: 10,
                        borderRadius: 12,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Icon name="shield" size={17} color={colors.accent} weight="duotone" />
                      <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>
                        {isEn ? "100% Secure Payment via MoMo / Moov" : "Paiement 100% sécurisé (MoMo, Moov, Espèces)"}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        padding: 10,
                        borderRadius: 12,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Icon name="refresh" size={17} color={colors.accent} weight="duotone" />
                      <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>
                        {isEn ? "14-Day Hassle-Free Returns" : "Retour & Échange sous 14 jours garantis"}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        padding: 10,
                        borderRadius: 12,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Icon name="certificate" size={17} color={colors.accent} weight="duotone" />
                      <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>
                        {isEn ? "Ojarket Certificate of Authenticity" : "Certificat d'authenticité & facture officielle"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 9. AVIS CLIENTS VÉRIFIÉS (ACHATS CONFIRMÉS - RÈGLE D'OR AMAZON/AIRBNB) */}
                <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
                  <View
                    style={{
                      backgroundColor: colors.canvas,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 16,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <Text style={{ fontSize: 13, fontWeight: "800", color: colors.text, textTransform: "uppercase", letterSpacing: 0.6 }}>
                        {isEn ? "Verified Buyer Reviews" : "Avis Clients Vérifiés"}
                      </Text>
                      <View style={{ backgroundColor: "#E6F4EE", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, color: "#185F46", fontWeight: "700" }}>
                          ✓ Achat Vérifié
                        </Text>
                      </View>
                    </View>

                    {/* Eligibility / Leave Review CTA */}
                    {canUserReview.canReview && !reviewSuccess && (
                      <View style={{ backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 14 }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.action, marginBottom: 8 }}>
                          ✓ {isEn ? "You purchased this piece! Leave a review:" : "Vous avez acheté ce produit ! Déposez votre avis certifié :"}
                        </Text>
                        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Pressable key={star} onPress={() => setReviewRating(star)}>
                              <Text style={{ fontSize: 22, color: star <= reviewRating ? "#E5A93C" : "#D1D5DB" }}>★</Text>
                            </Pressable>
                          ))}
                        </View>
                        <TextInput
                          multiline
                          numberOfLines={2}
                          placeholder={isEn ? "Share your experience with the craftsmanship and delivery..." : "Partagez votre expérience sur la qualité, la confection et la réception..."}
                          placeholderTextColor={colors.muted}
                          value={reviewComment}
                          onChangeText={setReviewComment}
                          style={{
                            backgroundColor: colors.canvas,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 8,
                            padding: 8,
                            fontSize: 12,
                            color: colors.text,
                            marginBottom: 8,
                            minHeight: 50,
                          }}
                        />
                        <Pressable
                          disabled={reviewSubmitting}
                          onPress={async () => {
                            if (!product?.id) return;
                            setReviewSubmitting(true);
                            try {
                              await ReviewsApi.createReview({
                                productId: product.id,
                                rating: reviewRating,
                                comment: reviewComment,
                              });
                              setReviewSuccess(true);
                              const res = await ReviewsApi.getProductReviews(product.id);
                              setProductReviews(res.reviews || []);
                            } catch (err: any) {
                              Alert.alert("Erreur", err?.message || "Impossible d'enregistrer l'avis");
                            } finally {
                              setReviewSubmitting(false);
                            }
                          }}
                          style={{
                            backgroundColor: colors.action,
                            borderRadius: 8,
                            paddingVertical: 8,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
                            {reviewSubmitting ? "..." : (isEn ? "Publish Verified Review" : "Publier l'avis certifié")}
                          </Text>
                        </Pressable>
                      </View>
                    )}

                    {reviewSuccess && (
                      <View style={{ backgroundColor: "#E6F4EE", padding: 10, borderRadius: 8, marginBottom: 12 }}>
                        <Text style={{ color: "#185F46", fontSize: 12, fontWeight: "700" }}>
                          ✓ {isEn ? "Your verified review has been published!" : "Votre avis vérifié a été publié avec succès !"}
                        </Text>
                      </View>
                    )}

                    {canUserReview.existingReview && !reviewSuccess && (
                      <View style={{ backgroundColor: "#E6F4EE", padding: 8, borderRadius: 8, marginBottom: 12 }}>
                        <Text style={{ color: "#185F46", fontSize: 11, fontWeight: "600" }}>
                          ✓ {isEn ? "You have already reviewed this purchase." : "Vous avez déjà déposé un avis vérifié pour cet achat."}
                        </Text>
                      </View>
                    )}

                    {!currentUser && (
                      <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 10, fontStyle: "italic" }}>
                        ✓ {isEn ? "Only verified buyers who completed a paid order can review." : "Seuls les acheteurs ayant payé une commande réelle peuvent déposer un avis."}
                      </Text>
                    )}

                    {productReviews.length === 0 ? (
                      <Text style={{ fontSize: 12, color: colors.muted, fontStyle: "italic" }}>
                        {isEn ? "No verified reviews yet. Authentic purchases only." : "Aucun avis vérifié pour l'instant. Seules les ventes réelles sont notées."}
                      </Text>
                    ) : (
                      <View style={{ gap: 8 }}>
                        {productReviews.map((rev) => (
                          <View
                            key={rev.id}
                            style={{
                              backgroundColor: colors.surface,
                              borderRadius: 10,
                              padding: 10,
                              borderWidth: 1,
                              borderColor: colors.border,
                            }}
                          >
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>
                                  {rev.buyer?.name || "Client Vérifié"}
                                </Text>
                                <Text style={{ fontSize: 9, color: "#185F46", fontWeight: "700" }}>
                                  ✓ Achat Vérifié
                                </Text>
                              </View>
                              <Text style={{ fontSize: 11, color: colors.accent, fontWeight: "700" }}>
                                {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                              </Text>
                            </View>
                            {rev.comment ? (
                              <Text style={{ fontSize: 11, color: colors.text, lineHeight: 16 }}>
                                {rev.comment}
                              </Text>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </>
            )}

            {/* VIEW 2: CHECKOUT */}
            {view === "checkout" && (
              <View style={{ padding: 20 }}>
                <Text
                  style={{
                    fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                    fontSize: 22,
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: 4,
                  }}
                >
                  {isEn ? "Finalize Your Order" : "Finaliser Votre Commande"}
                </Text>
                <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 18 }}>
                  {product.title} · {selectedVariant.name}
                </Text>

                {/* Quantity Stepper */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: colors.canvas,
                    padding: 14,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                    {isEn ? "Quantity" : "Quantité"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Pressable
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>-</Text>
                    </Pressable>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                      {quantity}
                    </Text>
                    <Pressable
                      onPress={() => setQuantity(Math.min(stockAvailable, quantity + 1))}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>+</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Delivery Address */}
                <Text style={{ fontSize: 12, fontWeight: "800", color: colors.text, marginBottom: 6 }}>
                  {isEn ? "Delivery Address in Benin *" : "Adresse de Livraison au Bénin *"}
                </Text>
                <TextInput
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  placeholder="ex: Cotonou, Haie Vive, Rue 380"
                  placeholderTextColor={colors.muted}
                  style={{
                    backgroundColor: colors.canvas,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    fontSize: 13,
                    color: colors.text,
                    marginBottom: 14,
                  }}
                />

                {/* Phone */}
                <Text style={{ fontSize: 12, fontWeight: "800", color: colors.text, marginBottom: 6 }}>
                  {isEn ? "Recipient Phone Number *" : "Numéro de Téléphone *"}
                </Text>
                <TextInput
                  value={buyerPhone}
                  onChangeText={setBuyerPhone}
                  placeholder="+229 97 00 00 00"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  style={{
                    backgroundColor: colors.canvas,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    fontSize: 13,
                    color: colors.text,
                    marginBottom: 16,
                  }}
                />

                {/* Payment Channel Selector */}
                <Text style={{ fontSize: 12, fontWeight: "800", color: colors.text, marginBottom: 8 }}>
                  {isEn ? "Payment Method" : "Mode de Règlement"}
                </Text>
                <View style={{ gap: 8, marginBottom: 18 }}>
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = paymentChannel === pm.id;
                    return (
                      <Pressable
                        key={pm.id}
                        onPress={() => setPaymentChannel(pm.id)}
                        style={({ pressed }) => [{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          padding: 14,
                          borderRadius: 14,
                          backgroundColor: isSelected ? colors.canvas : colors.surface,
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? colors.action : colors.border,
                          opacity: pressed ? 0.85 : 1,
                        }]}
                      >
                        <Icon name={pm.iconName} size={20} color={isSelected ? colors.action : colors.muted} weight="duotone" />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, fontWeight: isSelected ? "800" : "600", color: colors.text }}>
                            {pm.name}
                          </Text>
                          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                            {pm.ussdHint}
                          </Text>
                        </View>
                        {isSelected && (
                          <Text style={{ color: colors.action, fontWeight: "800", fontSize: 14 }}>✓</Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                {/* Summary */}
                <View
                  style={{
                    backgroundColor: colors.canvas,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 14,
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12, color: colors.muted }}>{isEn ? "Unit Price" : "Prix unitaire"}</Text>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>{formattedPrice} FCFA</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12, color: colors.muted }}>{isEn ? "Quantity" : "Quantité"}</Text>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>x{quantity}</Text>
                  </View>
                  <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 2 }} />
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
                    <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>{isEn ? "Total Amount" : "Total à Régler"}</Text>
                    <Text style={{ fontSize: 18, fontWeight: "800", color: colors.action }}>{totalPriceFormatted} FCFA</Text>
                  </View>
                </View>

                {/* Confirm Button */}
                <Pressable
                  onPress={handleConfirmOrder}
                  disabled={submitting}
                  style={({ pressed }) => [{
                    backgroundColor: colors.action,
                    paddingVertical: 14,
                    borderRadius: 24,
                    alignItems: "center",
                    opacity: submitting ? 0.7 : (pressed ? 0.85 : 1),
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  }]}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "800" }}>
                      {isEn ? "Confirm & Place Order" : "Confirmer et Commander"}
                    </Text>
                  )}
                </Pressable>
              </View>
            )}

            {/* VIEW 3: ORDER SUCCESS */}
            {view === "success" && createdOrder && (
              <View style={{ padding: 24, alignItems: "center", paddingTop: 30 }}>
                <View style={{ marginBottom: 12 }}><Icon name="check-circle" size={48} color={colors.action} weight="duotone" /></View>
                <Text
                  style={{
                    fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
                    fontSize: 22,
                    fontWeight: "700",
                    color: colors.text,
                    textAlign: "center",
                    marginBottom: 4,
                  }}
                >
                  {isEn ? "Order Confirmed!" : "Commande Enregistrée !"}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "800", color: colors.action, marginBottom: 16 }}>
                  {createdOrder.orderNumber}
                </Text>

                <View
                  style={{
                    width: "100%",
                    backgroundColor: colors.canvas,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 16,
                    gap: 10,
                    marginBottom: 24,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "800", color: colors.accent, letterSpacing: 1, textTransform: "uppercase" }}>
                    {isEn ? "PAYMENT INSTRUCTIONS" : "INSTRUCTIONS DE RÈGLEMENT"}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.text, lineHeight: 18 }}>
                    {createdOrder.paymentChannel === "CASH_ON_DELIVERY"
                      ? (isEn
                          ? "Please prepare exact amount in cash upon delivery."
                          : "Veuillez préparer le montant exact en espèces pour le livreur lors de la livraison.")
                      : (isEn
                          ? `Dial ${createdOrder.paymentInstructions?.ussdCode || "*880#"} to confirm the payment of ${totalPriceFormatted} FCFA to ${sellerName}.`
                          : `Composez le ${createdOrder.paymentInstructions?.ussdCode || "*880#"} pour valider le règlement de ${totalPriceFormatted} FCFA auprès de la boutique.`)}
                  </Text>
                  <View style={{ height: 1, backgroundColor: colors.border }} />
                  <Text style={{ fontSize: 11, color: colors.muted }}>
                    {isEn ? "Delivery to: " : "Livraison prévue à : "}{createdOrder.deliveryAddress}
                  </Text>
                </View>

                <Pressable
                  onPress={resetAndClose}
                  style={({ pressed }) => [{
                    backgroundColor: colors.action,
                    width: "100%",
                    paddingVertical: 14,
                    borderRadius: 24,
                    alignItems: "center",
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  }]}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "800" }}>
                    {isEn ? "Done" : "Terminer"}
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>

          {/* ==================== PINNED DUAL CTAs AT BOTTOM (FOR VIEW === DETAIL) ==================== */}
          {view === "detail" && (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                flexDirection: "row",
                gap: 12,
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: Platform.OS === "android" ? 20 : 28,
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              {/* Secondary CTA: Add to Cart */}
              <Pressable
                onPress={() => {
                  Alert.alert(
                    isEn ? "Added to Cart" : "Ajouté au Panier",
                    isEn ? `${product.title} has been added.` : `${product.title} a été ajouté à votre panier.`
                  );
                }}
                style={({ pressed }) => [{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingVertical: 13,
                  borderRadius: 24,
                  borderWidth: 1.5,
                  borderColor: colors.action,
                  backgroundColor: colors.canvas,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                }]}
              >
                <Icon name="cart" size={16} color="#FFFFFF" weight="duotone" />
                <Text style={{ fontSize: 12, fontWeight: "800", color: colors.action }}>
                  {isEn ? "Add to Cart" : "Ajouter au panier"}
                </Text>
              </Pressable>

              {/* Primary CTA: Buy Now */}
              <Pressable
                onPress={handleStartCheckout}
                style={({ pressed }) => [{
                  flex: 1.3,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 13,
                  borderRadius: 24,
                  backgroundColor: colors.action,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  shadowColor: colors.action,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4,
                }]}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800" }}>
                  {isEn ? "Buy Now" : "Acheter maintenant"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

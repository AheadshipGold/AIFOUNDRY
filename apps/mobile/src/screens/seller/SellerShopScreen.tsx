import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Platform,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  StatusBar,
  Keyboard,
  Share,
  Image,
  Switch,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useDesign } from '../../design-system/provider';
import { Icon } from '../../design-system/Icon';
import {
  SellerApi,
  SellerProduct,
  SellerShopDetails,
  ShopPaymentConnection,
  SubscriptionsApi,
  SubscriptionRecord,
  PlanFeatureDefinition,
  type AuthUser,
  resolveMediaUrl,
} from '../../services/api';

const imgPlaceholder = require('../../../assets/products/watch-chrono.jpg');

export interface SellerShopScreenProps {
  currentUser?: AuthUser | null;
  onSwitchToBuyer: () => void;
  onBack?: () => void;
}

export default function SellerShopScreen({
  currentUser,
  onSwitchToBuyer,
  onBack,
}: SellerShopScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0);
  const { colors, locale, mode } = useDesign();
  const isEn = locale === 'en';
  const isDark = mode === 'dark';

  const headingFont = Platform.OS === 'android' ? 'serif' : 'Georgia';

  const activeShop = currentUser?.activeShop || (currentUser?.shops && currentUser.shops.length > 0 ? currentUser.shops[0] : null);

  // Shop details
  const [shopDetails, setShopDetails] = useState<SellerShopDetails | null>(null);

  // Products
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Payment connections
  const [paymentConnections, setPaymentConnections] = useState<ShopPaymentConnection[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [savingPayments, setSavingPayments] = useState(false);

  // Subscriptions
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [plans, setPlans] = useState<PlanFeatureDefinition[]>([]);
  const [loadingSub, setLoadingSub] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  // Add Product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('5');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('artisanat');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Storefront & Brand Profile customization
  const [storefrontTheme, setStorefrontTheme] = useState('LIGHT');
  const [bannerUrl, setBannerUrl] = useState('');
  const [shopNameInput, setShopNameInput] = useState('');
  const [shopDescInput, setShopDescInput] = useState('');
  const [shopCityInput, setShopCityInput] = useState('Cotonou');
  const [isUpdatingStorefront, setIsUpdatingStorefront] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);

  useEffect(() => {
    loadAllShopData();
  }, [currentUser, activeShop?.id]);

  const [refreshing, setRefreshing] = useState(false);

  const loadAllShopData = async () => {
    await Promise.all([
      fetchProducts(),
      fetchPaymentConnections(),
      fetchShopDetails(),
      fetchSubscriptionData(),
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllShopData();
    setRefreshing(false);
  };

  const fetchShopDetails = async () => {
    try {
      const shop = await SellerApi.getShop();
      if (shop) {
        setShopDetails(shop);
        if (shop.name) setShopNameInput(shop.name);
        if (shop.description) setShopDescInput(shop.description);
        if (shop.city) setShopCityInput(shop.city);
        if (shop.storefrontTheme) setStorefrontTheme(shop.storefrontTheme);
        if (shop.bannerUrl) setBannerUrl(shop.bannerUrl);
      }
    } catch (err) {
      console.warn('Failed to load shop details', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const prods = await SellerApi.getProducts();
      setProducts(prods || []);
    } catch (err) {
      console.warn('Failed to load seller products', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchPaymentConnections = async () => {
    try {
      setLoadingPayments(true);
      const conns = await SellerApi.getPaymentConnections();
      setPaymentConnections(conns || []);
    } catch (err) {
      console.warn('Failed to load payment connections', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchSubscriptionData = async () => {
    try {
      const shopIdToQuery = activeShop?.id || 'shop-01';
      const [sub, availablePlans] = await Promise.all([
        SubscriptionsApi.getShopSubscription(shopIdToQuery).catch(() => null),
        SubscriptionsApi.getPlans().catch(() => []),
      ]);
      setSubscription(sub);
      setPlans(availablePlans);
    } catch {
      setSubscription(null);
      setPlans([]);
    } finally {
      setLoadingSub(false);
    }
  };

  const handlePickProductImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          isEn ? 'Permission Required' : 'Autorisation requise',
          isEn ? 'Please grant photo library access to upload a creation picture.' : 'Veuillez autoriser l’accès aux photos pour joindre une photo du produit.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImageUri(asset.uri);
        setSelectedImageBase64(asset.base64 || null);
        setSelectedImageMime(asset.mimeType || null);
      }
    } catch (err) {
      console.warn('Error picking product image', err);
    }
  };

  const handleCreateProduct = async () => {
    if (!newTitle.trim()) {
      Alert.alert(isEn ? 'Title Required' : 'Titre Requis', isEn ? 'Please enter a creation title' : 'Veuillez saisir un titre');
      return;
    }
    const priceNum = parseInt(newPrice.replace(/[^\d]/g, ''), 10);
    if (!priceNum || priceNum <= 0) {
      Alert.alert(isEn ? 'Price Required' : 'Prix Requis', isEn ? 'Please enter a valid price in FCFA' : 'Veuillez entrer un prix valide en FCFA');
      return;
    }

    const stockNum = parseInt(newStock, 10) || 1;

    setIsCreatingProduct(true);
    try {
      let uploadedUrl: string | undefined = undefined;
      if (selectedImageUri) {
        try {
          uploadedUrl = await SellerApi.uploadImage(selectedImageUri, selectedImageMime, selectedImageBase64);
        } catch (uploadErr: any) {
          console.warn('Image upload error:', uploadErr);
          Alert.alert(
            isEn ? 'Photo upload failed' : 'Échec téléversement photo',
            uploadErr?.message || (isEn ? 'The photo could not be uploaded' : 'La photo n’a pas pu être téléversée')
          );
        }
      }

      await SellerApi.createProduct({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        category: newCategory,
        priceMinor: priceNum * 100,
        stockOnHand: stockNum,
        images: uploadedUrl ? [uploadedUrl] : [],
      });

      Alert.alert(
        isEn ? 'Creation Published!' : 'Création Publiée !',
        isEn ? 'Your product has been added to your catalog and is live on Ojarket.' : 'Votre création a été ajoutée à votre catalogue et est en vente sur Ojarket.'
      );

      setShowAddModal(false);
      setNewTitle('');
      setNewPrice('');
      setNewStock('5');
      setNewDescription('');
      setSelectedImageUri(null);
      setSelectedImageBase64(null);
      setSelectedImageMime(null);

      await fetchProducts();
    } catch (err: any) {
      console.warn('Error creating product:', err);
      Alert.alert(
        isEn ? 'Error' : 'Erreur',
        err?.message || (isEn ? 'Failed to create product' : 'Échec de la création du produit')
      );
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleToggleProductPublish = async (prod: SellerProduct) => {
    try {
      const nextState = !prod.isPublished;
      await SellerApi.updateProduct(prod.id, { isPublished: nextState });
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, isPublished: nextState } : p))
      );
    } catch (err: any) {
      Alert.alert(isEn ? 'Error' : 'Erreur', err?.message || 'Mise à jour impossible');
    }
  };

  const handleDeleteProduct = (prodId: string, title: string) => {
    Alert.alert(
      isEn ? 'Remove Creation?' : 'Retirer la création ?',
      isEn ? `Are you sure you want to remove "${title}" from your store?` : `Voulez-vous vraiment retirer "${title}" de votre catalogue ?`,
      [
        { text: isEn ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: isEn ? 'Remove' : 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              await SellerApi.deleteProduct(prodId);
              setProducts((prev) => prev.filter((p) => p.id !== prodId));
            } catch (err: any) {
              Alert.alert(isEn ? 'Error' : 'Erreur', err?.message || 'Suppression impossible');
            }
          },
        },
      ]
    );
  };

  const handleToggleConnection = (channel: string) => {
    setPaymentConnections((prev) =>
      prev.map((conn) => {
        if (conn.channel === channel) {
          if (!conn.platformEnabled) {
            Alert.alert(
              isEn ? 'Channel Disabled' : 'Canal Désactivé par la plateforme',
              isEn
                ? 'This payment channel is restricted at the platform level (Deny-by-Default A06).'
                : 'Ce moyen de paiement est désactivé au niveau administrateur (Protocole Deny-by-Default A06).'
            );
            return conn;
          }
          return { ...conn, shopEnabled: !conn.shopEnabled };
        }
        return conn;
      })
    );
  };

  const handlePhoneChange = (channel: string, text: string) => {
    setPaymentConnections((prev) =>
      prev.map((c) => (c.channel === channel ? { ...c, merchantPhone: text } : c))
    );
  };

  const handleSavePaymentConnections = async () => {
    try {
      setSavingPayments(true);
      const updates = paymentConnections.map((c) => ({
        channel: c.channel,
        shopEnabled: Boolean(c.shopEnabled),
        merchantPhone: c.merchantPhone,
        merchantNumber: c.merchantNumber,
      }));
      await SellerApi.updatePaymentConnections(updates);
      Alert.alert(
        isEn ? 'Payments Saved' : 'Canaux Enregistrés',
        isEn
          ? 'Your store payment preferences and merchant numbers have been updated.'
          : 'Vos préférences de règlement et vos coordonnées marchandes ont été enregistrées.'
      );
      await fetchPaymentConnections();
    } catch (err: any) {
      console.warn('Failed to save payments', err);
      Alert.alert(
        isEn ? 'Error' : 'Erreur',
        err?.message || (isEn ? 'Failed to save payments' : 'Échec de l’enregistrement')
      );
    } finally {
      setSavingPayments(false);
    }
  };

  const handlePickBannerImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          isEn ? 'Permission Required' : 'Autorisation requise',
          isEn ? 'Please grant photo library access to upload a shop banner.' : 'Veuillez autoriser l’accès aux photos pour choisir la couverture de votre boutique.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const localUri = asset.uri;
        setIsUploadingBanner(true);
        try {
          const uploadedUrl = await SellerApi.uploadImage(localUri, asset.mimeType, asset.base64);
          if (uploadedUrl) {
            setBannerUrl(uploadedUrl);
            Alert.alert(
              isEn ? 'Photo Ready' : 'Bannière Prête',
              isEn ? 'Photo uploaded. Click "Save Customization" to apply.' : 'Photo chargée avec succès. Cliquez sur "Enregistrer les modifications" pour appliquer.'
            );
          }
        } catch (uploadErr: any) {
          Alert.alert(isEn ? 'Upload Failed' : 'Échec téléversement', uploadErr?.message || 'Erreur lors du transfert de la photo.');
        } finally {
          setIsUploadingBanner(false);
        }
      }
    } catch (err) {
      console.warn('Error picking banner image', err);
      setIsUploadingBanner(false);
    }
  };

  const handleRemoveBanner = () => {
    Alert.alert(
      isEn ? 'Remove Banner' : 'Retirer la couverture',
      isEn
        ? 'Do you want to remove the custom banner and revert to the default workshop pattern?'
        : 'Voulez-vous retirer l’image de couverture personnalisée et revenir au motif d’atelier par défaut ?',
      [
        { text: isEn ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: isEn ? 'Remove' : 'Retirer',
          style: 'destructive',
          onPress: () => {
            setBannerUrl('');
          },
        },
      ]
    );
  };

  const handleUpdateStorefront = async () => {
    try {
      setIsUpdatingStorefront(true);
      await SellerApi.updateShop({
        name: shopNameInput.trim() || undefined,
        description: shopDescInput.trim() || undefined,
        city: shopCityInput.trim() || undefined,
        storefrontTheme,
        bannerUrl: bannerUrl.trim() || null,
      });
      Alert.alert(
        isEn ? 'Storefront Saved' : 'Boutique Mise à Jour',
        isEn ? 'Your shop profile and storefront customization have been saved.' : 'Les informations et la vitrine de votre boutique ont été enregistrées avec succès.'
      );
      await fetchShopDetails();
    } catch (err: any) {
      Alert.alert(isEn ? 'Error' : 'Erreur', err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsUpdatingStorefront(false);
    }
  };

  const handleShareStore = async () => {
    try {
      const shopSlug = shopDetails?.slug || activeShop?.slug || activeShop?.id || 'boutique';
      const shopName = shopDetails?.name || activeShop?.name || 'Ma Boutique';
      const url = `https://www.ojarket.com/shop/${shopSlug}`;
      await Share.share({
        title: `${shopName} sur Ojarket`,
        message: isEn
          ? `Discover "${shopName}" on Ojarket — Luxury Creations & Certified Merchant Storefront: ${url}`
          : `Découvrez "${shopName}" sur Ojarket — Pièces d'exception & Boutique certifiée : ${url}`,
        url: url,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleShareProduct = async (product: any) => {
    try {
      const url = `https://www.ojarket.com/p/${product.id}`;
      const priceFormatted = Math.round(product.priceMinor / 100).toLocaleString('fr-FR');
      const shopName = shopDetails?.name || activeShop?.name || 'Ma Boutique';
      await Share.share({
        title: product.title,
        message: isEn
          ? `Discover "${product.title}" (${priceFormatted} ${product.currency || 'FCFA'}) by ${shopName} on Ojarket: ${url}`
          : `Découvrez "${product.title}" (${priceFormatted} ${product.currency || 'FCFA'}) chez ${shopName} sur Ojarket : ${url}`,
        url: url,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* ==================== PINNED FIXED TOP BAR ==================== */}
      <View
        style={[
          styles.appBar,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
            paddingTop: topInset > 0 ? topInset + 6 : (Platform.OS === 'android' ? 36 : 16),
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.canvas,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.75 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              }]}
            >
              <Icon name="arrow-left" size={16} color={colors.action} />
            </Pressable>
          ) : (
            <View style={{ width: 36 }} />
          )}

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 9,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: colors.accent,
                fontWeight: '800',
              }}
            >
              {isEn ? 'MERCHANT OS' : 'COMMERCE BOUTIQUE'}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                fontFamily: headingFont,
                color: colors.text,
              }}
            >
              {shopDetails?.name || activeShop?.name || 'Ma Boutique'}
            </Text>
          </View>

          <Pressable
            onPress={handleShareStore}
            style={({ pressed }) => [{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.canvas,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.75 : 1,
            }]}
          >
            <Icon name="share" size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        {/* ==================== STORE IDENTITY CARD ==================== */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.muted }]}>
            {isEn ? 'VERIFIED MERCHANT STORE' : 'BOUTIQUE COMMERÇANTE VÉRIFIÉE'}
          </Text>

          <Text style={[styles.title, { fontFamily: headingFont, color: colors.text }]}>
            {shopDetails?.name || activeShop?.name || 'Ma Boutique'}
            {shopDetails?.craftType ? ` · ${shopDetails.craftType}` : ''}
          </Text>

          <View style={styles.badgeRow}>
            {activeShop?.kycStatus === 'PENDING' ? (
              <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderWidth: 1, borderColor: '#F59E0B' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="clock" size={11} color="#D97706" />
                  <Text style={[styles.badgeText, { color: '#D97706' }]}>
                    {isEn ? 'KYC Pending' : 'Validation Boutique en cours'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: '#10B981' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="crown" size={11} color="#10B981" />
                  <Text style={[styles.badgeText, { color: '#10B981' }]}>
                    {isEn ? 'Verified Store' : 'Boutique Certifiée'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <Text style={[styles.infoText, { color: colors.muted }]}>
            {shopDetails?.city || activeShop?.city || 'Cotonou'}, {shopDetails?.country || 'Bénin'}
          </Text>
          {currentUser?.phone ? (
            <Text style={[styles.infoText, { color: colors.muted }]}>
              {currentUser.phone}
            </Text>
          ) : null}
        </View>

        {/* ==================== SAAS SUBSCRIPTION CARD ==================== */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderLeftWidth: 4,
              borderLeftColor: colors.action,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.action, letterSpacing: 1 }}>
              {isEn ? 'MERCHANT SUBSCRIPTION' : 'FORMULE BOUTIQUE & VENDEUR'}
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(196, 154, 69, 0.15)',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#C49A45' }}>
                {subscription?.planTier === 'MAISON_D_ART_PRESTIGE'
                  ? 'Boutique Prestige'
                  : subscription?.planTier === 'ATELIER_PRO'
                  ? 'Boutique Pro'
                  : 'Découverte (Gratuit)'}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
            {subscription?.planTier === 'MAISON_D_ART_PRESTIGE'
              ? 'Plan Boutique Prestige (45 000 FCFA/mois)'
              : subscription?.planTier === 'ATELIER_PRO'
              ? 'Plan Boutique Pro (15 000 FCFA/mois)'
              : 'Plan Découverte (0 FCFA/mois · 0% commission)'}
          </Text>

          <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 17, marginBottom: 12 }}>
            {subscription?.planTier === 'DECOUVERTE_FREE'
              ? (isEn
                  ? 'Limit: 5 products. Upgrade to Boutique Pro for unlimited products, order priority, and FinOps FEC accounting export.'
                  : 'Limite : 5 produits en vente. Passez en Boutique Pro pour un catalogue illimité, la gestion avancée des commandes et l’export comptable.')
              : (isEn
                  ? 'Active · 100% merchant direct payments, priority commercial requests, verified badge.'
                  : 'Formule active · 100% paiements directs marchands, accès prioritaire aux demandes clients.')}
          </Text>

          <Pressable
            onPress={() => setShowPlanModal(true)}
            style={({ pressed }) => [{
              backgroundColor: colors.canvas,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
            }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="gear" size={13} color={colors.text} />
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>
                {isEn ? 'Change Plan / Manage Subscription' : 'Changer de formule / Gérer l’abonnement'}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* ==================== STATS ROW ==================== */}
        <View style={styles.cardRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{products.length}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              {isEn ? 'Creations Listed' : 'Créations en vente'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.action }]}>
              {products.filter((p) => p.isPublished !== false).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              {isEn ? 'Published Online' : 'Visibles en ligne'}
            </Text>
          </View>
        </View>

        {/* ==================== PRODUCT CATALOG SECTION ==================== */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isEn ? 'Products for Sale' : 'Catalogue des Produits'}
          </Text>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={({ pressed }) => [{
              backgroundColor: colors.action,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            }]}
          >
            <Icon name="plus" size={14} color="#FFFFFF" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>
              {isEn ? 'Add Product' : 'Ajouter un Produit'}
            </Text>
          </Pressable>
        </View>

        {loadingProducts ? (
          <View style={{ padding: 30, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.action} />
          </View>
        ) : products.length > 0 ? (
          products.map((item) => {
            const firstImg = item.images?.[0] || item.image;
            const resolvedImg = firstImg ? resolveMediaUrl(firstImg) : null;
            const isPublished = item.isPublished !== false;

            return (
              <View
                key={item.id}
                style={[
                  styles.catalogItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: isPublished ? 1 : 0.7,
                  },
                ]}
              >
                <Image
                  source={resolvedImg ? { uri: resolvedImg } : imgPlaceholder}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.canvas,
                  }}
                />

                <View style={styles.catalogItemContent}>
                  <Text style={[styles.catalogItemTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.catalogItemPrice, { color: colors.action, fontWeight: '800' }]}>
                    {Math.round(item.priceMinor / 100).toLocaleString('fr-FR')} {item.currency || 'FCFA'}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                    Stock : {item.stockOnHand ?? 1} · {item.category}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  {/* Publish/Unpublish toggle */}
                  <Pressable
                    onPress={() => handleToggleProductPublish(item)}
                    style={({ pressed }) => [{
                      backgroundColor: isPublished ? 'rgba(16, 185, 129, 0.15)' : 'rgba(156, 163, 175, 0.2)',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      opacity: pressed ? 0.75 : 1,
                    }]}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '800',
                        color: isPublished ? '#10B981' : colors.muted,
                      }}
                    >
                      {isPublished ? (isEn ? 'Published' : 'En ligne') : (isEn ? 'Draft' : 'Retiré')}
                    </Text>
                  </Pressable>

                  {/* Action row: Share product + Delete */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Pressable
                      onPress={() => handleShareProduct(item)}
                      style={({ pressed }) => [{
                        padding: 4,
                        opacity: pressed ? 0.6 : 1,
                      }]}
                      hitSlop={8}
                    >
                      <Icon name="share" size={14} color={colors.accent} weight="bold" />
                    </Pressable>

                    {/* Delete button */}
                    <Pressable
                      onPress={() => handleDeleteProduct(item.id, item.title)}
                      style={({ pressed }) => [{
                        padding: 4,
                        opacity: pressed ? 0.6 : 1,
                      }]}
                      hitSlop={8}
                    >
                      <Icon name="trash" size={14} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 24,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            <View style={{ marginBottom: 8 }}><Icon name="package" size={32} color={colors.muted} /></View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' }}>
              {isEn ? 'No products in store yet' : 'Aucun produit dans votre boutique'}
            </Text>
            <Text style={{ fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 4, lineHeight: 16, marginBottom: 14 }}>
              {isEn
                ? 'Add your articles and creations with photos to start selling to buyers.'
                : 'Ajoutez vos pièces d’exception avec photos pour commencer à vendre sur Ojarket.'}
            </Text>
            <Pressable
              onPress={() => setShowAddModal(true)}
              style={({ pressed }) => [{
                backgroundColor: colors.action,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                opacity: pressed ? 0.85 : 1,
              }]}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>
                {isEn ? '+ Add First Product' : '+ Ajouter mon premier produit'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* ==================== DIRECT PAYMENT CHANNELS (FR-20 & A06) ==================== */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isEn ? 'Merchant Payment Channels' : 'Canaux de Paiement de la Boutique'}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
            {isEn
              ? 'Choose which channels you accept to receive customer funds directly.'
              : 'Choisissez les moyens par lesquels vous acceptez de recevoir l’argent des acheteurs.'}
          </Text>
        </View>

        {loadingPayments ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.action} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {paymentConnections.map((conn) => {
              const isLockedByPlatform = !conn.platformEnabled;
              const isEnabled = conn.shopEnabled && !isLockedByPlatform;

              return (
                <View
                  key={conn.channel}
                  style={[
                    styles.section,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isEnabled ? colors.action : colors.border,
                      opacity: isLockedByPlatform ? 0.6 : 1,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                        {conn.name}
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                        {conn.description}
                      </Text>
                    </View>

                    <Switch
                      value={isEnabled}
                      onValueChange={() => handleToggleConnection(conn.channel)}
                      disabled={isLockedByPlatform}
                      trackColor={{ false: colors.border, true: colors.action }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  {isLockedByPlatform ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <Icon name="lock" size={11} color="#EF4444" />
                      <Text style={{ fontSize: 10, color: '#EF4444', fontWeight: '700' }}>
                        {isEn ? 'Disabled by platform (Admin A06)' : 'Désactivé au niveau plateforme (Admin A06)'}
                      </Text>
                    </View>
                  ) : null}

                  {isEnabled && (conn.category === 'MOBILE_MONEY' || conn.channel === 'DIRECT_TRANSFER') ? (
                    <View style={{ marginTop: 10 }}>
                      <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.muted, marginBottom: 4 }}>
                        {conn.category === 'MOBILE_MONEY'
                          ? (isEn ? 'Merchant Phone Number (Receives USSD Push / Transfers)' : 'Numéro Marchand Mobile Money (Réception des transferts)')
                          : (isEn ? 'Bank Account / IBAN' : 'RIB / IBAN du compte de l’atelier')}
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: colors.canvas,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          paddingVertical: 7,
                          fontSize: 12,
                          color: colors.text,
                        }}
                        value={conn.merchantPhone || ''}
                        onChangeText={(txt) => handlePhoneChange(conn.channel, txt)}
                        placeholder="+229 97 00 00 00"
                        placeholderTextColor={colors.muted}
                        keyboardType={conn.category === 'MOBILE_MONEY' ? 'phone-pad' : 'default'}
                      />
                    </View>
                  ) : null}
                </View>
              );
            })}

            {/* Save Payment Settings Button */}
            <Pressable
              onPress={handleSavePaymentConnections}
              disabled={savingPayments}
              style={({ pressed }) => [{
                backgroundColor: colors.action,
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                marginTop: 4,
                opacity: pressed || savingPayments ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              }]}
            >
              {savingPayments ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check" size={16} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                    {isEn ? 'Save Payment Channels' : 'Enregistrer mes Canaux Marchands'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* ==================== STOREFRONT CUSTOMIZATION ==================== */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isEn ? 'Storefront Customization & Brand Profile' : 'Identité & Personnalisation de la Vitrine'}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* 1. Nom de l'enseigne / Boutique */}
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
            {isEn ? 'Store / Brand Name' : 'Nom Officiel de la Boutique'}
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 10,
              fontSize: 13,
              color: colors.text,
              backgroundColor: colors.canvas,
              marginBottom: 14,
            }}
            value={shopNameInput}
            onChangeText={setShopNameInput}
            placeholder={isEn ? 'e.g. Kingston Bio' : 'ex. Kingston Bio'}
            placeholderTextColor={colors.muted}
          />

          {/* 2. Description / Bio de la boutique */}
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
            {isEn ? 'Store Presentation & Bio' : 'Présentation & Description de la Boutique'}
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 10,
              fontSize: 13,
              color: colors.text,
              backgroundColor: colors.canvas,
              marginBottom: 14,
              minHeight: 64,
            }}
            value={shopDescInput}
            onChangeText={setShopDescInput}
            multiline
            numberOfLines={3}
            placeholder={isEn ? 'Describe your brand, craftsmanship and values...' : 'Décrivez votre savoir-faire, vos créations et l’histoire de votre atelier...'}
            placeholderTextColor={colors.muted}
          />

          {/* 3. Ville d'atelier */}
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
            {isEn ? 'City / Location' : 'Ville de l’Atelier / Boutique'}
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 10,
              fontSize: 13,
              color: colors.text,
              backgroundColor: colors.canvas,
              marginBottom: 16,
            }}
            value={shopCityInput}
            onChangeText={setShopCityInput}
            placeholder="Cotonou"
            placeholderTextColor={colors.muted}
          />

          {/* 4. Thème de la vitrine */}
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
            {isEn ? 'Storefront Theme' : 'Thème de la Vitrine'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {['LIGHT', 'DARK', 'LUXURY'].map((themeOpt) => {
              const isSelected = storefrontTheme === themeOpt;
              return (
                <Pressable
                  key={themeOpt}
                  onPress={() => setStorefrontTheme(themeOpt)}
                  style={({ pressed }) => [{
                    flex: 1,
                    paddingVertical: 10,
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: isSelected ? colors.action : colors.border,
                    borderRadius: 8,
                    backgroundColor: isSelected ? (themeOpt === 'DARK' ? '#111' : themeOpt === 'LUXURY' ? '#2c2518' : '#f0f9ff') : colors.canvas,
                    opacity: pressed ? 0.8 : 1,
                  }]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: isSelected ? (themeOpt === 'LIGHT' ? colors.action : '#fff') : colors.text,
                    }}
                  >
                    {themeOpt === 'LIGHT' ? 'Ivoire' : themeOpt === 'DARK' ? 'Ébène' : 'Or Satiné'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 5. Image de couverture avec sélection photo directe & aperçu d'élite */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                {isEn ? 'Store Banner Image (Hero Header)' : 'Image de Couverture de la Vitrine'}
              </Text>
              {bannerUrl && resolveMediaUrl(bannerUrl) ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 12,
                    backgroundColor: isDark ? 'rgba(212, 180, 131, 0.15)' : '#F5EFE6',
                    borderWidth: 1,
                    borderColor: 'rgba(212, 180, 131, 0.4)',
                  }}
                >
                  <Icon name="sparkle" size={11} color={colors.accent} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: colors.accent, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {isEn ? 'Custom' : 'Active'}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={{ fontSize: 11.5, color: colors.muted, marginBottom: 12, lineHeight: 16 }}>
              {isEn
                ? 'Illuminates the top of your public merchant storefront (Shopify Plus & luxury standards). Recommended format: 16:9.'
                : 'Illumine le sommet de votre vitrine marchande publique. Recommandé : ratio 16:9 (paysage).'}
            </Text>

            {bannerUrl && resolveMediaUrl(bannerUrl) ? (
              <View
                style={{
                  marginBottom: 12,
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderWidth: 1.5,
                  borderColor: 'rgba(212, 180, 131, 0.5)',
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Image
                  source={{ uri: resolveMediaUrl(bannerUrl) || undefined }}
                  style={{ width: '100%', height: 130, resizeMode: 'cover' }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    padding: 10,
                    backgroundColor: isDark ? '#141E1C' : '#FAF8F5',
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Pressable
                    onPress={handlePickBannerImage}
                    disabled={isUploadingBanner}
                    style={({ pressed }) => [{
                      flex: 1,
                      backgroundColor: colors.action,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 6,
                      opacity: pressed || isUploadingBanner ? 0.75 : 1,
                    }]}
                  >
                    {isUploadingBanner ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Icon name="camera" size={14} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>
                          {isEn ? 'Change Photo' : 'Changer la photo'}
                        </Text>
                      </>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={handleRemoveBanner}
                    disabled={isUploadingBanner}
                    style={({ pressed }) => [{
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(229, 115, 115, 0.5)',
                      backgroundColor: isDark ? 'rgba(229, 115, 115, 0.1)' : '#FFF5F5',
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 6,
                      opacity: pressed ? 0.7 : 1,
                    }]}
                  >
                    <Icon name="trash" size={14} color="#E57373" />
                    <Text style={{ color: '#E57373', fontWeight: '600', fontSize: 12 }}>
                      {isEn ? 'Remove' : 'Retirer'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={handlePickBannerImage}
                disabled={isUploadingBanner}
                style={({ pressed }) => [{
                  backgroundColor: isDark ? 'rgba(212, 180, 131, 0.05)' : '#FAF8F5',
                  borderWidth: 1.5,
                  borderColor: colors.accent,
                  borderStyle: 'dashed',
                  borderRadius: 12,
                  paddingVertical: 22,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  gap: 8,
                  opacity: pressed || isUploadingBanner ? 0.75 : 1,
                }]}
              >
                {isUploadingBanner ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: isDark ? 'rgba(212, 180, 131, 0.15)' : '#F5EFE6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <Icon name="camera" size={22} color={colors.accent} />
                    </View>
                    <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13, textAlign: 'center' }}>
                      {isEn ? 'Select Banner Photo (Gallery)' : 'Choisir une photo de couverture (Galerie)'}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 11, textAlign: 'center' }}>
                      {isEn ? 'Format JPG, PNG or WebP from your device' : 'Format JPG, PNG ou WebP depuis votre galerie'}
                    </Text>
                  </>
                )}
              </Pressable>
            )}

            {/* Saisie Manuelle d'URL (Avancé / Optionnel) clairement explicité */}
            <Pressable
              onPress={() => setShowManualUrl(!showManualUrl)}
              style={({ pressed }) => [{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: 6,
                marginBottom: showManualUrl ? 8 : 14,
                opacity: pressed ? 0.7 : 1,
              }]}
            >
              <Icon name="link" size={13} color={colors.muted} />
              <Text style={{ fontSize: 11.5, color: colors.muted, fontWeight: '600' }}>
                {isEn
                  ? (showManualUrl ? 'Hide manual image URL option' : 'Or paste direct image URL (Advanced)')
                  : (showManualUrl ? 'Masquer la saisie manuelle d’URL' : 'Ou coller une URL d’image directe (Avancé)')}
              </Text>
              <Icon name={showManualUrl ? 'caret-up' : 'caret-down'} size={12} color={colors.muted} />
            </Pressable>

            {showManualUrl && (
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : '#F8F6F0',
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'Direct Web Image URL (HTTPS)' : 'URL directe d’image (HTTPS)'}
                </Text>
                <Text style={{ fontSize: 10.5, color: colors.muted, marginBottom: 8, lineHeight: 14 }}>
                  {isEn
                    ? 'Allows using an image already hosted on your website or external CDN.'
                    : 'Permet d’utiliser une photo déjà hébergée sur votre serveur web ou service tiers.'}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 8,
                    fontSize: 12,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  }}
                  value={bannerUrl}
                  onChangeText={setBannerUrl}
                  placeholder="https://exemple.com/images/banniere.jpg"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}
          </View>

          {/* Bouton d'enregistrement global */}
          <Pressable
            onPress={handleUpdateStorefront}
            disabled={isUpdatingStorefront}
            style={({ pressed }) => [{
              backgroundColor: colors.action,
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              opacity: pressed || isUpdatingStorefront ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            }]}
          >
            {isUpdatingStorefront ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="check" size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13.5 }}>
                  {isEn ? 'Save Store Changes' : 'Enregistrer les Modifications de la Boutique'}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Switch to Buyer Mode */}
        <Pressable
          onPress={onSwitchToBuyer}
          style={({ pressed }) => [
            styles.switchButton,
            { backgroundColor: colors.surface, borderColor: colors.action },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={[styles.switchButtonText, { color: colors.action }]}>
            {isEn ? 'Switch to Buyer Mode' : 'Passer en mode Acheteur'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* ==================== ADD PRODUCT MODAL WITH IMAGE PICKER ==================== */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              maxHeight: '92%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontFamily: headingFont, fontSize: 18, fontWeight: '700', color: colors.text }}>
                {isEn ? 'Add New Creation' : 'Ajouter une Création'}
              </Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Icon name="x" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets={true}
              contentContainerStyle={{ gap: 14, paddingBottom: 24 }}
            >
              {/* Photo Picker */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
                  {isEn ? 'Creation Photo' : 'Photo de la pièce'}
                </Text>
                <Pressable
                  onPress={handlePickProductImage}
                  style={({ pressed }) => [{
                    height: 120,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: colors.border,
                    borderStyle: selectedImageUri ? 'solid' : 'dashed',
                    backgroundColor: colors.canvas,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    opacity: pressed ? 0.8 : 1,
                  }]}
                >
                  {selectedImageUri ? (
                    <Image source={{ uri: selectedImageUri }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <View style={{ alignItems: 'center', gap: 6 }}>
                      <Icon name="camera" size={28} color={colors.accent} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent }}>
                        {isEn ? 'Choose photo from gallery' : 'Sélectionner une photo depuis la galerie'}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>

              {/* Title */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'Title / Name *' : 'Titre / Nom de la pièce *'}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.canvas,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 13,
                    color: colors.text,
                  }}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="ex: Sac de voyage en cuir cognac"
                  placeholderTextColor={colors.muted}
                />
              </View>

              {/* Category */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'Category' : 'Catégorie'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {['artisanat', 'mode', 'bijoux', 'mobilier'].map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setNewCategory(cat)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: newCategory === cat ? colors.action : colors.border,
                        backgroundColor: newCategory === cat ? colors.action : colors.canvas,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: newCategory === cat ? '#fff' : colors.text }}>
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Price & Stock */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 2 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                    {isEn ? 'Price (FCFA) *' : 'Prix de vente (FCFA) *'}
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: colors.canvas,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 10,
                      padding: 10,
                      fontSize: 13,
                      color: colors.text,
                    }}
                    value={newPrice}
                    onChangeText={setNewPrice}
                    placeholder="45 000"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                    {isEn ? 'Stock' : 'Stock dispo'}
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: colors.canvas,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 10,
                      padding: 10,
                      fontSize: 13,
                      color: colors.text,
                    }}
                    value={newStock}
                    onChangeText={setNewStock}
                    placeholder="5"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Description */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'Description' : 'Description de la création'}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.canvas,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 13,
                    color: colors.text,
                    minHeight: 70,
                    textAlignVertical: 'top',
                  }}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  placeholder="Matières, confection, finitions..."
                  placeholderTextColor={colors.muted}
                  multiline
                />
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleCreateProduct}
                disabled={isCreatingProduct}
                style={({ pressed }) => [{
                  backgroundColor: colors.action,
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: 'center',
                  opacity: pressed || isCreatingProduct ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  marginBottom: 10,
                }]}
              >
                {isCreatingProduct ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>
                    {isEn ? 'Publish Creation to Store' : 'Publier et Mettre en Vente'}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================== SUBSCRIPTIONS MODAL ==================== */}
      {showPlanModal && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPlanModal(false)}
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
                <Text style={{ fontFamily: headingFont, fontSize: 18, fontWeight: '700', color: colors.text }}>
                  {isEn ? 'Merchant Store Plans' : 'Formules d’Abonnement Boutique'}
                </Text>
                <Pressable onPress={() => setShowPlanModal(false)}>
                  <Icon name="x" size={20} color={colors.muted} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
                {[
                  {
                    tier: 'DECOUVERTE_FREE',
                    title: 'Découverte (Gratuit)',
                    price: '0 FCFA',
                    subtitle: '5 créations · 0% commission',
                    desc: 'Idéal pour démarrer votre première vitrine sur Ojarket.',
                  },
                  {
                    tier: 'ATELIER_PRO',
                    title: 'Boutique Pro',
                    price: '15 000 FCFA/mois',
                    subtitle: 'Créations illimitées · Priorité commandes · Export FEC',
                    desc: 'Pour les ateliers et boutiques installés souhaitant maximiser leurs ventes régionales.',
                  },
                  {
                    tier: 'MAISON_D_ART_PRESTIGE',
                    title: 'Maison d’Art Prestige',
                    price: '45 000 FCFA/mois',
                    subtitle: 'Concierge VIP · D02 illimité · Vitrine premium',
                    desc: 'Pour les galeries et créateurs d’exception à rayonnement international.',
                  },
                ].map((plan) => {
                  const isCurrent = (subscription?.planTier || 'DECOUVERTE_FREE') === plan.tier;
                  return (
                    <View
                      key={plan.tier}
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        borderWidth: 1.5,
                        borderColor: isCurrent ? colors.action : colors.border,
                        backgroundColor: colors.canvas,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                          {plan.title}
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.action }}>
                          {plan.price}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.accent, marginTop: 2 }}>
                        {plan.subtitle}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>
                        {plan.desc}
                      </Text>
                      {isCurrent ? (
                        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Icon name="check-circle" size={14} color={colors.action} />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.action }}>
                            {isEn ? 'Current Plan' : 'Formule Actuelle'}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 110,
  },
  section: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  infoText: {
    fontSize: 12,
    marginBottom: 2,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  sectionHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  catalogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  catalogItemContent: {
    flex: 1,
  },
  catalogItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  catalogItemPrice: {
    fontSize: 13,
  },
  switchButton: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    marginTop: 8,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
});

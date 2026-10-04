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
  KeyboardAvoidingView,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesign } from '../../design-system/provider';
import {
  SubscriptionsApi,
  SubscriptionRecord,
  PlanFeatureDefinition,
  type AuthUser,
  type AuthShop,
} from '../../services/api';

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
  const { colors, locale } = useDesign();
  const isEn = locale === 'en';

  const headingFont = Platform.OS === 'android' ? 'serif' : 'Georgia';

  const activeShop = currentUser?.activeShop || (currentUser?.shops && currentUser.shops.length > 0 ? currentUser.shops[0] : null);
  const isDemo = currentUser?.email === 'demo@ojarket.test' || currentUser?.email === 'alexandre@ojarket.test';

  const defaultMockItems = [
    { id: '1', title: isEn ? 'Genuine leather bag' : 'Sac en cuir véritable', price: '45 000 FCFA', stock: 4 },
    { id: '2', title: isEn ? 'Minimalist wallet' : 'Portefeuille minimaliste', price: '15 000 FCFA', stock: 8 },
    { id: '3', title: isEn ? 'Leather belt' : 'Ceinture en cuir surpiqué', price: '20 000 FCFA', stock: 2 },
  ];

  const [catalogItems, setCatalogItems] = useState(isDemo ? defaultMockItems : []);

  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [plans, setPlans] = useState<PlanFeatureDefinition[]>([]);
  const [loadingSub, setLoadingSub] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('3');
  const [newDescription, setNewDescription] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [storefrontTheme, setStorefrontTheme] = useState('Light');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

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

  useEffect(() => {
    fetchSubscriptionData();
  }, [currentUser]);

  const handleUpgrade = async (tier: string, title: string, priceFcfa: number) => {
    setUpgradingTier(tier);
    try {
      const shopIdToQuery = activeShop?.id || 'shop-01';
      const updated = await SubscriptionsApi.upgradePlan({
        shopId: shopIdToQuery,
        planTier: tier,
        billingSource: 'MTN_MOMO',
        billingInterval: 'MONTHLY',
        paymentReference: `MOMO-SUB-${Date.now()}`,
      });
      setSubscription(updated);
      setShowPlanModal(false);
      Alert.alert(
        isEn ? 'Plan Activated!' : 'Formule Activée !',
        isEn
          ? `Your subscription to ${title} (${priceFcfa.toLocaleString()} FCFA/month) is now active via MTN MoMo.`
          : `Votre formule ${title} (${priceFcfa.toLocaleString()} FCFA/mois) est maintenant active via MTN MoMo.`
      );
    } catch {
      Alert.alert(
        isEn ? 'Plan Updated (Demo)' : 'Formule Mise à Jour (Démo)',
        isEn
          ? `Switched to ${title}.`
          : `Bascule effectuée vers ${title}.`
      );
      setShowPlanModal(false);
    } finally {
      setUpgradingTier(null);
    }
  };

  const handleCreateProduct = () => {
    if (!newTitle.trim()) {
      Alert.alert(isEn ? 'Title Required' : 'Titre Requis', isEn ? 'Please enter a creation title' : 'Veuillez saisir un titre');
      return;
    }
    const priceNum = parseInt(newPrice.replace(/\s+/g, ''), 10);
    if (!priceNum || priceNum <= 0) {
      Alert.alert(isEn ? 'Price Required' : 'Prix Requis', isEn ? 'Please enter a valid price' : 'Veuillez entrer un prix valide');
      return;
    }

    const stockNum = parseInt(newStock, 10) || 1;
    const newItem = {
      id: `prod_${Date.now()}`,
      title: newTitle.trim(),
      price: `${priceNum.toLocaleString('fr-FR')} FCFA`,
      stock: stockNum,
    };

    setCatalogItems([newItem, ...catalogItems]);
    setShowAddModal(false);
    setNewTitle('');
    setNewPrice('');
    setNewStock('3');
    setNewDescription('');

    Alert.alert(
      isEn ? 'Product Published!' : 'Produit Mis en Vente !',
      isEn ? 'Your product is now listed in your store catalog.' : 'Votre produit a été enregistré et mis en vente dans votre boutique.'
    );
  };

  const handleShareStore = async () => {
    try {
      const shopSlug = activeShop?.id || 'my-shop';
      const url = `https://ojarket.bj/shop/${shopSlug}`;
      await Share.share({
        message: isEn ? `Check out my store on Ojarket: ${url}` : `Découvrez ma boutique sur Ojarket: ${url}`,
        url: url,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStorefront = () => {
    setIsUpdatingProfile(true);
    // Simulate API call
    setTimeout(() => {
      setIsUpdatingProfile(false);
      Alert.alert(
        isEn ? 'Storefront Updated' : 'Vitrine Mise à Jour',
        isEn ? 'Your storefront customization has been saved.' : 'La personnalisation de votre vitrine a été enregistrée.'
      );
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Header with Back Button */}
      <View style={[styles.appBar, { borderBottomColor: colors.border, paddingTop: topInset > 0 ? topInset + 6 : (Platform.OS === 'android' ? 36 : 16) }]}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.action }]}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <Text style={[styles.appBarTitle, { color: colors.text }]}>
          {isEn ? 'My Store' : 'Ma Boutique'}
        </Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Store Profile Header */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.muted }]}>
            {isEn ? 'VERIFIED MERCHANT STORE' : "BOUTIQUE COMMERÇANTE VÉRIFIÉE"}
          </Text>

          <Text style={[styles.title, { fontFamily: headingFont, color: colors.text }]}>
            {activeShop?.name || currentUser?.activeShop?.name || (currentUser?.shops && currentUser.shops[0]?.name) || (isDemo ? "Boutique Cotonou #042" : "Ma Boutique")} · {activeShop?.craftType || (isEn ? 'Merchant Store' : 'Boutique & Vente')}
          </Text>

          <View style={styles.badgeRow}>
            {(activeShop?.kycStatus === 'PENDING' || (!activeShop?.isVerified && !isDemo)) ? (
              <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Text style={[styles.badgeText, { color: '#D97706' }]}>⏳ {isEn ? 'KYC Verification Pending' : 'Validation Boutique en cours'}</Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={[styles.badgeText, { color: '#10B981' }]}>✓ {isEn ? 'Verified Store' : 'Boutique Vérifiée'}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.infoText, { color: colors.muted }]}>
            {activeShop?.city || currentUser?.city || 'Cotonou'}, Bénin
          </Text>
          {currentUser?.phone ? (
            <Text style={[styles.infoText, { color: colors.muted }]}>
              {currentUser.phone}
            </Text>
          ) : null}
        </View>

        {/* SaaS Subscription Card (FR-37) */}
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
                  ? "Boutique Prestige"
                  : subscription?.planTier === 'ATELIER_PRO'
                  ? 'Boutique Pro'
                  : 'Découverte (Gratuit)'}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
            {subscription?.planTier === 'MAISON_D_ART_PRESTIGE'
              ? "Plan Boutique Prestige (45 000 FCFA/mois)"
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
            style={{
              backgroundColor: colors.canvas,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>
              ⚙️ {isEn ? 'Change Plan / Manage Subscription' : 'Changer de formule / Gérer l’abonnement'}
            </Text>
          </Pressable>
        </View>

        {/* Store Performance Cards */}
        <View style={styles.cardRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{catalogItems.length}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              {isEn ? 'Products for Sale' : 'Produits en vente'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{isDemo ? '★ 4.9' : '★ —'}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              {isDemo ? (isEn ? '124 verified reviews' : '124 avis clients') : (isEn ? 'New Store' : 'Nouvelle Boutique')}
            </Text>
          </View>
        </View>

        {/* Product Catalog Header with Add Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isEn ? 'Products for Sale' : 'Catalogue des Produits'}
          </Text>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={{
              backgroundColor: colors.action,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
              {isEn ? '+ Add Product' : '+ Ajouter un Produit'}
            </Text>
          </Pressable>
        </View>

        {catalogItems.length > 0 ? (
          catalogItems.map((item) => (
            <View key={item.id} style={[styles.catalogItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.catalogItemContent}>
                <Text style={[styles.catalogItemTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.catalogItemPrice, { color: colors.action, fontWeight: '700' }]}>
                  {item.price}
                </Text>
              </View>
              <View style={[styles.stockBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={[styles.stockBadgeText, { color: '#10B981', fontWeight: '700' }]}>
                  {item.stock > 0 ? (isEn ? `● ${item.stock} in stock` : `● ${item.stock} en stock`) : (isEn ? 'Out of stock' : 'Rupture')}
                </Text>
              </View>
            </View>
          ))
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
            <Text style={{ fontSize: 28, marginBottom: 8 }}>📦</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' }}>
              {isEn ? 'No products in store yet' : 'Aucun produit dans votre boutique'}
            </Text>
            <Text style={{ fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 4, lineHeight: 16, marginBottom: 14 }}>
              {isEn
                ? 'Add your articles and products to start selling to buyers across the marketplace.'
                : 'Ajoutez vos articles et produits pour commencer à vendre et recevoir des commandes sur Ojarket.'}
            </Text>
            <Pressable
              onPress={() => setShowAddModal(true)}
              style={{
                backgroundColor: colors.action,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>
                {isEn ? '+ Add First Product' : '+ Ajouter mon premier produit'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Direct payment channels */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isEn ? 'Payment Channels' : 'Canaux de paiement acceptés'}
          </Text>
        </View>

        {[
          'MTN Mobile Money (*880#)',
          'Moov Money Bénin (*155#)',
          isEn ? 'Cash on delivery / in store' : 'Espèces à la boutique / livraison',
        ].map((channel, i) => (
          <View key={i} style={[styles.channelItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.channelText, { color: colors.text }]}>{channel}</Text>
            <Text style={[styles.channelStatus, { color: colors.action, fontWeight: '700' }]}>
              {isEn ? '(Active)' : '(Actif)'}
            </Text>
          </View>
        ))}

        {/* Storefront Customization */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isEn ? 'Storefront Customization' : 'Personnalisation Vitrine'}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            {isEn ? 'Direct Shop URL' : 'Lien direct de votre boutique'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flex: 1, backgroundColor: colors.canvas, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 13, color: colors.muted }} numberOfLines={1}>
                https://ojarket.bj/shop/{activeShop?.id || 'my-shop'}
              </Text>
            </View>
            <Pressable
              onPress={handleShareStore}
              style={{
                marginLeft: 12,
                backgroundColor: colors.action,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
                {isEn ? 'Share' : 'Partager'}
              </Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            {isEn ? 'Storefront Theme' : 'Thème de la Vitrine'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {['Light', 'Dark', 'Luxury'].map((themeOpt) => (
              <Pressable
                key={themeOpt}
                onPress={() => setStorefrontTheme(themeOpt)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: storefrontTheme === themeOpt ? colors.action : colors.border,
                  borderRadius: 8,
                  backgroundColor: storefrontTheme === themeOpt ? (themeOpt === 'Dark' ? '#111' : themeOpt === 'Luxury' ? '#2c2518' : '#f0f9ff') : colors.canvas,
                }}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: storefrontTheme === themeOpt ? (themeOpt === 'Light' ? colors.action : '#fff') : colors.text
                }}>
                  {themeOpt}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            {isEn ? 'Cover Banner URL' : 'Image de couverture (URL)'}
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
            value={bannerUrl}
            onChangeText={setBannerUrl}
            placeholder="https://..."
            placeholderTextColor={colors.muted}
          />

          <Pressable
            onPress={handleUpdateStorefront}
            disabled={isUpdatingProfile}
            style={{
              backgroundColor: colors.text,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            {isUpdatingProfile ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Text style={{ color: colors.surface, fontWeight: '700', fontSize: 13 }}>
                {isEn ? 'Save Customization' : 'Enregistrer la personnalisation'}
              </Text>
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

      {/* SaaS Subscription Plans Modal (FR-37) */}
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
                  👑 {isEn ? 'Merchant Store Plans' : 'Formules d’Abonnement Boutique'}
                </Text>
                <Pressable onPress={() => setShowPlanModal(false)}>
                  <Text style={{ fontSize: 18, color: colors.text, padding: 4 }}>✕</Text>
                </Pressable>
              </View>

              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 16 }}>
                {isEn
                  ? '0% commission on sales. Keep 100% of your customer MoMo receipts.'
                  : '0% de commission sur vos ventes. Vous conservez 100% de vos encaissements clients.'}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 20 }}>
                {/* Plan 1: Découverte */}
                <View style={{ backgroundColor: colors.canvas, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>Plan Découverte</Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.action, marginVertical: 4 }}>
                    0 FCFA <Text style={{ fontSize: 12, fontWeight: '400', color: colors.muted }}>/ mois</Text>
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: 12 }}>
                    • Jusqu’à 5 produits en vente{'\n'}
                    • Livre de caisse & suivi journalier{'\n'}
                    • Encaissement MTN MoMo & Moov direct
                  </Text>
                  <Pressable
                    disabled={subscription?.planTier === 'DECOUVERTE_FREE'}
                    onPress={() => handleUpgrade('DECOUVERTE_FREE', 'Plan Découverte', 0)}
                    style={{
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: subscription?.planTier === 'DECOUVERTE_FREE' ? colors.border : colors.surface,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                      {subscription?.planTier === 'DECOUVERTE_FREE' ? '✓ Plan Actuel' : 'Choisir la formule'}
                    </Text>
                  </Pressable>
                </View>

                {/* Plan 2: Boutique Pro */}
                <View style={{ backgroundColor: colors.canvas, borderRadius: 14, padding: 16, borderWidth: 2, borderColor: colors.action }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>Plan Boutique Pro</Text>
                    <View style={{ backgroundColor: colors.action, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>RECOMMANDÉ</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.action, marginVertical: 4 }}>
                    15 000 FCFA <Text style={{ fontSize: 12, fontWeight: '400', color: colors.muted }}>/ mois</Text>
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: 12 }}>
                    • Produits & articles illimités{'\n'}
                    • Accès prioritaire aux demandes acheteurs{'\n'}
                    • Badge Commerçant Vérifié{'\n'}
                    • Export comptable certifié
                  </Text>
                  <Pressable
                    disabled={upgradingTier === 'ATELIER_PRO'}
                    onPress={() => handleUpgrade('ATELIER_PRO', 'Plan Boutique Pro', 15000)}
                    style={{
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: colors.action,
                      alignItems: 'center',
                    }}
                  >
                    {upgradingTier === 'ATELIER_PRO' ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                        {subscription?.planTier === 'ATELIER_PRO' ? '✓ Renouveler (MoMo)' : 'Activer Boutique Pro (15 000 FCFA) →'}
                      </Text>
                    )}
                  </Pressable>
                </View>

                {/* Plan 3: Boutique Prestige */}
                <View style={{ backgroundColor: colors.canvas, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#C49A45' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>Boutique Prestige</Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#C49A45', marginVertical: 4 }}>
                    45 000 FCFA <Text style={{ fontSize: 12, fontWeight: '400', color: colors.muted }}>/ mois</Text>
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: 12 }}>
                    • Toutes les fonctionnalités Boutique Pro{'\n'}
                    • Support prioritaire & visibilité renforcée{'\n'}
                    • Mise en avant en tête de la Marketplace{'\n'}
                    • Vente d'articles numériques et physiques
                  </Text>
                  <Pressable
                    disabled={upgradingTier === 'MAISON_D_ART_PRESTIGE'}
                    onPress={() => handleUpgrade('MAISON_D_ART_PRESTIGE', "Boutique Prestige", 45000)}
                    style={{
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: '#C49A45',
                      alignItems: 'center',
                    }}
                  >
                    {upgradingTier === 'MAISON_D_ART_PRESTIGE' ? (
                      <ActivityIndicator size="small" color="#0D2E26" />
                    ) : (
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#0D2E26' }}>
                        Activer Boutique Prestige (45 000 FCFA) →
                      </Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
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
              maxHeight: keyboardHeight > 0 ? '98%' : '90%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                {isEn ? 'Add a New Product' : 'Ajouter un Nouveau Produit'}
              </Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={true}
              contentContainerStyle={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 20 }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
                {isEn ? 'Product Name *' : 'Nom du produit / Article *'}
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
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder={isEn ? 'e.g. Leather Handbag, Smartphone, Watch...' : 'ex: Sac en cuir, Montre, Téléphone, Vêtement...'}
                placeholderTextColor={colors.muted}
              />

              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
                {isEn ? 'Price in FCFA *' : 'Prix en FCFA *'}
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.action,
                  backgroundColor: colors.canvas,
                  marginBottom: 12,
                }}
                value={newPrice}
                onChangeText={setNewPrice}
                placeholder="25000"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
              />

              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
                {isEn ? 'Stock Quantity Available' : 'Quantité en stock'}
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
                value={newStock}
                onChangeText={setNewStock}
                placeholder="5"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
              />

              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
                {isEn ? 'Product Description & Details' : 'Description du produit & Caractéristiques'}
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
                  marginBottom: 20,
                  minHeight: 60,
                }}
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder={isEn ? 'Describe your product, condition, warranty, features...' : 'Caractéristiques, état, marque, garantie...'}
                placeholderTextColor={colors.muted}
                multiline
              />

              <Pressable
                style={{
                  backgroundColor: colors.action,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
                onPress={handleCreateProduct}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                  {isEn ? 'Publish Product for Sale' : 'Mettre en vente le produit'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  backText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButtonPlaceholder: {
    width: 36,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  section: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  eyebrow: {
    fontSize: 11,
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
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 13,
    marginBottom: 2,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  catalogItemContent: {
    flex: 1,
  },
  catalogItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  catalogItemPrice: {
    fontSize: 14,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    fontSize: 11,
  },
  channelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  channelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  channelStatus: {
    fontSize: 12,
  },
  switchButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

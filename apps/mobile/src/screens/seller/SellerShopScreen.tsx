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
} from 'react-native';
import { useDesign } from '../../design-system/provider';
import {
  SubscriptionsApi,
  SubscriptionRecord,
  PlanFeatureDefinition,
} from '../../services/api';

export interface SellerShopScreenProps {
  onSwitchToBuyer: () => void;
  onBack?: () => void;
}

export default function SellerShopScreen({
  onSwitchToBuyer,
  onBack,
}: SellerShopScreenProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === 'en';

  const headingFont = Platform.OS === 'android' ? 'serif' : 'Georgia';

  const [catalogItems, setCatalogItems] = useState([
    { id: '1', title: isEn ? 'Genuine leather bag' : 'Sac en cuir véritable', price: '45 000 FCFA', stock: 4 },
    { id: '2', title: isEn ? 'Minimalist wallet' : 'Portefeuille minimaliste', price: '15 000 FCFA', stock: 8 },
    { id: '3', title: isEn ? 'Handcrafted belt' : 'Ceinture artisanale', price: '20 000 FCFA', stock: 2 },
  ]);

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

  const fetchSubscriptionData = async () => {
    try {
      const [sub, availablePlans] = await Promise.all([
        SubscriptionsApi.getShopSubscription('shop-01').catch(() => null),
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
  }, []);

  const handleUpgrade = async (tier: string, title: string, priceFcfa: number) => {
    setUpgradingTier(tier);
    try {
      const updated = await SubscriptionsApi.upgradePlan({
        shopId: 'shop-01',
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
      isEn ? 'Creation Published!' : 'Création Publiée !',
      isEn ? 'Your new creation has been registered in your workshop catalog.' : 'Votre nouvelle création a été enregistrée dans le catalogue de votre atelier.'
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Header with Back Button */}
      <View style={[styles.appBar, { borderBottomColor: colors.border }]}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.action }]}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <Text style={[styles.appBarTitle, { color: colors.text }]}>
          {isEn ? 'My Shop' : 'Ma Boutique'}
        </Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Workshop Profile Header */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.muted }]}>
            {isEn ? 'ARTISAN WORKSHOP' : "ATELIER D'ART"}
          </Text>

          <Text style={[styles.title, { fontFamily: headingFont, color: colors.text }]}>
            Atelier Cotonou #042 · {isEn ? 'Master Leathercrafter' : 'Maître Maroquinier'}
          </Text>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={[styles.badgeText, { color: '#10B981' }]}>✓ {isEn ? 'Verified' : 'Vérifié'}</Text>
            </View>
          </View>

          <Text style={[styles.infoText, { color: colors.muted }]}>
            Quartier Haie Vive, Cotonou, Bénin
          </Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>
            +229 97 00 00 00
          </Text>
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
              {isEn ? 'SAAS SUBSCRIPTION' : 'FORMULE ATELIER & SAAS'}
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
                  ? "Maison d'Art"
                  : subscription?.planTier === 'ATELIER_PRO'
                  ? 'Atelier Pro'
                  : 'Découverte (Gratuit)'}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
            {subscription?.planTier === 'MAISON_D_ART_PRESTIGE'
              ? "Plan Maison d'Art & Prestige (45 000 FCFA/mois)"
              : subscription?.planTier === 'ATELIER_PRO'
              ? 'Plan Atelier Pro (15 000 FCFA/mois)'
              : 'Plan Découverte (0 FCFA/mois · 0% commission)'}
          </Text>

          <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 17, marginBottom: 12 }}>
            {subscription?.planTier === 'DECOUVERTE_FREE'
              ? (isEn
                  ? 'Limit: 5 creations. Upgrade to Atelier Pro for unlimited items, bespoke D02 priority, and FinOps FEC audit export.'
                  : 'Limite : 5 créations. Passez en Atelier Pro pour un catalogue illimité, la priorité sur les devis D02 et l’export FEC comptable.')
              : (isEn
                  ? 'Active · 100% merchant direct payments, priority bespoke matching, verified badge.'
                  : 'Formule active · 100% paiements directs marchands, accès prioritaire aux demandes sur-mesure.')}
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

        {/* Workshop Performance Cards */}
        <View style={styles.cardRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>6</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              {isEn ? 'Active Creations' : 'Créations actives'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>★ 4.9</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              124 {isEn ? 'reviews' : 'avis vérifiés'}
            </Text>
          </View>
        </View>

        {/* Catalog Preview Header with Add Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isEn ? 'Catalog' : 'Catalogue des Créations'}
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
              {isEn ? '+ New Creation' : '+ Ajouter'}
            </Text>
          </Pressable>
        </View>

        {catalogItems.map((item) => (
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
        ))}

        {/* Direct payment channels */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isEn ? 'Payment Channels' : 'Canaux de paiement'}
          </Text>
        </View>

        {[
          'MTN Mobile Money (*880#)',
          'Moov Money Bénin (*155#)',
          isEn ? 'Cash at workshop' : "Espèces à l'atelier",
        ].map((channel, i) => (
          <View key={i} style={[styles.channelItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.channelText, { color: colors.text }]}>{channel}</Text>
            <Text style={[styles.channelStatus, { color: colors.action, fontWeight: '700' }]}>
              {isEn ? '(Active)' : '(Actif)'}
            </Text>
          </View>
        ))}

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
                  👑 {isEn ? 'Workshop Subscription Plans' : 'Formules d’Abonnement Atelier'}
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
                    • Jusqu’à 5 créations en vitrine{'\n'}
                    • Livre de caisse FinOps & clôture journalière{'\n'}
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

                {/* Plan 2: Atelier Pro */}
                <View style={{ backgroundColor: colors.canvas, borderRadius: 14, padding: 16, borderWidth: 2, borderColor: colors.action }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>Plan Atelier Pro</Text>
                    <View style={{ backgroundColor: colors.action, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>RECOMMANDÉ</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.action, marginVertical: 4 }}>
                    15 000 FCFA <Text style={{ fontSize: 12, fontWeight: '400', color: colors.muted }}>/ mois</Text>
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: 12 }}>
                    • Créations & variantes illimitées{'\n'}
                    • Accès prioritaire aux demandes sur-mesure (D02){'\n'}
                    • Badge Maître Artisan Vérifié{'\n'}
                    • Export FEC comptable certifié
                  </Text>
                  <Pressable
                    disabled={upgradingTier === 'ATELIER_PRO'}
                    onPress={() => handleUpgrade('ATELIER_PRO', 'Plan Atelier Pro', 15000)}
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
                        {subscription?.planTier === 'ATELIER_PRO' ? '✓ Renouveler (MoMo)' : 'Activer Atelier Pro (15 000 FCFA) →'}
                      </Text>
                    )}
                  </Pressable>
                </View>

                {/* Plan 3: Maison d'Art & Prestige */}
                <View style={{ backgroundColor: colors.canvas, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#C49A45' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>Maison d'Art & Prestige</Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#C49A45', marginVertical: 4 }}>
                    45 000 FCFA <Text style={{ fontSize: 12, fontWeight: '400', color: colors.muted }}>/ mois</Text>
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: 12 }}>
                    • Toutes les fonctionnalités Atelier Pro{'\n'}
                    • Conciergerie VIP & médiation dédiée 7j/7{'\n'}
                    • Mise en avant éditoriale sur la vitrine Web mondiale{'\n'}
                    • Vente de patrons & guides numériques
                  </Text>
                  <Pressable
                    disabled={upgradingTier === 'MAISON_D_ART_PRESTIGE'}
                    onPress={() => handleUpgrade('MAISON_D_ART_PRESTIGE', "Maison d'Art & Prestige", 45000)}
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
                        Activer Maison d'Art (45 000 FCFA) →
                      </Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Add Creation Modal */}
      {showAddModal && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
              maxHeight: '90%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                {isEn ? 'Add a New Creation' : 'Ajouter une Création'}
              </Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
                {isEn ? 'Creation Title *' : 'Titre de la création *'}
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
                placeholder={isEn ? 'e.g. Handmade Leather Belt' : 'ex: Ceinture en cuir patiné'}
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
                {isEn ? 'Initial Stock Available' : 'Stock disponible'}
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
                placeholder="3"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
              />

              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
                {isEn ? 'Craftsmanship & Materials Description' : 'Description & Savoir-faire'}
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
                placeholder={isEn ? 'Describe materials, technique, and care...' : 'Matériaux nobles, finitions main...'}
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
                  {isEn ? 'Publish Creation' : 'Publier la création'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
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

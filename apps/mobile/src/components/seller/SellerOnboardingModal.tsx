import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet,
  ScrollView, Platform, ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView,
} from 'react-native';
import { useDesign } from '../../design-system/provider';
import { AuthApi, getValidAuthToken, type RegisterSellerResponse, type AuthUser } from '../../services/api';

interface SellerOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onShopCreated: (result: RegisterSellerResponse) => void;
  currentUser?: AuthUser | null;
  onRequireAuth?: () => void;
}

const CRAFT_TYPES = [
  { key: 'maroquinerie', labelFr: 'Maroquinerie & Sacs', labelEn: 'Leather & Bags' },
  { key: 'joaillerie', labelFr: 'Bijoux & Montres', labelEn: 'Jewelry & Watches' },
  { key: 'mode', labelFr: 'Mode & Habillement', labelEn: 'Fashion & Clothing' },
  { key: 'mobilier', labelFr: 'Maison & Mobilier', labelEn: 'Home & Furniture' },
  { key: 'electronique', labelFr: 'Électronique & High-Tech', labelEn: 'Electronics' },
  { key: 'art', labelFr: 'Art & Décoration', labelEn: 'Art & Decor' },
  { key: 'numerique', labelFr: 'Produits Numériques', labelEn: 'Digital Products' },
  { key: 'autre', labelFr: 'Autre Commerce', labelEn: 'General Store' },
];

const CITIES = [
  'Cotonou', 'Porto-Novo', 'Abomey', 'Bohicon', 'Parakou',
  'Ouidah', 'Natitingou', 'Djougou', 'Lokossa', 'Abomey-Calavi',
];

export default function SellerOnboardingModal({
  visible,
  onClose,
  onShopCreated,
  currentUser,
  onRequireAuth,
}: SellerOnboardingModalProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === 'en';

  const [shopName, setShopName] = useState('');
  const [craftType, setCraftType] = useState('');
  const [city, setCity] = useState('Cotonou');
  const [description, setDescription] = useState('');
  const [merchantPhone, setMerchantPhone] = useState('+229');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = async () => {
    if (!shopName.trim()) {
      setError(isEn ? 'Store name is required' : 'Le nom de la boutique est obligatoire');
      return;
    }
    if (!craftType) {
      setError(isEn ? 'Select your product category' : 'Sélectionnez votre catégorie de produits');
      return;
    }

    const token = await getValidAuthToken();
    if (!token && !currentUser) {
      setError(
        isEn
          ? 'You must sign in or create an account before opening a store.'
          : 'Vous devez vous connecter ou créer un compte avant d\'enregistrer votre boutique.'
      );
      if (onRequireAuth) {
        setTimeout(() => {
          onClose();
          onRequireAuth();
        }, 1500);
      }
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await AuthApi.registerSeller({
        shopName: shopName.trim(),
        craftType,
        city,
        description: description.trim() || undefined,
        merchantPhone: merchantPhone.trim().length > 4 ? merchantPhone.trim() : undefined,
      });

      Alert.alert(
        isEn ? 'Store Registered!' : 'Boutique Enregistrée !',
        isEn
          ? 'Your store is ready! You can start adding your products and configuring your store.'
          : 'Votre boutique est créée ! Vous pouvez dès à présent ajouter vos produits et configurer votre catalogue.',
        [{ text: 'OK', onPress: () => onShopCreated(result) }]
      );
    } catch (err: any) {
      setError(
        err?.message ||
          (isEn
            ? 'Unable to register store. Please try again.'
            : 'Impossible d\'enregistrer la boutique. Veuillez réessayer.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.container, { backgroundColor: colors.surface, maxHeight: keyboardHeight > 0 ? '98%' : '90%' }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
            contentContainerStyle={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 40 : 40 }}
          >
            {/* Header */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={[styles.closeTxt, { color: colors.muted }]}>✕</Text>
            </TouchableOpacity>

            <Text style={[styles.brand, { color: colors.action }]}>OJARKET</Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEn ? 'Open Your Store' : 'Ouvrir Votre Boutique'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {isEn
                ? 'Create your merchant store and start selling your products to thousands of buyers on Ojarket.'
                : 'Créez votre boutique de vendeur et commencez à vendre vos produits à des milliers d\'acheteurs sur Ojarket.'
              }
            </Text>

            {/* Shop name */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isEn ? 'Store / Brand Name *' : 'Nom de la Boutique / Enseigne *'}
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.canvas }]}
              value={shopName}
              onChangeText={(t) => { setShopName(t); setError(''); }}
              placeholder={isEn ? 'e.g. Mode & Style Cotonou' : 'ex. Boutique Élégance Bénin'}
              placeholderTextColor={colors.muted}
            />

            {/* Craft type / Category */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isEn ? 'Product Category *' : 'Catégorie Principale de Produits *'}
            </Text>
            <View style={styles.pillsRow}>
              {CRAFT_TYPES.map((ct) => (
                <TouchableOpacity
                  key={ct.key}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: craftType === ct.key ? colors.action : colors.canvas,
                      borderColor: craftType === ct.key ? colors.action : colors.border,
                    }
                  ]}
                  onPress={() => { setCraftType(ct.key); setError(''); }}
                >
                  <Text style={{ color: craftType === ct.key ? '#fff' : colors.text, fontSize: 13 }}>
                    {isEn ? ct.labelEn : ct.labelFr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* City */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isEn ? 'City / Market Location' : 'Ville / Emplacement'}
            </Text>
            <View style={styles.pillsRow}>
              {CITIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: city === c ? colors.action : colors.canvas,
                      borderColor: city === c ? colors.action : colors.border,
                    }
                  ]}
                  onPress={() => setCity(c)}
                >
                  <Text style={{ color: city === c ? '#fff' : colors.text, fontSize: 13 }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isEn ? 'Store & Products Description' : 'Description de votre commerce & Produits'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.canvas }]}
              value={description}
              onChangeText={setDescription}
              placeholder={isEn ? 'Describe your products, brands, and commercial activity...' : 'Décrivez vos articles, marques, produits et activités commerciales...'}
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
            />

            {/* Merchant phone for Mobile Money */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isEn ? 'Merchant Mobile Money (MTN / Moov)' : 'Numéro de réception Mobile Money (MTN / Moov)'}
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.canvas }]}
              value={merchantPhone}
              onChangeText={setMerchantPhone}
              placeholder="+229 97 00 00 00"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
            />

            {/* KYC notice */}
            <View style={[styles.kycNotice, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <Text style={[styles.kycIcon]}>📋</Text>
              <Text style={[styles.kycText, { color: colors.muted }]}>
                {isEn
                  ? 'Your store will be verified for buyer trust. You can add your products immediately to start selling.'
                  : 'Votre boutique sera validée par l\'équipe Ojarket. Vous pouvez ajouter vos produits et configurer votre catalogue immédiatement.'
                }
              </Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.action, opacity: loading ? 0.6 : 1 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {isEn ? 'Create My Store' : 'Créer Ma Boutique Vendeur'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  closeTxt: {
    fontSize: 20,
    fontWeight: '600',
  },
  brand: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 14,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  kycNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 16,
    gap: 10,
  },
  kycIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  kycText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet,
  ScrollView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useDesign } from '../../design-system/provider';
import { AuthApi, type RegisterSellerResponse } from '../../services/api';

interface SellerOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onShopCreated: (result: RegisterSellerResponse) => void;
}

const CRAFT_TYPES = [
  { key: 'maroquinerie', labelFr: 'Maroquinerie', labelEn: 'Leather Goods' },
  { key: 'joaillerie', labelFr: 'Joaillerie & Bronze', labelEn: 'Jewelry & Bronze' },
  { key: 'mobilier', labelFr: 'Mobilier & Ébénisterie', labelEn: 'Furniture & Woodwork' },
  { key: 'mode', labelFr: 'Mode & Textile', labelEn: 'Fashion & Textiles' },
  { key: 'sculpture', labelFr: 'Sculpture & Art', labelEn: 'Sculpture & Art' },
  { key: 'poterie', labelFr: 'Poterie & Céramique', labelEn: 'Pottery & Ceramics' },
  { key: 'numerique', labelFr: 'Créations Numériques', labelEn: 'Digital Creations' },
  { key: 'autre', labelFr: 'Autre', labelEn: 'Other' },
];

const CITIES = [
  'Cotonou', 'Porto-Novo', 'Abomey', 'Bohicon', 'Parakou',
  'Ouidah', 'Natitingou', 'Djougou', 'Lokossa', 'Abomey-Calavi',
];

export default function SellerOnboardingModal({ visible, onClose, onShopCreated }: SellerOnboardingModalProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === 'en';

  const [shopName, setShopName] = useState('');
  const [craftType, setCraftType] = useState('');
  const [city, setCity] = useState('Cotonou');
  const [description, setDescription] = useState('');
  const [merchantPhone, setMerchantPhone] = useState('+229');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!shopName.trim()) {
      setError(isEn ? 'Workshop name is required' : 'Le nom de l\'atelier est obligatoire');
      return;
    }
    if (!craftType) {
      setError(isEn ? 'Select your craft type' : 'Sélectionnez votre type d\'artisanat');
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
        isEn ? 'Workshop Registered!' : 'Atelier Enregistré !',
        isEn
          ? 'Your workshop is under review by the Ojarket team. You can start preparing your products while awaiting approval.'
          : 'Votre atelier est en cours de vérification par l\'équipe Ojarket. Vous pouvez commencer à préparer vos produits en attendant l\'approbation.',
        [{ text: 'OK', onPress: () => onShopCreated(result) }]
      );
    } catch (err: any) {
      setError(isEn ? 'Unable to register workshop. Please try again.' : 'Impossible d\'enregistrer l\'atelier. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={[styles.closeTxt, { color: colors.muted }]}>✕</Text>
            </TouchableOpacity>

            <Text style={[styles.brand, { color: colors.action }]}>OJARKET</Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEn ? 'Open Your Workshop' : 'Ouvrir Votre Atelier'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {isEn
                ? 'Register your artisan workshop and start showcasing your creations to thousands of buyers.'
                : 'Enregistrez votre atelier d\'artisan et commencez à présenter vos créations à des milliers d\'acheteurs.'
              }
            </Text>

            {/* Shop name */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isEn ? 'Workshop / Brand Name *' : 'Nom de l\'Atelier / Marque *'}
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.canvas }]}
              value={shopName}
              onChangeText={(t) => { setShopName(t); setError(''); }}
              placeholder={isEn ? 'e.g. Maison Ganvié & Fils' : 'ex. Maison Ganvié & Fils'}
              placeholderTextColor={colors.muted}
            />

            {/* Craft type */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isEn ? 'Craft Type *' : 'Type d\'Artisanat *'}
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
              {isEn ? 'City / Market' : 'Ville / Marché'}
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
              {isEn ? 'Description (optional)' : 'Description (facultatif)'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.canvas }]}
              value={description}
              onChangeText={setDescription}
              placeholder={isEn ? 'Describe your craft, materials, and specialty...' : 'Décrivez votre savoir-faire, matériaux et spécialité...'}
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
            />

            {/* Merchant phone for Mobile Money */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isEn ? 'Mobile Money Number (MTN / Moov)' : 'Numéro Mobile Money (MTN / Moov)'}
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
                  ? 'Your workshop will be reviewed by the Ojarket team for quality and compliance. You can start setting up your products immediately, but they will only be published publicly after approval.'
                  : 'Votre atelier sera examiné par l\'équipe Ojarket pour la qualité et la conformité. Vous pouvez commencer à préparer vos produits immédiatement, mais ils ne seront publiés publiquement qu\'après approbation.'
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
                  {isEn ? 'Register My Workshop' : 'Enregistrer Mon Atelier'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>
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

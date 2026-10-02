import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useDesign } from '../../design-system/provider';

interface ProfileScreenProps {
  onBack?: () => void;
  onSwitchToSeller: () => void;
  onOpenPurchases?: () => void;
  onOpenRequests?: () => void;
}

export default function ProfileScreen({
  onBack,
  onSwitchToSeller,
  onOpenPurchases,
  onOpenRequests,
}: ProfileScreenProps) {
  const { colors, locale, mode, setLocale, setMode } = useDesign();
  const isEn = locale === 'en';
  const isDark = mode === 'dark';

  const headingFont = Platform.OS === 'android' ? 'serif' : 'Georgia';

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* ==================== PINNED FIXED HEADER ==================== */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: Platform.OS === 'android' ? 14 : 10,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
          zIndex: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onBack && (
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [{
                padding: 6,
                borderRadius: 8,
                backgroundColor: colors.canvas,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              }]}
            >
              <Text style={{ fontSize: 16, color: colors.action, fontWeight: '700' }}>←</Text>
            </Pressable>
          )}
          <Text style={{ fontFamily: headingFont, fontSize: 20, fontWeight: '700', color: colors.text }}>
            {isEn ? 'Personal Space' : 'Espace Personnel'}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '800' }}>
            ✓ {isEn ? 'VERIFIED' : 'VÉRIFIÉ'}
          </Text>
        </View>
      </View>

      {/* ==================== SCROLLABLE PROFILE CONTENT ==================== */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            padding: 20,
            borderRadius: 16,
            marginBottom: 16,
            borderColor: colors.border,
            borderWidth: 1,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.action,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '800' }}>AD</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Amina Diop</Text>
            <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>amina.diop@client.bj</Text>
            <Text style={{ fontSize: 13, color: colors.muted, marginTop: 1 }}>Cotonou, Bénin · +229 97 00 00 00</Text>
          </View>
        </View>

        {/* Role Switcher to Artisan Space */}
        <View
          style={{
            backgroundColor: colors.surface,
            padding: 20,
            borderRadius: 16,
            marginBottom: 20,
            borderColor: colors.border,
            borderWidth: 1,
            borderLeftWidth: 4,
            borderLeftColor: colors.action,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
            👑 {isEn ? 'Artisan & Merchant Space' : 'Espace Vendeur & Atelier'}
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18, marginBottom: 14 }}>
            {isEn
              ? 'Access your workshop orders, cashbook, custom quotes, and catalog management.'
              : 'Accédez à vos commandes d’atelier, votre livre de caisse et vos devis sur-mesure.'}
          </Text>
          <Pressable
            onPress={onSwitchToSeller}
            style={({ pressed }) => [{
              backgroundColor: colors.action,
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            }]}
          >
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>
              {isEn ? 'Switch to Artisan Space →' : 'Basculer en Espace Vendeur →'}
            </Text>
          </Pressable>
        </View>

        {/* Quick Access Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <Pressable
            onPress={onOpenPurchases}
            style={({ pressed }) => [{
              flex: 1,
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 14,
              borderColor: colors.border,
              borderWidth: 1,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            }]}
          >
            <Text style={{ fontSize: 24, marginBottom: 6 }}>🛍</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' }}>
              {isEn ? 'My Orders' : 'Mes Commandes'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onOpenRequests}
            style={({ pressed }) => [{
              flex: 1,
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 14,
              borderColor: colors.border,
              borderWidth: 1,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            }]}
          >
            <Text style={{ fontSize: 24, marginBottom: 6 }}>✦</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' }}>
              {isEn ? 'My Requests' : 'Mes Demandes'}
            </Text>
          </Pressable>
        </View>

        {/* Preferences Section */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          {isEn ? 'Preferences & Appearance' : 'Préférences & Apparence'}
        </Text>

        {/* Language Selection */}
        <View
          style={{
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 14,
            marginBottom: 12,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
            🌐 {isEn ? 'Language' : 'Langue d’affichage'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={() => setLocale('fr')}
              style={({ pressed }) => [{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: !isEn ? colors.action : colors.canvas,
                borderWidth: 1,
                borderColor: !isEn ? colors.action : colors.border,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Text style={{ fontWeight: '700', color: !isEn ? '#ffffff' : colors.text }}>
                Français (Bénin)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setLocale('en')}
              style={({ pressed }) => [{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: isEn ? colors.action : colors.canvas,
                borderWidth: 1,
                borderColor: isEn ? colors.action : colors.border,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Text style={{ fontWeight: '700', color: isEn ? '#ffffff' : colors.text }}>
                English (Intl)
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Theme Selection */}
        <View
          style={{
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 14,
            marginBottom: 16,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
            🎨 {isEn ? 'Display Mode' : 'Mode Lumineux'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={() => setMode('light')}
              style={({ pressed }) => [{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: !isDark ? colors.action : colors.canvas,
                borderWidth: 1,
                borderColor: !isDark ? colors.action : colors.border,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Text style={{ fontWeight: '700', color: !isDark ? '#ffffff' : colors.text }}>
                ☼ {isEn ? 'Light Mode' : 'Clair'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode('dark')}
              style={({ pressed }) => [{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: isDark ? colors.action : colors.canvas,
                borderWidth: 1,
                borderColor: isDark ? colors.action : colors.border,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Text style={{ fontWeight: '700', color: isDark ? '#ffffff' : colors.text }}>
                ☾ {isEn ? 'Dark Luxury' : 'Sombre'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Concierge & Security Footer */}
        <Pressable
          onPress={() =>
            Alert.alert(
              isEn ? 'Ojarket Concierge' : 'Conciergerie Ojarket',
              isEn
                ? 'Direct line: +229 97 00 00 00\nHours: Mon-Sat 8h-20h (Cotonou time GMT+1)'
                : 'Ligne directe : +229 97 00 00 00\nHoraires : Lun-Sam 8h-20h (Heure de Cotonou)'
            )
          }
          style={({ pressed }) => [{
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          }]}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.action }}>
            🛡 {isEn ? 'Ojarket Concierge Support & Security' : 'Conciergerie Ojarket & Sécurité'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

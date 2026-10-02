import React from 'react';
import { ScrollView, View, Text, Pressable, Platform, Alert } from 'react-native';
import { useDesign } from '../../design-system/provider';

interface ProfileScreenProps {
  onSwitchToSeller: () => void;
  onOpenPurchases?: () => void;
  onOpenRequests?: () => void;
}

export default function ProfileScreen({ onSwitchToSeller, onOpenPurchases, onOpenRequests }: ProfileScreenProps) {
  const { colors, locale, mode, setLocale, setMode } = useDesign();
  const isEn = locale === "en";
  const isDark = mode === "dark";

  const headingFont = Platform.OS === 'android' ? 'serif' : 'Georgia';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas, padding: 20 }}>
      {/* Header */}
      <View style={{ marginBottom: 24, marginTop: 40 }}>
        <Text style={{ fontFamily: headingFont, fontSize: 32, fontWeight: 'bold', color: colors.text }}>
          {isEn ? "Personal Space" : "Espace Personnel"}
        </Text>
      </View>

      {/* Identity Card */}
      <View style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 16, borderColor: colors.border, borderWidth: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
          <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold' }}>AD</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>Amina Diop</Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>amina.diop@client.bj</Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 2 }}>Cotonou, Bénin</Text>
        </View>
        <View style={{ backgroundColor: colors.successBg || '#e6f4ea', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
          <Text style={{ fontSize: 12, color: '#137333', fontWeight: 'bold' }}>
            {isEn ? "Verified Buyer" : "Acheteur Vérifié"}
          </Text>
        </View>
      </View>

      {/* Role Switcher */}
      <View style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 24, borderColor: colors.border, borderWidth: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>
          {isEn ? "Artisan & Merchant Space" : "Espace Vendeur & Atelier"}
        </Text>
        <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
          {isEn ? "Switch to your seller account to manage your store and opportunities." : "Passez sur votre compte vendeur pour gérer votre boutique et vos opportunités."}
        </Text>
        <Pressable 
          onPress={onSwitchToSeller}
          style={{ backgroundColor: colors.action, paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}>
            {isEn ? "Switch to Seller" : "Passer Vendeur"}
          </Text>
        </Pressable>
      </View>

      {/* Quick Access */}
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
        <Pressable 
          onPress={onOpenPurchases}
          style={{ flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderColor: colors.border, borderWidth: 1, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>
            {isEn ? "My Orders" : "Mes Commandes"}
          </Text>
        </Pressable>
        <Pressable 
          onPress={onOpenRequests}
          style={{ flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderColor: colors.border, borderWidth: 1, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>
            {isEn ? "My Requests" : "Mes Demandes"}
          </Text>
        </Pressable>
      </View>

      {/* Preferences */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
        {isEn ? "Preferences" : "Préférences"}
      </Text>
      
      {/* Language */}
      <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12, borderColor: colors.border, borderWidth: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
          {isEn ? "Language" : "Langue"}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable 
            onPress={() => setLocale('fr')}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center', backgroundColor: !isEn ? colors.action : colors.subtle }}
          >
            <Text style={{ fontWeight: 'bold', color: !isEn ? '#ffffff' : colors.text }}>FR</Text>
          </Pressable>
          <Pressable 
            onPress={() => setLocale('en')}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center', backgroundColor: isEn ? colors.action : colors.subtle }}
          >
            <Text style={{ fontWeight: 'bold', color: isEn ? '#ffffff' : colors.text }}>EN</Text>
          </Pressable>
        </View>
      </View>

      {/* Appearance */}
      <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12, borderColor: colors.border, borderWidth: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
          {isEn ? "Appearance" : "Apparence"}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable 
            onPress={() => setMode('light')}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center', backgroundColor: !isDark ? colors.action : colors.subtle }}
          >
            <Text style={{ fontWeight: 'bold', color: !isDark ? '#ffffff' : colors.text }}>
              {isEn ? "Light" : "Clair"}
            </Text>
          </Pressable>
          <Pressable 
            onPress={() => setMode('dark')}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center', backgroundColor: isDark ? colors.action : colors.subtle }}
          >
            <Text style={{ fontWeight: 'bold', color: isDark ? '#ffffff' : colors.text }}>
              {isEn ? "Dark" : "Sombre"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Payment Preferences */}
      <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 24, borderColor: colors.border, borderWidth: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>
          {isEn ? "Payment Methods" : "Moyens de Paiement"}
        </Text>
        <Text style={{ fontSize: 14, color: colors.muted }}>
          MTN MoMo, Moov Money, Celtiis Cash, {isEn ? "Cash" : "Espèces"}
        </Text>
      </View>

      {/* Support and Legal */}
      <View style={{ marginBottom: 40, gap: 12 }}>
        <Pressable 
          onPress={() => Alert.alert(isEn ? "Support" : "Support", isEn ? "Contact us at support@ojarket.com" : "Contactez-nous à support@ojarket.com")}
          style={{ paddingVertical: 12 }}
        >
          <Text style={{ fontSize: 16, color: colors.action }}>
            {isEn ? "Help & Support" : "Aide & Support"}
          </Text>
        </Pressable>
        <Pressable 
          onPress={() => Alert.alert(isEn ? "Terms of Service" : "Conditions d'utilisation", isEn ? "Read the legal terms." : "Lisez les mentions légales.")}
          style={{ paddingVertical: 12 }}
        >
          <Text style={{ fontSize: 16, color: colors.action }}>
            {isEn ? "Legal & Terms" : "Mentions Légales & CGU"}
          </Text>
        </Pressable>
      </View>

      {/* Footer Branding */}
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          Ojarket Marketplace © 2026
        </Text>
      </View>
    </ScrollView>
  );
}

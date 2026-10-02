import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Platform, StyleSheet, TextInput, Alert } from 'react-native';
import { useDesign } from '../../design-system/provider';

export interface SellerShopScreenProps {
  onSwitchToBuyer: () => void;
  onBack?: () => void;
}

export default function SellerShopScreen({ onSwitchToBuyer, onBack }: SellerShopScreenProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === "en";
  
  // Platform font family for headers
  const headingFont = Platform.OS === 'android' ? 'serif' : 'Georgia';

  const [catalogItems, setCatalogItems] = useState([
    { id: '1', title: isEn ? 'Genuine leather bag' : 'Sac en cuir véritable', price: '45 000 FCFA', stock: 4 },
    { id: '2', title: isEn ? 'Minimalist wallet' : 'Portefeuille minimaliste', price: '15 000 FCFA', stock: 8 },
    { id: '3', title: isEn ? 'Handcrafted belt' : 'Ceinture artisanale', price: '20 000 FCFA', stock: 2 },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("3");
  const [newDescription, setNewDescription] = useState("");

  const handleCreateProduct = () => {
    if (!newTitle.trim()) {
      Alert.alert(isEn ? "Title Required" : "Titre Requis", isEn ? "Please enter a creation title" : "Veuillez saisir un titre");
      return;
    }
    const priceNum = parseInt(newPrice.replace(/\s+/g, ""), 10);
    if (!priceNum || priceNum <= 0) {
      Alert.alert(isEn ? "Price Required" : "Prix Requis", isEn ? "Please enter a valid price" : "Veuillez entrer un prix valide");
      return;
    }

    const stockNum = parseInt(newStock, 10) || 1;
    const newItem = {
      id: `prod_${Date.now()}`,
      title: newTitle.trim(),
      price: `${priceNum.toLocaleString("fr-FR")} FCFA`,
      stock: stockNum,
    };

    setCatalogItems([newItem, ...catalogItems]);
    setShowAddModal(false);
    setNewTitle("");
    setNewPrice("");
    setNewStock("3");
    setNewDescription("");

    Alert.alert(
      isEn ? "Creation Published!" : "Création Publiée !",
      isEn ? "Your new creation has been registered in your workshop catalog." : "Votre nouvelle création a été enregistrée dans le catalogue de votre atelier."
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
          <Text style={[styles.eyebrow, { color: colors.subtle }]}>
            {isEn ? "ARTISAN WORKSHOP" : "ATELIER D'ART"}
          </Text>
          
          <Text style={[styles.title, { fontFamily: headingFont, color: colors.text }]}>
            Atelier Cotonou #042 · {isEn ? "Master Leathercrafter" : "Maître Maroquinier"}
          </Text>
          
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.successBg || '#e6f4ea' }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>✓ {isEn ? "Verified" : "Vérifié"}</Text>
            </View>
          </View>

          <Text style={[styles.infoText, { color: colors.muted }]}>
            Quartier Haie Vive, Cotonou, Bénin
          </Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>
            +229 97 00 00 00
          </Text>
        </View>

        {/* Workshop Performance Cards */}
        <View style={styles.cardRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>6</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              {isEn ? "Active Creations" : "Créations actives"}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>★ 4.9</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              124 {isEn ? "reviews" : "avis vérifiés"}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            100% {isEn ? "Direct payments (Non-custodial)" : "Paiements directs (Sans garde de fonds)"}
          </Text>
        </View>

        {/* Catalog Preview Header with Add Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isEn ? "Catalog" : "Catalogue des Créations"}
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
              {isEn ? "+ New Creation" : "+ Ajouter"}
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
            <View style={[styles.stockBadge, { backgroundColor: colors.successBg || '#e6f4ea' }]}>
              <Text style={[styles.stockBadgeText, { color: colors.action, fontWeight: '700' }]}>
                {item.stock > 0 ? (isEn ? `● ${item.stock} in stock` : `● ${item.stock} en stock`) : (isEn ? "Out of stock" : "Rupture")}
              </Text>
            </View>
          </View>
        ))}

        {/* Direct payment channels */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isEn ? "Payment Channels" : "Canaux de paiement"}
          </Text>
        </View>

        {[
          'MTN Mobile Money (*880#)',
          'Moov Money Bénin (*155#)',
          isEn ? 'Cash at workshop' : 'Espèces à l\'atelier'
        ].map((channel, i) => (
          <View key={i} style={[styles.channelItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.channelText, { color: colors.text }]}>{channel}</Text>
            <Text style={[styles.channelStatus, { color: colors.action, fontWeight: '700' }]}>
              {isEn ? "(Active)" : "(Actif)"}
            </Text>
          </View>
        ))}

        {/* Switch to Buyer Mode */}
        <Pressable 
          onPress={onSwitchToBuyer} 
          style={({pressed}) => [
            styles.switchButton, 
            { backgroundColor: colors.surface, borderColor: colors.action },
            pressed && { opacity: 0.8 }
          ]}
        >
          <Text style={[styles.switchButtonText, { color: colors.action }]}>
            {isEn ? "Switch to Buyer Mode" : "Passer en mode Acheteur"}
          </Text>
        </Pressable>

      </ScrollView>

      {/* Add Creation Modal */}
      {showAddModal && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
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
              maxHeight: "90%",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
                {isEn ? "Add a New Creation" : "Ajouter une Création"}
              </Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text, marginBottom: 6 }}>
                {isEn ? "Creation Title *" : "Titre de la création *"}
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
                placeholder={isEn ? "e.g. Handmade Leather Belt" : "ex: Ceinture en cuir patiné"}
                placeholderTextColor={colors.muted}
              />

              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text, marginBottom: 6 }}>
                {isEn ? "Price in FCFA *" : "Prix en FCFA *"}
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 16,
                  fontWeight: "700",
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

              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text, marginBottom: 6 }}>
                {isEn ? "Initial Stock Available" : "Stock disponible"}
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

              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text, marginBottom: 6 }}>
                {isEn ? "Craftsmanship & Materials Description" : "Description & Savoir-faire"}
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
                placeholder={isEn ? "Describe materials, technique, and care..." : "Matériaux nobles, finitions main..."}
                placeholderTextColor={colors.muted}
                multiline
              />

              <Pressable
                style={{
                  backgroundColor: colors.action,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                }}
                onPress={handleCreateProduct}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                  {isEn ? "Publish to Workshop" : "Enregistrer la Création"}
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
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    marginTop: 4,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: -8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  catalogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  catalogItemContent: {
    flex: 1,
  },
  catalogItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  catalogItemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  channelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  channelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  channelStatus: {
    fontSize: 14,
  },
  switchButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  switchButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

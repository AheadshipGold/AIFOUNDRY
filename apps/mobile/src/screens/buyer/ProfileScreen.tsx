import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Platform,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesign } from '../../design-system/provider';
import { Icon } from '../../design-system/Icon';
import { AuthApi, hasShop, getActiveShop, type AuthUser } from '../../services/api';
import { clearSession } from '../../components/auth/AuthModal';

interface ProfileScreenProps {
  currentUser: AuthUser | null;
  onBack?: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onUpdateProfile?: (user: AuthUser) => void;
  onSwitchToSeller: () => void;
  onOpenPurchases?: () => void;
  onOpenRequests?: () => void;
}

export default function ProfileScreen({
  currentUser,
  onBack,
  onOpenAuth,
  onLogout,
  onUpdateProfile,
  onSwitchToSeller,
  onOpenPurchases,
  onOpenRequests,
}: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0);
  const { colors, locale, mode, setLocale, setMode } = useDesign();
  const isEn = locale === 'en';
  const isDark = mode === 'dark';

  const headingFont = Platform.OS === 'android' ? 'serif' : 'Georgia';

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const user = await AuthApi.getMe();
      if (user && onUpdateProfile) {
        onUpdateProfile(user);
      }
    } catch (err) {
      console.warn('Failed to refresh user profile', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Keyboard height tracker for fluid modal scrolling
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

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editUsername, setEditUsername] = useState(currentUser?.username || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editPassword, setEditPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const getInitials = (name: string) => {
    if (!name) return 'OJ';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleOpenEdit = () => {
    if (!currentUser) return;
    setEditName(currentUser.name || '');
    setEditUsername(currentUser.username ? currentUser.username.replace(/^@+/, '') : currentUser.name.toLowerCase().replace(/\s+/g, '_'));
    setEditPhone(currentUser.phone || '+229 ');
    setEditPassword('');
    setEditError('');
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setEditError(isEn ? 'Name is required' : 'Le nom est obligatoire');
      return;
    }

    const cleanUsername = editUsername.trim()
      ? editUsername.trim().replace(/^@+/, '').toLowerCase()
      : undefined;

    if (cleanUsername && cleanUsername.length < 4) {
      setEditError(isEn ? 'Username must be at least 4 characters' : "Le nom d'utilisateur doit comporter au moins 4 caractères");
      return;
    }

    if (cleanUsername && !/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      setEditError(isEn ? 'Username can only contain letters, numbers, dots and hyphens' : "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et points");
      return;
    }

    setSaving(true);
    setEditError('');

    try {
      const updated = await AuthApi.updateProfile({
        name: editName.trim(),
        username: cleanUsername,
        phone: editPhone.trim() || undefined,
        email: currentUser?.email,
      });

      if (editPassword.trim()) {
        await AuthApi.changePassword('', editPassword.trim());
      }

      if (onUpdateProfile && currentUser) {
        onUpdateProfile({
          ...currentUser,
          name: updated.name,
          username: updated.username || cleanUsername,
          phone: updated.phone,
        });
      }

      setShowEditModal(false);
      Alert.alert(
        isEn ? 'Profile Updated' : 'Profil Mis à Jour',
        isEn ? 'Your personal details have been saved successfully.' : 'Vos informations ont été enregistrées avec succès.'
      );
    } catch (err: any) {
      setEditError(err?.message || (isEn ? 'Failed to update profile' : 'Impossible de mettre à jour le profil'));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordError(isEn ? 'Password must be at least 6 characters' : 'Le mot de passe doit comporter au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(isEn ? 'Passwords do not match' : 'Les mots de passe ne correspondent pas');
      return;
    }

    setSavingPassword(true);
    setPasswordError('');

    try {
      await AuthApi.changePassword(oldPassword, newPassword);
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert(
        isEn ? 'Security' : 'Sécurité',
        isEn ? 'Your password has been changed successfully.' : 'Votre mot de passe a été modifié avec succès.'
      );
    } catch (err: any) {
      setPasswordError(err?.message || (isEn ? 'Error updating password' : 'Erreur lors du changement de mot de passe'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      isEn ? 'Sign Out' : 'Déconnexion',
      isEn
        ? 'Are you sure you want to sign out of your Ojarket account?'
        : 'Êtes-vous sûr de vouloir vous déconnecter de votre compte Ojarket ?',
      [
        {
          text: isEn ? 'Cancel' : 'Annuler',
          style: 'cancel',
        },
        {
          text: isEn ? 'Sign Out' : 'Se déconnecter',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteError('');
    try {
      await AuthApi.deleteAccount();
      await clearSession();
      setShowDeleteModal(false);
      Alert.alert(
        isEn ? 'Account Deleted' : 'Compte Supprimé',
        isEn
          ? 'Your Ojarket account and all personal records have been permanently removed.'
          : 'Votre compte Ojarket et l’ensemble de vos données ont été définitivement supprimés.'
      );
      onLogout();
    } catch (err: any) {
      setDeleteError(
        err?.message ||
          (isEn
            ? 'Failed to delete account. Please try again.'
            : 'Échec de la suppression du compte. Veuillez réessayer.')
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* ==================== PINNED FIXED HEADER ==================== */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: topInset > 0 ? topInset + 6 : (Platform.OS === 'android' ? 36 : 10),
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

        {currentUser ? (
          <View
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(16, 185, 129, 0.3)',
            }}
          >
            <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '800' }}>
              ✓ {isEn ? 'VERIFIED' : 'MEMBRE VÉRIFIÉ'}
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: isDark ? 'rgba(212, 180, 131, 0.15)' : 'rgba(13, 74, 56, 0.1)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 11, color: colors.action, fontWeight: '800' }}>
              ✦ {isEn ? 'GUEST' : 'INVITÉ'}
            </Text>
          </View>
        )}
      </View>

      {/* ==================== SCROLLABLE PROFILE CONTENT ==================== */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
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
        {/* ------------------------------------------------------------- */}
        {/* 1. IDENTITY OR GUEST HERO CARD                                */}
        {/* ------------------------------------------------------------- */}
        {currentUser ? (
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 20,
              borderRadius: 18,
              marginBottom: 18,
              borderColor: colors.border,
              borderWidth: 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: colors.action,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                  borderWidth: 2,
                  borderColor: isDark ? '#D4AF37' : 'rgba(255,255,255,0.4)',
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '800' }}>
                  {getInitials(currentUser.name)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
                  {currentUser.name}
                </Text>
                <Text style={{ fontSize: 13, color: colors.action, fontWeight: '700', marginTop: 1 }}>
                  {currentUser.username || `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                  {currentUser.email}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Icon name="map-pin" size={12} color={colors.muted} />
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    Cotonou, Bénin · {currentUser.phone || '+229 non renseigné'}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={handleOpenEdit}
              style={({ pressed }) => [{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.canvas,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 6,
                opacity: pressed ? 0.7 : 1,
              }]}
            >
              <Icon name="pencil" size={14} color={colors.action} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.action }}>
                {isEn ? 'Edit My Profile Details' : 'Modifier mes informations'}
              </Text>
            </Pressable>
          </View>
        ) : (
          /* GUEST MODE CARD */
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 22,
              borderRadius: 18,
              marginBottom: 18,
              borderColor: colors.border,
              borderWidth: 1,
              borderLeftWidth: 5,
              borderLeftColor: colors.action,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <Icon name="crown" size={26} color={isDark ? '#D4AF37' : colors.action} />
              <View>
                <Text style={{ fontFamily: headingFont, fontSize: 18, fontWeight: '700', color: colors.text }}>
                  {isEn ? 'Welcome to Ojarket' : 'Bienvenue sur Ojarket'}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  {isEn ? 'West African Luxury Marketplace' : 'Le Marché du Luxe Ouest-Africain'}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 19, marginBottom: 16 }}>
              {isEn
                ? 'Sign in or create an account to track your orders, express bespoke product requests to verified merchants, and manage your store.'
                : 'Connectez-vous ou créez votre compte pour suivre vos achats, exprimer vos demandes de produits aux commerçants vérifiés et gérer votre boutique.'}
            </Text>

            <Pressable
              onPress={onOpenAuth}
              style={({ pressed }) => [{
                backgroundColor: colors.action,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="sparkle" size={16} color="#ffffff" weight="fill" />
                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 }}>
                  {isEn ? 'Sign In / Create Account' : 'Se Connecter / Créer un Compte'}
                </Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. ROLE SWITCHER TO SELLER SPACE                              */}
        {/* ------------------------------------------------------------- */}
        <View
          style={{
            backgroundColor: colors.surface,
            padding: 20,
            borderRadius: 16,
            marginBottom: 18,
            borderColor: colors.border,
            borderWidth: 1,
            borderLeftWidth: 4,
            borderLeftColor: isDark ? '#D4AF37' : colors.action,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon name="storefront" size={18} color={isDark ? '#D4AF37' : colors.action} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
              {isEn ? 'Merchant & Store Space' : 'Espace Commerçant & Boutique'}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18, marginBottom: 14 }}>
            {hasShop(currentUser) && getActiveShop(currentUser)
              ? (isEn
                  ? `Manage your store (${getActiveShop(currentUser)?.name}), your cashbook, and customer orders.`
                  : `Gérez votre boutique (${getActiveShop(currentUser)?.name}), votre livre de caisse et vos commandes clients.`)
              : (isEn
                  ? 'Are you a merchant, seller, or retailer? Open your verified store on Ojarket.'
                  : 'Vous êtes commerçant, revendeur ou créateur de marque ? Ouvrez votre boutique vérifiée sur Ojarket.')}
          </Text>
          <Pressable
            onPress={onSwitchToSeller}
            style={({ pressed }) => [{
              backgroundColor: isDark ? 'rgba(212, 180, 131, 0.2)' : colors.action,
              borderWidth: isDark ? 1 : 0,
              borderColor: '#D4AF37',
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            }]}
          >
            <Text style={{ color: isDark ? '#D4AF37' : '#ffffff', fontWeight: '700', fontSize: 14 }}>
              {hasShop(currentUser) && getActiveShop(currentUser)
                ? (isEn ? `Access Store Space (${getActiveShop(currentUser)?.name}) →` : `Accéder à ma Boutique (${getActiveShop(currentUser)?.name}) →`)
                : (isEn ? 'Open a Merchant Store →' : "Ouvrir ma Boutique Vendeur →")}
            </Text>
          </Pressable>
        </View>

        {/* ------------------------------------------------------------- */}
        {/* 3. QUICK ACCESS (ORDERS & REQUESTS)                           */}
        {/* ------------------------------------------------------------- */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
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
            <Icon name="bag-handle" size={24} color={colors.action} style={{ marginBottom: 6 }} />
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
            <Icon name="file-text" size={24} color={colors.action} style={{ marginBottom: 6 }} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' }}>
              {isEn ? 'My Requests' : 'Mes Demandes'}
            </Text>
          </Pressable>
        </View>

        {/* ------------------------------------------------------------- */}
        {/* 4. PREFERENCES & SECURITY                                     */}
        {/* ------------------------------------------------------------- */}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Icon name="globe" size={16} color={colors.action} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
              {isEn ? 'Language' : 'Langue d’affichage'}
            </Text>
          </View>
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
            marginBottom: 14,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Icon name="palette" size={16} color={colors.action} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
              {isEn ? 'Display Mode' : 'Mode Lumineux'}
            </Text>
          </View>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="sun" size={14} color={!isDark ? '#ffffff' : colors.text} />
                <Text style={{ fontWeight: '700', color: !isDark ? '#ffffff' : colors.text }}>
                  {isEn ? 'Light Mode' : 'Clair'}
                </Text>
              </View>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="moon" size={14} color={isDark ? '#ffffff' : colors.text} />
                <Text style={{ fontWeight: '700', color: isDark ? '#ffffff' : colors.text }}>
                  {isEn ? 'Dark Luxury' : 'Sombre'}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Security & Password Change */}
        {currentUser && (
          <Pressable
            onPress={() => setShowPasswordModal(true)}
            style={({ pressed }) => [{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Icon name="lock" size={18} color={colors.action} />
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                  {isEn ? 'Account Security' : 'Sécurité du Compte'}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  {isEn ? 'Change password & PIN' : 'Modifier le mot de passe & code PIN'}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 16, color: colors.muted }}>→</Text>
          </Pressable>
        )}

        {/* Concierge Support */}
        <Pressable
          onPress={() =>
            Alert.alert(
              isEn ? 'Ojarket Concierge' : 'Conciergerie Ojarket',
              isEn
                ? 'Direct line: +229 97 00 00 00\nHours: Mon-Sat 8h-20h (Cotonou GMT+1)\nWhatsApp VIP: +229 97 00 00 00'
                : 'Ligne directe : +229 97 00 00 00\nHoraires : Lun-Sam 8h-20h (Heure de Cotonou)\nWhatsApp VIP : +229 97 00 00 00'
            )
          }
          style={({ pressed }) => [{
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            marginBottom: 20,
            opacity: pressed ? 0.7 : 1,
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="shield" size={16} color={colors.action} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.action }}>
              {isEn ? 'Ojarket Concierge Support & Security' : 'Conciergerie Ojarket & Sécurité'}
            </Text>
          </View>
        </Pressable>

        {/* ------------------------------------------------------------- */}
        {/* 5. LOGOUT BUTTON ("SE DÉCONNECTER")                           */}
        {/* ------------------------------------------------------------- */}
        {currentUser && (
          <Pressable
            onPress={handleLogoutPress}
            style={({ pressed }) => [{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              paddingVertical: 15,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            }]}
          >
            <Icon name="logout" size={16} color="#EF4444" />
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#EF4444', letterSpacing: 0.3 }}>
              {isEn ? 'Sign Out of Ojarket' : 'Se Déconnecter'}
            </Text>
          </Pressable>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 6. ADVANCED PRIVACY & DATA SETTINGS                           */}
        {/* ------------------------------------------------------------- */}
        {currentUser && (
          <View
            style={{
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              alignItems: 'center',
              marginTop: 18,
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  isEn ? 'Data Privacy & Deletion' : 'Confidentialité & Données Personnelles',
                  isEn
                    ? 'Do you wish to access the permanent account deletion request?'
                    : 'Souhaitez-vous accéder à la procédure de suppression définitive de votre compte et de vos données ?',
                  [
                    { text: isEn ? 'Cancel' : 'Annuler', style: 'cancel' },
                    {
                      text: isEn ? 'Continue' : 'Continuer',
                      style: 'destructive',
                      onPress: () => {
                        setDeleteConfirmText('');
                        setDeleteError('');
                        setShowDeleteModal(true);
                      },
                    },
                  ]
                );
              }}
              style={{ paddingVertical: 8, paddingHorizontal: 12 }}
            >
              <Text style={{ fontSize: 11, color: colors.muted, textDecorationLine: 'underline', letterSpacing: 0.3 }}>
                {isEn ? 'Privacy settings & Delete account' : 'Paramètres de confidentialité & Supprimer mon compte'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ==================== MODAL: EDIT PROFILE DETAILS ==================== */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => !saving && setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderColor: colors.border,
              padding: 22,
              maxHeight: keyboardHeight > 0 ? (Platform.OS === 'android' ? '98%' : '90%') : '85%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontFamily: headingFont, fontSize: 20, fontWeight: '700', color: colors.text }}>
                {isEn ? 'Edit Profile' : 'Modifier mes informations'}
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} disabled={saving} style={{ padding: 4 }}>
                <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets={true}
              contentContainerStyle={{ gap: 12, paddingBottom: keyboardHeight > 0 ? keyboardHeight + 50 : 25 }}
            >
              {editError ? (
                <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', padding: 10, borderRadius: 8 }}>
                  <Text style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>
                    {editError}
                  </Text>
                </View>
              ) : null}

              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'Full Name' : 'Nom Complet'}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.canvas,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    color: colors.text,
                    fontSize: 15,
                  }}
                  value={editName}
                  onChangeText={(t) => { setEditName(t); setEditError(''); }}
                  placeholder="ex: Amina Diop"
                  placeholderTextColor={colors.muted}
                />
              </View>

              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'Username (4 chars min)' : "Nom d'utilisateur (4 car. min)"}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.canvas,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    color: colors.text,
                    fontSize: 15,
                  }}
                  value={editUsername}
                  onChangeText={(t) => { setEditUsername(t.replace(/^@+/, '')); setEditError(''); }}
                  placeholder={isEn ? 'e.g. amina_diop' : 'ex: amina_diop'}
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'Phone / WhatsApp (+229)' : 'Téléphone / WhatsApp (+229)'}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.canvas,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    color: colors.text,
                    fontSize: 15,
                  }}
                  value={editPhone}
                  onChangeText={(t) => { setEditPhone(t); setEditError(''); }}
                  placeholder="+229 97 00 00 00"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={saving}
                style={{
                  backgroundColor: colors.action,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: 10,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 15 }}>
                    {isEn ? 'Save Changes' : 'Enregistrer les Modifications'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================== MODAL: CHANGE PASSWORD ==================== */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => !savingPassword && setShowPasswordModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderColor: colors.border,
              padding: 22,
              maxHeight: keyboardHeight > 0 ? (Platform.OS === 'android' ? '98%' : '90%') : '85%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontFamily: headingFont, fontSize: 20, fontWeight: '700', color: colors.text }}>
                {isEn ? 'Change Password' : 'Changer le Mot de Passe'}
              </Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)} disabled={savingPassword} style={{ padding: 4 }}>
                <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets={true}
              contentContainerStyle={{ gap: 12, paddingBottom: keyboardHeight > 0 ? keyboardHeight + 50 : 25 }}
            >
              {passwordError ? (
                <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', padding: 10, borderRadius: 8 }}>
                  <Text style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>
                    {passwordError}
                  </Text>
                </View>
              ) : null}

              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'New Password' : 'Nouveau mot de passe'}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.canvas,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    color: colors.text,
                    fontSize: 15,
                  }}
                  value={newPassword}
                  onChangeText={(t) => { setNewPassword(t); setPasswordError(''); }}
                  placeholder="••••••••"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                />
              </View>

              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {isEn ? 'Confirm New Password' : 'Confirmer le nouveau mot de passe'}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.canvas,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    color: colors.text,
                    fontSize: 15,
                  }}
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); setPasswordError(''); }}
                  placeholder="••••••••"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                onPress={handleSavePassword}
                disabled={savingPassword}
                style={{
                  backgroundColor: colors.action,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: 10,
                  opacity: savingPassword ? 0.7 : 1,
                }}
              >
                {savingPassword ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 15 }}>
                    {isEn ? 'Update Password' : 'Mettre à jour le mot de passe'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================== MODAL: DELETE ACCOUNT ==================== */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => !deletingAccount && setShowDeleteModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderColor: colors.border,
              padding: 22,
              maxHeight: keyboardHeight > 0 ? (Platform.OS === 'android' ? '98%' : '90%') : '85%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="warning" size={20} color="#DC2626" />
                <Text style={{ fontFamily: headingFont, fontSize: 19, fontWeight: '700', color: '#DC2626' }}>
                  {isEn ? 'Delete Account' : 'Supprimer le Compte'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
                style={{ padding: 4 }}
              >
                <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets={true}
              contentContainerStyle={{ gap: 12, paddingBottom: keyboardHeight > 0 ? keyboardHeight + 50 : 25 }}
            >
              <View
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 12,
                  padding: 14,
                  borderLeftWidth: 4,
                  borderLeftColor: '#DC2626',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626', marginBottom: 6 }}>
                  {isEn ? 'Warning: Irreversible Action' : 'Attention : Action Définitive & Irréversible'}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text, lineHeight: 18 }}>
                  {isEn
                    ? 'All your active bespoke requests, orders, and personal profile data will be permanently purged from Ojarket servers.'
                    : 'Toutes vos demandes de créations sur-mesure, vos commandes et vos données de profil seront définitivement effacées des serveurs Ojarket.'}
                </Text>
              </View>

              {deleteError ? (
                <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: 10, borderRadius: 8 }}>
                  <Text style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>
                    {deleteError}
                  </Text>
                </View>
              ) : null}

              <View style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
                  {isEn
                    ? 'Type "SUPPRIMER" to confirm:'
                    : 'Tapez "SUPPRIMER" pour confirmer :'}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.canvas,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    color: colors.text,
                    fontSize: 15,
                  }}
                  value={deleteConfirmText}
                  onChangeText={(t) => {
                    setDeleteConfirmText(t);
                    setDeleteError('');
                  }}
                  placeholder="SUPPRIMER"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="characters"
                />
              </View>

              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmText.trim().toUpperCase() !== 'SUPPRIMER'}
                style={{
                  backgroundColor: '#DC2626',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: 6,
                  opacity:
                    deletingAccount || deleteConfirmText.trim().toUpperCase() !== 'SUPPRIMER' ? 0.4 : 1,
                }}
              >
                {deletingAccount ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 14 }}>
                    {isEn ? 'Confirm Permanent Deletion' : 'Confirmer la Suppression Définitive'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
                style={{
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.canvas,
                  marginTop: 2,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>
                  {isEn ? 'Cancel & Keep My Account' : 'Annuler et Conserver Mon Compte'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}


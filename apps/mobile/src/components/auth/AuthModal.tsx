import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useDesign } from '../../design-system/provider';
import { AuthApi, setAuthToken, normalizeAuthUser, type AuthUser } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleLogo from '../common/GoogleLogo';
import { promptGoogleSignIn, logoutGoogleAuth } from '../../services/googleAuth';

export const SESSION_KEY = 'ojarket.auth.session';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser, token: string) => void;
}

type AuthMode = 'login' | 'register';

export default function AuthModal({ visible, onClose, onAuthenticated }: AuthModalProps) {
  const { colors, locale, mode } = useDesign();
  const isEn = locale === 'en';
  const isDark = mode === 'dark';

  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Form Fields
  const [emailIdentifier, setEmailIdentifier] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('+229 ');
  const [registerPassword, setRegisterPassword] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible, fadeAnim]);

  const resetAll = () => {
    setAuthMode('login');
    setEmailIdentifier('');
    setEmailPassword('');
    setRegisterName('');
    setRegisterUsername('');
    setRegisterEmail('');
    setRegisterPhone('+229 ');
    setRegisterPassword('');
    setError('');
    setLoading(false);
    onClose();
  };

  // --------------------------------------------------------------------------
  // EMAIL LOGIN HANDLER
  // --------------------------------------------------------------------------
  const handleEmailLogin = async () => {
    if (!emailIdentifier.trim() || !emailPassword.trim()) {
      setError(isEn ? 'Please fill in all fields' : 'Veuillez renseigner votre identifiant et mot de passe');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await AuthApi.loginWithEmail(emailIdentifier.trim(), emailPassword.trim());
      setAuthToken(res.token);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ token: res.token, user: res.user }));
      onAuthenticated(res.user, res.token);
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Invalid credentials' : 'Identifiant ou mot de passe incorrect'));
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // EMAIL REGISTRATION HANDLER
  // --------------------------------------------------------------------------
  const handleEmailRegister = async () => {
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setError(isEn ? 'Please complete required fields' : 'Veuillez remplir les champs obligatoires');
      return;
    }

    // Standard username processing (clean, 4+ chars, no @ required)
    const rawUsername = registerUsername.trim().replace(/^@+/, '').toLowerCase();
    const finalUsername = rawUsername || registerName.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_');

    if (finalUsername.length < 4) {
      setError(isEn ? 'Username must be at least 4 characters long' : "Le nom d'utilisateur doit comporter au moins 4 caractères");
      return;
    }

    if (!/^[a-z0-9_.-]+$/.test(finalUsername)) {
      setError(isEn ? 'Username can only contain letters, numbers, dots and hyphens' : "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et points");
      return;
    }

    if (registerPassword.trim().length < 6) {
      setError(isEn ? 'Password must be at least 6 characters' : 'Le mot de passe doit comporter au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await AuthApi.registerWithEmail({
        name: registerName.trim(),
        username: finalUsername,
        email: registerEmail.trim().toLowerCase(),
        phone: registerPhone.trim() || undefined,
        password: registerPassword.trim(),
      });

      setAuthToken(res.token);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ token: res.token, user: res.user }));
      onAuthenticated(res.user, res.token);
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Unable to create account' : "Impossible de créer le compte. Vérifiez vos informations."));
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // GOOGLE SIGN-IN HANDLER (Native OAuth 2.0 Account Picker)
  // --------------------------------------------------------------------------
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const profile = await promptGoogleSignIn();
      if (!profile) {
        setLoading(false);
        return; // User cancelled account selection
      }

      const res = await AuthApi.loginWithGoogle({
        email: profile.email,
        name: profile.name,
        googleId: profile.id,
        avatarUrl: profile.avatarUrl,
      });

      setAuthToken(res.token);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ token: res.token, user: res.user }));
      onAuthenticated(res.user, res.token);
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Google sign-in failed' : 'Connexion Google échouée'));
    } finally {
      setLoading(false);
    }
  };

  const headingFont = Platform.OS === 'android' ? 'serif' : 'Georgia';

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={resetAll}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: fadeAnim,
              maxHeight: keyboardHeight > 0 ? '98%' : '88%',
            },
          ]}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.brand, { color: colors.action }]}>OJARKET</Text>
              <Text style={[styles.title, { color: colors.text, fontFamily: headingFont }]}>
                {authMode === 'login'
                  ? isEn ? 'Sign In to Your Space' : 'Connexion à votre Espace'
                  : isEn ? 'Create an Account' : 'Créer un Compte'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.canvas, borderColor: colors.border }]}
              onPress={resetAll}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={[styles.closeTxt, { color: colors.muted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
            contentContainerStyle={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 40 : 40 }}
          >
            {/* GOOGLE 1-TAP PROMINENT BUTTON */}
            <TouchableOpacity
              style={[
                styles.googleBtn,
                {
                  backgroundColor: isDark ? colors.surface : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.action} />
              ) : (
                <>
                  <GoogleLogo size={22} />
                  <Text style={[styles.googleBtnText, { color: colors.text }]}>
                    {isEn ? 'Continue with Google' : 'Continuer avec Google'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* DIVIDER */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.muted }]}>
                {isEn ? 'OR WITH EMAIL' : 'OU PAR EMAIL'}
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* ERROR DISPLAY */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {/* MODE SWITCHER TABS */}
            <View style={[styles.tabBar, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.tabItem,
                  authMode === 'login' && {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => {
                  setAuthMode('login');
                  setError('');
                }}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    {
                      color: authMode === 'login' ? colors.action : colors.muted,
                      fontWeight: authMode === 'login' ? '700' : '500',
                    },
                  ]}
                >
                  {isEn ? 'Sign In' : 'Se Connecter'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabItem,
                  authMode === 'register' && {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => {
                  setAuthMode('register');
                  setError('');
                }}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    {
                      color: authMode === 'register' ? colors.action : colors.muted,
                      fontWeight: authMode === 'register' ? '700' : '500',
                    },
                  ]}
                >
                  {isEn ? 'Register' : "S'inscrire"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* FORM: LOGIN */}
            {authMode === 'login' && (
              <View style={styles.formSection}>
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {isEn ? 'Email or Username' : "Email ou Nom d'utilisateur"}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.canvas,
                      },
                    ]}
                    value={emailIdentifier}
                    onChangeText={(t) => {
                      setEmailIdentifier(t);
                      setError('');
                    }}
                    placeholder={isEn ? 'amina.diop@client.bj or alex_couture' : 'amina.diop@client.bj ou alex_couture'}
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                  />
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {isEn ? 'Password' : 'Mot de passe'}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.canvas,
                      },
                    ]}
                    value={emailPassword}
                    onChangeText={(t) => {
                      setEmailPassword(t);
                      setError('');
                    }}
                    placeholder="••••••••"
                    placeholderTextColor={colors.muted}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.action, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleEmailLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      {isEn ? 'Sign In →' : 'Se Connecter →'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* FORM: REGISTER */}
            {authMode === 'register' && (
              <View style={styles.formSection}>
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {isEn ? 'Full Name' : 'Nom Complet'} *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.canvas,
                      },
                    ]}
                    value={registerName}
                    onChangeText={(t) => {
                      setRegisterName(t);
                      setError('');
                    }}
                    placeholder="ex: Amina Diop"
                    placeholderTextColor={colors.muted}
                  />
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {isEn ? 'Username (4 chars min)' : "Nom d'utilisateur (4 car. min)"} *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.canvas,
                      },
                    ]}
                    value={registerUsername}
                    onChangeText={(t) => {
                      setRegisterUsername(t.replace(/^@+/, ''));
                      setError('');
                    }}
                    placeholder={isEn ? 'e.g. alex_couture' : 'ex: alex_couture'}
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                  />
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {isEn ? 'Email Address' : 'Adresse Email'} *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.canvas,
                      },
                    ]}
                    value={registerEmail}
                    onChangeText={(t) => {
                      setRegisterEmail(t);
                      setError('');
                    }}
                    placeholder="amina.diop@client.bj"
                    placeholderTextColor={colors.muted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {isEn ? 'Phone / WhatsApp (Optional)' : 'Téléphone / WhatsApp (Optionnel)'}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.canvas,
                      },
                    ]}
                    value={registerPhone}
                    onChangeText={(t) => {
                      setRegisterPhone(t);
                      setError('');
                    }}
                    placeholder="+229 97 00 00 00"
                    placeholderTextColor={colors.muted}
                    keyboardType="phone-pad"
                  />
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {isEn ? 'Password' : 'Mot de passe'} *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.canvas,
                      },
                    ]}
                    value={registerPassword}
                    onChangeText={(t) => {
                      setRegisterPassword(t);
                      setError('');
                    }}
                    placeholder="•••••••• (min. 6 caractères)"
                    placeholderTextColor={colors.muted}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.action, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleEmailRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      {isEn ? 'Create Account & Sign In →' : 'Créer mon Compte & Accéder →'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* TERMS & PRIVACY */}
            <Text style={[styles.footer, { color: colors.muted }]}>
              {isEn
                ? 'By continuing, you agree to Ojarket Terms of Service and Privacy Policy.'
                : "En continuant, vous acceptez les Conditions d'Utilisation et la Charte de Confidentialité d'Ojarket."}
            </Text>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Helpers
export async function restoreSession(): Promise<{ user: AuthUser; token: string } | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { token, user } = JSON.parse(raw);
    if (token && user) {
      setAuthToken(token);
      return { user: normalizeAuthUser(user), token };
    }
  } catch {
    // Corrupted session
  }
  return null;
}

export async function clearSession(): Promise<void> {
  setAuthToken(null);
  await AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
  try {
    await logoutGoogleAuth();
  } catch (e) {
    console.warn(e);
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brand: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemText: {
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  formSection: {
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 18,
  },
});

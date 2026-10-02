import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useDesign } from '../../design-system/provider';
import { AuthApi, setAuthToken, type AuthUser } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'ojarket.auth.session';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser, token: string) => void;
}

type Step = 'phone' | 'otp';

export default function AuthModal({ visible, onClose, onAuthenticated }: AuthModalProps) {
  const { colors, locale } = useDesign();
  const isEn = locale === 'en';

  const [step, setStep] = useState<Step>('phone');
  const [identifier, setIdentifier] = useState('+229');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [visible, fadeAnim]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOtp = async () => {
    const clean = identifier.trim().replace(/\s+/g, '');
    if (clean.length < 5) {
      setError(isEn ? 'Please enter a valid phone number or email' : 'Veuillez entrer un numéro de téléphone ou email valide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await AuthApi.requestOtp(clean);
      if (res.code) {
        setDevCode(res.code);
      }
      setStep('otp');
      setCountdown(300); // 5 min
    } catch (err: any) {
      setError(isEn ? 'Unable to send verification code. Check your connection.' : 'Impossible d\'envoyer le code de vérification. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.trim();
    if (code.length !== 6) {
      setError(isEn ? 'Enter the 6-digit code' : 'Entrez le code à 6 chiffres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await AuthApi.verifyOtp(identifier.trim(), code);
      setAuthToken(res.token);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ token: res.token, user: res.user }));
      onAuthenticated(res.user, res.token);
    } catch (err: any) {
      setError(isEn ? 'Invalid or expired code. Please try again.' : 'Code invalide ou expiré. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const res = await AuthApi.requestOtp(identifier.trim());
      if (res.code) setDevCode(res.code);
      setCountdown(300);
      setOtpCode('');
    } catch {
      setError(isEn ? 'Error sending new code' : 'Erreur d\'envoi du nouveau code');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('phone');
    setIdentifier('+229');
    setOtpCode('');
    setError('');
    setDevCode('');
    setCountdown(0);
    onClose();
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <Animated.View style={[styles.container, { backgroundColor: colors.surface, opacity: fadeAnim }]}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={reset} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={[styles.closeTxt, { color: colors.muted }]}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <Text style={[styles.brand, { color: colors.action }]}>OJARKET</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {step === 'phone'
              ? (isEn ? 'Sign In' : 'Connexion')
              : (isEn ? 'Verification Code' : 'Code de Vérification')
            }
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {step === 'phone'
              ? (isEn
                ? 'Enter your phone number or email to continue'
                : 'Entrez votre numéro de téléphone ou email pour continuer'
              )
              : (isEn
                ? `A 6-digit code was sent to ${identifier}`
                : `Un code à 6 chiffres a été envoyé au ${identifier}`
              )
            }
          </Text>

          {/* Step: Phone / Email */}
          {step === 'phone' && (
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {isEn ? 'Phone or Email' : 'Téléphone ou Email'}
              </Text>
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.canvas }]}
                value={identifier}
                onChangeText={(t) => { setIdentifier(t); setError(''); }}
                placeholder={isEn ? '+229 97 11 22 33' : '+229 97 11 22 33'}
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                autoFocus
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.action, opacity: loading ? 0.6 : 1 }]}
                onPress={handleRequestOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {isEn ? 'Send Verification Code' : 'Envoyer le Code de Vérification'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Step: OTP */}
          {step === 'otp' && (
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {isEn ? 'Verification Code' : 'Code de Vérification'}
              </Text>
              <TextInput
                style={[styles.input, styles.otpInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.canvas }]}
                value={otpCode}
                onChangeText={(t) => { setOtpCode(t.replace(/[^0-9]/g, '').slice(0, 6)); setError(''); }}
                placeholder="● ● ● ● ● ●"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              {devCode ? (
                <Text style={[styles.devHint, { color: colors.muted }]}>
                  [DEV] Code: {devCode}
                </Text>
              ) : null}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.action, opacity: loading ? 0.6 : 1 }]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {isEn ? 'Verify & Sign In' : 'Vérifier & Se Connecter'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryBtn, { opacity: countdown > 0 ? 0.4 : 1 }]}
                onPress={handleResendOtp}
                disabled={countdown > 0 || loading}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.action }]}>
                  {countdown > 0
                    ? (isEn ? `Resend in ${formatCountdown(countdown)}` : `Renvoyer dans ${formatCountdown(countdown)}`)
                    : (isEn ? 'Resend Code' : 'Renvoyer le Code')
                  }
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setStep('phone'); setOtpCode(''); setError(''); }}>
                <Text style={[styles.backLink, { color: colors.muted }]}>
                  {isEn ? '← Change number' : '← Changer de numéro'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <Text style={[styles.footer, { color: colors.muted }]}>
            {isEn
              ? 'By signing in, you accept the Terms of Service and Privacy Policy.'
              : 'En vous connectant, vous acceptez les Conditions d\'Utilisation et la Politique de Confidentialité.'
            }
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Helper to restore session on app startup
export async function restoreSession(): Promise<{ user: AuthUser; token: string } | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { token, user } = JSON.parse(raw);
    if (token && user) {
      setAuthToken(token);
      return { user, token };
    }
  } catch {
    // Corrupted session
  }
  return null;
}

export async function clearSession(): Promise<void> {
  setAuthToken(null);
  await AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
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
    minHeight: 400,
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
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  devHint: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
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
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  backLink: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 16,
  },
});

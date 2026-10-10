import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Linking, Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth 2.0 Web Client Configuration
const GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
  '544302812438-hsgqiq11psr1c0fjrq22o96i2ncs75j4.apps.googleusercontent.com';

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  idToken?: string;
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com'));
}

// Initialize native Google Sign In module if available in current build
let GoogleSigninModule: any = null;
try {
  const g = require('@react-native-google-signin/google-signin');
  if (g && g.GoogleSignin) {
    GoogleSigninModule = g.GoogleSignin;
    GoogleSigninModule.configure({
      webClientId: GOOGLE_CLIENT_ID,
      offlineAccess: false,
    });
  }
} catch {
  // Native module not linked in current runtime, web/browser fallback will be used
}

function parseParamsFromUrl(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const queryPart = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
  const hashPart = url.includes('#') ? url.split('#')[1] : '';
  const combined = [queryPart, hashPart].filter(Boolean).join('&');
  if (!combined) return params;

  combined.split('&').forEach((pair) => {
    const [key, val] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(val || '');
    }
  });
  return params;
}

/**
 * Prompts Google Sign-In on the device.
 * 1. Tries native Google Play Services bottom-sheet account picker first.
 * 2. Falls back to secure in-app WebBrowser OAuth with scheme redirect (ojarket://).
 */
export async function promptGoogleSignIn(): Promise<GoogleUserProfile | null> {
  if (!isGoogleAuthConfigured()) {
    throw new Error(
      "Configuration Google manquante : Veuillez renseigner votre 'Client ID' Google Cloud."
    );
  }

  // 1. Attempt Native Google Sign-In (Best UX on Android / iOS)
  if (GoogleSigninModule) {
    try {
      await GoogleSigninModule.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSigninModule.signIn();
      const user = signInResult.data?.user || signInResult.user;
      if (user && user.email) {
        console.log('[GoogleAuth] Native Sign-In succeeded for:', user.email);
        return {
          id: user.id || `google_${user.email}`,
          email: user.email,
          name: user.name || user.givenName || user.email.split('@')[0],
          avatarUrl: user.photo || undefined,
          idToken: signInResult.data?.idToken || signInResult.idToken,
        };
      }
    } catch (nativeErr: any) {
      // If user cancelled, don't fall back to browser, return null immediately
      if (nativeErr?.code === 'SIGN_IN_CANCELLED' || nativeErr?.message?.includes('cancelled')) {
        console.log('[GoogleAuth] User cancelled native sign-in.');
        return null;
      }
      console.log('[GoogleAuth] Native sign-in unavailable, proceeding with WebBrowser OAuth:', nativeErr?.message);
    }
  }

  // 2. WebBrowser AuthSession Fallback with custom scheme
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'ojarket',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    GOOGLE_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token&scope=${encodeURIComponent(
    'openid profile email'
  )}&prompt=select_account`;

  console.log('[GoogleAuth] Opening OAuth with redirectUri:', redirectUri);

  return new Promise<GoogleUserProfile | null>(async (resolve, reject) => {
    let handled = false;

    const cleanup = () => {
      subscription.remove();
    };

    const processAuthToken = async (accessToken: string) => {
      try {
        const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          throw new Error('Impossible de récupérer les informations du compte Google');
        }

        const data = await res.json();
        console.log('[GoogleAuth] Profile retrieved successfully:', data.email);
        return {
          id: data.id || `google_${data.email}`,
          email: data.email,
          name: data.name || data.email.split('@')[0],
          avatarUrl: data.picture,
        };
      } catch (err) {
        throw err;
      }
    };

    const handleUrlEvent = async (event: { url: string }) => {
      if (handled) return;
      console.log('[GoogleAuth] Deep link received:', event.url);
      const params = parseParamsFromUrl(event.url);
      if (params.access_token) {
        handled = true;
        cleanup();
        try {
          const profile = await processAuthToken(params.access_token);
          resolve(profile);
        } catch (e) {
          reject(e);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleUrlEvent);

    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      console.log('[GoogleAuth] WebBrowser result:', result);

      if (result.type === 'success' && result.url) {
        handled = true;
        cleanup();
        const params = parseParamsFromUrl(result.url);
        if (params.access_token) {
          const profile = await processAuthToken(params.access_token);
          resolve(profile);
          return;
        }
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        setTimeout(() => {
          if (!handled) {
            cleanup();
            resolve(null);
          }
        }, 1000);
      }
    } catch (err) {
      console.warn('[GoogleAuth] Error in openAuthSessionAsync, fallback to Linking:', err);
      try {
        await Linking.openURL(authUrl);
      } catch (linkErr) {
        cleanup();
        reject(linkErr);
      }
    }
  });
}

/**
 * Signs out of the native Google account picker so that the user 
 * is prompted to select an account again on next login.
 */
export async function logoutGoogleAuth() {
  if (GoogleSigninModule) {
    try {
      await GoogleSigninModule.signOut();
      console.log('[GoogleAuth] Native sign out successful.');
    } catch (err) {
      console.warn('[GoogleAuth] Native sign out failed:', err);
    }
  }
}


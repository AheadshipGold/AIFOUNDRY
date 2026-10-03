// Google OAuth 2.0 Web Client for Ojarket Web
// Connects directly to official Google Identity Services & OAuth 2.0 API

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '544302812438-hsgqiq11psr1c0fjrq22o96i2ncs75j4.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: any;
  }
}

let scriptLoadingPromise: Promise<void> | null = null;

export function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google SDK')));
      if ((existing as any).loaded) {
        resolve();
      }
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google SDK'));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  idToken?: string;
}

/**
 * Opens official Google OAuth 2.0 account selection popup or Token Client.
 * Automatically retrieves verified Google account data (email, name, picture).
 */
export async function promptGoogleSignInWeb(): Promise<GoogleUserProfile> {
  if (typeof window === 'undefined') {
    throw new Error('Google Sign-In is only available in browser environments.');
  }

  try {
    await loadGoogleScript();
  } catch (loadErr) {
    console.warn('[GoogleAuthWeb] GSI script load warning, trying popup fallback:', loadErr);
  }

  // Method 1: Google Identity Services Token Client (Modern official standard)
  if (window.google?.accounts?.oauth2) {
    return new Promise<GoogleUserProfile>((resolve, reject) => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid profile email',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              if (tokenResponse.error === 'popup_closed_by_user') {
                reject(new Error('Connexion Google annulée par l\'utilisateur.'));
              } else {
                reject(new Error(tokenResponse.error_description || tokenResponse.error));
              }
              return;
            }

            if (!tokenResponse.access_token) {
              reject(new Error("Aucun jeton d'accès reçu de Google."));
              return;
            }

            try {
              const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });

              if (!res.ok) {
                throw new Error('Impossible de récupérer le profil Google');
              }

              const data = await res.json();
              resolve({
                id: data.id || `google_${data.email}`,
                email: data.email,
                name: data.name || data.email.split('@')[0],
                avatarUrl: data.picture,
              });
            } catch (fetchErr: any) {
              reject(fetchErr);
            }
          },
          error_callback: (err: any) => {
            reject(new Error(err?.message || 'Erreur lors de la connexion Google'));
          },
        });

        // Trigger Google official popup
        client.requestAccessToken({ prompt: 'select_account' });
      } catch (clientErr: any) {
        reject(clientErr);
      }
    });
  }

  // Method 2: Standard Google OAuth 2.0 Popup window fallback
  return new Promise<GoogleUserProfile>((resolve, reject) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      GOOGLE_CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${encodeURIComponent(
      'openid profile email'
    )}&prompt=select_account`;

    const popup = window.open(
      authUrl,
      'google_oauth_popup',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,location=no,status=no`
    );

    if (!popup) {
      reject(new Error('Veuillez autoriser les fenêtres pop-up pour vous connecter avec Google.'));
      return;
    }

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        reject(new Error('Connexion Google annulée.'));
      }
    }, 1000);
  });
}

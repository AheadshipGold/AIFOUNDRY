import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Télécharger Ojarket pour Android | APK Officiel Universel',
  description: 'Téléchargez l\'application native officielle Ojarket pour Android. Caisse enregistreuse de poche, inventaire en direct et commandes sur-mesure.',
};

export default function DownloadAndroidPage() {
  const downloadUrl = '/api/v1/download/android';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#081018',
      color: '#FAF9F6',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: '#111C1A',
        border: '1px solid #233834',
        borderRadius: '24px',
        padding: '40px 32px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
      }}>
        {/* En-tête de marque */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#0D4A38',
            border: '1px solid #D4B483',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4B483" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </div>
          <div>
            <span style={{
              fontSize: '11px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#D4B483',
              fontWeight: 600,
            }}>
              Application Native Officielle
            </span>
            <h1 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: '#FAF9F6' }}>
              Ojarket pour Android
            </h1>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#94A3B8', margin: '0 0 24px' }}>
          Profitez de la puissance de votre boutique dans votre poche : point de vente au comptoir (POS), livre de caisse immuable, gestion des stocks en direct et suivi des commandes, même hors-ligne.
        </p>

        {/* Fiche technique */}
        <div style={{
          backgroundColor: '#0D1F1B',
          borderRadius: '14px',
          border: '1px solid #182E29',
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginBottom: '32px',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#717882', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Version</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#FAF9F6', marginTop: '2px' }}>1.0.0 (Build 1)</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#717882', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Taille</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#FAF9F6', marginTop: '2px' }}>~133 Mo</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#717882', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Système requis</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#FAF9F6', marginTop: '2px' }}>Android 8.0+</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#717882', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Signature</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#10B981', marginTop: '2px' }}>Certifiée EAS</div>
          </div>
        </div>

        {/* Bouton de téléchargement principal */}
        <a
          href={downloadUrl}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            backgroundColor: '#0D4A38',
            color: '#FFFFFF',
            textDecoration: 'none',
            padding: '16px 24px',
            borderRadius: '14px',
            fontWeight: 600,
            fontSize: '16px',
            boxShadow: '0 8px 24px rgba(13, 74, 56, 0.4)',
            border: '1px solid #10B981',
            boxSizing: 'border-box',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Télécharger le fichier APK officiel
        </a>

        {/* Guide d'installation en 3 étapes */}
        <div style={{ marginTop: '36px', borderTop: '1px solid #182E29', paddingTop: '28px' }}>
          <h3 style={{ fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', color: '#D4B483', margin: '0 0 16px', fontWeight: 600 }}>
            Guide d&apos;installation rapide
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#182624',
                color: '#D4B483',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>1</div>
              <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.5' }}>
                Appuyez sur le bouton vert ci-dessus pour lancer le téléchargement du fichier <strong>Ojarket.apk</strong>.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#182624',
                color: '#D4B483',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>2</div>
              <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.5' }}>
                Si Android affiche <em>« Ce type de fichier peut être nocif »</em>, sélectionnez <strong>Télécharger quand même</strong> (il s&apos;agit de l&apos;avertissement standard pour les APK hors Play Store).
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#182624',
                color: '#D4B483',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>3</div>
              <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.5' }}>
                Ouvrez le fichier téléchargé, appuyez sur <strong>Installer</strong>, puis lancez Ojarket et connectez-vous à votre compte.
              </div>
            </div>
          </div>
        </div>

        {/* Liens de retour */}
        <div style={{ marginTop: '32px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link href="/" style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'none' }}>
            Retour à la vitrine Web
          </Link>
          <span style={{ color: '#334155' }}>•</span>
          <Link href="/seller" style={{ fontSize: '13px', color: '#D4B483', textDecoration: 'none' }}>
            Accéder à l&apos;espace Vendeur
          </Link>
        </div>
      </div>
    </div>
  );
}

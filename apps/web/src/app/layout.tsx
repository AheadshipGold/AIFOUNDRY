import type { Viewport } from 'next';

import { PwaInstallBanner } from '../components/pwa/PwaInstallBanner';

export const metadata = {
  title: 'Ojarket — Marketplace E-Commerce & Merchant OS | Bénin & West Africa',
  description: 'Marketplace marchande moderne et Merchant Commerce OS : boutiques vérifiées, catalogue de produits et gestion financière de caisse en temps réel.',
  manifest: '/manifest.json',
  icons: {
    icon: '/brand/Ojarket_04_Favicon_512_Transparent.png',
    apple: '/brand/Ojarket_05_AppIcon_Master_1024_Transparent.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FAF9F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <head>
        <link rel="icon" href="/brand/Ojarket_04_Favicon_512_Transparent.png" type="image/png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem('aifoundry.ui-gallery'),l='fr';if(s){var p=JSON.parse(s);if(p&&(p.locale==='en'||p.locale==='fr'))l=p.locale}else{var n=(navigator.languages&&navigator.languages[0])||navigator.language||'';if(n.toLowerCase().startsWith('en'))l='en'}document.documentElement.lang=l}catch(e){}`,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, width: '100%', maxWidth: '100%', overflowX: 'hidden', backgroundColor: '#081018' }}>
        {children}
        <PwaInstallBanner />
      </body>
    </html>
  );
}

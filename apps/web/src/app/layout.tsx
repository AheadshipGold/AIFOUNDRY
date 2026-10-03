export const metadata = {
  title: 'Ojarket — Marketplace E-Commerce & Merchant OS | Bénin & West Africa',
  description: 'Marketplace marchande moderne et Merchant Commerce OS : boutiques vérifiées, catalogue de produits et gestion financière de caisse en temps réel.',
  icons: {
    icon: '/brand/Ojarket_04_Favicon_512_Transparent.png',
    apple: '/brand/Ojarket_05_AppIcon_Master_1024_Transparent.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/brand/Ojarket_04_Favicon_512_Transparent.png" type="image/png" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

export const metadata = {
  title: 'Ojarket — Le Marché d’Excellence | West-Africa-First & International Commerce',
  description: 'Marketplace d’exception et Merchant Commerce OS : artisanat de prestige, expression de besoins sur-mesure et gestion financière de caisse sans faille.',
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

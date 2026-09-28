export const metadata = {
  title: 'AI Foundry Web',
  description: 'AI Foundry Web Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

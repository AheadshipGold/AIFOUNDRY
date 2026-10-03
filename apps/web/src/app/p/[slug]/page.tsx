import React from 'react';
import Link from 'next/link';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductLandingPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D2E26', color: '#FAF9F6', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Banner */}
      <header style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#FAF9F6', fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>
          OJARKET
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            href="/admin"
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#FAF9F6',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Console Admin
          </Link>
          <a
            href={`ojarket://product/${slug}`}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              backgroundColor: '#C49A45',
              color: '#0D2E26',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Ouvrir dans l'App Mobile
          </a>
        </div>
      </header>

      {/* Hero Showcase */}
      <main style={{ maxWidth: 1000, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#133E34', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {/* Image section */}
            <div style={{ backgroundColor: '#0A241E', padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 380 }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 72 }}>✨</span>
                <p style={{ marginTop: 16, color: '#C49A45', fontWeight: 700, fontSize: 13, letterSpacing: 1.5 }}>
                  PRODUIT CERTIFIÉ OJARKET
                </p>
              </div>
            </div>

            {/* Info section */}
            <div style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(196,154,69,0.15)', color: '#C49A45', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                  RÉFÉRENCE #{slug.toUpperCase()}
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 12px 0', lineHeight: 1.2 }}>
                  Produit & Article de Qualité Supérieure
                </h1>
                <p style={{ color: 'rgba(250,249,246,0.7)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px 0' }}>
                  Produit vendu et garanti par nos commerçants et boutiques vérifiés sur Ojarket. Finitions soignées et conformité commerciale assurée.
                </p>

                <div style={{ padding: 16, backgroundColor: '#0D2E26', borderRadius: 14, marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: 'rgba(250,249,246,0.6)', marginBottom: 4 }}>Paiement Marchand Direct</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#C49A45' }}>MTN MoMo (*880#) & Moov Money (*155#)</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a
                  href={`ojarket://product/${slug}`}
                  style={{
                    backgroundColor: '#C49A45',
                    color: '#0D2E26',
                    textAlign: 'center',
                    padding: '16px 24px',
                    borderRadius: 14,
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: 16,
                    boxShadow: '0 4px 14px rgba(196,154,69,0.4)',
                  }}
                >
                  Commander dans l'Application Mobile →
                </a>
                <Link
                  href="/"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    color: '#FAF9F6',
                    textAlign: 'center',
                    padding: '14px 24px',
                    borderRadius: 14,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Découvrir tout le catalogue Ojarket
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '40px 24px', color: 'rgba(250,249,246,0.5)', fontSize: 13 }}>
        © 2026 Ojarket · Marketplace E-Commerce & Merchant OS · Cotonou, Bénin
      </footer>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProductData(idOrSlug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  try {
    const res = await fetch(`${baseUrl}/v1/catalog/${idOrSlug}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching product data:', error);
    return null;
  }
}

/**
 * Génération dynamique des balises OpenGraph et Twitter Cards pour WhatsApp, Facebook et X
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductData(slug);

  if (!product) {
    return {
      title: 'Pièce & Création Introuvable | Ojarket',
      description: 'Ce produit n’existe pas ou n’est plus disponible au catalogue.',
    };
  }

  const formattedPrice = (product.priceMinor / 100).toLocaleString('fr-FR');
  const shopName = product.artisanShop?.name || 'Boutique Officielle';
  const shopLocation = product.artisanShop?.city ? ` · ${product.artisanShop.city}` : '';
  const title = `${product.title} (${formattedPrice} ${product.currency}) | ${shopName}`;
  const description = product.description 
    ? `${product.description.slice(0, 150)}... Garanti par ${shopName}${shopLocation} sur Ojarket.`
    : `Découvrez "${product.title}" au prix de ${formattedPrice} ${product.currency}, disponible auprès de ${shopName} sur Ojarket.`;

  const image = product.image || 'https://ojarket.com/reference-assets/market-tote.png';
  const canonicalUrl = `https://ojarket.com/p/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Ojarket · Haute Maison Ouest-Africaine',
      images: [
        {
          url: image,
          width: 1200,
          height: 1200,
          alt: product.title,
        },
      ],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductLandingPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductData(slug);

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0D2E26', color: '#FAF9F6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#C49A45', marginBottom: '12px' }}>Pièce Introuvable</h1>
        <p style={{ color: 'rgba(250,249,246,0.7)', marginBottom: '24px' }}>Cet article n’est plus disponible ou a été retiré du catalogue.</p>
        <Link href="/" style={{ padding: '12px 24px', backgroundColor: '#C49A45', color: '#0D2E26', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
          Retour à la Galerie Principale
        </Link>
      </div>
    );
  }

  const formattedPrice = (product.priceMinor / 100).toLocaleString('fr-FR');
  const shopName = product.artisanShop?.name || 'Boutique Officielle';
  const shopCity = product.artisanShop?.city || 'Cotonou';
  const shopCountry = product.artisanShop?.country || 'Bénin';
  const shopSlug = product.artisanShop?.id || '';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A1210', color: '#FAF9F6', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Banner */}
      <header style={{ padding: '20px 24px', borderBottom: '1px solid rgba(212,180,131,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#FAF9F6', fontSize: 22, fontWeight: 700, letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#C49A45' }}>Ọ</span>
          <span>OJAR盤KET</span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a
            href={`ojarket://product/${slug}`}
            style={{
              padding: '8px 18px',
              borderRadius: 20,
              backgroundColor: '#C49A45',
              color: '#0A1210',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Ouvrir dans l'App Mobile
          </a>
        </div>
      </header>

      {/* Hero Showcase */}
      <main style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#0D1F1B', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(212,180,131,0.2)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
            {/* Image section */}
            <div style={{ backgroundColor: '#061613', padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 440, position: 'relative' }}>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: 16 }}
                />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="#C49A45" style={{ display: 'inline-block' }}>
                    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                  </svg>
                  <p style={{ marginTop: 16, color: '#C49A45', fontWeight: 700, fontSize: 13, letterSpacing: 1.5 }}>
                    PIÈCE CERTIFIÉE OJARKET
                  </p>
                </div>
              )}
            </div>

            {/* Info section */}
            <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Shop Badge Link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ backgroundColor: 'rgba(196,154,69,0.15)', color: '#D4B483', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                    {product.category?.toUpperCase() || 'CRÉATION DE LUXE'}
                  </span>
                  {product.artisanShop?.verified && (
                    <span style={{ color: '#10B981', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      ✓ Marchand Vérifié
                    </span>
                  )}
                </div>

                <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px 0', lineHeight: 1.25, color: '#FFFFFF' }}>
                  {product.title}
                </h1>

                {/* Seller & Origin */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <span style={{ color: 'rgba(250,249,246,0.6)', fontSize: 14 }}>Vendu par :</span>
                  <strong style={{ color: '#D4B483', fontSize: 14 }}>{shopName}</strong>
                  <span style={{ color: 'rgba(250,249,246,0.4)', fontSize: 13 }}>({shopCity}, {shopCountry})</span>
                </div>

                <p style={{ color: 'rgba(250,249,246,0.75)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px 0' }}>
                  {product.description || "Article de qualité supérieure confectionné selon les règles de l'art par nos boutiques partenaires certifiées."}
                </p>

                {/* Price Block */}
                <div style={{ padding: 18, backgroundColor: '#061613', borderRadius: 16, border: '1px solid rgba(212,180,131,0.15)', marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: 'rgba(250,249,246,0.6)', marginBottom: 4 }}>Prix Officiel Garanti</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: '#C49A45' }}>
                    {formattedPrice} <span style={{ fontSize: 18 }}>{product.currency}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a
                  href={`ojarket://product/${slug}`}
                  style={{
                    backgroundColor: '#C49A45',
                    color: '#0A1210',
                    textAlign: 'center',
                    padding: '16px 24px',
                    borderRadius: 14,
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: 16,
                    boxShadow: '0 6px 20px rgba(196,154,69,0.3)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  Commander dans l'Application Mobile →
                </a>

                {shopSlug && (
                  <Link
                    href={`/shop/${shopSlug}`}
                    style={{
                      backgroundColor: 'rgba(212,180,131,0.12)',
                      color: '#D4B483',
                      textAlign: 'center',
                      padding: '12px 24px',
                      borderRadius: 14,
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: 14,
                      border: '1px solid rgba(212,180,131,0.25)',
                    }}
                  >
                    Visiter la Boutique de {shopName}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '40px 24px', color: 'rgba(250,249,246,0.4)', fontSize: 13, borderTop: '1px solid rgba(212,180,131,0.1)' }}>
        © 2026 Ojarket · Marketplace E-Commerce & Merchant OS · https://ojarket.com
      </footer>
    </div>
  );
}

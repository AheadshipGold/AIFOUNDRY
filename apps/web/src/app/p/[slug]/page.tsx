import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import ProductShareButton from './ProductShareButton';
import './product.css';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

import { getProductById } from '@/lib/server/catalog';

async function getProductData(idOrSlug: string) {
  try {
    return await getProductById(idOrSlug);
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

  let image = product.image || 'https://ojarket.com/reference-assets/market-tote.png';
  if (image.startsWith('/')) {
    image = `https://ojarket.com${image}`;
  }
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
      siteName: 'Ojarket',
      images: [
        {
          url: image,
          secureUrl: image,
          width: 800,
          height: 800,
          type: image.endsWith('.png') ? 'image/png' : image.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
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
      <div style={{ minHeight: '100vh', backgroundColor: '#081018', color: '#F5F7F3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#D4B483', marginBottom: '12px', fontFamily: 'var(--oj-font-editorial, serif)' }}>Pièce Introuvable</h1>
        <p style={{ color: 'rgba(245,247,243,0.7)', marginBottom: '24px' }}>Cet article n’est plus disponible ou a été retiré du catalogue.</p>
        <Link href="/" style={{ padding: '12px 28px', backgroundColor: '#0D4A38', color: '#FFFFFF', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(212,180,131,0.3)' }}>
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
    <div style={{ minHeight: '100vh', backgroundColor: '#081018', color: '#F5F7F3', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Banner Navigation with OFFICIAL BRAND LOGO */}
      <header style={{ padding: '16px 28px', borderBottom: '1px solid rgba(35, 56, 52, 0.8)', backgroundColor: '#111C1A', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Dark_Transparent.png"
              alt="Ojarket"
              style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <Link
              href="/"
              style={{
                fontSize: '13px',
                color: 'rgba(245, 247, 243, 0.75)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
              }}
              className="oj-subtle-link"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Galerie</span>
            </Link>

            <a
              href={`ojarket://product/${slug}`}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                backgroundColor: 'rgba(212, 180, 131, 0.15)',
                color: '#D4B483',
                border: '1px solid rgba(212, 180, 131, 0.35)',
                textDecoration: 'none',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              className="oj-app-btn"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span>App Mobile</span>
            </a>
          </div>
        </div>
      </header>

      {/* Editorial Breadcrumbs */}
      <div style={{ maxWidth: 1200, margin: '24px auto 0', padding: '0 24px' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'rgba(245, 247, 243, 0.5)' }}>
          <Link href="/" style={{ color: 'rgba(245, 247, 243, 0.65)', textDecoration: 'none' }}>
            Accueil
          </Link>
          <span>/</span>
          {shopSlug ? (
            <Link href={`/shop/${shopSlug}`} style={{ color: '#D4B483', textDecoration: 'none' }}>
              {shopName}
            </Link>
          ) : (
            <span>{shopName}</span>
          )}
          <span>/</span>
          <span style={{ textTransform: 'capitalize' }}>{product.category || 'Création'}</span>
          <span>/</span>
          <span style={{ color: '#F5F7F3', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
            {product.title}
          </span>
        </nav>
      </div>

      {/* Hero Showcase */}
      <main style={{ maxWidth: 1200, margin: '24px auto 60px', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#111C1A', borderRadius: 20, overflow: 'hidden', border: '1px solid #233834', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
            {/* Visual Section */}
            <div style={{ backgroundColor: '#0D1A17', padding: '40px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 460, position: 'relative' }}>
              {product.image ? (
                <div style={{ width: '100%', maxHeight: '440px', overflow: 'hidden', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', maxHeight: '440px', objectFit: 'contain', transition: 'transform 0.4s ease' }}
                    className="oj-zoomable-image"
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4B483" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginBottom: '12px' }}>
                    <polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.3 9 8.5 12 2" />
                  </svg>
                  <p style={{ margin: 0, color: '#D4B483', fontWeight: 600, fontSize: '12px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                    Pièce Certifiée Ojarket
                  </p>
                </div>
              )}
            </div>

            {/* Information Section */}
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Category & Verified Jewel Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ backgroundColor: 'rgba(212, 180, 131, 0.12)', color: '#D4B483', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {product.category || 'CRÉATION DE LUXE'}
                  </span>
                  {product.artisanShop?.verified && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#10B981', fontSize: '12px', fontWeight: 600 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#10B981" stroke="none">
                        <polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.3 9 8.5 12 2" />
                      </svg>
                      Maison Certifiée
                    </span>
                  )}
                </div>

                <h1 style={{ fontSize: '28px', fontFamily: 'var(--oj-font-editorial, serif)', fontWeight: 600, margin: '0 0 12px 0', lineHeight: 1.3, color: '#F5F7F3' }}>
                  {product.title}
                </h1>

                {/* Seller & Origin */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <span style={{ color: 'rgba(245, 247, 243, 0.55)', fontSize: 13.5 }}>Confectionné par :</span>
                  <strong style={{ color: '#D4B483', fontSize: 14 }}>{shopName}</strong>
                  <span style={{ color: 'rgba(245, 247, 243, 0.4)', fontSize: 13 }}>({shopCity}, {shopCountry})</span>
                </div>

                <p style={{ color: 'rgba(245, 247, 243, 0.75)', fontSize: 14.5, lineHeight: 1.7, margin: '0 0 24px 0' }}>
                  {product.description || "Article d'art d'exception confectionné selon les règles de la haute facture ouest-africaine par nos maîtres artisans certifiés."}
                </p>

                {/* Price Block */}
                <div style={{ padding: '20px 24px', backgroundColor: '#0D1A17', borderRadius: '12px', border: '1px solid #233834', marginBottom: 28 }}>
                  <div style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(245, 247, 243, 0.55)', marginBottom: 4 }}>
                    Prix Officiel Garanti
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#F5F7F3', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--oj-font-editorial, serif)' }}>
                    {formattedPrice} <span style={{ fontSize: '18px', color: '#D4B483', fontWeight: 600 }}>{product.currency}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#10B981', marginTop: '6px' }}>
                    Authenticité vérifiée · Paiement séquestré jusqu'à réception certifiée
                  </div>
                </div>
              </div>

              {/* Action Buttons with Micro-interactions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a
                  href={`ojarket://product/${slug}`}
                  style={{
                    backgroundColor: '#0D4A38',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    padding: '16px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    boxShadow: '0 4px 14px rgba(13, 74, 56, 0.4)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  className="oj-action-btn"
                >
                  <span>Commander dans l'Application Mobile</span>
                  <span>→</span>
                </a>

                {/* Direct Share Component (Native Share & WhatsApp) */}
                <ProductShareButton
                  productTitle={product.title}
                  formattedPrice={formattedPrice}
                  currency={product.currency}
                  shopName={shopName}
                  productUrl={`https://ojarket.com/p/${slug}`}
                />

                {shopSlug && (
                  <Link
                    href={`/shop/${shopSlug}`}
                    style={{
                      backgroundColor: 'rgba(212, 180, 131, 0.08)',
                      color: '#D4B483',
                      textAlign: 'center',
                      padding: '13px 24px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '13.5px',
                      border: '1px solid rgba(212, 180, 131, 0.25)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="oj-secondary-btn"
                  >
                    Visiter la Maison {shopName}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '36px 24px', color: 'rgba(245, 247, 243, 0.4)', fontSize: '12.5px', borderTop: '1px solid #233834' }}>
        © 2026 Ojarket · Haute Plateforme d'Artisanat & Merchant OS
      </footer>
    </div>
  );
}

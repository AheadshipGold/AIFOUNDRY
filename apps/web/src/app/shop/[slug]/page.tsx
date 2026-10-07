import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import './landing.css';
import ShareButton from './ShareButton';

export const revalidate = 60;

interface ShopPageProps {
  params: Promise<{ slug: string }>;
}

async function getShopData(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  try {
    const res = await fetch(`${baseUrl}/v1/shops/${slug}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching shop data:', error);
    return null;
  }
}

/**
 * Génération dynamique des balises OpenGraph et Twitter Cards pour WhatsApp, Facebook et X
 */
export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShopData(slug);

  if (!shop) {
    return {
      title: 'Boutique Introuvable | Ojarket',
      description: 'Cette boutique officielle n’existe pas ou a changé d’adresse.',
    };
  }

  const title = `${shop.name} · Boutique Officielle | Ojarket`;
  const location = `${shop.city}${shop.country ? `, ${shop.country}` : ''}`;
  const description = shop.description 
    ? `${shop.description.slice(0, 150)}... — Découvrez les créations certifiées de ${shop.name} (${location}) sur Ojarket.`
    : `Découvrez la boutique officielle ${shop.name} (${location}) sur Ojarket. Produits de luxe et créations sur-mesure garantis.`;

  const bannerImage = shop.bannerUrl || 'https://ojarket.com/reference-assets/market-tote.png';
  const canonicalUrl = `https://ojarket.com/shop/${slug}`;

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
          url: bannerImage,
          width: 1200,
          height: 630,
          alt: `${shop.name} sur Ojarket`,
        },
      ],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [bannerImage],
    },
  };
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { slug } = await params;
  const shop = await getShopData(slug);

  if (!shop) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F6F0', color: '#1A1A1A', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontFamily: 'serif', marginBottom: '1rem', color: '#075D49' }}>Boutique Introuvable</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>La boutique ou le vendeur recherché n’existe pas ou a changé d’adresse.</p>
        <Link href="/" style={{ padding: '0.75rem 1.75rem', backgroundColor: '#075D49', color: '#FFF', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          Retour à la galerie principale
        </Link>
      </div>
    );
  }

  const { name, description, craftType, city, country, isVerified, bannerUrl, rating, reviewsCount, products, reviews } = shop;

  return (
    <div className="luxury-storefront" style={{ backgroundColor: '#F8F6F0', color: '#1A1A1A', minHeight: '100vh' }}>
      {/* Top navigation */}
      <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid #E5E0D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#075D49', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Galerie Ojarket
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href={`ojarket://shop/${slug}`}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: 'rgba(7, 93, 73, 0.08)',
              color: '#075D49',
              border: '1px solid rgba(7, 93, 73, 0.2)',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Ouvrir dans l'App Mobile
          </a>
          <ShareButton shopName={name} shopUrl={`https://ojarket.com/shop/${slug}`} />
        </div>
      </nav>

      {/* Hero Banner */}
      <div 
        className="storefront-banner" 
        style={{ 
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none',
          backgroundColor: bannerUrl ? 'transparent' : '#0A1210',
          minHeight: '280px',
          height: '35vh'
        }}
      >
        <div className="banner-overlay" style={{ background: 'linear-gradient(to bottom, rgba(10,18,16,0.6), rgba(10,18,16,0.9))' }}></div>
        <div className="banner-content" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(173,132,85,0.2)', border: '1px solid #AD8455', borderRadius: '999px', marginBottom: '1rem' }}>
            <span style={{ color: '#D4B483', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              {craftType || 'Boutique Officielle'}
            </span>
            {isVerified && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#10B981', fontSize: '0.75rem', fontWeight: 600 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Vérifié
              </span>
            )}
          </div>
          <h1 className="banner-title" style={{ color: '#FFFFFF', fontSize: '2.5rem', fontFamily: 'serif', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{name}</h1>
          <p style={{ color: '#D4B483', fontSize: '0.95rem', margin: 0 }}>
            {city}{country ? `, ${country}` : ''}
          </p>
        </div>
      </div>
      
      {/* Main Container */}
      <main className="storefront-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <header className="storefront-header" style={{ marginBottom: '3rem', textAlign: 'center' }}>
          {description && (
            <p className="storefront-description" style={{ color: '#4A4A4A', fontSize: '1.05rem', lineHeight: '1.8', maxWidth: '750px', margin: '0 auto 1.5rem auto' }}>
              {description}
            </p>
          )}

          {/* Rating Summary or Diamond Sparkle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.25rem', backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E0D8' }}>
            {rating != null ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#AD8455' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#AD8455" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span style={{ fontWeight: 700, color: '#1A1A1A' }}>{rating.toFixed(1)}</span>
                </div>
                <span style={{ color: '#777', fontSize: '0.85rem' }}>({reviewsCount} avis {reviewsCount > 1 ? 'vérifiés' : 'vérifié'})</span>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#AD8455' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AD8455" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
                </svg>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Boutique Vérifiée · Sélection Certifiée
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Products Section */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #075D49', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'serif', color: '#075D49', margin: 0 }}>
              Produits & Sélection de la Boutique ({products ? products.length : 0})
            </h2>
          </div>

          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
            {products && products.length > 0 ? (
              products.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/p/${product.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div 
                    style={{ 
                      backgroundColor: '#FFF', 
                      borderRadius: '8px', 
                      overflow: 'hidden', 
                      border: '1px solid #E5E0D8',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    <div style={{ position: 'relative', height: '240px', backgroundColor: '#F0ECE1', overflow: 'hidden' }}>
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#AD8455' }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
                          </svg>
                          <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>Ojarket Prestige</span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#AD8455', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        {product.category || 'Création'}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1A1A1A', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                        {product.title}
                      </h3>
                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F5F3ED' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#075D49' }}>
                          {((product.priceMinor || 0) / 100).toLocaleString('fr-FR')} {product.currency || 'XOF'}
                        </span>
                        {product.rating != null ? (
                          <span style={{ fontSize: '0.8rem', color: '#AD8455', fontWeight: 600 }}>
                            ★ {product.rating.toFixed(1)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#AD8455', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Nouveau
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', backgroundColor: '#FFF', borderRadius: '8px', border: '1px dashed #D4B483' }}>
                <p style={{ color: '#666', margin: 0 }}>Cette boutique n'a pas encore d'articles publiques enregistrées.</p>
              </div>
            )}
          </div>
        </section>

        {/* Verified Reviews Section */}
        {reviews && reviews.length > 0 && (
          <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #E5E0D8' }}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'serif', color: '#075D49', marginBottom: '1.5rem' }}>
              Avis Clients Vérifiés ({reviews.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {reviews.map((rev: any) => (
                <div key={rev.id} style={{ backgroundColor: '#FFF', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E5E0D8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{rev.buyerName}</span>
                    <span style={{ color: '#AD8455', fontSize: '0.9rem' }}>
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </span>
                  </div>
                  {rev.title && <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: '#333' }}>{rev.title}</h4>}
                  {rev.comment && <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>{rev.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

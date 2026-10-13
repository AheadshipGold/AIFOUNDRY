import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import './shop.css';
import ShareButton from './ShareButton';
import { getShopBySlug } from '@/lib/server/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ShopPageProps {
  params: Promise<{ slug: string }>;
}

async function fetchShop(identifier: string) {
  try {
    return await getShopBySlug(identifier);
  } catch {
    return null;
  }
}

function formatCraftType(type?: string | null): string {
  if (!type) return "Atelier d'Artisan d'Élite";
  if (type === 'haute_facture') return "Maison d'Art & Haute Création";
  if (type === 'artisanat_luxe') return "Maison d'Artisanat de Luxe";
  if (type === 'joaillerie') return "Haute Joaillerie & Orfèvrerie";
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCategoryLabel(cat?: string | null): string {
  if (!cat) return "Création d'Art";
  const map: Record<string, string> = {
    leather: 'Maroquinerie de Luxe',
    maroquinerie: 'Maroquinerie de Luxe',
    jewelry: 'Haute Joaillerie & Orfèvrerie',
    wood: 'Ébénisterie & Mobilier d\'Art',
    textile: 'Textile d\'Art & Tissage',
    fashion: 'Mode & Haute Couture Africaine',
    mode_africaine: 'Haute Couture & Mode Africaine',
    shoes: 'Chaussures & Bottier d\'Artisan',
    chaussures: 'Chaussures & Bottier d\'Artisan',
    cosmetics: 'Cosmétique Bio & Bien-Être',
    cosmetique_bio: 'Cosmétique Bio & Bien-Être',
    art: 'Tableaux & Art Contemporain',
    tableaux_art: 'Tableaux & Art Contemporain',
    home: 'Décoration & Art de la Table',
    decoration: 'Décoration & Art de la Table',
    gourmet: 'Épicerie Fine & Terroir Bio',
    epicerie_fine: 'Épicerie Fine & Terroir Bio',
    accessories: 'Accessoires de Luxe & Horlogerie',
    accessoires_luxe: 'Accessoires de Luxe & Horlogerie',
    digital: 'Art Numérique & Patrons',
    digital_art: 'Art Numérique & Patrons',
  };
  return map[cat] || cat;
}

/**
 * Génération dynamique des balises OpenGraph et Twitter Cards pour WhatsApp, Facebook et X
 */
export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { slug } = await params;
  const shop = await fetchShop(slug);

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

  const firstProductImage = shop.products && shop.products.length > 0 ? (shop.products[0].images?.[0] || shop.products[0].image) : null;
  let bannerImage = shop.bannerUrl || firstProductImage || '/brand/cover_luxury_pattern.jpg';
  if (bannerImage.startsWith('/')) {
    bannerImage = `https://www.ojarket.com${bannerImage}`;
  }
  const canonicalUrl = `https://www.ojarket.com/shop/${shop.slug || slug}`;

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
          url: bannerImage,
          secureUrl: bannerImage,
          width: 800,
          height: 800,
          type: bannerImage.endsWith('.png') ? 'image/png' : bannerImage.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
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
  const shop = await fetchShop(slug);

  if (!shop) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F6F0', color: '#151E1C', padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(7,93,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#075D49' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'serif', marginBottom: '0.75rem', color: '#075D49', fontWeight: 700 }}>
          Boutique Introuvable
        </h1>
        <p style={{ color: '#5B6661', maxWidth: '440px', lineHeight: 1.6, marginBottom: '2rem', fontSize: '1rem' }}>
          La boutique ou le vendeur recherché n’existe pas, est en cours de modération ou a changé d’adresse de galerie.
        </p>
        <Link 
          href="/" 
          style={{ 
            padding: '0.85rem 2rem', 
            backgroundColor: '#075D49', 
            color: '#FFFFFF', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontSize: '0.95rem', 
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(7,93,73,0.25)',
            transition: 'all 0.2s ease',
          }}
        >
          Retour à la galerie principale
        </Link>
      </div>
    );
  }

  const { name, description, craftType, city, country, bannerUrl, rating, reviewsCount, products, reviews, storefrontTheme, phone } = shop;
  const currentTheme = storefrontTheme === 'dark' ? 'dark' : 'light';
  const displayLocation = `${city}${country ? `, ${country}` : ''}`;
  const initialLetter = name ? name.charAt(0).toUpperCase() : 'M';
  const formattedCraft = formatCraftType(craftType);
  const shareUrl = `https://www.ojarket.com/shop/${shop.slug || slug}`;

  // Nettoyage et formatage international du numéro pour WhatsApp direct (aucun numéro factice en dur)
  const cleanPhone = phone ? phone.replace(/[^\d]/g, '') : null;
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Bonjour ${name}, je découvre votre boutique sur Ojarket et souhaite échanger au sujet de vos créations.`)}`
    : null;

  return (
    <div className="luxury-storefront" data-theme={currentTheme}>
      {/* 1. Announcement Bar */}
      <div className="storefront-announcement-bar">
        <div className="announcement-content">
          <span>Maison d'Art Certifiée Ojarket</span>
          <span className="announcement-separator">&bull;</span>
          <span>Expédition Assurée Cotonou, Abidjan, Bamako, Dakar &amp; Monde</span>
          <span className="announcement-separator">&bull;</span>
          <span>Paiement Sécurisé avec Séquestre Anti-Fraude</span>
        </div>
      </div>

      {/* 2. Frosted Glass Master Storefront Navigation */}
      <header className="storefront-master-header">
        <div className="storefront-header-inner">
          <div className="storefront-header-brand">
            <Link href="/" className="storefront-ojarket-badge" aria-label="Accueil Ojarket">
              <img
                src={
                  currentTheme === 'dark'
                    ? '/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Dark_Transparent.png'
                    : '/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Transparent.png'
                }
                alt="Ojarket"
                className="storefront-ojarket-logo"
              />
            </Link>
            <span className="storefront-divider">|</span>
            <div className="storefront-artisan-identity">
              <span className="storefront-artisan-name">{name}</span>
              <span className="storefront-certified-seal">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#AD8455" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
                </svg>
                Certifié
              </span>
            </div>
          </div>

          <div className="storefront-header-actions">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="storefront-whatsapp-btn"
                title="Discuter directement avec l'artisan sur WhatsApp"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981zm10.741-7.258c-.078-.13-.288-.208-.606-.366s-1.874-.925-2.164-1.031c-.29-.105-.502-.158-.713.158-.212.316-.819 1.031-.1.004 1.242-.185.211-.37.237-.687.079s-1.344-.495-2.56-1.579c-.947-.844-1.587-1.888-1.772-2.205-.185-.317-.02-.489.139-.646.143-.142.317-.37.476-.554.159-.185.212-.317.318-.528.106-.211.053-.396-.026-.554s-.713-1.717-.978-2.355c-.258-.62-.52-.536-.713-.546l-.608-.01c-.211 0-.555.079-.846.396s-1.111 1.085-1.111 2.645 1.137 3.067 1.296 3.278c.159.211 2.238 3.418 5.422 4.793.757.327 1.348.522 1.808.669.76.241 1.452.207 1.999.125.61-.092 1.874-.766 2.138-1.506.264-.74.264-1.374.185-1.506z"/>
                </svg>
                <span>Conciergerie WhatsApp</span>
              </a>
            )}
            <a
              href={`ojarket://shop/${shop.slug || slug}`}
              className="storefront-app-btn"
            >
              <span>App Mobile</span>
            </a>
            <ShareButton shopName={name} shopUrl={shareUrl} />
          </div>
        </div>
      </header>

      {/* 3. Grand Atelier Hero */}
      <section className="storefront-hero">
        <div
          className="storefront-hero-bg"
          style={{
            backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'url(/brand/cover_luxury_pattern.jpg)',
          }}
        />
        <div className="storefront-hero-overlay" />
        <div className="storefront-hero-content">
          <div className="atelier-crest">
            <span className="crest-monogram">{initialLetter}</span>
          </div>
          <div className="atelier-pill-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4B483" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
            </svg>
            <span>{formattedCraft} &bull; Maison Officielle</span>
          </div>
          <h1 className="atelier-title">{name}</h1>
          <p className="atelier-location">
            {displayLocation}
          </p>
          {description && (
            <p style={{ maxWidth: '640px', fontSize: '14px', lineHeight: '1.6', color: 'rgba(248, 246, 240, 0.8)', margin: '0 auto 18px', textAlign: 'center' }}>
              {description}
            </p>
          )}

          <div className="atelier-trust-strip">
            <div className="trust-item">
              <span className="trust-bullet">&bull;</span>
              <span>Garantie d'Origine 100% Authentique</span>
            </div>
            <div className="trust-item">
              <span className="trust-bullet">&bull;</span>
              <span>Maître Artisan d'Élite</span>
            </div>
            <div className="trust-item">
              <span className="trust-bullet">&bull;</span>
              <span>Paiement sous Séquestre Ojarket</span>
            </div>
          </div>

          <div className="atelier-hero-ctas">
            <a href="#catalogue" className="btn-atelier-primary">
              Voir les Créations ({products ? products.length : 0})
            </a>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-atelier-secondary"
              >
                Contacter l'Atelier
              </a>
            ) : (
              <a
                href="#catalogue"
                className="btn-atelier-secondary"
              >
                Découvrir la Galerie
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 4. Catalog & Products Grid (Instant Shopify Plus Showcase - Direct Focus on Creations) */}
      <section id="catalogue" className="storefront-catalog-section">
        <div className="catalog-header-bar">
          <div>
            <h2 className="catalog-title">
              Créations &amp; Sélection Officielle
            </h2>
            <p className="catalog-sub">
              Pièces exclusives disponibles à la commande et expédiées sous garantie d'authenticité Ojarket.
            </p>
          </div>
          <div className="catalog-badge-verified">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AD8455" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Catalogue Officiel ({products ? products.length : 0} pièces)</span>
          </div>
        </div>


        <div className="products-grid">
          {products && products.length > 0 ? (
            products.map((product: any) => (
              <Link
                key={product.id}
                href={`/p/${product.id}`}
                className="boutique-product-card"
              >
                <div className="boutique-product-img-wrap">
                  <span className="card-status-badge">
                    {formatCategoryLabel(product.category)}
                  </span>
                  {product.image ? (
                    <>
                      <img 
                        src={product.image} 
                        alt="" 
                        aria-hidden="true" 
                        className="boutique-product-img-ambient" 
                      />
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="boutique-product-img"
                      />
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#D4B483', background: 'linear-gradient(135deg, #111C1A 0%, #06241D 100%)' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
                      </svg>
                      <span style={{ fontSize: '0.75rem', marginTop: '0.6rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                        Ojarket Prestige
                      </span>
                    </div>
                  )}
                </div>

                <div className="boutique-product-body">
                  <span className="boutique-product-category">
                    {product.originCity ? `${product.originCity} · ` : ''}{formatCategoryLabel(product.category)}
                  </span>
                  <h3 className="boutique-product-title">
                    {product.title}
                  </h3>
                  <div className="boutique-product-footer">
                    <span className="boutique-product-price">
                      {((product.priceMinor || 0) / 100).toLocaleString('fr-FR')} {product.currency || 'XOF'}
                    </span>
                    {product.rating != null ? (
                      <span className="boutique-diamond-seal">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4B483" stroke="none">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>{product.rating.toFixed(1)}</span>
                      </span>
                    ) : (
                      <span className="boutique-diamond-seal">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D4B483" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
                        </svg>
                        <span>NOUVEAU</span>
                      </span>
                    )}
                  </div>
                  <div className="card-order-btn">
                    <span>Explorer la création</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px dashed #D4B483' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 1rem', borderRadius: '50%', backgroundColor: 'rgba(212,180,131,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AD8455' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'serif', fontSize: '1.25rem', color: '#151E1C', marginBottom: '0.5rem' }}>
                Collection Privée en Préparation
              </h3>
              <p style={{ color: '#5B6661', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                Le maître d'atelier finalise l'inventaire de ses nouvelles pièces. Contactez la conciergerie pour une commande privée exclusive.
              </p>
              <a
                href={whatsappUrl || '#'}
                target={whatsappUrl ? "_blank" : undefined}
                rel={whatsappUrl ? "noopener noreferrer" : undefined}
                className="btn-atelier-primary"
                style={{ display: 'inline-block' }}
              >
                Demande Spéciale Conciergerie
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 6. Verified Reviews Section (if any verified reviews exist) */}
      {reviews && reviews.length > 0 && (
        <section className="storefront-reviews-section">
          <div className="reviews-card-container">
            <div className="reviews-header">
              <div>
                <h3 className="reviews-header-title">
                  Avis Clients Vérifiés ({reviews.length})
                </h3>
                <p className="reviews-header-subtitle">
                  Seuls les acheteurs ayant validé et réceptionné leur commande peuvent laisser un témoignage.
                </p>
              </div>
              {rating != null && (
                <div className="reviews-rating-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#D4B483" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="reviews-rating-value">{rating.toFixed(1)} / 5</span>
                </div>
              )}
            </div>

            <div className="reviews-grid">
              {reviews.map((rev: any) => (
                <div key={rev.id} className="review-card-item">
                  <div className="review-card-header">
                    <span className="review-author-name">{rev.buyerName}</span>
                    <div className="review-stars-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill={star <= (rev.rating || 5) ? '#D4B483' : 'none'}
                          stroke="#D4B483"
                          strokeWidth="1.5"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {rev.title && <h4 className="review-card-title">{rev.title}</h4>}
                  {rev.comment && <p className="review-card-text">{rev.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Trust Pillars (Shopify Standards) */}
      <section className="storefront-trust-section">
        <div className="trust-pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 className="pillar-title">Authenticité Certifiée</h3>
            <p className="pillar-desc">
              Chaque création est vérifiée et estampillée selon les standards de la haute facture ouest-africaine.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <h3 className="pillar-title">Expédition Sécurisée</h3>
            <p className="pillar-desc">
              Emballage soigné de prestige, livraison express et remise en main propre contre signature.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 className="pillar-title">Séquestre Anti-Fraude</h3>
            <p className="pillar-desc">
              Vos paiements sont conservés sous séquestre sécurisé et libérés au vendeur uniquement après votre validation.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <h3 className="pillar-title">Conciergerie Privée</h3>
            <p className="pillar-desc">
              Un conseiller d'art dédié vous accompagne pour vos commandes privées, sur-mesure et cadeaux d'affaires.
            </p>
          </div>
        </div>
      </section>

      {/* 8. WhatsApp Direct Banner */}
      {whatsappUrl && (
        <section className="storefront-whatsapp-banner">
          <div className="whatsapp-banner-inner">
            <div className="whatsapp-banner-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981zm10.741-7.258c-.078-.13-.288-.208-.606-.366s-1.874-.925-2.164-1.031c-.29-.105-.502-.158-.713.158-.212.316-.819 1.031-.1.004 1.242-.185.211-.37.237-.687.079s-1.344-.495-2.56-1.579c-.947-.844-1.587-1.888-1.772-2.205-.185-.317-.02-.489.139-.646.143-.142.317-.37.476-.554.159-.185.212-.317.318-.528.106-.211.053-.396-.026-.554s-.713-1.717-.978-2.355c-.258-.62-.52-.536-.713-.546l-.608-.01c-.211 0-.555.079-.846.396s-1.111 1.085-1.111 2.645 1.137 3.067 1.296 3.278c.159.211 2.238 3.418 5.422 4.793.757.327 1.348.522 1.808.669.76.241 1.452.207 1.999.125.61-.092 1.874-.766 2.138-1.506.264-.74.264-1.374.185-1.506z"/>
              </svg>
              <span>Service Conciergerie Dédié</span>
            </div>
            <h2 className="whatsapp-banner-title">
              Une création sur-mesure ou une question pour {name} ?
            </h2>
            <p className="whatsapp-banner-desc">
              Échangez directement avec le maître d'atelier et notre conciergerie Ojarket pour vos personnalisations, formats spécifiques et commandes institutionnelles.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-banner-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981zm10.741-7.258c-.078-.13-.288-.208-.606-.366s-1.874-.925-2.164-1.031c-.29-.105-.502-.158-.713.158-.212.316-.819 1.031-.1.004 1.242-.185.211-.37.237-.687.079s-1.344-.495-2.56-1.579c-.947-.844-1.587-1.888-1.772-2.205-.185-.317-.02-.489.139-.646.143-.142.317-.37.476-.554.159-.185.212-.317.318-.528.106-.211.053-.396-.026-.554s-.713-1.717-.978-2.355c-.258-.62-.52-.536-.713-.546l-.608-.01c-.211 0-.555.079-.846.396s-1.111 1.085-1.111 2.645 1.137 3.067 1.296 3.278c.159.211 2.238 3.418 5.422 4.793.757.327 1.348.522 1.808.669.76.241 1.452.207 1.999.125.61-.092 1.874-.766 2.138-1.506.264-.74.264-1.374.185-1.506z"/>
              </svg>
              <span>Échanger sur WhatsApp avec l'Atelier</span>
            </a>
          </div>
        </section>
      )}

      {/* 9. Storefront Footer */}
      <footer className="storefront-master-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-brand-header">
              <span className="footer-brand-title">{name}</span>
              <span className="footer-badge-artisan">Maison Partenaire Officielle</span>
            </div>
            <p className="footer-brand-desc">
              Boutique Officielle Certifiée &bull; Maison d&apos;Art &amp; Haute Facture Ouest-Africaine &bull; {shop.city || 'Cotonou'}{shop.country ? `, ${shop.country}` : ', Bénin'}
            </p>
          </div>
          <div className="footer-payments-block">
            <div className="footer-payments-label">Corridors de Paiement Agréés UEMOA :</div>
            <div className="footer-payments">
              <span className="payment-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                <span>MTN Mobile Money</span>
              </span>
              <span className="payment-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                <span>Moov Money Flooz</span>
              </span>
              <span className="payment-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                <span>Celtiis Cash</span>
              </span>
              <span className="payment-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                <span>Cartes Bancaires Visa &bull; Mastercard</span>
              </span>
              <span className="payment-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="21" x2="21" y2="21" /><line x1="3" y1="10" x2="21" y2="10" /><polyline points="5 6 12 3 19 6" /><line x1="4" y1="10" x2="4" y2="21" /><line x1="20" y1="10" x2="20" y2="21" /></svg>
                <span>Virement UEMOA</span>
              </span>
            </div>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} {name} &bull; Opéré sur Ojarket Merchant Commerce OS &bull; Protocole Deny-by-Default A06 &bull; Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

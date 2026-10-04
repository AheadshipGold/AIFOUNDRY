import React from 'react';
import './landing.css';
import ShareButton from './ShareButton';

export const revalidate = 60; // optionally revalidate every 60 seconds

async function getShopData(slug: string) {
  // In a real application, this might use an absolute URL from process.env, 
  // or use a service layer. We're assuming the endpoint GET /v1/shops/:slug exists.
  // Using a mock fetch or environment base URL. For demo purposes we can hit a relative
  // or a fallback domain, but Next.js Server Components require absolute URLs for fetch.
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
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

export default async function ShopPage({ params }: { params: { slug: string } }) {
  const shop = await getShopData(params.slug);

  if (!shop) {
    return (
      <div className="not-found">
        <p>Shop not found</p>
      </div>
    );
  }

  const { name, description, storefrontTheme, bannerUrl, products } = shop;

  // Assuming storefrontTheme might contain primaryColor, backgroundColor, textColor
  const customStyles = {
    '--shop-primary': storefrontTheme?.primaryColor || '#111111',
    '--shop-bg': storefrontTheme?.backgroundColor || '#ffffff',
    '--shop-text': storefrontTheme?.textColor || '#1a1a1a',
  } as React.CSSProperties;

  return (
    <div className="luxury-storefront" style={customStyles}>
      {bannerUrl && (
        <div 
          className="storefront-banner" 
          style={{ backgroundImage: `url(${bannerUrl})` }}
        >
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <h1 className="banner-title">{name}</h1>
          </div>
        </div>
      )}
      
      <main className="storefront-main">
        <header className="storefront-header">
          {!bannerUrl && <h1 className="banner-title" style={{ color: 'var(--shop-primary)' }}>{name}</h1>}
          <p className="storefront-description">{description}</p>
          <div className="storefront-actions">
             <ShareButton />
          </div>
        </header>

        <section className="storefront-products">
          <div className="products-grid">
            {products && products.length > 0 ? (
              products.map((product: any) => (
                <a href={`/product/${product.id}`} key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img 
                      src={product.imageUrl || 'https://placehold.co/600x800/f4f4f4/999999?text=Product'} 
                      alt={product.name} 
                      className="product-image" 
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </p>
                  </div>
                </a>
              ))
            ) : (
              <p className="no-products">This boutique currently has no products available.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

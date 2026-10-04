import React from 'react';
import Link from 'next/link';
import '../../landing.css';

interface ShopPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShopStorefrontPage({ params }: ShopPageProps) {
  const { slug } = await params;

  // In reality, we would fetch the shop's config from the backend
  // For now, we render the template using the new schema fields

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--oj-color-bg)', color: 'var(--oj-color-text)' }}>
      {/* Banner */}
      <div style={{ height: '300px', backgroundColor: 'var(--oj-color-subtle)', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: '-40px', left: '40px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--oj-color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#fff', border: '4px solid var(--oj-color-bg)' }}>
          {slug.substring(0, 2).toUpperCase()}
        </div>
      </div>

      <main style={{ maxWidth: '1200px', margin: '60px auto 40px', padding: '0 24px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--oj-font-editorial)', margin: '0 0 8px' }}>
          Boutique: {slug}
        </h1>
        <p style={{ color: 'var(--oj-color-muted)', marginBottom: '32px' }}>
          Artisan certifi� Ojarket. D�couvrez nos cr�ations.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Products will be rendered here dynamically */}
          <div style={{ padding: '24px', borderRadius: '16px', border: '1px dashed var(--oj-color-border)', textAlign: 'center', color: 'var(--oj-color-muted)' }}>
            Catalogue en cours de chargement...
          </div>
        </div>
      </main>
    </div>
  );
}

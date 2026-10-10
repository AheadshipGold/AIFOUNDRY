import React from 'react';

export function SellerShop({ isEn, products }: { isEn: boolean, products: any[] }) {
  return (
    <div className="oj-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '24px', fontFamily: 'var(--oj-font-editorial)', color: 'var(--oj-color-text-primary)', margin: 0 }}>
          {isEn ? "My Catalog" : "Mon Catalogue"}
        </h3>
        <button style={{ background: 'var(--oj-color-action)', color: 'var(--oj-color-on-action)', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          {isEn ? "Add Product" : "Ajouter un produit"}
        </button>
      </div>

      {products.length === 0 ? (
        <div style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--oj-color-surface)', border: '1px solid var(--oj-color-border)', borderRadius: '8px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--oj-color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '24px' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <h4 style={{ color: 'var(--oj-color-text-primary)', fontSize: '18px', marginBottom: '8px' }}>
            {isEn ? "Your catalog is empty" : "Votre catalogue est vide"}
          </h4>
          <p style={{ color: 'var(--oj-color-text-secondary)', margin: 0, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            {isEn ? "Start adding your luxury pieces to attract buyers on the platform." : "Commencez à ajouter vos pièces de luxe pour attirer les acheteurs sur la plateforme."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
           {/* Product list mapped here */}
        </div>
      )}
    </div>
  );
}
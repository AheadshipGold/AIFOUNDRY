import React from 'react';
import { OrderRecord, PurchaseRequestItem, FinOpsEntry } from '../../lib/api';

export function SellerOverview({ 
  isEn, 
  finopsKpis, 
  sellerOrders, 
  sellerRequests 
}: { 
  isEn: boolean, 
  finopsKpis: any, 
  sellerOrders: OrderRecord[], 
  sellerRequests: PurchaseRequestItem[] 
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price).replace('F CFA', 'XOF');
  };

  return (
    <div className="oj-fade-in">
      <div className="oj-kpi-grid">
        {[
          { label: isEn ? "Sales" : "Ventes", value: formatPrice(finopsKpis.vendu), trend: finopsKpis.vendu > 0 ? "+100%" : "0%", positive: finopsKpis.vendu > 0 },
          { label: isEn ? "Orders" : "Commandes", value: `${sellerOrders.length}`, trend: sellerOrders.length > 0 ? `+${sellerOrders.length}` : "0", positive: sellerOrders.length > 0 },
          { label: isEn ? "Requests" : "Demandes", value: `${sellerRequests.length}`, trend: sellerRequests.length > 0 ? `+${sellerRequests.length}` : "0", positive: sellerRequests.length > 0 },
          { label: isEn ? "Low Stock" : "Stock faible", value: "0", trend: isEn ? "Items" : "Articles", positive: true },
        ].map((kpi, i) => (
          <div key={i} className="oj-kpi-card" style={{ background: "var(--oj-color-surface)", border: "1px solid var(--oj-color-border)", borderRadius: "8px", padding: "24px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--oj-color-text-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span>{kpi.label}</span>
            </div>
            <strong style={{ fontSize: '32px', fontFamily: 'var(--oj-font-sans)', fontVariantNumeric: 'tabular-nums lining-nums', color: 'var(--oj-color-text-primary)' }}>{kpi.value}</strong>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '48px' }}>
        <h3 style={{ fontSize: '20px', fontFamily: 'var(--oj-font-editorial)', color: 'var(--oj-color-text-primary)', marginBottom: '24px' }}>
          {isEn ? "Priority Actions" : "Actions prioritaires"}
        </h3>
        
        {sellerOrders.length === 0 && sellerRequests.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'var(--oj-color-surface)', border: '1px solid var(--oj-color-border)', borderRadius: '8px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--oj-color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <p style={{ color: 'var(--oj-color-text-secondary)', margin: 0 }}>
              {isEn ? "You're all caught up. No urgent actions." : "Tout est à jour. Aucune action urgente."}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {/* List urgent items here */}
             <div style={{ padding: '24px', background: 'var(--oj-color-surface)', border: '1px solid var(--oj-color-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--oj-color-text-primary)', fontWeight: 500 }}>
                  {isEn ? `${sellerOrders.length} orders to prepare` : `${sellerOrders.length} commandes à préparer`}
                </span>
                <button style={{ background: 'var(--oj-color-action)', color: 'var(--oj-color-on-action)', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                  {isEn ? "View" : "Voir"}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
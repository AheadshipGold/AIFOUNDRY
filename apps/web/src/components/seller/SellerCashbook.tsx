import React from 'react';
import { FinOpsEntry } from '../../lib/api';

export function SellerCashbook({ isEn, finopsKpis, finopsEntries }: { isEn: boolean, finopsKpis: any, finopsEntries: FinOpsEntry[] }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price).replace('F CFA', 'XOF');
  };

  return (
    <div className="oj-fade-in">
      <h3 style={{ fontSize: '24px', fontFamily: 'var(--oj-font-editorial)', color: 'var(--oj-color-text-primary)', marginBottom: '24px' }}>
        {isEn ? "Cashbook & Treasury" : "Livre de Caisse & Trésorerie"}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--oj-color-surface)', border: '1px solid var(--oj-color-border)', borderRadius: '8px', padding: '24px', borderTop: '4px solid #C49A45' }}>
          <div style={{ color: 'var(--oj-color-text-secondary)', fontSize: '14px', textTransform: 'uppercase', marginBottom: '8px' }}>
            {isEn ? "Available to withdraw" : "Fonds disponibles"}
          </div>
          <div style={{ fontSize: '32px', fontFamily: 'var(--oj-font-sans)', fontVariantNumeric: 'tabular-nums lining-nums', color: 'var(--oj-color-text-primary)', fontWeight: 500 }}>
            {formatPrice(finopsKpis.encaisse)}
          </div>
          <button style={{ marginTop: '16px', background: '#C49A45', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
            {isEn ? "Request Payout" : "Demander un retrait"}
          </button>
        </div>
        
        <div style={{ background: 'var(--oj-color-surface)', border: '1px solid var(--oj-color-border)', borderRadius: '8px', padding: '24px' }}>
          <div style={{ color: 'var(--oj-color-text-secondary)', fontSize: '14px', textTransform: 'uppercase', marginBottom: '8px' }}>
            {isEn ? "Funds in Escrow (Pending delivery)" : "Fonds sous séquestre (En transit)"}
          </div>
          <div style={{ fontSize: '32px', fontFamily: 'var(--oj-font-sans)', fontVariantNumeric: 'tabular-nums lining-nums', color: 'var(--oj-color-text-primary)', fontWeight: 500 }}>
            {formatPrice(finopsKpis.restant)}
          </div>
          <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--oj-color-text-secondary)', margin: '16px 0 0 0' }}>
            {isEn ? "Automatically released upon buyer reception." : "Libérés automatiquement à la réception par l'acheteur."}
          </p>
        </div>
      </div>

      <h4 style={{ fontSize: '18px', color: 'var(--oj-color-text-primary)', marginBottom: '16px' }}>
        {isEn ? "Recent Transactions" : "Transactions récentes"}
      </h4>
      <div style={{ background: 'var(--oj-color-surface)', border: '1px solid var(--oj-color-border)', borderRadius: '8px', padding: '24px' }}>
        <p style={{ color: 'var(--oj-color-text-secondary)', margin: 0, textAlign: 'center' }}>
          {isEn ? "No recent transactions found in ledger." : "Aucune transaction récente dans le journal."}
        </p>
      </div>
    </div>
  );
}
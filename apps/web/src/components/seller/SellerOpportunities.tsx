import React from 'react';
import { PurchaseRequestItem } from '../../lib/api';

export function SellerOpportunities({ isEn, requests }: { isEn: boolean, requests: PurchaseRequestItem[] }) {
  return (
    <div className="oj-fade-in">
      <h3 style={{ fontSize: '24px', fontFamily: 'var(--oj-font-editorial)', color: 'var(--oj-color-text-primary)', marginBottom: '24px' }}>
        {isEn ? "Buyer Opportunities" : "Bourse aux opportunités"}
      </h3>
      
      {requests.length === 0 ? (
        <div style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--oj-color-surface)', border: '1px solid var(--oj-color-border)', borderRadius: '8px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--oj-color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '24px' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p style={{ color: 'var(--oj-color-text-secondary)', margin: 0 }}>
            {isEn ? "No buyer demands at the moment." : "Aucune demande d'acheteur pour le moment."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {requests.map(r => (
            <div key={r.id} style={{ padding: '24px', background: 'var(--oj-color-surface)', border: '1px solid var(--oj-color-border)', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--oj-color-text-primary)' }}>{r.title}</h4>
              <p style={{ margin: '0 0 16px 0', color: 'var(--oj-color-text-secondary)' }}>{r.description}</p>
              <button style={{ background: 'transparent', color: 'var(--oj-color-action)', border: '1px solid var(--oj-color-action)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                {isEn ? "Make an offer" : "Faire une proposition"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
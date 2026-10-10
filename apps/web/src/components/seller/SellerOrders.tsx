import React from 'react';
import { OrderRecord } from '../../lib/api';

export function SellerOrders({ isEn, orders }: { isEn: boolean, orders: OrderRecord[] }) {
  return (
    <div className="oj-fade-in">
      <h3 style={{ fontSize: '24px', fontFamily: 'var(--oj-font-editorial)', color: 'var(--oj-color-text-primary)', marginBottom: '24px' }}>
        {isEn ? "Orders" : "Commandes"}
      </h3>
      
      {orders.length === 0 ? (
        <div style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--oj-color-surface)', border: '1px solid var(--oj-color-border)', borderRadius: '8px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--oj-color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '24px' }}>
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p style={{ color: 'var(--oj-color-text-secondary)', margin: 0 }}>
            {isEn ? "No orders yet." : "Aucune commande pour le moment."}
          </p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--oj-color-border)', color: 'var(--oj-color-text-secondary)' }}>
              <th style={{ padding: '16px' }}>{isEn ? "Order ID" : "N° Commande"}</th>
              <th style={{ padding: '16px' }}>{isEn ? "Date" : "Date"}</th>
              <th style={{ padding: '16px' }}>{isEn ? "Status" : "Statut"}</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>{isEn ? "Total" : "Total"}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--oj-color-border)' }}>
                <td style={{ padding: '16px', color: 'var(--oj-color-text-primary)' }}>{o.id.split('-')[0]}</td>
                <td style={{ padding: '16px', color: 'var(--oj-color-text-secondary)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 8px', background: 'var(--oj-color-surface)', border: '1px solid var(--oj-color-border)', borderRadius: '4px', fontSize: '12px' }}>
                    {o.fulfillmentStatus}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>{o.totalAmountMinor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
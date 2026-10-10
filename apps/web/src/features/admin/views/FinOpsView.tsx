"use client";

import React from "react";
import { useAdmin } from "../context/AdminContext";

export function FinOpsView() {
  const { isEn } = useAdmin();

  const formatPrice = (val: number, cur = "XOF") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace("XOF", "FCFA");
  };

  const [recentEntries, setRecentEntries] = React.useState<any[]>([]);
  const [dayClosures, setDayClosures] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { AuthApi } = await import('../../../lib/api');
        const data = await AuthApi.executeFetch('/v1/admin/finops');
        setRecentEntries(data.recentEntries || []);
        setDayClosures(data.dayClosures || []);
      } catch (err) {
        console.error('Failed to load finops data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="oj-admin-header-row">
        <div className="oj-admin-title-wrap">
          <h1>{isEn ? "Merchant FinOps & Cashbook Ledger (S44)" : "Livre de Caisse & Rapprochement FinOps"}</h1>
          <p>
            {isEn
              ? "Triad monitoring: Total Gross Sold != Amount Collected != Remaining Receivable. Append-only events."
              : "Surveillance de la triade : Vendu â‰  EncaissÃ© â‰  Restant. Grand livre immuable non-custodial."}
          </p>
        </div>
      </div>

      {/* Triade summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="oj-kpi-card" style={{ borderLeft: "4px solid var(--oj-color-action)" }}>
          <div className="oj-kpi-header"><span>Chiffre d'Affaires EngagÃ© (Vendu)</span></div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>{recentEntries.reduce((sum, e) => sum + (e.amountMinor || 0), 0).toLocaleString()} FCFA</strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>Total des commandes fermes</small>
        </div>
        <div className="oj-kpi-card" style={{ borderLeft: "4px solid #185F46" }}>
          <div className="oj-kpi-header"><span>LiquiditÃ©s EncaissÃ©es (Direct MoMo/Comptoir)</span></div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums", color: "#185F46" }}>{recentEntries.filter(e => e.type === "CREDIT").reduce((sum, e) => sum + (e.amountMinor || 0), 0).toLocaleString()} FCFA</strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>RelevÃ©s de caisse confirmÃ©s</small>
        </div>
        <div className="oj-kpi-card" style={{ borderLeft: "4px solid #AD8455" }}>
          <div className="oj-kpi-header"><span>{isEn ? "Pending Client Receivables" : "CrÃ©ances Clients en Attente"}</span></div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums", color: "#AD8455" }}>{recentEntries.filter(e => e.type === "DEBIT").reduce((sum, e) => sum + (e.amountMinor || 0), 0).toLocaleString()} FCFA</strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>Soldes Ã  percevoir Ã  livraison</small>
        </div>
      </div>

      {/* Recent FinOps flows */}
      <div className="oj-admin-table-card">
        <table className="oj-admin-table">
          <thead>
            <tr>
              <th>{isEn ? "Label & Reference" : "LibellÃ© & RÃ©fÃ©rence"}</th>
              <th>{isEn ? "Payment Channel" : "Canal de Paiement"}</th>
              <th>{isEn ? "Time" : "Heure"}</th>
              <th>{isEn ? "Audit Status" : "Statut Audit"}</th>
              <th style={{ textAlign: "right" }}>Montant EncaissÃ©</th>
            </tr>
          </thead>
          <tbody>
            {recentEntries.map((row, i) => (
              <tr key={i}>
                <td>
                  <div style={{ fontWeight: 600 }}>{row.type === 'ENCAISSEMENT' ? 'Encaissement' : row.type === 'DECAISSEMENT' ? 'DÃ©caissement' : 'Vente Ã  crÃ©dit'}</div>
                  <small style={{ color: "var(--oj-color-muted)" }}>{row.reference}</small>
                </td>
                <td>{row.channel}</td>
                <td style={{ color: "var(--oj-color-muted)" }}>{new Date(row.entryDate).toLocaleTimeString()}</td>
                <td><span className="oj-status-pill success">{isEn ? "Confirmed" : "ConfirmÃ©"}</span></td>
                <td style={{ textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {formatPrice(row.amountMinor / 100, row.currency)}
                </td>
              </tr>
            ))}
            {recentEntries.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--oj-color-muted)", padding: "20px" }}>
                  Aucune entrÃ©e rÃ©cente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

